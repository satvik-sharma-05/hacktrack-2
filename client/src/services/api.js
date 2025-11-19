// src/services/api.js
import axios from "axios";

// ✅ Create reusable axios instance with proper configuration
const getBaseURL = () => {
  // Check if we're in development or production
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
  }
  return import.meta.env.VITE_API_BASE || "/api"; // Relative path for production
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// ✅ Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ✅ Enhanced response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error("❌ API Response Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/login";
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error("🌐 Network error - server may be down");
    }
    
    return Promise.reject(error);
  }
);

//
// ====================
// 🔹 EVENTS API - ENHANCED WITH MLH
// ====================

/**
 * Fetch events from all sources including MLH with better error handling
 */
export async function fetchLiveEvents(params = {}) {
  try {
    console.log("🌐 Fetching live events with params:", params);
    
    const resp = await api.get("/events/live", { 
      params,
      timeout: 15000 // 15 second timeout for events
    });
    
    console.log("📡 RAW API RESPONSE - Status:", resp.status);
    
    if (!resp.data?.success) {
      console.warn("⚠️ API returned non-success response:", resp.data);
      throw new Error(resp.data?.message || resp.data?.error || "Failed to fetch events");
    }

    const events = resp.data.events || [];
    console.log(`✅ Total events received: ${events.length}`);
    
    // Enhanced analysis with MLH support
    if (events.length > 0) {
      const sourceCount = events.reduce((acc, event) => {
        acc[event.source] = (acc[event.source] || 0) + 1;
        return acc;
      }, {});
      console.log("📊 Events by source:", sourceCount);
      
      // Check event structure
      console.log("🔍 First event sample:", {
        title: events[0].title,
        source: events[0].source,
        platform: events[0].platform,
        start: events[0].start
      });
    } else {
      console.warn("⚠️ No events received from API");
    }

    return {
      events: events,
      statistics: resp.data.statistics || {},
      total: resp.data.total || 0,
      page: resp.data.page || 1,
      limit: resp.data.limit || 24,
      count: resp.data.count || 0,
      sources: resp.data.sources || {} // Include source breakdown
    };
    
  } catch (error) {
    console.error("❌ Fetch live events error:", {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });
    
    // Provide more user-friendly error messages
    if (error.code === 'ECONNABORTED') {
      throw new Error("Request timeout - server is taking too long to respond");
    } else if (!error.response) {
      throw new Error("Cannot connect to server. Please check if the backend is running.");
    } else {
      throw new Error(`Failed to load events: ${error.message}`);
    }
  }
}

/**
 * Fetch events specifically from MLH
 */
export async function fetchMLHEvents(params = {}) {
  try {
    const resp = await api.get("/events/mlh", { 
      params,
      timeout: 10000 
    });
    
    if (!resp.data?.success) {
      console.warn("MLH API warning:", resp.data);
      return {
        events: [],
        statistics: {},
        total: 0,
        source: 'mlh'
      };
    }

    return {
      events: resp.data.events || [],
      statistics: resp.data.statistics || {},
      total: resp.data.total || 0,
      source: resp.data.source || 'mlh'
    };
  } catch (error) {
    console.error("❌ Fetch MLH events error:", error.message);
    return {
      events: [],
      statistics: {},
      total: 0,
      source: 'mlh'
    };
  }
}

/**
 * Fetch events specifically from Devpost with fallback
 */
export async function fetchDevpostEvents(params = {}) {
  try {
    const resp = await api.get("/events/devpost", { 
      params,
      timeout: 10000 
    });
    
    if (!resp.data?.success) {
      console.warn("Devpost API warning:", resp.data);
      return {
        events: [],
        statistics: {},
        total: 0,
        source: 'devpost'
      };
    }

    return {
      events: resp.data.events || [],
      statistics: resp.data.statistics || {},
      total: resp.data.total || 0,
      source: resp.data.source || 'devpost'
    };
  } catch (error) {
    console.error("❌ Fetch Devpost events error:", error.message);
    return {
      events: [],
      statistics: {},
      total: 0,
      source: 'devpost'
    };
  }
}

/**
 * Fetch events by specific source
 */
export async function fetchEventsBySource(source, params = {}) {
  try {
    const validSources = ['devpost', 'mlh', 'clist', 'organizer'];
    
    if (!validSources.includes(source)) {
      throw new Error(`Invalid source: ${source}. Must be one of: ${validSources.join(', ')}`);
    }

    const resp = await api.get(`/events/${source}`, { 
      params,
      timeout: 10000 
    });
    
    if (!resp.data?.success) {
      console.warn(`${source} API warning:`, resp.data);
      return {
        events: [],
        statistics: {},
        total: 0,
        source: source
      };
    }

    return {
      events: resp.data.events || [],
      statistics: resp.data.statistics || {},
      total: resp.data.total || 0,
      source: resp.data.source || source
    };
  } catch (error) {
    console.error(`❌ Fetch ${source} events error:`, error.message);
    return {
      events: [],
      statistics: {},
      total: 0,
      source: source
    };
  }
}

/**
 * Get MLH service health status
 */
export async function fetchMLHHealth() {
  try {
    const resp = await api.get("/events/mlh/health", { timeout: 5000 });
    
    if (!resp.data?.success) {
      return {
        service: 'MLH',
        status: 'unknown',
        lastChecked: new Date().toISOString()
      };
    }

    return resp.data.health || {
      service: 'MLH',
      status: 'unknown',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    console.error("❌ Fetch MLH health error:", error.message);
    return {
      service: 'MLH',
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }
}

/**
 * Get comprehensive event statistics with fallback
 */
export async function fetchEventStatistics() {
  try {
    const resp = await api.get("/events/statistics", { timeout: 8000 });
    
    if (!resp.data?.success) {
      console.warn("Statistics API warning:", resp.data);
      return getFallbackStatistics();
    }

    return resp.data.statistics || getFallbackStatistics();
  } catch (error) {
    console.error("❌ Fetch event statistics error:", error.message);
    return getFallbackStatistics();
  }
}

// Fallback statistics when API fails
function getFallbackStatistics() {
  return {
    total: 0,
    upcoming: 0,
    ongoing: 0,
    online: 0,
    byPlatform: {},
    bySource: {}
  };
}

/**
 * Create personal/organizer event
 */
export async function createPersonalEvent(eventData) {
  try {
    const resp = await api.post("/events/personal", eventData, { timeout: 10000 });
    
    if (!resp.data?.success) {
      throw new Error(resp.data?.message || "Failed to create event");
    }

    return resp.data;
  } catch (error) {
    console.error("❌ Create personal event error:", error.message);
    throw error;
  }
}

/**
 * Get event by ID with support for all platforms
 */
export async function fetchEventById(eventId) {
  try {
    const resp = await api.get(`/events/${eventId}`, { timeout: 8000 });
    
    if (!resp.data?.success) {
      throw new Error(resp.data?.message || "Event not found");
    }

    return resp.data.event;
  } catch (error) {
    console.error("❌ Fetch event by ID error:", error.message);
    throw error;
  }
}

/**
 * Search events across all platforms
 */
export async function searchEvents(searchParams) {
  try {
    const resp = await api.get("/events", { 
      params: searchParams,
      timeout: 10000 
    });
    
    if (!resp.data?.success) {
      throw new Error(resp.data?.message || "Search failed");
    }

    return {
      events: resp.data.events || [],
      total: resp.data.total || 0,
      page: resp.data.page || 1,
      totalPages: resp.data.totalPages || 1
    };
  } catch (error) {
    console.error("❌ Search events error:", error.message);
    throw error;
  }
}

//
// ====================
// 🔹 USER & AUTH - ENHANCED
// ====================
export async function fetchMyProfile() {
  try {
    const res = await api.get("/users/profile", { timeout: 8000 });
    return res.data.user;
  } catch (err) {
    console.error("Fetch profile error:", err.message);
    throw err;
  }
}

export async function updateMyProfile(data) {
  try {
    const res = await api.put("/users/profile", data);
    return res.data.user;
  } catch (err) {
    console.error("Update profile error:", err.message);
    throw err;
  }
}

export async function getUserPublic(userId) {
  try {
    const resp = await api.get(`/users/${userId}`, { timeout: 8000 });
    return resp.data?.user || null;
  } catch (err) {
    console.error("Public user fetch error:", err.message);
    throw err;
  }
}

//
// ====================
// 🔹 BOOKMARKS & PARTICIPATION - ENHANCED
// ====================
export async function toggleBookmark(eventId) {
  try {
    const resp = await api.post(`/events/${eventId}/bookmark`, {}, { timeout: 5000 });
    return resp.data;
  } catch (error) {
    console.error("Toggle bookmark error:", error.message);
    throw error;
  }
}

export async function fetchMyBookmarks() {
  try {
    const resp = await api.get("/events/me/bookmarks", { timeout: 8000 });
    console.log("Bookmarks API response:", resp.data);
    return resp.data?.events || [];
  } catch (error) {
    console.error("Fetch bookmarks error:", error.message);
    return [];
  }
}

export async function fetchMyParticipations() {
  try {
    const resp = await api.get("/participation/my", { timeout: 8000 });
    return resp.data?.participations || [];
  } catch (error) {
    console.error("Fetch participations error:", error.message);
    return [];
  }
}

/**
 * Fetch saved events by IDs
 */
export async function fetchSavedEvents(eventIds = []) {
  try {
    const idsParam = eventIds.join(',');
    const resp = await api.get("/events/saved", { 
      params: { ids: idsParam },
      timeout: 8000 
    });
    
    if (!resp.data?.success) {
      return [];
    }

    return resp.data.events || [];
  } catch (error) {
    console.error("❌ Fetch saved events error:", error.message);
    return [];
  }
}

//
// ====================
// 🔹 AI TEAMMATE FINDER - ENHANCED
// ====================
export async function findTeammates(payload) {
  try {
    if (!payload?.query || payload.query.trim() === "") {
      throw new Error("Search query cannot be empty");
    }

    const res = await api.post("/teammates/find", payload, { timeout: 10000 });

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Search failed");
    }

    return {
      results: res.data.results || [],
      count: res.data.count || 0,
      totalMatches: res.data.totalMatches || 0,
      message: res.data.message
    };

  } catch (err) {
    console.error("❌ Find teammates error:", err.message);
    throw err;
  }
}

export async function getRecommendedTeammates(filters = {}) {
  try {
    const res = await api.post("/teammates/recommend", { filters }, { timeout: 10000 });
    
    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to get recommendations");
    }

    return res.data.recommended || [];
  } catch (err) {
    console.error("❌ Recommendation fetch error:", err.message);
    throw err;
  }
}

export async function getAutoTeams() {
  try {
    const res = await api.get("/teammates/form-teams", { timeout: 15000 });
    return res.data.teams || [];
  } catch (err) {
    console.error("Auto team generation error:", err.message);
    throw err;
  }
}

//
// ====================
// 🔹 HEALTH CHECK & MONITORING
// ====================
export async function checkServerHealth() {
  try {
    const resp = await api.get("/health", { timeout: 5000 });
    return resp.data;
  } catch (error) {
    console.error("Server health check failed:", error.message);
    return { status: "down", message: error.message };
  }
}

/**
 * Check all service health statuses
 */
export async function checkAllServicesHealth() {
  try {
    const [serverHealth, mlhHealth] = await Promise.allSettled([
      checkServerHealth(),
      fetchMLHHealth()
    ]);

    return {
      server: serverHealth.status === 'fulfilled' ? serverHealth.value : { status: 'down' },
      mlh: mlhHealth.status === 'fulfilled' ? mlhHealth.value : { status: 'down' },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("❌ Check all services health error:", error.message);
    return {
      server: { status: 'unknown' },
      mlh: { status: 'unknown' },
      timestamp: new Date().toISOString()
    };
  }
}

//
// ====================
// 🔹 UTILITY FUNCTIONS
// ====================

/**
 * Generate event filters for API calls
 */
export function generateEventFilters(filters = {}) {
  const {
    platform,
    status,
    type,
    search,
    timeframe,
    location,
    page = 1,
    limit = 24,
    ...rest
  } = filters;

  const apiFilters = {
    page,
    limit,
    ...rest
  };

  // Add filters only if they have values
  if (platform && platform !== 'all') apiFilters.platform = platform;
  if (status && status !== 'all') apiFilters.status = status;
  if (type && type !== 'all') apiFilters.type = type;
  if (search) apiFilters.q = search;
  if (timeframe && timeframe !== 'all') apiFilters.timeframe = timeframe;
  if (location && location !== 'all') apiFilters.location = location;

  return apiFilters;
}

/**
 * Normalize event data for consistent frontend usage
 */
export function normalizeEvent(event) {
  if (!event) return null;

  return {
    id: event._id || event.id || event.externalId,
    title: event.title || 'Untitled Event',
    description: event.description || '',
    platform: event.platform || event.source,
    source: event.source,
    url: event.url || '',
    start: event.start ? new Date(event.start) : null,
    end: event.end ? new Date(event.end) : null,
    location: event.location || 'Online',
    isOnline: event.isOnline || false,
    prize: event.prize || 0,
    registrations: event.registrations || 0,
    status: event.status || 'unknown',
    isFeatured: event.isFeatured || false,
    bannerImage: event.bannerImage || event.thumbnail || '',
    organizer: event.organizer || event.organizerRef || event.organizationName,
    type: event.type || 'hackathon',
    // MLH specific fields
    ...(event.mlhEventId && { mlhEventId: event.mlhEventId }),
    ...(event.diversityEvent && { diversityEvent: event.diversityEvent }),
    ...(event.highSchoolEvent && { highSchoolEvent: event.highSchoolEvent }),
    // Devpost specific fields
    ...(event.devpostId && { devpostId: event.devpostId }),
    ...(event.prizeAmount && { prizeAmount: event.prizeAmount }),
    // Common fields
    _key: event._key,
    externalId: event.externalId,
    isApproved: event.isApproved !== false
  };
}

/**
 * Batch normalize events
 */
export function normalizeEvents(events = []) {
  return events.map(normalizeEvent).filter(event => event !== null);
}

// Export api instance
export default api;
export { api };