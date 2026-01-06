-- Update default timezone to Europe/Stockholm
ALTER TABLE public.trainer_profiles 
ALTER COLUMN timezone SET DEFAULT 'Europe/Stockholm';

-- Update default currency to SEK
ALTER TABLE public.trainer_profiles 
ALTER COLUMN currency SET DEFAULT 'SEK';

-- Add language_preference column to trainer_profiles table
-- Default to 'sv' (Swedish) as specified in the plan
ALTER TABLE public.trainer_profiles 
ADD COLUMN language_preference VARCHAR(5) NOT NULL DEFAULT 'sv';

-- Add comment to explain the column
COMMENT ON COLUMN public.trainer_profiles.language_preference IS 'User preferred language for UI and email communications. Default is Swedish (sv).';