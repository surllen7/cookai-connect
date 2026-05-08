import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/community', icon: Users, label: '社区' },
  { path: '/profile', icon: User, label: '我的' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-[88px] bg-white/95 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-2 pb-6 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center w-16 gap-1 relative ${
              active ? 'text-[#84B741]' : 'text-[#A0AEC0] hover:text-slate-600'
            } active:scale-95 transition-transform`}
          >
            <div className={`transition-all duration-300 ease-spring ${active ? '-translate-y-1 scale-110 drop-shadow-sm' : ''}`}>
              <Icon size={26} strokeWidth={2.5} />
            </div>
            <span className={`text-[11px] ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
            <div className={`absolute -bottom-3 w-1.5 h-1.5 rounded-full bg-[#84B741] transition-all duration-300 ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
          </button>
        );
      })}
    </nav>
  );
}
