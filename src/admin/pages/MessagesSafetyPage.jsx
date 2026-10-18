import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Eye, Users } from 'lucide-react';
import * as adminApi from '../../api/admin';
import {
  useAsync, PageHeader, AdminTable, StatusPill, ConfirmDialog, ErrorBox,
  EmptyState, Tabs, fmtDateTime, fmtNum,
} from '../components';

function BlocksTab() {
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const { loading, error, data, reload } = useAsync(
    () => adminApi.listBlocks({ limit: 50 }),
    []
  );
  const blocks = data?.blocks || [];

  const unblock = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await adminApi.adminRemoveBlock(dialog.id);
      setDialog(null);
      reload();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Unblock failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <ErrorBox message={error || actionError} onRetry={reload} />
      {blocks.length === 0 && !loading ? (
        <div className="admin-panel"><EmptyState title="No blocks" message="No user has blocked anyone." /></div>
      ) : (
        <AdminTable loading={loading} headers={['Blocker', 'Blocked', 'When', 'Actions']}>
          {blocks.map((b) => (
            <tr key={b.id}>
              <td>
                <Link to={`/admin/users/${b.blocker_id}`} style={{ fontWeight: 600, color: '#1464d2' }}>
                  {b.blocker_username || `#${b.blocker_id}`}
                </Link>
              </td>
              <td>
                <Link to={`/admin/users/${b.blocked_id}`} style={{ fontWeight: 600, color: '#1464d2' }}>
                  {b.blocked_username || `#${b.blocked_id}`}
                </Link>
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(b.created_at)}</td>
              <td>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  onClick={() => setDialog(b)}
                >
                  <Trash2 size={14} /> Unblock
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
      <ConfirmDialog
        open={!!dialog}
        loading={busy}
        title="Remove block"
        message={`Allow ${dialog?.blocker_username} and ${dialog?.blocked_username} to see each other again?`}
        confirmLabel="Remove block"
        onCancel={() => setDialog(null)}
        onConfirm={unblock}
      />
    </>
  );
}

function ConversationTab() {
  const [userA, setUserA] = useState('');
  const [userB, setUserB] = useState('');
  const [query, setQuery] = useState(null);
  const { loading, error, data } = useAsync(
    () => (query ? adminApi.getConversation(query.a, query.b) : Promise.resolve({ data: { data: null } })),
    [query?.a, query?.b]
  );
  const messages = data?.messages || [];

  return (
    <div className="admin-panel">
      <div
        className="flex items-start gap-2 mb-4"
        style={{
          background: 'rgba(217,119,6,.08)',
          border: '1px solid rgba(217,119,6,.3)',
          borderRadius: 10,
          padding: '0.6rem 0.8rem',
          fontSize: '0.8rem',
          color: '#92400e',
        }}
      >
        Viewing a private conversation is logged in the audit trail.
      </div>
      <div className="grid gap-3 md:grid-cols-3 mb-4">
        <div className="admin-field">
          <label>User A (id)</label>
          <input className="admin-input" value={userA} onChange={(e) => setUserA(e.target.value)} placeholder="e.g. 12" />
        </div>
        <div className="admin-field">
          <label>User B (id)</label>
          <input className="admin-input" value={userB} onChange={(e) => setUserB(e.target.value)} placeholder="e.g. 34" />
        </div>
        <div className="admin-field" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={!userA.trim() || !userB.trim()}
            onClick={() => setQuery({ a: userA.trim(), b: userB.trim() })}
          >
            <Eye size={15} /> View conversation
          </button>
        </div>
      </div>
      <ErrorBox message={error} />
      {loading ? (
        <div style={{ height: 120 }} />
      ) : messages.length > 0 ? (
        <div className="flex flex-col gap-2" style={{ maxHeight: 480, overflowY: 'auto' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                alignSelf: m.sender_id === Number(query?.a) ? 'flex-start' : 'flex-end',
                maxWidth: '75%',
                background: m.sender_id === Number(query?.a) ? '#eef2f7' : '#e7f0fe',
                borderRadius: 12,
                padding: '0.5rem 0.8rem',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: 2 }}>
                {m.sender_username || `#${m.sender_id}`} · {fmtDateTime(m.created_at)}
              </div>
              <div style={{ color: '#1d2b3f' }}>{m.content}</div>
            </div>
          ))}
        </div>
      ) : query ? (
        <EmptyState title="No messages" message="These users have no conversation." />
      ) : (
        <EmptyState title="Enter two user ids" message="Find a reported conversation." />
      )}
    </div>
  );
}

export default function MessagesSafetyPage() {
  const [tab, setTab] = useState('blocks');
  const { data: reportsData } = useAsync(
    () => adminApi.listReports({ type: 'message', status: 'open', limit: 1 }),
    []
  );

  return (
    <div>
      <PageHeader
        title="Messages & Safety"
        subtitle="Blocks, reported conversations"
        actions={
          <StatusPill tone={reportsData?.pagination?.total > 0 ? 'amber' : 'green'}>
            {fmtNum(reportsData?.pagination?.total || 0)} open message reports
          </StatusPill>
        }
      />
      <Tabs
        tabs={[
          { value: 'blocks', label: 'Blocks' },
          { value: 'conversation', label: 'Conversation viewer' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'blocks' ? <BlocksTab /> : <ConversationTab />}
      <div className="mt-4">
        <Link to="/admin/reports?type=message" className="admin-btn admin-btn-ghost admin-btn-sm">
          <Users size={15} /> All reported messages
        </Link>
      </div>
    </div>
  );
}
