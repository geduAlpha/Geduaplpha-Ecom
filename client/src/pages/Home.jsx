import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

/* ─── Category definitions (Hulumarket-style icon circles) ─────────────── */
const CATEGORIES = [
  { value: "all",        label: "All Items",   icon: "🏪", colorClass: "c-gray"   },
  { value: "stationery", label: "Stationery",  icon: "📓", colorClass: "c-rose"   },
  { value: "desk",       label: "Desk",        icon: "🖥️",  colorClass: "c-sky"    },
  { value: "carry",      label: "Carry",       icon: "👜", colorClass: "c-amber"  },
];

const SORT_OPTIONS = [
  { value: "featured",   label: "Featured"          },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name",       label: "Name A–Z"           },
];

/* ─── Skeleton card placeholder ────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line w-50" style={{ height: "0.625rem" }} />
        <div className="skeleton skeleton-line w-80" />
        <div className="skeleton skeleton-line w-65" style={{ height: "0.75rem" }} />
        <div className="skeleton skeleton-line" style={{ height: "2rem", marginTop: "0.25rem", borderRadius: "0.5rem" }} />
      </div>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState("all");
  const [sort, setSort]         = useState("featured");
  const [page, setPage]         = useState(1);
  const [data, setData]         = useState(null);
  const [status, setStatus]     = useState("loading");
  const [filterOpen, setFilterOpen] = useState(false);

  // Pull search query from URL (set by header search form)
  const q = searchParams.get("q") || "";

  const load = useCallback(() => {
    const controller = new AbortController();
    setStatus("loading");
    api
      .products({ q, category, sort, page, limit: 12 }, controller.signal)
      .then((d) => { setData(d); setStatus("ready"); })
      .catch((err) => err.name !== "AbortError" && setStatus("error"));
    return () => controller.abort();
  }, [q, category, sort, page]);

  useEffect(load, [load]);

  // Reset to page 1 when filters change
  const setCategory_ = (v) => { setCategory(v); setPage(1); };
  const setSort_     = (v) => { setSort(v);     setPage(1); };

  /* ── Sidebar / filter panel content (shared between desktop & drawer) ── */
  function FilterPanel({ onClose }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {onClose && (
          <div className="filter-drawer-head">
            <h3>Filters</h3>
            <button className="close-btn" onClick={onClose} aria-label="Close filters"><XIcon /></button>
          </div>
        )}

        {/* Category */}
        <div className="sidebar-card">
          <p className="sidebar-title">Category</p>
          <div className="filter-chips">
            {CATEGORIES.map(({ value, label, icon }) => (
              <button
                key={value}
                id={`cat-${value}`}
                className={`filter-chip ${category === value ? "active" : ""}`}
                aria-pressed={category === value}
                onClick={() => { setCategory_(value); onClose?.(); }}
              >
                <span className="chip-icon">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="sidebar-card">
          <p className="sidebar-title">Sort by</p>
          <select
            className="sort-select"
            id="sort-select"
            value={sort}
            aria-label="Sort products"
            onChange={(e) => { setSort_(e.target.value); onClose?.(); }}
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  const totalShown = data?.total ?? 0;

  return (
    <div className="container" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>

      {/* ── Category icon circles (Hulumarket-style top strip) ── */}
      <section className="categories-section" aria-label="Browse categories" id="categories">
        <div className="categories-grid">
          {CATEGORIES.map(({ value, label, icon, colorClass }) => (
            <button
              key={value}
              id={`cat-icon-${value}`}
              className={`cat-item ${category === value ? "active" : ""}`}
              aria-pressed={category === value}
              onClick={() => setCategory_(value)}
            >
              <span className={`cat-icon ${colorClass}`}>{icon}</span>
              <span className="cat-label">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Main layout: sidebar + products ── */}
      <div className="page-layout" id="shop">

        {/* Desktop sidebar */}
        <aside className="sidebar" aria-label="Filters" id="sidebar">
          <FilterPanel />
        </aside>

        {/* Products area */}
        <section className="products-area" aria-label="Products">

          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="toolbar-left">
              <h1 className="toolbar-title">
                {q ? `Results for "${q}"` : CATEGORIES.find(c => c.value === category)?.label ?? "All Items"}
              </h1>
              {status === "ready" && (
                <span className="toolbar-count">{totalShown} items</span>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button
              className="filter-toggle"
              id="filter-toggle-btn"
              onClick={() => setFilterOpen(true)}
              aria-label="Open filters"
            >
              <FilterIcon /> Filters
            </button>
          </div>

          {/* States */}
          {status === "error" && (
            <p className="notice" role="alert">
              ⚠️ Couldn't load products. Make sure the API server is running, then refresh.
            </p>
          )}
          {status === "ready" && data.items.length === 0 && (
            <p className="notice">
              🔍 No products match your search. Try a different word or category.
            </p>
          )}

          {/* Grid — skeletons while loading, real cards when ready */}
          <div className={`grid ${status === "loading" ? "dim" : ""}`} id="product-grid">
            {status === "loading" && data === null
              ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
              : data?.items.map((p) => <ProductCard key={p.id} product={p} />)
            }
          </div>

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="pager" aria-label="Pagination">
              <button
                id="prev-page-btn"
                className="btn btn-ghost btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ← Previous
              </button>
              <span>Page {data.page} of {data.pages}</span>
              <button
                id="next-page-btn"
                className="btn btn-ghost btn-sm"
                disabled={page >= data.pages}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ── Mobile filter drawer ── */}
      <div
        className={`filter-drawer ${filterOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Filters"
        aria-modal="true"
        id="filter-drawer"
      >
        <div
          className="filter-drawer-bg"
          onClick={() => setFilterOpen(false)}
          aria-hidden="true"
        />
        <div className="filter-drawer-panel">
          <FilterPanel onClose={() => setFilterOpen(false)} />
        </div>
      </div>
    </div>
  );
}
