import { NavLink } from 'react-router-dom';
import { Home, Map } from 'lucide-react';

export default function Sidebar() {
  const link = (to, Icon, label) => (
    <NavLink
      to={to}
      end
      title={label}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 w-12 py-3 px-1 rounded-2xl transition-all duration-200 ${
          isActive
            ? 'bg-white/20 text-white'
            : 'text-white/35 hover:text-white/75 hover:bg-white/10'
        }`
      }
    >
      <Icon size={20} strokeWidth={1.8} />
      <span className="text-[9px] font-semibold tracking-wider uppercase">{label}</span>
    </NavLink>
  );

  return (
    <aside
      className="relative z-50 w-[64px] flex-shrink-0 flex flex-col items-center py-5 gap-1"
      style={{
        background: 'rgba(0,0,0,0.28)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
          <path d="M7 1C7 1 2 5.5 2 8.5a5 5 0 0 0 10 0C12 5.5 7 1 7 1Z" fill="white" />
        </svg>
      </div>

      {link('/', Home, 'Home')}
      {link('/map', Map, 'Map')}
    </aside>
  );
}
