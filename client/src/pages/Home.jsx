import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

const CATEGORIES = [
  { value: "all",         label: "All Items",    icon: "🏪", colorClass: "c-gray"   },
  { value: "electronics", label: "Electronics",  icon: "📱", colorClass: "c-sky"    },
  { value: "vehicles",    label: "Vehicles",     icon: "🚗", colorClass: "c-amber"  },
  { value: "property",    label: "Real Estate",  icon: "🏠", colorClass: "c-rose"   },
  { value: "fashion",     label: "Fashion",      icon: "👗", colorClass: "c-purple" },
  { value: "furniture",   label: "Furniture",    icon: "🛋️", colorClass: "c-emerald"},
  { value: "stationery",  label: "Stationery",   icon: "📚", colorClass: "c-blue"   },
  { value: "services",    label: "Services",     icon: "💼", colorClass: "c-indigo" },
];

const SORT_OPTIONS = [
  { value: "featured",   label: "💎 Featured / Boosted" },
  { value: "newest",     label: "🕒 Newest Listings"      },
  { value: "views",      label: "🔥 Most Viewed"         },
  { value: "price-asc",  label: "💰 Price: Low → High"   },
  { value: "price-desc", label: "💰 Price: High → Low"   },
  { value: "name",       label: "🔤 Title A–Z"           },
];

const CONDITIONS = [
  { value: "all",         label: "All Conditions" },
  { value: "Brand New",   label: "Brand New"      },
  { value: "Like New",    label: "Like New"       },
  { value: "Used",        label: "Used"           },
  { value: "Refurbished", label: "Refurbished"    },
];

const POPULAR_TAGS = [
  "iPhone 15",
  "Toyota Vitz",
  "Bole Apartment",
  "MacBook Pro",
  "Habesha Kemis",
  "Living Room Sofa",
  "Samsung S24",
];

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory]   = useState(searchParams.get("category") || "all");
  const [city, setCity]           = useState(searchParams.get("city") || "all");
  const [condition, setCondition] = useState(searchParams.get("condition") || "all");
  const [minPrice, setMinPrice]   = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice]   = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort]           = useState(searchParams.get("sort") || "featured");
  const [page, setPage]           = useState(1);
  const [data, setData]           = useState(null);
  const [status, setStatus]       = useState("loading");
  const [filterOpen, setFilterOpen] = useState(false);
  const [locations, setLocations] = useState([]);

  const q = searchParams.get("q") || "";

  useEffect(() => {
    const ac = new AbortController();
    api.locations(ac.signal)
      .then((res) => { if (res.cities) setLocations(res.cities); })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const load = useCallback(() => {
    const controller = new AbortController();
    setStatus("loading");

    api
      .products(
        { q, category, city, condition, minPrice, maxPrice, sort, page, limit: 12 },
        controller.signal
      )
      .then((d) => {
        setData(d);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setStatus("error");
      });

    return () => controller.abort();
  }, [q, category, city, condition, minPrice, maxPrice, sort, page]);

  useEffect(load, [load]);

  const setCategory_ = (v) => { setCategory(v); setPage(1); };
  const setCity_     = (v) => { setCity(v);     setPage(1); };
  const setSort_     = (v) => { setSort(v);     setPage(1); };
  const setCondition_= (v) => { setCondition(v); setPage(1); };

  function handleTagClick(tag) {
    setSearchParams({ q: tag });
    setPage(1);
  }

  function handleHeroSearch(e) {
    e.preventDefault();
    const queryVal = e.target.searchVal.value.trim();
    const cityVal  = e.target.citySelect.value;
    const catVal   = e.target.catSelect.value;

    const newParams = {};
    if (queryVal) newParams.q = queryVal;
    if (catVal && catVal !== "all") newParams.category = catVal;
    if (cityVal && cityVal !== "all") newParams.city = cityVal;

    setSearchParams(newParams);
    if (catVal) setCategory(catVal);
    if (cityVal) setCity(cityVal);
    setPage(1);
  }

  function FilterPanel({ onClose }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {onClose && (
          <div className="filter-drawer-head">
            <h3>Filter Listings</h3>
            <button className="close-btn" onClick={onClose} aria-label="Close filters">
              <XIcon />
            </button>
          </div>
        )}

        {/* Categories */}
        <div className="sidebar-card">
          <p className="sidebar-title">Categories</p>
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

        {/* Location / City */}
        <div className="sidebar-card">
          <p className="sidebar-title">Location (Ethiopia)</p>
          <select
            className="sort-select"
            id="city-filter-select"
            value={city}
            aria-label="Filter by City"
            onChange={(e) => { setCity_(e.target.value); onClose?.(); }}
          >
            <option value="all">📍 All Ethiopia</option>
            {locations.map((l) => (
              <option key={l.city} value={l.city}>📍 {l.city}</option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div className="sidebar-card">
          <p className="sidebar-title">Item Condition</p>
          <select
            className="sort-select"
            id="condition-filter-select"
            value={condition}
            aria-label="Filter by condition"
            onChange={(e) => { setCondition_(e.target.value); onClose?.(); }}
          >
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="sidebar-card">
          <p className="sidebar-title">Price Range (ETB)</p>
          <div className="price-inputs-row">
            <input
              type="number"
              placeholder="Min ETB"
              className="price-filter-input"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span>–</span>
            <input
              type="number"
              placeholder="Max ETB"
              className="price-filter-input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-accent btn-sm"
            style={{ width: "100%", marginTop: "0.5rem" }}
            onClick={() => { setPage(1); load(); onClose?.(); }}
          >
            Apply Price
          </button>
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
    <div>
      {/* ─── Engocha-Style Hero Banner ─── */}
      <section className="engocha-hero-section">
        <div className="container">
          <div className="hero-content">
            <span className="hero-eyebrow">🇪🇹 Ethiopia’s Premier Online Marketplace</span>
            <h1 className="hero-heading">
              Buy, Sell &amp; Discover Everything in <span className="text-highlight">Addis Ababa</span> &amp; Beyond
            </h1>
            <p className="hero-subtext">
              Direct seller contact, verified listings, and seamless checkout via Telebirr &amp; CBE Birr.
            </p>

            {/* Hero Quick Search Form */}
            <form className="hero-search-box" onSubmit={handleHeroSearch}>
              <div className="hero-search-input-wrap">
                <span className="search-icon-prefix">🔍</span>
                <input
                  type="text"
                  name="searchVal"
                  placeholder="What are you looking for? (e.g. iPhone, Toyota, House...)"
                  defaultValue={q}
                  className="hero-search-input"
                />
              </div>

              <select name="catSelect" defaultValue={category} className="hero-search-select">
                <option value="all">All Categories</option>
                {CATEGORIES.filter(c => c.value !== "all").map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>

              <select name="citySelect" defaultValue={city} className="hero-search-select">
                <option value="all">📍 All Ethiopia</option>
                {locations.map(l => (
                  <option key={l.city} value={l.city}>📍 {l.city}</option>
                ))}
              </select>

              <button type="submit" className="hero-search-btn">
                Search
              </button>
            </form>

            {/* Popular Tags */}
            <div className="hero-popular-tags">
              <span className="popular-label">Popular Searches:</span>
              <div className="tags-wrap">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="tag-pill"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>
        {/* ─── Category Icon Strip ─── */}
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

        {/* ─── Main Marketplace Grid & Sidebar ─── */}
        <div className="page-layout" id="shop">
          <aside className="sidebar" aria-label="Filters" id="sidebar">
            <FilterPanel />
          </aside>

          <section className="products-area" aria-label="Products">
            {/* Toolbar */}
            <div className="products-toolbar">
              <div className="toolbar-left">
                <h2 className="toolbar-title">
                  {q
                    ? `Results for "${q}"`
                    : `${CATEGORIES.find((c) => c.value === category)?.label ?? "All Items"} ${city !== "all" ? `in ${city}` : ""}`}
                </h2>
                {status === "ready" && (
                  <span className="toolbar-count">{totalShown} listings</span>
                )}
              </div>

              <div className="toolbar-right">
                <Link to="/sell" className="sell-cta-btn-sm" id="post-ad-toolbar-btn">
                  + Post Free Ad
                </Link>
                <button
                  className="filter-toggle"
                  id="filter-toggle-btn"
                  onClick={() => setFilterOpen(true)}
                  aria-label="Open filters"
                >
                  <FilterIcon /> Filters
                </button>
              </div>
            </div>

            {/* States */}
            {status === "error" && (
              <p className="notice" role="alert">
                ⚠️ Couldn't load marketplace listings. Please make sure the server is running.
              </p>
            )}

            {status === "ready" && data.items.length === 0 && (
              <div className="marketplace-empty-box">
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🔍</div>
                <h3>No listings found</h3>
                <p>Try searching for a different keyword or removing active filters.</p>
                <Link to="/sell" className="btn btn-accent mt-4">
                  Be the first to list an item in this category!
                </Link>
              </div>
            )}

            {/* Grid */}
            <div className={`grid ${status === "loading" ? "dim" : ""}`} id="product-grid">
              {status === "loading" && data === null
                ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                : data?.items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {/* Pagination */}
            {data && data.pages > 1 && (
              <div className="pager" aria-label="Pagination">
                <button
                  id="prev-page-btn"
                  className="btn btn-ghost btn-sm"
                  disabled={page <= 1}
                  onClick={() => { setPage(page - 1); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                >
                  ← Previous
                </button>
                <span>
                  Page {data.page} of {data.pages}
                </span>
                <button
                  id="next-page-btn"
                  className="btn btn-ghost btn-sm"
                  disabled={page >= data.pages}
                  onClick={() => { setPage(page + 1); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Mobile Filter Drawer */}
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
    </div>
  );
}

