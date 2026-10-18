import { Link } from 'react-router-dom';
import {
  Users, FileText, Flag, UserPlus, Activity, AlertTriangle, Clock,
} from 'lucide-react';
import * as adminApi from '../../api/admin';
import {
  useAsync, PageHeader, StatCard, AdminTable, EmptyState, ErrorBox,
  fmtDate, fmtDateTime, fmtNum, roleTone, StatusPill,
} from '../components';
import { LineChart } from '../charts';

function toSeries(rows, dateKey = 'date', valueKey = 'count') {
  return (rows || []).map((r) => ({
    date: String(r[dateKey]).slice(0, 10),
    count: Number(r[valueKey]) || 0,
  }));
}

export default function OverviewPage() {
  const { loading, error, data, reload } = useAsync(() => adminApi.getOverview(), []);

  const stats = data?.stats || {};
  const trends = data?.trends || {};
  const recent = data?.recent || {};

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Platform health at a glance"
      />
      <ErrorBox message={error} onRetry={reload} />

      {loading && !data ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="admin-kpi" style={{ height: 96 }} />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 mb-6">
            <StatCard label="Total users" value={fmtNum(stats.totalUsers)} hint={`${fmtNum(stats.newUsers7d)} new (7d)`} />
            <StatCard label="Active (30d)" value={fmtNum(stats.activeUsers30d)} />
            <StatCard label="Posts" value={fmtNum(stats.totalPosts)} hint={`${fmtNum(stats.newPosts7d)} new (7d)`} />
            <StatCard label="Comments" value={fmtNum(stats.totalComments)} />
            <StatCard label="Open reports" value={fmtNum(stats.openReports)} accent={stats.openReports > 0 ? '#d97706' : undefined} />
            <StatCard label="Connections" value={fmtNum(stats.totalConnections)} />
            <StatCard label="Messages" value={fmtNum(stats.totalMessages)} />
            <StatCard label="Live sessions" value={fmtNum(stats.activeLiveSessions)} accent={stats.activeLiveSessions > 0 ? '#18a84a' : undefined} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mb-6">
            <div className="admin-panel">
              <LineChart
                title="Registrations (14 days)"
                data={toSeries(trends.registrations)}
                xKey="date"
                yKey="count"
                color="#1464d2"
              />
            </div>
            <div className="admin-panel">
              <LineChart
                title="Posts (14 days)"
                data={toSeries(trends.posts)}
                xKey="date"
                yKey="count"
                color="#18a84a"
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="admin-panel">
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0b1f37' }}>Recent signups</h3>
                <Link to="/admin/users" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1464d2' }}>
                  View all
                </Link>
              </div>
              {(recent.users || []).length === 0 ? (
                <EmptyState title="No users yet" />
              ) : (
                <AdminTable headers={['User', 'Role', 'Joined']} cols={3}>
                  {(recent.users || []).map((u) => (
                    <tr key={u.id}>
                      <td>
                        <Link to={`/admin/users/${u.id}`} style={{ fontWeight: 700, color: '#1464d2' }}>
                          {u.full_name || u.username}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>@{u.username}</div>
                      </td>
                      <td><StatusPill tone={roleTone(u.role)}>{u.role}</StatusPill></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(u.created_at)}</td>
                    </tr>
                  ))}
                </AdminTable>
              )}
            </div>

            <div className="admin-panel">
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0b1f37' }}>Recent admin actions</h3>
                <Link to="/admin/audit" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1464d2' }}>
                  Audit log
                </Link>
              </div>
              {(recent.audit || []).length === 0 ? (
                <EmptyState title="No admin activity yet" />
              ) : (
                <AdminTable headers={['Action', 'Actor', 'When']} cols={3}>
                  {(recent.audit || []).map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{log.action}</span>
                      </td>
                      <td>{log.actor_username || log.actor_id || 'system'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(log.created_at)}</td>
                    </tr>
                  ))}
                </AdminTable>
              )}
            </div>
          </div>

          {(stats.openReports || 0) > 0 && (
            <div
              className="flex items-center gap-3 mt-6"
              style={{
                background: 'rgba(217,119,6,.08)',
                border: '1px solid rgba(217,119,6,.3)',
                borderRadius: 14,
                padding: '0.9rem 1.1rem',
              }}
            >
              <AlertTriangle size={20} color="#d97706" />
              <div className="flex-1" style={{ fontSize: '0.875rem', color: '#92400e' }}>
                <strong>{fmtNum(stats.openReports)}</strong> report{stats.openReports === 1 ? '' : 's'} waiting for review.
              </div>
              <Link to="/admin/reports" className="admin-btn admin-btn-primary admin-btn-sm">
                Review reports
              </Link>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
