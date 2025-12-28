
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-[100dvh] w-full bg-zinc-950 flex flex-col relative overflow-hidden text-white">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-zinc-900">
        <img 
          src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Luxury" 
          className="w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent"></div>
      </div>

      <nav className="absolute top-0 w-full h-20 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl stream-gradient flex items-center justify-center shadow-2xl">
            <i className="fa-solid fa-face-grin-stars text-white text-xl"></i>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tighter leading-none">My Doll</h1>
            <p className="text-[8px] text-pink-500 uppercase tracking-widest font-black">Elite Circle</p>
          </div>
        </div>
        <button 
          onClick={onGetStarted}
          className="px-5 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-[9px] font-black tracking-widest transition-all uppercase"
        >
          ENTER
        </button>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-20 max-w-6xl">
        <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full">
            <span className="text-[8px] md:text-[10px] font-black text-pink-400 uppercase tracking-widest">Elite Discovery Club</span>
          </div>
          
          <h1 className="text-4xl md:text-8xl font-black leading-[1.1] tracking-tighter">
            Elite Meets <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-400 to-purple-500 animate-gradient">Digital Art.</span>
          </h1>
          
          <p className="text-sm md:text-xl text-zinc-500 max-w-xl leading-relaxed">
            Welcome to the premier destination for <span className="text-white">Sugar Daddies</span> and <span className="text-white">Sugar Mommies</span>. 
            Find your perfect <span className="text-pink-400 italic">Doll</span> in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-pink-600 text-white hover:bg-pink-500 font-black text-xs rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              BECOME A MEMBER
              <i className="fa-solid fa-crown text-[10px]"></i>
            </button>
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-zinc-900/80 border border-white/5 text-zinc-100 font-black text-xs rounded-2xl transition-all active:scale-95"
            >
              VIEW THE GALLERY
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 pt-8 md:pt-12 border-t border-white/5">
            <div>
              <p className="text-2xl md:text-3xl font-black text-white">45K+</p>
              <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mt-0.5">Mentors</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-white">120K+</p>
              <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mt-0.5">Elite Dolls</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 px-6 py-6 flex justify-between items-center border-t border-white/5 bg-zinc-950">
        <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">© 2025 My Doll Elite</p>
        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-zinc-700">
            <i className="fa-brands fa-instagram text-xs"></i>
            <i className="fa-brands fa-tiktok text-xs"></i>
          </div>
          <div className="h-4 w-[1px] bg-zinc-800"></div>
          <button 
            onClick={() => window.location.hash = '/admin-portal'}
            className="text-[8px] text-zinc-800 font-black uppercase tracking-widest hover:text-zinc-600 transition-colors"
          >
            System Login
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
