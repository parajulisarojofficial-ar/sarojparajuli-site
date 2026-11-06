/**
 * ============================================================================
 * sarojparajuli.com.np — Secure CMS Studio Controller (Admin Panel)
 * ============================================================================
 */
document.addEventListener("DOMContentLoaded", async () => {
  const cfg = window.SAROJ_CONFIG;
  let adminData = null;
  let currentAdminKey = sessionStorage.getItem(cfg.STORAGE_KEY_ADMIN_TOKEN) || "";

  // 1. Check Authentication
  if (currentAdminKey) {
    unlockAdmin();
  } else {
    showAuthPrompt();
  }

  // Bind Auth Form
  const authForm = document.getElementById("adminLoginForm");
  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pass = document.getElementById("adminPassInput").value.trim();
      if (pass === cfg.ADMIN_DEFAULT_KEY || pass.length >= 6) {
        currentAdminKey = pass;
        sessionStorage.setItem(cfg.STORAGE_KEY_ADMIN_TOKEN, pass);
        unlockAdmin();
      } else {
        showToast("Incorrect Admin Passkey. Please check your credentials.");
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("adminLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(cfg.STORAGE_KEY_ADMIN_TOKEN);
      currentAdminKey = "";
      location.reload();
    });
  }

  // --------------------------------------------------------------------------
  // AUTH UNLOCK PIPELINE
  // --------------------------------------------------------------------------
  async function unlockAdmin() {
    const authBarrier = document.getElementById("authBarrier");
    const adminDashboard = document.getElementById("adminDashboard");

    if (authBarrier) authBarrier.classList.add("hidden");
    if (adminDashboard) adminDashboard.classList.remove("hidden");

    // Initialize Supabase
    if (window.SarojSupabase) {
      await window.SarojSupabase.init();
    }

    // Load CMS Data
    await loadCMSData();

    // Bind subtabs & forms
    bindAdminTabs();
    bindProfileForm();
    bindStoryForms();
    bindMusicForms();
    bindGoalForms();
    bindPortfolioForms();
    bindGuestbookModeration();
    bindSupabaseSyncControls();
  }

  function showAuthPrompt() {
    const authBarrier = document.getElementById("authBarrier");
    const adminDashboard = document.getElementById("adminDashboard");
    if (authBarrier) authBarrier.classList.remove("hidden");
    if (adminDashboard) adminDashboard.classList.add("hidden");
  }

  // --------------------------------------------------------------------------
  // DATA MANAGEMENT
  // --------------------------------------------------------------------------
  async function loadCMSData() {
    let result = { payload: null };
    if (window.SarojSupabase) {
      result = await window.SarojSupabase.fetchContent();
    }
    adminData = result.payload || {};
    populateAllFields();
  }

  function populateAllFields() {
    if (!adminData) return;

    // Profile
    const p = adminData.profile || {};
    setVal("editProfileBadge", p.badge || "");
    setVal("editProfileHeadline", p.headline || "");
    setVal("editProfileSubhead", p.subheadline || "");
    setVal("editProfileBio1", p.bio1 || "");
    setVal("editProfileBio2", p.bio2 || "");
    setVal("editProfileSkills", p.scopedSkills || "");

    // Socials
    const s = adminData.socials || {};
    setVal("editSocialWhatsApp", s.whatsapp || "");
    setVal("editSocialLinkedIn", s.linkedin || "");
    setVal("editSocialGitHub", s.github || "");
    setVal("editSocialYouTube", s.youtube || "");
    setVal("editSocialInstagram", s.instagram || "");
    setVal("editSocialTikTok", s.tiktok || "");
    setVal("editSocialFacebook", s.facebook || "");

    // Render lists in admin
    renderAdminStories();
    renderAdminMusic();
    renderAdminGoals();
    renderAdminPortfolio();
    loadAdminGuestbook();
  }

  // --------------------------------------------------------------------------
  // TAB NAVIGATION
  // --------------------------------------------------------------------------
  function bindAdminTabs() {
    document.querySelectorAll("[data-admin-tab]").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-admin-tab");
        document.querySelectorAll(".admin-tab-panel").forEach(p => p.classList.add("hidden"));
        const target = document.getElementById("tabPanel-" + targetId);
        if (target) target.classList.remove("hidden");

        document.querySelectorAll("[data-admin-tab]").forEach(b => {
          if (b === btn) {
            b.className = "px-4 py-2 rounded-xl text-xs font-semibold bg-terracotta-500 text-white shadow";
          } else {
            b.className = "px-4 py-2 rounded-xl text-xs font-medium text-parchment-200/70 hover:text-white";
          }
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // PROFILE FORM
  // --------------------------------------------------------------------------
  function bindProfileForm() {
    const btn = document.getElementById("saveProfileBtn");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      if (!adminData.profile) adminData.profile = {};
      adminData.profile.badge = getVal("editProfileBadge");
      adminData.profile.headline = getVal("editProfileHeadline");
      adminData.profile.subheadline = getVal("editProfileSubhead");
      adminData.profile.bio1 = getVal("editProfileBio1");
      adminData.profile.bio2 = getVal("editProfileBio2");
      adminData.profile.scopedSkills = getVal("editProfileSkills");

      if (!adminData.socials) adminData.socials = {};
      adminData.socials.whatsapp = getVal("editSocialWhatsApp");
      adminData.socials.linkedin = getVal("editSocialLinkedIn");
      adminData.socials.github = getVal("editSocialGitHub");
      adminData.socials.youtube = getVal("editSocialYouTube");
      adminData.socials.instagram = getVal("editSocialInstagram");
      adminData.socials.tiktok = getVal("editSocialTikTok");
      adminData.socials.facebook = getVal("editSocialFacebook");

      await syncChanges("Profile details and social links updated successfully!");
    });
  }

  // --------------------------------------------------------------------------
  // STORIES CRUD
  // --------------------------------------------------------------------------
  function renderAdminStories() {
    const list = document.getElementById("adminStoriesList");
    if (!list) return;
    list.innerHTML = "";
    const posts = adminData.posts || [];

    posts.forEach((post, index) => {
      const item = document.createElement("div");
      item.className = "p-4 rounded-2xl bg-espresso-950 border border-white/10 flex items-center justify-between gap-4";
      item.innerHTML = `
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-mono text-[10px] uppercase text-terracotta-400 font-bold px-2 py-0.5 rounded bg-espresso-900 border border-white/5">${escapeHTML(post.category)}</span>
            <span class="text-xs text-parchment-200/50">${escapeHTML(post.date || "")}</span>
          </div>
          <h4 class="font-editorial text-lg text-parchment-50 font-semibold">${escapeHTML(post.title)}</h4>
        </div>
        <button type="button" data-del-story="${index}" class="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800 border border-red-500/30 text-red-300 text-xs transition">Delete</button>
      `;
      list.appendChild(item);
    });

    list.querySelectorAll("[data-del-story]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const idx = parseInt(btn.getAttribute("data-del-story"), 10);
        if (confirm("Are you sure you want to delete this story?")) {
          adminData.posts.splice(idx, 1);
          renderAdminStories();
          await syncChanges("Story deleted.");
        }
      });
    });
  }

  function bindStoryForms() {
    const addBtn = document.getElementById("addStoryBtn");
    if (!addBtn) return;

    addBtn.addEventListener("click", async () => {
      const title = getVal("newStoryTitle");
      const category = getVal("newStoryCategory");
      const readTime = getVal("newStoryReadTime") || "4 min read";
      const excerpt = getVal("newStoryExcerpt");
      const body = getVal("newStoryBody");

      if (!title || !body) {
        showToast("Please provide both a story title and body text.");
        return;
      }

      const newPost = {
        id: "post-" + Date.now(),
        title,
        category,
        date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        readTime,
        claps: 0,
        image: "assets/featured-dispatch.jpg",
        excerpt: excerpt || body.slice(0, 150) + "...",
        body
      };

      if (!adminData.posts) adminData.posts = [];
      adminData.posts.unshift(newPost);

      // Reset fields
      setVal("newStoryTitle", "");
      setVal("newStoryExcerpt", "");
      setVal("newStoryBody", "");

      renderAdminStories();
      await syncChanges("New dispatch added successfully!");
    });
  }

  // --------------------------------------------------------------------------
  // MUSIC CRUD
  // --------------------------------------------------------------------------
  function renderAdminMusic() {
    const list = document.getElementById("adminMusicList");
    if (!list) return;
    list.innerHTML = "";
    const tracks = adminData.musicTracks || [];

    tracks.forEach((track, index) => {
      const item = document.createElement("div");
      item.className = "p-4 rounded-2xl bg-espresso-950 border border-white/10 flex items-center justify-between gap-4";
      item.innerHTML = `
        <div class="space-y-1">
          <span class="font-mono text-xs text-sage-400">${escapeHTML(track.type || "Acoustic")}</span>
          <h4 class="font-editorial text-lg text-parchment-50 font-semibold">${escapeHTML(track.title)}</h4>
          <p class="font-mono text-xs text-parchment-200/60">${escapeHTML(track.chords || "")}</p>
        </div>
        <button type="button" data-del-music="${index}" class="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800 border border-red-500/30 text-red-300 text-xs transition">Delete</button>
      `;
      list.appendChild(item);
    });

    list.querySelectorAll("[data-del-music]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const idx = parseInt(btn.getAttribute("data-del-music"), 10);
        if (confirm("Delete this musical track?")) {
          adminData.musicTracks.splice(idx, 1);
          renderAdminMusic();
          await syncChanges("Track removed.");
        }
      });
    });
  }

  function bindMusicForms() {
    const addBtn = document.getElementById("addMusicBtn");
    if (!addBtn) return;

    addBtn.addEventListener("click", async () => {
      const title = getVal("newMusicTitle");
      const subtitle = getVal("newMusicSubtitle") || "Key of G Major • Capo 2nd Fret";
      const type = getVal("newMusicType") || "Original Vocal & Acoustic";
      const chords = getVal("newMusicChords") || "C — G — Am — F";
      const lyric = getVal("newMusicLyric") || "";

      if (!title) {
        showToast("Please enter a track title.");
        return;
      }

      const newTrack = {
        id: "track-" + Date.now(),
        title,
        subtitle,
        type,
        chords,
        lyric,
        notes: [196, 246.94, 293.66, 392, 329.63, 293.66, 246.94, 392],
        tempo: 420
      };

      if (!adminData.musicTracks) adminData.musicTracks = [];
      adminData.musicTracks.push(newTrack);

      setVal("newMusicTitle", "");
      setVal("newMusicLyric", "");

      renderAdminMusic();
      await syncChanges("New musical track added!");
    });
  }

  // --------------------------------------------------------------------------
  // GOALS CRUD
  // --------------------------------------------------------------------------
  function renderAdminGoals() {
    const list = document.getElementById("adminGoalsList");
    if (!list) return;
    list.innerHTML = "";
    const goals = adminData.goals || [];

    goals.forEach((goal, index) => {
      const item = document.createElement("div");
      item.className = "p-4 rounded-2xl bg-espresso-950 border border-white/10 flex items-center justify-between gap-4";
      item.innerHTML = `
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs text-amber-400 font-semibold">${goal.progress}%</span>
            <span class="text-xs text-parchment-200/50">${escapeHTML(goal.category || "")}</span>
          </div>
          <h4 class="font-editorial text-lg text-parchment-50 font-semibold">${escapeHTML(goal.title)}</h4>
        </div>
        <button type="button" data-del-goal="${index}" class="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800 border border-red-500/30 text-red-300 text-xs transition">Delete</button>
      `;
      list.appendChild(item);
    });

    list.querySelectorAll("[data-del-goal]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const idx = parseInt(btn.getAttribute("data-del-goal"), 10);
        if (confirm("Delete this life goal?")) {
          adminData.goals.splice(idx, 1);
          renderAdminGoals();
          await syncChanges("Goal removed.");
        }
      });
    });
  }

  function bindGoalForms() {
    const addBtn = document.getElementById("addGoalBtn");
    if (!addBtn) return;

    addBtn.addEventListener("click", async () => {
      const title = getVal("newGoalTitle");
      const category = getVal("newGoalCategory") || "Personal Milestone";
      const progress = Math.min(100, Math.max(0, parseInt(getVal("newGoalProgress") || "50", 10)));
      const reflection = getVal("newGoalReflection") || "";

      if (!title) {
        showToast("Please enter a goal title.");
        return;
      }

      const newGoal = {
        id: "goal-" + Date.now(),
        title,
        category,
        progress,
        status: progress === 100 ? "Achieved" : "In Progress",
        reflection
      };

      if (!adminData.goals) adminData.goals = [];
      adminData.goals.push(newGoal);

      setVal("newGoalTitle", "");
      setVal("newGoalReflection", "");

      renderAdminGoals();
      await syncChanges("New life goal tracked!");
    });
  }

  // --------------------------------------------------------------------------
  // PORTFOLIO CRUD
  // --------------------------------------------------------------------------
  function renderAdminPortfolio() {
    const list = document.getElementById("adminPortfolioList");
    if (!list) return;
    list.innerHTML = "";
    const items = adminData.portfolio || [];

    items.forEach((p, index) => {
      const item = document.createElement("div");
      item.className = "p-4 rounded-2xl bg-espresso-950 border border-white/10 flex items-center justify-between gap-4";
      item.innerHTML = `
        <div class="space-y-1">
          <span class="font-mono text-xs text-terracotta-400">${escapeHTML(p.tag || "")}</span>
          <h4 class="font-editorial text-lg text-parchment-50 font-semibold">${escapeHTML(p.title)}</h4>
        </div>
        <button type="button" data-del-port="${index}" class="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800 border border-red-500/30 text-red-300 text-xs transition">Delete</button>
      `;
      list.appendChild(item);
    });

    list.querySelectorAll("[data-del-port]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const idx = parseInt(btn.getAttribute("data-del-port"), 10);
        if (confirm("Delete this portfolio project?")) {
          adminData.portfolio.splice(idx, 1);
          renderAdminPortfolio();
          await syncChanges("Project removed.");
        }
      });
    });
  }

  function bindPortfolioForms() {
    const addBtn = document.getElementById("addPortfolioBtn");
    if (!addBtn) return;

    addBtn.addEventListener("click", async () => {
      const title = getVal("newPortTitle");
      const tag = getVal("newPortTag") || "Full-Stack & Data";
      const summary = getVal("newPortSummary");

      if (!title || !summary) {
        showToast("Please provide both title and summary.");
        return;
      }

      const newPort = {
        id: "port-" + Date.now(),
        title,
        tag,
        image: "assets/career-tech.jpg",
        summary
      };

      if (!adminData.portfolio) adminData.portfolio = [];
      adminData.portfolio.push(newPort);

      setVal("newPortTitle", "");
      setVal("newPortSummary", "");

      renderAdminPortfolio();
      await syncChanges("Portfolio entry added!");
    });
  }

  // --------------------------------------------------------------------------
  // GUESTBOOK MODERATION
  // --------------------------------------------------------------------------
  async function loadAdminGuestbook() {
    const container = document.getElementById("adminGuestbookTableBody");
    if (!container || !window.SarojSupabase) return;
    container.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-xs text-parchment-200/50">Loading live messages...</td></tr>`;

    const messages = await window.SarojSupabase.fetchGuestbook();
    container.innerHTML = "";

    if (!messages.length) {
      container.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-xs text-parchment-200/50">No guestbook messages found.</td></tr>`;
      return;
    }

    messages.forEach(msg => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-white/5 hover:bg-white/[0.02]";
      tr.innerHTML = `
        <td class="p-3 font-semibold text-parchment-50">${escapeHTML(msg.sender_name)}</td>
        <td class="p-3 font-mono text-xs text-terracotta-400">${escapeHTML(msg.sender_contact || "—")}</td>
        <td class="p-3 text-sm text-parchment-200/80">${escapeHTML(msg.message)}</td>
        <td class="p-3 text-right">
          <button type="button" data-del-gb="${escapeHTML(msg.id)}" class="px-2.5 py-1 rounded bg-red-900/40 hover:bg-red-800 text-red-300 text-xs transition">Delete</button>
        </td>
      `;
      container.appendChild(tr);
    });

    container.querySelectorAll("[data-del-gb]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-del-gb");
        if (confirm("Delete this message permanently from Supabase?")) {
          await window.SarojSupabase.deleteGuestbookMessage(id, currentAdminKey);
          showToast("Message deleted from Supabase.");
          loadAdminGuestbook();
        }
      });
    });
  }

  function bindGuestbookModeration() {
    const refreshBtn = document.getElementById("refreshGuestbookBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => loadAdminGuestbook());
    }
  }

  // --------------------------------------------------------------------------
  // SUPABASE CLOUD SYNC CONTROLS
  // --------------------------------------------------------------------------
  function bindSupabaseSyncControls() {
    const pushBtn = document.getElementById("manualPushSbBtn");
    const pullBtn = document.getElementById("manualPullSbBtn");
    const copySqlBtn = document.getElementById("copySqlSchemaBtn");

    if (pushBtn) {
      pushBtn.addEventListener("click", async () => {
        pushBtn.disabled = true;
        pushBtn.textContent = "Pushing to Supabase...";
        await syncChanges("Manual Push Completed: All site content synced live to Supabase!");
        pushBtn.disabled = false;
        pushBtn.textContent = "Push Local Data → Supabase";
      });
    }

    if (pullBtn) {
      pullBtn.addEventListener("click", async () => {
        pullBtn.disabled = true;
        pullBtn.textContent = "Pulling from Supabase...";
        await loadCMSData();
        showToast("Fetched latest live content from Supabase!");
        pullBtn.disabled = false;
        pullBtn.textContent = "Pull Live Data ← Supabase";
      });
    }

    if (copySqlBtn) {
      copySqlBtn.addEventListener("click", () => {
        const block = document.getElementById("adminSqlBlock");
        if (!block) return;
        navigator.clipboard.writeText(block.textContent).then(() => {
          showToast("SQL Schema copied to clipboard!");
        });
      });
    }
  }

  async function syncChanges(successMsg) {
    if (window.SarojSupabase) {
      const res = await window.SarojSupabase.saveContent(adminData, currentAdminKey);
      showToast(res.message || successMsg);
    } else {
      showToast("Saved locally (Supabase not connected)");
    }
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------
  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  function showToast(msg) {
    if (window.SarojA11y) {
      window.SarojA11y.showToast(msg);
    } else {
      alert(msg);
    }
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
});
