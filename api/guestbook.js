if (typeof WebSocket === 'undefined') {
  try {
    globalThis.WebSocket = require('ws');
  } catch (e) {}
}
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qibqrnkvslgvgcowgabp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_I3_EYP6XFV1gqUC1x4r55w_q4aeYwgn';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'saroj_cms_pass_2026';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

  // 2. POST - Add new message
  if (req.method === 'POST') {
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
    const adminKey = req.headers['x-admin-key'] || (req.body && req.body.adminKey) || req.query.adminKey;
    if (!adminKey || adminKey !== ADMIN_SECRET_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
    }

    const id = req.query.id || (req.body && req.body.id);
    if (!id) {
      return res.status(400).json({ error: 'Missing message ID' });
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
