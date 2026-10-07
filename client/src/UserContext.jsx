import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "./api.js";

/* ── Context ──────────────────────────────────────────────────────── */
const UserCtx = createContext(null);

export function useUser() {
  const ctx = useContext(UserCtx);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}

/* ── Storage helpers ──────────────────────────────────────────────── */
const TOKEN_KEY = "gedualpha_user_token";
const USER_KEY  = "gedualpha_user";

export function getStoredUser()  { try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; } }
export function getStoredToken() { return localStorage.getItem(TOKEN_KEY) || null; }

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/* ── Provider ─────────────────────────────────────────────────────── */
export function UserProvider({ children }) {
  const [user,     setUser]     = useState(getStoredUser);
  const [token,    setToken]    = useState(getStoredToken);
  const [authOpen, setAuthOpen] = useState(false);   // shows modal
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"

  /* Verify token on mount */
  useEffect(() => {
    if (!token) return;
    api.authMe(token)
      .then((d) => { setUser(d.user); localStorage.setItem(USER_KEY, JSON.stringify(d.user)); })
      .catch(() => { clearSession(); setUser(null); setToken(null); });
  }, []);

  const login = useCallback((tokenVal, userVal) => {
    saveSession(tokenVal, userVal);
    setToken(tokenVal);
    setUser(userVal);
    setAuthOpen(false);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const openLogin  = useCallback(() => { setAuthMode("login");  setAuthOpen(true); }, []);
  const openSignup = useCallback(() => { setAuthMode("signup"); setAuthOpen(true); }, []);
  const closeAuth  = useCallback(() => setAuthOpen(false), []);

  return (
    <UserCtx.Provider value={{ user, token, login, logout, authOpen, authMode, setAuthMode, openLogin, openSignup, closeAuth }}>
      {children}
    </UserCtx.Provider>
  );
}
