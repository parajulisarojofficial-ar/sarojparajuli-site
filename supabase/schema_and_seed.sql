-- ============================================================================
-- Supabase PostgreSQL Production Schema & Seed for sarojparajuli.com.np
-- Author: Saroj Parajuli
-- Domain: sarojparajuli.com.np
--
-- How to apply:
-- 1. Log into your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project: qibqrnkvslgvgcowgabp
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Paste this entire file and click "Run" (green button)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE: site_content
-- Holds dynamic site configuration, stories, music tracks, goals, and portfolio
-- ----------------------------------------------------------------------------
create table if not exists public.site_content (
  id text primary key default 'main',
  payload jsonb not null,
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 2. TABLE: guestbook_messages
-- Stores community messages, well-wishes, and inquiries from visitors
-- Enhanced with database-level validation check constraints
-- ----------------------------------------------------------------------------
create table if not exists public.guestbook_messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null constraint chk_sender_name check (length(trim(sender_name)) >= 1 and length(sender_name) <= 100),
  sender_contact text constraint chk_sender_contact check (sender_contact is null or length(sender_contact) <= 150),
  message text not null constraint chk_message check (length(trim(message)) >= 2 and length(message) <= 2000),
  status text default 'approved' constraint chk_status check (status in ('approved', 'pending', 'spam')),
  created_at timestamptz default now()
);

-- Create performance index for fast chronological sorting
create index if not exists idx_guestbook_created_at
  on public.guestbook_messages (created_at desc);

-- ----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- Properly secured access controls for public visitors and administrator
-- ----------------------------------------------------------------------------
alter table public.site_content enable row level security;
alter table public.guestbook_messages enable row level security;

-- Drop old conflicting policies if re-running
drop policy if exists "Public can read site_content" on public.site_content;
drop policy if exists "Manage site_content" on public.site_content;
drop policy if exists "Visitors can insert guestbook_messages" on public.guestbook_messages;
drop policy if exists "Public can read guestbook_messages" on public.guestbook_messages;
drop policy if exists "Authenticated can update site_content" on public.site_content;
drop policy if exists "Authenticated can manage guestbook" on public.guestbook_messages;

-- A. Public can read the published site content
create policy "Public can read site_content"
  on public.site_content
  for select
  using (true);

-- B. Visitors can submit valid guestbook messages
create policy "Visitors can insert guestbook_messages"
  on public.guestbook_messages
  for insert
  with check (
    length(trim(sender_name)) >= 1 and length(trim(sender_name)) <= 100
    and length(trim(message)) >= 2 and length(trim(message)) <= 2000
  );

-- C. Public can view approved guestbook messages
    and length(trim(message)) > 0
  );

-- D. Public can view approved guestbook messages
create policy "Public can read guestbook_messages"
  on public.guestbook_messages
  for select
  using (status = 'approved' or status is null);

-- ----------------------------------------------------------------------------
-- 4. REALTIME REPLICATION SETUP
-- Enables live instant updates in visitor browsers when a new message is posted
-- ----------------------------------------------------------------------------
begin;
  -- Add table to publication if not already added
  alter publication supabase_realtime add table public.guestbook_messages;
exception
  when others then null;
commit;

-- ----------------------------------------------------------------------------
-- 5. INITIAL SEED DATA (Saroj's Living Content)
-- ----------------------------------------------------------------------------
insert into public.site_content (id, payload, updated_at)
values (
  'main',
  '{
    "profile": {
      "badge": "Kathmandu, Nepal • Personal Space & Living Journal",
      "headline": "Hey, I’m Saroj — a storyteller, acoustic musician, and curious builder sharing my life in chapters.",
      "subheadline": "Welcome to my corner of the internet. This isn’t a stiff corporate resume—it’s a living home for the melodies I sing and play on my guitar, the personal stories and vlogs I capture, my notes on new technology and world news, and the goals I’m chasing.",
      "bio1": "I built sarojparajuli.com.np because social feeds move too fast and traditional portfolios feel too robotic. Life is a blend of late-night guitar strumming, conversations over chiya, wondering where technology is taking us, and writing down stories worth remembering.",
      "bio2": "Whether I’m learning a new acoustic arrangement, filming a candid vlog, reflecting on a personal milestone, or crafting something thoughtful on the web, this space holds the honest version of my journey.",
      "scopedSkills": "Modern Web Architecture, Supabase / PostgreSQL, Cloudflare DNS & Edge, Vercel Workflows, UI/UX Storytelling, Acoustic Audio Production, Statistical Modeling, KoboToolbox & XLSForm."
    },
    "currently": [
      {
        "label": "Playing & Singing",
        "value": "Working on a stripped-back acoustic arrangement & original Nepali-English folk melody"
      },
      {
        "label": "Writing & Vlogging",
        "value": "Documenting quiet evenings in the valley & how everyday life is changing with new tech"
      },
      {
        "label": "Building & Analyzing",
        "value": "Running sarojparajuli.com.np on Supabase + Cloudflare + Vercel with statistical modeling and live CMS"
      }
    ],
    "socials": {
      "github": "https://github.com/sarojparajuli",
      "tiktok": "https://tiktok.com/@sarojparajuli",
      "youtube": "https://youtube.com/@sarojparajuli",
      "facebook": "https://facebook.com/sarojparajuli",
      "linkedin": "https://linkedin.com/in/sarojparajuli",
      "whatsapp": "https://wa.me/9779800000000",
      "instagram": "https://instagram.com/sarojparajuli"
    },
    "goals": [
      {
        "id": "goal-1",
        "title": "Record & Release a 5-Song Acoustic EP",
        "status": "In Progress",
        "category": "Musical Journey",
        "progress": 65,
        "reflection": "Writing and recording 5 intimate, stripped-back original acoustic and vocal tracks from my home setup."
      },
      {
        "id": "goal-2",
        "title": "Publish 24 Honest Stories & Vlogs This Year",
        "status": "In Progress",
        "category": "Storytelling & Vlogs",
        "progress": 50,
        "reflection": "Capturing two meaningful stories, essays, or vlogs every month without worrying about perfection."
      },
      {
        "id": "goal-3",
        "title": "Launch sarojparajuli.com.np with Live Supabase CMS",
        "status": "Achieved",
        "category": "Digital Home",
        "progress": 100,
        "reflection": "Claimed my .com.np domain from register.com.np, wired Cloudflare DNS, and built a personal site that reflects my whole life."
      },
      {
        "id": "goal-4",
        "title": "Acoustic Trek & Travel Documentary in Mustang",
        "status": "Next Horizon",
        "category": "Next Horizon",
        "progress": 20,
        "reflection": "Travelling with a travel guitar and camera to film an unplugged musical travel story in the mountains."
      }
    ],
    "posts": [
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
        "summary": "From 1997 top-down 2D chaos to GTA 6's record-shattering $1.52B day-one sales and 12.4M concurrent players. A complete technical breakdown of GTA 1-6, the 13-year hype arc, day-one review, and how this launch permanently shifts the gaming industry.",
        "excerpt": "From 1997 top-down 2D chaos to GTA 6's record-shattering $1.52B day-one sales and 12.4M concurrent players. A complete technical breakdown of GTA 1-6, the 13-year hype arc, day-one review, and how this launch permanently shifts the gaming industry.",
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
        "content": "The entire internet is shifting towards the ai era. Normal browser browsing is nwo negligle among the youths. Most people are using the ai platforms for doing research rather than doing search job by self. Certainly there will be saturation point in near future, but hey, it'll be ride of technicnological war.\n\n### The Search Paradigm Shift\n\nWhere we once opened 10 Google search result tabs, compared contradictory answers, and read through clutter, agentic workflows now condense complex answers into verified execution steps in seconds.\n\n### Where Statistics Meets Intelligence\n\nIn statistics, predictive models and Bayesian inference rely on probability distributions. Today's generative systems operate on token probabilities across billions of parameters. Understanding the statistical foundations behind these models is becoming the most valuable skill for researchers and analysts in Nepal and globally.",
        "body": "The entire internet is shifting towards the ai era. Normal browser browsing is nwo negligle among the youths. Most people are using the ai platforms for doing research rather than doing search job by self. Certainly there will be saturation point in near future, but hey, it'll be ride of technicnological war.\n\n### The Search Paradigm Shift\n\nWhere we once opened 10 Google search result tabs, compared contradictory answers, and read through clutter, agentic workflows now condense complex answers into verified execution steps in seconds.\n\n### Where Statistics Meets Intelligence\n\nIn statistics, predictive models and Bayesian inference rely on probability distributions. Today's generative systems operate on token probabilities across billions of parameters. Understanding the statistical foundations behind these models is becoming the most valuable skill for researchers and analysts in Nepal and globally.",
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
        "summary": "Every Nepali citizen can claim a lifetime free .com.np domain through Mercantile Communication's official portal. Learn how to verify availability, configure DNS nameservers, and prepare the required citizenship documents and cover letter.",
        "excerpt": "Every Nepali citizen can claim a lifetime free .com.np domain through Mercantile Communication's official portal. Learn how to verify availability, configure DNS nameservers, and prepare the required citizenship documents and cover letter.",
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
    ],
    "musicTracks": [
      {
        "id": "track-1",
        "title": "Chasing Monsoon Clouds (Unplugged)",
        "subtitle": "Key of G Major • Capo 2nd Fret • 92 BPM",
        "type": "Original Vocal & Acoustic",
        "chords": "Em7 — Cadd9 — G — D/F#",
        "lyric": "When the rain taps the tin roof in Kathmandu, every chord remembers home...",
        "notes": [196, 246.94, 293.66, 392, 329.63, 293.66, 246.94, 392],
        "tempo": 420
      },
      {
        "id": "track-2",
        "title": "Midnight Chiya & Six Strings",
        "subtitle": "Key of C Major • Open Tuning • 84 BPM",
        "type": "Fingerstyle & Humming Session",
        "chords": "Am7 — Fmaj7 — C — G6",
        "lyric": "Quiet streets below the window, just the warm spruce wood and a soft melody...",
        "notes": [220, 261.63, 329.63, 440, 349.23, 329.63, 293.66, 261.63],
        "tempo": 480
      },
      {
        "id": "track-3",
        "title": "Hawa Ko Laya (Acoustic Cover & Vocal)",
        "subtitle": "Key of D Major • Warm Strumming • 96 BPM",
        "type": "Nepali Indie Folk Session",
        "chords": "Bm7 — G — D — A",
        "lyric": "Singing the timeless folk melodies that shaped my love for music growing up...",
        "notes": [246.94, 293.66, 369.99, 440, 392, 369.99, 293.66, 246.94],
        "tempo": 390
      }
    ],
    "musicTimeline": [
      {
        "year": "First Chords",
        "title": "Picking up my first acoustic guitar",
        "detail": "Struggling with the F barre chord until my fingertips went numb, then falling in love with the sound of open G and Cadd9."
      },
      {
        "year": "Finding My Voice",
        "title": "Singing while playing",
        "detail": "Moving from quiet bedroom practice to singing full acoustic covers and harmonizing with friends."
      },
      {
        "year": "Home Sessions",
        "title": "Recording originals & unplugged takes",
        "detail": "Capturing honest, one-take vocal and guitar sessions to share here on sarojparajuli.com.np."
      }
    ],
    "portfolio": [
      {
        "id": "port-1",
        "title": "sarojparajuli.com.np — Living Personal Platform & CMS",
        "tag": "Supabase + Cloudflare + Vercel",
        "image": "assets/career-tech.jpg",
        "summary": "A custom-built personal digital home featuring a live Supabase CMS, interactive Web Audio acoustic studio, statistical modeling showcase, and editorial dark/light/contrast themes."
      },
      {
        "id": "port-2",
        "title": "Acoustic Chord & Songbook Companion",
        "tag": "Web Audio & Music Tool",
        "image": "assets/featured-dispatch.jpg",
        "summary": "An interactive songbook organizer for tracking capo positions, chord progressions, vocal keys, and acoustic session notes."
      }
    ],
    "career": [
      {
        "id": "car-1",
        "org": "sarojparajuli.com.np",
        "role": "Independent Creator, Builder & Technologist",
        "period": "Present Chapter",
        "summary": "Building modern web experiences, writing about technology shifts, and blending creative storytelling with clean digital craft."
      },
      {
        "id": "car-2",
        "org": "Tri-Chandra Multiple Campus (TU)",
        "role": "B.Sc. Statistics & Field Survey Research",
        "period": "Academic Chapter (Graduating 2027)",
        "summary": "Specializing in statistical modeling, Operations Research, design of experiments, KoboToolbox/XLSForm field workflows, and PostgreSQL data engineering."
      }
    ]
  }'::jsonb,
  now()
)
on conflict (id) do update set
  payload = excluded.payload,
  updated_at = now();
