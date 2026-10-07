import mongoose from "mongoose";

const toJSON = {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name:      { type: String, required: true },
    price:     { type: Number, required: true }, // cents
    qty:       { type: Number, required: true },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    address: { type: String, required: true },
    city:    { type: String, required: true },
    postal:  { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    _id:           { type: String },   // 8-char uppercase random ID e.g. "A1B2C3D4"
    customer:      { type: customerSchema, required: true },
    items:         { type: [orderItemSchema], required: true },
    subtotal:      { type: Number, required: true },
    shipping:      { type: Number, required: true },
    total:         { type: Number, required: true },
    status:        { type: String, default: "pending", enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"] },
    paymentMethod: { type: String, default: "telebirr" },
    paymentRef:    { type: String, default: "" },
    notes:         { type: String, default: "" },
  },
  { timestamps: true, toJSON }
);

export default mongoose.model("Order", orderSchema);
