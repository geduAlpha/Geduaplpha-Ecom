# Marigold Supply — React + Node.js + MongoDB

A full-stack e-commerce app: React storefront (Vite) + Node.js/Express API + MongoDB (Mongoose).

---

## 🚀 Deploy to Railway + MongoDB Atlas

### Step 1 — Create a free MongoDB Atlas cluster
1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register) → **Create a free account**
2. Create a **Free (M0) cluster** → choose any region close to your Railway deployment
3. Under **Security → Database Access**, create a database user (save the username & password)
4. Under **Security → Network Access**, add IP `0.0.0.0/0` to allow Railway to connect
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/gedualpha_ecom?retryWrites=true&w=majority
   ```
   Replace `<user>` and `<password>` with your credentials.

### Step 2 — Deploy to Railway from GitHub
1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select `geduAlpha/Geduaplpha-Ecom` → **Deploy Now**
3. Railway auto-detects `nixpacks.toml` and builds the app

### Step 3 — Set environment variables
In your **web service** → **Variables** tab, add:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your Atlas connection string from Step 1 |
| `PORT` | `${{PORT}}` |
| `CLIENT_ORIGIN` | `https://your-app-name.up.railway.app` |

> ⚠️ Get your public URL from **Settings → Networking → Generate Domain**, then update `CLIENT_ORIGIN`.

### Step 4 — Seed the database
After the first successful deploy, seed your products:

**Option A — Railway CLI**
```bash
railway run node server/database/seed.js
```

**Option B — Local (with Atlas URI in .env)**
```bash
# Set MONGODB_URI in server/.env to the Atlas string, then:
npm run seed --prefix server
```

**Option C — MongoDB Atlas UI**
Import the data via Atlas Data Explorer or MongoDB Compass.

### Step 5 — Verify
- `https://your-app.up.railway.app` — storefront loads
- `https://your-app.up.railway.app/api/health` → `{"status":"ok","db":"connected"}`
- `https://your-app.up.railway.app/api/products` → returns 8 products

---

## 💻 Run locally

> **Requires:** Node.js ≥ 18, MongoDB running locally (or an Atlas connection string)

```bash
# Terminal 1 — API server (http://localhost:4000)
cd server
npm install
npm run dev

# Terminal 2 — React frontend (http://localhost:5173)
cd client
npm install
npm run dev
```

Seed products the first time:
```bash
npm run seed --prefix server
```

The Vite dev server proxies `/api` to the Node server automatically.

---

## Project structure

```
.
├── client/          # React + Vite frontend
│   └── src/
├── server/
│   ├── models/
│   │   ├── Product.js   # Mongoose product schema
│   │   └── Order.js     # Mongoose order schema (items embedded)
│   ├── database/
│   │   ├── seed.js      # One-time product seed script
│   │   └── schema.sql   # Legacy MySQL schema (kept for reference)
│   ├── db.js            # MongoDB connection (Mongoose)
│   └── index.js         # Express API
├── nixpacks.toml    # Railway build config
└── Procfile         # Heroku-style start command
```

## What's included

- Product grid with search, category filter, sorting and pagination
- Product detail pages
- Cart drawer with quantity controls, persisted in localStorage
- Checkout with server-side validation, atomic stock deduction, server-calculated shipping
- Responsive layout, keyboard focus styles, reduced-motion support

## Customise it

- **Colors & fonts:** `client/src/styles.css` CSS variables
- **Products:** edit seeds in `server/database/seed.js` (prices in cents)
- **Store name:** search & replace "Marigold Supply"

## Next steps

1. **Payments:** integrate Stripe Checkout in `POST /api/orders`, confirm via webhook
2. **Auth & admin:** add JWT sessions and a protected admin panel
3. **Emails:** send order confirmations (Resend, Postmark, or AWS SES)
