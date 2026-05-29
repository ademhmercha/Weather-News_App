import WeatherIcon from './WeatherIcon';
import { getWeatherLabel } from '../lib/weatherIcons';

export default function WeatherCard({ weather, cityName }) {
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
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#0a1628] to-[#060e1c]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-indigo-900/10" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-7">
        {/* Left: temp + info */}
        <div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-3">
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

        {/* Right: big icon */}
        <div className="flex-shrink-0 opacity-90">
          <WeatherIcon code={code} size={120} />
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="relative z-10 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
    </div>
  );
}
