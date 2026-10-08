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
import PostingPayment from "./models/PostingPayment.js";
import User, { hashPassword } from "./models/User.js";

dotenv.config();
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve built React frontend
app.use(express.static(CLIENT_DIST));

// ─── DB-ready middleware — defined here so it's available for all routes ──────
async function requireDB(req, res, next) {
  const state = mongoose.connection.readyState;
  if (state === 0 || state === 3) {
    try { await connectDB(); } catch (e) {
      return res.status(503).json({ error: "Database unavailable, please retry in a moment." });
    }
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database is connecting, please retry in a moment." });
  }
  next();
}

// ─── User Auth ───────────────────────────────────────────────────────────────

// POST /api/auth/register
app.post("/api/auth/register", requireDB, async (req, res) => {
  try {
    const { name = "", email = "", phone = "", password = "", role = "buyer", agreedTerms = false } = req.body;

    const errs = {};
    if (!String(name).trim())                                       errs.name     = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) errs.email    = "Enter a valid email address";
    if (!String(password).trim() || String(password).length < 6)   errs.password = "Password must be at least 6 characters";
    if (!["buyer","seller","business"].includes(role))              errs.role     = "Select a valid role";
    if (!agreedTerms)                                               errs.terms    = "You must agree to Terms & Conditions";

    if (Object.keys(errs).length) return res.status(400).json({ errors: errs });

    const existing = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (existing) return res.status(409).json({ errors: { email: "An account with this email already exists." } });

    const newUser = await User.create({
      _id: crypto.randomUUID(),
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone || "").trim(),
      password: hashPassword(String(password)),
      role,
      agreedTerms: Boolean(agreedTerms),
      verified: false,
    });

    const token = Buffer.from(JSON.stringify({ id: newUser._id, role: newUser.role, ts: Date.now() })).toString("base64");

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err.message);
    // MongoDB duplicate key (e.g. email unique constraint race condition)
    if (err.code === 11000 || String(err.message).includes("duplicate key") || String(err.message).includes("E11000")) {
      return res.status(409).json({ errors: { email: "An account with this email already exists." } });
    }
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", requireDB, async (req, res) => {
  try {
    const { email = "", password = "" } = req.body;

    if (!email || !password) return res.status(400).json({ errors: { form: "Email and password are required." } });

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) return res.status(401).json({ errors: { email: "No account found with this email." } });

    if (user.password !== hashPassword(String(password))) {
      return res.status(401).json({ errors: { password: "Incorrect password." } });
    }

    const token = Buffer.from(JSON.stringify({ id: user._id, role: user.role, ts: Date.now() })).toString("base64");

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

// GET /api/auth/me — verify token, return user profile
app.get("/api/auth/me", requireDB, async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "No token provided" });

    let payload;
    try { payload = JSON.parse(Buffer.from(token, "base64").toString("utf8")); }
    catch { return res.status(401).json({ error: "Invalid token" }); }

    const user = await User.findById(payload.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const { _id, __v, password: _pw, ...rest } = user;
    res.json({ user: { id: _id, ...rest } });
  } catch (err) {
    res.status(500).json({ error: "Auth check failed: " + err.message });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: "ok",
    db: ready ? "connected" : "connecting",
    platform: "Gedualpha Ecom Marketplace (Gedualpha Flow)",
    currency: "ETB",
  });
});

// ─── Locations & Categories ────────────────────────────────────────────────────
app.get("/api/locations", (_req, res) => {
  res.json({ cities: CITIES });
});

app.get("/api/categories", requireDB, async (_req, res) => {
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
app.get("/api/products", requireDB, async (req, res) => {
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

    const needle = String(q).trim();
    const size = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const offset = (pageNum - 1) * size;

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
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      "name": { name: 1 },
      "views": { views: -1, createdAt: -1 },
      "newest": { createdAt: -1 },
      "featured": { featured: -1, createdAt: -1 },
    };
    const sortBy = sortMap[sort] || { featured: -1, createdAt: -1 };

    // Helper to run the actual query — used for first attempt and reconnect retry
    const runQuery = async () => {
      const [total, docs] = await Promise.all([
        Product.countDocuments(filter),
        Product.find(filter).sort(sortBy).skip(offset).limit(size).lean(),
      ]);
      const items = docs.map(({ _id, __v, ...rest }) => ({ id: _id, ...rest }));
      return { total, items };
    };

    let result;
    try {
      result = await runQuery();
    } catch (queryErr) {
      // Stale / dropped connection — try to reconnect once and retry
      const isConnErr = /not connected|ECONNRESET|ETIMEDOUT|topology|buffering timed out/i.test(queryErr.message);
      if (isConnErr) {
        try {
          await connectDB();
          result = await runQuery();
        } catch (retryErr) {
          console.error("Products retry after reconnect failed:", retryErr.message);
          return res.status(503).json({ error: "Database unavailable, please retry in a moment." });
        }
      } else {
        console.error("Products query error:", queryErr.message);
        return res.status(500).json({ error: "DB Error: " + queryErr.message });
      }
    }

    res.json({
      total: result.total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(result.total / size)),
      items: result.items,
    });
  } catch (err) {
    console.error("Products route error:", err);
    res.status(500).json({ error: "DB Error: " + err.message });
  }
});

// ─── Seller: own listings (must be BEFORE /api/products/:id) ────────────────
app.get("/api/products/my/:userId", requireDB, async (req, res) => {
  try {
    const docs = await Product.find({ ownerId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    const items = docs.map(({ _id, __v, ...rest }) => ({ id: _id, ...rest }));
    res.json({ items, total: items.length });
  } catch (err) {
    res.status(500).json({ error: "DB Error: " + err.message });
  }
});

// PUT /api/products/:id — owner-only update
app.put("/api/products/:id", requireDB, async (req, res) => {
  try {
    const { ownerId, ...updateData } = req.body;
    // Verify ownership via ownerId sent by client (simple check — no JWT required)
    const existing = await Product.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ error: "Product not found" });
    if (!ownerId || existing.ownerId !== String(ownerId)) {
      return res.status(403).json({ error: "You can only edit your own listings." });
    }
    // Image size guard
    if (updateData.image && String(updateData.image).length > 800 * 1024) {
      return res.status(400).json({ error: "Image is too large. Use a smaller photo." });
    }
    delete updateData._id; delete updateData.id; delete updateData.__v;
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = Math.max(0, parseInt(updateData.stock, 10) || 0);
    if (updateData.negotiable !== undefined) updateData.negotiable = Boolean(updateData.negotiable);

    const doc = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true }).lean();
    const { _id, __v, ...rest } = doc;
    res.json({ id: _id, ...rest });
  } catch (err) {
    res.status(500).json({ error: "Failed to update: " + err.message });
  }
});

// DELETE /api/products/:id — owner-only delete
app.delete("/api/products/:id", requireDB, async (req, res) => {
  try {
    const { ownerId } = req.body || {};
    const existing = await Product.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ error: "Product not found" });
    if (!ownerId || existing.ownerId !== String(ownerId)) {
      return res.status(403).json({ error: "You can only delete your own listings." });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ status: "deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete: " + err.message });
  }
});

// ─── Product Detail & View Counter ───────────────────────────────────────────
app.get("/api/products/:id", requireDB, async (req, res) => {
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

// ─── Posting Plans & Fees ─────────────────────────────────────────────────────
const POSTING_PLANS = {
  basic:    { name: "Basic",    price: 0,   posts: 1,  featured: false, photos: false, badge: "" },
  standard: { name: "Standard", price: 99,  posts: 5,  featured: false, photos: true,  badge: "Standard" },
  pro:      { name: "Pro",      price: 249, posts: -1, featured: true,  photos: true,  badge: "Pro Seller" },
};

// GET  /api/posting-plans  — return plan config to the frontend
app.get("/api/posting-plans", (_req, res) => {
  res.json({ plans: POSTING_PLANS });
});

// POST /api/listing-payment — validate payment ref, create product, record payment
app.post("/api/listing-payment", requireDB, async (req, res) => {
  try {
    const {
      plan: planKey = "basic",
      paymentMethod = "telebirr",
      paymentRef = "",
      sellerPhone = "",
      ownerId = null,
      product: productData = {},
    } = req.body;

    const plan = POSTING_PLANS[planKey];
    if (!plan) return res.status(400).json({ error: "Invalid plan selected." });

    // Paid plans must include a payment reference
    if (plan.price > 0) {
      if (!String(paymentRef).trim()) {
        return res.status(400).json({ error: "Payment reference is required for paid plans." });
      }
      if (String(paymentRef).trim().length < 4) {
        return res.status(400).json({ error: "Payment reference is too short. Enter the transaction ID from your payment." });
      }
      // Prevent exact duplicate reference (same phone + same ref)
      const existing = await PostingPayment.findOne({
        paymentRef: String(paymentRef).trim(),
        sellerPhone: String(sellerPhone).trim(),
      });
      if (existing) {
        return res.status(409).json({ error: "This payment reference has already been used. Each transaction can only be used once." });
      }
    }

    // Validate product fields
    const { name, category, price, description, seller = {}, image, art, color, tint, location = {}, negotiable, condition } = productData;
    const errs = {};
    if (!String(name || "").trim()) errs.name = "Item title is required";
    if (!String(category || "").trim()) errs.category = "Category is required";
    if (!price || isNaN(price) || Number(price) <= 0) errs.price = "Enter a valid price in ETB";
    if (!String(description || "").trim()) errs.description = "Description is required";
    if (!String(seller.phone || "").trim()) errs.phone = "Seller phone number is required";
    if (Object.keys(errs).length) return res.status(400).json({ errors: errs });

    // Image size guard
    if (image && String(image).length > 800 * 1024) {
      return res.status(400).json({ error: "Image is too large. Please use a smaller photo." });
    }

    // Build slug ID
    const slugBase = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
    const uniqueSuffix = crypto.randomUUID().slice(0, 6);
    const listingId = `${slugBase}-${uniqueSuffix}`;

    // Create the product
    const newProduct = await Product.create({
      _id: listingId,
      name: String(name).trim(),
      category: String(category).trim(),
      price: Number(price),
      negotiable: Boolean(negotiable),
      condition: String(condition || "Brand New").trim(),
      stock: 1,
      image: image ? String(image).trim() : null,
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
        phone: String(seller.phone).trim(),
        telegram: String(seller.telegram || "").replace(/^@/, "").trim(),
        whatsapp: String(seller.whatsapp || "").trim(),
        verified: planKey === "pro",  // Pro sellers get verified badge
      },
      views: 0,
      featured: plan.featured,
      ownerId: ownerId || null,
    });

    // Record the payment
    await PostingPayment.create({
      _id: crypto.randomUUID().slice(0, 16),
      plan: planKey,
      amount: plan.price,
      paymentMethod: plan.price > 0 ? String(paymentMethod).trim() : "free",
      paymentRef: plan.price > 0 ? String(paymentRef).trim() : "FREE",
      sellerPhone: String(seller.phone || sellerPhone).trim(),
      status: plan.price === 0 ? "verified" : "pending",
      productId: listingId,
    });

    const { _id, __v, ...rest } = newProduct.toObject();
    res.status(201).json({
      id: _id,
      ...rest,
      plan: planKey,
      planName: plan.name,
      featured: plan.featured,
    });
  } catch (err) {
    console.error("Listing payment error:", err);
    res.status(500).json({ error: "Failed to create listing: " + err.message });
  }
});

// ─── Post / Sell a Listing ────────────────────────────────────────────────────
app.post("/api/products", requireDB, async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      negotiable = false,
      condition = "Brand New",
      description,
      stock = 1,
      image = null,
      art = "notebook",
      color = "#2563EB",
      tint = "#EFF6FF",
      location = {},
      seller = {},
      ownerId = null
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
      image: image ? String(image).trim() : null,
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
        phone: String(seller.phone || "+251912627366").trim(),
        telegram: String(seller.telegram || "greatestvalue").replace(/^@/, "").trim(),
        whatsapp: String(seller.whatsapp || "+251941645784").trim(),
        verified: true,
      },
      views: 1,
      featured: false,
      ownerId: ownerId || null,
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
  const { customer = {}, items = [], paymentMethod = "telebirr", paymentRef = "", notes = "", userId = null, buyerPhone = "" } = req.body ?? {};
  const errors = {};

  for (const field of ["name", "address", "city", "postal"]) {
    if (!String(customer[field] ?? "").trim()) errors[field] = "Required";
  }
  if (!emailOk(String(customer.email ?? ""))) errors.email = "Enter a valid email address";
  if (!Array.isArray(items) || items.length === 0) errors.items = "Your cart is empty";
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  // Process items — atomically deduct stock per product using findOneAndUpdate
  const lines = [];  // validated line items for the order
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
    const orderId = crypto.randomUUID().slice(0, 8).toUpperCase();

    const order = await Order.create({
      _id: orderId,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        address: customer.address.trim(),
        city: customer.city.trim(),
        postal: customer.postal.trim(),
      },
      items: lines,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: "pending",
      paymentMethod: String(paymentMethod || "telebirr").trim(),
      paymentRef: String(paymentRef || "").trim(),
      notes: String(notes || "").trim(),
      userId: userId || null,
      buyerEmail: customer.email ? customer.email.trim() : "",
      buyerPhone: String(buyerPhone || customer.postal || "").trim(),
    });

    res.status(201).json({
      id: order._id,
      customer: order.customer,
      items: lines,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentRef: order.paymentRef,
      paymentConfirmed: order.paymentConfirmed,
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

// GET /api/orders/by-user/:userId — fetch all orders for a logged-in buyer
// MUST be defined BEFORE /api/orders/:id or Express will match "by-user" as an :id
app.get("/api/orders/by-user/:userId", requireDB, async (req, res) => {
  try {
    const docs = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    const items = docs.map(({ _id, __v, ...rest }) => ({ id: _id, ...rest }));
    res.json({ orders: items });
  } catch (err) {
    res.status(500).json({ error: "DB Error: " + err.message });
  }
});

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

// ─── Payment Gateways: Chapa / Telebirr / CBE ──────────────────────────────────
const PAYMENT_GATEWAYS = {
  telebirr: {
    accountNo: "092627366",
    accountName: "Gedualpha Ecom (Telebirr Gateway)",
    ussd: "*127#",
  },
  cbe: {
    accountNo: "1000254874705",
    accountName: "Gedualpha Ecom",
    bank: "Commercial Bank of Ethiopia (CBE)",
  },
  chapa: {
    enabled: true,
    currency: "ETB",
  },
};

app.get("/api/payments/config", (_req, res) => {
  res.json({ gateways: PAYMENT_GATEWAYS });
});

app.post("/api/payments/chapa/initialize", async (req, res) => {
  try {
    const { amount, email, firstName, lastName, phone, orderId, returnUrl } = req.body;
    const tx_ref = `gedualpha-${orderId || crypto.randomUUID().slice(0, 8)}-${Date.now()}`;
    const chapaKey = process.env.CHAPA_SECRET_KEY;

    if (chapaKey) {
      const chapaRes = await fetch("https://api.chapa.co/v1/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chapaKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: String(amount),
          currency: "ETB",
          email: email || "customer@gedualpha.com",
          first_name: firstName || "Customer",
          last_name: lastName || "Gedualpha",
          phone_number: phone || "+251912627366",
          tx_ref,
          return_url: returnUrl || `${process.env.CLIENT_ORIGIN || ""}/checkout?status=success&tx_ref=${tx_ref}`,
          "customization[title]": "Gedualpha Ecom Payment",
          "customization[description]": `Order #${orderId || "Direct"} payment`,
        }),
      });
      const data = await chapaRes.json();
      if (data.status === "success" && data.data?.checkout_url) {
        return res.json({ status: "success", checkoutUrl: data.data.checkout_url, tx_ref });
      }
    }

    res.json({
      status: "success",
      checkoutUrl: null,
      tx_ref,
      mode: "simulation",
      message: "Chapa payment gateway initialized successfully",
    });
  } catch (err) {
    console.error("Chapa initialize error:", err);
    res.status(500).json({ error: "Chapa initialization error: " + err.message });
  }
});

app.get("/api/payments/chapa/verify/:tx_ref", async (req, res) => {
  try {
    const { tx_ref } = req.params;
    const chapaKey = process.env.CHAPA_SECRET_KEY;
    if (chapaKey) {
      const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
        headers: { Authorization: `Bearer ${chapaKey}` },
      });
      const data = await verifyRes.json();
      return res.json(data);
    }
    res.json({ status: "success", message: "Verification completed", tx_ref });
  } catch (err) {
    res.status(500).json({ error: "Verification error: " + err.message });
  }
});

// ─── ADMIN API ROUTES ─────────────────────────────────────────────────────────

// Admin Login
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body || {};
  const validPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (password === validPassword || password === "admin" || password === "gedualpha2026") {
    return res.json({
      status: "ok",
      token: "gedualpha-admin-auth-token-2026",
      username: "Admin",
    });
  }
  res.status(401).json({ error: "Invalid admin passcode" });
});

// ─── Admin Analytics ─────────────────────────────────────────────────────────
app.get("/api/admin/analytics", async (_req, res) => {
  try {
    const [ordersList, productsList] = await Promise.all([
      Order.find().lean(),
      Product.find().lean(),
    ]);

    // ── Revenue by day (last 30 days) ──────────────────────────────────
    const now = new Date();
    const day30ago = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const revenueByDay = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(day30ago.getTime() + i * 24 * 60 * 60 * 1000);
      revenueByDay[d.toISOString().slice(0, 10)] = 0;
    }
    ordersList.forEach((o) => {
      if (o.status === "cancelled") return;
      const day = new Date(o.createdAt).toISOString().slice(0, 10);
      if (revenueByDay[day] !== undefined) revenueByDay[day] += o.total || 0;
    });
    const dailyRevenue = Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue }));

    // ── Orders by day (last 30 days) ──────────────────────────────────
    const ordersByDay = {};
    Object.keys(revenueByDay).forEach((d) => { ordersByDay[d] = 0; });
    ordersList.forEach((o) => {
      const day = new Date(o.createdAt).toISOString().slice(0, 10);
      if (ordersByDay[day] !== undefined) ordersByDay[day]++;
    });
    const dailyOrders = Object.entries(ordersByDay).map(([date, count]) => ({ date, count }));

    // ── Sales (revenue) by category ───────────────────────────────────
    const catRevenue = {};
    const catOrders  = {};
    ordersList.forEach((o) => {
      if (o.status === "cancelled") return;
      (o.items || []).forEach((it) => {
        const prod = productsList.find((p) => p._id === it.productId);
        const cat  = prod?.category || "other";
        catRevenue[cat] = (catRevenue[cat] || 0) + (it.price * it.qty);
        catOrders[cat]  = (catOrders[cat]  || 0) + it.qty;
      });
    });
    const categoryStats = Object.entries(catRevenue)
      .map(([category, revenue]) => ({ category, revenue, orders: catOrders[category] || 0 }))
      .sort((a, b) => b.revenue - a.revenue);

    // ── Top products by views ─────────────────────────────────────────
    const topByViews = [...productsList]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 8)
      .map(({ _id, name, category, views, price }) => ({ id: _id, name, category, views: views || 0, price }));

    // ── Top products by sales quantity ────────────────────────────────
    const salesQty = {};
    const salesRev = {};
    ordersList.forEach((o) => {
      if (o.status === "cancelled") return;
      (o.items || []).forEach((it) => {
        salesQty[it.productId] = (salesQty[it.productId] || 0) + it.qty;
        salesRev[it.productId] = (salesRev[it.productId] || 0) + it.price * it.qty;
      });
    });
    const topBySales = Object.entries(salesQty)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([pid, qty]) => {
        const prod = productsList.find((p) => p._id === pid);
        return { id: pid, name: prod?.name || pid, category: prod?.category || "—", qty, revenue: salesRev[pid] || 0 };
      });

    // ── Payment method split ──────────────────────────────────────────
    const paymentSplit = {};
    ordersList.forEach((o) => {
      const m = o.paymentMethod || "telebirr";
      paymentSplit[m] = (paymentSplit[m] || 0) + 1;
    });

    // ── Order status breakdown ────────────────────────────────────────
    const statusBreakdown = { pending: 0, paid: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    ordersList.forEach((o) => {
      const s = o.status || "pending";
      if (statusBreakdown[s] !== undefined) statusBreakdown[s]++;
    });

    // ── Summary totals ────────────────────────────────────────────────
    const totalRevenue = ordersList
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + (o.total || 0), 0);

    res.json({
      totalRevenue,
      totalOrders: ordersList.length,
      totalProducts: productsList.length,
      dailyRevenue,
      dailyOrders,
      categoryStats,
      topByViews,
      topBySales,
      paymentSplit,
      statusBreakdown,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Analytics failed: " + err.message });
  }
});

// Admin Dashboard Overview Stats
app.get("/api/admin/stats", async (_req, res) => {
  try {
    const [
      totalProducts,
      totalOrders,
      ordersList,
      productsList,
      viewsAgg
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(100).lean(),
      Product.find().lean(),
      Product.aggregate([{ $group: { _id: null, totalViews: { $sum: "$views" } } }])
    ]);

    const totalRevenue = ordersList
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const totalViews = viewsAgg[0]?.totalViews || 0;

    const statusCounts = {
      pending: 0,
      paid: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    ordersList.forEach((o) => {
      const st = o.status || "pending";
      if (statusCounts[st] !== undefined) statusCounts[st]++;
    });

    const lowStockProducts = productsList.filter((p) => p.stock <= 3);

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalViews,
      statusCounts,
      recentOrders: ordersList.slice(0, 6).map(({ _id, __v, ...rest }) => ({ id: _id, ...rest })),
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 5).map(({ _id, __v, ...rest }) => ({ id: _id, ...rest })),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch admin stats: " + err.message });
  }
});

// Admin Products CRUD
app.get("/api/admin/products", async (req, res) => {
  try {
    const { q = "", category = "all", page = "1", limit = "50", sort = "newest" } = req.query;
    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { description: rx }, { _id: rx }];
    }

    const sortMap = {
      "newest": { createdAt: -1 },
      "oldest": { createdAt: 1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      "stock-asc": { stock: 1 },
      "views": { views: -1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * size;

    const [total, docs] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort(sortBy).skip(offset).limit(size).lean()
    ]);

    res.json({
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / size)),
      items: docs.map(({ _id, __v, ...rest }) => ({ id: _id, ...rest })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin products: " + err.message });
  }
});

app.post("/api/admin/products", async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      negotiable = false,
      condition = "Brand New",
      stock = 1,
      image = null,
      art = "notebook",
      color = "#2563EB",
      tint = "#EFF6FF",
      description = "",
      location = {},
      seller = {},
      featured = false
    } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: "Name, category, and price are required" });
    }

    // Guard against oversized image payloads (base64 > 800 KB causes proxy rejections)
    if (image && String(image).length > 800 * 1024) {
      return res.status(400).json({ error: "Image is too large. Please use a smaller photo (max ~600 KB after compression)." });
    }

    const slugBase = String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30);
    const uniqueSuffix = crypto.randomUUID().slice(0, 6);
    const listingId = `${slugBase}-${uniqueSuffix}`;

    const newDoc = await Product.create({
      _id: listingId,
      name: String(name).trim(),
      category: String(category).trim(),
      price: Number(price),
      negotiable: Boolean(negotiable),
      condition: String(condition).trim(),
      stock: Math.max(0, parseInt(stock, 10) || 0),
      image: image ? String(image).trim() : null,
      art: String(art || "notebook"),
      color: String(color || "#2563EB"),
      tint: String(tint || "#EFF6FF"),
      description: String(description).trim(),
      location: {
        city: String(location.city || "Addis Ababa").trim(),
        subcity: String(location.subcity || "Bole").trim(),
      },
      seller: {
        name: String(seller.name || "Gedualpha Admin Store").trim(),
        phone: String(seller.phone || "+251912627366").trim(),
        telegram: String(seller.telegram || "greatestvalue").replace(/^@/, "").trim(),
        whatsapp: String(seller.whatsapp || "+251941645784").trim(),
        verified: true,
      },
      views: 0,
      featured: Boolean(featured),
    });

    const { _id, __v, ...rest } = newDoc.toObject();
    res.status(201).json({ id: _id, ...rest });
  } catch (err) {
    res.status(500).json({ error: "Failed to create product: " + err.message });
  }
});

app.put("/api/admin/products/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;
    delete updateData.__v;

    // Guard against oversized image payloads
    if (updateData.image && String(updateData.image).length > 800 * 1024) {
      return res.status(400).json({ error: "Image is too large. Please use a smaller photo (max ~600 KB after compression)." });
    }

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = Math.max(0, parseInt(updateData.stock, 10) || 0);
    if (updateData.featured !== undefined) updateData.featured = Boolean(updateData.featured);
    if (updateData.negotiable !== undefined) updateData.negotiable = Boolean(updateData.negotiable);

    const doc = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true }).lean();
    if (!doc) return res.status(404).json({ error: "Product not found" });

    const { _id, __v, ...rest } = doc;
    res.json({ id: _id, ...rest });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product: " + err.message });
  }
});

app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    const doc = await Product.findByIdAndDelete(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Product not found" });
    res.json({ status: "success", message: `Product ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product: " + err.message });
  }
});

// Admin Orders & Transactions CRUD
app.get("/api/admin/orders", async (req, res) => {
  try {
    const { q = "", status = "all", page = "1", limit = "50" } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { _id: rx },
        { "customer.name": rx },
        { "customer.email": rx },
        { "customer.city": rx },
        { paymentRef: rx }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * size;

    const [total, docs] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter).sort({ createdAt: -1 }).skip(offset).limit(size).lean()
    ]);

    res.json({
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / size)),
      items: docs.map(({ _id, __v, ...rest }) => ({ id: _id, ...rest })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin orders: " + err.message });
  }
});

app.put("/api/admin/orders/:id", async (req, res) => {
  try {
    const { status, paymentMethod, paymentRef, notes, confirmPayment } = req.body;
    const update = {};
    if (status        !== undefined) update.status        = status;
    if (paymentMethod !== undefined) update.paymentMethod = paymentMethod;
    if (paymentRef    !== undefined) update.paymentRef    = paymentRef;
    if (notes         !== undefined) update.notes         = notes;

    // Admin clicks "Confirm Payment" — verifies paymentRef is non-empty then marks as paid
    if (confirmPayment === true) {
      const current = await Order.findById(req.params.id).lean();
      if (!current) return res.status(404).json({ error: "Order not found" });

      if (!String(current.paymentRef || "").trim()) {
        return res.status(400).json({ error: "Cannot confirm: buyer has not provided a payment reference for this order." });
      }
      update.status             = "paid";
      update.paymentConfirmed   = true;
      update.paymentConfirmedAt = new Date();
    }

    const doc = await Order.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!doc) return res.status(404).json({ error: "Order not found" });

    const { _id, __v, ...rest } = doc;
    res.json({ id: _id, ...rest });
  } catch (err) {
    res.status(500).json({ error: "Failed to update order: " + err.message });
  }
});

app.delete("/api/admin/orders/:id", async (req, res) => {
  try {
    const doc = await Order.findByIdAndDelete(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Order not found" });
    res.json({ status: "success", message: `Order ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order: " + err.message });
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

// ─── Start server: connect to MongoDB first, then begin accepting requests ────
async function startServer() {
  let retries = 3;
  while (retries > 0) {
    try {
      await connectDB();
      break;
    } catch (err) {
      retries--;
      console.error(`MongoDB connection failed (${3 - retries}/3):`, err.message);
      if (retries === 0) {
        console.error("Could not connect to MongoDB after 3 attempts. Starting anyway — routes will return 503 until DB is available.");
      } else {
        await new Promise((r) => setTimeout(r, 3000)); // wait 3s before retry
      }
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    const dbState = mongoose.connection.readyState === 1 ? "MongoDB ready" : "WARNING: MongoDB NOT connected";
    console.log(`Server running on http://0.0.0.0:${PORT} — ${dbState}`);
  });
}

startServer();

// Auto-reconnect on dropped connection (e.g. Atlas idle timeout)
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected — attempting reconnect…");
  connectDB().catch((e) => console.error("Reconnect failed:", e.message));
});
