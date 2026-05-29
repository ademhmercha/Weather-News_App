import { Wind, Droplets, Thermometer, CloudRain } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherLabel } from '../lib/weatherIcons';

export default function WeatherCard({ weather, cityName }) {
  if (!weather) return null;

  const { current_weather: cw, hourly } = weather;
  const code = cw.weathercode;
  const temp = Math.round(cw.temperature);
  const wind = Math.round(cw.windspeed);
  const humidity = hourly?.relative_humidity_2m?.[0];
  const feelsLike = Math.round(hourly?.apparent_temperature?.[0] ?? temp);
  const rainChance = hourly?.precipitation_probability?.[0] ?? 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800/80 border border-white/[0.07] p-7 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
              {cw.is_day ? 'Daytime' : 'Night'} · {getWeatherLabel(code)}
            </p>
            <h2 className="text-slate-100 text-2xl font-semibold leading-none">{cityName}</h2>
          </div>
          <WeatherIcon code={code} size={72} className="opacity-90 flex-shrink-0 -mt-1" />
        </div>

        <div className="mt-6 flex items-end gap-1">
          <span className="text-8xl font-thin text-slate-100 leading-none tracking-tight">{temp}</span>
          <span className="text-3xl font-light text-slate-400 mb-3">°C</span>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat icon={<Wind size={14} />} label="Wind" value={`${wind} km/h`} />
          {humidity != null && <Stat icon={<Droplets size={14} />} label="Humidity" value={`${humidity}%`} />}
          <Stat icon={<Thermometer size={14} />} label="Feels like" value={`${feelsLike}°C`} />
          <Stat icon={<CloudRain size={14} />} label="Rain chance" value={`${rainChance}%`} />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat-chip">
      <div className="flex items-center gap-1.5 text-slate-500">
        {icon}
        <span className="text-xs tracking-wide">{label}</span>
      </div>
      <span className="text-slate-100 font-medium text-sm">{value}</span>
    </div>
  );
}
