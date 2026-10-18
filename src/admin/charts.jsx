const AXIS_COLOR = '#cbd5e1';
const LABEL_COLOR = '#64748b';

function niceMax(values) {
  const max = Math.max(1, ...values.map((v) => Number(v) || 0));
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / pow) * pow;
}

export function LineChart({ data = [], xKey = 'date', yKey = 'count', color = '#1464d2', height = 180, title }) {
  const width = 560;
  const pad = { top: 14, right: 12, bottom: 26, left: 38 };
  if (data.length === 0) {
    return <div style={{ color: LABEL_COLOR, fontSize: '0.82rem', padding: '1rem 0' }}>No data in range</div>;
  }

  const values = data.map((d) => Number(d[yKey]) || 0);
  const max = niceMax(values);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = values.map((v, i) => {
    const x = pad.left + i * step;
    const y = pad.top + innerH - (v / max) * innerH;
    return [x, y];
  });
  const line = points.map((p) => p.join(',')).join(' ');
  const area = `${pad.left},${pad.top + innerH} ${line} ${pad.left + (data.length - 1) * step},${pad.top + innerH}`;
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div>
      {title && <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#334155', marginBottom: 6 }}>{title}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label={title || 'line chart'}>
        <defs>
          <linearGradient id={`lc-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((f) => {
          const y = pad.top + innerH - f * innerH;
          return (
            <g key={f}>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke={AXIS_COLOR} strokeDasharray="3 4" />
              <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill={LABEL_COLOR}>
                {Math.round(max * f)}
              </text>
            </g>
          );
        })}
        <polygon points={area} fill={`url(#lc-${color.replace('#', '')})`} />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={data.length > 40 ? 0 : 2.6} fill={color}>
            <title>{`${data[i][xKey]}: ${values[i]}`}</title>
          </circle>
        ))}
        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <text key={i} x={points[i][0]} y={height - 8} textAnchor="middle" fontSize="9.5" fill={LABEL_COLOR}>
              {String(d[xKey]).slice(5)}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}

export function BarChart({ data = [], xKey = 'label', yKey = 'count', color = '#1464d2', height = 180, title }) {
  const width = 560;
  const pad = { top: 14, right: 12, bottom: 26, left: 38 };
  if (data.length === 0) {
    return <div style={{ color: LABEL_COLOR, fontSize: '0.82rem', padding: '1rem 0' }}>No data in range</div>;
  }

  const values = data.map((d) => Number(d[yKey]) || 0);
  const max = niceMax(values);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const slot = innerW / data.length;
  const barW = Math.max(3, Math.min(28, slot * 0.62));
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div>
      {title && <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#334155', marginBottom: 6 }}>{title}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label={title || 'bar chart'}>
        {[0, 0.5, 1].map((f) => {
          const y = pad.top + innerH - f * innerH;
          return (
            <g key={f}>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke={AXIS_COLOR} strokeDasharray="3 4" />
              <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill={LABEL_COLOR}>
                {Math.round(max * f)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const v = values[i];
          const h = (v / max) * innerH;
          const x = pad.left + i * slot + (slot - barW) / 2;
          const y = pad.top + innerH - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={Math.max(h, v > 0 ? 2 : 0)} rx="3" fill={color} opacity={0.9}>
                <title>{`${d[xKey]}: ${v}`}</title>
              </rect>
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={height - 8} textAnchor="middle" fontSize="9.5" fill={LABEL_COLOR}>
                  {String(d[xKey]).slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function HorizontalBars({ data = [], labelKey = 'label', valueKey = 'count', color = '#1464d2', title }) {
  if (data.length === 0) {
    return <div style={{ color: LABEL_COLOR, fontSize: '0.82rem', padding: '0.5rem 0' }}>No data</div>;
  }
  const max = niceMax(data.map((d) => d[valueKey]));
  return (
    <div>
      {title && <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#334155', marginBottom: 8 }}>{title}</div>}
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3" style={{ fontSize: '0.8rem' }}>
            <div style={{ width: 140, color: '#475569', fontWeight: 600 }} className="truncate" title={String(d[labelKey])}>
              {d[labelKey]}
            </div>
            <div className="flex-1" style={{ background: '#eef2f7', borderRadius: 999, height: 10 }}>
              <div
                style={{
                  width: `${Math.max(3, ((Number(d[valueKey]) || 0) / max) * 100)}%`,
                  background: color,
                  height: '100%',
                  borderRadius: 999,
                }}
                title={`${d[labelKey]}: ${d[valueKey]}`}
              />
            </div>
            <div style={{ width: 54, textAlign: 'right', fontWeight: 700, color: '#334155' }}>{d[valueKey]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
