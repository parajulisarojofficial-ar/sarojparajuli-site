-- ==============================================================================
-- sarojparajuli.com.np — Migration 20261114
-- 1. Dedicated Homepage Content Table (Editable via Supabase Table Editor)
-- 2. Blog `preferred_section` Column (1 = Tech Updates, 0 = Personal Blogs)
-- 3. Social Media Image / Icon URLs for all Platforms
-- ==============================================================================

-- 1. DEDICATED HOMEPAGE CONTENT TABLE
CREATE TABLE IF NOT EXISTS public.homepage_content (
    id TEXT PRIMARY KEY DEFAULT 'main',
    badge_text TEXT DEFAULT 'Available for Data Analytics & M&E Roles',
    show_badge BOOLEAN DEFAULT true,
    greeting TEXT DEFAULT 'Hey, I’m',
    name TEXT DEFAULT 'Saroj Parajuli',
    subheadline TEXT DEFAULT 'Statistician • Data & M&E Analyst • Acoustic Musician',
    bio TEXT DEFAULT 'Final-Year B.Sc. Statistics student at Tri-Chandra Multiple Campus (TU), Kathmandu. Specializing in Statistical Modeling, quantitative survey design with KoboToolbox & XLSForm, and data analysis using Python and PostgreSQL.',
    profile_image_url TEXT DEFAULT 'assets/passport_photo.jpg',
    show_cta_buttons BOOLEAN DEFAULT true,
    cta_primary_text TEXT DEFAULT 'View Career & Portfolio',
    cta_secondary_text TEXT DEFAULT 'Contact Me',
    cta_cv_text TEXT DEFAULT 'Download CV',
    show_stats BOOLEAN DEFAULT true,
    stat_1_val TEXT DEFAULT 'B.Sc.',
    stat_1_label TEXT DEFAULT 'Statistics Major',
    stat_2_val TEXT DEFAULT '2027',
    stat_2_label TEXT DEFAULT 'TU Kathmandu',
    stat_3_val TEXT DEFAULT 'M&E',
    stat_3_label TEXT DEFAULT 'KoboToolbox & XLS',
    stat_4_val TEXT DEFAULT 'Music',
    stat_4_label TEXT DEFAULT 'Acoustic Guitar',
    show_pillars BOOLEAN DEFAULT true,
    pillar_1_title TEXT DEFAULT 'Statistical Analysis & Modeling',
    pillar_1_desc TEXT DEFAULT 'Hypothesis testing, probability distributions, regression modeling, and translating raw data into interpretable statistical insights.',
    pillar_2_title TEXT DEFAULT 'Monitoring & Evaluation (M&E)',
    pillar_2_desc TEXT DEFAULT 'Digital survey architecture using KoboToolbox, complex XLSForm logic, indicator tracking, and data quality validation.',
    pillar_3_title TEXT DEFAULT 'Acoustic Music & Voice',
    pillar_3_desc TEXT DEFAULT 'Acoustic guitar chord arrangements, Nepali folk covers, fingerpicking sessions, and creative audio demos.',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial row if not exists
INSERT INTO public.homepage_content (
    id, badge_text, show_badge, greeting, name, subheadline, bio, profile_image_url,
    show_cta_buttons, cta_primary_text, cta_secondary_text, cta_cv_text,
    show_stats, stat_1_val, stat_1_label, stat_2_val, stat_2_label,
    stat_3_val, stat_3_label, stat_4_val, stat_4_label,
    show_pillars, pillar_1_title, pillar_1_desc, pillar_2_title, pillar_2_desc, pillar_3_title, pillar_3_desc
)
VALUES (
    'main',
    'Available for Data Analytics & M&E Roles',
    true,
    'Hey, I’m',
    'Saroj Parajuli',
    'Statistician • Data & M&E Analyst • Acoustic Musician',
    'Final-Year B.Sc. Statistics student at Tri-Chandra Multiple Campus (TU), Kathmandu. Specializing in Statistical Modeling, quantitative survey design with KoboToolbox & XLSForm, and data analysis using Python and PostgreSQL.',
    'assets/passport_photo.jpg',
    true,
    'View Career & Portfolio',
    'Contact Me',
    'Download CV',
    true,
    'B.Sc.', 'Statistics Major',
    '2027', 'TU Kathmandu',
    'M&E', 'KoboToolbox & XLS',
    'Music', 'Acoustic Guitar',
    true,
    'Statistical Analysis & Modeling',
    'Hypothesis testing, probability distributions, regression modeling, and translating raw data into interpretable statistical insights.',
    'Monitoring & Evaluation (M&E)',
    'Digital survey architecture using KoboToolbox, complex XLSForm logic, indicator tracking, and data quality validation.',
    'Acoustic Music & Voice',
    'Acoustic guitar chord arrangements, Nepali folk covers, fingerpicking sessions, and creative audio demos.'
)
ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW();

-- Enable RLS and public access for homepage_content
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view homepage content" ON public.homepage_content;
CREATE POLICY "Public can view homepage content" ON public.homepage_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage homepage content" ON public.homepage_content;
CREATE POLICY "Manage homepage content" ON public.homepage_content FOR ALL USING (true) WITH CHECK (true);


-- 2. BLOG PREFERRED SECTION COLUMN (1 = Tech Updates, 0 = Personal Blogs)
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS preferred_section INTEGER DEFAULT 1;

-- Backfill existing rows
UPDATE public.blogs 
SET preferred_section = 0 
WHERE blog_type = 'personal' OR LOWER(category) = 'personal';

UPDATE public.blogs 
SET preferred_section = 1 
WHERE preferred_section IS NULL OR (blog_type != 'personal' AND LOWER(category) != 'personal');


-- 3. SOCIAL MEDIA IMAGES / ICONS
-- Populate icon column with official SVG CDN image links
INSERT INTO public.social_links (platform, display_name, url, icon, display_order, is_active)
VALUES 
    ('github', 'GitHub', 'https://github.com/parajulisarojofficial-ar', 'https://cdn.simpleicons.org/github/2563eb', 1, true),
    ('linkedin', 'LinkedIn', 'https://www.linkedin.com/in/sarojparajuli', 'https://cdn.simpleicons.org/linkedin/0A66C2', 2, true),
    ('facebook', 'Facebook', 'https://www.facebook.com/sarojparajuli1321?mibextid=ZbWKwL', 'https://cdn.simpleicons.org/facebook/1877F2', 3, true),
    ('instagram', 'Instagram', 'https://www.instagram.com/sarojparajuli.1321', 'https://cdn.simpleicons.org/instagram/E4405F', 4, true),
    ('youtube', 'YouTube', 'https://youtube.com/@sarojparajuli', 'https://cdn.simpleicons.org/youtube/FF0000', 5, true),
    ('tiktok', 'TikTok', 'https://www.tiktok.com/@sarojparajuli.1321', 'https://cdn.simpleicons.org/tiktok/000000', 6, true),
    ('whatsapp', 'WhatsApp', 'https://wa.me/parajulisaroj', 'https://cdn.simpleicons.org/whatsapp/25D366', 7, true),
    ('email', 'Email (For Contact)', 'mailto:contact@sarojparajuli.com.np', 'https://cdn.simpleicons.org/minutemailer/0284c7', 8, true),
    ('email_info', 'Email (For Info)', 'mailto:info@sarojparajuli.com.np', 'https://cdn.simpleicons.org/minutemailer/0ea5e9', 9, true),
    ('email_career', 'Email (For Career)', 'mailto:career@sarojparajuli.com.np', 'https://cdn.simpleicons.org/minutemailer/2563eb', 10, true)
ON CONFLICT (platform) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    url = CASE WHEN public.social_links.url IS NULL OR public.social_links.url = '' THEN EXCLUDED.url ELSE public.social_links.url END,
    icon = EXCLUDED.icon,
    is_active = true,
    updated_at = NOW();
