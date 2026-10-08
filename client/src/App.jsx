import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { UserProvider } from "./UserContext.jsx";
import { useUser } from "./UserContext.jsx";
import Header from "./components/Header.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Product from "./pages/Product.jsx";
import Checkout from "./pages/Checkout.jsx";
import Sell from "./pages/Sell.jsx";
import Admin from "./pages/Admin.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import MyListings from "./pages/MyListings.jsx";
import BusinessDashboard from "./pages/BusinessDashboard.jsx";

function NotFound() {
  return (
    <div className="page-empty">
      <div style={{ fontSize: "3rem" }}>🔍</div>
      <h1>Page not found</h1>
      <p>The link may be old or mistyped.</p>
      <a className="btn btn-accent mt-4" href="/">Back to the marketplace</a>
    </div>
  );
}

/* Only business role can access /business-dashboard */
function BusinessRoute({ children }) {
  const { user } = useUser();
  if (!user || user.role !== "business") return <Navigate to="/" replace />;
  return children;
}
function SellerRoute({ children }) {
  const { user } = useUser();
  if (user && user.role === "buyer") {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem("gedualpha-theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
  }, []);

  return (
    <UserProvider>
      <div className="announce">🇪🇹 Addis Ababa &amp; Ethiopia's Trusted Marketplace — Post Ads for Free &bull; Pay with Telebirr &amp; CBE Birr</div>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/sell" element={<SellerRoute><Sell /></SellerRoute>} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/business-dashboard" element={<BusinessRoute><BusinessDashboard /></BusinessRoute>} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <CartDrawer />
      <Footer />
    </UserProvider>
  );
}
