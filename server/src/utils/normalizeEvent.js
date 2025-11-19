// src/utils/normalizeEvent.js

export function normalizeEvent(event) {
  // Simple normalization for database operations
  return {
    type: event.type || 'api',
    platform: event.platform,
    externalId: event.externalId || event.id || event.external_id || `${event.platform}_${Date.now()}`,
    title: event.title || 'Untitled Event',
    url: event.url || '',
    description: event.description || '',
    start: event.start ? new Date(event.start) : new Date(),
    end: event.end ? new Date(event.end) : null,
    location: event.location || 'online',
    organizer: event.organizer || event.organizationName || '',
    prize: event.prize || event.prizeAmount || 0,
    prizeType: event.prizeType || 'unknown',
    themes: Array.isArray(event.themes) ? event.themes : [],
    skills: Array.isArray(event.skills) ? event.skills : [],
    isApproved: event.isApproved !== undefined ? event.isApproved : true,
  };
}