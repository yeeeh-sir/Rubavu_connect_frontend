import logo from '../logo.png';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell, ChevronDown, CircleDot, FileImage, Home, LogOut, Menu, MessageCircle, Plus,
  Radio, Search, Settings, UsersRound, User as UserIcon, X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SearchOverlay from './SearchOverlay';

function countBadge(count) {
  if (!count) return null;
  return (
    <span className="ml-1 inline-flex min-w-[18px] justify-center rounded-full bg-red-500 px-1.5 py-px text-[10px] font-bold leading-4 text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Navbar({ user, badges = { notifications: 0, messages: 0 } }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const createRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!createOpen && !profileOpen) return undefined;
    const onDocClick = (event) => {
      if (createRef.current && !createRef.current.contains(event.target)) setCreateOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [createOpen, profileOpen]);

  const navItems = [
    { to: '/', label: 'Home', end: true, icon: Home },
    { to: '/discover', label: 'Discover Friends', icon: Search },
    { to: '/live', label: 'Live', icon: Radio },
    { to: '/connections', label: 'Connections', icon: UsersRound },
    { to: '/messages', label: 'Messages', icon: MessageCircle, badge: badges.messages },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: badges.notifications },
    { to: '/profile', label: 'Profile', icon: UserIcon, profile: true },
  ];

  const createItems = [
    { to: '/create', icon: FileImage, label: 'Post', desc: 'Share photos and videos' },
    { to: '/status', icon: CircleDot, label: 'Status', desc: 'A story that disappears after 25h' },
    { to: '/live', icon: Radio, label: 'Live', desc: 'Stream live to your audience' },
  ];

  const linkTo = (item) => (item.profile && user ? `/profile/${user.username}` : item.to);

  const handleCreate = (item) => {
    setCreateOpen(false);
    navigate(item.to);
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white">
      <div className="container-app flex h-16 items-center justify-between gap-3 sm:gap-5">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 text-primary-900" aria-label="Rubavu Connect home">
          <img src={logo} alt="Rubavu Connect logo" className="h-10 w-10 object-contain" />
          <span className="hidden text-lg font-extrabold tracking-tight sm:block">Rubavu Connect</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 2xl:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={linkTo(item)}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] font-bold transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-primary-700'
                }`
              }
            >
              {item.label}
              {countBadge(item.badge)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
            aria-label="Search people"
          >
            <Search size={18} />
            <span className="hidden text-xs font-bold lg:inline">Search</span>
          </button>

          <Link
            to="/notifications"
            className="relative rounded-full p-2.5 text-primary-900 transition-colors hover:bg-primary-50 2xl:hidden"
            aria-label={`Notifications${badges.notifications ? `, ${badges.notifications} unread` : ''}`}
          >
            <Bell size={20} />
            {badges.notifications > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </Link>

          <div className="relative hidden sm:block" ref={createRef}>
            <div className="flex items-stretch overflow-hidden rounded-full bg-primary-600 shadow-sm shadow-primary-600/25">
              <button
                type="button"
                onClick={() => navigate('/create')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-primary-700"
              >
                <Plus size={15} /> Create Post
              </button>
              <button
                type="button"
                onClick={() => setCreateOpen((open) => !open)}
                className="border-l border-white/20 px-2.5 text-white transition-colors hover:bg-primary-700"
                aria-label="More create options"
                aria-expanded={createOpen}
              >
                <ChevronDown size={15} className={`transition-transform duration-200 ${createOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {createOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl animate-fade-in">
                {createItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleCreate(item)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                        <Icon size={18} />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-slate-800">{item.label}</span>
                        <span className="block text-xs text-slate-400">{item.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {user && (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center gap-1 rounded-full transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
                aria-label="Account menu"
                aria-expanded={profileOpen}
              >
                {user.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt=""
                    className="h-9 w-9 rounded-full bg-slate-200 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="header-avatar-fallback"><UserIcon size={18} /></span>
                )}
                <ChevronDown
                  size={14}
                  className={`hidden text-slate-500 transition-transform duration-200 sm:block ${profileOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl animate-fade-in">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-extrabold text-slate-900">{user.full_name || user.username}</p>
                    <p className="truncate text-xs text-slate-400">@{user.username}</p>
                  </div>
                  <Link
                    to={`/profile/${user.username}`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <UserIcon size={16} className="text-slate-400" /> Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Settings size={16} className="text-slate-400" /> Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-full p-2 text-primary-900 transition-colors hover:bg-primary-50 2xl:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 shadow-lg 2xl:hidden">
          <nav className="container-app grid grid-cols-2 gap-1.5 sm:grid-cols-3" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={linkTo(item)}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100 hover:text-primary-700'
                    }`
                  }
                >
                  <Icon size={17} className="shrink-0 text-slate-400" />
                  <span className="truncate">{item.label}</span>
                  {countBadge(item.badge)}
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
