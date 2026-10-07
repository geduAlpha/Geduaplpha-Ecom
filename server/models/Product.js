import mongoose from "mongoose";

const toJSON = {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const locationSchema = new mongoose.Schema(
  {
    city:    { type: String, default: "Addis Ababa" },
    subcity: { type: String, default: "Bole" },
  },
  { _id: false }
);

const sellerSchema = new mongoose.Schema(
  {
    name:     { type: String, default: "Gedualpha Seller" },
    phone:    { type: String, default: "+251 91 123 4567" },
    telegram: { type: String, default: "gedualpha_ecom" },
    whatsapp: { type: String, default: "+251911234567" },
    verified: { type: Boolean, default: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    _id:         { type: String },          // slug or unique id
    name:        { type: String, required: true },
    category:    { type: String, required: true },
    price:       { type: Number, required: true }, // price in ETB (Birr)
    negotiable:  { type: Boolean, default: false },
    condition:   { type: String, default: "Brand New" }, // Brand New, Like New, Used, Refurbished
    stock:       { type: Number, required: true, default: 1 },
    art:         { type: String, required: true, default: "notebook" },
    color:       { type: String, required: true, default: "#1E3A8A" },
    tint:        { type: String, required: true, default: "#EFF6FF" },
    description: { type: String, required: true },
    location:    { type: locationSchema, default: () => ({ city: "Addis Ababa", subcity: "Bole" }) },
    seller:      { type: sellerSchema, default: () => ({ name: "Gedualpha Seller", phone: "+251 91 123 4567", telegram: "gedualpha_ecom", verified: true }) },
    views:       { type: Number, default: 0 },
    featured:    { type: Boolean, default: false },
  },
  { timestamps: true, toJSON }
);

export default mongoose.model("Product", productSchema);
