-- Add trial_expires_at to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_expires_at timestamptz;

-- Add voucher_type and discount_percent to vouchers
ALTER TABLE vouchers
  ADD COLUMN IF NOT EXISTS voucher_type text NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS discount_percent integer; -- null = free/trial, 1-99 = percentage discount

-- Add a constraint for voucher_type
ALTER TABLE vouchers
  ADD CONSTRAINT vouchers_type_check CHECK (voucher_type IN ('trial', 'discount'));
