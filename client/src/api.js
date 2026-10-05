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
  products: (params, signal) => request(`/products?${new URLSearchParams(params)}`, { signal }),
  product: (id, signal) => request(`/products/${id}`, { signal }),
  createOrder: (body) => request("/orders", { method: "POST", body: JSON.stringify(body) }),
};
