import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { fetchWeather, fetchNews, geocodeSearch, savePlace } from '../lib/api';
import { getWeatherEmoji, getWeatherLabel } from '../lib/weatherIcons';
import SearchBar from '../components/SearchBar';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

// Fix Leaflet default icon URLs broken by Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createWeatherIcon(emoji) {
  return L.divIcon({
    html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6))">${emoji}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPage() {
  const [pins, setPins] = useState([]);
  const [activePin, setActivePin] = useState(null);
  const [panelData, setPanelData] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom] = useState(2);
  const mapRef = useRef(null);

  async function loadPinData(lat, lon) {
    setPanelLoading(true);
    setPanelData(null);
    try {
      const [weatherData, cityName] = await Promise.all([
        fetchWeather(lat, lon),
        reverseGeocode(lat, lon),
      ]);
      const newsData = await fetchNews(cityName).catch(() => ({ articles: [] }));
      setPanelData({ weather: weatherData, city: cityName, news: newsData.articles || [], lat, lon });
    } catch (err) {
      setPanelData({ error: err.message });
    } finally {
      setPanelLoading(false);
    }
  }

  async function reverseGeocode(lat, lon) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'User-Agent': 'WeatherNewsApp/1.0' } }
      );
      const data = await res.json();
      return (
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        data.display_name?.split(',')[0] ||
        `${lat.toFixed(2)}, ${lon.toFixed(2)}`
      );
    } catch {
      return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }
  }

  function handleMapClick(lat, lon) {
    const id = `${lat.toFixed(4)}-${lon.toFixed(4)}`;
    const newPin = { id, lat, lon };
    setActivePin(id);
    setPins((prev) => {
      const exists = prev.find((p) => p.id === id);
      return exists ? prev : [...prev, newPin];
    });
    loadPinData(lat, lon);
  }

  function handleSearchSelect(result) {
    const { lat, lon } = result;
    setMapCenter([lat, lon]);
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 10, { duration: 1.2 });
    }
    handleMapClick(lat, lon);
  }

  async function handleSavePin() {
    if (!panelData || !panelData.city) return;
    try {
      await savePlace(panelData.city, panelData.lat, panelData.lon);
      alert(`"${panelData.city}" saved!`);
    } catch (err) {
      alert(err.message);
    }
  }

  const activePinData = pins.find((p) => p.id === activePin);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className="flex-1 relative">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-80">
          <SearchBar onSelect={handleSearchSelect} placeholder="Search city on map…" />
        </div>

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%', background: '#0f172a' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />

          {pins.map((pin) => (
            <WeatherMarker
              key={pin.id}
              pin={pin}
              isActive={pin.id === activePin}
              onActivate={() => {
                setActivePin(pin.id);
                loadPinData(pin.lat, pin.lon);
              }}
            />
          ))}
        </MapContainer>

        {pins.length === 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2 text-gray-400 text-sm pointer-events-none">
            Click anywhere on the map to get weather & news
          </div>
        )}
      </div>

      {(panelLoading || panelData) && (
        <aside className="w-80 lg:w-96 bg-gray-900 border-l border-gray-700/50 overflow-y-auto flex-shrink-0 animate-slide-up">
          {panelLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner label="Loading location data…" />
            </div>
          ) : panelData?.error ? (
            <div className="p-4 text-red-400 text-sm">{panelData.error}</div>
          ) : panelData ? (
            <PanelContent data={panelData} onSave={handleSavePin} />
          ) : null}
        </aside>
      )}
    </div>
  );
}

function WeatherMarker({ pin, isActive, onActivate }) {
  const [emoji, setEmoji] = useState('📍');
  useEffect(() => {
    fetchWeather(pin.lat, pin.lon)
      .then((w) => setEmoji(getWeatherEmoji(w.current_weather.weathercode)))
      .catch(() => {});
  }, [pin.lat, pin.lon]);

  return (
    <Marker
      position={[pin.lat, pin.lon]}
      icon={createWeatherIcon(emoji)}
      eventHandlers={{ click: onActivate }}
    />
  );
}

function PanelContent({ data, onSave }) {
  const { weather, city, news } = data;
  const cw = weather?.current_weather;
  const code = cw?.weathercode;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-white font-bold text-lg">{city}</h2>
          <p className="text-gray-400 text-xs">
            {data.lat.toFixed(4)}, {data.lon.toFixed(4)}
          </p>
        </div>
        <button
          onClick={onSave}
          className="flex-shrink-0 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          🔖 Save
        </button>
      </div>

      {cw && (
        <div className="bg-gray-800/60 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-white text-3xl font-light">{Math.round(cw.temperature)}°C</p>
            <p className="text-gray-400 text-sm mt-0.5">{getWeatherLabel(code)}</p>
            <p className="text-gray-500 text-xs">💨 {Math.round(cw.windspeed)} km/h</p>
          </div>
          <span className="text-5xl">{getWeatherEmoji(code)}</span>
        </div>
      )}

      {news.length > 0 && (
        <div>
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            📰 Top News
          </h3>
          <div className="space-y-2">
            {news.slice(0, 3).map((article, i) => (
              <NewsCard key={i} article={article} />
            ))}
          </div>
        </div>
      )}

      {news.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">No news found for this location.</p>
      )}
    </div>
  );
}
