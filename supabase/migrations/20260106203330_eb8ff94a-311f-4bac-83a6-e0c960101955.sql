-- Create app_role enum for future extensibility
CREATE TYPE public.app_role AS ENUM ('trainer');

-- Trainer profiles table
CREATE TABLE public.trainer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL DEFAULT '',
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  currency TEXT NOT NULL DEFAULT 'USD',
  logo_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_payment_due BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_low_credits BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_renewal BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products table (packages and memberships)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('package', 'membership')),
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  credits_amount INTEGER NOT NULL,
  expiry_days INTEGER,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchases table
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  stripe_checkout_session_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Credit ledger (immutable transaction log)
CREATE TABLE public.credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('purchase', 'session', 'adjustment', 'membership_grant')),
  delta_credits INTEGER NOT NULL,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
  session_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  credits_used INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key from credit_ledger to sessions (after sessions table exists)
ALTER TABLE public.credit_ledger 
  ADD CONSTRAINT credit_ledger_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE SET NULL;

-- Reminder events table
CREATE TABLE public.reminder_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payment_due', 'low_credits', 'renewal')),
  channel TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  payload_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Client portal tokens (never expire per user preference)
CREATE TABLE public.client_portal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User roles table (for security - roles separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to get trainer_id for current user
CREATE OR REPLACE FUNCTION public.get_trainer_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.trainer_profiles WHERE user_id = auth.uid()
$$;

-- RLS Policies for trainer_profiles
CREATE POLICY "Users can view own profile"
  ON public.trainer_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.trainer_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.trainer_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for clients
CREATE POLICY "Trainers can view own clients"
  ON public.clients FOR SELECT
  USING (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can insert own clients"
  ON public.clients FOR INSERT
  WITH CHECK (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can update own clients"
  ON public.clients FOR UPDATE
  USING (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can delete own clients"
  ON public.clients FOR DELETE
  USING (trainer_id = public.get_trainer_id());

-- RLS Policies for products
CREATE POLICY "Trainers can view own products"
  ON public.products FOR SELECT
  USING (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can update own products"
  ON public.products FOR UPDATE
  USING (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can delete own products"
  ON public.products FOR DELETE
  USING (trainer_id = public.get_trainer_id());

-- RLS Policies for purchases
CREATE POLICY "Trainers can view own purchases"
  ON public.purchases FOR SELECT
  USING (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can insert own purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can update own purchases"
  ON public.purchases FOR UPDATE
  USING (trainer_id = public.get_trainer_id());

-- RLS Policies for credit_ledger
CREATE POLICY "Trainers can view own ledger"
  ON public.credit_ledger FOR SELECT
  USING (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can insert own ledger"
  ON public.credit_ledger FOR INSERT
  WITH CHECK (trainer_id = public.get_trainer_id());

-- RLS Policies for sessions
CREATE POLICY "Trainers can view own sessions"
  ON public.sessions FOR SELECT
  USING (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can insert own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can update own sessions"
  ON public.sessions FOR UPDATE
  USING (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can delete own sessions"
  ON public.sessions FOR DELETE
  USING (trainer_id = public.get_trainer_id());

-- RLS Policies for reminder_events
CREATE POLICY "Trainers can view own reminders"
  ON public.reminder_events FOR SELECT
  USING (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can insert own reminders"
  ON public.reminder_events FOR INSERT
  WITH CHECK (trainer_id = public.get_trainer_id());

-- RLS Policies for client_portal_tokens
CREATE POLICY "Trainers can view own tokens"
  ON public.client_portal_tokens FOR SELECT
  USING (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can insert own tokens"
  ON public.client_portal_tokens FOR INSERT
  WITH CHECK (trainer_id = public.get_trainer_id());

CREATE POLICY "Trainers can delete own tokens"
  ON public.client_portal_tokens FOR DELETE
  USING (trainer_id = public.get_trainer_id());

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- Public access policies for client portal (read-only via token)
CREATE POLICY "Public can view clients via portal token"
  ON public.clients FOR SELECT
  USING (
    id IN (SELECT client_id FROM public.client_portal_tokens WHERE token = current_setting('request.headers', true)::json->>'x-portal-token')
  );

CREATE POLICY "Public can view trainer via portal token"
  ON public.trainer_profiles FOR SELECT
  USING (
    id IN (SELECT trainer_id FROM public.client_portal_tokens WHERE token = current_setting('request.headers', true)::json->>'x-portal-token')
  );

CREATE POLICY "Public can view products via portal token"
  ON public.products FOR SELECT
  USING (
    trainer_id IN (SELECT trainer_id FROM public.client_portal_tokens WHERE token = current_setting('request.headers', true)::json->>'x-portal-token')
    AND active = TRUE
  );

CREATE POLICY "Public can view purchases via portal token"
  ON public.purchases FOR SELECT
  USING (
    client_id IN (SELECT client_id FROM public.client_portal_tokens WHERE token = current_setting('request.headers', true)::json->>'x-portal-token')
  );

CREATE POLICY "Public can view credits via portal token"
  ON public.credit_ledger FOR SELECT
  USING (
    client_id IN (SELECT client_id FROM public.client_portal_tokens WHERE token = current_setting('request.headers', true)::json->>'x-portal-token')
  );

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_trainer_profiles_updated_at
  BEFORE UPDATE ON public.trainer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_clients_trainer_id ON public.clients(trainer_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_products_trainer_id ON public.products(trainer_id);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_purchases_trainer_id ON public.purchases(trainer_id);
CREATE INDEX idx_purchases_client_id ON public.purchases(client_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);
CREATE INDEX idx_credit_ledger_client_id ON public.credit_ledger(client_id);
CREATE INDEX idx_sessions_trainer_id ON public.sessions(trainer_id);
CREATE INDEX idx_sessions_client_id ON public.sessions(client_id);
CREATE INDEX idx_sessions_occurred_at ON public.sessions(occurred_at);
CREATE INDEX idx_reminder_events_trainer_id ON public.reminder_events(trainer_id);
CREATE INDEX idx_client_portal_tokens_token ON public.client_portal_tokens(token);