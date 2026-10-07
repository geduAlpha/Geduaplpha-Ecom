// Flat vector illustrations so the store looks finished before you have photos.
// Replace <ProductArt /> with an <img src={product.image} /> once you have real pictures.
const INK = "#14152B";
const PAPER = "#FBFAF7";

const shapes = {
  // Electronics
  phone: (c) => (
    <>
      <rect x="68" y="32" width="64" height="136" rx="12" fill={INK} />
      <rect x="72" y="44" width="56" height="110" rx="4" fill={c} />
      <circle cx="100" cy="38" r="3" fill="#64748B" />
      <line x1="90" y1="160" x2="110" y2="160" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  laptop: (c) => (
    <>
      <rect x="45" y="48" width="110" height="74" rx="6" fill={INK} />
      <rect x="52" y="55" width="96" height="60" rx="3" fill={c} />
      <polygon points="35,130 165,130 155,140 45,140" fill={INK} />
      <line x1="88" y1="134" x2="112" y2="134" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  headphones: (c) => (
    <>
      <path d="M55 105 A45 45 0 0 1 145 105" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
      <rect x="44" y="95" width="20" height="38" rx="8" fill={c} />
      <rect x="136" y="95" width="20" height="38" rx="8" fill={c} />
      <rect x="48" y="102" width="12" height="24" rx="4" fill={PAPER} opacity=".8" />
      <rect x="140" y="102" width="12" height="24" rx="4" fill={PAPER} opacity=".8" />
    </>
  ),
  // Vehicles
  car: (c) => (
    <>
      <path d="M42 120 L58 84 L142 84 L158 120 Z" fill={c} />
      <rect x="36" y="112" width="128" height="28" rx="6" fill={c} />
      <polygon points="62,88 94,88 94,110 50,110" fill={PAPER} opacity=".8" />
      <polygon points="106,88 138,88 150,110 106,110" fill={PAPER} opacity=".8" />
      <circle cx="65" cy="140" r="14" fill={INK} />
      <circle cx="65" cy="140" r="6" fill={PAPER} />
      <circle cx="135" cy="140" r="14" fill={INK} />
      <circle cx="135" cy="140" r="6" fill={PAPER} />
    </>
  ),
  suv: (c) => (
    <>
      <path d="M40 120 L52 70 L148 70 L160 120 Z" fill={c} />
      <rect x="34" y="105" width="132" height="35" rx="8" fill={c} />
      <rect x="58" y="75" width="38" height="28" rx="3" fill={PAPER} opacity=".85" />
      <rect x="104" y="75" width="40" height="28" rx="3" fill={PAPER} opacity=".85" />
      <circle cx="62" cy="142" r="16" fill={INK} />
      <circle cx="62" cy="142" r="7" fill={PAPER} />
      <circle cx="138" cy="142" r="16" fill={INK} />
      <circle cx="138" cy="142" r="7" fill={PAPER} />
    </>
  ),
  // Property / Real Estate
  house: (c) => (
    <>
      <polygon points="100,38 40,88 160,88" fill={c} />
      <rect x="52" y="88" width="96" height="74" fill={INK} opacity=".1" />
      <rect x="56" y="88" width="88" height="70" fill={c} />
      <rect x="88" y="114" width="24" height="44" rx="2" fill={INK} />
      <rect x="66" y="98" width="16" height="16" rx="2" fill={PAPER} />
      <rect x="118" y="98" width="16" height="16" rx="2" fill={PAPER} />
    </>
  ),
  apartment: (c) => (
    <>
      <rect x="60" y="40" width="80" height="125" rx="4" fill={c} />
      <rect x="70" y="52" width="16" height="16" rx="2" fill={PAPER} />
      <rect x="94" y="52" width="16" height="16" rx="2" fill={PAPER} />
      <rect x="114" y="52" width="16" height="16" rx="2" fill={PAPER} />
      <rect x="70" y="76" width="16" height="16" rx="2" fill={PAPER} />
      <rect x="94" y="76" width="16" height="16" rx="2" fill={PAPER} />
      <rect x="114" y="76" width="16" height="16" rx="2" fill={PAPER} />
      <rect x="70" y="100" width="16" height="16" rx="2" fill={PAPER} />
      <rect x="94" y="100" width="16" height="16" rx="2" fill={PAPER} />
      <rect x="114" y="100" width="16" height="16" rx="2" fill={PAPER} />
      <rect x="88" y="132" width="24" height="33" rx="2" fill={INK} />
    </>
  ),
  // Fashion
  dress: (c) => (
    <>
      <path d="M82 45 L118 45 L130 90 L155 160 L45 160 L70 90 Z" fill={c} />
      <path d="M82 45 C92 60 108 60 118 45" fill={PAPER} />
      <rect x="45" y="150" width="110" height="10" fill="#F59E0B" />
    </>
  ),
  watch: (c) => (
    <>
      <rect x="88" y="24" width="24" height="152" rx="6" fill={INK} opacity=".8" />
      <circle cx="100" cy="100" r="38" fill={c} />
      <circle cx="100" cy="100" r="30" fill={PAPER} />
      <line x1="100" y1="100" x2="100" y2="80" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1="100" x2="114" y2="100" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  shoe: (c) => (
    <>
      <path d="M48 115 C55 90 90 85 115 110 L155 115 C162 120 162 135 150 140 L45 140 C40 135 40 120 48 115 Z" fill={c} />
      <rect x="40" y="136" width="120" height="10" rx="3" fill={INK} />
      <rect x="42" y="142" width="30" height="8" rx="2" fill={INK} />
    </>
  ),
  // Furniture
  sofa: (c) => (
    <>
      <rect x="45" y="70" width="110" height="55" rx="12" fill={c} />
      <rect x="36" y="90" width="128" height="42" rx="10" fill={c} />
      <rect x="32" y="85" width="22" height="45" rx="8" fill={INK} opacity=".3" />
      <rect x="146" y="85" width="22" height="45" rx="8" fill={INK} opacity=".3" />
      <line x1="48" y1="132" x2="42" y2="155" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <line x1="152" y1="132" x2="158" y2="155" stroke={INK} strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  desk: (c) => (
    <>
      <rect x="40" y="75" width="120" height="14" rx="3" fill={c} />
      <rect x="115" y="89" width="40" height="50" rx="2" fill={c} />
      <rect x="120" y="95" width="30" height="10" rx="2" fill={PAPER} />
      <rect x="120" y="112" width="30" height="10" rx="2" fill={PAPER} />
      <line x1="50" y1="89" x2="50" y2="145" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <line x1="75" y1="89" x2="75" y2="145" stroke={INK} strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  // Stationery / Original
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
