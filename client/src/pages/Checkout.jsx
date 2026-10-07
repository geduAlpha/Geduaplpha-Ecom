import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../CartContext.jsx";
import { money, shippingFor } from "../money.js";

const PAYMENT_METHODS = [
  { id: "telebirr", name: "Telebirr (ቴሌብር)", icon: "📱", desc: "Instant mobile payment via Ethio Telecom" },
  { id: "cbe", name: "CBE Birr / Commercial Bank of Ethiopia", icon: "🏦", desc: "Direct CBE mobile banking or transfer" },
  { id: "cod", name: "Cash / Birr on Delivery (ክፍያ ሲደርስ)", icon: "💵", desc: "Pay cash or Telebirr upon physical delivery" },
  { id: "chapa", name: "Chapa / Awash / Dashen Bank", icon: "💳", desc: "Pay securely with local debit card" },
];

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "+251 ",
    city: "Addis Ababa",
    subcity: "Bole",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});

    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.phone.trim() || form.phone.trim() === "+251") {
      newErrors.phone = "Valid Ethiopian phone number is required";
    }
    if (!form.address.trim()) newErrors.address = "Delivery address / landmark is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setBusy(false);
      return;
    }

    try {
      const created = await api.createOrder({
        customer: {
          name: form.name,
          email: form.email || `${form.phone.replace(/[^0-9]/g, "")}@gedualpha.customer`,
          address: `${form.address} (${form.subcity}) - Payment: ${paymentMethod.toUpperCase()}`,
          city: form.city,
          postal: form.phone,
        },
        items: items.map(({ id, qty }) => ({ id, qty })),
      });
      setOrder(created);
      clear();
    } catch (err) {
      setErrors(err.errors ?? { form: "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  /* ── Order confirmed ── */
  if (order) {
    return (
      <div className="confirm-page">
        <div className="confirm-card">
          <div className="confirm-icon">🎉</div>
          <h1>Order Confirmed!</h1>
          <div className="order-badge">Order ID: #{order.id}</div>
          <p>
            Your order of <strong>{money(order.total)}</strong> has been received.
            The seller / courier will call you at <strong>{form.phone}</strong> for delivery verification.
          </p>

          <div className="telebirr-pay-info">
            <h4>📱 Payment Reference</h4>
            <p>
              Method selected: <strong>{PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.name}</strong>
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--color-ink-muted)", marginTop: "0.25rem" }}>
              Please have <strong>{money(order.total)}</strong> ready for payment.
            </p>
          </div>

          <Link className="btn btn-accent btn-wide" to="/" id="keep-shopping-btn">
            ← Continue Browsing Marketplace
          </Link>
        </div>
      </div>
    );
  }

  /* ── Empty cart ── */
  if (items.length === 0) {
    return (
      <div className="page-empty">
        <div style={{ fontSize: "3rem" }}>🛒</div>
        <h1>Your cart is empty</h1>
        <p>Explore marketplace items in Addis Ababa and add what you love.</p>
        <Link className="btn btn-accent mt-4" to="/" id="go-shop-btn">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  /* ── Checkout form ── */
  return (
    <div className="checkout-page container" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>
      <div className="checkout-form-card">
        <h1 className="checkout-title">Express Checkout</h1>
        <p className="checkout-subtitle">Fast delivery across Addis Ababa and major Ethiopian cities.</p>

        <form onSubmit={submit} noValidate id="checkout-form">
          {/* Customer Info */}
          <div className="form-section">
            <label className="form-section-title">1. Delivery Contact</label>

            <div className="field">
              <span>Full Name *</span>
              <input
                id="field-name"
                type="text"
                placeholder="e.g. Abebech Tadesse"
                value={form.name}
                aria-invalid={Boolean(errors.name)}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <em className="error" role="alert">{errors.name}</em>}
            </div>

            <div className="fields-row">
              <div className="field">
                <span>Phone Number (Telebirr/CBE) *</span>
                <input
                  id="field-phone"
                  type="tel"
                  placeholder="+251 91 123 4567"
                  value={form.phone}
                  aria-invalid={Boolean(errors.phone)}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                {errors.phone && <em className="error" role="alert">{errors.phone}</em>}
              </div>

              <div className="field">
                <span>Email Address (Optional)</span>
                <input
                  id="field-email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="form-section">
            <label className="form-section-title">2. Delivery Location</label>
            <div className="fields-row">
              <div className="field">
                <span>City</span>
                <select
                  id="field-city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                >
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Adama">Adama</option>
                  <option value="Hawassa">Hawassa</option>
                  <option value="Bahir Dar">Bahir Dar</option>
                  <option value="Dire Dawa">Dire Dawa</option>
                  <option value="Mekelle">Mekelle</option>
                  <option value="Gondar">Gondar</option>
                  <option value="Jimma">Jimma</option>
                  <option value="Bishoftu">Bishoftu</option>
                </select>
              </div>

              <div className="field">
                <span>Subcity / Area</span>
                <input
                  id="field-subcity"
                  type="text"
                  placeholder="e.g. Bole, Kazanchis, CMC..."
                  value={form.subcity}
                  onChange={(e) => setForm({ ...form, subcity: e.target.value })}
                />
              </div>
            </div>

            <div className="field">
              <span>Street Address &amp; Prominent Landmark *</span>
              <input
                id="field-address"
                type="text"
                placeholder="e.g. Near Edna Mall, Behind Medhanialem Church"
                value={form.address}
                aria-invalid={Boolean(errors.address)}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              {errors.address && <em className="error" role="alert">{errors.address}</em>}
            </div>
          </div>

          {/* Payment Method */}
          <div className="form-section">
            <label className="form-section-title">3. Choose Payment Method</label>
            <div className="payment-options-grid">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`payment-option-card ${paymentMethod === method.id ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                  />
                  <div className="payment-option-content">
                    <span className="payment-icon">{method.icon}</span>
                    <div>
                      <strong className="payment-name">{method.name}</strong>
                      <p className="payment-desc">{method.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {(errors.items || errors.form) && (
            <p className="error" role="alert" style={{ marginBottom: "1rem" }}>
              ⚠️ {errors.items || errors.form}
            </p>
          )}

          <button
            id="place-order-btn"
            className="btn btn-accent btn-wide"
            style={{ padding: "1rem", fontSize: "1.1rem", marginTop: "1rem" }}
            disabled={busy}
          >
            {busy ? "Confirming Order…" : `Complete Order — ${money(total)}`}
          </button>
        </form>
      </div>

      {/* Summary card */}
      <aside className="summary-card" aria-label="Order summary" id="order-summary">
        <h2>Order summary</h2>
        <ul>
          {items.map((i) => (
            <li key={i.id}>
              <span>{i.qty} × {i.name}</span>
              <span>{money(i.qty * i.price)}</span>
            </li>
          ))}
        </ul>
        <div className="summary-divider" />
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{money(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Courier Shipping</span>
          <span>{shipping === 0 ? "🎉 Free Delivery" : money(shipping)}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-row total">
          <span>Total (ETB)</span>
          <strong>{money(total)}</strong>
        </div>

        <div className="delivery-guarantee-badge">
          🛡️ Verified Ethiopian Seller Escrow &bull; Fast Delivery Guarantee
        </div>
      </aside>
    </div>
  );
}

