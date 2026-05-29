import { Wind, Droplets, Thermometer, Eye, Sun, CloudRain } from 'lucide-react';

function uvLabel(uv) {
  if (uv >= 11) return 'Extreme';
  if (uv >= 8) return 'Very High';
  if (uv >= 6) return 'High';
  if (uv >= 3) return 'Moderate';
  return 'Low';
}

function visLabel(m) {
  if (m >= 10000) return 'Excellent';
  if (m >= 5000) return 'Good';
  if (m >= 1000) return 'Moderate';
  return 'Poor';
}

function Metric({ icon, label, value, sub, accent = false }) {
  return (
    <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-medium uppercase tracking-widest">{label}</span>
      </div>
      <div>
        <p className={`text-2xl font-light ${accent ? 'text-blue-400' : 'text-slate-100'}`}>{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function MetricsGrid({ weather }) {
  if (!weather) return null;

  const { current_weather: cw, hourly, daily } = weather;
  const h0 = idx => ({
    humidity: hourly?.relative_humidity_2m?.[idx],
    feelsLike: hourly?.apparent_temperature?.[idx],
    rain: hourly?.precipitation_probability?.[idx],
    visibility: hourly?.visibility?.[idx],
  });

  const now = new Date();
  const times = hourly?.time ?? [];
  const ci = Math.max(0, times.findIndex(t => new Date(t) >= now));
  const h = h0(ci);
  const uv = daily?.uv_index_max?.[0];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <Metric
        icon={<Wind size={14} />}
        label="Wind"
        value={`${Math.round(cw.windspeed)} km/h`}
        sub={cw.windspeed > 50 ? 'Strong winds' : cw.windspeed > 20 ? 'Moderate breeze' : 'Light breeze'}
      />
      {h.humidity != null && (
        <Metric
          icon={<Droplets size={14} />}
          label="Humidity"
          value={`${h.humidity}%`}
          sub={h.humidity > 70 ? 'High — feels muggy' : h.humidity > 40 ? 'Comfortable' : 'Dry air'}
          accent={h.humidity > 80}
        />
      )}
      {h.feelsLike != null && (
        <Metric
          icon={<Thermometer size={14} />}
          label="Feels Like"
          value={`${Math.round(h.feelsLike)}°C`}
          sub={Math.round(h.feelsLike) < Math.round(cw.temperature) ? 'Cooler than actual' : 'Similar to actual'}
        />
      )}
      {h.rain != null && (
        <Metric
          icon={<CloudRain size={14} />}
          label="Rain Chance"
          value={`${h.rain}%`}
          sub={h.rain > 70 ? 'Rain likely' : h.rain > 30 ? 'Possible showers' : 'Unlikely to rain'}
          accent={h.rain > 70}
        />
      )}
      {uv != null && (
        <Metric
          icon={<Sun size={14} />}
          label="UV Index"
          value={uv.toFixed(0)}
          sub={uvLabel(uv)}
          accent={uv >= 8}
        />
      )}
      {h.visibility != null && (
        <Metric
          icon={<Eye size={14} />}
          label="Visibility"
          value={`${(h.visibility / 1000).toFixed(0)} km`}
          sub={visLabel(h.visibility)}
        />
      )}
    </div>
  );
}
