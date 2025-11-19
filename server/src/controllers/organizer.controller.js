// server/src/controllers/organizer.controller.js
import Event from "../models/Event.js";

/**
 * Create new organizer event (initially pending).
 * POST /api/organizer/events
 * Body: { title, description, url, start, end, prize, skills, tags }
 */
export async function createOrganizerEvent(req, res) {
  try {
    const { title, description, url, start, end, prize = 0, skills = [], tags = [] } = req.body;
    if (!title || !start || !end) return res.status(400).json({ success: false, message: "title, start, end required" });

    const ev = await Event.create({
      title,
      description,
      url,
      start,
      end,
      platform: "organizer",
      source: "organizer",
      createdBy: req.user._id,
      isApproved: false,
      status: "pending",
      prize,
      skills,
      tags,
    });

    res.status(201).json({ success: true, event: ev });
  } catch (err) {
    console.error("createOrganizerEvent error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get events created by current organizer
 * GET /api/organizer/events/mine
 */
export async function myOrganizerEvents(req, res) {
  try {
    const events = await Event.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (err) {
    console.error("myOrganizerEvents:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Admin: list pending organizer submissions
 * GET /api/organizer/submissions
 */
export async function pendingSubmissions(req, res) {
  try {
    const events = await Event.find({ source: "organizer", status: "pending" }).populate("createdBy", "name email");
    res.json({ success: true, events });
  } catch (err) {
    console.error("pendingSubmissions:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Admin approve/reject
 * PUT /api/organizer/events/:id/approve  { action: 'approve' | 'reject' }
 */
export async function approveEvent(req, res) {
  try {
    const { id } = req.params;
    const { action } = req.body;
    if (!["approve", "reject"].includes(action)) return res.status(400).json({ success: false, message: "Invalid action" });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    event.status = action === "approve" ? "approved" : "rejected";
    event.isApproved = action === "approve";
    await event.save();

    res.json({ success: true, event });
  } catch (err) {
    console.error("approveEvent:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Organizer can update or delete their own events (if pending or rejected)
 * PUT /api/organizer/events/:id
 * DELETE /api/organizer/events/:id
 */
export async function updateOrganizerEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ _id: id, createdBy: req.user._id });
    if (!event) return res.status(404).json({ success: false, message: "Not found or not allowed" });

    // allow updates only when pending or rejected (optional)
    Object.assign(event, req.body);
    event.status = "pending"; // reset to pending on edit
    event.isApproved = false;
    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    console.error("updateOrganizerEvent:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteOrganizerEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findOneAndDelete({ _id: id, createdBy: req.user._id });
    if (!event) return res.status(404).json({ success: false, message: "Not found or not allowed" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("deleteOrganizerEvent:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}
