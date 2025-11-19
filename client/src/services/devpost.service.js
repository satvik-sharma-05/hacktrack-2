import axios from 'axios';

export class DevpostService {
  constructor() {
    this.api_url = "https://devpost.com/api/hackathons";
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://devpost.com/hackathons'
    };
  }

  async fetchHackathons(page = 1, per_page = 50) {
    const params = {
      'page': page,
      'per_page': per_page,
      'order_by': 'submission_period_dates'
    };

    try {
      const response = await axios.get(this.api_url, {
        headers: this.headers,
        params: params,
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error.message);
      return null;
    }
  }

  parsePrizeAmount(prizeStr) {
    if (!prizeStr) return 0.0;

    let prize = String(prizeStr);
    prize = prize.replace(/<[^>]+>/g, '');
    prize = prize.replace(/[$€£,]/g, '').trim();

    try {
      return parseFloat(prize);
    } catch {
      return 0.0;
    }
  }

  parseDisplayedLocation(locationDict) {
    if (!locationDict) return "Online";
    return locationDict.location || "Online";
  }

  extractHackathonData(hackathon) {
    return {
      devpostId: hackathon.id,
      title: hackathon.title,
      url: hackathon.url,
      thumbnailUrl: hackathon.thumbnail_url,
      featured: hackathon.featured || false,
      organizationName: hackathon.organization_name,
      prizeAmount: this.parsePrizeAmount(hackathon.prize_amount),
      prizeAmountRaw: hackathon.prize_amount,
      registrationsCount: hackathon.registrations_count,
      submissionPeriodDates: hackathon.submission_period_dates,
      themes: hackathon.themes || [],
      isOnline: hackathon.online || false,
      location: hackathon.location,
      openState: hackathon.open_state,
      description: hackathon.tagline || hackathon.description || '',
      timeLeftToSubmission: hackathon.time_left_to_submission,
      submissionDeadline: hackathon.submission_deadline,
      challengeType: hackathon.challenge_type,
      eligibleCriteria: hackathon.eligible_criteria,
      displayedLocation: this.parseDisplayedLocation(hackathon.displayed_location),
      membersCount: hackathon.members_count,
      numWinnersPublished: hackathon.num_winners_published,
      bannerImageUrl: hackathon.banner_image_url,
      lastUpdated: new Date()
    };
  }

  async scrapeAllHackathons(maxPages = 5) {
    console.log("Starting Devpost hackathons scraping...");
    const hackathons = [];
    let page = 1;
    let totalScraped = 0;

    while (true) {
      if (maxPages && page > maxPages) break;

      console.log(`Fetching page ${page}...`);
      const data = await this.fetchHackathons(page);

      if (!data) break;

      const pageHackathons = data.hackathons || [];

      if (!pageHackathons.length) break;

      for (const hackathon of pageHackathons) {
        const extracted = this.extractHackathonData(hackathon);
        hackathons.push(extracted);
        totalScraped++;
      }

      console.log(`Scraped ${pageHackathons.length} hackathons from page ${page} (Total: ${totalScraped})`);

      const meta = data.meta || {};
      const totalCount = meta.total_count || 0;

      if (totalScraped >= totalCount) break;
      page++;
    }

    console.log(`Total hackathons scraped: ${hackathons.length}`);
    return hackathons;
  }

  getStatistics(hackathons) {
    if (!hackathons.length) return {};

    const total = hackathons.length;
    const online = hackathons.filter(h => h.isOnline).length;
    const featured = hackathons.filter(h => h.featured).length;

    const states = {};
    hackathons.forEach(h => {
      const state = h.openState || 'unknown';
      states[state] = (states[state] || 0) + 1;
    });

    const totalPrizes = hackathons.reduce((sum, h) => sum + (h.prizeAmount || 0), 0);
    const totalRegistrations = hackathons.reduce((sum, h) => sum + (parseInt(h.registrationsCount) || 0), 0);

    return {
      totalHackathons: total,
      onlineHackathons: online,
      inPersonHackathons: total - online,
      featuredHackathons: featured,
      states,
      totalPrizeMoney: totalPrizes,
      totalRegistrations
    };
  }
}