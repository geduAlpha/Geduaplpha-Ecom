import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useUser } from "../UserContext.jsx";
import { money } from "../money.js";

const STATUS_STEPS = ["pending", "paid", "processing", "shipped", "delivered"];

const STATUS_META = {
  pending:    { label: "Pending Payment",  color: "#eab308", bg: "#fefce8", icon: "⏳", desc: "Your order has been placed. Please complete your payment." },
  paid:       { label: "Payment Verified", color: "#16a34a", bg: "#f0fdf4", icon: "✅", desc: "Payment confirmed by admin. Your order is being prepared." },
  processing: { label: "Processing",       color: "#0284c7", bg: "#f0f9ff", icon: "⚙️", desc: "Your items are being packed and prepared for shipment." },
  shipped:    { label: "Shipped",          color: "#7c3aed", bg: "#faf5ff", icon: "🚚", desc: "Your order is on the way! Our courier will contact you." },
  delivered:  { label: "Delivered",        color: "#059669", bg: "#ecfdf5", icon: "📦", desc: "Your order has been delivered. Enjoy your purchase!" },
  cancelled:  { label: "Cancelled",        color: "#dc2626", bg: "#fef2f2", icon: "❌", desc: "This order has been cancelled." },
};

function StatusTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="mo-timeline-cancelled">
        ❌ This order was cancelled.
      </div>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="mo-timeline">
      {STATUS_STEPS.map((step, i) => {
        const done    = i < currentIdx;
        const active  = i === currentIdx;
        const meta    = STATUS_META[step];
        return (
          <div key={step} className={`mo-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
            <div className="mo-step-dot">
              {done ? "✓" : active ? meta.icon : ""}
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`mo-step-line ${done ? "done" : ""}`} />
            )}
            <div className="mo-step-label">{meta.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function MyOrders() {
  const { user, token, openLogin } = useUser();
  const navigate                   = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [openId,  setOpenId]  = useState(null); // expanded order id

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const ac = new AbortController();
    setLoading(true);
    api.getMyOrders(user.id, token, ac.signal)
      .then((d) => { setOrders(d.orders || []); setLoading(false); })
      .catch((e) => { if (e.name !== "AbortError") { setError(e.message); setLoading(false); } });
    return () => ac.abort();
  }, [user, token]);

  /* Not logged in */
  if (!user) {
    return (
      <div className="mo-gate">
        <div className="mo-gate-card">
          <div className="mo-gate-icon">🔒</div>
          <h2>Sign In to View Your Orders</h2>
          <p>Log in to your Gedualpha account to track all your orders and payment status.</p>
          <button className="btn btn-accent" onClick={openLogin}>Log In</button>
          <Link to="/" className="btn btn-ghost" style={{ marginTop: "0.5rem" }}>← Browse Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mo-page">

      {/* Page header */}
      <div className="mo-page-head">
        <div>
          <h1>My Orders</h1>
          <p>Track your purchases and payment status in real time.</p>
        </div>
        <Link to="/" className="btn btn-ghost btn-sm">← Continue Shopping</Link>
      </div>

      {loading && (
        <div className="mo-loading">
          <div className="mo-spinner" />
          <span>Loading your orders…</span>
        </div>
      )}

      {error && (
        <div className="mo-error">⚠️ {error}</div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="mo-empty">
          <div className="mo-empty-icon">🛒</div>
          <h3>No orders yet</h3>
          <p>Once you place an order, it will appear here with live status tracking.</p>
          <Link to="/" className="btn btn-accent mt-4">Browse Marketplace</Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="mo-list">
          {orders.map((order) => {
            const meta     = STATUS_META[order.status] || STATUS_META.pending;
            const isOpen   = openId === order.id;
            const needsRef = (order.paymentMethod === "telebirr" || order.paymentMethod === "cbe")
                             && !order.paymentConfirmed;

            return (
              <div key={order.id} className={`mo-card ${isOpen ? "mo-card--open" : ""}`}>

                {/* ── Summary row ── */}
                <button className="mo-card-header" onClick={() => setOpenId(isOpen ? null : order.id)}>
                  <div className="mo-card-left">
                    <div className="mo-order-id">#{order.id}</div>
                    <div className="mo-order-date">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-ET", { year:"numeric", month:"short", day:"numeric" }) : "—"}
                    </div>
                  </div>

                  <div className="mo-card-mid">
                    <span className="mo-status-pill" style={{ background: meta.bg, color: meta.color, borderColor: `${meta.color}44` }}>
                      {meta.icon} {meta.label}
                    </span>
                    {needsRef && (
                      <span className="mo-ref-warning">⚠️ Awaiting payment confirmation</span>
                    )}
                  </div>

                  <div className="mo-card-right">
                    <div className="mo-total">{money(order.total)}</div>
                    <span className="mo-chevron">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </button>

                {/* ── Expanded detail ── */}
                {isOpen && (
                  <div className="mo-card-body">

                    {/* Status description */}
                    <div className="mo-status-desc" style={{ borderLeftColor: meta.color }}>
                      {meta.icon} {meta.desc}
                    </div>

                    {/* Timeline */}
                    <StatusTimeline status={order.status} />

                    {/* Payment ref status */}
                    {(order.paymentMethod === "telebirr" || order.paymentMethod === "cbe") && (
                      <div className={`mo-ref-box ${order.paymentConfirmed ? "mo-ref-box--ok" : "mo-ref-box--pending"}`}>
                        <div className="mo-ref-box-head">
                          {order.paymentConfirmed ? "✅ Payment Confirmed" : "⏳ Payment Pending Verification"}
                        </div>
                        {order.paymentRef
                          ? <div className="mo-ref-val">Reference: <code>{order.paymentRef}</code></div>
                          : <div className="mo-ref-val mo-ref-missing">No payment reference provided. Please contact support.</div>}
                        {order.paymentConfirmed && order.paymentConfirmedAt && (
                          <div className="mo-ref-val">Confirmed at: {new Date(order.paymentConfirmedAt).toLocaleString()}</div>
                        )}
                      </div>
                    )}

                    {/* Items */}
                    <div className="mo-items">
                      <div className="mo-items-title">Order Items</div>
                      {order.items?.map((it, i) => (
                        <div key={i} className="mo-item-row">
                          <span>{it.qty} × {it.name}</span>
                          <span>{money(it.price * it.qty)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="mo-totals">
                      <div className="mo-total-row"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
                      <div className="mo-total-row"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : money(order.shipping)}</span></div>
                      <div className="mo-total-row mo-total-row--bold"><span>Total</span><strong>{money(order.total)}</strong></div>
                    </div>

                    {/* Delivery info */}
                    {order.customer && (
                      <div className="mo-delivery">
                        <div className="mo-delivery-title">Delivery Details</div>
                        <p>{order.customer.name} — {order.customer.postal}</p>
                        <p>{order.customer.address}, {order.customer.city}</p>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
