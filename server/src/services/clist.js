// src/services/clist.js
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { normalizeEvent } from "../utils/normalizeEvent.js";
import { config } from "../config/env.js";

const CACHE_PATH = path.join(process.cwd(), "src/cache/clist_cache.json");
const CACHE_TTL_HOURS = 6;

export async function fetchClist() {
  try {
    // 1️⃣ Check for cached data
    const now = Date.now();
    if (fs.existsSync(CACHE_PATH)) {
      const stat = fs.statSync(CACHE_PATH);
      const ageHours = (now - stat.mtimeMs) / (1000 * 60 * 60);
      if (ageHours < CACHE_TTL_HOURS) {
        const cached = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
        if (Array.isArray(cached) && cached.length > 0) {
          console.log(`⚡ Using cached CLIST data (${cached.length} events, ${ageHours.toFixed(1)}h old)`);
          return cached;
        }
      }
    }

    // 2️⃣ Live Fetch
    const url = `https://clist.by/api/v4/contest/?limit=100&upcoming=true&format_time=iso&username=${config.CLIST_USERNAME}&api_key=${config.CLIST_API_KEY}`;
    console.log("🌐 Contacting CLIST API...");

    const res = await fetch(url);
    const data = await res.json();

    if (!data.objects) {
      console.log("❌ No objects returned from CLIST:", data);
      return [];
    }

    const events = data.objects.map(c =>
      normalizeEvent({
        platform: "clist", // fixed
        source: "clist", // added
        externalId: c.id.toString(),
        title: c.event || "Untitled Event",
        url: c.href,
        start: c.start,
        end: c.end,
        organizer: c.host || c.resource?.name,
        location: "Online",
        resource: c.resource?.name || "",
      })
    );

    console.log(`✅ CLIST returned ${events.length} events`);

    // 3️⃣ Cache result for faster future loads
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(events, null, 2));

    return events;
  } catch (err) {
    console.error("❌ fetchClist() failed:", err.message);
    return [];
  }
}
