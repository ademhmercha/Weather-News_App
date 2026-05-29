import { useState, useEffect, useCallback } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
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
  const [saved, setSaved] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async (loc) => {
    setLoading(true); setNewsLoading(true); setError(null); setSaved(false);
    try {
      const w = await fetchWeather(loc.lat, loc.lon);
      setWeather(w);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
    try {
      const n = await fetchNews(loc.city);
      setNews(n.articles || []);
    } catch { setNews([]); }
    finally { setNewsLoading(false); }
  }, []);

  useEffect(() => {
    detectCityFromIP()
      .then(loc => { setLocation(loc); loadData(loc); })
      .catch(() => { const loc = { city: 'London', lat: 51.5074, lon: -0.1278 }; setLocation(loc); loadData(loc); });
  }, [loadData]);

  async function handleSave() {
    if (!location || saved) return;
    setSaving(true);
    try { await savePlace(location.city, location.lat, location.lon); setSaved(true); setRefreshKey(k => k + 1); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }

  function handleSearchSelect(r) { const loc = { city: r.city, lat: r.lat, lon: r.lon }; setLocation(loc); loadData(loc); }
  function handleSelectSaved(p) { const loc = { city: p.city_name, lat: p.lat, lon: p.lon }; setLocation(loc); loadData(loc); }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-7">

        {/* Sidebar */}
        <aside className="lg:w-64 xl:w-72 flex-shrink-0">
          <div className="sticky top-20 space-y-6">
            <SearchBar onSelect={handleSearchSelect} />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3 px-1">
                Saved Places
              </p>
              <SavedPlaces key={refreshKey} onSelectPlace={handleSelectSaved} />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 space-y-5">
          {loading ? (
            <LoadingSpinner label="Detecting your location" />
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-slate-100 text-lg font-semibold">{location?.city}</h1>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {location?.lat?.toFixed(4)}, {location?.lon?.toFixed(4)}
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl border transition-all duration-200
                    ${saved
                      ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                      : 'bg-slate-800/60 border-white/[0.07] text-slate-400 hover:text-slate-100 hover:border-white/20 hover:bg-slate-700/50'
                    } disabled:opacity-50`}
                >
                  {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  {saved ? 'Saved' : saving ? 'Saving...' : 'Save place'}
                </button>
              </div>
              <WeatherCard weather={weather} cityName={location?.city} />
              <ForecastCard weather={weather} />
            </>
          )}

          <section>
            <div className="flex items-center gap-3 mb-4 pt-2">
              <div className="w-px h-4 bg-blue-500 rounded-full" />
              <h2 className="text-slate-300 font-medium text-sm">
                Local News
                {location && <span className="text-slate-600 font-normal"> — {location.city}</span>}
              </h2>
            </div>
            {newsLoading ? (
              <LoadingSpinner size="sm" label="Loading news" />
            ) : news.length > 0 ? (
              <div className="space-y-1.5">
                {news.map((a, i) => <NewsCard key={i} article={a} />)}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-600 text-sm">
                No news available for {location?.city}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
