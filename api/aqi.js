export default async function handler(req, res) {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

  const clampedLat = Math.max(-90, Math.min(90, Number.parseFloat(lat)));
  const clampedLon = ((Number.parseFloat(lon) % 360) + 540) % 360 - 180;

  const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  url.searchParams.set('latitude', clampedLat);
  url.searchParams.set('longitude', clampedLon);
  url.searchParams.set('hourly', 'us_aqi,pm2_5');
  url.searchParams.set('forecast_days', '1');

  try {
    const r = await fetch(url.toString());
    if (!r.ok) throw new Error(`AQI error: ${r.status}`);
    const data = await r.json();
    const aqi  = data.hourly?.us_aqi?.[0]  ?? null;
    const pm25 = data.hourly?.pm2_5?.[0]   ?? null;
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60');
    return res.json({ aqi, pm25 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
