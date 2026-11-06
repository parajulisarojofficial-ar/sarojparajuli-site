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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('payload')
        .eq('id', 'main')
        .maybeSingle();

      if (!error && data && data.payload) {
        return res.status(200).json({ source: 'supabase', data: data.payload });
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

  if (req.method === 'POST') {
    const adminKey = req.headers['x-admin-key'] || (req.body && req.body.adminKey);
    if (!adminKey || adminKey !== ADMIN_SECRET_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
    }

    const { payload } = req.body || {};
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid payload data' });
    }

    try {
      const { error } = await supabase.from('site_content').upsert({
        id: 'main',
        payload: payload,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Content synced live to Supabase.' });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update Supabase', details: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
