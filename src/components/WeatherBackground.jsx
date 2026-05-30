import { useEffect, useState, useMemo } from 'react';

const CSS = `
@keyframes sunPulse {
  0%,100%{opacity:.55;transform:scale(1)}
  50%{opacity:.88;transform:scale(1.2)}
}
@keyframes cloudFloat {
  from{transform:translateX(-280px)}
  to{transform:translateX(110vw)}
}
@keyframes rainFall {
  from{transform:translateY(-30px);opacity:0}
  4%{opacity:1}
  to{transform:translateY(108vh);opacity:.6}
}
@keyframes snowFall {
  from{transform:translateY(-20px) rotate(0deg);opacity:0}
  5%{opacity:.85}
  to{transform:translateY(108vh) rotate(520deg);opacity:0}
}
@keyframes starTwinkle {
  0%,100%{opacity:.1}
  50%{opacity:1}
}
@keyframes lightningFlash {
  0%,100%{opacity:0}
  3%{opacity:.95}
  6%{opacity:0}
  9%{opacity:.7}
  12%{opacity:0}
}
@keyframes northernGlow {
  0%,100%{opacity:.35}
  50%{opacity:.65}
}
`;

function SunGlow() {
  return (
    <>
      <div style={{
        position:'absolute', top:'-120px', left:'40%', width:'500px', height:'500px',
        background:'radial-gradient(circle, rgba(255,200,60,.3) 0%, transparent 68%)',
        animation:'sunPulse 5s ease-in-out infinite', willChange:'transform,opacity',
      }}/>
      <div style={{
        position:'absolute', top:'-60px', left:'38%', width:'700px', height:'400px',
        background:'radial-gradient(ellipse, rgba(255,230,120,.12) 0%, transparent 70%)',
        animation:'sunPulse 9s ease-in-out infinite 2s',
      }}/>
    </>
  );
}

function Clouds({ n = 4, opacity = 0.07 }) {
  const clouds = useMemo(() =>
    Array.from({ length: n }, (_, i) => ({
      top: 5 + (i * 17) % 40,
      width: 160 + (i * 53) % 200,
      height: 40 + (i * 17) % 30,
      duration: 28 + (i * 7) % 20,
      delay: -(i * 7) % 30,
      blur: 3 + (i * 2) % 6,
      op: opacity + (i % 3) * 0.02,
    })),
  [n, opacity]);

  return clouds.map((c, i) => (
    <div key={i} style={{
      position:'absolute', top:`${c.top}%`,
      width:`${c.width}px`, height:`${c.height}px`,
      background:`rgba(255,255,255,${c.op})`,
      borderRadius:'60px',
      animation:`cloudFloat ${c.duration}s linear infinite`,
      animationDelay:`${c.delay}s`,
      filter:`blur(${c.blur}px)`,
      willChange:'transform',
    }}/>
  ));
}

function Rain({ n = 45, heavy = false }) {
  const drops = useMemo(() =>
    Array.from({ length: n }, (_, i) => ({
      left: (i * 2.3) % 100,
      delay: (i * 0.09) % 1.8,
      duration: heavy ? 0.4 + (i % 4) * 0.06 : 0.6 + (i % 5) * 0.08,
      height: heavy ? 18 + (i % 4) * 6 : 12 + (i % 4) * 4,
      opacity: heavy ? 0.5 + (i % 3) * 0.12 : 0.3 + (i % 3) * 0.08,
    })),
  [n, heavy]);

  return drops.map((d, i) => (
    <div key={i} style={{
      position:'absolute', top:0,
      left:`${d.left}%`,
      width: heavy ? '1.5px' : '1px',
      height:`${d.height}px`,
      background:`rgba(${heavy ? '140,180,240' : '160,190,230'},${d.opacity})`,
      animation:`rainFall ${d.duration}s linear infinite`,
      animationDelay:`${d.delay}s`,
      willChange:'transform',
    }}/>
  ));
}

function Snow({ n = 35 }) {
  const flakes = useMemo(() =>
    Array.from({ length: n }, (_, i) => ({
      left: (i * 2.9) % 100,
      size: 3 + (i % 4) * 2,
      delay: (i * 0.13) % 3,
      duration: 4 + (i % 5),
      opacity: 0.4 + (i % 3) * 0.15,
    })),
  [n]);

  return flakes.map((f, i) => (
    <div key={i} style={{
      position:'absolute', top:0,
      left:`${f.left}%`,
      width:`${f.size}px`, height:`${f.size}px`,
      borderRadius:'50%',
      background:`rgba(200,230,255,${f.opacity})`,
      animation:`snowFall ${f.duration}s linear infinite`,
      animationDelay:`${f.delay}s`,
      willChange:'transform',
    }}/>
  ));
}

function Stars({ n = 80 }) {
  const stars = useMemo(() =>
    Array.from({ length: n }, (_, i) => ({
      x: (i * 1.27 * 100) % 100,
      y: (i * 0.73 * 70) % 70,
      size: 1 + (i % 3),
      delay: (i * 0.11) % 4,
      duration: 2 + (i % 4),
    })),
  [n]);

  return (
    <>
      {/* Night atmospheric glow */}
      <div style={{
        position:'absolute', top:'-80px', left:'30%',
        width:'400px', height:'300px',
        background:'radial-gradient(ellipse, rgba(80,100,200,.15) 0%, transparent 70%)',
        animation:'northernGlow 8s ease-in-out infinite',
      }}/>
      {stars.map((s, i) => (
        <div key={i} style={{
          position:'absolute',
          left:`${s.x}%`, top:`${s.y}%`,
          width:`${s.size}px`, height:`${s.size}px`,
          borderRadius:'50%',
          background:'white',
          animation:`starTwinkle ${s.duration}s ease-in-out infinite`,
          animationDelay:`${s.delay}s`,
        }}/>
      ))}
    </>
  );
}

function LightningFlash() {
  return (
    <div style={{
      position:'absolute', inset:0,
      background:'rgba(220,230,255,0.08)',
      animation:'lightningFlash .6s ease-out forwards',
    }}/>
  );
}

function getType(code, isDay) {
  if (!isDay) return code >= 95 ? 'thunder' : 'night';
  if (code === 0 || code === 1) return 'day-clear';
  if (code <= 3 || code <= 48) return 'day-cloudy';
  if (code >= 95) return 'thunder';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 51) return code >= 63 ? 'rain-heavy' : 'rain';
  return 'day-cloudy';
}

export default function WeatherBackground({ code = 0, isDay = true }) {
  const type = getType(code, isDay);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (type !== 'thunder') return;
    let t;
    const strike = () => {
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
      t = setTimeout(strike, 12000 + Math.floor(Math.random() * 18000));
    };
    t = setTimeout(strike, 3000 + Math.random() * 5000);
    return () => clearTimeout(t);
  }, [type]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      <style>{CSS}</style>
      {type === 'day-clear'   && <><SunGlow /><Clouds n={3} opacity={0.06}/></>}
      {type === 'day-cloudy'  && <Clouds n={5} opacity={0.10}/>}
      {type === 'night'       && <Stars n={90}/>}
      {type === 'rain'        && <><Clouds n={2} opacity={0.06}/><Rain n={40}/></>}
      {type === 'rain-heavy'  && <><Clouds n={2} opacity={0.05}/><Rain n={55} heavy/></>}
      {type === 'snow'        && <><Clouds n={3} opacity={0.08}/><Snow n={40}/></>}
      {type === 'thunder'     && <><Clouds n={2} opacity={0.04}/><Rain n={60} heavy/>{flash && <LightningFlash/>}</>}
    </div>
  );
}
