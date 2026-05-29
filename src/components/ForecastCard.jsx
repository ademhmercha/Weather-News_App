import { getWeatherEmoji, getWeatherLabel } from '../lib/weatherIcons';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ForecastCard({ weather }) {
  if (!weather?.daily) return null;

  const { daily } = weather;
  const days = daily.time.slice(0, 5);

  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-4 animate-fade-in">
      <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
        5-Day Forecast
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {days.map((date, i) => {
          const d = new Date(date);
          const isToday = i === 0;
          return (
            <div
              key={date}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors ${
                isToday ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-gray-700/50'
              }`}
            >
              <span className="text-xs font-medium text-gray-400">
                {isToday ? 'Today' : DAYS[d.getDay()]}
              </span>
              <span className="text-2xl leading-none" role="img" aria-label={getWeatherLabel(daily.weathercode[i])}>
                {getWeatherEmoji(daily.weathercode[i])}
              </span>
              <span className="text-white text-sm font-semibold">
                {Math.round(daily.temperature_2m_max[i])}°
              </span>
              <span className="text-gray-500 text-xs">
                {Math.round(daily.temperature_2m_min[i])}°
              </span>
              {daily.precipitation_sum[i] > 0 && (
                <span className="text-xs text-blue-400">
                  💧 {daily.precipitation_sum[i].toFixed(1)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
