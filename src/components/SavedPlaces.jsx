import { useEffect, useState } from 'react';
import { Trash2, MapPin } from 'lucide-react';
import { fetchPlaces, deletePlace, fetchWeather } from '../lib/api';
import { getWeatherLabel } from '../lib/weatherIcons';
import WeatherIcon from './WeatherIcon';
import LoadingSpinner from './LoadingSpinner';

export default function SavedPlaces({ onSelectPlace }) {
  const [places, setPlaces] = useState([]);
  const [weathers, setWeathers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await fetchPlaces();
      setPlaces(data);
      const wx = await Promise.allSettled(data.map(p => fetchWeather(p.lat, p.lon)));
      const map = {};
      wx.forEach((r, i) => { if (r.status === 'fulfilled') map[data[i].id] = r.value; });
      setWeathers(map);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function onDelete(e, id) {
    e.stopPropagation();
    await deletePlace(id).catch(() => {});
    setPlaces(p => p.filter(x => x.id !== id));
  }

  if (loading) return <LoadingSpinner size="sm" label="Loading places" />;
  if (error) return <p className="text-red-400 text-xs p-2">{error}</p>;

  if (!places.length) return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-10 h-10 rounded-xl bg-slate-800/60 flex items-center justify-center mb-3">
        <MapPin size={18} className="text-slate-600" strokeWidth={1.5} />
      </div>
      <p className="text-slate-500 text-xs leading-relaxed">No saved places yet.<br />Click the map to explore.</p>
    </div>
  );

  return (
    <div className="space-y-1.5">
      {places.map(place => {
        const wx = weathers[place.id];
        const code = wx?.current_weather?.weathercode;
        const temp = wx ? Math.round(wx.current_weather.temperature) : null;

        return (
          <button
            key={place.id}
            onClick={() => onSelectPlace(place)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-white/[0.06] transition-all duration-200 text-left group"
          >
            {code != null
              ? <WeatherIcon code={code} size={28} className="flex-shrink-0" />
              : <MapPin size={18} className="text-slate-600 flex-shrink-0" strokeWidth={1.5} />
            }
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-sm font-medium truncate">{place.city_name}</p>
              {code != null && <p className="text-slate-500 text-xs truncate">{getWeatherLabel(code)}</p>}
            </div>
            <div className="flex items-center gap-2">
              {temp != null && <span className="text-slate-300 text-sm font-semibold">{temp}°</span>}
              <button
                onClick={e => onDelete(e, place.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 p-1 rounded-lg hover:bg-red-400/10 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export { deletePlace };
