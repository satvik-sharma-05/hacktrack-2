// src/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config/env.js";

export default async function auth(req, res, next) {
  try {
    // ✅ Look for token in both cookie and Authorization header
    let token;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1]; // after the space
    }

    if (!token) {
      console.warn("🚫 No token found in cookies or headers");
      return res.status(401).json({ error: "Not authorized" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.warn("🚫 User not found for decoded ID:", decoded.id);
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
