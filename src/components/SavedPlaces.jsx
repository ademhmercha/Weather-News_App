import { useEffect, useState } from 'react';
import { Trash2, MapPin } from 'lucide-react';
import { fetchPlaces, deletePlace, fetchWeather } from '../lib/api';
import { getWeatherLabel } from '../lib/weatherIcons';
import WeatherIcon from './WeatherIcon';
import LoadingSpinner from './LoadingSpinner';

export default function SavedPlaces({ onSelectPlace }) {
  const [places, setPlaces]   = useState([]);
  const [weathers, setWeathers] = useState({});
  const [wxLoading, setWxLoading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await fetchPlaces();
    setPlaces(data);
    if (data.length === 0) return;
    setWxLoading(true);
    const wx = await Promise.allSettled(data.map(p => fetchWeather(p.lat, p.lon)));
    const map = {};
    wx.forEach((r, i) => { if (r.status === 'fulfilled') map[data[i].id] = r.value; });
    setWeathers(map);
    setWxLoading(false);
  }

  function onDelete(e, id) {
    e.stopPropagation();
    deletePlace(id);
    setPlaces(p => p.filter(x => x.id !== id));
    setWeathers(prev => { const next = { ...prev }; delete next[id]; return next; });
  }

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
          <MapPin size={18} className="text-white/25" strokeWidth={1.5} />
        </div>
        <p className="text-white/30 text-xs leading-relaxed">No saved places.<br />Click Save on any city.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {wxLoading && places.length > 0 && (
        <LoadingSpinner size="sm" label="" />
      )}
      {places.map(place => {
        const wx   = weathers[place.id];
        const code = wx?.current_weather?.weathercode;
        const temp = wx ? Math.round(wx.current_weather.temperature) : null;

        return (
          <button
            key={place.id}
            onClick={() => onSelectPlace(place)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 text-left group"
          >
            {code != null
              ? <WeatherIcon code={code} size={28} className="flex-shrink-0" />
              : <MapPin size={16} className="text-white/30 flex-shrink-0" strokeWidth={1.5} />
            }
            <div className="flex-1 min-w-0">
              <p className="text-white/85 text-sm font-medium truncate">{place.city_name}</p>
              {code != null && (
                <p className="text-white/35 text-xs truncate">{getWeatherLabel(code)}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {temp != null && (
                <span className="text-white/70 text-sm font-semibold">{temp}°</span>
              )}
              <button
                onClick={e => onDelete(e, place.id)}
                className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 p-1 rounded-lg hover:bg-red-400/10 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </button>
        );
      })}
    </div>
  );
}
