
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
    bio: 'Digital artist & coffee addict. Let\'s create something beautiful together. ✨',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    distance: '3 miles away'
  },
  {
    id: 'd2',
    name: 'Marcus Chen',
    age: 27,
    bio: 'Full-stack dev by day, street photographer by night. Always down for a hike. 🏔️',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    distance: '8 miles away'
  },
  {
    id: 'd3',
    name: 'Elena Volkov',
    age: 22,
    bio: 'Professional dancer. I believe in magic and early morning streams. 🩰',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    distance: '1 mile away'
  },
  {
    id: 'd4',
    name: 'Jordan Smith',
    age: 25,
    bio: 'Gamer, streamer, and cat dad. Come say hi on my channel! 🎮',
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
        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <i className="fa-solid fa-users-slash text-zinc-600 text-3xl"></i>
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">No more people nearby</h2>
        <p className="text-zinc-500 text-sm max-w-xs">Check back later for more profiles or broaden your search settings.</p>
        <button 
          onClick={() => setCurrentIndex(0)}
          className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
        >
          Reset List
        </button>
      </div>
    );
  }

  return (
    <div className="h-full max-w-lg mx-auto flex flex-col items-center justify-center p-4">
      <div className="w-full flex items-center justify-between mb-8 px-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Like Me</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Discovery Mode</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer">
          <i className="fa-solid fa-sliders"></i>
        </div>
      </div>

      <div className="relative w-full aspect-[3/4] max-h-[600px]">
        {/* Profile Card */}
        <div className={`
          absolute inset-0 rounded-[2.5rem] overflow-hidden glass-panel border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]
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
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 pt-20">
            <div className="flex items-end justify-between mb-4">
              <div>
                <h3 className="text-3xl font-black text-white leading-none mb-1">
                  {currentProfile.name}, <span className="text-zinc-300">{currentProfile.age}</span>
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                  <i className="fa-solid fa-location-dot"></i>
                  {currentProfile.distance}
                </div>
              </div>
              <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                <i className="fa-solid fa-info text-xs"></i>
              </button>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed line-clamp-2">
              {currentProfile.bio}
            </p>
          </div>

          {/* Indicators */}
          {direction === 'right' && (
            <div className="absolute top-10 left-10 -rotate-12 border-4 border-green-500 rounded-xl px-4 py-1.5 animate-in zoom-in duration-200">
               <span className="text-4xl font-black text-green-500 uppercase italic">LIKE</span>
            </div>
          )}
          {direction === 'left' && (
            <div className="absolute top-10 right-10 rotate-12 border-4 border-red-500 rounded-xl px-4 py-1.5 animate-in zoom-in duration-200">
               <span className="text-4xl font-black text-red-500 uppercase italic">SKIP</span>
            </div>
          )}
        </div>

        {/* Stack Preview */}
        <div className="absolute -bottom-4 left-4 right-4 h-24 bg-zinc-900 rounded-[2.5rem] -z-10 opacity-40"></div>
        <div className="absolute -bottom-8 left-10 right-10 h-24 bg-zinc-900 rounded-[2.5rem] -z-20 opacity-20"></div>
      </div>

      <div className="flex items-center gap-6 mt-12 mb-8">
        <button 
          onClick={() => handleAction('skip')}
          className="w-16 h-16 rounded-full bg-zinc-900 border border-red-500/20 flex items-center justify-center text-red-500 text-xl shadow-xl hover:bg-red-500 hover:text-white hover:shadow-red-500/30 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        <button className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
          <i className="fa-solid fa-star"></i>
        </button>
        <button 
          onClick={() => handleAction('like')}
          className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-3xl shadow-2xl shadow-indigo-600/40 hover:bg-indigo-500 hover:scale-110 active:scale-90 transition-all"
        >
          <i className="fa-solid fa-heart"></i>
        </button>
        <button className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
          <i className="fa-solid fa-bolt"></i>
        </button>
        <button 
          className="w-16 h-16 rounded-full bg-zinc-900 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl shadow-xl hover:bg-indigo-600 hover:text-white hover:shadow-indigo-600/30 active:scale-90 transition-all"
          onClick={() => handleAction('like')}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em]">Swipe or click to discover</p>
    </div>
  );
};

export default DiscoveryView;
