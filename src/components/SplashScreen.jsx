import { useEffect, useState } from 'react';

const CSS = `
@keyframes splashFadeIn {
  from { opacity: 0; transform: scale(.92); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes dot-bounce {
  0%, 80%, 100% { transform: translateY(0);   opacity: .35; }
  40%            { transform: translateY(-8px); opacity: 1;   }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
`;

export default function SplashScreen({ status = 'Starting…', visible }) {
  const [opacity, setOpacity] = useState(1);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (!visible) {
      // Fade out over 600ms then unmount
      setOpacity(0);
      const t = setTimeout(() => setMounted(false), 620);
      return () => clearTimeout(t);
    } else {
      setOpacity(1);
      setMounted(true);
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      style={{
        background: 'linear-gradient(180deg,#05090f 0%,#070c14 50%,#0a1020 100%)',
        opacity,
        transition: 'opacity .6s cubic-bezier(.4,0,.2,1)',
        pointerEvents: opacity === 0 ? 'none' : 'all',
      }}
    >
      <style>{CSS}</style>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 380, height: 380,
        background: 'radial-gradient(circle, rgba(37,99,235,.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ animation: 'splashFadeIn .7s cubic-bezier(.34,1.56,.64,1) forwards' }}>
        <img
          src="/logo.png"
          alt="WeatherNews"
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl shadow-2xl"
          style={{ boxShadow: '0 24px 60px rgba(37,99,235,.35), 0 8px 24px rgba(0,0,0,.6)' }}
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      {/* App name */}
      <div className="mt-7 text-center" style={{ animation: 'splashFadeIn .7s .15s both' }}>
        <h1 className="text-3xl font-semibold tracking-tight"
          style={{
            background: 'linear-gradient(90deg, #fff 30%, #60a5fa 70%, #fff 90%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 3s linear infinite',
          }}>
          WeatherNews
        </h1>
        <p className="text-white/30 text-xs font-medium tracking-[.25em] uppercase mt-2">
          Tunisia · Weather · News
        </p>
      </div>

      {/* Status text */}
      <p
        key={status}
        className="text-white/45 text-sm mt-10"
        style={{ animation: 'splashFadeIn .4s ease forwards', minHeight: '1.5rem' }}
      >
        {status}
      </p>

      {/* Bouncing dots */}
      <div className="flex items-center gap-2 mt-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-blue-500"
            style={{
              animation: `dot-bounce 1.3s ease-in-out infinite`,
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
