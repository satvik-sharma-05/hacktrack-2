import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { 
  FiCalendar, 
  FiClock, 
  FiAward, 
  FiUsers, 
  FiExternalLink,
  FiLoader,
  FiAlertCircle
} from "react-icons/fi";

export default function MyHackathons() {
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMyHackathons() {
      try {
        const res = await api.get("/participation/my");
        setHackathons(res.data.participations || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching joined hackathons:", err);
        setError("Failed to load your hackathons. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchMyHackathons();
  }, []);

  // Get status badge color based on event dates
  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { status: "Upcoming", color: "bg-blue-500/20 text-blue-400 border-blue-500/40" };
    if (now >= start && now <= end) return { status: "Live", color: "bg-green-500/20 text-green-400 border-green-500/40" };
    return { status: "Completed", color: "bg-gray-500/20 text-gray-400 border-gray-500/40" };
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <FiLoader className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading Your Hackathons</h2>
            <p className="text-gray-400">Fetching your participation data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <FiAlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Unable to Load</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-cyan-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-cyan-400 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (hackathons.length === 0) {
    return (
      <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
              <FiAward className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">No Hackathons Yet</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              You haven't joined any hackathons yet. Start your journey by exploring available events!
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-8 py-3 rounded-lg font-bold hover:from-cyan-400 hover:to-blue-400 transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/30"
            >
              <FiExternalLink size={18} />
              Explore Hackathons
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            My <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Hackathons</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Track your hackathon journey, from upcoming events to completed challenges
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">{hackathons.length}</div>
            <div className="text-gray-400 text-sm">Total Participations</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {hackathons.filter(p => getEventStatus(p.event?.start, p.event?.end).status === "Live").length}
            </div>
            <div className="text-gray-400 text-sm">Active Now</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {hackathons.filter(p => getEventStatus(p.event?.start, p.event?.end).status === "Completed").length}
            </div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
        </div>

        {/* Hackathons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((participation) => {
            const event = participation.event;
            const status = getEventStatus(event?.start, event?.end);
            
            return (
              <div
                key={participation._id}
                className="group bg-gray-900/60 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 hover:scale-105"
              >
                {/* Status Badge */}
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border mb-4 ${status.color}`}>
                  <FiClock size={12} />
                  {status.status}
                </div>

                {/* Event Title */}
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                  {event?.title || "Untitled Hackathon"}
                </h3>

                {/* Event Dates */}
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <FiCalendar size={14} />
                  <span>
                    {event?.start ? new Date(event.start).toLocaleDateString() : "TBA"} - {" "}
                    {event?.end ? new Date(event.end).toLocaleDateString() : "TBA"}
                  </span>
                </div>

                {/* Participation Info */}
                <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Joined</span>
                    <span className="text-cyan-400 font-medium">
                      {new Date(participation.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {participation.team && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-400">Team</span>
                      <span className="text-blue-400 font-medium flex items-center gap-1">
                        <FiUsers size={12} />
                        {participation.team.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Link
                  to={`/events/${event?._id || event?.externalId}`}
                  className="w-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:text-white hover:bg-cyan-500/30 hover:border-cyan-500/50 py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                >
                  <span>View Event</span>
                  <FiExternalLink 
                    size={16} 
                    className="group-hover/btn:translate-x-1 transition-transform" 
                  />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Ready for your next challenge?</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <FiExternalLink size={18} />
            Discover More Hackathons
          </Link>
        </div>
      </div>
    </div>
  );
}