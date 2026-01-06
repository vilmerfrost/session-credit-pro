import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTrainerProfile } from "./useTrainerProfile";

export interface Client {
  id: string;
  trainer_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: "active" | "inactive";
  notes: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
  credit_balance?: number;
}

export interface CreateClientInput {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  status?: "active" | "inactive";
  notes?: string | null;
}

export function useClients() {
  const { profile } = useTrainerProfile();
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ["clients", profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data: clients, error } = await supabase
        .from("clients")
        .select("*")
        .eq("trainer_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get credit balances for all clients
      const { data: ledger } = await supabase
        .from("credit_ledger")
        .select("client_id, delta_credits")
        .eq("trainer_id", profile.id);

      const balances: Record<string, number> = {};
      ledger?.forEach((entry) => {
        balances[entry.client_id] = (balances[entry.client_id] || 0) + entry.delta_credits;
      });

      return (clients as Client[]).map((client) => ({
        ...client,
        credit_balance: balances[client.id] || 0,
      }));
    },
    enabled: !!profile,
  });

  const createClient = useMutation({
    mutationFn: async (input: CreateClientInput) => {
      if (!profile) throw new Error("No profile");

      const { data, error } = await supabase
        .from("clients")
        .insert({
          trainer_id: profile.id,
          full_name: input.full_name,
          email: input.email || null,
          phone: input.phone || null,
          status: input.status || "active",
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Create portal token for the client
      await supabase.from("client_portal_tokens").insert({
        trainer_id: profile.id,
        client_id: data.id,
      });

      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CreateClientInput>) => {
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    error: clientsQuery.error,
    createClient,
    updateClient,
    deleteClient,
  };
}

export function useClient(clientId: string | undefined) {
  const { profile } = useTrainerProfile();

  return useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      if (!clientId || !profile) return null;

      const { data: client, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error) throw error;

      // Get credit balance
      const { data: ledger } = await supabase
        .from("credit_ledger")
        .select("delta_credits")
        .eq("client_id", clientId);

      const balance = ledger?.reduce((sum, e) => sum + e.delta_credits, 0) || 0;

      // Get purchases
      const { data: purchases } = await supabase
        .from("purchases")
        .select("*, products(name)")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      // Get sessions
      const { data: sessions } = await supabase
        .from("sessions")
        .select("*")
        .eq("client_id", clientId)
        .order("occurred_at", { ascending: false });

      // Get portal token
      const { data: token } = await supabase
        .from("client_portal_tokens")
        .select("token")
        .eq("client_id", clientId)
        .single();

      return {
        ...client,
        credit_balance: balance,
        purchases: purchases || [],
        sessions: sessions || [],
        portal_token: token?.token,
      };
    },
    enabled: !!clientId && !!profile,
  });
}
