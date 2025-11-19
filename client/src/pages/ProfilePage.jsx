import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { fetchMyBookmarks, fetchMyParticipations } from "../services/api";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/events/EventCard";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUser, FaEnvelope, FaGraduationCap, FaMapMarker, FaCalendar, 
  FaCode, FaCog, FaBookmark, FaTrophy, FaPlus, FaTimes,
  FaRocket, FaStar, FaBolt, FaLock
} from "react-icons/fa";

// Common suggestions for better UX
const ROLE_SUGGESTIONS = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "UI/UX Designer", "Data Scientist", "AI/ML Engineer", "DevOps Engineer", "Mobile Developer", "Product Manager", "QA Engineer"];
const DOMAIN_SUGGESTIONS = ["AI/ML", "Web Development", "Mobile Development", "Cybersecurity", "Data Science", "Blockchain/Web3", "Cloud Computing", "DevOps", "UI/UX Design", "Game Development"];
const SKILL_SUGGESTIONS = ["JavaScript", "Python", "React", "Node.js", "TypeScript", "Java", "C++", "AWS", "Docker", "Kubernetes", "TensorFlow", "PyTorch", "MongoDB", "PostgreSQL", "GraphQL"];

export default function ProfilePage() {
  const { user, fetchMe } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    skills: [],
    interests: [],
    preferredRoles: [],
    domainInterest: [],
    college: "",
    location: "",
    graduationYear: "",
  });

  const [bookmarks, setBookmarks] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      navigate("/organizer");
      return;
    }

    initializeForm();
    loadBookmarks();
    loadParticipations();
  }, [user]);

  const initializeForm = () => {
    setForm({
      name: user.name || "",
      bio: user.bio || "",
      skills: user.skills || [],
      interests: user.interests || [],
      preferredRoles: user.preferredRoles || [],
      domainInterest: user.domainInterest || [],
      college: user.college || "",
      location: user.location || "",
      graduationYear: user.graduationYear || "",
    });
  };

  const loadBookmarks = async () => {
    try {
      const data = await fetchMyBookmarks();
      setBookmarks(data);
    } catch (err) {
      console.error("Failed to load bookmarks", err);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipations = async () => {
    try {
      const list = await fetchMyParticipations();
      setParticipations(list);
    } catch (err) {
      console.error("Failed to load participations", err);
    }
  };

  const addToArrayField = (field, value) => {
    if (!value.trim()) return;
    const trimmedValue = value.trim();
    setForm((prev) => ({
      ...prev,
      [field]: [...new Set([...prev[field], trimmedValue])],
    }));
  };

  const removeFromArrayField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((x) => x !== value),
    }));
  };

  const handleArrayInput = (field, value) => {
    const items = value.split(",")
      .map(item => item.trim())
      .filter(item => item !== "");
    setForm(prev => ({
      ...prev,
      [field]: [...new Set(items)]
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.name.trim()) {
      setSaveMessage("❌ IDENTITY LABEL REQUIRED");
      return;
    }

    if (form.skills.length === 0) {
      setSaveMessage("❌ MINIMUM ONE SKILL REQUIRED");
      return;
    }

    setSaving(true);
    setSaveMessage("");
    
    try {
      const res = await api.put("/users/profile", form);
      if (res.data?.user) {
        await fetchMe();
        setEditing(false);
        setSaveMessage("✅ PROFILE UPDATE SUCCESSFUL");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (err) {
      console.error("Save profile error", err);
      setSaveMessage(err.response?.data?.message || "PROFILE UPDATE FAILED");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    initializeForm();
    setSaveMessage("");
  };

  if (!user) return null;
  
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Enhanced Loading Background */}
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
    <div className="min-h-screen bg-black text-cyan-100 relative overflow-hidden">
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
          {[...Array(20)].map((_, i) => (
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

      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-30 animate-glow" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 relative z-10">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-28 h-28 rounded-2xl border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/30 object-cover"
                />
                <motion.div 
                  className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-black shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaUser className="text-black text-sm" />
                </motion.div>
              </motion.div>
              
              <div className="flex-1">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider mb-3"
                >
                  {form.name}
                </motion.h1>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 text-purple-300 mb-4"
                >
                  <FaEnvelope className="text-sm" />
                  <span className="font-mono text-sm tracking-wide">{user.email}</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-wrap gap-3"
                >
                  <span className="px-4 py-2 bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 rounded-xl text-sm font-black uppercase tracking-wide shadow-lg">
                    {user.role}
                  </span>
                  {user.college && (
                    <span className="px-4 py-2 bg-purple-400/20 text-purple-400 border border-purple-400/30 rounded-xl text-sm font-black uppercase tracking-wide flex items-center gap-2 shadow-lg">
                      <FaGraduationCap className="text-xs" />
                      {user.college}
                    </span>
                  )}
                  {user.xp > 0 && (
                    <span className="px-4 py-2 bg-green-400/20 text-green-400 border border-green-400/30 rounded-xl text-sm font-black uppercase tracking-wide shadow-lg">
                      ⭐ {user.xp} XP
                    </span>
                  )}
                </motion.div>
              </div>
              
              <motion.div 
                className="flex gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >

{!editing ? (
  <motion.button
    onClick={() => setEditing(true)}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black rounded-xl hover:shadow-2xl hover:shadow-cyan-400/50 transition-all duration-300 uppercase tracking-wider text-sm border-2 border-cyan-400/50 hover:border-cyan-300 flex items-center gap-3 relative overflow-hidden"
  >
    {/* Glow effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 hover:opacity-20 transition-opacity duration-300" />
    <FaBolt className="text-sm relative z-10" />
    <span className="relative z-10">EDIT PROFILE</span>
    
    {/* Neon border glow */}
    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-xl blur-sm opacity-0 hover:opacity-70 transition-opacity duration-300 -z-10" />
  </motion.button>
) : (
  <div className="flex gap-4">
    <motion.button
      onClick={cancelEdit}
      whileHover={{ scale: 1.05, x: -5 }}
      whileTap={{ scale: 0.95 }}
      className="px-6 py-4 border-2 border-red-400/70 text-red-400 bg-red-400/10 rounded-xl hover:bg-red-400/20 hover:border-red-400 transition-all duration-300 uppercase tracking-wider text-sm font-black flex items-center gap-3 backdrop-blur-sm"
    >
      <FaTimes className="text-sm" />
      CANCEL
    </motion.button>
    <motion.button
      onClick={submit}
      disabled={saving}
      whileHover={{ scale: saving ? 1 : 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="px-6 py-4 bg-gradient-to-r from-green-500 to-cyan-600 text-white font-black rounded-xl hover:shadow-2xl hover:shadow-green-400/50 disabled:opacity-50 transition-all duration-300 uppercase tracking-wider text-sm border-2 border-green-400/50 hover:border-green-300 flex items-center gap-3 relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 opacity-0 hover:opacity-20 transition-opacity duration-300" />
      {saving ? (
        <span className="flex items-center gap-2 relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
          SAVING...
        </span>
      ) : (
        <>
          <FaStar className="text-sm relative z-10" />
          <span className="relative z-10">SAVE PROFILE</span>
        </>
      )}
      
      {/* Neon border glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-cyan-400 rounded-xl blur-sm opacity-0 hover:opacity-70 transition-opacity duration-300 -z-10" />
    </motion.button>
  </div>
)}
              </motion.div>
            </div>
            
            <AnimatePresence>
              {saveMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mt-6 p-4 rounded-xl border-2 text-sm font-black uppercase tracking-wide backdrop-blur-sm ${
                    saveMessage.includes("✅") 
                      ? "bg-green-400/10 text-green-400 border-green-400/30 shadow-lg shadow-green-400/20" 
                      : "bg-red-400/10 text-red-400 border-red-400/30 shadow-lg shadow-red-400/20"
                  }`}
                >
                  {saveMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Enhanced Navigation Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border-b border-cyan-400/20 mb-8"
          >
            <nav className="flex space-x-8">
              {[
                { id: "profile", label: "PROFILE DATA", icon: FaUser },
                { id: "bookmarks", label: "BOOKMARKS", icon: FaBookmark },
                { id: "hackathons", label: "PROGRAMS", icon: FaTrophy },
                { id: "settings", label: "SECURITY", icon: FaLock }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`py-4 px-2 border-b-2 font-black text-sm uppercase tracking-wider flex items-center gap-3 transition-all duration-300 relative ${
                    activeTab === tab.id
                      ? "border-cyan-400 text-cyan-400"
                      : "border-transparent text-gray-400 hover:text-cyan-300"
                  }`}
                >
                  <tab.icon className="text-lg" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                      layoutId="activeTab"
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Enhanced Profile Tab */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "profile" && (
                <motion.div 
                  className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-30" />
                  <div className="relative z-10">
                    {!editing ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                          <ProfileSection title="BIO" content={user.bio || "NO BIO DATA"} />
                          <ProfileSection title="EDUCATION INSTITUTE" content={user.college || "NOT SPECIFIED"} icon={FaGraduationCap} />
                          <ProfileSection title="LOCATION DATA" content={user.location || "NOT SPECIFIED"} icon={FaMapMarker} />
                          <ProfileSection title="GRADUATION YEAR" content={user.graduationYear || "NOT SPECIFIED"} icon={FaCalendar} />
                        </div>
                        <div className="space-y-8">
                          <ProfileSection title="TECHNICAL SKILLS" list={user.skills} icon={FaCode} />
                          <ProfileSection title="INTEREST DOMAINS" list={user.interests} />
                          <ProfileSection title="PREFERRED ROLES" list={user.preferredRoles} />
                          <ProfileSection title="SPECIALIZATION AREAS" list={user.domainInterest} />
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={submit} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <TextInput
                            label="IDENTITY LABEL *"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            icon={FaUser}
                          />
                          <TextInput
                            label="EDUCATION INSTITUTE"
                            value={form.college}
                            onChange={(e) => setForm({ ...form, college: e.target.value })}
                            icon={FaGraduationCap}
                          />
                          <TextInput
                            label="LOCATION DATA"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            icon={FaMapMarker}
                          />
                          <TextInput
                            label="GRADUATION YEAR"
                            type="number"
                            value={form.graduationYear}
                            onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                            icon={FaCalendar}
                          />
                        </div>

                        <TextArea
                          label="IDENTITY DESCRIPTION"
                          value={form.bio}
                          onChange={(e) => setForm({ ...form, bio: e.target.value })}
                          placeholder="Describe your digital presence, technical interests, and mission objectives..."
                          rows={4}
                        />

                        <EnhancedMultiInput
                          label="TECHNICAL SKILLS *"
                          items={form.skills}
                          onAdd={(v) => addToArrayField("skills", v)}
                          onRemove={(v) => removeFromArrayField("skills", v)}
                          suggestions={SKILL_SUGGESTIONS}
                          placeholder="Add technical capabilities (JavaScript, Python, React...)"
                        />

                        <EnhancedMultiInput
                          label="PREFERRED ROLES"
                          items={form.preferredRoles}
                          onAdd={(v) => addToArrayField("preferredRoles", v)}
                          onRemove={(v) => removeFromArrayField("preferredRoles", v)}
                          suggestions={ROLE_SUGGESTIONS}
                          placeholder="Add combat roles (Frontend, Backend, AI Specialist...)"
                        />

                        <EnhancedMultiInput
                          label="SPECIALIZATION AREAS"
                          items={form.domainInterest}
                          onAdd={(v) => addToArrayField("domainInterest", v)}
                          onRemove={(v) => removeFromArrayField("domainInterest", v)}
                          suggestions={DOMAIN_SUGGESTIONS}
                          placeholder="Add domain expertise (AI, Web3, Cybersecurity...)"
                        />

                        <div>
                          <label className="block text-sm font-black text-cyan-400 mb-3 uppercase tracking-wider">
                            INTEREST FIELDS
                          </label>
                          <input
                            value={form.interests.join(", ")}
                            onChange={(e) => handleArrayInput("interests", e.target.value)}
                            placeholder="e.g., Machine Learning, Open Source, Startup Ecosystems"
                            className="w-full bg-black/50 border border-cyan-400/30 px-4 py-3 rounded-xl text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 font-mono"
                          />
                          <p className="text-xs text-cyan-400/60 mt-2 uppercase tracking-wide">Separate multiple interests with commas</p>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Enhanced Bookmarks Tab */}
              {activeTab === "bookmarks" && (
                <div>
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-black text-cyan-400 mb-8 uppercase tracking-wider flex items-center gap-4"
                  >
                    <FaBookmark className="text-cyan-400 text-2xl" />
                    BOOKMARKED PROGRAMS ({bookmarks.length})
                  </motion.h2>
                  {bookmarks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 border-dashed rounded-2xl p-16 text-center relative overflow-hidden"
                    >
                      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-blue-500/5 rounded-3xl blur-xl" />
                      <div className="relative z-10">
                        <div className="text-8xl mb-8 text-cyan-400/30">⭐</div>
                        <h3 className="text-2xl font-black text-cyan-400 mb-6 uppercase tracking-wider">NO BOOKMARKS DETECTED</h3>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto uppercase tracking-wide text-lg">
                          Programs you bookmark will be stored here for rapid access and deployment.
                        </p>
                        <motion.button 
                          onClick={() => navigate("/events")}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black rounded-xl hover:shadow-2xl hover:shadow-cyan-400/30 transition-all duration-300 uppercase tracking-wider text-lg border border-transparent hover:border-cyan-300 flex items-center gap-3 mx-auto"
                        >
                          <FaRocket className="text-lg" />
                          SCAN PROGRAMS
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {bookmarks.map((ev, index) => (
                        <motion.div 
                          key={ev._id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          className="transform transition-all duration-300"
                        >
                          <EventCard event={ev} onBookmarkToggled={loadBookmarks} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Hackathons Tab */}
              {activeTab === "hackathons" && (
                <div>
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-black text-cyan-400 mb-8 uppercase tracking-wider flex items-center gap-4"
                  >
                    <FaTrophy className="text-cyan-400 text-2xl" />
                    ACTIVE PROGRAMS ({participations.length})
                  </motion.h2>
                  {participations.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 border-dashed rounded-2xl p-16 text-center relative overflow-hidden"
                    >
                      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-blue-500/5 rounded-3xl blur-xl" />
                      <div className="relative z-10">
                        <div className="text-8xl mb-8 text-cyan-400/30">🎯</div>
                        <h3 className="text-2xl font-black text-cyan-400 mb-6 uppercase tracking-wider">NO ACTIVE DEPLOYMENTS</h3>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto uppercase tracking-wide text-lg">
                          Programs you join will appear in this deployment queue.
                        </p>
                        <motion.button 
                          onClick={() => navigate("/events")}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black rounded-xl hover:shadow-2xl hover:shadow-cyan-400/30 transition-all duration-300 uppercase tracking-wider text-lg border border-transparent hover:border-cyan-300 flex items-center gap-3 mx-auto"
                        >
                          <FaRocket className="text-lg" />
                          DEPLOY TO PROGRAM
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {participations.map((p, index) => {
                        const ev = p.event || p;
                        return (
                          <motion.div 
                            key={p._id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="relative transform transition-all duration-300"
                          >
                            <div className="absolute top-6 left-6 bg-green-400 text-black text-sm px-4 py-2 rounded-full z-10 font-black uppercase tracking-wide border-2 border-green-400 shadow-lg">
                              DEPLOYED
                            </div>
                            <EventCard event={ev} onBookmarkToggled={loadBookmarks} />
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Settings Tab */}
              {activeTab === "settings" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-30" />
                  <div className="relative z-10">
                    {user?.password ? (
                      <ChangePasswordForm />
                    ) : (
                      <div className="text-center py-16">
                        <div className="text-8xl mb-8 text-cyan-400/30">🔐</div>
                        <h3 className="text-2xl font-black text-cyan-400 mb-6 uppercase tracking-wider">EXTERNAL IDENTITY PROVIDER</h3>
                        <p className="text-gray-400 max-w-md mx-auto uppercase tracking-wide text-lg mb-8">
                          Identity authenticated via {user.googleId ? "GOOGLE" : user.githubId ? "GITHUB" : "LINKEDIN"} protocol.
                          Security credentials managed through external provider systems.
                        </p>
                        <div className="px-6 py-4 bg-cyan-400/10 border-2 border-cyan-400/30 rounded-xl inline-block backdrop-blur-sm">
                          <span className="text-cyan-400 font-mono text-lg uppercase tracking-wider font-black">
                            {user.googleId ? "GOOGLE OAUTH" : user.githubId ? "GITHUB OAUTH" : "LINKEDIN OAUTH"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
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

/* Enhanced TRON Helper Components */
function ProfileSection({ title, content, list, icon: Icon }) {
  return (
    <motion.div 
      className="border-l-4 border-cyan-400/50 pl-6 py-2"
      whileHover={{ x: 5 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <h3 className="font-black text-cyan-400 mb-4 uppercase tracking-wider text-lg flex items-center gap-3">
        {Icon && <Icon className="text-cyan-400 text-lg" />}
        {title}
      </h3>
      {list ? (
        <div className="flex flex-wrap gap-3">
          {list.length ? (
            list.map((x) => (
              <motion.span 
                key={x} 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-4 py-3 bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 rounded-xl text-sm font-black uppercase tracking-wide shadow-lg hover:bg-cyan-400/20 transition-all duration-300 cursor-default"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                {x}
              </motion.span>
            ))
          ) : (
            <p className="text-gray-500 italic uppercase tracking-wide text-lg">NO DATA INPUT</p>
          )}
        </div>
      ) : (
        <p className="text-gray-300 whitespace-pre-wrap font-mono text-lg leading-relaxed">{content}</p>
      )}
    </motion.div>
  );
}

function TextInput({ label, icon: Icon, ...props }) {
  return (
    <motion.div 
      className="group"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <label className="block text-sm font-black text-cyan-400 mb-4 uppercase tracking-wider text-lg flex items-center gap-3">
        {Icon && <Icon className="text-cyan-400 text-lg" />}
        {label}
      </label>
      <div className="relative">
        <input 
          {...props} 
          className="w-full bg-black/50 border-2 border-cyan-400/30 px-6 py-4 rounded-xl text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 font-mono text-lg group-hover:border-cyan-400/50" 
        />
      </div>
    </motion.div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <motion.div 
      className="group"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <label className="block text-sm font-black text-cyan-400 mb-4 uppercase tracking-wider text-lg">
        {label}
      </label>
      <textarea 
        {...props} 
        className="w-full bg-black/50 border-2 border-cyan-400/30 px-6 py-4 rounded-xl text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 font-mono text-lg resize-vertical group-hover:border-cyan-400/50 leading-relaxed" 
      />
    </motion.div>
  );
}

function EnhancedMultiInput({ label, items, onAdd, onRemove, suggestions, placeholder }) {
  const [value, setValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = value.trim();
      if (val && !items.includes(val)) {
        onAdd(val);
        setValue("");
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!items.includes(suggestion)) {
      onAdd(suggestion);
    }
    setValue("");
    setShowSuggestions(false);
  };

  return (
    <motion.div 
      className="group"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <label className="block text-sm font-black text-cyan-400 mb-4 uppercase tracking-wider text-lg">
        {label}
      </label>
      
      {/* Selected Items */}
      <div className="flex flex-wrap gap-3 mb-6">
        {items.map((item) => (
          <motion.span
            key={item}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-4 py-3 bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 rounded-xl text-sm font-black flex items-center gap-3 group-hover:bg-cyan-400/30 transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            {item}
            <motion.button 
              type="button" 
              onClick={() => onRemove(item)} 
              className="text-cyan-400 hover:text-red-400 text-sm font-black transition-colors duration-200"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>
          </motion.span>
        ))}
      </div>

      {/* Input with Suggestions */}
      <div className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="w-full bg-black/50 border-2 border-cyan-400/30 px-6 py-4 rounded-xl text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 font-mono text-lg group-hover:border-cyan-400/50"
        />
        
        {showSuggestions && suggestions && value && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-gray-900 border-2 border-cyan-400/30 rounded-xl shadow-2xl z-10 mt-2 max-h-48 overflow-y-auto backdrop-blur-md"
          >
            {suggestions
              .filter(suggestion => 
                suggestion.toLowerCase().includes(value.toLowerCase()) &&
                !items.includes(suggestion)
              )
              .map((suggestion) => (
                <motion.button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="w-full text-left px-6 py-4 hover:bg-cyan-400/10 text-cyan-100 text-lg border-b border-cyan-400/10 last:border-b-0 transition-all duration-200 font-mono"
                >
                  {suggestion}
                </motion.button>
              ))}
          </motion.div>
        )}
      </div>
      
      <p className="text-sm text-cyan-400/60 mt-3 uppercase tracking-wide">Input data and press ENTER for rapid addition</p>
    </motion.div>
  );
}

function ChangePasswordForm() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      setMessage("❌ SECURITY CIPHER MISMATCH");
      return;
    }

    if (form.newPassword.length < 6) {
      setMessage("❌ CIPHER MUST BE 6+ CHARACTERS");
      return;
    }

    try {
      setLoading(true);
      const res = await api.put("/auth/change-password", {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      setMessage(`✅ ${res.data.message}`);
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "CIPHER UPDATE FAILED");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setMessage("");
  };

  return (
    <div className="max-w-2xl">
      <motion.h3 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-black text-cyan-400 mb-8 uppercase tracking-wider"
      >
        UPDATE SECURITY CIPHER
      </motion.h3>
      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-lg font-black text-cyan-400 mb-4 uppercase tracking-wider">CURRENT CIPHER</label>
          <input
            type="password"
            value={form.oldPassword}
            onChange={(e) => handleChange("oldPassword", e.target.value)}
            className="w-full bg-black/50 border-2 border-cyan-400/30 px-6 py-4 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 font-mono text-lg"
            required
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-lg font-black text-cyan-400 mb-4 uppercase tracking-wider">NEW CIPHER</label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => handleChange("newPassword", e.target.value)}
            className="w-full bg-black/50 border-2 border-cyan-400/30 px-6 py-4 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 font-mono text-lg"
            required
            minLength={6}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-lg font-black text-cyan-400 mb-4 uppercase tracking-wider">CONFIRM NEW CIPHER</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            className="w-full bg-black/50 border-2 border-cyan-400/30 px-6 py-4 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 font-mono text-lg"
            required
          />
        </motion.div>
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-6 rounded-xl border-2 text-lg font-black uppercase tracking-wide backdrop-blur-sm ${
                message.includes("✅") 
                  ? "bg-green-400/10 text-green-400 border-green-400/30 shadow-lg shadow-green-400/20" 
                  : "bg-red-400/10 text-red-400 border-red-400/30 shadow-lg shadow-red-400/20"
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black py-5 px-6 rounded-xl hover:shadow-2xl hover:shadow-cyan-400/30 disabled:opacity-50 transition-all duration-300 uppercase tracking-wider text-lg border border-transparent hover:border-cyan-300 flex items-center justify-center gap-4"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-black border-t-transparent rounded-full"
              />
              UPDATING...
            </span>
          ) : (
            <>
              <FaLock className="text-lg" />
              UPDATE CIPHER
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}