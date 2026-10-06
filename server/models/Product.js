import mongoose from "mongoose";

const toJSON = {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const productSchema = new mongoose.Schema(
  {
    _id:         { type: String },          // slug e.g. "daybook-notebook"
    name:        { type: String, required: true },
    category:    { type: String, required: true },
    price:       { type: Number, required: true }, // cents
    stock:       { type: Number, required: true, default: 0 },
    art:         { type: String, required: true },
    color:       { type: String, required: true },
    tint:        { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true, toJSON }
);

export default mongoose.model("Product", productSchema);
