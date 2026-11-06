/**
 * ============================================================================
 * sarojparajuli.com.np — Centralized Client Configuration
 * ============================================================================
 */
window.SAROJ_CONFIG = {
  // Production Supabase Credentials (Connected & Verified)
  SUPABASE_URL: "https://qibqrnkvslgvgcowgabp.supabase.co",
  SUPABASE_KEY: "sb_publishable_I3_EYP6XFV1gqUC1x4r55w_q4aeYwgn",

  // Local Storage Storage Keys
  STORAGE_KEY_CONTENT: "saroj_site_data_v2",
  STORAGE_KEY_THEME: "saroj_site_theme_v2",
  STORAGE_KEY_FONT_SIZE: "saroj_site_font_size_v2",
  STORAGE_KEY_ADMIN_TOKEN: "saroj_admin_session_v2",
  STORAGE_KEY_SB_CONFIG: "saroj_sb_custom_config_v2",

  // Admin Master Passphrase (Default client passkey, matches backend server)
  ADMIN_DEFAULT_KEY: "saroj_cms_pass_2026",

  // Domain Metadata
  DOMAIN: "sarojparajuli.com.np",
  CONTACT_EMAIL: "sarojparajuli.personal@outlook.com",
  LOCATION: "Kathmandu, Nepal",
  INSTITUTION: "Tri-Chandra Multiple Campus (Tribhuvan University)",

  // Endpoints
  API_ENDPOINTS: {
    health: "/api/health",
    content: "/api/content",
    guestbook: "/api/guestbook",
    contact: "/api/contact"
  }
};
