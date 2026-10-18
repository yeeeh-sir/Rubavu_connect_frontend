import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import * as adminApi from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { can } from '../permissions';
import {
  useAsync, PageHeader, AdminTable, Pagination, ConfirmDialog, ErrorBox,
  EmptyState, fmtDateTime, fmtNum,
} from '../components';

export default function StatusesPage() {
  const { user: me } = useAuth();
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const { loading, error, data, reload } = useAsync(
    () => adminApi.listStatuses({ page, limit: 30 }),
    [page]
  );

  const statuses = data?.statuses || [];
  const pagination = data?.pagination || {};
  const canWrite = can(me, 'content.write');

  const remove = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await adminApi.adminDeleteStatus(dialog.id);
      setDialog(null);
      reload();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Statuses" subtitle={`${fmtNum(pagination.total || 0)} story/status updates`} />
      <ErrorBox message={error || actionError} onRetry={reload} />

      {statuses.length === 0 && !loading ? (
        <div className="admin-panel"><EmptyState title="No statuses" /></div>
      ) : (
        <AdminTable loading={loading} headers={['Author', 'Media', 'Caption', 'When', 'Actions']}>
          {statuses.map((s) => (
            <tr key={s.id}>
              <td>
                <Link to={`/admin/users/${s.user_id}`} style={{ fontWeight: 600, color: '#1464d2' }}>
                  {s.username || `#${s.user_id}`}
                </Link>
              </td>
              <td>
                {s.media_url ? (
                  <img src={s.media_url} alt="" className="admin-thumb" loading="lazy" />
                ) : (
                  <span style={{ color: '#94a3b8' }}>—</span>
                )}
              </td>
              <td style={{ maxWidth: 280 }}>
                <div className="truncate">{s.caption || <span style={{ color: '#94a3b8' }}>—</span>}</div>
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(s.created_at)}</td>
              <td>
                {canWrite && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    onClick={() => setDialog(s)}
                  >
                    <Trash2 size={14} /> Delete
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
        title="Delete status"
        message={`Delete ${dialog?.username}'s status? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDialog(null)}
        onConfirm={remove}
      />
    </div>
  );
}
