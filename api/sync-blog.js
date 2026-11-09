if (typeof WebSocket === 'undefined') {
  try {
    globalThis.WebSocket = require('ws');
  } catch (e) {}
}
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qibqrnkvslgvgcowgabp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_I3_EYP6XFV1gqUC1x4r55w_q4aeYwgn';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'saroj_cms_pass_2026';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || ('blog-' + Date.now());
}

function estimateReadTime(text) {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-sync-key, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Health / Diagnostic Information
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'Google Drive to Supabase Blog Sync Engine',
      author: 'Saroj Parajuli',
      usage: 'Send HTTP POST with Header x-sync-key and JSON body { title, content, ... }'
    });
  }

  // POST: Sync Blog from Google Drive / Google Docs / External Trigger
  if (req.method === 'POST') {
    // 1. Authenticate Request
    const syncKey = req.headers['x-sync-key'] || req.headers['x-admin-key'] || (req.body && req.body.sync_key);
    if (!syncKey || syncKey !== ADMIN_SECRET_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing sync key.' });
    }

    const body = req.body || {};
    const title = (body.title || '').trim();
    const content = (body.content || body.body || '').trim();

    if (!title) {
      return res.status(400).json({ error: 'Missing required field: title' });
    }
    if (!content) {
      return res.status(400).json({ error: 'Missing required field: content' });
    }

    const slug = (body.slug || slugify(title)).trim();
    const category = (body.category || 'Personal').trim();
    const blogType = (body.blog_type || 'personal').toLowerCase();
    const coverImage = (body.cover_image || body.image || '').trim();
    const driveFileId = (body.drive_file_id || body.file_id || '').trim();
    const readTime = body.read_time || estimateReadTime(content);
    
    // Auto-generate excerpt if omitted
    const excerpt = (body.excerpt || body.summary || content.slice(0, 200).replace(/[#*`_]/g, '') + '...').trim();

    const formattedDate = body.date || new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const nowIso = new Date().toISOString();

    const blogRecord = {
      title: title,
      slug: slug,
      category: category,
      cover_image: coverImage,
      excerpt: excerpt,
      content: content,
      is_published: body.is_published !== false,
      updated_at: nowIso
    };

    try {
      // 2. Attempt upsert into Supabase public.blogs table
      let blogId = null;
      try {
        const { data: existingBlog } = await supabase
          .from('blogs')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (existingBlog && existingBlog.id) {
          blogId = existingBlog.id;
          await supabase
            .from('blogs')
            .update(blogRecord)
            .eq('id', blogId);
        } else {
          const { data: inserted } = await supabase
            .from('blogs')
            .insert({
              ...blogRecord,
              created_at: nowIso
            })
            .select('id')
            .single();

          blogId = inserted ? inserted.id : null;
        }
      } catch (blogsTableErr) {
        console.warn('Note: public.blogs table RLS notice (will save to site_content payload):', blogsTableErr.message);
      }

      // 3. Update public.site_content JSON cache for instant site load
      const { data: contentData } = await supabase
        .from('site_content')
        .select('payload')
        .eq('id', 'main')
        .maybeSingle();

      const payload = (contentData && contentData.payload) ? contentData.payload : {};
      if (!Array.isArray(payload.posts)) {
        payload.posts = [];
      }

      // Check if post already in payload
      const postIndex = payload.posts.findIndex(p => p.slug === slug || (blogId && p.id === blogId));
      const postEntry = {
        id: blogId || `post-${Date.now()}`,
        sn: String(payload.posts.length + 1).padStart(2, '0'),
        title: title,
        slug: slug,
        category: category,
        blog_type: blogType,
        date: formattedDate,
        read_time: readTime,
        summary: excerpt,
        excerpt: excerpt,
        body: content,
        content: content,
        image: coverImage,
        is_published: true,
        drive_file_id: driveFileId,
        updated_at: nowIso
      };

      if (postIndex >= 0) {
        payload.posts[postIndex] = { ...payload.posts[postIndex], ...postEntry };
      } else {
        // New post at the top
        payload.posts.unshift(postEntry);
      }

      const { error: upsertContentErr } = await supabase.from('site_content').upsert({
        id: 'main',
        payload: payload,
        updated_at: nowIso
      });

      if (upsertContentErr) throw upsertContentErr;

      return res.status(200).json({
        success: true,
        message: 'Personal blog published successfully to database.',
        blog: {
          id: blogId || postEntry.id,
          title: title,
          slug: slug,
          category: category,
          blog_type: blogType,
          date: formattedDate,
          read_time: readTime
        }
      });
    } catch (dbErr) {
      console.error('Database sync error:', dbErr);
      return res.status(500).json({
        error: 'Database sync failed',
        details: dbErr.message
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
