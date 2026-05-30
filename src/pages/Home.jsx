import { useState, useEffect, useCallback } from 'react';
import { Bookmark, BookmarkCheck, CloudSun, Newspaper, Search, X } from 'lucide-react';
import { fetchWeather, fetchNews, fetchAQI, detectLocation, savePlace } from '../lib/api';
import { getWeatherLabel, getSkyStyle, getAtmosphereOverlay } from '../lib/weatherIcons';
import WeatherIcon from '../components/WeatherIcon';
import WeatherBackground from '../components/WeatherBackground';
import ForecastCard from '../components/ForecastCard';
import HourlyForecast from '../components/HourlyForecast';
import MetricsGrid from '../components/MetricsGrid';
import ComfortScore, { computeComfortScore } from '../components/ComfortScore';
import SavedPlaces from '../components/SavedPlaces';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import SplashScreen from '../components/SplashScreen';

// ── Helpers ────────────────────────────────────────────────────────────────────

// Takes already-derived values (current hour) instead of recalculating from hourly[0]
function generateSummary({ code, temp, feelsLike, uv, rain, wind, aqi }) {
  if (temp == null) return '';
  const parts = [];

  if ((uv ?? 0) >= 8) parts.push('very high UV — apply sunscreen');
  else if ((uv ?? 0) >= 6) parts.push('high UV levels today');

  if ((rain ?? 0) >= 70) parts.push('rain very likely — bring an umbrella');
  else if ((rain ?? 0) >= 40) parts.push('possible showers later');

  if (feelsLike != null && Math.abs(Math.round(feelsLike) - temp) >= 3)
    parts.push(
      `feels ${Math.round(feelsLike) < temp
        ? `${temp - Math.round(feelsLike)}° cooler`
        : `${Math.round(feelsLike) - temp}° warmer`} than actual`
    );

  if ((wind ?? 0) >= 50) parts.push('strong winds expected');
  if (aqi && aqi >= 100) parts.push('poor air quality — limit outdoor exposure');

  const base = parts.length ? parts.join(', ') : getWeatherLabel(code);
  return base.charAt(0).toUpperCase() + base.slice(1) + '.';
}

function aqiColor(v) {
  if (v <= 50)  return '#10b981';
  if (v <= 100) return '#f59e0b';
  if (v <= 150) return '#f97316';
  if (v <= 200) return '#ef4444';
  return '#8b5cf6';
}
function aqiLabel(v) {
  if (v <= 50)  return 'Good';
  if (v <= 100) return 'Moderate';
  if (v <= 150) return 'Unhealthy (SG)';
  if (v <= 200) return 'Unhealthy';
  if (v <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Home() {
  const [location, setLocation]       = useState(null);
  const [weather, setWeather]         = useState(null);
  const [aqiData, setAqiData]         = useState(null);
  const [news, setNews]               = useState([]);
  const [cityImage, setCityImage]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);
  const [error, setError]             = useState(null);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [tab, setTab]                 = useState('weather');
  const [showSearch, setShowSearch]   = useState(false);
  const [showPlaces, setShowPlaces]   = useState(false);
  const [refreshKey, setRefreshKey]     = useState(0);
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashStatus, setSplashStatus]   = useState('Detecting your location…');

  const loadData = useCallback(async (loc) => {
    setLoading(true); setNewsLoading(true); setError(null); setSaved(false);
    setSplashStatus(`Loading weather for ${loc.city}…`);
    try {
      const [wx, aq] = await Promise.all([
        fetchWeather(loc.lat, loc.lon),
        fetchAQI(loc.lat, loc.lon).catch(() => null),
      ]);
      setWeather(wx);
      setAqiData(aq);
    } catch (e) { setError(e.message); }
    finally {
      setLoading(false);
      // Hide splash once weather is loaded — min 1s total display time
      setTimeout(() => setSplashVisible(false), 400);
    }
    try {
      const n = await fetchNews(loc.city, loc.country ?? '');
      setNews(n.articles || []);
    } catch { setNews([]); }
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

  // Fetch Wikipedia city photo
  useEffect(() => {
    if (!location?.city) return;
    setCityImage(null);
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(location.city)}`)
      .then(r => r.json())
      .then(d => setCityImage(d.thumbnail?.source ?? null))
      .catch(() => {});
  }, [location?.city]);

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

  // Derived weather values
  const cw     = weather?.current_weather;
  const code   = cw?.weathercode ?? 0;
  const isDay  = (cw?.is_day ?? 1) === 1;
  const temp   = cw ? Math.round(cw.temperature) : null;
  const hourly = weather?.hourly;
  const daily  = weather?.daily;
  const ci     = Math.max(0, (hourly?.time ?? []).findIndex(t => new Date(t) >= new Date()));
  const feelsLike  = hourly?.apparent_temperature?.[ci];
  const humidity   = hourly?.relative_humidity_2m?.[ci];
  const rain       = hourly?.precipitation_probability?.[ci];
  const uv         = daily?.uv_index_max?.[0];
  const wind       = cw?.windspeed;
  const aqi        = aqiData?.aqi;

  const comfort = weather ? computeComfortScore({ temp, feelsLike, humidity, uv, rain, wind }) : null;
  // Use current-hour values (not hourly[0]) so summary is always accurate
  const summary = generateSummary({ code, temp, feelsLike, uv, rain, wind, aqi });
  const sky     = getSkyStyle(code, isDay);

  return (
    <>
      <SplashScreen visible={splashVisible} status={splashStatus} />

    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: sky.bg }}>
      {/* Animated background layer */}
      <WeatherBackground code={code} isDay={isDay} />

      {/* Atmospheric overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: getAtmosphereOverlay(code, isDay) }} />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* ── Top action bar (buttons only) ── */}
      <div className="relative z-20 flex items-center justify-end gap-2 px-5 pt-4 pb-2">
        <button onClick={() => { setShowSearch(s => !s); setShowPlaces(false); }}
          className="p-2 rounded-xl bg-black/25 backdrop-blur hover:bg-black/40 text-white/70 hover:text-white transition-all">
          <Search size={15} />
        </button>
        <button onClick={() => { setShowPlaces(s => !s); setShowSearch(false); }}
          className="px-3 py-2 rounded-xl bg-black/25 backdrop-blur hover:bg-black/40 text-white/60 hover:text-white text-xs font-medium transition-all">
          Saved
        </button>
        <button onClick={handleSave} disabled={saving || saved}
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all disabled:opacity-50 backdrop-blur ${
            saved ? 'bg-blue-500/25 border-blue-400/35 text-blue-300' : 'bg-black/25 border-white/15 text-white/60 hover:text-white hover:bg-black/40'
          }`}>
          {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
          {saved ? 'Saved' : saving ? '…' : 'Save'}
        </button>
      </div>

      {/* ── City photo card — always clearly visible ── */}
      <div className="relative z-20 mx-4 sm:mx-5 mb-4 rounded-2xl overflow-hidden"
        style={{ height: '170px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        {cityImage ? (
          <img
            src={cityImage}
            alt={location?.city}
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.85) saturate(1.1)' }}
          />
        ) : (
          /* Placeholder while image loads or unavailable */
          <div className="w-full h-full"
            style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%)' }} />
        )}
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* City name at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
          <h1 className="text-white text-2xl font-bold leading-tight drop-shadow-lg">
            {location?.city ?? '—'}
          </h1>
          <p className="text-white/60 text-xs mt-0.5 tracking-wide">{location?.country}</p>
        </div>
      </div>

      {/* Search dropdown */}
      {showSearch && (
        <div className="relative z-20 px-5 pb-3 animate-fade-in">
          <SearchBar onSelect={r => go(r.city, r.lat, r.lon)} placeholder="Search Tunisian city..." />
        </div>
      )}

      {/* Saved places dropdown */}
      {showPlaces && (
        <div className="relative z-20 mx-5 mb-3 rounded-2xl p-4 animate-fade-in"
          style={{ background:'rgba(0,0,0,0.45)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.10)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Saved locations</p>
            <button onClick={() => setShowPlaces(false)} className="text-white/35 hover:text-white/70 transition-colors">
              <X size={14} />
            </button>
          </div>
          <SavedPlaces key={refreshKey} onSelectPlace={p => go(p.city_name, p.lat, p.lon)} />
        </div>
      )}

      {/* ── Tab pills ── */}
      <div className="relative z-20 flex gap-3 px-5 mb-3">
        {[
          { id: 'weather', label: 'Weather', Icon: CloudSun },
          { id: 'news',    label: 'News',    Icon: Newspaper },
        ].map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
              tab === id
                ? 'bg-white/20 text-white backdrop-blur shadow-lg'
                : 'bg-black/15 text-white/40 hover:bg-black/25 hover:text-white/70 backdrop-blur'
            }`}>
            <Icon size={17} strokeWidth={tab === id ? 2 : 1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* ── WEATHER TAB ── */}
      {tab === 'weather' && (
        <div className="relative z-10 flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner size="lg" label="Detecting location…" />
            </div>
          ) : error ? (
            <div className="mx-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>
          ) : (
            <div className="px-4 sm:px-5 space-y-3 animate-fade-in pb-24 lg:pb-8">

              {/* ── Hero: icon + temp + condition + summary ── */}
              <div className="flex items-center gap-4 py-2">
                <WeatherIcon code={code} size={80} className="flex-shrink-0 drop-shadow-2xl" />
                <div>
                  <div className="flex items-start leading-none">
                    <span className="text-white font-thin" style={{ fontSize:'clamp(64px,15vw,100px)', lineHeight:'1' }}>
                      {temp}
                    </span>
                    <span className="text-white/50 text-xl font-light mt-2.5 ml-1">°C</span>
                  </div>
                  <p className="text-white/90 text-base font-light mt-0.5">{getWeatherLabel(code)}</p>
                  {summary && (
                    <p className="text-white/45 text-xs mt-1.5 leading-relaxed" style={{ maxWidth:'min(240px,55vw)' }}>{summary}</p>
                  )}
                </div>
              </div>

              {/* AQI badge (if available) */}
              {aqi != null && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl w-fit"
                  style={{ background:'rgba(0,0,0,0.25)', border:`1px solid ${aqiColor(aqi)}40`, backdropFilter:'blur(12px)' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: aqiColor(aqi) }} />
                  <span className="text-white/60 text-xs">AQI</span>
                  <span className="text-white text-sm font-semibold">{Math.round(aqi)}</span>
                  <span className="text-xs font-medium" style={{ color: aqiColor(aqi) }}>{aqiLabel(aqi)}</span>
                </div>
              )}

              {/* Inline metrics */}
              <MetricsGrid weather={weather} inline />

              {/* Comfort Score */}
              {comfort != null && <ComfortScore score={comfort} />}

              {/* Hourly */}
              <HourlyForecast weather={weather} />

              {/* Daily */}
              <ForecastCard weather={weather} />
            </div>
          )}
        </div>
      )}

      {/* ── NEWS TAB ── */}
      {tab === 'news' && (
        <div className="relative z-10 flex-1 px-4 sm:px-5 pb-24 lg:pb-8 animate-fade-in">
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-4 mt-1">
            Latest — {location?.city}
          </p>
          {newsLoading ? (
            <LoadingSpinner size="sm" label="Loading news…" />
          ) : (
            <div className="space-y-2">
              {news.map((a, i) => (
                <NewsCard key={i} article={a} featured={i === 0 && !!a.urlToImage} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
