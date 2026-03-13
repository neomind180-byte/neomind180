-- ============================================
-- SETUP: Webhook to trigger Systeme.io on Email Confirmation
-- ============================================
-- Run this in your Supabase SQL Editor

-- 1. Create a function to call the webhook
-- Replace 'https://your-domain.com' with your actual production URL
-- And 'YOUR_WEBHOOK_SECRET' with the secret you set in your env variables (SUPABASE_WEBHOOK_SECRET)

CREATE OR REPLACE FUNCTION public.trigger_systemeio_on_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Only trigger if email_confirmed_at was NULL and is now NOT NULL
  IF (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL) THEN
    -- Construct a minimal payload for the new sync endpoint
    payload := jsonb_build_object(
      'email', NEW.email,
      'name', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      'userTier', COALESCE(NEW.raw_user_meta_data->>'subscription_tier', 'free')
    );

    BEGIN
      PERFORM
        net.http_post(
          url := 'https://app.neomind180.com/api/sync-to-systeme',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-webhook-secret', 'YOUR_WEBHOOK_SECRET' -- Match this to SUPABASE_WEBHOOK_SECRET
          ),
          body := payload::text
        );
    EXCEPTION WHEN OTHERS THEN
      -- Log the error to Supabase logs but don't fail the user confirmation
      RAISE WARNING 'Systeme.io Webhook Failed: %', SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure pg_net extension is enabled (for external HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_email_confirmed ON auth.users;

-- 4. Create the trigger on auth.users table
CREATE TRIGGER on_auth_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_systemeio_on_confirmation();
