import { Link } from "react-router-dom";
import ProductArt from "./ProductArt.jsx";
import { useCart } from "../CartContext.jsx";
import { money } from "../money.js";

export default function ProductCard({ product: p }) {
  const { add } = useCart();
  const soldOut = p.stock < 1;
  return (
    <article className="card">
      <Link to={`/product/${p.id}`} className="card-art" aria-label={p.name}>
        <ProductArt art={p.art} color={p.color} tint={p.tint} />
      </Link>
      <div className="card-body">
        <h3><Link to={`/product/${p.id}`}>{p.name}</Link></h3>
        <p className="price">
          {money(p.price)}
          {!soldOut && p.stock <= 5 && <span className="low"> Only {p.stock} left</span>}
        </p>
        <button className="btn btn-ink" disabled={soldOut} onClick={() => add(p)}>
          {soldOut ? "Sold out" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
