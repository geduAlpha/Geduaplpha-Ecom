import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import ProductArt from "../components/ProductArt.jsx";
import { useCart } from "../CartContext.jsx";
import { money } from "../money.js";

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  );
}

function SkeletonDetail() {
  return (
    <div className="detail">
      <div className="detail-grid" style={{ minHeight: 380 }}>
        <div className="skeleton" style={{ aspectRatio: "1", width: "100%", borderRadius: 0 }} />
        <div className="detail-info">
          <div className="skeleton skeleton-line w-50" style={{ height: "0.75rem", marginBottom: "0.5rem" }} />
          <div className="skeleton skeleton-line w-80" style={{ height: "1.75rem", marginBottom: "0.5rem" }} />
          <div className="skeleton skeleton-line w-65" style={{ height: "2rem", marginBottom: "1rem" }} />
          <div className="skeleton skeleton-line" style={{ height: "4.5rem" }} />
          <div className="skeleton skeleton-line" style={{ height: "2.75rem", marginTop: "1rem" }} />
        </div>
      </div>
    </div>
  );
}

export default function Product() {
  const { id }         = useParams();
  const { add }        = useCart();
  const [product, setProduct] = useState(null);
  const [status, setStatus]   = useState("loading");
  const [qty, setQty]         = useState(1);
  const [added, setAdded]     = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setQty(1);
    setAdded(false);
    api
      .product(id, controller.signal)
      .then((p) => { setProduct(p); setStatus("ready"); })
      .catch((err) =>
        err.name !== "AbortError" &&
        setStatus(err.status === 404 ? "missing" : "error")
      );
    return () => controller.abort();
  }, [id]);

  if (status === "loading") return <SkeletonDetail />;

  if (status !== "ready") {
    return (
      <div className="page-empty">
        <div style={{ fontSize: "3rem" }}>{status === "missing" ? "🔍" : "⚠️"}</div>
        <h1>{status === "missing" ? "Product not found" : "Couldn't load product"}</h1>
        <p>{status === "missing" ? "This item may no longer be available." : "Check that the server is running."}</p>
        <Link className="btn btn-accent mt-4" to="/">← Back to shop</Link>
      </div>
    );
  }

  const soldOut = product.stock < 1;
  const maxQty  = Math.min(product.stock, 20);
  const low     = !soldOut && product.stock <= 5;

  function handleAdd() {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="detail container" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>
      <div className="detail-grid">

        {/* Art */}
        <div className="detail-art">
          <ProductArt art={product.art} color={product.color} tint={product.tint} label={product.name} />
        </div>

        {/* Info */}
        <div className="detail-info">
          <Link to="/" className="back-link" id="back-to-shop">
            <ArrowLeftIcon /> Back to shop
          </Link>

          <p className="detail-category">{product.category}</p>
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-price">{money(product.price)}</p>
          <p className="detail-desc">{product.description}</p>

          {low && (
            <p className="stock-badge">⚡ Only {product.stock} left in stock</p>
          )}
          {soldOut && (
            <p className="stock-badge" style={{ color: "#6b7280", background: "#f3f4f6" }}>
              ❌ Out of stock
            </p>
          )}

          {!soldOut && (
            <div className="buy-controls">
              {/* Qty picker */}
              <div className="qty-picker" role="group" aria-label="Quantity">
                <button
                  id="qty-dec"
                  onClick={() => setQty((n) => Math.max(1, n - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >−</button>
                <span aria-live="polite">{qty}</span>
                <button
                  id="qty-inc"
                  onClick={() => setQty((n) => Math.min(maxQty, n + 1))}
                  disabled={qty >= maxQty}
                  aria-label="Increase quantity"
                >+</button>
              </div>

              {/* Add to cart */}
              <button
                id="add-to-cart-btn"
                className={`btn btn-accent`}
                style={{ flex: 1, padding: "0.75rem 1.5rem", fontSize: "1rem" }}
                onClick={handleAdd}
                disabled={soldOut}
              >
                {added ? "✓ Added to cart!" : "Add to cart"}
              </button>
            </div>
          )}

          {soldOut && (
            <button className="btn btn-ghost btn-wide" disabled>Sold out</button>
          )}
        </div>
      </div>
    </div>
  );
}
