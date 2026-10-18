import { Link } from 'react-router-dom';
import { Bell, MessageCircle, Heart, Flag, UserPlus, Radio } from 'lucide-react';
import * as adminApi from '../../api/admin';
import {
  useAsync, PageHeader, AdminTable, ErrorBox, EmptyState, fmtDateTime, fmtNum, StatCard,
} from '../components';

const TYPE_META = {
  message: { label: 'Messages', icon: MessageCircle, color: '#1464d2' },
  like: { label: 'Likes', icon: Heart, color: '#dc2626' },
  comment: { label: 'Comments', icon: MessageCircle, color: '#18a84a' },
  follow: { label: 'Follows', icon: UserPlus, color: '#7c3aed' },
  report: { label: 'Reports', icon: Flag, color: '#d97706' },
  live: { label: 'Live', icon: Radio, color: '#0891b2' },
};

export default function NotificationsPage() {
  const { loading, error, data, reload } = useAsync(
    () => adminApi.getNotificationsOverview(),
    []
  );

  const byType = data?.byType || [];
  const recent = data?.recent || [];
  const totals = data?.totals || {};

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Platform-wide notification activity" />
      <ErrorBox message={error} onRetry={reload} />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
        <StatCard label="Total sent" value={fmtNum(totals.total)} />
        <StatCard label="Last 24h" value={fmtNum(totals.last24h)} />
        <StatCard label="Last 7d" value={fmtNum(totals.last7d)} />
        <StatCard label="Unread" value={fmtNum(totals.unread)} accent={totals.unread > 0 ? '#d97706' : undefined} />
      </div>

      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6 mb-6">
        {byType.map((row) => {
          const meta = TYPE_META[row.type] || { label: row.type, icon: Bell, color: '#64748b' };
          const Icon = meta.icon;
          return (
            <div key={row.type} className="admin-kpi">
              <div className="flex items-center gap-2">
                <Icon size={15} color={meta.color} />
                <div className="admin-kpi-label" style={{ textTransform: 'none' }}>{meta.label}</div>
              </div>
              <div className="admin-kpi-value" style={{ fontSize: '1.2rem' }}>{fmtNum(row.count)}</div>
            </div>
          );
        })}
      </div>

      <div className="admin-panel">
        <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0b1f37', marginBottom: 12 }}>Recent notifications</h3>
        {recent.length === 0 && !loading ? (
          <EmptyState title="No notifications yet" />
        ) : (
          <AdminTable loading={loading} headers={['Type', 'Recipient', 'Actor', 'Content', 'When']}>
            {recent.map((n) => {
              const meta = TYPE_META[n.type] || { label: n.type, color: '#64748b' };
              return (
                <tr key={n.id}>
                  <td>
                    <span className="admin-chip" style={{ background: `${meta.color}18`, color: meta.color }}>
                      {meta.label}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/users/${n.recipient_id}`} style={{ fontWeight: 600, color: '#1464d2' }}>
                      {n.recipient_username || `#${n.recipient_id}`}
                    </Link>
                  </td>
                  <td>
                    {n.actor_id ? (
                      <Link to={`/admin/users/${n.actor_id}`} style={{ color: '#475569' }}>
                        {n.actor_username || `#${n.actor_id}`}
                      </Link>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>system</span>
                    )}
                  </td>
                  <td style={{ maxWidth: 280 }}>
                    <div className="truncate" style={{ color: '#475569' }}>{n.content || n.data || '—'}</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(n.created_at)}</td>
                </tr>
              );
            })}
          </AdminTable>
        )}
      </div>
    </div>
  );
}
