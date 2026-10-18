export const ROLE_RANK = {
  user: 0,
  support: 1,
  moderator: 2,
  admin: 3,
  super_admin: 4,
};

export const ROLE_LABELS = {
  user: 'User',
  support: 'Support',
  moderator: 'Moderator',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

export const ROLE_PERMISSIONS = {
  support: ['dashboard.read', 'users.read', 'reports.read'],
  moderator: [
    'dashboard.read', 'users.read', 'reports.read', 'reports.write',
    'content.read', 'content.write', 'live.read', 'live.write',
    'safety.read', 'safety.write', 'connections.read', 'notifications.read',
  ],
  admin: [
    'dashboard.read', 'users.read', 'users.write', 'reports.read', 'reports.write',
    'content.read', 'content.write', 'live.read', 'live.write', 'safety.read',
    'safety.write', 'connections.read', 'connections.write', 'notifications.read',
    'roles.write', 'analytics.read', 'settings.read', 'settings.write',
    'audit.read', 'messages.read',
  ],
  super_admin: [
    'dashboard.read', 'users.read', 'users.write', 'reports.read', 'reports.write',
    'content.read', 'content.write', 'live.read', 'live.write', 'safety.read',
    'safety.write', 'connections.read', 'connections.write', 'notifications.read',
    'roles.write', 'analytics.read', 'settings.read', 'settings.write',
    'settings.sensitive', 'audit.read', 'messages.read',
  ],
};

export const STAFF_ROLES = ['support', 'moderator', 'admin', 'super_admin'];

export function can(user, permission) {
  const role = user?.role || 'user';
  return (ROLE_PERMISSIONS[role] || []).includes(permission);
}

export function isStaff(user) {
  return STAFF_ROLES.includes(user?.role);
}
