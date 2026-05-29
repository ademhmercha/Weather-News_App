import { getWeatherEmoji, getWeatherLabel, getBgGradient } from '../lib/weatherIcons';

export default function WeatherCard({ weather, cityName }) {
  if (!weather) return null;

  const { current_weather } = weather;
  const code = current_weather.weathercode;
  const isDay = current_weather.is_day === 1;
  const gradient = getBgGradient(code, isDay);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-xl animate-fade-in`}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">
              {isDay ? '☀️ Daytime' : '🌙 Night'}
            </p>
            <h2 className="text-white text-2xl font-bold truncate">{cityName}</h2>
            <p className="text-white/80 text-sm mt-1">{getWeatherLabel(code)}</p>
          </div>
          <span className="text-7xl leading-none select-none" role="img" aria-label={getWeatherLabel(code)}>
            {getWeatherEmoji(code)}
          </span>
        </div>

        <div className="mt-4 flex items-end gap-2">
          <span className="text-6xl font-light text-white">
            {Math.round(current_weather.temperature)}
          </span>
          <span className="text-3xl text-white/70 mb-2">°C</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat icon="💨" label="Wind" value={`${Math.round(current_weather.windspeed)} km/h`} />
          {weather.hourly && (
            <Stat
              icon="💧"
              label="Humidity"
              value={`${weather.hourly.relative_humidity_2m?.[0] ?? '—'}%`}
            />
          )}
          {weather.hourly && (
            <Stat
              icon="🌡️"
              label="Feels like"
              value={`${Math.round(weather.hourly.apparent_temperature?.[0] ?? current_weather.temperature)}°C`}
            />
          )}
          {weather.hourly && (
            <Stat
              icon="🌂"
              label="Rain chance"
              value={`${weather.hourly.precipitation_probability?.[0] ?? 0}%`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="bg-white/10 rounded-xl p-3">
      <p className="text-white/60 text-xs">{icon} {label}</p>
      <p className="text-white font-semibold text-sm mt-0.5">{value}</p>
    </div>
  );
}
