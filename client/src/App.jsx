import { Routes, Route, Link } from "react-router-dom";
import Header from "./components/Header.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import Home from "./pages/Home.jsx";
import Product from "./pages/Product.jsx";
import Checkout from "./pages/Checkout.jsx";

function NotFound() {
  return (
    <section className="wrap page">
      <h1>That page isn't here</h1>
      <p>The link may be old or mistyped.</p>
      <Link className="btn btn-blue" to="/">Back to the shop</Link>
    </section>
  );
}

export default function App() {
  return (
    <>
      <div className="announce">Free shipping on orders over $60</div>
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
      <footer className="footer">
        <div className="wrap footer-inner">
          <strong className="logo">Marigold Supply</strong>
          <p>Questions about an order? hello@marigold.example</p>
        </div>
      </footer>
    </>
  );
}
