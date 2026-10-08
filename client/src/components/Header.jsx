import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../CartContext.jsx";
import { useUser } from "../UserContext.jsx";
import { api } from "../api.js";

/* ── Icons ─────────────────────────────────────────────────────────── */
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

/* ── Admin auth helpers ──────────────────────────────────────────── */
export function getAdminAuth() { return localStorage.getItem("gedualpha_admin_auth") === "true"; }
export function setAdminAuth(val) {
  if (val) localStorage.setItem("gedualpha_admin_auth", "true");
  else localStorage.removeItem("gedualpha_admin_auth");
}

/* Role badge colours */
const ROLE_META = {
  buyer:    { label: "Buyer",    color: "#2563eb", bg: "#eff6ff", icon: "🛒" },
  seller:   { label: "Seller",   color: "#16a34a", bg: "#f0fdf4", icon: "🏪" },
  business: { label: "Business", color: "#7c3aed", bg: "#f5f3ff", icon: "🏢" },
};

/* ════════════════════════════════════════════════════════════════════ */
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
              <input type="search" name="query" placeholder="Search phones, cars, houses, laptops…"
                autoComplete="off" defaultValue={searchParams.get("q") || ""} aria-label="Search" />
              <button type="submit" className="search-btn" aria-label="Search"><SearchIcon /></button>
            </form>

            {/* Actions */}
            <div className="header-actions">
              {/* Post Ad — hidden for buyers */}
              {(!user || user.role !== "buyer") && (
                <Link to="/sell" className="sell-btn" title="Post a free ad">
                  <TagIcon /><span>+ Post Ad</span>
                </Link>
              )}

              {/* ── User auth area ── */}
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
                          <Link to="/sell" className="hum-item" onClick={() => setUserMenuOpen(false)}>🏪 My Listings</Link>
                        )}
                        <Link to="/my-orders" className="hum-item" onClick={() => setUserMenuOpen(false)}>📦 My Orders</Link>
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

              {/* ── Admin button — only visible when no regular user is logged in ── */}
              {!user && (
                isAdmin ? (
                  <div className="admin-user-wrap" onClick={(e) => e.stopPropagation()}>
                    <button className="admin-avatar-btn" onClick={() => setAdminMenuOpen((v) => !v)}>
                      <span className="admin-avatar-icon">🛡️</span>
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

      {/* ── Location modal ───────────────────────────────────────────── */}
      {locModalOpen && (
        <div className="modal-scrim" onClick={() => setLocModalOpen(false)}>
          <div className="location-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="loc-modal-header">
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}><PinIcon /><h3>Choose Your City</h3></div>
              <button className="close-btn" onClick={() => setLocModalOpen(false)}><XIcon /></button>
            </div>
            <p className="loc-modal-sub">Filter listings in your area.</p>
            <div className="cities-grid-picker">
              <button type="button" className={`city-pill ${selectedCity === "All Ethiopia" ? "active" : ""}`} onClick={() => selectCity("All Ethiopia")}>📍 All Ethiopia</button>
              {locations.map((l) => <button key={l.city} type="button" className={`city-pill ${selectedCity === l.city ? "active" : ""}`} onClick={() => selectCity(l.city)}>📍 {l.city}</button>)}
            </div>
          </div>
        </div>
      )}

      {/* ── Admin login modal ────────────────────────────────────────── */}
      {adminLoginOpen && (
        <div className="modal-scrim" onClick={() => setAdminLoginOpen(false)}>
          <div className="hdr-login-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hdr-login-top">
              <div className="hdr-login-icon">🛡️</div>
              <div><h2>Admin Sign In</h2><p>Enter your admin password to access the control panel.</p></div>
              <button className="close-btn hdr-login-close" onClick={() => setAdminLoginOpen(false)}><XIcon /></button>
            </div>
            <form onSubmit={handleAdminLogin} className="hdr-login-form">
              {adminErr && <div className="hdr-login-error">⚠️ {adminErr}</div>}
              <div className="hdr-pw-wrap">
                <input type={showAdminPw ? "text" : "password"} placeholder="Admin password…"
                  value={adminPw} onChange={(e) => setAdminPw(e.target.value)} autoFocus required className="hdr-pw-input" />
                <button type="button" className="hdr-pw-eye" onClick={() => setShowAdminPw((v) => !v)}><EyeIcon off={showAdminPw} /></button>
              </div>
              <button type="submit" className="btn btn-accent btn-wide" disabled={adminLoading || !adminPw}>
                {adminLoading ? "Verifying…" : "🔓 Unlock Dashboard"}
              </button>
              <p className="hdr-login-hint">Default: <code>admin123</code></p>
            </form>
          </div>
        </div>
      )}

      {/* ── User auth modal (Login / Sign Up) ────────────────────────── */}
      {authOpen && <AuthModal mode={authMode} setMode={setAuthMode} onClose={closeAuth} onLogin={login} />}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════
   AUTH MODAL — Login + Sign Up with role selection
════════════════════════════════════════════════════════════════════ */
const ROLES = [
  { key: "buyer",    icon: "🛒", label: "Buyer",    desc: "Browse & buy products" },
  { key: "seller",   icon: "🏪", label: "Seller",   desc: "Post listings & sell items" },
  { key: "business", icon: "🏢", label: "Business", desc: "Verified business account" },
];

function AuthModal({ mode, setMode, onClose, onLogin }) {
  /* login state */
  const [loginEmail,    setLoginEmail]    = useState("");
  const [loginPw,       setLoginPw]       = useState("");
  const [loginErrors,   setLoginErrors]   = useState({});
  const [loginLoading,  setLoginLoading]  = useState(false);
  const [showLoginPw,   setShowLoginPw]   = useState(false);

  /* signup state */
  const [signupStep,    setSignupStep]    = useState(1);   // 1 = role, 2 = form
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

  async function handleLogin(e) {
    e.preventDefault(); setLoginErrors({});
    if (!loginEmail || !loginPw) { setLoginErrors({ form: "Email and password are required." }); return; }
    setLoginLoading(true);
    try {
      const res = await api.authLogin({ email: loginEmail, password: loginPw });
      onLogin(res.token, res.user);
    } catch (err) {
      setLoginErrors(err.errors || { form: err.message });
    } finally { setLoginLoading(false); }
  }

  async function handleSignup(e) {
    e.preventDefault(); setSignupErrors({});
    const errs = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!email.trim())     errs.email     = "Email is required";
    if (password.length < 6) errs.password = "At least 6 characters";
    if (password !== confirmPw) errs.confirmPw = "Passwords don't match";
    if (!agreed)           errs.terms     = "You must agree to the Terms & Conditions";
    if (Object.keys(errs).length) { setSignupErrors(errs); return; }
    setSignupLoading(true);
    try {
      const res = await api.authRegister({
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email, phone, password, role, agreedTerms: agreed,
      });
      onLogin(res.token, res.user);
    } catch (err) {
      setSignupErrors(err.errors || { form: err.message });
    } finally { setSignupLoading(false); }
  }

  const selectedRole = ROLES.find((r) => r.key === role);

  return (
    <div className="auth-scrim" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>

        {/* Glass top decoration */}
        <div className="auth-modal-glow" />

        {/* Close */}
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

        {/* ── TABS ── */}
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Sign In</button>
          <button className={`auth-tab ${mode === "signup" ? "active" : ""}`} onClick={() => { setMode("signup"); setSignupStep(1); }}>Sign Up</button>
        </div>

        {/* ══════════ LOGIN ══════════ */}
        {mode === "login" && (
          <div className="auth-body">
            <div className="auth-hero-icon">👋</div>
            <h2 className="auth-title">Welcome Back!</h2>
            <p className="auth-sub">Sign in to your Gedualpha account</p>

            <form onSubmit={handleLogin} className="auth-form" noValidate>
              {loginErrors.form && <div className="auth-err-banner">⚠️ {loginErrors.form}</div>}

              <div className="auth-field">
                <label className="auth-label">📧 Email Address</label>
                <input className={`auth-input ${loginErrors.email ? "auth-input--err" : ""}`}
                  type="email" placeholder="you@example.com"
                  value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} autoFocus />
                {loginErrors.email && <span className="auth-err">{loginErrors.email}</span>}
              </div>

              <div className="auth-field">
                <label className="auth-label">🔑 Password</label>
                <div className="auth-pw-wrap">
                  <input className={`auth-input ${loginErrors.password ? "auth-input--err" : ""}`}
                    type={showLoginPw ? "text" : "password"} placeholder="Your password"
                    value={loginPw} onChange={(e) => setLoginPw(e.target.value)} />
                  <button type="button" className="auth-pw-eye" onClick={() => setShowLoginPw((v) => !v)}>
                    {showLoginPw ? "🙈" : "👁️"}
                  </button>
                </div>
                {loginErrors.password && <span className="auth-err">{loginErrors.password}</span>}
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loginLoading}>
                {loginLoading ? <span className="auth-spinner" /> : "Log In →"}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{" "}
              <button className="auth-switch-link" onClick={() => { setMode("signup"); setSignupStep(1); }}>Sign Up</button>
            </p>
          </div>
        )}

        {/* ══════════ SIGN UP ══════════ */}
        {mode === "signup" && (
          <div className="auth-body">

            {/* Step 1 — role selection */}
            {signupStep === 1 && (
              <>
                <div className="auth-hero-icon">🚀</div>
                <h2 className="auth-title">Let's Get Started</h2>
                <p className="auth-sub">Choose how you'll use Gedualpha Ecom</p>

                <div className="auth-roles">
                  {ROLES.map((r) => (
                    <button key={r.key} type="button"
                      className={`auth-role-card ${role === r.key ? "active" : ""}`}
                      onClick={() => setRole(r.key)}>
                      <span className="auth-role-icon">{r.icon}</span>
                      <div>
                        <div className="auth-role-name">{r.label}</div>
                        <div className="auth-role-desc">{r.desc}</div>
                      </div>
                      {role === r.key && <span className="auth-role-check">✓</span>}
                    </button>
                  ))}
                </div>

                <button className="auth-submit-btn" onClick={() => setSignupStep(2)}>
                  Continue as {selectedRole?.label} →
                </button>

                <p className="auth-switch">
                  Already have an account?{" "}
                  <button className="auth-switch-link" onClick={() => setMode("login")}>Sign In</button>
                </p>
              </>
            )}

            {/* Step 2 — registration form */}
            {signupStep === 2 && (
              <>
                <button className="auth-back-btn" onClick={() => setSignupStep(1)}>← Back</button>

                <div className="auth-selected-role-pill" style={{
                  background: ROLE_META[role]?.bg,
                  color: ROLE_META[role]?.color,
                  borderColor: ROLE_META[role]?.color + "44",
                }}>
                  {selectedRole?.icon} Signing up as <strong>{selectedRole?.label}</strong>
                </div>

                <div className="auth-profile-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </div>
                <h2 className="auth-title" style={{ marginTop:"0.5rem" }}>Setup Your Profile</h2>

                <form onSubmit={handleSignup} className="auth-form" noValidate>
                  {signupErrors.form && <div className="auth-err-banner">⚠️ {signupErrors.form}</div>}

                  <div className="auth-row">
                    <div className="auth-field">
                      <label className="auth-label">First Name *</label>
                      <input className={`auth-input ${signupErrors.firstName ? "auth-input--err" : ""}`}
                        type="text" placeholder="Abebe"
                        value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
                      {signupErrors.firstName && <span className="auth-err">{signupErrors.firstName}</span>}
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Last Name</label>
                      <input className="auth-input" type="text" placeholder="Kebede"
                        value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">📧 Email Address *</label>
                    <input className={`auth-input ${signupErrors.email ? "auth-input--err" : ""}`}
                      type="email" placeholder="you@example.com"
                      value={email} onChange={(e) => setEmail(e.target.value)} />
                    {signupErrors.email && <span className="auth-err">{signupErrors.email}</span>}
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">📞 Phone Number</label>
                    <input className="auth-input" type="tel" placeholder="+251912627366"
                      value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>

                  <div className="auth-row">
                    <div className="auth-field">
                      <label className="auth-label">🔑 Password *</label>
                      <div className="auth-pw-wrap">
                        <input className={`auth-input ${signupErrors.password ? "auth-input--err" : ""}`}
                          type={showPw ? "text" : "password"} placeholder="Min 6 chars"
                          value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" className="auth-pw-eye" onClick={() => setShowPw((v) => !v)}>
                          {showPw ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {signupErrors.password && <span className="auth-err">{signupErrors.password}</span>}
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Confirm Password *</label>
                      <input className={`auth-input ${signupErrors.confirmPw ? "auth-input--err" : ""}`}
                        type="password" placeholder="Repeat password"
                        value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                      {signupErrors.confirmPw && <span className="auth-err">{signupErrors.confirmPw}</span>}
                    </div>
                  </div>

                  <label className="auth-checkbox">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                    <span className="auth-checkbox-box" />
                    <span>I agree to the <a href="#" className="auth-terms-link">Terms &amp; Conditions</a></span>
                  </label>
                  {signupErrors.terms && <span className="auth-err" style={{ marginTop:"-0.5rem" }}>{signupErrors.terms}</span>}

                  <button type="submit" className="auth-submit-btn" disabled={signupLoading}>
                    {signupLoading ? <span className="auth-spinner" /> : "Create Account →"}
                  </button>
                </form>

                <p className="auth-switch">
                  Already have an account?{" "}
                  <button className="auth-switch-link" onClick={() => setMode("login")}>Sign In</button>
                </p>
              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
