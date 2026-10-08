async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (networkErr) {
    throw Object.assign(new Error("Network error — server may be offline or the request was too large"), { status: 0 });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Surface the actual server error message so the UI can show it
    const serverMsg = data.error || data.message || (data.errors ? JSON.stringify(data.errors) : null);
    const displayMsg = serverMsg || `Server error (HTTP ${res.status})`;
    throw Object.assign(new Error(displayMsg), { errors: data.errors, status: res.status, raw: data });
  }
  return data;
}

export const api = {
  products: (params, signal) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );
    return request(`/products?${new URLSearchParams(cleanParams)}`, { signal });
  },
  product: (id, signal) => request(`/products/${id}`, { signal }),
  createProduct: (body) => request("/products", { method: "POST", body: JSON.stringify(body) }),
  locations: (signal) => request("/locations", { signal }),
  categories: (signal) => request("/categories", { signal }),
  postingPlans: (signal) => request("/posting-plans", { signal }),
  submitListing: (body) => request("/listing-payment", { method: "POST", body: JSON.stringify(body) }),

  // Seller: own listing management
  getMyListings: (userId, token, signal) =>
    fetch(`/api/products/my/${userId}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      signal,
    }).then(async (r) => {
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error(d.error || `Server error (HTTP ${r.status})`), { status: r.status });
      return d;
    }),
  updateMyProduct: (id, body) => request(`/products/${id}`, { method: "PUT",    body: JSON.stringify(body) }),
  deleteMyProduct: (id, ownerId) => request(`/products/${id}`, { method: "DELETE", body: JSON.stringify({ ownerId }) }),

  // User auth
  authRegister: (body)  => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  authLogin:    (body)  => request("/auth/login",    { method: "POST", body: JSON.stringify(body) }),
  authMe:       (token) => request("/auth/me", { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }),
  createOrder: (body) => request("/orders", { method: "POST", body: JSON.stringify(body) }),
  getOrder:    (id)   => request(`/orders/${id}`),
  getMyOrders: (userId, token, signal) => {
    return fetch(`/api/orders/by-user/${userId}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      signal,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(data.error || `Server error (HTTP ${res.status})`), { status: res.status });
      return data;
    });
  },
  paymentConfig: (signal) => request("/payments/config", { signal }),
  initializeChapa: (body) => request("/payments/chapa/initialize", { method: "POST", body: JSON.stringify(body) }),
  verifyChapa: (tx_ref) => request(`/payments/chapa/verify/${tx_ref}`),

  // Admin APIs
  adminLogin: (password) => request("/admin/login", { method: "POST", body: JSON.stringify({ password }) }),
  adminStats:     (signal) => request("/admin/stats",     { signal }),
  adminAnalytics: (signal) => request("/admin/analytics", { signal }),
  adminProducts: (params, signal) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );
    return request(`/admin/products?${new URLSearchParams(cleanParams)}`, { signal });
  },
  adminCreateProduct: (body) => request("/admin/products", { method: "POST", body: JSON.stringify(body) }),
  adminUpdateProduct: (id, body) => request(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  adminDeleteProduct: (id) => request(`/admin/products/${id}`, { method: "DELETE" }),
  adminOrders: (params, signal) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );
    return request(`/admin/orders?${new URLSearchParams(cleanParams)}`, { signal });
  },
  adminUpdateOrder: (id, body) => request(`/admin/orders/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  adminConfirmPayment: (id) => request(`/admin/orders/${id}`, { method: "PUT", body: JSON.stringify({ confirmPayment: true }) }),
  adminDeleteOrder: (id) => request(`/admin/orders/${id}`, { method: "DELETE" }),
};
