import WeatherIcon from './WeatherIcon';

export default function HourlyForecast({ weather }) {
  if (!weather?.hourly?.time) return null;

  const now = new Date();
  const times = weather.hourly.time;

  const startIdx = times.findIndex(t => new Date(t) >= now);
  const base = startIdx < 0 ? 0 : startIdx;

  const hours = Array.from({ length: 24 }, (_, i) => {
    const idx = base + i;
    if (idx >= times.length) return null;
    return {
      time: new Date(times[idx]),
      temp: Math.round(weather.hourly.temperature_2m?.[idx] ?? 0),
      code: weather.hourly.weathercode?.[idx] ?? 0,
      rain: weather.hourly.precipitation_probability?.[idx] ?? 0,
    };
  }).filter(Boolean);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.05]">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">24-Hour Forecast</p>
      </div>
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex px-3 py-4 gap-1 min-w-max">
          {hours.map((h, i) => {
            const label = i === 0
              ? 'Now'
              : h.time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            const isNow = i === 0;

            return (
              <div
                key={i}
                className={`flex flex-col items-center gap-2 px-3.5 py-3 rounded-xl min-w-[72px] transition-colors ${
                  isNow
                    ? 'bg-blue-600/15 border border-blue-500/25'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <span className={`text-xs font-medium ${isNow ? 'text-blue-400' : 'text-slate-500'}`}>
                  {label}
                </span>
                <WeatherIcon code={h.code} size={26} />
                <span className="text-slate-100 text-sm font-semibold">{h.temp}°</span>
                <span className={`text-xs ${h.rain > 40 ? 'text-blue-400' : 'text-slate-600'}`}>
                  {h.rain}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
