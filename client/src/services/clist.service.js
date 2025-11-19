import axios from 'axios';

export class ClistService {
  constructor() {
    this.apiUrl = 'https://clist.by/api/v2/contest';
    this.username = process.env.CLIST_USERNAME;
    this.apiKey = process.env.CLIST_API_KEY;
    
    if (!this.username || !this.apiKey) {
      console.warn('CLIST credentials not found. CLIST integration will be disabled.');
    }
  }

  async getCompetitions(filters = {}) {
    // If no credentials, return empty array
    if (!this.username || !this.apiKey) {
      console.warn('CLIST credentials missing. Returning empty results.');
      return [];
    }

    try {
      const params = {
        username: this.username,
        api_key: this.apiKey,
        limit: filters.limit || 50,
        order_by: '-start'
      };

      // Add date filters
      const now = new Date().toISOString();
      if (filters.timeframe === 'upcoming') {
        params.start__gt = now;
      } else if (filters.timeframe === 'ongoing') {
        params.start__lt = now;
        params.end__gt = now;
      } else if (filters.timeframe === 'past') {
        params.end__lt = now;
      }

      // Platform filtering
      if (filters.platform && filters.platform !== 'all') {
        params.resource__name__iregex = filters.platform;
      }

      const response = await axios.get(this.apiUrl, { 
        params,
        timeout: 15000 
      });

      if (!response.data || !Array.isArray(response.data.objects)) {
        throw new Error('Invalid response format from CLIST API');
      }

      return response.data.objects;

    } catch (error) {
      console.error('CLIST API Error:', error.message);
      throw new Error(`CLIST API unavailable: ${error.message}`);
    }
  }
}