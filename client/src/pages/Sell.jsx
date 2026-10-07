import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import ProductArt from "../components/ProductArt.jsx";
import { money } from "../money.js";

/* ── Constants ──────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { value: "electronics", label: "Electronics", icon: "📱", defaultArt: "phone" },
  { value: "vehicles",    label: "Vehicles",    icon: "🚗", defaultArt: "car" },
  { value: "property",   label: "Real Estate",  icon: "🏠", defaultArt: "apartment" },
  { value: "fashion",    label: "Fashion",      icon: "👗", defaultArt: "dress" },
  { value: "furniture",  label: "Furniture",    icon: "🛋️", defaultArt: "sofa" },
  { value: "stationery", label: "Stationery",   icon: "📚", defaultArt: "notebook" },
  { value: "services",   label: "Services",     icon: "💼", defaultArt: "desk" },
];

const ART_OPTIONS = [
  { value: "phone", label: "Phone" }, { value: "laptop", label: "Laptop" },
  { value: "headphones", label: "Headphones" }, { value: "car", label: "Car" },
  { value: "suv", label: "SUV" }, { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" }, { value: "dress", label: "Dress/Fashion" },
  { value: "watch", label: "Watch/Jewelry" }, { value: "shoe", label: "Shoes" },
  { value: "sofa", label: "Sofa" }, { value: "desk", label: "Desk/Table" },
  { value: "notebook", label: "Notebook" }, { value: "mug", label: "Mug" },
  { value: "pen", label: "Pen" }, { value: "lamp", label: "Lamp" },
];

const PRESET_COLORS = [
  { color: "#2563EB", tint: "#EFF6FF", label: "Blue" },
  { color: "#059669", tint: "#ECFDF5", label: "Green" },
  { color: "#D97706", tint: "#FFFBEB", label: "Gold" },
  { color: "#DC2626", tint: "#FEF2F2", label: "Red" },
  { color: "#7C3AED", tint: "#F5F3FF", label: "Purple" },
  { color: "#0F172A", tint: "#F1F5F9", label: "Slate" },
];

const PLANS = [
  {
    key: "basic", name: "Free Basic", price: 0, priceLabel: "Free",
    color: "#6b7280", accent: "#f3f4f6", badge: null, posts: "1 listing",
    features: ["✓ 1 active listing","✓ Standard visibility","✓ Call & Telegram","✗ No photo upload","✗ Not featured"],
  },
  {
    key: "standard", name: "Standard", price: 99, priceLabel: "99 ETB",
    color: "#2563eb", accent: "#eff6ff", badge: "Popular", posts: "Up to 5 listings",
    features: ["✓ Up to 5 listings","✓ Photo upload","✓ Higher ranking","✓ All contact channels","✗ Not featured"],
  },
  {
    key: "pro", name: "Pro Seller", price: 249, priceLabel: "249 ETB",
    color: "#16a34a", accent: "#f0fdf4", badge: "Best Value", posts: "Unlimited listings",
    features: ["✓ Unlimited listings","✓ Photo upload","✓ 💎 Featured badge","✓ Top search placement","✓ Verified seller ✓"],
  },
];

const GATEWAYS = [
  { key: "telebirr", name: "Telebirr", icon: "📱", color: "#0284c7", account: "+251 92 627 366", accountLabel: "Merchant No.", instructions: "Open Telebirr app → Pay Merchant → Enter number above → Use listing title as reason" },
  { key: "cbe",      name: "CBE Birr", icon: "🏦", color: "#15803d", account: "1000254874705",  accountLabel: "Account No.",  instructions: "Open CBE Birr app or visit any CBE branch → Transfer to account above → Save the reference" },
  { key: "chapa",    name: "Chapa",    icon: "💳", color: "#7c3aed", account: null,              accountLabel: null,           instructions: "Pay with Visa, Mastercard, or Ethiopian bank cards via Chapa secure checkout." },
];

const STEPS = [
  { n: 1, label: "Category",    icon: "🏷️" },
  { n: 2, label: "Photos",      icon: "📸" },
  { n: 3, label: "Details",     icon: "📝" },
  { n: 4, label: "Location",    icon: "📍" },
  { n: 5, label: "Theme",       icon: "🎨" },
  { n: 6, label: "Contact",     icon: "📞" },
];

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Sell() {
  const navigate = useNavigate();
  const [locations, setLocations]   = useState([]);
  const [errors,    setErrors]      = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "", category: "electronics", price: "", negotiable: false,
    condition: "Brand New", city: "Addis Ababa", subcity: "Bole",
    description: "", image: "", art: "phone", color: "#2563EB", tint: "#EFF6FF",
    sellerName: "", sellerPhone: "", sellerTelegram: "", sellerWhatsapp: "",
  });

  /* payment gate */
  const [gateStep,     setGateStep]     = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedGw,   setSelectedGw]   = useState("telebirr");
  const [paymentRef,   setPaymentRef]   = useState("");
  const [payRefError,  setPayRefError]  = useState("");
  const [copied,       setCopied]       = useState(false);
  const [submitError,  setSubmitError]  = useState("");

  useEffect(() => {
    const ac = new AbortController();
    api.locations(ac.signal).then((d) => { if (d.cities) setLocations(d.cities); }).catch(() => {});
    return () => ac.abort();
  }, []);

  const currentCityObj = locations.find((l) => l.city === formData.city) || {
    city: "Addis Ababa",
    subcities: ["Bole","Kazanchis","Piassa","CMC","Megenagna","Sarbet","Mexico","Lebu","Ayat"],
  };

  function handleChange(field, value) {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "category") { const c = CATEGORIES.find((x) => x.value === value); if (c) next.art = c.defaultArt; }
      if (field === "city")     { const c = locations.find((l) => l.city === value); next.subcity = c?.subcities?.[0] || ""; }
      return next;
    });
  }

  function handleImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) { if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; } else { w = Math.round(w * maxDim / h); h = maxDim; } }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const MAX = 700 * 1024;
        let q = 0.72, dataUrl = canvas.toDataURL("image/jpeg", q);
        while (dataUrl.length > MAX && q > 0.3) { q = Math.round((q - 0.1) * 10) / 10; dataUrl = canvas.toDataURL("image/jpeg", q); }
        if (dataUrl.length > MAX) { alert("Image too large."); return; }
        setFormData((p) => ({ ...p, image: dataUrl }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]); }
  function handleDrag(e) { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); }

  function handleFormSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!formData.name.trim())                              errs.name        = "Title is required";
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) errs.price = "Enter a valid price in ETB";
    if (!formData.description.trim())                       errs.description = "Description is required";
    if (!formData.sellerPhone.trim())                       errs.sellerPhone = "Phone number is required";
    if (Object.keys(errs).length) { setErrors(errs); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setErrors({});
    setSelectedPlan(null); setSelectedGw("telebirr");
    setPaymentRef(""); setPayRefError(""); setSubmitError("");
    setGateStep("plans");
  }

  function handleSelectPlan(plan) {
    setSelectedPlan(plan);
    if (plan.price === 0) { setGateStep("submitting"); doSubmit(plan, "free", "FREE"); }
    else setGateStep("pay");
  }

  function handleConfirmPayment() {
    if (!paymentRef.trim()) { setPayRefError("Paste your transaction reference number."); return; }
    if (paymentRef.trim().length < 4) { setPayRefError("Reference too short — copy from your payment app."); return; }
    setPayRefError(""); setGateStep("submitting");
    doSubmit(selectedPlan, selectedGw, paymentRef.trim());
  }

  async function doSubmit(plan, gw, ref) {
    setSubmitError("");
    try {
      const result = await api.submitListing({
        plan: plan.key, paymentMethod: gw, paymentRef: ref, sellerPhone: formData.sellerPhone,
        product: {
          name: formData.name, category: formData.category, price: Number(formData.price),
          negotiable: formData.negotiable, condition: formData.condition, description: formData.description,
          image: formData.image || null, art: formData.art, color: formData.color, tint: formData.tint,
          location: { city: formData.city, subcity: formData.subcity },
          seller: { name: formData.sellerName || "Gedualpha Seller", phone: formData.sellerPhone, telegram: formData.sellerTelegram, whatsapp: formData.sellerWhatsapp },
        },
      });
      setGateStep("success");
      setTimeout(() => navigate(`/product/${result.id}`), 2400);
    } catch (err) {
      setSubmitError(err.message || "Submission failed. Please try again.");
      setGateStep(plan.price === 0 ? "plans" : "pay");
    }
  }

  function copyAccount(text) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const activePlan = selectedPlan;
  const activeGw   = GATEWAYS.find((g) => g.key === selectedGw);

  /* step completion helpers */
  function stepDone(n) {
    if (n === 1) return !!formData.category;
    if (n === 2) return !!formData.image;
    if (n === 3) return !!formData.name && !!formData.price && !!formData.description;
    if (n === 4) return !!formData.city;
    if (n === 5) return true;
    if (n === 6) return !!formData.sellerPhone;
    return false;
  }

  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="sf-hero">
        <div className="sf-hero-glow" />
        <div className="container">
          <div className="sf-hero-inner">
            <div className="sf-hero-left">
              <span className="sf-hero-badge">🇪🇹 Gedualpha Verified Marketplace</span>
              <h1 className="sf-hero-title">Post Your Listing</h1>
              <p className="sf-hero-sub">Reach thousands of buyers across Ethiopia in minutes.<br />Basic listing is always free.</p>
              <div className="sf-hero-stats">
                <div className="sf-stat"><strong>10K+</strong><span>Active Buyers</span></div>
                <div className="sf-stat-divider" />
                <div className="sf-stat"><strong>Free</strong><span>Basic Posting</span></div>
                <div className="sf-stat-divider" />
                <div className="sf-stat"><strong>Fast</strong><span>Goes Live Instantly</span></div>
              </div>
            </div>
            <div className="sf-hero-right">
              <div className="sf-hero-card-stack">
                <div className="sf-hero-card sf-hero-card--back" />
                <div className="sf-hero-card sf-hero-card--mid" />
                <div className="sf-hero-card sf-hero-card--front">
                  <span style={{ fontSize: "2rem" }}>🏪</span>
                  <strong>Your Listing</strong>
                  <span className="sf-hero-card-sub">Live on Gedualpha</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page body ───────────────────────────────────────────────────── */}
      <div className="container sf-body">

        {/* Progress steps bar */}
        <div className="sf-steps">
          {STEPS.map((s, i) => (
            <div key={s.n} className="sf-step-wrap">
              <button
                type="button"
                className={`sf-step ${activeStep === s.n ? "sf-step--active" : ""} ${stepDone(s.n) ? "sf-step--done" : ""}`}
                onClick={() => setActiveStep(s.n)}
              >
                <span className="sf-step-dot">
                  {stepDone(s.n) ? "✓" : s.n}
                </span>
                <span className="sf-step-label">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`sf-step-line ${stepDone(s.n) ? "sf-step-line--done" : ""}`} />}
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="sf-grid">

          {/* ═══ FORM CARD ═══ */}
          <div className="sf-form-wrap">
            <form onSubmit={handleFormSubmit} noValidate>

              {errors.form && <div className="sf-global-error">⚠️ {errors.form}</div>}

              {/* ── STEP 1: Category ── */}
              <div className={`sf-section ${activeStep === 1 ? "sf-section--active" : ""}`} id="sf-step-1">
                <div className="sf-section-header" onClick={() => setActiveStep(1)}>
                  <div className="sf-section-num">1</div>
                  <div>
                    <div className="sf-section-title">Select Category</div>
                    <div className="sf-section-sub">What type of item are you selling?</div>
                  </div>
                  {stepDone(1) && <span className="sf-check">✓</span>}
                </div>
                {activeStep === 1 && (
                  <div className="sf-section-body">
                    <div className="sf-cat-grid">
                      {CATEGORIES.map((cat) => (
                        <button key={cat.value} type="button"
                          className={`sf-cat-btn ${formData.category === cat.value ? "sf-cat-btn--active" : ""}`}
                          onClick={() => { handleChange("category", cat.value); setActiveStep(2); }}>
                          <span className="sf-cat-emoji">{cat.icon}</span>
                          <span className="sf-cat-label">{cat.label}</span>
                          {formData.category === cat.value && <span className="sf-cat-check">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── STEP 2: Photo ── */}
              <div className={`sf-section ${activeStep === 2 ? "sf-section--active" : ""}`} id="sf-step-2">
                <div className="sf-section-header" onClick={() => setActiveStep(2)}>
                  <div className="sf-section-num">2</div>
                  <div>
                    <div className="sf-section-title">Upload Photos <span className="sf-badge-plan">Standard / Pro</span></div>
                    <div className="sf-section-sub">Real photos attract 5× more buyers</div>
                  </div>
                  {stepDone(2) && <span className="sf-check">✓</span>}
                </div>
                {activeStep === 2 && (
                  <div className="sf-section-body">
                    {formData.image ? (
                      <div className="sf-photo-preview">
                        <img src={formData.image} alt="Preview" />
                        <div className="sf-photo-overlay">
                          <span className="sf-photo-ready">✓ Photo Ready</span>
                          <button type="button" className="sf-photo-remove"
                            onClick={() => setFormData((p) => ({ ...p, image: "" }))}>
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`sf-dropzone ${dragActive ? "sf-dropzone--active" : ""}`}
                        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
                        <input type="file" id="sf-photo-input" accept="image/png,image/jpeg,image/webp"
                          style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", zIndex:2 }}
                          onChange={(e) => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); }} />
                        <div className="sf-dropzone-inner">
                          <div className="sf-dropzone-icon">📸</div>
                          <div className="sf-dropzone-title">Drag & drop or click to upload</div>
                          <div className="sf-dropzone-sub">JPG · PNG · WEBP — auto-optimised, max 5 MB</div>
                          <div className="btn btn-accent btn-sm" style={{ pointerEvents:"none", marginTop:"0.5rem" }}>Browse Files</div>
                        </div>
                      </div>
                    )}
                    <button type="button" className="sf-next-btn" onClick={() => setActiveStep(3)}>Next: Add Details →</button>
                  </div>
                )}
              </div>

              {/* ── STEP 3: Details ── */}
              <div className={`sf-section ${activeStep === 3 ? "sf-section--active" : ""}`} id="sf-step-3">
                <div className="sf-section-header" onClick={() => setActiveStep(3)}>
                  <div className="sf-section-num">3</div>
                  <div>
                    <div className="sf-section-title">Listing Details</div>
                    <div className="sf-section-sub">Title, price and description</div>
                  </div>
                  {stepDone(3) && <span className="sf-check">✓</span>}
                </div>
                {activeStep === 3 && (
                  <div className="sf-section-body">

                    <div className="sf-field">
                      <label className="sf-label">
                        <span className="sf-label-icon">🏷️</span> Item Title <span className="sf-req">*</span>
                      </label>
                      <input className={`sf-input ${errors.name ? "sf-input--err" : ""}`}
                        type="text" placeholder="e.g. iPhone 15 Pro Max 256GB Titanium"
                        value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                      {errors.name && <span className="sf-err-msg">{errors.name}</span>}
                    </div>

                    <div className="sf-row">
                      <div className="sf-field">
                        <label className="sf-label">
                          <span className="sf-label-icon">💰</span> Price (ETB) <span className="sf-req">*</span>
                        </label>
                        <div className="sf-input-prefix-wrap">
                          <span className="sf-input-prefix">Br</span>
                          <input className={`sf-input sf-input--prefix ${errors.price ? "sf-input--err" : ""}`}
                            type="number" placeholder="145,000"
                            value={formData.price} onChange={(e) => handleChange("price", e.target.value)} />
                        </div>
                        {errors.price && <span className="sf-err-msg">{errors.price}</span>}
                      </div>
                      <div className="sf-field">
                        <label className="sf-label">
                          <span className="sf-label-icon">🔖</span> Condition
                        </label>
                        <select className="sf-select"
                          value={formData.condition} onChange={(e) => handleChange("condition", e.target.value)}>
                          {["Brand New","Like New","Used","Finished"].map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <label className="sf-checkbox">
                      <input type="checkbox" checked={formData.negotiable}
                        onChange={(e) => handleChange("negotiable", e.target.checked)} />
                      <span className="sf-checkbox-box" />
                      <span>Price is Negotiable <span style={{ color:"var(--text-muted)", fontWeight:400 }}>(ተደራዳሪ)</span></span>
                    </label>

                    <div className="sf-field">
                      <label className="sf-label">
                        <span className="sf-label-icon">📄</span> Description &amp; Specs <span className="sf-req">*</span>
                      </label>
                      <textarea className={`sf-textarea ${errors.description ? "sf-input--err" : ""}`}
                        rows={4} placeholder="Describe key features, specifications, warranty, reason for selling…"
                        value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
                      {errors.description && <span className="sf-err-msg">{errors.description}</span>}
                    </div>

                    <button type="button" className="sf-next-btn" onClick={() => setActiveStep(4)}>Next: Set Location →</button>
                  </div>
                )}
              </div>

              {/* ── STEP 4: Location ── */}
              <div className={`sf-section ${activeStep === 4 ? "sf-section--active" : ""}`} id="sf-step-4">
                <div className="sf-section-header" onClick={() => setActiveStep(4)}>
                  <div className="sf-section-num">4</div>
                  <div>
                    <div className="sf-section-title">Item Location</div>
                    <div className="sf-section-sub">City and subcity in Ethiopia</div>
                  </div>
                  {stepDone(4) && <span className="sf-check">✓</span>}
                </div>
                {activeStep === 4 && (
                  <div className="sf-section-body">
                    <div className="sf-row">
                      <div className="sf-field">
                        <label className="sf-label"><span className="sf-label-icon">🏙️</span> City</label>
                        <select className="sf-select" value={formData.city} onChange={(e) => handleChange("city", e.target.value)}>
                          {locations.length > 0
                            ? locations.map((l) => <option key={l.city} value={l.city}>{l.city}</option>)
                            : <option value="Addis Ababa">Addis Ababa</option>}
                        </select>
                      </div>
                      <div className="sf-field">
                        <label className="sf-label"><span className="sf-label-icon">📌</span> Subcity / Area</label>
                        <select className="sf-select" value={formData.subcity} onChange={(e) => handleChange("subcity", e.target.value)}>
                          {currentCityObj.subcities.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <button type="button" className="sf-next-btn" onClick={() => setActiveStep(5)}>Next: Card Theme →</button>
                  </div>
                )}
              </div>

              {/* ── STEP 5: Theme ── */}
              <div className={`sf-section ${activeStep === 5 ? "sf-section--active" : ""}`} id="sf-step-5">
                <div className="sf-section-header" onClick={() => setActiveStep(5)}>
                  <div className="sf-section-num">5</div>
                  <div>
                    <div className="sf-section-title">Card Theme &amp; Icon</div>
                    <div className="sf-section-sub">Fallback icon and accent colour</div>
                  </div>
                  {stepDone(5) && <span className="sf-check">✓</span>}
                </div>
                {activeStep === 5 && (
                  <div className="sf-section-body">
                    <div className="sf-field">
                      <label className="sf-label"><span className="sf-label-icon">🖼️</span> Fallback Icon</label>
                      <select className="sf-select" value={formData.art} onChange={(e) => handleChange("art", e.target.value)}>
                        {ART_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="sf-field">
                      <label className="sf-label"><span className="sf-label-icon">🎨</span> Theme Colour</label>
                      <div className="sf-color-row">
                        {PRESET_COLORS.map((p) => (
                          <button key={p.color} type="button"
                            className={`sf-color-swatch ${formData.color === p.color ? "sf-color-swatch--active" : ""}`}
                            style={{ background: p.color }}
                            onClick={() => setFormData((prev) => ({ ...prev, color: p.color, tint: p.tint }))}
                            title={p.label} />
                        ))}
                      </div>
                    </div>
                    <button type="button" className="sf-next-btn" onClick={() => setActiveStep(6)}>Next: Contact Info →</button>
                  </div>
                )}
              </div>

              {/* ── STEP 6: Contact ── */}
              <div className={`sf-section ${activeStep === 6 ? "sf-section--active" : ""}`} id="sf-step-6">
                <div className="sf-section-header" onClick={() => setActiveStep(6)}>
                  <div className="sf-section-num">6</div>
                  <div>
                    <div className="sf-section-title">Contact Information</div>
                    <div className="sf-section-sub">How buyers can reach you</div>
                  </div>
                  {stepDone(6) && <span className="sf-check">✓</span>}
                </div>
                {activeStep === 6 && (
                  <div className="sf-section-body">
                    <div className="sf-field">
                      <label className="sf-label"><span className="sf-label-icon">👤</span> Your Name / Shop Name</label>
                      <input className="sf-input" type="text" placeholder="e.g. Abebe Kebede / Addis Electronics"
                        value={formData.sellerName} onChange={(e) => handleChange("sellerName", e.target.value)} />
                    </div>
                    <div className="sf-row">
                      <div className="sf-field">
                        <label className="sf-label"><span className="sf-label-icon">📞</span> Phone Number <span className="sf-req">*</span></label>
                        <input className={`sf-input ${errors.sellerPhone ? "sf-input--err" : ""}`}
                          type="tel" placeholder="+251912627366"
                          value={formData.sellerPhone} onChange={(e) => handleChange("sellerPhone", e.target.value)} />
                        {errors.sellerPhone && <span className="sf-err-msg">{errors.sellerPhone}</span>}
                      </div>
                      <div className="sf-field">
                        <label className="sf-label"><span className="sf-label-icon">✈️</span> Telegram Username</label>
                        <input className="sf-input" type="text" placeholder="@greatestvalue"
                          value={formData.sellerTelegram} onChange={(e) => handleChange("sellerTelegram", e.target.value)} />
                      </div>
                    </div>
                    <div className="sf-field">
                      <label className="sf-label"><span className="sf-label-icon">💬</span> WhatsApp Number</label>
                      <input className="sf-input" type="tel" placeholder="0941645784"
                        value={formData.sellerWhatsapp} onChange={(e) => handleChange("sellerWhatsapp", e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              {/* ── SUBMIT BUTTON ── */}
              <div className="sf-submit-area">
                <button type="submit" className="sf-submit-btn">
                  <span className="sf-submit-icon">🚀</span>
                  <span className="sf-submit-text">Continue to Publish</span>
                  <span className="sf-submit-arrow">→</span>
                </button>
                <div className="sf-submit-note">
                  <span>🔒 Secure &amp; verified</span>
                  <span>·</span>
                  <span>Free basic plan always available</span>
                  <span>·</span>
                  <span>Goes live in seconds</span>
                </div>
              </div>

            </form>
          </div>

          {/* ═══ LIVE PREVIEW ═══ */}
          <div className="sf-preview-col">
            <div className="sf-preview-sticky">
              <div className="sf-preview-header">
                <span className="sf-preview-dot sf-preview-dot--red" />
                <span className="sf-preview-dot sf-preview-dot--yellow" />
                <span className="sf-preview-dot sf-preview-dot--green" />
                <span className="sf-preview-title">Live Preview</span>
              </div>
              <div className="sf-preview-body">
                <article className="card marketplace-card preview-card">
                  <div className="card-art">
                    <div className="card-art-inner">
                      {formData.image
                        ? <img src={formData.image} alt={formData.name || "Preview"} className="card-photo" />
                        : <ProductArt art={formData.art} color={formData.color} tint={formData.tint} />}
                    </div>
                    <span className="card-badge-condition">{formData.condition}</span>
                    {formData.image && <span className="card-badge-featured" style={{ position:"absolute", top:"0.625rem", left:"0.625rem" }}>📸 Photo</span>}
                  </div>
                  <div className="card-body">
                    <div className="card-meta-top">
                      <span className="card-cat-badge">{formData.category}</span>
                      <span className="card-location">📍 {formData.subcity}, {formData.city}</span>
                    </div>
                    <h4 className="card-title">{formData.name || "Your listing title…"}</h4>
                    <div className="price-sub">
                      <div className="price-group">
                        <span className="price">{formData.price ? money(formData.price) : "Br —"}</span>
                        {formData.negotiable && <span className="tag-negotiable">Negotiable</span>}
                      </div>
                    </div>
                    <div className="card-footer-actions">
                      <button className="btn-card-call" disabled>📞 Call</button>
                      <button className="btn-card-tg" disabled>✈️</button>
                      <button className="btn-add" disabled>🛒</button>
                    </div>
                  </div>
                </article>
              </div>

              {/* Tips */}
              <div className="sf-tips">
                <div className="sf-tips-title">🛡️ Safe Selling Tips</div>
                {["Provide accurate condition details","Never ask for prepaid advance","Meet buyers in public locations","Screenshot your payment receipt"].map((t) => (
                  <div key={t} className="sf-tip-row">
                    <span className="sf-tip-dot" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>{/* end sf-grid */}
      </div>{/* end container */}

      {/* ══════════════════════════════════════════════════════════════════
          PAYMENT GATE MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {gateStep !== null && (
        <div className="pg-scrim"
          onClick={() => { if (gateStep === "plans" || gateStep === "pay") setGateStep(null); }}>
          <div className="pg-modal" onClick={(e) => e.stopPropagation()}>

            {/* ── PLANS ── */}
            {gateStep === "plans" && (
              <>
                <div className="pg-modal-head">
                  <div>
                    <h2>Choose Your Posting Plan</h2>
                    <p>Pick a plan to publish. Basic is always free.</p>
                  </div>
                  <button className="pg-close" onClick={() => setGateStep(null)}>✕</button>
                </div>
                {submitError && <div className="pg-error-banner">⚠️ {submitError}</div>}
                <div className="pg-plans-grid">
                  {PLANS.map((plan) => (
                    <div key={plan.key}
                      className={`pg-plan-card ${plan.key === "pro" ? "pg-plan-card--featured" : ""}`}
                      style={{ "--plan-color": plan.color, "--plan-accent": plan.accent }}>
                      {plan.badge && <div className="pg-plan-badge" style={{ background: plan.color }}>{plan.badge}</div>}
                      <div className="pg-plan-icon">{plan.key === "basic" ? "🆓" : plan.key === "standard" ? "⭐" : "💎"}</div>
                      <div className="pg-plan-name">{plan.name}</div>
                      <div className="pg-plan-price">
                        {plan.price === 0
                          ? <span className="pg-plan-price-free">Free</span>
                          : <><span className="pg-plan-price-val">{plan.price}</span><span className="pg-plan-price-cur"> ETB</span></>}
                      </div>
                      <div className="pg-plan-posts">{plan.posts}</div>
                      <ul className="pg-plan-features">
                        {plan.features.map((f) => <li key={f} className={f.startsWith("✗") ? "pg-feat-no" : "pg-feat-yes"}>{f}</li>)}
                      </ul>
                      <button className="pg-plan-btn" style={{ background: plan.color }} onClick={() => handleSelectPlan(plan)}>
                        {plan.price === 0 ? "Post for Free" : `Pay ${plan.priceLabel} & Publish`}
                      </button>
                    </div>
                  ))}
                </div>
                <p className="pg-footer-note">💡 All paid plans are one-time fees. No recurring charges.</p>
              </>
            )}

            {/* ── PAY ── */}
            {gateStep === "pay" && activePlan && (
              <>
                <div className="pg-modal-head">
                  <div>
                    <h2>Complete Payment — {activePlan.name}</h2>
                    <p>Pay <strong>{activePlan.priceLabel}</strong> then enter your reference below.</p>
                  </div>
                  <button className="pg-close" onClick={() => setGateStep("plans")}>←</button>
                </div>
                {submitError && <div className="pg-error-banner">⚠️ {submitError}</div>}
                <div className="pg-gw-tabs">
                  {GATEWAYS.map((gw) => (
                    <button key={gw.key}
                      className={`pg-gw-tab ${selectedGw === gw.key ? "active" : ""}`}
                      style={selectedGw === gw.key ? { borderColor: gw.color, color: gw.color } : {}}
                      onClick={() => setSelectedGw(gw.key)}>
                      <span>{gw.icon}</span> {gw.name}
                    </button>
                  ))}
                </div>
                {activeGw && (
                  <div className="pg-gw-card" style={{ borderColor: activeGw.color + "44" }}>
                    <div className="pg-gw-card-head" style={{ background: activeGw.color + "12" }}>
                      <span className="pg-gw-icon">{activeGw.icon}</span>
                      <div>
                        <div className="pg-gw-name">{activeGw.name}</div>
                        <div className="pg-gw-amount">Send exactly <strong style={{ color: activeGw.color }}>{activePlan.priceLabel}</strong></div>
                      </div>
                      <div className="pg-gw-live-dot" style={{ background: activeGw.color }}>● Live</div>
                    </div>
                    {activeGw.account && (
                      <div className="pg-gw-account-row">
                        <div>
                          <div className="pg-gw-acct-label">{activeGw.accountLabel}</div>
                          <div className="pg-gw-acct-val">{activeGw.account}</div>
                        </div>
                        <button className="pg-copy-btn" onClick={() => copyAccount(activeGw.account)}>
                          {copied ? "✓ Copied!" : "Copy"}
                        </button>
                      </div>
                    )}
                    <div className="pg-gw-instructions">{activeGw.instructions}</div>
                  </div>
                )}
                <div className="pg-ref-section">
                  <label className="pg-ref-label">Paste Your Transaction Reference</label>
                  <p className="pg-ref-hint">Copy the transaction ID from your payment app and paste it here.</p>
                  <input type="text" className={`pg-ref-input ${payRefError ? "pg-ref-input--err" : ""}`}
                    placeholder="e.g. TXN-2024-ABCDE or CBE-1234567890"
                    value={paymentRef} onChange={(e) => { setPaymentRef(e.target.value); setPayRefError(""); }} />
                  {payRefError && <em className="pg-ref-error">{payRefError}</em>}
                </div>
                <div className="pg-pay-actions">
                  <button className="btn btn-ghost" onClick={() => setGateStep("plans")}>← Back</button>
                  <button className="btn btn-accent" style={{ minWidth: "200px" }} onClick={handleConfirmPayment}>
                    ✓ I've Paid — Publish Listing
                  </button>
                </div>
                <p className="pg-footer-note">🔒 Reference verified by admin within 24 h. Listing goes live immediately.</p>
              </>
            )}

            {/* ── SUBMITTING ── */}
            {gateStep === "submitting" && (
              <div className="pg-status-box">
                <div className="pg-spinner" />
                <h3>Publishing Your Listing…</h3>
                <p>Please wait while we create your listing on Gedualpha Ecom.</p>
              </div>
            )}

            {/* ── SUCCESS ── */}
            {gateStep === "success" && (
              <div className="pg-status-box">
                <div className="pg-success-icon">🎉</div>
                <h3>Listing Published!</h3>
                <p>Your ad is now live. Redirecting to your listing…</p>
                <div className="pg-success-bar"><div className="pg-success-bar-fill" /></div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
