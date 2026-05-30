import { NavLink } from 'react-router-dom';
import { Home, Map } from 'lucide-react';

export default function BottomNav() {
  const link = (to, Icon, label) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all duration-200 ${
          isActive ? 'text-white' : 'text-white/30 active:text-white/70'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`p-2 rounded-2xl transition-all duration-200 ${isActive ? 'bg-white/15' : ''}`}>
            <Icon size={22} strokeWidth={isActive ? 2 : 1.6} />
          </div>
          <span className="text-[10px] font-semibold tracking-wide">{label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 lg:hidden flex"
      style={{
        background: 'rgba(4,6,12,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {link('/', Home, 'Home')}
      {link('/map', Map, 'Map')}
    </nav>
  );
}
