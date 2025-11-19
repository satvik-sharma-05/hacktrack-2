// src/components/invitations/SendInvitationModal.jsx
import { useState, useEffect } from "react";
import { sendInvitation } from "../../services/invitationApi";
import { useAuth } from "../../context/AuthContext";
import { FiX, FiSend, FiUsers, FiMessageSquare, FiZap, FiCode } from "react-icons/fi";

export default function SendInvitationModal({ user, isOpen, onClose, onSuccess }) {
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [projectContext, setProjectContext] = useState({
        name: "",
        description: ""
    });
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const defaultMessages = [
        "I'd like to invite you to join my team!",
        "Your skills would be a great addition to our project!",
        "Interested in collaborating on a hackathon project?",
        "I think we'd make a great team based on our complementary skills!",
        "Would you like to work together on an upcoming project?"
    ];

    useEffect(() => {
        if (isOpen) {
            setMessage("");
            setProjectContext({ name: "", description: "" });
            setSelectedTemplate(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        try {
            await sendInvitation(
                user._id,
                message.trim(),
                projectContext.name ? projectContext : undefined
            );

            onSuccess?.();
            setTimeout(() => {
                onClose();
            }, 800);
            
        } catch (err) {
            console.error("Failed to send invitation:", err);
            alert(err.response?.data?.message || "Failed to send invitation");
        } finally {
            setLoading(false);
        }
    };

    const setDefaultMessage = (defaultMsg, index) => {
        setMessage(defaultMsg);
        setSelectedTemplate(index);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-blue-900/10"></div>
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(34,211,238,0.03)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
            
            {/* Main Modal */}
            <div className="relative bg-gray-900 border border-cyan-500/40 rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto animate-slideUp">
                {/* Header */}
                <div className="p-6 border-b border-cyan-500/30 bg-gray-800/50 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500 rounded-xl">
                                <FiSend className="text-white text-xl" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-wide">
                                    Send Invitation
                                </h2>
                                <p className="text-cyan-200 text-sm mt-1">
                                    Invite {user.name} to collaborate
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-cyan-500/20 rounded-xl transition-all duration-300 text-cyan-300 hover:text-white"
                        >
                            <FiX className="text-xl" />
                        </button>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-6 border-b border-cyan-500/20 bg-gray-800/30">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                user.name?.charAt(0)?.toUpperCase()
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-xl text-white mb-2">
                                {user.name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {user.skills?.slice(0, 4).map((skill, index) => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs border border-cyan-500/30 font-medium"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {user.skills?.length > 4 && (
                                    <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs border border-gray-600">
                                        +{user.skills.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Quick Message Templates */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <FiZap className="text-cyan-400 text-lg" />
                            <label className="text-lg font-semibold text-white">
                                Quick Templates
                            </label>
                        </div>
                        <div className="grid gap-2">
                            {defaultMessages.map((template, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setDefaultMessage(template, index)}
                                    className={`w-full text-left p-3 text-gray-200 rounded-lg border transition-all duration-200 text-sm ${
                                        selectedTemplate === index 
                                            ? 'border-cyan-400 bg-cyan-500/20 text-white' 
                                            : 'border-cyan-500/30 bg-gray-800/50 hover:bg-cyan-500/10 hover:border-cyan-400/50'
                                    }`}
                                >
                                    {template}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Message */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <FiMessageSquare className="text-cyan-400 text-lg" />
                            <label htmlFor="message" className="text-lg font-semibold text-white">
                                Your Message <span className="text-red-400">*</span>
                            </label>
                        </div>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell them why you'd like to collaborate..."
                            rows="4"
                            className="w-full px-4 py-3 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-gray-400 resize-none transition-colors duration-200"
                            required
                        />
                        <p className="text-cyan-300 text-sm text-right">
                            {message.length}/500 characters
                        </p>
                    </div>

                    {/* Project Context */}
                    <div className="border-t border-cyan-500/20 pt-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <FiCode className="text-cyan-400 text-lg" />
                            <h3 className="text-lg font-semibold text-white">
                                Project Details (Optional)
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="projectName" className="block text-cyan-200 text-sm mb-2">
                                    Project Name
                                </label>
                                <input
                                    id="projectName"
                                    type="text"
                                    value={projectContext.name}
                                    onChange={(e) => setProjectContext(prev => ({
                                        ...prev,
                                        name: e.target.value
                                    }))}
                                    placeholder="e.g., AI Chatbot, E-commerce Platform"
                                    className="w-full px-4 py-3 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-gray-400 transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="projectDescription" className="block text-cyan-200 text-sm mb-2">
                                    Project Description
                                </label>
                                <textarea
                                    id="projectDescription"
                                    value={projectContext.description}
                                    onChange={(e) => setProjectContext(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }))}
                                    placeholder="Briefly describe the project or collaboration..."
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-800 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-gray-400 resize-none transition-colors duration-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-cyan-500/20">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-cyan-500/40 text-cyan-300 rounded-lg hover:bg-cyan-500/10 hover:text-white transition-all duration-200 font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="flex-1 bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 disabled:bg-cyan-500/50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center gap-2 hover:scale-105 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <FiSend />
                                    Send Invitation
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Animation Styles */}
            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}