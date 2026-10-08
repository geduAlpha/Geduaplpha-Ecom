import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../CartContext.jsx";
import { useUser } from "../UserContext.jsx";
import { api } from "../api.js";

/* â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function SunIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>;
}
function MoonIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}
function CartIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>;
}
function PinIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6-5.2-6-10.2a6 6 0 1 1 12 0C18 15.8 12 21 12 21Z"/><circle cx="12" cy="10" r="2"/></svg>;
}
function TagIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
}
function XIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function ShieldIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function LogoutIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function EyeIcon({ off }) {
  if (off) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function ChevronDown() {
  return <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" style={{ opacity:0.6 }}><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>;
}

/* â”€â”€ Admin auth helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export function getAdminAuth() { return localStorage.getItem("gedualpha_admin_auth") === "true"; }
export function setAdminAuth(val) {
  if (val) localStorage.setItem("gedualpha_admin_auth", "true");
  else localStorage.removeItem("gedualpha_admin_auth");
}

/* Role badge colours */
const ROLE_META = {
  buyer:    { label: "Buyer",    color: "#2563eb", bg: "#eff6ff", icon: "ðŸ›’" },
  seller:   { label: "Seller",   color: "#16a34a", bg: "#f0fdf4", icon: "ðŸª" },
  business: { label: "Business", color: "#7c3aed", bg: "#f5f3ff", icon: "ðŸ¢" },
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function Header() {
  const { count, setOpen }                              = useCart();
  const { user, logout, openLogin, openSignup, authOpen, authMode, setAuthMode, closeAuth, login } = useUser();
  const navigate                                        = useNavigate();
  const [searchParams]                                  = useSearchParams();

  const [locModalOpen, setLocModalOpen] = useState(false);
  const [locations,    setLocations]    = useState([]);
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get("city") || localStorage.getItem("gedualpha-city") || "All Ethiopia"
  );

  /* Admin state */
  const [isAdmin,      setIsAdmin]     = useState(getAdminAuth);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminPw,      setAdminPw]     = useState("");
  const [adminErr,     setAdminErr]    = useState("");
  const [adminLoading, setAdminLoading]= useState(false);
  const [showAdminPw,  setShowAdminPw] = useState(false);
  const [adminMenuOpen,setAdminMenuOpen]=useState(false);

  /* User dropdown */
  const [userMenuOpen, setUserMenuOpen]= useState(false);

  useEffect(() => {
    const ac = new AbortController();
    api.locations(ac.signal).then((r) => { if (r.cities) setLocations(r.cities); }).catch(() => {});
    return () => ac.abort();
  }, []);

  /* Close menus on outside click */
  useEffect(() => {
    if (!userMenuOpen && !adminMenuOpen) return;
    const h = () => { setUserMenuOpen(false); setAdminMenuOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [userMenuOpen, adminMenuOpen]);

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
    setSelectedCity(city); localStorage.setItem("gedualpha-city", city); setLocModalOpen(false);
    navigate(city === "All Ethiopia" ? "/" : `/?city=${encodeURIComponent(city)}`);
  }

  async function handleAdminLogin(e) {
    e.preventDefault(); setAdminLoading(true); setAdminErr("");
    try {
      const res = await api.adminLogin(adminPw);
      if (res.status === "ok") { setAdminAuth(true); setIsAdmin(true); setAdminLoginOpen(false); setAdminPw(""); navigate("/admin"); }
    } catch { setAdminErr("Incorrect password."); }
    finally { setAdminLoading(false); }
  }

  function handleUserLogout() { logout(); setUserMenuOpen(false); navigate("/"); }

  const roleMeta = user ? (ROLE_META[user.role] || ROLE_META.buyer) : null;
  const initials = user ? user.name.split(" ").slice(0,2).map((w) => w[0]).join("").toUpperCase() : "";

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
            <button type="button" className="location-btn" onClick={() => setLocModalOpen(true)} aria-label="Select city">
              <PinIcon /><span>{selectedCity}</span>
            </button>

            {/* Search */}
            <form className="search-bar" onSubmit={handleSearch} role="search">
              <input type="search" name="query" placeholder="Search phones, cars, houses, laptopsâ€¦"
                autoComplete="off" defaultValue={searchParams.get("q") || ""} aria-label="Search" />
              <button type="submit" className="search-btn" aria-label="Search"><SearchIcon /></button>
            </form>

            {/* Actions */}
            <div className="header-actions">
              {/* Post Ad â€” hidden for buyers */}
              {(!user || user.role !== "buyer") && (
                <Link to="/sell" className="sell-btn" title="Post a free ad">
                  <TagIcon /><span>+ Post Ad</span>
                </Link>
              )}

              {/* â”€â”€ User auth area â”€â”€ */}
              {user ? (
                /* Logged-in user avatar pill */
                <div className="hdr-user-wrap" onClick={(e) => e.stopPropagation()}>
                  <button className="hdr-user-pill" onClick={() => setUserMenuOpen((v) => !v)}>
                    <div className="hdr-user-avatar" style={{ background: roleMeta?.color }}>
                      {initials}
                    </div>
                    <div className="hdr-user-info">
                      <span className="hdr-user-name">{user.name.split(" ")[0]}</span>
                      <span className="hdr-user-role" style={{ color: roleMeta?.color }}>{roleMeta?.icon} {roleMeta?.label}</span>
                    </div>
                    <ChevronDown />
                  </button>

                  {userMenuOpen && (
                    <div className="hdr-user-menu">
                      <div className="hdr-user-menu-head">
                        <div className="hum-avatar" style={{ background: roleMeta?.color }}>{initials}</div>
                        <div>
                          <div className="hum-name">{user.name}</div>
                          <div className="hum-email">{user.email}</div>
                          <span className="hum-role-badge" style={{ background: roleMeta?.bg, color: roleMeta?.color }}>
                            {roleMeta?.icon} {roleMeta?.label}
                          </span>
                        </div>
                      </div>
                      <div className="hdr-user-menu-items">
                        {user.role !== "buyer" && (
                          <Link to="/my-listings" className="hum-item" onClick={() => setUserMenuOpen(false)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            My Listings
                          </Link>
                        )}
                        <Link to="/my-orders" className="hum-item" onClick={() => setUserMenuOpen(false)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                          My Orders
                        </Link>
                        <button className="hum-item hum-item-danger" onClick={handleUserLogout}><LogoutIcon /> Sign Out</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Single Sign In / Sign Up button */
                <button className="hdr-auth-single-btn" onClick={openLogin} title="Sign in or create an account">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  <span>Sign In</span>
                </button>
              )}

              {/* â”€â”€ Admin button â€” only visible when no regular user is logged in â”€â”€ */}
              {!user && (
                isAdmin ? (
                  <div className="admin-user-wrap" onClick={(e) => e.stopPropagation()}>
                    <button className="admin-avatar-btn" onClick={() => setAdminMenuOpen((v) => !v)}>
                      <span className="admin-avatar-icon">ðŸ›¡ï¸</span>
                      <span className="admin-avatar-label">Admin</span>
                      <ChevronDown />
                    </button>
                    {adminMenuOpen && (
                      <div className="admin-user-menu">
                        <div className="admin-user-menu-header">
                          <div className="aum-avatar">G</div>
                          <div><div className="aum-name">Gedualpha Admin</div><div className="aum-role">Store Manager</div></div>
                        </div>
                        <div className="admin-user-menu-items">
                          <Link to="/admin" className="aum-item" onClick={() => setAdminMenuOpen(false)}><ShieldIcon /> Dashboard</Link>
                          <button className="aum-item aum-item-danger" onClick={() => { setAdminAuth(false); setIsAdmin(false); setAdminMenuOpen(false); navigate("/"); }}><LogoutIcon /> Sign Out</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="admin-login-btn" onClick={() => { setAdminErr(""); setAdminPw(""); setShowAdminPw(false); setAdminLoginOpen(true); }} title="Admin login">
                    <ShieldIcon /><span>Admin</span>
                  </button>
                )
              )}

              {/* Cart */}
              <button id="cart-btn" className="cart-btn" onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`}>
                <CartIcon />
                {count > 0 && <span className="cart-badge">{count}</span>}
              </button>

              {/* Theme */}
              <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle dark mode">
                <span className="dark-hide"><MoonIcon /></span>
                <span className="dark-show" style={{ display:"none" }}><SunIcon /></span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* â”€â”€ Location modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {locModalOpen && (
        <div className="modal-scrim" onClick={() => setLocModalOpen(false)}>
          <div className="location-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="loc-modal-header">
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}><PinIcon /><h3>Choose Your City</h3></div>
              <button className="close-btn" onClick={() => setLocModalOpen(false)}><XIcon /></button>
            </div>
            <p className="loc-modal-sub">Filter listings in your area.</p>
            <div className="cities-grid-picker">
              <button type="button" className={`city-pill ${selectedCity === "All Ethiopia" ? "active" : ""}`} onClick={() => selectCity("All Ethiopia")}>ðŸ“ All Ethiopia</button>
              {locations.map((l) => <button key={l.city} type="button" className={`city-pill ${selectedCity === l.city ? "active" : ""}`} onClick={() => selectCity(l.city)}>ðŸ“ {l.city}</button>)}
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Admin login modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {adminLoginOpen && (
        <div className="modal-scrim" onClick={() => setAdminLoginOpen(false)}>
          <div className="hdr-login-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hdr-login-top">
              <div className="hdr-login-icon">ðŸ›¡ï¸</div>
              <div><h2>Admin Sign In</h2><p>Enter your admin password to access the control panel.</p></div>
              <button className="close-btn hdr-login-close" onClick={() => setAdminLoginOpen(false)}><XIcon /></button>
            </div>
            <form onSubmit={handleAdminLogin} className="hdr-login-form">
              {adminErr && <div className="hdr-login-error">âš ï¸ {adminErr}</div>}
              <div className="hdr-pw-wrap">
                <input type={showAdminPw ? "text" : "password"} placeholder="Admin passwordâ€¦"
                  value={adminPw} onChange={(e) => setAdminPw(e.target.value)} autoFocus required className="hdr-pw-input" />
                <button type="button" className="hdr-pw-eye" onClick={() => setShowAdminPw((v) => !v)}><EyeIcon off={showAdminPw} /></button>
              </div>
              <button type="submit" className="btn btn-accent btn-wide" disabled={adminLoading || !adminPw}>
                {adminLoading ? "Verifyingâ€¦" : "ðŸ”“ Unlock Dashboard"}
              </button>
              <p className="hdr-login-hint">Default: <code>admin123</code></p>
            </form>
          </div>
        </div>
      )}

      {/* â”€â”€ User auth modal (Login / Sign Up) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {authOpen && <AuthModal mode={authMode} setMode={setAuthMode} onClose={closeAuth} onLogin={login} />}
    </>
  );

}

/* ════════════════════════════════════════════════════════════════════
   AUTH MODAL — Smartphone frame design
════════════════════════════════════════════════════════════════════ */
const ROLES = [
  { key: "buyer",    icon: "\uD83D\uDED2", label: "Buyer",    desc: "Browse and buy products",  color: "#2563eb", bg: "#eff6ff" },
  { key: "seller",   icon: "\uD83C\uDFEA", label: "Seller",   desc: "Post listings and sell",    color: "#16a34a", bg: "#f0fdf4" },
  { key: "business", icon: "\uD83C\uDFE2", label: "Business", desc: "Verified business store",   color: "#7c3aed", bg: "#f5f3ff" },
];

function SignalBars() {
  return (
    <div className="sp-signal">
      {[3,5,7,9].map((h,i) => <div key={i} className="sp-bar" style={{ height: h }} />)}
    </div>
  );
}
function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1" fill="currentColor"/>
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="11">
      <rect x="1" y="6" width="18" height="12" rx="2" ry="2"/>
      <line x1="23" y1="11" x2="23" y2="13"/>
      <rect x="3" y="8" width="12" height="8" rx="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function AuthModal({ mode, setMode, onClose, onLogin }) {
  const [loginEmail,    setLoginEmail]    = useState("");
  const [loginPw,       setLoginPw]       = useState("");
  const [loginErrors,   setLoginErrors]   = useState({});
  const [loginLoading,  setLoginLoading]  = useState(false);
  const [showLoginPw,   setShowLoginPw]   = useState(false);

  const [signupStep,    setSignupStep]    = useState(1);
  const [role,          setRole]          = useState("buyer");
  const [firstName,     setFirstName]     = useState("");
  const [lastName,      setLastName]      = useState("");
  const [email,         setEmail]         = useState("");
  const [phone,         setPhone]         = useState("");
  const [password,      setPassword]      = useState("");
  const [confirmPw,     setConfirmPw]     = useState("");
  const [showPw,        setShowPw]        = useState(false);
  const [agreed,        setAgreed]        = useState(false);
  const [signupErrors,  setSignupErrors]  = useState({});
  const [signupLoading, setSignupLoading] = useState(false);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  async function handleLogin(e) {
    e.preventDefault(); setLoginErrors({});
    if (!loginEmail || !loginPw) { setLoginErrors({ form: "Email and password are required." }); return; }
    setLoginLoading(true);
    try {
      const res = await api.authLogin({ email: loginEmail, password: loginPw });
      onLogin(res.token, res.user);
    } catch (err) { setLoginErrors(err.errors || { form: err.message }); }
    finally { setLoginLoading(false); }
  }

  async function handleSignup(e) {
    e.preventDefault(); setSignupErrors({});
    const errs = {};
    if (!firstName.trim())      errs.firstName = "First name is required";
    if (!email.trim())          errs.email     = "Email address is required";
    if (password.length < 6)    errs.password  = "Password must be at least 6 characters";
    if (password !== confirmPw) errs.confirmPw = "Passwords do not match";
    if (!agreed)                errs.terms     = "You must agree to the Terms and Conditions";
    if (Object.keys(errs).length) { setSignupErrors(errs); return; }
    setSignupLoading(true);
    try {
      const res = await api.authRegister({
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email, phone, password, role, agreedTerms: agreed,
      });
      onLogin(res.token, res.user);
    } catch (err) { setSignupErrors(err.errors || { form: err.message }); }
    finally { setSignupLoading(false); }
  }

  const selectedRole = ROLES.find((r) => r.key === role);

  return (
    <div className="sp-scrim" onClick={onClose}>
      <div className="sp-phone" onClick={(e) => e.stopPropagation()}>

        <div className="sp-btn-vol-up" />
        <div className="sp-btn-vol-dn" />
        <div className="sp-btn-power" />

        <div className="sp-screen">

          {/* Status bar */}
          <div className="sp-statusbar">
            <span className="sp-time">{timeStr}</span>
            <div className="sp-notch" />
            <div className="sp-statusbar-right">
              <SignalBars />
              <WifiIcon />
              <BatteryIcon />
            </div>
          </div>

          {/* App header */}
          <div className="sp-app-header">
            <div className="sp-app-logo">
              <div className="sp-app-logo-icon">G</div>
              <span>Gedualpha</span>
            </div>
            <button className="sp-close-btn" onClick={onClose} aria-label="Close">x</button>
          </div>

          <div className="sp-content">

            {/* ── SIGN IN ── */}
            {mode === "login" && (
              <div className="sp-view">
                <div className="sp-hero-wrap">
                  <div className="sp-hero-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </div>
                  <h2 className="sp-heading">Welcome Back!</h2>
                  <p className="sp-subtext">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="sp-form" noValidate>
                  {loginErrors.form && (
                    <div className="sp-err-banner">Warning: {loginErrors.form}</div>
                  )}

                  <div className="sp-field">
                    <div className="sp-field-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <input className={`sp-input ${loginErrors.email ? "sp-input--err" : ""}`}
                      type="email" placeholder="Email address"
                      value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} autoFocus />
                  </div>
                  {loginErrors.email && <span className="sp-err">{loginErrors.email}</span>}

                  <div className="sp-field">
                    <div className="sp-field-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <input className={`sp-input ${loginErrors.password ? "sp-input--err" : ""}`}
                      type={showLoginPw ? "text" : "password"} placeholder="Password"
                      value={loginPw} onChange={(e) => setLoginPw(e.target.value)} />
                    <button type="button" className="sp-eye" onClick={() => setShowLoginPw((v) => !v)}
                      aria-label={showLoginPw ? "Hide password" : "Show password"}>
                      {showLoginPw
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                  {loginErrors.password && <span className="sp-err">{loginErrors.password}</span>}

                  <button type="submit" className="sp-submit" disabled={loginLoading}>
                    {loginLoading ? <span className="sp-spinner" /> : "Sign In"}
                  </button>
                </form>

                <div className="sp-divider"><span>or</span></div>

                <p className="sp-switch-line">
                  New to Gedualpha?{" "}
                  <button className="sp-switch-btn" onClick={() => { setMode("signup"); setSignupStep(1); }}>
                    Create account
                  </button>
                </p>
              </div>
            )}

            {/* ── SIGN UP step 1: choose role ── */}
            {mode === "signup" && signupStep === 1 && (
              <div className="sp-view">
                <div className="sp-hero-wrap">
                  <div className="sp-hero-avatar sp-hero-avatar--green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="34" height="34">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <h2 className="sp-heading">Get Started</h2>
                  <p className="sp-subtext">How will you use Gedualpha?</p>
                </div>

                <div className="sp-roles">
                  {ROLES.map((r) => (
                    <button key={r.key} type="button"
                      className={`sp-role-card ${role === r.key ? "active" : ""}`}
                      style={role === r.key ? { borderColor: r.color, background: r.bg } : {}}
                      onClick={() => setRole(r.key)}>
                      <span className="sp-role-icon">{r.icon}</span>
                      <div className="sp-role-text">
                        <div className="sp-role-name" style={role === r.key ? { color: r.color } : {}}>
                          {r.label}
                        </div>
                        <div className="sp-role-desc">{r.desc}</div>
                      </div>
                      <div className={`sp-role-radio ${role === r.key ? "checked" : ""}`}
                        style={role === r.key ? { borderColor: r.color, background: r.color } : {}}>
                        {role === r.key && <span>&#10003;</span>}
                      </div>
                    </button>
                  ))}
                </div>

                <button className="sp-submit" onClick={() => setSignupStep(2)}
                  style={selectedRole ? { background: selectedRole.color } : {}}>
                  Continue as {selectedRole?.label}
                </button>

                <p className="sp-switch-line">
                  Already have an account?{" "}
                  <button className="sp-switch-btn" onClick={() => setMode("login")}>Sign In</button>
                </p>
              </div>
            )}

            {/* ── SIGN UP step 2: fill details ── */}
            {mode === "signup" && signupStep === 2 && (
              <div className="sp-view">
                <div className="sp-role-pill"
                  style={{ background: selectedRole?.bg, color: selectedRole?.color, borderColor: (selectedRole?.color || "#ccc") + "44" }}>
                  {selectedRole?.icon} <strong>{selectedRole?.label}</strong> Account
                </div>

                <div className="sp-setup-header">
                  <div className="sp-hero-avatar" style={{ background: selectedRole?.bg, color: selectedRole?.color, width: 52, height: 52, boxShadow: "none" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="sp-heading" style={{ marginBottom: 0, fontSize: "1.2rem" }}>Setup Profile</h2>
                    <p className="sp-subtext" style={{ marginTop: "0.2rem" }}>Fill in your details below</p>
                  </div>
                </div>

                <form onSubmit={handleSignup} className="sp-form" noValidate>
                  {signupErrors.form && (
                    <div className="sp-err-banner">Warning: {signupErrors.form}</div>
                  )}

                  <div className="sp-row">
                    <div className="sp-field" style={{ flex: 1 }}>
                      <div className="sp-field-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="15" height="15"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                      </div>
                      <input className={`sp-input ${signupErrors.firstName ? "sp-input--err" : ""}`}
                        type="text" placeholder="First name"
                        value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
                    </div>
                    <div className="sp-field" style={{ flex: 1 }}>
                      <input className="sp-input sp-input--flat" type="text" placeholder="Last name"
                        value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                  {signupErrors.firstName && <span className="sp-err">{signupErrors.firstName}</span>}

                  <div className="sp-field">
                    <div className="sp-field-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <input className={`sp-input ${signupErrors.email ? "sp-input--err" : ""}`}
                      type="email" placeholder="Email address"
                      value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  {signupErrors.email && <span className="sp-err">{signupErrors.email}</span>}

                  <div className="sp-field">
                    <div className="sp-field-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="15" height="15"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <input className="sp-input" type="tel" placeholder="Phone number (+251...)"
                      value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>

                  <div className="sp-field">
                    <div className="sp-field-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <input className={`sp-input ${signupErrors.password ? "sp-input--err" : ""}`}
                      type={showPw ? "text" : "password"} placeholder="Password (min 6 characters)"
                      value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" className="sp-eye" onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}>
                      {showPw
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="15" height="15"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                  {signupErrors.password && <span className="sp-err">{signupErrors.password}</span>}

                  <div className="sp-field">
                    <div className="sp-field-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="15" height="15"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <input className={`sp-input ${signupErrors.confirmPw ? "sp-input--err" : ""}`}
                      type="password" placeholder="Confirm password"
                      value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                  </div>
                  {signupErrors.confirmPw && <span className="sp-err">{signupErrors.confirmPw}</span>}

                  <label className="sp-agree">
                    <div className={`sp-checkbox ${agreed ? "checked" : ""}`}
                      onClick={() => setAgreed((v) => !v)}>
                      {agreed && <span>&#10003;</span>}
                    </div>
                    <span>
                      I agree to the{" "}
                      <a href="#" className="sp-link" onClick={(e) => e.stopPropagation()}>
                        Terms and Conditions
                      </a>
                    </span>
                  </label>
                  {signupErrors.terms && <span className="sp-err">{signupErrors.terms}</span>}

                  <button type="submit" className="sp-submit" disabled={signupLoading}
                    style={selectedRole ? { background: selectedRole.color } : {}}>
                    {signupLoading ? <span className="sp-spinner" /> : "Create Account"}
                  </button>
                </form>

                <p className="sp-switch-line">
                  Already a member?{" "}
                  <button className="sp-switch-btn" onClick={() => setMode("login")}>Sign In</button>
                </p>
              </div>
            )}

          </div>

          {/* Bottom navigation bar */}
          <div className="sp-navbar">
            <button className="sp-nav-item active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>Home</span>
            </button>
            <button className="sp-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>Search</span>
            </button>
            <button className="sp-nav-item sp-nav-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <button className="sp-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span>Cart</span>
            </button>
            <button className="sp-nav-item sp-nav-item--active-user">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              <span>Me</span>
            </button>
          </div>

          <div className="sp-home-indicator" />

        </div>
      </div>
    </div>
  );
}
