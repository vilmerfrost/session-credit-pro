import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTrainerProfile } from "./useTrainerProfile";

export interface Product {
  id: string;
  trainer_id: string;
  type: "package" | "membership";
  name: string;
  price_cents: number;
  currency: string;
  credits_amount: number;
  expiry_days: number | null;
  active: boolean;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  type: "package" | "membership";
  name: string;
  price_cents: number;
  credits_amount: number;
  expiry_days?: number | null;
  active?: boolean;
}

export function useProducts() {
  const { profile } = useTrainerProfile();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products", profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("trainer_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!profile,
  });

  const createProduct = useMutation({
    mutationFn: async (input: CreateProductInput) => {
      if (!profile) throw new Error("No profile");

      const { data, error } = await supabase
        .from("products")
        .insert({
          trainer_id: profile.id,
          type: input.type,
          name: input.name,
          price_cents: input.price_cents,
          currency: profile.currency,
          credits_amount: input.credits_amount,
          expiry_days: input.expiry_days || null,
          active: input.active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CreateProductInput>) => {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
