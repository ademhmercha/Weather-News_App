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

export async function fetchNews(city) {
  return apiFetch(`/api/news?city=${encodeURIComponent(city)}`);
}

export async function geocodeSearch(query) {
  return apiFetch(`/api/geocode?q=${encodeURIComponent(query)}`);
}

export async function detectCityFromIP() {
  const res = await fetch('https://ipinfo.io/json');
  const data = await res.json();
  if (!data.city) throw new Error('IP location failed');
  const [lat, lon] = (data.loc || '0,0').split(',').map(Number);
  return { city: data.city, lat, lon };
}

async function authFetch(path, options = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  return apiFetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
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
