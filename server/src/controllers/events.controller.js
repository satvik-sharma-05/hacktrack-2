// src/controllers/events.controller.js
import Event from "../models/Event.js";
import User from "../models/User.js";
import { upsertEvents } from "../utils/upsertEvents.js";
import { fetchClist } from "../services/clist.js";
import mongoose from "mongoose";
import { fetchDevpostEvents } from "../services/devpost.service.js";

import { fetchMLHEvents, normalizeMLHEvent, getMLHCacheMetadata } from "../services/mlhService.js";


/**
 * ✅ Fetch live events from multiple sources
 * GET /api/events/live
 */

// Utility: Fisher–Yates Shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function getLive(req, res) {
  console.log("🔍 getLive() called");
  const startTime = Date.now();

  try {
    console.log("🌐 Fetching from cache-based sources...");

    // Concurrent fetch from all sources — cached
    const [clistPromise, devpostPromise, mlhPromise, organizerPromise] = [
      fetchClist().catch(err => {
        console.error("❌ CLIST fetch failed:", err.message);
        return [];
      }),
      fetchDevpostEvents().catch(err => {
        console.error("❌ Devpost fetch failed:", err.message);
        return [];
      }),
      fetchMLHEvents().catch(err => {
        console.error("❌ MLH fetch failed:", err.message);
        return [];
      }),
      Event.find({
        source: "organizer",
        isApproved: true,
        $or: [{ end: { $gte: new Date() } }, { end: { $exists: false } }],
      })
        .sort({ start: 1 })
        .lean()
        .catch(err => {
          console.error("❌ Organizer DB fetch failed:", err.message);
          return [];
        }),
    ];

    const [clistEvents, devpostEvents, mlhEvents, organizerEvents] = await Promise.all([
      clistPromise,
      devpostPromise,
      mlhPromise,
      organizerPromise,
    ]);

    console.log(
      `📥 RAW COUNTS → CLIST: ${clistEvents.length}, DEVPOST: ${devpostEvents.length}, MLH: ${mlhEvents.length}, ORGANIZER: ${organizerEvents.length}`
    );

    const allEvents = [];

    // 1️⃣ Organizer
    for (const e of organizerEvents) {
      allEvents.push({
        ...e,
        source: "organizer",
        platform: "organizer",
        _key: `organizer::${e._id || e.externalId}`,
      });
    }

    // 2️⃣ CLIST
    for (const e of clistEvents) {
      allEvents.push({
        ...e,
        source: "clist",
        platform: "clist",
        _key: `clist::${e.externalId || e.id}`,
      });
    }

    // 3️⃣ MLH normalized
    for (let i = 0; i < mlhEvents.length; i++) {
      try {
        const normalized = normalizeMLHEvent(mlhEvents[i]);
        if (normalized) allEvents.push(normalized);
      } catch (e) {
        console.error(`⚠️ MLH normalize failed (${i}):`, e.message);
      }
    }

    // 4️⃣ Devpost (cached)
    for (const e of devpostEvents) {
      const startDate = new Date(e.submissionDeadline || Date.now());
      const endDate = new Date(e.submissionDeadline || Date.now() + 86400000 * 30);
      allEvents.push({
        _key: `devpost::${e.devpostId}`,
        platform: "Devpost",
        externalId: `devpost_${e.devpostId}`,
        title: e.title || "Untitled Hackathon",
        description: e.description || "",
        url: e.url || "",
        start: startDate,
        end: endDate,
        source: "devpost",
        isApproved: true,
        bannerImage: e.thumbnailUrl || "",
        organizerRef: e.organizationName || null,
        isOnline: e.isOnline || false,
        prize: e.prizeAmount || 0,
        registrations: e.registrationsCount || 0,
        isFeatured: e.featured || false,
        location: e.displayedLocation || "Online",
      });
    }

    console.log(`📦 COMBINED TOTAL: ${allEvents.length}`);

    // 🧹 Deduplicate
    const seen = new Set();
    const uniqueEvents = allEvents.filter(e => {
      if (seen.has(e._key)) return false;
      seen.add(e._key);
      return true;
    });

    console.log(`✅ UNIQUE: ${uniqueEvents.length}`);

    // 🎲 Shuffle
    const shuffled = shuffleArray([...uniqueEvents]);

    // 📄 Pagination
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit || "24", 10));
    const paged = shuffled.slice((page - 1) * limit, page * limit);

    // Background upsert
    Promise.allSettled([
      clistEvents.length ? upsertEvents("clist", clistEvents) : Promise.resolve(),
      devpostEvents.length ? upsertEvents("devpost", devpostEvents) : Promise.resolve(),
      mlhEvents.length ? upsertEvents("mlh", mlhEvents) : Promise.resolve(),
    ]).then(results => {
      ["CLIST", "DEVPOST", "MLH"].forEach((src, i) => {
        const r = results[i];
        if (r.status === "fulfilled") console.log(`✅ Upsert done for ${src}`);
        else console.error(`⚠️ Upsert failed for ${src}:`, r.reason);
      });
    });

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⚡ Served ${paged.length} events in ${totalTime}s`);

    return res.status(200).json({
      success: true,
      total: shuffled.length,
      count: paged.length,
      page,
      limit,
      events: paged,
      sources: {
        clist: clistEvents.length,
        devpost: devpostEvents.length,
        mlh: mlhEvents.length,
        organizer: organizerEvents.length,
      },
    });
  } catch (err) {
    console.error("❌ getLive failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch live events",
      error: err.message,
    });
  }
}





// ─────────────── MLH Controllers ───────────────

// GET /api/events/mlh
export async function getLiveMLH(req, res) {
  try {
    const events = await fetchMLHEvents();
    const normalized = events.map(normalizeMLHEvent).filter(Boolean);

    res.json({
      success: true,
      total: normalized.length,
      events: normalized,
    });
  } catch (err) {
    console.error("❌ getLiveMLH failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/events/mlh/health
export async function getMLHHealth(req, res) {
  try {
    console.log("🔍 Checking MLH cache health...");
    const metadata = getMLHCacheMetadata();
    const events = await fetchMLHEvents();

    const upcoming = events.filter(e => {
      const start = new Date(e.start || e.start_date);
      return start >= new Date();
    });

    const status = events.length > 0 ? "healthy" : "unhealthy";

    console.log(`📊 MLH STATUS: ${status.toUpperCase()} | ${events.length} events | Cache age: ${metadata.ageHours}h`);

    res.json({
      success: true,
      service: "MLH",
      status,
      totalEvents: events.length,
      upcoming: upcoming.length,
      cache: {
        exists: metadata.exists,
        lastUpdated: metadata.lastUpdated,
        ageHours: metadata.ageHours,
        eventsCount: metadata.eventsCount,
      },
      message: metadata.exists
        ? `Cache last updated ${metadata.ageHours}h ago (${new Date(metadata.lastUpdated).toLocaleString()})`
        : "Cache not found",
      sample: events.slice(0, 3).map(normalizeMLHEvent),
    });
  } catch (err) {
    console.error("❌ MLH health check failed:", err);
    res.status(500).json({
      success: false,
      message: "MLH health check failed",
      error: err.message,
    });
  }
}







// Helper function to map MLH status
function mapMLHStatus(start_date, end_date) {
  const now = new Date();
  const startDate = start_date ? new Date(start_date) : new Date();
  const endDate = end_date ? new Date(end_date) : new Date(now.getTime() + 86400000 * 2);

  if (now < startDate) return 'upcoming';
  if (now >= startDate && now <= endDate) return 'ongoing';
  return 'completed';
}



/**
 * ✅ Fetch Devpost hackathons
 * GET /api/events/devpost
 */
export async function getLiveDevpost(req, res) {
  try {
    const { maxPages = 3, status, search, timeframe, location } = req.query;

    // Fetch hackathons from Devpost
    const hackathons = await devpostService.scrapeAllHackathons(parseInt(maxPages));

    let filteredHackathons = hackathons;

    // Apply filters
    if (status && status !== 'all') {
      filteredHackathons = filteredHackathons.filter(h =>
        h.openState?.toLowerCase() === status.toLowerCase()
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredHackathons = filteredHackathons.filter(h =>
        h.title?.toLowerCase().includes(searchLower) ||
        h.organizationName?.toLowerCase().includes(searchLower) ||
        h.description?.toLowerCase().includes(searchLower)
      );
    }

    // Timeframe filter
    if (timeframe && timeframe !== 'all') {
      const now = new Date();
      filteredHackathons = filteredHackathons.filter(h => {
        if (!h.submissionDeadline) return false;

        const deadline = new Date(h.submissionDeadline);
        switch (timeframe) {
          case 'upcoming':
            return deadline > now;
          case 'ongoing':
            return deadline >= now;
          case 'past':
            return deadline < now;
          default:
            return true;
        }
      });
    }

    // Location filter
    if (location && location !== 'all') {
      if (location === 'online') {
        filteredHackathons = filteredHackathons.filter(h => h.isOnline);
      } else if (location === 'offline') {
        filteredHackathons = filteredHackathons.filter(h => !h.isOnline);
      }
    }

    const statistics = devpostService.getStatistics(filteredHackathons);

    // Normalize the data for consistent response format
    const normalizedEvents = filteredHackathons.map(event => ({
      id: `devpost_${event.devpostId || event.id}`,
      title: event.title,
      description: event.description || event.tagline,
      platform: 'Devpost',
      url: event.url,
      start: event.submissionDeadline ? new Date(event.submissionDeadline) : null,
      end: event.submissionDeadline ? new Date(event.submissionDeadline) : null,
      location: event.displayedLocation || event.location,
      isOnline: event.isOnline || false,
      prize: event.prizeAmount || 0,
      registrations: event.registrationsCount || 0,
      status: mapDevpostStatus(event.openState),
      isFeatured: event.featured || false,
      thumbnail: event.thumbnailUrl,
      organization: event.organizationName,
      type: 'hackathon',
      source: 'devpost'
    }));

    res.json({
      success: true,
      events: normalizedEvents,
      statistics,
      total: normalizedEvents.length
    });
  } catch (error) {
    console.error('Error in getLiveDevpost:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Devpost events',
      message: error.message
    });
  }
}

// Helper function to map Devpost status
function mapDevpostStatus(openState) {
  const statusMap = {
    'open': 'ongoing',
    'upcoming': 'upcoming',
    'ended': 'completed'
  };
  return statusMap[openState] || 'unknown';
}

/**
 * ✅ Get Devpost statistics
 * GET /api/events/devpost/statistics
 */
export async function getHackathonStatistics(req, res) {
  try {
    const { maxPages = 3 } = req.query;
    const hackathons = await devpostService.scrapeAllHackathons(parseInt(maxPages));
    const stats = devpostService.getStatistics(hackathons);

    res.json({
      success: true,
      statistics: stats,
      sampleSize: hackathons.length
    });
  } catch (error) {
    console.error('Error in getHackathonStatistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
}

/**
 * ✅ Get event statistics (general) - Updated with MLH
 * GET /api/events/statistics
 */
export async function getEventStatistics(req, res) {
  try {
    // Get events from multiple sources including MLH
    const [devpostEvents, clistEvents, mlhEvents, organizerEvents] = await Promise.all([
      devpostService.scrapeAllHackathons(2),
      fetchClist(),
      fetchMLHEvents(1),
      Event.find({ source: "organizer", isApproved: true }).lean()
    ]);

    const allEvents = [
      ...devpostEvents.map(event => ({ ...event, source: 'devpost' })),
      ...clistEvents.map(event => ({ ...event, source: 'clist' })),
      ...mlhEvents.map(event => ({ ...event, source: 'mlh' })),
      ...organizerEvents.map(event => ({ ...event, source: 'organizer' }))
    ];

    // Calculate statistics
    const total = allEvents.length;
    const byPlatform = allEvents.reduce((acc, event) => {
      const platform = event.platform || event.source;
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});

    const bySource = allEvents.reduce((acc, event) => {
      acc[event.source] = (acc[event.source] || 0) + 1;
      return acc;
    }, {});

    const now = new Date();
    const upcoming = allEvents.filter(event =>
      event.start && new Date(event.start) > now
    ).length;

    const ongoing = allEvents.filter(event =>
      event.start && new Date(event.start) <= now &&
      (!event.end || new Date(event.end) >= now)
    ).length;

    const online = allEvents.filter(event => event.isOnline).length;

    res.json({
      success: true,
      statistics: {
        total,
        byPlatform,
        bySource,
        upcoming,
        ongoing,
        online
      }
    });
  } catch (error) {
    console.error('Error in getEventStatistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
}

/**
 * ✅ Create personal event
 * POST /api/events/personal
 */
export async function createPersonalEvent(req, res) {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user._id,
      source: 'organizer',
      isApproved: false, // Needs admin approval
      createdAt: new Date()
    };

    const event = await Event.create(eventData);

    res.json({
      success: true,
      event: event,
      message: 'Personal event created successfully and pending approval'
    });
  } catch (error) {
    console.error('Error creating personal event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create personal event'
    });
  }
}

/**
 * ✅ List events from MongoDB
 * GET /api/events?page=1&limit=12&q=hackathon
 */
export async function list(req, res) {
  try {
    const { page = 1, limit = 12, platform, type, q } = req.query;
    const query = { isApproved: true };

    if (platform) query.platform = platform;
    if (type) query.type = type;
    if (q) {
      query.$or = [
        { title: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
        { organizer: new RegExp(q, "i") },
      ];
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ start: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      events,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("❌ Failed to fetch events:", err);
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
}

/**
 * ✅ Toggle bookmark for a logged-in user
 * POST /api/events/:id/bookmark
 */
export const bookmark = async (req, res) => {
  try {
    const rawId = req.params.id;
    if (!rawId) return res.status(400).json({ success: false, message: "Missing event id" });

    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Initialize bookmarks array if needed
    if (!Array.isArray(user.bookmarks)) user.bookmarks = [];

    let event = null;
    let eventIdentifier = null;

    // Handle different ID formats
    if (mongoose.isValidObjectId(rawId)) {
      // MongoDB ObjectId
      event = await Event.findById(rawId);
      eventIdentifier = rawId;
    } else if (rawId.includes(":")) {
      // platform:externalId format (e.g., clist:12345, mlh:event_123)
      const [platform, externalId] = rawId.split(":");
      if (!platform || !externalId) {
        return res.status(400).json({ success: false, message: "Invalid event identifier" });
      }

      // Try to find in database first
      event = await Event.findOne({ platform, externalId });

      // If not found and it's a known platform, create from remote data
      if (!event && (platform === "clist" || platform === "mlh" || platform === "devpost")) {
        try {
          let remoteEvent = null;

          if (platform === "clist") {
            const clistEvents = await fetchClist();
            remoteEvent = clistEvents.find(ev => ev.externalId === externalId);
          } else if (platform === "mlh") {
            const mlhEvents = await fetchMLHEvents();
            remoteEvent = mlhEvents.find(ev => ev.event_id === externalId);
            if (remoteEvent) {
              remoteEvent = normalizeMLHEvent(remoteEvent);
            }
          } else if (platform === "devpost") {
            const devpostEvents = await devpostService.scrapeAllHackathons(1);
            remoteEvent = devpostEvents.find(ev => ev.devpostId === externalId);
          }

          if (remoteEvent) {
            // Create event in database from remote data
            event = await Event.findOneAndUpdate(
              { platform, externalId },
              {
                $setOnInsert: {
                  platform,
                  externalId,
                  title: remoteEvent.title || "Imported Event",
                  description: remoteEvent.description || "",
                  url: remoteEvent.url || "",
                  start: remoteEvent.start ? new Date(remoteEvent.start) : new Date(),
                  end: remoteEvent.end ? new Date(remoteEvent.end) : new Date(Date.now() + 3600 * 1000),
                  source: platform,
                  isApproved: true,
                  ...(remoteEvent.location && { location: remoteEvent.location }),
                  ...(remoteEvent.isOnline !== undefined && { isOnline: remoteEvent.isOnline }),
                  ...(remoteEvent.bannerImage && { bannerImage: remoteEvent.bannerImage }),
                },
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          }
        } catch (error) {
          console.error(`Error fetching ${platform} events:`, error);
        }
      }

      // If still not found, create a placeholder
      if (!event) {
        event = await Event.create({
          platform,
          externalId,
          title: "Imported Event",
          description: "Auto-created from external source",
          start: new Date(),
          end: new Date(Date.now() + 3600 * 1000),
          source: platform,
          isApproved: platform === "organizer",
        });
      }

      eventIdentifier = event._id.toString();
    } else {
      // Plain externalId
      event = await Event.findOne({ externalId: rawId });
      if (!event) {
        event = await Event.create({
          externalId: rawId,
          platform: "manual",
          title: "Imported Event",
          description: "Auto-created from external source",
          start: new Date(),
          end: new Date(Date.now() + 3600 * 1000),
          isApproved: false,
        });
      }
      eventIdentifier = event._id.toString();
    }

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found / could not create" });
    }

    // Toggle bookmark - always use ObjectId string for comparison
    const eventIdStr = event._id.toString();
    const existingIndex = user.bookmarks.findIndex(
      bookmarkId => bookmarkId && bookmarkId.toString() === eventIdStr
    );

    let bookmarked;
    if (existingIndex >= 0) {
      // Remove bookmark
      user.bookmarks.splice(existingIndex, 1);
      bookmarked = false;
    } else {
      // Add bookmark - store as ObjectId
      user.bookmarks.push(event._id);
      bookmarked = true;
    }

    await user.save();

    return res.json({
      success: true,
      bookmarked,
      event: {
        _id: event._id,
        title: event.title,
        platform: event.platform,
        externalId: event.externalId,
        start: event.start,
        end: event.end,
        url: event.url,
        description: event.description,
        source: event.source
      }
    });

  } catch (err) {
    console.error("Bookmark error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

/**
 * ✅ Get user's bookmarked events
 * GET /api/events/me/bookmarks
 */
export async function myBookmarks(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Use populate to get the actual Event documents, not just ObjectIds
    const user = await User.findById(userId).populate('bookmarks');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const bookmarks = user.bookmarks || [];

    // If no bookmarks, return early
    if (!bookmarks.length) return res.json({ success: true, events: [] });

    // Since we used populate, bookmarks now contains actual Event documents
    // Filter out any null/undefined and map to the format we want
    const events = bookmarks
      .filter(event => event != null) // Remove any null bookmarks
      .map(event => ({
        _id: event._id,
        title: event.title,
        description: event.description || "",
        url: event.url || "",
        start: event.start,
        end: event.end,
        platform: event.platform,
        externalId: event.externalId,
        source: event.source,
        bannerImage: event.bannerImage || "",
        createdBy: event.createdBy,
        // Include any other fields you need
      }))
      .sort((a, b) => new Date(a.start) - new Date(b.start)); // Sort by start date

    return res.json({ success: true, events });
  } catch (err) {
    console.error("myBookmarks error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch bookmarks" });
  }
}

/**
 * ✅ Fetch saved events by ID or externalId
 * GET /api/events/saved?ids=abc,xyz
 */
export async function getSaved(req, res) {
  try {
    const { ids, limit = 50 } = req.query;

    if (ids) {
      const idList = ids.split(",").map((s) => s.trim()).filter(Boolean);

      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      const objectIds = idList.filter((id) => objectIdPattern.test(id));
      const externalIds = idList.filter((id) => !objectIdPattern.test(id));

      const conditions = [];
      if (objectIds.length) conditions.push({ _id: { $in: objectIds } });
      if (externalIds.length) conditions.push({ externalId: { $in: externalIds } });

      const events = await Event.find(conditions.length ? { $or: conditions } : {})
        .limit(Number(limit))
        .sort({ start: 1 });

      return res.json({ success: true, events });
    }

    const events = await Event.find({ isApproved: true })
      .limit(Number(limit))
      .sort({ start: 1 });

    res.json({ success: true, events });
  } catch (err) {
    console.error("getSaved error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch saved events" });
  }
}

/**
 * ✅ Get event by ID
 * GET /api/events/:id
 */
export async function getEventById(req, res) {
  try {
    const { id } = req.params;
    let ev = null;

    // 1) If valid ObjectId => findById
    if (mongoose.isValidObjectId(id)) {
      ev = await Event.findById(id).populate("createdBy", "name email role").lean();
      if (!ev) return res.status(404).json({ success: false, message: "Event not found" });

      // If event is pending and not createdBy current user (and not admin), block details
      if (ev.source === "organizer" && ev.status !== "approved") {
        const userId = req.user?.id || req.user?._id;
        const isCreator = userId && ev.createdBy && String(ev.createdBy._id) === String(userId);
        const isAdmin = req.user?.role === "admin";
        if (!isCreator && !isAdmin) {
          return res.status(403).json({ success: false, message: "Event is pending approval" });
        }
      }

      return res.json({ success: true, event: ev });
    }

    // 2) platform:externalId e.g. clist:12345, mlh:event_123
    if (id.includes(":")) {
      const [platform, externalId] = id.split(":");
      const doc = await Event.findOne({ platform, externalId }).populate("createdBy", "name email role").lean();
      if (doc) {
        if (doc.source === "organizer" && doc.status !== "approved") {
          const userId = req.user?.id || req.user?._id;
          const isCreator = userId && doc.createdBy && String(doc.createdBy._id) === String(userId);
          const isAdmin = req.user?.role === "admin";
          if (!isCreator && !isAdmin) {
            return res.status(403).json({ success: false, message: "Event is pending approval" });
          }
        }
        return res.json({ success: true, event: doc });
      }

      // fallback: for remote fetch by externalId
      if (platform === "clist" && typeof fetchClist === "function") {
        const remote = await fetchClist(externalId);
        if (remote) return res.json({ success: true, event: { ...remote, source: "clist" } });
      } else if (platform === "mlh") {
        const mlhEvents = await fetchMLHEvents();
        const remote = mlhEvents.find(event => event.event_id === externalId);
        if (remote) return res.json({ success: true, event: normalizeMLHEvent(remote) });
      }

      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // 3) try externalId search in DB (non-ObjectId)
    const byExternal = await Event.findOne({ externalId: id }).populate("createdBy", "name email role").lean();
    if (byExternal) {
      if (byExternal.source === "organizer" && byExternal.status !== "approved") {
        const userId = req.user?.id || req.user?._id;
        const isCreator = userId && byExternal.createdBy && String(byExternal.createdBy._id) === String(userId);
        const isAdmin = req.user?.role === "admin";
        if (!isCreator && !isAdmin) {
          return res.status(403).json({ success: false, message: "Event is pending approval" });
        }
      }
      return res.json({ success: true, event: byExternal });
    }

    return res.status(404).json({ success: false, message: "Event not found" });
  } catch (err) {
    console.error("Fetch event error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}