// src/pages/InvitationsPage.jsx
import { useState, useEffect } from "react";
import { 
  getReceivedInvitations, 
  getSentInvitations, 
  acceptInvitation, 
  rejectInvitation 
} from "../services/invitationApi";
import { FiMail, FiSend, FiCheck, FiX, FiUser, FiMessageSquare } from "react-icons/fi";

export default function InvitationsPage() {
  const [activeTab, setActiveTab] = useState("received");
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        getReceivedInvitations(),
        getSentInvitations()
      ]);
      setReceivedInvitations(receivedRes.invitations || []);
      setSentInvitations(sentRes.invitations || []);
    } catch (err) {
      console.error("Failed to load invitations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId) => {
    try {
      await acceptInvitation(invitationId);
      await loadInvitations();
      // You might want to replace this with a toast notification
      alert("Invitation accepted! You can now chat with this user.");
    } catch (err) {
      alert("Failed to accept invitation");
    }
  };

  const handleReject = async (invitationId) => {
    if (!confirm("Are you sure you want to decline this invitation?")) return;
    try {
      await rejectInvitation(invitationId);
      await loadInvitations();
    } catch (err) {
      alert("Failed to reject invitation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cyan-300 font-mono text-lg tracking-wider animate-pulse">
            LOADING INVITATIONS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-cyan-900 opacity-30 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,255,255,0.1)_50%,transparent_75%)] bg-[length:10px_10px] opacity-20 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header with Glow Effect */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 tracking-wider animate-pulse">
            TEAM INVITATIONS
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full shadow-lg shadow-cyan-400/50"></div>
        </div>

        {/* Tab Navigation with Glow */}
        <div className="border border-cyan-500/30 rounded-xl p-1 mb-8 bg-gray-900/50 backdrop-blur-sm shadow-2xl shadow-cyan-500/20">
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab("received")}
              className={`flex-1 py-4 px-6 rounded-lg font-mono font-bold tracking-wider transition-all duration-300 ${
                activeTab === "received" 
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 border border-cyan-300/50" 
                  : "text-cyan-300 hover:text-white hover:bg-cyan-900/50 border border-transparent hover:border-cyan-500/30"
              }`}
            >
              <FiMail className="inline mr-3 mb-1" />
              RECEIVED ({receivedInvitations.length})
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`flex-1 py-4 px-6 rounded-lg font-mono font-bold tracking-wider transition-all duration-300 ${
                activeTab === "sent" 
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 border border-cyan-300/50" 
                  : "text-cyan-300 hover:text-white hover:bg-cyan-900/50 border border-transparent hover:border-cyan-500/30"
              }`}
            >
              <FiSend className="inline mr-3 mb-1" />
              SENT ({sentInvitations.length})
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="relative">
          {/* Received Invitations */}
          {activeTab === "received" && (
            <div className="space-y-6 animate-fadeIn">
              {receivedInvitations.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-cyan-500/30 rounded-2xl bg-gray-900/50 backdrop-blur-sm">
                  <FiMail className="text-6xl mx-auto mb-6 text-cyan-400/50 animate-float" />
                  <p className="text-cyan-300 font-mono text-xl tracking-wider">NO PENDING INVITATIONS</p>
                  <p className="text-gray-400 mt-2">Awaiting digital connection requests...</p>
                </div>
              ) : (
                receivedInvitations.map((invitation, index) => (
                  <div 
                    key={invitation._id}
                    onMouseEnter={() => setHoveredCard(invitation._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group relative"
                  >
                    {/* Animated Border */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl transition-all duration-500 ${
                      hoveredCard === invitation._id ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
                    }`}></div>
                    
                    <div className="relative bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {/* Avatar with Glow */}
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/50 animate-glow">
                              {invitation.fromUser.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -inset-1 bg-cyan-400 rounded-full blur opacity-30 animate-pulse"></div>
                          </div>
                          <div>
                            <h3 className="font-bold text-xl bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">
                              {invitation.fromUser.name}
                            </h3>
                            <p className="text-cyan-200 text-sm font-mono tracking-wide">
                              {invitation.fromUser.skills?.join(' • ')}
                            </p>
                          </div>
                        </div>
                        <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-mono border border-yellow-500/30 animate-pulse">
                          PENDING
                        </span>
                      </div>

                      {/* Message Box */}
                      <div className="bg-cyan-900/30 border border-cyan-500/20 p-4 rounded-lg mb-4 backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                          <FiMessageSquare className="text-cyan-400 mt-1 flex-shrink-0" />
                          <p className="text-cyan-100 leading-relaxed">{invitation.message}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAccept(invitation._id)}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold font-mono tracking-wider flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50 border border-green-400/50"
                        >
                          <FiCheck className="animate-bounce" />
                          ACCEPT
                        </button>
                        <button
                          onClick={() => handleReject(invitation._id)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-bold font-mono tracking-wider flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50 border border-red-400/50"
                        >
                          <FiX className="animate-pulse" />
                          DECLINE
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sent Invitations */}
          {activeTab === "sent" && (
            <div className="space-y-6 animate-fadeIn">
              {sentInvitations.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-cyan-500/30 rounded-2xl bg-gray-900/50 backdrop-blur-sm">
                  <FiSend className="text-6xl mx-auto mb-6 text-cyan-400/50 animate-float" />
                  <p className="text-cyan-300 font-mono text-xl tracking-wider">NO SENT INVITATIONS</p>
                  <p className="text-gray-400 mt-2">Initiate digital connections...</p>
                </div>
              ) : (
                sentInvitations.map((invitation, index) => (
                  <div 
                    key={invitation._id}
                    onMouseEnter={() => setHoveredCard(invitation._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group relative"
                  >
                    {/* Animated Border */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl transition-all duration-500 ${
                      hoveredCard === invitation._id ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
                    }`}></div>
                    
                    <div className="relative bg-gray-900/90 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 transition-all duration-300 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {/* Avatar with Glow */}
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/50">
                              {invitation.toUser.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -inset-1 bg-purple-400 rounded-full blur opacity-30"></div>
                          </div>
                          <div>
                            <h3 className="font-bold text-xl bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                              {invitation.toUser.name}
                            </h3>
                            <p className="text-purple-200 text-sm font-mono tracking-wide">
                              {invitation.toUser.skills?.join(' • ')}
                            </p>
                          </div>
                        </div>
                        <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-mono border border-blue-500/30">
                          SENT
                        </span>
                      </div>

                      {/* Message Box */}
                      <div className="bg-purple-900/30 border border-purple-500/20 p-4 rounded-lg backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                          <FiMessageSquare className="text-purple-400 mt-1 flex-shrink-0" />
                          <p className="text-purple-100 leading-relaxed">{invitation.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add these styles to your global CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
          50% { box-shadow: 0 0 40px rgba(34, 211, 238, 0.8); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}