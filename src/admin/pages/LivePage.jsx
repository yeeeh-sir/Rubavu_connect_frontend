import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Square } from 'lucide-react';
import * as adminApi from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { can } from '../permissions';
import {
  useAsync, PageHeader, AdminTable, StatusPill, ConfirmDialog, ErrorBox,
  EmptyState, Tabs, fmtDateTime, fmtNum,
} from '../components';

export default function LivePage() {
  const { user: me } = useAuth();
  const [tab, setTab] = useState('active');
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const { loading, error, data, reload } = useAsync(
    () => adminApi.listLiveSessions({ status: tab, limit: 30 }),
    [tab]
  );

  const sessions = data?.sessions || [];
  const canWrite = can(me, 'live.write');

  const endSession = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await adminApi.adminEndLive(dialog.id);
      setDialog(null);
      reload();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Could not end session');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Live sessions" subtitle="Monitor and moderate live video rooms" />
      <ErrorBox message={error || actionError} onRetry={reload} />

      <Tabs
        tabs={[
          { value: 'active', label: 'Active' },
          { value: 'ended', label: 'Ended' },
        ]}
        active={tab}
        onChange={(v) => { setTab(v); setDialog(null); }}
      />

      {sessions.length === 0 && !loading ? (
        <div className="admin-panel"><EmptyState title={tab === 'active' ? 'No live sessions right now' : 'No ended sessions'} /></div>
      ) : (
        <AdminTable loading={loading} headers={['Host', 'Title', 'Viewers', 'Status', 'Started', 'Ended', 'Actions']}>
          {sessions.map((s) => (
            <tr key={s.id}>
              <td>
                <Link to={`/admin/users/${s.host_id}`} style={{ fontWeight: 600, color: '#1464d2' }}>
                  {s.host_username || `#${s.host_id}`}
                </Link>
              </td>
              <td style={{ maxWidth: 220 }}>
                <div className="truncate">{s.title || <span style={{ color: '#94a3b8' }}>(untitled)</span>}</div>
              </td>
              <td>{fmtNum(s.viewer_count)}</td>
              <td>
                <StatusPill tone={s.status === 'active' ? 'green' : 'slate'}>
                  <Radio size={11} /> {s.status}
                </StatusPill>
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(s.started_at)}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{s.ended_at ? fmtDateTime(s.ended_at) : '—'}</td>
              <td>
                {canWrite && s.status === 'active' && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    onClick={() => setDialog(s)}
                  >
                    <Square size={13} /> End
                  </button>
                )}
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      <ConfirmDialog
        open={!!dialog}
        loading={busy}
        title="End live session"
        message={`Force-end "${dialog?.title || 'untitled'}" hosted by ${dialog?.host_username}? Viewers will be disconnected immediately.`}
        confirmLabel="End session"
        danger
        onCancel={() => setDialog(null)}
        onConfirm={endSession}
      />
    </div>
  );
}
