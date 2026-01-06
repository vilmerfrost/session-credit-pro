
-- ============================================================================
-- SessionPay v2 - Complete Migration
-- ============================================================================

-- 1. SUBSCRIPTION SYSTEM
-- Create subscription_status enum
DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'past_due', 'canceled', 'incomplete');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add subscription fields to trainer_profiles
ALTER TABLE public.trainer_profiles
ADD COLUMN IF NOT EXISTS subscription_status public.subscription_status NOT NULL DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'pro',
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status public.subscription_status NOT NULL DEFAULT 'active',
  plan_tier TEXT NOT NULL DEFAULT 'pro',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create billing_history table
CREATE TABLE IF NOT EXISTS public.billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SEK',
  status TEXT NOT NULL,
  invoice_pdf_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_trainer_id ON public.subscriptions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_trainer_id ON public.billing_history(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_profiles_subscription_status ON public.trainer_profiles(subscription_status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers can view own subscription" ON public.subscriptions;
CREATE POLICY "Trainers can view own subscription" ON public.subscriptions FOR SELECT
  USING (trainer_id IN (SELECT id FROM public.trainer_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Trainers can view own billing history" ON public.billing_history;
CREATE POLICY "Trainers can view own billing history" ON public.billing_history FOR SELECT
  USING (trainer_id IN (SELECT id FROM public.trainer_profiles WHERE user_id = auth.uid()));

-- 2. CLIENT AUTHENTICATION SYSTEM
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('trainer', 'client');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email, trainer_id)
);

CREATE TABLE IF NOT EXISTS public.client_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id UUID NOT NULL REFERENCES public.client_users(id) ON DELETE CASCADE,
  can_book_sessions BOOLEAN NOT NULL DEFAULT TRUE,
  can_view_workout_plans BOOLEAN NOT NULL DEFAULT TRUE,
  can_message_trainer BOOLEAN NOT NULL DEFAULT TRUE,
  can_view_progress BOOLEAN NOT NULL DEFAULT TRUE,
  can_purchase_packages BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_user_id)
);

CREATE TABLE IF NOT EXISTS public.client_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_users_user_id ON public.client_users(user_id);
CREATE INDEX IF NOT EXISTS idx_client_users_trainer_id ON public.client_users(trainer_id);
CREATE INDEX IF NOT EXISTS idx_client_invitations_token ON public.client_invitations(invitation_token);

ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view own profile" ON public.client_users;
CREATE POLICY "Clients can view own profile" ON public.client_users FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Trainers can view their clients" ON public.client_users;
CREATE POLICY "Trainers can view their clients" ON public.client_users FOR SELECT
  USING (trainer_id IN (SELECT id FROM public.trainer_profiles WHERE user_id = auth.uid()));

-- 3. BOOKING SYSTEM
DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM ('scheduled', 'confirmed', 'completed', 'canceled', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.trainer_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trainer_id, day_of_week, start_time)
);

CREATE TABLE IF NOT EXISTS public.booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  max_bookings INTEGER NOT NULL DEFAULT 1,
  current_bookings INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time),
  CHECK (current_bookings <= max_bookings)
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  booking_slot_id UUID REFERENCES public.booking_slots(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_user_id UUID REFERENCES public.client_users(id) ON DELETE SET NULL,
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  status public.booking_status NOT NULL DEFAULT 'scheduled',
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  notes TEXT,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS booking_status public.booking_status DEFAULT 'completed';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_booking_slots_trainer_id ON public.booking_slots(trainer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);

ALTER TABLE public.trainer_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 4. MESSAGING SYSTEM
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('trainer', 'client')),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('trainer', 'client')),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages they sent" ON public.messages;
CREATE POLICY "Users can view messages they sent" ON public.messages FOR SELECT
  USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can view messages sent to them" ON public.messages;
CREATE POLICY "Users can view messages sent to them" ON public.messages FOR SELECT
  USING (recipient_id = auth.uid());

-- 5. PROGRESS TRACKING
CREATE TABLE IF NOT EXISTS public.client_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_user_id UUID REFERENCES public.client_users(id) ON DELETE SET NULL,
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  weight_kg DECIMAL(5, 2),
  body_fat_percentage DECIMAL(4, 2),
  muscle_mass_kg DECIMAL(5, 2),
  chest_cm DECIMAL(5, 2),
  waist_cm DECIMAL(5, 2),
  hips_cm DECIMAL(5, 2),
  arms_cm DECIMAL(5, 2),
  thighs_cm DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_user_id UUID REFERENCES public.client_users(id) ON DELETE SET NULL,
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('front', 'side', 'back', 'other')),
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_user_id UUID REFERENCES public.client_users(id) ON DELETE SET NULL,
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('max_weight', 'max_reps', 'max_time', 'max_distance')),
  value DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.client_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- 6. WORKOUT SYSTEM
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  name_sv TEXT NOT NULL,
  name_en TEXT,
  description_sv TEXT,
  description_en TEXT,
  category TEXT NOT NULL CHECK (category IN ('strength', 'cardio', 'flexibility', 'balance', 'other')),
  equipment TEXT[],
  video_url TEXT,
  image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  duration_weeks INTEGER,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_template BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_day_id UUID NOT NULL REFERENCES public.workout_plan_days(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  sets INTEGER,
  reps TEXT,
  duration_seconds INTEGER,
  rest_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plan_exercises ENABLE ROW LEVEL SECURITY;

-- Seed default exercises
INSERT INTO public.exercises (name_sv, name_en, description_sv, category, is_public) VALUES
('Bänkpress', 'Bench Press', 'Klassisk bröstövning', 'strength', TRUE),
('Knäböj', 'Squat', 'Grundläggande benövning', 'strength', TRUE),
('Marklyft', 'Deadlift', 'Helkroppsövning för styrka', 'strength', TRUE),
('Löpning', 'Running', 'Konditionsträning', 'cardio', TRUE),
('Planka', 'Plank', 'Kärnstyrka', 'strength', TRUE)
ON CONFLICT DO NOTHING;

-- 7. AI INSIGHTS
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  insights JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_client_id ON public.ai_insights(client_id);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers can view insights for their clients" ON public.ai_insights;
CREATE POLICY "Trainers can view insights for their clients" ON public.ai_insights FOR SELECT
  USING (trainer_id IN (SELECT id FROM public.trainer_profiles WHERE user_id = auth.uid()));

-- 8. PUSH NOTIFICATIONS
ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS fcm_token TEXT;
ALTER TABLE public.client_users ADD COLUMN IF NOT EXISTS fcm_token TEXT;

CREATE INDEX IF NOT EXISTS idx_trainer_profiles_fcm_token ON public.trainer_profiles(fcm_token) WHERE fcm_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_client_users_fcm_token ON public.client_users(fcm_token) WHERE fcm_token IS NOT NULL;

-- 9. ORGANIZATIONS (MULTI-TRAINER)
DO $$ BEGIN
  CREATE TYPE public.organization_role AS ENUM ('owner', 'admin', 'trainer', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  role public.organization_role NOT NULL DEFAULT 'trainer',
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, trainer_id)
);

CREATE TABLE IF NOT EXISTS public.organization_revenue_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  split_percentage DECIMAL(5, 2) NOT NULL CHECK (split_percentage >= 0 AND split_percentage <= 100),
  month DATE NOT NULL,
  total_revenue_cents INTEGER NOT NULL DEFAULT 0,
  trainer_share_cents INTEGER NOT NULL DEFAULT 0,
  organization_share_cents INTEGER NOT NULL DEFAULT 0,
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, trainer_id, month)
);

ALTER TABLE public.trainer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_revenue_splits ENABLE ROW LEVEL SECURITY;

-- 10. SWISH PAYMENTS
DO $$ BEGIN
  CREATE TYPE public.swish_payment_status AS ENUM ('pending', 'paid', 'declined', 'error', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.swish_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_reference TEXT NOT NULL UNIQUE,
  trainer_id UUID REFERENCES public.trainer_profiles(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SEK',
  phone_number TEXT,
  status public.swish_payment_status NOT NULL DEFAULT 'pending',
  swish_response JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_swish_payments_payment_reference ON public.swish_payments(payment_reference);

ALTER TABLE public.swish_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainers can view own Swish payments" ON public.swish_payments;
CREATE POLICY "Trainers can view own Swish payments" ON public.swish_payments FOR SELECT
  USING (trainer_id IN (SELECT id FROM public.trainer_profiles WHERE user_id = auth.uid()));

-- Table comments
COMMENT ON TABLE public.subscriptions IS 'SessionPay v2: Subscription management';
COMMENT ON TABLE public.client_users IS 'SessionPay v2: Client authentication';
COMMENT ON TABLE public.bookings IS 'SessionPay v2: Session booking system';
COMMENT ON TABLE public.messages IS 'SessionPay v2: Real-time messaging';
COMMENT ON TABLE public.client_measurements IS 'SessionPay v2: Progress tracking';
COMMENT ON TABLE public.workout_plans IS 'SessionPay v2: Workout management';
COMMENT ON TABLE public.ai_insights IS 'SessionPay v2: AI-powered insights';
COMMENT ON TABLE public.organizations IS 'SessionPay v2: Multi-trainer support';
COMMENT ON TABLE public.swish_payments IS 'SessionPay v2: Swedish payments';
