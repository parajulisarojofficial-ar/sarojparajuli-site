-- ==============================================================================
-- sarojparajuli.com.np — Migration 20261109: Dual Blog System & Google Drive Sync
-- Distinguishes Technical Updates (.html standalone files) from Personal Blogs (Drive/Supabase)
-- ==============================================================================

-- 1. Add blog_type and drive_file_id columns to public.blogs if not already present
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS blog_type TEXT DEFAULT 'tech',
ADD COLUMN IF NOT EXISTS drive_file_id TEXT;

-- 2. Index on blog_type, slug, and created_at for fast categorized queries
CREATE INDEX IF NOT EXISTS idx_blogs_type ON public.blogs (blog_type);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs (slug);
CREATE INDEX IF NOT EXISTS idx_blogs_drive_file ON public.blogs (drive_file_id);

-- 3. RLS policy to allow serverless sync endpoint to manage blogs
DROP POLICY IF EXISTS "Allow blog sync and management" ON public.blogs;
CREATE POLICY "Allow blog sync and management" ON public.blogs FOR ALL USING (true) WITH CHECK (true);

-- 3. Seed initial personal blog
INSERT INTO public.blogs (title, slug, category, blog_type, excerpt, content, is_published)
VALUES (
    'The Rhythm of Numbers and Strings: Why I Started Documenting My Journey',
    'rhythm-of-numbers-and-strings',
    'Personal',
    'personal',
    'Between calculating confidence intervals and fingerpicking acoustic chords late into the night, I realized that statistics and music are two languages speaking the same truth.',
    '### Two Worlds, One Cadence

People often ask me why someone who spends hours deriving probability distributions and designing multi-stage survey questionnaires also spends hours with a guitar resting across his knees.

To many, mathematics is cold and logical, while acoustic music is emotional and spontaneous. But the deeper I go into both, the more I see that they are fundamentally the same discipline: **finding harmony inside noise**.

### The Math of Music

When you fret a chord—whether it is a simple open Em or a rich, resonant add9—you are not just playing music. You are manipulating physical ratios of string length and acoustic frequency. Pythagoras knew this centuries ago: harmonics are pure arithmetic.

In statistics, when we analyze variance in survey data, we are listening for the underlying signal against background error. When I practice fingerpicking, each note must be placed precisely on time, yet breathe with emotion. Precision without soul is sterile calculation; soul without structure is chaos.

### Why I Document Here

I built this digital garden not just as a portfolio for jobs or academic applications, but as a permanent, open ledger of growth. As a final-year statistics student at Tri-Chandra Multiple Campus in Kathmandu, life is moving fast—field surveys, regression models, coding scripts in Python, and acoustic covers recorded in quiet rooms.

By syncing my Google Docs directly from Google Drive into this space, I can write whenever inspiration strikes, whether on my phone or laptop, and share my honest thoughts with whoever stumbles across this site.

Thank you for reading, and welcome to my journey.',
    true
)
ON CONFLICT (slug) DO UPDATE SET
    category = 'Personal',
    blog_type = 'personal',
    updated_at = NOW();
