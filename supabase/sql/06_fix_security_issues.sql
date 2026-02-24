-- ============================================
-- FIX: Supabase Security Issues
-- ============================================
-- 1. Policy Exists RLS Disabled - public.coach_messages
-- 2. Security Definer View - public.coach_inbox
-- 3. RLS Disabled in Public - public.coach_messages

-- 1. Enable RLS on coach_messages
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Coach can view all messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Coach can update messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Coach full access (select)" ON public.coach_messages;
DROP POLICY IF EXISTS "Coach full access (update)" ON public.coach_messages;

-- 3. Create Coach Policies
-- Replace UUID if it changes (currently based on 01_update_coach_policies.sql)
CREATE POLICY "Coach full access (select)"
  ON public.coach_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = 'c1cadec4-45d9-4e98-aac6-b3b8112356e9'::uuid);

CREATE POLICY "Coach full access (update)"
  ON public.coach_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = 'c1cadec4-45d9-4e98-aac6-b3b8112356e9'::uuid);

-- 4. Create User Policies
-- Allows users to send their own messages
CREATE POLICY "Users can insert own messages"
  ON public.coach_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allows users to see only their own messages in history
CREATE POLICY "Users can view own messages"
  ON public.coach_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allows users to delete their own messages from history
CREATE POLICY "Users can delete own messages"
  ON public.coach_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Fix Security Definer View
-- Set the view to security_invoker to respect RLS policies of the underlying table
ALTER VIEW IF EXISTS public.coach_inbox SET (security_invoker = true);
