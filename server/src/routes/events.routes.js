// src/routes/events.routes.js
import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  getLive,
  list,
  bookmark,
  myBookmarks,
  getSaved,
  getHackathonStatistics,
  getLiveDevpost,
  getEventStatistics,
  getLiveMLH,           // ADD MLH IMPORT
  getMLHHealth          // ADD MLH HEALTH IMPORT
} from "../controllers/events.controller.js";
import express from "express";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import { fetchClist } from "../services/clist.js";
import { DevpostService } from "../services/devpost.service.js";
import * as mlhService from "../services/mlhService.js";
import { normalizeMLHEvent } from "../services/mlhService.js";

const router = express.Router();

// Public (static) routes — specific first
router.get("/live", getLive);
router.get("/devpost", getLiveDevpost);
router.get("/mlh", getLiveMLH);                    // ADD MLH ROUTE
router.get("/mlh/health", getMLHHealth);          // ADD MLH HEALTH ROUTE
router.get("/devpost/statistics", getHackathonStatistics);
router.get("/statistics", getEventStatistics);
router.get("/saved", getSaved);
router.get("/", list);
// MLH Test Route
router.get('/test/mlh', async (req, res) => {
  try {
    const mlhEvents = await mlhService.fetchMLHEvents();
    const normalized = mlhEvents.map(event => normalizeMLHEvent(event)).filter(e => e);

    res.json({
      success: true,
      raw_count: mlhEvents.length,
      normalized_count: normalized.length,
      sample: normalized.slice(0, 3),
    });
  } catch (error) {
    console.error("❌ MLH test failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Authenticated routes
router.get("/me/bookmarks", auth, myBookmarks);
router.post("/:id/bookmark", auth, bookmark);

// Debug and test routes
router.get('/test/devpost', async (req, res) => {
  try {
    const devpostService = new DevpostService();
    const hackathons = await devpostService.scrapeAllHackathons(2);
    console.log("🎯 Raw Devpost data:", hackathons);

    res.json({
      success: true,
      count: hackathons.length,
      hackathons: hackathons.slice(0, 5) // First 5 for testing
    });
  } catch (error) {
    console.error("❌ Devpost test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// MLH Test Route
router.get('/test/mlh', async (req, res) => {
  try {
    const mlhService = new MLHService();
    const mlhEvents = await mlhService.fetchMLHEvents(1);
    const normalized = mlhEvents.map(event => normalizeMLHEvent(event)).filter(e => e);

    console.log("🎯 Raw MLH data sample:", mlhEvents.slice(0, 2));
    console.log("🎯 Normalized MLH data sample:", normalized.slice(0, 2));

    res.json({
      success: true,
      raw_count: mlhEvents.length,
      normalized_count: normalized.length,
      raw_sample: mlhEvents.slice(0, 2),
      normalized_sample: normalized.slice(0, 2),
      all_normalized: normalized
    });
  } catch (error) {
    console.error("❌ MLH test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug normalization
router.get('/debug/normalization', async (req, res) => {
  try {
    const devpostService = new DevpostService();
    const mlhService = new MLHService();

    const [devpostHackathons, mlhEvents] = await Promise.all([
      devpostService.scrapeAllHackathons(1),
      mlhService.fetchMLHEvents(1)
    ]);

    console.log("🔍 RAW Devpost data sample:", devpostHackathons.slice(0, 2));
    console.log("🔍 RAW MLH data sample:", mlhEvents.slice(0, 2));

    // Test the normalization function from getLive
    const normalizeEventForDisplay = (ev, source = "clist") => {
      console.log(`🔄 Normalizing: ${ev.title || ev.name || 'Unknown'} | Source: ${source}`);

      let platform = source === "devpost" ? "Devpost" :
        source === "mlh" ? "MLH" :
          (ev.platform || source);

      let externalId;
      if (source === "devpost" && ev.devpostId) {
        externalId = `devpost_${ev.devpostId}`;
      } else if (source === "mlh" && ev.event_id) {
        externalId = ev.event_id;
      } else {
        externalId = ev.externalId || ev.id || ev.external_id || ev._id?.toString() || `${platform}_${Date.now()}`;
      }

      let startDate = null;
      let endDate = null;

      if (source === "devpost" && ev.submissionDeadline) {
        startDate = new Date(ev.submissionDeadline);
        endDate = new Date(ev.submissionDeadline);
        endDate.setDate(endDate.getDate() + 2);
      } else if (source === "mlh" && ev.start_date) {
        startDate = new Date(ev.start_date);
        endDate = ev.end_date ? new Date(ev.end_date) : new Date(startDate.getTime() + 86400000 * 2);
      } else {
        startDate = ev.start ? new Date(ev.start) : null;
        endDate = ev.end ? new Date(ev.end) : null;
      }

      const normalized = {
        _key: `${platform}::${externalId}`,
        platform,
        externalId: externalId.toString(),
        title: ev.title || ev.name || "Untitled",
        description: ev.description || ev.tagline || ev.summary || "",
        url: ev.url || ev.html_url || ev.link || "",
        start: startDate,
        end: endDate,
        source: source,
        isApproved: true,
        bannerImage: ev.bannerImage || ev.cover || ev.thumbnailUrl || ev.backsplash_image || ev.logo_image || "",
        organizerRef: ev.organizerRef || ev.organizer || ev.organizationName || "Major League Hacking",
        isOnline: ev.isOnline || false,
        prize: ev.prize || ev.prizeAmount || 0,
        registrations: ev.registrationsCount || 0,
        isFeatured: ev.featured || false,
        location: ev.location || ev.displayedLocation || "Online",
      };

      console.log(`✅ Normalized: ${normalized.title} | Source: ${normalized.source} | Key: ${normalized._key}`);
      return normalized;
    };

    // Test normalization on first 3 events from each source
    const normalizedDevpost = devpostHackathons.slice(0, 2).map(event =>
      normalizeEventForDisplay(event, 'devpost')
    );

    const normalizedMLH = mlhEvents.slice(0, 2).map(event =>
      normalizeEventForDisplay(event, 'mlh')
    );

    res.json({
      success: true,
      devpost: {
        raw_count: devpostHackathons.length,
        normalized_count: normalizedDevpost.length,
        raw_sample: devpostHackathons.slice(0, 2),
        normalized_sample: normalizedDevpost,
      },
      mlh: {
        raw_count: mlhEvents.length,
        normalized_count: normalizedMLH.length,
        raw_sample: mlhEvents.slice(0, 2),
        normalized_sample: normalizedMLH,
      },
      message: "Check backend console for normalization logs"
    });

  } catch (error) {
    console.error('Normalization debug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dynamic event detail route — LAST so it doesn't swallow static routes
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (id.includes(":")) {
      const [platform, externalId] = id.split(":");
      if (!platform || !externalId) {
        return res.status(400).json({ success: false, message: "Invalid event identifier" });
      }

      const ev = await Event.findOne({ platform, externalId }).populate("createdBy", "name email").lean();
      if (ev) return res.json({ success: true, event: ev });

      // Handle remote fetch for different platforms
      if (platform === "clist" && typeof fetchClist === "function") {
        const remote = await fetchClist(externalId);
        if (remote) return res.json({ success: true, event: { source: "clist", ...remote } });
      } else if (platform === "mlh") {
        const mlhService = new MLHService();
        const mlhEvents = await mlhService.fetchMLHEvents(1);
        const remote = mlhEvents.find(event => event.event_id === externalId);
        if (remote) {
          const normalized = normalizeMLHEvent(remote);
          return res.json({ success: true, event: normalized });
        }
      } else if (platform === "devpost") {
        const devpostService = new DevpostService();
        const devpostEvents = await devpostService.scrapeAllHackathons(1);
        const remote = devpostEvents.find(event => event.devpostId === externalId);
        if (remote) {
          return res.json({ success: true, event: { source: "devpost", ...remote } });
        }
      }

      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (mongoose.isValidObjectId(id)) {
      const ev = await Event.findById(id).populate("createdBy", "name email").lean();
      if (!ev) return res.status(404).json({ success: false, message: "Event not found" });
      return res.json({ success: true, event: ev });
    }

    const ev = await Event.findOne({ externalId: id }).populate("createdBy", "name email").lean();
    if (ev) return res.json({ success: true, event: ev });

    return res.status(404).json({ success: false, message: "Event not found" });
  } catch (err) {
    console.error("Fetch event error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;