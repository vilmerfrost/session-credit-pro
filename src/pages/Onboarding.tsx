import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { onboardingSchema, OnboardingFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (AZ)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CAD", label: "CAD ($)" },
  { value: "AUD", label: "AUD ($)" },
];

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { createProfile, profile, updateProfile } = useTrainerProfile();
  const navigate = useNavigate();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      business_name: "",
      timezone: "America/New_York",
      currency: "USD",
    },
  });

  const handleSubmit = async (data: OnboardingFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      let trainerId: string;
      
      if (profile) {
        // Update existing profile
        const result = await updateProfile.mutateAsync({
          ...data,
          onboarding_completed: true,
        });
        trainerId = result.id;
      } else {
        // Create new profile
        const result = await createProfile.mutateAsync({
          ...data,
          onboarding_completed: true,
        });
        trainerId = result.id;
      }

      // Create seed data for first-time experience
      await createSeedData(trainerId, data.currency);

      toast.success("Welcome to SessionPay! Your account is ready.");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const createSeedData = async (trainerId: string, currency: string) => {
    // Create sample products
    const products = [
      { name: "5 Session Pack", type: "package", price_cents: 20000, credits_amount: 5, expiry_days: 60 },
      { name: "10 Session Pack", type: "package", price_cents: 35000, credits_amount: 10, expiry_days: 90 },
      { name: "Monthly Unlimited", type: "membership", price_cents: 29900, credits_amount: 12, expiry_days: null },
    ];

    for (const product of products) {
      await supabase.from("products").insert({
        trainer_id: trainerId,
        ...product,
        currency,
      });
    }

    // Create a demo client
    const { data: client } = await supabase.from("clients").insert({
      trainer_id: trainerId,
      full_name: "Jane Smith (Demo)",
      email: "jane.demo@example.com",
      phone: "+1 555-0123",
      notes: "This is a demo client to help you explore SessionPay. Feel free to delete or modify.",
      status: "active",
    }).select().single();

    if (client) {
      // Give demo client some credits
      await supabase.from("credit_ledger").insert({
        trainer_id: trainerId,
        client_id: client.id,
        source: "adjustment",
        delta_credits: 5,
        note: "Welcome bonus credits",
      });

      // Create a portal token for demo client
      await supabase.from("client_portal_tokens").insert({
        trainer_id: trainerId,
        client_id: client.id,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Set up your business</CardTitle>
          <CardDescription>
            Just a few details to get you started with SessionPay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                placeholder="Your Fitness Training"
                {...form.register("business_name")}
              />
              {form.formState.errors.business_name && (
                <p className="text-sm text-destructive">{form.formState.errors.business_name.message}</p>
              )}
              <p className="text-xs text-muted-foreground">This will appear on invoices and your client portal</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={form.watch("timezone")}
                onValueChange={(value) => form.setValue("timezone", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.timezone && (
                <p className="text-sm text-destructive">{form.formState.errors.timezone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={form.watch("currency")}
                onValueChange={(value: "USD" | "EUR" | "GBP" | "CAD" | "AUD") => form.setValue("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Started
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
