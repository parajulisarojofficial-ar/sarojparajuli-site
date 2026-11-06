if (typeof WebSocket === 'undefined') {
  try {
    globalThis.WebSocket = require('ws');
  } catch (e) {}
}
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qibqrnkvslgvgcowgabp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_I3_EYP6XFV1gqUC1x4r55w_q4aeYwgn';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let supabaseStatus = 'disconnected';
  try {
    const { data, error } = await supabase.from('site_content').select('id').limit(1);
    if (!error) supabaseStatus = 'connected';
  } catch (e) {
    supabaseStatus = 'error';
  }

  res.status(200).json({
    status: 'ok',
    uptime: process.uptime ? process.uptime() : null,
    timestamp: new Date().toISOString(),
    supabase: supabaseStatus,
    domain: 'sarojparajuli.com.np'
  });
};
