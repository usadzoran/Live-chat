
import React, { useState, useMemo, useEffect } from 'react';
import { db, UserDB } from '../services/databaseService';

interface DiscoveryProfile {
  id: string;
  name: string;
  age: number;
  gender: 'man' | 'woman' | 'other';
  bio: string;
  photo: string;
  distance: string;
  isPremium: boolean;
}

const DiscoveryView: React.FC = () => {
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [genderFilter, setGenderFilter] = useState<'all' | 'man' | 'woman'>('all');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(60);

  const fetchUsers = async () => {
    try {
      const allUsers = await db.getAllUsers();
      const activeUser = localStorage.getItem('mydoll_active_user');
      
      // Filter out self and map to discovery cards
      const discoveryList: DiscoveryProfile[] = allUsers
        .filter(u => u.email !== activeUser)
        .map(u => ({
          id: u.email,
          name: u.name,
          age: Math.floor(Math.random() * 20) + 18, // Simulated age as it's not in DB yet
          gender: 'woman', // Default for now
          bio: u.bio || 'Seeking elite connections.',
          photo: u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=f472b6&color=fff&size=512`,
          distance: `${(Math.random() * 10).toFixed(1)} miles away`,
          isPremium: (u.album?.some(p => p.price > 0)) || false
        }));

      // Add some high-quality mock fallbacks if DB is thin
      if (discoveryList.length < 3) {
        discoveryList.push(
          { id: 'm1', name: 'Sofia', age: 24, gender: 'woman', bio: 'Art enthusiast and world traveler.', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', distance: '1.2m', isPremium: true },
          { id: 'm2', name: 'Elena', age: 22, gender: 'woman', bio: 'Looking for a mentor to help with my startup.', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80', distance: '0.8m', isPremium: false }
        );
      }

      setProfiles(discoveryList);
    } catch (e) {
      console.error("Discovery fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 20000); // Auto refresh new members every 20s
    return () => clearInterval(interval);
  }, []);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
      const matchesAge = p.age >= minAge && p.age <= maxAge;
      return matchesGender && matchesAge;
    });
  }, [profiles, genderFilter, minAge, maxAge]);

  const handleAction = (action: 'skip' | 'like') => {
    if (filteredProfiles.length === 0) return;
    setDirection(action === 'skip' ? 'left' : 'right');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredProfiles.length);
      setDirection(null);
    }, 400);
  };

  const currentProfile = filteredProfiles[currentIndex % filteredProfiles.length];

  return (
    <div className="h-full max-w-lg mx-auto flex flex-col items-center justify-between py-2 px-1 relative">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 px-4 z-20">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase italic flex items-center gap-2">
            Discovery
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
          </h2>
          <p className="text-[9px] text-pink-500 font-bold uppercase tracking-[0.2em]">Live Member Matching</p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`w-10 h-10 rounded-xl glass-panel flex items-center justify-center transition-all ${showFilters ? 'bg-pink-600 text-white border-pink-500' : 'text-zinc-400 hover:text-white border-white/5'}`}
        >
          <i className="fa-solid fa-sliders text-xs"></i>
        </button>
      </div>

      {/* Filter Overlay */}
      {showFilters && (
        <div className="absolute top-20 left-4 right-4 z-50 glass-panel rounded-[2rem] border border-white/10 p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Interested in</label>
              <div className="grid grid-cols-3 gap-3">
                {['all', 'man', 'woman'].map((g) => (
                  <button
                    key={g}
                    onClick={() => { setGenderFilter(g as any); setCurrentIndex(0); }}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${genderFilter === g ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30 border-pink-500' : 'bg-white/5 text-zinc-500 border border-white/5'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Age Range</label>
                <span className="text-xs font-black text-pink-500">{minAge} - {maxAge}</span>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-zinc-600 w-8">Min</span>
                  <input type="range" min="18" max="60" value={minAge} onChange={(e) => setMinAge(parseInt(e.target.value))} className="flex-1 accent-pink-600" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-zinc-600 w-8">Max</span>
                  <input type="range" min="18" max="60" value={maxAge} onChange={(e) => setMaxAge(parseInt(e.target.value))} className="flex-1 accent-pink-600" />
                </div>
              </div>
            </div>

            <button onClick={() => setShowFilters(false)} className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl">APPLY FILTERS</button>
          </div>
        </div>
      )}

      <div className="relative w-full flex-1 max-h-[650px] min-h-0">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-gem text-pink-500 text-3xl animate-bounce"></i>
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className={`
            absolute inset-0 rounded-[2.5rem] overflow-hidden glass-panel border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]
            transition-all duration-500 ease-in-out
            ${direction === 'left' ? '-translate-x-full rotate-[-15deg] opacity-0 scale-90' : ''}
            ${direction === 'right' ? 'translate-x-full rotate-[15deg] opacity-0 scale-90' : ''}
            ${!direction ? 'translate-x-0 rotate-0 opacity-100 scale-100' : ''}
          `}>
            <img src={currentProfile.photo} className={`w-full h-full object-cover transition-all duration-1000 ${currentProfile.isPremium ? 'blur-sm hover:blur-none' : ''}`} alt={currentProfile.name} />
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
                {currentProfile.isPremium && (
                  <div className="px-3 py-1 bg-pink-600/20 border border-pink-500/30 rounded-full">
                    <span className="text-[8px] font-black text-pink-500 uppercase tracking-widest">Premium Content</span>
                  </div>
                )}
              </div>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed line-clamp-3 italic">{currentProfile.bio}</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <i className="fa-solid fa-users-slash text-zinc-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Finding Members...</h2>
            <p className="text-zinc-500 text-xs max-w-xs leading-relaxed">Checking for new members in the club. Discovery auto-refreshes every few seconds.</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-6 mt-6 md:mt-10 mb-2">
        <button onClick={() => handleAction('skip')} className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-zinc-900 border border-red-500/20 flex items-center justify-center text-red-500 text-lg shadow-xl hover:bg-red-500 hover:text-white transition-all"><i className="fa-solid fa-xmark"></i></button>
        <button onClick={() => handleAction('like')} className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-pink-600 flex items-center justify-center text-white text-2xl md:text-3xl shadow-2xl shadow-pink-600/40 hover:bg-pink-500 hover:scale-105 transition-all"><i className="fa-solid fa-heart"></i></button>
        <button onClick={() => handleAction('like')} className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-zinc-900 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg shadow-xl hover:bg-indigo-600 hover:text-white transition-all"><i className="fa-solid fa-chevron-right"></i></button>
      </div>
      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em] pb-1">Real-time matching active</p>
    </div>
  );
};

export default DiscoveryView;
