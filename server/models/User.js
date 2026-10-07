import mongoose from "mongoose";
import crypto from "node:crypto";

const userSchema = new mongoose.Schema(
  {
    _id:      { type: String },           // UUID
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, trim: true, lowercase: true, unique: true },
    phone:    { type: String, default: "" },
    // password stored as SHA-256 hex (no bcrypt dependency required)
    password: { type: String, required: true },
    role:     { type: String, enum: ["buyer", "seller", "business"], default: "buyer" },
    avatar:   { type: String, default: null },   // initials fallback used if null
    verified: { type: Boolean, default: false },
    agreedTerms: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;   // never send password hash to client
        return ret;
      },
    },
  }
);

/** Hash a plain-text password with SHA-256 + a fixed site salt. */
export function hashPassword(plain) {
  return crypto.createHash("sha256").update(`gedualpha:${plain}`).digest("hex");
}

export default mongoose.model("User", userSchema);
