const WMO = {
  0:  { label: 'Clear sky' },
  1:  { label: 'Mainly clear' },
  2:  { label: 'Partly cloudy' },
  3:  { label: 'Overcast' },
  45: { label: 'Foggy' },
  48: { label: 'Icy fog' },
  51: { label: 'Light drizzle' },
  53: { label: 'Moderate drizzle' },
  55: { label: 'Dense drizzle' },
  61: { label: 'Slight rain' },
  63: { label: 'Moderate rain' },
  65: { label: 'Heavy rain' },
  71: { label: 'Slight snow' },
  73: { label: 'Moderate snow' },
  75: { label: 'Heavy snow' },
  77: { label: 'Snow grains' },
  80: { label: 'Slight showers' },
  81: { label: 'Moderate showers' },
  82: { label: 'Violent showers' },
  85: { label: 'Slight snow showers' },
  86: { label: 'Heavy snow showers' },
  95: { label: 'Thunderstorm' },
  96: { label: 'Thunderstorm w/ hail' },
  99: { label: 'Thunderstorm w/ heavy hail' },
};

export function getWeatherLabel(code) {
  return WMO[code]?.label ?? 'Unknown';
}

export function getSkyStyle(code, isDay) {
  if (!isDay) {
    if (code >= 95) return { bg: 'linear-gradient(180deg,#060810 0%,#0a0e18 40%,#0d1220 100%)' };
    if (code >= 61) return { bg: 'linear-gradient(180deg,#080c15 0%,#0c121e 40%,#101828 100%)' };
    return { bg: 'linear-gradient(180deg,#05080f 0%,#080e1a 30%,#0c1528 60%,#111e38 100%)' };
  }
  if (code === 0 || code === 1) return { bg: 'linear-gradient(180deg,#0d47a1 0%,#1565c0 35%,#1976d2 65%,#42a5f5 100%)' };
  if (code <= 3)  return { bg: 'linear-gradient(180deg,#1a3a5c 0%,#2a4d7a 40%,#3a608a 100%)' };
  if (code <= 48) return { bg: 'linear-gradient(180deg,#1e2d3f 0%,#2a3d55 40%,#354a65 100%)' };
  if (code <= 67) return { bg: 'linear-gradient(180deg,#1a2535 0%,#1e2d3f 40%,#253545 100%)' };
  if (code <= 77) return { bg: 'linear-gradient(180deg,#1a2540 0%,#243450 40%,#2e4060 100%)' };
  return { bg: 'linear-gradient(180deg,#0f1820 0%,#141e2a 40%,#1a2535 100%)' };
}

export function getAtmosphereOverlay(code, isDay) {
  if (isDay && (code === 0 || code === 1)) {
    return 'radial-gradient(ellipse 70% 50% at 50% 0%,rgba(100,160,255,0.25) 0%,transparent 70%)';
  }
  if (!isDay) {
    return 'radial-gradient(ellipse 60% 40% at 30% 10%,rgba(80,100,200,0.15) 0%,transparent 60%)';
  }
  return 'none';
}
