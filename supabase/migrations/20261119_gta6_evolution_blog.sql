-- ==============================================================================
-- sarojparajuli.com.np — Migration 20261119_gta6_evolution_blog
-- Sync GTA 1 to 6 Evolution & Launch Analysis Blog with Supabase Database
-- ==============================================================================

-- 1. Insert or update the GTA 6 Evolution blog in public.blogs
INSERT INTO public.blogs (
    title,
    slug,
    category,
    cover_image,
    excerpt,
    content,
    blog_type,
    preferred_section,
    is_published,
    created_at,
    updated_at
)
VALUES (
    'GTA Evolution (GTA 1 to 6): The 13-Year Hype, Day-One Launch Review, $1.5B Sales & The Future of Gaming',
    'history-of-gta-evolution-gta6-launch-analysis',
    'Gaming Architecture & Economics',
    '',
    'From 1997 top-down 2D chaos to GTA 6''s record-shattering $1.52B day-one sales and 12.4M concurrent players. A complete technical breakdown of GTA 1-6, the 13-year hype arc, day-one review, and how this launch permanently shifts the gaming industry.',
    'From 1997 top-down 2D chaos to GTA 6''s record-shattering $1.52B day-one sales and 12.4M concurrent players. A complete technical breakdown of GTA 1-6, the 13-year hype arc, day-one review, and how this launch permanently shifts the gaming industry.

### Key Milestones & Evolution (GTA 1 to GTA 6)
- **GTA 1 & GTA 2 (1997–1999):** Top-down 2D isometric chaos, establishing the core wanted level and open urban sandbox concept.
- **GTA III, Vice City & San Andreas (2001–2004):** The revolutionary 3D era with RenderWare engine, cinematic storytelling, and massive state-wide map progression.
- **GTA IV (2008):** Next-gen physics leap with RAGE Engine and Euphoria procedural ragdoll physics in a gritty Liberty City.
- **GTA V (2013):** Tri-protagonist dynamic switching, Los Santos, and GTA Online becoming the highest-grossing entertainment product in history ($8.5B+).
- **GTA VI (Nov 19, 2026):** Dual protagonists Lucia and Jason in Leonida (Vice City), advanced neural crowd AI, real-time volumetric weather simulation, setting day-one launch records of $1.52B gross revenue and 12.4M concurrent players.',
    'tech',
    1,
    true,
    '2026-11-19 10:00:00+00',
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    cover_image = EXCLUDED.cover_image,
    excerpt = EXCLUDED.excerpt,
    content = EXCLUDED.content,
    blog_type = EXCLUDED.blog_type,
    preferred_section = EXCLUDED.preferred_section,
    is_published = EXCLUDED.is_published,
    updated_at = NOW();

-- 2. Ensure Shift of Tech blog has proper slug and preferred_section
UPDATE public.blogs
SET slug = 'overall-shift-of-tech-to-ai-workflows',
    category = 'Artificial Intelligence & Workflows',
    preferred_section = 1
WHERE id = 'a1ad97c5-efd1-47e4-9c8c-b510fd74a3e7';

-- 3. Update public.site_content payload.posts array with the latest synced posts
UPDATE public.site_content
SET payload = jsonb_set(
    payload,
    '{posts}',
    '[
        {
            "id": "post-gta-6-evolution",
            "sn": "04",
            "title": "GTA Evolution (GTA 1 to 6): The 13-Year Hype, Day-One Launch Review, $1.5B Sales & The Future of Gaming",
            "slug": "history-of-gta-evolution-gta6-launch-analysis",
            "category": "Gaming Architecture & Economics",
            "blog_type": "tech",
            "preferred_section": 1,
            "date": "Nov 19, 2026",
            "read_time": "11 min read",
            "summary": "From 1997 top-down 2D chaos to GTA 6''s record-shattering $1.52B day-one sales and 12.4M concurrent players. A complete technical breakdown of GTA 1-6, the 13-year hype arc, day-one review, and how this launch permanently shifts the gaming industry.",
            "excerpt": "From 1997 top-down 2D chaos to GTA 6''s record-shattering $1.52B day-one sales and 12.4M concurrent players. A complete technical breakdown of GTA 1-6, the 13-year hype arc, day-one review, and how this launch permanently shifts the gaming industry.",
            "url": "blogs/history-of-gta-evolution-gta6-launch-analysis.html",
            "has_static_html": true,
            "image": "",
            "is_published": true
        },
        {
            "id": "a1ad97c5-efd1-47e4-9c8c-b510fd74a3e7",
            "sn": "03",
            "title": "The Overall Shift Of Tech From Normal Browising To AI Driven Workflows",
            "slug": "overall-shift-of-tech-to-ai-workflows",
            "category": "Artificial Intelligence & Workflows",
            "blog_type": "tech",
            "preferred_section": 1,
            "date": "Nov 14, 2026",
            "read_time": "3 min read",
            "summary": "The entire internet is shifting towards the AI era. Normal browser browsing is now negligible among youth as AI research platforms replace manual search.",
            "excerpt": "The entire internet is shifting towards the AI era. Normal browser browsing is now negligible among youth as AI research platforms replace manual search.",
            "content": "The entire internet is shifting towards the ai era. Normal browser browsing is nwo negligle among the youths. Most people are using the ai platforms for doing research rather than doing search job by self. Certainly there will be saturation point in near future, but hey, it''ll be ride of technicnological war.\n\n### The Search Paradigm Shift\n\nWhere we once opened 10 Google search result tabs, compared contradictory answers, and read through clutter, agentic workflows now condense complex answers into verified execution steps in seconds.\n\n### Where Statistics Meets Intelligence\n\nIn statistics, predictive models and Bayesian inference rely on probability distributions. Today''s generative systems operate on token probabilities across billions of parameters. Understanding the statistical foundations behind these models is becoming the most valuable skill for researchers and analysts in Nepal and globally.",
            "body": "The entire internet is shifting towards the ai era. Normal browser browsing is nwo negligle among the youths. Most people are using the ai platforms for doing research rather than doing search job by self. Certainly there will be saturation point in near future, but hey, it''ll be ride of technicnological war.\n\n### The Search Paradigm Shift\n\nWhere we once opened 10 Google search result tabs, compared contradictory answers, and read through clutter, agentic workflows now condense complex answers into verified execution steps in seconds.\n\n### Where Statistics Meets Intelligence\n\nIn statistics, predictive models and Bayesian inference rely on probability distributions. Today''s generative systems operate on token probabilities across billions of parameters. Understanding the statistical foundations behind these models is becoming the most valuable skill for researchers and analysts in Nepal and globally.",
            "has_static_html": false,
            "is_published": true
        },
        {
            "id": "post-personal-1",
            "sn": "01",
            "title": "The Rhythm of Numbers and Strings: Why I Started Documenting My Journey",
            "slug": "rhythm-of-numbers-and-strings",
            "category": "Personal",
            "blog_type": "personal",
            "preferred_section": 0,
            "date": "Nov 9, 2026",
            "read_time": "3 min read",
            "summary": "Between calculating confidence intervals and fingerpicking acoustic chords late into the night, I realized that statistics and music are two languages speaking the same truth. This is why I document my life.",
            "excerpt": "Between calculating confidence intervals and fingerpicking acoustic chords late into the night, I realized that statistics and music are two languages speaking the same truth. This is why I document my life.",
            "content": "### Two Worlds, One Cadence\n\nPeople often ask me why someone who spends hours deriving probability distributions and designing multi-stage survey questionnaires also spends hours with a guitar resting across his knees.\n\nTo many, mathematics is cold and logical, while acoustic music is emotional and spontaneous. But the deeper I go into both, the more I see that they are fundamentally the same discipline: **finding harmony inside noise**.\n\n### The Math of Music\n\nWhen you fret a chord—whether it is a simple open Em or a rich, resonant add9—you are not just playing music. You are manipulating physical ratios of string length and acoustic frequency. Pythagoras knew this centuries ago: harmonics are pure arithmetic.\n\nIn statistics, when we analyze variance in survey data, we are listening for the underlying signal against background error. When I practice fingerpicking, each note must be placed precisely on time, yet breathe with emotion. Precision without soul is sterile calculation; soul without structure is chaos.\n\n### Why I Document Here\n\nI built this digital garden not just as a portfolio for jobs or academic applications, but as a permanent, open ledger of growth. As a final-year statistics student at Tri-Chandra Multiple Campus in Kathmandu, life is moving fast—field surveys, regression models, coding scripts in Python, and acoustic covers recorded in quiet rooms.\n\nBy publishing directly into this space, I can write whenever inspiration strikes, whether on my phone or laptop, and share my honest thoughts with whoever stumbles across this site.\n\nThank you for reading, and welcome to my journey.",
            "body": "### Two Worlds, One Cadence\n\nPeople often ask me why someone who spends hours deriving probability distributions and designing multi-stage survey questionnaires also spends hours with a guitar resting across his knees.\n\nTo many, mathematics is cold and logical, while acoustic music is emotional and spontaneous. But the deeper I go into both, the more I see that they are fundamentally the same discipline: **finding harmony inside noise**.\n\n### The Math of Music\n\nWhen you fret a chord—whether it is a simple open Em or a rich, resonant add9—you are not just playing music. You are manipulating physical ratios of string length and acoustic frequency. Pythagoras knew this centuries ago: harmonics are pure arithmetic.\n\nIn statistics, when we analyze variance in survey data, we are listening for the underlying signal against background error. When I practice fingerpicking, each note must be placed precisely on time, yet breathe with emotion. Precision without soul is sterile calculation; soul without structure is chaos.\n\n### Why I Document Here\n\nI built this digital garden not just as a portfolio for jobs or academic applications, but as a permanent, open ledger of growth. As a final-year statistics student at Tri-Chandra Multiple Campus in Kathmandu, life is moving fast—field surveys, regression models, coding scripts in Python, and acoustic covers recorded in quiet rooms.\n\nBy publishing directly into this space, I can write whenever inspiration strikes, whether on my phone or laptop, and share my honest thoughts with whoever stumbles across this site.\n\nThank you for reading, and welcome to my journey.",
            "image": "",
            "has_static_html": false,
            "is_published": true
        },
        {
            "id": "post-2",
            "sn": "02",
            "title": "How Nepali Citizens Can Claim a Free .com.np Domain",
            "slug": "how-to-claim-free-com-np-domain-nepal",
            "category": "Web & Digital Identity",
            "blog_type": "tech",
            "preferred_section": 1,
            "date": "Nov 7, 2026",
            "read_time": "4 min read",
            "summary": "Every Nepali citizen can claim a lifetime free .com.np domain through Mercantile Communication''s official portal. Learn how to verify availability, configure DNS nameservers, and prepare the required citizenship documents and cover letter.",
            "excerpt": "Every Nepali citizen can claim a lifetime free .com.np domain through Mercantile Communication''s official portal. Learn how to verify availability, configure DNS nameservers, and prepare the required citizenship documents and cover letter.",
            "url": "blogs/how-to-claim-free-com-np-domain-nepal.html",
            "has_static_html": true,
            "image": "",
            "is_published": true
        },
        {
            "id": "post-1",
            "sn": "01",
            "title": "Turning Light Into Sight: How the 2026 Nobel Prize in Optogenetics Is Transforming Treatment for Retinitis Pigmentosa and Beyond",
            "slug": "optogenetics-retinitis-pigmentosa",
            "category": "Neuroscience & Ophthalmology",
            "blog_type": "tech",
            "preferred_section": 1,
            "date": "Nov 6, 2026",
            "read_time": "12 min read",
            "summary": "A microscopic green alga gave scientists a molecular light switch for living nerve cells. Recognized with the 2026 Nobel Prize in Physiology or Medicine, optogenetics is bringing landmark vision restoration therapies to patients with late-stage retinitis pigmentosa and opening new frontiers across medicine.",
            "excerpt": "A microscopic green alga gave scientists a molecular light switch for living nerve cells. Recognized with the 2026 Nobel Prize in Physiology or Medicine, optogenetics is bringing landmark vision restoration therapies to patients with late-stage retinitis pigmentosa and opening new frontiers across medicine.",
            "url": "blogs/optogenetics-retinitis-pigmentosa.html",
            "has_static_html": true,
            "image": "blogs/assets/optogenetics-hero.jpg",
            "is_published": true
        }
    ]'::jsonb,
    true
),
updated_at = NOW()
WHERE id = 'main';
