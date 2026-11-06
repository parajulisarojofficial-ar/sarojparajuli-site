-- ==============================================================================
-- sarojparajuli.com.np — V2 Schema & Dedicated Management Tables
-- Designed for easy row editing via Supabase Dashboard Table Editor
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Dedicated Blogs / Articles Table (Markdown, Tables, Images)
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    category TEXT DEFAULT 'General',
    cover_image TEXT,
    excerpt TEXT,
    content TEXT NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Dedicated Music Gallery Table (YouTube Embeds, Chords, Takes)
CREATE TABLE IF NOT EXISTS public.music_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT DEFAULT 'Acoustic Take',
    youtube_url TEXT,
    cover_image TEXT,
    chords TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Dedicated Social Media Links Table
CREATE TABLE IF NOT EXISTS public.social_links (
    platform TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    url TEXT DEFAULT '',
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Seed Clean Rows for Social Links
INSERT INTO public.social_links (platform, display_name, url, display_order)
VALUES 
    ('linkedin', 'LinkedIn', '', 1),
    ('github', 'GitHub', '', 2),
    ('facebook', 'Facebook', '', 3),
    ('instagram', 'Instagram', '', 4),
    ('whatsapp', 'WhatsApp', '', 5),
    ('email', 'Email', 'sarojparajuli.personal@outlook.com', 6)
ON CONFLICT (platform) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    display_order = EXCLUDED.display_order;

-- 6. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook_messages ENABLE ROW LEVEL SECURITY;

-- 7. Public Read & Insert Security Policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
    CREATE POLICY "Public can view published blogs" ON public.blogs FOR SELECT USING (is_published = true);

    DROP POLICY IF EXISTS "Public can view published music" ON public.music_gallery;
    CREATE POLICY "Public can view published music" ON public.music_gallery FOR SELECT USING (is_published = true);

    DROP POLICY IF EXISTS "Public can view active social links" ON public.social_links;
    CREATE POLICY "Public can view active social links" ON public.social_links FOR SELECT USING (is_active = true);

    DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
    CREATE POLICY "Public can view site content" ON public.site_content FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view guestbook messages" ON public.guestbook_messages;
    CREATE POLICY "Public can view guestbook messages" ON public.guestbook_messages FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can submit guestbook messages" ON public.guestbook_messages;
    CREATE POLICY "Public can submit guestbook messages" ON public.guestbook_messages FOR INSERT WITH CHECK (
        length(trim(sender_name)) >= 1 AND length(trim(message)) >= 2
    );
END $$;
