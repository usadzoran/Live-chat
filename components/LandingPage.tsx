
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
          src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Luxury Lifestyle" 
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent"></div>
      </div>

      <nav className="absolute top-0 w-full h-24 flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl stream-gradient flex items-center justify-center shadow-2xl shadow-pink-500/20">
            <i className="fa-solid fa-face-grin-stars text-white text-2xl"></i>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl tracking-tighter leading-none">
              <span className="font-light text-zinc-400">My</span>
              <span className="font-black text-white ml-1">Doll</span>
            </h1>
            <p className="text-[10px] text-pink-500 uppercase tracking-[0.4em] font-black mt-1">Elite Social Club</p>
          </div>
        </div>
        <button 
          onClick={onGetStarted}
          className="px-8 py-3 bg-white text-black hover:bg-zinc-200 rounded-2xl text-[10px] font-black tracking-widest transition-all shadow-2xl active:scale-95 uppercase"
        >
          ENTER CLUB
        </button>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-20 max-w-6xl">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded-full">
            <span className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em]">The World's Most Exclusive Playground</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter">
            Where Elite <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-400 to-purple-500 bg-300% animate-gradient">Mentors Meet Dolls.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
            Welcome to the premier destination for <span className="text-white font-bold">Sugar Daddies</span> and <span className="text-white font-bold">Sugar Mommies</span> seeking high-energy digital companionship. 
            Find your perfect <span className="text-pink-400 italic">Doll</span> and support their dreams in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <button 
              onClick={onGetStarted}
              className="px-10 py-5 bg-pink-600 text-white hover:bg-pink-500 font-black text-sm rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              BECOME A MEMBER
              <i className="fa-solid fa-crown transition-transform group-hover:scale-110"></i>
            </button>
            <button 
              className="px-10 py-5 bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 text-zinc-100 font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              DISCOVER DOLLS
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-12 border-t border-white/5">
            <div>
              <p className="text-3xl font-black text-white">45K+</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Elite Mentors</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">120K+</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Active Dolls</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">$12M+</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Support Granted</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">24/7</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">VIP Concierge</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 px-8 py-8 flex justify-between items-center border-t border-white/5">
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">© 2025 My Doll Elite Social</p>
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
