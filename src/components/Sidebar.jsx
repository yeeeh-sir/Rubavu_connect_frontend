import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Compass,
  Home,
  LogOut,
  MessageCircle,
  PanelLeft,
  PlusSquare,
  Radio,
  Search,
  Settings,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/discover', icon: Compass, label: 'Discover people' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/create', icon: PlusSquare, label: 'Create post' },
    { to: '/live', icon: Radio, label: 'Live' },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/connections', icon: UsersRound, label: 'Connections' },
    ...(user ? [{ to: `/profile/${user.username}`, icon: UserRound, label: 'Profile' }] : []),
  ];

  if (!user) return null;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-section-label">YOUR SPACE</div>
      <nav className="sidebar-nav" aria-label="Main menu">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item${isActive ? ' nav-item-active' : ''}`}
          >
            <Icon size={19} strokeWidth={1.9} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {['support', 'moderator', 'admin', 'super_admin'].includes(user.role) && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-item${isActive ? ' nav-item-active' : ''}`}
          >
            <PanelLeft size={19} strokeWidth={1.9} />
            <span>Admin panel</span>
          </NavLink>
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item${isActive ? ' nav-item-active' : ''}`}
        >
          <Settings size={19} strokeWidth={1.9} />
          <span>Settings</span>
        </NavLink>
        <button
          type="button"
          className="nav-item sidebar-logout"
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
        >
          <LogOut size={19} strokeWidth={1.9} />
          <span>Logout</span>
        </button>
        <div className="sidebar-account">
          {user.profile_image_url ? (
            <img src={user.profile_image_url} alt="" />
          ) : (
            <span className="sidebar-account-fallback"><UserRound size={17} /></span>
          )}
          <span>
            <strong>{user.full_name || user.username}</strong>
            <small>@{user.username}</small>
          </span>
        </div>
      </div>
    </aside>
  );
}
