// components/layout/Layout.jsx
import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* TRON Grid Background – Optimized Performance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Static Grid Base Layer */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 243, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 243, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Animated Grid Layer - Reduced Motion */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(183, 103, 255, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(183, 103, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            animation: 'gridMove 60s linear infinite'
          }}
        />

        {/* Optimized Laser Beams - Reduced Quantity */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              style={{
                top: `${20 + i * 30}%`,
                left: '-100%',
                width: '200%',
                animation: `laserScan ${8 + i * 2}s linear infinite`,
                animationDelay: `${i * 3}s`,
                filter: 'blur(0.5px)',
                boxShadow: '0 0 4px rgba(0, 243, 255, 0.4)',
                transform: 'translateZ(0)',
                willChange: 'transform'
              }}
            />
          ))}
        </div>

        {/* Reduced Circuit Elements - Better Performance */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-cyan-400/15 rounded-sm"
              style={{
                width: `${6 + (i % 2) * 6}px`,
                height: `${6 + (i % 2) * 6}px`,
                left: `${(i * 15) % 100}%`,
                top: `${(i * 18) % 100}%`,
                animation: `circuitFloat ${20 + (i % 3) * 5}s ease-in-out infinite`,
                animationDelay: `${(i % 5) * 2}s`,
                opacity: 0.08 + (i % 3) * 0.02,
                transform: 'translateZ(0)',
                willChange: 'transform, opacity'
              }}
            />
          ))}
        </div>

        {/* Static Glow Effects - No Animation */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/3 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        {/* Additional Static Accents */}
        <div className="absolute top-1/4 right-10 w-32 h-32 bg-cyan-400/2 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 left-10 w-48 h-48 bg-purple-400/2 rounded-full blur-2xl"></div>
      </div>

      {/* Content Container - Remove opacity transition that might cause issues */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 relative">
          {/* Content Wrapper - Ensure proper scrolling context */}
          <div className="relative z-10 min-h-[80vh] w-full">
            {children}
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Optimized Global Styles */}
      <style jsx global>{`
        /* Reset form styles to prevent default behaviors */
        form {
          margin: 0;
          padding: 0;
        }
        
        button {
          border: none;
          background: none;
          cursor: pointer;
        }
        
        input {
          border: none;
          outline: none;
        }

        /* Reduced Motion Animations */
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 100px 100px; }
        }
        
        @keyframes laserScan {
          0% { 
            transform: translateX(-100%) translateZ(0); 
            opacity: 0; 
          }
          10% { opacity: 0.7; }
          15% { opacity: 1; }
          20% { opacity: 0.8; }
          50% { opacity: 0.6; }
          100% { 
            transform: translateX(100vw) translateZ(0); 
            opacity: 0; 
          }
        }
        
        @keyframes circuitFloat {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) translateZ(0); 
            opacity: 0.08; 
          }
          33% { 
            transform: translateY(-8px) translateX(4px) translateZ(0); 
            opacity: 0.12; 
          }
          66% { 
            transform: translateY(4px) translateX(-4px) translateZ(0); 
            opacity: 0.1; 
          }
        }

        /* Smooth Scrolling */
        html, body { 
          margin: 0;
          padding: 0;
          scroll-behavior: smooth; 
          background: #000;
          overflow-x: hidden;
          height: 100%;
        }

        #__next {
          min-height: 100vh;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { 
          width: 6px; 
        }
        ::-webkit-scrollbar-track { 
          background: #000; 
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #00f3ff, #b967ff);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #00ffff, #c97cff);
        }

        /* Selection Styles */
        ::selection { 
          background: rgba(0, 243, 255, 0.2); 
          color: #00f3ff; 
        }
        ::-moz-selection { 
          background: rgba(0, 243, 255, 0.2); 
          color: #00f3ff; 
        }

        /* Focus Styles */
        *:focus { 
          outline: 2px solid rgba(0, 243, 255, 0.4); 
          outline-offset: 1px; 
        }

        /* Utility Animations */
        .pulse-glow { 
          animation: pulseGlow 3s ease-in-out infinite alternate; 
        }
        
        @keyframes pulseGlow {
          from { 
            box-shadow: 0 0 5px rgba(0, 243, 255, 0.3); 
          }
          to { 
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.6), 0 0 25px rgba(0, 243, 255, 0.3); 
          }
        }

        .neon-glow { 
          text-shadow: 
            0 0 5px currentColor, 
            0 0 10px currentColor, 
            0 0 15px currentColor, 
            0 0 20px currentColor; 
        }

        .tron-grid-pattern {
          background-image: 
            linear-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 243, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        /* Prevent form submission page jumps */
        form:focus {
          outline: none;
        }

        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Performance Optimizations */
        .will-change-transform {
          will-change: transform;
        }
        
        .will-change-opacity {
          will-change: opacity;
        }
      `}</style>
    </div>
  );
}