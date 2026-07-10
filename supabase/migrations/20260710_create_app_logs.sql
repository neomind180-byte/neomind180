-- Create the app_logs table for client-side diagnostic logging.
-- This provides persistent visibility into auth failures, fetch timeouts,
-- and API errors — critical since Supabase free tier only retains current-day logs.

CREATE TABLE IF NOT EXISTS app_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level VARCHAR(10) NOT NULL DEFAULT 'info',
  event VARCHAR(100) NOT NULL,
  message TEXT,
  page VARCHAR(200),
  user_id VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying by time (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_app_logs_created_at ON app_logs (created_at DESC);

-- Index for filtering by event type
CREATE INDEX IF NOT EXISTS idx_app_logs_event ON app_logs (event);

-- Index for filtering by user
CREATE INDEX IF NOT EXISTS idx_app_logs_user_id ON app_logs (user_id);

-- RLS: Only service role can write (the /api/log endpoint uses service role key).
-- No user-facing read access needed.
ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (this is implicit, but explicit for clarity)
CREATE POLICY "Service role full access" ON app_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-cleanup: delete logs older than 30 days to prevent table bloat.
-- Run this as a scheduled query or cron job in Supabase.
-- DELETE FROM app_logs WHERE created_at < now() - interval '30 days';

COMMENT ON TABLE app_logs IS 'Client-side diagnostic logs for debugging auth failures, timeouts, and API errors. Auto-populated by /api/log endpoint.';
