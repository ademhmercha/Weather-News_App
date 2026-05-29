import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Map, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Sidebar({ user }) {
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate('/auth');
  }

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
    <aside className="relative z-50 w-[64px] flex-shrink-0 flex flex-col items-center py-5 gap-1"
      style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Logo mark */}
      <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
          <path d="M7 1C7 1 2 5.5 2 8.5a5 5 0 0 0 10 0C12 5.5 7 1 7 1Z" fill="white" />
        </svg>
      </div>

      {link('/', Home, 'Home')}
      {link('/map', Map, 'Map')}

      <div className="flex-1" />

      <div className="flex flex-col items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-full bg-blue-600/80 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/10">
          {user?.email?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="text-white/30 hover:text-white/70 transition-colors p-2 rounded-xl hover:bg-white/10"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}
