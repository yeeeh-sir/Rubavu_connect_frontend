import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as adminApi from '../../api/admin';
import {
  useAsync, PageHeader, StatusPill, Pagination, ErrorBox, EmptyState, Tabs,
  fmtDate,
} from '../components';

function MediaGrid({ items, kind }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
      {items.map((m) => (
        <div
          key={`${kind}-${m.id}`}
          style={{
            background: '#fff',
            border: '1px solid #e6ebf2',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          {m.media_url ? (
            <img
              src={m.media_url}
              alt=""
              loading="lazy"
              style={{ width: '100%', height: 140, objectFit: 'cover', background: '#eef2f7' }}
            />
          ) : (
            <div
              className="flex items-center justify-center"
              style={{ height: 140, background: '#f1f5f9', color: '#94a3b8', fontSize: '0.75rem' }}
            >
              no media
            </div>
          )}
          <div style={{ padding: '0.55rem 0.7rem' }}>
            <div className="truncate" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1d2b3f' }}>
              {m.content || m.caption || `#${m.id}`}
            </div>
            <div className="flex items-center justify-between gap-2" style={{ marginTop: 4 }}>
              <Link to={`/admin/users/${m.user_id}`} style={{ fontSize: '0.72rem', color: '#1464d2', fontWeight: 700 }}>
                {m.username || `#${m.user_id}`}
              </Link>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{fmtDate(m.created_at)}</span>
            </div>
            {m.is_hidden != null && (
              <div style={{ marginTop: 6 }}>
                <StatusPill tone={m.is_hidden ? 'red' : 'green'}>
                  {m.is_hidden ? 'Hidden' : 'Visible'}
                </StatusPill>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MediaPage() {
  const [tab, setTab] = useState('posts');
  const [page, setPage] = useState(1);

  const { loading, error, data, reload } = useAsync(
    () => adminApi.listMedia({ source: tab, page, limit: 24 }),
    [tab, page]
  );

  const items = data?.items || [];
  const counts = data?.counts || {};
  const pagination = data?.pagination || {};

  return (
    <div>
      <PageHeader title="Media" subtitle="All uploaded media across the platform" />
      <ErrorBox message={error} onRetry={reload} />

      <Tabs
        tabs={[
          { value: 'posts', label: 'Posts', count: counts.posts },
          { value: 'gallery', label: 'Gallery', count: counts.gallery },
          { value: 'statuses', label: 'Statuses', count: counts.statuses },
        ]}
        active={tab}
        onChange={(v) => { setTab(v); setPage(1); }}
      />

      {items.length === 0 && !loading ? (
        <div className="admin-panel"><EmptyState title="No media" /></div>
      ) : loading ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ height: 220, borderRadius: 12, background: '#eef2f7' }} />
          ))}
        </div>
      ) : (
        <MediaGrid items={items} kind={tab} />
      )}

      <Pagination pagination={pagination} onChange={setPage} />
    </div>
  );
}
