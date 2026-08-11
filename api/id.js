const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

function send(res, status, body) {
  res.status(status).json(body);
}

async function rpc(admin, name, params = {}) {
  const { data, error } = await admin.rpc(name, params);
  if (error) throw error;
  return data;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  if (!supabaseUrl || !secretKey) {
    return send(res, 500, { error: 'Server Supabase environment variables are incomplete.' });
  }

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const body = req.body || {};
  const action = String(body.action || '').toLowerCase();

  try {
    if (action === 'bootstrap') {
      const [usageRows, summaryRows] = await Promise.all([
        rpc(admin, 'get_weekly_id_usage'),
        rpc(admin, 'get_id_dashboard_summary')
      ]);
      return send(res, 200, {
        usage: Array.isArray(usageRows) ? usageRows[0] : usageRows,
        summary: Array.isArray(summaryRows) ? summaryRows[0] : summaryRows
      });
    }

    if (action === 'generate') {
      const rows = await rpc(admin, 'register_id_generation', {
        p_rider_number: body.rider_number || '',
        p_rider_name: body.rider_name || '',
        p_workplace_code: body.workplace_code || '',
        p_generation_type: body.generation_type || 'INITIAL',
        p_confirm_duplicate: !!body.confirm_duplicate
      });
      return send(res, 200, { result: Array.isArray(rows) ? rows[0] : rows });
    }

    if (action === 'search') {
      const rows = await rpc(admin, 'search_generated_ids', {
        p_query: body.query || '',
        p_workplace: body.workplace || 'ALL',
        p_status: body.status || 'ALL',
        p_period: body.period || 'ALL'
      });
      return send(res, 200, { records: rows || [] });
    }

    if (action === 'history') {
      const rows = await rpc(admin, 'get_rider_generation_history', { p_rider_id: body.rider_id });
      return send(res, 200, { generations: rows || [] });
    }

    if (action === 'status') {
      const rows = await rpc(admin, 'set_rider_id_status', {
        p_rider_id: body.rider_id,
        p_action: body.status_action,
        p_reason: body.reason || null
      });
      return send(res, 200, { result: Array.isArray(rows) ? rows[0] : rows });
    }

    if (action === 'audit') {
      const rows = await rpc(admin, 'get_id_audit_log', {
        p_query: body.query || '',
        p_action: body.audit_action || 'ALL',
        p_period: body.period || 'ALL',
        p_limit: body.limit || 500
      });
      return send(res, 200, { audit: rows || [] });
    }

    if (action === 'log') {
      await rpc(admin, 'log_id_action', {
        p_rider_id: body.rider_id,
        p_generation_id: body.generation_id,
        p_action: body.log_action,
        p_details: body.details || {}
      });
      return send(res, 200, { ok: true });
    }

    if (action === 'summary') {
      const rows = await rpc(admin, 'get_id_dashboard_summary');
      return send(res, 200, { summary: Array.isArray(rows) ? rows[0] : rows });
    }

    return send(res, 400, { error: 'Unknown action.' });
  } catch (error) {
    console.error('[api/id]', action, error);
    return send(res, 400, { error: error?.message || 'Request failed.' });
  }
};
