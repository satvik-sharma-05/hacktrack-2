export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 text-center min-h-[80vh] flex items-center">
      {/* Very subtle overlay for text readability only */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Minimal grid background - very subtle */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          animation: 'gridMove 30s linear infinite'
        }}></div>
      </div>
      
      {/* Very subtle glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400 rounded-full filter blur-3xl opacity-5"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tight">
          <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl">
            DISCOVER
          </span>
          <br />
          <span className="text-white drop-shadow-2xl font-bold">& TRACK</span>
        </h2>
        
        <p className="text-2xl md:text-3xl text-cyan-100 max-w-3xl mx-auto mb-12 font-light drop-shadow-lg tracking-wide">
          Join the ultimate hackathon platform. Build, compete, and grow with developers worldwide.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <a
            href="/events"
            className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black text-lg rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all transform hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/50 border-2 border-cyan-300 uppercase tracking-wider"
          >
            Explore Hackathons →
          </a>
          <a
            href="/find-teammates"
            className="px-10 py-5 bg-transparent text-cyan-300 font-bold text-lg rounded-xl border-2 border-cyan-400 hover:bg-cyan-400/10 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/30 uppercase tracking-wider"
          >
            Find Teammates
          </a>
        </div>
      </div>
      
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
      `}</style>
    </section>
  );
}