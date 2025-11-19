import { useEffect, useState } from 'react';
import { fetchLiveEvents, bookmarkEvent, joinEvent } from '../api/events';
import { useAuth } from '../store/auth';
import { 
  FiCalendar, 
  FiMapPin, 
  FiClock, 
  FiBookmark, 
  FiUsers, 
  FiExternalLink,
  FiZap,
  FiFilter,
  FiSearch,
  FiTrendingUp,
  FiAward,
  FiStar,
  FiEye
} from 'react-icons/fi';

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('start');
    const [filterPlatform, setFilterPlatform] = useState('all');
    const [bookmarking, setBookmarking] = useState(null);
    const [joining, setJoining] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        loadEvents();
    }, []);

    useEffect(() => {
        filterAndSortEvents();
    }, [events, searchTerm, sortBy, filterPlatform]);

    async function loadEvents() {
        try {
            setLoading(true);
            const eventsData = await fetchLiveEvents({ sort: 'start', limit: 12 });
            setEvents(eventsData || []);
        } catch (error) {
            console.error('Failed to load events:', error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }

    function filterAndSortEvents() {
        let filtered = [...events];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(event => 
                event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.themes?.some(theme => theme.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Platform filter
        if (filterPlatform !== 'all') {
            filtered = filtered.filter(event => event.platform === filterPlatform);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'start':
                    return new Date(a.start) - new Date(b.start);
                case 'popular':
                    return (b.participantsCount || 0) - (a.participantsCount || 0);
                case 'prize':
                    return (b.prizeValue || 0) - (a.prizeValue || 0);
                default:
                    return 0;
            }
        });

        setFilteredEvents(filtered);
    }

    async function handleBookmark(eventId) {
        if (!user) return;
        setBookmarking(eventId);
        try {
            await bookmarkEvent(eventId);
            // Visual feedback
            setEvents(prev => prev.map(event => 
                event._id === eventId 
                    ? { ...event, bookmarked: !event.bookmarked }
                    : event
            ));
        } catch (error) {
            console.error('Bookmark failed:', error);
        } finally {
            setBookmarking(null);
        }
    }

    async function handleJoin(eventId) {
        if (!user) return;
        setJoining(eventId);
        try {
            await joinEvent(eventId);
            // Visual feedback
            setEvents(prev => prev.map(event => 
                event._id === eventId 
                    ? { ...event, joined: true, participantsCount: (event.participantsCount || 0) + 1 }
                    : event
            ));
        } catch (error) {
            console.error('Join failed:', error);
        } finally {
            setJoining(null);
        }
    }

    const platforms = [...new Set(events.map(event => event.platform).filter(Boolean))];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-cyan-300 font-mono text-lg animate-pulse">LOADING LIVE MISSIONS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            {/* Animated Background */}
            <div className="fixed inset-0 tron-grid animate-grid-flow pointer-events-none"></div>
            
            {/* Header */}
            <div className="relative max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 text-glow">
                            LIVE HACKATHONS
                        </h1>
                        <p className="text-cyan-200 font-mono text-sm tracking-wide">
                            REAL-TIME MISSION DEPLOYMENTS
                        </p>
                        <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-3 animate-subtle-pulse"></div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-cyan-300">
                            <FiZap className="text-lg animate-pulse" />
                            <span className="font-mono text-sm">{filteredEvents.length} ACTIVE</span>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard 
                        icon={FiTrendingUp}
                        label="Total Events"
                        value={events.length}
                        color="from-cyan-500 to-blue-500"
                    />
                    <StatCard 
                        icon={FiUsers}
                        label="Active Participants"
                        value={events.reduce((sum, event) => sum + (event.participantsCount || 0), 0)}
                        color="from-green-400 to-cyan-500"
                    />
                    <StatCard 
                        icon={FiAward}
                        label="Prize Pools"
                        value={`$${events.reduce((sum, event) => sum + (event.prizeValue || 0), 0).toLocaleString()}+`}
                        color="from-purple-500 to-pink-500"
                    />
                    <StatCard 
                        icon={FiStar}
                        label="Platforms"
                        value={platforms.length}
                        color="from-orange-400 to-red-400"
                    />
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8 p-6 tron-card rounded-xl">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search missions by title, description, or themes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder-gray-400 transition-all duration-300"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="relative">
                            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 text-sm" />
                            <select
                                value={filterPlatform}
                                onChange={(e) => setFilterPlatform(e.target.value)}
                                className="pl-10 pr-8 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white appearance-none cursor-pointer"
                            >
                                <option value="all">All Platforms</option>
                                {platforms.map(platform => (
                                    <option key={platform} value={platform}>
                                        {platform.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white cursor-pointer"
                        >
                            <option value="start">Sort by Date</option>
                            <option value="popular">Sort by Popularity</option>
                            <option value="prize">Sort by Prize</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            <div className="relative max-w-7xl mx-auto">
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-16 tron-card rounded-xl animate-fade-in">
                        <FiZap className="text-6xl text-gray-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-400 mb-2">NO MISSIONS FOUND</h3>
                        <p className="text-gray-500">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEvents.map((event, index) => (
                            <EventCard
                                key={event._id}
                                event={event}
                                index={index}
                                user={user}
                                onBookmark={handleBookmark}
                                onJoin={handleJoin}
                                bookmarking={bookmarking}
                                joining={joining}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="tron-card-glow p-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${color} text-white shadow-lg`}>
                    <Icon className="text-lg" />
                </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{label}</h3>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );
}

function EventCard({ event, index, user, onBookmark, onJoin, bookmarking, joining }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const platformColors = {
        devpost: 'from-blue-500 to-cyan-500',
        hackerearth: 'from-green-500 to-emerald-500',
        mlh: 'from-red-500 to-pink-500',
        default: 'from-purple-500 to-indigo-500'
    };

    const getPlatformColor = (platform) => {
        return platformColors[platform?.toLowerCase()] || platformColors.default;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeRemaining = (startDate) => {
        if (!startDate) return null;
        const now = new Date();
        const start = new Date(startDate);
        const diff = start - now;
        
        if (diff <= 0) return 'Started';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `in ${days}d ${hours}h`;
        return `in ${hours}h`;
    };

    return (
        <div 
            className="tron-card-glow p-4 animate-fade-in-up group cursor-pointer transform transition-all duration-500 hover:scale-105"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => window.open(event.url, '_blank')}
        >
            {/* Banner Image */}
            <div className="relative h-32 mb-4 rounded-xl overflow-hidden border border-cyan-500/20">
                {event.bannerImage && !imageError ? (
                    <img
                        src={event.bannerImage}
                        alt={event.title}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        } group-hover:scale-110`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getPlatformColor(event.platform)} flex items-center justify-center`}>
                        <FiZap className="text-white text-2xl" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Platform Badge */}
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-bold bg-gradient-to-r ${getPlatformColor(event.platform)} text-white rounded-full shadow-lg`}>
                        {event.platform?.toUpperCase() || 'HACK'}
                    </span>
                </div>

                {/* Time Badge */}
                {event.start && (
                    <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 text-xs font-bold bg-gray-900/80 text-cyan-300 rounded-full border border-cyan-500/30">
                            {getTimeRemaining(event.start)}
                        </span>
                    </div>
                )}
            </div>

            {/* Event Details */}
            <div className="space-y-3">
                <h3 className="font-bold text-white text-sm leading-tight group-hover:text-cyan-300 transition-colors duration-300 line-clamp-2">
                    {event.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                        <FiMapPin className="text-cyan-400" />
                        <span>{event.location || 'Online'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FiUsers className="text-green-400" />
                        <span>{event.participantsCount || 0}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-cyan-300">
                    <FiClock className="flex-shrink-0" />
                    <span>{formatDate(event.start)}</span>
                </div>

                {event.prize && (
                    <div className="flex items-center gap-2 text-xs text-yellow-400">
                        <FiAward className="flex-shrink-0" />
                        <span>{event.prize}</span>
                    </div>
                )}

                {/* Skills/Themes Tags */}
                {event.themes && event.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {event.themes.slice(0, 3).map((theme, idx) => (
                            <span 
                                key={idx}
                                className="px-2 py-1 text-xs bg-cyan-500/10 text-cyan-300 rounded-full border border-cyan-500/20"
                            >
                                {theme}
                            </span>
                        ))}
                        {event.themes.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-700 text-gray-400 rounded-full">
                                +{event.themes.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-cyan-500/20" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => window.open(event.url, '_blank')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 group"
                >
                    <FiExternalLink className="text-xs group-hover:scale-110 transition-transform" />
                    VIEW
                </button>

                {user && (
                    <>
                        <button
                            onClick={() => onBookmark(event._id)}
                            disabled={bookmarking === event._id}
                            className={`p-2 rounded-lg transition-all duration-300 ${
                                event.bookmarked 
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                                    : 'bg-gray-700 hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-400 border border-gray-600 hover:border-yellow-500/30'
                            } ${bookmarking === event._id ? 'animate-pulse' : ''}`}
                        >
                            <FiBookmark className={`text-sm ${event.bookmarked ? 'fill-current' : ''}`} />
                        </button>

                        <button
                            onClick={() => onJoin(event._id)}
                            disabled={joining === event._id || event.joined}
                            className={`p-2 rounded-lg transition-all duration-300 ${
                                event.joined
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-gray-700 hover:bg-green-500/20 text-gray-400 hover:text-green-400 border border-gray-600 hover:border-green-500/30'
                            } ${joining === event._id ? 'animate-pulse' : ''}`}
                        >
                            <FiUsers className="text-sm" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// Add these animations to your CSS
const dashboardAnimations = `
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = dashboardAnimations;
  document.head.appendChild(styleSheet);
}