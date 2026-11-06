# sarojparajuli.com.np — Personal Platform, Living Journal & Supabase CMS

**Author:** Saroj Parajuli  
**Major:** B.Sc. Statistics, Tri-Chandra Multiple Campus (Tribhuvan University), Kathmandu, Nepal  
**Domain:** [sarojparajuli.com.np](https://sarojparajuli.com.np)  
**Email:** sarojparajuli.personal@outlook.com  

---

## 🌟 Executive Overview
`sarojparajuli.com.np` is a modern, high-performance, and fully secured full-stack web platform uniting:
1. **The Statistician & M&E Specialist:** Statistical modeling showcases, KoboToolbox / XLSForm survey designs, PostgreSQL schemas, and interactive Chart.js analytics on real dataset (`iphone_sales_dataset.csv`).
2. **The Storyteller & Acoustic Musician:** A living publication for essays and vlogs, paired with an interactive in-browser **Web Audio API Acoustic Guitar Synthesizer** with harmonic overtones and soundboard visualizer.
3. **Universal Accessibility (Retinitis Pigmentosa):** Dedicated high-contrast accessible mode, text resizing, screen-reader live announcements, and spoken audio introduction powered by the Web Speech API.
4. **Production Supabase Integration & Secure CMS Studio:** Real-time PostgreSQL synchronization for content and visitor guestbook, accompanied by a password-protected administrative studio (`/admin.html`).

---

## 🏗️ Architecture & Project Structure

```text
d:\New Site\
├── assets\                      # Production optimized media & datasets
│   ├── saroj_profile.jpg        # High-res profile photograph
│   ├── Saroj_Parajuli_CV.pdf    # Accessible resume for viewing & download
│   ├── iphone_sales_dataset.csv # Empirical dataset for Chart.js analytics
│   ├── hero-life.jpg            # Morning chords & valley view photograph
│   ├── featured-dispatch.jpg    # Editorial visual banner
│   ├── music-session-1.jpg      # Rooftop acoustic session visual
│   ├── music-session-2.jpg      # Fingerstyle study visual
│   ├── goals-adventure.jpg      # Trekking & adventure visual
│   └── career-tech.jpg          # Technology workspace visual
├── css\
│   └── main.css                 # Custom design system (Dark, Light, High-Contrast RP)
├── js\
│   ├── config.js                # Central configuration & Supabase credentials
│   ├── supabase-client.js       # Real-time Supabase engine & cloud sync
│   ├── audio-player.js          # Web Audio API dual-oscillator acoustic guitar synth
│   ├── analytics-chart.js       # Chart.js exploratory data analysis engine
│   ├── accessibility.js         # TTS Audio Intro, font sizing, and theme switcher
│   ├── main.js                  # Master public front-end controller
│   └── admin.js                 # Protected CMS Studio CRUD controller
├── api\                         # Vercel / Serverless Backend Endpoints
│   ├── health.js                # System health check & Supabase ping
│   ├── content.js               # Content fetch & admin-authenticated upsert
│   └── contact.js               # Validated guestbook submission with honeypot
├── data\
│   └── default_content.json     # Fast local offline fallback cache
├── supabase\
│   └── schema_and_seed.sql      # Hardened PostgreSQL schema, RLS & seed data
├── index.html                   # Master responsive public website
├── admin.html                   # Dedicated secure CMS Studio
├── server.js                    # Full production Node.js / Express backend server
├── package.json                 # Node dependencies & start scripts
├── vercel.json                  # Clean URLs & HTTP security headers (CSP, HSTS)
├── .env                         # Local environment variables
└── README.md                    # Project documentation
```

---

## 🔐 Security & Database Hardening (Supabase)

### 1. Database Schema
The database runs on Supabase PostgreSQL project:
- **Project URL:** `https://qibqrnkvslgvgcowgabp.supabase.co`
- **Tables:**
  - `public.site_content`: Stores your live profile, stories, music tracks, goals, and portfolio in row `'main'`.
  - `public.guestbook_messages`: Stores visitor notes with UUIDs, status, and timestamps.

### 2. Hardened Row Level Security (RLS) & Constraints
In `supabase/schema_and_seed.sql`:
- **Validation Constraints:** Added `chk_sender_name` (1-100 characters), `chk_message` (2-2000 characters), and `chk_status` to prevent database pollution.
- **Index:** Created `idx_guestbook_created_at` for high-performance chronological sorting.
- **Anti-Spam Honeypot:** The submission form includes a hidden honeypot field (`website_hp`) that immediately rejects automated spam bots.
- **Rate Limiting:** The Express backend includes `express-rate-limit` protecting against brute force requests.

### 3. How to Update / Run the SQL in Supabase
1. Open your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your project: `qibqrnkvslgvgcowgabp`
3. Click **SQL Editor** on the left menu.
4. Open `supabase/schema_and_seed.sql`, paste its content, and click **Run** (green button).

---

## ⚙️ Secure CMS Studio (`admin.html`)

A dedicated administrative interface is provided at `admin.html` (or route `/admin`):
- **Access Protection:** Requires the Master Passkey (`saroj_cms_pass_2026`, configurable in `.env` and `js/config.js`).
- **Capabilities:**
  - **Profile & Bio:** Edit your badge, headline, subheadline, living journal paragraphs, and skills.
  - **Stories & Blogs:** Create new dispatches, travel vlogs, or essays, and delete old posts.
  - **Acoustic Music:** Add new songs, customize chord progressions, and adjust tempo.
  - **Goals Tracker:** Add life milestones and update completion percentages (0-100%).
  - **Portfolio:** Add and edit data analytics, M&E, or web projects.
  - **Guestbook Moderation:** Review all visitor messages and permanently delete spam notes with one click.
  - **One-Click Cloud Sync:** Push your browser data directly to Supabase with the **Push Local Data → Supabase** button.

---

## 🚀 Running Locally

```bash
# 1. Navigate to the project directory
cd "d:\New Site"

# 2. Start the production backend server
npm start

# For auto-reloading during development:
npm run dev
```

Visit:
- **Public Site:** [http://localhost:3000](http://localhost:3000)
- **CMS Studio:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Health API:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🌐 Deploying to Vercel & Cloudflare DNS

### 1. Deploying on Vercel
1. Push this folder to your GitHub repository or run `vercel` via CLI:
   ```bash
   npx vercel
   ```
2. Under **Project Settings -> Domains**, add `sarojparajuli.com.np`.

### 2. Cloudflare DNS & SSL Settings
1. In Cloudflare DNS for `sarojparajuli.com.np`:
   - `A` Record: `@` -> `76.76.21.21` (Proxied)
   - `CNAME` Record: `www` -> `cname.vercel-dns.com` (Proxied)
2. In Cloudflare **SSL/TLS**, set encryption mode to **Full (Strict)**.

### 3. register.com.np Nameservers
1. Log in to [https://register.com.np](https://register.com.np)
2. Update your domain's Primary and Secondary Nameservers to your two assigned Cloudflare nameservers.
