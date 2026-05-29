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
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function pin(color, pulse = false) {
  return L.divIcon({
    html: `<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center">
      ${pulse ? `<div style="position:absolute;width:32px;height:32px;border-radius:50%;background:${color};opacity:0.25;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>` : ''}
      <svg width="26" height="34" viewBox="0 0 24 32" fill="none">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20S24 21 24 12C24 5.37 18.63 0 12 0Z" fill="${color}"/>
        <circle cx="12" cy="12" r="5" fill="white" fill-opacity="0.9"/>
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
  const [pins, setPins]               = useState([]);
  const [myLocation, setMyLocation]   = useState(null);
  const [flyTarget, setFlyTarget]     = useState(null);
  const [activePin, setActivePin]     = useState(null);
  const [panel, setPanel]             = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [locating, setLocating]       = useState(true);
  const [searchOpen, setSearchOpen]   = useState(false);
  const mapRef = useRef(null);

  // On mount: fly to user's real location
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
      const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || d.display_name?.split(',')[0] || `${lat.toFixed(2)},${lon.toFixed(2)}`;
      return { city, country: d.address?.country || '' };
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
      setPanel({ city, country, lat, lon, weather: wx, news: news.articles || [], newsLabel: news.label || city });
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

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">

      {/* Map area */}
      <div className="flex-1 relative">

        {/* Floating search bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-80 max-w-[90vw]">
          {searchOpen ? (
            <div className="animate-fade-in">
              <SearchBar onSelect={handleSearch} placeholder="Search any city..." />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full glass-raised rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-slate-400 hover:text-slate-200 transition-colors text-sm shadow-2xl"
            >
              <Search size={14} />
              <span>Search a city...</span>
            </button>
          )}
        </div>

        {/* Locate me button */}
        <div className="absolute bottom-8 right-4 z-[1000]">
          <button
            onClick={locateMe}
            disabled={locating}
            className="glass-raised rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-all shadow-2xl disabled:opacity-50"
            title="Back to my location"
          >
            <Navigation size={15} className={locating ? 'animate-pulse' : ''} />
            {locating ? 'Locating...' : myLocation?.city ?? 'My location'}
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

          {/* My location pin */}
          {myLocation && (
            <Marker
              position={[myLocation.lat, myLocation.lon]}
              icon={pin('#10b981', true)}
            />
          )}

          {/* Clicked pins */}
          {pins.map(p => (
            <Marker
              key={p.id}
              position={[p.lat, p.lon]}
              icon={pin(p.id === activePin ? '#3b82f6' : '#64748b')}
              eventHandlers={{ click: () => loadPin(p.lat, p.lon) }}
            />
          ))}
        </MapContainer>

        {/* Click hint */}
        {!pins.length && !locating && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
            <div className="glass rounded-xl px-5 py-2.5 text-slate-400 text-sm whitespace-nowrap">
              Click anywhere to see weather &amp; news
            </div>
          </div>
        )}
      </div>

      {/* Side panel */}
      {(panelLoading || panel) && (
        <aside className="w-80 lg:w-[390px] flex-shrink-0 bg-slate-950 border-l border-white/[0.06] overflow-y-auto flex flex-col">
          {panelLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner label="Loading location data" />
            </div>
          ) : panel?.error ? (
            <div className="p-5 text-red-400 text-sm">{panel.error}</div>
          ) : panel ? (
            <Panel data={panel} onSave={handleSave} onClose={() => { setPanel(null); setActivePin(null); }} />
          ) : null}
        </aside>
      )}
    </div>
  );
}

function Panel({ data, onSave, onClose }) {
  const { weather, city, news, newsLabel, lat, lon } = data;
  const cw = weather?.current_weather;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 p-5 border-b border-white/[0.05]">
        <div>
          <h2 className="text-slate-100 font-semibold text-base">{city}</h2>
          <p className="text-slate-600 text-xs mt-0.5">{lat.toFixed(4)}, {lon.toFixed(4)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onSave}
            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors">
            <Bookmark size={12} /> Save
          </button>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {cw && (
        <div className="p-5 border-b border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-thin text-slate-100">{Math.round(cw.temperature)}</span>
                <span className="text-xl text-slate-500 mb-1.5">°C</span>
              </div>
              <p className="text-slate-400 text-sm mt-1">{getWeatherLabel(cw.weathercode)}</p>
              <p className="text-slate-600 text-xs mt-1 flex items-center gap-1">
                <Wind size={11} /> {Math.round(cw.windspeed)} km/h
              </p>
            </div>
            <WeatherIcon code={cw.weathercode} size={60} />
          </div>
        </div>
      )}

      <div className="flex-1 p-5 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">News</p>
          {newsLabel && newsLabel !== city && (
            <span className="text-xs text-slate-700">— {newsLabel}</span>
          )}
        </div>
        <div className="space-y-2">
          {news.slice(0, 4).map((a, i) => <NewsCard key={i} article={a} />)}
        </div>
      </div>
    </div>
  );
}
