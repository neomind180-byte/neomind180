-- ============================================
-- CLEANUP: Remove failing triggers to fix 500 Registration Errors
-- ============================================
-- Run this in your Supabase SQL Editor ASAP to restore registration functionality.

-- 1. DROP the triggers
DROP TRIGGER IF EXISTS on_auth_email_confirmed ON auth.users;
DROP TRIGGER IF EXISTS systemeio_signup_trigger ON auth.users;

-- 2. DROP the functions
DROP FUNCTION IF EXISTS public.trigger_systemeio_on_confirmation();
DROP FUNCTION IF EXISTS public.handle_new_user_sync();
