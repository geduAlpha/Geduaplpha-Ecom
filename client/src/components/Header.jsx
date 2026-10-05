import { Link } from "react-router-dom";
import { useCart } from "../CartContext.jsx";

export default function Header() {
  const { count, setOpen } = useCart();
  return (
    <header className="header">
      <div className="wrap header-inner">
        <Link to="/" className="logo">Marigold Supply</Link>
        <nav className="nav" aria-label="Main">
          <a href="/#shop">Shop</a>
          <button className="cart-btn" onClick={() => setOpen(true)}>
            Cart
            <span className="cart-count" aria-label={`${count} items in cart`}>{count}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
