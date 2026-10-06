/**
 * Seed script — run once to populate the MongoDB database with initial products.
 *
 * Usage:
 *   node server/database/seed.js
 *
 * Make sure MONGODB_URI is set in server/.env (or as an env var) before running.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Load .env from the server directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌  MONGODB_URI is not set in server/.env");
  process.exit(1);
}

// ─── Product schema (inline — no need to import the model file) ───────────────
const Product = mongoose.model(
  "Product",
  new mongoose.Schema(
    {
      _id:         String,
      name:        String,
      category:    String,
      price:       Number,
      stock:       Number,
      art:         String,
      color:       String,
      tint:        String,
      description: String,
    },
    { timestamps: true }
  )
);

const PRODUCTS = [
  { _id: "daybook-notebook",  name: "Daybook Notebook",   category: "stationery", price: 1800, stock: 40, art: "notebook", color: "#2B3FD9", tint: "#FFEFC2", description: "A5 size with 192 pages of thick dotted paper that lies flat when opened. Fountain-pen friendly, no ghosting." },
  { _id: "studio-mug",        name: "Studio Mug",          category: "desk",       price: 2400, stock: 25, art: "mug",      color: "#FFB627", tint: "#D6DEFF", description: "Hand-glazed stoneware that holds 350 ml and stays warm. Dishwasher and microwave safe." },
  { _id: "fine-line-pens",    name: "Fine-Line Pen Set",   category: "stationery", price: 1600, stock: 4,  art: "pen",      color: "#FF6F59", tint: "#FFEFC2", description: "Five 0.4 mm gel pens in bright inks. Quick-drying, smudge-resistant, refillable." },
  { _id: "arc-desk-lamp",     name: "Arc Desk Lamp",       category: "desk",       price: 6800, stock: 12, art: "lamp",     color: "#2B3FD9", tint: "#FFD9D2", description: "Dimmable LED lamp with a weighted base and a warm 2700 K glow that is easy on tired eyes." },
  { _id: "everyday-tote",     name: "Everyday Tote",       category: "carry",      price: 3200, stock: 30, art: "tote",     color: "#FFB627", tint: "#D6DEFF", description: "Heavy cotton canvas with an inner pocket. Fits a 14-inch laptop, a notebook, and lunch." },
  { _id: "weekly-planner",    name: "Weekly Planner",      category: "stationery", price: 2200, stock: 18, art: "planner",  color: "#FF6F59", tint: "#D6DEFF", description: "Undated, wire-bound, with one open page per week and a monthly overview. Starts whenever you do." },
  { _id: "washi-trio",        name: "Washi Tape Trio",     category: "desk",       price:  900, stock: 60, art: "tape",     color: "#2B3FD9", tint: "#FFD9D2", description: "Three rolls in complementary patterns. Tears by hand, peels off cleanly, writes well." },
  { _id: "pencil-cup",        name: "Pencil Cup",          category: "desk",       price: 2000, stock: 22, art: "cup",      color: "#FF6F59", tint: "#FFEFC2", description: "A weighty ceramic cup that keeps pens, pencils, and scissors within reach and off the desk." },
];

async function seed() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB:", mongoose.connection.host);

  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log(`⚠️   ${existing} products already exist — skipping seed to avoid duplicates.`);
    console.log("     Delete the 'products' collection manually first if you want a fresh seed.");
  } else {
    await Product.insertMany(PRODUCTS);
    console.log(`✅  Seeded ${PRODUCTS.length} products successfully.`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
