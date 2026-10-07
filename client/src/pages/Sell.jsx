import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import ProductArt from "../components/ProductArt.jsx";
import { money } from "../money.js";

/* ── Constants ────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { value: "electronics", label: "Electronics & Phones", icon: "📱", defaultArt: "phone" },
  { value: "vehicles",    label: "Vehicles & Auto",       icon: "🚗", defaultArt: "car" },
  { value: "property",   label: "Real Estate / Property", icon: "🏠", defaultArt: "apartment" },
  { value: "fashion",    label: "Fashion & Beauty",       icon: "👗", defaultArt: "dress" },
  { value: "furniture",  label: "Home & Furniture",       icon: "🛋️", defaultArt: "sofa" },
  { value: "stationery", label: "Desk & Stationery",      icon: "📚", defaultArt: "notebook" },
  { value: "services",   label: "Services & Jobs",        icon: "💼", defaultArt: "desk" },
];

const ART_OPTIONS = [
  { value: "phone", label: "Phone" }, { value: "laptop", label: "Laptop" },
  { value: "headphones", label: "Headphones" }, { value: "car", label: "Car" },
  { value: "suv", label: "SUV" }, { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" }, { value: "dress", label: "Dress/Fashion" },
  { value: "watch", label: "Watch/Jewelry" }, { value: "shoe", label: "Shoes" },
  { value: "sofa", label: "Sofa/Couch" }, { value: "desk", label: "Desk/Table" },
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

/* Posting plans — mirrors server/index.js POSTING_PLANS */
const PLANS = [
  {
    key: "basic",
    name: "Free Basic",
    price: 0,
    priceLabel: "Free",
    color: "#6b7280",
    accent: "#f3f4f6",
    badge: null,
    posts: "1 listing",
    features: [
      "✓ 1 active listing",
      "✓ Standard visibility",
      "✓ Call & Telegram contact",
      "✗ No photo upload",
      "✗ Not featured",
    ],
  },
  {
    key: "standard",
    name: "Standard",
    price: 99,
    priceLabel: "99 ETB",
    color: "#2563eb",
    accent: "#eff6ff",
    badge: "Popular",
    posts: "Up to 5 listings",
    features: [
      "✓ Up to 5 active listings",
      "✓ Photo upload included",
      "✓ Higher search ranking",
      "✓ Call, Telegram & WhatsApp",
      "✗ Not featured",
    ],
  },
  {
    key: "pro",
    name: "Pro Seller",
    price: 249,
    priceLabel: "249 ETB",
    color: "#16a34a",
    accent: "#f0fdf4",
    badge: "Best Value",
    posts: "Unlimited listings",
    features: [
      "✓ Unlimited active listings",
      "✓ Photo upload included",
      "✓ 💎 Featured badge on listing",
      "✓ Top of search results",
      "✓ Verified seller checkmark",
    ],
  },
];

const GATEWAYS = [
  {
    key: "telebirr",
    name: "Telebirr",
    icon: "📱",
    color: "#0284c7",
    account: "+251 92 627 366",
    accountLabel: "Merchant No.",
    instructions: "Open Telebirr app → Pay Merchant → Enter number above → Use listing title as reason",
  },
  {
    key: "cbe",
    name: "CBE Birr",
    icon: "🏦",
    color: "#15803d",
    account: "1000254874705",
    accountLabel: "Account No.",
    instructions: "Open CBE Birr app or visit any CBE branch → Transfer to account above → Screenshot the reference",
  },
  {
    key: "chapa",
    name: "Chapa / Card",
    icon: "💳",
    color: "#7c3aed",
    account: null,
    accountLabel: null,
    instructions: "Pay with Visa, Mastercard, or other Ethiopian banks via Chapa secure checkout.",
  },
];

/* ── Main Component ───────────────────────────────────────────────────────── */
export default function Sell() {
  const navigate = useNavigate();
  const [locations, setLocations]   = useState([]);
  const [errors, setErrors]         = useState({});
  const [dragActive, setDragActive] = useState(false);

  /* form state */
  const [formData, setFormData] = useState({
    name: "", category: "electronics", price: "", negotiable: false,
    condition: "Brand New", city: "Addis Ababa", subcity: "Bole",
    description: "", image: "", art: "phone", color: "#2563EB", tint: "#EFF6FF",
    sellerName: "", sellerPhone: "", sellerTelegram: "", sellerWhatsapp: "",
  });

  /* payment gate state */
  const [gateStep, setGateStep]     = useState(null); // null | "plans" | "pay" | "submitting" | "success"
  const [selectedPlan, setSelectedPlan]   = useState(null);
  const [selectedGw,   setSelectedGw]     = useState("telebirr");
  const [paymentRef,   setPaymentRef]     = useState("");
  const [payRefError,  setPayRefError]    = useState("");
  const [copied,       setCopied]         = useState(false);
  const [submitError,  setSubmitError]    = useState("");

  useEffect(() => {
    const ac = new AbortController();
    api.locations(ac.signal)
      .then((d) => { if (d.cities) setLocations(d.cities); })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const currentCityObj = locations.find((l) => l.city === formData.city) || {
    city: "Addis Ababa",
    subcities: ["Bole","Kazanchis","Piassa","CMC","Megenagna","Sarbet","Mexico","Lebu","Ayat"],
  };

  /* ── form helpers ── */
  function handleChange(field, value) {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "category") {
        const cat = CATEGORIES.find((c) => c.value === value);
        if (cat) next.art = cat.defaultArt;
      }
      if (field === "city") {
        const cObj = locations.find((l) => l.city === value);
        next.subcity = cObj?.subcities?.[0] || "";
      }
      return next;
    });
  }

  function handleImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max 5 MB photo."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
          else       { w = Math.round(w * maxDim / h); h = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const MAX = 700 * 1024;
        let q = 0.72, dataUrl = canvas.toDataURL("image/jpeg", q);
        while (dataUrl.length > MAX && q > 0.3) {
          q = Math.round((q - 0.1) * 10) / 10;
          dataUrl = canvas.toDataURL("image/jpeg", q);
        }
        if (dataUrl.length > MAX) { alert("Image still too large. Use a smaller photo."); return; }
        setFormData((prev) => ({ ...prev, image: dataUrl }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
  }
  function handleDrag(e) {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }

  /* ── step 1: validate form then open plan gate ── */
  function handleFormSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!formData.name.trim())     errs.name = "Title is required";
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0)
      errs.price = "Enter a valid price in ETB";
    if (!formData.description.trim()) errs.description = "Description is required";
    if (!formData.sellerPhone.trim()) errs.sellerPhone = "Phone number is required";
    if (Object.keys(errs).length) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    setSelectedPlan(null);
    setSelectedGw("telebirr");
    setPaymentRef("");
    setPayRefError("");
    setSubmitError("");
    setGateStep("plans");
  }

  /* ── step 2: user picked a plan ── */
  function handleSelectPlan(plan) {
    setSelectedPlan(plan);
    if (plan.price === 0) {
      // free plan — skip payment step, go straight to submitting
      setGateStep("submitting");
      doSubmit(plan, "free", "FREE");
    } else {
      setGateStep("pay");
    }
  }

  /* ── step 3: user clicked "I've Paid" ── */
  function handleConfirmPayment() {
    if (!paymentRef.trim()) { setPayRefError("Paste or type your transaction reference number."); return; }
    if (paymentRef.trim().length < 4) { setPayRefError("Reference is too short — copy it from your payment app."); return; }
    setPayRefError("");
    setGateStep("submitting");
    doSubmit(selectedPlan, selectedGw, paymentRef.trim());
  }

  /* ── actual API call ── */
  async function doSubmit(plan, gw, ref) {
    setSubmitError("");
    try {
      const result = await api.submitListing({
        plan: plan.key,
        paymentMethod: gw,
        paymentRef: ref,
        sellerPhone: formData.sellerPhone,
        product: {
          name: formData.name, category: formData.category,
          price: Number(formData.price), negotiable: formData.negotiable,
          condition: formData.condition, description: formData.description,
          image: formData.image || null, art: formData.art,
          color: formData.color, tint: formData.tint,
          location: { city: formData.city, subcity: formData.subcity },
          seller: {
            name: formData.sellerName || "Gedualpha Seller",
            phone: formData.sellerPhone,
            telegram: formData.sellerTelegram,
            whatsapp: formData.sellerWhatsapp,
          },
        },
      });
      setGateStep("success");
      setTimeout(() => navigate(`/product/${result.id}`), 2200);
    } catch (err) {
      setSubmitError(err.message || "Submission failed. Please try again.");
      setGateStep(plan.price === 0 ? "plans" : "pay");
    }
  }

  function copyAccount(text) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activePlan  = selectedPlan;
  const activeGw    = GATEWAYS.find((g) => g.key === selectedGw);

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="container sell-page-container">
      <div className="sell-page-header">
        <span className="sell-hero-badge">Gedualpha Verified Marketplace</span>
        <h1>Post Your Listing on Gedualpha Ecom</h1>
        <p>Reach thousands of buyers across Ethiopia — basic listing is free.</p>
      </div>

      <div className="sell-grid-layout">
        {/* ── Form Column ── */}
        <div className="sell-form-card">
          <form onSubmit={handleFormSubmit} noValidate>
            {errors.form && <div className="error-banner">{errors.form}</div>}

            {/* 1 · Category */}
            <div className="form-section">
              <label className="form-section-title">1. Select Category</label>
              <div className="category-select-grid">
                {CATEGORIES.map((cat) => (
                  <button key={cat.value} type="button"
                    className={`cat-select-btn ${formData.category === cat.value ? "active" : ""}`}
                    onClick={() => handleChange("category", cat.value)}>
                    <span className="cat-select-icon">{cat.icon}</span>
                    <span className="cat-select-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2 · Photo */}
            <div className="form-section">
              <div className="section-header-row">
                <label className="form-section-title">2. Upload Item Photos</label>
                <span className="section-badge-optional">Standard / Pro plan</span>
              </div>
              <p className="form-section-desc">Add real photos — attracts 5× more buyers. Available on Standard &amp; Pro plans.</p>
              {formData.image ? (
                <div className="uploaded-image-preview-box">
                  <div className="preview-image-container">
                    <img src={formData.image} alt="Preview" className="uploaded-thumb" />
                    <div className="preview-image-overlay">
                      <span className="preview-ready-badge">✓ Photo Ready</span>
                      <button type="button" className="btn-remove-photo"
                        onClick={() => setFormData((p) => ({ ...p, image: "" }))}>
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`image-upload-dropzone ${dragActive ? "drag-active" : ""}`}
                  onDragEnter={handleDrag} onDragOver={handleDrag}
                  onDragLeave={handleDrag} onDrop={handleDrop}>
                  <input type="file" id="product-image-upload" accept="image/png,image/jpeg,image/webp"
                    className="file-input-hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); }} />
                  <div className="dropzone-content">
                    <div className="upload-icon-circle">📸</div>
                    <h4>Upload Product Photo</h4>
                    <p>Drag &amp; drop or browse from your device</p>
                    <label htmlFor="product-image-upload" className="btn btn-accent btn-sm btn-browse-files">
                      📁 Browse Files
                    </label>
                    <span className="upload-help-text">JPG / PNG / WEBP — auto-optimised</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3 · Details */}
            <div className="form-section">
              <label className="form-section-title">3. Listing Details</label>
              <div className="field">
                <span>Item Title *</span>
                <input type="text" placeholder="e.g. iPhone 15 Pro Max 256GB"
                  value={formData.name} onChange={(e) => handleChange("name", e.target.value)}
                  aria-invalid={!!errors.name} />
                {errors.name && <em className="error">{errors.name}</em>}
              </div>
              <div className="fields-row">
                <div className="field">
                  <span>Price (ETB) *</span>
                  <input type="number" placeholder="e.g. 145000"
                    value={formData.price} onChange={(e) => handleChange("price", e.target.value)}
                    aria-invalid={!!errors.price} />
                  {errors.price && <em className="error">{errors.price}</em>}
                </div>
                <div className="field">
                  <span>Condition</span>
                  <select value={formData.condition} onChange={(e) => handleChange("condition", e.target.value)}>
                    {["Brand New","Like New","Used","Finished"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <label className="checkbox-field">
                <input type="checkbox" checked={formData.negotiable}
                  onChange={(e) => handleChange("negotiable", e.target.checked)} />
                <span>Price is Negotiable (ተደራዳሪ)</span>
              </label>
              <div className="field">
                <span>Description &amp; Specs *</span>
                <textarea rows="4" placeholder="Describe key features, specs, warranty, reason for selling…"
                  value={formData.description} onChange={(e) => handleChange("description", e.target.value)}
                  aria-invalid={!!errors.description}
                  style={{ padding:"0.75rem 1rem", borderRadius:"var(--radius-md)", border:"1.5px solid var(--border-card)", background:"var(--bg)", color:"var(--text-primary)", resize:"vertical", fontFamily:"inherit", fontSize:"0.9375rem", width:"100%" }} />
                {errors.description && <em className="error">{errors.description}</em>}
              </div>
            </div>

            {/* 4 · Location */}
            <div className="form-section">
              <label className="form-section-title">4. Item Location</label>
              <div className="fields-row">
                <div className="field">
                  <span>City</span>
                  <select value={formData.city} onChange={(e) => handleChange("city", e.target.value)}>
                    {locations.length > 0
                      ? locations.map((l) => <option key={l.city} value={l.city}>{l.city}</option>)
                      : <option value="Addis Ababa">Addis Ababa</option>}
                  </select>
                </div>
                <div className="field">
                  <span>Subcity / Area</span>
                  <select value={formData.subcity} onChange={(e) => handleChange("subcity", e.target.value)}>
                    {currentCityObj.subcities.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 5 · Theme */}
            <div className="form-section">
              <label className="form-section-title">5. Card Theme &amp; Icon</label>
              <div className="field">
                <span>Fallback Icon Shape</span>
                <select value={formData.art} onChange={(e) => handleChange("art", e.target.value)}>
                  {ART_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="field">
                <span>Theme Color</span>
                <div className="color-palette-picker">
                  {PRESET_COLORS.map((p) => (
                    <button key={p.color} type="button"
                      className={`color-bubble ${formData.color === p.color ? "active" : ""}`}
                      style={{ backgroundColor: p.color }}
                      onClick={() => setFormData((prev) => ({ ...prev, color: p.color, tint: p.tint }))}
                      title={p.label} />
                  ))}
                </div>
              </div>
            </div>

            {/* 6 · Contact */}
            <div className="form-section">
              <label className="form-section-title">6. Contact Information</label>
              <div className="field">
                <span>Your Name / Shop Name</span>
                <input type="text" placeholder="e.g. Abebe Kebede / Addis Electronics"
                  value={formData.sellerName} onChange={(e) => handleChange("sellerName", e.target.value)} />
              </div>
              <div className="fields-row">
                <div className="field">
                  <span>Phone Number *</span>
                  <input type="tel" placeholder="+251912627366"
                    value={formData.sellerPhone} onChange={(e) => handleChange("sellerPhone", e.target.value)}
                    aria-invalid={!!errors.sellerPhone} />
                  {errors.sellerPhone && <em className="error">{errors.sellerPhone}</em>}
                </div>
                <div className="field">
                  <span>Telegram Username</span>
                  <input type="text" placeholder="greatestvalue"
                    value={formData.sellerTelegram} onChange={(e) => handleChange("sellerTelegram", e.target.value)} />
                </div>
              </div>
              <div className="field">
                <span>WhatsApp Number</span>
                <input type="tel" placeholder="0941645784"
                  value={formData.sellerWhatsapp} onChange={(e) => handleChange("sellerWhatsapp", e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn btn-accent btn-wide"
              style={{ padding:"1rem", fontSize:"1.05rem", marginTop:"0.5rem" }}>
              🚀 Continue to Publish
            </button>
            <p style={{ textAlign:"center", fontSize:"0.8125rem", color:"var(--text-muted)", marginTop:"0.625rem" }}>
              Basic listing is free. Paid plans unlock photos &amp; featured placement.
            </p>
          </form>
        </div>

        {/* ── Live Preview Column ── */}
        <div className="sell-preview-sidebar">
          <div className="preview-sticky-card">
            <h3>Live Card Preview</h3>
            <p className="preview-sub">How your listing appears to buyers across Ethiopia.</p>
            <article className="card marketplace-card preview-card">
              <div className="card-art">
                <div className="card-art-inner">
                  {formData.image
                    ? <img src={formData.image} alt={formData.name || "Preview"} className="card-photo" />
                    : <ProductArt art={formData.art} color={formData.color} tint={formData.tint} />}
                </div>
                <span className="card-badge-condition">{formData.condition}</span>
              </div>
              <div className="card-body">
                <div className="card-meta-top">
                  <span className="card-cat-badge">{formData.category}</span>
                  <span className="card-location">📍 {formData.subcity}, {formData.city}</span>
                </div>
                <h4 className="card-title">{formData.name || "Item Title Goes Here"}</h4>
                <div className="price-sub">
                  <div className="price-group">
                    <span className="price">{formData.price ? money(formData.price) : "Br 0"}</span>
                    {formData.negotiable && <span className="tag-negotiable">Negotiable</span>}
                  </div>
                </div>
                <div className="card-footer-actions">
                  <button type="button" className="btn-card-call" disabled>📞 Call</button>
                  <button type="button" className="btn-card-tg"   disabled>✈️</button>
                  <button type="button" className="btn-add"       disabled>🛒 Order</button>
                </div>
              </div>
            </article>
            <div className="trust-tips-box">
              <h4>🛡️ Gedualpha Safe Selling Tips</h4>
              <ul>
                <li>Provide accurate condition &amp; details</li>
                <li>Never ask for prepaid advance without escrow</li>
                <li>Meet buyers in secure public locations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          PAYMENT GATE MODAL
          Steps: plans → pay → submitting → success
      ════════════════════════════════════════════════════════════════════ */}
      {gateStep !== null && (
        <div className="pg-scrim"
          onClick={() => { if (gateStep === "plans" || gateStep === "pay") setGateStep(null); }}>
          <div className="pg-modal" onClick={(e) => e.stopPropagation()}>

            {/* ── STEP: PLANS ── */}
            {gateStep === "plans" && (
              <>
                <div className="pg-modal-head">
                  <div>
                    <h2>Choose Your Posting Plan</h2>
                    <p>Pick a plan to publish your listing. Basic is always free.</p>
                  </div>
                  <button className="pg-close" onClick={() => setGateStep(null)} aria-label="Close">✕</button>
                </div>

                {submitError && (
                  <div className="pg-error-banner">⚠️ {submitError}</div>
                )}

                <div className="pg-plans-grid">
                  {PLANS.map((plan) => (
                    <div key={plan.key}
                      className={`pg-plan-card ${plan.key === "pro" ? "pg-plan-card--featured" : ""}`}
                      style={{ "--plan-color": plan.color, "--plan-accent": plan.accent }}>

                      {plan.badge && (
                        <div className="pg-plan-badge" style={{ background: plan.color }}>
                          {plan.badge}
                        </div>
                      )}

                      <div className="pg-plan-icon">
                        {plan.key === "basic" ? "🆓" : plan.key === "standard" ? "⭐" : "💎"}
                      </div>
                      <div className="pg-plan-name">{plan.name}</div>
                      <div className="pg-plan-price">
                        {plan.price === 0
                          ? <span className="pg-plan-price-free">Free</span>
                          : <><span className="pg-plan-price-val">{plan.price}</span><span className="pg-plan-price-cur"> ETB</span></>
                        }
                      </div>
                      <div className="pg-plan-posts">{plan.posts}</div>

                      <ul className="pg-plan-features">
                        {plan.features.map((f) => (
                          <li key={f} className={f.startsWith("✗") ? "pg-feat-no" : "pg-feat-yes"}>{f}</li>
                        ))}
                      </ul>

                      <button className="pg-plan-btn" style={{ background: plan.color }}
                        onClick={() => handleSelectPlan(plan)}>
                        {plan.price === 0 ? "Post for Free" : `Pay ${plan.priceLabel} & Publish`}
                      </button>
                    </div>
                  ))}
                </div>

                <p className="pg-footer-note">
                  💡 All paid plans are one-time fees per posting period. No recurring charges.
                </p>
              </>
            )}

            {/* ── STEP: PAY ── */}
            {gateStep === "pay" && activePlan && (
              <>
                <div className="pg-modal-head">
                  <div>
                    <h2>Complete Payment — {activePlan.name}</h2>
                    <p>Pay <strong>{activePlan.priceLabel}</strong> via any method below, then enter your reference.</p>
                  </div>
                  <button className="pg-close" onClick={() => setGateStep("plans")} aria-label="Back">←</button>
                </div>

                {submitError && <div className="pg-error-banner">⚠️ {submitError}</div>}

                {/* Gateway selector */}
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

                {/* Gateway detail card */}
                {activeGw && (
                  <div className="pg-gw-card" style={{ borderColor: activeGw.color + "44" }}>
                    <div className="pg-gw-card-head" style={{ background: activeGw.color + "12" }}>
                      <span className="pg-gw-icon">{activeGw.icon}</span>
                      <div>
                        <div className="pg-gw-name">{activeGw.name}</div>
                        <div className="pg-gw-amount">
                          Send exactly <strong style={{ color: activeGw.color }}>{activePlan.priceLabel}</strong>
                        </div>
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

                {/* Payment reference input */}
                <div className="pg-ref-section">
                  <label className="pg-ref-label">
                    Paste Your Transaction Reference Number
                  </label>
                  <p className="pg-ref-hint">
                    After payment, copy the transaction ID / reference from your payment app and paste it here.
                  </p>
                  <input
                    type="text"
                    className={`pg-ref-input ${payRefError ? "pg-ref-input--err" : ""}`}
                    placeholder="e.g. TXN-2024-ABCDE or CBE-1234567890"
                    value={paymentRef}
                    onChange={(e) => { setPaymentRef(e.target.value); setPayRefError(""); }}
                  />
                  {payRefError && <em className="pg-ref-error">{payRefError}</em>}
                </div>

                <div className="pg-pay-actions">
                  <button className="btn btn-ghost" onClick={() => setGateStep("plans")}>← Back to Plans</button>
                  <button className="btn btn-accent" style={{ minWidth: "200px" }}
                    onClick={handleConfirmPayment}>
                    ✓ I've Paid — Publish My Listing
                  </button>
                </div>

                <p className="pg-footer-note">
                  🔒 Your payment reference is verified by our admin team within 24 hours. Listings go live immediately and are reviewed shortly after.
                </p>
              </>
            )}

            {/* ── STEP: SUBMITTING ── */}
            {gateStep === "submitting" && (
              <div className="pg-status-box">
                <div className="pg-spinner" />
                <h3>Publishing Your Listing…</h3>
                <p>Please wait while we create your listing on Gedualpha Ecom.</p>
              </div>
            )}

            {/* ── STEP: SUCCESS ── */}
            {gateStep === "success" && (
              <div className="pg-status-box">
                <div className="pg-success-icon">🎉</div>
                <h3>Listing Published!</h3>
                <p>Your ad is now live on Gedualpha Ecom. Redirecting you to your listing…</p>
                <div className="pg-success-bar">
                  <div className="pg-success-bar-fill" />
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
