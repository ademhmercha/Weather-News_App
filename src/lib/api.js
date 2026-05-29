import { getAccessToken } from './supabase';

async function apiFetch(path, options = {}) {
  const res = await fetch(path, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchWeather(lat, lon) {
  return apiFetch(`/api/weather?lat=${lat}&lon=${lon}`);
}

export async function fetchNews(city, country = '') {
  const params = new URLSearchParams({ city });
  if (country) params.set('country', country);
  return apiFetch(`/api/news?${params.toString()}`);
}

export async function geocodeSearch(query) {
  return apiFetch(`/api/geocode?q=${encodeURIComponent(query)}`);
}

async function reverseGeocodeCity(lat, lon) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'User-Agent': 'WeatherNewsApp/1.0' } }
    );
    const d = await r.json();
    const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || d.display_name?.split(',')[0];
    const country = d.address?.country || '';
    return { city, country };
  } catch {
    return { city: `${lat.toFixed(2)},${lon.toFixed(2)}`, country: '' };
  }
}

export async function detectLocation() {
  // 1. Browser Geolocation (most accurate, not blocked by ad blockers)
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      const { city, country } = await reverseGeocodeCity(lat, lon);
      return { city, lat, lon, country };
    } catch { /* denied or timed out — fall through */ }
  }

  // 2. Server-side IP detection (bypasses ad blockers)
  try {
    const data = await apiFetch('/api/detect-city');
    return { city: data.city, lat: data.lat, lon: data.lon, country: data.country || '' };
  } catch { /* fall through */ }

  // 3. Last resort
  throw new Error('Could not detect location');
}

// Keep old name as alias for backward compat
export const detectCityFromIP = detectLocation;

async function authFetch(path, options = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  return apiFetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export async function fetchPlaces() {
  return authFetch('/api/places');
}

export async function savePlace(city_name, lat, lon) {
  return authFetch('/api/places', {
    method: 'POST',
    body: JSON.stringify({ city_name, lat, lon }),
  });
}

export async function deletePlace(id) {
  return authFetch(`/api/places?id=${id}`, { method: 'DELETE' });
}
