import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useUser } from "../UserContext.jsx";
import { money } from "../money.js";
import ProductArt from "../components/ProductArt.jsx";

const CATEGORIES = [
  { value: "electronics", label: "Electronics", icon: "📱", defaultArt: "phone" },
  { value: "vehicles",    label: "Vehicles",    icon: "🚗", defaultArt: "car" },
  { value: "property",   label: "Real Estate",  icon: "🏠", defaultArt: "apartment" },
  { value: "fashion",    label: "Fashion",      icon: "👗", defaultArt: "dress" },
  { value: "furniture",  label: "Furniture",    icon: "🛋️", defaultArt: "sofa" },
  { value: "stationery", label: "Stationery",   icon: "📚", defaultArt: "notebook" },
  { value: "services",   label: "Services",     icon: "💼", defaultArt: "desk" },
];

const BLANK = {
  name: "", category: "electronics", price: "", stock: 1,
  condition: "Brand New", negotiable: false, description: "",
  city: "Addis Ababa", subcity: "Bole",
  sellerPhone: "", sellerName: "", sellerTelegram: "", sellerWhatsapp: "",
};

/* ── Compact status pill ── */
function StatusPill({ stock, featured }) {
  if (stock === 0) return <span className="ml-status ml-status--out">Out of Stock</span>;
  if (featured)   return <span className="ml-status ml-status--featured">💎 Featured</span>;
  if (stock <= 3) return <span className="ml-status ml-status--low">{stock} left</span>;
  return <span className="ml-status ml-status--ok">{stock} in stock</span>;
}

/* ════════════════════════════════════════════════════════════════════ */
export default function MyListings() {
  const { user, token, openSignup } = useUser();
  const navigate = useNavigate();

  const [listings,  setListings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [notice,    setNotice]    = useState("");
  const [modal,     setModal]     = useState(null); // null | { mode:"edit"|"delete", product }
  const [form,      setForm]      = useState(BLANK);
  const [saving,    setSaving]    = useState(false);
  const [formErr,   setFormErr]   = useState({});

  /* Load listings */
  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  function load() {
    if (!user) return;
    setLoading(true);
    setError("");
    const ac = new AbortController();
    api.getMyListings(user.id, token, ac.signal)
      .then((d) => { setListings(d.items || []); setLoading(false); })
      .catch((e) => { if (e.name !== "AbortError") { setError(e.message); setLoading(false); } });
    return () => ac.abort();
  }

  function notify(msg) { setNotice(msg); setTimeout(() => setNotice(""), 4000); }

  /* Open edit modal */
  function openEdit(p) {
    setForm({
      name:           p.name        || "",
      category:       p.category    || "electronics",
      price:          p.price       || "",
      stock:          p.stock       ?? 1,
      condition:      p.condition   || "Brand New",
      negotiable:     Boolean(p.negotiable),
      description:    p.description || "",
      city:           p.location?.city    || "Addis Ababa",
      subcity:        p.location?.subcity || "Bole",
      sellerName:     p.seller?.name      || "",
      sellerPhone:    p.seller?.phone     || "",
      sellerTelegram: p.seller?.telegram  || "",
      sellerWhatsapp: p.seller?.whatsapp  || "",
    });
    setFormErr({});
    setModal({ mode: "edit", product: p });
  }

  /* Save edit */
  async function handleSave(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim())           errs.name  = "Title is required";
    if (!form.price || Number(form.price) <= 0) errs.price = "Enter a valid price";
    if (!form.description.trim())    errs.desc  = "Description is required";
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    setSaving(true);
    try {
      await api.updateMyProduct(modal.product.id, {
        ownerId:     user.id,
        name:        form.name.trim(),
        category:    form.category,
        price:       Number(form.price),
        stock:       Number(form.stock),
        condition:   form.condition,
        negotiable:  Boolean(form.negotiable),
        description: form.description.trim(),
        location:    { city: form.city, subcity: form.subcity },
        seller: {
          name:     form.sellerName,
          phone:    form.sellerPhone,
          telegram: form.sellerTelegram,
          whatsapp: form.sellerWhatsapp,
        },
      });
      notify("Listing updated successfully.");
      setModal(null);
      load();
    } catch (err) {
      setFormErr({ form: err.message });
    } finally {
      setSaving(false);
    }
  }

  /* Confirm delete */
  async function handleDelete() {
    setSaving(true);
    try {
      await api.deleteMyProduct(modal.product.id, user.id);
      notify(`"${modal.product.name}" has been deleted.`);
      setModal(null);
      load();
    } catch (err) {
      setFormErr({ form: err.message });
      setSaving(false);
    }
  }

  /* ── Gate: not logged in ── */
  if (!user) {
    return (
      <div className="ml-gate">
        <div className="ml-gate-card">
          <div className="ml-gate-icon">🏪</div>
          <h2>Sign In to View Your Listings</h2>
          <p>Log in with your Seller or Business account to manage your listings.</p>
          <button className="btn btn-accent" onClick={openSignup}>Sign In</button>
          <Link to="/" className="btn btn-ghost" style={{ marginTop: "0.5rem" }}>
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  /* ── Gate: buyers can't post ── */
  if (user.role === "buyer") {
    return (
      <div className="ml-gate">
        <div className="ml-gate-card">
          <div className="ml-gate-icon">🚫</div>
          <h2>Buyer Accounts Cannot Post Listings</h2>
          <p>You need a Seller or Business account to manage listings.</p>
          <Link to="/" className="btn btn-ghost">← Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════
     MAIN LAYOUT
  ════════════════════════════════════════════════════════════════════ */
  return (
    <div className="container ml-page">

      {/* Page header */}
      <div className="ml-page-head">
        <div>
          <h1>My Listings</h1>
          <p>{listings.length} active listing{listings.length !== 1 ? "s" : ""}</p>
        </div>
        <Link to="/sell" className="btn btn-accent">
          + Post New Listing
        </Link>
      </div>

      {/* Toast */}
      {notice && <div className="adm-toast">{notice}</div>}

      {/* Error */}
      {error && <div className="co-stock-warn" style={{ marginBottom: "1.25rem" }}>
        <div className="co-stock-warn-icon">⚠️</div>
        <div className="co-stock-warn-body"><div className="co-stock-warn-title">{error}</div></div>
      </div>}

      {/* Loading */}
      {loading && (
        <div className="mo-loading">
          <div className="mo-spinner" />
          <span>Loading your listings…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && listings.length === 0 && (
        <div className="mo-empty">
          <div className="mo-empty-icon">🏪</div>
          <h3>No listings yet</h3>
          <p>Post your first item and start selling across Ethiopia.</p>
          <Link to="/sell" className="btn btn-accent mt-4">Post Free Listing</Link>
        </div>
      )}

      {/* Grid */}
      {!loading && listings.length > 0 && (
        <div className="ml-grid">
          {listings.map((p) => (
            <div key={p.id} className="ml-card">

              {/* Thumbnail */}
              <div className="ml-card-thumb">
                {p.image
                  ? <img src={p.image} alt={p.name} />
                  : <ProductArt art={p.art} color={p.color} tint={p.tint} />}
                <StatusPill stock={p.stock} featured={p.featured} />
              </div>

              {/* Info */}
              <div className="ml-card-body">
                <div className="ml-card-cat">{p.category}</div>
                <h3 className="ml-card-name">
                  <Link to={`/product/${p.id}`} target="_blank">{p.name}</Link>
                </h3>
                <div className="ml-card-price">{money(p.price)}</div>
                <div className="ml-card-meta">
                  <span>📍 {p.location?.city}</span>
                  <span>👁 {p.views || 0} views</span>
                </div>
              </div>

              {/* Actions */}
              <div className="ml-card-actions">
                <button className="ml-btn-edit" onClick={() => openEdit(p)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
                <button className="ml-btn-del" onClick={() => { setFormErr({}); setModal({ mode: "delete", product: p }); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════ EDIT MODAL ════ */}
      {modal?.mode === "edit" && (
        <div className="modal-scrim" onClick={() => setModal(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>Edit Listing</h2>
              <button className="close-btn" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              {formErr.form && <div className="sp-err-banner">Warning: {formErr.form}</div>}

              <div className="field">
                <span>Title *</span>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. iPhone 15 Pro Max" />
                {formErr.name && <em className="error">{formErr.name}</em>}
              </div>

              <div className="fields-row">
                <div className="field">
                  <span>Category</span>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <span>Condition</span>
                  <select value={form.condition} onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}>
                    {["Brand New","Like New","Used","Under building","Finished"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="fields-row">
                <div className="field">
                  <span>Price (ETB) *</span>
                  <input type="number" min="1" value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
                  {formErr.price && <em className="error">{formErr.price}</em>}
                </div>
                <div className="field">
                  <span>Stock Qty</span>
                  <input type="number" min="0" value={form.stock}
                    onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
                </div>
              </div>

              <label className="checkbox-field">
                <input type="checkbox" checked={form.negotiable}
                  onChange={(e) => setForm((p) => ({ ...p, negotiable: e.target.checked }))} />
                Price Negotiable
              </label>

              <div className="field">
                <span>Description *</span>
                <textarea rows={3} value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  style={{ padding:"0.75rem", borderRadius:"var(--radius-md)", border:"1.5px solid var(--border-card)", background:"var(--bg)", color:"var(--text-primary)", resize:"vertical", fontFamily:"inherit", fontSize:"0.9375rem" }} />
                {formErr.desc && <em className="error">{formErr.desc}</em>}
              </div>

              <div className="fields-row">
                <div className="field"><span>City</span>
                  <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} /></div>
                <div className="field"><span>Subcity</span>
                  <input value={form.subcity} onChange={(e) => setForm((p) => ({ ...p, subcity: e.target.value }))} /></div>
              </div>

              <div className="fields-row">
                <div className="field"><span>Seller Phone</span>
                  <input value={form.sellerPhone} onChange={(e) => setForm((p) => ({ ...p, sellerPhone: e.target.value }))} /></div>
                <div className="field"><span>Seller Name</span>
                  <input value={form.sellerName} onChange={(e) => setForm((p) => ({ ...p, sellerName: e.target.value }))} /></div>
              </div>

              <div className="adm-modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-accent" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ DELETE CONFIRM MODAL ════ */}
      {modal?.mode === "delete" && (
        <div className="modal-scrim" onClick={() => setModal(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "420px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🗑️</div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Delete Listing?</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Are you sure you want to permanently delete<br />
              <strong>"{modal.product.name}"</strong>?<br />
              This action cannot be undone.
            </p>
            {formErr.form && <div className="sp-err-banner" style={{ marginBottom:"1rem" }}>Warning: {formErr.form}</div>}
            <div style={{ display:"flex", gap:"0.75rem", justifyContent:"center" }}>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn" disabled={saving}
                style={{ background:"#dc2626", color:"#fff" }}
                onClick={handleDelete}>
                {saving ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
