export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'q (query) is required' });
  }

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', q);
  url.searchParams.set('count', '6');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Geocoding error: ${response.status}`);
    const data = await response.json();

    const results = (data.results || []).map(r => ({
      name: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
      city: r.name,
      lat: r.latitude,
      lon: r.longitude,
    }));

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
