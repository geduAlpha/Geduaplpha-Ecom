import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import ProductArt from "../components/ProductArt.jsx";
import { money } from "../money.js";

const CATEGORIES = [
  { value: "electronics", label: "Electronics & Phones", icon: "📱", defaultArt: "phone" },
  { value: "vehicles", label: "Vehicles & Auto", icon: "🚗", defaultArt: "car" },
  { value: "property", label: "Real Estate / Property", icon: "🏠", defaultArt: "apartment" },
  { value: "fashion", label: "Fashion & Beauty", icon: "👗", defaultArt: "dress" },
  { value: "furniture", label: "Home & Furniture", icon: "🛋️", defaultArt: "sofa" },
  { value: "stationery", label: "Desk & Stationery", icon: "📚", defaultArt: "notebook" },
  { value: "services", label: "Services & Jobs", icon: "💼", defaultArt: "desk" },
];

const ART_OPTIONS = [
  { value: "phone", label: "Phone" },
  { value: "laptop", label: "Laptop" },
  { value: "headphones", label: "Headphones" },
  { value: "car", label: "Car" },
  { value: "suv", label: "SUV" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "dress", label: "Dress/Fashion" },
  { value: "watch", label: "Watch/Jewelry" },
  { value: "shoe", label: "Shoes" },
  { value: "sofa", label: "Sofa/Couch" },
  { value: "desk", label: "Desk/Table" },
  { value: "notebook", label: "Notebook" },
  { value: "mug", label: "Mug" },
  { value: "pen", label: "Pen" },
  { value: "lamp", label: "Lamp" },
];

const PRESET_COLORS = [
  { color: "#2563EB", tint: "#EFF6FF", label: "Blue" },
  { color: "#059669", tint: "#ECFDF5", label: "Green" },
  { color: "#D97706", tint: "#FFFBEB", label: "Gold" },
  { color: "#DC2626", tint: "#FEF2F2", label: "Red" },
  { color: "#7C3AED", tint: "#F5F3FF", label: "Purple" },
  { color: "#0F172A", tint: "#F1F5F9", label: "Slate" },
];

export default function Sell() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    category: "electronics",
    price: "",
    negotiable: false,
    condition: "Brand New",
    city: "Addis Ababa",
    subcity: "Bole",
    description: "",
    image: "",
    art: "phone",
    color: "#2563EB",
    tint: "#EFF6FF",
    sellerName: "Gedualpha Verified Seller",
    sellerPhone: "+251912627366",
    sellerTelegram: "greatestvalue",
    sellerWhatsapp: "0941645784",
  });

  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    api.locations(ac.signal)
      .then((data) => {
        if (data.cities) setLocations(data.cities);
      })
      .catch(() => { });
    return () => ac.abort();
  }, []);

  const currentCityObj = locations.find((l) => l.city === formData.city) || {
    city: "Addis Ababa",
    subcities: ["Bole", "Kazanchis", "Piassa", "CMC", "Megenagna", "Sarbet", "Mexico", "Lebu", "Ayat"],
  };

  function handleChange(field, value) {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "category") {
        const cat = CATEGORIES.find((c) => c.value === value);
        if (cat) next.art = cat.defaultArt;
      }
      if (field === "city") {
        const cObj = locations.find((l) => l.city === value);
        next.subcity = cObj?.subcities?.[0] || "";
      }
      return next;
    });
  }

  function handleImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setFormData((prev) => ({ ...prev, image: dataUrl }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleRemoveImage() {
    setFormData((prev) => ({ ...prev, image: "" }));
  }

  function handleColorSelect(preset) {
    setFormData((prev) => ({ ...prev, color: preset.color, tint: preset.tint }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Title is required";
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = "Enter a valid price in Ethiopian Birr (ETB)";
    }
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.sellerPhone.trim() || formData.sellerPhone.trim() === "+251") {
      newErrors.sellerPhone = "Valid phone number is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        negotiable: formData.negotiable,
        condition: formData.condition,
        description: formData.description,
        image: formData.image || null,
        art: formData.art,
        color: formData.color,
        tint: formData.tint,
        location: {
          city: formData.city,
          subcity: formData.subcity,
        },
        seller: {
          name: formData.sellerName || "Gedualpha Verified Seller",
          phone: formData.sellerPhone,
          telegram: formData.sellerTelegram,
          whatsapp: formData.sellerWhatsapp,
          verified: true,
        },
      };

      const result = await api.createProduct(payload);
      navigate(`/product/${result.id}`);
    } catch (err) {
      setErrors(err.errors || { form: "Failed to post listing. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container sell-page-container">
      <div className="sell-page-header">
        <span className="sell-hero-badge">Gedualpha Verified Marketplace</span>
        <h1>Post a Free Listing on Gedualpha Ecom</h1>
        <p>Reach thousands of buyers in Addis Ababa and across Ethiopia in minutes.</p>
      </div>

      <div className="sell-grid-layout">
        {/* Form Column */}
        <div className="sell-form-card">
          <form onSubmit={handleSubmit} noValidate>
            {errors.form && <div className="error-banner">{errors.form}</div>}

            {/* Step 1: Category */}
            <div className="form-section">
              <label className="form-section-title">1. Select Category</label>
              <div className="category-select-grid">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`cat-select-btn ${formData.category === cat.value ? "active" : ""}`}
                    onClick={() => handleChange("category", cat.value)}
                  >
                    <span className="cat-select-icon">{cat.icon}</span>
                    <span className="cat-select-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Product Photo / Image Upload */}
            <div className="form-section">
              <div className="section-header-row">
                <label className="form-section-title">2. Upload Item Photos (ፎቶ ይጫኑ)</label>
                <span className="section-badge-optional">Recommended</span>
              </div>
              <p className="form-section-desc">
                Add real photos of your item to attract 5x more Ethiopian buyers.
              </p>

              {formData.image ? (
                <div className="uploaded-image-preview-box">
                  <div className="preview-image-container">
                    <img src={formData.image} alt="Uploaded item preview" className="uploaded-thumb" />
                    <div className="preview-image-overlay">
                      <span className="preview-ready-badge">✓ Image Ready</span>
                      <button
                        type="button"
                        className="btn-remove-photo"
                        onClick={handleRemoveImage}
                        title="Remove photo"
                      >
                        🗑️ Remove / Change Photo
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`image-upload-dropzone ${dragActive ? "drag-active" : ""}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="product-image-upload"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    className="file-input-hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="dropzone-content">
                    <div className="upload-icon-circle">
                      📸
                    </div>
                    <h4>Upload Product Photo</h4>
                    <p>Drag and drop your image here, or browse from your device</p>
                    <label htmlFor="product-image-upload" className="btn btn-accent btn-sm btn-browse-files">
                      📁 Browse Photo Files
                    </label>
                    <span className="upload-help-text">Supports JPG, PNG, WEBP (Auto-optimized)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Details */}
            <div className="form-section">
              <label className="form-section-title">3. Listing Details</label>

              <div className="field">
                <span>Item Title *</span>
                <input
                  type="text"
                  placeholder="e.g. iPhone 15 Pro Max 256GB Titanium"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <em className="error">{errors.name}</em>}
              </div>

              <div className="fields-row">
                <div className="field">
                  <span>Price (ETB / Birr) *</span>
                  <input
                    type="number"
                    placeholder="e.g. 145000"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    aria-invalid={!!errors.price}
                  />
                  {errors.price && <em className="error">{errors.price}</em>}
                </div>

                <div className="field">
                  <span>Condition</span>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleChange("condition", e.target.value)}
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Used">Used</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>
              </div>

              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={formData.negotiable}
                  onChange={(e) => handleChange("negotiable", e.target.checked)}
                />
                <span>Price is Negotiable (ተደራዳሪ)</span>
              </label>

              <div className="field">
                <span>Description & Specs *</span>
                <textarea
                  rows="4"
                  placeholder="Describe key features, specs, warranty, reason for selling..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  aria-invalid={!!errors.description}
                />
                {errors.description && <em className="error">{errors.description}</em>}
              </div>
            </div>

            {/* Step 4: Location */}
            <div className="form-section">
              <label className="form-section-title">4. Item Location</label>
              <div className="fields-row">
                <div className="field">
                  <span>City</span>
                  <select
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  >
                    {locations.length > 0 ? (
                      locations.map((l) => (
                        <option key={l.city} value={l.city}>
                          {l.city}
                        </option>
                      ))
                    ) : (
                      <option value="Addis Ababa">Addis Ababa</option>
                    )}
                  </select>
                </div>

                <div className="field">
                  <span>Subcity / Area</span>
                  <select
                    value={formData.subcity}
                    onChange={(e) => handleChange("subcity", e.target.value)}
                  >
                    {currentCityObj.subcities.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 5: Visual Illustration & Theme */}
            <div className="form-section">
              <label className="form-section-title">5. Card Theme & Fallback Icon</label>
              <div className="field">
                <span>Select Fallback Icon Shape</span>
                <select
                  value={formData.art}
                  onChange={(e) => handleChange("art", e.target.value)}
                >
                  {ART_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <span>Theme Color</span>
                <div className="color-palette-picker">
                  {PRESET_COLORS.map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      className={`color-bubble ${formData.color === p.color ? "active" : ""}`}
                      style={{ backgroundColor: p.color }}
                      onClick={() => handleColorSelect(p)}
                      title={p.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Step 6: Seller Contact */}
            <div className="form-section">
              <label className="form-section-title">6. Contact Information</label>
              <div className="field">
                <span>Your Name / Shop Name</span>
                <input
                  type="text"
                  placeholder="e.g. Abebe Kebede / Addis Electronics"
                  value={formData.sellerName}
                  onChange={(e) => handleChange("sellerName", e.target.value)}
                />
              </div>

              <div className="fields-row">
                <div className="field">
                  <span>Phone Number (Call) *</span>
                  <input
                    type="tel"
                    placeholder="+251912627366"
                    value={formData.sellerPhone}
                    onChange={(e) => handleChange("sellerPhone", e.target.value)}
                    aria-invalid={!!errors.sellerPhone}
                  />
                  {errors.sellerPhone && <em className="error">{errors.sellerPhone}</em>}
                </div>

                <div className="field">
                  <span>Telegram Username</span>
                  <input
                    type="text"
                    placeholder="e.g. greatestvalue"
                    value={formData.sellerTelegram}
                    onChange={(e) => handleChange("sellerTelegram", e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <span>WhatsApp Number</span>
                <input
                  type="tel"
                  placeholder="0941645784 or +251941645784"
                  value={formData.sellerWhatsapp}
                  onChange={(e) => handleChange("sellerWhatsapp", e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-accent btn-wide"
              style={{ padding: "1rem", fontSize: "1.1rem", marginTop: "1rem" }}
              disabled={loading}
            >
              {loading ? "Publishing Listing…" : "🚀 Publish Listing on Gedualpha Ecom"}
            </button>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="sell-preview-sidebar">
          <div className="preview-sticky-card">
            <h3>Live Card Preview</h3>
            <p className="preview-sub">This is how your listing will appear to buyers across Ethiopia.</p>

            <article className="card marketplace-card preview-card">
              <div className="card-art">
                <div className="card-art-inner">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt={formData.name || "Preview"}
                      className="card-photo"
                    />
                  ) : (
                    <ProductArt art={formData.art} color={formData.color} tint={formData.tint} />
                  )}
                </div>
                <span className="card-badge-condition">{formData.condition}</span>
              </div>

              <div className="card-body">
                <div className="card-meta-top">
                  <span className="card-cat-badge">{formData.category}</span>
                  <span className="card-location">📍 {formData.subcity}, {formData.city}</span>
                </div>

                <h4 className="card-title">{formData.name || "Item Title Goes Here"}</h4>

                <div className="price-sub">
                  <div className="price-group">
                    <span className="price">{formData.price ? money(formData.price) : "Br 0"}</span>
                    {formData.negotiable && <span className="tag-negotiable">Negotiable</span>}
                  </div>
                </div>

                <div className="card-footer-actions">
                  <button type="button" className="btn-card-call" disabled>
                    📞 Call
                  </button>
                  <button type="button" className="btn-card-tg" disabled>
                    ✈️
                  </button>
                  <button type="button" className="btn-add" disabled>
                    🛒 Order
                  </button>
                </div>
              </div>
            </article>

            <div className="trust-tips-box">
              <h4>🛡️ Gedualpha Safe Selling Tips</h4>
              <ul>
                <li>Provide accurate condition and details</li>
                <li>Never ask buyers for prepaid advance without escrow</li>
                <li>Meet buyers in secure public locations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
