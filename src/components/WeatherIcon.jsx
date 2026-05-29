function Rays({ cx, cy, r1, r2, count = 8, color = '#ffd200', sw = 2.5 }) {
  return Array.from({ length: count }, (_, i) => {
    const a = ((i * 360) / count) * (Math.PI / 180);
    return (
      <line
        key={i}
        x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
        x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
        stroke={color} strokeWidth={sw} strokeLinecap="round"
      />
    );
  });
}

const icons = {
  clear: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <radialGradient id="sr" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#fff7a0" />
          <stop offset="45%" stopColor="#ffd200" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
      </defs>
      <Rays cx={40} cy={40} r1={28} r2={37} count={8} color="#fcd34d" sw={3} />
      <circle cx="40" cy="40" r="22" fill="url(#sr)" />
      <ellipse cx="33" cy="33" rx="8" ry="5" fill="white" opacity="0.18" transform="rotate(-25,33,33)" />
    </svg>
  ),

  'partly-cloudy': ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <radialGradient id="psr" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffd200" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
        <linearGradient id="pcl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e4f0fa" />
          <stop offset="100%" stopColor="#b0c8dc" />
        </linearGradient>
      </defs>
      <Rays cx={24} cy={26} r1={17} r2={22} count={8} color="#fcd34d" sw={2} />
      <circle cx="24" cy="26" r="13" fill="url(#psr)" />
      <ellipse cx="19" cy="21" rx="4" ry="3" fill="white" opacity="0.2" transform="rotate(-20,19,21)" />
      <path d="M64 62H32a14 14 0 1 1 2.8-27.6A17 17 0 0 1 66 48a11 11 0 0 1-2 24Z" fill="url(#pcl)" />
    </svg>
  ),

  cloudy: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="cl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8e8f4" />
          <stop offset="100%" stopColor="#a8bece" />
        </linearGradient>
      </defs>
      <path d="M62 60H24a16 16 0 1 1 3.2-31.6A19 19 0 0 1 65 44a12 12 0 0 1-3 26Z" fill="url(#cl)" />
    </svg>
  ),

  fog: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" strokeLinecap="round">
      {[16, 26, 36, 46, 56, 64].map((y, i) => (
        <line key={y}
          x1={i % 2 === 0 ? 8 : 16} y1={y}
          x2={i % 2 === 0 ? 72 : 64} y2={y}
          stroke="#94a3b8" strokeWidth="3"
          opacity={Math.max(0.25, 0.75 - i * 0.1)}
        />
      ))}
    </svg>
  ),

  drizzle: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="drcl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ccd8e8" />
          <stop offset="100%" stopColor="#9ab0c4" />
        </linearGradient>
      </defs>
      <path d="M60 52H26a13 13 0 1 1 2.6-25.7A16 16 0 0 1 62 38a10 10 0 0 1-2 24Z" fill="url(#drcl)" />
      {[[22, 58, 19, 68], [36, 60, 33, 70], [50, 58, 47, 68]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      ))}
    </svg>
  ),

  rain: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="rcl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8aa0b4" />
          <stop offset="100%" stopColor="#627888" />
        </linearGradient>
      </defs>
      <path d="M58 48H22a14 14 0 1 1 2.8-27.6A17 17 0 0 1 60 34a11 11 0 0 1-2 24Z" fill="url(#rcl)" />
      {[[18, 56, 14, 70], [30, 56, 26, 70], [42, 56, 38, 70], [54, 56, 50, 70]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </svg>
  ),

  snow: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="scl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ccd8e8" />
          <stop offset="100%" stopColor="#9ab0c4" />
        </linearGradient>
      </defs>
      <path d="M60 48H24a13 13 0 1 1 2.6-25.7A16 16 0 0 1 62 34a10 10 0 0 1-2 24Z" fill="url(#scl)" />
      {[0, 60, 120].map(deg => {
        const r = (deg * Math.PI) / 180;
        const cx = 40, cy = 65, len = 11;
        return (
          <line key={deg}
            x1={cx - len * Math.cos(r)} y1={cy - len * Math.sin(r)}
            x2={cx + len * Math.cos(r)} y2={cy + len * Math.sin(r)}
            stroke="#bae6fd" strokeWidth="3" strokeLinecap="round"
          />
        );
      })}
      <circle cx="40" cy="65" r="3" fill="#bae6fd" />
    </svg>
  ),

  thunder: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="tcl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6a7a90" />
          <stop offset="100%" stopColor="#485868" />
        </linearGradient>
        <linearGradient id="tbl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path d="M60 48H22a14 14 0 1 1 2.8-27.6A17 17 0 0 1 62 34a11 11 0 0 1-2 24Z" fill="url(#tcl)" />
      <polyline points="44,50 36,64 42,64 34,78" fill="none"
        stroke="url(#tbl)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  showers: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <radialGradient id="shr" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffd200" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
        <linearGradient id="shcl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ccd8e8" />
          <stop offset="100%" stopColor="#9ab0c4" />
        </linearGradient>
      </defs>
      <Rays cx={20} cy={22} r1={14} r2={19} count={8} color="#fcd34d" sw={1.8} />
      <circle cx="20" cy="22" r="11" fill="url(#shr)" />
      <path d="M62 52H28a12 12 0 1 1 2.4-23.7A15 15 0 0 1 64 40a10 10 0 0 1-2 22Z" fill="url(#shcl)" />
      {[[24, 58, 21, 68], [38, 60, 35, 70], [52, 58, 49, 68]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
      ))}
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
