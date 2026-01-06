import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTrainerProfile } from "./useTrainerProfile";

export interface Purchase {
  id: string;
  trainer_id: string;
  client_id: string;
  product_id: string;
  status: "pending" | "paid" | "failed" | "refunded";
  amount_cents: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  stripe_subscription_id: string | null;
  stripe_checkout_session_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  client?: { full_name: string };
  product?: { name: string; credits_amount: number };
}

export interface CreatePurchaseInput {
  client_id: string;
  product_id: string;
  amount_cents: number;
  status?: "pending" | "paid" | "failed" | "refunded";
  stripe_checkout_session_id?: string;
}

export function usePurchases() {
  const { profile } = useTrainerProfile();
  const queryClient = useQueryClient();

  const purchasesQuery = useQuery({
    queryKey: ["purchases", profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data, error } = await supabase
        .from("purchases")
        .select("*, clients(full_name), products(name, credits_amount)")
        .eq("trainer_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((p) => ({
        ...p,
        client: p.clients,
        product: p.products,
      })) as Purchase[];
    },
    enabled: !!profile,
  });

  const createPurchase = useMutation({
    mutationFn: async (input: CreatePurchaseInput) => {
      if (!profile) throw new Error("No profile");

      const { data, error } = await supabase
        .from("purchases")
        .insert({
          trainer_id: profile.id,
          client_id: input.client_id,
          product_id: input.product_id,
          amount_cents: input.amount_cents,
          currency: profile.currency,
          status: input.status || "pending",
          stripe_checkout_session_id: input.stripe_checkout_session_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });

  const markPurchasePaid = useMutation({
    mutationFn: async ({ purchaseId, creditsAmount }: { purchaseId: string; creditsAmount: number }) => {
      // Get the purchase details
      const { data: purchase, error: fetchError } = await supabase
        .from("purchases")
        .select("*")
        .eq("id", purchaseId)
        .single();

      if (fetchError) throw fetchError;

      // Update to paid
      const { error: updateError } = await supabase
        .from("purchases")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", purchaseId);

      if (updateError) throw updateError;

      // Add credits to ledger
      await supabase.from("credit_ledger").insert({
        trainer_id: purchase.trainer_id,
        client_id: purchase.client_id,
        source: "purchase",
        delta_credits: creditsAmount,
        purchase_id: purchaseId,
        note: `Purchase of ${creditsAmount} credits`,
      });

      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  return {
    purchases: purchasesQuery.data || [],
    isLoading: purchasesQuery.isLoading,
    error: purchasesQuery.error,
    createPurchase,
    markPurchasePaid,
  };
}
