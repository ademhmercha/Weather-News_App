import { Wind, Droplets, Thermometer, Eye, Sun, CloudRain } from 'lucide-react';

function uvLabel(v) {
  if (v >= 8) return 'Very High';
  if (v >= 6) return 'High';
  if (v >= 3) return 'Moderate';
  return 'Low';
}

export default function MetricsGrid({ weather, inline = false }) {
  if (!weather) return null;

  const { current_weather: cw, hourly, daily } = weather;
  const now = new Date();
  const times = hourly?.time ?? [];
  const ci = Math.max(0, times.findIndex(t => new Date(t) >= now));

  const humidity  = hourly?.relative_humidity_2m?.[ci];
  const feelsLike = hourly?.apparent_temperature?.[ci];
  const rain      = hourly?.precipitation_probability?.[ci];
  const visibility = hourly?.visibility?.[ci];
  const uv        = daily?.uv_index_max?.[0];

  const stats = [
    { Icon: Wind,       label: 'Wind',       value: `${Math.round(cw.windspeed)} km/h` },
    humidity  != null && { Icon: Droplets,   label: 'Humidity',   value: `${humidity}%` },
    feelsLike != null && { Icon: Thermometer,label: 'Feels like', value: `${Math.round(feelsLike)}°C` },
    rain      != null && { Icon: CloudRain,  label: 'Rain',       value: `${rain}%` },
    uv        != null && { Icon: Sun,        label: 'UV Index',   value: `${uv.toFixed(0)} · ${uvLabel(uv)}` },
    visibility!= null && { Icon: Eye,        label: 'Visibility', value: `${(visibility / 1000).toFixed(0)} km` },
  ].filter(Boolean);

  if (inline) {
    return (
      <div className="mb-1">
        <div className="rounded-2xl px-3 py-3 grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-x-4 gap-y-2.5 sm:gap-x-6"
          style={{ background: 'rgba(0,0,0,0.20)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {stats.map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-1.5 min-w-0">
              <Icon size={13} className="text-white/40 flex-shrink-0" />
              <span className="text-white/45 text-xs truncate">{label}</span>
              <span className="text-white text-xs font-semibold truncate">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4">
      {stats.map(({ Icon, label, value }) => (
        <div key={label} className="rounded-2xl p-4 flex flex-col gap-2"
          style={{ background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 text-white/40">
            <Icon size={14} />
            <span className="text-xs font-medium uppercase tracking-widest">{label}</span>
          </div>
          <span className="text-white text-xl font-light">{value}</span>
        </div>
      ))}
    </div>
  );
}
