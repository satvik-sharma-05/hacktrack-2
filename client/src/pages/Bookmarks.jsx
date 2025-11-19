// src/pages/BookmarksPage.jsx
import React, { useEffect, useState } from "react";
import { fetchMyBookmarks } from "../services/api.js";
import EventCard from "../components/events/EventCard.jsx";
import { FaBookmark, FaSearch, FaFilter, FaExclamationTriangle } from "react-icons/fa";

export default function BookmarksPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");



  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        console.log("Loading bookmarks from API...");
        const data = await fetchMyBookmarks(); // This should call the API, not navigate
        console.log("Received bookmarks:", data);
        setEvents(data);
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      } finally {
        setLoading(false);
      }
    } 
    load();
  }, []);



  // Filter events based on search and platform
  useEffect(() => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.platform?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Platform filter
    if (filterPlatform !== "all") {
      filtered = filtered.filter(event => 
        event.platform?.toLowerCase() === filterPlatform.toLowerCase()
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filterPlatform]);

  function handleToggle(id, bookmarked) {
    // Local update: remove if unbookmarked
    if (!bookmarked) {
      setEvents(prev => prev.filter(e => String(e._id) !== String(id)));
    }
  }

  // Get unique platforms for filter
  const platforms = [...new Set(events.map(event => event.platform).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 font-mono uppercase tracking-wider">LOADING BOOKMARKS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-cyan-100 p-4">
      {/* TRON Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 243, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 243, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-xl p-8 mb-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center pulse-glow">
                <FaBookmark className="text-black text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider mb-2">
                  BOOKMARKED PROGRAMS
                </h1>
                <p className="text-cyan-300 font-mono text-sm uppercase tracking-wide">
                  {events.length} PROGRAM{events.length !== 1 ? 'S' : ''} STORED
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-cyan-400/10 border border-cyan-400/30 rounded-lg">
                <span className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                  {filteredEvents.length} ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        {events.length > 0 && (
          <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-xl p-6 mb-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Search Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-cyan-400 group-hover:text-purple-400 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  placeholder="SEARCH BOOKMARKS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/50 border border-cyan-400/30 rounded-lg pl-10 pr-4 py-3 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 uppercase tracking-wide font-mono"
                />
              </div>

              {/* Platform Filter */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-cyan-400 group-hover:text-purple-400 transition-colors duration-300" />
                </div>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="w-full bg-black/50 border border-cyan-400/30 rounded-lg pl-10 pr-4 py-3 text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 uppercase tracking-wide font-mono appearance-none"
                >
                  <option value="all" className="bg-gray-900">ALL PLATFORMS</option>
                  {platforms.map(platform => (
                    <option key={platform} value={platform} className="bg-gray-900 uppercase">
                      {platform.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || filterPlatform !== "all") && (
              <div className="flex flex-wrap gap-3 mt-4">
                {searchTerm && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-cyan-400/20 border border-cyan-400/30 rounded-full">
                    <span className="text-cyan-400 text-sm font-mono uppercase">SEARCH: {searchTerm}</span>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="text-cyan-400 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
                {filterPlatform !== "all" && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-400/20 border border-purple-400/30 rounded-full">
                    <span className="text-purple-400 text-sm font-mono uppercase">PLATFORM: {filterPlatform}</span>
                    <button
                      onClick={() => setFilterPlatform("all")}
                      className="text-purple-400 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bookmarks Grid */}
        {events.length === 0 ? (
          <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 border-dashed rounded-xl p-16 text-center">
            <div className="text-6xl mb-6 text-cyan-400/50">
              <FaBookmark />
            </div>
            <h3 className="text-2xl font-black text-cyan-400 mb-4 uppercase tracking-wider">
              NO BOOKMARKS DETECTED
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto uppercase tracking-wide text-sm leading-relaxed">
              Programs you bookmark will be stored here for rapid access and quick deployment.
              Start exploring available programs to build your mission portfolio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = "/events"}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black rounded-lg hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-300 uppercase tracking-wider text-sm border border-transparent hover:border-cyan-300"
              >
                EXPLORE PROGRAMS
              </button>
              <button 
                onClick={() => window.location.href = "/find-teammates"}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-600 text-black font-black rounded-lg hover:shadow-lg hover:shadow-purple-400/30 transition-all duration-300 uppercase tracking-wider text-sm border border-transparent hover:border-purple-300"
              >
                FIND COMBATANTS
              </button>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-xl p-16 text-center">
            <div className="text-6xl mb-6 text-yellow-400/50">
              <FaExclamationTriangle />
            </div>
            <h3 className="text-2xl font-black text-yellow-400 mb-4 uppercase tracking-wider">
              NO MATCHING PROGRAMS
            </h3>
            <p className="text-gray-400 mb-6 uppercase tracking-wide text-sm">
              No bookmarks match your current search criteria.
            </p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setFilterPlatform("all");
              }}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black rounded-lg hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 uppercase tracking-wider text-sm"
            >
              CLEAR FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div key={event._id} className="transform hover:scale-105 transition-transform duration-300">
                <EventCard event={event} onBookmarkToggled={handleToggle} />
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {events.length > 0 && (
          <div className="mt-12 bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-xl p-6 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-cyan-400 mb-2">{events.length}</div>
                <div className="text-cyan-300 text-sm uppercase tracking-wide font-mono">TOTAL BOOKMARKS</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-400 mb-2">
                  {platforms.length}
                </div>
                <div className="text-purple-300 text-sm uppercase tracking-wide font-mono">PLATFORMS</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-green-400 mb-2">
                  {events.filter(e => e.start && new Date(e.start) > new Date()).length}
                </div>
                <div className="text-green-300 text-sm uppercase tracking-wide font-mono">UPCOMING</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .pulse-glow {
          animation: pulse 2s ease-in-out infinite alternate;
        }
        
        @keyframes pulse {
          from { 
            box-shadow: 0 0 5px rgba(0, 243, 255, 0.5);
          }
          to { 
            box-shadow: 0 0 20px rgba(0, 243, 255, 0.8), 0 0 30px rgba(0, 243, 255, 0.4);
          }
        }
      `}</style>
    </div>
  );
}