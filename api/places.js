function getUserId(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.slice(7);
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase env vars not configured' });
  }

  const base = `${supabaseUrl}/rest/v1/saved_places`;
  const headers = {
    'Content-Type': 'application/json',
    apikey: supabaseKey,
    Authorization: `Bearer ${token}`,
  };

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${base}?order=created_at.desc`, { headers });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data.message || 'DB error' });
      return res.json(data);
    }

    if (req.method === 'POST') {
      const { city_name, lat, lon } = req.body || {};
      if (!city_name || lat == null || lon == null) {
        return res.status(400).json({ error: 'city_name, lat, lon required' });
      }
      const user_id = getUserId(token);
      if (!user_id) return res.status(401).json({ error: 'Invalid token' });

      const r = await fetch(base, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify({ city_name, lat, lon, user_id }),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data.message || 'DB error' });
      return res.status(201).json(Array.isArray(data) ? data[0] : data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      const r = await fetch(`${base}?id=eq.${id}`, { method: 'DELETE', headers });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        return res.status(r.status).json({ error: data.message || 'DB error' });
      }
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
