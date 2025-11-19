import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CACHE_FILE = path.resolve(__dirname, "../../data/devpost_hackathons_cache.json");
const CACHE_EXPIRY = 6 * 60 * 60 * 1000; // 6 hours
let backgroundRefreshRunning = false;

export class DevpostService {
  constructor() {
    this.api_url = "https://devpost.com/api/hackathons";
    this.headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://devpost.com/hackathons",
      "Origin": "https://devpost.com",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin"
    };
  }

  async fetchHackathons(page = 1, per_page = 50) {
    const params = { 
      page: page.toString(), 
      per_page: per_page.toString(), 
      order_by: "submission_period_dates",
      challenge_type: "all"
    };

    console.log(`🔍 Fetching Devpost page ${page} with params:`, params);

    try {
      const response = await axios.get(this.api_url, {
        headers: this.headers,
        params,
        timeout: 15000,
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        }
      });

      console.log(`📡 Devpost API Response - Status: ${response.status}`);
      
      if (response.status !== 200) {
        console.error(`❌ Devpost API returned status ${response.status}:`, response.statusText);
        return null;
      }

      if (!response.data) {
        console.error('❌ No data in Devpost API response');
        return null;
      }

      const hackathons = response.data.hackathons || [];
      const meta = response.data.meta || {};
      
      console.log(`✅ Page ${page}: ${hackathons.length} hackathons, Total: ${meta.total_count || 'unknown'}`);

      if (hackathons.length > 0) {
        console.log('📋 Sample hackathon titles:', hackathons.slice(0, 3).map(h => h.title));
      }

      return response.data;

    } catch (error) {
      console.error(`❌ Error fetching Devpost page ${page}:`, {
        message: error.message,
        code: error.code,
        response: error.response?.data ? 'Received response data' : 'No response data',
        status: error.response?.status,
        headers: error.response?.headers
      });

      // Log the full error for debugging
      if (error.response) {
        console.error('🔍 Full error response:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
      }

      return null;
    }
  }

  parsePrizeAmount(prizeStr) {
    if (!prizeStr) return 0.0;
    try {
      // Remove HTML tags and currency symbols, then parse
      const clean = prizeStr.replace(/<[^>]+>/g, "")
                           .replace(/[$,€£¥,]/g, "")
                           .trim();
      const match = clean.match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : 0.0;
    } catch (error) {
      console.warn('⚠️ Could not parse prize amount:', prizeStr);
      return 0.0;
    }
  }

  parseDisplayedLocation(locationDict) {
    if (!locationDict || typeof locationDict !== 'object') return "Online";
    return locationDict.location || locationDict.name || "Online";
  }

  extractHackathonData(h) {
    try {
      const hackathon = {
        devpostId: h.id || h.devpostId,
        title: h.title || 'Untitled Hackathon',
        url: h.url || '',
        thumbnailUrl: h.thumbnail_url || h.thumbnailUrl,
        featured: h.featured || false,
        organizationName: h.organization_name || 'Unknown Organization',
        prizeAmount: this.parsePrizeAmount(h.prize_amount),
        prizeAmountRaw: h.prize_amount || '',
        registrationsCount: h.registrations_count || 0,
        submissionPeriodDates: h.submission_period_dates || '',
        themes: h.themes || [],
        isOnline: h.online || false,
        location: h.location || '',
        openState: h.open_state || 'unknown',
        description: h.tagline || h.description || '',
        timeLeftToSubmission: h.time_left_to_submission || '',
        submissionDeadline: h.submission_deadline || null,
        challengeType: h.challenge_type || '',
        eligibleCriteria: h.eligible_criteria || '',
        displayedLocation: this.parseDisplayedLocation(h.displayed_location),
        membersCount: h.members_count || 0,
        numWinnersPublished: h.num_winners_published || 0,
        bannerImageUrl: h.banner_image_url || '',
        lastUpdated: new Date(),
      };

      // Validate required fields
      if (!hackathon.devpostId) {
        console.warn('⚠️ Hackathon missing ID:', hackathon.title);
      }

      return hackathon;
    } catch (error) {
      console.error('❌ Error extracting hackathon data:', error);
      console.log('📋 Raw hackathon data:', h);
      return null;
    }
  }

  async scrapeAllHackathons(maxPages = 3) {
    console.log("🚀 Starting fresh Devpost hackathons scraping...");
    const hackathons = [];
    let page = 1;
    let totalScraped = 0;
    let consecutiveFailures = 0;

    while (page <= maxPages && consecutiveFailures < 2) {
      console.log(`\n🔹 Fetching Devpost page ${page}/${maxPages}...`);
      
      const data = await this.fetchHackathons(page);
      
      if (!data) {
        console.log(`❌ Failed to fetch page ${page}`);
        consecutiveFailures++;
        page++;
        continue;
      }

      const pageHackathons = data.hackathons || [];
      console.log(`📄 Found ${pageHackathons.length} hackathons on page ${page}`);

      if (pageHackathons.length === 0) {
        console.log(`❌ No hackathons found on page ${page}, stopping.`);
        break;
      }

      let pageValidCount = 0;
      for (const h of pageHackathons) {
        const extracted = this.extractHackathonData(h);
        if (extracted) {
          hackathons.push(extracted);
          totalScraped++;
          pageValidCount++;
        }
      }

      console.log(`✅ Added ${pageValidCount} valid hackathons from page ${page} (Total: ${totalScraped})`);
      
      consecutiveFailures = 0; // Reset failure counter on success
      
      // Check if we've reached the end
      const totalCount = data.meta?.total_count || 0;
      if (totalCount > 0 && totalScraped >= totalCount) {
        console.log(`🎯 Reached total count of ${totalCount}, stopping.`);
        break;
      }
      
      page++;
      
      // Add delay to be respectful to the API
      if (page <= maxPages) {
        console.log('⏳ Waiting 1 second before next page...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n🎯 FINAL: Scraped ${hackathons.length} valid hackathons from Devpost`);
    
    if (hackathons.length > 0) {
      console.log("📋 First 3 hackathons:");
      hackathons.slice(0, 3).forEach((h, i) => {
        console.log(`  ${i + 1}. ${h.title} (ID: ${h.devpostId})`);
      });
    } else {
      console.log("❌ No hackathons were scraped successfully");
    }

    return hackathons;
  }

  // Test method to verify API connectivity
  async testAPI() {
    console.log("🧪 Testing Devpost API connectivity...");
    try {
      const testData = await this.fetchHackathons(1, 3);
      if (testData && testData.hackathons && testData.hackathons.length > 0) {
        console.log("✅ Devpost API test successful!");
        return {
          success: true,
          hackathonsCount: testData.hackathons.length,
          sample: testData.hackathons.slice(0, 2)
        };
      } else {
        console.log("❌ Devpost API test failed - no data returned");
        return {
          success: false,
          error: "No data returned from API"
        };
      }
    } catch (error) {
      console.error("❌ Devpost API test failed with error:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/* ✅ Fetch Devpost Events (with Cache & Background Refresh) */
export async function fetchDevpostEvents() {
  try {
    const service = new DevpostService();

    // Use cache if it exists and is fresh
    if (fs.existsSync(CACHE_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
        const age = Date.now() - (data.timestamp * 1000);

        // Validate cache data structure
        if (!data.events || !Array.isArray(data.events)) {
          console.warn("⚠️ Invalid cache structure - events array missing or corrupted");
          // Delete invalid cache
          fs.unlinkSync(CACHE_FILE);
          console.log("🗑️ Deleted invalid cache file");
        } else if (age < CACHE_EXPIRY && data.events.length > 0) {
          console.log(`⚡ Using cached Devpost data (${data.events.length} events, ${(age / 3600000).toFixed(1)}h old)`);
          // Background refresh if halfway to expiry
          if (age > CACHE_EXPIRY / 2 && !backgroundRefreshRunning) {
            refreshDevpostCacheInBackground(service);
          }
          return data.events;
        } else if (data.events.length === 0) {
          console.warn("⚠️ Cache exists but contains 0 events - forcing refresh");
          // Delete empty cache
          fs.unlinkSync(CACHE_FILE);
        } else {
          console.log("⏰ Devpost cache expired — triggering background refresh...");
          if (!backgroundRefreshRunning) refreshDevpostCacheInBackground(service);
          return data.events; // serve old cache while refreshing
        }
      } catch (cacheError) {
        console.error("❌ Error reading cache file:", cacheError.message);
        // Delete corrupted cache
        try {
          fs.unlinkSync(CACHE_FILE);
          console.log("🗑️ Deleted corrupted cache file");
        } catch (unlinkError) {
          console.error("❌ Could not delete cache file:", unlinkError.message);
        }
      }
    }

    console.log("📂 No valid Devpost cache found — scraping fresh data...");
    const events = await service.scrapeAllHackathons(3);
    
    if (events.length === 0) {
      console.warn("⚠️ No events scraped from Devpost - API may be blocked");
      // Test API connectivity
      const apiTest = await service.testAPI();
      console.log("🔍 API Test Result:", apiTest);
    }
    
    saveCache(events);
    return events;
  } catch (err) {
    console.error("❌ Error in fetchDevpostEvents:", err.message);
    
    // Try to use fallback cache if available
    if (fs.existsSync(CACHE_FILE)) {
      try {
        const fallbackData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
        if (fallbackData.events && fallbackData.events.length > 0) {
          console.warn("⚠️ Using fallback Devpost cache despite errors");
          return fallbackData.events;
        }
      } catch (fallbackError) {
        console.error("❌ Fallback cache also corrupted:", fallbackError.message);
      }
    }
    
    return [];
  }
}

/* 🧠 Background Cache Refresh */
async function refreshDevpostCacheInBackground(serviceInstance) {
  if (backgroundRefreshRunning) {
    console.log("🔒 Background refresh already running, skipping...");
    return;
  }
  
  backgroundRefreshRunning = true;
  console.log("🔄 Background Devpost cache refresh started...");

  try {
    const events = await serviceInstance.scrapeAllHackathons(3);
    if (events.length > 0) {
      saveCache(events);
      console.log(`✅ Background Devpost cache updated (${events.length} events)`);
    } else {
      console.warn("⚠️ Background refresh resulted in 0 events - keeping old cache");
    }
  } catch (err) {
    console.error("❌ Background Devpost refresh failed:", err.message);
  } finally {
    backgroundRefreshRunning = false;
  }
}

/* 💾 Save Cache */
function saveCache(events) {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    const cacheData = {
      timestamp: Math.floor(Date.now() / 1000),
      count: events.length,
      events: events
    };
    
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify(cacheData, null, 2),
      "utf-8"
    );
    console.log(`💾 Devpost cache saved (${events.length} events)`);
    
    // Verify the cache was written correctly
    const verifyData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    if (verifyData.events.length === events.length) {
      console.log("✅ Cache verification successful");
    } else {
      console.error("❌ Cache verification failed - written data doesn't match");
    }
  } catch (error) {
    console.error("❌ Error saving Devpost cache:", error.message);
  }
}

/* 📊 Cache Metadata (for /health or monitoring) */
export function getDevpostCacheMetadata() {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return { 
        exists: false, 
        lastUpdated: null, 
        ageHours: null,
        eventsCount: 0,
        status: "missing"
      };
    }

    const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    const ageMs = Date.now() - data.timestamp * 1000;
    const ageHours = (ageMs / 3600000).toFixed(2);
    
    return {
      exists: true,
      lastUpdated: new Date(data.timestamp * 1000),
      ageHours: ageHours,
      eventsCount: data.count || data.events?.length || 0,
      status: data.events?.length > 0 ? "healthy" : "empty",
      isExpired: ageMs > CACHE_EXPIRY
    };
  } catch (err) {
    console.error("⚠️ Failed to read Devpost cache metadata:", err.message);
    return { 
      exists: false, 
      lastUpdated: null, 
      ageHours: null,
      eventsCount: 0,
      status: "corrupted"
    };
  }
}

/* 🧪 Test Endpoint Helper */
export async function testDevpostConnection() {
  const service = new DevpostService();
  return await service.testAPI();
}

/* 🔄 Force Cache Refresh */
export async function forceRefreshDevpostCache() {
  console.log("🔄 Manually forcing Devpost cache refresh...");
  
  // Delete existing cache file
  if (fs.existsSync(CACHE_FILE)) {
    try {
      fs.unlinkSync(CACHE_FILE);
      console.log("🗑️ Deleted existing cache file");
    } catch (error) {
      console.error("❌ Could not delete cache file:", error.message);
    }
  }
  
  const service = new DevpostService();
  const events = await service.scrapeAllHackathons(3);
  saveCache(events);
  
  return {
    success: events.length > 0,
    eventsCount: events.length,
    message: events.length > 0 ? 
      `Successfully refreshed cache with ${events.length} events` : 
      "Cache refresh completed but no events were found"
  };
}