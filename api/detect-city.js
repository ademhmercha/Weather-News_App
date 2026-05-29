export default async function handler(req, res) {
  // Vercel passes real client IP in x-forwarded-for
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers['x-real-ip'];

  if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('10.')) {
    return res.status(400).json({ error: 'Local IP — cannot detect city' });
  }

  try {
    // ip-api.com works server-side over HTTP, free, no key needed
    const r = await fetch(`http://ip-api.com/json/${ip}?fields=city,lat,lon,country,status`);
    const data = await r.json();
    if (data.status !== 'success') throw new Error('Detection failed');
    return res.json({ city: data.city, lat: data.lat, lon: data.lon, country: data.country });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
