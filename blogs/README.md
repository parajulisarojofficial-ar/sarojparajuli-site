# Blog Sharing Guide & System Documentation

This folder contains the standalone blog articles and publication assets for **sarojparajuli.com.np**.

## How the Share Button Works

Every blog on the website is equipped with an instantaneous **Share Button** so visitors can share the exact article with one click rather than manually copying the URL from the browser bar.

### Features
1. **Instant Clipboard Copy**: Clicking **Share** immediately writes the direct, canonical article permalink to the visitor's clipboard and changes the button text to `Copied! ✓`.
2. **Instant Toast Notification**: A floating feedback notification (`Blog link copied to clipboard! 📋`) pops up confirming that the link is ready to paste anywhere.
3. **Multi-Platform Share Modal**: A modern, glassmorphic modal opens with:
   - Full article title preview
   - Read-only direct URL input with 1-click **Copy Link** button
   - Direct 1-click sharing buttons for **WhatsApp**, **X (Twitter)**, **LinkedIn**, and **Facebook**
   - **More Options / Device Apps** button using the standard Web Share API (`navigator.share`) for mobile devices.
4. **Deep Linking for In-App Blogs**: When sharing an in-app database/markdown blog (e.g., `#blog=overall-shift-of-tech-to-ai-workflows`), visitors who open the link are automatically routed directly to the `#blogs` tab and the article reader modal pops open immediately.

---

## How Future Blogs Automatically Get the Share Button

You don't have to manually code or configure sharing for future blogs. The system handles it automatically across all creation methods:

### Method 1: Publishing via Admin Dashboard or Supabase
- Whenever you publish a new article through `admin.html` or direct database insert:
- `js/main.js`'s `renderBlogs(posts)` dynamically generates the card with the **Share** button for both **Tech Updates** and **Personal Blogs & Stories**.
- Inside the in-app modal (`#personalStoryModal`), both the header and footer share buttons are dynamically linked to the newly opened article.

### Method 2: Syncing from Google Drive / Docs
- Articles automatically synchronized via Google Drive (`scripts/google-drive-blog-sync.js`) enter the database as personal stories.
- They are rendered through `renderBlogs()` and automatically receive the Share button and deep-link routing.

### Method 3: Creating a Standalone HTML Article
- When authoring a standalone `.html` file inside the `blogs/` folder:
  1. Simply duplicate `blogs/BLOG_TEMPLATE.html`.
  2. The Share button is already included in the header, metadata row, and footer.
  3. Include `<script src="../js/blog-share.js"></script>` at the end of `<body>`.
  - **Even if you forget to add a share button in the HTML**: `blog-share.js` will automatically detect the header controls and append the Share button automatically!
