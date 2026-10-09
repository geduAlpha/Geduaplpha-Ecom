import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), ".env") });

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://gedualpha1989_db_user:fIlIoozWg3X9z3i0@cluster0.dihvcpk.mongodb.net/gedualpha_ecom?retryWrites=true&w=majority&appName=Cluster0";

if (!uri) {
  throw new Error(
    "MONGODB_URI is not set. Add it to server/.env for local dev or to your environment variables."
  );
}

export async function connectDB() {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,  // Atlas free tier can take 20-25s to wake from sleep
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
    maxPoolSize: 10,
    retryWrites: true,
  });
  console.log("MongoDB connected:", mongoose.connection.host);
}

export default mongoose;
