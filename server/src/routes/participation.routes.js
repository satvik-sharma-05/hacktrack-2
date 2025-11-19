// server/src/routes/participation.routes.js
import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import Participation from "../models/Participation.js";
import Event from "../models/Event.js";

const router = express.Router();

/* -------------------------
   🟢 JOIN HACKATHON (POST /api/participation/:eventId/join)
   - Accepts either Mongo ObjectId or event.externalId
   - Idempotent: returns 200 "Already joined" if duplicate
-------------------------- */
router.post("/:eventId/join", auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Resolve event by ObjectId OR externalId
    let event = null;
    if (mongoose.isValidObjectId(eventId)) {
      event = await Event.findById(eventId);
    }
    if (!event) {
      event = await Event.findOne({ externalId: eventId });
    }
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Try to create participation (unique index at DB level will prevent duplicates)
    try {
      const participation = await Participation.create({ user: userId, event: event._id });
      return res.status(201).json({
        success: true,
        message: "Congratulations! You joined the hackathon 🎉",
        participation,
      });
    } catch (err) {
      // Duplicate key error -> already joined
      if (err.code === 11000) {
        return res.status(200).json({
          success: true,
          message: "Already joined",
        });
      }
      throw err;
    }
  } catch (err) {
    console.error("❌ Join hackathon error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------------
   🟢 GET USER PARTICIPATIONS (GET /api/participation/my)
-------------------------- */
router.get("/my", auth, async (req, res) => {
  try {
    const participations = await Participation.find({ user: req.user._id })
      .populate("event", "title start end platform source externalId bannerImage url organizerRef")
      .sort({ joinedAt: -1 })
      .lean();

    return res.json({ success: true, participations });
  } catch (err) {
    console.error("Fetch user participations error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------------
   🟢 ORGANIZER: VIEW PARTICIPANTS
   GET /api/participation/event/:eventId/participants
   - Only the event's organizer may view participants
-------------------------- */
router.get("/event/:eventId/participants", auth, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Resolve event (ObjectId or externalId)
    let event = null;
    if (mongoose.isValidObjectId(eventId)) {
      event = await Event.findById(eventId);
    }
    if (!event) {
      event = await Event.findOne({ externalId: eventId });
    }
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // ensure organizerRef exists and matches current user
    if (!event.organizerRef || event.organizerRef.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const participants = await Participation.find({ event: event._id })
      .populate("user", "name email avatar")
      .sort({ joinedAt: -1 })
      .lean();

    return res.json({ success: true, count: participants.length, participants });
  } catch (err) {
    console.error("Fetch participants error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
