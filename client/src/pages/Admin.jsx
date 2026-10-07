import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { money } from "../money.js";
import ProductArt from "../components/ProductArt.jsx";

const CATEGORIES = [
  { value: "electronics", label: "Electronics & Phones", icon: "📱", defaultArt: "phone" },
  { value: "vehicles", label: "Vehicles & Auto", icon: "🚗", defaultArt: "car" },
  { value: "property", label: "Real Estate / Property", icon: "🏠", defaultArt: "apartment" },
  { value: "fashion", label: "Fashion & Beauty", icon: "👗", defaultArt: "dress" },
  { value: "furniture", label: "Home & Furniture", icon: "🛋️", defaultArt: "sofa" },
  { value: "stationery", label: "Desk & Stationery", icon: "📚", defaultArt: "notebook" },
  { value: "services", label: "Services & Jobs", icon: "💼", defaultArt: "desk" },
];

const ORDER_STATUSES = [
  { value: "all", label: "All Orders", color: "#64748b" },
  { value: "pending", label: "⏳ Pending", color: "#eab308" },
  { value: "paid", label: "✓ Paid / Verified", color: "#16a34a" },
  { value: "processing", label: "⚙️ Processing", color: "#0284c7" },
  { value: "shipped", label: "🚚 Shipped", color: "#8b5cf6" },
  { value: "delivered", label: "📦 Delivered", color: "#059669" },
  { value: "cancelled", label: "❌ Cancelled", color: "#ef4444" },
];

export default function Admin() {
  const [isAuth, setIsAuth] = useState(
    () => localStorage.getItem("gedualpha_admin_auth") === "true"
  );
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "products", "orders", "gateways"

  // Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Products state
  const [products, setProducts] = useState([]);
  const [productTotal, setProductTotal] = useState(0);
  const [prodSearch, setProdSearch] = useState("");
  const [prodCategory, setProdCategory] = useState("all");
  const [prodLoading, setProdLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [orderLoading, setOrderLoading] = useState(false);

  // Modal States
  const [productModal, setProductModal] = useState({ open: false, mode: "add", data: null });
  const [orderModal, setOrderModal] = useState({ open: false, data: null });
  const [modalLoading, setModalLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState("");

  // Product Form state for Add/Edit
  const [prodForm, setProdForm] = useState({
    name: "",
    category: "electronics",
    price: "",
    stock: 1,
    condition: "Brand New",
    negotiable: false,
    featured: false,
    image: "",
    art: "phone",
    color: "#2563EB",
    tint: "#EFF6FF",
    description: "",
    city: "Addis Ababa",
    subcity: "Bole",
    sellerName: "Gedualpha Admin Store",
    sellerPhone: "+251912627366",
    sellerTelegram: "greatestvalue",
    sellerWhatsapp: "0941645784",
  });

  // Check auth & fetch data
  useEffect(() => {
    if (isAuth) {
      loadStats();
      if (activeTab === "products") loadProducts();
      if (activeTab === "orders") loadOrders();
    }
  }, [isAuth, activeTab]);

  function notify(msg) {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(""), 4000);
  }

  // ─── Auth Handler ───
  async function handleLogin(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await api.adminLogin(passwordInput);
      if (res.status === "ok") {
        setIsAuth(true);
        localStorage.setItem("gedualpha_admin_auth", "true");
      }
    } catch (_err) {
      setAuthError("Incorrect admin password. (Default is admin123)");
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    setIsAuth(false);
    localStorage.removeItem("gedualpha_admin_auth");
  }

  // ─── Data Loaders ───
  async function loadStats() {
    setStatsLoading(true);
    try {
      const res = await api.adminStats();
      setStats(res);
    } catch (err) {
      console.error("Stats load error:", err);
    } finally {
      setStatsLoading(false);
    }
  }

  async function loadProducts() {
    setProdLoading(true);
    try {
      const res = await api.adminProducts({
        q: prodSearch,
        category: prodCategory,
        limit: 100,
      });
      setProducts(res.items || []);
      setProductTotal(res.total || 0);
    } catch (err) {
      console.error("Products load error:", err);
    } finally {
      setProdLoading(false);
    }
  }

  async function loadOrders() {
    setOrderLoading(true);
    try {
      const res = await api.adminOrders({
        q: orderSearch,
        status: orderStatus,
        limit: 100,
      });
      setOrders(res.items || []);
      setOrderTotal(res.total || 0);
    } catch (err) {
      console.error("Orders load error:", err);
    } finally {
      setOrderLoading(false);
    }
  }

  // ─── Product CRUD Handlers ───
  function openAddProductModal() {
    setProdForm({
      name: "",
      category: "electronics",
      price: "",
      stock: 1,
      condition: "Brand New",
      negotiable: false,
      featured: false,
      image: "",
      art: "phone",
      color: "#2563EB",
      tint: "#EFF6FF",
      description: "",
      city: "Addis Ababa",
      subcity: "Bole",
      sellerName: "Gedualpha Admin Store",
      sellerPhone: "+251912627366",
      sellerTelegram: "greatestvalue",
      sellerWhatsapp: "0941645784",
    });
    setProductModal({ open: true, mode: "add", data: null });
  }

  function openEditProductModal(p) {
    setProdForm({
      id: p.id,
      name: p.name || "",
      category: p.category || "electronics",
      price: p.price || "",
      stock: p.stock ?? 1,
      condition: p.condition || "Brand New",
      negotiable: Boolean(p.negotiable),
      featured: Boolean(p.featured),
      image: p.image || "",
      art: p.art || "phone",
      color: p.color || "#2563EB",
      tint: p.tint || "#EFF6FF",
      description: p.description || "",
      city: p.location?.city || "Addis Ababa",
      subcity: p.location?.subcity || "Bole",
      sellerName: p.seller?.name || "Gedualpha Seller",
      sellerPhone: p.seller?.phone || "+251912627366",
      sellerTelegram: p.seller?.telegram || "greatestvalue",
      sellerWhatsapp: p.seller?.whatsapp || "0941645784",
    });
    setProductModal({ open: true, mode: "edit", data: p });
  }

  function handleImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setProdForm((prev) => ({ ...prev, image: dataUrl }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    if (!prodForm.name.trim() || !prodForm.price) {
      alert("Item title and price are required");
      return;
    }

    setModalLoading(true);
    const payload = {
      name: prodForm.name.trim(),
      category: prodForm.category,
      price: Number(prodForm.price),
      stock: Number(prodForm.stock),
      condition: prodForm.condition,
      negotiable: Boolean(prodForm.negotiable),
      featured: Boolean(prodForm.featured),
      image: prodForm.image || null,
      art: prodForm.art,
      color: prodForm.color,
      tint: prodForm.tint,
      description: prodForm.description.trim(),
      location: {
        city: prodForm.city,
        subcity: prodForm.subcity,
      },
      seller: {
        name: prodForm.sellerName,
        phone: prodForm.sellerPhone,
        telegram: prodForm.sellerTelegram,
        whatsapp: prodForm.sellerWhatsapp,
      },
    };

    try {
      if (productModal.mode === "add") {
        await api.adminCreateProduct(payload);
        notify("🎉 New product created successfully!");
      } else {
        await api.adminUpdateProduct(prodForm.id, payload);
        notify("✓ Product updated successfully!");
      }
      setProductModal({ open: false, mode: "add", data: null });
      loadProducts();
      loadStats();
    } catch (err) {
      alert("Failed to save product: " + err.message);
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDeleteProduct(id, name) {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await api.adminDeleteProduct(id);
      notify(`🗑️ Deleted listing "${name}"`);
      loadProducts();
      loadStats();
    } catch (err) {
      alert("Failed to delete product: " + err.message);
    }
  }

  async function handleToggleFeatured(p) {
    try {
      const nextVal = !p.featured;
      await api.adminUpdateProduct(p.id, { featured: nextVal });
      notify(`${nextVal ? "💎 Marked as Featured" : "Unmarked Featured"} for "${p.name}"`);
      loadProducts();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  }

  // ─── Order CRUD & Status Handlers ───
  async function handleQuickOrderStatus(orderId, newStatus) {
    try {
      await api.adminUpdateOrder(orderId, { status: newStatus });
      notify(`✓ Order #${orderId} status updated to: ${newStatus.toUpperCase()}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      loadStats();
    } catch (err) {
      alert("Failed to update order status: " + err.message);
    }
  }

  async function handleDeleteOrder(orderId) {
    if (!window.confirm(`Are you sure you want to delete Order #${orderId}?`)) return;
    try {
      await api.adminDeleteOrder(orderId);
      notify(`🗑️ Order #${orderId} deleted.`);
      loadOrders();
      loadStats();
    } catch (err) {
      alert("Failed to delete order: " + err.message);
    }
  }

  function openOrderInspector(o) {
    setOrderModal({ open: true, data: o });
  }

  async function handleSaveOrderInspector(e) {
    e.preventDefault();
    if (!orderModal.data) return;
    setModalLoading(true);
    try {
      await api.adminUpdateOrder(orderModal.data.id, {
        status: orderModal.data.status,
        paymentMethod: orderModal.data.paymentMethod,
        paymentRef: orderModal.data.paymentRef,
        notes: orderModal.data.notes,
      });
      notify(`✓ Saved Order #${orderModal.data.id} details.`);
      setOrderModal({ open: false, data: null });
      loadOrders();
      loadStats();
    } catch (err) {
      alert("Failed to save order: " + err.message);
    } finally {
      setModalLoading(false);
    }
  }

  // ─── Render: Login Lock Screen ───
  if (!isAuth) {
    return (
      <div className="container admin-login-container">
        <div className="admin-login-card">
          <div className="admin-lock-icon">🛡️</div>
          <h2>Gedualpha Admin Portal</h2>
          <p>Enter the administrator passcode to access the store management dashboard.</p>

          <form onSubmit={handleLogin} className="admin-login-form">
            {authError && <div className="error-banner">{authError}</div>}
            <div className="field">
              <span>Admin Passcode / Password</span>
              <input
                type="password"
                placeholder="Enter admin password (e.g. admin123)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn btn-accent btn-wide"
              disabled={authLoading || !passwordInput}
            >
              {authLoading ? "Verifying…" : "🔓 Unlock Admin Dashboard"}
            </button>
            <span className="fine" style={{ marginTop: "0.5rem" }}>
              Hint: Default password is <code>admin123</code>
            </span>
          </form>
        </div>
      </div>
    );
  }

  // ─── Render: Main Admin Dashboard ───
  return (
    <div className="container admin-page-container">
      {actionNotice && <div className="admin-toast-banner">{actionNotice}</div>}

      {/* Admin Top Header */}
      <div className="admin-header-row">
        <div className="admin-title-col">
          <div className="admin-badge-pill">🛡️ Gedualpha Admin Control Panel</div>
          <h1>E-Commerce Management &amp; Operations</h1>
          <p>Real-time analytics, inventory management, and transaction controls.</p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="btn btn-accent btn-sm"
            onClick={openAddProductModal}
          >
            ➕ Add New Listing
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            title="Sign out of admin"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="admin-nav-tabs">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard Overview
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("products");
            loadProducts();
          }}
        >
          📦 Products &amp; Listings ({stats?.totalProducts ?? "…"})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("orders");
            loadOrders();
          }}
        >
          💳 Orders &amp; Transactions ({stats?.totalOrders ?? "…"})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "gateways" ? "active" : ""}`}
          onClick={() => setActiveTab("gateways")}
        >
          ⚙️ Payment Gateways &amp; Config
        </button>
      </div>

      {/* ─── TAB 1: DASHBOARD OVERVIEW ─── */}
      {activeTab === "dashboard" && (
        <div className="admin-tab-content">
          {/* Top 4 KPI Metrics */}
          <div className="admin-kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon-wrap" style={{ background: "#ecfdf5", color: "#059669" }}>
                💵
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Total Volume / Revenue</span>
                <h3 className="kpi-val">{stats ? money(stats.totalRevenue) : "…"}</h3>
                <span className="kpi-sub">Across all marketplace orders</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap" style={{ background: "#eff6ff", color: "#2563eb" }}>
                🛒
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Total Orders Placed</span>
                <h3 className="kpi-val">{stats?.totalOrders ?? 0}</h3>
                <span className="kpi-sub">
                  {stats?.statusCounts?.pending ?? 0} Pending &bull; {stats?.statusCounts?.paid ?? 0} Paid
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap" style={{ background: "#fdf4ff", color: "#9333ea" }}>
                📦
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Active Listings</span>
                <h3 className="kpi-val">{stats?.totalProducts ?? 0}</h3>
                <span className="kpi-sub">
                  {stats?.lowStockCount ? `⚠️ ${stats.lowStockCount} Low stock` : "All in stock"}
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap" style={{ background: "#fffbeb", color: "#d97706" }}>
                👁️
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Total Product Views</span>
                <h3 className="kpi-val">{stats?.totalViews ?? 0}</h3>
                <span className="kpi-sub">Ethiopian buyer impressions</span>
              </div>
            </div>
          </div>

          {/* Quick Order Status Grid */}
          <div className="admin-status-breakdown-card">
            <h3>Orders by Status</h3>
            <div className="status-pills-row">
              <div className="status-counter-pill pending">
                <span>Pending</span>
                <strong>{stats?.statusCounts?.pending ?? 0}</strong>
              </div>
              <div className="status-counter-pill paid">
                <span>Paid / Verified</span>
                <strong>{stats?.statusCounts?.paid ?? 0}</strong>
              </div>
              <div className="status-counter-pill processing">
                <span>Processing</span>
                <strong>{stats?.statusCounts?.processing ?? 0}</strong>
              </div>
              <div className="status-counter-pill shipped">
                <span>Shipped</span>
                <strong>{stats?.statusCounts?.shipped ?? 0}</strong>
              </div>
              <div className="status-counter-pill delivered">
                <span>Delivered</span>
                <strong>{stats?.statusCounts?.delivered ?? 0}</strong>
              </div>
              <div className="status-counter-pill cancelled">
                <span>Cancelled</span>
                <strong>{stats?.statusCounts?.cancelled ?? 0}</strong>
              </div>
            </div>
          </div>

          {/* Dual Column: Recent Orders & Quick Controls */}
          <div className="admin-dual-grid">
            {/* Recent Transactions */}
            <div className="admin-card-section">
              <div className="section-title-row">
                <h3>Recent Orders &amp; Transactions</h3>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setActiveTab("orders");
                    loadOrders();
                  }}
                >
                  View All Orders →
                </button>
              </div>

              {stats?.recentOrders?.length > 0 ? (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((o) => (
                        <tr key={o.id}>
                          <td>
                            <strong>#{o.id}</strong>
                          </td>
                          <td>
                            <div>{o.customer?.name}</div>
                            <span className="table-sub">{o.customer?.city}</span>
                          </td>
                          <td>
                            <strong>{money(o.total)}</strong>
                          </td>
                          <td>
                            <span className={`badge-status ${o.status || "pending"}`}>
                              {o.status || "pending"}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-action-view"
                              onClick={() => openOrderInspector(o)}
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="admin-empty-state">No orders recorded yet.</div>
              )}
            </div>

            {/* Quick Actions & Low Stock */}
            <div className="admin-card-section">
              <div className="section-title-row">
                <h3>⚡ Quick Management Actions</h3>
              </div>

              <div className="quick-action-btns">
                <button
                  type="button"
                  className="quick-tile"
                  onClick={openAddProductModal}
                >
                  <span className="tile-icon">➕</span>
                  <div>
                    <strong>Post New Marketplace Listing</strong>
                    <p>Upload photos, set price &amp; location</p>
                  </div>
                </button>

                <button
                  type="button"
                  className="quick-tile"
                  onClick={() => {
                    setActiveTab("products");
                    loadProducts();
                  }}
                >
                  <span className="tile-icon">📦</span>
                  <div>
                    <strong>Edit Inventory &amp; Stock</strong>
                    <p>Adjust pricing and stock quantities</p>
                  </div>
                </button>

                <button
                  type="button"
                  className="quick-tile"
                  onClick={() => {
                    setActiveTab("orders");
                    loadOrders();
                  }}
                >
                  <span className="tile-icon">💳</span>
                  <div>
                    <strong>Process Customer Orders</strong>
                    <p>Mark Telebirr &amp; CBE payments as paid</p>
                  </div>
                </button>
              </div>

              {stats?.lowStockProducts?.length > 0 && (
                <div className="low-stock-alert-box">
                  <h4>⚠️ Low Stock Alert (≤ 3 left)</h4>
                  <ul>
                    {stats.lowStockProducts.map((p) => (
                      <li key={p.id}>
                        <span>{p.name}</span>
                        <strong style={{ color: "#ef4444" }}>{p.stock} in stock</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: PRODUCTS & LISTINGS (CRUD) ─── */}
      {activeTab === "products" && (
        <div className="admin-tab-content">
          {/* Filter and Search Bar */}
          <div className="admin-filter-bar">
            <div className="filter-input-wrap">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search products by title or ID…"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadProducts()}
              />
            </div>

            <select
              value={prodCategory}
              onChange={(e) => {
                setProdCategory(e.target.value);
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={loadProducts}
            >
              Filter
            </button>

            <button
              type="button"
              className="btn btn-accent btn-sm"
              style={{ marginLeft: "auto" }}
              onClick={openAddProductModal}
            >
              ➕ Add Product
            </button>
          </div>

          {/* Products Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price (ETB)</th>
                  <th>Stock</th>
                  <th>Condition</th>
                  <th>Views</th>
                  <th>Featured</th>
                  <th>Seller</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="table-product-cell">
                          <div className="table-thumb-wrap">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="table-thumb" />
                            ) : (
                              <ProductArt art={p.art} color={p.color} tint={p.tint} />
                            )}
                          </div>
                          <div>
                            <Link to={`/product/${p.id}`} target="_blank" className="table-product-title">
                              {p.name}
                            </Link>
                            <span className="table-sub">ID: {p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-cat">{p.category}</span>
                      </td>
                      <td>
                        <strong>{money(p.price)}</strong>
                        {p.negotiable && <span className="table-sub-tag">Neg</span>}
                      </td>
                      <td>
                        <span className={`stock-indicator ${p.stock <= 2 ? "low" : "ok"}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td>{p.condition || "Brand New"}</td>
                      <td>👁️ {p.views || 0}</td>
                      <td>
                        <button
                          type="button"
                          className={`btn-featured-toggle ${p.featured ? "active" : ""}`}
                          onClick={() => handleToggleFeatured(p)}
                          title="Click to toggle featured status"
                        >
                          {p.featured ? "💎 Boosted" : "☆ Standard"}
                        </button>
                      </td>
                      <td>
                        <div>{p.seller?.name || "Seller"}</div>
                        <a href={`tel:${p.seller?.phone}`} className="table-sub">
                          {p.seller?.phone || "-"}
                        </a>
                      </td>
                      <td>
                        <div className="table-actions-row">
                          <button
                            type="button"
                            className="btn-action-edit"
                            onClick={() => openEditProductModal(p)}
                            title="Edit product"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="btn-action-del"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            title="Delete product"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "2rem" }}>
                      {prodLoading ? "Loading listings…" : "No products found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: ORDERS & TRANSACTIONS (CRUD) ─── */}
      {activeTab === "orders" && (
        <div className="admin-tab-content">
          {/* Order Search & Status Filters */}
          <div className="admin-filter-bar">
            <div className="filter-input-wrap">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search by Order ID, customer, email, or city…"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadOrders()}
              />
            </div>

            <div className="order-status-tabs">
              {ORDER_STATUSES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  className={`status-tab-btn ${orderStatus === st.value ? "active" : ""}`}
                  onClick={() => {
                    setOrderStatus(st.value);
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={loadOrders}
            >
              Refresh
            </button>
          </div>

          {/* Orders Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Info</th>
                  <th>Items Ordered</th>
                  <th>Subtotal &bull; Shipping</th>
                  <th>Total Amount</th>
                  <th>Gateway / Ref</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong>#{o.id}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: "600" }}>{o.customer?.name}</div>
                        <div className="table-sub">{o.customer?.email}</div>
                        <div className="table-sub">📍 {o.customer?.city}</div>
                      </td>
                      <td>
                        <div className="table-items-summary">
                          {o.items?.map((item, idx) => (
                            <div key={idx} className="item-summary-line">
                              {item.qty}x {item.name}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div>Sub: {money(o.subtotal)}</div>
                        <span className="table-sub">Ship: {money(o.shipping)}</span>
                      </td>
                      <td>
                        <strong style={{ fontSize: "1.05rem", color: "var(--accent)" }}>
                          {money(o.total)}
                        </strong>
                      </td>
                      <td>
                        <span className="badge-gateway">
                          {o.paymentMethod || "telebirr"}
                        </span>
                        {o.paymentRef && (
                          <div className="table-sub" title={o.paymentRef}>
                            Ref: {o.paymentRef.slice(0, 10)}…
                          </div>
                        )}
                      </td>
                      <td>
                        <select
                          className={`status-select-inline ${o.status || "pending"}`}
                          value={o.status || "pending"}
                          onChange={(e) => handleQuickOrderStatus(o.id, e.target.value)}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="paid">✓ Paid</option>
                          <option value="processing">⚙️ Processing</option>
                          <option value="shipped">🚚 Shipped</option>
                          <option value="delivered">📦 Delivered</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <span className="table-sub">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions-row">
                          <button
                            type="button"
                            className="btn-action-view"
                            onClick={() => openOrderInspector(o)}
                            title="Inspect full order details"
                          >
                            👁️ View
                          </button>
                          <button
                            type="button"
                            className="btn-action-del"
                            onClick={() => handleDeleteOrder(o.id)}
                            title="Delete order"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "2rem" }}>
                      {orderLoading ? "Loading orders…" : "No orders matching current filter."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: PAYMENT GATEWAYS & SETTINGS ─── */}
      {activeTab === "gateways" && (
        <div className="admin-tab-content">
          <div className="gateways-overview-grid">
            {/* Telebirr Card */}
            <div className="gateway-admin-card">
              <div className="gw-card-head">
                <span className="gw-icon">📱</span>
                <div>
                  <h3>Telebirr Gateway (ኢትዮ ቴሌኮም)</h3>
                  <span className="gw-status-live">● Live &amp; Active</span>
                </div>
              </div>
              <div className="gw-card-body">
                <div className="gw-field-row">
                  <span>Merchant / Phone Account:</span>
                  <strong>092627366</strong>
                </div>
                <div className="gw-field-row">
                  <span>Account Title:</span>
                  <strong>Gedualpha Ecom (Telebirr Gateway)</strong>
                </div>
                <div className="gw-field-row">
                  <span>USSD Payment Code:</span>
                  <strong>*127#</strong>
                </div>
              </div>
            </div>

            {/* CBE Birr Card */}
            <div className="gateway-admin-card">
              <div className="gw-card-head">
                <span className="gw-icon">🏦</span>
                <div>
                  <h3>Commercial Bank of Ethiopia (CBE)</h3>
                  <span className="gw-status-live">● Live &amp; Active</span>
                </div>
              </div>
              <div className="gw-card-body">
                <div className="gw-field-row">
                  <span>Account Number:</span>
                  <strong>1000254874705</strong>
                </div>
                <div className="gw-field-row">
                  <span>Account Holder Name:</span>
                  <strong>Gedualpha Ecom</strong>
                </div>
                <div className="gw-field-row">
                  <span>Transfer Platform:</span>
                  <strong>CBE Birr &amp; CBE Mobile Banking</strong>
                </div>
              </div>
            </div>

            {/* Chapa Card */}
            <div className="gateway-admin-card">
              <div className="gw-card-head">
                <span className="gw-icon">💳</span>
                <div>
                  <h3>Chapa Online Payment Gateway</h3>
                  <span className="gw-status-live">● Integrated</span>
                </div>
              </div>
              <div className="gw-card-body">
                <div className="gw-field-row">
                  <span>Currency:</span>
                  <strong>ETB (Ethiopian Birr)</strong>
                </div>
                <div className="gw-field-row">
                  <span>API Integration:</span>
                  <strong>/api/payments/chapa/initialize</strong>
                </div>
                <div className="gw-field-row">
                  <span>Supported Methods:</span>
                  <strong>Telebirr, CBE, Awash, Cards</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT PRODUCT ─── */}
      {productModal.open && (
        <div className="modal-scrim" onClick={() => setProductModal({ open: false, mode: "add", data: null })}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{productModal.mode === "add" ? "➕ Add New Marketplace Product" : "✏️ Edit Product Listing"}</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setProductModal({ open: false, mode: "add", data: null })}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-modal-form">
              <div className="field">
                <span>Item Title *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung Galaxy S24 Ultra 512GB"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                />
              </div>

              <div className="fields-row">
                <div className="field">
                  <span>Category *</span>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <span>Price (ETB) *</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 135000"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                  />
                </div>

                <div className="field">
                  <span>Stock Available *</span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="fields-row">
                <div className="field">
                  <span>Condition</span>
                  <select
                    value={prodForm.condition}
                    onChange={(e) => setProdForm({ ...prodForm, condition: e.target.value })}
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Used">Used</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>

                <label className="checkbox-field" style={{ alignSelf: "center", marginTop: "1rem" }}>
                  <input
                    type="checkbox"
                    checked={prodForm.negotiable}
                    onChange={(e) => setProdForm({ ...prodForm, negotiable: e.target.checked })}
                  />
                  <span>Negotiable</span>
                </label>

                <label className="checkbox-field" style={{ alignSelf: "center", marginTop: "1rem" }}>
                  <input
                    type="checkbox"
                    checked={prodForm.featured}
                    onChange={(e) => setProdForm({ ...prodForm, featured: e.target.checked })}
                  />
                  <span>💎 Diamond Boost / Featured</span>
                </label>
              </div>

              {/* Image Upload in Modal */}
              <div className="field">
                <span>Product Image (Photo Upload / Browse)</span>
                {prodForm.image ? (
                  <div className="modal-image-preview">
                    <img src={prodForm.image} alt="Preview" className="modal-preview-thumb" />
                    <button
                      type="button"
                      className="btn-remove-photo"
                      onClick={() => setProdForm({ ...prodForm, image: "" })}
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div className="modal-upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      id="modal-file-input"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageFile(e.target.files[0]);
                        }
                      }}
                    />
                    <label htmlFor="modal-file-input" className="btn btn-accent btn-sm" style={{ cursor: "pointer" }}>
                      📁 Browse &amp; Upload Photo
                    </label>
                    <span className="fine" style={{ marginLeft: "0.5rem" }}>JPG, PNG, WebP supported</span>
                  </div>
                )}
              </div>

              <div className="field">
                <span>Description &amp; Specifications</span>
                <textarea
                  rows="3"
                  placeholder="Key specs, warranty, accessories included…"
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                />
              </div>

              <div className="fields-row">
                <div className="field">
                  <span>Location City</span>
                  <input
                    type="text"
                    value={prodForm.city}
                    onChange={(e) => setProdForm({ ...prodForm, city: e.target.value })}
                  />
                </div>
                <div className="field">
                  <span>Subcity / Area</span>
                  <input
                    type="text"
                    value={prodForm.subcity}
                    onChange={(e) => setProdForm({ ...prodForm, subcity: e.target.value })}
                  />
                </div>
              </div>

              <div className="fields-row">
                <div className="field">
                  <span>Seller Name</span>
                  <input
                    type="text"
                    value={prodForm.sellerName}
                    onChange={(e) => setProdForm({ ...prodForm, sellerName: e.target.value })}
                  />
                </div>
                <div className="field">
                  <span>Seller Phone</span>
                  <input
                    type="text"
                    value={prodForm.sellerPhone}
                    onChange={(e) => setProdForm({ ...prodForm, sellerPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-foot">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setProductModal({ open: false, mode: "add", data: null })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-accent"
                  disabled={modalLoading}
                >
                  {modalLoading ? "Saving…" : "💾 Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ORDER / TRANSACTION INSPECTOR ─── */}
      {orderModal.open && orderModal.data && (
        <div className="modal-scrim" onClick={() => setOrderModal({ open: false, data: null })}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Transaction Details — Order #{orderModal.data.id}</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setOrderModal({ open: false, data: null })}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOrderInspector} className="admin-modal-form">
              <div className="order-inspector-grid">
                {/* Customer Information */}
                <div className="inspector-box">
                  <h4>👤 Customer &amp; Delivery Address</h4>
                  <p><strong>Name:</strong> {orderModal.data.customer?.name}</p>
                  <p><strong>Email:</strong> {orderModal.data.customer?.email}</p>
                  <p><strong>Address:</strong> {orderModal.data.customer?.address}</p>
                  <p><strong>City / Postal:</strong> {orderModal.data.customer?.city}, {orderModal.data.customer?.postal}</p>
                </div>

                {/* Financial Breakdown */}
                <div className="inspector-box">
                  <h4>💵 Financial &amp; Payment Summary</h4>
                  <p><strong>Subtotal:</strong> {money(orderModal.data.subtotal)}</p>
                  <p><strong>Shipping:</strong> {money(orderModal.data.shipping)}</p>
                  <p><strong>Grand Total:</strong> <span style={{ color: "var(--accent)", fontSize: "1.1rem", fontWeight: "800" }}>{money(orderModal.data.total)}</span></p>
                  <p><strong>Gateway:</strong> {orderModal.data.paymentMethod || "telebirr"}</p>
                </div>
              </div>

              {/* Order Items List */}
              <div className="inspector-items-box">
                <h4>📦 Line Items</h4>
                <div className="inspector-items-list">
                  {orderModal.data.items?.map((item, i) => (
                    <div key={i} className="inspector-item-row">
                      <span>{item.qty}x <strong>{item.name}</strong></span>
                      <span>{money(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Notes Controls */}
              <div className="fields-row">
                <div className="field">
                  <span>Update Order Status</span>
                  <select
                    value={orderModal.data.status || "pending"}
                    onChange={(e) =>
                      setOrderModal({
                        ...orderModal,
                        data: { ...orderModal.data, status: e.target.value },
                      })
                    }
                  >
                    <option value="pending">⏳ Pending (Awaiting payment verification)</option>
                    <option value="paid">✓ Paid &amp; Verified</option>
                    <option value="processing">⚙️ Processing / Packing</option>
                    <option value="shipped">🚚 Shipped / Out for delivery</option>
                    <option value="delivered">📦 Delivered to customer</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                </div>

                <div className="field">
                  <span>Payment Reference Code</span>
                  <input
                    type="text"
                    placeholder="e.g. TXN-TELEBIRR-82918"
                    value={orderModal.data.paymentRef || ""}
                    onChange={(e) =>
                      setOrderModal({
                        ...orderModal,
                        data: { ...orderModal.data, paymentRef: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="field">
                <span>Internal Admin Notes</span>
                <textarea
                  rows="2"
                  placeholder="Notes about verification, courier phone, tracking number…"
                  value={orderModal.data.notes || ""}
                  onChange={(e) =>
                    setOrderModal({
                      ...orderModal,
                      data: { ...orderModal.data, notes: e.target.value },
                    })
                  }
                />
              </div>

              <div className="modal-foot">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setOrderModal({ open: false, data: null })}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-accent"
                  disabled={modalLoading}
                >
                  {modalLoading ? "Saving…" : "💾 Update Order Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
