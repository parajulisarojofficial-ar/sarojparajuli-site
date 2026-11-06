/**
 * ============================================================================
 * sarojparajuli.com.np — Web Audio API Acoustic Guitar Synthesizer & Soundboard
 * ============================================================================
 */
(function() {
  let audioCtx = null;
  let activeTimer = null;
  let currentTrackId = null;

  window.SarojAudio = {
    isPlaying: false,

    /**
     * Initialize audio context on first user gesture
     */
    initContext: function() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      return audioCtx;
    },

    /**
     * Pluck a single acoustic guitar note with natural wood resonance
     */
    pluckNote: function(freq, duration = 1.6) {
      this.initContext();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;

      // Primary tone (warm body)
      const oscPrimary = audioCtx.createOscillator();
      const gainPrimary = audioCtx.createGain();
      oscPrimary.type = "triangle";
      oscPrimary.frequency.setValueAtTime(freq, now);

      // Overtones (spruce top shimmer)
      const oscOvertone = audioCtx.createOscillator();
      const gainOvertone = audioCtx.createGain();
      oscOvertone.type = "sine";
      oscOvertone.frequency.setValueAtTime(freq * 2, now);

      // Envelope: Fast acoustic attack, warm exponential decay
      gainPrimary.gain.setValueAtTime(0.001, now);
      gainPrimary.gain.linearRampToValueAtTime(0.22, now + 0.02);
      gainPrimary.gain.exponentialRampToValueAtTime(0.001, now + duration);

      gainOvertone.gain.setValueAtTime(0.001, now);
      gainOvertone.gain.linearRampToValueAtTime(0.08, now + 0.015);
      gainOvertone.gain.exponentialRampToValueAtTime(0.0005, now + (duration * 0.7));

      // Connect nodes
      oscPrimary.connect(gainPrimary);
      oscOvertone.connect(gainOvertone);

      gainPrimary.connect(audioCtx.destination);
      gainOvertone.connect(audioCtx.destination);

      oscPrimary.start(now);
      oscOvertone.start(now);

      oscPrimary.stop(now + duration + 0.05);
      oscOvertone.stop(now + duration + 0.05);
    },

    /**
     * Play acoustic progression arpeggio for a track
     */
    playTrack: function(track) {
      this.stop();
      this.initContext();

      currentTrackId = track.id;
      this.isPlaying = true;

      const notes = (track.notes && track.notes.length > 0)
        ? track.notes
        : [196, 246.94, 293.66, 392, 329.63, 293.66, 246.94, 392];
      const tempo = track.tempo || 420;
      let step = 0;

      // Update UI elements
      this.updateUI(track, true);

      // Initial note
      this.pluckNote(notes[0]);

      // Sequence notes
      activeTimer = setInterval(() => {
        step = (step + 1) % notes.length;
        this.pluckNote(notes[step]);
      }, tempo);
    },

    /**
     * Stop current playing audio
     */
    stop: function() {
      if (activeTimer) {
        clearInterval(activeTimer);
        activeTimer = null;
      }
      this.isPlaying = false;
      currentTrackId = null;
      this.updateUI(null, false);
    },

    /**
     * Update player bar and visualizer elements
     */
    updateUI: function(track, isPlaying) {
      const titleEl = document.getElementById("nowPlayingTitle");
      const subEl = document.getElementById("nowPlayingSubtitle");
      const chordsEl = document.getElementById("nowPlayingChords");
      const eqVisualizer = document.getElementById("audioEqVisualizer");
      const stopBtn = document.getElementById("stopAudioBtn");

      if (isPlaying && track) {
        if (titleEl) titleEl.textContent = track.title;
        if (subEl) subEl.textContent = track.subtitle || track.type;
        if (chordsEl) chordsEl.textContent = track.chords ? "Chords: " + track.chords : "";
        if (eqVisualizer) eqVisualizer.classList.remove("hidden");
        if (stopBtn) stopBtn.classList.remove("hidden");

        // Update active button state
        document.querySelectorAll(".track-play-btn").forEach(btn => {
          if (btn.getAttribute("data-track-id") === track.id) {
            btn.innerHTML = `<span>■</span><span>Stop Session</span>`;
            btn.classList.add("bg-terracotta-600");
          } else {
            btn.innerHTML = `<span>▶</span><span>Acoustic Preview</span>`;
            btn.classList.remove("bg-terracotta-600");
          }
        });
      } else {
        if (titleEl) titleEl.textContent = "Select any track below to listen to its acoustic session";
        if (subEl) subEl.textContent = "Synthesized live in browser via Web Audio API • 44.1kHz";
        if (chordsEl) chordsEl.textContent = "";
        if (eqVisualizer) eqVisualizer.classList.add("hidden");
        if (stopBtn) stopBtn.classList.add("hidden");

        document.querySelectorAll(".track-play-btn").forEach(btn => {
          btn.innerHTML = `<span>▶</span><span>Acoustic Preview</span>`;
          btn.classList.remove("bg-terracotta-600");
        });
      }
    }
  };
})();
