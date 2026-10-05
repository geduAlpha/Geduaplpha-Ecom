# Marigold Supply: React + Node.js store

A full-stack e-commerce starter: a React storefront (Vite) and a Node.js/Express API.

## Run it

Open two terminals.

```bash
# 1. API (http://localhost:4000)
cd server
npm install
npm run dev

# 2. Storefront (http://localhost:5173)
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api` to the Node server, so no extra config is needed.

## What's included

- Product grid with search, category filter, sorting and pagination (handled by the API)
- Product detail pages
- Cart drawer with quantity controls, saved in the browser between visits
- Checkout form with server-side validation, stock checks and server-calculated prices
- Responsive layout, visible keyboard focus, reduced-motion support

## Make it yours

- **Colors and fonts:** edit the variables at the top of `client/src/styles.css`.
- **Products:** edit `server/data/products.js` (prices are in cents).
- **Photos:** swap `<ProductArt />` in `ProductCard.jsx`, `Product.jsx` and `CartDrawer.jsx` for an `<img>` and add an `image` field to each product.
- **Store name:** search for "Marigold Supply".

## Before you go live

1. **Database:** replace the in-memory arrays in `server/index.js` with PostgreSQL or MongoDB.
2. **Payments:** create a Stripe Checkout Session inside `POST /api/orders` and redirect to it. Mark the order paid from a Stripe webhook, not from the browser.
3. **Accounts and admin:** add sign-in (for example JWT or a hosted auth provider) and a protected admin area for products and orders.
4. **Emails:** send the order confirmation from the server (Resend, Postmark, or SES).
5. **Production setup:** set `CLIENT_ORIGIN` and `PORT`, run `npm run build` in `client`, and serve `client/dist` behind HTTPS.
