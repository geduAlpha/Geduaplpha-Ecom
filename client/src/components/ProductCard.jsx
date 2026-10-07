import { Link } from "react-router-dom";
import ProductArt from "./ProductArt.jsx";
import { useCart } from "../CartContext.jsx";
import { money } from "../money.js";

export default function ProductCard({ product: p }) {
  const { add } = useCart();
  const soldOut = p.stock < 1;
  const locationText = p.location
    ? `${p.location.subcity ? p.location.subcity + ", " : ""}${p.location.city || "Addis Ababa"}`
    : "Addis Ababa";

  return (
    <article className="card marketplace-card" id={`card-${p.id}`}>
      <Link to={`/product/${p.id}`} className="card-art" aria-label={p.name} id={`card-art-${p.id}`}>
        <div className="card-art-inner">
          <ProductArt art={p.art} color={p.color} tint={p.tint} />
        </div>
        {p.featured && (
          <span className="card-badge-featured" title="Diamond Boost / Top Ad">
            💎 Featured
          </span>
        )}
        {p.condition && (
          <span className="card-badge-condition">
            {p.condition}
          </span>
        )}
      </Link>

      <div className="card-body">
        <div className="card-meta-top">
          <span className="card-cat-badge">{p.category}</span>
          <span className="card-location" title={locationText}>
            📍 {locationText}
          </span>
        </div>

        <h3 className="card-title">
          <Link to={`/product/${p.id}`} title={p.name}>{p.name}</Link>
        </h3>

        <div className="price-sub">
          <div className="price-group">
            <span className="price">{money(p.price)}</span>
            {p.negotiable && <span className="tag-negotiable">Negotiable</span>}
          </div>
          {p.views > 0 && <span className="views-count">👁️ {p.views}</span>}
        </div>

        <div className="card-footer-actions">
          {p.seller?.phone && (
            <a
              href={`tel:${p.seller.phone.replace(/\s+/g, "")}`}
              className="btn-card-call"
              aria-label={`Call seller for ${p.name}`}
              title="Call Seller"
            >
              📞 Call
            </a>
          )}
          {p.seller?.telegram && (
            <a
              href={`https://t.me/${p.seller.telegram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-card-tg"
              aria-label={`Telegram chat for ${p.name}`}
              title="Telegram Chat"
            >
              ✈️
            </a>
          )}
          {p.seller?.whatsapp && (
            <a
              href={`https://wa.me/${p.seller.whatsapp.replace(/[^0-9]/g, "").replace(/^0/, "251")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-card-wa"
              aria-label={`WhatsApp chat for ${p.name}`}
              title="WhatsApp Chat"
            >
              💬
            </a>
          )}
          <button
            id={`add-${p.id}`}
            className="btn-add"
            disabled={soldOut}
            onClick={() => add(p)}
            aria-label={soldOut ? `${p.name} is sold out` : `Add ${p.name} to cart`}
            title="Add to Cart / Order"
          >
            {soldOut ? "Sold" : "🛒 Order"}
          </button>
        </div>
      </div>
    </article>
  );
}
