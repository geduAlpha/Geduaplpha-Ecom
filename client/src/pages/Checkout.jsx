import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../CartContext.jsx";
import { useUser } from "../UserContext.jsx";
import { money, shippingFor } from "../money.js";

const GATEWAYS = [
  { id: "telebirr", name: "Telebirr",  icon: "📱", badge: "Most Popular",
    accountNo: "092627366", accountLabel: "Telebirr No.",
    hint: "Open Telebirr → Pay Merchant → 092627366 → note the transaction code" },
  { id: "cbe",      name: "CBE Birr",  icon: "🏦", badge: "Direct Bank",
    accountNo: "1000254874705", accountLabel: "CBE Account",
    hint: "Transfer via CBE mobile app or branch → save the reference number" },
  { id: "chapa",    name: "Chapa",     icon: "💳", badge: "Cards & Mobile",
    accountNo: null, accountLabel: null,
    hint: "Pay with Visa, Mastercard, or any Ethiopian mobile bank" },
  { id: "cod",      name: "Cash on Delivery", icon: "💵", badge: "Pay at Door",
    accountNo: null, accountLabel: null,
    hint: "Prepare cash or Telebirr upon physical delivery" },
];

const STATUS_META = {
  pending:    { label: "Pending",    color: "#eab308", icon: "⏳" },
  paid:       { label: "Paid",       color: "#16a34a", icon: "✅" },
  processing: { label: "Processing", color: "#0284c7", icon: "⚙️" },
  shipped:    { label: "Shipped",    color: "#7c3aed", icon: "🚚" },
  delivered:  { label: "Delivered",  color: "#059669", icon: "📦" },
  cancelled:  { label: "Cancelled",  color: "#dc2626", icon: "❌" },
};

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user }                   = useUser();
  const navigate                   = useNavigate();

  const [form, setForm] = useState({
    name:    user?.name  || "",
    email:   user?.email || "",
    phone:   user?.phone || "",
    city:    "Addis Ababa",
    subcity: "Bole",
    address: "",
  });
  const [paymentMethod,  setPaymentMethod]  = useState("telebirr");
  const [transactionRef, setTransactionRef] = useState("");
  const [copiedKey,      setCopiedKey]      = useState("");
  const [errors,         setErrors]         = useState({});
  const [busy,           setBusy]           = useState(false);
  const [order,          setOrder]          = useState(null);

  const shipping = shippingFor(subtotal);
  const total    = subtotal + shipping;
  const needsRef = paymentMethod === "telebirr" || paymentMethod === "cbe";
  const activeGw = GATEWAYS.find((g) => g.id === paymentMethod);

  function copyToClipboard(text, key) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2500);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});

    const errs = {};
    if (!form.name.trim())    errs.name    = "Full name is required";
    if (!form.phone.trim())   errs.phone   = "Phone number is required";
    if (!form.address.trim()) errs.address = "Delivery address is required";
    if (needsRef && !transactionRef.trim()) {
      errs.ref = `Please enter your ${activeGw?.name} transaction reference before placing the order.`;
    }
    if (Object.keys(errs).length) { setErrors(errs); setBusy(false); return; }

    try {
      const email = form.email.trim() ||
        `${form.phone.replace(/[^0-9]/g, "")}@gedualpha.customer`;

      const created = await api.createOrder({
        customer: {
          name:    form.name.trim(),
          email,
          address: `${form.address.trim()} (${form.subcity})`,
          city:    form.city,
          postal:  form.phone.trim(),
        },
        items:         items.map(({ id, qty }) => ({ id, qty })),
        paymentMethod,
        paymentRef:    transactionRef.trim(),
        userId:        user?.id    || null,
        buyerPhone:    form.phone.trim(),
      });

      if (paymentMethod === "chapa") {
        try {
          const init = await api.initializeChapa({
            amount: total, email,
            firstName: form.name.split(" ")[0],
            lastName:  form.name.split(" ")[1] || "Customer",
            phone:     form.phone,
            orderId:   created.id,
            returnUrl: `${window.location.origin}/my-orders`,
          });
          if (init?.checkoutUrl) { window.location.href = init.checkoutUrl; return; }
        } catch (ce) { console.warn("Chapa:", ce); }
      }

      setOrder(created);
      clear();
    } catch (err) {
      setErrors(err.errors ?? { form: err.message || "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  /* ── Order confirmed screen ──────────────────────────────────────── */
  if (order) {
    const gw  = GATEWAYS.find((g) => g.id === paymentMethod);
    const sm  = STATUS_META[order.status] || STATUS_META.pending;

    return (
      <div className="co-confirm">
        <div className="co-confirm-card">
          <div className="co-confirm-icon">🎉</div>
          <h1>Order Placed!</h1>
          <div className="co-order-id">Order ID: <strong>#{order.id}</strong></div>

          <div className="co-status-pill" style={{ background: `${sm.color}18`, color: sm.color, borderColor: `${sm.color}44` }}>
            {sm.icon} Status: <strong>{sm.label}</strong>
          </div>

          <p className="co-confirm-body">
            Your order of <strong>{money(order.total)}</strong> has been received.
            {needsRef && transactionRef && (
              <> Your payment reference <code>{transactionRef}</code> has been submitted and will be verified by our team.</>
            )}
            {" "}We'll contact you at <strong>{form.phone}</strong> to confirm delivery.
          </p>

          {/* Payment instructions */}
          {(paymentMethod === "telebirr" || paymentMethod === "cbe") && gw?.accountNo && (
            <div className="co-pay-box">
              <div className="co-pay-head">
                {gw.icon} {gw.name} Payment Instructions
              </div>
              <div className="co-pay-row">
                <div>
                  <div className="co-pay-label">{gw.accountLabel}</div>
                  <div className="co-pay-val">{gw.accountNo}</div>
                </div>
                <button className="co-copy-btn" onClick={() => copyToClipboard(gw.accountNo, "confirm")}>
                  {copiedKey === "confirm" ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <p className="co-pay-hint">{gw.hint}</p>
              {transactionRef && (
                <div className="co-ref-submitted">
                  ✓ Your reference <strong>{transactionRef}</strong> has been saved. Admin will verify and confirm your payment.
                </div>
              )}
            </div>
          )}

          {paymentMethod === "cod" && (
            <div className="co-pay-box">
              <div className="co-pay-head">💵 Cash on Delivery</div>
              <p className="co-pay-hint">Prepare <strong>{money(total)}</strong> in cash or Telebirr upon delivery.</p>
            </div>
          )}

          <div className="co-confirm-actions">
            {user && (
              <Link to="/my-orders" className="btn btn-accent">
                📦 View My Orders
              </Link>
            )}
            <Link to="/" className="btn btn-ghost">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Empty cart ─────────────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="page-empty">
        <div style={{ fontSize: "3rem" }}>🛒</div>
        <h1>Your cart is empty</h1>
        <p>Browse the marketplace and add what you love.</p>
        <Link className="btn btn-accent mt-4" to="/">Browse Marketplace</Link>
      </div>
    );
  }

  /* ── Checkout form ──────────────────────────────────────────────── */
  return (
    <div className="checkout-page container" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>
      <div className="checkout-form-card">
        <h1 className="checkout-title">Express Checkout</h1>

        {user && (
          <div className="co-user-banner">
            <span>👤</span>
            <span>Checking out as <strong>{user.name}</strong> — your order will appear in My Orders.</span>
          </div>
        )}

        <form onSubmit={submit} noValidate>

          {/* ── 1. Contact ── */}
          <div className="form-section">
            <label className="form-section-title">1. Delivery Contact</label>
            <div className="field">
              <span>Full Name *</span>
              <input type="text" placeholder="e.g. Abebech Tadesse"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                aria-invalid={!!errors.name} />
              {errors.name && <em className="error">{errors.name}</em>}
            </div>
            <div className="fields-row">
              <div className="field">
                <span>Phone Number *</span>
                <input type="tel" placeholder="+251912627366"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  aria-invalid={!!errors.phone} />
                {errors.phone && <em className="error">{errors.phone}</em>}
              </div>
              <div className="field">
                <span>Email (Optional)</span>
                <input type="email" placeholder="name@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
          </div>

          {/* ── 2. Location ── */}
          <div className="form-section">
            <label className="form-section-title">2. Delivery Location</label>
            <div className="fields-row">
              <div className="field">
                <span>City</span>
                <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                  {["Addis Ababa","Adama","Hawassa","Bahir Dar","Dire Dawa","Mekelle","Gondar","Jimma","Bishoftu"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <span>Subcity / Area</span>
                <input type="text" placeholder="e.g. Bole, Kazanchis"
                  value={form.subcity} onChange={(e) => setForm({ ...form, subcity: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <span>Street Address &amp; Landmark *</span>
              <input type="text" placeholder="e.g. Near Edna Mall, Behind Medhanialem Church"
                value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                aria-invalid={!!errors.address} />
              {errors.address && <em className="error">{errors.address}</em>}
            </div>
          </div>

          {/* ── 3. Payment Method ── */}
          <div className="form-section">
            <label className="form-section-title">3. Payment Method</label>
            <div className="co-gw-grid">
              {GATEWAYS.map((gw) => (
                <label key={gw.id} className={`co-gw-card ${paymentMethod === gw.id ? "active" : ""}`}>
                  <input type="radio" name="payment" value={gw.id}
                    checked={paymentMethod === gw.id}
                    onChange={() => { setPaymentMethod(gw.id); setTransactionRef(""); setErrors((prev) => ({ name: prev.name, phone: prev.phone, address: prev.address })); }} />
                  <span className="co-gw-icon">{gw.icon}</span>
                  <div className="co-gw-info">
                    <strong>{gw.name}</strong>
                    {gw.badge && <span className="co-gw-badge">{gw.badge}</span>}
                    <p>{gw.hint}</p>
                  </div>
                  {paymentMethod === gw.id && <span className="co-gw-check">✓</span>}
                </label>
              ))}
            </div>

            {/* Account details for Telebirr / CBE */}
            {activeGw?.accountNo && (
              <div className="co-account-box">
                <div className="co-account-head">
                  {activeGw.icon} Send <strong>{money(total)}</strong> to:
                </div>
                <div className="co-account-row">
                  <div>
                    <div className="co-account-label">{activeGw.accountLabel}</div>
                    <div className="co-account-val">{activeGw.accountNo}</div>
                  </div>
                  <button type="button" className="co-copy-btn"
                    onClick={() => copyToClipboard(activeGw.accountNo, "form")}>
                    {copiedKey === "form" ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Payment Reference input (required for Telebirr/CBE) ── */}
            {needsRef && (
              <div className="co-ref-field">
                <label className="co-ref-label">
                  Transaction Reference Number <span className="co-ref-req">*</span>
                </label>
                <p className="co-ref-hint">
                  After paying via {activeGw?.name}, copy the transaction ID from your app and paste it here.
                  The admin will use this to confirm your payment.
                </p>
                <input
                  className={`co-ref-input ${errors.ref ? "co-ref-input--err" : ""}`}
                  type="text"
                  placeholder={paymentMethod === "telebirr" ? "e.g. CI64839201" : "e.g. FT240984920"}
                  value={transactionRef}
                  onChange={(e) => { setTransactionRef(e.target.value); setErrors((p) => ({ ...p, ref: "" })); }}
                />
                {errors.ref && <em className="co-ref-error">{errors.ref}</em>}
              </div>
            )}
          </div>

          {(errors.items || errors.form) && (
            <p className="error" style={{ marginBottom: "1rem" }}>⚠️ {errors.items || errors.form}</p>
          )}

          <button className="btn btn-accent btn-wide"
            style={{ padding: "1rem", fontSize: "1.1rem", marginTop: "0.5rem" }}
            disabled={busy}>
            {busy ? "Processing…"
              : paymentMethod === "chapa" ? `Pay with Chapa — ${money(total)}`
              : `Place Order — ${money(total)}`}
          </button>
        </form>
      </div>

      {/* ── Summary ── */}
      <aside className="summary-card" aria-label="Order summary">
        <h2>Order Summary</h2>
        <ul>
          {items.map((i) => (
            <li key={i.id}><span>{i.qty} × {i.name}</span><span>{money(i.qty * i.price)}</span></li>
          ))}
        </ul>
        <div className="summary-divider" />
        <div className="summary-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? "🎉 Free" : money(shipping)}</span></div>
        <div className="summary-divider" />
        <div className="summary-row total"><span>Total (ETB)</span><strong>{money(total)}</strong></div>
        <div className="delivery-guarantee-badge" style={{ marginTop: "1rem" }}>
          🛡️ Telebirr · CBE · Chapa · Cash on Delivery
        </div>
      </aside>
    </div>
  );
}
