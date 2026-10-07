import { Link } from "react-router-dom";

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3 18.5v-13A1.5 1.5 0 0 1 4.91 4.1l13 6.5a1.5 1.5 0 0 1 0 2.8l-13 6.5A1.5 1.5 0 0 1 3 18.5z" />
    </svg>
  );
}

const FOOTER_LINKS = {
  Marketplace: [
    { label: "+ Post Free Listing", to: "/sell" },
    { label: "Electronics & Phones", to: "/?category=electronics" },
    { label: "Vehicles & Auto", to: "/?category=vehicles" },
    { label: "Real Estate & Homes", to: "/?category=property" },
  ],
  Locations: [
    { label: "Addis Ababa Listings", to: "/?city=Addis+Ababa" },
    { label: "Hawassa Listings", to: "/?city=Hawassa" },
    { label: "Adama Listings", to: "/?city=Adama" },
    { label: "Bahir Dar Listings", to: "/?city=Bahir+Dar" },
  ],
  Trust: [
    { label: "Safe Buying Guidelines", to: "#" },
    { label: "Telebirr & CBE Payment", to: "#" },
    { label: "Diamond Boost Ads", to: "#" },
    { label: "🛡️ Admin Portal", to: "/admin" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon" style={{ width: "1.75rem", height: "1.75rem", fontSize: "0.875rem" }}>G</div>
              Gedualpha<span>Ecom</span>
            </div>
            <p className="footer-tagline">
              Ethiopia’s fastest growing online marketplace. Connect with buyers and sellers across Addis Ababa, Adama, Hawassa, and nationwide with zero listing fees.
            </p>
            <div className="footer-payment-badges">
              <span className="pay-pill">📱 Telebirr</span>
              <span className="pay-pill">🏦 CBE Birr</span>
              <span className="pay-pill">💳 Chapa</span>
              <span className="pay-pill">💵 Cash on Delivery</span>
            </div>
          </div>

          {/* Links */}
          <div className="footer-links">
            {Object.entries(FOOTER_LINKS).map(([heading, items]) => (
              <div className="footer-col" key={heading}>
                <h4>{heading}</h4>
                <ul>
                  {items.map((item) => (
                    <li key={item.label}>
                      {item.to.startsWith("/") ? (
                        <Link to={item.to}>{item.label}</Link>
                      ) : (
                        <a href={item.to}>{item.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="footer-bottom">
          <p>© {year} Gedualpha Ecom &bull; Inspired by Gedualpha logic &amp; workflows for Ethiopian commerce.</p>

          <div className="app-banner" id="app-download-banner">
            <p>📱 Gedualpha Ecom Mobile App</p>
            <div className="app-badges">
              <a href="#" className="app-badge" id="app-store-btn" aria-label="Download on App Store">
                <AppleIcon />
                <span>App Store</span>
              </a>
              <a href="#" className="app-badge" id="play-store-btn" aria-label="Get it on Google Play">
                <PlayIcon />
                <span>Google Play</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
