
import React, { useState } from 'react';

interface DiscoveryProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photo: string;
  distance: string;
}

const DISCOVERY_PROFILES: DiscoveryProfile[] = [
  {
    id: 'd1',
    name: 'Sofia Martinez',
    age: 24,
    bio: 'Digital artist & coffee addict. Seeking an elite mentor for my creative projects. ✨',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    distance: '3 miles away'
  },
  {
    id: 'd2',
    name: 'Marcus Chen',
    age: 27,
    bio: 'Full-stack dev by day, luxury traveler by night. Ready to support your dreams. 🏔️',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    distance: '8 miles away'
  },
  {
    id: 'd3',
    name: 'Elena Volkov',
    age: 22,
    bio: 'Professional dancer. I value high-end connections and digital quality. 🩰',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    distance: '1 mile away'
  },
  {
    id: 'd4',
    name: 'Jordan Smith',
    age: 25,
    bio: 'Elite streamer looking for a sophisticated connection. 🎮',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    distance: '5 miles away'
  }
];

const DiscoveryView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const handleAction = (action: 'skip' | 'like') => {
    setDirection(action === 'skip' ? 'left' : 'right');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % DISCOVERY_PROFILES.length);
      setDirection(null);
    }, 400);
  };

  const currentProfile = DISCOVERY_PROFILES[currentIndex];

  if (currentIndex >= DISCOVERY_PROFILES.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <i className="fa-solid fa-users-slash text-zinc-600 text-2xl"></i>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Finding more Dolls...</h2>
        <p className="text-zinc-500 text-xs max-w-xs">Broaden your search settings or check back later for more elite connections.</p>
        <button 
          onClick={() => setCurrentIndex(0)}
          className="mt-8 px-8 py-3 bg-pink-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-pink-600/30 active:scale-95 transition-all"
        >
          REFRESH DISCOVERY
        </button>
      </div>
    );
  }

  return (
    <div className="h-full max-w-lg mx-auto flex flex-col items-center justify-between py-2 px-1">
      <div className="w-full flex items-center justify-between mb-4 px-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase">Discovery</h2>
          <p className="text-[9px] text-pink-500 font-bold uppercase tracking-[0.2em]">Match with your spark</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer">
          <i className="fa-solid fa-sliders text-xs"></i>
        </div>
      </div>

      <div className="relative w-full flex-1 max-h-[650px] min-h-0">
        {/* Profile Card */}
        <div className={`
          absolute inset-0 rounded-[2.5rem] overflow-hidden glass-panel border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]
          transition-all duration-500 ease-in-out
          ${direction === 'left' ? '-translate-x-full rotate-[-15deg] opacity-0 scale-90' : ''}
          ${direction === 'right' ? 'translate-x-full rotate-[15deg] opacity-0 scale-90' : ''}
          ${!direction ? 'translate-x-0 rotate-0 opacity-100 scale-100' : ''}
        `}>
          <img 
            src={currentProfile.photo} 
            className="w-full h-full object-cover" 
            alt={currentProfile.name} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 pt-20">
            <div className="flex items-end justify-between mb-3">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-white leading-none mb-1">
                  {currentProfile.name}, <span className="text-zinc-300">{currentProfile.age}</span>
                </h3>
                <div className="flex items-center gap-2 text-[9px] font-bold text-pink-400 uppercase tracking-widest">
                  <i className="fa-solid fa-location-dot"></i>
                  {currentProfile.distance}
                </div>
              </div>
              <button className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                <i className="fa-solid fa-info text-[10px]"></i>
              </button>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed line-clamp-3">
              {currentProfile.bio}
            </p>
          </div>
        </div>

        {/* Stack Preview */}
        <div className="absolute -bottom-2 left-4 right-4 h-24 bg-zinc-900 rounded-[2.5rem] -z-10 opacity-40"></div>
        <div className="absolute -bottom-4 left-10 right-10 h-24 bg-zinc-900 rounded-[2.5rem] -z-20 opacity-20"></div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 mt-6 md:mt-10 mb-2">
        <button 
          onClick={() => handleAction('skip')}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-zinc-900 border border-red-500/20 flex items-center justify-center text-red-500 text-lg shadow-xl hover:bg-red-500 hover:text-white hover:shadow-red-500/30 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
          <i className="fa-solid fa-star text-xs"></i>
        </button>
        <button 
          onClick={() => handleAction('like')}
          className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-pink-600 flex items-center justify-center text-white text-2xl md:text-3xl shadow-2xl shadow-pink-600/40 hover:bg-pink-500 hover:scale-105 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-heart"></i>
        </button>
        <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
          <i className="fa-solid fa-bolt text-xs"></i>
        </button>
        <button 
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-zinc-900 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg shadow-xl hover:bg-indigo-600 hover:text-white hover:shadow-indigo-600/30 active:scale-90 transition-all"
          onClick={() => handleAction('like')}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em] pb-1">Swipe or click to discovery</p>
    </div>
  );
};

export default DiscoveryView;
