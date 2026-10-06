import { useEffect } from "react";
import { Link } from "react-router-dom";
import ProductArt from "./ProductArt.jsx";
import { useCart } from "../CartContext.jsx";
import { FREE_SHIPPING_OVER, money } from "../money.js";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="48" height="48">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

export default function CartDrawer() {
  const { items, open, setOpen, subtotal, setQty, remove } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const remaining = Math.max(0, FREE_SHIPPING_OVER - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_OVER) * 100);

  return (
    <>
      <div
        className={`scrim ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`drawer ${open ? "open" : ""}`}
        aria-label="Shopping cart"
        aria-modal="true"
        role="dialog"
        id="cart-drawer"
      >
        {/* Header */}
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button
            className="close-btn"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            id="close-cart-btn"
          >
            <XIcon />
          </button>
        </div>

        {/* Free shipping progress */}
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

        {/* Body */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="drawer-empty">
              <BagIcon />
              <p>Your cart is empty</p>
              <Link
                className="btn btn-accent"
                to="/"
                onClick={() => setOpen(false)}
                id="browse-shop-btn"
              >
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
                      <button
                        className="qty-btn"
                        onClick={() => setQty(i.id, i.qty - 1)}
                        aria-label={`Remove one ${i.name}`}
                      >−</button>
                      <span className="qty-val" aria-live="polite">{i.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => setQty(i.id, i.qty + 1)}
                        aria-label={`Add one ${i.name}`}
                      >+</button>
                      <button
                        className="remove-btn"
                        onClick={() => remove(i.id)}
                        aria-label={`Remove ${i.name} from cart`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="subtotal-row">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <Link
              to="/checkout"
              className="btn btn-accent btn-wide"
              onClick={() => setOpen(false)}
              id="checkout-btn"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
