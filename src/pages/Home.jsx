import { useState, useEffect, useCallback } from 'react';
import { fetchWeather, fetchNews, detectCityFromIP, savePlace } from '../lib/api';
import WeatherCard from '../components/WeatherCard';
import ForecastCard from '../components/ForecastCard';
import NewsCard from '../components/NewsCard';
import SavedPlaces from '../components/SavedPlaces';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async (loc) => {
    setLoading(true);
    setNewsLoading(true);
    setError(null);
    try {
      const weatherData = await fetchWeather(loc.lat, loc.lon);
      setWeather(weatherData);
    } catch (err) {
      setError(`Weather error: ${err.message}`);
    } finally {
      setLoading(false);
    }
    try {
      const newsData = await fetchNews(loc.city);
      setNews(newsData.articles || []);
    } catch {
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    detectCityFromIP()
      .then((loc) => {
        setLocation(loc);
        loadData(loc);
      })
      .catch(() => {
        const fallback = { city: 'London', lat: 51.5074, lon: -0.1278 };
        setLocation(fallback);
        loadData(fallback);
      });
  }, [loadData]);

  async function handleSearchSelect(result) {
    const loc = { city: result.city, lat: result.lat, lon: result.lon };
    setLocation(loc);
    await loadData(loc);
  }

  function handleSelectSavedPlace(place) {
    const loc = { city: place.city_name, lat: place.lat, lon: place.lon };
    setLocation(loc);
    loadData(loc);
  }

  async function handleSave() {
    if (!location) return;
    setSaving(true);
    try {
      await savePlace(location.city, location.lat, location.lon);
      setSavedMsg('Saved!');
      setRefreshKey((k) => k + 1);
      setTimeout(() => setSavedMsg(''), 2000);
    } catch (err) {
      setSavedMsg(err.message);
      setTimeout(() => setSavedMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-72 flex-shrink-0">
          <div className="bg-gray-900/50 border border-gray-700/40 rounded-2xl p-4 sticky top-20">
            <SearchBar onSelect={handleSearchSelect} />
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Saved Places
                </h3>
              </div>
              <SavedPlaces key={refreshKey} onSelectPlace={handleSelectSavedPlace} />
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 space-y-4">
          {loading ? (
            <LoadingSpinner label="Detecting your location…" />
          ) : error ? (
            <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-2xl text-red-300 text-sm">
              {error}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-white text-xl font-bold">
                    📍 {location?.city}
                  </h1>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {location?.lat?.toFixed(4)}, {location?.lon?.toFixed(4)}
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                  ) : (
                    '🔖'
                  )}
                  {savedMsg || 'Save place'}
                </button>
              </div>

              <WeatherCard weather={weather} cityName={location?.city} />
              <ForecastCard weather={weather} />
            </>
          )}

          <section>
            <h2 className="text-gray-300 font-semibold text-base mb-3 flex items-center gap-2">
              <span>📰</span>
              Local News
              {location && (
                <span className="text-gray-500 font-normal text-sm">— {location.city}</span>
              )}
            </h2>
            {newsLoading ? (
              <LoadingSpinner size="sm" label="Loading news…" />
            ) : news.length > 0 ? (
              <div className="space-y-2">
                {news.map((article, i) => (
                  <NewsCard key={i} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-2xl mb-2">📰</p>
                <p className="text-sm">No news found for {location?.city}</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
