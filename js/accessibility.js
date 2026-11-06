/**
 * ============================================================================
 * sarojparajuli.com.np — Universal Accessibility & Inclusive Tech Suite
 * Built with empathy for Low Vision, Retinitis Pigmentosa & Screen Readers
 * ============================================================================
 */
(function() {
  const cfg = window.SAROJ_CONFIG;

  window.SarojA11y = {
    speechSynth: window.speechSynthesis || null,
    isSpeaking: false,

    init: function() {
      this.initTheme();
      this.initFontSize();
      this.bindControls();
    },

    /**
     * Live announcer for screen reader users
     */
    announce: function(message) {
      const announcer = document.getElementById("sr-announcer");
      if (announcer) {
        announcer.textContent = "";
        setTimeout(() => {
          announcer.textContent = message;
        }, 50);
      }
    },

    /**
     * Show brief toast notification
     */
    showToast: function(message) {
      const container = document.getElementById("toastContainer");
      if (!container) return;

      const toast = document.createElement("div");
      toast.className = "toast-item";
      toast.innerHTML = `<span>✦</span><span>${message}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(40px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    },

    /**
     * Theme management (Dark, Light, High-Contrast)
     */
    initTheme: function() {
      const savedTheme = localStorage.getItem(cfg.STORAGE_KEY_THEME) || "dark";
      this.setTheme(savedTheme, false);
    },

    setTheme: function(theme, notify = true) {
      const html = document.documentElement;
      html.setAttribute("data-theme", theme);
      localStorage.setItem(cfg.STORAGE_KEY_THEME, theme);

      // Update button active state
      document.querySelectorAll("[data-theme-choice]").forEach(btn => {
        if (btn.getAttribute("data-theme-choice") === theme) {
          btn.classList.add("ring-2", "ring-terracotta-400", "font-bold");
        } else {
          btn.classList.remove("ring-2", "ring-terracotta-400", "font-bold");
        }
      });

      if (notify) {
        const labels = {
          dark: "Warm Espresso Dark Mode",
          light: "Editorial Daylight Light Mode",
          contrast: "High-Contrast Accessible Mode (RP Optimized)"
        };
        const text = labels[theme] || theme;
        this.announce(text);
        this.showToast(text);
      }
    },

    /**
     * Font size adjustments
     */
    initFontSize: function() {
      const savedSize = localStorage.getItem(cfg.STORAGE_KEY_FONT_SIZE) || "normal";
      this.setFontSize(savedSize, false);
    },

    setFontSize: function(size, notify = true) {
      const html = document.documentElement;
      html.setAttribute("data-font-size", size);
      localStorage.setItem(cfg.STORAGE_KEY_FONT_SIZE, size);

      document.querySelectorAll("[data-font-size-choice]").forEach(btn => {
        if (btn.getAttribute("data-font-size-choice") === size) {
          btn.classList.add("bg-terracotta-500", "text-white");
        } else {
          btn.classList.remove("bg-terracotta-500", "text-white");
        }
      });

      if (notify) {
        const labels = {
          normal: "Standard Font Size (16px)",
          large: "Large Font Size (18px)",
          xlarge: "Extra-Large Font Size (20px)"
        };
        this.announce(labels[size] || size);
        this.showToast(labels[size] || size);
      }
    },

    /**
     * Text-to-Speech audio introduction
     */
    toggleAudioIntro: function() {
      if (!this.speechSynth) {
        this.showToast("Text-to-speech is not supported in this browser.");
        return;
      }

      if (this.isSpeaking) {
        this.speechSynth.cancel();
        this.isSpeaking = false;
        this.updateAudioIntroButton(false);
        this.showToast("Audio introduction stopped.");
        return;
      }

      const introText =
        "Hello and welcome to sarojparajuli.com.np. I am Saroj Parajuli, a final-year Bachelor of Science in Statistics student at Tri-Chandra Campus in Kathmandu, Nepal. " +
        "I specialize in Statistical Modeling, Monitoring and Evaluation with KoboToolbox, and data analytics with Python and PostgreSQL. " +
        "Beyond data, I am an acoustic musician, songwriter, and storyteller. " +
        "I live with Retinitis Pigmentosa, which drives my dedication to universal digital accessibility. " +
        "Please feel free to explore my projects, listen to my acoustic guitar recordings, and leave a note in my guestbook.";

      const utterance = new SpeechSynthesisUtterance(introText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.updateAudioIntroButton(true);
        this.showToast("Playing spoken audio introduction...");
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.updateAudioIntroButton(false);
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.updateAudioIntroButton(false);
      };

      this.speechSynth.speak(utterance);
    },

    updateAudioIntroButton: function(active) {
      const btn = document.getElementById("btnAudioIntro");
      if (!btn) return;
      if (active) {
        btn.classList.add("bg-terracotta-500", "text-white");
        btn.setAttribute("aria-pressed", "true");
        btn.innerHTML = `<span>■</span><span>Stop Audio Intro</span>`;
      } else {
        btn.classList.remove("bg-terracotta-500", "text-white");
        btn.setAttribute("aria-pressed", "false");
        btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg><span>Audio Intro</span>`;
      }
    },

    /**
     * Event bindings
     */
    bindControls: function() {
      // Theme buttons
      document.querySelectorAll("[data-theme-choice]").forEach(btn => {
        btn.addEventListener("click", () => {
          this.setTheme(btn.getAttribute("data-theme-choice"));
        });
      });

      // Font size buttons
      document.querySelectorAll("[data-font-size-choice]").forEach(btn => {
        btn.addEventListener("click", () => {
          this.setFontSize(btn.getAttribute("data-font-size-choice"));
        });
      });

      // Audio Intro button
      const audioIntroBtn = document.getElementById("btnAudioIntro");
      if (audioIntroBtn) {
        audioIntroBtn.addEventListener("click", () => this.toggleAudioIntro());
      }
    }
  };
})();
