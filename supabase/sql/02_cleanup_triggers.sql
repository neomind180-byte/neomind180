-- ============================================
-- CLEANUP: Remove failing triggers and redundant tables
-- ============================================
-- Run this in your Supabase SQL Editor to clean up legacy artifacts.

-- 1. DROP the triggers
DROP TRIGGER IF EXISTS on_auth_email_confirmed ON auth.users;
DROP TRIGGER IF EXISTS systemeio_signup_trigger ON auth.users;

-- 2. DROP the functions
DROP FUNCTION IF EXISTS public.trigger_systemeio_on_confirmation();
DROP FUNCTION IF EXISTS public.handle_new_user_sync();

-- 3. DROP legacy tables created by Supabase AI
-- Only run this if you want to remove the tracking tables
DROP TABLE IF EXISTS public.webhook_errors;
DROP TABLE IF EXISTS public.webhook_outbox;
