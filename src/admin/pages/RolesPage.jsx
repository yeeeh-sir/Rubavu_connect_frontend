import { useSearchParams } from 'react-router-dom';
import { KeyRound, Users } from 'lucide-react';
import * as adminApi from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { can, ROLE_LABELS, ROLE_RANK } from '../permissions';
import {
  useAsync, PageHeader, AdminTable, StatusPill, ErrorBox, EmptyState,
  fmtNum, roleTone,
} from '../components';

const ROLE_TIPS = {
  support: 'Read-only access to dashboard, users and reports.',
  moderator: 'Everything support can do, plus hide content, resolve reports, manage live sessions, safety and connections.',
  admin: 'Full moderation plus user management, roles, analytics, settings, audit and message access.',
  super_admin: 'Everything above plus sensitive settings (maintenance mode, registration toggle). Cannot be assigned via the UI by anyone but another super admin.',
};

export default function RolesPage() {
  const { user: me } = useAuth();
  const [params] = useSearchParams();
  const assignTarget = params.get('assign');

  const { loading, error, data, reload } = useAsync(() => adminApi.getRoles(), []);
  const roles = data?.roles || [];

  const canRoles = can(me, 'roles.write');
  const myRank = ROLE_RANK[me?.role || 'user'];

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Who can do what on the platform"
      />
      <ErrorBox message={error} onRetry={reload} />

      {assignTarget && (
        <div
          className="mb-4"
          style={{
            background: 'rgba(20,100,210,.08)',
            border: '1px solid rgba(20,100,210,.25)',
            borderRadius: 12,
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            color: '#1d4ed8',
          }}
        >
          To change this user's role, open them in Users and use the role control there. User #{assignTarget}.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {roles.map((r) => (
          <div key={r.role} className="admin-panel">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <KeyRound size={17} color="#1464d2" />
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0b1f37' }}>
                  {ROLE_LABELS[r.role] || r.role}
                </h3>
                <StatusPill tone={roleTone(r.role)}>{r.role}</StatusPill>
              </div>
              <span className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                <Users size={13} /> {fmtNum(r.user_count)}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 10 }}>{ROLE_TIPS[r.role] || ''}</p>
            <div className="flex flex-wrap gap-1.5">
              {(r.permissions || []).map((p) => (
                <span
                  key={p}
                  className="admin-chip"
                  style={{
                    background: '#eef3fa',
                    color: r.role === 'super_admin' ? '#6d28d9' : '#1d3d66',
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-panel mb-6">
        <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0b1f37', marginBottom: 12 }}>Staff members</h3>
        {loading ? (
          <AdminTable headers={['User', 'Role', 'Status']} cols={3}>
            {[]}
          </AdminTable>
        ) : (data?.staff || []).length === 0 ? (
          <EmptyState title="No staff yet" message="Promote users from the Users page." />
        ) : (
          <AdminTable headers={['User', 'Role', 'Status']}>
            {(data?.staff || []).map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 700 }}>{u.full_name || u.username}</td>
                <td><StatusPill tone={roleTone(u.role)}>{u.role}</StatusPill></td>
                <td>
                  <StatusPill tone={u.is_active ? 'green' : 'red'}>
                    {u.is_active ? 'Active' : 'Suspended'}
                  </StatusPill>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>

      <div className="admin-panel" style={{ fontSize: '0.82rem', color: '#475569' }}>
        <strong>Rules:</strong> you can only assign roles strictly below your own rank ({me?.role}). Nobody can change their own role or status.
        Roles are re-checked from the database on every request — the browser never decides permissions.
      </div>
    </div>
  );
}
