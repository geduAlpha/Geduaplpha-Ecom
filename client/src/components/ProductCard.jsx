import { Link } from "react-router-dom";
import ProductArt from "./ProductArt.jsx";
import { useCart } from "../CartContext.jsx";
import { money } from "../money.js";

export default function ProductCard({ product: p }) {
  const { add } = useCart();
  const soldOut = p.stock < 1;

  return (
    <article className="card" id={`card-${p.id}`}>
      <Link to={`/product/${p.id}`} className="card-art" aria-label={p.name} id={`card-art-${p.id}`}>
        <div className="card-art-inner">
          <ProductArt art={p.art} color={p.color} tint={p.tint} />
        </div>
      </Link>

      <div className="card-body">
        <p className="card-cat">{p.category}</p>
        <h3>
          <Link to={`/product/${p.id}`}>{p.name}</Link>
        </h3>
        <div className="price-sub">
          <span className="price">{money(p.price)}</span>
          {!soldOut && p.stock <= 5 && (
            <span className="low">Only {p.stock} left</span>
          )}
        </div>
        <div className="card-footer">
          <button
            id={`add-${p.id}`}
            className="btn-add"
            disabled={soldOut}
            onClick={() => add(p)}
            aria-label={soldOut ? `${p.name} is sold out` : `Add ${p.name} to cart`}
          >
            {soldOut ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
