import { useEffect } from "react";
import { Link } from "react-router-dom";
import ProductArt from "./ProductArt.jsx";
import { useCart } from "../CartContext.jsx";
import { FREE_SHIPPING_OVER, money } from "../money.js";

export default function CartDrawer() {
  const { items, open, setOpen, subtotal, setQty, remove } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const remaining = FREE_SHIPPING_OVER - subtotal;

  return (
    <>
      <div className={`scrim ${open ? "show" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? "open" : ""}`} aria-label="Shopping cart">
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart">Close</button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <p>Your cart is empty.</p>
            <a className="btn btn-blue" href="/#shop" onClick={() => setOpen(false)}>Browse the shop</a>
          </div>
        ) : (
          <>
            <p className="ship-note">
              {remaining > 0
                ? `Add ${money(remaining)} more for free shipping`
                : "You've unlocked free shipping"}
            </p>
            <ul className="lines">
              {items.map((i) => (
                <li key={i.id} className="line">
                  <div className="line-art"><ProductArt art={i.art} color={i.color} tint={i.tint} /></div>
                  <div className="line-info">
                    <strong>{i.name}</strong>
                    <span>{money(i.price)}</span>
                    <div className="qty">
                      <button onClick={() => setQty(i.id, i.qty - 1)} aria-label={`Remove one ${i.name}`}>−</button>
                      <span aria-live="polite">{i.qty}</span>
                      <button onClick={() => setQty(i.id, i.qty + 1)} aria-label={`Add one ${i.name}`}>+</button>
                      <button className="link-btn" onClick={() => remove(i.id)}>Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <div className="row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <Link to="/checkout" className="btn btn-gold btn-wide" onClick={() => setOpen(false)}>Go to checkout</Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
