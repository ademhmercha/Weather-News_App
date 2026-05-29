import WeatherIcon from './WeatherIcon';

export default function HourlyForecast({ weather }) {
  if (!weather?.hourly?.time) return null;

  const now = new Date();
  const times = weather.hourly.time;
  const startIdx = Math.max(0, times.findIndex(t => new Date(t) >= now));

  const hours = Array.from({ length: 24 }, (_, i) => {
    const idx = startIdx + i;
    if (idx >= times.length) return null;
    return {
      time: new Date(times[idx]),
      temp: Math.round(weather.hourly.temperature_2m?.[idx] ?? 0),
      code: weather.hourly.weathercode?.[idx] ?? 0,
      rain: weather.hourly.precipitation_probability?.[idx] ?? 0,
    };
  }).filter(Boolean);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest px-4 pt-4 pb-2">Hourly</p>
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex px-2 pb-4 gap-0.5 min-w-max">
          {hours.map((h, i) => {
            const label = i === 0
              ? 'Now'
              : h.time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            const isNow = i === 0;

            return (
              <div
                key={h.time.toISOString()}
                className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl min-w-[64px] cursor-default transition-all ${
                  isNow ? 'bg-white/15' : 'hover:bg-white/8'
                }`}
              >
                <span className={`text-[11px] font-medium ${isNow ? 'text-white' : 'text-white/45'}`}>{label}</span>
                <WeatherIcon code={h.code} size={28} />
                <span className="text-white text-sm font-semibold">{h.temp}°</span>
                <span className={`text-[10px] ${h.rain > 30 ? 'text-blue-400' : 'text-white/25'}`}>{h.rain}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
