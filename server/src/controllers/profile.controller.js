// src/controllers/profile.controller.js
import User from "../models/User.js";

/**
 * GET /api/profile
 * Returns currently authenticated user's profile
 */
export async function getProfile(req, res, next) {
  try {
    const userId = req.user?.id || req.userId || req.user; // adapt to your auth middleware
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const user = await User.findById(userId).select("-password -__v");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/profile
 * Body: { name, bio, skills: [..], interests: [..], role }
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user?.id || req.userId || req.user;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const allowed = ["name", "bio", "skills", "interests", "role", "avatar"];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    // Normalize skills/interests to arrays
    if (typeof updates.skills === "string") {
      updates.skills = updates.skills.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (typeof updates.interests === "string") {
      updates.interests = updates.interests.split(",").map(s => s.trim()).filter(Boolean);
    }

    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select("-password -__v");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}
