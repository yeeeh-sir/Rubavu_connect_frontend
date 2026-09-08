import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Search, PlusSquare, MessageCircle, Bell, User, UsersRound, LogOut, Settings, Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/create', icon: PlusSquare, label: 'Create' },
    { to: '/live', icon: Radio, label: 'Live' },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/connections', icon: UsersRound, label: 'Connections' },
    ...(user ? [{ to: `/profile/${user.username}`, icon: User, label: 'Profile' }] : []),
  ];

  if (!user) return null;

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-[calc(100vh-4rem)] sticky top-16 border-r border-slate-200 bg-white">
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-3 py-3 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        <button
          type="button"
          className="nav-item w-full text-left"
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
