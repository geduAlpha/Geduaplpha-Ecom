import mongoose from "mongoose";

const postingPaymentSchema = new mongoose.Schema(
  {
    _id:           { type: String },          // same as the product id created
    plan:          { type: String, required: true, enum: ["basic", "standard", "pro"] },
    amount:        { type: Number, required: true },  // ETB
    paymentMethod: { type: String, required: true, enum: ["free", "telebirr", "cbe", "chapa"] },
    paymentRef:    { type: String, required: true },  // transaction reference from user
    sellerPhone:   { type: String, required: true },
    status:        { type: String, default: "pending", enum: ["pending", "verified", "rejected"] },
    productId:     { type: String, default: null },   // set after product is created
  },
  { timestamps: true }
);

export default mongoose.model("PostingPayment", postingPaymentSchema);
