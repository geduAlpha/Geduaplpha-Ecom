import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useUser } from "../UserContext.jsx";
import { money } from "../money.js";
import ProductArt from "../components/ProductArt.jsx";
import { LineChart, CategoryBarChart } from "../components/Charts.jsx";

/* ── status colours ──────────────────────────────────────────────── */
const STATUS_META = {
  pending:    { label: "Pending",    color: "#eab308", bg: "#fefce8", icon: "⏳" },
  paid:       { label: "Paid",       color: "#16a34a", bg: "#f0fdf4", icon: "✅" },
  processing: { label: "Processing", color: "#0284c7", bg: "#f0f9ff", icon: "⚙️" },
  shipped:    { label: "Shipped",    color: "#7c3aed", bg: "#faf5ff", icon: "🚚" },
  delivered:  { label: "Delivered",  color: "#059669", bg: "#ecfdf5", icon: "📦" },
  cancelled:  { label: "Cancelled",  color: "#dc2626", bg: "#fef2f2", icon: "❌" },
};

const BIZ_CATEGORIES = [
  "Electronics","Vehicles","Real Estate","Fashion","Furniture",
  "Stationery","Services","Food & Beverage","Health & Beauty","Other",
];

const SIDEBAR_ITEMS = [
  { id: "overview",  label: "Overview",        icon: "📊" },
  { id: "listings",  label: "My Listings",      icon: "📦" },
  { id: "orders",    label: "Customer Orders",  icon: "💳" },
  { id: "profile",   label: "Business Profile", icon: "🏢" },
];

/* ════════════════════════════════════════════════════════════════════ */
export default function BusinessDashboard() {
  const { user, token, logout } = useUser();
  const navigate = useNavigate();

  const [activeTab,    setActiveTab]    = useState("overview");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [dashboard,    setDashboard]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [orders,       setOrders]       = useState([]);
  const [ordersTotal,  setOrdersTotal]  = useState(0);
  const [ordLoading,   setOrdLoading]   = useState(false);
  const [orderStatus,  setOrderStatus]  = useState("all");
  const [notice,       setNotice]       = useState("");
  const [profileForm,  setProfileForm]  = useState(null);
  const [profileSaving,setProfileSaving]= useState(false);
  const [profileErr,   setProfileErr]   = useState({});

  /* ── Gate: must be business role ── */
  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (user.role !== "business") { navigate("/"); return; }
    loadDashboard();
  }, [user]);

  useEffect(() => {
    if (activeTab === "orders" && user?.role === "business") loadOrders();
  }, [activeTab, orderStatus]);

  function notify(msg) { setNotice(msg); setTimeout(() => setNotice(""), 4000); }

  async function loadDashboard() {
    setLoading(true); setError("");
    try {
      const d = await api.businessDashboard(token);
      setDashboard(d);
      setProfileForm({
        name:             d.profile.name             || "",
        businessName:     d.profile.businessName     || "",
        businessCategory: d.profile.businessCategory || "",
        businessAddress:  d.profile.businessAddress  || "",
        businessPhone:    d.profile.businessPhone     || "",
      });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function loadOrders() {
    setOrdLoading(true);
    try {
      const d = await api.businessOrders(token, { status: orderStatus, limit: 50 });
      setOrders(d.orders || []);
      setOrdersTotal(d.total || 0);
    } catch (e) { setError(e.message); }
    finally { setOrdLoading(false); }
  }

  async function saveProfile(e) {
    e.preventDefault(); setProfileErr({});
    if (!profileForm.businessName?.trim()) { setProfileErr({ businessName: "Business name is required" }); return; }
    setProfileSaving(true);
    try {
      const res = await api.updateBusinessProfile(token, profileForm);
      notify("Business profile updated successfully.");
      setDashboard((d) => ({ ...d, profile: { ...d.profile, ...res.user } }));
    } catch (err) { setProfileErr({ form: err.message }); }
    finally { setProfileSaving(false); }
  }

  /* ── Not authenticated / wrong role ── */
  if (!user || user.role !== "business") return null;

  const stats   = dashboard?.stats   || {};
  const profile = dashboard?.profile || {};

  /* ════════════════════════════════════════════════════════════════════ */
  return (
    <div className="adm-shell bd-shell">

      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar bd-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="adm-sidebar-brand">
          <div className="adm-brand-icon" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
            {profile.businessName ? profile.businessName[0].toUpperCase() : "B"}
          </div>
          <div>
            <div className="adm-brand-name">{profile.businessName || user.name}</div>
            <div className="adm-brand-sub">Business Dashboard</div>
          </div>
        </div>

        <nav className="adm-sidebar-nav">
          {SIDEBAR_ITEMS.map((item) => (
            <button key={item.id}
              className={`adm-nav-item ${activeTab === item.id ? "active" : ""}`}
              style={activeTab === item.id ? { background: "#f5f3ff", color: "#7c3aed" } : {}}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
              <span className="adm-nav-icon">{item.icon}</span>
              <span className="adm-nav-label">{item.label}</span>
              {item.id === "listings" && dashboard && (
                <span className="adm-nav-badge" style={{ background: "#7c3aed" }}>{stats.totalProducts || 0}</span>
              )}
              {item.id === "orders" && dashboard && (
                <span className="adm-nav-badge" style={{ background: "#7c3aed" }}>{stats.totalOrders || 0}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <Link to="/sell" className="adm-sidebar-post-btn" style={{ background: "#7c3aed", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            + New Listing
          </Link>
          <button className="adm-sidebar-logout" onClick={() => { logout(); navigate("/"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="adm-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="adm-main">

        {/* Topbar */}
        <div className="adm-topbar">
          <button className="adm-topbar-menu" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="adm-topbar-title">
            {SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.icon}{" "}
            {SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.label}
          </div>
          <div className="adm-topbar-actions">
            <Link to="/sell" className="btn btn-sm" style={{ background: "#7c3aed", color: "#fff" }}>+ New Listing</Link>
            <div className="adm-topbar-avatar" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              {profile.businessName ? profile.businessName[0].toUpperCase() : "B"}
            </div>
          </div>
        </div>

        {/* Toast */}
        {notice && <div className="adm-toast" style={{ background: "#7c3aed" }}>{notice}</div>}

        {/* Error */}
        {error && <div className="adm-content" style={{ padding: "1.5rem" }}>
          <div className="co-stock-warn">
            <div className="co-stock-warn-icon">⚠️</div>
            <div className="co-stock-warn-body"><div className="co-stock-warn-title">{error}</div>
              <button className="co-stock-fix-btn" onClick={loadDashboard}>Retry</button>
            </div>
          </div>
        </div>}

        {loading && <div className="adm-content" style={{ padding: "3rem", display: "flex", justifyContent: "center" }}>
          <div className="mo-loading"><div className="mo-spinner" /><span>Loading dashboard…</span></div>
        </div>}

        {!loading && !error && dashboard && (
          <div className="adm-content">

            {/* ══════ OVERVIEW ══════ */}
            {activeTab === "overview" && (
              <div className="adm-tab-body">
                <div className="adm-section-head">
                  <div>
                    <h2>Business Overview</h2>
                    <p>Performance summary for {profile.businessName || user.name}</p>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={loadDashboard}>↻ Refresh</button>
                </div>

                {/* KPI Cards */}
                <div className="adm-kpi-grid">
                  {[
                    { icon: "💰", label: "Total Revenue",    value: money(stats.totalRevenue || 0),  sub: "From all non-cancelled orders",  bg: "#f5f3ff", color: "#7c3aed" },
                    { icon: "📋", label: "Total Orders",     value: stats.totalOrders    || 0,        sub: "Customer orders for your products", bg: "#eff6ff", color: "#2563eb" },
                    { icon: "📦", label: "Active Listings",  value: stats.totalProducts  || 0,        sub: "Products in marketplace",          bg: "#f0fdf4", color: "#16a34a" },
                    { icon: "👁️", label: "Total Views",      value: (stats.totalViews    || 0).toLocaleString(), sub: "Buyer impressions",  bg: "#fffbeb", color: "#d97706" },
                  ].map((k) => (
                    <div className="adm-kpi-card" key={k.label}>
                      <div className="adm-kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
                      <div className="adm-kpi-body">
                        <div className="adm-kpi-label">{k.label}</div>
                        <div className="adm-kpi-val">{k.value}</div>
                        <div className="adm-kpi-sub">{k.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order status breakdown */}
                <div className="adm-card">
                  <div className="adm-card-head"><h3>Orders by Status</h3></div>
                  <div className="adm-status-row">
                    {Object.entries(dashboard.statusCounts || {}).map(([s, n]) => (
                      <div className={`adm-status-pill ${s}`} key={s}>
                        <span style={{ textTransform: "capitalize" }}>{s}</span>
                        <strong>{n}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top products + recent orders */}
                <div className="adm-dual-grid">
                  <div className="adm-card">
                    <div className="adm-card-head">
                      <h3>Top Products by Views</h3>
                      <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab("listings")}>All Listings →</button>
                    </div>
                    {dashboard.topProducts?.length > 0 ? (
                      <div className="bd-top-products">
                        {dashboard.topProducts.map((p) => (
                          <div key={p.id} className="bd-top-product-row">
                            <div className="bd-top-thumb">
                              {p.image ? <img src={p.image} alt={p.name} /> : <ProductArt art={p.art} color={p.color} tint={p.tint} />}
                            </div>
                            <div className="bd-top-info">
                              <Link to={`/product/${p.id}`} target="_blank" className="bd-top-name">{p.name}</Link>
                              <span className="adm-cell-sub">{money(p.price)} · {p.views} views</span>
                            </div>
                            <span className={`adm-stock ${p.stock <= 2 ? "low" : "ok"}`}>{p.stock}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="adm-empty">No listings yet. <Link to="/sell" style={{ color: "#7c3aed" }}>Post one</Link></div>
                    )}
                  </div>

                  <div className="adm-card">
                    <div className="adm-card-head">
                      <h3>Recent Orders</h3>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setActiveTab("orders"); loadOrders(); }}>View All →</button>
                    </div>
                    {dashboard.recentOrders?.length > 0 ? (
                      <div className="adm-table-wrap">
                        <table className="adm-table">
                          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                          <tbody>
                            {dashboard.recentOrders.slice(0,6).map((o) => {
                              const sm = STATUS_META[o.status] || STATUS_META.pending;
                              return (
                                <tr key={o.id}>
                                  <td><strong>#{o.id?.slice(0,8)}</strong></td>
                                  <td>
                                    <div style={{ fontWeight:600 }}>{o.customer?.name}</div>
                                    <div className="adm-cell-sub">{o.customer?.city}</div>
                                  </td>
                                  <td><strong>{money(o.total)}</strong></td>
                                  <td>
                                    <span className="adm-badge-status" style={{ background: sm.bg, color: sm.color }}>
                                      {sm.label}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="adm-empty">No orders yet.</div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ══════ LISTINGS ══════ */}
            {activeTab === "listings" && (
              <div className="adm-tab-body">
                <div className="adm-section-head">
                  <div>
                    <h2>My Listings</h2>
                    <p>{stats.totalProducts || 0} active product{stats.totalProducts !== 1 ? "s" : ""}</p>
                  </div>
                  <Link to="/sell" className="btn btn-sm" style={{ background: "#7c3aed", color: "#fff" }}>+ New Listing</Link>
                </div>
                {dashboard.topProducts?.length === 0 ? (
                  <div className="mo-empty">
                    <div className="mo-empty-icon">📦</div>
                    <h3>No listings yet</h3>
                    <p>Post your first product to start selling.</p>
                    <Link to="/sell" className="btn btn-sm mt-4" style={{ background:"#7c3aed", color:"#fff" }}>Post Free Listing</Link>
                  </div>
                ) : (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Views</th><th>Actions</th></tr></thead>
                      <tbody>
                        {dashboard.topProducts.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <div className="adm-product-cell">
                                <div className="adm-thumb">
                                  {p.image ? <img src={p.image} alt={p.name} /> : <ProductArt art={p.art} color={p.color} tint={p.tint} />}
                                </div>
                                <div>
                                  <Link to={`/product/${p.id}`} target="_blank" className="adm-product-name">{p.name}</Link>
                                </div>
                              </div>
                            </td>
                            <td><span className="adm-badge-cat">{p.category}</span></td>
                            <td><strong>{money(p.price)}</strong></td>
                            <td><span className={`adm-stock ${p.stock <= 2 ? "low" : "ok"}`}>{p.stock}</span></td>
                            <td className="adm-cell-sub">👁 {p.views}</td>
                            <td>
                              <div className="adm-row-actions">
                                <Link to="/my-listings" className="adm-btn-edit" style={{ textDecoration:"none", display:"inline-flex", alignItems:"center" }}>
                                  Edit
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div style={{ textAlign:"center", marginTop:"1rem" }}>
                  <Link to="/my-listings" className="btn btn-ghost btn-sm">View and Manage All Listings →</Link>
                </div>
              </div>
            )}

            {/* ══════ ORDERS ══════ */}
            {activeTab === "orders" && (
              <div className="adm-tab-body">
                <div className="adm-section-head">
                  <div>
                    <h2>Customer Orders</h2>
                    <p>{ordersTotal} total orders for your products</p>
                  </div>
                </div>

                {/* Status tabs */}
                <div className="adm-filter-bar">
                  <div className="adm-status-tabs">
                    {["all","pending","paid","processing","shipped","delivered","cancelled"].map((s) => (
                      <button key={s}
                        className={`adm-status-tab ${orderStatus === s ? "active" : ""}`}
                        style={orderStatus === s ? { background: "#7c3aed", color: "#fff", borderColor: "#7c3aed" } : {}}
                        onClick={() => setOrderStatus(s)}>
                        {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={loadOrders}>↻ Refresh</button>
                </div>

                {ordLoading ? (
                  <div className="mo-loading"><div className="mo-spinner" /><span>Loading orders…</span></div>
                ) : orders.length === 0 ? (
                  <div className="adm-empty" style={{ padding: "3rem" }}>No orders found for this filter.</div>
                ) : (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {orders.map((o) => {
                          const sm = STATUS_META[o.status] || STATUS_META.pending;
                          // Only show items that belong to this business
                          return (
                            <tr key={o.id}>
                              <td><strong>#{o.id?.slice(0,8)}</strong></td>
                              <td>
                                <div style={{ fontWeight:600 }}>{o.customer?.name}</div>
                                <div className="adm-cell-sub">{o.customer?.postal}</div>
                              </td>
                              <td>
                                {o.items?.slice(0,2).map((it,i) => (
                                  <div key={i} className="adm-cell-sub">{it.name} ×{it.qty}</div>
                                ))}
                                {o.items?.length > 2 && <div className="adm-cell-sub">+{o.items.length-2} more</div>}
                              </td>
                              <td><strong>{money(o.total)}</strong></td>
                              <td>
                                <span className="adm-badge-gw">{o.paymentMethod || "—"}</span>
                                {o.paymentRef && <div className="adm-cell-sub" style={{ fontFamily:"monospace", fontSize:"0.75rem" }}>{o.paymentRef}</div>}
                              </td>
                              <td>
                                <span className="adm-badge-status" style={{ background: sm.bg, color: sm.color }}>
                                  {sm.icon} {sm.label}
                                </span>
                              </td>
                              <td className="adm-cell-sub">
                                {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-ET", { day:"numeric", month:"short" }) : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ══════ PROFILE ══════ */}
            {activeTab === "profile" && profileForm && (
              <div className="adm-tab-body">
                <div className="adm-section-head">
                  <div>
                    <h2>Business Profile</h2>
                    <p>Manage your store name, category and contact details.</p>
                  </div>
                </div>

                <div className="bd-profile-grid">
                  {/* Profile card */}
                  <div className="adm-card bd-profile-card">
                    <div className="bd-profile-avatar">
                      {profile.businessName ? profile.businessName[0].toUpperCase() : "B"}
                    </div>
                    <div className="bd-profile-name">{profile.businessName || user.name}</div>
                    {profile.businessCategory && <div className="bd-profile-cat">{profile.businessCategory}</div>}
                    <div className="bd-profile-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="13" height="13"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Business Account
                    </div>
                    {profile.businessAddress && <div className="bd-profile-address">📍 {profile.businessAddress}</div>}
                    {(profile.businessPhone || profile.email) && (
                      <div className="bd-profile-contacts">
                        {profile.businessPhone && <span>📞 {profile.businessPhone}</span>}
                        <span>✉ {profile.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Edit form */}
                  <div className="adm-card">
                    <div className="adm-card-head"><h3>Edit Profile</h3></div>
                    <form onSubmit={saveProfile} style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                      {profileErr.form && <div className="sp-err-banner">Warning: {profileErr.form}</div>}

                      <div className="field">
                        <span>Owner Full Name</span>
                        <input value={profileForm.name}
                          onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Your name" />
                      </div>

                      <div className="field">
                        <span>Business Name *</span>
                        <input value={profileForm.businessName}
                          onChange={(e) => setProfileForm((p) => ({ ...p, businessName: e.target.value }))}
                          placeholder="e.g. Addis Electronics Store" />
                        {profileErr.businessName && <em className="error">{profileErr.businessName}</em>}
                      </div>

                      <div className="field">
                        <span>Business Category</span>
                        <select value={profileForm.businessCategory}
                          onChange={(e) => setProfileForm((p) => ({ ...p, businessCategory: e.target.value }))}>
                          <option value="">Select category</option>
                          {BIZ_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div className="fields-row">
                        <div className="field">
                          <span>Business Address</span>
                          <input value={profileForm.businessAddress}
                            onChange={(e) => setProfileForm((p) => ({ ...p, businessAddress: e.target.value }))}
                            placeholder="e.g. Bole, Addis Ababa" />
                        </div>
                        <div className="field">
                          <span>Business Phone</span>
                          <input value={profileForm.businessPhone}
                            onChange={(e) => setProfileForm((p) => ({ ...p, businessPhone: e.target.value }))}
                            placeholder="+251..." />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-sm" style={{ background:"#7c3aed", color:"#fff", alignSelf:"flex-start" }}
                        disabled={profileSaving}>
                        {profileSaving ? "Saving…" : "Save Changes"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
