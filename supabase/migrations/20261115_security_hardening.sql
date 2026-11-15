-- ==============================================================================
-- sarojparajuli.com.np — Security Hardening Migration
-- Drops all insecure FOR ALL USING (true) permissive policies.
-- Restricts public/anon access to strict SELECT (and validated guestbook INSERT).
-- Locks all data mutations to authenticated roles and serverless service_role.
-- ==============================================================================

-- 1. Ensure RLS is active on all core tables
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook_messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing overly-permissive write policies
DROP POLICY IF EXISTS "Allow blog sync and management" ON public.blogs;
DROP POLICY IF EXISTS "Manage site_content" ON public.site_content;
DROP POLICY IF EXISTS "Manage homepage content" ON public.homepage_content;
DROP POLICY IF EXISTS "Manage music gallery" ON public.music_gallery;
DROP POLICY IF EXISTS "Manage social links" ON public.social_links;
DROP POLICY IF EXISTS "Manage guestbook messages" ON public.guestbook_messages;

-- 3. BLOGS: Strict read-only for public, mutations restricted to service_role / authenticated
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs" 
ON public.blogs 
FOR SELECT 
TO public 
USING (is_published = true);

-- 4. MUSIC GALLERY: Strict read-only for public
DROP POLICY IF EXISTS "Public can view published music" ON public.music_gallery;
CREATE POLICY "Public can view published music" 
ON public.music_gallery 
FOR SELECT 
TO public 
USING (is_published = true);

-- 5. SOCIAL LINKS: Strict read-only for active rows
DROP POLICY IF EXISTS "Public can view active social links" ON public.social_links;
CREATE POLICY "Public can view active social links" 
ON public.social_links 
FOR SELECT 
TO public 
USING (is_active = true);

-- 6. SITE CONTENT (General CMS Payload): Strict read-only for public
DROP POLICY IF EXISTS "Public can read site_content" ON public.site_content;
CREATE POLICY "Public can read site_content" 
ON public.site_content 
FOR SELECT 
TO public 
USING (true);

-- 7. HOMEPAGE CONTENT: Strict read-only for public
DROP POLICY IF EXISTS "Public can view homepage content" ON public.homepage_content;
CREATE POLICY "Public can view homepage content" 
ON public.homepage_content 
FOR SELECT 
TO public 
USING (true);

-- 8. GUESTBOOK MESSAGES: Read-only for public + Validated Insert Only
DROP POLICY IF EXISTS "Public can view guestbook messages" ON public.guestbook_messages;
CREATE POLICY "Public can view guestbook messages" 
ON public.guestbook_messages 
FOR SELECT 
TO public 
USING (true);

DROP POLICY IF EXISTS "Visitors can insert guestbook_messages" ON public.guestbook_messages;
DROP POLICY IF EXISTS "Public can submit guestbook messages" ON public.guestbook_messages;
CREATE POLICY "Public can submit validated guestbook messages" 
ON public.guestbook_messages 
FOR INSERT 
TO public 
WITH CHECK (
    length(trim(sender_name)) >= 1 
    AND length(trim(sender_name)) <= 100 
    AND length(trim(message)) >= 2 
    AND length(trim(message)) <= 2000
);

-- Note: In Postgres / Supabase, the `service_role` key bypasses RLS by default.
-- Therefore, backend API endpoints (/api/content, /api/guestbook) using SUPABASE_SERVICE_ROLE_KEY
-- can safely perform admin operations (upsert, delete) after verifying ADMIN_SECRET_KEY,
-- while unauthenticated visitors using the public anon key are completely prevented from modifying data.
