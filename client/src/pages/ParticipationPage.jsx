// src/pages/ParticipationPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import  {useAuth}  from "../context/AuthContext";
import { useState, useEffect } from "react";
import API from "../services/api";

export default function ParticipationPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [joined, setJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEventAndParticipation = async () => {
      if (!isAuthenticated) {
        console.log(isAuthenticated);
        navigate("/login");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const [eventRes, participationRes] = await Promise.all([
          API.get(`/events/${id}`),
          API.get(`/participation/my`).catch(() => ({ data: { participations: [] } })),
        ]);

        const fetchedEvent = eventRes.data.event;
        if (!fetchedEvent) throw new Error("Event not found");

        setEvent(fetchedEvent);

        const alreadyJoined = participationRes.data.participations.some(
          (p) => p.event._id === id
        );
        setJoined(alreadyJoined);
      } catch (err) {
        console.error("Error:", err);
        setError(err.response?.data?.message || "Failed to load event");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventAndParticipation();
  }, [id, isAuthenticated, navigate]);

  const handleJoin = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const res = await API.post(`/participation/${id}/join`);
      
      alert(res.data.message || "Successfully joined!");
      setJoined(true);
      
      setTimeout(() => navigate("/my-hackathons"), 800);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading State
  if (isLoading && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-cyan-400 text-xl font-mono animate-pulse">
          ACCESSING GRID NODE...
        </div>
      </div>
    );
  }

  // Error State
  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4 text-red-500 font-black">ERROR</div>
          <p className="text-red-400 mb-4">{error || "Event not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-cyan-600 text-black font-bold rounded hover:bg-cyan-500 transition-all hover:scale-105"
          >
            GO BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* TRON Grid Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,255,255,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Glow Orbs */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl -z-10"></div>

      <div className="relative z-10 max-w-4xl mx-auto p-6 mt-12">
        {/* Event Card */}
        <div className="bg-gray-950/80 backdrop-blur-xl border border-cyan-700/50 rounded-2xl p-8 shadow-2xl shadow-cyan-500/20">
          {/* Event Image */}
          {event.image && (
            <div className="mb-6 -mt-16 mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-cyan-400 shadow-lg shadow-cyan-400/50">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black text-cyan-300 text-center mb-4 tracking-wider neon-glow">
            {event.title}
          </h1>

          {/* Dates */}
          <div className="flex justify-center gap-6 text-sm text-cyan-200 mb-6 font-mono">
            <div>
              <span className="text-cyan-400">START:</span>{" "}
              {new Date(event.startDate).toLocaleDateString()}
            </div>
            <div>
              <span className="text-purple-400">END:</span>{" "}
              {new Date(event.endDate).toLocaleDateString()}
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-300 leading-relaxed text-center max-w-2xl mx-auto mb-8">
            {event.description}
          </p>

          {/* Action Button */}
          <div className="flex justify-center">
            {!joined ? (
              <button
                onClick={handleJoin}
                disabled={isLoading}
                className={`
                  group relative px-10 py-5 text-xl font-black uppercase tracking-widest
                  bg-gradient-to-r from-cyan-500 to-blue-500 text-black rounded-xl
                  border-2 border-cyan-400 shadow-lg shadow-cyan-500/50
                  transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-cyan-400/70
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  ${isLoading ? "animate-pulse" : ""}
                `}
              >
                <span className="relative z-10">
                  {isLoading ? "JOINING..." : "JOIN HACKATHON"}
                </span>
                <div className="absolute inset-0 rounded-xl bg-cyan-400 opacity-0 group-hover:opacity-30 transition-opacity"></div>
              </button>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400 mb-2 flex items-center justify-center gap-3">
                  <span className="text-3xl">CHECKMARK</span> JOINED!
                </p>
                <p className="text-cyan-300">You're in the Grid. Good luck!</p>
                <button
                  onClick={() => navigate("/my-hackathons")}
                  className="mt-4 px-6 py-2 bg-cyan-900/50 border border-cyan-600 text-cyan-300 rounded-lg hover:bg-cyan-800/50 transition-all"
                >
                  View My Hackathons
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-sm"
          >
            RETURN TO EVENTS
          </button>
        </div>
      </div>

      {/* Global TRON Styles (Optional – can be in Layout) */}
      <style jsx>{`
        .neon-glow {
          text-shadow: 
            0 0 5px currentColor,
            0 0 10px currentColor,
            0 0 15px currentColor,
            0 0 20px currentColor;
        }
      `}</style>
    </div>
  );
}