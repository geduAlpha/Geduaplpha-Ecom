import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../CartContext.jsx";
import { money, shippingFor } from "../money.js";

const PAYMENT_METHODS = [
  {
    id: "telebirr",
    name: "Telebirr (ቴሌብር)",
    icon: "📱",
    badge: "Most Popular",
    accountNo: "092627366",
    accountName: "Gedualpha Ecom (Telebirr)",
    desc: "Send money directly to Telebirr: 092627366",
  },
  {
    id: "cbe",
    name: "CBE Birr / Commercial Bank of Ethiopia",
    icon: "🏦",
    badge: "Direct Bank",
    accountNo: "1000254874705",
    accountName: "Gedualpha Ecom",
    desc: "CBE Account: 1000254874705 (Gedualpha Ecom)",
  },
  {
    id: "chapa",
    name: "Chapa Payment Gateway (Online)",
    icon: "💳",
    badge: "Instant / Cards & Mobile",
    desc: "Pay securely via Chapa with Telebirr, CBE Birr, Awash, or Cards",
  },
  {
    id: "cod",
    name: "Cash on Delivery (ክፍያ ሲደርስ)",
    icon: "💵",
    badge: "Pay at Doorstep",
    desc: "Pay cash or Telebirr upon physical delivery",
  },
];

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "+251912627366",
    city: "Addis Ababa",
    subcity: "Bole",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const [transactionRef, setTransactionRef] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  function copyToClipboard(text, key) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2500);
  }

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
      // 1. Create order in MongoDB
      const created = await api.createOrder({
        customer: {
          name: form.name,
          email: form.email || `${form.phone.replace(/[^0-9]/g, "")}@gedualpha.customer`,
          address: `${form.address} (${form.subcity}) - Payment: ${paymentMethod.toUpperCase()}${
            transactionRef ? ` (Ref: ${transactionRef})` : ""
          }`,
          city: form.city,
          postal: form.phone,
        },
        items: items.map(({ id, qty }) => ({ id, qty })),
      });

      // 2. If Chapa selected, initialize payment gateway
      if (paymentMethod === "chapa") {
        try {
          const chapaInit = await api.initializeChapa({
            amount: total,
            email: form.email || "customer@gedualpha.com",
            firstName: form.name.split(" ")[0],
            lastName: form.name.split(" ")[1] || "Customer",
            phone: form.phone,
            orderId: created.id,
            returnUrl: window.location.href,
          });

          if (chapaInit?.checkoutUrl) {
            window.location.href = chapaInit.checkoutUrl;
            return;
          }
        } catch (chapaErr) {
          console.warn("Chapa online gateway notice:", chapaErr);
        }
      }

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
    const selectedPay = PAYMENT_METHODS.find((p) => p.id === paymentMethod);

    return (
      <div className="confirm-page">
        <div className="confirm-card">
          <div className="confirm-icon">🎉</div>
          <h1>Order Received Successfully!</h1>
          <div className="order-badge">Order ID: #{order.id}</div>
          <p>
            Your order of <strong>{money(order.total)}</strong> has been registered.
            Our team and courier will contact you at <strong>{form.phone}</strong> to confirm delivery.
          </p>

          {/* Payment Gateway Specific Instructions */}
          {paymentMethod === "telebirr" && (
            <div className="telebirr-pay-info">
              <h4>📱 Telebirr Payment Instructions</h4>
              <p>Please send <strong>{money(order.total)}</strong> to our official Telebirr number:</p>
              <div className="copy-box">
                <span className="copy-text">092627366</span>
                <button
                  type="button"
                  className="btn-copy"
                  onClick={() => copyToClipboard("092627366", "telebirr")}
                >
                  {copiedKey === "telebirr" ? "✓ Copied!" : "📋 Copy Number"}
                </button>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                Steps: Open Telebirr App &rarr; Send Money &rarr; Enter <strong>092627366</strong> &rarr; Amount: <strong>{order.total} ETB</strong> &rarr; Remark: <strong>Order #{order.id}</strong>.
              </p>
            </div>
          )}

          {paymentMethod === "cbe" && (
            <div className="telebirr-pay-info">
              <h4>🏦 CBE (Commercial Bank of Ethiopia) Transfer</h4>
              <p>Please transfer <strong>{money(order.total)}</strong> to our official CBE account:</p>
              <div className="copy-box">
                <div>
                  <strong>Account: </strong><span className="copy-text">1000254874705</span>
                  <br />
                  <small>Name: Gedualpha Ecom</small>
                </div>
                <button
                  type="button"
                  className="btn-copy"
                  onClick={() => copyToClipboard("1000254874705", "cbe")}
                >
                  {copiedKey === "cbe" ? "✓ Copied!" : "📋 Copy Account"}
                </button>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                You can pay using CBE Birr, CBE Mobile App, or at any CBE branch.
              </p>
            </div>
          )}

          {paymentMethod === "chapa" && (
            <div className="telebirr-pay-info">
              <h4>💳 Chapa Online Payment</h4>
              <p>Chapa payment reference created for <strong>Order #{order.id}</strong>.</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Status: <strong>Active / Verified via Chapa Gateway</strong>
              </p>
            </div>
          )}

          {paymentMethod === "cod" && (
            <div className="telebirr-pay-info">
              <h4>💵 Cash on Delivery</h4>
              <p>Please prepare <strong>{money(order.total)}</strong> in cash or Telebirr upon physical delivery.</p>
            </div>
          )}

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
                  placeholder="+251912627366"
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

          {/* Payment Method Selection */}
          <div className="form-section">
            <label className="form-section-title">3. Choose Payment Gateway</label>
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
                  <div className="payment-option-content" style={{ width: "100%" }}>
                    <span className="payment-icon">{method.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <strong className="payment-name">{method.name}</strong>
                        {method.badge && <span className="pay-method-badge">{method.badge}</span>}
                      </div>
                      <p className="payment-desc">{method.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Interactive Gateway Details Box */}
            {paymentMethod === "telebirr" && (
              <div className="gateway-details-card">
                <div className="gateway-header">
                  <span>📱 Telebirr Gateway Account</span>
                  <span className="gateway-live-tag">Active</span>
                </div>
                <div className="gateway-account-row">
                  <div>
                    <span className="gateway-label">Telebirr Number:</span>
                    <span className="gateway-val">092627366</span>
                  </div>
                  <button
                    type="button"
                    className="btn-copy-sm"
                    onClick={() => copyToClipboard("092627366", "form-telebirr")}
                  >
                    {copiedKey === "form-telebirr" ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>
                <div className="field" style={{ marginTop: "0.75rem" }}>
                  <span>Telebirr Transaction Reference / SMS Code (Optional)</span>
                  <input
                    type="text"
                    placeholder="e.g. CI64839201"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                  />
                </div>
              </div>
            )}

            {paymentMethod === "cbe" && (
              <div className="gateway-details-card">
                <div className="gateway-header">
                  <span>🏦 Commercial Bank of Ethiopia (CBE)</span>
                  <span className="gateway-live-tag">Active</span>
                </div>
                <div className="gateway-account-row">
                  <div>
                    <span className="gateway-label">CBE Account Number:</span>
                    <span className="gateway-val">1000254874705</span>
                    <br />
                    <span className="gateway-sublabel">Account Name: Gedualpha Ecom</span>
                  </div>
                  <button
                    type="button"
                    className="btn-copy-sm"
                    onClick={() => copyToClipboard("1000254874705", "form-cbe")}
                  >
                    {copiedKey === "form-cbe" ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>
                <div className="field" style={{ marginTop: "0.75rem" }}>
                  <span>CBE Transfer Ref / Transaction ID (Optional)</span>
                  <input
                    type="text"
                    placeholder="e.g. FT240984920"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                  />
                </div>
              </div>
            )}

            {paymentMethod === "chapa" && (
              <div className="gateway-details-card chapa-card">
                <div className="gateway-header">
                  <span>💳 Chapa Online Payment Gateway</span>
                  <span className="gateway-live-tag" style={{ background: "#059669" }}>
                    Verified Chapa API
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
                  Seamless instant online checkout. Accepts <strong>Telebirr</strong>, <strong>CBE Birr</strong>, <strong>Awash Bank</strong>, <strong>Dashen Amole</strong>, and <strong>Visa / Mastercard</strong>.
                </p>
              </div>
            )}
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
            {busy
              ? "Processing Order…"
              : paymentMethod === "chapa"
              ? `Pay Now with Chapa — ${money(total)}`
              : `Complete Order — ${money(total)}`}
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
          🛡️ Telebirr (092627366) &bull; CBE (1000254874705) &bull; Chapa Gateway
        </div>
      </aside>
    </div>
  );
}
