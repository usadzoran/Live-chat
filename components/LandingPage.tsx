
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* Navbar Overlay */}
      <nav className="absolute top-0 w-full h-20 flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl stream-gradient flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-broadcast-tower text-white text-xl"></i>
          </div>
          <span className="text-xl font-bold text-white">GeminiLive</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-bold text-white transition-all"
        >
          SIGN IN
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col">
        {/* Main Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Young creators collaborating" 
            className="w-full h-full object-cover opacity-60 filter grayscale-[20%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-20 max-w-5xl pt-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Next-Gen Streaming</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
              Where Talents <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent italic">Meet Interaction.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
              Explore your hidden talents and share your passion with fans across the globe. 
              GeminiLive gives young creators the tools to shine, interact with AI-driven engagement, 
              and build a community that truly cares.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onGetStarted}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                JOIN THE COMMUNITY
                <i className="fa-solid fa-arrow-right"></i>
              </button>
              <button 
                className="px-10 py-4 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                BROWSE STREAMS
              </button>
            </div>

            {/* Stats Overlay */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-12">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">50K+</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Active Creators</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">1M+</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Talents Shared</p>
              </div>
              <div className="space-y-1 hidden md:block">
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Live Interactive AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 px-8 py-6 flex justify-between items-center bg-zinc-950/80 backdrop-blur-sm border-t border-white/5">
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">© 2025 GeminiLive Platform</p>
        <div className="flex gap-4">
          <i className="fa-brands fa-instagram text-zinc-600 hover:text-white transition-colors cursor-pointer"></i>
          <i className="fa-brands fa-tiktok text-zinc-600 hover:text-white transition-colors cursor-pointer"></i>
          <i className="fa-brands fa-twitter text-zinc-600 hover:text-white transition-colors cursor-pointer"></i>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
