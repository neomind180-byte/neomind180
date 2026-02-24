-- ============================================
-- FIX: Supabase Security Warnings (Function Hardening)
-- ============================================
-- These changes fix "Function Search Path Mutable" warnings by explicitly
-- setting the search_path for these functions to 'public'.

-- 1. Harden set_updated_at_coach_messages
ALTER FUNCTION public.set_updated_at_coach_messages() 
SET search_path = public;

-- 2. Harden update_reflection_timestamp
ALTER FUNCTION public.update_reflection_timestamp() 
SET search_path = public;

-- 3. Harden update_circle_invite_timestamp
ALTER FUNCTION public.update_circle_invite_timestamp() 
SET search_path = public;

-- 4. Harden update_coach_reply_metadata
ALTER FUNCTION public.update_coach_reply_metadata() 
SET search_path = public;

-- 5. Harden handle_new_user
-- This function is SECURITY DEFINER, making it especially important to harden
ALTER FUNCTION public.handle_new_user() 
SET search_path = public;
