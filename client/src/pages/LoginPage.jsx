// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { FaGithub, FaGoogle, FaUser, FaLock, FaEnvelope, FaHome } from "react-icons/fa";

export default function LoginPage() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Use the enhanced setUser that handles token
      setUser(res.data.user, res.data.token);

      navigate(res.data.redirect || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center p-4">
      {/* TRON Grid Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
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
        
        {/* Animated Laser Beams */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              style={{
                top: `${30 + i * 20}%`,
                animation: `laserScan ${4 + i * 0.5}s linear infinite`,
                animationDelay: `${i * 1}s`,
                filter: 'blur(1px)',
                boxShadow: '0 0 8px rgba(0, 243, 255, 0.8)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Home Button */}
      <button
        onClick={handleHome}
        className="absolute bottom-75 right-100 z-20 flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 px-4 py-2 rounded-lg uppercase tracking-wide text-sm font-bold transition-all duration-300 hover:border-cyan-400 hover:scale-105 group"
      >
        <FaHome className="group-hover:scale-110 transition-transform duration-300" />
        <span>HOME</span>
      </button>

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000" />
        
        <div className="relative bg-gray-900/80 backdrop-blur-md border border-cyan-400/30 rounded-xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center pulse-glow">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <FaUser className="text-cyan-400 text-xl" />
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider mb-2">
              SYSTEM ACCESS
            </h1>
            <p className="text-gray-400 text-sm uppercase tracking-wide">
              ENTER YOUR CREDENTIALS
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
              <p className="text-red-400 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-cyan-400 group-hover:text-purple-400 transition-colors duration-300" />
              </div>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="USER EMAIL"
                className="w-full bg-black/50 border border-cyan-400/30 rounded-lg pl-10 pr-4 py-3 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 uppercase tracking-wide text-sm"
                required
                disabled={loading}
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-cyan-400 group-hover:text-purple-400 transition-colors duration-300" />
              </div>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="PASSWORD"
                className="w-full bg-black/50 border border-cyan-400/30 rounded-lg pl-10 pr-4 py-3 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 uppercase tracking-wide text-sm"
                required
                disabled={loading}
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-cyan-400 hover:text-purple-400 text-sm uppercase tracking-wide transition-colors duration-300 inline-flex items-center gap-1"
              >
                <span>FORGOT PASSWORD ?</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black py-3 px-4 rounded-lg uppercase tracking-wider hover:from-cyan-400 hover:to-purple-500 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 border border-transparent hover:border-cyan-300"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <span>INITIATE LOGIN</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-400/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-gray-900 text-cyan-400 uppercase tracking-wider text-xs">
                ALTERNATE ACCESS
              </span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleOAuth("github")}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-bold py-3 px-4 rounded-lg uppercase tracking-wider text-sm transition-all duration-300 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <FaGithub className="text-xl group-hover:scale-110 transition-transform duration-300" />
              <span>GitHub</span>
            </button>
            
            <button
              onClick={() => handleOAuth("google")}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-bold py-3 px-4 rounded-lg uppercase tracking-wider text-sm transition-all duration-300 hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <FaGoogle className="text-xl group-hover:scale-110 transition-transform duration-300" />
              <span>Google</span>
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center mt-8 pt-6 border-t border-cyan-400/20">
            <p className="text-gray-400 text-sm uppercase tracking-wide">
              NEW TO THIS WORLD?{" "}
              <Link 
                to="/register" 
                className="text-cyan-400 hover:text-purple-400 font-bold transition-colors duration-300 inline-flex items-center gap-1"
              >
                REGISTER
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </p>
          </div>
        </div>

        {/* Corner Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-cyan-400 opacity-60" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-cyan-400 opacity-60" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-cyan-400 opacity-60" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-cyan-400 opacity-60" />
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        
        @keyframes laserScan {
          0% { 
            transform: translateX(-100%);
            opacity: 0;
          }
          50% { 
            opacity: 1;
          }
          100% { 
            transform: translateX(100vw);
            opacity: 0;
          }
        }
        
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