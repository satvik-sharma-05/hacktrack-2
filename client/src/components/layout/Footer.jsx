// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";
import { 
  FiGithub, 
  FiTwitter, 
  FiMessageCircle, 
  FiMail, 
  FiUsers, 
  FiBookmark, 
  FiCompass, 
  FiAward,
  FiZap 
} from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-cyan-500/20">
      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}
        ></div>
      </div>

      {/* Glowing orbs in background */}
      <div className="absolute top-0 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-cyan-500 rounded-full filter blur-3xl opacity-5"></div>
      <div className="absolute bottom-0 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-blue-500 rounded-full filter blur-3xl opacity-5"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <FiZap className="text-black text-lg md:text-xl" />
              </div>
              <span className="font-bold text-xl md:text-2xl">
                <span className="text-white">Hack</span>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Track</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-md mx-auto sm:mx-0">
              Enter the digital frontier. Build, innovate, and dominate in the ultimate hackathon arena.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-cyan-400 font-bold uppercase tracking-wider text-xs md:text-sm mb-3 md:mb-4">
              PROGRAMS
            </h4>
            <ul className="space-y-2 md:space-y-3">
              {[
                { name: 'Explore', icon: FiCompass, path: '/events' },
                { name: 'My Hackathons', icon: FiBookmark, path: '/my-hackathons' },
                { name: 'Bookmarks', icon: FiBookmark, path: '/bookmarks' },
                { name: 'Teams', icon: FiUsers, path: '/find-teammates' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-xs md:text-sm group justify-center sm:justify-start"
                  >
                    <item.icon size={14} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div className="text-center sm:text-left">
            <h4 className="text-blue-400 font-bold uppercase tracking-wider text-xs md:text-sm mb-3 md:mb-4">
              COMMUNITY
            </h4>
            <ul className="space-y-2 md:space-y-3">
              {[
                { name: 'Teammates', icon: FiUsers, path: '/find-teammates' },
                { name: 'Invitations', icon: FiMail, path: '/invitations' },
                { name: 'Chat', icon: FiMessageCircle, path: '/chat' },
                { name: 'Leaderboard', icon: FiAward, path: '/leaderboard' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors duration-300 text-xs md:text-sm group justify-center sm:justify-start"
                  >
                    <item.icon size={14} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="text-center sm:text-left">
            <h4 className="text-cyan-400 font-bold uppercase tracking-wider text-xs md:text-sm mb-3 md:mb-4">
              CONNECT
            </h4>
            <div className="flex justify-center sm:justify-start space-x-2 md:space-x-3 mb-3 md:mb-4">
              {[
                { icon: FiGithub, href: "#", label: "GitHub" },
                { icon: FiTwitter, href: "#", label: "Twitter" },
                { icon: FiMessageCircle, href: "#", label: "Discord" },
                { icon: FiMail, href: "#", label: "Email" }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-1.5 md:p-2 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-500 transition-all duration-300 text-gray-400 hover:text-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20"
                  aria-label={social.label}
                >
                  <social.icon size={16} className="md:w-4 md:h-4" />
                </a>
              ))}
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-wide leading-relaxed">
              Ready to join the grid?<br />
              <span className="text-cyan-400">Start your journey today.</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cyan-500/20 pt-4 md:pt-6 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <p className="text-gray-500 text-xs uppercase tracking-wide text-center md:text-left order-2 md:order-1">
            © 2024 <span className="text-cyan-400">HACKTRACK</span>. ALL SYSTEMS OPERATIONAL.
          </p>
          <div className="flex space-x-4 md:space-x-6 order-1 md:order-2">
            {['Privacy', 'Terms', 'Security'].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className="text-gray-500 hover:text-cyan-400 transition-colors duration-300 text-xs uppercase tracking-wide"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Circuit Elements */}
      <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 w-2 h-2 md:w-3 md:h-3 border border-cyan-500/30 animate-pulse"></div>
      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-1.5 h-1.5 md:w-2 md:h-2 border border-blue-500/30 animate-pulse" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute top-2 left-1/4 md:top-4 md:left-1/4 w-1 h-1 bg-cyan-500/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-4 right-1/4 md:top-8 md:right-1/4 w-1 h-1 bg-blue-500/30 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </footer>
  );
}