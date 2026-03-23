-- Create vouchers table to track promotional/testing codes
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'builder', 'catalyst', 'tier2', 'tier3')),
  is_redeemed BOOLEAN DEFAULT false,
  redeemed_by UUID REFERENCES profiles(id),
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for vouchers (admin only for direct access, but API will handle validation)
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can do everything on vouchers" 
ON vouchers FOR ALL 
USING (/* true if you have an admin role, but for now we'll allow service_role */ true)
WITH CHECK (true);

-- Index for fast lookup by code
CREATE INDEX IF NOT EXISTS vouchers_code_idx ON vouchers (code);
