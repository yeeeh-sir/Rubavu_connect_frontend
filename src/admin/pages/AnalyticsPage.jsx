import { useState } from 'react';
import { Download } from 'lucide-react';
import * as adminApi from '../../api/admin';
import {
  useAsync, PageHeader, StatCard, ErrorBox, EmptyState, fmtNum, fmtDate,
} from '../components';
import { LineChart, BarChart, HorizontalBars } from '../charts';

const RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const [days, setDays] = useState('30');
  const from = isoDaysAgo(Number(days));
  const to = new Date().toISOString().slice(0, 10);

  const { loading, error, data, reload } = useAsync(
    () => adminApi.getAnalytics({ from, to }),
    [from, to]
  );

  const kpis = data?.kpis || {};
  const series = data?.series || {};
  const topActions = data?.topActions || [];

  const exportCsv = (report) => adminApi.exportAnalyticsCsv(report, { from, to });

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle={`${fmtDate(from)} → ${fmtDate(to)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select className="admin-select" style={{ width: 'auto' }} value={days} onChange={(e) => setDays(e.target.value)}>
              {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {['growth', 'content', 'engagement', 'moderation', 'reports'].map((r) => (
              <button
                key={r}
                type="button"
                className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => exportCsv(r)}
                title={`Download ${r} CSV`}
              >
                <Download size={13} /> {r}
              </button>
            ))}
          </div>
        }
      />
      <ErrorBox message={error} onRetry={reload} />

      {loading && !data ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="admin-kpi" style={{ height: 90 }} />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="New users" value={fmtNum(kpis.newUsers)} hint={`${fmtNum(kpis.dauAvg)} avg DAU`} />
            <StatCard label="New posts" value={fmtNum(kpis.newPosts)} />
            <StatCard label="New comments" value={fmtNum(kpis.newComments)} />
            <StatCard label="New connections" value={fmtNum(kpis.newConnections)} />
            <StatCard label="Reports filed" value={fmtNum(kpis.reportsFiled)} />
            <StatCard label="Reports resolved" value={fmtNum(kpis.reportsResolved)} accent="#18a84a" />
            <StatCard label="WAU (period end)" value={fmtNum(kpis.wau)} />
            <StatCard label="MAU (period end)" value={fmtNum(kpis.mau)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mb-4">
            <div className="admin-panel">
              <LineChart title="Daily active users" data={series.dau || []} xKey="date" yKey="count" color="#1464d2" />
            </div>
            <div className="admin-panel">
              <LineChart title="New registrations" data={series.registrations || []} xKey="date" yKey="count" color="#7c3aed" />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mb-4">
            <div className="admin-panel">
              <BarChart title="Posts per day" data={series.posts || []} xKey="date" yKey="count" color="#18a84a" />
            </div>
            <div className="admin-panel">
              <BarChart title="Comments per day" data={series.comments || []} xKey="date" yKey="count" color="#0891b2" />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="admin-panel">
              <HorizontalBars
                title="Top admin actions"
                data={topActions}
                labelKey="action"
                valueKey="count"
                color="#d97706"
              />
              {topActions.length === 0 && (
                <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>No admin actions in range.</div>
              )}
            </div>
            <div className="admin-panel">
              <h3 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#334155', marginBottom: 8 }}>Metric definitions</h3>
              <dl style={{ fontSize: '0.8rem', color: '#475569', display: 'grid', gap: 6 }}>
                {Object.entries(data?.metricDefinitions || {}).map(([k, v]) => (
                  <div key={k}>
                    <dt style={{ fontWeight: 700, color: '#334155' }}>{k}</dt>
                    <dd style={{ margin: 0 }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </>
      ) : (
        <div className="admin-panel"><EmptyState title="No analytics data" /></div>
      )}
    </div>
  );
}
