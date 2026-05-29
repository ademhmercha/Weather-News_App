import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Home, Map } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar({ user }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/auth');
  }

  const link = (to, Icon, label) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          active
            ? 'text-white bg-slate-700/60'
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
        }`}
      >
        <Icon size={15} strokeWidth={active ? 2 : 1.5} />
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1C7 1 2 5.5 2 8.5a5 5 0 0 0 10 0C12 5.5 7 1 7 1Z"
                fill="white" />
            </svg>
          </div>
          <span className="text-slate-100 font-semibold text-sm tracking-tight">WeatherNews</span>
        </Link>

        <nav className="flex items-center gap-1">
          {link('/', Home, 'Home')}
          {link('/map', Map, 'Map')}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-slate-500 truncate max-w-[180px]">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 transition-all duration-200"
          >
            <LogOut size={14} strokeWidth={1.5} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
