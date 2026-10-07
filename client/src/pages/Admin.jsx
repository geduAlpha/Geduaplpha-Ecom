import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { money } from "../money.js";
import ProductArt from "../components/ProductArt.jsx";
import { getAdminAuth, setAdminAuth } from "../components/Header.jsx";

/* ── Category & status config ───────────────────────────────────────── */
const CATEGORIES = [
  { value: "electronics", label: "Electronics & Phones", icon: "📱", defaultArt: "phone" },
  { value: "vehicles",    label: "Vehicles & Auto",       icon: "🚗", defaultArt: "car" },
  { value: "property",   label: "Real Estate",            icon: "🏠", defaultArt: "apartment" },
  { value: "fashion",    label: "Fashion & Beauty",       icon: "👗", defaultArt: "dress" },
  { value: "furniture",  label: "Home & Furniture",       icon: "🛋️", defaultArt: "sofa" },
  { value: "stationery", label: "Desk & Stationery",      icon: "📚", defaultArt: "notebook" },
  { value: "services",   label: "Services & Jobs",        icon: "💼", defaultArt: "desk" },
];

const ORDER_STATUSES = ["pending","paid","processing","shipped","delivered","cancelled"];
const STATUS_META = {
  pending:    { label: "Pending",    color: "#eab308", bg: "#fefce8" },
  paid:       { label: "Paid",       color: "#16a34a", bg: "#f0fdf4" },
  processing: { label: "Processing", color: "#0284c7", bg: "#f0f9ff" },
  shipped:    { label: "Shipped",    color: "#7c3aed", bg: "#faf5ff" },
  delivered:  { label: "Delivered",  color: "#059669", bg: "#ecfdf5" },
  cancelled:  { label: "Cancelled",  color: "#dc2626", bg: "#fef2f2" },
};

const SIDEBAR_ITEMS = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "products",  icon: "📦", label: "Products" },
  { id: "orders",    icon: "💳", label: "Orders" },
  { id: "gateways",  icon: "⚙️", label: "Gateways" },
];

/* ── Blank product form ─────────────────────────────────────────────── */
const BLANK_FORM = {
  name: "", category: "electronics", price: "", stock: 1,
  condition: "Brand New", negotiable: false, featured: false,
  image: "", art: "phone", color: "#2563EB", tint: "#EFF6FF",
  description: "", city: "Addis Ababa", subcity: "Bole",
  sellerName: "Gedualpha Admin Store", sellerPhone: "+251912627366",
  sellerTelegram: "greatestvalue", sellerWhatsapp: "0941645784",
};

/* ════════════════════════════════════════════════════════════════════ */
export default function Admin() {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(getAdminAuth);

  /* tabs */
  const [activeTab, setActiveTab] = useState("dashboard");

  /* data */
  const [stats,         setStats]         = useState(null);
  const [statsLoading,  setStatsLoading]  = useState(true);
  const [products,      setProducts]      = useState([]);
  const [productTotal,  setProductTotal]  = useState(0);
  const [prodSearch,    setProdSearch]    = useState("");
  const [prodCategory,  setProdCategory]  = useState("all");
  const [prodLoading,   setProdLoading]   = useState(false);
  const [orders,        setOrders]        = useState([]);
  const [orderTotal,    setOrderTotal]    = useState(0);
  const [orderSearch,   setOrderSearch]   = useState("");
  const [orderStatus,   setOrderStatus]   = useState("all");
  const [orderLoading,  setOrderLoading]  = useState(false);

  /* modals */
  const [productModal, setProductModal] = useState({ open: false, mode: "add", data: null });
  const [orderModal,   setOrderModal]   = useState({ open: false, data: null });
  const [modalLoading, setModalLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [prodForm,     setProdForm]     = useState(BLANK_FORM);

  /* sidebar collapse on mobile */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Boot ── */
  useEffect(() => {
    if (!isAuth) return;
    loadStats();
  }, [isAuth]);

  useEffect(() => {
    if (!isAuth) return;
    if (activeTab === "products") loadProducts();
    if (activeTab === "orders")   loadOrders();
  }, [isAuth, activeTab]);

  function notify(msg) {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(""), 4000);
  }

  /* ── Auth ── */
  function handleLogout() {
    setAdminAuth(false);
    setIsAuth(false);
    navigate("/");
  }

  /* ── Data loaders ── */
  async function loadStats() {
    setStatsLoading(true);
    try { const r = await api.adminStats(); setStats(r); }
    catch (e) { console.error(e); }
    finally { setStatsLoading(false); }
  }

  async function loadProducts() {
    setProdLoading(true);
    try {
      const r = await api.adminProducts({ q: prodSearch, category: prodCategory, limit: 100 });
      setProducts(r.items || []);
      setProductTotal(r.total || 0);
    } catch (e) { console.error(e); }
    finally { setProdLoading(false); }
  }

  async function loadOrders() {
    setOrderLoading(true);
    try {
      const r = await api.adminOrders({ q: orderSearch, status: orderStatus, limit: 100 });
      setOrders(r.items || []);
      setOrderTotal(r.total || 0);
    } catch (e) { console.error(e); }
    finally { setOrderLoading(false); }
  }

  /* ── Product CRUD ── */
  function openAddModal() {
    setProdForm({ ...BLANK_FORM });
    setProductModal({ open: true, mode: "add", data: null });
  }

  function openEditModal(p) {
    setProdForm({
      id: p.id, name: p.name || "", category: p.category || "electronics",
      price: p.price || "", stock: p.stock ?? 1, condition: p.condition || "Brand New",
      negotiable: Boolean(p.negotiable), featured: Boolean(p.featured),
      image: p.image || "", art: p.art || "phone", color: p.color || "#2563EB",
      tint: p.tint || "#EFF6FF", description: p.description || "",
      city: p.location?.city || "Addis Ababa", subcity: p.location?.subcity || "Bole",
      sellerName: p.seller?.name || "", sellerPhone: p.seller?.phone || "",
      sellerTelegram: p.seller?.telegram || "", sellerWhatsapp: p.seller?.whatsapp || "",
    });
    setProductModal({ open: true, mode: "edit", data: p });
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
        if (dataUrl.length > MAX) { alert("Image too large after compression. Use a smaller photo."); return; }
        setProdForm((prev) => ({ ...prev, image: dataUrl }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    if (!prodForm.name.trim() || !prodForm.price) { alert("Title and price are required."); return; }
    setModalLoading(true);
    const payload = {
      name: prodForm.name.trim(), category: prodForm.category,
      price: Number(prodForm.price), stock: Number(prodForm.stock),
      condition: prodForm.condition, negotiable: Boolean(prodForm.negotiable),
      featured: Boolean(prodForm.featured), image: prodForm.image || null,
      art: prodForm.art, color: prodForm.color, tint: prodForm.tint,
      description: prodForm.description.trim(),
      location: { city: prodForm.city, subcity: prodForm.subcity },
      seller: { name: prodForm.sellerName, phone: prodForm.sellerPhone,
                telegram: prodForm.sellerTelegram, whatsapp: prodForm.sellerWhatsapp },
    };
    try {
      if (productModal.mode === "add") {
        await api.adminCreateProduct(payload);
        notify("🎉 New listing created!");
      } else {
        await api.adminUpdateProduct(prodForm.id, payload);
        notify("✓ Listing updated!");
      }
      setProductModal({ open: false, mode: "add", data: null });
      loadProducts(); loadStats();
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDeleteProduct(id, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await api.adminDeleteProduct(id); notify(`🗑️ Deleted "${name}"`); loadProducts(); loadStats(); }
    catch (err) { alert("Delete failed: " + err.message); }
  }

  async function handleToggleFeatured(p) {
    try {
      await api.adminUpdateProduct(p.id, { featured: !p.featured });
      notify(`${!p.featured ? "💎 Marked featured" : "Removed featured"}: ${p.name}`);
      loadProducts();
    } catch (err) { alert("Update failed: " + err.message); }
  }

  /* ── Order CRUD ── */
  async function handleQuickOrderStatus(orderId, newStatus) {
    try {
      await api.adminUpdateOrder(orderId, { status: newStatus });
      notify(`✓ Order #${orderId} → ${newStatus.toUpperCase()}`);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      loadStats();
    } catch (err) { alert("Update failed: " + err.message); }
  }

  async function handleDeleteOrder(id) {
    if (!confirm(`Delete order #${id}?`)) return;
    try { await api.adminDeleteOrder(id); notify(`🗑️ Order #${id} deleted.`); loadOrders(); loadStats(); }
    catch (err) { alert("Failed: " + err.message); }
  }

  async function handleSaveOrder(e) {
    e.preventDefault();
    if (!orderModal.data) return;
    setModalLoading(true);
    try {
      await api.adminUpdateOrder(orderModal.data.id, {
        status: orderModal.data.status, paymentMethod: orderModal.data.paymentMethod,
        paymentRef: orderModal.data.paymentRef, notes: orderModal.data.notes,
      });
      notify(`✓ Order #${orderModal.data.id} saved.`);
      setOrderModal({ open: false, data: null });
      loadOrders(); loadStats();
    } catch (err) { alert("Failed: " + err.message); }
    finally { setModalLoading(false); }
  }

  /* ── Not authed → show login prompt ── */
  if (!isAuth) {
    return (
      <div className="adm-gate">
        <div className="adm-gate-card">
          <div className="adm-gate-glow" />
          <div className="adm-gate-icon">🛡️</div>
          <h1>Gedualpha Admin</h1>
          <p>You need to be signed in as an admin to access this panel.</p>
          <Link to="/" className="btn btn-ghost btn-wide" style={{ marginTop: "0.5rem" }}>
            ← Back to Store
          </Link>
          <div className="adm-gate-hint">
            Use the <strong>Admin</strong> button in the header to sign in.
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════
     MAIN ADMIN LAYOUT
  ════════════════════════════════════════════════════════════════════ */
  return (
    <div className="adm-shell">

      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="adm-sidebar-brand">
          <div className="adm-brand-icon">G</div>
          <div>
            <div className="adm-brand-name">Gedualpha</div>
            <div className="adm-brand-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="adm-sidebar-nav">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`adm-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            >
              <span className="adm-nav-icon">{item.icon}</span>
              <span className="adm-nav-label">{item.label}</span>
              {item.id === "products" && stats && (
                <span className="adm-nav-badge">{stats.totalProducts}</span>
              )}
              {item.id === "orders" && stats && (
                <span className="adm-nav-badge">{stats.totalOrders}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <button className="adm-sidebar-post-btn" onClick={openAddModal}>
            <span>＋</span> New Listing
          </button>
          <button className="adm-sidebar-logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar backdrop on mobile */}
      {sidebarOpen && (
        <div className="adm-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main content ── */}
      <div className="adm-main">

        {/* Top bar */}
        <div className="adm-topbar">
          <button className="adm-topbar-menu" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="adm-topbar-title">
            {SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.icon}{" "}
            {SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.label}
          </div>

          <div className="adm-topbar-actions">
            <button className="btn btn-accent btn-sm" onClick={openAddModal}>
              ➕ Add Listing
            </button>
            <div className="adm-topbar-avatar">G</div>
          </div>
        </div>

        {/* Toast */}
        {actionNotice && (
          <div className="adm-toast">{actionNotice}</div>
        )}

        {/* ── Content area ── */}
        <div className="adm-content">

          {/* ════ DASHBOARD ════ */}
          {activeTab === "dashboard" && (
            <div className="adm-tab-body">
              <div className="adm-section-head">
                <div>
                  <h2>Overview</h2>
                  <p>Real-time snapshot of your marketplace.</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={loadStats}>↻ Refresh</button>
              </div>

              {/* KPI grid */}
              <div className="adm-kpi-grid">
                {[
                  { icon: "💵", label: "Total Revenue", value: stats ? money(stats.totalRevenue) : "…", sub: "All paid orders", bg: "#ecfdf5", color: "#059669" },
                  { icon: "🛒", label: "Total Orders",   value: stats?.totalOrders ?? "…",   sub: `${stats?.statusCounts?.pending ?? 0} pending`, bg: "#eff6ff", color: "#2563eb" },
                  { icon: "📦", label: "Active Listings",value: stats?.totalProducts ?? "…",  sub: stats?.lowStockCount ? `⚠️ ${stats.lowStockCount} low stock` : "All in stock", bg: "#fdf4ff", color: "#9333ea" },
                  { icon: "👁️", label: "Product Views",  value: stats?.totalViews ?? "…",     sub: "Buyer impressions", bg: "#fffbeb", color: "#d97706" },
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

              {/* Status breakdown */}
              <div className="adm-card">
                <div className="adm-card-head"><h3>Orders by Status</h3></div>
                <div className="adm-status-row">
                  {ORDER_STATUSES.map((s) => (
                    <div className={`adm-status-pill ${s}`} key={s}>
                      <span>{STATUS_META[s].label}</span>
                      <strong>{stats?.statusCounts?.[s] ?? 0}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent orders + quick actions */}
              <div className="adm-dual-grid">
                <div className="adm-card">
                  <div className="adm-card-head">
                    <h3>Recent Orders</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setActiveTab("orders"); loadOrders(); }}>View All →</button>
                  </div>
                  {stats?.recentOrders?.length > 0 ? (
                    <div className="adm-table-wrap">
                      <table className="adm-table">
                        <thead><tr>
                          <th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th></th>
                        </tr></thead>
                        <tbody>
                          {stats.recentOrders.map((o) => (
                            <tr key={o.id}>
                              <td><strong>#{o.id?.slice(0,8)}</strong></td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{o.customer?.name}</div>
                                <div className="adm-cell-sub">{o.customer?.city}</div>
                              </td>
                              <td><strong>{money(o.total)}</strong></td>
                              <td><span className={`adm-badge-status ${o.status}`}>{o.status}</span></td>
                              <td>
                                <button className="adm-btn-view" onClick={() => setOrderModal({ open: true, data: o })}>View</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="adm-empty">No orders yet.</div>
                  )}
                </div>

                <div className="adm-card">
                  <div className="adm-card-head"><h3>⚡ Quick Actions</h3></div>
                  <div className="adm-quick-tiles">
                    {[
                      { icon: "➕", title: "Add New Listing",      sub: "Upload photos, set price & location", action: openAddModal },
                      { icon: "📦", title: "Manage Products",       sub: "Edit stock, pricing, and categories",  action: () => { setActiveTab("products"); loadProducts(); } },
                      { icon: "💳", title: "Process Orders",        sub: "Mark Telebirr & CBE payments as paid", action: () => { setActiveTab("orders"); loadOrders(); } },
                    ].map((t) => (
                      <button key={t.title} className="adm-quick-tile" onClick={t.action}>
                        <span className="adm-quick-tile-icon">{t.icon}</span>
                        <div>
                          <strong>{t.title}</strong>
                          <p>{t.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {stats?.lowStockProducts?.length > 0 && (
                    <div className="adm-low-stock">
                      <h4>⚠️ Low Stock (≤ 3 left)</h4>
                      {stats.lowStockProducts.map((p) => (
                        <div key={p.id} className="adm-low-stock-row">
                          <span>{p.name}</span>
                          <strong style={{ color: "#dc2626" }}>{p.stock} left</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════ PRODUCTS ════ */}
          {activeTab === "products" && (
            <div className="adm-tab-body">
              <div className="adm-section-head">
                <div>
                  <h2>Products & Listings</h2>
                  <p>{productTotal} listings in the marketplace.</p>
                </div>
                <button className="btn btn-accent btn-sm" onClick={openAddModal}>➕ Add Product</button>
              </div>

              <div className="adm-filter-bar">
                <div className="adm-search-wrap">
                  <span>🔍</span>
                  <input
                    type="text"
                    placeholder="Search by title or ID…"
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadProducts()}
                  />
                </div>
                <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                </select>
                <button className="btn btn-ghost btn-sm" onClick={loadProducts}>Filter</button>
              </div>

              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr>
                    <th>Product</th><th>Category</th><th>Price</th><th>Stock</th>
                    <th>Condition</th><th>Views</th><th>Featured</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {prodLoading ? (
                      <tr><td colSpan="8" className="adm-empty">Loading…</td></tr>
                    ) : products.length === 0 ? (
                      <tr><td colSpan="8" className="adm-empty">No products found.</td></tr>
                    ) : products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="adm-product-cell">
                            <div className="adm-thumb">
                              {p.image
                                ? <img src={p.image} alt={p.name} />
                                : <ProductArt art={p.art} color={p.color} tint={p.tint} />}
                            </div>
                            <div>
                              <Link to={`/product/${p.id}`} target="_blank" className="adm-product-name">{p.name}</Link>
                              <span className="adm-cell-sub">ID: {p.id?.slice(0,18)}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="adm-badge-cat">{p.category}</span></td>
                        <td>
                          <strong>{money(p.price)}</strong>
                          {p.negotiable && <span className="adm-neg-tag">Neg</span>}
                        </td>
                        <td>
                          <span className={`adm-stock ${p.stock <= 2 ? "low" : "ok"}`}>{p.stock}</span>
                        </td>
                        <td className="adm-cell-sub">{p.condition}</td>
                        <td className="adm-cell-sub">👁 {p.views || 0}</td>
                        <td>
                          <button
                            className={`adm-featured-btn ${p.featured ? "on" : ""}`}
                            onClick={() => handleToggleFeatured(p)}
                          >
                            {p.featured ? "💎 Boosted" : "☆ Standard"}
                          </button>
                        </td>
                        <td>
                          <div className="adm-row-actions">
                            <button className="adm-btn-edit" onClick={() => openEditModal(p)}>✏️ Edit</button>
                            <button className="adm-btn-del"  onClick={() => handleDeleteProduct(p.id, p.name)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ ORDERS ════ */}
          {activeTab === "orders" && (
            <div className="adm-tab-body">
              <div className="adm-section-head">
                <div>
                  <h2>Orders & Transactions</h2>
                  <p>{orderTotal} total orders placed.</p>
                </div>
              </div>

              <div className="adm-filter-bar">
                <div className="adm-search-wrap">
                  <span>🔍</span>
                  <input
                    type="text"
                    placeholder="Search by order ID, customer, email…"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadOrders()}
                  />
                </div>
                <div className="adm-status-tabs">
                  {["all", ...ORDER_STATUSES].map((s) => (
                    <button
                      key={s}
                      className={`adm-status-tab ${orderStatus === s ? "active" : ""}`}
                      onClick={() => { setOrderStatus(s); }}
                      style={orderStatus === s && s !== "all" ? { background: STATUS_META[s]?.bg, color: STATUS_META[s]?.color, borderColor: STATUS_META[s]?.color } : {}}
                    >
                      {s === "all" ? "All" : STATUS_META[s].label}
                    </button>
                  ))}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={loadOrders}>Filter</button>
              </div>

              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr>
                    <th>Order ID</th><th>Customer</th><th>Items</th>
                    <th>Total</th><th>Gateway</th><th>Status</th><th>Date</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {orderLoading ? (
                      <tr><td colSpan="8" className="adm-empty">Loading…</td></tr>
                    ) : orders.length === 0 ? (
                      <tr><td colSpan="8" className="adm-empty">No orders found.</td></tr>
                    ) : orders.map((o) => (
                      <tr key={o.id}>
                        <td><strong>#{o.id?.slice(0,10)}</strong></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{o.customer?.name}</div>
                          <div className="adm-cell-sub">{o.customer?.phone}</div>
                        </td>
                        <td>
                          {o.items?.slice(0,2).map((it, i) => (
                            <div key={i} className="adm-cell-sub">{it.name} ×{it.qty}</div>
                          ))}
                          {o.items?.length > 2 && <div className="adm-cell-sub">+{o.items.length - 2} more</div>}
                        </td>
                        <td><strong>{money(o.total)}</strong></td>
                        <td><span className="adm-badge-gw">{o.paymentMethod || "—"}</span></td>
                        <td>
                          <select
                            className={`adm-status-select ${o.status}`}
                            value={o.status || "pending"}
                            onChange={(e) => handleQuickOrderStatus(o.id, e.target.value)}
                          >
                            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="adm-cell-sub">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                        <td>
                          <div className="adm-row-actions">
                            <button className="adm-btn-view" onClick={() => setOrderModal({ open: true, data: { ...o } })}>View</button>
                            <button className="adm-btn-del"  onClick={() => handleDeleteOrder(o.id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ GATEWAYS ════ */}
          {activeTab === "gateways" && (
            <div className="adm-tab-body">
              <div className="adm-section-head">
                <div>
                  <h2>Payment Gateways</h2>
                  <p>Active payment methods configured for this store.</p>
                </div>
              </div>

              <div className="adm-gw-grid">
                {[
                  { icon: "📱", name: "Telebirr", provider: "Ethio Telecom",  status: "Live", color: "#16a34a",
                    fields: [["Merchant Number", "+251 912 627 366"], ["Account Name", "Gedualpha Store"], ["Reference", "GEDUALPHA"]] },
                  { icon: "🏦", name: "CBE Birr",  provider: "Commercial Bank", status: "Live", color: "#2563eb",
                    fields: [["Account No.", "1000581512308"], ["Account Name", "Gedualpha PLC"], ["Branch", "Bole Branch"]] },
                  { icon: "💳", name: "Chapa",     provider: "Chapa Payment",   status: "Live", color: "#7c3aed",
                    fields: [["API Status", "Connected"], ["Mode", "Production"], ["Currency", "ETB"]] },
                ].map((gw) => (
                  <div className="adm-gw-card" key={gw.name}>
                    <div className="adm-gw-head">
                      <span className="adm-gw-icon">{gw.icon}</span>
                      <div>
                        <div className="adm-gw-name">{gw.name}</div>
                        <div className="adm-gw-provider">{gw.provider}</div>
                      </div>
                      <span className="adm-gw-live" style={{ background: `${gw.color}18`, color: gw.color }}>
                        ● {gw.status}
                      </span>
                    </div>
                    <div className="adm-gw-fields">
                      {gw.fields.map(([label, val]) => (
                        <div className="adm-gw-field" key={label}>
                          <span>{label}</span>
                          <strong>{val}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>{/* end adm-content */}
      </div>{/* end adm-main */}


      {/* ════ PRODUCT MODAL ════ */}
      {productModal.open && (
        <div className="modal-scrim" onClick={() => setProductModal({ open: false, mode: "add", data: null })}>
          <div className="apm-modal" onClick={(e) => e.stopPropagation()}>

            {/* ── Header ── */}
            <div className="apm-header">
              <div className="apm-header-left">
                <div className="apm-header-icon">
                  {productModal.mode === "add" ? "📦" : "✏️"}
                </div>
                <div>
                  <h2 className="apm-title">
                    {productModal.mode === "add" ? "Submit a Product" : "Edit Listing"}
                  </h2>
                  <p className="apm-subtitle">
                    {productModal.mode === "add"
                      ? "Fill in the details below to add a new listing"
                      : "Update the product information below"}
                  </p>
                </div>
              </div>
              <button className="apm-close" onClick={() => setProductModal({ open: false, mode: "add", data: null })} aria-label="Close">✕</button>
            </div>

            <form className="apm-form" onSubmit={handleSaveProduct} noValidate>

              {/* ── Product Name ── */}
              <div className="apm-field">
                <label className="apm-label">Product Name <span className="apm-req">*</span></label>
                <input
                  className="apm-input"
                  type="text"
                  placeholder="e.g. iPhone 14 Pro Max 256GB"
                  value={prodForm.name}
                  onChange={(e) => setProdForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              {/* ── Product Category ── */}
              <div className="apm-field">
                <label className="apm-label">Product Category <span className="apm-req">*</span></label>
                <div className="apm-select-wrap">
                  <select
                    className="apm-select"
                    value={prodForm.category}
                    onChange={(e) => setProdForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option value="" disabled>Please Select</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Product Freshness (radio) ── */}
              <div className="apm-field">
                <label className="apm-label">Product Freshness</label>
                <div className="apm-radio-group">
                  {["Brand New", "Second Hand", "Refurbished", "Under building", "Finished"].map((cond) => (
                    <label key={cond} className={`apm-radio-card ${prodForm.condition === cond ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="condition"
                        value={cond}
                        checked={prodForm.condition === cond}
                        onChange={() => setProdForm((p) => ({ ...p, condition: cond }))}
                      />
                      <span className="apm-radio-dot" />
                      <span>{cond}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Image of Product ── */}
              <div className="apm-field">
                <label className="apm-label">Image of Product</label>
                {prodForm.image ? (
                  <div className="apm-image-preview">
                    <img src={prodForm.image} alt="Product preview" />
                    <div className="apm-image-overlay">
                      <span className="apm-image-ready">✓ Image Ready</span>
                      <button
                        type="button"
                        className="apm-image-remove"
                        onClick={() => setProdForm((p) => ({ ...p, image: "" }))}
                      >
                        🗑 Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="apm-dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleImageFile(e.target.files?.[0])}
                    />
                    <div className="apm-dropzone-inner">
                      <svg className="apm-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 16 12 12 8 16"/>
                        <line x1="12" y1="12" x2="12" y2="21"/>
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                      </svg>
                      <span className="apm-dropzone-title">Upload a File</span>
                      <span className="apm-dropzone-sub">Drag and drop files here</span>
                    </div>
                  </label>
                )}
              </div>

              {/* ── Additional Description ── */}
              <div className="apm-field">
                <label className="apm-label">Additional Description <span className="apm-req">*</span></label>
                <textarea
                  className="apm-textarea"
                  rows={4}
                  placeholder="Describe specifications, warranty, reason for selling, any defects…"
                  value={prodForm.description}
                  onChange={(e) => setProdForm((p) => ({ ...p, description: e.target.value }))}
                  required
                />
              </div>

              {/* ── Product Price ── */}
              <div className="apm-field">
                <label className="apm-label">Product Price (ETB) <span className="apm-req">*</span></label>
                <div className="apm-price-wrap">
                  <span className="apm-price-prefix">Br</span>
                  <input
                    className="apm-input apm-input--price"
                    type="number"
                    min="1"
                    placeholder="ex: 85,000"
                    value={prodForm.price}
                    onChange={(e) => setProdForm((p) => ({ ...p, price: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* ── Comments / Notes row ── */}
              <div className="apm-row">
                <div className="apm-field">
                  <label className="apm-label">Stock Qty</label>
                  <input
                    className="apm-input"
                    type="number"
                    min="0"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm((p) => ({ ...p, stock: e.target.value }))}
                  />
                </div>
                <div className="apm-field">
                  <label className="apm-label">City</label>
                  <input
                    className="apm-input"
                    placeholder="Addis Ababa"
                    value={prodForm.city}
                    onChange={(e) => setProdForm((p) => ({ ...p, city: e.target.value }))}
                  />
                </div>
                <div className="apm-field">
                  <label className="apm-label">Subcity / Area</label>
                  <input
                    className="apm-input"
                    placeholder="Bole"
                    value={prodForm.subcity}
                    onChange={(e) => setProdForm((p) => ({ ...p, subcity: e.target.value }))}
                  />
                </div>
              </div>

              {/* ── Seller Info ── */}
              <div className="apm-seller-section">
                <div className="apm-seller-title">Seller Information</div>
                <div className="apm-row">
                  <div className="apm-field">
                    <label className="apm-label">Seller Name</label>
                    <input className="apm-input" value={prodForm.sellerName}
                      onChange={(e) => setProdForm((p) => ({ ...p, sellerName: e.target.value }))} />
                  </div>
                  <div className="apm-field">
                    <label className="apm-label">Seller Phone</label>
                    <input className="apm-input" value={prodForm.sellerPhone}
                      onChange={(e) => setProdForm((p) => ({ ...p, sellerPhone: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* ── Toggles ── */}
              <div className="apm-toggles">
                <label className="apm-toggle-label">
                  <div className={`apm-toggle ${prodForm.negotiable ? "on" : ""}`}
                    onClick={() => setProdForm((p) => ({ ...p, negotiable: !p.negotiable }))}>
                    <span className="apm-toggle-thumb" />
                  </div>
                  <span>Price Negotiable</span>
                </label>
                <label className="apm-toggle-label">
                  <div className={`apm-toggle ${prodForm.featured ? "on" : ""}`}
                    onClick={() => setProdForm((p) => ({ ...p, featured: !p.featured }))}>
                    <span className="apm-toggle-thumb" />
                  </div>
                  <span>💎 Featured / Boosted</span>
                </label>
              </div>

              {/* ── Submit ── */}
              <button type="submit" className="apm-submit-btn" disabled={modalLoading}>
                {modalLoading
                  ? <><span className="apm-submit-spinner" /> Saving…</>
                  : productModal.mode === "add" ? "Submit" : "Save Changes"}
              </button>

              <button type="button" className="apm-cancel-link"
                onClick={() => setProductModal({ open: false, mode: "add", data: null })}>
                Cancel
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ════ ORDER INSPECTOR MODAL ════ */}
      {orderModal.open && orderModal.data && (
        <div className="modal-scrim" onClick={() => setOrderModal({ open: false, data: null })}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>Order #{orderModal.data.id?.slice(0, 12)}</h2>
              <button className="close-btn" onClick={() => setOrderModal({ open: false, data: null })}>✕</button>
            </div>

            <form onSubmit={handleSaveOrder} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="order-inspector-grid">
                <div className="inspector-box">
                  <h4>Customer</h4>
                  <p>{orderModal.data.customer?.name}<br />{orderModal.data.customer?.phone}<br />{orderModal.data.customer?.email}</p>
                </div>
                <div className="inspector-box">
                  <h4>Financials</h4>
                  <p>
                    Subtotal: {money(orderModal.data.subtotal)}<br />
                    Shipping: {money(orderModal.data.shipping)}<br />
                    <strong>Total: {money(orderModal.data.total)}</strong>
                  </p>
                </div>
              </div>

              {orderModal.data.items?.length > 0 && (
                <div className="inspector-items-box">
                  <h4>Items</h4>
                  <div className="inspector-items-list">
                    {orderModal.data.items.map((it, i) => (
                      <div key={i} className="inspector-item-row">
                        <span>{it.name} ×{it.qty}</span>
                        <strong>{money(it.price * it.qty)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="fields-row">
                <div className="field">
                  <span>Order Status</span>
                  <select
                    value={orderModal.data.status || "pending"}
                    onChange={(e) => setOrderModal((m) => ({ ...m, data: { ...m.data, status: e.target.value } }))}
                  >
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <span>Payment Ref</span>
                  <input
                    value={orderModal.data.paymentRef || ""}
                    onChange={(e) => setOrderModal((m) => ({ ...m, data: { ...m.data, paymentRef: e.target.value } }))}
                    placeholder="Transaction reference…"
                  />
                </div>
              </div>

              <div className="field">
                <span>Notes</span>
                <textarea
                  rows={2}
                  value={orderModal.data.notes || ""}
                  onChange={(e) => setOrderModal((m) => ({ ...m, data: { ...m.data, notes: e.target.value } }))}
                  placeholder="Internal notes…"
                  style={{ padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-card)", background: "var(--bg)", color: "var(--text-primary)", resize: "vertical", fontFamily: "inherit", fontSize: "0.9375rem" }}
                />
              </div>

              <div className="adm-modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setOrderModal({ open: false, data: null })}>Close</button>
                <button type="submit" className="btn btn-accent" disabled={modalLoading}>
                  {modalLoading ? "Saving…" : "✓ Save Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
