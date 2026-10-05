import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../CartContext.jsx";
import { money, shippingFor } from "../money.js";

const FIELDS = [
  ["name", "Full name", "name"],
  ["email", "Email", "email"],
  ["address", "Street address", "street-address"],
  ["city", "City", "address-level2"],
  ["postal", "Postal code", "postal-code"],
];

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", postal: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);

  const shipping = shippingFor(subtotal);

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

  if (order) {
    return (
      <section className="wrap page">
        <h1>Thank you, {order.customer.name.split(" ")[0]}</h1>
        <p>Order <strong>{order.id}</strong> is confirmed. A receipt for {money(order.total)} is on its way to {order.customer.email}.</p>
        <Link className="btn btn-blue" to="/">Keep shopping</Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="wrap page">
        <h1>Your cart is empty</h1>
        <p>Add something you like and it will show up here.</p>
        <Link className="btn btn-blue" to="/">Browse the shop</Link>
      </section>
    );
  }

  return (
    <section className="wrap checkout">
      <form onSubmit={submit} noValidate className="checkout-form">
        <h1>Checkout</h1>
        {FIELDS.map(([key, label, autoComplete]) => (
          <label key={key} className="field">
            <span>{label}</span>
            <input
              type={key === "email" ? "email" : "text"}
              autoComplete={autoComplete}
              value={form[key]}
              aria-invalid={Boolean(errors[key])}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
            {errors[key] && <em className="error">{errors[key]}</em>}
          </label>
        ))}
        {(errors.items || errors.form) && <p className="error" role="alert">{errors.items || errors.form}</p>}
        <button className="btn btn-gold" disabled={busy}>{busy ? "Placing order…" : `Place order, ${money(subtotal + shipping)}`}</button>
        <p className="fine">Payment is not connected yet. See the README to add Stripe.</p>
      </form>

      <aside className="summary" aria-label="Order summary">
        <h2>Order summary</h2>
        <ul>
          {items.map((i) => (
            <li key={i.id}><span>{i.qty} × {i.name}</span><span>{money(i.qty * i.price)}</span></li>
          ))}
        </ul>
        <div className="row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <div className="row"><span>Shipping</span><span>{shipping === 0 ? "Free" : money(shipping)}</span></div>
        <div className="row total"><span>Total</span><strong>{money(subtotal + shipping)}</strong></div>
      </aside>
    </section>
  );
}
