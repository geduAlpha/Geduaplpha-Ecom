# Marigold Supply — React + Node.js + MySQL

A full-stack e-commerce app: React storefront (Vite) + Node.js/Express API + MySQL database.

---

## 🚀 Deploy to Railway (Production)

### Step 1 — Push to GitHub
Your code is already on GitHub at `geduAlpha/Geduaplpha-Ecom`. Make sure all changes are pushed:
```bash
git push origin master
```

### Step 2 — Create a Railway project
1. Go to [railway.app](https://railway.app) → sign in → **New Project**
2. Choose **Deploy from GitHub repo** → select `geduAlpha/Geduaplpha-Ecom`
3. Click **Deploy Now** — Railway will auto-detect `nixpacks.toml` and build your app

### Step 3 — Add a MySQL database
1. Inside your Railway project, click **+ New** → **Database** → **Add MySQL**
2. Railway provisions a managed MySQL instance automatically

### Step 4 — Set environment variables
In your **web service** → **Variables** tab, add these (Railway supports reference variables that auto-link to your MySQL plugin):

| Variable | Value |
|---|---|
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |
| `PORT` | `${{PORT}}` |
| `CLIENT_ORIGIN` | `https://your-app-name.up.railway.app` |

> ⚠️ Set `CLIENT_ORIGIN` to your actual Railway public URL (found in the **Settings → Domains** tab of your web service).

### Step 5 — Run the database schema
After the first successful deploy:
1. Go to your **MySQL** service in Railway → open the **Query** tab
2. Paste and run the full contents of `server/database/schema.sql`
3. This creates tables and seeds the initial products

### Step 6 — Redeploy
Trigger a redeploy (or push a new commit). Your app is now live at:
```
https://<your-service-name>.up.railway.app
```

---

## 💻 Run locally (XAMPP)

Open two terminals:

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

Make sure XAMPP MySQL is running and run `server/database/schema.sql` once to set up the local database.

---

## What's included

- Product grid with search, category filter, sorting and pagination
- Product detail pages
- Cart drawer with quantity controls, persisted in localStorage
- Checkout form with server-side validation, stock checks, server-calculated shipping
- Responsive layout, keyboard focus styles, reduced-motion support

## Customise it

- **Colors & fonts:** `client/src/styles.css` CSS variables at the top
- **Products:** seeds at the bottom of `server/database/schema.sql` (prices in cents)
- **Store name:** search & replace "Marigold Supply"

## Next steps before going fully live

1. **Payments:** integrate Stripe Checkout inside `POST /api/orders`, confirm via Stripe webhook
2. **Auth & admin:** add JWT sessions and a protected admin panel for products and orders
3. **Transactional email:** send order confirmations (Resend, Postmark, or AWS SES)
