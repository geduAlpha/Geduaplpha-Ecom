import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const FREE_SHIPPING_OVER = 6000; // cents
const FLAT_SHIPPING = 599;       // cents

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "50kb" }));

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: err.message });
  }
});

// ─── Catalogue ───────────────────────────────────────────────────────────────
app.get("/api/products", async (req, res) => {
  try {
    const { q = "", category = "all", sort = "featured", page = "1", limit = "12" } = req.query;
    const needle = String(q).trim().toLowerCase();
    const size   = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const offset  = (pageNum - 1) * size;

    let where  = [];
    let params = [];

    if (category !== "all") { where.push("category = ?"); params.push(category); }
    if (needle)             { where.push("(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)"); params.push(`%${needle}%`, `%${needle}%`); }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sortMap = {
      "price-asc":  "price ASC",
      "price-desc": "price DESC",
      "name":       "name ASC",
      "featured":   "created_at DESC",
    };
    const orderBy = sortMap[sort] || "created_at DESC";

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products ${whereClause}`, params
    );
    const [items] = await pool.query(
      `SELECT * FROM products ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, size, offset]
    );

    res.json({
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / size)),
      items,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB Error: " + err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const [[product]] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "DB Error: " + err.message });
  }
});

// ─── Orders ──────────────────────────────────────────────────────────────────
const emailOk = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

app.post("/api/orders", async (req, res) => {
  const { customer = {}, items = [] } = req.body ?? {};
  const errors = {};

  for (const field of ["name", "address", "city", "postal"]) {
    if (!String(customer[field] ?? "").trim()) errors[field] = "Required";
  }
  if (!emailOk(String(customer.email ?? ""))) errors.email = "Enter a valid email address";
  if (!Array.isArray(items) || items.length === 0) errors.items = "Your cart is empty";
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const lines = [];
    for (const { id, qty } of items) {
      const [[product]] = await conn.query(
        "SELECT * FROM products WHERE id = ? FOR UPDATE", [id]
      );
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > 20) {
        await conn.rollback();
        return res.status(400).json({ errors: { items: "One or more items are invalid" } });
      }
      if (qty > product.stock) {
        await conn.rollback();
        return res.status(400).json({ errors: { items: `Only ${product.stock} left of ${product.name}` } });
      }
      lines.push({ id: product.id, name: product.name, price: product.price, qty });
    }

    const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
    const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : FLAT_SHIPPING;
    const orderId  = crypto.randomUUID().slice(0, 8).toUpperCase();

    await conn.query(
      `INSERT INTO orders (id, customer_name, customer_email, customer_address, customer_city, customer_postal, subtotal, shipping, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, customer.name.trim(), customer.email.trim(), customer.address.trim(),
       customer.city.trim(), customer.postal.trim(), subtotal, shipping, subtotal + shipping]
    );

    for (const line of lines) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?, ?, ?, ?, ?)",
        [orderId, line.id, line.name, line.price, line.qty]
      );
      await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [line.qty, line.id]);
    }

    await conn.commit();

    res.status(201).json({
      id: orderId,
      customer: {
        name:    customer.name.trim(),
        email:   customer.email.trim(),
        address: customer.address.trim(),
        city:    customer.city.trim(),
        postal:  customer.postal.trim(),
      },
      items: lines,
      subtotal,
      shipping,
      total: subtotal + shipping,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "DB Error: " + err.message });
  } finally {
    conn.release();
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const [[order]] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (!order) return res.status(404).json({ error: "Order not found" });
    const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [req.params.id]);
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: "DB Error: " + err.message });
  }
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
