// ── API helpers ────────────────────────────────────────────────────────────────

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

export async function fetchAQI(lat, lon) {
  return apiFetch(`/api/aqi?lat=${lat}&lon=${lon}`);
}

export async function fetchNews(city, country = '') {
  const params = new URLSearchParams({ city });
  if (country) params.set('country', country);
  return apiFetch(`/api/news?${params.toString()}`);
}

export async function geocodeSearch(query) {
  return apiFetch(`/api/geocode?q=${encodeURIComponent(query)}`);
}

// ── Location detection ─────────────────────────────────────────────────────────

async function reverseGeocodeCity(lat, lon) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'User-Agent': 'WeatherNewsApp/1.0' } }
    );
    const d = await r.json();
    const city    = d.address?.city || d.address?.town || d.address?.village || d.address?.county || d.display_name?.split(',')[0];
    const country = d.address?.country || '';
    return { city, country };
  } catch {
    return { city: `${lat.toFixed(2)},${lon.toFixed(2)}`, country: '' };
  }
}

export async function detectLocation() {
  // 1. Browser Geolocation — longer timeout + accept cached position for mobile
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 12000,
          maximumAge: 120000,       // accept a position up to 2 min old (instant on mobile)
          enableHighAccuracy: false, // faster — uses WiFi/cell tower, good enough for city
        })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      const { city, country } = await reverseGeocodeCity(lat, lon);
      return { city, lat, lon, country, source: 'gps' };
    } catch { /* denied or timeout — fall through */ }
  }

  // 2. Server-side IP detection (bypasses ad blockers)
  try {
    const data = await apiFetch('/api/detect-city');
    return { city: data.city, lat: data.lat, lon: data.lon, country: data.country || '', source: 'ip' };
  } catch { /* fall through */ }

  throw new Error('Could not detect location');
}

// Called when user explicitly taps "Enable GPS" — forces a fresh high-accuracy fix
export async function requestGPSLocation() {
  if (!('geolocation' in navigator)) throw new Error('Geolocation not supported');
  const pos = await new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 20000,
      maximumAge: 0,        // force fresh position
      enableHighAccuracy: true, // use GPS chip on mobile
    })
  );
  const { latitude: lat, longitude: lon } = pos.coords;
  const { city, country } = await reverseGeocodeCity(lat, lon);
  return { city, lat, lon, country, source: 'gps' };
}

export const detectCityFromIP = detectLocation;

// ── Saved places — localStorage (no auth required) ─────────────────────────────

const PLACES_KEY = 'wn_saved_places';

function readPlaces() {
  try { return JSON.parse(localStorage.getItem(PLACES_KEY) || '[]'); }
  catch { return []; }
}

export function fetchPlaces() {
  return Promise.resolve(readPlaces());
}

export function savePlace(city_name, lat, lon) {
  const places = readPlaces();
  if (places.some(p => p.city_name === city_name)) {
    return Promise.reject(new Error(`${city_name} is already saved`));
  }
  const place = {
    id: Date.now().toString(),
    city_name,
    lat: Number(lat),
    lon: Number(lon),
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(PLACES_KEY, JSON.stringify([place, ...places]));
  return Promise.resolve(place);
}

export function deletePlace(id) {
  localStorage.setItem(PLACES_KEY, JSON.stringify(readPlaces().filter(p => p.id !== id)));
  return Promise.resolve({ success: true });
}
