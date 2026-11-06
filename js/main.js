/**
 * ============================================================================
 * sarojparajuli.com.np — Master Front-End Application Controller
 * High-Performance, Minimalist, Responsive & Real-Time Supabase Integration
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", async () => {

  // --------------------------------------------------------------------------
  // 1. THEME CONTROLLER (Dark / Light Mode)
  // --------------------------------------------------------------------------
  const THEME_STORAGE_KEY = "saroj_theme_mode";
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const sunIcon = document.getElementById("themeSunIcon");
  const moonIcon = document.getElementById("themeMoonIcon");

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    if (theme === "light") {
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    } else {
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    }
  }

  // Initialize theme
  applyTheme(getPreferredTheme());

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(current === "dark" ? "light" : "dark");
      showToast(current === "dark" ? "Switched to Light Mode" : "Switched to Dark Mode");
    });
  }

  // --------------------------------------------------------------------------
  // 2. FIXED MAIN NAVIGATION (The 6 Core Tabs)
  // --------------------------------------------------------------------------
  const VALID_TABS = ["home", "about", "blogs", "music", "career", "contact"];
  const navButtons = document.querySelectorAll("[data-nav]");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileDrawer = document.getElementById("mobileMenuDrawer");

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileDrawer.classList.toggle("hidden");
    });
  }

  function switchTab(tabId, updateUrl = true) {
    const cleanTab = (tabId || "home").replace(/^section-/, "").toLowerCase();
    const targetTab = VALID_TABS.includes(cleanTab) ? cleanTab : "home";

    // 1. Hide all sections, display target
    document.querySelectorAll(".site-section").forEach(sec => sec.classList.add("hidden"));
    const activeSection = document.getElementById("section-" + targetTab);
    if (activeSection) {
      activeSection.classList.remove("hidden");
    }

    // 2. Update desktop nav pills
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      const btnTab = btn.getAttribute("data-nav") || btn.getAttribute("data-nav-target") || (btn.getAttribute("href") || "").replace(/^#/, "");
      if (btnTab === targetTab) {
        btn.classList.add("active");
        btn.classList.remove("text-slate-300");
      } else {
        btn.classList.remove("active");
        btn.classList.add("text-slate-300");
      }
    });

    // 3. Update mobile drawer buttons
    document.querySelectorAll(".mobile-nav-btn").forEach(btn => {
      const btnTab = btn.getAttribute("data-nav") || btn.getAttribute("data-nav-target") || (btn.getAttribute("href") || "").replace(/^#/, "");
      if (btnTab === targetTab) {
        btn.className = "mobile-nav-btn text-left px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 text-white";
      } else {
        btn.className = "mobile-nav-btn text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800";
      }
    });

    // Close mobile drawer if open
    if (mobileDrawer) {
      mobileDrawer.classList.add("hidden");
    }

    // 4. Update URL hash
    if (updateUrl && window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + targetTab);
    }

    // 5. Smooth scroll to top of view
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 6. If switching to career, ensure chart is rendered
    if (targetTab === "career" && window.SarojAnalytics) {
      setTimeout(() => {
        window.SarojAnalytics.init();
      }, 100);
    }
  }

  // Expose switchTab globally
  window.switchTab = switchTab;

  // Global event delegation for all tabs and anchor links
  document.addEventListener("click", (e) => {
    const navEl = e.target.closest("[data-nav], [data-nav-target], .nav-tab-btn, .mobile-nav-btn, a[href^='#']");
    if (navEl) {
      const rawTarget = navEl.getAttribute("data-nav") || navEl.getAttribute("data-nav-target") || (navEl.getAttribute("href") || "").replace(/^#/, "");
      const cleanTarget = (rawTarget || "").replace(/^section-/, "").toLowerCase();
      if (VALID_TABS.includes(cleanTarget)) {
        e.preventDefault();
        switchTab(cleanTarget, true);
      }
    }
  });

  // Handle Initial URL Hash & Back/Forward buttons
  function handleUrlHash() {
    let target = "";
    const rawHash = (window.location.hash || "").replace(/^#/, "").trim().toLowerCase();
    const rawPath = (window.location.pathname || "").replace(/^\//, "").trim().toLowerCase();

    if (rawHash && VALID_TABS.includes(rawHash)) {
      target = rawHash;
    } else if (rawPath && VALID_TABS.includes(rawPath)) {
      target = rawPath;
    } else {
      target = "home";
    }

    switchTab(target, false);
  }

  handleUrlHash();
  window.addEventListener("hashchange", handleUrlHash);

  // --------------------------------------------------------------------------
  // 3. SUB-TAB CONTROLLER FOR CAREER & PORTFOLIO
  // --------------------------------------------------------------------------
  const subtabButtons = document.querySelectorAll("[data-subtab]");
  const subtabPanes = document.querySelectorAll(".career-subtab-pane");

  function switchSubtab(subtabId) {
    subtabPanes.forEach(pane => pane.classList.add("hidden"));
    const activePane = document.getElementById("subtab-content-" + subtabId);
    if (activePane) {
      activePane.classList.remove("hidden");
    }

    subtabButtons.forEach(btn => {
      if (btn.getAttribute("data-subtab") === subtabId) {
        btn.className = "subtab-pill px-4 py-2 rounded-xl font-semibold active";
      } else {
        btn.className = "subtab-pill px-4 py-2 rounded-xl font-semibold text-slate-300 hover:text-white";
      }
    });

    if (subtabId === "projects" && window.SarojAnalytics) {
      setTimeout(() => {
        window.SarojAnalytics.init();
      }, 100);
    }
  }

  subtabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const subtab = btn.getAttribute("data-subtab");
      switchSubtab(subtab);
    });
  });

  // --------------------------------------------------------------------------
  // 4. SUPABASE DATA PIPELINE & RENDERING
  // --------------------------------------------------------------------------
  let siteContent = null;

  async function loadDataAndRender() {
    if (window.SarojSupabase) {
      try {
        await window.SarojSupabase.init();
        const res = await window.SarojSupabase.fetchContent();
        if (res && res.payload) {
          siteContent = res.payload;
        }
      } catch (e) {
        console.warn("Supabase fetch notice:", e);
      }
    }

    // Fallback if empty or disconnected
    if (!siteContent) {
      siteContent = {
        socials: {
          linkedin: "",
          github: "",
          facebook: "",
          instagram: "",
          whatsapp: "",
          email: "sarojparajuli.personal@outlook.com"
        },
        posts: [],
        musicGallery: [],
        musicTracks: []
      };
    }

    renderSocials(siteContent.socials);
    renderBlogs(siteContent.posts);
    renderMusicGallery(siteContent.musicGallery || siteContent.musicTracks);
    loadGuestbookMessages();
  }

  // --------------------------------------------------------------------------
  // 5. SOCIAL MEDIA HANDLES RENDERER
  // --------------------------------------------------------------------------
  function renderSocials(socials) {
    const s = socials || {};
    const container = document.getElementById("socialLinksGrid");
    if (!container) return;

    const platforms = [
      {
        name: "GitHub",
        key: "github",
        url: s.github || "",
        desc: "Code repositories & data scripts",
        icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`
      },
      {
        name: "Instagram",
        key: "instagram",
        url: s.instagram || "",
        desc: "Photography & acoustic stories",
        icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`
      },
      {
        name: "Facebook",
        key: "facebook",
        url: s.facebook || "",
        desc: "Personal updates & connect",
        icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>`
      },
      {
        name: "YouTube",
        key: "youtube",
        url: s.youtube || "",
        desc: "Acoustic performances & videos",
        icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
      },
      {
        name: "TikTok",
        key: "tiktok",
        url: s.tiktok || "",
        desc: "Short acoustic takes & music",
        icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`
      },
      {
        name: "WhatsApp",
        key: "whatsapp",
        url: s.whatsapp || "https://wa.me/parajulisaroj",
        desc: "Instant chat (@parajulisaroj)",
        icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z"/></svg>`
      },
      {
        name: "LinkedIn",
        key: "linkedin",
        url: s.linkedin || "",
        desc: "Professional updates & network",
        icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>`
      },
      {
        name: "Email",
        key: "email",
        url: "mailto:sarojparajuli.personal@outlook.com",
        desc: "sarojparajuli.personal@outlook.com",
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`
      }
    ];

    container.innerHTML = "";
    platforms.forEach(p => {
      // Don't render empty unconfigured links unless they have a valid URL
      const isConfigured = !!p.url && p.url !== "#";
      if (!isConfigured) return;

      const card = document.createElement("div");
      card.className = "p-5 rounded-2xl glass-card flex items-center justify-between gap-3 group";

      card.innerHTML = `
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-midnight-900 border border-slate-800 text-sky-400 flex items-center justify-center shrink-0 group-hover:border-sky-500/50 transition">
            ${p.icon}
          </div>
          <div>
            <div class="text-sm font-bold text-slate-100">${escapeHTML(p.name)}</div>
            <div class="text-xs text-slate-400 mt-0.5">${escapeHTML(p.desc)}</div>
          </div>
        </div>
        <a href="${escapeHTML(p.url)}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-sky-600/15 hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/30 text-xs font-semibold transition">Open</a>
      `;
      container.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 6. BLOGS SECTION (Structured S.N. List View with Full Article Links)
  // --------------------------------------------------------------------------
  function renderBlogs(posts) {
    const container = document.getElementById("blogsContainer");
    const emptyState = document.getElementById("blogsEmptyState");
    if (!container || !emptyState) return;

    if (!posts || posts.length === 0) {
      container.innerHTML = "";
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    container.innerHTML = "";

    posts.forEach((post, index) => {
      const sn = post.sn || String(index + 1).padStart(2, "0");
      const title = post.title || "Untitled Blog Post";
      const excerpt = post.summary || post.excerpt || post.body || "";
      const category = post.category || "Neuroscience & Ophthalmology";
      const date = post.date || "Nov 6, 2026";
      const readTime = post.read_time || "12 min read";
      const url = post.url || (post.slug ? `blogs/${post.slug}.html` : "blogs/optogenetics-retinitis-pigmentosa.html");

      const card = document.createElement("article");
      card.className = "p-5 sm:p-7 rounded-2xl glass-card border border-slate-800/80 hover:border-sky-500/40 transition-all duration-200 group flex flex-col md:flex-row items-start md:items-center gap-5 shadow-sm";

      card.innerHTML = `
        <!-- Serial Number (S.N.) Badge -->
        <div class="flex-shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono font-extrabold text-base sm:text-lg shadow-sm">
          ${sn}
        </div>

        <!-- Blog Main Content (Title, Meta, Short Description) -->
        <div class="flex-grow space-y-2.5 min-w-0">
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <span class="badge-sky px-2.5 py-0.5 rounded-full uppercase font-mono font-bold text-[10px] tracking-wider">${escapeHTML(category)}</span>
            <span class="text-slate-500 font-mono text-[11px]">•</span>
            <span class="text-slate-400 font-mono text-[11px]">${escapeHTML(date)}</span>
            <span class="text-slate-500 font-mono text-[11px]">•</span>
            <span class="text-slate-400 font-mono text-[11px]">${escapeHTML(readTime)}</span>
          </div>

          <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-slate-100 group-hover:text-sky-400 transition-colors leading-snug">
            <a href="${escapeHTML(url)}" class="focus:outline-none hover:underline" title="Read full blog: ${escapeHTML(title)}">
              ${escapeHTML(title)}
            </a>
          </h2>

          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
            ${escapeHTML(excerpt)}
          </p>
        </div>

        <!-- Action / Read Full Article -->
        <div class="flex-shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t border-slate-800/60 md:border-t-0 flex md:flex-col justify-end">
          <a href="${escapeHTML(url)}" 
             class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs tracking-wide shadow-md transition-all group-hover:shadow-sky-500/20 group-hover:shadow-lg">
            <span>Read Full Blog</span>
            <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </a>
        </div>
      `;

      container.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 7. MUSIC GALLERY (YouTube Embeds & Direct Audio Takes)
  // --------------------------------------------------------------------------
  function extractYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
    return match ? match[1] : null;
  }

  function renderMusicGallery(items) {
    const container = document.getElementById("musicGalleryContainer");
    const emptyState = document.getElementById("musicEmptyState");
    if (!container || !emptyState) return;

    if (!items || items.length === 0) {
      container.innerHTML = "";
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    container.innerHTML = "";

    items.forEach(track => {
      const card = document.createElement("div");
      card.className = "p-6 rounded-2xl glass-card space-y-5 flex flex-col justify-between hover:border-sky-500/40 transition group";

      const ytId = track.youtube_id || extractYouTubeId(track.youtube_url || track.url);

      let mediaHtml = "";
      if (ytId) {
        mediaHtml = `
          <div class="video-responsive-container">
            <iframe 
              src="https://www.youtube.com/embed/${ytId}" 
              title="${escapeHTML(track.title)}" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen 
              loading="lazy">
            </iframe>
          </div>
        `;
      } else if (track.cover_image || track.image) {
        mediaHtml = `
          <div class="aspect-video rounded-xl overflow-hidden bg-midnight-950 border border-slate-800">
            <img src="${escapeHTML(track.cover_image || track.image)}" alt="${escapeHTML(track.title)}" class="w-full h-full object-cover">
          </div>
        `;
      }

      const watchUrl = track.youtube_url || (ytId ? `https://youtube.com/shorts/${ytId}` : null);

      card.innerHTML = `
        <div class="space-y-3.5">
          ${mediaHtml}
          <div class="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
            <span class="badge-sky px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">${escapeHTML(track.type || "Acoustic Take")}</span>
            ${track.chords ? `<span class="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">${escapeHTML(track.chords)}</span>` : ""}
          </div>
          <h3 class="text-lg font-bold text-slate-100 group-hover:text-sky-300 transition">${escapeHTML(track.title)}</h3>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">${escapeHTML(track.description || track.lyric || track.subtitle || "")}</p>
        </div>
        ${
          watchUrl
            ? `
            <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <a href="${escapeHTML(watchUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition">
                <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <span>Watch on YouTube</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            </div>
            `
            : ""
        }
      `;
      container.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 8. LIVE GUESTBOOK (Direct Supabase Connection)
  // --------------------------------------------------------------------------
  const guestbookForm = document.getElementById("contactGuestbookForm");
  const guestbookContainer = document.getElementById("guestbookMessagesContainer");

  async function loadGuestbookMessages() {
    if (!guestbookContainer || !window.SarojSupabase) return;

    try {
      const messages = await window.SarojSupabase.fetchGuestbook();
      if (!messages || messages.length === 0) {
        guestbookContainer.innerHTML = `<div class="text-center py-6 text-xs text-slate-500">No notes yet. Be the first to leave one!</div>`;
        return;
      }

      guestbookContainer.innerHTML = "";
      messages.forEach(msg => {
        const item = document.createElement("div");
        item.className = "p-3.5 rounded-xl bg-midnight-900 border border-slate-800 space-y-1.5";
        
        const dateStr = msg.created_at ? new Date(msg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent";

        item.innerHTML = `
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-100">${escapeHTML(msg.sender_name)}</span>
            <span class="text-[11px] font-mono text-slate-500">${escapeHTML(dateStr)}</span>
          </div>
          ${msg.sender_contact ? `<div class="text-[11px] font-mono text-sky-400">${escapeHTML(msg.sender_contact)}</div>` : ""}
          <p class="text-xs text-slate-300 leading-relaxed">${escapeHTML(msg.message)}</p>
        `;
        guestbookContainer.appendChild(item);
      });
    } catch (err) {
      guestbookContainer.innerHTML = `<div class="text-center py-4 text-xs text-slate-500">Could not refresh guestbook.</div>`;
    }
  }

  if (guestbookForm) {
    guestbookForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const hp = guestbookForm.querySelector('[name="website_hp"]').value;
      if (hp) return; // bot detected

      const name = document.getElementById("senderNameInput").value.trim();
      const contact = document.getElementById("senderContactInput").value.trim();
      const message = document.getElementById("senderMessageInput").value.trim();
      const submitBtn = document.getElementById("guestbookSubmitBtn");

      if (!name || !message) {
        showToast("Please provide your name and a note.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerText = "Publishing...";

      try {
        await window.SarojSupabase.submitGuestbook(name, contact, message);
        showToast("Thank you! Your note is published live.");
        guestbookForm.reset();
        await loadGuestbookMessages();
      } catch (err) {
        showToast("Error saving note: " + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Publish Note to Guestbook";
      }
    });
  }

  // --------------------------------------------------------------------------
  // 9. COPY EMAIL BUTTON
  // --------------------------------------------------------------------------
  const copyEmailBtn = document.getElementById("copyEmailBtn");
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", () => {
      navigator.clipboard.writeText("sarojparajuli.personal@outlook.com").then(() => {
        showToast("Email address copied to clipboard!");
      }).catch(() => {
        showToast("sarojparajuli.personal@outlook.com");
      });
    });
  }

  // --------------------------------------------------------------------------
  // 10. TOAST NOTIFICATION UTILITY
  // --------------------------------------------------------------------------
  function showToast(msg) {
    const toast = document.getElementById("toastNotification");
    const text = document.getElementById("toastMessage");
    if (!toast || !text) return;

    text.textContent = msg;
    toast.classList.remove("translate-y-24", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");

    setTimeout(() => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("translate-y-24", "opacity-0");
    }, 3500);
  }

  function escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Start Pipeline
  loadDataAndRender();
});
