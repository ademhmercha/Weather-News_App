import { useEffect, useState } from 'react';
import { fetchPlaces, savePlace, deletePlace, fetchWeather } from '../lib/api';
import { getWeatherEmoji } from '../lib/weatherIcons';
import LoadingSpinner from './LoadingSpinner';

export default function SavedPlaces({ onSelectPlace }) {
  const [places, setPlaces] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlaces();
  }, []);

  async function loadPlaces() {
    try {
      setLoading(true);
      const data = await fetchPlaces();
      setPlaces(data);
      loadWeatherForPlaces(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadWeatherForPlaces(places) {
    const results = await Promise.allSettled(
      places.map((p) => fetchWeather(p.lat, p.lon))
    );
    const map = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') map[places[i].id] = r.value;
    });
    setWeather(map);
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    try {
      await deletePlace(id);
      setPlaces((prev) => prev.filter((p) => p.id !== id));
      setWeather((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <LoadingSpinner size="sm" label="Loading places…" />;
  if (error) return <p className="text-red-400 text-sm p-2">{error}</p>;

  if (places.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-3xl mb-2">📍</p>
        <p className="text-sm">No saved places yet.</p>
        <p className="text-xs mt-1">Click the map to add some!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {places.map((place) => {
        const w = weather[place.id];
        const code = w?.current_weather?.weathercode;
        const temp = w ? Math.round(w.current_weather.temperature) : null;

        return (
          <button
            key={place.id}
            onClick={() => onSelectPlace(place)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-800/60 hover:bg-gray-700/70 border border-gray-700/40 hover:border-gray-600/60 transition-all text-left group animate-slide-up"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl">{code != null ? getWeatherEmoji(code) : '📍'}</span>
              <span className="text-white text-sm font-medium truncate">{place.city_name}</span>
            </div>
            <div className="flex items-center gap-2">
              {temp != null && (
                <span className="text-gray-300 text-sm font-semibold">{temp}°C</span>
              )}
              <button
                onClick={(e) => handleDelete(e, place.id)}
                className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
                title="Remove place"
              >
                ✕
              </button>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export { savePlace };
