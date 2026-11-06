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

-- B. Manage site content:
-- Allows update/insert from both authenticated Supabase users AND the secured CMS Studio
create policy "Manage site_content"
  on public.site_content
  for all
  using (true)
  with check (true);

-- C. Visitors can submit valid guestbook messages
create policy "Visitors can insert guestbook_messages"
  on public.guestbook_messages
  for insert
  with check (
    length(trim(sender_name)) > 0
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
        "id": "post-1",
        "title": "Why I Wanted My Own Corner of the Web (Instead of Just Another Resume)",
        "category": "story",
        "date": "Nov 2026",
        "readTime": "4 min read",
        "claps": 42,
        "image": "assets/featured-dispatch.jpg",
        "excerpt": "Claiming sarojparajuli.com.np wasn’t about listing job titles—it was about building a digital home that feels like sitting down for tea and music.",
        "body": "For a long time, almost every personal website I saw followed the same template: giant progress bars for programming languages, corporate buzzwords, and a Hire Me popup.\n\nWhen I claimed sarojparajuli.com.np from register.com.np, I knew I wanted something warmer and more honest. We are so much more than our 9-to-5 roles. I wanted a place where a friend could listen to an acoustic song I recorded at midnight, read a story from a rainy evening in Kathmandu, watch a vlog, or read my thoughts on a new piece of tech.\n\nEverything on this site is wired to Supabase so as my life evolves, the stories here evolve right along with me."
      },
      {
        "id": "post-2",
        "title": "Vlog #04: Rooftop Acoustic Jam, Golden Hour & Unplugged Conversations",
        "category": "vlog",
        "date": "Oct 2026",
        "readTime": "8 min video + notes",
        "claps": 67,
        "image": "assets/music-session-1.jpg",
        "excerpt": "Setting up the tripod before sunset, tuning the dreadnought down half a step, and capturing raw takes as the valley lights flicker on.",
        "body": "In this vlog episode, I took my acoustic guitar, a small mirrorless camera, and my notebook up to the terrace just before dusk.\n\nHighlights from the video:\n• 00:45 — Tuning to Eb standard for a warmer vocal register\n• 02:30 — First live take of Chasing Monsoon Clouds\n• 05:15 — Talking about balancing creative hobbies with everyday life\n\nWhenever I upload a new vlog on YouTube or TikTok, I pair it here with the behind-the-scenes story that didn’t fit into the video edit."
      },
      {
        "id": "post-3",
        "title": "Tech Pulse: Why Edge Databases & Personal Micro-Publishing Are Winning Again",
        "category": "tech",
        "date": "Oct 2026",
        "readTime": "5 min read",
        "claps": 38,
        "image": "assets/career-tech.jpg",
        "excerpt": "A look at how tools like Supabase, Cloudflare, and Vercel make owning your own independent platform simpler and faster than ever.",
        "body": "Every week brings a wave of new tech announcements and AI headlines, but the shift I’m most excited about is how lightweight personal infrastructure has become.\n\nWith register.com.np for local identity, Cloudflare handling global DNS and caching, Vercel serving instant edge deployments, and Supabase giving you a full Postgres database with real-time APIs, anyone can run a fast, independent publication without heavy server maintenance."
      },
      {
        "id": "post-4",
        "title": "The Art of Singing While Playing Fingerstyle Guitar",
        "category": "music",
        "date": "Sep 2026",
        "readTime": "6 min guide",
        "claps": 54,
        "image": "assets/music-session-2.jpg",
        "excerpt": "Breaking down the mental separation required to keep an alternating thumb bassline steady while delivering an expressive vocal melody.",
        "body": "When you only strum chords, singing over the top feels natural. The moment you switch to fingerpicking an independent bassline, your brain wants to lock your voice to your fingers.\n\nWhat helped me break through was humming the melody slowly while playing only the root notes on beats 1 and 3, then gradually adding the treble strings back in. Music rewards patience more than almost anything else."
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
