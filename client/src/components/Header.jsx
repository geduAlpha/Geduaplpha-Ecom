import { Link } from "react-router-dom";
import { useCart } from "../CartContext.jsx";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6-5.2-6-10.2a6 6 0 1 1 12 0C18 15.8 12 21 12 21Z"/>
      <circle cx="12" cy="10" r="2"/>
    </svg>
  );
}
function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
}

export default function Header() {
  const { count, setOpen } = useCart();

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("gedualpha-theme", isDark ? "dark" : "light");
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = e.target.query.value.trim();
    if (q) window.location.href = `/?q=${encodeURIComponent(q)}`;
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">

          {/* Logo */}
          <Link to="/" className="header-logo" aria-label="Gedualpha Ecom home">
            <div className="logo-icon">G</div>
            Gedualpha<span>Ecom</span>
          </Link>

          {/* Location */}
          <button type="button" id="location-btn" className="location-btn" aria-label="Select city">
            <PinIcon />
            <span>Addis Ababa</span>
          </button>

          {/* Search bar */}
          <form className="search-bar" onSubmit={handleSearch} role="search" aria-label="Search products">
            <input
              type="search"
              name="query"
              id="header-search"
              placeholder="Search products…"
              autoComplete="off"
              aria-label="Search products"
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <SearchIcon />
            </button>
          </form>

          {/* Actions */}
          <div className="header-actions">
            {/* Sell button */}
            <Link to="/sell" className="sell-btn" id="sell-btn">
              <TagIcon />
              <span>Sell</span>
            </Link>

            {/* Cart */}
            <button
              id="cart-btn"
              className="cart-btn"
              onClick={() => setOpen(true)}
              aria-label={`Open cart, ${count} items`}
            >
              <CartIcon />
              {count > 0 && <span className="cart-badge" aria-hidden="true">{count}</span>}
            </button>

            {/* Dark mode toggle */}
            <button
              id="theme-toggle"
              className="theme-btn"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              <span className="dark-hide"><MoonIcon /></span>
              <span className="dark-show" style={{ display: "none" }}><SunIcon /></span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
