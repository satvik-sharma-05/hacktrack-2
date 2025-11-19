// src/pages/EditEventPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  FiArrowLeft, FiSave, FiCalendar, FiMapPin, FiAward, 
  FiTag, FiGlobe, FiImage, FiZap, FiEdit3 
} from "react-icons/fi";

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    location: "",
    prize: "",
    prizeType: "unknown",
    themes: "",
    skills: "",
    url: "",
    bannerImage: "",
  });

  // Fetch existing event details
  useEffect(() => {
    if (!user || user.role !== "organizer") {
      navigate("/login");
      return;
    }

    async function fetchEvent() {
      try {
        console.log("🔍 Fetching event with ID:", id);
        const res = await API.get(`/organizer/event/${id}`);
        console.log("✅ Event fetch response:", res.data);
        
        if (res.data?.event) {
          const e = res.data.event;
          setForm({
            title: e.title || "",
            description: e.description || "",
            start: e.start ? new Date(e.start).toISOString().slice(0, 16) : "",
            end: e.end ? new Date(e.end).toISOString().slice(0, 16) : "",
            location: e.location || "",
            prize: e.prize || "",
            prizeType: e.prizeType || "unknown",
            themes: Array.isArray(e.themes) ? e.themes.join(", ") : e.themes || "",
            skills: Array.isArray(e.skills) ? e.skills.join(", ") : e.skills || "",
            url: e.url || "",
            bannerImage: e.bannerImage || "",
          });
        }
      } catch (err) {
        console.error("❌ Failed to load event", err);
        console.error("Error details:", err.response?.data);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id, user, navigate]);

  // Save changes
  async function handleSubmit(e) {
    e.preventDefault();
    console.log("🚀 Submitting form data:", form);
    
    setSaving(true);
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        themes: form.themes.split(",").map(t => t.trim()).filter(t => t),
        skills: form.skills.split(",").map(s => s.trim()).filter(s => s),
        prize: form.prize ? parseInt(form.prize) : 0
      };

      console.log("📤 Sending update payload:", payload);
      const response = await API.put(`/organizer/${id}`, payload);
      console.log("✅ Update successful:", response.data);
      
      // Success animation delay
      setTimeout(() => {
        navigate("/organizer/dashboard");
      }, 1500);
      
    } catch (err) {
      console.error("❌ Update failed", err);
      console.error("Error details:", err.response?.data);
      setError(err.response?.data?.message || "Failed to update event");
      setIsSubmitting(false);
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-gray-900 to-purple-900/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/10 via-transparent to-purple-600/10"></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="text-center relative z-10">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500 border-b-transparent rounded-full animate-spin mx-auto mb-6 animation-delay-1000"></div>
          </div>
          <p className="text-cyan-300 font-mono text-lg animate-pulse tracking-wider">
            INITIALIZING EDITOR...
          </p>
          <p className="text-gray-400 text-sm mt-2 animate-pulse">Loading event data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-cyan-900/30 to-purple-900/30"></div>
        
        {/* Animated Grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 243, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 243, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${4 + Math.random() * 6}s`
              }}
            />
          ))}
        </div>

        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slower"></div>
      </div>

      {/* Success Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-green-500/10 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center bg-gray-900/90 border border-green-500/30 rounded-2xl p-8 shadow-2xl shadow-green-500/20 animate-scale-in">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FiSave className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">SUCCESS!</h3>
            <p className="text-gray-300">Event updated successfully</p>
            <div className="mt-4 w-24 h-1 bg-green-500 rounded-full mx-auto animate-progress"></div>
          </div>
        </div>
      )}

      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-8 animate-slide-down">
            <Link 
              to="/organizer/dashboard"
              className="inline-flex items-center gap-3 text-cyan-400 hover:text-cyan-300 transition-all duration-300 mb-6 group relative pl-2"
            >
              <div className="relative">
                <FiArrowLeft className="text-xl group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -inset-2 bg-cyan-400/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </div>
              <span className="font-mono tracking-wide group-hover:translate-x-1 transition-transform duration-300">
                BACK TO DASHBOARD
              </span>
            </Link>
            
            <div className="relative">
              <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3 tracking-tight">
                EDIT MISSION PROTOCOL
              </h1>
              <p className="text-cyan-200 font-mono text-sm tracking-widest opacity-80">
                UPDATE EVENT PARAMETERS
              </p>
              <div className="absolute -bottom-2 left-0 w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-6 bg-red-500/10 border border-red-400/30 rounded-2xl backdrop-blur-sm animate-shake relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent animate-shine"></div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Enhanced Edit Form */}
          <form onSubmit={handleSubmit} className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-50 animate-glow"></div>
            
            <div className="relative bg-gray-900/80 backdrop-blur-md border border-cyan-400/20 rounded-2xl p-8 shadow-2xl animate-fade-in-up">
              {/* Form Grid */}
              <div className="space-y-8">
                {/* Title & Description */}
                <div className="grid gap-8">
                  <AnimatedInput
                    label="MISSION TITLE"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="ENTER EVENT TITLE"
                    icon={FiEdit3}
                  />
                  
                  <div className="group">
                    <label className="flex items-center gap-2 text-cyan-300 text-sm font-bold mb-3 font-mono tracking-wide">
                      <FiZap className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                      MISSION BRIEFING
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full bg-gray-800/50 border border-cyan-400/20 rounded-xl px-4 py-4 text-white placeholder-cyan-400/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 font-mono resize-none group-hover:border-cyan-400/40"
                      placeholder="DESCRIBE YOUR MISSION OBJECTIVES..."
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatedInput
                    label="START TIME"
                    name="start"
                    type="datetime-local"
                    value={form.start}
                    onChange={handleChange}
                    required
                    icon={FiCalendar}
                  />
                  
                  <AnimatedInput
                    label="END TIME"
                    name="end"
                    type="datetime-local"
                    value={form.end}
                    onChange={handleChange}
                    required
                    icon={FiCalendar}
                  />
                </div>

                {/* Location & URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatedInput
                    label="DEPLOYMENT ZONE"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="PHYSICAL OR VIRTUAL LOCATION"
                    icon={FiMapPin}
                  />
                  
                  <AnimatedInput
                    label="MISSION PORTAL"
                    name="url"
                    type="url"
                    value={form.url}
                    onChange={handleChange}
                    placeholder="HTTPS://EXAMPLE.COM/EVENT"
                    icon={FiGlobe}
                  />
                </div>

                {/* Prize Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatedInput
                    label="BOUNTY VALUE"
                    name="prize"
                    type="number"
                    value={form.prize}
                    onChange={handleChange}
                    placeholder="0"
                    icon={FiAward}
                  />
                  
                  <div className="group">
                    <label className="flex items-center gap-2 text-cyan-300 text-sm font-bold mb-3 font-mono tracking-wide">
                      <FiAward className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                      BOUNTY TYPE
                    </label>
                    <select
                      name="prizeType"
                      value={form.prizeType}
                      onChange={handleChange}
                      className="w-full bg-gray-800/50 border border-cyan-400/20 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 font-mono appearance-none group-hover:border-cyan-400/40"
                    >
                      <option value="unknown">SELECT BOUNTY TYPE</option>
                      <option value="cash">CREDITS (CASH)</option>
                      <option value="goods">RESOURCES (GOODS)</option>
                      <option value="scholarship">KNOWLEDGE ACCESS (SCHOLARSHIP)</option>
                      <option value="internship">TRAINING PROGRAM (INTERNSHIP)</option>
                      <option value="job_offer">COMMISSION (JOB OFFER)</option>
                      <option value="other">OTHER REWARDS</option>
                    </select>
                  </div>
                </div>

                {/* Themes & Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatedInput
                    label="MISSION THEMES"
                    name="themes"
                    value={form.themes}
                    onChange={handleChange}
                    placeholder="AI, WEB3, SUSTAINABILITY, ETC."
                    icon={FiTag}
                  />
                  
                  <AnimatedInput
                    label="REQUIRED SKILLS"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="JAVASCRIPT, DESIGN, MARKETING, ETC."
                    icon={FiTag}
                  />
                </div>

                {/* Banner Image */}
                <div className="group">
                  <label className="flex items-center gap-2 text-cyan-300 text-sm font-bold mb-3 font-mono tracking-wide">
                    <FiImage className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                    MISSION BANNER
                  </label>
                  <input
                    type="url"
                    name="bannerImage"
                    value={form.bannerImage}
                    onChange={handleChange}
                    className="w-full bg-gray-800/50 border border-cyan-400/20 rounded-xl px-4 py-4 text-white placeholder-cyan-400/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 font-mono group-hover:border-cyan-400/40"
                    placeholder="HTTPS://EXAMPLE.COM/BANNER.JPG"
                  />
                  {form.bannerImage && (
                    <div className="mt-3 animate-fade-in">
                      <img 
                        src={form.bannerImage} 
                        alt="Banner preview" 
                        className="w-full h-40 object-cover rounded-xl border border-cyan-400/30 shadow-lg shadow-cyan-400/10 transition-all duration-500 hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-cyan-400/20">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 active:scale-95 transition-all duration-300 font-black font-mono tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FiSave className="text-lg relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative z-10">
                    {saving ? "UPLOADING PROTOCOL..." : "UPDATE MISSION"}
                  </span>
                  {saving && (
                    <div className="absolute right-4 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>
                
                <Link
                  to="/organizer/dashboard"
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-800/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:border-cyan-400/30 hover:text-cyan-300 transform hover:scale-105 active:scale-95 transition-all duration-300 font-mono tracking-wider text-center"
                >
                  <FiArrowLeft className="text-lg" />
                  ABORT MISSION
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Enhanced Global Styles */}
      <style jsx global>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.15; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 4s ease-in-out infinite;
        }
        
        .animate-slide-down {
          animation: slideDown 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-shine {
          animation: shine 2s ease-in-out infinite;
        }
        
        .animate-progress {
          animation: progress 1.5s ease-in-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.5);
        }
      `}</style>
    </div>
  );
}

// Enhanced Animated Input Component
function AnimatedInput({ label, icon: Icon, ...props }) {
  return (
    <div className="group">
      <label className="flex items-center gap-2 text-cyan-300 text-sm font-bold mb-3 font-mono tracking-wide">
        <Icon className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-gray-800/50 border border-cyan-400/20 rounded-xl px-4 py-4 text-white placeholder-cyan-400/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 font-mono group-hover:border-cyan-400/40"
      />
    </div>
  );
}