import { useEffect, useState } from "react";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import ProductArt from "../components/ProductArt.jsx";

const CATEGORIES = [
  ["all", "Everything"],
  ["stationery", "Stationery"],
  ["desk", "Desk"],
  ["carry", "Carry"],
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  // Wait for a pause in typing before asking the server.
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    api
      .products({ q, category, sort, page, limit: 8 }, controller.signal)
      .then((d) => {
        setData(d);
        setStatus("ready");
      })
      .catch((err) => err.name !== "AbortError" && setStatus("error"));
    return () => controller.abort();
  }, [q, category, sort, page]);

  return (
    <>
      <section className="hero wrap-wide">
        <div className="hero-copy">
          <h1>Bright little tools for a happier desk</h1>
          <p>Notebooks, pens, lamps and mugs in colors that make Monday easier to start.</p>
          <a className="btn btn-gold" href="#shop">Shop all goods</a>
        </div>
        <div className="collage" aria-hidden="true">
          <div className="tile t1"><ProductArt art="notebook" color="#2B3FD9" tint="#FFEFC2" /></div>
          <div className="tile t2"><ProductArt art="mug" color="#FFB627" tint="#FFD9D2" /></div>
          <div className="tile t3"><ProductArt art="pen" color="#FF6F59" tint="#D6DEFF" /></div>
        </div>
      </section>

      <section id="shop" className="wrap shop">
        <h2>Everything on the desk</h2>

        <div className="toolbar">
          <input
            type="search"
            placeholder="Search products"
            aria-label="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="chips" role="group" aria-label="Category">
            {CATEGORIES.map(([value, label]) => (
              <button
                key={value}
                className={`chip ${category === value ? "on" : ""}`}
                aria-pressed={category === value}
                onClick={() => {
                  setCategory(value);
                  setPage(1);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            aria-label="Sort products"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
            <option value="name">Name</option>
          </select>
        </div>

        {status === "error" && (
          <p className="notice">We couldn't load products. Check that the API is running, then refresh.</p>
        )}
        {status === "ready" && data.items.length === 0 && (
          <p className="notice">No products match your search. Try a different word or category.</p>
        )}

        <div className={`grid ${status === "loading" ? "dim" : ""}`}>
          {data?.items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {data && data.pages > 1 && (
          <div className="pager">
            <button className="btn btn-ink" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {data.page} of {data.pages}</span>
            <button className="btn btn-ink" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </section>
    </>
  );
}
