import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface TrainerProfile {
  id: string;
  user_id: string;
  business_name: string;
  timezone: string;
  currency: string;
  logo_url: string | null;
  onboarding_completed: boolean;
  reminder_payment_due: boolean;
  reminder_low_credits: boolean;
  reminder_renewal: boolean;
  created_at: string;
  updated_at: string;
}

export function useTrainerProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["trainer-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("trainer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as TrainerProfile | null;
    },
    enabled: !!user,
  });

  const createProfile = useMutation({
    mutationFn: async (profile: Partial<TrainerProfile>) => {
      if (!user) throw new Error("No user");
      
      const { data, error } = await supabase
        .from("trainer_profiles")
        .insert({
          user_id: user.id,
          ...profile,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TrainerProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-profile"] });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<TrainerProfile>) => {
      if (!user) throw new Error("No user");
      
      const { data, error } = await supabase
        .from("trainer_profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as TrainerProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-profile"] });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    createProfile,
    updateProfile,
  };
}
