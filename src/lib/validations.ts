import { z } from "zod";

// Auth validations
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(255, "Email must be less than 255 characters");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be less than 72 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Client validations
export const clientSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
});

// Product validations
export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  type: z.enum(["package", "membership"]),
  price_cents: z.number().int().min(0, "Price must be positive"),
  credits_amount: z.number().int().min(1, "Credits must be at least 1"),
  expiry_days: z.number().int().min(1).optional().nullable(),
  active: z.boolean().default(true),
});

// Session validations
export const sessionSchema = z.object({
  client_id: z.string().uuid("Please select a client"),
  occurred_at: z.string().min(1, "Date is required"),
  duration_minutes: z.number().int().min(1, "Duration must be at least 1 minute").max(480, "Duration must be less than 8 hours"),
  credits_used: z.number().int().min(1, "Must use at least 1 credit"),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional().or(z.literal("")),
});

// Onboarding validations
export const onboardingSchema = z.object({
  business_name: z.string().trim().min(1, "Business name is required").max(100, "Must be less than 100 characters"),
  timezone: z.string().min(1, "Please select a timezone"),
  currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD"]),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type SessionFormData = z.infer<typeof sessionSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
