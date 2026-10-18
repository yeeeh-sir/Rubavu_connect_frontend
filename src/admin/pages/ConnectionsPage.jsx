import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, RefreshCw } from 'lucide-react';
import * as adminApi from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { can } from '../permissions';
import {
  useAsync, PageHeader, AdminTable, StatusPill, Pagination, ConfirmDialog,
  ErrorBox, EmptyState, fmtDate, fmtNum,
} from '../components';

export default function ConnectionsPage() {
  const { user: me } = useAuth();
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const { loading, error, data, reload } = useAsync(
    () => adminApi.listConnections({ page, limit: 30 }),
    [page]
  );

  const connections = data?.connections || [];
  const pagination = data?.pagination || {};
  const canWrite = can(me, 'connections.write');

  const remove = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await adminApi.adminRemoveConnection(dialog.id);
      setDialog(null);
      reload();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Remove failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Connections"
        subtitle={`${fmtNum(pagination.total || 0)} connections on the platform`}
        actions={
          <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={reload}>
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />
      <ErrorBox message={error || actionError} onRetry={reload} />

      {connections.length === 0 && !loading ? (
        <div className="admin-panel"><EmptyState title="No connections" /></div>
      ) : (
        <AdminTable loading={loading} headers={['User A', 'User B', 'Status', 'Since', 'Actions']}>
          {connections.map((c) => (
            <tr key={c.id}>
              <td>
                <Link to={`/admin/users/${c.user_id}`} style={{ fontWeight: 600, color: '#1464d2' }}>
                  {c.user_username || `#${c.user_id}`}
                </Link>
              </td>
              <td>
                <Link to={`/admin/users/${c.connected_user_id}`} style={{ fontWeight: 600, color: '#1464d2' }}>
                  {c.connected_username || `#${c.connected_user_id}`}
                </Link>
              </td>
              <td>
                <StatusPill tone={c.status === 'accepted' ? 'green' : c.status === 'pending' ? 'amber' : 'slate'}>
                  {c.status}
                </StatusPill>
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(c.created_at)}</td>
              <td>
                {canWrite && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    onClick={() => setDialog(c)}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      <Pagination pagination={pagination} onChange={setPage} />

      <ConfirmDialog
        open={!!dialog}
        loading={busy}
        title="Remove connection"
        message={`Remove the connection between ${dialog?.user_username} and ${dialog?.connected_username}? Both will need to reconnect.`}
        confirmLabel="Remove"
        danger
        onCancel={() => setDialog(null)}
        onConfirm={remove}
      />
    </div>
  );
}
