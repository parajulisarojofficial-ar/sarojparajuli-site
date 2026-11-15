if (typeof WebSocket === 'undefined') {
  try {
    globalThis.WebSocket = require('ws');
  } catch (e) {}
}
const { createClient } = require('@supabase/supabase-js');
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

const recentIps = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const last = recentIps.get(ip);
  if (last && (now - last) < 5000) { // 5-second per-IP cooldown
    return true;
  }
  recentIps.set(ip, now);
  if (recentIps.size > 500) {
    for (const [k, v] of recentIps.entries()) {
      if (now - v > 60000) recentIps.delete(k);
    }
  }
  return false;
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
}

module.exports = async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client is not configured on the server.' });
  }

  // 1. GET - Fetch Guestbook Messages
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('guestbook_messages')
        .select('id, sender_name, sender_contact, message, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return res.status(200).json({ success: true, messages: data || [] });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch guestbook', details: err.message });
    }
  }

  // 2. POST - Add new message with strict validation & anti-bot honeypot
  if (req.method === 'POST') {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'ip';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Please wait a few seconds before submitting another note.' });
    }

    const { sender_name, sender_contact, message, website_hp } = req.body || {};

    // Anti-bot honeypot
    if (website_hp) {
      return res.status(200).json({ success: true, message: 'Message recorded.' });
    }

    const cleanName = (sender_name || '').trim();
    const cleanContact = (sender_contact || '').trim();
    const cleanMessage = (message || '').trim();

    if (cleanName.length < 1 || cleanName.length > 100) {
      return res.status(400).json({ error: 'Name must be between 1 and 100 characters.' });
    }
    if (cleanContact.length > 100) {
      return res.status(400).json({ error: 'Contact detail must not exceed 100 characters.' });
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
      return res.status(200).json({ success: true, message: 'Thank you! Your note is published live.', entry: data });
    } catch (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
  }

  // 3. DELETE - Delete a message (Admin key required)
  if (req.method === 'DELETE') {
    if (!ADMIN_SECRET_KEY) {
      return res.status(500).json({ error: 'Server configuration error: ADMIN_SECRET_KEY is not configured.' });
    }

    const adminKey = req.headers['x-admin-key'] || (req.body && req.body.adminKey) || req.query.adminKey;
    if (!adminKey || !safeCompare(adminKey, ADMIN_SECRET_KEY)) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
    }

    const id = req.query.id || (req.body && req.body.id);
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid message ID' });
    }

    try {
      const { error } = await supabase
        .from('guestbook_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Message deleted successfully.' });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete message', details: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
