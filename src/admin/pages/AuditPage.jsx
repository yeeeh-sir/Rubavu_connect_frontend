import { useState } from 'react';
import { Shield } from 'lucide-react';
import * as adminApi from '../../api/admin';
import {
  useAsync, PageHeader, AdminTable, Pagination, StatusPill, ErrorBox,
  EmptyState, fmtDateTime,
} from '../components';

const ACTION_OPTIONS = [
  '',
  'user.status_changed',
  'user.role_changed',
  'user.verified',
  'user.deleted',
  'post.hidden',
  'post.restored',
  'post.deleted',
  'comment.deleted',
  'report.status_changed',
  'report.assigned',
  'report.note_added',
  'settings.updated',
  'live.ended',
  'connection.removed',
  'message.accessed',
  'auth.denied',
];

const TONE_BY_PREFIX = {
  user: 'blue',
  post: 'purple',
  comment: 'purple',
  report: 'amber',
  settings: 'slate',
  live: 'green',
  connection: 'slate',
  message: 'red',
  auth: 'red',
};

export default function AuditPage() {
  const [action, setAction] = useState('');
  const [actorId, setActorId] = useState('');
  const [entityId, setEntityId] = useState('');
  const [page, setPage] = useState(1);

  const { loading, error, data, reload } = useAsync(
    () => adminApi.getAuditLogs({ action, actor_id: actorId, entity_id: entityId, page, limit: 40 }),
    [action, actorId, entityId, page]
  );

  const logs = data?.logs || [];
  const pagination = data?.pagination || {};

  return (
    <div>
      <PageHeader
        title="Security & Audit"
        subtitle="Immutable log of every administrative action"
        actions={
          <span className="admin-chip" style={{ background: '#eef3fa', color: '#1d3d66' }}>
            <Shield size={12} /> {pagination.total != null ? `${pagination.total} events` : ''}
          </span>
        }
      />
      <ErrorBox message={error} onRetry={reload} />

      <div className="admin-panel mb-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="admin-field">
            <label>Action</label>
            <select className="admin-select" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
              {ACTION_OPTIONS.map((a) => (
                <option key={a} value={a}>{a || 'All actions'}</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Actor id</label>
            <input className="admin-input" value={actorId} onChange={(e) => { setActorId(e.target.value.replace(/\D/g, '')); setPage(1); }} placeholder="Any" />
          </div>
          <div className="admin-field">
            <label>Entity id</label>
            <input className="admin-input" value={entityId} onChange={(e) => { setEntityId(e.target.value.replace(/\D/g, '')); setPage(1); }} placeholder="Any" />
          </div>
          <div className="admin-field" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="admin-btn admin-btn-primary" onClick={reload}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {logs.length === 0 && !loading ? (
        <div className="admin-panel"><EmptyState title="No audit events" /></div>
      ) : (
        <AdminTable loading={loading} headers={['Action', 'Actor', 'Entity', 'Details', 'When']}>
          {logs.map((log) => {
            const prefix = String(log.action || '').split('.')[0];
            return (
              <tr key={log.id}>
                <td>
                  <StatusPill tone={TONE_BY_PREFIX[prefix] || 'slate'}>{log.action}</StatusPill>
                </td>
                <td>
                  {log.actor_username || (log.actor_id ? `#${log.actor_id}` : 'system')}
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>
                  {log.entity_type || '—'}
                  {log.entity_id != null && ` #${log.entity_id}`}
                </td>
                <td style={{ maxWidth: 320 }}>
                  <div
                    className="truncate"
                    style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#64748b' }}
                    title={typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '')}
                  >
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '—'}
                  </div>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(log.created_at)}</td>
              </tr>
            );
          })}
        </AdminTable>
      )}

      <Pagination pagination={pagination} onChange={setPage} />
    </div>
  );
}
