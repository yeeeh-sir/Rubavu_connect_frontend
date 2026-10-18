import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeOff, RotateCcw, Trash2, Search } from 'lucide-react';
import * as adminApi from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { can } from '../permissions';
import {
  useAsync, PageHeader, AdminTable, StatusPill, Pagination, ConfirmDialog,
  ErrorBox, EmptyState, fmtDate, fmtNum,
} from '../components';

const VISIBILITY_OPTIONS = [
  { value: '', label: 'All posts' },
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
];

export default function AdminPostsPage() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [visibility, setVisibility] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState(null);

  const { loading, error, data, reload } = useAsync(
    () => adminApi.listPosts({ search, visibility, from, to, page, limit: 20 }),
    [search, visibility, from, to, page]
  );

  const posts = data?.posts || [];
  const pagination = data?.pagination || {};
  const canWrite = can(me, 'content.write');

  const runAction = async () => {
    if (!dialog) return;
    setBusy(true);
    setDialogError(null);
    try {
      if (dialog.kind === 'hide') {
        await adminApi.hidePost(dialog.target.id, dialog.reason);
      } else if (dialog.kind === 'restore') {
        await adminApi.restorePost(dialog.target.id);
      } else if (dialog.kind === 'delete') {
        await adminApi.adminDeletePost(dialog.target.id);
      }
      setDialog(null);
      reload();
    } catch (err) {
      setDialogError(err?.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Posts" subtitle={`Moderate ${fmtNum(pagination.total || 0)} posts`} />
      <ErrorBox message={error} onRetry={reload} />

      <div className="admin-panel mb-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="admin-field">
            <label>Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }} />
              <input
                className="admin-input"
                style={{ paddingLeft: 32 }}
                placeholder="Caption or author…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <div className="admin-field">
            <label>Visibility</label>
            <select className="admin-select" value={visibility} onChange={(e) => { setVisibility(e.target.value); setPage(1); }}>
              {VISIBILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label>From</label>
            <input type="date" className="admin-input" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="admin-field">
            <label>To</label>
            <input type="date" className="admin-input" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
          </div>
        </div>
      </div>

      {posts.length === 0 && !loading ? (
        <div className="admin-panel"><EmptyState title="No posts match these filters" /></div>
      ) : (
        <AdminTable
          loading={loading}
          headers={['Post', 'Author', 'Status', 'Reports', 'Date', 'Actions']}
        >
          {posts.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="flex items-center gap-3" style={{ maxWidth: 360 }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="admin-thumb" loading="lazy" />
                  ) : (
                    <div className="admin-thumb flex items-center justify-center" style={{ color: '#94a3b8', fontSize: '0.65rem' }}>
                      text
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate" style={{ fontWeight: 600 }}>{p.content || '(no caption)'}</div>
                    {p.location && <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{p.location}</div>}
                  </div>
                </div>
              </td>
              <td>
                <Link to={`/admin/users/${p.user_id}`} style={{ fontWeight: 600, color: '#1464d2' }}>
                  {p.username || p.full_name || `#${p.user_id}`}
                </Link>
              </td>
              <td>
                <StatusPill tone={p.is_hidden ? 'red' : 'green'}>
                  {p.is_hidden ? `Hidden · ${p.hidden_reason || 'policy'}` : 'Visible'}
                </StatusPill>
              </td>
              <td>{fmtNum(p.report_count)}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(p.created_at)}</td>
              <td>
                {canWrite && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.is_hidden ? (
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        onClick={() => setDialog({ kind: 'restore', target: p })}
                      >
                        <RotateCcw size={14} /> Restore
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        onClick={() => setDialog({ kind: 'hide', target: p, reason: '' })}
                      >
                        <EyeOff size={14} /> Hide
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => setDialog({ kind: 'delete', target: p })}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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
        title={
          dialog?.kind === 'hide' ? 'Hide post'
            : dialog?.kind === 'restore' ? 'Restore post'
              : 'Delete post permanently'
        }
        message={
          dialog?.kind === 'delete'
            ? 'This removes the post and its comments for everyone. This cannot be undone.'
            : dialog?.kind === 'restore'
              ? 'Make this post visible in the feed again?'
              : 'Hide this post from the feed. Only admins can see hidden posts.'
        }
        reasonLabel={dialog?.kind === 'hide' ? 'Reason (shown to moderators)' : undefined}
        reasonRequired={dialog?.kind === 'hide'}
        reasonValue={dialog?.reason}
        onReasonChange={(v) => setDialog((d) => ({ ...d, reason: v }))}
        danger={dialog?.kind !== 'restore'}
        onCancel={() => setDialog(null)}
        onConfirm={runAction}
      />
    </div>
  );
}
