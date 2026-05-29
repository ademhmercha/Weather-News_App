import WeatherIcon from './WeatherIcon';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ForecastCard({ weather }) {
  if (!weather?.daily) return null;
  const { daily } = weather;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-slate-900/50 backdrop-blur-sm overflow-hidden animate-fade-in">
      <div className="px-5 py-3 border-b border-white/[0.05]">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">5-Day Forecast</p>
      </div>
      <div className="grid grid-cols-5 divide-x divide-white/[0.04]">
        {daily.time.slice(0, 5).map((date, i) => {
          const d = new Date(date);
          const isToday = i === 0;
          const max = Math.round(daily.temperature_2m_max[i]);
          const min = Math.round(daily.temperature_2m_min[i]);
          const range = (daily.temperature_2m_max[0] - daily.temperature_2m_min[0]) || 1;
          const barH = Math.max(20, ((max - min) / range) * 60);

          return (
            <div key={date} className={`flex flex-col items-center py-5 px-2 gap-3 transition-colors ${isToday ? 'bg-blue-950/30' : 'hover:bg-slate-800/30'}`}>
              <span className={`text-xs font-medium tracking-wide ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>
                {isToday ? 'Today' : DAYS[d.getDay()]}
              </span>
              <WeatherIcon code={daily.weathercode[i]} size={32} />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-slate-100 text-sm font-semibold">{max}°</span>
                <div className="w-px bg-slate-700/60 my-0.5" style={{ height: Math.max(8, barH * 0.4) }} />
                <span className="text-slate-500 text-xs">{min}°</span>
              </div>
              {daily.precipitation_sum[i] > 0 && (
                <span className="text-blue-400 text-xs">{daily.precipitation_sum[i].toFixed(1)}mm</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
