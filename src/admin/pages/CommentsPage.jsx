import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Search } from 'lucide-react';
import * as adminApi from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { can } from '../permissions';
import {
  useAsync, PageHeader, AdminTable, StatusPill, Pagination, ConfirmDialog,
  ErrorBox, EmptyState, fmtDate, fmtNum,
} from '../components';

export default function CommentsPage() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState(null);

  const { loading, error, data, reload } = useAsync(
    () => adminApi.listComments({ search, page, limit: 25 }),
    [search, page]
  );

  const comments = data?.comments || [];
  const pagination = data?.pagination || {};
  const canWrite = can(me, 'content.write');

  const runAction = async () => {
    if (!dialog) return;
    setBusy(true);
    setDialogError(null);
    try {
      await adminApi.adminDeleteComment(dialog.target.id);
      setDialog(null);
      reload();
    } catch (err) {
      setDialogError(err?.response?.data?.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Comments" subtitle={`Moderate ${fmtNum(pagination.total || 0)} comments`} />
      <ErrorBox message={error} onRetry={reload} />

      <div className="admin-panel mb-4">
        <div className="admin-field" style={{ maxWidth: 360 }}>
          <label>Search</label>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }} />
            <input
              className="admin-input"
              style={{ paddingLeft: 32 }}
              placeholder="Comment text or author…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {comments.length === 0 && !loading ? (
        <div className="admin-panel"><EmptyState title="No comments match" /></div>
      ) : (
        <AdminTable loading={loading} headers={['Comment', 'Author', 'Post', 'Reports', 'Date', 'Actions']}>
          {comments.map((c) => (
            <tr key={c.id}>
              <td style={{ maxWidth: 320 }}>
                <div className="truncate" style={{ fontWeight: 600 }}>{c.content}</div>
              </td>
              <td>
                <Link to={`/admin/users/${c.user_id}`} style={{ fontWeight: 600, color: '#1464d2' }}>
                  {c.username || `#${c.user_id}`}
                </Link>
              </td>
              <td style={{ maxWidth: 200 }}>
                <div className="truncate" style={{ color: '#64748b' }}>{c.post_excerpt || `Post #${c.post_id}`}</div>
              </td>
              <td>
                {Number(c.report_count) > 0 ? (
                  <StatusPill tone="amber">{c.report_count}</StatusPill>
                ) : (
                  <span style={{ color: '#94a3b8' }}>0</span>
                )}
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(c.created_at)}</td>
              <td>
                {canWrite && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    onClick={() => setDialog({ target: c })}
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

      {dialogError && <ErrorBox message={dialogError} />}

      <ConfirmDialog
        open={!!dialog}
        loading={busy}
        title="Delete comment"
        message={`Delete: "${dialog?.target?.content?.slice(0, 120)}" — this cannot be undone.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDialog(null)}
        onConfirm={runAction}
      />
    </div>
  );
}
