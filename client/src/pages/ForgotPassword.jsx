import { useState } from "react";
import API from "../services/api";
import { FiMail, FiSend, FiArrowLeft } from "react-icons/fi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
      setIsSubmitted(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setMessage("");
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-[85vh] bg-black flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-cyan-900 opacity-60"></div>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-grid-flow"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-float"
            style={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-cyan-300 hover:text-white mb-8 transition-all duration-300 group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-mono tracking-wide">BACK TO LOGIN</span>
        </button>

        {/* Main Card */}
        <div className="group relative">
          {/* Animated Border Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-glow"></div>
          
          <div className="relative bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-8 shadow-2xl shadow-cyan-500/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/50 animate-pulse">
                <FiMail className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent tracking-wider">
                SYSTEM RECOVERY
              </h2>
              <p className="text-cyan-200/80 font-mono text-sm mt-2 tracking-wide">
                INITIATE PASSWORD RESET PROTOCOL
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="relative">
                  <label className="block text-cyan-300 font-mono text-sm mb-2 tracking-wide">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@digital-domain.com"
                      className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white font-mono placeholder-cyan-300/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FiMail className="text-cyan-400/70" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-bold font-mono tracking-wider flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 border border-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      INITIATING...
                    </>
                  ) : (
                    <>
                      <FiSend className="animate-pulse" />
                      SEND RESET LINK
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Success State */
              <div className="text-center space-y-6 animate-fadeIn">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50 animate-bounce">
                  <FiSend className="text-white text-2xl" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent tracking-wider">
                    PROTOCOL INITIATED
                  </h3>
                  <p className="text-cyan-100 leading-relaxed">
                    System recovery link transmitted to your digital terminal.
                  </p>
                </div>

                <div className="bg-cyan-900/30 border border-cyan-500/20 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-cyan-200 text-sm font-mono">{message}</p>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-bold font-mono tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 border border-cyan-400/50"
                >
                  RESET ANOTHER ACCOUNT
                </button>
              </div>
            )}

            {/* Status Message */}
            {message && !isSubmitted && (
              <div className="mt-4 p-3 bg-cyan-900/30 border border-cyan-500/20 rounded-lg backdrop-blur-sm">
                <p className="text-cyan-200 text-sm text-center font-mono animate-pulse">
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8">
          <p className="text-cyan-300/60 font-mono text-xs tracking-wide">
            SECURE IDENTITY VERIFICATION REQUIRED
          </p>
        </div>
      </div>

      {/* Add these styles to your global CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes grid-flow {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-20px, -20px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-grid-flow {
          animation: grid-flow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}