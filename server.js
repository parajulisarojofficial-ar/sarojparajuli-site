require('dotenv').config();
if (typeof WebSocket === 'undefined') {
  try {
    globalThis.WebSocket = require('ws');
  } catch (e) {}
}
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qibqrnkvslgvgcowgabp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_I3_EYP6XFV1gqUC1x4r55w_q4aeYwgn';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'saroj_cms_pass_2026';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Security & Optimization Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co", "https://cdn.jsdelivr.net"],
      mediaSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests from this IP, please try again later.' }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: { error: 'Too many messages submitted from this IP, please try again in an hour.' }
});

app.use('/api/', generalLimiter);

// ----------------------------------------------------------------------------
// API ROUTES
// ----------------------------------------------------------------------------

// 1. Health & Connection Monitor
app.get('/api/health', async (req, res) => {
  let supabaseStatus = 'disconnected';
  try {
    const { data, error } = await supabase.from('site_content').select('id').limit(1);
    if (!error) supabaseStatus = 'connected';
  } catch (e) {
    supabaseStatus = 'error';
  }

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    supabase: supabaseStatus,
    domain: 'sarojparajuli.com.np'
  });
});

// 2. Get Site Content
app.get('/api/content', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('payload')
      .eq('id', 'main')
      .maybeSingle();

    if (!error && data && data.payload) {
      return res.json({ source: 'supabase', data: data.payload });
    }

    // Fallback to local default content file
    const localPath = path.join(__dirname, 'data', 'default_content.json');
    if (fs.existsSync(localPath)) {
      const localData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
      return res.json({ source: 'local_fallback', data: localData });
    }

    return res.status(404).json({ error: 'Content not found' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// 3. Save / Update Site Content (Protected by Admin Key)
app.post('/api/content', async (req, res) => {
  const adminKey = req.headers['x-admin-key'] || req.body.adminKey;
  if (!adminKey || adminKey !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
  }

  const { payload } = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Invalid payload data' });
  }

  try {
    // 1. Upsert to Supabase
    const { error } = await supabase.from('site_content').upsert({
      id: 'main',
      payload: payload,
      updated_at: new Date().toISOString()
    });

    if (error) throw error;

    // 2. Also keep local data backup updated
    try {
      const localPath = path.join(__dirname, 'data', 'default_content.json');
      fs.writeFileSync(localPath, JSON.stringify(payload, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Could not write local data backup:', fsErr.message);
    }

    res.json({ success: true, message: 'Content synced live to Supabase & local backup.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update Supabase', details: err.message });
  }
});

// 4. Get Guestbook Messages
app.get('/api/guestbook', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('guestbook_messages')
      .select('id, sender_name, sender_contact, message, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ success: true, messages: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guestbook', details: err.message });
  }
});

// 5. Submit Guestbook Message (With anti-spam honeypot & length validation)
app.post('/api/guestbook', contactLimiter, async (req, res) => {
  const { sender_name, sender_contact, message, website_hp } = req.body;

  // Honeypot check: Bots fill this hidden field
  if (website_hp) {
    return res.status(200).json({ success: true, message: 'Message recorded.' });
  }

  // Input validation
  const cleanName = (sender_name || '').trim();
  const cleanContact = (sender_contact || '').trim();
  const cleanMessage = (message || '').trim();

  if (cleanName.length < 1 || cleanName.length > 100) {
    return res.status(400).json({ error: 'Name must be between 1 and 100 characters.' });
  }
  if (cleanMessage.length < 2 || cleanMessage.length > 2000) {
    return res.status(400).json({ error: 'Message must be between 2 and 2000 characters.' });
  }

  try {
    const newEntry = {
      sender_name: cleanName,
      sender_contact: cleanContact || null,
      message: cleanMessage,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('guestbook_messages')
      .insert([newEntry])
      .select('id, sender_name, sender_contact, message, created_at')
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Thank you! Your note is published live.', entry: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post message', details: err.message });
  }
});

// 6. Delete Guestbook Message (Protected Admin Operation)
app.delete('/api/guestbook/:id', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('guestbook_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message', details: err.message });
  }
});

// ----------------------------------------------------------------------------
// STATIC ASSETS & PAGE ROUTING
// ----------------------------------------------------------------------------
app.use(express.static(path.join(__dirname), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Saroj Parajuli Website running on port ${PORT}`);
  console.log(`🌐 Public URL : http://localhost:${PORT}`);
  console.log(`⚙️  Admin Studio: http://localhost:${PORT}/admin`);
  console.log(`📦 Supabase   : ${SUPABASE_URL}`);
  console.log(`====================================================`);
});
