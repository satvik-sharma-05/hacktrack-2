export function normalizeMLHEvent(event) {
  if (!event || !event.name) return null;

  const startDate = new Date(event.start_date || Date.now());
  const endDate = new Date(event.end_date || Date.now() + 3 * 86400000);

  return {
    _key: `mlh::${event.name.replace(/\s+/g, "_")}`,
    platform: "MLH",
    externalId: event.event_id || event.name,
    title: event.name,
    description:
      event.dates ||
      `${event.name} - Hackathon by Major League Hacking`,

    url: event.url || "",
    start: isNaN(startDate) ? new Date() : startDate,
    end: isNaN(endDate) ? new Date(Date.now() + 3 * 86400000) : endDate,
    source: "mlh",
    bannerImage: event.backsplash_image || event.image || "",
    logoImage: event.logo_image || "",
    location: event.location || "Online",
    eventType: event.event_type || "Unknown",
    isOnline: (event.location || "").toLowerCase().includes("online"),
    isApproved: true,
  };
}
