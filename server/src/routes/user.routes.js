import express from "express";
import auth from "../middleware/auth.js";
import { getMyProfile, updateMyProfile } from "../controllers/user.controller.js";
import User from "../models/User.js"
const router = express.Router();

// ✅ GET current user profile
router.get("/profile", auth, getMyProfile);

// ✅ PUT update user profile
router.put("/profile", auth, updateMyProfile);



// ✅ Update role (used after OAuth)
router.put("/role", async (req, res) => {
  const { tempId, role } = req.body;
  try {
    if (!tempId || !role)
      return res.status(400).json({ message: "Missing required fields" });

    const user = await User.findById(tempId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.json({ success: true, message: "Role updated successfully" });
  } catch (err) {
    console.error("Role update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ✅ NEW: get another user's "public" profile (auth required)
router.get("/:id", auth, async (req, res) => {
  try {
    const targetId = req.params.id;

    // prevent self if you want (optional)
    // if (targetId === String(req.user._id)) {
    //   return res.json({ success: true, user: req.user });
    // }

    const user = await User.findById(targetId)
      .select(
        // only expose safe profile fields
        "name avatar bio skills interests preferredRoles college graduationYear xp level createdAt"
      )
      .lean();

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, user });
  } catch (err) {
    console.error("Public profile fetch error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;




