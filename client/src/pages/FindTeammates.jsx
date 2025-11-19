// src/pages/FindTeammates.jsx
import { useState, useEffect } from "react";
import { findTeammates } from "../services/api";
import { Link } from "react-router-dom";
import SendInvitationModal from "../components/invitaions/SendInvitationModal";
import { FiUsers, FiSearch, FiFilter, FiX, FiZap, FiUser, FiMapPin, FiAward, FiStar } from "react-icons/fi";
import { FaRobot, FaBolt, FaUserAstronaut, FaNetworkWired } from "react-icons/fa";

// Common domain interests for suggestions
const DOMAIN_SUGGESTIONS = ["AI/ML", "Web Development", "Mobile Development", "Cybersecurity", "Data Science", "Blockchain/Web3", "Cloud Computing", "DevOps", "UI/UX Design", "Game Development"];

export default function FindTeammates() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        college: "",
        location: "",
        domainInterest: "",
        gradYearMin: "",
        gradYearMax: "",
        skills: "",
    });

    // Invitation modal state
    const [selectedUser, setSelectedUser] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // Animation state
    const [pulseIndex, setPulseIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPulseIndex(prev => (prev + 1) % 3);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    async function handleSearch(e) {
        e.preventDefault();
        if (!query.trim()) {
            setError("ENTER SEARCH PARAMETERS");
            return;
        }

        setLoading(true);
        setError("");
        setSearchPerformed(true);

        try {
            // Build filters object, only include non-empty values
            const filterPayload = {};
            if (filters.college) filterPayload.college = filters.college;
            if (filters.location) filterPayload.location = filters.location;
            if (filters.domainInterest) filterPayload.domainInterest = [filters.domainInterest];
            if (filters.skills) filterPayload.skills = filters.skills;
            if (filters.gradYearMin && filters.gradYearMax) {
                filterPayload.gradYearRange = [
                    Number(filters.gradYearMin),
                    Number(filters.gradYearMax)
                ];
            }

            const payload = {
                query: query.trim(),
                filters: Object.keys(filterPayload).length > 0 ? filterPayload : undefined,
            };

            const data = await findTeammates(payload);
            setResults(data?.results || []);

            if (data?.results?.length === 0) {
                setError("NO COMBATANTS FOUND. ADJUST SEARCH PARAMETERS.");
            }
        } catch (err) {
            console.error("Find teammates error:", err);
            setError(err.response?.data?.message || "SEARCH FAILED. RETRY SEQUENCE.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    function handleFilterChange(e) {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    }

    function clearFilters() {
        setFilters({
            college: "",
            location: "",
            domainInterest: "",
            gradYearMin: "",
            gradYearMax: "",
            skills: "",
        });
    }

    function handleSuggestionClick(suggestion) {
        setQuery(suggestion);
    }

    // Invitation handlers
    const handleSendInvite = (user) => {
        setSelectedUser(user);
        setShowInviteModal(true);
    };

    const handleInviteSuccess = () => {
        setShowInviteModal(false);
        setSelectedUser(null);
        // You can replace this with a TRON-style notification
        console.log("INVITATION TRANSMITTED SUCCESSFULLY");
    };

    const handleInviteClose = () => {
        setShowInviteModal(false);
        setSelectedUser(null);
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== "");

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
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center pulse-glow">
                            <FaNetworkWired className="text-black text-3xl" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider mb-4">
                        FIND PEOPLE
                    </h1>
                    <p className="text-cyan-300 text-lg uppercase tracking-wide max-w-2xl mx-auto font-mono">
                        DEPLOY AI-POWERED SCANNER TO LOCATE IDEAL TEAM MEMBERS FOR YOUR MISSION
                    </p>
                </div>

                {/* Quick Search Suggestions */}
                <div className="mb-8">
                    <p className="text-cyan-400 text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FaBolt className="text-cyan-400" />
                        RAPID DEPLOYMENT PROTOCOLS
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {DOMAIN_SUGGESTIONS.map((suggestion, index) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-4 py-2 bg-cyan-400/10 border border-cyan-400/30 rounded-lg hover:bg-cyan-400/20 hover:border-cyan-400 transition-all duration-300 text-cyan-300 text-sm font-mono uppercase tracking-wide group"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {suggestion}
                                <div className="w-0 group-hover:w-full h-0.5 bg-cyan-400 transition-all duration-300 mt-1"></div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search & Filters Form */}
                <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-8 shadow-2xl mb-8">
                    {/* Main Search */}
                    <form onSubmit={handleSearch}>
                        <div className="flex flex-col lg:flex-row gap-4 mb-6">
                            <div className="flex-1 relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiSearch className="text-cyan-400 group-hover:text-purple-400 transition-colors duration-300" />
                                </div>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setError("");
                                    }}
                                    placeholder="DESCRIBE MISSION REQUIREMENTS: 'REACT FRONTEND COMBATANT', 'AI SPECIALIST FOR DIGITAL ASSAULT'..."
                                    className="w-full bg-black/50 border-2 border-cyan-400/30 rounded-xl pl-12 pr-4 py-4 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 uppercase tracking-wide font-mono text-sm"
                                    required
                                />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 uppercase tracking-widest border-2 border-cyan-300/50 hover:border-cyan-200 min-w-[160px] flex items-center justify-center gap-3 tron-glow"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-300"></div>
                                        <span className="text-glow">SCANNING...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaBolt className="text-cyan-300" />
                                        <span className="text-glow">INITIATE SCAN</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Filters Toggle */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-3 text-cyan-400 hover:text-purple-400 transition-colors duration-300 group"
                            >
                                <div className={`p-2 border border-cyan-400/30 rounded-lg group-hover:border-cyan-400 transition-all duration-300 ${showFilters ? 'bg-cyan-400/20' : ''}`}>
                                    <FiFilter className="text-lg" />
                                </div>
                                <span className="font-mono uppercase tracking-wide text-sm">
                                    {showFilters ? "HIDE" : "DEPLOY"} FILTERS
                                </span>
                            </button>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors duration-300 font-mono uppercase tracking-wide text-sm"
                                >
                                    <FiX />
                                    PURGE FILTERS
                                </button>
                            )}
                        </div>

                        {/* Filter Inputs */}
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-black/30 rounded-xl border border-cyan-400/20">
                                <div className="relative group">
                                    <label className="block text-cyan-400 text-sm font-black uppercase tracking-wider mb-3">EDUCATION INSTITUTE</label>
                                    <input
                                        type="text"
                                        name="college"
                                        value={filters.college}
                                        onChange={handleFilterChange}
                                        placeholder="ANY INSTITUTE"
                                        className="w-full bg-black/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 transition-all duration-300 font-mono uppercase tracking-wide"
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="block text-cyan-400 text-sm font-black uppercase tracking-wider mb-3">LOCATION DATA</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={filters.location}
                                        onChange={handleFilterChange}
                                        placeholder="ANY LOCATION"
                                        className="w-full bg-black/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 transition-all duration-300 font-mono uppercase tracking-wide"
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="block text-cyan-400 text-sm font-black uppercase tracking-wider mb-3">SPECIALIZATION DOMAIN</label>
                                    <select
                                        name="domainInterest"
                                        value={filters.domainInterest}
                                        onChange={handleFilterChange}
                                        className="w-full bg-black/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-cyan-100 focus:outline-none focus:border-cyan-400 transition-all duration-300 font-mono uppercase tracking-wide appearance-none"
                                    >
                                        <option value="">ANY DOMAIN</option>
                                        {DOMAIN_SUGGESTIONS.map((domain) => (
                                            <option key={domain} value={domain} className="bg-gray-900 uppercase">{domain}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative group">
                                    <label className="block text-cyan-400 text-sm font-black uppercase tracking-wider mb-3">TECHNICAL SKILLS</label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={filters.skills}
                                        onChange={handleFilterChange}
                                        placeholder="SPECIFIC CAPABILITIES"
                                        className="w-full bg-black/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 transition-all duration-300 font-mono uppercase tracking-wide"
                                    />
                                </div>

                                <div className="lg:col-span-2 relative group">
                                    <label className="block text-cyan-400 text-sm font-black uppercase tracking-wider mb-3">GRADUATION CYCLE RANGE</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="number"
                                            name="gradYearMin"
                                            value={filters.gradYearMin}
                                            onChange={handleFilterChange}
                                            placeholder="INITIAL CYCLE"
                                            min="2000"
                                            max="2030"
                                            className="flex-1 bg-black/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 transition-all duration-300 font-mono uppercase tracking-wide"
                                        />
                                        <input
                                            type="number"
                                            name="gradYearMax"
                                            value={filters.gradYearMax}
                                            onChange={handleFilterChange}
                                            placeholder="FINAL CYCLE"
                                            min="2000"
                                            max="2030"
                                            className="flex-1 bg-black/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 transition-all duration-300 font-mono uppercase tracking-wide"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-400/10 border border-red-400/30 text-red-400 px-6 py-4 rounded-xl mb-6 font-mono uppercase tracking-wide text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Results */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center gap-4 mb-6">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className={`w-4 h-4 bg-cyan-400 rounded-full animate-bounce ${i === pulseIndex ? 'scale-125' : ''
                                        }`}
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                ></div>
                            ))}
                        </div>
                        <p className="text-cyan-400 font-mono uppercase tracking-wider text-lg">
                            SCANNING DIGITAL REALMS FOR COMBATANTS...
                        </p>
                        <p className="text-gray-400 text-sm mt-2 uppercase tracking-wide">
                            ANALYZING SKILL MATRICES AND COMPATIBILITY PROTOCOLS
                        </p>
                    </div>
                ) : results.length > 0 ? (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-wider flex items-center gap-3">
                                <FaUserAstronaut />
                                {results.length} COMBATANT{results.length !== 1 ? 'S' : ''} LOCATED
                            </h2>
                            <p className="text-cyan-300 text-sm font-mono uppercase tracking-wide">
                                SORTED BY MISSION COMPATIBILITY
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {results.map((user, index) => (
                                <div
                                    key={user._id}
                                    className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6 shadow-2xl hover:shadow-cyan-400/20 hover:border-cyan-400/50 transition-all duration-500 group transform hover:scale-105"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {/* Header with Match Score */}
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-xl font-black text-cyan-400 uppercase tracking-wide group-hover:text-purple-400 transition-colors duration-300">
                                            {user.name}
                                        </h3>
                                        <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-black px-3 py-1 rounded-full text-sm font-black uppercase tracking-wide border-2 border-cyan-400">
                                            {(user.similarity * 100).toFixed(0)}% MATCH
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-gray-300 text-sm mb-6 line-clamp-2 font-mono leading-relaxed">
                                        {user.bio || "NO IDENTITY DATA AVAILABLE."}
                                    </p>

                                    {/* Profile Details */}
                                    <div className="space-y-3 mb-6">
                                        {user.college && (
                                            <div className="flex items-center text-sm text-cyan-300">
                                                <FiAward className="mr-3 text-cyan-400" />
                                                <span className="font-mono uppercase tracking-wide">{user.college}</span>
                                            </div>
                                        )}
                                        {user.location && (
                                            <div className="flex items-center text-sm text-cyan-300">
                                                <FiMapPin className="mr-3 text-cyan-400" />
                                                <span className="font-mono uppercase tracking-wide">{user.location}</span>
                                            </div>
                                        )}
                                        {user.graduationYear && (
                                            <div className="flex items-center text-sm text-cyan-300">
                                                <FiStar className="mr-3 text-cyan-400" />
                                                <span className="font-mono uppercase tracking-wide">GRADUATION: {user.graduationYear}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Skills */}
                                    {user.skills?.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-cyan-400 text-xs font-black uppercase tracking-wider mb-3">TECHNICAL CAPABILITIES</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skills.slice(0, 4).map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="px-3 py-1 bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 rounded-lg text-xs font-mono uppercase tracking-wide"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {user.skills.length > 4 && (
                                                    <span className="px-3 py-1 bg-purple-400/20 text-purple-300 border border-purple-400/30 rounded-lg text-xs font-mono uppercase tracking-wide">
                                                        +{user.skills.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Preferred Roles */}
                                    {user.preferredRoles?.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-purple-400 text-xs font-black uppercase tracking-wider mb-3">COMBAT ROLES</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.preferredRoles.map((role) => (
                                                    <span
                                                        key={role}
                                                        className="px-3 py-1 bg-purple-400/20 text-purple-300 border border-purple-400/30 rounded-lg text-xs font-mono uppercase tracking-wide"
                                                    >
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Domain Interests */}
                                    {user.domainInterest?.length > 0 && (
                                        <div className="mb-6">
                                            <p className="text-green-400 text-xs font-black uppercase tracking-wider mb-3">SPECIALIZATION AREAS</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.domainInterest.slice(0, 3).map((domain) => (
                                                    <span
                                                        key={domain}
                                                        className="px-3 py-1 bg-green-400/20 text-green-300 border border-green-400/30 rounded-lg text-xs font-mono uppercase tracking-wide"
                                                    >
                                                        {domain}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-cyan-400/20">
                                        <button
                                            onClick={() => handleSendInvite(user)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 group"
                                        >
                                            <FiUsers size={16} />
                                            DEPLOY INVITE
                                        </button>
                                        <Link
                                            className="px-4 py-3 border border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400 rounded-lg transition-all duration-300 flex items-center justify-center font-mono uppercase tracking-wide text-sm"
                                            to={`/user/${user._id}`}
                                        >
                                            SCAN PROFILE
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : searchPerformed && !loading && (
                    <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-cyan-400/20">
                        <div className="text-cyan-400/30 text-8xl mb-6">
                            <FaRobot />
                        </div>
                        <h3 className="text-2xl font-black text-cyan-400 mb-4 uppercase tracking-wider">
                            SCAN COMPLETE - NO COMBATANTS FOUND
                        </h3>
                        <p className="text-gray-400 max-w-md mx-auto uppercase tracking-wide text-sm leading-relaxed font-mono">
                            ADJUST SCAN PARAMETERS OR EXPAND SEARCH CRITERIA. TRY GENERAL TERMS LIKE "WEB DEVELOPMENT" OR "AI SYSTEMS".
                        </p>
                    </div>
                )}

                {/* Invitation Modal */}
                {selectedUser && (
                    <SendInvitationModal
                        user={selectedUser}
                        isOpen={showInviteModal}
                        onClose={handleInviteClose}
                        onSuccess={handleInviteSuccess}
                    />
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