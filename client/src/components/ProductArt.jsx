// Flat vector illustrations so the store looks finished before you have photos.
// Replace <ProductArt /> with an <img src={product.image} /> once you have real pictures.
const INK = "#14152B";
const PAPER = "#FBFAF7";

const shapes = {
  notebook: (c) => (
    <>
      <rect x="58" y="32" width="84" height="136" rx="8" fill={c} />
      <rect x="70" y="32" width="8" height="136" fill={INK} opacity=".22" />
      <rect x="92" y="62" width="38" height="24" rx="4" fill={PAPER} />
    </>
  ),
  mug: (c) => (
    <>
      <path d="M132 76h10a18 18 0 0 1 0 36h-10" fill="none" stroke={c} strokeWidth="9" />
      <rect x="58" y="58" width="78" height="90" rx="14" fill={c} />
      <rect x="70" y="72" width="54" height="8" rx="4" fill={PAPER} opacity=".6" />
    </>
  ),
  pen: (c) => (
    <g transform="rotate(-35 100 100)">
      <rect x="91" y="26" width="18" height="120" rx="9" fill={c} />
      <rect x="91" y="64" width="18" height="10" fill={INK} opacity=".25" />
      <polygon points="91,146 109,146 100,176" fill={INK} />
    </g>
  ),
  lamp: (c) => (
    <>
      <ellipse cx="100" cy="166" rx="34" ry="8" fill={INK} />
      <path
        d="M100 162 L84 96 L128 62"
        fill="none"
        stroke={INK}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points="114,50 158,68 138,102" fill={c} />
    </>
  ),
  tote: (c) => (
    <>
      <path d="M78 74 C78 34 122 34 122 74" fill="none" stroke={c} strokeWidth="7" />
      <path d="M54 72h92l8 96H46z" fill={c} />
      <rect x="80" y="108" width="40" height="28" rx="4" fill={PAPER} opacity=".85" />
    </>
  ),
  planner: (c) => (
    <>
      <rect x="56" y="30" width="88" height="140" rx="8" fill={c} />
      {[52, 80, 108, 136].map((y) => (
        <circle key={y} cx="56" cy={y} r="6" fill={INK} />
      ))}
      {[58, 78, 98].map((y) => (
        <rect key={y} x="76" y={y} width="52" height="6" rx="3" fill={PAPER} opacity=".8" />
      ))}
    </>
  ),
  tape: (c) => (
    <>
      <circle cx="100" cy="100" r="54" fill={c} />
      <circle cx="100" cy="100" r="22" fill={PAPER} />
      <circle cx="100" cy="100" r="38" fill="none" stroke={PAPER} strokeWidth="4" strokeDasharray="6 8" opacity=".7" />
    </>
  ),
  cup: (c) => (
    <>
      <rect x="76" y="48" width="8" height="58" rx="3" fill={INK} />
      <rect x="96" y="36" width="8" height="70" rx="3" fill={PAPER} />
      <rect x="116" y="54" width="8" height="52" rx="3" fill={INK} />
      <rect x="64" y="96" width="72" height="72" rx="10" fill={c} />
    </>
  ),
};

export default function ProductArt({ art, color, tint, label = "" }) {
  const draw = shapes[art] ?? shapes.notebook;
  return (
    <svg
      className="art"
      viewBox="0 0 200 200"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <rect width="200" height="200" fill={tint} />
      {draw(color)}
    </svg>
  );
}
