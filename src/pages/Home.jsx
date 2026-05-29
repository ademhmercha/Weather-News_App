import { useState, useEffect, useCallback } from 'react';
import { Bookmark, BookmarkCheck, CloudSun, Newspaper } from 'lucide-react';
import { fetchWeather, fetchNews, detectCityFromIP, savePlace } from '../lib/api';
import WeatherCard from '../components/WeatherCard';
import ForecastCard from '../components/ForecastCard';
import HourlyForecast from '../components/HourlyForecast';
import MetricsGrid from '../components/MetricsGrid';
import NewsCard from '../components/NewsCard';
import SavedPlaces from '../components/SavedPlaces';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = [
  { id: 'weather', label: 'Weather', icon: CloudSun },
  { id: 'news',    label: 'News',    icon: Newspaper },
];

export default function Home() {
  const [location, setLocation]       = useState(null);
  const [weather, setWeather]         = useState(null);
  const [news, setNews]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);
  const [error, setError]             = useState(null);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [tab, setTab]                 = useState('weather');
  const [refreshKey, setRefreshKey]   = useState(0);

  const loadData = useCallback(async (loc) => {
    setLoading(true); setNewsLoading(true); setError(null); setSaved(false);
    try {
      setWeather(await fetchWeather(loc.lat, loc.lon));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
    try {
      const n = await fetchNews(loc.city, loc.country ?? '');
      setNews(n.articles || []);
    } catch { setNews([]); }
    finally { setNewsLoading(false); }
  }, []);

  useEffect(() => {
    detectCityFromIP()
      .then(loc => { setLocation(loc); loadData(loc); })
      .catch(() => {
        const loc = { city: 'Tunis', lat: 36.8065, lon: 10.1815, country: 'Tunisia' };
        setLocation(loc); loadData(loc);
      });
  }, [loadData]);

  async function handleSave() {
    if (!location || saved) return;
    setSaving(true);
    try { await savePlace(location.city, location.lat, location.lon); setSaved(true); setRefreshKey(k => k + 1); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }

  function selectLocation(city, lat, lon, country = '') {
    const loc = { city, lat, lon, country };
    setLocation(loc);
    loadData(loc);
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 flex flex-col lg:flex-row gap-6">

        {/* ── Sidebar ── */}
        <aside className="lg:w-64 xl:w-72 flex-shrink-0 space-y-5">
          <div className="sticky top-20 space-y-5">
            <SearchBar
              onSelect={r => selectLocation(r.city, r.lat, r.lon)}
              placeholder="Search city..."
            />
            <div>
              <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-2 px-1">
                Saved Locations
              </p>
              <SavedPlaces
                key={refreshKey}
                onSelectPlace={p => selectLocation(p.city_name, p.lat, p.lon)}
              />
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 min-w-0 space-y-4">

          {/* Location header */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold text-slate-100 leading-tight">
                {location?.city ?? '—'}
              </h1>
              {location && (
                <p className="text-slate-600 text-xs mt-0.5">
                  {location.lat?.toFixed(4)}, {location.lon?.toFixed(4)}
                </p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl border transition-all duration-200 disabled:opacity-50
                ${saved
                  ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                  : 'bg-slate-900/60 border-white/[0.07] text-slate-400 hover:text-slate-100 hover:border-white/20'
                }`}
            >
              {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              {saved ? 'Saved' : saving ? 'Saving…' : 'Save place'}
            </button>
          </div>

          {/* ── Tab bar ── */}
          <div className="flex items-center gap-1 bg-slate-900/60 border border-white/[0.06] rounded-xl p-1 w-fit">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={15} strokeWidth={tab === id ? 2 : 1.5} />
                {label}
              </button>
            ))}
          </div>

          {/* ── Weather Tab ── */}
          {tab === 'weather' && (
            loading ? (
              <LoadingSpinner label="Detecting your location" />
            ) : error ? (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <WeatherCard weather={weather} cityName={location?.city} />
                <HourlyForecast weather={weather} />
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                  <div className="xl:col-span-2">
                    <ForecastCard weather={weather} />
                  </div>
                  <div className="xl:col-span-3">
                    <MetricsGrid weather={weather} />
                  </div>
                </div>
              </div>
            )
          )}

          {/* ── News Tab ── */}
          {tab === 'news' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-px h-4 bg-blue-500 rounded-full" />
                <p className="text-slate-400 text-sm">
                  {location?.city}
                  <span className="text-slate-600 ml-1">— Latest news</span>
                </p>
              </div>
              {newsLoading ? (
                <LoadingSpinner size="sm" label="Loading news" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {news.map((a, i) => <NewsCard key={i} article={a} />)}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
