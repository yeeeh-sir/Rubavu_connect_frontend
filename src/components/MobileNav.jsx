import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/discover', icon: Search, label: 'Discover' },
];

const createItems = [
  { to: '/create', label: 'Post' },
  { to: '/status', label: 'Status' },
  { to: '/live', label: 'Live' },
];

export default function MobileNav() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={user ? to : to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-2.5 text-[10px] font-medium ${
                isActive ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'
              }`
            }
            aria-label={label}
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}

        <div className="relative flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={() => setCreateOpen((o) => !o)}
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-700 text-white shadow-lg shadow-accent-500/30 active:scale-95 transition-transform"
            aria-label="Create"
          >
            <Plus size={26} />
          </button>
          <span className="text-[10px] font-medium text-slate-500 mt-0.5">Create</span>
          {createOpen && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-44 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 py-2 overflow-hidden animate-fade-in">
              {createItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setCreateOpen(false)}
                  className="block w-full px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-accent-50 hover:text-accent-700 text-center transition-colors"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 px-3 py-2.5 text-[10px] font-medium ${
              isActive ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'
            }`
          }
          aria-label="Messages"
        >
          <MessageCircle size={22} />
          Messages
        </NavLink>
        <NavLink
          to={user ? `/profile/${user.username}` : '/profile'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 px-3 py-2.5 text-[10px] font-medium ${
              isActive ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'
            }`
          }
          aria-label="Profile"
        >
          <User size={22} />
          Profile
        </NavLink>
      </div>
    </nav>
  );
}