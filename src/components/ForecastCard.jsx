import WeatherIcon from './WeatherIcon';
import { getWeatherLabel } from '../lib/weatherIcons';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ForecastCard({ weather }) {
  if (!weather?.daily) return null;
  const { daily } = weather;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest px-4 pt-4 pb-2">Daily</p>
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex px-2 pb-4 gap-1 min-w-max">
          {daily.time.slice(0, 7).map((date, i) => {
            const d = new Date(date);
            const isToday = i === 0;
            const max = Math.round(daily.temperature_2m_max[i]);
            const min = Math.round(daily.temperature_2m_min[i]);

            return (
              <div
                key={date}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl min-w-[80px] transition-all cursor-default ${
                  isToday ? 'bg-white/15' : 'hover:bg-white/10'
                }`}
              >
                <span className={`text-xs font-semibold ${isToday ? 'text-white' : 'text-white/50'}`}>
                  {isToday ? 'Today' : DAYS[d.getDay()]}
                </span>
                <span className={`text-xs text-white/40 ${isToday ? 'text-white/60' : ''}`}>
                  {d.getDate()}
                </span>
                <WeatherIcon code={daily.weathercode[i]} size={36} />
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-semibold">{max}°</span>
                  <span className="text-white/35 text-xs">{min}°</span>
                </div>
                {daily.precipitation_sum[i] > 0.2 && (
                  <span className="text-blue-400 text-[10px]">{daily.precipitation_sum[i].toFixed(1)}mm</span>
                )}
                <span className="text-white/25 text-[9px] text-center leading-tight hidden sm:block">
                  {getWeatherLabel(daily.weathercode[i])}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
