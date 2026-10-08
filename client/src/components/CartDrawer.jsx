import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductArt from "./ProductArt.jsx";
import { useCart } from "../CartContext.jsx";
import { useUser } from "../UserContext.jsx";
import { api } from "../api.js";
import { FREE_SHIPPING_OVER, money } from "../money.js";

/* ── Icons ───────────────────────────────────────────────────────────── */
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="40" height="40">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="38" height="38">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="13" height="13">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  );
}

/* ── Status meta ─────────────────────────────────────────────────────── */
const STATUS_META = {
  pending:    { label: "Pending Payment",  color: "#eab308", bg: "#fefce8", icon: "⏳" },
  paid:       { label: "Payment Verified", color: "#16a34a", bg: "#f0fdf4", icon: "✅" },
  processing: { label: "Processing",       color: "#0284c7", bg: "#f0f9ff", icon: "⚙️" },
  shipped:    { label: "Shipped",          color: "#7c3aed", bg: "#faf5ff", icon: "🚚" },
  delivered:  { label: "Delivered",        color: "#059669", bg: "#ecfdf5", icon: "📦" },
  cancelled:  { label: "Cancelled",        color: "#dc2626", bg: "#fef2f2", icon: "❌" },
};

const STATUS_STEPS = ["pending", "paid", "processing", "shipped", "delivered"];

/* ── Mini progress bar showing order status step ─────────────────────── */
function MiniTimeline({ status }) {
  if (status === "cancelled") {
    return <div className="cd-mini-cancelled">❌ Cancelled</div>;
  }
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <div className="cd-mini-timeline">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="cd-mini-step-wrap">
          <div className={`cd-mini-dot ${i < idx ? "done" : ""} ${i === idx ? "active" : ""}`}>
            {i < idx ? "✓" : i === idx ? STATUS_META[step]?.icon : ""}
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`cd-mini-line ${i < idx ? "done" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
export default function CartDrawer() {
  const { items, open, setOpen, subtotal, setQty, remove } = useCart();
  const { user, token, openLogin } = useUser();

  const [activeTab,  setActiveTab]  = useState("cart");   // "cart" | "orders"
  const [orders,     setOrders]     = useState([]);
  const [ordLoading, setOrdLoading] = useState(false);
  const [ordError,   setOrdError]   = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const remaining = Math.max(0, FREE_SHIPPING_OVER - subtotal);
  const pct       = Math.min(100, (subtotal / FREE_SHIPPING_OVER) * 100);

  /* Lock body scroll when open */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, setOpen]);

  /* Load orders whenever the Orders tab is activated */
  useEffect(() => {
    if (activeTab !== "orders" || !user) return;
    fetchOrders();
  }, [activeTab, user]);

  /* Also reload orders when drawer opens on Orders tab */
  useEffect(() => {
    if (open && activeTab === "orders" && user) fetchOrders();
  }, [open]);

  function fetchOrders() {
    if (!user || !token) return;
    setOrdLoading(true);
    setOrdError("");
    const ac = new AbortController();
    api.getMyOrders(user.id, token, ac.signal)
      .then((d) => { setOrders(d.orders || []); setOrdLoading(false); })
      .catch((e) => { if (e.name !== "AbortError") { setOrdError(e.message); setOrdLoading(false); } });
    return () => ac.abort();
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  /* ─────────────────────────────────────────────────────────────────── */
  return (
    <>
      <div className={`scrim ${open ? "show" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside className={`drawer ${open ? "open" : ""}`}
        aria-label="Cart and orders" aria-modal="true" role="dialog" id="cart-drawer">

        {/* ── Header ── */}
        <div className="drawer-head">
          <div className="cd-tabs">
            <button
              className={`cd-tab ${activeTab === "cart" ? "active" : ""}`}
              onClick={() => setActiveTab("cart")}
            >
              🛒 Cart
              {items.length > 0 && <span className="cd-tab-badge">{items.reduce((n, i) => n + i.qty, 0)}</span>}
            </button>
            <button
              className={`cd-tab ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              📦 My Orders
              {pendingCount > 0 && <span className="cd-tab-badge cd-tab-badge--warn">{pendingCount}</span>}
            </button>
          </div>
          <button className="close-btn" onClick={() => setOpen(false)} aria-label="Close cart" id="close-cart-btn">
            <XIcon />
          </button>
        </div>

        {/* ══════════ CART TAB ══════════ */}
        {activeTab === "cart" && (
          <>
            {items.length > 0 && (
              <div className="ship-progress">
                <p>
                  {remaining > 0
                    ? <>Add <strong>{money(remaining)}</strong> more for free shipping 🚚</>
                    : <>🎉 You've unlocked <strong>free shipping!</strong></>}
                </p>
                <div className="progress-bar-bg" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}

            <div className="drawer-body">
              {items.length === 0 ? (
                <div className="drawer-empty">
                  <BagIcon />
                  <p>Your cart is empty</p>
                  <Link className="btn btn-accent" to="/" onClick={() => setOpen(false)} id="browse-shop-btn">
                    Browse the shop
                  </Link>
                </div>
              ) : (
                <ul className="lines">
                  {items.map((i) => (
                    <li key={i.id} className="line" id={`cart-item-${i.id}`}>
                      <div className="line-art">
                        <ProductArt art={i.art} color={i.color} tint={i.tint} />
                      </div>
                      <div className="line-info">
                        <span className="line-name">{i.name}</span>
                        <span className="line-price">{money(i.price)}</span>
                        <div className="qty-controls">
                          <button className="qty-btn" onClick={() => setQty(i.id, i.qty - 1)} aria-label={`Remove one ${i.name}`}>−</button>
                          <span className="qty-val" aria-live="polite">{i.qty}</span>
                          <button className="qty-btn" onClick={() => setQty(i.id, i.qty + 1)} aria-label={`Add one ${i.name}`}>+</button>
                          <button className="remove-btn" onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`}>Remove</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="drawer-foot">
                <div className="subtotal-row">
                  <span>Subtotal</span>
                  <strong>{money(subtotal)}</strong>
                </div>
                <Link to="/checkout" className="btn btn-accent btn-wide"
                  onClick={() => setOpen(false)} id="checkout-btn">
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </>
        )}

        {/* ══════════ ORDERS TAB ══════════ */}
        {activeTab === "orders" && (
          <div className="cd-orders-panel">

            {/* Not logged in */}
            {!user && (
              <div className="cd-orders-empty">
                <BoxIcon />
                <p>Sign in to see your order history and track deliveries.</p>
                <button className="btn btn-accent" onClick={() => { setOpen(false); openLogin(); }}>
                  Log In
                </button>
                <Link to="/my-orders" className="btn btn-ghost" onClick={() => setOpen(false)}
                  style={{ marginTop: "0.375rem" }}>
                  View Orders Page
                </Link>
              </div>
            )}

            {/* Logged in */}
            {user && (
              <>
                <div className="cd-orders-head">
                  <span className="cd-orders-title">Recent Orders</span>
                  <button className="cd-refresh-btn" onClick={fetchOrders} title="Refresh orders" disabled={ordLoading}>
                    <RefreshIcon /> {ordLoading ? "…" : "Refresh"}
                  </button>
                </div>

                {ordLoading && (
                  <div className="cd-orders-loading">
                    <div className="cd-spinner" />
                    <span>Loading your orders…</span>
                  </div>
                )}

                {ordError && (
                  <div className="cd-orders-err">⚠️ {ordError}</div>
                )}

                {!ordLoading && !ordError && orders.length === 0 && (
                  <div className="cd-orders-empty">
                    <BoxIcon />
                    <p>No orders yet. Start shopping!</p>
                    <button className="btn btn-accent" onClick={() => { setActiveTab("cart"); }}>
                      Go to Cart
                    </button>
                  </div>
                )}

                {!ordLoading && orders.length > 0 && (
                  <ul className="cd-order-list">
                    {orders.map((o) => {
                      const meta    = STATUS_META[o.status] || STATUS_META.pending;
                      const isOpen  = expandedId === o.id;
                      const needRef = (o.paymentMethod === "telebirr" || o.paymentMethod === "cbe") && !o.paymentConfirmed;

                      return (
                        <li key={o.id} className={`cd-order-card ${isOpen ? "open" : ""}`}>

                          {/* Summary row — always visible */}
                          <button className="cd-order-summary" onClick={() => setExpandedId(isOpen ? null : o.id)}>
                            <div className="cd-order-id">#{o.id}</div>
                            <div className="cd-order-meta">
                              <span className="cd-status-badge"
                                style={{ background: meta.bg, color: meta.color, borderColor: meta.color + "55" }}>
                                {meta.icon} {meta.label}
                              </span>
                              {needRef && (
                                <span className="cd-ref-warn">⚠️ Awaiting confirmation</span>
                              )}
                            </div>
                            <div className="cd-order-right">
                              <span className="cd-order-total">{money(o.total)}</span>
                              <span className="cd-chevron">{isOpen ? "▲" : "▼"}</span>
                            </div>
                          </button>

                          {/* Expanded detail */}
                          {isOpen && (
                            <div className="cd-order-detail">

                              {/* Mini timeline */}
                              <MiniTimeline status={o.status} />

                              {/* Payment ref status */}
                              {(o.paymentMethod === "telebirr" || o.paymentMethod === "cbe") && (
                                <div className={`cd-ref-box ${o.paymentConfirmed ? "ok" : "pending"}`}>
                                  {o.paymentConfirmed
                                    ? <><span>✅</span> Payment confirmed</>
                                    : <><span>⏳</span> Payment ref <code>{o.paymentRef || "—"}</code> pending admin verification</>}
                                </div>
                              )}

                              {/* Items */}
                              <div className="cd-order-items">
                                {o.items?.map((it, i) => (
                                  <div key={i} className="cd-order-item">
                                    <span>{it.qty} × {it.name}</span>
                                    <span>{money(it.price * it.qty)}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Totals */}
                              <div className="cd-order-totals">
                                <div className="cd-total-row">
                                  <span>Subtotal</span><span>{money(o.subtotal)}</span>
                                </div>
                                <div className="cd-total-row">
                                  <span>Shipping</span>
                                  <span>{o.shipping === 0 ? "Free" : money(o.shipping)}</span>
                                </div>
                                <div className="cd-total-row cd-total-row--bold">
                                  <span>Total</span><strong>{money(o.total)}</strong>
                                </div>
                              </div>

                              {/* Date + type */}
                              <div className="cd-order-footer">
                                <span className="cd-order-type">
                                  {o.paymentMethod === "cod" ? "💵 Cash on Delivery"
                                    : o.paymentMethod === "chapa" ? "💳 Chapa"
                                    : o.paymentMethod === "telebirr" ? "📱 Telebirr"
                                    : "🏦 CBE Birr"}
                                </span>
                                <span className="cd-order-date">
                                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-ET", { day:"numeric", month:"short", year:"numeric" }) : "—"}
                                </span>
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {orders.length > 0 && (
                  <div className="cd-orders-footer">
                    <Link to="/my-orders" className="cd-view-all-btn" onClick={() => setOpen(false)}>
                      View Full Order History →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </aside>
    </>
  );
}
