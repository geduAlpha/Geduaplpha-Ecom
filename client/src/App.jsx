import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Product from "./pages/Product.jsx";
import Checkout from "./pages/Checkout.jsx";

function NotFound() {
  return (
    <div className="page-empty">
      <div style={{ fontSize: "3rem" }}>🔍</div>
      <h1>Page not found</h1>
      <p>The link may be old or mistyped.</p>
      <a className="btn btn-accent mt-4" href="/">Back to the shop</a>
    </div>
  );
}

export default function App() {
  // Persist dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem("gedualpha-theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      <div className="announce">🚚 Free shipping on orders over $60 — Shop now</div>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <CartDrawer />
      <Footer />
    </>
  );
}
