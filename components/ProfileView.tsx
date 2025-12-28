
import React, { useState } from 'react';
import { PayoutSettings } from '../types';

interface UserProfile {
  name: string;
  email: string;
  bio?: string;
}

interface GalleryItem {
  id: number;
  url: string;
  likes: string;
  comments: string;
  type: 'free' | 'paid';
  price?: number;
}

interface ProfileViewProps {
  user: UserProfile;
  onUpdate: (updated: UserProfile) => void;
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate, onBack }) => {
  const [formData, setFormData] = useState<UserProfile>({ ...user });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'showcase' | 'wallet' | 'settings'>('showcase');
  const [activeGalleryType, setActiveGalleryType] = useState<'free' | 'paid'>('free');
  
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>({
    method: 'card',
    paypalEmail: 'vip.support@mydoll.club',
    cardNumber: '**** **** **** 8888',
    cardExpiry: '12/28',
    cardHolder: user.name
  });

  const [galleryPhotos] = useState<GalleryItem[]>([
    { id: 1, url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=600&q=80', likes: '1.2k', comments: '45', type: 'free' },
    { id: 2, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80', likes: '890', comments: '22', type: 'free' },
    { id: 3, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', likes: '2.4k', comments: '112', type: 'paid', price: 99.00 },
    { id: 4, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', likes: '560', comments: '12', type: 'paid', price: 49.99 },
    { id: 5, url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80', likes: '1.1k', comments: '34', type: 'free' },
    { id: 6, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', likes: '920', comments: '28', type: 'paid', price: 150.00 },
  ]);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const mockStats = [
    { label: 'Followers', value: '1.2k', icon: 'fa-users', color: 'text-pink-400' },
    { label: 'Rating', value: '4.9', icon: 'fa-star', color: 'text-yellow-400' },
    { label: 'Level', value: '77', icon: 'fa-crown', color: 'text-amber-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col gap-4 overflow-y-auto pb-24 hide-scrollbar px-1 relative">
      {/* Hero Section */}
      <div className="relative h-48 md:h-72 rounded-[2rem] overflow-hidden shrink-0 shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80" 
          className="w-full h-full object-cover" 
          alt="cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
        </button>
      </div>

      {/* Profile Header Info */}
      <div className="px-6 -mt-16 relative z-10 flex flex-col items-center md:flex-row md:items-end gap-4 md:gap-6">
        <div className="relative shrink-0">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-4 md:border-8 border-zinc-950 shadow-2xl bg-zinc-900">
            <img 
              src={`https://ui-avatars.com/api/?name=${user.name}&size=144&background=f472b6&color=fff`} 
              className="w-full h-full object-cover" 
              alt="avatar" 
            />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-lg bg-pink-600 border-4 border-zinc-950 flex items-center justify-center text-white shadow-lg">
             <i className="fa-solid fa-check text-[10px]"></i>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-1">{user.name}</h1>
          <p className="text-zinc-500 text-[11px] md:text-sm max-w-xl mb-3 line-clamp-2 italic">
            {user.bio || 'Living the dream in the My Doll elite social club. Always online, always exclusive.'}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
             {mockStats.map((stat, i) => (
               <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                 <i className={`fa-solid ${stat.icon} ${stat.color} text-[9px]`}></i>
                 <span className="text-[10px] font-bold text-white">{stat.value}</span>
                 <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">{stat.label}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 px-4 border-b border-white/5 overflow-x-auto hide-scrollbar shrink-0">
        <button 
          onClick={() => setActiveTab('showcase')}
          className={`py-4 text-[9px] font-black uppercase tracking-[0.2em] border-b-2 whitespace-nowrap transition-all ${activeTab === 'showcase' ? 'border-pink-500 text-white' : 'border-transparent text-zinc-600'}`}
        >
          Gallery
        </button>
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`py-4 text-[9px] font-black uppercase tracking-[0.2em] border-b-2 whitespace-nowrap transition-all ${activeTab === 'wallet' ? 'border-pink-500 text-white' : 'border-transparent text-zinc-600'}`}
        >
          Wallet
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`py-4 text-[9px] font-black uppercase tracking-[0.2em] border-b-2 whitespace-nowrap transition-all ${activeTab === 'settings' ? 'border-pink-500 text-white' : 'border-transparent text-zinc-600'}`}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="px-2 pb-10">
        {activeTab === 'showcase' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveGalleryType('free')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all ${activeGalleryType === 'free' ? 'bg-pink-600 text-white' : 'bg-zinc-900 text-zinc-600 border border-white/5'}`}
                  >
                    FREE
                  </button>
                  <button 
                    onClick={() => setActiveGalleryType('paid')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all ${activeGalleryType === 'paid' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-600 border border-white/5'}`}
                  >
                    PREMIUM
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {galleryPhotos.filter(p => p.type === activeGalleryType).map((item) => (
                <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 shadow-xl">
                  <img src={item.url} className="w-full h-full object-cover" alt="gallery" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="text-[10px] font-bold text-white flex items-center gap-1">
                       <i className="fa-solid fa-heart text-pink-500"></i> {item.likes}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="flex flex-col gap-4">
            <div className="glass-panel p-6 rounded-[2rem] border-white/5 bg-gradient-to-br from-pink-600/10 to-transparent">
              <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest mb-2">My Balance</p>
              <h2 className="text-4xl font-black text-white">$1,284<span className="text-zinc-500 text-xl">.50</span></h2>
            </div>
            
            <div className="glass-panel p-6 rounded-[2rem] border-white/5 space-y-3">
               <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Payout Method</h3>
               <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-credit-card text-pink-500"></i>
                    <span className="text-xs text-white">{payoutSettings.cardNumber}</span>
                  </div>
                  <i className="fa-solid fa-chevron-right text-[10px] text-zinc-700"></i>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-panel p-6 rounded-[2rem] border-white/5 space-y-5">
             <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Display Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-pink-500/30"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Short Bio</label>
                <textarea 
                  value={formData.bio}
                  rows={3}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-pink-500/30 resize-none"
                />
             </div>
             <button 
               onClick={handleSave}
               className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-600/20"
             >
               SAVE SETTINGS
             </button>
          </div>
        )}
      </div>

      {isSaved && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest animate-in slide-in-from-bottom duration-300 z-[100]">
           Profile Updated
        </div>
      )}
    </div>
  );
};

export default ProfileView;
