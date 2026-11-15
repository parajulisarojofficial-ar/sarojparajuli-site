/**
 * ============================================================================
 * Saroj Parajuli — Universal Blog Share Utility (js/blog-share.js)
 * 
 * Provides instantaneous 1-click sharing, clipboard copy, toast notifications,
 * and a rich multi-platform share modal (WhatsApp, X, LinkedIn, Facebook, etc.)
 * Works across:
 *   1. All dynamic blog cards on sarojparajuli.com.np (Tech & Personal)
 *   2. The in-app blog reader modal
 *   3. All standalone blog HTML pages (current & future)
 * ============================================================================
 */

(function () {
  'use strict';

  // SVG Icons
  const ICONS = {
    share: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>',
    check: '<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>',
    copy: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
    whatsapp: '<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>',
    x: '<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    linkedin: '<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
    facebook: '<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    device: '<svg class="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
    close: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
  };

  let activeToastTimeout = null;

  /**
   * Universal Toast Notification
   */
  function displayToast(message) {
    let toast = document.getElementById('toastNotification');
    let text = document.getElementById('toastMessage');

    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotification';
      toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 px-4 py-3 rounded-xl bg-slate-900 border border-sky-500/40 text-slate-100 text-xs shadow-2xl flex items-center gap-2.5 pointer-events-none';
      toast.innerHTML = `<span id="toastMessage">${escapeHtml(message)}</span>`;
      document.body.appendChild(toast);
      text = document.getElementById('toastMessage');
    } else if (text) {
      text.textContent = message;
    }

    if (activeToastTimeout) clearTimeout(activeToastTimeout);

    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    activeToastTimeout = setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-24', 'opacity-0');
    }, 3200);
  }

  /**
   * Robust Clipboard Copy with fallback
   */
  async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Fall back below
      }
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (e) {
      return false;
    }
  }

  /**
   * HTML escape helper
   */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Bind event listeners for modal (close, ESC, backdrop, copy)
   */
  function bindShareModalEvents(modal) {
    if (!modal || modal.dataset.eventsBound === 'true') return;
    modal.dataset.eventsBound = 'true';

    const closeBtn = document.getElementById('closeShareModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeShareModal);
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeShareModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeShareModal();
      }
    });

    // Copy button inside modal
    const copyBtn = document.getElementById('shareModalCopyBtn');
    const urlInput = document.getElementById('shareModalUrlInput');
    const copyFeedback = document.getElementById('shareModalCopyFeedback');
    const copyText = document.getElementById('shareModalCopyText');
    const copyIcon = document.getElementById('shareModalCopyIcon');

    if (copyBtn && urlInput) {
      copyBtn.addEventListener('click', async () => {
        const link = urlInput.value;
        const ok = await copyTextToClipboard(link);
        if (ok) {
          if (copyFeedback) copyFeedback.classList.remove('opacity-0');
          if (copyText) copyText.textContent = 'Copied! ✓';
          if (copyIcon) copyIcon.innerHTML = ICONS.check;
          copyBtn.classList.remove('bg-sky-600', 'hover:bg-sky-500');
          copyBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');

          displayToast('Link copied to clipboard! 📋');

          setTimeout(() => {
            if (copyFeedback) copyFeedback.classList.add('opacity-0');
            if (copyText) copyText.textContent = 'Copy Link';
            if (copyIcon) copyIcon.innerHTML = ICONS.copy;
            copyBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
            copyBtn.classList.add('bg-sky-600', 'hover:bg-sky-500');
          }, 2400);
        }
      });

      urlInput.addEventListener('focus', () => urlInput.select());
    }
  }

  /**
   * Get or construct the Share Modal DOM
   */
  function ensureShareModalExists() {
    let modal = document.getElementById('universalShareModal');
    if (modal) {
      bindShareModalEvents(modal);
      return modal;
    }

    modal = document.createElement('div');
    modal.id = 'universalShareModal';
    modal.className = 'fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'shareModalTitle');

    modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              ${ICONS.share}
            </div>
            <div>
              <h3 id="shareModalTitle" class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">Share This Blog</h3>
              <p class="text-[11px] font-mono text-slate-500 dark:text-slate-400">Direct article link &bull; sarojparajuli.com.np</p>
            </div>
          </div>
          <button type="button" id="closeShareModalBtn" class="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition" aria-label="Close Share Modal">
            ${ICONS.close}
          </button>
        </div>

        <!-- Article Preview -->
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
          <span class="text-[10px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold block">Selected Article</span>
          <p id="shareModalArticleTitle" class="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug"></p>
        </div>

        <!-- Copy Link Field -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Direct Link</span>
            <span id="shareModalCopyFeedback" class="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 opacity-0 transition-opacity">Copied to clipboard! ✓</span>
          </div>
          <div class="flex items-center gap-2">
            <input type="text" id="shareModalUrlInput" readonly class="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 select-all focus:outline-none focus:ring-2 focus:ring-sky-500" value="">
            <button type="button" id="shareModalCopyBtn" class="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm shrink-0">
              <span id="shareModalCopyIcon">${ICONS.copy}</span>
              <span id="shareModalCopyText">Copy Link</span>
            </button>
          </div>
        </div>

        <!-- Social Share Grid -->
        <div class="space-y-2">
          <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Or share directly to:</span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <!-- WhatsApp -->
            <a id="shareWhatsAppBtn" href="#" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-semibold transition" title="Share on WhatsApp">
              ${ICONS.whatsapp}
              <span>WhatsApp</span>
            </a>
            <!-- X / Twitter -->
            <a id="shareTwitterBtn" href="#" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900/10 hover:bg-slate-900/20 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-semibold transition" title="Share on X">
              ${ICONS.x}
              <span>X (Twitter)</span>
            </a>
            <!-- LinkedIn -->
            <a id="shareLinkedInBtn" href="#" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 font-semibold transition" title="Share on LinkedIn">
              ${ICONS.linkedin}
              <span>LinkedIn</span>
            </a>
            <!-- Facebook -->
            <a id="shareFacebookBtn" href="#" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-700/10 hover:bg-blue-700/20 text-blue-800 dark:text-blue-400 border border-blue-600/30 font-semibold transition" title="Share on Facebook">
              ${ICONS.facebook}
              <span>Facebook</span>
            </a>
          </div>
        </div>

        <!-- System Native Share Trigger (shown if navigator.share exists) -->
        <div id="nativeShareContainer" class="pt-1">
          <button type="button" id="nativeShareBtn" class="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition">
            ${ICONS.device}
            <span>More Options / Device Apps</span>
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
    bindShareModalEvents(modal);
    return modal;
  }

  function closeShareModal() {
    const modal = document.getElementById('universalShareModal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  /**
   * Main Share Action
   */
  async function triggerBlogShare(options, triggerButton) {
    const modal = ensureShareModalExists();

    const title = (options && options.title) || document.title || 'Saroj Parajuli Blog';
    let url = (options && options.url) || window.location.href;

    // Ensure full canonical absolute URL
    try {
      url = new URL(url, window.location.origin).href;
    } catch (e) {}

    // 1. Instantly copy to clipboard so user has it immediately
    const copied = await copyTextToClipboard(url);

    // 2. Animate the clicked button if provided
    if (triggerButton) {
      const originalHtml = triggerButton.innerHTML;
      triggerButton.innerHTML = `
        ${ICONS.check}
        <span class="font-bold text-emerald-600 dark:text-emerald-400">Copied! ✓</span>
      `;
      triggerButton.classList.add('ring-2', 'ring-emerald-500/50');

      setTimeout(() => {
        triggerButton.innerHTML = originalHtml;
        triggerButton.classList.remove('ring-2', 'ring-emerald-500/50');
      }, 2200);
    }

    // 3. Show Toast Notification
    displayToast('Blog link copied to clipboard! 📋');

    // 4. Populate Modal Inputs & Social Links
    const titleEl = document.getElementById('shareModalArticleTitle');
    const inputEl = document.getElementById('shareModalUrlInput');
    const waBtn = document.getElementById('shareWhatsAppBtn');
    const twBtn = document.getElementById('shareTwitterBtn');
    const liBtn = document.getElementById('shareLinkedInBtn');
    const fbBtn = document.getElementById('shareFacebookBtn');
    const nativeBtn = document.getElementById('nativeShareBtn');
    const nativeContainer = document.getElementById('nativeShareContainer');

    if (titleEl) titleEl.textContent = title;
    if (inputEl) inputEl.value = url;

    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);

    if (waBtn) {
      waBtn.href = `https://api.whatsapp.com/send?text=${encodedTitle}%0A%0A${encodedUrl}`;
    }
    if (twBtn) {
      twBtn.href = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    }
    if (liBtn) {
      liBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    }
    if (fbBtn) {
      fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    }

    // Native Share setup
    if (nativeContainer && nativeBtn) {
      if (navigator.share) {
        nativeContainer.classList.remove('hidden');
        nativeBtn.onclick = async () => {
          try {
            await navigator.share({
              title: title,
              text: title,
              url: url
            });
            displayToast('Shared successfully!');
          } catch (err) {
            if (err.name !== 'AbortError') {
              console.warn('Native share notice:', err);
            }
          }
        };
      } else {
        nativeContainer.classList.add('hidden');
      }
    }

    // 5. Open Modal
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    if (inputEl) {
      setTimeout(() => inputEl.select(), 100);
    }
  }

  // Expose globally so external scripts can trigger it
  window.triggerBlogShare = triggerBlogShare;
  window.openBlogShareModal = triggerBlogShare;

  /**
   * Global Event Delegation for any share button (Current and Future blogs)
   */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-share-blog], .share-blog-btn, #shareBlogBtn, [data-share-btn]');
    if (!btn) return;

    e.preventDefault();

    const title = btn.getAttribute('data-blog-title') || 
                  btn.getAttribute('data-share-title') || 
                  document.querySelector('h1')?.innerText?.trim() || 
                  document.title;

    let url = btn.getAttribute('data-blog-url') || 
              btn.getAttribute('data-share-url') || 
              window.location.href;

    // Convert relative to absolute
    if (url.startsWith('blogs/') || url.startsWith('/')) {
      url = new URL(url, window.location.origin).href;
    }

    triggerBlogShare({ title, url }, btn);
  });

  /**
   * Auto-enhance Standalone Blog Pages (Current and Future)
   * If on a blog page with header reader controls and no share button exists, automatically add one!
   */
  function autoEnhanceStandaloneBlog() {
    // Only run on blog pages
    const isBlogPage = window.location.pathname.includes('/blogs/') || document.querySelector('article#articleBody');
    if (!isBlogPage) return;

    const existingBtn = document.getElementById('shareBlogBtn') || document.querySelector('.share-blog-btn');
    if (existingBtn) return; // Already present in markup

    // Look for controls container in sticky header
    const controlsContainer = document.getElementById('readerControls') || 
                              document.querySelector('header .flex.items-center.gap-2') ||
                              document.getElementById('fontIncreaseBtn')?.parentElement;

    if (controlsContainer) {
      const shareBtn = document.createElement('button');
      shareBtn.id = 'shareBlogBtn';
      shareBtn.type = 'button';
      shareBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition inline-flex items-center gap-1.5 ml-1';
      shareBtn.title = 'Share this blog';
      shareBtn.innerHTML = `
        ${ICONS.share}
        <span>Share</span>
      `;
      controlsContainer.appendChild(shareBtn);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoEnhanceStandaloneBlog);
  } else {
    autoEnhanceStandaloneBlog();
  }

})();
