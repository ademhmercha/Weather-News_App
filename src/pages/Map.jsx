import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, Bookmark, Wind, Navigation, Search } from 'lucide-react';
import { fetchWeather, fetchNews, savePlace, detectLocation } from '../lib/api';
import { getWeatherLabel } from '../lib/weatherIcons';
import WeatherIcon from '../components/WeatherIcon';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createPin(color, pulse = false) {
  return L.divIcon({
    html: `<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center">
      ${pulse ? `<div style="position:absolute;width:32px;height:32px;border-radius:50%;background:${color};opacity:.22;animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite"></div>` : ''}
      <svg width="26" height="34" viewBox="0 0 24 32" fill="none">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20S24 21 24 12C24 5.37 18.63 0 12 0Z" fill="${color}"/>
        <circle cx="12" cy="12" r="5" fill="white" fill-opacity=".9"/>
      </svg>
    </div>`,
    className: '',
    iconSize: [32, 34],
    iconAnchor: [16, 34],
    popupAnchor: [0, -36],
  });
}

function ClickHandler({ onMapClick }) {
  useMapEvents({ click: e => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom ?? map.getZoom(), { duration: 1.4 });
  }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const [pins, setPins]             = useState([]);
  const [myLocation, setMyLocation] = useState(null);
  const [flyTarget, setFlyTarget]   = useState(null);
  const [activePin, setActivePin]   = useState(null);
  const [panel, setPanel]           = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [locating, setLocating]     = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    detectLocation()
      .then(loc => {
        setMyLocation({ lat: loc.lat, lon: loc.lon, city: loc.city });
        setFlyTarget({ center: [loc.lat, loc.lon], zoom: 10 });
      })
      .catch(() => setFlyTarget({ center: [33.8439, 9.4], zoom: 7 }))
      .finally(() => setLocating(false));
  }, []);

  async function reverseGeocode(lat, lon) {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'User-Agent': 'WeatherNewsApp/1.0' } }
      );
      const d = await r.json();
      const city    = d.address?.city || d.address?.town || d.address?.village || d.address?.county || d.display_name?.split(',')[0] || `${lat.toFixed(2)},${lon.toFixed(2)}`;
      const country = d.address?.country || '';
      return { city, country };
    } catch {
      return { city: `${lat.toFixed(2)},${lon.toFixed(2)}`, country: '' };
    }
  }

  async function loadPin(lat, lon) {
    const id = `${lat.toFixed(4)}:${lon.toFixed(4)}`;
    setActivePin(id);
    setPins(prev => prev.find(p => p.id === id) ? prev : [...prev, { id, lat, lon }]);
    setPanelLoading(true);
    setPanel(null);
    try {
      const { city, country } = await reverseGeocode(lat, lon);
      const [wx, news] = await Promise.all([
        fetchWeather(lat, lon),
        fetchNews(city, country).catch(() => ({ articles: [], label: '' })),
      ]);
      setPanel({ city, lat, lon, weather: wx, news: news.articles || [], newsLabel: news.label || city });
    } catch (e) { setPanel({ error: e.message }); }
    finally { setPanelLoading(false); }
  }

  function handleSearch(r) {
    setFlyTarget({ center: [r.lat, r.lon], zoom: 11 });
    loadPin(r.lat, r.lon);
    setSearchOpen(false);
  }

  function locateMe() {
    if (myLocation) {
      setFlyTarget({ center: [myLocation.lat, myLocation.lon], zoom: 12 });
    } else {
      setLocating(true);
      detectLocation()
        .then(loc => {
          setMyLocation({ lat: loc.lat, lon: loc.lon, city: loc.city });
          setFlyTarget({ center: [loc.lat, loc.lon], zoom: 12 });
        })
        .catch(() => {})
        .finally(() => setLocating(false));
    }
  }

  async function handleSave() {
    if (!panel?.city) return;
    try { await savePlace(panel.city, panel.lat, panel.lon); alert(`"${panel.city}" saved.`); }
    catch (e) { alert(e.message); }
  }

  function closePanel() { setPanel(null); setActivePin(null); }

  const hasPanel = panelLoading || panel;

  return (
    // pb-16 lg:pb-0 gives space for mobile bottom nav
    <div className="relative flex flex-col lg:flex-row h-[calc(100dvh-0px)] lg:h-[calc(100vh-0px)] pb-16 lg:pb-0">

      {/* Map */}
      <div className="flex-1 relative min-h-0">

        {/* Search bar */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-[min(340px,calc(100vw-32px))]">
          {searchOpen ? (
            <div className="animate-fade-in">
              <SearchBar onSelect={handleSearch} placeholder="Search Tunisian city..." />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-white transition-colors rounded-xl shadow-2xl"
              style={{ background:'rgba(5,8,14,0.75)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.10)' }}
            >
              <Search size={14} />
              Search a city...
            </button>
          )}
        </div>

        {/* Locate me — top-right on mobile, bottom-right on desktop */}
        <div className="absolute top-3 right-3 lg:top-auto lg:bottom-8 lg:right-4 z-[1000]">
          <button
            onClick={locateMe}
            disabled={locating}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/80 hover:text-white transition-all shadow-2xl disabled:opacity-50"
            style={{ background:'rgba(5,8,14,0.75)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.10)' }}
            title="My location"
          >
            <Navigation size={14} className={locating ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline">{locating ? 'Locating...' : (myLocation?.city ?? 'My location')}</span>
          </button>
        </div>

        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {flyTarget && <FlyTo center={flyTarget.center} zoom={flyTarget.zoom} />}
          <ClickHandler onMapClick={loadPin} />
          {myLocation && (
            <Marker position={[myLocation.lat, myLocation.lon]} icon={createPin('#10b981', true)} />
          )}
          {pins.map(p => (
            <Marker
              key={p.id}
              position={[p.lat, p.lon]}
              icon={createPin(p.id === activePin ? '#3b82f6' : '#64748b')}
              eventHandlers={{ click: () => loadPin(p.lat, p.lon) }}
            />
          ))}
        </MapContainer>

        {!pins.length && !locating && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
            <div className="px-4 py-2.5 rounded-xl text-white/50 text-sm whitespace-nowrap"
              style={{ background:'rgba(5,8,14,0.65)', backdropFilter:'blur(12px)' }}>
              Tap anywhere to see weather &amp; news
            </div>
          </div>
        )}
      </div>

      {/* Panel — right side on desktop, bottom sheet on mobile */}
      {hasPanel && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[1500] lg:hidden"
            onClick={closePanel}
          />

          <aside className={`
            fixed inset-x-0 bottom-0 z-[2000] rounded-t-3xl
            max-h-[75dvh] overflow-y-auto flex flex-col
            lg:relative lg:inset-auto lg:bottom-auto lg:top-0
            lg:w-80 xl:w-[390px] lg:rounded-none lg:max-h-full lg:z-auto
            lg:border-l
          `}
            style={{ background:'rgba(7,8,15,0.97)', backdropFilter:'blur(24px)', borderTop:'1px solid rgba(255,255,255,0.08)', borderColor:'rgba(255,255,255,0.06)' }}
          >
            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 lg:hidden flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {panelLoading ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <LoadingSpinner label="Loading location data..." />
              </div>
            ) : panel?.error ? (
              <div className="p-5 text-red-400 text-sm">{panel.error}</div>
            ) : panel ? (
              <Panel data={panel} onSave={handleSave} onClose={closePanel} />
            ) : null}
          </aside>
        </>
      )}
    </div>
  );
}

function Panel({ data, onSave, onClose }) {
  const { weather, city, news, newsLabel, lat, lon } = data;
  const cw = weather?.current_weather;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-start justify-between gap-3 p-4 border-b border-white/[0.05]">
        <div>
          <h2 className="text-white font-semibold text-base">{city}</h2>
          <p className="text-white/40 text-xs mt-0.5">{lat.toFixed(4)}, {lon.toFixed(4)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onSave}
            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors">
            <Bookmark size={12} /> Save
          </button>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {cw && (
        <div className="p-4 border-b border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-thin text-white">{Math.round(cw.temperature)}</span>
                <span className="text-xl text-white/40 mb-1.5">°C</span>
              </div>
              <p className="text-white/50 text-sm mt-1">{getWeatherLabel(cw.weathercode)}</p>
              <p className="text-white/30 text-xs mt-0.5 flex items-center gap-1">
                <Wind size={11} /> {Math.round(cw.windspeed)} km/h
              </p>
            </div>
            <WeatherIcon code={cw.weathercode} size={60} />
          </div>
        </div>
      )}

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-white/35 text-[10px] font-semibold uppercase tracking-widest">News</p>
          {newsLabel && newsLabel !== city && (
            <span className="text-white/25 text-[10px]">— {newsLabel}</span>
          )}
        </div>
        <div className="space-y-2">
          {news.slice(0, 4).map((a, i) => <NewsCard key={i} article={a} />)}
        </div>
      </div>
    </div>
  );
}
