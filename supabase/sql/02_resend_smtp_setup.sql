-- ============================================
-- Clean Migration for Resend SMTP Setup
-- ============================================

-- 1. Remove ANY existing triggers and functions from the old setup
DROP TRIGGER IF EXISTS on_coach_message_created ON public.coach_messages;
DROP TRIGGER IF EXISTS on_coach_reply_added ON public.coach_messages;
DROP FUNCTION IF EXISTS notify_coach_on_new_message();
DROP FUNCTION IF EXISTS notify_user_on_coach_reply();

-- 2. Ensure net extension is available if needed for OTHER things, 
-- but we won't use it for manual PL/pgSQL notifications anymore.
-- Instead, use Supabase Dashboard → Database → Webhooks for 'notify-user'.

-- 3. Update 'coach_messages' table state management
CREATE OR REPLACE FUNCTION update_coach_reply_metadata()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coach_reply IS NOT NULL AND OLD.coach_reply IS NULL THEN
    NEW.replied_at := timezone('utc'::text, now());
    NEW.status := 'replied';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle metadata (Internal only)
DROP TRIGGER IF EXISTS on_coach_reply_metadata ON public.coach_messages;
CREATE TRIGGER on_coach_reply_metadata
  BEFORE UPDATE ON public.coach_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_coach_reply_metadata();

-- INSTRUCTIONS FOR USER:
-- 1. Go to Supabase Dashboard → Database → Webhooks
-- 2. Create a NEW Webhook:
--    - Name: notify_user_on_reply
--    - Table: coach_messages
--    - Events: Update
--    - Filter: coach_reply IS NOT NULL AND coach_reply != OLD.coach_reply
--    - HTTP Method: POST
--    - URL: https://neomind180.vercel.app/api/notify-user
--    - Headers: 
--        - Content-Type: application/json
--        - Authorization: Bearer [YOUR_NOTIFY_AUTH_TOKEN]
