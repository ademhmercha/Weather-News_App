import { useState, useEffect, useCallback } from 'react';
import { Bookmark, BookmarkCheck, CloudSun, Newspaper, Search, X } from 'lucide-react';
import { fetchWeather, fetchNews, detectLocation, savePlace } from '../lib/api';
import { getWeatherLabel, getSkyStyle, getAtmosphereOverlay } from '../lib/weatherIcons';
import WeatherIcon from '../components/WeatherIcon';
import ForecastCard from '../components/ForecastCard';
import HourlyForecast from '../components/HourlyForecast';
import MetricsGrid from '../components/MetricsGrid';
import SavedPlaces from '../components/SavedPlaces';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = [
  { id: 'weather', label: 'Weather', Icon: CloudSun },
  { id: 'news',    label: 'News',    Icon: Newspaper },
];

export default function Home() {
  const [location, setLocation]         = useState(null);
  const [weather, setWeather]           = useState(null);
  const [news, setNews]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [newsLoading, setNewsLoading]   = useState(false);
  const [error, setError]               = useState(null);
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [tab, setTab]                   = useState('weather');
  const [showSearch, setShowSearch]     = useState(false);
  const [showPlaces, setShowPlaces]     = useState(false);
  const [refreshKey, setRefreshKey]     = useState(0);

  const loadData = useCallback(async (loc) => {
    setLoading(true); setNewsLoading(true); setError(null); setSaved(false);
    try { setWeather(await fetchWeather(loc.lat, loc.lon)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
    try { const n = await fetchNews(loc.city, loc.country ?? ''); setNews(n.articles || []); }
    catch { setNews([]); }
    finally { setNewsLoading(false); }
  }, []);

  useEffect(() => {
    detectLocation()
      .then(loc => { setLocation(loc); loadData(loc); })
      .catch(() => {
        const loc = { city: 'Tunis', lat: 36.8065, lon: 10.1815, country: 'Tunisia' };
        setLocation(loc); loadData(loc);
      });
  }, [loadData]);

  function go(city, lat, lon, country = '') {
    const loc = { city, lat, lon, country };
    setLocation(loc); loadData(loc); setShowSearch(false); setShowPlaces(false);
  }

  async function handleSave() {
    if (!location || saved) return;
    setSaving(true);
    try { await savePlace(location.city, location.lat, location.lon); setSaved(true); setRefreshKey(k => k + 1); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }

  const cw   = weather?.current_weather;
  const code = cw?.weathercode ?? 0;
  const isDay = (cw?.is_day ?? 1) === 1;
  const sky  = getSkyStyle(code, isDay);
  const atm  = getAtmosphereOverlay(code, isDay);
  const temp = cw ? Math.round(cw.temperature) : null;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: sky.bg }}>
      {/* Atmospheric glow overlay */}
      {atm !== 'none' && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: atm }} />
      )}
      {/* Vignette bottom */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* ── Top bar ── */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-5 pb-3">
        <div>
          <h1 className="text-white text-xl font-semibold leading-tight drop-shadow">{location?.city ?? '—'}</h1>
          <p className="text-white/50 text-xs mt-0.5">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowSearch(s => !s); setShowPlaces(false); }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
          >
            <Search size={16} />
          </button>
          <button
            onClick={() => { setShowPlaces(s => !s); setShowSearch(false); }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all text-xs font-medium px-3"
          >
            Saved
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all disabled:opacity-50 ${
              saved ? 'bg-blue-500/30 border-blue-400/40 text-blue-300' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
            {saved ? 'Saved' : saving ? '…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Dropdown: Search */}
      {showSearch && (
        <div className="relative z-20 px-6 pb-3 animate-fade-in">
          <SearchBar onSelect={r => go(r.city, r.lat, r.lon)} placeholder="Search Tunisian city..." />
        </div>
      )}

      {/* Dropdown: Saved places */}
      {showPlaces && (
        <div className="relative z-20 mx-6 mb-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Saved Locations</p>
            <button onClick={() => setShowPlaces(false)} className="text-white/40 hover:text-white/80">
              <X size={14} />
            </button>
          </div>
          <SavedPlaces key={refreshKey} onSelectPlace={p => go(p.city_name, p.lat, p.lon)} />
        </div>
      )}

      {/* ── Tab bar ── */}
      <div className="relative z-20 flex items-center gap-1 px-6 mb-2">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
              tab === id ? 'bg-white/20 text-white backdrop-blur' : 'text-white/45 hover:text-white/75'
            }`}
          >
            <Icon size={14} strokeWidth={tab === id ? 2 : 1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Weather Tab ── */}
      {tab === 'weather' && (
        <div className="relative z-10 flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner size="lg" label="Loading weather..." />
            </div>
          ) : error ? (
            <div className="mx-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>
          ) : (
            <>
              {/* Hero */}
              <div className="flex flex-col items-center justify-center pt-4 pb-6 px-6 text-center">
                <WeatherIcon code={code} size={130} className="drop-shadow-2xl mb-2" />
                <div className="flex items-start">
                  <span className="text-white font-thin leading-none drop-shadow-lg"
                    style={{ fontSize: 'clamp(80px, 14vw, 130px)' }}>
                    {temp}
                  </span>
                  <span className="text-white/60 text-4xl font-light mt-6 ml-2">°C</span>
                </div>
                <p className="text-white text-xl font-light mt-1 drop-shadow">{getWeatherLabel(code)}</p>
                <p className="text-white/45 text-xs mt-1">Updated {timeStr}</p>
              </div>

              {/* Inline stats */}
              <MetricsGrid weather={weather} inline />

              {/* Hourly */}
              <div className="px-4 mt-4">
                <HourlyForecast weather={weather} />
              </div>

              {/* Daily */}
              <div className="px-4 mt-3 pb-6">
                <ForecastCard weather={weather} />
              </div>
            </>
          )}
        </div>
      )}

      {/* ── News Tab ── */}
      {tab === 'news' && (
        <div className="relative z-10 flex-1 px-6 pb-6 overflow-auto animate-fade-in">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4 mt-2">
            Latest news — {location?.city}
          </p>
          {newsLoading ? (
            <LoadingSpinner size="sm" label="Loading news..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {news.map((a, i) => <NewsCard key={i} article={a} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
