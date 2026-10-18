import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, Trash2, ShieldCheck, ShieldOff, BadgeCheck, Mail } from 'lucide-react';
import * as adminApi from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { can, ROLE_RANK } from '../permissions';
import {
  useAsync, PageHeader, AdminTable, StatusPill, Pagination, ConfirmDialog,
  ErrorBox, EmptyState, fmtDate, fmtNum, roleTone,
} from '../components';

const ROLE_OPTIONS = ['', 'user', 'support', 'moderator', 'admin', 'super_admin'];
const STATUS_OPTIONS = ['', 'active', 'suspended', 'deleted'];

export default function UsersPage() {
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const [role, setRole] = useState(params.get('role') || '');
  const [status, setStatus] = useState(params.get('status') || '');
  const [page, setPage] = useState(Number(params.get('page')) || 1);
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState(null);

  const query = { search, role, status, page, limit: 20 };
  const { loading, error, data, reload } = useAsync(() => adminApi.listUsers(query), [search, role, status, page]);

  const users = data?.users || [];
  const pagination = data?.pagination || {};

  const applyFilters = (next) => {
    const merged = { search, role, status, page: 1, ...next };
    if (merged.search === search && merged.role === role && merged.status === status) return;
    setSearch(merged.search);
    setRole(merged.role);
    setStatus(merged.status);
    setPage(merged.page);
    const sp = {};
    Object.entries(merged).forEach(([k, v]) => {
      if (v) sp[k] = v;
    });
    setParams(sp);
  };

  const canWrite = can(me, 'users.write');
  const canRoles = can(me, 'roles.write');

  const runAction = async () => {
    if (!dialog) return;
    setBusy(true);
    setDialogError(null);
    try {
      if (dialog.kind === 'status') {
        await adminApi.updateUserStatus(dialog.target.id, dialog.nextActive, dialog.reason);
       } else if (dialog.kind === 'verify') {
        await adminApi.updateUserVerification(dialog.target.id, dialog.nextVerified);
      } else if (dialog.kind === 'email') {
        await adminApi.updateUserEmail(dialog.target.id, dialog.email);
      } else if (dialog.kind === 'role') {
        await adminApi.updateUserRole(dialog.target.id, dialog.nextRole);
      } else if (dialog.kind === 'delete') {
        await adminApi.deleteUser(dialog.target.id);
      }
      setDialog(null);
      reload();
    } catch (err) {
      setDialogError(err?.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const openDialog = (kind, target, extra = {}) => {
    setDialogError(null);
    setDialog({ kind, target, ...extra });
  };

  return (
    <div>
      <PageHeader title="Users" subtitle={`Manage ${fmtNum(pagination.total || 0)} registered accounts`} />
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
                placeholder="Name, username, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
              />
            </div>
          </div>
          <div className="admin-field">
            <label>Role</label>
            <select className="admin-select" value={role} onChange={(e) => applyFilters({ role: e.target.value })}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r || 'All roles'}</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Status</label>
            <select className="admin-select" value={status} onChange={(e) => applyFilters({ status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s || 'All statuses'}</option>
              ))}
            </select>
          </div>
          <div className="admin-field" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="admin-btn admin-btn-primary" onClick={() => applyFilters({})}>
              Apply
            </button>
          </div>
        </div>
      </div>

      {users.length === 0 && !loading ? (
        <div className="admin-panel"><EmptyState title="No users match these filters" /></div>
      ) : (
        <AdminTable
          loading={loading}
          headers={['User', 'Role', 'Status', 'Verified', 'Posts', 'Joined', 'Actions']}
        >
          {users.map((u) => {
            const isSelf = u.id === me?.id;
            const outranks = ROLE_RANK[u.role] >= ROLE_RANK[me?.role || 'user'];
            return (
              <tr key={u.id}>
                <td>
                  <Link to={`/admin/users/${u.id}`} style={{ fontWeight: 700, color: '#1464d2' }}>
                    {u.full_name || u.username}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>@{u.username}</div>
                </td>
                <td><StatusPill tone={roleTone(u.role)}>{u.role}</StatusPill></td>
                <td>
                  <StatusPill tone={u.is_active ? 'green' : 'red'}>
                    {u.is_active ? 'Active' : 'Suspended'}
                  </StatusPill>
                </td>
                <td>
                  {u.is_verified ? (
                    <StatusPill tone="blue">Verified</StatusPill>
                  ) : (
                    <StatusPill tone="slate">No</StatusPill>
                  )}
                </td>
                <td>{fmtNum(u.post_count)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(u.created_at)}</td>
                <td>
                  <div className="flex flex-wrap gap-1.5">
                      {canWrite && !isSelf && !outranks && (
                        <>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            title={u.is_active ? 'Suspend' : 'Reactivate'}
                            onClick={() =>
                              openDialog('status', u, {
                                nextActive: !u.is_active,
                                reason: '',
                              })
                            }
                          >
                            {u.is_active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            title={u.is_verified ? 'Unverify' : 'Verify'}
                            onClick={() => openDialog('verify', u, { nextVerified: !u.is_verified })}
                          >
                            <BadgeCheck size={14} color={u.is_verified ? '#94a3b8' : '#18a84a'} />
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            title="Change email"
                            onClick={() => openDialog('email', u, { email: u.email })}
                          >
                            <Mail size={14} />
                          </button>
                        </>
                      )}
                    {canRoles && !isSelf && !outranks && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        title="Change role"
                        onClick={() => openDialog('role', u, { nextRole: u.role === 'user' ? 'support' : 'user' })}
                      >
                        Role
                      </button>
                    )}
                    {can(me, 'users.write') && !isSelf && !outranks && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        title="Delete account (cascades)"
                        onClick={() => openDialog('delete', u)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      )}

      <Pagination pagination={pagination} onChange={setPage} />

      <ConfirmDialog
        open={!!dialog}
        loading={busy}
        title={
          dialog?.kind === 'status'
            ? dialog?.nextActive ? 'Reactivate account' : 'Suspend account'
               : dialog?.kind === 'verify'
                 ? dialog?.nextVerified ? 'Verify account' : 'Remove verification'
                 : dialog?.kind === 'role'
                   ? `Change role → ${dialog?.nextRole}`
                   : dialog?.kind === 'email'
                     ? 'Update email'
                     : 'Delete account permanently'
        }
        message={
          dialog?.kind === 'delete'
            ? `This permanently removes @${dialog?.target?.username} and all of their posts, comments, messages and connections. This cannot be undone.`
            : dialog?.kind === 'status'
              ? dialog?.nextActive
                ? `Restore full access for @${dialog?.target?.username}?`
                : `Suspend @${dialog?.target?.username}? They will be signed out and unable to log in.`
               : dialog?.kind === 'verify'
                 ? `Update verification badge for @${dialog?.target?.username}?`
                 : dialog?.kind === 'email'
                   ? `Update email for @${dialog?.target?.username}?`
                   : `Promote @${dialog?.target?.username} to ${dialog?.nextRole}?`
        }
        reasonLabel={dialog?.kind === 'status' && !dialog?.nextActive ? 'Suspension reason' : undefined}
        reasonRequired={dialog?.kind === 'status' && !dialog?.nextActive}
        emailLabel={dialog?.kind === 'email' ? 'Email' : undefined}
        emailValue={dialog?.email}
        onEmailChange={(v) => setDialog((d) => ({ ...d, email: v }))}
        danger={dialog?.kind === 'delete' || (dialog?.kind === 'status' && !dialog?.nextActive)}
        onCancel={() => setDialog(null)}
        onConfirm={runAction}
      />
      {dialogError && (
        <ErrorBox message={dialogError} />
      )}
    </div>
  );
}
