import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../CartContext.jsx";
import { money, shippingFor } from "../money.js";

const FIELDS = [
  ["name",    "Full name",      "name",           "text"  ],
  ["email",   "Email address",  "email",          "email" ],
  ["address", "Street address", "street-address", "text"  ],
  ["city",    "City",           "address-level2", "text"  ],
  ["postal",  "Postal code",    "postal-code",    "text"  ],
];

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const [form,   setForm]   = useState({ name: "", email: "", address: "", city: "", postal: "" });
  const [errors, setErrors] = useState({});
  const [busy,   setBusy]   = useState(false);
  const [order,  setOrder]  = useState(null);

  const shipping = shippingFor(subtotal);
  const total    = subtotal + shipping;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const created = await api.createOrder({
        customer: form,
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
          <div className="confirm-icon">✅</div>
          <h1>Thank you, {order.customer.name.split(" ")[0]}!</h1>
          <div className="order-badge">Order #{order.id}</div>
          <p>
            Your order for <strong>{money(order.total)}</strong> is confirmed.
            A receipt is on its way to <strong>{order.customer.email}</strong>.
          </p>
          <Link className="btn btn-accent btn-wide" to="/" id="keep-shopping-btn">
            Keep shopping
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
        <p>Add something you like and it will show up here.</p>
        <Link className="btn btn-accent mt-4" to="/" id="go-shop-btn">Browse the shop</Link>
      </div>
    );
  }

  /* ── Checkout form ── */
  return (
    <div className="checkout-page container" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>

      {/* Form card */}
      <div className="checkout-form-card">
        <h1 className="checkout-title">Checkout</h1>

        <form onSubmit={submit} noValidate id="checkout-form">
          {FIELDS.map(([key, label, autoComplete, type]) => (
            <label key={key} className="field" htmlFor={`field-${key}`}>
              <span>{label}</span>
              <input
                id={`field-${key}`}
                type={type}
                autoComplete={autoComplete}
                value={form[key]}
                aria-invalid={Boolean(errors[key])}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
              {errors[key] && <em className="error" role="alert">{errors[key]}</em>}
            </label>
          ))}

          {(errors.items || errors.form) && (
            <p className="error" role="alert" style={{ marginBottom: "1rem" }}>
              ⚠️ {errors.items || errors.form}
            </p>
          )}

          <button
            id="place-order-btn"
            className="btn btn-accent btn-wide"
            style={{ padding: "0.875rem", fontSize: "1rem", marginTop: "0.5rem" }}
            disabled={busy}
          >
            {busy ? "Placing order…" : `Place order — ${money(total)}`}
          </button>

          <p className="fine" style={{ marginTop: "0.875rem" }}>
            💳 Payment is not connected yet — see the README to add Stripe.
          </p>
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
          <span>Shipping</span>
          <span>{shipping === 0 ? "🎉 Free" : money(shipping)}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-row total">
          <span>Total</span>
          <strong>{money(total)}</strong>
        </div>
      </aside>
    </div>
  );
}
