import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Flag, CheckCircle2, EyeOff, Ban, MessageSquare, User, Radio, Mail,
} from 'lucide-react';
import * as adminApi from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { can } from '../permissions';
import {
  useAsync, PageHeader, AdminTable, StatusPill, Pagination, ErrorBox,
  EmptyState, Tabs, fmtDate, fmtDateTime, fmtNum,
  reportStatusLabel, reportStatusTone,
} from '../components';

const TYPE_TABS = [
  { value: '', label: 'All' },
  { value: 'post', label: 'Posts' },
  { value: 'comment', label: 'Comments' },
  { value: 'user', label: 'Users' },
  { value: 'live', label: 'Live' },
  { value: 'message', label: 'Messages' },
];

const STATUS_OPTIONS = ['', 'open', 'reviewed', 'resolved', 'dismissed'];

const TYPE_ICONS = { post: MessageSquare, comment: MessageSquare, user: User, live: Radio, message: Mail };

function ReportDetailPanel({ type, reportId, onClose, onChanged, canWrite }) {
  const { loading, error, data, reload } = useAsync(
    () => adminApi.getReportDetail(type, reportId),
    [type, reportId]
  );
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const report = data?.report;
  const notes = data?.notes || [];

  const act = async (fn) => {
    setBusy(true);
    setActionError(null);
    try {
      await fn();
      setNote('');
      reload();
      onChanged();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-panel mb-4" style={{ borderColor: '#1464d2' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0b1f37' }}>
          Report detail · {type} #{reportId}
        </h3>
        <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={onClose}>
          Close
        </button>
      </div>
      <ErrorBox message={error || actionError} onRetry={reload} />
      {loading ? (
        <div style={{ height: 120 }} />
      ) : report ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 mb-4" style={{ fontSize: '0.85rem' }}>
            <div>
              <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Reason</div>
              <div style={{ color: '#1d2b3f', marginTop: 4 }}>{report.reason}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Target</div>
              <div style={{ color: '#1d2b3f', marginTop: 4 }} className="break-words">
                {report.target_excerpt || report.target_label || `#${report.target_id}`}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Reported by</div>
              <div style={{ marginTop: 4 }}>
                {report.reporter_username || `user #${report.reporter_id}`} · {fmtDateTime(report.created_at)}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>Status</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <StatusPill tone={reportStatusTone(report.status)}>{reportStatusLabel(report.status)}</StatusPill>
                {report.assignee_username && (
                  <StatusPill tone="purple">Assigned: {report.assignee_username}</StatusPill>
                )}
              </div>
            </div>
          </div>

          {canWrite && (
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                ['reviewed', 'Mark reviewed', 'admin-btn-primary'],
                ['resolved', 'Resolve', 'admin-btn-success'],
                ['dismissed', 'Dismiss', 'admin-btn-ghost'],
              ].map(([status, label, cls]) => (
                <button
                  key={status}
                  type="button"
                  className={`admin-btn admin-btn-sm ${cls}`}
                  disabled={busy || report.status === status}
                  onClick={() => act(() => adminApi.updateReportStatus(type, reportId, status, note || undefined))}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="admin-field mb-3">
            <label>Internal note (staff only)</label>
            <textarea
              className="admin-textarea"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Context for other moderators…"
            />
          </div>
          {canWrite && (
            <button
              type="button"
              className="admin-btn admin-btn-ghost admin-btn-sm mb-4"
              disabled={busy || !note.trim()}
              onClick={() => act(() => adminApi.addReportNote(type, reportId, note))}
            >
              Save note
            </button>
          )}

          <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: '#334155', marginBottom: 8 }}>Notes</h4>
          {notes.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>No notes yet.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {notes.map((n) => (
                <div key={n.id} style={{ background: '#f8fafd', borderRadius: 10, padding: '0.6rem 0.8rem', fontSize: '0.82rem' }}>
                  <div className="flex justify-between gap-2" style={{ color: '#64748b', fontSize: '0.74rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700 }}>{n.author_username || `user #${n.author_id}`}</span>
                    <span>{fmtDateTime(n.created_at)}</span>
                  </div>
                  <div style={{ color: '#1d2b3f' }}>{n.note}</div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

export default function ReportsPage() {
  const { user: me } = useAuth();
  const [params, setParams] = useSearchParams();
  const type = params.get('type') || '';
  const [status, setStatus] = useState(params.get('status') || 'open');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const { loading, error, data, reload } = useAsync(
    () => adminApi.listReports({ type, status, page, limit: 25 }),
    [type, status, page]
  );

  const reports = data?.reports || [];
  const pagination = data?.pagination || {};
  const canWrite = can(me, 'reports.write');

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle={`${fmtNum(pagination.total || 0)} report${pagination.total === 1 ? '' : 's'} in this view`}
      />
      <ErrorBox message={error} onRetry={reload} />

      <Tabs
        tabs={TYPE_TABS}
        active={type}
        onChange={(v) => {
          const sp = {};
          if (v) sp.type = v;
          if (status && status !== 'open') sp.status = status;
          setParams(sp);
          setSelected(null);
          setPage(1);
        }}
      />

      <div className="admin-panel mb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="admin-field">
            <label>Status</label>
            <select className="admin-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s ? reportStatusLabel(s) : 'All statuses'}</option>
              ))}
            </select>
          </div>
          <div className="admin-field" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="admin-btn admin-btn-primary" onClick={reload}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <ReportDetailPanel
          type={selected.type}
          reportId={selected.id}
          canWrite={canWrite}
          onClose={() => setSelected(null)}
          onChanged={reload}
        />
      )}

      {reports.length === 0 && !loading ? (
        <div className="admin-panel"><EmptyState title="No reports" message="Nothing matches this filter." /></div>
      ) : (
        <AdminTable loading={loading} headers={['Type', 'Reason', 'Reporter', 'Status', 'Date', '']}>
          {reports.map((r) => {
            const key = `${r.type}-${r.id}`;
            const Icon = TYPE_ICONS[r.type] || Flag;
            return (
              <tr key={key} style={selected?.id === r.id && selected?.type === r.type ? { background: '#eef4fd' } : undefined}>
                <td>
                  <span className="admin-chip" style={{ background: '#eef3fa', color: '#1d3d66' }}>
                    <Icon size={12} /> {r.type} #{r.target_id}
                  </span>
                </td>
                <td style={{ maxWidth: 260 }}>
                  <div className="truncate">{r.reason}</div>
                  {r.report_count > 1 && (
                    <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 700 }}>
                      {r.report_count} reports on this target
                    </div>
                  )}
                </td>
                <td>{r.reporter_username || `#${r.reporter_id}`}</td>
                <td><StatusPill tone={reportStatusTone(r.status)}>{reportStatusLabel(r.status)}</StatusPill></td>
                <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.created_at)}</td>
                <td>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={() => setSelected({ type: r.type, id: r.id })}
                  >
                    Review
                  </button>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      )}

      <Pagination pagination={pagination} onChange={setPage} />
    </div>
  );
}
