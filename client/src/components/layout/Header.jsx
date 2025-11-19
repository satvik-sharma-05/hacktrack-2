// src/components/layout/Header.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import {
  FiUser,
  FiLogOut,
  FiHome,
  FiCompass,
  FiBriefcase,
  FiUsers,
  FiBookmark,
  FiChevronDown,
  FiMail,
  FiMessageSquare,
  FiZap,
  FiMenu,
  FiX
} from "react-icons/fi";
import { useState } from "react";

export default function Header() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      localStorage.removeItem("token");
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Check if current route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Navigation items for better organization
  const navItems = [
    { to: "/events", icon: FiCompass, label: "EXPLORE", show: true },
    { to: "/find-teammates", icon: FiUsers, label: "TEAMMATES", show: user },
    { to: "/invitations", icon: FiMail, label: "INVITES", show: user },
    { to: "/chat", icon: FiMessageSquare, label: "CHAT", show: user },
    { to: "/organizer", icon: FiBriefcase, label: "DASHBOARD", show: user?.role === "organizer" },
    { to: "/admin", icon: FiBriefcase, label: "ADMIN", show: user?.role === "admin" },
  ];

  return (
    <header className="top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-cyan-500/30 tron-header-glow">
      <nav className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group flex-shrink-0 tron-logo"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-cyan-500/60 transition-all duration-300 border border-cyan-400/50 pulse-glow">
              <FiZap className="text-black text-xl font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-widest uppercase">
                HACK<span className="text-cyan-400 text-glow">TRACK</span>
              </span>
              <span className="text-xs text-cyan-400/80 tracking-widest font-mono uppercase">
                DATA_MATRIX
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Main Navigation Links */}
            {navItems.map((item) =>
              item.show && (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 font-black text-sm tracking-widest uppercase border ${isActiveRoute(item.to)
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400 shadow-lg shadow-cyan-500/30 text-glow'
                      : 'text-gray-400 hover:text-cyan-300 border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/20'
                    }`}
                >
                  <item.icon size={16} className="flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            )}

            {/* Auth Section */}
            {user ? (
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 px-4 py-3 ml-2 rounded-lg hover:bg-cyan-500/10 transition-all duration-300 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 group">
                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center text-black font-bold border border-cyan-400/50 shadow-lg shadow-cyan-500/30">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-cyan-400/30"
                        />
                      ) : (
                        user.name?.charAt(0)?.toUpperCase() || <FiUser size={16} />
                      )}
                    </div>
                    <span className="font-black text-white text-sm tracking-wider uppercase max-w-[100px] truncate">
                      {user.name?.split(" ")[0] || "USER"}
                    </span>
                    <FiChevronDown size={16} className={`text-cyan-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 p-3 min-w-[240px] mt-2 animate-in fade-in-80 z-50 tron-dropdown"
                >
                  <div className="px-4 py-3 border-b border-cyan-500/20">
                    <p className="font-black text-white text-sm tracking-wider uppercase truncate">{user.name}</p>
                    <p className="text-xs text-cyan-400/80 tracking-wider font-mono truncate mt-1">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs rounded-full uppercase font-black tracking-wider">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-2 space-y-1">
                    <DropdownMenuItem asChild>
                      <Link
                        to={user?.role === "admin" ? "/admin" : "/profile"}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cyan-500/10 text-gray-300 hover:text-cyan-400 transition-all duration-300 w-full text-left cursor-pointer text-sm tracking-wider uppercase border border-transparent hover:border-cyan-500/20"
                        onClick={() => setOpen(false)}
                      >
                        <FiUser size={16} className="flex-shrink-0" />
                        <span>{user?.role === "admin" ? "ADMIN PANEL" : "PROFILE"}</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        to="/bookmarks"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cyan-500/10 text-gray-300 hover:text-cyan-400 transition-all duration-300 w-full text-left cursor-pointer text-sm tracking-wider uppercase border border-transparent hover:border-cyan-500/20"
                        onClick={() => setOpen(false)}
                      >
                        <FiBookmark size={16} className="flex-shrink-0" />
                        <span>BOOKMARKS</span>
                      </Link>
                    </DropdownMenuItem>

                    <div className="my-2 border-t border-cyan-500/20"></div>

                    <DropdownMenuItem
                      onSelect={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all duration-300 cursor-pointer w-full text-left text-sm tracking-wider uppercase border border-transparent hover:border-red-500/20"
                    >
                      <FiLogOut size={16} className="flex-shrink-0" />
                      <span>LOGOUT</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link
                  to="/login"
                  className="text-gray-400 font-black hover:text-cyan-400 transition-all duration-300 px-4 py-3 rounded-lg hover:bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 text-sm tracking-wider uppercase"
                >
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-lg font-black hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/30 hover:scale-105 text-sm tracking-widest uppercase tron-button-glow"
                >
                  GET STARTED
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
          >
            {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-cyan-500/20 bg-black/95 backdrop-blur-xl py-4 animate-in slide-in-from-top tron-mobile-menu">
            {/* Navigation Links */}
            <div className="space-y-2 mb-4">
              {navItems.map((item) =>
                item.show && (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-black text-sm tracking-widest uppercase border ${isActiveRoute(item.to)
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400 shadow-lg shadow-cyan-500/30 text-glow'
                        : 'text-gray-400 hover:text-cyan-300 border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/20'
                      }`}
                  >
                    <item.icon size={16} className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              )}
            </div>

            {/* Auth Section for Mobile */}
            {user ? (
              <div className="space-y-2 border-t border-cyan-500/20 pt-4">
                <div className="px-4 py-3 border border-cyan-500/20 rounded-lg bg-cyan-500/5">
                  <p className="font-black text-white text-sm tracking-wider uppercase">{user.name}</p>
                  <p className="text-cyan-400/80 text-xs tracking-wider font-mono mt-1">{user.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs rounded-full uppercase font-black tracking-wider">
                    {user.role}
                  </span>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cyan-500/10 text-gray-300 hover:text-cyan-400 transition-all duration-300 border border-transparent hover:border-cyan-500/20 text-sm tracking-wider uppercase"
                >
                  <FiUser size={16} />
                  <span>PROFILE</span>
                </Link>

                <Link
                  to="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-cyan-500/10 text-gray-300 hover:text-cyan-400 transition-all duration-300 border border-transparent hover:border-cyan-500/20 text-sm tracking-wider uppercase"
                >
                  <FiBookmark size={16} />
                  <span>BOOKMARKS</span>
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all duration-300 border border-transparent hover:border-red-500/20 w-full text-left text-sm tracking-wider uppercase"
                >
                  <FiLogOut size={16} />
                  <span>LOGOUT</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 border-t border-cyan-500/20 pt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center text-gray-400 font-black hover:text-cyan-400 transition-all duration-300 px-4 py-3 rounded-lg hover:bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400/50 text-sm tracking-wider uppercase"
                >
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-3 rounded-lg font-black hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/30 text-sm tracking-widest uppercase tron-button-glow"
                >
                  GET STARTED
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <style jsx>{`
        .tron-header-glow {
          box-shadow: 0 0 30px rgba(0, 242, 254, 0.15),
                     0 0 60px rgba(157, 78, 221, 0.1);
        }
        
        .tron-logo:hover {
          transform: translateY(-1px);
        }
        
        .tron-button-glow {
          position: relative;
          overflow: hidden;
        }
        
        .tron-button-glow::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.8s;
        }
        
        .tron-button-glow:hover::before {
          left: 100%;
        }
        
        .tron-dropdown {
          box-shadow: 0 10px 40px rgba(0, 242, 254, 0.15),
                     0 0 20px rgba(157, 78, 221, 0.1);
        }
        
        .tron-mobile-menu {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
        }
        
        .pulse-glow {
          animation: subtle-pulse 3s ease-in-out infinite;
        }
        
        @keyframes subtle-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(0, 242, 254, 0.4);
          }
          50% { 
            box-shadow: 0 0 30px rgba(0, 242, 254, 0.8);
          }
        }
        
        .text-glow {
          text-shadow: 0 0 10px rgba(0, 242, 254, 0.8),
                     0 0 20px rgba(157, 78, 221, 0.4);
        }
      `}</style>
    </header>
  );
}