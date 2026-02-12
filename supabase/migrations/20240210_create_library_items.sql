-- Create library_items table
CREATE TABLE IF NOT EXISTS library_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('Guide', 'Article', 'Worksheet', 'Audio', 'Video')),
    category TEXT,
    content_url TEXT,
    thumbnail_url TEXT,
    duration TEXT,
    read_time TEXT,
    min_tier TEXT DEFAULT 'free' CHECK (min_tier IN ('free', 'tier2', 'tier3')),
    locked BOOLEAN DEFAULT false -- Optional override, but min_tier is better
);

-- Enable Row Level Security (RLS)
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read library items
CREATE POLICY "Allow public read access" ON library_items FOR SELECT USING (true);

-- Seed initial data (Migrating from hardcoded)
INSERT INTO library_items (title, type, category, duration, read_time, min_tier, locked) VALUES
('5-Minute Grounding', 'Audio', 'Anxiety', '05:00', NULL, 'free', false),
('Morning Intentions', 'Audio', 'Focus', '10:00', NULL, 'free', false),
('The Observer Self', 'Audio', 'Deep Work', '15:00', NULL, 'free', false),
('Sleep Release', 'Audio', 'Sleep', '20:00', NULL, 'tier2', true),
('Breaking the Overthinking Loop', 'Guide', 'Mindset', NULL, '5 min', 'free', false),
('The Science of Neuroplasticity', 'Article', 'Science', NULL, '8 min', 'free', false),
('Journaling Prompts for Clarity', 'Worksheet', 'Clarity', NULL, 'PDF', 'free', false);
