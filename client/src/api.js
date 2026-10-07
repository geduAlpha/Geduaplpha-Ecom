async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error("Request failed"), { errors: data.errors, status: res.status });
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
  createOrder: (body) => request("/orders", { method: "POST", body: JSON.stringify(body) }),
};
