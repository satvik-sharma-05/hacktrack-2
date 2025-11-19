// src/pages/ChatPage.jsx
import { useState, useEffect, useRef } from "react";
import { getChats, getChatMessages, sendMessage, getChatWithUser } from "../services/chatApi";
import { useAuth } from "../context/AuthContext";
import { FiSend, FiSearch, FiPlus, FiX, FiClock, FiUsers, FiVideo, FiPhone, FiInfo } from "react-icons/fi";
import { FaRobot, FaBolt, FaUserAstronaut, FaShieldAlt, FaRocket } from "react-icons/fa";
import Header from "@/components/layout/Header";

export default function ChatPage() {
  const { user: currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatData, setActiveChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const res = await getChats();
      setChats(res.chats || []);
    } catch (err) {
      console.error("Failed to load chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      setMessagesLoading(true);
      const chat = chats.find(c => c._id === chatId);
      setActiveChatData(chat);

      const res = await getChatMessages(chatId);
      setMessages(res.messages || []);
      setActiveChat(chatId);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // In your ChatPage component, update the handleSendMessage function:
  const handleSendMessage = async (e) => {
    e.preventDefault(); // Make sure this is here
    e.stopPropagation(); // Add this to prevent any parent form submission

    if (!newMessage.trim() || !activeChat || sendingMessage) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      content: newMessage,
      sender: currentUser,
      createdAt: new Date().toISOString(),
      isSending: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    setSendingMessage(true);

    try {
      await sendMessage(activeChat, newMessage);

      // Remove temp message and reload actual messages
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      await loadMessages(activeChat);

      // Update last message in chats list
      setChats(prev => prev.map(chat =>
        chat._id === activeChat
          ? {
            ...chat,
            lastMessage: {
              content: newMessage,
              createdAt: new Date().toISOString(),
              sender: currentUser
            }
          }
          : chat
      ));
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages(prev => prev.map(msg =>
        msg._id === tempId ? { ...msg, error: true, isSending: false } : msg
      ));
    } finally {
      setSendingMessage(false);
    }
  };

  // Also update the form to prevent default behavior
  <form
    onSubmit={handleSendMessage}
    className="p-6 border-t border-cyan-400/30 bg-gradient-to-t from-gray-900/80 to-transparent"
  >
    <div className="flex gap-3">
      <div className="flex-1 relative group">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            // Prevent form submission on Enter key in input
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          placeholder="ENTER TRANSMISSION..."
          className="w-full bg-black/50 border-2 border-cyan-400/30 rounded-xl px-4 py-4 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 uppercase tracking-wide font-mono text-sm backdrop-blur-sm"
          maxLength={500}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        <div className="absolute bottom-2 right-3 text-cyan-400/60 text-xs font-mono">
          {newMessage.length}/500
        </div>
      </div>
      <button
        type="submit"
        disabled={!newMessage.trim() || sendingMessage}
        className="bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-cyan-400/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 uppercase tracking-wider border-2 border-transparent hover:border-cyan-300 min-w-[140px] justify-center"
        onClick={(e) => {
          e.preventDefault(); // Additional prevention on button click
          handleSendMessage(e);
        }}
      >
        {sendingMessage ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
        ) : (
          <>
            <FiSend size={18} />
            TRANSMIT
          </>
        )}
      </button>
    </div>
  </form>

  const handleCreateNewChat = async (userId) => {
    try {
      const res = await getChatWithUser(userId);
      const newChat = res.chat;

      // Add new chat to the list if it doesn't exist
      setChats(prev => {
        const exists = prev.some(chat => chat._id === newChat._id);
        if (exists) {
          return prev.map(chat => chat._id === newChat._id ? newChat : chat);
        }
        return [newChat, ...prev];
      });

      setShowNewChatModal(false);
      loadMessages(newChat._id);
    } catch (err) {
      console.error("Failed to create chat:", err);
      alert("Failed to create chat. Please try again.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessageTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Filter chats based on search
  const filteredChats = chats.filter(chat => {
    const otherParticipant = chat.participants?.find(
      participant => participant._id !== currentUser._id
    );
    return otherParticipant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 font-mono uppercase tracking-wider">INITIALIZING COMMS...</p>
          <p className="text-gray-400 text-sm mt-2 uppercase tracking-wide">ESTABLISHING SECURE CONNECTION</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header/>
    <div className="min-h-screen bg-black text-cyan-100 flex">
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

      <div className="relative z-10 flex w-full max-w-7xl mx-auto h-screen">
        {/* Chat List Sidebar */}
        <div className="w-1/3 border-r border-cyan-400/30 bg-gray-900/80 backdrop-blur-md flex flex-col shadow-2xl">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-cyan-400/30 bg-gradient-to-r from-cyan-400/10 to-purple-400/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider flex items-center gap-3">
                <FaBolt className="text-cyan-400" />
                DIGITAL COMMS
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full pulse-glow"></div>
                <span className="text-green-400 text-xs font-mono uppercase">LIVE</span>
              </div>
            </div>

            {/* Search and New Chat */}
            <div className="flex gap-3">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-cyan-400 group-hover:text-purple-400 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="SCAN CONVERSATIONS..."
                  className="w-full bg-black/50 border border-cyan-400/30 rounded-lg pl-10 pr-4 py-3 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 uppercase tracking-wide font-mono text-sm"
                />
              </div>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-black p-3 rounded-lg hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-300 border-2 border-transparent hover:border-cyan-300"
              >
                <FiPlus size={20} />
              </button>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4 text-cyan-400/30">
                  <FaRobot />
                </div>
                <h3 className="text-lg font-black text-cyan-400 mb-2 uppercase tracking-wider">
                  {searchTerm ? "NO MATCHING CHATS" : "NO ACTIVE CHANNELS"}
                </h3>
                <p className="text-gray-400 text-sm uppercase tracking-wide mb-4">
                  {searchTerm ? "Try different search terms" : "Start a new conversation to begin"}
                </p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-400/30 transition-all duration-300 uppercase tracking-wider text-sm flex items-center gap-2 mx-auto"
                >
                  <FiPlus />
                  INITIATE CHAT
                </button>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const otherParticipant = chat.participants?.find(
                  participant => participant._id !== currentUser._id
                );
                const unreadCount = chat.unreadCount || 0;

                return (
                  <div
                    key={chat._id}
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default behavior
                      e.stopPropagation(); // Stop event bubbling
                              e.nativeEvent.stopImmediatePropagation();

                      loadMessages(chat._id);
                    }} className={`p-4 border-b border-cyan-400/10 cursor-pointer transition-all duration-300 group relative overflow-hidden ${activeChat === chat._id
                        ? "bg-gradient-to-r from-cyan-400/20 to-purple-400/20 border-l-4 border-cyan-400"
                        : "hover:bg-cyan-400/10 hover:border-l-4 hover:border-cyan-400/50"
                      }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10 flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-black font-bold text-lg border-2 border-cyan-400/50 group-hover:border-cyan-400 transition-all duration-300">
                          {otherParticipant?.avatar ? (
                            <img
                              src={otherParticipant.avatar}
                              alt={otherParticipant.name}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-black"
                            />
                          ) : (
                            <FaUserAstronaut className="text-xl" />
                          )}
                        </div>
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-black text-cyan-400 truncate uppercase tracking-wide text-sm">
                            {otherParticipant?.name || "UNKNOWN USER"}
                          </h3>
                          {unreadCount > 0 && (
                            <span className="bg-red-400 text-black text-xs px-2 py-1 rounded-full font-bold min-w-6 text-center pulse-glow">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm truncate font-mono uppercase tracking-wide mb-1">
                          {chat.lastMessage?.content || "INITIALIZE COMM LINK"}
                        </p>
                        <div className="flex items-center gap-1">
                          <FiClock className="text-cyan-400/60 text-xs" />
                          <span className="text-cyan-400/60 text-xs font-mono uppercase">
                            {chat.lastMessage?.createdAt ?
                              formatMessageTime(chat.lastMessage.createdAt)
                              : 'NEW'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hover effect line */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 flex flex-col bg-gray-900/60 backdrop-blur-md border-l border-cyan-400/30">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-cyan-400/30 bg-gradient-to-r from-cyan-400/10 to-purple-400/10">
                {activeChatData && (() => {
                  const otherParticipant = activeChatData.participants?.find(
                    participant => participant._id !== currentUser._id
                  );

                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-black font-bold text-lg border-2 border-cyan-400">
                            {otherParticipant?.avatar ? (
                              <img
                                src={otherParticipant.avatar}
                                alt={otherParticipant.name}
                                className="w-16 h-16 rounded-xl object-cover border-2 border-black"
                              />
                            ) : (
                              <FaUserAstronaut className="text-2xl" />
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-cyan-400 uppercase tracking-wider">
                            {otherParticipant?.name || "UNKNOWN USER"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></div>
                            <span className="text-green-400 text-sm font-mono uppercase tracking-wide">
                              ENCRYPTED CHANNEL
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button className="p-3 border border-cyan-400/30 text-cyan-400 rounded-xl hover:bg-cyan-400/10 hover:border-cyan-400 transition-all duration-300">
                          <FiInfo size={18} />
                        </button>
                        <button className="p-3 border border-cyan-400/30 text-cyan-400 rounded-xl hover:bg-cyan-400/10 hover:border-cyan-400 transition-all duration-300">
                          <FiVideo size={18} />
                        </button>
                        <button className="p-3 border border-cyan-400/30 text-cyan-400 rounded-xl hover:bg-cyan-400/10 hover:border-cyan-400 transition-all duration-300">
                          <FiPhone size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-gray-900/50 to-black/30">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 text-cyan-400/30">
                      <FaRocket />
                    </div>
                    <h3 className="text-lg font-black text-cyan-400 mb-2 uppercase tracking-wider">
                      CHANNEL ESTABLISHED
                    </h3>
                    <p className="text-gray-400 text-sm uppercase tracking-wide">
                      Begin your encrypted conversation.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-4 text-cyan-400/60">
                      <FaShieldAlt />
                      <span className="text-xs font-mono uppercase">END-TO-END ENCRYPTED</span>
                      <FaShieldAlt />
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const showSender = index === 0 ||
                      messages[index - 1].sender._id !== message.sender._id;

                    return (
                      <div
                        key={message._id}
                        className={`flex ${message.sender._id === currentUser._id ? "justify-end" : "justify-start"} animate-message-in`}
                      >
                        <div className="max-w-xs lg:max-w-md relative group">
                          {/* Message Bubble */}
                          <div
                            className={`px-4 py-3 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 ${message.sender._id === currentUser._id
                                ? "bg-gradient-to-br from-cyan-500 to-purple-600 text-black border-cyan-400/50 shadow-lg shadow-cyan-400/20"
                                : "bg-gray-800/80 text-cyan-100 border-cyan-400/30 shadow-lg shadow-cyan-400/10"
                              } ${message.isSending ? "opacity-70 animate-pulse" : ""} ${message.error ? "border-red-400 bg-red-400/20" : ""
                              }`}
                          >
                            <p className="break-words font-mono text-sm leading-relaxed">{message.content}</p>
                            <div className={`flex items-center justify-between mt-2 text-xs ${message.sender._id === currentUser._id ? "text-black/70" : "text-cyan-400/60"
                              }`}>
                              <span className="font-mono uppercase tracking-wide">
                                {formatMessageTime(message.createdAt)}
                              </span>
                              {message.isSending && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs">SENDING</span>
                                  <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
                                  <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                  <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Sender name for received messages */}
                          {message.sender._id !== currentUser._id && showSender && (
                            <div className="text-cyan-400/60 text-xs font-mono uppercase tracking-wide mt-1 ml-1">
                              {message.sender.name}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-6 border-t border-cyan-400/30 bg-gradient-to-t from-gray-900/80 to-transparent">
                <div className="flex gap-3">
                  <div className="flex-1 relative group">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="ENTER TRANSMISSION..."
                      className="w-full bg-black/50 border-2 border-cyan-400/30 rounded-xl px-4 py-4 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 uppercase tracking-wide font-mono text-sm backdrop-blur-sm"
                      maxLength={500}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    <div className="absolute bottom-2 right-3 text-cyan-400/60 text-xs font-mono">
                      {newMessage.length}/500
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-cyan-400/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 uppercase tracking-wider border-2 border-transparent hover:border-cyan-300 min-w-[140px] justify-center"
                  >
                    {sendingMessage ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    ) : (
                      <>
                        <FiSend size={18} />
                        TRANSMIT
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-8xl mb-6 text-cyan-400/20">
                <FaRobot />
              </div>
              <h3 className="text-2xl font-black text-cyan-400 mb-4 uppercase tracking-wider">
                SELECT COMMUNICATION CHANNEL
              </h3>
              <p className="text-gray-400 text-lg uppercase tracking-wide max-w-md leading-relaxed mb-8">
                Choose a digital pathway from the command panel to establish secure communication.
              </p>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-400/10 border border-cyan-400/30 rounded-2xl flex items-center justify-center mb-3 mx-auto">
                    <FiUsers className="text-cyan-400 text-2xl" />
                  </div>
                  <p className="text-cyan-400 text-sm font-mono uppercase">TEAM CHAT</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-400/10 border border-purple-400/30 rounded-2xl flex items-center justify-center mb-3 mx-auto">
                    <FaShieldAlt className="text-purple-400 text-2xl" />
                  </div>
                  <p className="text-purple-400 text-sm font-mono uppercase">SECURE</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-400/10 border border-green-400/30 rounded-2xl flex items-center justify-center mb-3 mx-auto">
                    <FaBolt className="text-green-400 text-2xl" />
                  </div>
                  <p className="text-green-400 text-sm font-mono uppercase">INSTANT</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onCreateChat={handleCreateNewChat}
          currentUser={currentUser}
        />
      )}

      {/* Global Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 243, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #00f3ff, #b967ff);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #00ffff, #c97cff);
        }
        
        @keyframes message-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-message-in {
          animation: message-in 0.3s ease-out;
        }
        
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
      </>
  );
}

// New Chat Modal Component
function NewChatModal({ onClose, onCreateChat, currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // In a real app, you would fetch users from an API
  // For now, this is a placeholder that shows how to integrate with real APIs
  const handleUserSelect = async (userId) => {
    try {

      setLoading(true);
      await onCreateChat(userId);
    } catch (err) {
      console.error('Failed to create chat:', err);
    } finally {
      setLoading(false);
    }
  };

  // This would be replaced with actual user search API
  const searchUsers = async (query) => {
    // Implement user search API call here
    console.log("Searching users with query:", query);
    // const res = await searchUsersAPI(query);
    // setUsers(res.users || []);
  };

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        searchUsers(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-cyan-400/30 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-6 border-b border-cyan-400/30 bg-gradient-to-r from-cyan-400/10 to-purple-400/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-wider flex items-center gap-3">
              <FiPlus />
              INITIATE CHAT
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-400/20 rounded-lg border border-red-400/30 text-red-400 hover:text-red-300 transition-all duration-300"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-cyan-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH USERS..."
              className="w-full bg-black/50 border border-cyan-400/30 rounded-lg pl-10 pr-4 py-3 text-cyan-100 placeholder-cyan-400/60 focus:outline-none focus:border-cyan-400 transition-all duration-300 uppercase tracking-wide font-mono text-sm"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="max-h-96 overflow-y-auto custom-scrollbar p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-cyan-400 font-mono uppercase tracking-wide text-sm">SEARCHING NETWORK...</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4 text-cyan-400/30">
                <FaUserAstronaut />
              </div>
              <h3 className="text-lg font-black text-cyan-400 mb-2 uppercase tracking-wider">
                USER SEARCH
              </h3>
              <p className="text-gray-400 text-sm uppercase tracking-wide mb-4">
                Enter a username to find users
              </p>
              <p className="text-cyan-400/60 text-xs font-mono uppercase">
                Connect with teammates and collaborators
              </p>
            </div>
          )}

          {/* When users are found, they would be mapped here */}
          {/* {users.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserSelect(user._id)}
              className="p-4 border-b border-cyan-400/10 cursor-pointer hover:bg-cyan-400/10 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-black font-bold border-2 border-cyan-400/50">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-black"
                    />
                  ) : (
                    <FaUserAstronaut />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-cyan-400 uppercase tracking-wide text-sm">
                    {user.name}
                  </h3>
                  {user.skills && user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-cyan-400/20 text-cyan-300 rounded text-xs font-mono uppercase border border-cyan-400/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))} */}
        </div>
      </div>
    </div>
  );
}