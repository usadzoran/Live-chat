
import React, { useState, useMemo, useEffect } from 'react';
import { db, UserDB } from '../services/databaseService';
import { LiveStreamSession } from '../types';

interface DiscoveryProfile {
  id: string;
  name: string;
  age: number;
  gender: 'man' | 'woman' | 'other';
  bio: string;
  photo: string;
  distance: string;
  isPremium: boolean;
  isLive?: boolean;
}

const DiscoveryView: React.FC = () => {
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [activeStreams, setActiveStreams] = useState<LiveStreamSession[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'match' | 'live'>('live');

  // Filter States
  const [genderFilter, setGenderFilter] = useState<'all' | 'man' | 'woman'>('all');

  useEffect(() => {
    const unsubscribeStreams = db.subscribeToActiveStreams((streams) => {
      setActiveStreams(streams);
    });

    const loadUsers = async () => {
      setIsLoading(true);
      const allUsers = await db.getAllUsers();
      const discoveryList: DiscoveryProfile[] = allUsers.map(u => ({
        id: u.uid,
        name: u.name,
        age: 20 + Math.floor(Math.random() * 10),
        gender: (u.gender as any) || 'woman',
        bio: u.bio || 'Elite club member.',
        photo: u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=f472b6&color=fff`,
        distance: `${(Math.random() * 5).toFixed(1)} km`,
        isPremium: u.album?.length > 0
      }));
      setProfiles(discoveryList);
      setIsLoading(false);
    };

    loadUsers();
    return () => unsubscribeStreams();
  }, []);

  const mergedLiveProfiles = useMemo(() => {
    return profiles.map(p => ({
      ...p,
      isLive: activeStreams.some(s => s.uid === p.id)
    }));
  }, [profiles, activeStreams]);

  const filteredProfiles = useMemo(() => {
    return mergedLiveProfiles.filter(p => {
      if (genderFilter !== 'all' && p.gender !== genderFilter) return false;
      return true;
    });
  }, [mergedLiveProfiles, genderFilter]);

  const liveNow = useMemo(() => filteredProfiles.filter(p => p.isLive), [filteredProfiles]);

  const handleAction = (action: 'skip' | 'like') => {
    setDirection(action === 'skip' ? 'left' : 'right');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredProfiles.length);
      setDirection(null);
    }, 400);
  };

  const currentProfile = filteredProfiles[currentIndex % filteredProfiles.length];

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Dynamic Header */}
      <div className="px-4 flex items-center justify-between shrink-0">
        <div className="flex gap-4">
          <button 
            onClick={() => setViewMode('live')}
            className={`text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'live' ? 'text-white' : 'text-zinc-600'}`}
          >
            Live Now {liveNow.length > 0 && <span className="ml-1 w-2 h-2 rounded-full bg-pink-500 inline-block animate-pulse"></span>}
          </button>
          <button 
            onClick={() => setViewMode('match')}
            className={`text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'match' ? 'text-white' : 'text-zinc-600'}`}
          >
            Discover
          </button>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="text-zinc-500 hover:text-white transition-colors">
          <i className="fa-solid fa-sliders"></i>
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'live' ? (
          <div className="h-full overflow-y-auto hide-scrollbar grid grid-cols-2 gap-4 p-2">
            {liveNow.length > 0 ? liveNow.map(stream => (
              <div key={stream.id} className="aspect-[3/4] rounded-3xl overflow-hidden glass-panel border border-white/5 relative group cursor-pointer shadow-2xl">
                <img src={stream.photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full shadow-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Live</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs font-black text-white">{stream.name}</p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Watching Now</p>
                </div>
              </div>
            )) : (
              <div className="col-span-full h-full flex flex-col items-center justify-center opacity-20 text-center py-20">
                <i className="fa-solid fa-satellite text-4xl mb-4"></i>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Live Nodes Found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            {currentProfile ? (
              <div className={`
                relative w-full max-w-sm aspect-[3/4] rounded-[3rem] overflow-hidden glass-panel border border-white/10 shadow-2xl transition-all duration-500
                ${direction === 'left' ? '-translate-x-full rotate-[-15deg] opacity-0' : ''}
                ${direction === 'right' ? 'translate-x-full rotate-[15deg] opacity-0' : ''}
              `}>
                <img src={currentProfile.photo} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-3xl font-black text-white mb-2">{currentProfile.name}, {currentProfile.age}</h3>
                  <p className="text-xs text-zinc-300 italic line-clamp-2">{currentProfile.bio}</p>
                </div>
              </div>
            ) : <p className="text-zinc-500 uppercase font-black">Connecting...</p>}

            <div className="flex gap-8 mt-10">
              <button onClick={() => handleAction('skip')} className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-red-500 text-xl border border-white/5"><i className="fa-solid fa-xmark"></i></button>
              <button onClick={() => handleAction('like')} className="w-20 h-20 rounded-[2.5rem] stream-gradient flex items-center justify-center text-white text-3xl shadow-2xl shadow-pink-500/20 active:scale-90 transition-all"><i className="fa-solid fa-heart"></i></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveryView;
