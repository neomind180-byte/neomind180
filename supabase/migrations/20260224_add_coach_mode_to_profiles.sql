-- Migration: Add preferred_coach_mode to profiles
-- Date: 2026-02-24

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_coach_mode TEXT DEFAULT 'Gentle Observer';

-- Update handle_new_user trigger function to include preferred_coach_mode
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, subscription_tier, theme, preferred_coach_mode)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'subscription_tier', 'free'),
    COALESCE(NEW.raw_user_meta_data->>'theme', 'dark'),
    COALESCE(NEW.raw_user_meta_data->>'preferred_coach_mode', 'Gentle Observer')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
