import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { connectDB } from "./db.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const CLIENT_DIST = path.join(__dirname, "../client/dist");

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 8000;
const FREE_SHIPPING_OVER = 6000; // cents
const FLAT_SHIPPING = 599;       // cents

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "50kb" }));

// Serve built React frontend
app.use(express.static(CLIENT_DIST));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: "ok",
    db: ready ? "connected" : "connecting",
  });
});

// ─── Catalogue ────────────────────────────────────────────────────────────────
app.get("/api/products", async (req, res) => {
  try {
    const { q = "", category = "all", sort = "featured", page = "1", limit = "12" } = req.query;
    const needle  = String(q).trim();
    const size    = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const offset  = (pageNum - 1) * size;

    // Build filter
    const filter = {};
    if (category !== "all") filter.category = category;
    if (needle) {
      // Escape regex special chars before building the pattern
      const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(escaped, "i");
      filter.$or = [{ name: rx }, { description: rx }];
    }

    const sortMap = {
      "price-asc":  { price:  1 },
      "price-desc": { price: -1 },
      "name":       { name:   1 },
      "featured":   { createdAt: -1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    const [total, docs] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort(sortBy).skip(offset).limit(size).lean(),
    ]);

    const items = docs.map(({ _id, __v, ...rest }) => ({ id: _id, ...rest }));

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
    const doc = await Product.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Product not found" });
    const { _id, __v, ...rest } = doc;
    res.json({ id: _id, ...rest });
  } catch (err) {
    res.status(500).json({ error: "DB Error: " + err.message });
  }
});

// ─── Orders ───────────────────────────────────────────────────────────────────
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

  // Process items — atomically deduct stock per product using findOneAndUpdate
  const lines    = [];  // validated line items for the order
  const deducted = [];  // track what we've already deducted so we can roll back on error

  try {
    for (const { id, qty } of items) {
      if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
        await rollback(deducted);
        return res.status(400).json({ errors: { items: "One or more items are invalid" } });
      }

      // Atomic: only deduct if stock >= qty (prevents overselling without transactions)
      const before = await Product.findOneAndUpdate(
        { _id: id, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: false } // return the pre-update doc for name/price
      ).lean();

      if (!before) {
        // Either product doesn't exist or not enough stock
        const exists = await Product.findById(id).lean();
        await rollback(deducted);
        const msg = exists
          ? `Only ${exists.stock} left of "${exists.name}"`
          : "One or more items are invalid";
        return res.status(400).json({ errors: { items: msg } });
      }

      deducted.push({ id: before._id, qty });
      lines.push({ productId: before._id, name: before.name, price: before.price, qty });
    }

    const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
    const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : FLAT_SHIPPING;
    const orderId  = crypto.randomUUID().slice(0, 8).toUpperCase();

    const order = await Order.create({
      _id:      orderId,
      customer: {
        name:    customer.name.trim(),
        email:   customer.email.trim(),
        address: customer.address.trim(),
        city:    customer.city.trim(),
        postal:  customer.postal.trim(),
      },
      items,   // embedded in the order document
      subtotal,
      shipping,
      total: subtotal + shipping,
    });

    res.status(201).json({
      id:       order._id,
      customer: order.customer,
      items:    lines,
      subtotal,
      shipping,
      total:    subtotal + shipping,
      createdAt: order.createdAt,
    });
  } catch (err) {
    await rollback(deducted);
    console.error(err);
    res.status(500).json({ error: "DB Error: " + err.message });
  }
});

/** Restore stock that was atomically deducted during a failed order */
async function rollback(deducted) {
  await Promise.allSettled(
    deducted.map(({ id, qty }) =>
      Product.findByIdAndUpdate(id, { $inc: { stock: qty } })
    )
  );
}

app.get("/api/orders/:id", async (req, res) => {
  try {
    const doc = await Order.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Order not found" });
    const { _id, __v, ...rest } = doc;
    res.json({ id: _id, ...rest });
  } catch (err) {
    res.status(500).json({ error: "DB Error: " + err.message });
  }
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

// ─── Catch-all: serve React app for all non-API routes ───────────────────────
app.get("*", (_req, res) => {
  const indexHtml = path.join(CLIENT_DIST, "index.html");
  res.sendFile(indexHtml, (err) => {
    if (err && !res.headersSent) {
      res.status(200).send("Marigold Supply Store is running. Please refresh shortly.");
    }
  });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

// ─── Start server immediately on PORT, then connect to MongoDB ───────────────
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

server.on("error", (err) => {
  console.error("HTTP server error:", err);
});

connectDB().catch((err) => {
  console.error("MongoDB initial connection error:", err.message);
});
