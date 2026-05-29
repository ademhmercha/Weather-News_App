const S = 1.8; // strokeWidth base

function Rays({ cx, cy, inner, outer, count = 8, sw = S }) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i * 360) / count * Math.PI / 180;
    return (
      <line key={i}
        x1={cx + inner * Math.cos(a)} y1={cy + inner * Math.sin(a)}
        x2={cx + outer * Math.cos(a)} y2={cy + outer * Math.sin(a)}
        stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
      />
    );
  });
}

function Cloud({ x = 0, y = 0, scale = 1, sw = S }) {
  const s = scale;
  return (
    <path
      d={`M${x + 34 * s} ${y + 28 * s}H${x + 16 * s}a${10 * s} ${10 * s} 0 1 1 ${2.2 * s} ${-19.6 * s}A${12 * s} ${12 * s} 0 0 1 ${x + 38 * s} ${y + 20 * s}a${8 * s} ${8 * s} 0 0 1 ${-4 * s} ${18 * s}Z`}
      stroke="currentColor" strokeWidth={sw} fill="none" strokeLinejoin="round"
    />
  );
}

const icons = {
  clear: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="8" stroke="#fbbf24" strokeWidth={S} />
      <Rays cx={24} cy={24} inner={12} outer={16} sw={S} />
      {/* color override */}
      <g stroke="#fbbf24"><Rays cx={24} cy={24} inner={12} outer={16} sw={S} /></g>
    </svg>
  ),
  'partly-cloudy': ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="18" cy="18" r="6" stroke="#fbbf24" strokeWidth={S} />
      <g stroke="#fbbf24"><Rays cx={18} cy={18} inner={9} outer={12} count={8} sw={1.4} /></g>
      <path d="M38 33H22a8 8 0 1 1 1.8-15.7A10 10 0 0 1 40 27a6 6 0 0 1-2 16Z"
        stroke="#94a3b8" strokeWidth={S} fill="none" strokeLinejoin="round" />
    </svg>
  ),
  cloudy: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M36 35H14a11 11 0 1 1 2.2-21.7A13 13 0 0 1 40 25a9 9 0 0 1-4 20Z"
        stroke="#94a3b8" strokeWidth={S} fill="none" strokeLinejoin="round" />
    </svg>
  ),
  fog: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" strokeLinecap="round">
      <line x1="6" y1="16" x2="42" y2="16" stroke="#94a3b8" strokeWidth={S} />
      <line x1="6" y1="24" x2="38" y2="24" stroke="#94a3b8" strokeWidth={S} />
      <line x1="6" y1="32" x2="30" y2="32" stroke="#94a3b8" strokeWidth={S} />
    </svg>
  ),
  drizzle: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M36 30H16a10 10 0 1 1 2-19.6A12 12 0 0 1 38 22a8 8 0 0 1-2 18Z"
        stroke="#60a5fa" strokeWidth={S} fill="none" strokeLinejoin="round" />
      <line x1="18" y1="38" x2="16" y2="44" stroke="#60a5fa" strokeWidth={S} strokeLinecap="round" />
      <line x1="28" y1="38" x2="26" y2="44" stroke="#60a5fa" strokeWidth={S} strokeLinecap="round" />
      <line x1="38" y1="38" x2="36" y2="44" stroke="#60a5fa" strokeWidth={S} strokeLinecap="round" />
    </svg>
  ),
  rain: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M36 28H16a10 10 0 1 1 2-19.6A12 12 0 0 1 38 20a8 8 0 0 1-2 18Z"
        stroke="#3b82f6" strokeWidth={S} fill="none" strokeLinejoin="round" />
      <line x1="16" y1="36" x2="13" y2="45" stroke="#3b82f6" strokeWidth={S} strokeLinecap="round" />
      <line x1="26" y1="36" x2="23" y2="45" stroke="#3b82f6" strokeWidth={S} strokeLinecap="round" />
      <line x1="36" y1="36" x2="33" y2="45" stroke="#3b82f6" strokeWidth={S} strokeLinecap="round" />
    </svg>
  ),
  snow: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" strokeLinecap="round">
      <path d="M34 26H14a10 10 0 1 1 2-19.6A12 12 0 0 1 36 18a8 8 0 0 1-2 18Z"
        stroke="#bae6fd" strokeWidth={S} fill="none" strokeLinejoin="round" />
      <line x1="24" y1="34" x2="24" y2="46" stroke="#bae6fd" strokeWidth={S} />
      <line x1="18" y1="37" x2="30" y2="43" stroke="#bae6fd" strokeWidth={S} />
      <line x1="30" y1="37" x2="18" y2="43" stroke="#bae6fd" strokeWidth={S} />
    </svg>
  ),
  thunder: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M36 26H16a10 10 0 1 1 2-19.6A12 12 0 0 1 38 18a8 8 0 0 1-2 18Z"
        stroke="#94a3b8" strokeWidth={S} fill="none" strokeLinejoin="round" />
      <polyline points="27,30 22,40 26,40 21,48"
        stroke="#fbbf24" strokeWidth={S + 0.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  showers: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M36 28H16a10 10 0 1 1 2-19.6A12 12 0 0 1 38 20a8 8 0 0 1-2 18Z"
        stroke="#60a5fa" strokeWidth={S} fill="none" strokeLinejoin="round" />
      <circle cx="18" cy="40" r="2" fill="#60a5fa" />
      <circle cx="28" cy="40" r="2" fill="#60a5fa" />
      <circle cx="38" cy="40" r="2" fill="#60a5fa" />
      <circle cx="23" cy="46" r="2" fill="#60a5fa" />
      <circle cx="33" cy="46" r="2" fill="#60a5fa" />
    </svg>
  ),
};

function getIconType(code) {
  if (code === 0) return 'clear';
  if (code <= 2) return 'partly-cloudy';
  if (code === 3) return 'cloudy';
  if (code <= 48) return 'fog';
  if (code <= 57) return 'drizzle';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'showers';
  if (code <= 86) return 'snow';
  return 'thunder';
}

export default function WeatherIcon({ code = 0, size = 64, className = '' }) {
  const type = getIconType(code);
  const Icon = icons[type] ?? icons.cloudy;
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <Icon size={size} />
    </span>
  );
}
