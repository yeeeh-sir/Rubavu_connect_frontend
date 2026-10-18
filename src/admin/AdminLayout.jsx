import { useMemo, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, MessageSquare, Flag, ShieldAlert,
  Network, Radio, CircleDot, Bell, BarChart3, Images, KeyRound,
  Settings, ScrollText, PanelLeftClose, PanelLeftOpen, Menu, LogOut,
  ExternalLink, ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { can } from './permissions';
import './admin.css';

const NAV_SECTIONS = [
  {
    label: 'Dashboard',
    items: [
      { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard, perm: 'dashboard.read' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/admin/users', label: 'Users', icon: Users, perm: 'users.read' },
      { to: '/admin/posts', label: 'Posts', icon: FileText, perm: 'content.read' },
      { to: '/admin/comments', label: 'Comments', icon: MessageSquare, perm: 'content.read' },
      { to: '/admin/reports', label: 'Reports', icon: Flag, perm: 'reports.read' },
      { to: '/admin/messages-safety', label: 'Messages & Safety', icon: ShieldAlert, perm: 'safety.read' },
      { to: '/admin/connections', label: 'Connections', icon: Network, perm: 'connections.read' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/live', label: 'Live sessions', icon: Radio, perm: 'live.read' },
      { to: '/admin/statuses', label: 'Statuses', icon: CircleDot, perm: 'content.read' },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell, perm: 'notifications.read' },
      { to: '/admin/media', label: 'Media', icon: Images, perm: 'content.read' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, perm: 'analytics.read' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/admin/roles', label: 'Roles & Permissions', icon: KeyRound, perm: 'roles.write' },
      { to: '/admin/settings', label: 'System Settings', icon: Settings, perm: 'settings.read' },
      { to: '/admin/audit', label: 'Security & Audit', icon: ScrollText, perm: 'audit.read' },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = useMemo(
    () =>
      NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter((item) => can(user, item.perm)),
      })).filter((section) => section.items.length > 0),
    [user]
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <div
        className={`admin-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      >
        <div className="admin-sidebar-header">
          <div className="admin-brand-badge">RC</div>
          <div className="admin-brand-text-wrap min-w-0">
            <div className="admin-brand-text">Admin Console</div>
            <div className="admin-brand-sub">Rubavu Connect</div>
          </div>
        </div>
        <nav className="admin-nav">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="admin-nav-label">{section.label}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `admin-nav-item ${isActive ? 'active' : ''}`
                    }
                    onClick={() => setMobileOpen(false)}
                    title={item.label}
                  >
                    <Icon size={19} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          {user?.profile_image_url ? (
            <img className="admin-avatar" src={user.profile_image_url} alt="" />
          ) : (
            <div className="admin-avatar flex items-center justify-center font-bold">
              {(user?.full_name || user?.username || '?').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
              {user?.full_name || user?.username}
            </div>
            <span className="admin-chip" style={{ background: 'rgba(53,196,106,.18)', color: '#7de6a4' }}>
              {user?.role}
            </span>
          </div>
        </div>
      </aside>

      <div className={`admin-main ${collapsed ? 'collapsed' : ''}`}>
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-btn-sm lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-btn-sm hidden lg:inline-flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <div className="flex-1 min-w-0" />
          <Link
            to="/"
            className="admin-btn admin-btn-ghost admin-btn-sm"
            title="Back to app"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Back to app</span>
            <ExternalLink size={13} className="hidden sm:inline opacity-60" />
          </Link>
          <button
            type="button"
            className="admin-btn admin-btn-danger admin-btn-sm"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
