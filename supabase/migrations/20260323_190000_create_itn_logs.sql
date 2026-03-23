CREATE TABLE IF NOT EXISTS itn_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  payload jsonb,
  error_message text,
  status_code int,
  created_at timestamptz DEFAULT now()
);
