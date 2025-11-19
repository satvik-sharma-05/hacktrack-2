// src/App.jsx
import { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/HomePage";
import Login from "./pages/LoginPage";
import Register from "./pages/Register";
import BookmarksPage from "./pages/Bookmarks";
import SelectRolePage from "./pages/SelectRolePage";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CreateEventPage from "./pages/CreateEventPage";
import ProfilePage from "./pages/ProfilePage";
import LoginSuccess from "./pages/LoginSuccess";
import EditEventPage from "./pages/EditEventPage";
import EventDetails from "./pages/EventDetails";
import ParticipationPage from "./pages/ParticipationPage";
import MyHackathons from "./pages/MyHackathons";
import AdminDashboard from "./pages/AdminDashboard";
import OrganizerProfilePage from "./pages/OrganizerProfilePage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import FindTeammates from "./pages/FindTeammates";
import RecommendedTeammates from "./pages/RecommendedTeammates";
import AutoTeams from "./pages/AutoTeams";
import UserPublicProfile from "./pages/UserPublicProfile";
import InvitationsPage from "./pages/InvitationsPage";
import ChatPage from "./pages/ChatPage";
import EventsPage from "./pages/EventsPage";
import DownloadStatus from '../src/components/DownloadStatus';

export default function App() {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioStarted, setAudioStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showIntroOnRefresh, setShowIntroOnRefresh] = useState(true);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const noLayoutRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/login-success",
  ];

  const shouldUseLayout = !noLayoutRoutes.some((r) =>
    location.pathname.startsWith(r)
  );

  // Load preferences
  useEffect(() => {
    const savedMute = localStorage.getItem("hacktrack_muted");
    const savedIntro = localStorage.getItem("hacktrack_show_intro");
    const savedControls = localStorage.getItem("hacktrack_controls_open");

    if (savedMute !== null) setIsMuted(JSON.parse(savedMute));
    if (savedIntro !== null) setShowIntroOnRefresh(JSON.parse(savedIntro));
    if (savedControls !== null) setIsControlsOpen(JSON.parse(savedControls));
  }, []);

  // SAVE AUDIO STATE BEFORE UNLOAD
  useEffect(() => {
    const saveAudioState = () => {
      if (audioRef.current && audioStarted) {
        localStorage.setItem("hacktrack_audio_playing", "true");
        localStorage.setItem("hacktrack_audio_time", audioRef.current.currentTime.toString());
      }
    };

    window.addEventListener("beforeunload", saveAudioState);
    return () => window.removeEventListener("beforeunload", saveAudioState);
  }, [audioStarted]);

  // Init intro / background
  useEffect(() => {
    const init = async () => {
      const hasSeen = localStorage.getItem("hacktrack_intro_seen");
      const shouldShow = location.pathname === "/" && (!hasSeen || showIntroOnRefresh);

      if (shouldShow) {
        setShowIntro(true);
        setShowWelcome(true);
        setIntroCompleted(false);
        setTransitioning(false);
        setContentReady(false);

        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.muted = true;
          videoRef.current.loop = true;
          await videoRef.current.play().catch(() => {});
        }

        setTimeout(() => setShowWelcome(false), 2000);
      } else {
        setShowIntro(false);
        setIntroCompleted(true);
        setContentReady(true);
        startBackgroundMedia();
      }
      setIsLoading(false);
    };

    init();
  }, [location.pathname, showIntroOnRefresh]);

  // RESUME AUDIO ON RELOAD OR NAVIGATION — NEVER RESTART
  useEffect(() => {
    if (!showIntro && introCompleted && audioRef.current) {
      const wasPlaying = localStorage.getItem("hacktrack_audio_playing") === "true";

      if (!audioStarted && wasPlaying) {
        // Reloaded: resume from saved time
        const savedTime = parseFloat(localStorage.getItem("hacktrack_audio_time") || "5");
        audioRef.current.currentTime = savedTime;
        audioRef.current.volume = 0.7;
        audioRef.current.loop = true;
        audioRef.current.muted = isMuted;
        audioRef.current.play()
          .then(() => {
            setAudioStarted(true);
            localStorage.removeItem("hacktrack_audio_playing");
            localStorage.removeItem("hacktrack_audio_time");
          })
          .catch(() => {});
      } else if (audioStarted && audioRef.current.paused) {
        // Navigated: just resume
        audioRef.current.play().catch(() => {});
      }
    }
  }, [location.pathname, showIntro, introCompleted, audioStarted, isMuted]);

  const startBackgroundMedia = async () => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.loop = true;
      await videoRef.current.play().catch(() => {});
    }
  };

  const handleEnter = async () => {
    if (!showIntro || transitioning) return;

    setTransitioning(true);
    setShowWelcome(false);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.loop = false;
      await videoRef.current.play().catch(() => {});
    }

    if (audioRef.current && !audioStarted) {
      audioRef.current.currentTime = 5;
      audioRef.current.volume = 0.7;
      audioRef.current.loop = true;
      audioRef.current.muted = isMuted;
      audioRef.current.play()
        .then(() => {
          setAudioStarted(true);
          localStorage.setItem("hacktrack_audio_playing", "true");
        })
        .catch(() => {});
    }

    const timeout = setTimeout(completeIntro, 3000);
    const onEnd = () => {
      clearTimeout(timeout);
      videoRef.current?.removeEventListener("ended", onEnd);
      completeIntro();
    };
    videoRef.current?.addEventListener("ended", onEnd);
  };

  const completeIntro = () => {
    localStorage.setItem("hacktrack_intro_seen", "true");
    setIntroCompleted(true);
    setShowIntro(false);
    setTransitioning(false);

    if (videoRef.current) {
      videoRef.current.loop = true;
      videoRef.current.play().catch(() => {});
    }

    setTimeout(() => setContentReady(true), 500);
  };

  const replayIntro = () => {
    localStorage.removeItem("hacktrack_intro_seen");
    localStorage.removeItem("hacktrack_audio_playing");
    localStorage.removeItem("hacktrack_audio_time");
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.loop = true;
    }
    window.location.reload();
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    if (audioRef.current) audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
    localStorage.setItem("hacktrack_muted", JSON.stringify(newMuted));
  };

  const toggleIntroPreference = () => {
    const newVal = !showIntroOnRefresh;
    setShowIntroOnRefresh(newVal);
    localStorage.setItem("hacktrack_show_intro", JSON.stringify(newVal));
  };

  const toggleControls = () => {
    const newVal = !isControlsOpen;
    setIsControlsOpen(newVal);
    localStorage.setItem("hacktrack_controls_open", JSON.stringify(newVal));
  };

  const renderWithLayout = (Comp) =>
    shouldUseLayout ? <Layout><Comp /></Layout> : <Comp />;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-2xl font-mono animate-pulse">
          INITIALIZING GRID...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
    <DownloadStatus />

      {/* VIDEO - SMOOTH TRANSITIONS */}
      <video
        ref={videoRef}
        className={`
          fixed inset-0 w-full h-full object-cover
          filter contrast-150 saturate-150
          transition-all duration-1500 ease-out
          ${showIntro ? "brightness-110" : "brightness-70"}
          ${showIntro ? "z-40" : "z-0"}
          ${transitioning ? "scale-125 opacity-80" : "scale-100 opacity-100"}
        `}
        muted
        playsInline
        preload="auto"
        autoPlay
        loop={true}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      {/* DYNAMIC OVERLAY - SMOOTH DARKENING */}
      <div
        className={`
          fixed inset-0 z-5 pointer-events-none
          bg-gradient-to-b from-black/60 via-black/40 to-black/60
          transition-all duration-1500 ease-out
          ${showIntro ? "opacity-20" : "opacity-60"}
        `}
      />

      {/* AUDIO */}
      <audio ref={audioRef} preload="auto" loop>
        <source
          src="/End of Line (From TRON Legacy_Score) - Daft Punk.mp3"
          type="audio/mpeg"
        />
      </audio>

      {/* INTRO OVERLAY - SMOOTH EXIT */}
      {showIntro && (
        <div
          className={`
            fixed inset-0 z-50 flex flex-col items-center justify-center
            bg-gradient-to-br from-black/95 via-black/90 to-black/95 backdrop-blur-lg
            transition-all duration-1000 ease-in-out
            ${transitioning ? "opacity-0 scale-105" : "opacity-100 scale-100"}
          `}
          onClick={handleEnter}
        >
          <div
            className={`
              text-center transition-all duration-800 ease-out
              ${showWelcome ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
            `}
          >
            <h1 className="text-5xl md:text-7xl font-black text-cyan-400 tracking-widest uppercase mb-6 drop-shadow-[0_0_30px_rgba(0,255,255,0.9)]">
              WELCOME TO HACKTRACK
            </h1>
            <p className="text-2xl md:text-3xl text-orange-400 tracking-widest font-light">
              ENTER THE GRID
            </p>
          </div>

          {!showWelcome && (
            <div className="mt-16 text-cyan-300 text-lg transition-all duration-500 ease-out">
              <div className="mb-3 font-mono tracking-widest text-cyan-200">CLICK ANYWHERE TO ENTER</div>
              <div className="flex justify-center gap-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ENHANCED GRID ZOOM TRANSITION */}
      {transitioning && (
        <div className="fixed inset-0 z-45 pointer-events-none">
          <div
            className="h-full w-full bg-gradient-to-br from-cyan-900/30 via-black/50 to-orange-900/30"
            style={{
              backgroundSize: "50px 50px",
              backgroundImage: `
                linear-gradient(to right, rgba(0,255,255,0.4) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,255,255,0.4) 1px, transparent 1px)
              `,
              animation: "gridZoomOut 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            }}
          />
        </div>
      )}

      {/* WEBSITE CONTENT - SMOOTH FADE-IN */}
      <div
        className={`
          relative z-10 min-h-screen
          transition-all duration-1000 ease-out
          ${contentReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        <Routes>
          <Route path="/" element={renderWithLayout(Home)} />
          <Route path="/events/:id" element={renderWithLayout(EventDetails)} />
          <Route path="/events" element={renderWithLayout(EventsPage)} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/login-success" element={<LoginSuccess />} />
          <Route path="/profile" element={renderWithLayout(ProfilePage)} />
          <Route path="/bookmarks" element={renderWithLayout(BookmarksPage)} />
          <Route path="/my-hackathons" element={renderWithLayout(MyHackathons)} />
          <Route path="/select-role" element={renderWithLayout(SelectRolePage)} />
          <Route path="/user/:id" element={renderWithLayout(UserPublicProfile)} />
          <Route path="/find-teammates" element={renderWithLayout(FindTeammates)} />
          <Route path="/recommendations" element={renderWithLayout(RecommendedTeammates)} />
          <Route path="/auto-teams" element={renderWithLayout(AutoTeams)} />
          <Route path="/invitations" element={renderWithLayout(InvitationsPage)} />
          <Route path="/chat" element={<ChatPage/>} />
          <Route path="/participate/:id" element={renderWithLayout(ParticipationPage)} />
          <Route path="/organizer" element={renderWithLayout(OrganizerDashboard)} />
          <Route path="/organizer/create" element={renderWithLayout(CreateEventPage)} />
          <Route path="/organizer/edit/:id" element={renderWithLayout(EditEventPage)} />
          <Route path="/organizer/profile" element={renderWithLayout(OrganizerProfilePage)} />
          <Route path="/admin" element={renderWithLayout(AdminDashboard)} />
          <Route path="/admin/submissions" element={renderWithLayout(AdminDashboard)} />
          <Route path="*" element={renderWithLayout(NotFound)} />
        </Routes>
      </div>

      {/* MEDIA CONTROLS - DELAYED APPEARANCE */}
      {!showIntro && contentReady && (
        <div className="fixed bottom-6 right-6 z-30 animate-fade-in-up">
          <button
            onClick={toggleControls}
            className="flex items-center gap-2 bg-cyan-900/80 backdrop-blur-md text-cyan-300 px-4 py-2 rounded-full border border-cyan-600 shadow-lg hover:shadow-cyan-500/50 transition-all hover:scale-105"
          >
            Settings
            {audioStarted && !isMuted && (
              <div className="flex gap-1">
                <span className="block w-1 h-3 bg-cyan-400 animate-pulse-1"></span>
                <span className="block w-1 h-3 bg-cyan-400 animate-pulse-2"></span>
                <span className="block w-1 h-3 bg-cyan-400 animate-pulse-3"></span>
              </div>
            )}
          </button>

          {isControlsOpen && (
            <div className="absolute bottom-14 right-0 bg-gray-950/95 backdrop-blur-xl border border-cyan-700 rounded-xl p-4 w-64 shadow-2xl animate-scale-in">
              <button onClick={toggleMute} className="flex justify-between w-full text-cyan-300 hover:text-cyan-100 transition py-2">
                <span>{isMuted ? "Muted" : "Sound On"}</span>
                <span>{isMuted ? "Muted" : "Sound On"}</span>
              </button>

              <button onClick={toggleIntroPreference} className="flex justify-between w-full text-cyan-300 hover:text-cyan-100 transition py-2">
                <span>Intro</span>
                <span>{showIntroOnRefresh ? "On" : "Off"}</span>
              </button>

              <button onClick={replayIntro} className="flex justify-between w-full text-orange-400 hover:text-orange-300 transition py-2">
                <span>Replay Intro</span>
                <span>Replay</span>
              </button>

              {audioStarted && (
                <div className="mt-3 text-xs text-cyan-500 border-t border-cyan-800 pt-2">
                  <div>TRON LEGACY</div>
                  <div className="text-orange-400">End of Line</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ANIMATIONS */}
      <style jsx>{`
        @keyframes gridZoomOut {
          0% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.8; 
            filter: blur(0px);
          }
          50% { 
            transform: scale(2) rotate(180deg); 
            opacity: 0.6;
            filter: blur(2px);
          }
          100% { 
            transform: scale(3) rotate(360deg); 
            opacity: 0; 
            filter: blur(4px);
          }
        }

        @keyframes fade-in-up {
          0% { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @keyframes scale-in {
          0% { 
            opacity: 0; 
            transform: scale(0.9) translateY(10px); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }

        @keyframes pulse-1 {
          0%, 100% { transform: scaleY(0.8); opacity: 0.4; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }

        @keyframes pulse-2 {
          0%, 100% { transform: scaleY(0.8); opacity: 0.4; }
          50% { transform: scaleY(1.4); opacity: 1; }
        }

        @keyframes pulse-3 {
          0%, 100% { transform: scaleY(0.8); opacity: 0.4; }
          50% { transform: scaleY(1.1); opacity: 1; }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out 0.5s both;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out both;
        }

        .animate-pulse-1 { animation: pulse-1 1.2s ease-in-out infinite; }
        .animate-pulse-2 { animation: pulse-2 1.2s ease-in-out 0.4s infinite; }
        .animate-pulse-3 { animation: pulse-3 1.2s ease-in-out 0.8s infinite; }
      `}</style>
    </div>
  );
}

// 404 PAGE
function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundSize: "40px 40px",
            backgroundImage: `
              linear-gradient(to right, rgba(0,255,255,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,255,255,0.08) 1px, transparent 1px)
            `,
          }}
        />
      </div>

      <div className="text-center max-w-md w-full space-y-8 relative z-10">
        <div className="flex justify-center gap-4">
          {[4, 0, 4].map((n, i) => (
            <div key={i} className="relative">
              <span
                className={`text-8xl md:text-9xl font-black ${n === 0 ? "text-cyan-400" : "text-orange-400"
                  } animate-pulse`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {n}
              </span>
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-cyan-400 rounded-full blur-md opacity-30 animate-ping" />
            </div>
          ))}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-cyan-300 tracking-widest uppercase">
          ACCESS DENIED
        </h1>
        <p className="text-cyan-400/70 text-sm md:text-base">
          The requested node cannot be found in the Grid
        </p>

        <button
          onClick={() => (window.location.href = "/")}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gray-950 border-2 border-cyan-600 text-cyan-300 font-bold text-lg uppercase tracking-widest rounded-lg transition-all duration-300 hover:border-cyan-400 hover:text-cyan-200 hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:scale-105"
        >
          Return to Grid
        </button>
      </div>
    </div>
  );
}