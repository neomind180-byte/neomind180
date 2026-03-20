-- Migration: Update subscription_tier constraint to match PRICING_PLANS
-- Date: 2026-03-20

-- Drop the old constraint if it exists (usually named something like profiles_subscription_tier_check)
DO $$ 
BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
END $$;

-- Add the updated constraint
ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_subscription_tier_check 
    CHECK (subscription_tier IN ('free', 'starter', 'builder', 'catalyst', 'tier2', 'tier3'));
