import express from "express";
import auth from "../middleware/auth.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import Participation from "../models/Participation.js";

const router = express.Router();

/* -------------------------
   🔒 Admin-only middleware
-------------------------- */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
};

/* -------------------------
   📊 ENHANCED DASHBOARD STATS (REAL ANALYTICS)
-------------------------- */
router.get("/stats", auth, requireAdmin, async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrganizers = await User.countDocuments({ role: "organizer" });
    const totalEvents = await Event.countDocuments();
    const pendingEvents = await Event.countDocuments({ status: "pending" });
    const participations = await Participation.countDocuments();

    // 📊 Role distribution
    const roleCounts = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const roleDistribution = roleCounts.map((r) => ({
      name: r._id,
      value: r.count,
    }));

    // 🗓 Monthly user growth (last 6 months)
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 },
    ]);

    // 🗓 Monthly event growth (last 6 months)
    const eventGrowth = await Event.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 },
    ]);

    // 🧮 Format month names
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formattedUserGrowth = userGrowth.map((g) => ({
      month: months[g._id.month - 1],
      count: g.count,
    }));

    const formattedEventGrowth = eventGrowth.map((g) => ({
      month: months[g._id.month - 1],
      count: g.count,
    }));

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrganizers,
        totalEvents,
        pendingEvents,
        participations,
        roleDistribution,
        userGrowth: formattedUserGrowth,
        eventGrowth: formattedEventGrowth,
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* -------------------------
   🧾 View Organizer Submissions (Pending)
-------------------------- */
router.get("/submissions", auth, requireAdmin, async (_req, res) => {
  try {
    const events = await Event.find({ source: "organizer" })
      .populate("organizerRef", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, events });
  } catch (err) {
    console.error("Admin submissions fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------------
   ✅ Approve Event
-------------------------- */
router.put("/approve/:id", auth, requireAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, status: "approved" },
      { new: true }
    );
    if (!event)
      return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event approved", event });
  } catch (err) {
    console.error("Admin approve error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------------
   ❌ Reject Event
-------------------------- */
router.put("/reject/:id", auth, requireAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, status: "rejected" },
      { new: true }
    );
    if (!event)
      return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event rejected", event });
  } catch (err) {
    console.error("Admin reject error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------------
   👥 List All Users
-------------------------- */
router.get("/users", auth, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, users });
  } catch (err) {
    console.error("Admin user fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------------
   🛠 Update User Role
-------------------------- */
router.put("/users/:id/role", auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "organizer", "admin"].includes(role))
      return res.status(400).json({ success: false, message: "Invalid role" });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "Role updated", user });
  } catch (err) {
    console.error("Role update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------------
   🗑️ Delete User
-------------------------- */
router.delete("/users/:id", auth, requireAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ success: false, message: "User not found" });

    // Optional: remove user-related data
    await Participation.deleteMany({ user: req.params.id });
    await Event.deleteMany({ createdBy: req.params.id });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------------
   🗑️ Delete Event
-------------------------- */
router.delete("/events/:id", auth, requireAdmin, async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent)
      return res.status(404).json({ success: false, message: "Event not found" });

    await Participation.deleteMany({ event: req.params.id });
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
