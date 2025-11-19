// src/pages/EventsPage.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import EventCard from "../components/events/EventCard";
import {
  FiSearch,
  FiFilter,
  FiCalendar,
  FiMapPin,
  FiZap,
  FiRefreshCw,
  FiPlus,
  FiDatabase,
  FiGlobe,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiPlay,
  FiPause
} from "react-icons/fi";
import { FaBolt, FaRobot, FaNetworkWired } from "react-icons/fa";
import { fetchLiveEvents, fetchEventStatistics } from "../services/api";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statistics, setStatistics] = useState(null);
  
  // Video background state
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [totalEvents, setTotalEvents] = useState(0);

  const [filters, setFilters] = useState({
    platform: "all",
    timeframe: "all",
    status: "all",
    location: "all",
    type: "all",
    source: "all"
  });

  const [sortBy, setSortBy] = useState("start");

  // Use ref to track initial load
  const initialLoadRef = useRef(true);

  // Memoized computations
  const platforms = useMemo(() =>
    [...new Set(events.map(e => e.platform).filter(Boolean))], [events]
  );

  const sources = useMemo(() =>
    [...new Set(events.map(e => e.source).filter(Boolean))], [events]
  );

  // Calculate real-time statistics from current events
  const realTimeStats = useMemo(() => {
    const now = new Date();

    const upcoming = events.filter(event =>
      event.start && new Date(event.start) > now
    ).length;

    const ongoing = events.filter(event => {
      if (!event.start) return false;
      const start = new Date(event.start);
      const end = event.end ? new Date(event.end) : null;
      return start <= now && (!end || end >= now);
    }).length;

    const online = events.filter(event => event.isOnline).length;

    const byPlatform = events.reduce((acc, event) => {
      if (event.platform) {
        acc[event.platform] = (acc[event.platform] || 0) + 1;
      }
      return acc;
    }, {});

    const bySource = events.reduce((acc, event) => {
      if (event.source) {
        acc[event.source] = (acc[event.source] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      total: events.length,
      upcoming,
      ongoing,
      online,
      byPlatform,
      bySource
    };
  }, [events]);

  // Fetch Events - useCallback with proper dependencies
  const fetchEvents = useCallback(async (page = currentPage, limit = itemsPerPage) => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔄 Fetching events from all sources...", { page, limit });
      const data = await fetchLiveEvents({
        page: page,
        limit: limit
      });

      console.log("📊 Events data received:", {
        total: data.total,
        count: data.count,
        sources: data.sources,
        eventsCount: data.events?.length
      });

      setEvents(data.events || []);
      setTotalEvents(data.total || 0);

      // Use API statistics if available, otherwise use real-time stats
      if (data.statistics && Object.keys(data.statistics).length > 0) {
        console.log("📈 Using API statistics");
        setStatistics(data.statistics);
      } else {
        console.log("📊 Using real-time statistics");
        setStatistics(realTimeStats);
      }

    } catch (err) {
      console.error("❌ Fetch events error:", err);
      setError(err.message);
      setStatistics(realTimeStats);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, realTimeStats]);

  // Fetch Stats separately
  const fetchStats = useCallback(async () => {
    try {
      console.log("📈 Fetching statistics...");
      const stats = await fetchEventStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error("❌ Fetch statistics error:", err);
      setStatistics(realTimeStats);
    }
  }, [realTimeStats]);

  // Initial Load - only run once
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      fetchEvents(1, itemsPerPage);
    }
  }, []); // Empty dependency array - only run on mount

  // Refetch when pagination changes - fixed version
  useEffect(() => {
    if (!initialLoadRef.current) {
      console.log("📄 Pagination changed, fetching page:", currentPage);
      fetchEvents(currentPage, itemsPerPage);
    }
  }, [currentPage, itemsPerPage]); // Only depend on pagination state

  // Update stats when events change significantly
  useEffect(() => {
    if (events.length > 0 && (!statistics || statistics.total !== events.length)) {
      setStatistics(realTimeStats);
    }
  }, [events, statistics, realTimeStats]);

  // Filter & Sort - separate from data fetching
  useEffect(() => {
    const now = new Date();
    const filtered = events.filter(event => {
      // Search filter
      if (searchTerm && ![
        event.title,
        event.description,
        event.platform,
        event.organizationName,
        event.organization,
        event.organizerRef
      ].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }

      // Platform filter
      if (filters.platform !== "all" && event.platform?.toLowerCase() !== filters.platform.toLowerCase()) {
        return false;
      }

      // Source filter
      if (filters.source !== "all" && event.source?.toLowerCase() !== filters.source.toLowerCase()) {
        return false;
      }

      // Timeframe filter
      if (filters.timeframe === "upcoming" && (!event.start || new Date(event.start) <= now)) {
        return false;
      }
      if (filters.timeframe === "ongoing" && (
        !event.start ||
        new Date(event.start) > now ||
        (event.end && new Date(event.end) < now)
      )) {
        return false;
      }
      if (filters.timeframe === "past" && (!event.end || new Date(event.end) >= now)) {
        return false;
      }

      // Location filter
      if (filters.location === "online" && !event.isOnline) {
        return false;
      }
      if (filters.location === "offline" && event.isOnline) {
        return false;
      }

      // Status filter
      if (filters.status === "featured" && !event.isFeatured) {
        return false;
      }

      // Type filter
      if (filters.type !== "all" && event.type?.toLowerCase() !== filters.type.toLowerCase()) {
        return false;
      }

      return true;
    });

    // Sort events
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "start":
          return new Date(a.start || 0) - new Date(b.start || 0);
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "platform":
          return (a.platform || "").localeCompare(b.platform || "");
        case "prize":
          return (b.prize || 0) - (a.prize || 0);
        default:
          return 0;
      }
    });

    setFilteredEvents(sorted);
  }, [events, searchTerm, filters, sortBy]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      platform: "all",
      timeframe: "all",
      status: "all",
      location: "all",
      type: "all",
      source: "all"
    });
    setSortBy("start");
    setCurrentPage(1);
  };

  const toggleVideoPlayback = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  const totalPages = Math.ceil(totalEvents / itemsPerPage);
  
  const goToPage = (page) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
      // Scroll to top immediately when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Scroll to top immediately when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Scroll to top immediately when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const handleRefresh = () => {
    fetchEvents(currentPage, itemsPerPage);
    fetchStats();
  };

  const hasActiveFilters = searchTerm || Object.values(filters).some(v => v !== "all");

  // Use real-time stats as fallback
  const displayStats = statistics || realTimeStats;

  // Loading
  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-20"
            onLoadedData={() => setVideoLoaded(true)}
          >
            <source src="/videos/cyber-grid.mp4" type="video/mp4" />
            <source src="/videos/cyber-grid.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-purple-900/20"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 font-mono uppercase tracking-widest">SCANNING DATA STREAMS...</p>
          <p className="text-orange-300 text-sm mt-2 uppercase tracking-wide">DEVPOST • CLIST • DATABASE</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-10"
          >
            <source src="/videos/cyber-grid.mp4" type="video/mp4" />
            <source src="/videos/cyber-grid.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-orange-900/20"></div>
        </div>

        <div className="text-center max-w-md relative z-10">
          <div className="text-8xl mb-6 text-red-500/50"><FaRobot /></div>
          <h1 className="text-3xl font-black text-red-400 mb-4 uppercase tracking-widest">CONNECTION LOST</h1>
          <p className="text-orange-300 mb-6 uppercase tracking-wide text-lg">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-black font-black px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-red-500/40 transition-all uppercase tracking-widest flex items-center gap-3 mx-auto"
          >
            <FiRefreshCw /> REBOOT SCAN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-cyan-100 relative overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-1000 ${isVideoPlaying ? 'opacity-15' : 'opacity-5'}`}
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source src="/videos/cyber-grid.mp4" type="video/mp4" />
          <source src="/videos/cyber-grid.webm" type="video/webm" />
          {/* Fallback for browsers that don't support video */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-purple-900/10"></div>
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-black/40 to-purple-900/10"></div>
      </div>

      {/* Animated Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Video Control */}
      <button
        onClick={toggleVideoPlayback}
        className="fixed top-4 right-4 z-30 bg-black/50 border border-cyan-500/30 rounded-lg p-3 hover:bg-cyan-400/10 hover:border-cyan-400 transition-all group"
        title={isVideoPlaying ? "Pause background" : "Play background"}
      >
        {isVideoPlaying ? (
          <FiPause className="text-cyan-400 group-hover:text-orange-400" />
        ) : (
          <FiPlay className="text-cyan-400 group-hover:text-orange-400" />
        )}
      </button>

      <div className="relative z-10 max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-orange-400 rounded-2xl flex items-center justify-center pulse-glow shadow-lg shadow-cyan-500/50">
              <FaNetworkWired className="text-black text-3xl" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent uppercase tracking-widest mb-4">
            EVENT MATRIX
          </h1>
          <p className="text-cyan-300 text-lg uppercase tracking-widest max-w-2xl mx-auto font-mono">
            REAL-TIME AGGREGATION FROM GLOBAL PLATFORMS
          </p>

          {/* Stats - Always show real-time data */}
          {displayStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
              <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-cyan-400">{displayStats.total || 0}</div>
                <div className="text-cyan-300 text-xs uppercase tracking-widest">TOTAL</div>
              </div>
              <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-orange-400">{displayStats.upcoming || 0}</div>
                <div className="text-orange-300 text-xs uppercase tracking-widest">UPCOMING</div>
              </div>
              <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-green-400">{displayStats.ongoing || 0}</div>
                <div className="text-green-300 text-xs uppercase tracking-widest">LIVE</div>
              </div>
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-yellow-400">{displayStats.online || 0}</div>
                <div className="text-yellow-300 text-xs uppercase tracking-widest">ONLINE</div>
              </div>
            </div>
          )}
        </div>

        {/* Search & Filters */}
        <div className="bg-black/80 border border-cyan-500/30 rounded-2xl p-8 mb-8 shadow-2xl shadow-cyan-500/20">
          <div className="relative group mb-6">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 group-hover:text-orange-400 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SCAN ALL DATA STREAMS..."
              className="w-full bg-black/50 border-2 border-cyan-500/30 rounded-xl pl-12 pr-4 py-4 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all uppercase tracking-widest font-mono text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-3 text-cyan-400 hover:text-orange-400 transition-all group"
            >
              <div className={`p-3 border rounded-xl transition-all ${showFilters ? 'bg-cyan-400/20 border-cyan-400' : 'border-cyan-500/30'}`}>
                <FiFilter className="text-lg" />
              </div>
              <span className="font-mono uppercase tracking-widest text-sm">
                {showFilters ? "COLLAPSE" : "ACTIVATE"} FILTERS
              </span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 transition-all font-mono uppercase tracking-widest text-xs"
              >
                <option value={12}>12/PG</option>
                <option value={24}>24/PG</option>
                <option value={48}>48/PG</option>
                <option value={96}>96/PG</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 transition-all font-mono uppercase tracking-widest text-xs"
              >
                <option value="start">DATE</option>
                <option value="title">TITLE</option>
                <option value="platform">PLATFORM</option>
                <option value="prize">PRIZE</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-red-400 hover:text-red-300 font-mono uppercase tracking-widest text-xs flex items-center gap-1"
                >
                  <FiZap /> PURGE
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-6 bg-black/40 rounded-xl border border-cyan-500/20">
              {[
                { name: "platform", icon: <FaNetworkWired />, label: "PLATFORM", options: platforms },
                { name: "source", icon: <FiDatabase />, label: "SOURCE", options: sources },
                { name: "timeframe", icon: <FiCalendar />, label: "TIME", options: ["upcoming", "ongoing", "past"] },
                { name: "location", icon: <FiMapPin />, label: "LOC", options: ["online", "offline"] },
                { name: "status", icon: <FiZap />, label: "STATUS", options: ["featured"] },
                { name: "type", icon: <FiGlobe />, label: "TYPE", options: ["hackathon", "competition", "conference"] }
              ].map(({ name, icon, label, options }) => (
                <div key={name}>
                  <label className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-2">
                    {icon} {label}
                  </label>
                  <select
                    name={name}
                    value={filters[name]}
                    onChange={handleFilterChange}
                    className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-100 focus:border-cyan-400 transition-all font-mono uppercase tracking-widest text-xs"
                  >
                    <option value="all">ALL</option>
                    {options.map(opt => (
                      <option key={opt} value={opt}>{String(opt).toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-widest flex items-center gap-3">
            <FaBolt />
            {filteredEvents.length} ACTIVE
            <span className="text-sm text-cyan-300 font-normal ml-3">
              (PG {currentPage}/{totalPages} • {totalEvents} TOTAL)
            </span>
          </h2>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-cyan-400/10 border border-cyan-400/30 rounded-lg text-xs font-mono uppercase tracking-widest text-cyan-400">
              {platforms.length} PLATFORMS
            </div>
            <div className="px-3 py-1 bg-orange-400/10 border border-orange-400/30 rounded-lg text-xs font-mono uppercase tracking-widest text-orange-400">
              {sources.length} SOURCES
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 border border-cyan-500/30 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400 transition-all"
            >
              <FiRefreshCw className="text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-black/80 rounded-2xl border border-cyan-500/30">
            <div className="text-8xl ml-142 text-cyan-400/30"><FaRobot /></div>
            <h3 className="text-2xl font-black text-cyan-400 mb-4 uppercase tracking-widest">
              {hasActiveFilters ? "NO MATCHES" : "GRID EMPTY"}
            </h3>
            <p className="text-orange-300 mb-8 uppercase tracking-widest text-lg font-mono max-w-md mx-auto">
              {hasActiveFilters ? "ADJUST FILTERS" : "NEW EVENTS INCOMING"}
            </p>
            <div className="flex gap-4 justify-center">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-cyan-500 to-orange-500 text-black font-black px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-cyan-500/40 transition-all uppercase tracking-widest"
                >
                  CLEAR FILTERS
                </button>
              )}
             
            </div>
          </div>
        ) : (
          <>
            {/* Loading overlay for pagination */}
            {loading && (
              <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center rounded-2xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-2"></div>
                  <p className="text-cyan-400 font-mono uppercase tracking-widest text-sm">LOADING...</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 relative">
              {filteredEvents.map(event => (
                <EventCard
                  key={event._id || event.externalId}
                  event={event}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mb-8">
                <button 
                  onClick={() => goToPage(1)} 
                  disabled={currentPage === 1} 
                  className="p-2 border border-cyan-500/30 rounded-lg hover:bg-cyan-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronsLeft className="text-cyan-400" />
                </button>
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1} 
                  className="p-2 border border-cyan-500/30 rounded-lg hover:bg-cyan-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronLeft className="text-cyan-400" />
                </button>
                {pageNumbers.map(p => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`px-4 py-2 border rounded-lg font-mono text-sm uppercase tracking-widest transition-all ${currentPage === p
                        ? 'bg-cyan-400 border-cyan-400 text-black font-black'
                        : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400'
                      }`}
                  >
                    {p}
                  </button>
                ))}
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages} 
                  className="p-2 border border-cyan-500/30 rounded-lg hover:bg-cyan-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronRight className="text-cyan-400" />
                </button>
                <button 
                  onClick={() => goToPage(totalPages)} 
                  disabled={currentPage === totalPages} 
                  className="p-2 border border-cyan-500/30 rounded-lg hover:bg-cyan-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronsRight className="text-cyan-400" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Stats Footer */}
        {displayStats && filteredEvents.length > 0 && (
          <div className="mt-12 bg-black/80 border border-cyan-500/30 rounded-2xl p-8">
            <h3 className="text-xl font-black text-cyan-400 mb-6 text-center uppercase tracking-widest">
              GRID STATUS - PAGE {currentPage}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-cyan-400 mb-2">{displayStats.total || 0}</div>
                <div className="text-cyan-300 text-sm uppercase tracking-widest font-mono">EVENTS</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-orange-400 mb-2">{Object.keys(displayStats.byPlatform || {}).length}</div>
                <div className="text-orange-300 text-sm uppercase tracking-widest font-mono">PLATFORMS</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-green-400 mb-2">{displayStats.upcoming || 0}</div>
                <div className="text-green-300 text-sm uppercase tracking-widest font-mono">UPCOMING</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-yellow-400 mb-2">{displayStats.ongoing || 0}</div>
                <div className="text-yellow-300 text-sm uppercase tracking-widest font-mono">LIVE</div>
              </div>
            </div>

            {/* Platform Distribution */}
            {displayStats.byPlatform && Object.keys(displayStats.byPlatform).length > 0 && (
              <div className="mt-6">
                <h4 className="text-cyan-400 text-sm font-black uppercase tracking-widest mb-4 text-center">
                  PLATFORM DISTRIBUTION
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(displayStats.byPlatform).map(([platform, count]) => (
                    <div key={platform} className="text-center">
                      <div className="text-lg font-black text-cyan-300">{count}</div>
                      <div className="text-cyan-400/80 text-xs uppercase tracking-widest font-mono truncate">
                        {platform}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}