export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'q (query) is required' });
  }

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'WeatherNewsApp/1.0 (contact@example.com)',
        'Accept-Language': 'en',
      },
    });
    if (!response.ok) throw new Error(`Nominatim error: ${response.status}`);
    const data = await response.json();
    const results = data.map((r) => ({
      name: r.display_name,
      city:
        r.address?.city ||
        r.address?.town ||
        r.address?.village ||
        r.address?.county ||
        r.display_name.split(',')[0],
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
    }));
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
