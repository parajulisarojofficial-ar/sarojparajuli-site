/**
 * ============================================================================
 * sarojparajuli.com.np — Master Front-End Application Controller
 * ============================================================================
 */
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Accessibility Engine & Immediate Navigation
  if (window.SarojA11y) {
    window.SarojA11y.init();
  }

  // Bind All Navigation, Tabs & Modals IMMEDIATELY so UI clicks respond instantly
  bindNavigation();
  bindStoryFilters();
  bindCVModal();

  // Check URL hash immediately on initial load (e.g. #music, #stories, #portfolio)
  checkInitialHash();
  window.addEventListener("hashchange", checkInitialHash);

  // 2. Global State
  let currentSiteData = null;
  let activeStoryFilter = "all";

  // 3. Initialize Supabase in background
  try {
    if (window.SarojSupabase) {
      await window.SarojSupabase.init();
    }
  } catch (err) {
    console.warn("Supabase init deferred:", err);
  }

  // 4. Load Content
  await loadAndRenderContent();

  // 5. Initialize Interactive Analytics (Chart.js)
  if (window.SarojAnalytics) {
    try {
      window.SarojAnalytics.init();
    } catch (err) {
      console.warn("Analytics init deferred:", err);
    }
  }

  // 6. Bind Forms & Realtime
  bindGuestbookForm();
  bindRealtimeEvents();

  // --------------------------------------------------------------------------
  // CONTENT RENDER PIPELINE
  // --------------------------------------------------------------------------
  async function loadAndRenderContent() {
    let result = { payload: null };
    if (window.SarojSupabase) {
      result = await window.SarojSupabase.fetchContent();
    }

    if (!result.payload) {
      // Emergency in-memory fallback
      result.payload = {
        profile: {
          badge: "Kathmandu, Nepal • Personal Space & Living Journal",
          headline: "Hey, I’m Saroj — a storyteller, acoustic musician, and curious builder sharing my life in chapters.",
          subheadline: "Welcome to my corner of the internet. This isn’t a stiff corporate resume—it’s a living home for the melodies I sing and play on my guitar, the personal stories and vlogs I capture, my notes on new technology and world news, and the goals I’m chasing."
        },
        currently: [
          { label: "Playing & Singing", value: "Working on a stripped-back acoustic arrangement & original folk melody" },
          { label: "Writing & Vlogging", value: "Documenting quiet evenings in the valley & how everyday life is changing" },
          { label: "Building & Analyzing", value: "Running sarojparajuli.com.np on Supabase + Cloudflare + Vercel" }
        ],
        posts: [],
        musicTracks: [],
        goals: [],
        portfolio: [],
        guestbook: []
      };
    }

    currentSiteData = result.payload;
    renderAll(currentSiteData);
  }

  function renderAll(data) {
    renderProfile(data.profile);
    renderCurrently(data.currently);
    renderSocials(data.socials);
    renderStories(data.posts);
    renderMusicTracks(data.musicTracks);
    renderMusicTimeline(data.musicTimeline);
    renderGoals(data.goals);
    renderPortfolio(data.portfolio);
    loadGuestbook();
  }

  function renderProfile(profile) {
    if (!profile) return;
    const badgeEl = document.getElementById("heroBadgeText");
    const headlineEl = document.getElementById("heroHeadline");
    const subheadEl = document.getElementById("heroSubhead");
    const bio1El = document.getElementById("bioParagraph1");
    const bio2El = document.getElementById("bioParagraph2");
    const skillsEl = document.getElementById("scopedSkillsText");

    if (badgeEl && profile.badge) badgeEl.textContent = profile.badge;
    if (headlineEl && profile.headline) headlineEl.textContent = profile.headline;
    if (subheadEl && profile.subheadline) subheadEl.textContent = profile.subheadline;
    if (bio1El && profile.bio1) bio1El.textContent = profile.bio1;
    if (bio2El && profile.bio2) bio2El.textContent = profile.bio2;
    if (skillsEl && profile.scopedSkills) skillsEl.textContent = profile.scopedSkills;
  }

  function renderCurrently(items) {
    const container = document.getElementById("currentlyList");
    if (!container || !items) return;
    container.innerHTML = "";

    items.forEach(item => {
      const li = document.createElement("li");
      li.className = "p-4 rounded-2xl bg-espresso-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2";
      li.innerHTML = `
        <span class="font-mono text-xs uppercase tracking-wider text-terracotta-400 font-semibold">${escapeHTML(item.label)}</span>
        <span class="text-sm text-parchment-100">${escapeHTML(item.value)}</span>
      `;
      container.appendChild(li);
    });
  }

  function renderSocials(socials) {
    const s = socials || {};
    const platforms = [
      {
        key: "whatsapp",
        label: "WhatsApp",
        url: s.whatsapp ? (s.whatsapp.startsWith("http") ? s.whatsapp : `https://wa.me/${s.whatsapp.replace(/\D/g, '')}`) : "https://wa.me/9779800000000",
        color: "hover:border-emerald-400 hover:text-emerald-400 hover:bg-emerald-500/10",
        badgeColor: "text-emerald-400",
        svg: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z"/></svg>`
      },
      {
        key: "linkedin",
        label: "LinkedIn",
        url: s.linkedin || "https://linkedin.com/in/sarojparajuli",
        color: "hover:border-sky-400 hover:text-sky-400 hover:bg-sky-500/10",
        badgeColor: "text-sky-400",
        svg: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>`
      },
      {
        key: "github",
        label: "GitHub",
        url: s.github || "https://github.com/sarojparajuli",
        color: "hover:border-purple-400 hover:text-purple-400 hover:bg-purple-500/10",
        badgeColor: "text-purple-400",
        svg: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`
      },
      {
        key: "youtube",
        label: "YouTube",
        url: s.youtube || "https://youtube.com/@sarojparajuli",
        color: "hover:border-red-400 hover:text-red-400 hover:bg-red-500/10",
        badgeColor: "text-red-400",
        svg: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
      },
      {
        key: "instagram",
        label: "Instagram",
        url: s.instagram || "https://instagram.com/sarojparajuli",
        color: "hover:border-pink-400 hover:text-pink-400 hover:bg-pink-500/10",
        badgeColor: "text-pink-400",
        svg: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`
      },
      {
        key: "tiktok",
        label: "TikTok",
        url: s.tiktok || "https://tiktok.com/@sarojparajuli",
        color: "hover:border-cyan-400 hover:text-cyan-400 hover:bg-cyan-500/10",
        badgeColor: "text-cyan-400",
        svg: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`
      },
      {
        key: "facebook",
        label: "Facebook",
        url: s.facebook || "https://facebook.com/sarojparajuli",
        color: "hover:border-blue-400 hover:text-blue-400 hover:bg-blue-500/10",
        badgeColor: "text-blue-400",
        svg: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
      },
      {
        key: "email",
        label: "Email",
        url: "mailto:sarojparajuli.personal@outlook.com",
        color: "hover:border-amber-400 hover:text-amber-400 hover:bg-amber-500/10",
        badgeColor: "text-amber-400",
        svg: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`
      }
    ];

    const homeContainer = document.getElementById("homeSocialButtons");
    if (homeContainer) {
      homeContainer.innerHTML = platforms.map(p => `
        <a href="${escapeHTML(p.url)}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-2xl bg-espresso-950 border border-white/10 ${p.color} text-parchment-100 text-xs font-medium transition-all flex items-center gap-2 shadow-sm group">
          <span class="${p.badgeColor} group-hover:scale-110 transition-transform">${p.svg}</span>
          <span>${escapeHTML(p.label)}</span>
          <span class="font-mono text-[10px] text-parchment-200/40 group-hover:translate-x-0.5 transition-transform">↗</span>
        </a>
      `).join("");
    }

    const footerContainer = document.getElementById("footerSocialLinks");
    if (footerContainer) {
      footerContainer.innerHTML = platforms.map(p => `
        <a href="${escapeHTML(p.url)}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-full bg-espresso-900 border border-white/10 ${p.color} text-parchment-200 text-xs transition flex items-center gap-1.5">
          <span class="${p.badgeColor}">${p.svg}</span>
          <span>${escapeHTML(p.label)}</span>
        </a>
      `).join("");
    }
  }

  function renderStories(posts) {
    const grid = document.getElementById("storiesGrid");
    if (!grid || !posts) return;
    grid.innerHTML = "";

    const filtered = (activeStoryFilter === "all")
      ? posts
      : posts.filter(p => (p.category || "").toLowerCase() === activeStoryFilter.toLowerCase());

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-2 text-center py-12 text-sm text-parchment-200/50">No dispatches found in this category.</div>`;
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement("article");
      card.className = "rounded-3xl overflow-hidden bg-espresso-900/90 border border-white/10 hover:border-terracotta-400/50 transition-all flex flex-col justify-between group shadow-xl";

      const imageHtml = p.image
        ? `<div class="aspect-video w-full overflow-hidden bg-espresso-950 relative">
             <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onerror="this.onerror=null; this.parentElement.style.display='none';">
             <span class="absolute top-4 left-4 font-mono text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-espresso-950/85 text-terracotta-400 border border-white/10 backdrop-blur-md">${escapeHTML(p.category || "story")}</span>
           </div>`
        : "";

      card.innerHTML = `
        <div>
          ${imageHtml}
          <div class="p-6 space-y-3">
            <div class="flex items-center justify-between text-xs font-mono text-parchment-200/60">
              <span>${escapeHTML(p.date || "2026")}</span>
              <span>${escapeHTML(p.readTime || "4 min read")}</span>
            </div>
            <h3 class="font-editorial text-2xl font-semibold text-parchment-50 leading-snug group-hover:text-terracotta-400 transition-colors">${escapeHTML(p.title)}</h3>
            <p class="text-sm text-parchment-200/75 leading-relaxed">${escapeHTML(p.excerpt || (p.body ? p.body.slice(0, 160) + "..." : ""))}</p>
          </div>
        </div>
        <div class="p-6 pt-0 border-t border-white/5 flex items-center justify-between text-xs text-parchment-200/60 mt-4">
          <span class="font-mono text-terracotta-400">sarojparajuli.com.np</span>
          <span>${p.claps ? p.claps + " claps" : "Living Dispatch"}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function renderMusicTracks(tracks) {
    const grid = document.getElementById("musicTracksGrid");
    if (!grid || !tracks) return;
    grid.innerHTML = "";

    tracks.forEach((track, idx) => {
      const card = document.createElement("div");
      card.className = "p-6 rounded-3xl bg-espresso-900/90 border border-white/10 flex flex-col justify-between gap-5 hover:border-terracotta-400/40 transition shadow-xl";
      card.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-sage-400 uppercase tracking-wider">${escapeHTML(track.type || "Acoustic Session")}</span>
            <span class="text-parchment-200/50">Track 0${idx + 1}</span>
          </div>
          <h3 class="font-editorial text-2xl sm:text-3xl font-semibold text-parchment-50">${escapeHTML(track.title)}</h3>
          <p class="text-xs font-mono text-terracotta-400">${escapeHTML(track.subtitle || "")}</p>
          ${track.chords ? `<div class="p-3 rounded-xl bg-espresso-950 border border-white/5 font-mono text-xs text-parchment-200/90 flex items-center gap-2"><span class="text-terracotta-400">Chords:</span> ${escapeHTML(track.chords)}</div>` : ""}
          ${track.lyric ? `<p class="italic text-xs text-parchment-200/60 pl-3 border-l-2 border-terracotta-400/50">“${escapeHTML(track.lyric)}”</p>` : ""}
        </div>
        <div class="pt-4 border-t border-white/10 flex items-center justify-between">
          <button type="button" data-track-id="${escapeHTML(track.id)}" class="track-play-btn px-4 py-2.5 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-medium transition flex items-center gap-2 shadow-lg">
            <span>▶</span><span>Acoustic Preview</span>
          </button>
          <span class="font-mono text-[11px] text-parchment-200/40">Web Audio Synth</span>
        </div>
      `;
      grid.appendChild(card);
    });

    // Bind acoustic play buttons
    document.querySelectorAll(".track-play-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const trackId = btn.getAttribute("data-track-id");
        const track = (currentSiteData.musicTracks || []).find(t => t.id === trackId);
        if (!track || !window.SarojAudio) return;

        if (window.SarojAudio.isPlaying && btn.innerHTML.includes("Stop")) {
          window.SarojAudio.stop();
        } else {
          window.SarojAudio.playTrack(track);
        }
      });
    });

    const stopAudioBtn = document.getElementById("stopAudioBtn");
    if (stopAudioBtn) {
      stopAudioBtn.addEventListener("click", () => {
        if (window.SarojAudio) window.SarojAudio.stop();
      });
    }
  }

  function renderMusicTimeline(timeline) {
    const container = document.getElementById("musicTimelineList");
    if (!container || !timeline) return;
    container.innerHTML = "";

    timeline.forEach(item => {
      const div = document.createElement("div");
      div.className = "flex gap-4 items-start";
      div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-terracotta-500/20 border border-terracotta-400/40 flex items-center justify-center shrink-0 text-terracotta-400 text-xs font-mono">✦</div>
        <div class="space-y-1">
          <span class="font-mono text-xs uppercase text-terracotta-400">${escapeHTML(item.year)}</span>
          <h4 class="font-editorial text-lg text-parchment-50 font-semibold">${escapeHTML(item.title)}</h4>
          <p class="text-xs text-parchment-200/70 leading-relaxed">${escapeHTML(item.detail)}</p>
        </div>
      `;
      container.appendChild(div);
    });
  }

  function renderGoals(goals) {
    const grid = document.getElementById("goalsGrid");
    if (!grid || !goals) return;
    grid.innerHTML = "";

    goals.forEach(g => {
      const card = document.createElement("div");
      card.className = "p-6 rounded-3xl bg-espresso-900/90 border border-white/10 space-y-4 hover:border-amber-400/40 transition shadow-xl";
      card.innerHTML = `
        <div class="flex items-center justify-between text-xs font-mono">
          <span class="text-amber-400 uppercase tracking-wider">${escapeHTML(g.category || "Life Goal")}</span>
          <span class="font-semibold px-2.5 py-1 rounded-full bg-espresso-950 text-parchment-50 border border-white/10">${g.progress || 0}%</span>
        </div>
        <h3 class="font-editorial text-2xl font-semibold text-parchment-50 leading-snug">${escapeHTML(g.title)}</h3>
        <p class="text-xs sm:text-sm text-parchment-200/75 leading-relaxed">${escapeHTML(g.reflection || "")}</p>
        <div class="space-y-1.5 pt-2">
          <div class="w-full h-2 rounded-full bg-espresso-950 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-terracotta-500 to-amber-400 rounded-full transition-all duration-1000" style="width: ${Math.min(100, Math.max(0, g.progress || 0))}%"></div>
          </div>
          <div class="flex justify-between text-[11px] font-mono text-parchment-200/40">
            <span>Status: ${escapeHTML(g.status || "Active")}</span>
            <span>Target: 2026/2027</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function renderPortfolio(portfolio) {
    const grid = document.getElementById("portfolioProjectsGrid");
    if (!grid || !portfolio) return;
    grid.innerHTML = "";

    portfolio.forEach(item => {
      const card = document.createElement("div");
      card.className = "p-6 rounded-3xl bg-espresso-900/90 border border-white/10 space-y-3 hover:border-terracotta-400/40 transition shadow-xl";
      card.innerHTML = `
        <div class="font-mono text-xs uppercase text-terracotta-400">${escapeHTML(item.tag || "Engineering & Craft")}</div>
        <h3 class="font-editorial text-2xl font-semibold text-parchment-50">${escapeHTML(item.title)}</h3>
        <p class="text-sm text-parchment-200/75 leading-relaxed">${escapeHTML(item.summary)}</p>
      `;
      grid.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // GUESTBOOK PIPELINE
  // --------------------------------------------------------------------------
  async function loadGuestbook() {
    if (!window.SarojSupabase) return;
    const messages = await window.SarojSupabase.fetchGuestbook();
    renderGuestbookList(messages);
  }

  function renderGuestbookList(messages) {
    const list = document.getElementById("guestbookMessagesList");
    const countBadge = document.getElementById("gbCountBadge");
    if (!list) return;
    list.innerHTML = "";

    if (countBadge) {
      countBadge.textContent = `${messages.length} note${messages.length === 1 ? "" : "s"}`;
    }

    if (!messages || messages.length === 0) {
      list.innerHTML = `<div class="p-6 text-center text-xs text-parchment-200/50">No notes yet. Be the first to leave a message for Saroj!</div>`;
      return;
    }

    messages.forEach(msg => {
      const div = document.createElement("div");
      div.className = "p-5 rounded-2xl bg-espresso-900/90 border border-white/10 space-y-2";
      div.innerHTML = `
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-parchment-50">${escapeHTML(msg.sender_name)}</span>
            ${msg.sender_contact ? `<span class="font-mono text-[11px] text-terracotta-400">${escapeHTML(msg.sender_contact)}</span>` : ""}
          </div>
          <span class="font-mono text-[10px] text-parchment-200/40">${new Date(msg.created_at || Date.now()).toLocaleDateString()}</span>
        </div>
        <p class="text-sm text-parchment-200/80 leading-relaxed">${escapeHTML(msg.message)}</p>
      `;
      list.appendChild(div);
    });
  }

  function bindGuestbookForm() {
    const form = document.getElementById("guestbookSubmitForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("gbInputName");
      const contactInput = document.getElementById("gbInputContact");
      const msgInput = document.getElementById("gbInputMessage");
      const submitBtn = document.getElementById("gbSubmitBtn");

      const name = (nameInput.value || "").trim();
      const contact = (contactInput.value || "").trim();
      const message = (msgInput.value || "").trim();

      if (!name || !message) {
        if (window.SarojA11y) window.SarojA11y.showToast("Please enter both your name and a message.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>⏳</span><span>Sending...</span>`;

      try {
        if (window.SarojSupabase) {
          await window.SarojSupabase.submitGuestbook(name, contact, message);
        }

        nameInput.value = "";
        contactInput.value = "";
        msgInput.value = "";

        if (window.SarojA11y) {
          window.SarojA11y.showToast("Thank you! Your note is published live.");
        }
        await loadGuestbook();
      } catch (err) {
        if (window.SarojA11y) {
          window.SarojA11y.showToast("Note recorded locally: " + err.message);
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>✉</span><span>Publish Note to Guestbook</span>`;
      }
    });
  }

  function bindRealtimeEvents() {
    window.addEventListener("saroj:new_message", (e) => {
      if (window.SarojA11y) {
        window.SarojA11y.showToast("New guestbook note posted!");
      }
      loadGuestbook();
    });
  }

  // --------------------------------------------------------------------------
  // NAVIGATION & TAB SWITCHING
  // --------------------------------------------------------------------------
  function checkInitialHash() {
    const rawHash = (window.location.hash || "").replace(/^#/, "").trim();
    if (!rawHash) return;
    const cleanId = rawHash.replace(/^section-/, "");
    const validSections = ["about", "stories", "music", "portfolio", "goals", "guestbook"];
    if (validSections.includes(cleanId)) {
      switchSection(cleanId, false);
    }
  }

  function bindNavigation() {
    // Desktop navigation pills & any element with data-nav-target
    document.querySelectorAll("[data-nav-target]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute("data-nav-target");
        switchSection(targetId, true);
      });
    });

    // Mobile nav buttons
    document.querySelectorAll("[data-mobile-nav]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute("data-mobile-nav");
        switchSection(targetId, true);
      });
    });

    // CV modal trigger
    const cvBtn = document.getElementById("openCvModalBtn");
    if (cvBtn) {
      cvBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openCVModal();
      });
    }
  }

  function switchSection(sectionId, updateHash = true) {
    if (!sectionId) return;
    const cleanId = sectionId.replace(/^section-/, "");

    // 1. Toggle visibility of sections
    const allSections = document.querySelectorAll(".site-section");
    allSections.forEach(sec => sec.classList.add("hidden"));

    const target = document.getElementById("section-" + cleanId);
    if (target) {
      target.classList.remove("hidden");
    }

    // 2. Smoothly scroll into main content viewport
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      const topOffset = mainContent.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({
        top: Math.max(0, topOffset),
        behavior: "smooth"
      });
    }

    // 3. Update desktop nav pills styling
    document.querySelectorAll("[data-nav-target]").forEach(btn => {
      const btnTarget = (btn.getAttribute("data-nav-target") || "").replace(/^section-/, "");
      if (btnTarget === cleanId) {
        btn.className = "nav-pill px-4 py-2 rounded-full font-medium transition bg-terracotta-500 text-white shadow-md";
      } else {
        btn.className = "nav-pill px-4 py-2 rounded-full font-medium transition text-parchment-200/80 hover:text-white";
      }
    });

    // 4. Update mobile bottom navigation
    document.querySelectorAll("[data-mobile-nav]").forEach(btn => {
      const btnTarget = (btn.getAttribute("data-mobile-nav") || "").replace(/^section-/, "");
      if (btnTarget === cleanId) {
        btn.classList.add("text-terracotta-400");
        btn.classList.remove("text-parchment-200/60");
      } else {
        btn.classList.remove("text-terracotta-400");
        btn.classList.add("text-parchment-200/60");
      }
    });

    // 5. Update browser address bar without jump
    if (updateHash && window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + cleanId);
    }

    // 6. Handle chart resize when navigating to portfolio
    if (cleanId === "portfolio" && window.SarojAnalytics && typeof window.SarojAnalytics.resizeChart === "function") {
      setTimeout(() => window.SarojAnalytics.resizeChart(), 150);
    }

    if (window.SarojA11y) {
      window.SarojA11y.announce("Switched to " + cleanId + " section");
    }
  }

  function bindStoryFilters() {
    document.querySelectorAll("[data-story-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        activeStoryFilter = btn.getAttribute("data-story-filter");
        document.querySelectorAll("[data-story-filter]").forEach(b => {
          if (b === btn) {
            b.className = "filter-btn px-4 py-1.5 rounded-full text-xs font-medium bg-terracotta-500 text-white shadow";
          } else {
            b.className = "filter-btn px-4 py-1.5 rounded-full text-xs font-medium bg-espresso-900 border border-white/10 text-parchment-200";
          }
        });
        if (currentSiteData && currentSiteData.posts) {
          renderStories(currentSiteData.posts);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // CV PREVIEW MODAL
  // --------------------------------------------------------------------------
  function bindCVModal() {
    const modal = document.getElementById("cvPreviewModal");
    const closeBtn = document.getElementById("closeCvModalBtn");
    if (!modal || !closeBtn) return;

    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  }

  function openCVModal() {
    const modal = document.getElementById("cvPreviewModal");
    if (modal) modal.classList.remove("hidden");
  }

  // Helper
  function escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
