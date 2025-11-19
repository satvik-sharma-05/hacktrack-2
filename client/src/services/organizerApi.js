// client/src/services/organizerApi.js
import api from "./api";

// Organizer Profile
export async function getOrganizerProfile() {
  try {
    const res = await api.get("/organizer/profile");
    console.log("📊 Profile response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Profile fetch error:", error.response?.data || error.message);
    throw error;
  }
}

export async function updateOrganizerProfile(payload) {
  try {
    const res = await api.put("/organizer/profile", payload);
    console.log("✏️ Profile update response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Profile update error:", error.response?.data || error.message);
    throw error;
  }
}

// Organizer Events
export async function createOrganizerEvent(payload) {
  try {
    const res = await api.post("/organizer/create", payload);
    console.log("✅ Event create response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Event create error:", error.response?.data || error.message);
    throw error;
  }
}

export async function getMyOrganizerEvents() {
  try {
    const res = await api.get("/organizer/my-events");
    console.log("📋 My events response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ My events fetch error:", error.response?.data || error.message);
    throw error;
  }
}

export async function getOrganizerEvent(id) {
  try {
    const res = await api.get(`/organizer/event/${id}`);
    console.log("🔍 Single event response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Single event fetch error:", error.response?.data || error.message);
    throw error;
  }
}

export async function updateOrganizerEvent(id, payload) {
  try {
    const res = await api.put(`/organizer/${id}`, payload);
    console.log("✏️ Event update response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Event update error:", error.response?.data || error.message);
    throw error;
  }
}

export async function deleteOrganizerEvent(id) {
  try {
    const res = await api.delete(`/organizer/${id}`);
    console.log("🗑️ Event delete response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Event delete error:", error.response?.data || error.message);
    throw error;
  }
}

// Dashboard Summary
export async function getOrganizerSummary() {
  try {
    const res = await api.get("/organizer/summary");
    console.log("📈 Summary response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Summary fetch error:", error.response?.data || error.message);
    throw error;
  }
}

// Admin functions (if needed)
export async function getPendingSubmissions() {
  try {
    const res = await api.get("/organizer/submissions");
    return res.data;
  } catch (error) {
    console.error("❌ Submissions fetch error:", error.response?.data || error.message);
    throw error;
  }
}

export async function approveEventApi(id, action) {
  try {
    const res = await api.put(`/organizer/events/${id}/approve`, { action });
    return res.data;
  } catch (error) {
    console.error("❌ Approve event error:", error.response?.data || error.message);
    throw error;
  }
}