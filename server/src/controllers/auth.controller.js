import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config/env.js";

// Helper to sign JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ Register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Role validation
    const validRoles = ["student", "organizer"];
    const finalRole = validRoles.includes(role) ? role : "student";

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role: finalRole });

    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
};


// ✅ Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.json({
      success: true,
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Logout
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
};

// ✅ Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
