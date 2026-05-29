import { useState, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import L from 'leaflet';
import { X, Bookmark, Wind } from 'lucide-react';
import { fetchWeather, fetchNews, savePlace } from '../lib/api';
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

function createPin(color = '#3b82f6') {
  return L.divIcon({
    html: `<svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20S24 21 24 12C24 5.37 18.63 0 12 0Z" fill="${color}"/>
      <circle cx="12" cy="12" r="5" fill="white" fill-opacity="0.9"/>
    </svg>`,
    className: '',
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -34],
  });
}

function ClickHandler({ onMapClick }) {
  useMapEvents({ click: e => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function MapPage() {
  const [pins, setPins] = useState([]);
  const [activePin, setActivePin] = useState(null);
  const [panel, setPanel] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const mapRef = useRef(null);

  async function reverseGeocode(lat, lon) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
        headers: { 'User-Agent': 'WeatherNewsApp/1.0' },
      });
      const d = await r.json();
      const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || d.display_name?.split(',')[0] || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      const country = d.address?.country || null;
      return { city, country };
    } catch { return { city: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, country: null }; }
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
    mapRef.current?.flyTo([r.lat, r.lon], 11, { duration: 1.2 });
    loadPin(r.lat, r.lon);
  }

  async function handleSave() {
    if (!panel?.city) return;
    try { await savePlace(panel.city, panel.lat, panel.lon); alert(`"${panel.city}" saved.`); }
    catch (e) { alert(e.message); }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className="flex-1 relative">
        {/* Floating search */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-80 shadow-2xl">
          <SearchBar onSelect={handleSearch} placeholder="Search city on map..." />
        </div>

        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} ref={mapRef}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onMapClick={loadPin} />
          {pins.map(pin => (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lon]}
              icon={createPin(pin.id === activePin ? '#3b82f6' : '#475569')}
              eventHandlers={{ click: () => loadPin(pin.lat, pin.lon) }}
            />
          ))}
        </MapContainer>

        {!pins.length && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
            <div className="glass rounded-xl px-5 py-2.5 text-slate-400 text-sm">
              Click anywhere on the map to explore weather &amp; news
            </div>
          </div>
        )}
      </div>

      {/* Side panel */}
      {(panelLoading || panel) && (
        <aside className="w-80 lg:w-[380px] flex-shrink-0 bg-slate-950 border-l border-white/[0.06] overflow-y-auto flex flex-col">
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
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5 border-b border-white/[0.05]">
        <div>
          <h2 className="text-slate-100 font-semibold text-base leading-tight">{city}</h2>
          <p className="text-slate-600 text-xs mt-0.5">{lat.toFixed(4)}, {lon.toFixed(4)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onSave}
            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors">
            <Bookmark size={12} />Save
          </button>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Weather */}
      {cw && (
        <div className="p-5 border-b border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-thin text-slate-100">{Math.round(cw.temperature)}</span>
                <span className="text-xl text-slate-500 mb-1.5">°C</span>
              </div>
              <p className="text-slate-500 text-sm mt-1">{getWeatherLabel(cw.weathercode)}</p>
              <p className="text-slate-600 text-xs mt-1 flex items-center gap-1">
                <Wind size={11} />
                {Math.round(cw.windspeed)} km/h
              </p>
            </div>
            <WeatherIcon code={cw.weathercode} size={56} />
          </div>
        </div>
      )}

      {/* News */}
      <div className="flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">News</p>
          {newsLabel && newsLabel !== city && (
            <span className="text-xs text-slate-600 normal-case">— {newsLabel}</span>
          )}
        </div>
        <div className="space-y-1.5">
          {news.slice(0, 3).map((a, i) => <NewsCard key={i} article={a} />)}
        </div>
      </div>
    </div>
  );
}
