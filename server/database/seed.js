/**
 * Seed script — populates MongoDB with realistic Ethiopian Gedualpha-style marketplace listings.
 *
 * Usage:
 *   node server/database/seed.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(__dirname, "../.env") });

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://gedualpha1989_db_user:fIlIoozWg3X9z3i0@cluster0.dihvcpk.mongodb.net/gedualpha_ecom?retryWrites=true&w=majority&appName=Cluster0";

const productSchema = new mongoose.Schema(
  {
    _id: String,
    name: String,
    category: String,
    price: Number,
    negotiable: Boolean,
    condition: String,
    stock: Number,
    art: String,
    color: String,
    tint: String,
    description: String,
    location: { city: String, subcity: String },
    seller: { name: String, phone: String, telegram: String, whatsapp: String, verified: Boolean },
    views: Number,
    featured: Boolean,
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const DEFAULT_SELLER = {
  name: "Gedualpha Verified Seller",
  phone: "+251912627366",
  telegram: "greatestvalue",
  whatsapp: "+251941645784",
  verified: true,
};

const PRODUCTS = [
  // ─── Electronics & Phones ───
  {
    _id: "iphone-15-pro-max-256gb",
    name: "iPhone 15 Pro Max (256GB, Titanium Blue)",
    category: "electronics",
    price: 148000,
    negotiable: true,
    condition: "Like New",
    stock: 2,
    art: "phone",
    color: "#1E3A8A",
    tint: "#EFF6FF",
    description: "Original US model, battery health 98%, includes original box, braided USB-C cable and silicone case. Clean IMEI, no scratches.",
    location: { city: "Addis Ababa", subcity: "Bole" },
    seller: DEFAULT_SELLER,
    views: 342,
    featured: true,
  },
  {
    _id: "macbook-pro-14-m3-pro",
    name: "Apple MacBook Pro 14\" M3 Pro (18GB / 512GB)",
    category: "electronics",
    price: 215000,
    negotiable: false,
    condition: "Brand New",
    stock: 3,
    art: "laptop",
    color: "#0F172A",
    tint: "#F8FAFC",
    description: "Brand new in sealed box with 1-year Apple international warranty. Space Black, 11-core CPU, 14-core GPU, Liquid Retina XDR display.",
    location: { city: "Addis Ababa", subcity: "Kazanchis" },
    seller: DEFAULT_SELLER,
    views: 289,
    featured: true,
  },
  {
    _id: "samsung-s24-ultra-512gb",
    name: "Samsung Galaxy S24 Ultra (512GB, Titanium Gray)",
    category: "electronics",
    price: 162000,
    negotiable: true,
    condition: "Brand New",
    stock: 4,
    art: "phone",
    color: "#475569",
    tint: "#F1F5F9",
    description: "Brand new Galaxy AI flagship. Built-in S-Pen, 200MP camera, Snapdragon 8 Gen 3 for Galaxy, titanium frame with anti-reflective glass.",
    location: { city: "Addis Ababa", subcity: "CMC" },
    seller: DEFAULT_SELLER,
    views: 195,
    featured: false,
  },
  {
    _id: "sony-wh1000xm5-headphones",
    name: "Sony WH-1000XM5 Wireless ANC Headphones",
    category: "electronics",
    price: 43000,
    negotiable: false,
    condition: "Brand New",
    stock: 6,
    art: "headphones",
    color: "#18181B",
    tint: "#FAFAFA",
    description: "Industry-leading active noise canceling with 8 microphones and 2 processors. 30-hour battery life with quick charging, Hi-Res audio LDAC.",
    location: { city: "Addis Ababa", subcity: "Megenagna" },
    seller: DEFAULT_SELLER,
    views: 140,
    featured: false,
  },

  // ─── Vehicles & Auto ───
  {
    _id: "toyota-vitz-2018-automatic",
    name: "Toyota Vitz 2018 (Auto, 1.3L, Clean Title)",
    category: "vehicles",
    price: 1850000,
    negotiable: true,
    condition: "Used",
    stock: 1,
    art: "car",
    color: "#DC2626",
    tint: "#FEF2F2",
    description: "Very clean private vehicle, first owner in Ethiopia. Mileage: 42,000 km, automatic transmission, push-to-start, rearview camera, perfect AC.",
    location: { city: "Addis Ababa", subcity: "Sarbet" },
    seller: DEFAULT_SELLER,
    views: 820,
    featured: true,
  },
  {
    _id: "hyundai-tucson-2022-suv",
    name: "Hyundai Tucson 2022 AWD (Full Option)",
    category: "vehicles",
    price: 4200000,
    negotiable: true,
    condition: "Like New",
    stock: 1,
    art: "suv",
    color: "#2563EB",
    tint: "#EFF6FF",
    description: "Full option panoramic sunroof, leather seats, digital cluster, lane assist, adaptive cruise control. 19,000 km only, showroom condition.",
    location: { city: "Addis Ababa", subcity: "Bole" },
    seller: DEFAULT_SELLER,
    views: 654,
    featured: true,
  },

  // ─── Real Estate & Properties ───
  {
    _id: "luxury-apartment-bole-rent",
    name: "Luxury 2-Bedroom Furnished Apartment (Rent)",
    category: "property",
    price: 48000,
    negotiable: true,
    condition: "Brand New",
    stock: 1,
    art: "apartment",
    color: "#059669",
    tint: "#ECFDF5",
    description: "High-end 2-bedroom, 2-bathroom condo behind Bole Medhanialem. 24/7 generator, backup water tank, security, basement parking, gym and elevator.",
    location: { city: "Addis Ababa", subcity: "Bole" },
    seller: DEFAULT_SELLER,
    views: 530,
    featured: true,
  },
  {
    _id: "modern-house-cmc-sale",
    name: "Modern 3-Bedroom G+2 Villa for Sale (CMC)",
    category: "property",
    price: 18500000,
    negotiable: true,
    condition: "Brand New",
    stock: 1,
    art: "house",
    color: "#D97706",
    tint: "#FFFBEB",
    description: "Spacious contemporary villa with private garden, modern open kitchen, master suite with jacuzzi, solar backup and security system. 250 sqm plot.",
    location: { city: "Addis Ababa", subcity: "CMC" },
    seller: DEFAULT_SELLER,
    views: 412,
    featured: false,
  },

  // ─── Fashion & Beauty ───
  {
    _id: "traditional-habesha-kemis-handmade",
    name: "Handmade Habesha Kemis with Modern Tilf Embroidery",
    category: "fashion",
    price: 13500,
    negotiable: false,
    condition: "Brand New",
    stock: 8,
    art: "dress",
    color: "#7C3AED",
    tint: "#F5F3FF",
    description: "Authentic 100% pure Shewa cotton, custom embroidered with modern gold & blue silk threads. Includes matching Netela shawl. Perfect for weddings & holidays.",
    location: { city: "Addis Ababa", subcity: "Piassa" },
    seller: DEFAULT_SELLER,
    views: 310,
    featured: false,
  },
  {
    _id: "mens-italian-leather-shoes-oxford",
    name: "Classic Italian Leather Oxford Dress Shoes (Size 40-44)",
    category: "fashion",
    price: 8900,
    negotiable: false,
    condition: "Brand New",
    stock: 15,
    art: "shoe",
    color: "#78350F",
    tint: "#FEF3C7",
    description: "Full-grain genuine leather upper, leather lined, Goodyear welted sole. Handcrafted for supreme comfort and formal elegance.",
    location: { city: "Addis Ababa", subcity: "Mexico" },
    seller: DEFAULT_SELLER,
    views: 184,
    featured: false,
  },

  // ─── Home & Furniture ───
  {
    _id: "l-shape-living-room-sofa-set",
    name: "Modern L-Shape Sectional Sofa Set (Washable Fabric)",
    category: "furniture",
    price: 58000,
    negotiable: true,
    condition: "Brand New",
    stock: 4,
    art: "sofa",
    color: "#0284C7",
    tint: "#F0F9FF",
    description: "High-density orthopedic foam cushions, solid treated eucalyptus hardwood frame, water-repellent grey fabric. Free delivery inside Addis Ababa.",
    location: { city: "Addis Ababa", subcity: "Lebu" },
    seller: DEFAULT_SELLER,
    views: 248,
    featured: false,
  },
  {
    _id: "ergonomic-executive-desk-chair-set",
    name: "Executive Office Desk & High-Back Mesh Chair Combo",
    category: "furniture",
    price: 29500,
    negotiable: false,
    condition: "Brand New",
    stock: 5,
    art: "desk",
    color: "#334155",
    tint: "#F8FAFC",
    description: "Heavy duty 1.6m laminate wood executive desk with 3 lockable drawers, cable management grommets, and lumbar-support breathable mesh chair.",
    location: { city: "Addis Ababa", subcity: "Gurd Shola" },
    seller: DEFAULT_SELLER,
    views: 165,
    featured: false,
  },

  // ─── Desk & Stationery ───
  {
    _id: "leather-daybook-planner-brass-pen-set",
    name: "Premium Daybook Planner & Brass Pen Gift Set",
    category: "stationery",
    price: 2800,
    negotiable: false,
    condition: "Brand New",
    stock: 40,
    art: "notebook",
    color: "#1E3A8A",
    tint: "#EFF6FF",
    description: "A5 Italian faux leather refillable daybook with 200 pages 100gsm acid-free paper, ribbon marker, pen loop, and solid machined brass rollerball pen.",
    location: { city: "Addis Ababa", subcity: "Kazanchis" },
    seller: DEFAULT_SELLER,
    views: 410,
    featured: true,
  },
  {
    _id: "ceramic-studio-coffee-mug",
    name: "Hand-Thrown Artisanal Ceramic Coffee Mug (350ml)",
    category: "stationery",
    price: 1450,
    negotiable: false,
    condition: "Brand New",
    stock: 25,
    art: "mug",
    color: "#D97706",
    tint: "#FFFBEB",
    description: "Handmade ceramic mug inspired by traditional Ethiopian pottery with modern minimalist glaze. Keeps your Sidama coffee warm longer.",
    location: { city: "Addis Ababa", subcity: "Piassa" },
    seller: DEFAULT_SELLER,
    views: 198,
    featured: false,
  },
];

async function seed() {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB:", mongoose.connection.host);

  await Product.deleteMany({});
  console.log("Cleared old products collection.");

  await Product.insertMany(PRODUCTS);
  console.log(`✅ Seeded ${PRODUCTS.length} listings with seller info (+251912627366 / @greatestvalue / 0941645784) successfully.`);

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
