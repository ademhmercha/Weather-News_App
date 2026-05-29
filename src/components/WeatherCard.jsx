import { useEffect, useState } from 'react';
import WeatherIcon from './WeatherIcon';
import { getWeatherLabel } from '../lib/weatherIcons';

async function fetchCityImage(city) {
  try {
    const r = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`
    );
    const d = await r.json();
    return d.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

export default function WeatherCard({ weather, cityName }) {
  const [cityImage, setCityImage] = useState(null);

  useEffect(() => {
    if (!cityName) return;
    setCityImage(null);
    fetchCityImage(cityName).then(setCityImage);
  }, [cityName]);

  if (!weather) return null;

  const { current_weather: cw } = weather;
  const code = cw.weathercode;
  const temp = Math.round(cw.temperature);
  const isDay = cw.is_day === 1;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  const timeLabel = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] animate-fade-in min-h-[220px]">
      {/* Dark base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#0a1628] to-[#060e1c]" />

      {/* City photo — subtle ambient */}
      {cityImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{ backgroundImage: `url(${cityImage})`, opacity: 0.18 }}
        />
      )}

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/15 via-transparent to-indigo-900/10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-7">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-3">
            {isDay ? 'Daytime' : 'Night'} · {dateLabel} · {timeLabel}
          </p>
          <div className="flex items-end gap-2">
            <span className="text-[7rem] sm:text-[8.5rem] font-thin text-slate-50 leading-none tracking-tighter">
              {temp}
            </span>
            <span className="text-3xl text-slate-400 mb-4">°C</span>
          </div>
          <p className="text-slate-300 text-lg font-light mt-1">{getWeatherLabel(code)}</p>
          <p className="text-slate-500 text-sm mt-0.5">{cityName}</p>
        </div>

        <div className="flex-shrink-0 opacity-90">
          <WeatherIcon code={code} size={120} />
        </div>
      </div>

      <div className="relative z-10 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
    </div>
  );
}
