// src/pages/UserPublicProfile.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getUserPublic } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiCalendar, FiMapPin, FiAward, FiUsers, FiArrowLeft, FiZap, FiCpu, FiGlobe } from "react-icons/fi";
import { FaUserAstronaut, FaBolt, FaRobot, FaNetworkWired } from "react-icons/fa";
import SendInvitationModal from "../components/invitaions/SendInvitationModal";

export default function UserPublicProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [compatibilityScore, setCompatibilityScore] = useState(0);

    useEffect(() => {
        fetchUserProfile();
    }, [id]);

    useEffect(() => {
        if (user && currentUser && currentUser._id !== user._id) {
            calculateCompatibility();
        }
    }, [user, currentUser]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setError("");
            const userData = await getUserPublic(id);
            setUser(userData);
        } catch (err) {
            console.error("Failed to fetch user profile:", err);
            setError("IDENTITY NOT FOUND OR ACCESS RESTRICTED");
        } finally {
            setLoading(false);
        }
    };

    const calculateCompatibility = () => {
        if (!user || !currentUser) return;

        let score = 0;
        let totalPossible = 0;

        // Skills compatibility (40% weight)
        if (user.skills?.length && currentUser.skills?.length) {
            const sharedSkills = user.skills.filter(skill => 
                currentUser.skills.includes(skill)
            ).length;
            score += (sharedSkills / Math.max(user.skills.length, currentUser.skills.length)) * 40;
            totalPossible += 40;
        }

        // Roles compatibility (30% weight)
        if (user.preferredRoles?.length && currentUser.preferredRoles?.length) {
            const sharedRoles = user.preferredRoles.filter(role => 
                currentUser.preferredRoles.includes(role)
            ).length;
            score += (sharedRoles / Math.max(user.preferredRoles.length, currentUser.preferredRoles.length)) * 30;
            totalPossible += 30;
        }

        // Interests compatibility (20% weight)
        if (user.domainInterest?.length && currentUser.domainInterest?.length) {
            const sharedInterests = user.domainInterest.filter(interest => 
                currentUser.domainInterest.includes(interest)
            ).length;
            score += (sharedInterests / Math.max(user.domainInterest.length, currentUser.domainInterest.length)) * 20;
            totalPossible += 20;
        }

        // Location/College bonus (10% weight)
        if (user.location === currentUser.location || user.college === currentUser.college) {
            score += 10;
            totalPossible += 10;
        }

        const finalScore = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
        setCompatibilityScore(finalScore);
    };

    const sendMessage = () => {
        // TODO: Implement messaging system
        console.log(`Opening chat with ${user.name}`);
    };

    const handleInviteSuccess = () => {
        console.log("INVITATION TRANSMITTED SUCCESSFULLY");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-cyan-400 font-mono uppercase tracking-wider">SCANNING IDENTITY...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-black text-cyan-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-3 text-cyan-400 hover:text-purple-400 transition-colors duration-300 mb-8 group"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-mono uppercase tracking-wide">RETURN TO GRID</span>
                    </button>

                    <div className="text-center py-16">
                        <div className="text-8xl mb-6 text-cyan-400/30">
                            <FaRobot />
                        </div>
                        <h1 className="text-3xl font-black text-cyan-400 mb-4 uppercase tracking-wider">IDENTITY NOT FOUND</h1>
                        <p className="text-gray-400 mb-8 uppercase tracking-wide text-lg font-mono">
                            {error || "THE REQUESTED DIGITAL IDENTITY DOES NOT EXIST IN THE GRID."}
                        </p>
                        <Link
                            to="/find-teammates"
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-cyan-400/30 transition-all duration-300 uppercase tracking-wider inline-flex items-center gap-3"
                        >
                            <FaNetworkWired />
                            SCAN COMBATANTS
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser && currentUser._id === user._id;

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

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-cyan-400 hover:text-purple-400 transition-colors duration-300 mb-8 group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-mono uppercase tracking-wide text-sm">BACK TO GRID</span>
                </button>

                {/* Profile Header */}
                <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-8 mb-8 shadow-2xl">
                    <div className="flex flex-col lg:flex-row items-start gap-8">
                        {/* Avatar with Animated Border */}
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative">
                                <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center text-black font-bold text-3xl border-4 border-black">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-32 h-32 rounded-2xl object-cover border-4 border-black"
                                        />
                                    ) : (
                                        <FaUserAstronaut className="text-3xl" />
                                    )}
                                </div>
                                {/* Online Status Indicator */}
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 border-4 border-black rounded-full pulse-glow"></div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                                <div className="flex-1">
                                    <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider mb-4">
                                        {user.name}
                                    </h1>

                                    {/* Stats */}
                                    <div className="flex flex-wrap gap-6 text-sm mb-6">
                                        {user.xp > 0 && (
                                            <div className="flex items-center gap-2 text-cyan-300">
                                                <FiAward className="text-yellow-400" />
                                                <span className="font-mono uppercase tracking-wide">{user.xp} XP</span>
                                            </div>
                                        )}

                                        {user.level > 1 && (
                                            <div className="flex items-center gap-2 text-green-400">
                                                <div className="w-3 h-3 bg-green-400 rounded-full pulse-glow"></div>
                                                <span className="font-mono uppercase tracking-wide">LEVEL {user.level}</span>
                                            </div>
                                        )}

                                        {user.createdAt && (
                                            <div className="flex items-center gap-2 text-purple-300">
                                                <FiCalendar />
                                                <span className="font-mono uppercase tracking-wide">
                                                    JOINED {new Date(user.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {!isOwnProfile && currentUser && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setShowInviteModal(true)}
                                            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-black py-3 px-6 rounded-xl hover:shadow-2xl hover:shadow-cyan-400/30 transition-all duration-300 uppercase tracking-wider flex items-center gap-3 border-2 border-transparent hover:border-cyan-300"
                                        >
                                            <FiUsers size={18} />
                                            DEPLOY INVITE
                                        </button>
                                     
                                    </div>
                                )}

                                {isOwnProfile && (
                                    <Link
                                        to="/profile"
                                        className="bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black px-8 py-3 rounded-xl hover:shadow-2xl hover:shadow-cyan-400/30 transition-all duration-300 uppercase tracking-wider border-2 border-transparent hover:border-cyan-300"
                                    >
                                        EDIT IDENTITY
                                    </Link>
                                )}
                            </div>

                            {/* Bio */}
                            {user.bio && (
                                <div className="border-l-4 border-cyan-400/50 pl-6">
                                    <p className="text-gray-300 text-lg leading-relaxed font-mono">{user.bio}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column - Personal Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Education & Location */}
                        <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
                            <h2 className="text-lg font-black text-cyan-400 mb-6 uppercase tracking-wider flex items-center gap-3">
                                <FiGlobe />
                                IDENTITY DATA
                            </h2>
                            <div className="space-y-4">
                                {user.college && (
                                    <div className="flex items-start gap-4 p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/20">
                                        <div className="w-8 h-8 bg-cyan-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <span className="text-cyan-400 text-sm">🎓</span>
                                        </div>
                                        <div>
                                            <p className="font-black text-cyan-400 text-sm uppercase tracking-wide">INSTITUTE</p>
                                            <p className="text-cyan-300 font-mono text-sm">{user.college}</p>
                                        </div>
                                    </div>
                                )}

                                {user.graduationYear && (
                                    <div className="flex items-start gap-4 p-3 bg-green-400/10 rounded-lg border border-green-400/20">
                                        <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FiCalendar className="text-green-400 text-sm" />
                                        </div>
                                        <div>
                                            <p className="font-black text-green-400 text-sm uppercase tracking-wide">GRADUATION CYCLE</p>
                                            <p className="text-green-300 font-mono text-sm">{user.graduationYear}</p>
                                        </div>
                                    </div>
                                )}

                                {user.location && (
                                    <div className="flex items-start gap-4 p-3 bg-purple-400/10 rounded-lg border border-purple-400/20">
                                        <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FiMapPin className="text-purple-400 text-sm" />
                                        </div>
                                        <div>
                                            <p className="font-black text-purple-400 text-sm uppercase tracking-wide">LOCATION</p>
                                            <p className="text-purple-300 font-mono text-sm">{user.location}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interests */}
                        {user.interests?.length > 0 && (
                            <div className="bg-gray-900/80 backdrop-blur-md border border-orange-400/30 rounded-2xl p-6">
                                <h2 className="text-lg font-black text-orange-400 mb-6 uppercase tracking-wider flex items-center gap-3">
                                    <FiZap />
                                    PERSONAL INTERESTS
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {user.interests.map((interest, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-2 bg-orange-400/20 text-orange-300 border border-orange-400/30 rounded-lg text-xs font-mono uppercase tracking-wide"
                                        >
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Skills & Roles */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Skills */}
                        {user.skills?.length > 0 && (
                            <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
                                <h2 className="text-lg font-black text-cyan-400 mb-6 uppercase tracking-wider flex items-center gap-3">
                                    <FiCpu />
                                    TECHNICAL CAPABILITIES
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {user.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-3 bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 rounded-xl text-sm font-mono uppercase tracking-wide hover:bg-cyan-400/30 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preferred Roles */}
                        {user.preferredRoles?.length > 0 && (
                            <div className="bg-gray-900/80 backdrop-blur-md border border-purple-400/30 rounded-2xl p-6">
                                <h2 className="text-lg font-black text-purple-400 mb-6 uppercase tracking-wider flex items-center gap-3">
                                    <FaUserAstronaut />
                                    COMBAT ROLES
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {user.preferredRoles.map((role, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-3 bg-purple-400/20 text-purple-300 border border-purple-400/30 rounded-xl text-sm font-mono uppercase tracking-wide hover:bg-purple-400/30 hover:border-purple-400 transition-all duration-300 transform hover:scale-105"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Domain Interests */}
                        {user.domainInterest?.length > 0 && (
                            <div className="bg-gray-900/80 backdrop-blur-md border border-green-400/30 rounded-2xl p-6">
                                <h2 className="text-lg font-black text-green-400 mb-6 uppercase tracking-wider flex items-center gap-3">
                                    <FaBolt />
                                    SPECIALIZATION DOMAINS
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {user.domainInterest.map((domain, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-gradient-to-r from-green-400/10 to-cyan-400/10 rounded-xl border border-green-400/20 hover:border-green-400/40 transition-all duration-300 group hover:scale-105"
                                        >
                                            <p className="text-green-300 font-mono uppercase tracking-wide text-sm group-hover:text-cyan-300 transition-colors">
                                                {domain}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Compatibility Section */}
                {!isOwnProfile && currentUser && compatibilityScore > 0 && (
                    <div className="mt-8 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 backdrop-blur-md rounded-2xl border border-cyan-400/30 p-8">
                        <h2 className="text-2xl font-black text-cyan-400 mb-6 uppercase tracking-wider flex items-center gap-3">
                            <FaNetworkWired />
                            MISSION COMPATIBILITY ANALYSIS
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-4xl font-black text-cyan-400 mb-3">
                                    {compatibilityScore}%
                                </div>
                                <p className="text-cyan-300 text-sm font-mono uppercase tracking-wide">OVERALL MATCH</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-blue-400 mb-2">
                                    {user.skills?.filter(skill => currentUser.skills?.includes(skill)).length || 0}
                                </div>
                                <p className="text-blue-300 text-sm font-mono uppercase tracking-wide">SHARED CAPABILITIES</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-green-400 mb-2">
                                    {user.preferredRoles?.filter(role => currentUser.preferredRoles?.includes(role)).length || 0}
                                </div>
                                <p className="text-green-300 text-sm font-mono uppercase tracking-wide">ALIGNED ROLES</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-purple-400 mb-2">
                                    {user.domainInterest?.filter(domain => currentUser.domainInterest?.includes(domain)).length || 0}
                                </div>
                                <p className="text-purple-300 text-sm font-mono uppercase tracking-wide">SHARED DOMAINS</p>
                            </div>
                        </div>
                        
                        {/* Compatibility Bar */}
                        <div className="mt-6">
                            <div className="flex justify-between text-cyan-300 text-sm font-mono uppercase tracking-wide mb-2">
                                <span>COMPATIBILITY MATRIX</span>
                                <span>{compatibilityScore}%</span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-3">
                                <div 
                                    className="bg-gradient-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${compatibilityScore}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Invitation Modal */}
            {user && (
                <SendInvitationModal
                    user={user}
                    isOpen={showInviteModal}
                    onClose={() => setShowInviteModal(false)}
                    onSuccess={handleInviteSuccess}
                />
            )}

            {/* Global Styles */}
            <style jsx global>{`
                .pulse-glow {
                    animation: pulse 2s ease-in-out infinite alternate;
                }
                
                @keyframes pulse {
                    from {
                        box-shadow: 0 0 5px currentColor;
                    }
                    to {
                        box-shadow: 0 0 15px currentColor, 0 0 25px currentColor;
                    }
                }
            `}</style>
        </div>
    );
}