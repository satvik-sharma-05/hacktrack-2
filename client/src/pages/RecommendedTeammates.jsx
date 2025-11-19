// src/components/RecommendedTeammates.jsx
import { useEffect, useState } from "react";
import { getRecommendedTeammates } from "../services/api";
import { Link } from "react-router-dom";
import { FiFilter, FiX, FiUsers, FiZap, FiAward, FiMapPin, FiCalendar, FiSend, FiEye, FiMail } from "react-icons/fi";
import { FaRobot, FaBolt, FaUserAstronaut, FaNetworkWired, FaCog, FaHandshake } from "react-icons/fa";
import SendInvitationModal from "../components/invitaions/SendInvitationModal";

export default function RecommendedTeammates() {
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState({
        college: "",
        location: "",
        domainInterest: "",
        skills: "",
    });
    const [showFilters, setShowFilters] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [invitationSent, setInvitationSent] = useState(false);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async (filterParams = {}) => {
        setLoading(true);
        setError("");
        try {
            const recs = await getRecommendedTeammates(filterParams);
            setRecommended(recs);
        } catch (err) {
            setError(err.response?.data?.message || "UPDATE YOUR PROFILE WITH SKILLS AND ROLES TO ACCESS RECOMMENDATIONS.");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        const filterParams = {};
        if (filters.college) filterParams.college = filters.college;
        if (filters.location) filterParams.location = filters.location;
        if (filters.domainInterest) filterParams.domainInterest = [filters.domainInterest];
        if (filters.skills) filterParams.skills = filters.skills;

        fetchRecommendations(filterParams);
    };

    const clearFilters = () => {
        setFilters({
            college: "",
            location: "",
            domainInterest: "",
            skills: "",
        });
        fetchRecommendations();
    };

    // Modal handlers
    const openInviteModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleInvitationSuccess = () => {
        setInvitationSent(true);
        // Show success feedback
        setTimeout(() => setInvitationSent(false), 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-cyan-400 font-mono uppercase tracking-wider">SCANNING COMBATANT DATABASE...</p>
                    <p className="text-gray-400 text-sm mt-2 uppercase tracking-wide">ANALYZING SKILL MATRICES AND COMPATIBILITY PROTOCOLS</p>
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
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-2xl flex items-center justify-center pulse-glow">
                            <FaRobot className="text-black text-3xl" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider mb-4">
                        AI TEAMMATE RECOMMENDATIONS
                    </h1>
                    <p className="text-cyan-300 text-lg uppercase tracking-wide max-w-2xl mx-auto font-mono">
                        ADVANCED ALGORITHMS ANALYZING SKILL SYNERGY AND HACKATHON COMPATIBILITY
                    </p>
                </div>

                {/* Success Notification */}
                {invitationSent && (
                    <div className="fixed top-4 right-4 z-50 bg-green-500/20 border border-green-400/50 text-green-400 px-6 py-4 rounded-2xl backdrop-blur-md animate-pulse">
                        <div className="flex items-center gap-3">
                            <FaHandshake className="text-xl" />
                            <div>
                                <p className="font-black uppercase tracking-wider">INVITATION SENT!</p>
                                <p className="text-sm font-mono">Awaiting response from combatant</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-8 mb-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-3 text-cyan-400 hover:text-purple-400 transition-colors duration-300 group"
                        >
                            <div className={`p-3 border border-cyan-400/30 rounded-xl group-hover:border-cyan-400 transition-all duration-300 ${showFilters ? 'bg-cyan-400/20' : ''}`}>
                                <FaCog className="text-lg" />
                            </div>
                            <span className="font-mono uppercase tracking-wide text-sm">
                                {showFilters ? "HIDE" : "DEPLOY"} FILTER MATRIX
                            </span>
                        </button>

                        {(filters.college || filters.location || filters.domainInterest || filters.skills) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors duration-300 font-mono uppercase tracking-wide text-sm"
                            >
                                <FiX />
                                PURGE FILTERS
                            </button>
                        )}
                    </div>

                    {showFilters && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="relative group">
                                    <label className="block text-cyan-400 text-sm font-black uppercase tracking-wider mb-3">EDUCATION INSTITUTE</label>
                                    <input
                                        type="text"
                                        name="college"
                                        value={filters.college}
                                        onChange={handleFilterChange}
                                        placeholder="FILTER BY INSTITUTE"
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
                                        placeholder="FILTER BY LOCATION"
                                        className="w-full bg-black/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 transition-all duration-300 font-mono uppercase tracking-wide"
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="block text-cyan-400 text-sm font-black uppercase tracking-wider mb-3">SPECIALIZATION DOMAIN</label>
                                    <input
                                        type="text"
                                        name="domainInterest"
                                        value={filters.domainInterest}
                                        onChange={handleFilterChange}
                                        placeholder="E.G., AI, WEB3"
                                        className="w-full bg-black/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 transition-all duration-300 font-mono uppercase tracking-wide"
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="block text-cyan-400 text-sm font-black uppercase tracking-wider mb-3">TECHNICAL CAPABILITIES</label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={filters.skills}
                                        onChange={handleFilterChange}
                                        placeholder="E.G., REACT, PYTHON"
                                        className="w-full bg-black/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 transition-all duration-300 font-mono uppercase tracking-wide"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={applyFilters}
                                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-cyan-400/30 transition-all duration-300 uppercase tracking-wider border-2 border-transparent hover:border-cyan-300"
                            >
                                <FaBolt className="inline mr-2" />
                                APPLY FILTER MATRIX
                            </button>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-400/10 border border-red-400/30 text-red-400 px-6 py-4 rounded-xl mb-8 font-mono uppercase tracking-wide text-sm">
                        <div className="flex items-center gap-3">
                            <span>⚡</span>
                            <span>{error}</span>
                        </div>
                        {error.includes("UPDATE YOUR PROFILE") && (
                            <Link
                                to="/profile"
                                className="mt-3 bg-red-400 text-black px-4 py-2 rounded-lg text-sm font-black hover:bg-red-300 transition-all duration-300 inline-flex items-center gap-2"
                            >
                                <FiUsers />
                                UPDATE IDENTITY
                            </Link>
                        )}
                    </div>
                )}

                {/* Results */}
                {recommended.length === 0 && !loading && !error && (
                    <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-cyan-400/20">
                        <div className="text-8xl mb-6 text-cyan-400/30">
                            <FaNetworkWired />
                        </div>
                        <h3 className="text-2xl font-black text-cyan-400 mb-4 uppercase tracking-wider">NO COMBATANTS DETECTED</h3>
                        <p className="text-gray-400 mb-8 uppercase tracking-wide text-lg font-mono max-w-md mx-auto">
                            {filters.college || filters.location || filters.domainInterest || filters.skills
                                ? "ADJUST FILTER PARAMETERS OR PURGE TO EXPAND SEARCH RADIUS."
                                : "ENHANCE YOUR PROFILE WITH ADDITIONAL SKILLS AND SPECIALIZATIONS FOR OPTIMAL MATCHING."}
                        </p>
                        <Link
                            to="/profile"
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-cyan-400/30 transition-all duration-300 uppercase tracking-wider inline-flex items-center gap-3"
                        >
                            <FaUserAstronaut />
                            UPGRADE IDENTITY
                        </Link>
                    </div>
                )}

                {/* Recommendations Grid */}
                {recommended.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-wider flex items-center gap-3">
                                <FaBolt />
                                {recommended.length} COMBATANT{recommended.length !== 1 ? 'S' : ''} IDENTIFIED
                            </h2>
                            <p className="text-cyan-300 text-sm font-mono uppercase tracking-wide">
                                SORTED BY MISSION COMPATIBILITY SCORE
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {recommended.map((user, index) => (
                                <div
                                    key={user._id}
                                    className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-8 shadow-2xl hover:shadow-cyan-400/20 hover:border-cyan-400/50 transition-all duration-500 group transform hover:scale-105"
                                >
                                    {/* Header with rank and score */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-400 text-black rounded-full text-lg font-black border-2 border-black">
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-cyan-400 group-hover:text-purple-400 transition-colors duration-300 uppercase tracking-wide">
                                                    {user.name}
                                                </h3>
                                                {user.xp > 0 && (
                                                    <p className="text-sm text-cyan-300 font-mono uppercase tracking-wide">
                                                        ⭐ {user.xp} XP • LEVEL {user.level}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-black text-lg font-black px-4 py-2 rounded-full border-2 border-cyan-400">
                                                {(user.score * 100).toFixed(0)}% MATCH
                                            </div>
                                            <div className="text-xs text-cyan-400/60 mt-2 font-mono uppercase tracking-wide">
                                                SCORE: {user.score.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    {user.bio && (
                                        <p className="text-gray-300 text-sm mb-6 line-clamp-2 font-mono leading-relaxed border-l-4 border-cyan-400/50 pl-4">
                                            {user.bio}
                                        </p>
                                    )}

                                    {/* Profile Details */}
                                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                        {user.college && (
                                            <div className="flex items-center text-cyan-300 p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/20">
                                                <FiAward className="mr-3 text-cyan-400" />
                                                <span className="font-mono uppercase tracking-wide truncate">{user.college}</span>
                                            </div>
                                        )}
                                        {user.location && (
                                            <div className="flex items-center text-purple-300 p-3 bg-purple-400/10 rounded-lg border border-purple-400/20">
                                                <FiMapPin className="mr-3 text-purple-400" />
                                                <span className="font-mono uppercase tracking-wide">{user.location}</span>
                                            </div>
                                        )}
                                        {user.graduationYear && (
                                            <div className="flex items-center text-green-300 p-3 bg-green-400/10 rounded-lg border border-green-400/20">
                                                <FiCalendar className="mr-3 text-green-400" />
                                                <span className="font-mono uppercase tracking-wide">GRAD {user.graduationYear}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Skills */}
                                    {user.skills?.length > 0 && (
                                        <div className="mb-6">
                                            <p className="text-cyan-400 text-xs font-black uppercase tracking-wider mb-3">TECHNICAL CAPABILITIES</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skills.slice(0, 6).map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="px-3 py-2 bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 rounded-lg text-xs font-mono uppercase tracking-wide hover:bg-cyan-400/30 transition-all duration-300"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {user.skills.length > 6 && (
                                                    <span className="px-3 py-2 bg-purple-400/20 text-purple-300 border border-purple-400/30 rounded-lg text-xs font-mono uppercase tracking-wide">
                                                        +{user.skills.length - 6}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Preferred Roles */}
                                    {user.preferredRoles?.length > 0 && (
                                        <div className="mb-6">
                                            <p className="text-purple-400 text-xs font-black uppercase tracking-wider mb-3">COMBAT ROLES</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.preferredRoles.map((role) => (
                                                    <span
                                                        key={role}
                                                        className="px-3 py-2 bg-purple-400/20 text-purple-300 border border-purple-400/30 rounded-lg text-xs font-mono uppercase tracking-wide hover:bg-purple-400/30 transition-all duration-300"
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
                                            <p className="text-green-400 text-xs font-black uppercase tracking-wider mb-3">SPECIALIZATION DOMAINS</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.domainInterest.slice(0, 3).map((domain) => (
                                                    <span
                                                        key={domain}
                                                        className="px-3 py-2 bg-green-400/20 text-green-300 border border-green-400/30 rounded-lg text-xs font-mono uppercase tracking-wide hover:bg-green-400/30 transition-all duration-300"
                                                    >
                                                        {domain}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Match Reasons */}
                                    {user.matchReasons?.length > 0 && (
                                        <div className="mb-6 p-4 bg-cyan-400/10 rounded-xl border border-cyan-400/20">
                                            <p className="text-cyan-400 text-xs font-black uppercase tracking-wider mb-3">MISSION SYNERGY ANALYSIS</p>
                                            <ul className="text-xs text-cyan-300 space-y-2 font-mono">
                                                {user.matchReasons.map((reason, idx) => (
                                                    <li key={idx} className="flex items-start gap-3">
                                                        <span className="text-green-400 mt-0.5 flex-shrink-0">⚡</span>
                                                        <span>{reason}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Score Breakdown */}
                                    <details className="mb-6">
                                        <summary className="text-cyan-400 text-sm cursor-pointer hover:text-purple-400 transition-colors duration-300 font-mono uppercase tracking-wide flex items-center gap-2">
                                            <FiZap />
                                            COMPATIBILITY MATRIX BREAKDOWN
                                        </summary>
                                        <div className="mt-4 space-y-3 text-xs bg-black/30 p-4 rounded-lg border border-cyan-400/20">
                                            <div className="flex justify-between text-cyan-300">
                                                <span className="font-mono uppercase tracking-wide">PROFILE SIMILARITY:</span>
                                                <span className="font-black">{(user.similarity * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between text-purple-300">
                                                <span className="font-mono uppercase tracking-wide">SKILLS COMPLEMENTARITY:</span>
                                                <span className="font-black">{(user.skillsComplementarity * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between text-green-300">
                                                <span className="font-mono uppercase tracking-wide">ROLE ALIGNMENT:</span>
                                                <span className="font-black">{(user.roleComplementarity * 100).toFixed(1)}%</span>
                                            </div>
                                            {user.domainAlignment && (
                                                <div className="flex justify-between text-yellow-300">
                                                    <span className="font-mono uppercase tracking-wide">DOMAIN ALIGNMENT:</span>
                                                    <span className="font-black">{(user.domainAlignment * 100).toFixed(1)}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </details>

                                    {/* Action Buttons */}
                                    <div className="flex gap-40 pt-6 border-t border-cyan-400/20">
                                        <button
                                            onClick={() => openInviteModal(user)}
                                            className="flex gap-3 bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-lg font-black uppercase tracking-widest text-sm border border-purple-400/30 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-200"                    >
                                            <FiMail size={16} />
                                            DEPLOY INVITE
                                        </button>
                                        <Link
                                            to={`/user/${user._id}`}
                                            className="px-6 py-3 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 rounded-xl transition-all duration-300 font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                                        >
                                            <FiEye size={16} />
                                            SCAN PROFILE
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Invitation Modal */}
            {selectedUser && (
                <SendInvitationModal
                    user={selectedUser}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSuccess={handleInvitationSuccess}
                />
            )}

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