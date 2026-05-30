export function computeComfortScore({ temp, feelsLike, humidity, uv, rain, wind }) {
  const ft = feelsLike ?? temp;
  const tempScore = Math.max(0, 30 - Math.abs(ft - 23) * 2.5);
  const humScore  = Math.max(0, 25 - Math.max(0, Math.abs((humidity ?? 50) - 50) - 8) * 1.6);
  const uvScore   = Math.max(0, 15 - (uv ?? 0) * 1.5);
  const rainScore = Math.max(0, 20 - (rain ?? 0) * 0.22);
  const windScore = (wind ?? 0) <= 25 ? 10 : Math.max(0, 10 - ((wind ?? 0) - 25) * 0.3);
  return Math.round(Math.min(100, tempScore + humScore + uvScore + rainScore + windScore));
}

function scoreColor(s) {
  if (s >= 80) return '#10b981';
  if (s >= 60) return '#3b82f6';
  if (s >= 40) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(s) {
  if (s >= 85) return 'Excellent day for outdoor activities';
  if (s >= 70) return 'Good conditions outside';
  if (s >= 55) return 'Moderate — some discomfort';
  if (s >= 35) return 'Not ideal for outdoor activities';
  return 'Stay indoors if possible';
}

export default function ComfortScore({ score }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl"
      style={{ background:'rgba(0,0,0,0.22)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.08)' }}>
      {/* Circular arc */}
      <svg viewBox="0 0 100 100" className="w-20 h-20 flex-shrink-0" style={{ transform:'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 1s ease' }}
        />
        <g style={{ transform:'rotate(90deg)', transformOrigin:'50px 50px' }}>
          <text x="50" y="44" textAnchor="middle" fill="white"
            style={{ fontSize:'24px', fontWeight:'200', fontFamily:'Inter,sans-serif' }}>
            {score}
          </text>
          <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.35)"
            style={{ fontSize:'9px', fontFamily:'Inter,sans-serif' }}>
            / 100
          </text>
        </g>
      </svg>

      <div>
        <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-1">
          Comfort Score
        </p>
        <p className="text-white text-base font-medium leading-snug" style={{ color }}>
          {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'}
        </p>
        <p className="text-white/50 text-xs mt-0.5 leading-snug">{scoreLabel(score)}</p>
      </div>
    </div>
  );
}
