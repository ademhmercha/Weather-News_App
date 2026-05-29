const WMO_ICONS = {
  0: { emoji: '☀️', label: 'Clear sky' },
  1: { emoji: '🌤️', label: 'Mainly clear' },
  2: { emoji: '⛅', label: 'Partly cloudy' },
  3: { emoji: '☁️', label: 'Overcast' },
  45: { emoji: '🌫️', label: 'Foggy' },
  48: { emoji: '🌫️', label: 'Icy fog' },
  51: { emoji: '🌦️', label: 'Light drizzle' },
  53: { emoji: '🌦️', label: 'Moderate drizzle' },
  55: { emoji: '🌧️', label: 'Dense drizzle' },
  56: { emoji: '🌧️', label: 'Freezing drizzle' },
  57: { emoji: '🌧️', label: 'Heavy freezing drizzle' },
  61: { emoji: '🌧️', label: 'Slight rain' },
  63: { emoji: '🌧️', label: 'Moderate rain' },
  65: { emoji: '🌧️', label: 'Heavy rain' },
  66: { emoji: '🌨️', label: 'Freezing rain' },
  67: { emoji: '🌨️', label: 'Heavy freezing rain' },
  71: { emoji: '❄️', label: 'Slight snow' },
  73: { emoji: '❄️', label: 'Moderate snow' },
  75: { emoji: '❄️', label: 'Heavy snow' },
  77: { emoji: '🌨️', label: 'Snow grains' },
  80: { emoji: '🌦️', label: 'Slight showers' },
  81: { emoji: '🌧️', label: 'Moderate showers' },
  82: { emoji: '⛈️', label: 'Violent showers' },
  85: { emoji: '🌨️', label: 'Slight snow showers' },
  86: { emoji: '🌨️', label: 'Heavy snow showers' },
  95: { emoji: '⛈️', label: 'Thunderstorm' },
  96: { emoji: '⛈️', label: 'Thunderstorm w/ hail' },
  99: { emoji: '⛈️', label: 'Thunderstorm w/ heavy hail' },
};

export function getWeatherIcon(code) {
  return WMO_ICONS[code] ?? { emoji: '🌡️', label: 'Unknown' };
}

export function getWeatherEmoji(code) {
  return getWeatherIcon(code).emoji;
}

export function getWeatherLabel(code) {
  return getWeatherIcon(code).label;
}

export function getBgGradient(code, isDay = true) {
  if (!isDay) return 'from-gray-900 via-indigo-950 to-gray-900';
  if (code === 0 || code === 1) return 'from-sky-600 via-blue-700 to-indigo-800';
  if (code <= 3) return 'from-slate-500 via-blue-700 to-slate-700';
  if (code <= 48) return 'from-slate-600 via-slate-700 to-gray-800';
  if (code <= 82) return 'from-slate-700 via-blue-900 to-slate-800';
  if (code <= 86) return 'from-slate-600 via-indigo-900 to-slate-700';
  return 'from-gray-800 via-purple-900 to-gray-900';
}
