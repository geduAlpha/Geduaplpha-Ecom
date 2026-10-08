/**
 * Pure SVG + CSS chart components — zero external dependencies.
 * Used exclusively by the Admin dashboard analytics tab.
 */
import { money } from "../money.js";

/* ── colour palette shared across charts ─────────────────────────── */
export const CAT_COLORS = {
  electronics: "#2563eb",
  vehicles:    "#d97706",
  property:    "#059669",
  fashion:     "#7c3aed",
  furniture:   "#0284c7",
  stationery:  "#db2777",
  services:    "#16a34a",
  other:       "#6b7280",
};

const STATUS_COLORS = {
  pending:    "#eab308",
  paid:       "#16a34a",
  processing: "#0284c7",
  shipped:    "#7c3aed",
  delivered:  "#059669",
  cancelled:  "#dc2626",
};

const PAY_COLORS = {
  telebirr: "#0284c7",
  cbe:      "#16a34a",
  chapa:    "#7c3aed",
  cod:      "#d97706",
  free:     "#6b7280",
};

/* ── helpers ─────────────────────────────────────────────────────── */
function abbr(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

function shortDate(iso) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/* ════════════════════════════════════════════════════════════════════
   1. LINE CHART — daily revenue / orders over 30 days
════════════════════════════════════════════════════════════════════ */
export function LineChart({ data, valueKey = "revenue", color = "#16a34a", label = "Revenue" }) {
  if (!data?.length) return <div className="ch-empty">No data</div>;

  const W = 600, H = 200, PAD = { top: 20, right: 16, bottom: 36, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const values = data.map((d) => d[valueKey]);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const xScale = (i) => PAD.left + (i / (data.length - 1)) * innerW;
  const yScale = (v) => PAD.top + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  const points = data.map((d, i) => `${xScale(i)},${yScale(d[valueKey])}`).join(" ");
  const area   = `M${xScale(0)},${yScale(0)} ` +
    data.map((d, i) => `L${xScale(i)},${yScale(d[valueKey])}`).join(" ") +
    ` L${xScale(data.length - 1)},${yScale(0)} Z`;

  // Y-axis ticks (4 ticks)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(minVal + t * (maxVal - minVal)));
  // X-axis: show every ~5 days
  const xTicks = data.filter((_, i) => i % 5 === 0 || i === data.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ch-svg" role="img" aria-label={label}>
      <defs>
        <linearGradient id={`grad-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={yScale(t)} y2={yScale(t)}
            stroke="var(--border-card)" strokeWidth="1" strokeDasharray="3,3" />
          <text x={PAD.left - 6} y={yScale(t) + 4} textAnchor="end"
            fontSize="10" fill="var(--text-muted)">{abbr(t)}</text>
        </g>
      ))}

      {/* Area fill */}
      <path d={area} fill={`url(#grad-${valueKey})`} />

      {/* Line */}
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots on hover-worthy points — every 5 days */}
      {data.filter((_, i) => i % 5 === 0 || i === data.length - 1).map((d, _, arr) => {
        const origIdx = data.indexOf(d);
        return (
          <circle key={origIdx} cx={xScale(origIdx)} cy={yScale(d[valueKey])}
            r="3.5" fill={color} stroke="var(--bg-card)" strokeWidth="2" />
        );
      })}

      {/* X axis labels */}
      {xTicks.map((d) => {
        const i = data.indexOf(d);
        return (
          <text key={i} x={xScale(i)} y={H - 4} textAnchor="middle"
            fontSize="9.5" fill="var(--text-muted)">{shortDate(d.date)}</text>
        );
      })}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2. HORIZONTAL BAR CHART — sales / revenue by category
════════════════════════════════════════════════════════════════════ */
export function CategoryBarChart({ data, valueKey = "revenue" }) {
  if (!data?.length) return <div className="ch-empty">No data</div>;

  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="ch-bar-list">
      {data.map((d) => {
        const pct   = Math.round((d[valueKey] / max) * 100);
        const color = CAT_COLORS[d.category] || "#6b7280";
        const label = valueKey === "revenue" ? money(d[valueKey]) : `${d[valueKey]} sold`;
        return (
          <div key={d.category} className="ch-bar-row">
            <div className="ch-bar-label">
              <span className="ch-bar-cat">{d.category}</span>
              <span className="ch-bar-val">{label}</span>
            </div>
            <div className="ch-bar-track">
              <div className="ch-bar-fill"
                style={{ width: `${pct}%`, background: color }}
                title={`${d.category}: ${label}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   3. DONUT CHART — order status or payment method split
════════════════════════════════════════════════════════════════════ */
export function DonutChart({ data, colors, size = 160 }) {
  if (!data?.length) return <div className="ch-empty">No data</div>;

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="ch-empty">No data</div>;

  const cx = size / 2, cy = size / 2, R = size * 0.38, r = size * 0.22;
  let angle = -Math.PI / 2;

  const slices = data.map((d) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle);
    const y1 = cy + R * Math.sin(angle);
    angle += sweep;
    const x2 = cx + R * Math.cos(angle);
    const y2 = cy + R * Math.sin(angle);
    const x3 = cx + r * Math.cos(angle);
    const y3 = cy + r * Math.sin(angle);
    const prevAngle = angle - sweep;
    const x4 = cx + r * Math.cos(prevAngle);
    const y4 = cy + r * Math.sin(prevAngle);
    const large = sweep > Math.PI ? 1 : 0;
    return {
      ...d,
      path: `M${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} L${x3},${y3} A${r},${r} 0 ${large},0 ${x4},${y4} Z`,
      color: colors[d.key] || "#6b7280",
      pct: Math.round((d.value / total) * 100),
    };
  }).filter((s) => s.value > 0);

  return (
    <div className="ch-donut-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="ch-donut-svg">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color}>
            <title>{s.label}: {s.value} ({s.pct}%)</title>
          </path>
        ))}
        {/* Centre total */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--text-primary)">{total}</text>
        <text x={cx} y={cy + 13} textAnchor="middle" fontSize="9" fill="var(--text-muted)">total</text>
      </svg>
      <div className="ch-donut-legend">
        {slices.map((s) => (
          <div key={s.key} className="ch-legend-row">
            <span className="ch-legend-dot" style={{ background: s.color }} />
            <span className="ch-legend-label">{s.label}</span>
            <span className="ch-legend-val">{s.value} <span className="ch-legend-pct">({s.pct}%)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   4. TOP PRODUCTS TABLE with mini bar
════════════════════════════════════════════════════════════════════ */
export function TopProductsTable({ data, valueKey = "views", valueLabel = "Views" }) {
  if (!data?.length) return <div className="ch-empty">No data</div>;
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="ch-top-list">
      {data.map((p, i) => {
        const pct   = Math.round((p[valueKey] / max) * 100);
        const color = CAT_COLORS[p.category] || "#6b7280";
        return (
          <div key={p.id || i} className="ch-top-row">
            <div className="ch-top-rank" style={{ color }}>{i + 1}</div>
            <div className="ch-top-info">
              <div className="ch-top-name" title={p.name}>{p.name}</div>
              <div className="ch-top-bar-track">
                <div className="ch-top-bar-fill" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
            <div className="ch-top-val" style={{ color }}>
              {valueKey === "revenue" ? money(p[valueKey]) : p[valueKey].toLocaleString()}
              <span className="ch-top-val-label">{valueLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   5. KPI sparkline (tiny 7-day trend line inside a KPI card)
════════════════════════════════════════════════════════════════════ */
export function Sparkline({ data, valueKey, color = "#16a34a" }) {
  if (!data?.length) return null;
  const last7 = data.slice(-7);
  const vals  = last7.map((d) => d[valueKey]);
  const max   = Math.max(...vals, 1);
  const W = 80, H = 28;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * W},${H - (v / max) * H}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/* ── Exported colour helpers used by Admin.jsx ───────────────────── */
export { STATUS_COLORS, PAY_COLORS };
