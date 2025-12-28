
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col relative overflow-hidden text-white">
      {/* Background with explicit fallback color */}
      <div className="absolute inset-0 z-0 bg-zinc-900">
        <img 
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Creators" 
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent"></div>
      </div>

      <nav className="absolute top-0 w-full h-20 flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl stream-gradient flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-broadcast-tower text-white text-xl"></i>
          </div>
          <span className="text-xl font-bold tracking-tight">GeminiSocial</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
        >
          LOG IN
        </button>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-20 max-w-6xl">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Next-Gen Interaction</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter">
            Talents meet <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-400 bg-300% animate-gradient">Real Emotion.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
            The world's first AI-integrated live streaming social club. 
            Connect with creators, find your spark, and engage in meaningful 
            conversations powered by high-fidelity AI personalities.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <button 
              onClick={onGetStarted}
              className="px-10 py-5 bg-white text-black hover:bg-zinc-200 font-black text-sm rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              START EXPLORING
              <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
            </button>
            <button 
              className="px-10 py-5 bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 text-zinc-100 font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              HOW IT WORKS
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-12 border-t border-white/5">
            <div>
              <p className="text-3xl font-black text-white">120K+</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Creators</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">4.2M</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Interactions</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">99%</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">AI Uptime</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 px-8 py-8 flex justify-between items-center border-t border-white/5">
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">© 2025 GeminiSocial Platform</p>
        <div className="flex gap-6 text-zinc-600">
          <i className="fa-brands fa-instagram hover:text-white cursor-pointer transition-colors"></i>
          <i className="fa-brands fa-tiktok hover:text-white cursor-pointer transition-colors"></i>
          <i className="fa-brands fa-discord hover:text-white cursor-pointer transition-colors"></i>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
