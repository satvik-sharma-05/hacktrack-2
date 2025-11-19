import { DevpostService } from './devpost.service.js';
import { ClistService } from './clist.js';

export class EventService {
    constructor() {
        this.devpostService = new DevpostService();
        this.clistService = new ClistService();
    }

    async getAllEvents(filters = {}) {
        try {
            // Fetch from multiple sources in parallel
            const [devpostEvents, clistEvents, personalEvents] = await Promise.all([
                this.devpostService.scrapeAllHackathons(filters.maxPages || 3),
                this.clistService.getCompetitions(filters),
                this.getPersonalEvents(filters)
            ]);

            // Merge and normalize events
            const allEvents = [
                ...this.normalizeDevpostEvents(devpostEvents),
                ...this.normalizeClistEvents(clistEvents),
                ...personalEvents
            ];

            // Apply filters
            return this.applyFilters(allEvents, filters);
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    }

    normalizeDevpostEvents(devpostEvents) {
        return devpostEvents.map(event => ({
            id: `devpost_${event.devpostId}`,
            title: event.title,
            description: event.description,
            platform: 'Devpost',
            url: event.url,
            start: event.submissionDeadline ? new Date(event.submissionDeadline) : null,
            end: event.submissionDeadline ? new Date(event.submissionDeadline) : null,
            location: event.displayedLocation,
            isOnline: event.isOnline,
            prize: event.prizeAmount,
            registrations: event.registrationsCount,
            status: this.mapDevpostStatus(event.openState),
            isFeatured: event.featured,
            thumbnail: event.thumbnailUrl,
            organization: event.organizationName,
            type: 'hackathon',
            source: 'devpost'
        }));
    }

    normalizeClistEvents(clistEvents) {
        return clistEvents.map(event => ({
            id: `clist_${event.id}`,
            title: event.event || event.title,
            description: event.description,
            platform: event.resource?.name || 'Unknown',
            url: event.href,
            start: new Date(event.start),
            end: new Date(event.end),
            location: 'Online', // CLIST events are typically online
            isOnline: true,
            prize: 0,
            registrations: 0,
            status: this.mapClistStatus(event.start, event.end),
            isFeatured: false,
            thumbnail: null,
            organization: event.resource?.name,
            type: 'competition',
            source: 'clist'
        }));
    }

    async getPersonalEvents(filters = {}) {
        // This would fetch user's personal/organized events from database
        // For now, return empty array
        return [];
    }

    mapDevpostStatus(openState) {
        const statusMap = {
            'open': 'ongoing',
            'upcoming': 'upcoming',
            'ended': 'completed'
        };
        return statusMap[openState] || 'unknown';
    }

    mapClistStatus(start, end) {
        const now = new Date();
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (now < startDate) return 'upcoming';
        if (now >= startDate && now <= endDate) return 'ongoing';
        return 'completed';
    }

    applyFilters(events, filters) {
        let filtered = [...events];

        if (filters.platform && filters.platform !== 'all') {
            filtered = filtered.filter(event =>
                event.platform?.toLowerCase() === filters.platform.toLowerCase()
            );
        }

        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(event =>
                event.status?.toLowerCase() === filters.status.toLowerCase()
            );
        }

        if (filters.type && filters.type !== 'all') {
            filtered = filtered.filter(event =>
                event.type?.toLowerCase() === filters.type.toLowerCase()
            );
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(event =>
                event.title?.toLowerCase().includes(searchLower) ||
                event.description?.toLowerCase().includes(searchLower) ||
                event.platform?.toLowerCase().includes(searchLower) ||
                event.organization?.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }

    async getEventStatistics() {
        const events = await this.getAllEvents({ maxPages: 2 });

        const total = events.length;
        const byPlatform = this.groupByPlatform(events);
        const byStatus = this.groupByStatus(events);
        const byType = this.groupByType(events);

        return {
            total,
            byPlatform,
            byStatus,
            byType,
            upcoming: events.filter(e => e.status === 'upcoming').length,
            ongoing: events.filter(e => e.status === 'ongoing').length,
            online: events.filter(e => e.isOnline).length
        };
    }

    groupByPlatform(events) {
        return events.reduce((acc, event) => {
            const platform = event.platform || 'Unknown';
            acc[platform] = (acc[platform] || 0) + 1;
            return acc;
        }, {});
    }

    groupByStatus(events) {
        return events.reduce((acc, event) => {
            const status = event.status || 'unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
    }

    groupByType(events) {
        return events.reduce((acc, event) => {
            const type = event.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
    }
}