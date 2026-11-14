/**
 * ============================================================================
 * sarojparajuli.com.np — Supabase Client & Cloud Sync Engine
 * ============================================================================
 */
(function() {
  const cfg = window.SAROJ_CONFIG;
  let sbClient = null;
  let realtimeChannel = null;

  window.SarojSupabase = {
    client: null,
    isConnected: false,

    /**
     * Initialize Supabase client
     */
    init: async function() {
      if (!window.supabase) {
        console.warn("Supabase SDK not loaded; using local fallback.");
        this.updateStatusBadge(false, "Local Offline");
        return null;
      }

      // Check for user-saved custom config or use default
      let customConfig = null;
      try {
        customConfig = JSON.parse(localStorage.getItem(cfg.STORAGE_KEY_SB_CONFIG) || "null");
      } catch (e) {}

      const activeUrl = (customConfig && customConfig.url) ? customConfig.url : cfg.SUPABASE_URL;
      const activeKey = (customConfig && customConfig.key) ? customConfig.key : cfg.SUPABASE_KEY;

      try {
        sbClient = window.supabase.createClient(activeUrl.trim(), activeKey.trim());
        this.client = sbClient;

        // Test connectivity
        const { error } = await sbClient.from("site_content").select("id").limit(1);
        if (!error) {
          this.isConnected = true;
          this.updateStatusBadge(true, "Live Connected");
          this.subscribeToGuestbook();
        } else {
          console.warn("Supabase check error:", error.message);
          this.updateStatusBadge(false, "RLS Restricted / Check SQL");
        }
      } catch (err) {
        console.warn("Could not connect to Supabase:", err.message);
        this.updateStatusBadge(false, "Local Mode");
      }

      return sbClient;
    },

    /**
     * Update UI status badge if present on page
     */
    updateStatusBadge: function(isLive, labelText) {
      const dot = document.getElementById("sbStatusDot") || document.getElementById("sbLiveIndicator");
      const label = document.getElementById("sbStatusText");
      if (dot) {
        dot.className = isLive
          ? "w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
          : "w-2 h-2 rounded-full bg-amber-400";
      }
      if (label) {
        label.textContent = labelText;
      }
    },

    /**
     * Fetch site content from Supabase, or fallback to local
     */
    fetchContent: async function() {
      let payload = null;

      // 1. Query Supabase
      if (sbClient) {
        try {
          const { data, error } = await sbClient
            .from("site_content")
            .select("payload")
            .eq("id", "main")
            .maybeSingle();

          if (!error && data && data.payload) {
            payload = data.payload;
          }
        } catch (e) {
          console.warn("Error querying Supabase site_content:", e);
        }

        // Check dedicated 'homepage_content' table
        try {
          const { data: homeData, error: homeErr } = await sbClient
            .from("homepage_content")
            .select("*")
            .eq("id", "main")
            .maybeSingle();

          if (!homeErr && homeData) {
            if (!payload) payload = {};
            payload.homepage = homeData;
          }
        } catch (e) {
          console.warn("Error querying Supabase homepage_content:", e);
        }

        // Check dedicated 'blogs' table
        try {
          const { data: blogsData, error: blogsErr } = await sbClient
            .from("blogs")
            .select("*")
            .eq("is_published", true)
            .order("created_at", { ascending: false });

          if (!blogsErr && blogsData && blogsData.length > 0) {
            if (!payload) payload = {};
            const knownStaticSlugs = [
              "optogenetics-retinitis-pigmentosa",
              "how-to-claim-free-com-np-domain-nepal"
            ];
            payload.posts = blogsData.map((b, idx) => {
              // preferred_section: 1 = Tech Updates, 0 = Personal Blog
              const prefSec = typeof b.preferred_section === "number" ? b.preferred_section : (b.blog_type === "personal" || (b.category && b.category.toLowerCase() === "personal") ? 0 : 1);
              const isPersonal = prefSec === 0;
              const hasStaticHtml = b.slug && knownStaticSlugs.includes(b.slug);
              return {
                id: b.id,
                sn: String(blogsData.length - idx).padStart(2, "0"),
                title: b.title,
                slug: b.slug,
                category: b.category || (isPersonal ? "Personal" : "Tech Updates"),
                blog_type: isPersonal ? "personal" : "tech",
                preferred_section: prefSec,
                date: b.created_at ? new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Nov 2026",
                read_time: b.slug === "optogenetics-retinitis-pigmentosa" ? "12 min read" : (b.slug === "how-to-claim-free-com-np-domain-nepal" ? "4 min read" : "3 min read"),
                image: b.cover_image,
                body: b.content,
                content: b.content,
                excerpt: b.excerpt,
                summary: b.excerpt || (b.content ? (b.content.slice(0, 160) + "...") : ""),
                url: hasStaticHtml ? `blogs/${b.slug}.html` : "",
                has_static_html: Boolean(hasStaticHtml)
              };
            });
          }
        } catch (e) {}

        // Check dedicated 'music_gallery' table
        try {
          const { data: musicData, error: musicErr } = await sbClient
            .from("music_gallery")
            .select("*")
            .eq("is_published", true)
            .order("display_order", { ascending: true });

          if (!musicErr && musicData && musicData.length > 0) {
            if (!payload) payload = {};
            payload.musicGallery = musicData;
          }
        } catch (e) {}

        // Check dedicated 'social_links' table
        try {
          const { data: socialData, error: socialErr } = await sbClient
            .from("social_links")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

          if (!socialErr && socialData && socialData.length > 0) {
            if (!payload) payload = {};
            payload.socialLinksList = socialData;
            if (!payload.socials) payload.socials = {};
            socialData.forEach(row => {
              if (row.url && row.url.trim()) {
                if (row.platform === "email" && row.url.includes("outlook.com")) {
                  payload.socials[row.platform] = "contact@sarojparajuli.com.np";
                } else {
                  payload.socials[row.platform] = row.url.trim();
                }
              }
            });
          }
        } catch (e) {}

        if (payload && payload.socials) {
          payload.socials.email = payload.socials.email && !payload.socials.email.includes("outlook.com") ? payload.socials.email : "contact@sarojparajuli.com.np";
          payload.socials.email_info = payload.socials.email_info || "info@sarojparajuli.com.np";
          payload.socials.email_contact = payload.socials.email_contact || "contact@sarojparajuli.com.np";
          payload.socials.email_career = payload.socials.email_career || "career@sarojparajuli.com.np";
        }

        if (payload) {
          localStorage.setItem(cfg.STORAGE_KEY_CONTENT, JSON.stringify(payload));
          return { source: "supabase", payload };
        }
      }

      // 2. Try localStorage cache
      try {
        const cached = localStorage.getItem(cfg.STORAGE_KEY_CONTENT);
        if (cached) {
          return { source: "cache", payload: JSON.parse(cached) };
        }
      } catch (e) {}

      // 3. Try fetching static fallback JSON
      try {
        const res = await fetch("data/default_content.json");
        if (res.ok) {
          const defaultData = await res.json();
          localStorage.setItem(cfg.STORAGE_KEY_CONTENT, JSON.stringify(defaultData));
          return { source: "local_file", payload: defaultData };
        }
      } catch (e) {}

      return { source: "none", payload: null };
    },

    /**
     * Save/Upsert site content to Supabase
     */
    saveContent: async function(payload, adminKey) {
      // 1. Always update local storage
      try {
        localStorage.setItem(cfg.STORAGE_KEY_CONTENT, JSON.stringify(payload));
      } catch (e) {}

      // 2. Try server backend endpoint first (if available)
      try {
        const response = await fetch(cfg.API_ENDPOINTS.content, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey || cfg.ADMIN_DEFAULT_KEY
          },
          body: JSON.stringify({ payload, adminKey })
        });
        if (response.ok) {
          return { success: true, message: "Saved to Supabase via secure backend!" };
        }
      } catch (e) {
        // Fallback to direct client SDK upsert
      }

      // 3. Fallback to direct Supabase SDK
      if (!sbClient) {
        return { success: false, message: "Saved locally only (Supabase not connected)." };
      }

      try {
        const { error } = await sbClient.from("site_content").upsert({
          id: "main",
          payload: payload,
          updated_at: new Date().toISOString()
        });

        if (error) throw error;
        return { success: true, message: "Successfully synced live to Supabase!" };
      } catch (err) {
        return { success: false, message: "Supabase error: " + err.message };
      }
    },

    /**
     * Fetch approved guestbook messages
     */
    fetchGuestbook: async function() {
      if (sbClient) {
        try {
          const { data, error } = await sbClient
            .from("guestbook_messages")
            .select("id, sender_name, sender_contact, message, created_at")
            .order("created_at", { ascending: false })
            .limit(50);

          if (!error && Array.isArray(data)) {
            return data;
          }
        } catch (e) {
          console.warn("Guestbook fetch error:", e);
        }
      }

      // Fallback: try backend API
      try {
        const res = await fetch(cfg.API_ENDPOINTS.guestbook);
        if (res.ok) {
          const body = await res.json();
          if (body.messages) return body.messages;
        }
      } catch (e) {}

      return [];
    },

    /**
     * Submit new guestbook message
     */
    submitGuestbook: async function(senderName, senderContact, message) {
      const cleanName = (senderName || "").trim();
      const cleanContact = (senderContact || "").trim();
      const cleanMessage = (message || "").trim();

      if (!cleanName || !cleanMessage) {
        throw new Error("Please enter both your name and a message.");
      }

      const newEntry = {
        sender_name: cleanName,
        sender_contact: cleanContact || null,
        message: cleanMessage,
        created_at: new Date().toISOString()
      };

      // 1. Try serverless backend route first
      try {
        const res = await fetch(cfg.API_ENDPOINTS.guestbook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntry)
        });
        if (res.ok) {
          const body = await res.json();
          return body.entry || newEntry;
        }
      } catch (e) {}

      // 2. Direct Supabase insert
      if (sbClient) {
        const { data, error } = await sbClient
          .from("guestbook_messages")
          .insert([newEntry])
          .select()
          .single();

        if (error) throw error;
        return data || newEntry;
      }

      return newEntry;
    },

    /**
     * Delete guestbook message (Admin only)
     */
    deleteGuestbookMessage: async function(id, adminKey) {
      if (sbClient) {
        const { error } = await sbClient
          .from("guestbook_messages")
          .delete()
          .eq("id", id);
        if (!error) return true;
      }

      // Try server endpoint
      try {
        const res = await fetch(cfg.API_ENDPOINTS.guestbook + "/" + id, {
          method: "DELETE",
          headers: { "x-admin-key": adminKey || cfg.ADMIN_DEFAULT_KEY }
        });
        return res.ok;
      } catch (e) {
        return false;
      }
    },

    /**
     * Real-time subscription for guestbook messages
     */
    subscribeToGuestbook: function() {
      if (!sbClient || realtimeChannel) return;

      try {
        realtimeChannel = sbClient
          .channel("public:guestbook_messages")
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "guestbook_messages" }, (payload) => {
            if (payload && payload.new) {
              const event = new CustomEvent("saroj:new_message", { detail: payload.new });
              window.dispatchEvent(event);
            }
          })
          .subscribe();
      } catch (e) {
        console.warn("Could not set up Supabase realtime channel:", e);
      }
    }
  };
})();
