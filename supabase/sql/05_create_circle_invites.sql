-- ============================================
-- Create Circle Invitations Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.circle_invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  session_date timestamp with time zone,
  access_link text,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.circle_invites ENABLE ROW LEVEL SECURITY;

-- Policies
-- All authenticated users can view invites
CREATE POLICY "Users can view circle invites" 
  ON public.circle_invites FOR SELECT 
  TO authenticated
  USING (true);

-- Only coach can create invites
CREATE POLICY "Coach can create circle invites" 
  ON public.circle_invites FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = 'c1cadec4-45d9-4e98-aac6-b3b8112356e9'::uuid);

-- Only coach can update invites
CREATE POLICY "Coach can update circle invites" 
  ON public.circle_invites FOR UPDATE 
  TO authenticated
  USING (auth.uid() = 'c1cadec4-45d9-4e98-aac6-b3b8112356e9'::uuid);

-- Only coach can delete invites
CREATE POLICY "Coach can delete circle invites" 
  ON public.circle_invites FOR DELETE 
  TO authenticated
  USING (auth.uid() = 'c1cadec4-45d9-4e98-aac6-b3b8112356e9'::uuid);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_circle_invite_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_circle_invite_update
  BEFORE UPDATE ON public.circle_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_circle_invite_timestamp();
