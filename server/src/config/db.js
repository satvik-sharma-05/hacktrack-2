// src/config/db.js
import mongoose from "mongoose";
import { config } from "./env.js";

export async function connectDB() {
  try {
    const conn = await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected to cluster: ${conn.connection.host}`);
    console.log(`📂 Using database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

export default connectDB;
