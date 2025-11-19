import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  FiCalendar, 
  FiMapPin, 
  FiDollarSign, 
  FiAward, 
  FiTag, 
  FiCode,
  FiLink,
  FiImage,
  FiUpload,
  FiZap,
  FiArrowLeft
} from "react-icons/fi";

export default function CreateEventPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    location: "online",
    prize: "",
    prizeType: "unknown",
    themes: "",
    skills: "",
    url: "",
    bannerImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [imagePreview, setImagePreview] = useState("");

  if (!user || user.role !== "organizer") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 tron-card-glow animate-pulse">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiZap className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">ACCESS DENIED</h2>
          <p className="text-gray-400">Only organizers can create events</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    
    // Preview banner image
    if (name === "bannerImage" && value) {
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        themes: form.themes.split(",").map((t) => t.trim()).filter(Boolean),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const res = await API.post("/organizer/create", payload);
      if (res.data.success) {
        // Success animation before navigation
        setTimeout(() => {
          navigate("/organizer");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: FiCalendar },
    { number: 2, title: "Details", icon: FiAward },
    { number: 3, title: "Review", icon: FiZap }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 tron-grid animate-grid-flow pointer-events-none"></div>
      
      {/* Header */}
      <div className="relative max-w-4xl mx-auto mb-8">
        <button
          onClick={() => navigate("/organizer")}
          className="flex items-center gap-2 text-cyan-300 hover:text-white mb-6 transition-all duration-300 group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono tracking-wide">BACK TO DASHBOARD</span>
        </button>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 text-glow">
          CREATE NEW MISSION
        </h1>
        <p className="text-cyan-200 font-mono text-sm tracking-wide">
          INITIATE EVENT PROTOCOL SEQUENCE
        </p>
        <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-3 animate-subtle-pulse"></div>
      </div>

      {/* Progress Steps */}
      <div className="relative max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = step.number < activeStep;
            const isActive = step.number === activeStep;
            
            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className={`flex flex-col items-center transition-all duration-500 ${
                  isCompleted ? 'scale-110' : isActive ? 'scale-105' : 'scale-100'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                    isCompleted 
                      ? 'bg-gradient-to-r from-green-400 to-cyan-500 text-white shadow-lg shadow-green-500/50' 
                      : isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 animate-pulse'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {isCompleted ? '✓' : <Icon />}
                  </div>
                  <span className={`mt-2 text-sm font-medium transition-colors duration-300 ${
                    isCompleted ? 'text-green-400' : isActive ? 'text-cyan-300' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 transition-all duration-500 ${
                    isCompleted 
                      ? 'bg-gradient-to-r from-green-400 to-cyan-500' 
                      : 'bg-gray-700'
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Success Animation */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FiZap className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">MISSION DEPLOYED!</h3>
            <p className="text-cyan-200">Event protocol initiated successfully</p>
          </div>
        </div>
      )}

      <div className="relative max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-shake">
              <p className="text-red-400 text-center font-mono">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Information */}
          {activeStep === 1 && (
            <div className="tron-card-glow p-8 space-y-6 animate-fade-in-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-500 rounded-lg">
                  <FiCalendar className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-white">MISSION PARAMETERS</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TronInput
                  label="MISSION TITLE"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  icon={FiZap}
                  placeholder="Enter event title..."
                />
                
                <div className="space-y-2">
                  <label className="block text-cyan-200 font-mono text-sm tracking-wide">
                    LOCATION TYPE
                  </label>
                  <div className="flex gap-4">
                    {['online', 'offline', 'hybrid'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="location"
                          value={type}
                          checked={form.location === type}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 group-hover:scale-110 ${
                          form.location === type 
                            ? 'border-cyan-400 bg-cyan-400 shadow-lg shadow-cyan-400/50' 
                            : 'border-gray-600 group-hover:border-cyan-400'
                        }`}></div>
                        <span className="text-gray-300 group-hover:text-white capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <TronTextArea
                label="MISSION BRIEFING"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                placeholder="Describe your event in detail..."
                rows={5}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TronInput
                  label="START CYCLE"
                  name="start"
                  type="datetime-local"
                  value={form.start}
                  onChange={handleChange}
                  required
                  icon={FiCalendar}
                />
                
                <TronInput
                  label="END CYCLE"
                  name="end"
                  type="datetime-local"
                  value={form.end}
                  onChange={handleChange}
                  required
                  icon={FiCalendar}
                />
              </div>
            </div>
          )}

          {/* Step 2: Event Details */}
          {activeStep === 2 && (
            <div className="tron-card-glow p-8 space-y-6 animate-fade-in-right">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <FiAward className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-white">MISSION REWARDS</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TronInput
                  label="REWARD POOL"
                  name="prize"
                  value={form.prize}
                  onChange={handleChange}
                  icon={FiDollarSign}
                  placeholder="e.g., $10,000"
                />
                
                <div>
                  <label className="block text-cyan-200 font-mono text-sm tracking-wide mb-3">
                    REWARD TYPE
                  </label>
                  <div className="relative group">
                    <select 
                      name="prizeType" 
                      value={form.prizeType} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white appearance-none cursor-pointer transition-all duration-300"
                    >
                      <option value="cash">Cash Prize</option>
                      <option value="scholarship">Scholarship</option>
                      <option value="goods">Goods & Swag</option>
                      <option value="unknown">To be announced</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-cyan-400 transition-colors">
                      <FiAward />
                    </div>
                  </div>
                </div>
              </div>

              <TronInput
                label="REGISTRATION PORTAL"
                name="url"
                value={form.url}
                onChange={handleChange}
                icon={FiLink}
                placeholder="https://example.com/register"
                type="url"
              />

              <div className="space-y-4">
                <label className="block text-cyan-200 font-mono text-sm tracking-wide">
                  MISSION BANNER
                </label>
                <div className="relative group">
                  <TronInput
                    name="bannerImage"
                    value={form.bannerImage}
                    onChange={handleChange}
                    icon={FiImage}
                    placeholder="https://example.com/banner.jpg"
                    type="url"
                  />
                </div>
                
                {imagePreview && (
                  <div className="mt-4 animate-fade-in-up">
                    <div className="relative h-48 rounded-xl overflow-hidden border border-cyan-500/30">
                      <img 
                        src={imagePreview} 
                        alt="Banner preview" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TronInput
                  label="MISSION THEMES"
                  name="themes"
                  value={form.themes}
                  onChange={handleChange}
                  icon={FiTag}
                  placeholder="AI, Blockchain, Web3 (comma separated)"
                />
                
                <TronInput
                  label="REQUIRED SKILLS"
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  icon={FiCode}
                  placeholder="React, Node.js, Design (comma separated)"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {activeStep === 3 && (
            <div className="tron-card-glow p-8 space-y-6 animate-scale-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500 rounded-lg">
                  <FiZap className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-white">MISSION REVIEW</h2>
              </div>

              <div className="space-y-6">
                <ReviewSection title="Basic Information">
                  <ReviewItem label="Title" value={form.title} />
                  <ReviewItem label="Description" value={form.description} />
                  <ReviewItem label="Location" value={form.location} />
                  <ReviewItem label="Start Date" value={form.start ? new Date(form.start).toLocaleString() : ''} />
                  <ReviewItem label="End Date" value={form.end ? new Date(form.end).toLocaleString() : ''} />
                </ReviewSection>

                <ReviewSection title="Rewards & Details">
                  <ReviewItem label="Prize" value={form.prize || 'Not specified'} />
                  <ReviewItem label="Prize Type" value={form.prizeType} />
                  <ReviewItem label="Registration URL" value={form.url || 'Not provided'} />
                  <ReviewItem label="Themes" value={form.themes || 'Not specified'} />
                  <ReviewItem label="Skills" value={form.skills || 'Not specified'} />
                </ReviewSection>

                {imagePreview && (
                  <ReviewSection title="Banner Preview">
                    <div className="h-32 rounded-lg overflow-hidden border border-cyan-500/30">
                      <img 
                        src={imagePreview} 
                        alt="Event banner" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </ReviewSection>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-cyan-500/20">
            <button
              type="button"
              onClick={() => setActiveStep(step => Math.max(1, step - 1))}
              disabled={activeStep === 1}
              className="px-8 py-3 border border-cyan-500/40 text-cyan-300 rounded-xl hover:bg-cyan-500/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold font-mono tracking-wide"
            >
              PREVIOUS
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold font-mono tracking-wide flex items-center gap-3 hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  DEPLOYING...
                </>
              ) : activeStep === 3 ? (
                <>
                  <FiZap className="animate-pulse" />
                  LAUNCH MISSION
                </>
              ) : (
                <>
                  CONTINUE
                  <FiZap />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Enhanced Input Component
function TronInput({ label, icon: Icon, ...props }) {
  return (
    <div className="space-y-2 group">
      <label className="block text-cyan-200 font-mono text-sm tracking-wide">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 group-focus-within:text-cyan-300 transition-colors duration-300">
            <Icon />
          </div>
        )}
        <input
          {...props}
          className={`w-full bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder-gray-400 transition-all duration-300 ${
            Icon ? 'pl-10 pr-4' : 'px-4'
          } py-3`}
        />
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 group-focus-within:w-full"></div>
      </div>
    </div>
  );
}

// Enhanced TextArea Component
function TronTextArea({ label, icon: Icon, ...props }) {
  return (
    <div className="space-y-2 group">
      <label className="block text-cyan-200 font-mono text-sm tracking-wide">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-3 text-cyan-400 group-focus-within:text-cyan-300 transition-colors duration-300">
            <Icon />
          </div>
        )}
        <textarea
          {...props}
          className={`w-full bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder-gray-400 transition-all duration-300 resize-none ${
            Icon ? 'pl-10 pr-4' : 'px-4'
          } py-3`}
        />
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 group-focus-within:w-full"></div>
      </div>
    </div>
  );
}

// Review Components
function ReviewSection({ title, children }) {
  return (
    <div className="border border-cyan-500/20 rounded-xl p-4 bg-gray-800/50 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-cyan-300 mb-3 font-mono tracking-wide">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-cyan-500/10 last:border-b-0">
      <span className="text-gray-400 font-mono text-sm">{label}:</span>
      <span className="text-white text-sm font-medium text-right">{value}</span>
    </div>
  );
}

// Add these animations to your CSS
const createEventAnimations = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes fade-in-left {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fade-in-right {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-left {
  animation: fade-in-left 0.6s ease-out forwards;
}

.animate-fade-in-right {
  animation: fade-in-right 0.6s ease-out forwards;
}

.animate-scale-in {
  animation: scale-in 0.4s ease-out forwards;
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = createEventAnimations;
  document.head.appendChild(styleSheet);
}