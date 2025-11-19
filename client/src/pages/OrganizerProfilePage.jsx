import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUser, 
  FiGlobe, 
  FiMapPin, 
  FiMail, 
  FiPhone, 
  FiLinkedin, 
  FiTwitter, 
  FiSave,
  FiUpload,
  FiArrowLeft,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiZap,
  FiEdit3,
  FiAward
} from "react-icons/fi";

export default function OrganizerProfilePage() {
  const { fetchMe } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const [form, setForm] = useState({
    name: "",
    organization: "",
    organizationDescription: "",
    bio: "",
    website: "",
    contactEmail: "",
    contactNumber: "",
    location: "",
    linkedin: "",
    twitter: "",
    avatar: "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get("/organizer/profile");
        if (res.data?.user) setForm(res.data.user);
      } catch (err) {
        console.error("Failed to load profile", err);
        showNotification('error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/organizer/profile", form);
      await fetchMe();
      showNotification('success', 'Profile updated successfully!');
      setTimeout(() => {
        navigate("/organizer/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Failed to update profile", err);
      showNotification('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/organizer/dashboard");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center relative overflow-hidden">
        {/* Enhanced Loading Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-gray-900 to-purple-900/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/10 via-transparent to-purple-600/10"></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-20 h-20 border-4 border-purple-500 border-b-transparent rounded-full mx-auto"
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-cyan-300 font-mono text-lg tracking-wider mb-2"
          >
            INITIALIZING PROTOCOL...
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-400 text-sm font-mono"
          >
            Loading identity matrix
          </motion.p>
        </motion.div>
      </div>
    );

  return (
    <div className="relative min-h-screen bg-[#050816] text-cyan-100 px-4 py-8 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-cyan-900/30 to-purple-900/30"></div>
        
        {/* Animated Grid */}
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
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
                y: [0, -100],
                x: [0, Math.random() * 100 - 50]
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Animated Orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.05, 0.15]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Enhanced Notification Popup */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 rounded-2xl p-6 backdrop-blur-xl border-2 shadow-2xl max-w-md w-full mx-4 ${
              notification.type === 'success' 
                ? 'bg-green-500/20 border-green-400/50 text-green-300 shadow-green-500/30' 
                : 'bg-red-500/20 border-red-400/50 text-red-300 shadow-red-500/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
                className={`p-3 rounded-full ${
                  notification.type === 'success' ? 'bg-green-500/30' : 'bg-red-500/30'
                }`}
              >
                {notification.type === 'success' ? (
                  <FiCheck className="text-green-400 text-xl" />
                ) : (
                  <FiAlertCircle className="text-red-400 text-xl" />
                )}
              </motion.div>
              <div className="flex-1">
                <p className="font-bold font-mono tracking-wide text-lg">
                  {notification.type === 'success' ? 'PROTOCOL UPDATED' : 'SYSTEM ERROR'}
                </p>
                <p className="text-sm opacity-90 mt-1">{notification.message}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setNotification({ show: false, type: '', message: '' })}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <FiX className="text-lg" />
              </motion.button>
            </div>
            {/* Progress Bar */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 4, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-1 rounded-full ${
                notification.type === 'success' ? 'bg-green-400' : 'bg-red-400'
              }`}
              style={{ originX: 0 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <motion.button
          onClick={handleCancel}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 text-cyan-300 hover:text-cyan-100 mb-8 transition-all duration-300 group relative pl-2"
        >
          <motion.div
            whileHover={{ rotate: -10 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <FiArrowLeft className="text-xl" />
          </motion.div>
          <span className="font-mono text-sm tracking-widest group-hover:translate-x-1 transition-transform duration-300">
            RETURN TO MISSION CONTROL
          </span>
          <div className="absolute -inset-3 bg-cyan-400/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4 tracking-tight"
          >
            IDENTITY PROTOCOL
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-cyan-200/80 font-mono text-sm tracking-widest uppercase"
          >
            Configure Your Mission Control Identity
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="h-1 w-48 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mt-6 shadow-lg shadow-cyan-400/50"
            style={{ originX: 0 }}
          />
        </motion.div>
      </div>

      {/* Enhanced Main Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, type: "spring" }}
        className="max-w-6xl mx-auto bg-[#0a0f1f]/80 border border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl space-y-8 relative overflow-hidden"
      >
        {/* Glowing Border Effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-50 animate-glow" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 rounded-3xl" />
        
        <div className="relative z-10">
          {/* Enhanced Avatar Section */}
          <motion.div 
            className="flex flex-col lg:flex-row items-center gap-8 p-8 bg-cyan-500/5 rounded-2xl border border-cyan-500/20 mb-8 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="relative"
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <img
                src={form.avatar || "/default-avatar.png"}
                alt="avatar"
                className="w-32 h-32 rounded-2xl border-2 border-cyan-400/50 object-cover shadow-2xl shadow-cyan-400/30"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
              <motion.div 
                className="absolute -bottom-3 -right-3 p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-2xl shadow-cyan-400/50"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiUpload className="text-white text-lg" />
              </motion.div>
              <div className="absolute -inset-4 bg-cyan-400/20 rounded-2xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
            <div className="flex-1 w-full">
              <TronInput
                label="IDENTITY MATRIX URL"
                name="avatar"
                value={form.avatar}
                onChange={handleChange}
                placeholder="https://protocol.com/avatar.jpg"
                icon={FiUpload}
              />
            </div>
          </motion.div>

          {/* Basic Info Grid */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TronInput
              label="COMMANDER NAME"
              name="name"
              value={form.name}
              onChange={handleChange}
              icon={FiUser}
              required
            />
            <TronInput
              label="ORGANIZATION UNIT"
              name="organization"
              value={form.organization}
              onChange={handleChange}
              icon={FiAward}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <TronTextArea
              label="ORGANIZATION PROTOCOL"
              name="organizationDescription"
              value={form.organizationDescription}
              onChange={handleChange}
              rows={4}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <TronTextArea
              label="PERSONAL BRIEFING"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
            />
          </motion.div>

          {/* Contact & Links Grid */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <TronInput
              label="COMMUNICATION PORTAL"
              name="website"
              value={form.website}
              onChange={handleChange}
              icon={FiGlobe}
            />
            <TronInput
              label="DEPLOYMENT ZONE"
              name="location"
              value={form.location}
              onChange={handleChange}
              icon={FiMapPin}
            />
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <TronInput
              label="SECURE CHANNEL"
              name="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              icon={FiMail}
            />
            <TronInput
              label="VOICE COMM"
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleChange}
              icon={FiPhone}
            />
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <TronInput
              label="NETWORK NODE"
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              icon={FiLinkedin}
            />
            <TronInput
              label="BROADCAST CHANNEL"
              name="twitter"
              value={form.twitter}
              onChange={handleChange}
              icon={FiTwitter}
            />
          </motion.div>

          {/* Enhanced Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-cyan-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              type="button"
              onClick={handleCancel}
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border border-cyan-500/40 text-cyan-300 rounded-xl hover:bg-cyan-500/10 hover:text-white transition-all duration-300 font-bold font-mono tracking-wide flex items-center justify-center gap-3 flex-1"
            >
              <FiX className="text-lg" />
              ABORT PROTOCOL
            </motion.button>
            
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-black font-mono tracking-wide flex items-center justify-center gap-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              {saving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full relative z-10"
                  />
                  <span className="relative z-10">UPLOADING MATRIX...</span>
                </>
              ) : (
                <>
                  <FiSave className="text-lg relative z-10" />
                  <span className="relative z-10">SAVE IDENTITY</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </motion.form>

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
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 4s ease-in-out infinite;
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

/* ───────── Enhanced Input Component ───────── */
function TronInput({ label, icon: Icon, required, ...props }) {
  return (
    <motion.div 
      className="space-y-3 group"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <label className="block text-cyan-300 font-mono text-sm tracking-widest uppercase">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <motion.div 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 group-focus-within:text-cyan-300 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
          >
            <Icon />
          </motion.div>
        )}
        <input
          {...props}
          className={`w-full bg-black/40 border-2 border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder-cyan-400/40 transition-all duration-300 backdrop-blur-sm font-mono ${
            Icon ? 'pl-12 pr-4' : 'px-4'
          } py-4 hover:border-cyan-400/50`}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 group-focus-within:w-full"
          whileHover={{ width: "100%" }}
        />
      </div>
    </motion.div>
  );
}

/* ───────── Enhanced TextArea Component ───────── */
function TronTextArea({ label, icon: Icon, required, ...props }) {
  return (
    <motion.div 
      className="space-y-3 group"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <label className="block text-cyan-300 font-mono text-sm tracking-widest uppercase">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <motion.div 
            className="absolute left-4 top-4 text-cyan-400 group-focus-within:text-cyan-300 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
          >
            <Icon />
          </motion.div>
        )}
        <textarea
          {...props}
          className={`w-full bg-black/40 border-2 border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder-cyan-400/40 transition-all duration-300 resize-none backdrop-blur-sm font-mono ${
            Icon ? 'pl-12 pr-4' : 'px-4'
          } py-4 hover:border-cyan-400/50`}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 group-focus-within:w-full"
          whileHover={{ width: "100%" }}
        />
      </div>
    </motion.div>
  );
}