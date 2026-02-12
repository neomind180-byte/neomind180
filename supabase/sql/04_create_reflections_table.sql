-- ============================================
-- Create Reflections Table for Neo Chats
-- ============================================

CREATE TABLE IF NOT EXISTS public.reflections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  messages jsonb DEFAULT '[]'::jsonb,
  last_message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own reflections" 
  ON public.reflections FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflections" 
  ON public.reflections FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections" 
  ON public.reflections FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_reflection_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reflection_update
  BEFORE UPDATE ON public.reflections
  FOR EACH ROW
  EXECUTE FUNCTION update_reflection_timestamp();
