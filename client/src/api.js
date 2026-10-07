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

  // User auth
  authRegister: (body)  => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  authLogin:    (body)  => request("/auth/login",    { method: "POST", body: JSON.stringify(body) }),
  authMe:       (token) => request("/auth/me", { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }),
  createOrder: (body) => request("/orders", { method: "POST", body: JSON.stringify(body) }),
  paymentConfig: (signal) => request("/payments/config", { signal }),
  initializeChapa: (body) => request("/payments/chapa/initialize", { method: "POST", body: JSON.stringify(body) }),
  verifyChapa: (tx_ref) => request(`/payments/chapa/verify/${tx_ref}`),

  // Admin APIs
  adminLogin: (password) => request("/admin/login", { method: "POST", body: JSON.stringify({ password }) }),
  adminStats: (signal) => request("/admin/stats", { signal }),
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
  adminDeleteOrder: (id) => request(`/admin/orders/${id}`, { method: "DELETE" }),
};
