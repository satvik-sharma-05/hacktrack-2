// src/pages/OrganizerDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  FiCalendar, FiUsers, FiCheckCircle, FiClock, FiPlus,
  FiEdit3, FiTrash2, FiEye, FiTrendingUp, FiAward,
  FiZap, FiGlobe, FiMail, FiMapPin, FiExternalLink, FiRefreshCw
} from "react-icons/fi";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, past: 0 });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* -----------------------------
     FETCH EVENTS + PROFILE + STATS
  ----------------------------- */
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError("");
      const [eventsRes, summaryRes, profileRes] = await Promise.all([
        API.get("/organizer/my-events"),
        API.get("/organizer/summary"),
        API.get("/organizer/profile"),
      ]);

      console.log("📊 Events response:", eventsRes.data);
      console.log("📈 Summary response:", summaryRes.data);
      console.log("👤 Profile response:", profileRes.data);

      setEvents(eventsRes.data.events || []);
      setStats(summaryRes.data.stats || {});
      setProfile(profileRes.data.user || null);
    } catch (err) {
      console.error("❌ Failed to load dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "organizer") {
      navigate("/login");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

const handleDeleteEvent = async (eventId, eventTitle) => {
  console.log("Delete clicked for event:", eventId, eventTitle);
  
  if (!window.confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
    return;
  }
  
  try {
    console.log("Sending delete request for:", eventId);
    const response = await API.delete(`/organizer/${eventId}`);
    console.log("Delete successful:", response.data);
    
    // Find the event being deleted
    const deletedEvent = events.find(e => e._id === eventId);
    const wasActive = deletedEvent && new Date(deletedEvent.end) >= new Date();

    // Optimistic update
    setEvents(prev => prev.filter(event => event._id !== eventId));
    setStats(prev => ({
      ...prev,
      total: Math.max(0, prev.total - 1),
      active: wasActive ? Math.max(0, prev.active - 1) : prev.active,
      past: !wasActive ? Math.max(0, prev.past - 1) : prev.past
    }));
    
  } catch (err) {
    console.error("Delete event failed:", err);
    console.error("Error details:", err.response?.data);
    alert("Failed to delete event. Please try again.");
    fetchDashboardData(); // Sync with server
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center relative z-50">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-300 font-mono text-lg animate-pulse">INITIALIZING MISSION CONTROL...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "organizer") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center p-8 tron-card-glow animate-pulse relative z-50">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiZap className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">ACCESS DENIED</h2>
          <p className="text-gray-400">Organizer privileges required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative z-10">
      {/* Animated Background - Keep behind everything */}
      <div className="fixed inset-0 tron-grid animate-grid-flow pointer-events-none z-0"></div>
      
      {/* Header */}
      <div className="relative max-w-7xl mx-auto mb-8 z-20">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-lg relative z-50">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 relative z-30">
          <div className="mb-6 lg:mb-0 relative z-30">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 text-glow">
              MISSION CONTROL
            </h1>
            <p className="text-cyan-200 font-mono text-sm tracking-wide">
              ORGANIZER COMMAND CENTER
            </p>
            <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-3 animate-subtle-pulse"></div>
          </div>

          <div className="flex gap-4 relative z-50">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded-xl transition-all duration-300 font-mono text-sm disabled:opacity-50 relative z-50"
            >
              <FiRefreshCw className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'SYNCING...' : 'REFRESH'}
            </button>

            <Link
              to="/organizer/profile"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 font-mono text-sm hover:scale-105 relative z-50"
            >
              <FiEdit3 />
              EDIT PROFILE
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        {profile && (
          <div className="tron-card-glow p-6 mb-8 animate-fade-in-up relative z-30">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-cyan-500/30 p-1">
                  <img
                    src={profile.avatar || "/default-avatar.png"}
                    alt="avatar"
                    className="w-full h-full rounded-full object-cover bg-gray-800"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-green-500 rounded-full border-2 border-gray-900 z-40">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
                    <p className="text-cyan-300 text-lg font-semibold">{profile.organization}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 lg:mt-0 relative z-30">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">
                      VERIFIED ORGANIZER
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {profile.organizationDescription || profile.bio || "No briefing available."}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-cyan-200">
                  {profile.contactEmail && (
                    <div className="flex items-center gap-2">
                      <FiMail className="text-cyan-400" />
                      <span>{profile.contactEmail}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-cyan-400" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors group relative z-30"
                    >
                      <FiGlobe className="text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span className="truncate max-w-xs">{profile.website.replace(/^https?:\/\//, '')}</span>
                      <FiExternalLink className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-30">
          <StatCard 
            title="TOTAL EVENTS" 
            value={stats.total || 0} 
            icon={FiAward}
            color="from-cyan-500 to-blue-500"
          />
          <StatCard 
            title="ACTIVE EVENTS" 
            value={stats.active || 0} 
            icon={FiZap}
            color="from-green-400 to-cyan-500"
          />
          <StatCard 
            title="COMPLETED EVENTS" 
            value={stats.past || 0} 
            icon={FiCheckCircle}
            color="from-purple-500 to-pink-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center mb-8 relative z-40">
          <h2 className="text-2xl font-bold text-white">YOUR EVENTS</h2>
          <Link
            to="/organizer/create"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 font-bold font-mono tracking-wide hover:scale-105 group relative z-50"
          >
            <FiPlus className="group-hover:rotate-90 transition-transform duration-300" />
            ADD NEW
          </Link>
        </div>

        {/* Events List */}
        <div className="space-y-4 relative z-30">
          {events.length === 0 ? (
            <div className="tron-card-glow p-12 text-center animate-fade-in relative z-30">
              <FiCalendar className="text-6xl text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">NO ACTIVE EVENTS</h3>
              <p className="text-gray-500 mb-6">Launch your first event to get started</p>
              <Link
                to="/organizer/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 font-bold font-mono tracking-wide hover:scale-105 relative z-50"
              >
                <FiPlus />
                CREATE FIRST MISSION
              </Link>
            </div>
          ) : (
            events.map((event, index) => (
              <EventCard
                key={event._id}
                event={event}
                index={index}
                onDelete={handleDeleteEvent}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* 📊 Enhanced Stat Card */
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="tron-card-glow p-6 animate-fade-in-up group cursor-pointer relative z-30">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} text-white shadow-lg relative z-30`}>
          <Icon className="text-xl" />
        </div>
      </div>
      
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-3">{value.toLocaleString()}</p>
      
      {/* Animated progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 relative z-30">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out relative z-30`}
          style={{ width: `${Math.min((value / 50) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

/* 🎯 Event Card Component */
function EventCard({ event, index, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Ended';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays}d left`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w left`;
    return `${Math.ceil(diffDays / 30)}mo left`;
  };

  const getEventStatus = () => {
    const now = new Date();
    const start = new Date(event.start);
    const end = new Date(event.end);

    if (now < start) return { text: 'UPCOMING', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    if (now >= start && now <= end) return { text: 'LIVE', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    return { text: 'ENDED', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  };

  const status = getEventStatus();

  return (
    <div 
      className={`tron-card-glow p-6 transition-all duration-500 transform relative z-30 ${
        isHovered ? 'scale-105 border-cyan-400/50' : 'scale-100'
      } animate-fade-in-up`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
              {event.title}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color} relative z-30`}>
              {status.text}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold relative z-30 ${
              event.isApproved 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {event.isApproved ? 'APPROVED' : 'PENDING'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-300">
                <FiCalendar className="flex-shrink-0" />
                <span>{formatDate(event.start)} → {formatDate(event.end)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <FiClock className="flex-shrink-0" />
                <span>{getDaysUntil(event.start)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <FiUsers className="flex-shrink-0" />
                <span>{event.participantsCount || 0} participants</span>
              </div>
              {event.prize && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <FiAward className="flex-shrink-0" />
                  <span>${event.prize.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 relative z-50">
          <Link
            to={`/organizer/edit/${event._id}`}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all duration-300 hover:scale-105 group relative z-50"
            onClick={() => console.log("✏️ Edit clicked for:", event._id)}
          >
            <FiEdit3 className="text-sm group-hover:rotate-12 transition-transform" />
            <span className="font-mono text-sm">EDIT</span>
          </Link>
          
          <button
            onClick={() => {
              console.log("🗑️ Delete button clicked for:", event._id, event.title);
              onDelete(event._id, event.title);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 hover:scale-105 group relative z-50"
          >
            <FiTrash2 className="text-sm group-hover:scale-110 transition-transform" />
            <span className="font-mono text-sm">DELETE</span>
          </button>
        </div>
      </div>

      {/* Progress bar for event timeline */}
      <div className="mt-4 relative z-30">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Event Progress</span>
          <span>{getDaysUntil(event.start)}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 relative z-30">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 relative z-30"
            style={{ 
              width: `${Math.min(
                ((new Date() - new Date(event.start)) / (new Date(event.end) - new Date(event.start))) * 100, 
                100
              )}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Add animations to CSS
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

/* Ensure proper z-index layering */
.tron-card-glow {
  position: relative;
  z-index: 30;
}

/* Make sure buttons are always clickable */
button, a {
  position: relative;
  z-index: 50;
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = dashboardAnimations;
  document.head.appendChild(styleSheet);
}