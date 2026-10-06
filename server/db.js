import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI is not set. Add it to server/.env for local dev or to your Railway environment variables."
  );
}

export async function connectDB() {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("MongoDB connected:", mongoose.connection.host);
}

export default mongoose;
