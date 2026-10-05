import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import ProductArt from "../components/ProductArt.jsx";
import { useCart } from "../CartContext.jsx";
import { money } from "../money.js";

export default function Product() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setQty(1);
    api
      .product(id, controller.signal)
      .then((p) => {
        setProduct(p);
        setStatus("ready");
      })
      .catch((err) => err.name !== "AbortError" && setStatus(err.status === 404 ? "missing" : "error"));
    return () => controller.abort();
  }, [id]);

  if (status === "loading") return <section className="wrap page"><p>Loading…</p></section>;
  if (status !== "ready") {
    return (
      <section className="wrap page">
        <h1>{status === "missing" ? "We couldn't find that product" : "We couldn't load this product"}</h1>
        <Link className="btn btn-blue" to="/">Back to the shop</Link>
      </section>
    );
  }

  const soldOut = product.stock < 1;
  const maxQty = Math.min(product.stock, 20);

  return (
    <section className="wrap detail">
      <div className="detail-art">
        <ProductArt art={product.art} color={product.color} tint={product.tint} label={product.name} />
      </div>
      <div className="detail-info">
        <Link to="/" className="back">Back to the shop</Link>
        <h1>{product.name}</h1>
        <p className="detail-price">{money(product.price)}</p>
        <p className="detail-desc">{product.description}</p>
        {!soldOut && product.stock <= 5 && <p className="low">Only {product.stock} left</p>}

        <div className="buy">
          <div className="qty qty-lg">
            <button onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Decrease quantity">−</button>
            <span aria-live="polite">{qty}</span>
            <button onClick={() => setQty((n) => Math.min(maxQty, n + 1))} aria-label="Increase quantity">+</button>
          </div>
          <button className="btn btn-blue" disabled={soldOut} onClick={() => add(product, qty)}>
            {soldOut ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </section>
  );
}
