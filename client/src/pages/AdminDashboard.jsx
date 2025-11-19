// src/pages/AdminDashboard.jsx
import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminAnalytics from "./AdminAnalytics";
import { 
  FiUsers, 
  FiCalendar, 
  FiCheckCircle, 
  FiClock, 
  FiTrendingUp,
  FiSettings,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiAward,
  FiBarChart2,
  FiUserCheck,
  FiShield,
  FiMail,
  FiGlobe,
  FiDollarSign,
  FiActivity,
  FiAlertTriangle,
  FiInfo
} from "react-icons/fi";

// Beautiful Modal Components
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = "warning" }) => {
  if (!isOpen) return null;

  const config = {
    warning: {
      icon: FiAlertTriangle,
      color: "from-yellow-400 to-orange-500",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600",
      iconColor: "text-yellow-400"
    },
    danger: {
      icon: FiAlertTriangle,
      color: "from-red-400 to-pink-500",
      buttonColor: "bg-red-500 hover:bg-red-600",
      iconColor: "text-red-400"
    },
    success: {
      icon: FiCheckCircle,
      color: "from-green-400 to-emerald-500",
      buttonColor: "bg-green-500 hover:bg-green-600",
      iconColor: "text-green-400"
    },
    info: {
      icon: FiInfo,
      color: "from-cyan-400 to-blue-500",
      buttonColor: "bg-cyan-500 hover:bg-cyan-600",
      iconColor: "text-cyan-400"
    }
  };

  const { icon: Icon, color, buttonColor, iconColor } = config[type];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 border border-cyan-500/30 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6 text-center">
          <div className={`w-16 h-16 bg-gradient-to-r ${color} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon className="text-2xl text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-300 leading-relaxed">{message}</p>
        </div>
        
        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${buttonColor} text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const ToastNotification = ({ message, type = "success", onClose }) => {
  const config = {
    success: {
      color: "bg-green-500/20 border-green-400/30 text-green-400",
      icon: FiCheckCircle
    },
    error: {
      color: "bg-red-500/20 border-red-400/30 text-red-400",
      icon: FiAlertTriangle
    },
    warning: {
      color: "bg-yellow-500/20 border-yellow-400/30 text-yellow-400",
      icon: FiAlertTriangle
    },
    info: {
      color: "bg-cyan-500/20 border-cyan-400/30 text-cyan-400",
      icon: FiInfo
    }
  };

  const { color, icon: Icon } = config[type];

  return (
    <div className={`fixed top-4 right-4 ${color} border rounded-xl p-4 backdrop-blur-md animate-slide-in-right z-50 min-w-80`}>
      <div className="flex items-center gap-3">
        <Icon className="text-lg" />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <FiX className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [systemStatus, setSystemStatus] = useState({});
  
  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    type: "warning",
    title: "",
    message: "",
    onConfirm: null
  });
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success"
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    fetchDashboard();
    fetchSystemStatus();
  }, [user]);

  const showToast = (message, type = "success") => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ isVisible: false, message: "", type: "success" }), 4000);
  };

  const showConfirmation = (title, message, type = "warning") => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type,
        title,
        message,
        onConfirm: () => {
          setModal({ isOpen: false, title: "", message: "", onConfirm: null });
          resolve(true);
        }
      });
    });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: "", message: "", onConfirm: null });
  };

  async function fetchDashboard() {
    try {
      const [statsRes, eventsRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/submissions"),
        api.get("/admin/users"),
      ]);
      setStats(statsRes.data.stats || {});
      setEvents(eventsRes.data.events || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error("Admin dashboard load failed:", err);
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSystemStatus() {
    try {
      const res = await api.get("/admin/system-status");
      setSystemStatus(res.data.status || {});
    } catch (err) {
      console.error("Failed to fetch system status:", err);
    }
  }

  async function handleApprove(eventId) {
    const event = events.find(e => e._id === eventId);
    const confirmed = await showConfirmation(
      "Approve Event",
      `Are you sure you want to approve "${event?.title}"? This will make the event visible to all users.`,
      "success"
    );

    if (!confirmed) return;

    try {
      await api.put(`/admin/approve/${eventId}`);
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, status: "approved" } : e))
      );
      showToast("Event approved successfully!", "success");
    } catch (err) {
      console.error("Approval failed:", err);
      showToast("Failed to approve event", "error");
    }
  }

  async function handleReject(eventId) {
    const event = events.find(e => e._id === eventId);
    const confirmed = await showConfirmation(
      "Reject Event",
      `Are you sure you want to reject "${event?.title}"? This action cannot be undone.`,
      "danger"
    );

    if (!confirmed) return;

    try {
      await api.put(`/admin/reject/${eventId}`);
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, status: "rejected" } : e))
      );
      showToast("Event rejected successfully", "success");
    } catch (err) {
      console.error("Reject failed:", err);
      showToast("Failed to reject event", "error");
    }
  }

  async function handleDeleteUser(userId) {
    const userToDelete = users.find(u => u._id === userId);
    const confirmed = await showConfirmation(
      "Delete User",
      `Permanently delete user "${userToDelete?.name}" (${userToDelete?.email})? This action cannot be undone and all user data will be lost.`,
      "danger"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      showToast("User deleted successfully", "success");
    } catch (err) {
      console.error("Delete user failed:", err);
      showToast("Failed to delete user", "error");
    }
  }

  async function handleRoleChange(userId, newRole) {
    const userToUpdate = users.find(u => u._id === userId);
    const confirmed = await showConfirmation(
      "Change User Role",
      `Change ${userToUpdate?.name}'s role from ${userToUpdate?.role} to ${newRole}?`,
      "info"
    );

    if (!confirmed) return;

    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, role: newRole } : u
        )
      );
      showToast("User role updated successfully", "success");
    } catch (err) {
      console.error("Role update failed:", err);
      showToast("Failed to update user role", "error");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-400/30 rounded-full animate-spin mx-auto"></div>
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div className="space-y-2">
            <p className="text-cyan-300 font-mono text-lg tracking-wider animate-pulse">
              INITIALIZING ADMIN PORTAL
            </p>
            <p className="text-gray-400 text-sm font-mono">
              Establishing secure connection...
            </p>
          </div>
          <div className="flex justify-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 lg:p-6">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 243, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 243, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>

      {/* Header Section */}
      <div className="relative mb-8 text-center lg:text-left">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              ADMIN CONTROL PANEL
            </h1>
            <p className="text-cyan-200/80 font-mono text-sm lg:text-base tracking-wider">
              SYSTEM OVERVIEW & SECURE MANAGEMENT INTERFACE
            </p>
          </div>
          <SystemStatus status={systemStatus} />
        </div>
        
        {/* Animated underline */}
        <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto lg:mx-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="relative mb-8">
        <div className="flex flex-wrap gap-2 bg-gray-800/50 backdrop-blur-md rounded-2xl p-2 border border-cyan-500/20 w-fit mx-auto">
          {[
            { id: "overview", icon: FiTrendingUp, label: "Overview" },
            { id: "events", icon: FiCalendar, label: "Events" },
            { id: "users", icon: FiUsers, label: "Users" },
            { id: "analytics", icon: FiBarChart2, label: "Analytics" }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-500 group relative overflow-hidden ${
                tab === id
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-400/30 shadow-lg shadow-cyan-500/20"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50 border border-transparent"
              }`}
              onClick={() => setTab(id)}
            >
              <Icon className={`text-lg transition-transform duration-300 ${
                tab === id ? 'scale-110' : 'group-hover:scale-110'
              }`} />
              <span className="font-mono tracking-wide">{label}</span>
              {tab === id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content sections */}
      <div className="relative">
        {tab === "overview" && <Overview stats={stats} events={events} users={users} />}
        {tab === "events" && (
          <EventsPanel events={events} onApprove={handleApprove} onReject={handleReject} />
        )}
        {tab === "users" && (
          <UsersPanel users={users} onRoleChange={handleRoleChange} onDelete={handleDeleteUser} />
        )}
        {tab === "analytics" && <AdminAnalytics />}
      </div>

      {/* Beautiful Modals */}
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      {toast.isVisible && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ isVisible: false, message: "", type: "success" })}
        />
      )}

      {/* Enhanced Global Styles */}
      <style jsx global>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }

        .tron-card {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(34, 211, 238, 0.2);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }

        .tron-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.6), transparent);
        }

        .tron-card-glow {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 16px;
          box-shadow: 
            0 0 20px rgba(34, 211, 238, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .tron-card-glow:hover {
          border-color: rgba(34, 211, 238, 0.6);
          box-shadow: 
            0 0 30px rgba(34, 211, 238, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

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

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

/* =======================
   🖥️ SYSTEM STATUS COMPONENT
======================= */
function SystemStatus({ status }) {
  return (
    <div className="flex items-center gap-4 text-sm bg-gray-800/50 backdrop-blur-md rounded-xl px-4 py-2 border border-cyan-500/20">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-green-400 font-mono">SYSTEM ONLINE</span>
      </div>
      <div className="h-4 w-px bg-gray-600"></div>
      <div className="text-cyan-300 font-mono">
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

/* =======================
   📊 ENHANCED OVERVIEW TAB
======================= */
function Overview({ stats, events, users }) {
  const statsData = [
    { 
      title: "Total Users", 
      value: stats.totalUsers || 0, 
      icon: FiUsers,
      color: "from-cyan-500 to-blue-500",
      change: "+12%",
      description: "Registered platform users"
    },
    { 
      title: "Active Organizers", 
      value: stats.totalOrganizers || 0, 
      icon: FiUserCheck,
      color: "from-green-400 to-cyan-500",
      change: "+8%",
      description: "Event organizers"
    },
    { 
      title: "Total Events", 
      value: stats.totalEvents || 0, 
      icon: FiCalendar,
      color: "from-purple-500 to-pink-500",
      change: "+15%",
      description: "Created events"
    },
    { 
      title: "Pending Reviews", 
      value: stats.pendingEvents || 0, 
      icon: FiClock,
      color: "from-orange-400 to-red-400",
      change: "+5%",
      description: "Awaiting approval"
    },
    { 
      title: "Participations", 
      value: stats.participations || 0, 
      icon: FiAward,
      color: "from-yellow-400 to-orange-400",
      change: "+20%",
      description: "Total participations"
    },
    { 
      title: "Admin Team", 
      value: stats.adminUsers || 0, 
      icon: FiShield,
      color: "from-red-400 to-pink-500",
      change: "+2%",
      description: "Administrative users"
    }
  ];

  const recentEvents = events.slice(0, 3);
  const recentUsers = users.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <EnhancedStatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      {/* Quick Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentEvents events={recentEvents} />
        <RecentUsers users={recentUsers} />
      </div>
    </div>
  );
}

function EnhancedStatCard({ stat, index }) {
  const Icon = stat.icon;
  
  return (
    <div 
      className="tron-card-glow p-6 animate-fade-in-up group cursor-pointer"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="text-xl" />
        </div>
        <span className="text-sm font-semibold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
          {stat.change}
        </span>
      </div>
      
      <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">{stat.title}</h3>
      <p className="text-3xl font-bold text-white mb-2 font-mono">{stat.value.toLocaleString()}</p>
      <p className="text-gray-500 text-xs mb-4">{stat.description}</p>
      
      {/* Animated progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-2000 ease-out group-hover:animate-pulse`}
          style={{ width: `${Math.min((stat.value / 1000) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function RecentEvents({ events }) {
  return (
    <div className="tron-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <FiActivity className="text-cyan-400 text-xl" />
        <h3 className="text-lg font-semibold text-white">Recent Events</h3>
      </div>
      <div className="space-y-3">
        {events.map((event, index) => (
          <div key={event._id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg animate-fade-in-up" 
               style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{event.title}</p>
              <p className="text-cyan-400 text-sm truncate">{event.organizerRef?.name}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              event.status === 'approved' ? 'bg-green-500/20 text-green-400' :
              event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {event.status}
            </span>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-gray-500 text-center py-4">No recent events</p>
        )}
      </div>
    </div>
  );
}

function RecentUsers({ users }) {
  return (
    <div className="tron-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <FiUsers className="text-cyan-400 text-xl" />
        <h3 className="text-lg font-semibold text-white">Recent Users</h3>
      </div>
      <div className="space-y-3">
        {users.map((user, index) => (
          <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg animate-fade-in-up"
               style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user.name}</p>
              <p className="text-cyan-400 text-sm truncate">{user.email}</p>
            </div>
            <span className="text-gray-400 text-xs">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-gray-500 text-center py-4">No recent users</p>
        )}
      </div>
    </div>
  );
}

/* =======================
   🧾 ENHANCED EVENTS TAB
======================= */
function EventsPanel({ events, onApprove, onReject }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const perPage = 5;

  const filtered = useMemo(() => {
    return events
      .filter((ev) => {
        const matchSearch =
          ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ev.organizerRef?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = filter === "all" ? true : ev.status === filter;
        return matchSearch && matchFilter;
      })
      .sort((a, b) => {
        if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
        return 0;
      });
  }, [events, searchTerm, filter, sort]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const statusConfig = {
    approved: { color: "from-green-500 to-emerald-500", bg: "bg-green-500/10", text: "text-green-400" },
    pending: { color: "from-yellow-500 to-orange-500", bg: "bg-yellow-500/10", text: "text-yellow-400" },
    rejected: { color: "from-red-500 to-pink-500", bg: "bg-red-500/10", text: "text-red-400" }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Search & Filters */}
      <div className="tron-card p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative w-full lg:w-96">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search events or organizers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder-gray-400 transition-all duration-300"
            />
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Events List */}
      {paginated.length === 0 ? (
        <div className="tron-card text-center py-12">
          <FiCalendar className="text-4xl text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No events found</p>
          <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginated.map((event, index) => (
            <EventCard 
              key={event._id} 
              event={event} 
              index={index}
              statusConfig={statusConfig}
              onView={() => setSelected(event)}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Pagination 
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Event Modal */}
      {selected && (
        <EventModal 
          event={selected}
          statusConfig={statusConfig}
          onClose={() => setSelected(null)}
          onApprove={onApprove}
          onReject={onReject}
        />
      )}
    </div>
  );
}

function EventCard({ event, index, statusConfig, onView, onApprove, onReject }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`tron-card p-6 transition-all duration-500 transform ${
        isHovered ? 'scale-105 border-cyan-400/50' : 'scale-100'
      } ${index % 2 === 0 ? 'animate-fade-in-left' : 'animate-fade-in-right'}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-semibold text-white group-hover:text-cyan-300 transition-colors">
              {event.title}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${statusConfig[event.status]?.color} text-white shadow-lg`}>
              {event.status.toUpperCase()}
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <p className="text-cyan-200">
              <span className="text-gray-400">Organizer:</span> {event.organizerRef?.name || "N/A"}
            </p>
            <p className="text-gray-400">
              {event.organizerRef?.email}
            </p>
            <p className="text-gray-500 text-xs">
              Created: {new Date(event.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onView}
            className="p-2 bg-gray-700 hover:bg-cyan-600 rounded-lg transition-all duration-300 group"
          >
            <FiEye className="text-gray-300 group-hover:text-white transition-colors" />
          </button>
          <button
            onClick={() => onApprove(event._id)}
            disabled={event.status === "approved"}
            className="p-2 bg-gray-700 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-all duration-300 group"
          >
            <FiCheckCircle className="text-gray-300 group-hover:text-white transition-colors" />
          </button>
          <button
            onClick={() => onReject(event._id)}
            disabled={event.status === "rejected"}
            className="p-2 bg-gray-700 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-all duration-300 group"
          >
            <FiX className="text-gray-300 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EventModal({ event, statusConfig, onClose, onApprove, onReject }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 border border-cyan-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{event.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <FiX className="text-xl text-gray-400 hover:text-white" />
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className={`px-3 py-1 rounded-full font-bold bg-gradient-to-r ${statusConfig[event.status]?.color} text-white`}>
              {event.status.toUpperCase()}
            </span>
            <span className="text-cyan-300">{event.organizerRef?.name}</span>
            <span className="text-gray-400">{event.organizerRef?.email}</span>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-cyan-300 font-semibold mb-2">Description</h3>
            <p className="text-gray-300 leading-relaxed">{event.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-cyan-300 font-semibold mb-2">Start Date</h3>
              <p className="text-gray-300">{new Date(event.start).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-cyan-300 font-semibold mb-2">End Date</h3>
              <p className="text-gray-300">{new Date(event.end).toLocaleString()}</p>
            </div>
          </div>
          
          {event.url && (
            <div>
              <h3 className="text-cyan-300 font-semibold mb-2">Event Link</h3>
              <a
                href={event.url}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              >
                {event.url}
              </a>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button
            onClick={() => onApprove(event._id)}
            disabled={event.status === "approved"}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:transform-none hover:scale-105"
          >
            Approve Event
          </button>
          <button
            onClick={() => onReject(event._id)}
            disabled={event.status === "rejected"}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:transform-none hover:scale-105"
          >
            Reject Event
          </button>
        </div>
      </div>
    </div>
  );
}

/* =======================
   👥 ENHANCED USERS TAB
======================= */
function UsersPanel({ users, onRoleChange, onDelete }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = useMemo(() => {
    return users
      .filter((u) => {
        const matchSearch =
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === "all" ? true : u.role === roleFilter;
        return matchSearch && matchRole;
      })
      .sort((a, b) => {
        if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
        if (sort === "role") return a.role.localeCompare(b.role);
        return 0;
      });
  }, [users, search, roleFilter, sort]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const roleConfig = {
    admin: { color: "from-red-500 to-pink-500", icon: FiShield },
    organizer: { color: "from-blue-500 to-cyan-500", icon: FiUserCheck },
    student: { color: "from-green-500 to-emerald-500", icon: FiUsers }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Search & Filter */}
      <div className="tron-card p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative w-full lg:w-96">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder-gray-400 transition-all duration-300"
            />
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="role">By Role</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Users Grid */}
      {paginated.length === 0 ? (
        <div className="tron-card text-center py-12">
          <FiUsers className="text-4xl text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No users found</p>
          <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginated.map((user, index) => (
            <UserCard 
              key={user._id} 
              user={user} 
              index={index}
              roleConfig={roleConfig}
              onRoleChange={onRoleChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Pagination 
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

function UserCard({ user, index, roleConfig, onRoleChange, onDelete }) {
  const RoleIcon = roleConfig[user.role]?.icon || FiUsers;

  return (
    <div
      className="tron-card-glow p-6 animate-fade-in-up group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-white">{user.name}</h3>
            <p className="text-cyan-200 text-sm truncate max-w-[150px]">{user.email}</p>
          </div>
        </div>
        <div className={`p-2 rounded-lg bg-gradient-to-r ${roleConfig[user.role]?.color} text-white group-hover:scale-110 transition-transform duration-300`}>
          <RoleIcon className="text-sm" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Joined</span>
          <span className="text-cyan-300">{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div className="flex gap-2">
          <select
            value={user.role}
            onChange={(e) => onRoleChange(user._id, e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="student">Student</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
          
          <button
            onClick={() => onDelete(user._id)}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-300 group"
          >
            <FiTrash2 className="text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =======================
   🔢 PAGINATION COMPONENT
======================= */
function Pagination({ page, totalPages, onPageChange }) {
  const pages = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <>
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="p-2 bg-gray-800 hover:bg-cyan-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-all duration-300"
      >
        <FiChevronLeft className="text-lg" />
      </button>
      
      {pages.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
            page === pageNum
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
        >
          {pageNum}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="p-2 bg-gray-800 hover:bg-cyan-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-all duration-300"
      >
        <FiChevronRight className="text-lg" />
      </button>
    </>
  );
}