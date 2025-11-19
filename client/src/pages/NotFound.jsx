// src/pages/NotFound.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  const [gridVisible, setGridVisible] = useState(false);
  const [scanlinePosition, setScanlinePosition] = useState(0);

  useEffect(() => {
    setGridVisible(true);
    
    // Animated scanline
    const interval = setInterval(() => {
      setScanlinePosition((prev) => (prev + 10) % 100);
    }, 150);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Subtle TRON Grid */}
      <div className={`absolute inset-0 opacity-10 transition-opacity duration-1000 ${gridVisible ? 'opacity-10' : 'opacity-0'}`}>
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

      {/* Animated Scanline */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.1) 50%, transparent 100%)`,
          transform: `translateX(${scanlinePosition}%)`,
          transition: 'transform 0.15s linear'
        }}
      />

      <div className="text-center max-w-md w-full space-y-8 relative z-10">
        
        {/* 404 Digits */}
        <div className="space-y-2">
          <div className="flex justify-center gap-4">
            <div className="relative">
              <span className="text-8xl md:text-9xl font-black text-orange-400 animate-pulse">
                4
              </span>
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-cyan-400 rounded-full blur-md opacity-30 animate-ping" />
            </div>
            <div className="relative">
              <span className="text-8xl md:text-9xl font-black text-cyan-400 animate-pulse delay-150">
                0
              </span>
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-orange-400 rounded-full blur-md opacity-30 animate-ping delay-150" />
            </div>
            <div className="relative">
              <span className="text-8xl md:text-9xl font-black text-orange-400 animate-pulse delay-300">
                4
              </span>
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-cyan-400 rounded-full blur-md opacity-30 animate-ping delay-300" />
            </div>
          </div>
          
          {/* Error Message */}
          <h1 className="text-2xl md:text-3xl font-bold text-cyan-300 tracking-widest uppercase">
            ACCESS DENIED
          </h1>
          <p className="text-cyan-400/70 text-sm md:text-base">
            The requested node cannot be found in the Grid
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-gray-950/80 border border-cyan-700/40 rounded-xl p-6 backdrop-blur-sm">
          <div className="space-y-2 text-sm">
            <p className="text-cyan-300/70 flex items-center gap-2">
              <FiArrowLeft className="text-orange-400" />
              <span>Route not recognized</span>
            </p>
            <p className="text-cyan-300/70 flex items-center gap-2">
              <span className="w-1 h-4 bg-cyan-400 animate-pulse" />
              <span>System: ERROR_404</span>
            </p>
            <p className="text-cyan-300/70 flex items-center gap-2">
              <span className="text-orange-400">⚠️</span>
              <span>Access level: USER</span>
            </p>
          </div>
        </div>

        {/* Return Button */}
        <div className="pt-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gray-950 border-2 border-cyan-600 text-cyan-300 font-bold text-lg uppercase tracking-wider rounded-lg transition-all duration-300 hover:border-cyan-400 hover:text-cyan-200 hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:scale-105"
          >
            <FiHome size={20} className="group-hover:animate-pulse" />
            Return to Grid
          </Link>
        </div>

        {/* Debug Info (optional - remove in production) */}
        <div className="text-xs text-cyan-500/50 text-center">
          <p>Grid Node: {window.location.href}</p>
          <p>Status: DISCONNECTED</p>
        </div>
      </div>

      {/* Floating Grid Elements */}
      <div className="absolute top-20 left-10 w-8 h-8 border-2 border-cyan-400 opacity-20 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-6 h-6 border-2 border-orange-400 opacity-20 animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-5 w-4 h-4 border border-cyan-400 opacity-15 animate-ping" />
    </div>
  );
}