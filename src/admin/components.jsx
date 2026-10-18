import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Inbox, X } from 'lucide-react';

export function useAsync(fn, deps = []) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ loading: true, error: null, data: s.data }));
    fnRef
      .current()
      .then((res) => {
        if (!alive) return;
        const data = res?.data?.data !== undefined ? res.data.data : res?.data;
        setState({ loading: false, error: null, data });
      })
      .catch((err) => {
        if (!alive) return;
        setState({
          loading: false,
          error: err?.response?.data?.message || 'Something went wrong. Please try again.',
          data: null,
        });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
      <div className="min-w-0">
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b1f37' }}>{title}</h1>
        {subtitle && (
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.2rem' }}>{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, accent }) {
  return (
    <div className="admin-kpi">
      <div className="admin-kpi-label">{label}</div>
      <div className="admin-kpi-value" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      {hint && <div className="admin-kpi-hint">{hint}</div>}
    </div>
  );
}

const PILL_STYLES = {
  green: { background: 'rgba(24,168,74,.12)', color: '#15803d' },
  red: { background: 'rgba(220,38,38,.12)', color: '#b91c1c' },
  amber: { background: 'rgba(217,119,6,.14)', color: '#b45309' },
  blue: { background: 'rgba(20,100,210,.12)', color: '#1d4ed8' },
  slate: { background: 'rgba(100,116,139,.14)', color: '#475569' },
  purple: { background: 'rgba(124,58,237,.12)', color: '#6d28d9' },
};

export function StatusPill({ tone = 'slate', children }) {
  return (
    <span className="admin-chip" style={PILL_STYLES[tone] || PILL_STYLES.slate}>
      {children}
    </span>
  );
}

export function roleTone(role) {
  if (role === 'super_admin') return 'purple';
  if (role === 'admin') return 'blue';
  if (role === 'moderator') return 'green';
  if (role === 'support') return 'amber';
  return 'slate';
}

export function reportStatusTone(status) {
  if (status === 'open') return 'amber';
  if (status === 'reviewed') return 'blue';
  if (status === 'resolved') return 'green';
  if (status === 'dismissed') return 'slate';
  return 'slate';
}

export function reportStatusLabel(status) {
  return { open: 'Pending', reviewed: 'Under review', resolved: 'Resolved', dismissed: 'Dismissed' }[status] || status;
}

export function EmptyState({ title = 'Nothing here yet', message }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center" style={{ color: '#64748b' }}>
      <Inbox size={34} className="opacity-50 mb-2" />
      <div style={{ fontWeight: 700, color: '#334155' }}>{title}</div>
      {message && <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{message}</div>}
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  if (!message) return null;
  return (
    <div
      className="flex items-center gap-3 mb-4"
      style={{
        background: 'rgba(220,38,38,.08)',
        border: '1px solid rgba(220,38,38,.25)',
        color: '#b91c1c',
        borderRadius: 12,
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
      }}
    >
      <AlertCircle size={18} className="flex-shrink-0" />
      <div className="flex-1">{message}</div>
      {onRetry && (
        <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function LoadingRows({ cols = 5, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c}>
              <div
                style={{
                  height: 14,
                  borderRadius: 6,
                  background: 'linear-gradient(90deg,#eef2f7,#f8fafc,#eef2f7)',
                  backgroundSize: '200% 100%',
                  animation: 'admin-shimmer 1.4s infinite',
                }}
              />
            </td>
          ))}
        </tr>
      ))}
      <style>{`@keyframes admin-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </>
  );
}

export function AdminTable({ headers, children, loading, cols }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{loading ? <LoadingRows cols={cols || headers.length} /> : children}</tbody>
      </table>
    </div>
  );
}

export function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total } = pagination;
  return (
    <div className="flex items-center justify-between gap-3 mt-3" style={{ fontSize: '0.82rem', color: '#64748b' }}>
      <span>
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="admin-btn admin-btn-ghost admin-btn-sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-ghost admin-btn-sm"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
  reasonLabel,
  reasonRequired = false,
  reasonValue = '',
  onReasonChange,
  emailLabel,
  emailValue = '',
  onEmailChange,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  const reasonOk = !reasonRequired || (reasonValue || '').trim().length > 0;
  const emailOk = !emailLabel || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((emailValue || '').trim());
  const formOk = reasonOk && emailOk;
  return (
    <div className="admin-modal-backdrop" onClick={loading ? undefined : onCancel}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0b1f37' }}>{title}</h3>
          <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={onCancel} disabled={loading}>
            <X size={15} />
          </button>
        </div>
        {message && (
          <p style={{ color: '#475569', fontSize: '0.88rem', marginBottom: '0.9rem' }}>{message}</p>
        )}
        {emailLabel && (
          <div className="admin-field mb-3">
            <label>{emailLabel}</label>
            <input
              type="email"
              className="admin-input"
              value={emailValue || ''}
              onChange={(e) => onEmailChange?.(e.target.value)}
            />
          </div>
        )}
        {reasonLabel && (
          <div className="admin-field mb-4">
            <label>{reasonLabel}{reasonRequired ? ' *' : ''}</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={reasonValue || ''}
              onChange={(e) => onReasonChange?.(e.target.value)}
              placeholder="Visible in the audit log"
            />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className={`admin-btn ${danger ? 'admin-btn-danger' : 'admin-btn-primary'}`}
            onClick={onConfirm}
            disabled={loading || !formOk}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={`admin-btn admin-btn-sm ${active === tab.value ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {tab.count != null && <span className="opacity-70">· {tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function fmtDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function fmtNum(value) {
  return new Intl.NumberFormat().format(Number(value || 0));
}
