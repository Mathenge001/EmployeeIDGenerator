module.exports = function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';

  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(
    `window.__SUPABASE_CONFIG__ = ${JSON.stringify({
      url: supabaseUrl,
      key: supabaseKey,
    })};`
  );
};
