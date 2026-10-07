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
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const CLIENT_DIST = path.join(__dirname, "../client/dist");

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 4000;
const FREE_SHIPPING_OVER = 5000; // 5,000 ETB
const FLAT_SHIPPING = 250;       // 250 ETB

const CITIES = [
  { city: "Addis Ababa", subcities: ["Bole", "Kazanchis", "Piassa", "CMC", "Megenagna", "Sarbet", "Mexico", "Lebu", "Ayat", "Saris", "Gurd Shola"] },
  { city: "Adama", subcities: ["Center", "Bole", "Posta", "Kebele 04"] },
  { city: "Hawassa", subcities: ["Piazza", "Tabor", "Menhariya", "Haile Resort Area"] },
  { city: "Bahir Dar", subcities: ["Belay Zeleke", "Kebele 13", "Tana Subcity", "Gish Abay"] },
  { city: "Dire Dawa", subcities: ["Kezira", "Megala", "Sabian", "Gende Kore"] },
  { city: "Mekelle", subcities: ["Hawelti", "Kedamay Weyane", "Hadnet", "Ayder"] },
  { city: "Gondar", subcities: ["Arada", "Maraki", "Azezo", "Fasil"] },
  { city: "Jimma", subcities: ["Hirmata", "Mendera", "Jiren", "Bole"] },
  { city: "Bishoftu", subcities: ["Center", "Kuriftu", "Babogaya", "Hora"] },
];

const CATEGORIES = [
  { id: "all", name: "All Categories", icon: "🏪", count: 0 },
  { id: "electronics", name: "Electronics & Phones", icon: "📱", count: 0 },
  { id: "vehicles", name: "Vehicles & Auto", icon: "🚗", count: 0 },
  { id: "property", name: "Real Estate / Homes", icon: "🏠", count: 0 },
  { id: "fashion", name: "Fashion & Beauty", icon: "👗", count: 0 },
  { id: "furniture", name: "Home & Furniture", icon: "🛋️", count: 0 },
  { id: "stationery", name: "Desk & Stationery", icon: "📚", count: 0 },
  { id: "services", name: "Services & Jobs", icon: "💼", count: 0 },
];

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "200kb" }));

// Serve built React frontend
app.use(express.static(CLIENT_DIST));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: "ok",
    db: ready ? "connected" : "connecting",
    platform: "Gedualpha Ecom Marketplace (Engocha Flow)",
    currency: "ETB",
  });
});

// ─── Locations & Categories ────────────────────────────────────────────────────
app.get("/api/locations", (_req, res) => {
  res.json({ cities: CITIES });
});

app.get("/api/categories", async (_req, res) => {
  try {
    const counts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id, c.count]));
    const total = Object.values(countMap).reduce((a, b) => a + b, 0);

    const result = CATEGORIES.map(cat => ({
      ...cat,
      count: cat.id === "all" ? total : (countMap[cat.id] || 0)
    }));
    res.json({ categories: result });
  } catch (_err) {
    res.json({ categories: CATEGORIES });
  }
});

// ─── Marketplace Catalogue ───────────────────────────────────────────────────
app.get("/api/products", async (req, res) => {
  try {
    const {
      q = "",
      category = "all",
      city = "",
      condition = "",
      minPrice = "",
      maxPrice = "",
      sort = "featured",
      page = "1",
      limit = "12"
    } = req.query;

    const needle  = String(q).trim();
    const size    = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const offset  = (pageNum - 1) * size;

    // Build filter
    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (city && city !== "all" && city !== "All Ethiopia") {
      filter["location.city"] = new RegExp(`^${city}$`, "i");
    }
    if (condition && condition !== "all") {
      filter.condition = condition;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(minPrice)) filter.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) filter.price.$lte = Number(maxPrice);
    }

    if (needle) {
      const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(escaped, "i");
      filter.$or = [
        { name: rx },
        { description: rx },
        { "location.subcity": rx },
        { "location.city": rx }
      ];
    }

    const sortMap = {
      "price-asc":  { price:  1 },
      "price-desc": { price: -1 },
      "name":       { name:   1 },
      "views":      { views: -1, createdAt: -1 },
      "newest":     { createdAt: -1 },
      "featured":   { featured: -1, createdAt: -1 },
    };
    const sortBy = sortMap[sort] || { featured: -1, createdAt: -1 };

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
    console.error("Products error:", err);
    res.status(500).json({ error: "DB Error: " + err.message });
  }
});

// ─── Product Detail & View Counter ───────────────────────────────────────────
app.get("/api/products/:id", async (req, res) => {
  try {
    const doc = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ error: "Product not found" });
    const { _id, __v, ...rest } = doc;
    res.json({ id: _id, ...rest });
  } catch (err) {
    res.status(500).json({ error: "DB Error: " + err.message });
  }
});

// ─── Post / Sell a Listing ────────────────────────────────────────────────────
app.post("/api/products", async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      negotiable = false,
      condition = "Brand New",
      description,
      stock = 1,
      art = "notebook",
      color = "#2563EB",
      tint = "#EFF6FF",
      location = {},
      seller = {}
    } = req.body;

    const errors = {};
    if (!String(name || "").trim()) errors.name = "Item title is required";
    if (!String(category || "").trim()) errors.category = "Category is required";
    if (price === undefined || price === null || isNaN(price) || Number(price) <= 0) {
      errors.price = "Enter a valid price in ETB";
    }
    if (!String(description || "").trim()) errors.description = "Description is required";
    if (!String(seller.phone || "").trim()) errors.phone = "Seller phone number is required";

    if (Object.keys(errors).length) {
      return res.status(400).json({ errors });
    }

    const slugBase = String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30);
    const uniqueSuffix = crypto.randomUUID().slice(0, 6);
    const listingId = `${slugBase}-${uniqueSuffix}`;

    const newProduct = await Product.create({
      _id: listingId,
      name: String(name).trim(),
      category: String(category).trim(),
      price: Number(price),
      negotiable: Boolean(negotiable),
      condition: String(condition).trim(),
      stock: Math.max(1, parseInt(stock, 10) || 1),
      art: String(art || "notebook"),
      color: String(color || "#2563EB"),
      tint: String(tint || "#EFF6FF"),
      description: String(description).trim(),
      location: {
        city: String(location.city || "Addis Ababa").trim(),
        subcity: String(location.subcity || "Bole").trim(),
      },
      seller: {
        name: String(seller.name || "Gedualpha Seller").trim(),
        phone: String(seller.phone || "").trim(),
        telegram: String(seller.telegram || "").replace(/^@/, "").trim(),
        whatsapp: String(seller.whatsapp || "").trim(),
        verified: true,
      },
      views: 1,
      featured: false,
    });

    const { _id, __v, ...rest } = newProduct.toObject();
    res.status(201).json({ id: _id, ...rest });
  } catch (err) {
    console.error("Create listing error:", err);
    res.status(500).json({ error: "Failed to create listing: " + err.message });
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
      items: lines,   // embedded in the order document
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
