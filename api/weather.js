export default async function handler(req, res) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  // Normalize lon to [-180, 180] — Leaflet can produce values like 336° when panning
  const clampedLat = Math.max(-90, Math.min(90, parseFloat(lat)));
  const clampedLon = ((parseFloat(lon) % 360) + 540) % 360 - 180;

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', clampedLat);
  url.searchParams.set('longitude', clampedLon);
  url.searchParams.set('current_weather', 'true');
  url.searchParams.set('hourly', 'relative_humidity_2m,apparent_temperature,precipitation_probability,windspeed_10m');
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max');
  url.searchParams.set('forecast_days', '5');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('wind_speed_unit', 'kmh');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Open-Meteo error: ${response.status}`);
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60');
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
