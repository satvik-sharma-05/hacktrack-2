import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Resolve current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Properly resolve absolute paths (cross-platform safe)
const CACHE_FILE = path.resolve(__dirname, "../../data/mlh_hackathons_cache.json");
const PYTHON_SCRIPT = join(__dirname, "mlh_scraper.py");
const CACHE_EXPIRY = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Fetch MLH hackathons, using cache if fresh.
 */
export async function fetchMLHEvents() {
  try {
    // Check if cached data exists
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      const age = Date.now() - data.timestamp * 1000;

      if (age < CACHE_EXPIRY) {
        console.log(`Using cached MLH data (${(age / 3600000).toFixed(1)} hours old)`);
        return data.events || [];
      }

      console.log("MLH cache expired — refreshing data...");
    } else {
      console.log("No MLH cache found — running scraper for fresh data...");
    }

    // Run the Python scraper
    await runPythonScraper();

    // Reload updated cache
    const freshData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    return freshData.events || [];
  } catch (err) {
    console.error("Error loading MLH cache:", err.message);
    return [];
  }
}

/**
 * Get MLH Cache Metadata (for /mlh/health)
 */
export function getMLHCacheMetadata() {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return { exists: false, lastUpdated: null, ageHours: null };
    }

    const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    const lastUpdated = new Date(data.timestamp * 1000);
    const ageMs = Date.now() - data.timestamp * 1000;
    const ageHours = (ageMs / 3600000).toFixed(2);

    return {
      exists: true,
      lastUpdated,
      ageHours,
      eventsCount: data.count || (data.events?.length || 0),
    };
  } catch (err) {
    console.error("Failed to read MLH cache metadata:", err.message);
    return { exists: false, lastUpdated: null, ageHours: null };
  }
}

/**
 * Normalize MLH event format to match the system schema.
 */
export function normalizeMLHEvent(event) {
  if (!event || !event.name) return null;

  const startDate = new Date(event.start_date || Date.now());
  const endDate = new Date(event.end_date || Date.now() + 3 * 86400000);

  return {
    _key: `mlh::${event.name.replace(/\s+/g, "_")}`,
    platform: "MLH",
    externalId: event.event_id || event.name,
    title: event.name,
    description: event.dates || "Hackathon by Major League Hacking",
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

/**
 * Run the Python MLH scraper script to refresh cache.
 */
function runPythonScraper() {
  return new Promise((resolve, reject) => {
    console.log("Running MLH Python scraper...");

    // Execute the Python script
    exec(`python "${PYTHON_SCRIPT}"`, { encoding: "utf-8" }, (error, stdout, stderr) => {
      if (error) {
        console.error("Python scraper error:", error.message);
        console.error(stderr);
        return reject(error);
      }

      console.log("Python scraper output:");
      console.log(stdout);
      resolve(stdout);
    });
  });
}
