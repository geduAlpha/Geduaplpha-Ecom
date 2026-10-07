import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../CartContext.jsx";
import { api } from "../api.js";

/* ── Icons ──────────────────────────────────────────────────────────── */
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
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function EyeIcon({ off }) {
  if (off) return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

/* ── Auth helpers (shared with Admin.jsx via localStorage) ─────────── */
export function getAdminAuth() {
  return localStorage.getItem("gedualpha_admin_auth") === "true";
}
export function setAdminAuth(val) {
  if (val) localStorage.setItem("gedualpha_admin_auth", "true");
  else localStorage.removeItem("gedualpha_admin_auth");
}

/* ── Header Component ───────────────────────────────────────────────── */
export default function Header() {
  const { count, setOpen } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [locModalOpen, setLocModalOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get("city") || localStorage.getItem("gedualpha-city") || "All Ethiopia"
  );

  /* Auth state */
  const [isAdmin, setIsAdmin] = useState(getAdminAuth);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginPw, setLoginPw] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    api.locations(ac.signal)
      .then((res) => { if (res.cities) setLocations(res.cities); })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  /* Close user menu on outside click */
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = () => setUserMenuOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [userMenuOpen]);

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("gedualpha-theme", isDark ? "dark" : "light");
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = e.target.query.value.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  function selectCity(city) {
    setSelectedCity(city);
    localStorage.setItem("gedualpha-city", city);
    setLocModalOpen(false);
    navigate(city === "All Ethiopia" ? "/" : `/?city=${encodeURIComponent(city)}`);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await api.adminLogin(loginPw);
      if (res.status === "ok") {
        setAdminAuth(true);
        setIsAdmin(true);
        setLoginOpen(false);
        setLoginPw("");
        navigate("/admin");
      }
    } catch {
      setLoginError("Incorrect password. Try admin123.");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    setAdminAuth(false);
    setIsAdmin(false);
    setUserMenuOpen(false);
    navigate("/");
  }

  function openLogin() {
    setLoginError("");
    setLoginPw("");
    setShowPw(false);
    setLoginOpen(true);
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-inner">

            {/* Logo */}
            <Link to="/" className="header-logo" aria-label="Gedualpha Ecom home">
              <div className="logo-icon">G</div>
              Gedualpha<span>Ecom</span>
            </Link>

            {/* Location */}
            <button
              type="button"
              id="location-btn"
              className="location-btn"
              aria-label="Select city"
              onClick={() => setLocModalOpen(true)}
            >
              <PinIcon />
              <span>{selectedCity}</span>
            </button>

            {/* Search */}
            <form className="search-bar" onSubmit={handleSearch} role="search" aria-label="Search marketplace">
              <input
                type="search"
                name="query"
                id="header-search"
                placeholder="Search phones, cars, houses, laptops…"
                autoComplete="off"
                aria-label="Search marketplace"
                defaultValue={searchParams.get("q") || ""}
              />
              <button type="submit" className="search-btn" aria-label="Search">
                <SearchIcon />
              </button>
            </form>

            {/* Actions */}
            <div className="header-actions">
              <Link to="/sell" className="sell-btn" id="sell-btn" title="Post a free ad">
                <TagIcon />
                <span>+ Post Ad</span>
              </Link>

              {/* ── Admin auth button ── */}
              {isAdmin ? (
                <div className="admin-user-wrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="admin-avatar-btn"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-label="Admin menu"
                    title="Admin account"
                  >
                    <span className="admin-avatar-icon">🛡️</span>
                    <span className="admin-avatar-label">Admin</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style={{ opacity: 0.6 }}>
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="admin-user-menu">
                      <div className="admin-user-menu-header">
                        <div className="aum-avatar">G</div>
                        <div>
                          <div className="aum-name">Gedualpha Admin</div>
                          <div className="aum-role">Store Manager</div>
                        </div>
                      </div>
                      <div className="admin-user-menu-items">
                        <Link to="/admin" className="aum-item" onClick={() => setUserMenuOpen(false)}>
                          <ShieldIcon /> Dashboard
                        </Link>
                        <button className="aum-item aum-item-danger" onClick={handleLogout}>
                          <LogoutIcon /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="admin-login-btn"
                  onClick={openLogin}
                  title="Admin login"
                >
                  <ShieldIcon />
                  <span>Admin</span>
                </button>
              )}

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

              {/* Theme toggle */}
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

      {/* ── Location Modal ───────────────────────────────────────────── */}
      {locModalOpen && (
        <div className="modal-scrim" onClick={() => setLocModalOpen(false)}>
          <div className="location-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="loc-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <PinIcon />
                <h3>Choose Your City in Ethiopia</h3>
              </div>
              <button className="close-btn" onClick={() => setLocModalOpen(false)}><XIcon /></button>
            </div>
            <p className="loc-modal-sub">Filter listings in your area for faster local pickup or delivery.</p>
            <div className="cities-grid-picker">
              <button type="button" className={`city-pill ${selectedCity === "All Ethiopia" ? "active" : ""}`} onClick={() => selectCity("All Ethiopia")}>
                📍 All Ethiopia
              </button>
              {locations.map((loc) => (
                <button key={loc.city} type="button" className={`city-pill ${selectedCity === loc.city ? "active" : ""}`} onClick={() => selectCity(loc.city)}>
                  📍 {loc.city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Login Modal ────────────────────────────────────────── */}
      {loginOpen && (
        <div className="modal-scrim" onClick={() => setLoginOpen(false)}>
          <div className="hdr-login-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hdr-login-top">
              <div className="hdr-login-icon">🛡️</div>
              <div>
                <h2>Admin Sign In</h2>
                <p>Enter your admin password to access the control panel.</p>
              </div>
              <button className="close-btn hdr-login-close" onClick={() => setLoginOpen(false)}><XIcon /></button>
            </div>

            <form onSubmit={handleLogin} className="hdr-login-form">
              {loginError && (
                <div className="hdr-login-error">
                  ⚠️ {loginError}
                </div>
              )}
              <div className="hdr-pw-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Admin password…"
                  value={loginPw}
                  onChange={(e) => setLoginPw(e.target.value)}
                  autoFocus
                  required
                  className="hdr-pw-input"
                />
                <button type="button" className="hdr-pw-eye" onClick={() => setShowPw((v) => !v)} aria-label="Toggle password">
                  <EyeIcon off={showPw} />
                </button>
              </div>
              <button
                type="submit"
                className="btn btn-accent btn-wide"
                disabled={loginLoading || !loginPw}
              >
                {loginLoading ? "Verifying…" : "🔓 Unlock Dashboard"}
              </button>
              <p className="hdr-login-hint">Default password: <code>admin123</code></p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
