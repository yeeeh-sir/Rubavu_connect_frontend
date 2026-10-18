import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, CalendarDays, ShieldCheck, ShieldOff, Trash2,
  BadgeCheck, FileText, MessageSquare, Flag,
} from 'lucide-react';
import * as adminApi from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { can, ROLE_RANK } from '../permissions';
import {
  useAsync, PageHeader, AdminTable, StatusPill, ConfirmDialog, ErrorBox,
  EmptyState, fmtDate, fmtDateTime, fmtNum, roleTone, reportStatusLabel, reportStatusTone,
} from '../components';

export default function UserDetailPage() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const { loading, error, data, reload } = useAsync(() => adminApi.getUserDetail(id), [id]);
  const user = data?.user;
  const posts = data?.posts || [];
  const reports = data?.reports || [];
  const moderationHistory = data?.moderationHistory || [];

  const canWrite = can(me, 'users.write');
  const canRoles = can(me, 'roles.write');
  const isSelf = user && user.id === me?.id;
  const outranks = user && ROLE_RANK[user.role] >= ROLE_RANK[me?.role || 'user'];

  const runAction = async () => {
    if (!dialog) return;
    setBusy(true);
    setActionError(null);
    try {
      if (dialog.kind === 'status') {
        await adminApi.updateUserStatus(user.id, dialog.nextActive, dialog.reason);
      } else if (dialog.kind === 'verify') {
        await adminApi.updateUserVerification(user.id, dialog.nextVerified);
      } else if (dialog.kind === 'email') {
        await adminApi.updateUserEmail(user.id, dialog.email);
      } else if (dialog.kind === 'delete') {
        await adminApi.deleteUser(user.id);
        navigate('/admin/users');
        return;
      }
      setDialog(null);
      reload();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading && !user) {
    return (
      <div>
        <PageHeader title="User" />
        <div className="admin-panel" style={{ height: 220 }} />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div>
        <PageHeader title="User" />
        <ErrorBox message={error} onRetry={reload} />
        <Link to="/admin/users" className="admin-btn admin-btn-ghost admin-btn-sm">
          <ArrowLeft size={15} /> Back to users
        </Link>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title={user.full_name || user.username}
        subtitle={`@${user.username} · member since ${fmtDate(user.created_at)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/users" className="admin-btn admin-btn-ghost admin-btn-sm">
              <ArrowLeft size={15} /> Back
            </Link>
            {canWrite && !isSelf && !outranks && (
              <>
                <button
                  type="button"
                  className={`admin-btn admin-btn-sm ${user.is_active ? 'admin-btn-danger' : 'admin-btn-success'}`}
                  onClick={() => setDialog({ kind: 'status', nextActive: !user.is_active, reason: '' })}
                >
                  {user.is_active ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                  {user.is_active ? 'Suspend' : 'Reactivate'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  onClick={() => setDialog({ kind: 'verify', nextVerified: !user.is_verified })}
                >
                  <BadgeCheck size={15} />
                  {user.is_verified ? 'Unverify' : 'Verify'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  onClick={() => setDialog({ kind: 'email', email: user.email })}
                >
                  <Mail size={15} /> Change email
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger admin-btn-sm"
                  onClick={() => setDialog({ kind: 'delete' })}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </>
            )}
            {canRoles && !isSelf && !outranks && user.is_active && (
              <button
                type="button"
                className="admin-btn admin-btn-primary admin-btn-sm"
                onClick={() => navigate(`/admin/roles?assign=${user.id}`)}
              >
                Change role
              </button>
            )}
          </div>
        }
      />

      {actionError && <ErrorBox message={actionError} />}

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <div className="admin-panel">
          <div className="flex items-center gap-3 mb-4">
            {user.profile_image_url ? (
              <img src={user.profile_image_url} alt="" className="admin-thumb" style={{ width: 64, height: 64, borderRadius: '50%' }} />
            ) : (
              <div
                className="flex items-center justify-center"
                style={{ width: 64, height: 64, borderRadius: '50%', background: '#e2eaf6', fontWeight: 800, color: '#1464d2', fontSize: '1.4rem' }}
              >
                {(user.full_name || user.username).slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-1">
                <StatusPill tone={roleTone(user.role)}>{user.role}</StatusPill>
                <StatusPill tone={user.is_active ? 'green' : 'red'}>
                  {user.is_active ? 'Active' : 'Suspended'}
                </StatusPill>
                {user.is_verified && <StatusPill tone="blue">Verified</StatusPill>}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{user.email}</div>
            </div>
          </div>
          <dl style={{ fontSize: '0.85rem', display: 'grid', gap: 8 }}>
            <div className="flex items-center gap-2" style={{ color: '#475569' }}>
              <Mail size={14} /> {user.email}
            </div>
            <div className="flex items-center gap-2" style={{ color: '#475569' }}>
              <CalendarDays size={14} /> Joined {fmtDate(user.created_at)}
            </div>
            {user.bio && <div style={{ color: '#475569' }}>{user.bio}</div>}
          </dl>
        </div>

        <div className="admin-panel">
          <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0b1f37', marginBottom: 12 }}>Activity</h3>
          <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {[
              ['Posts', user.post_count, FileText],
              ['Comments', user.comment_count, MessageSquare],
              ['Connections', user.connection_count, null],
              ['Open reports', user.open_report_count, Flag],
            ].map(([label, value, Icon]) => (
              <div key={label} style={{ background: '#f8fafd', borderRadius: 10, padding: '0.7rem 0.8rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1f37' }}>{fmtNum(value)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-panel">
          <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0b1f37', marginBottom: 12 }}>Moderation history</h3>
          {moderationHistory.length === 0 ? (
            <EmptyState title="Clean record" message="No admin actions against this account" />
          ) : (
            <div className="flex flex-col gap-2" style={{ fontSize: '0.8rem' }}>
              {moderationHistory.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-start justify-between gap-2" style={{ borderBottom: '1px solid #eef2f7', paddingBottom: 6 }}>
                  <span style={{ fontFamily: 'monospace', color: '#334155' }}>{log.action}</span>
                  <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>{fmtDateTime(log.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-panel mb-4">
        <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0b1f37', marginBottom: 12 }}>Recent posts</h3>
        {posts.length === 0 ? (
          <EmptyState title="No posts" />
        ) : (
          <AdminTable headers={['Post', 'Visibility', 'Date']} cols={3}>
            {posts.map((p) => (
              <tr key={p.id}>
                <td style={{ maxWidth: 420 }}>
                  <div className="truncate" style={{ fontWeight: 600 }}>{p.content || '(no text)'}</div>
                </td>
                <td>
                  <StatusPill tone={p.is_hidden ? 'red' : 'green'}>
                    {p.is_hidden ? `Hidden (${p.hidden_reason || 'policy'})` : 'Visible'}
                  </StatusPill>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(p.created_at)}</td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>

      <div className="admin-panel">
        <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0b1f37', marginBottom: 12 }}>Reports against this user</h3>
        {reports.length === 0 ? (
          <EmptyState title="No reports" />
        ) : (
          <AdminTable headers={['Target', 'Reason', 'Status', 'Date', '']} cols={5}>
            {reports.map((r) => (
              <tr key={`${r.table || r.type}-${r.id}`}>
                <td>{r.target_label || r.type}</td>
                <td className="truncate" style={{ maxWidth: 260 }}>{r.reason}</td>
                <td><StatusPill tone={reportStatusTone(r.status)}>{reportStatusLabel(r.status)}</StatusPill></td>
                <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.created_at)}</td>
                <td>
                  <Link to={`/admin/reports?type=${r.type || r.table}`} className="admin-btn admin-btn-ghost admin-btn-sm">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>

      <ConfirmDialog
        open={!!dialog}
        loading={busy}
        title={
          dialog?.kind === 'status'
            ? dialog?.nextActive ? 'Reactivate account' : 'Suspend account'
            : dialog?.kind === 'verify'
              ? dialog?.nextVerified ? 'Verify account' : 'Remove verification'
              : dialog?.kind === 'delete'
                ? 'Delete account permanently'
                : dialog?.kind === 'email'
                  ? 'Update email'
                  : ''
        }
        message={
          dialog?.kind === 'delete'
            ? `This permanently removes @${user.username} and all associated data. This cannot be undone.`
            : dialog?.kind === 'status'
              ? dialog?.nextActive
                ? 'Restore full access for this account?'
                : 'Suspend this account? They will be signed out immediately.'
              : dialog?.kind === 'verify'
                ? 'Update verification badge for this account?'
                : dialog?.kind === 'email'
                  ? 'Update user email address?'
                  : ''
        }
        reasonLabel={dialog?.kind === 'status' && !dialog?.nextActive ? 'Suspension reason' : undefined}
        reasonRequired={dialog?.kind === 'status' && !dialog?.nextActive}
        reasonValue={dialog?.reason}
        onReasonChange={(v) => setDialog((d) => ({ ...d, reason: v }))}
        emailLabel={dialog?.kind === 'email' ? 'Email' : undefined}
        emailValue={dialog?.email}
        onEmailChange={(v) => setDialog((d) => ({ ...d, email: v }))}
        danger={dialog?.kind === 'delete' || (dialog?.kind === 'status' && !dialog?.nextActive)}
        onCancel={() => setDialog(null)}
        onConfirm={runAction}
      />
    </div>
  );
}
