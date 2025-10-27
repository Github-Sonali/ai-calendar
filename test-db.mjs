// test-db.mjs
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testConnection() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    console.log("URI:", process.env.MONGODB_URI ? "Found" : "Not found");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Atlas connected successfully!");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  }
}

testConnection();
