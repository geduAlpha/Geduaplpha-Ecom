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
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setQty(1);
    setAdded(false);
    setShowPhone(false);
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
        <h1>{status === "missing" ? "Listing not found" : "Couldn't load listing"}</h1>
        <p>{status === "missing" ? "This item may have been sold or removed." : "Check that the server is running."}</p>
        <Link className="btn btn-accent mt-4" to="/">← Back to marketplace</Link>
      </div>
    );
  }

  const soldOut = product.stock < 1;
  const maxQty  = Math.min(product.stock, 20);
  const low     = !soldOut && product.stock <= 5;
  const locationText = product.location
    ? `${product.location.subcity ? product.location.subcity + ", " : ""}${product.location.city || "Addis Ababa"}`
    : "Addis Ababa, Ethiopia";

  const sellerPhone = product.seller?.phone || "+251 91 123 4567";
  const rawPhone = sellerPhone.replace(/\s+/g, "");
  const tgHandle = product.seller?.telegram?.replace(/^@/, "");

  function handleAdd() {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="detail container" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>
      <Link to="/" className="back-link" id="back-to-shop">
        <ArrowLeftIcon /> Back to marketplace
      </Link>

      <div className="detail-grid">
        {/* Visual Artwork & Badges */}
        <div className="detail-art-col">
          <div className="detail-art">
            <ProductArt art={product.art} color={product.color} tint={product.tint} label={product.name} />
            {product.featured && (
              <span className="card-badge-featured" style={{ position: "absolute", top: "1rem", left: "1rem" }}>
                💎 Diamond Boosted
              </span>
            )}
            {product.condition && (
              <span className="card-badge-condition" style={{ position: "absolute", top: "1rem", right: "1rem" }}>
                {product.condition}
              </span>
            )}
          </div>

          {/* Safe Shopping Box */}
          <div className="safe-trading-card">
            <h4>🛡️ Engocha Safety Guidelines</h4>
            <ul>
              <li>Meet seller in a safe, public spot (e.g. Bole Medhanialem, Kazanchis)</li>
              <li>Always check and test the item in person before paying</li>
              <li>Pay conveniently via Telebirr or CBE Birr upon inspection</li>
              <li>Never share your bank/telebirr OTP codes with anyone</li>
            </ul>
          </div>
        </div>

        {/* Listing Info & Seller Card */}
        <div className="detail-info">
          <div className="detail-meta-row">
            <span className="detail-category">{product.category}</span>
            <span className="detail-location-pill">📍 {locationText}</span>
            {product.views > 0 && <span className="detail-views">👁️ {product.views} views</span>}
          </div>

          <h1 className="detail-name">{product.name}</h1>

          <div className="detail-price-box">
            <div className="detail-price-main">
              <span className="detail-price">{money(product.price)}</span>
              {product.negotiable && (
                <span className="tag-negotiable-lg">Negotiable (ተደራዳሪ)</span>
              )}
            </div>
            <span className="detail-currency-sub">Price in Ethiopian Birr (ETB)</span>
          </div>

          {/* Seller Card */}
          <div className="seller-profile-card">
            <div className="seller-header">
              <div className="seller-avatar">
                {product.seller?.name ? product.seller.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="seller-details">
                <h3>{product.seller?.name || "Verified Gedualpha Seller"}</h3>
                <span className="verified-tag">✓ Verified Marketplace Seller</span>
              </div>
            </div>

            <div className="seller-contact-actions">
              {showPhone ? (
                <a
                  href={`tel:${rawPhone}`}
                  className="btn-seller-phone revealed"
                  id="call-seller-btn"
                >
                  📞 {sellerPhone} (Tap to Call)
                </a>
              ) : (
                <button
                  type="button"
                  className="btn-seller-phone"
                  id="show-phone-btn"
                  onClick={() => setShowPhone(true)}
                >
                  📞 Click to Show Phone Number
                </button>
              )}

              {tgHandle && (
                <a
                  href={`https://t.me/${tgHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-seller-telegram"
                  id="telegram-chat-btn"
                >
                  ✈️ Chat on Telegram (@{tgHandle})
                </a>
              )}
            </div>
          </div>

          <div className="detail-desc-card">
            <h3>Description &amp; Specifications</h3>
            <p className="detail-desc">{product.description}</p>
          </div>

          {low && (
            <p className="stock-badge">⚡ Only {product.stock} available</p>
          )}
          {soldOut && (
            <p className="stock-badge" style={{ color: "#6b7280", background: "#f3f4f6" }}>
              ❌ Marked as Sold
            </p>
          )}

          {/* Buy & Order Controls */}
          {!soldOut && (
            <div className="buy-controls-box">
              <h3>Order Online (Delivery Across Ethiopia)</h3>
              <div className="buy-controls">
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

                <button
                  id="add-to-cart-btn"
                  className="btn btn-accent"
                  style={{ flex: 1, padding: "0.875rem 1.5rem", fontSize: "1.05rem" }}
                  onClick={handleAdd}
                  disabled={soldOut}
                >
                  {added ? "✓ Added to Order Cart!" : `🛒 Add to Cart — ${money(product.price * qty)}`}
                </button>
              </div>
            </div>
          )}

          {soldOut && (
            <button className="btn btn-ghost btn-wide" disabled>
              This listing is no longer available
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

