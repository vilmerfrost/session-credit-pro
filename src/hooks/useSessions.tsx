import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTrainerProfile } from "./useTrainerProfile";

export interface Session {
  id: string;
  trainer_id: string;
  client_id: string;
  occurred_at: string;
  duration_minutes: number;
  credits_used: number;
  notes: string | null;
  created_at: string;
  client?: { full_name: string };
}

export interface CreateSessionInput {
  client_id: string;
  occurred_at: string;
  duration_minutes: number;
  credits_used: number;
  notes?: string | null;
}

export function useSessions() {
  const { profile } = useTrainerProfile();
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: ["sessions", profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data, error } = await supabase
        .from("sessions")
        .select("*, clients(full_name)")
        .eq("trainer_id", profile.id)
        .order("occurred_at", { ascending: false });

      if (error) throw error;
      return data.map((s) => ({
        ...s,
        client: s.clients,
      })) as Session[];
    },
    enabled: !!profile,
  });

  const createSession = useMutation({
    mutationFn: async (input: CreateSessionInput) => {
      if (!profile) throw new Error("No profile");

      // First check client's credit balance
      const { data: ledger } = await supabase
        .from("credit_ledger")
        .select("delta_credits")
        .eq("client_id", input.client_id);

      const balance = ledger?.reduce((sum, e) => sum + e.delta_credits, 0) || 0;

      if (balance < input.credits_used) {
        throw new Error(`Insufficient credits. Client has ${balance} credits but needs ${input.credits_used}.`);
      }

      // Create the session
      const { data: newSession, error } = await supabase
        .from("sessions")
        .insert({
          trainer_id: profile.id,
          client_id: input.client_id,
          occurred_at: input.occurred_at,
          duration_minutes: input.duration_minutes,
          credits_used: input.credits_used,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct credits from ledger
      await supabase.from("credit_ledger").insert({
        trainer_id: profile.id,
        client_id: input.client_id,
        source: "session",
        delta_credits: -input.credits_used,
        session_id: newSession.id,
        note: `Session on ${new Date(input.occurred_at).toLocaleDateString()}`,
      });

      return newSession as Session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (session: Session) => {
      // Delete the session
      const { error } = await supabase.from("sessions").delete().eq("id", session.id);
      if (error) throw error;

      // Refund the credits
      await supabase.from("credit_ledger").insert({
        trainer_id: session.trainer_id,
        client_id: session.client_id,
        source: "adjustment",
        delta_credits: session.credits_used,
        note: `Refund for deleted session`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client"] });
    },
  });

  return {
    sessions: sessionsQuery.data || [],
    isLoading: sessionsQuery.isLoading,
    error: sessionsQuery.error,
    createSession,
    deleteSession,
  };
}
