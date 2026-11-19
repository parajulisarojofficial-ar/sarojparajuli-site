if (typeof WebSocket === 'undefined') {
  try {
    globalThis.WebSocket = require('ws');
  } catch (e) {}
}
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qibqrnkvslgvgcowgabp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  const isAllowed =
    origin === 'https://sarojparajuli.com.np' ||
    origin === 'https://www.sarojparajuli.com.np' ||
    /^https:\/\/sarojparajuli-site[a-z0-9-]*\.vercel\.app$/.test(origin) ||
    /^http:\/\/localhost(:\d+)?$/.test(origin) ||
    /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://sarojparajuli.com.np');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
}

module.exports = async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET - Fetch Site Content
  if (req.method === 'GET') {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('site_content')
          .select('payload')
          .eq('id', 'main')
          .maybeSingle();

        if (!error && data && data.payload) {
          return res.status(200).json({ source: 'supabase', data: data.payload });
        }
      }

      const localPath = path.join(process.cwd(), 'data', 'default_content.json');
      if (fs.existsSync(localPath)) {
        const localData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        return res.status(200).json({ source: 'local_fallback', data: localData });
      }

      return res.status(404).json({ error: 'Content not found' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  }

  // 2. POST - Admin Verification or Content Update
  if (req.method === 'POST') {
    if (!ADMIN_SECRET_KEY) {
      return res.status(500).json({ error: 'Server configuration error: ADMIN_SECRET_KEY is not configured.' });
    }

    const adminKey = req.headers['x-admin-key'] || (req.body && req.body.adminKey);
    if (!adminKey || !safeCompare(adminKey, ADMIN_SECRET_KEY)) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
    }

    // Key verification check
    if (req.body && req.body.action === 'verify') {
      return res.status(200).json({ success: true, message: 'Authentication successful.' });
    }

    const { payload } = req.body || {};
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid payload data' });
    }

    const payloadJson = JSON.stringify(payload);
    if (payloadJson.length > 2000000) {
      return res.status(413).json({ error: 'Payload exceeds maximum limit (2MB).' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client is not configured on the server.' });
    }

    try {
      const { error } = await supabase.from('site_content').upsert({
        id: 'main',
        payload: payload,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      // Sync dedicated 'blogs' table if posts array is provided
      if (Array.isArray(payload.posts)) {
        for (const post of payload.posts) {
          if (!post.slug && !post.title) continue;
          const blogRecord = {
            title: post.title,
            slug: post.slug || null,
            category: post.category || 'Tech Updates',
            cover_image: post.image || null,
            excerpt: post.excerpt || post.summary || '',
            content: post.body || post.content || post.excerpt || post.summary || '',
            blog_type: post.blog_type || (post.preferred_section === 0 ? 'personal' : 'tech'),
            preferred_section: typeof post.preferred_section === 'number' ? post.preferred_section : (post.blog_type === 'personal' ? 0 : 1),
            is_published: post.is_published !== false,
            updated_at: new Date().toISOString()
          };
          if (post.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(post.id)) {
            blogRecord.id = post.id;
          }
          if (post.slug) {
            await supabase.from('blogs').upsert(blogRecord, { onConflict: 'slug' });
          }
        }
      }

      return res.status(200).json({ success: true, message: 'Content synced live to Supabase.' });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update Supabase', details: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
