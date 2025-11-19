import { useEffect, useState } from "react";
import { ArrowRight, Users, Zap } from "lucide-react";
import Hero from "../components/layout/Hero";
import EventCard from "../components/events/EventCard";
import { getRecommendedTeammates } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import SendInvitationModal from "../components/invitaions/SendInvitationModal";

// Main HomePage Component
export default function HomePage() {
  const { user: currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [recommendedTeammates, setRecommendedTeammates] = useState([]);
  const [loadingTeammates, setLoadingTeammates] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    fetch("http://localhost:5000/api/events/live")
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.events || [];
        setEvents(list.slice(0, 6)); // show top 6
      });
  }, []);
  
  useEffect(() => {
    if (currentUser) {
      fetchRecommendedTeammates();
    }
  }, [currentUser]);
  
  const fetchRecommendedTeammates = async () => {
    setLoadingTeammates(true);
    try {
      const recs = await getRecommendedTeammates();
      setRecommendedTeammates(recs.slice(0, 3)); // Show top 3 recommendations
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoadingTeammates(false);
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleInvitationSuccess = () => {
    // Optional: Show success message or refresh recommendations
    console.log("Invitation sent successfully!");
  };
  
  return (
    <div className="min-h-screen">
      <Hero />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured Hackathons Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">
            <span className="text-white">Featured </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Hackathons
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {events.map((event, index) => (
            <EventCard key={index} event={event} />
          ))}
        </div>
        
        <div className="text-center mb-20">
          <Link 
            to="/events"
            className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 inline-flex items-center gap-2"
          >
            Explore more
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {/* Recommended Teammates Section */}
        {currentUser && (
          <div className="mt-16">
            {/* ───────── Header ───────── */}
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold mb-4">
                <span className="text-white">AI-Powered </span>
                <span className="text-cyan-400 drop-shadow-[0_0_10px_#00ffff]">
                  Teammate Recommendations
                </span>
              </h2>
              <div className="w-24 h-[3px] bg-cyan-400 mx-auto mb-4 shadow-[0_0_15px_#00ffff]" />
              <p className="text-cyan-200/80 text-lg max-w-2xl mx-auto font-light">
                Smart matches based on your skills, interests, and project compatibility
              </p>
            </div>

            {/* ───────── Loading ───────── */}
            {loadingTeammates ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                <p className="text-cyan-300">Finding your perfect teammates...</p>
              </div>
            ) : recommendedTeammates.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {recommendedTeammates.map((user, index) => (
                  <div
                    key={user._id}
                    className="bg-black/80 border border-cyan-500/40 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 hover:shadow-[0_0_25px_#00ffff] hover:scale-[1.02]"
                  >
                    {/* Rank & Score */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-cyan-500 text-black rounded-full text-sm font-bold shadow-[0_0_10px_#00ffff]">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white hover:text-cyan-300 transition-colors">
                            {user.name}
                          </h3>
                          {user.xp > 0 && (
                            <p className="text-xs text-cyan-300/70">
                              ⭐ {user.xp} XP • Level {user.level}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-cyan-300 text-sm font-bold px-3 py-1 rounded-md border border-cyan-400/70 shadow-[0_0_10px_#00ffff]">
                          {(user.score * 100).toFixed(0)}% Match
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <p className="text-cyan-100/80 text-sm mb-4 line-clamp-2">
                        {user.bio}
                      </p>
                    )}

                    {/* Profile Info */}
                    <div className="space-y-2 mb-4 text-sm">
                      {user.college && (
                        <div className="flex items-center text-cyan-300">
                          <span className="mr-2">🎓</span>
                          <span className="truncate">{user.college}</span>
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center text-cyan-300">
                          <span className="mr-2">📍</span>
                          <span>{user.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {user.skills?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wide">
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {user.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 rounded-md text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Roles */}
                    {user.preferredRoles?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wide">
                          Roles
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {user.preferredRoles.slice(0, 2).map((role) => (
                            <span
                              key={role}
                              className="px-2 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 rounded-md text-xs"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-cyan-400/20">
                      <button 
                        className="flex-1 bg-cyan-500 text-blue py-2 px-3 rounded-lg text-sm font-bold hover:bg-cyan-400 hover:shadow-[0_0_15px_#00ffff] transition-all"
                        onClick={() => handleOpenModal(user)}
                      >
                        Send Invite
                      </button>
                      <Link
                        to={`/user/${user._id}`}
                        className="px-3 py-2 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/10 rounded-lg text-sm hover:shadow-[0_0_10px_#00ffff] transition-all"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-black/80 rounded-2xl border border-cyan-400/40 shadow-[0_0_25px_#00ffff50]">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-white mb-2">No Recommendations Yet</h3>
                <p className="text-cyan-300 mb-6 max-w-md mx-auto">
                  Update your profile with skills and interests to get personalized teammate recommendations.
                </p>
                <Link
                  to="/profile"
                  className="bg-cyan-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-cyan-400 hover:shadow-[0_0_20px_#00ffff] transition-transform hover:scale-105 inline-flex items-center gap-2"
                >
                  Update Profile
                </Link>
              </div>
            )}

            {/* View All Button */}
            {recommendedTeammates.length > 0 && (
              <div className="text-center mt-8">
                <Link
                  to="/recommendations"
                  className="px-8 py-4 border border-cyan-400 text-cyan-300 rounded-lg font-bold hover:bg-cyan-500/10 hover:shadow-[0_0_20px_#00ffff] transition-all inline-flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  View All Recommendations
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Call to Action for Non-Logged In Users */}
        {!currentUser && (
          <div className="text-center py-16 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-cyan-400/30">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Find Your Dream Team?</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg">
              Sign in to get AI-powered teammate recommendations based on your skills and interests.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="border border-cyan-400 text-cyan-400 px-8 py-3 rounded-lg font-bold hover:bg-cyan-400/10 transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}

        {/* Invitation Modal */}
        {selectedUser && (
          <SendInvitationModal
            user={selectedUser}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSuccess={handleInvitationSuccess}
          />
        )}
      </main>
    </div>
  );
}