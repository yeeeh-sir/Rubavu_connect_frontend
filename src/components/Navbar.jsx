import logo from '../logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, X, Plus, FileImage, Radio, CircleDot } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const createRef = useRef(null);

  useEffect(() => {
    if (!createOpen) return;
    const onDocClick = (e) => {
      if (createRef.current && !createRef.current.contains(e.target)) setCreateOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [createOpen]);

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/discover', label: 'Discover Friends' },
    { to: '/live', label: 'Live' },
    { to: '/connections', label: 'Connections' },
    { to: '/messages', label: 'Messages' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/profile', label: 'Profile' },
  ];

  const createItems = [
    { to: '/create', icon: FileImage, label: 'Post', desc: 'Share photos and videos' },
    { to: '/status', icon: CircleDot, label: 'Status', desc: 'A story that disappears after 25h' },
    { to: '/live', icon: Radio, label: 'Live', desc: 'Stream live to your audience' },
  ];

  const handleCreate = (item) => {
    setCreateOpen(false);
    navigate(item.to);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="container-app flex min-h-16 items-center justify-between gap-5 py-2">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 text-primary-900">
          <img
            src={logo}
            alt="Rubavu Connect logo"
            className="h-11 w-11 object-contain"
          />
          <span className="hidden text-lg font-extrabold tracking-tight sm:block">Rubavu Connect</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-4 xl:flex" aria-label="Primary navigation">
          {navItems.map(({ to, label }) => (
            <Link key={to} to={to === '/profile' && user ? `/profile/${user.username}` : to} className="text-xs font-bold text-slate-600 transition-colors hover:text-primary-600">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate('/discover')} className="rounded-full p-2.5 text-primary-900 transition-colors hover:bg-primary-50" aria-label="Discover friends">
            <Search size={20} />
          </button>
          <div className="relative" ref={createRef}>
            <button
              type="button"
              onClick={() => setCreateOpen((o) => !o)}
              className="hidden rounded-full bg-accent-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-accent-700 sm:inline-flex items-center gap-1.5"
            >
              <Plus size={15} /> Create
            </button>
            {createOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 py-2 overflow-hidden animate-fade-in">
                {createItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleCreate(item)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="h-9 w-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
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
            <Link to={`/profile/${user.username}`} className="rounded-full transition hover:ring-2 hover:ring-accent-300">
              <img
                src={user.profile_image_url || ''}
                alt={user.full_name || user.username}
                className="h-9 w-9 rounded-full object-cover bg-slate-200"
                loading="lazy"
              />
            </Link>
          )}
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="rounded-full p-2 text-primary-900 hover:bg-primary-50 xl:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 xl:hidden">
          <nav className="container-app grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Mobile navigation">
            {navItems.map(({ to, label }) => (
              <Link key={to} to={to === '/profile' && user ? `/profile/${user.username}` : to} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-primary-50 hover:text-primary-700">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}