-- Gedualpha Ecom Database Setup
-- Run this script once to create all tables and seed products

CREATE DATABASE IF NOT EXISTS gedualpha_ecom
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gedualpha_ecom;

-- ─── Products ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          VARCHAR(80)   NOT NULL PRIMARY KEY,
  name        VARCHAR(200)  NOT NULL,
  category    VARCHAR(80)   NOT NULL,
  price       INT           NOT NULL,        -- in cents
  stock       INT           NOT NULL DEFAULT 0,
  art         VARCHAR(80)   NOT NULL,
  color       VARCHAR(20)   NOT NULL,
  tint        VARCHAR(20)   NOT NULL,
  description TEXT          NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── Orders ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id           VARCHAR(20)  NOT NULL PRIMARY KEY,
  customer_name    VARCHAR(200) NOT NULL,
  customer_email   VARCHAR(200) NOT NULL,
  customer_address VARCHAR(400) NOT NULL,
  customer_city    VARCHAR(200) NOT NULL,
  customer_postal  VARCHAR(50)  NOT NULL,
  subtotal     INT          NOT NULL,
  shipping     INT          NOT NULL,
  total        INT          NOT NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── Order Items ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id    VARCHAR(20)  NOT NULL,
  product_id  VARCHAR(80)  NOT NULL,
  name        VARCHAR(200) NOT NULL,
  price       INT          NOT NULL,
  qty         INT          NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ─── Seed Products ───────────────────────────────────────────────────────────
INSERT IGNORE INTO products (id, name, category, price, stock, art, color, tint, description) VALUES
('daybook-notebook',  'Daybook Notebook',    'stationery', 1800, 40, 'notebook', '#2B3FD9', '#FFEFC2', 'A5 size with 192 pages of thick dotted paper that lies flat when opened. Fountain-pen friendly, no ghosting.'),
('studio-mug',        'Studio Mug',          'desk',       2400, 25, 'mug',      '#FFB627', '#D6DEFF', 'Hand-glazed stoneware that holds 350 ml and stays warm. Dishwasher and microwave safe.'),
('fine-line-pens',    'Fine-Line Pen Set',   'stationery', 1600,  4, 'pen',      '#FF6F59', '#FFEFC2', 'Five 0.4 mm gel pens in bright inks. Quick-drying, smudge-resistant, refillable.'),
('arc-desk-lamp',     'Arc Desk Lamp',       'desk',       6800, 12, 'lamp',     '#2B3FD9', '#FFD9D2', 'Dimmable LED lamp with a weighted base and a warm 2700 K glow that is easy on tired eyes.'),
('everyday-tote',     'Everyday Tote',       'carry',      3200, 30, 'tote',     '#FFB627', '#D6DEFF', 'Heavy cotton canvas with an inner pocket. Fits a 14-inch laptop, a notebook, and lunch.'),
('weekly-planner',    'Weekly Planner',      'stationery', 2200, 18, 'planner',  '#FF6F59', '#D6DEFF', 'Undated, wire-bound, with one open page per week and a monthly overview. Starts whenever you do.'),
('washi-trio',        'Washi Tape Trio',     'desk',        900, 60, 'tape',     '#2B3FD9', '#FFD9D2', 'Three rolls in complementary patterns. Tears by hand, peels off cleanly, writes well.'),
('pencil-cup',        'Pencil Cup',          'desk',       2000, 22, 'cup',      '#FF6F59', '#FFEFC2', 'A weighty ceramic cup that keeps pens, pencils, and scissors within reach and off the desk.');
