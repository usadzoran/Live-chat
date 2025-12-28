
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
    <div className="max-w-6xl mx-auto h-full flex flex-col gap-4 overflow-y-auto pb-24 lg:pb-32 hide-scrollbar px-1 relative">
      {/* Hero Section */}
      <div className="relative h-48 md:h-72 lg:h-80 rounded-[2rem] lg:rounded-[3rem] overflow-hidden shrink-0 shadow-2xl border border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80" 
          className="w-full h-full object-cover" 
          alt="cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-all"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
        </button>
      </div>

      {/* Profile Header Info */}
      <div className="px-6 lg:px-12 -mt-16 relative z-10 flex flex-col items-center md:flex-row md:items-end gap-6 lg:gap-8">
        <div className="relative shrink-0">
          <div className="w-32 h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden border-4 md:border-8 border-zinc-950 shadow-2xl bg-zinc-900 group">
            <img 
              src={`https://ui-avatars.com/api/?name=${user.name}&size=144&background=f472b6&color=fff`} 
              className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
              alt="avatar" 
            />
          </div>
          <div className="absolute bottom-2 right-2 w-9 h-9 rounded-xl bg-pink-600 border-4 border-zinc-950 flex items-center justify-center text-white shadow-xl">
             <i className="fa-solid fa-check text-xs"></i>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 lg:mb-4">
            <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight">{user.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 text-[8px] lg:text-[10px] text-pink-400 font-black uppercase tracking-widest rounded-md">VERIFIED CREATOR</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs lg:text-base max-w-2xl mb-4 lg:mb-6 line-clamp-2 italic leading-relaxed">
            {user.bio || 'Living the dream in the My Doll elite social club. Always online, always exclusive.'}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
             {mockStats.map((stat, i) => (
               <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 shadow-sm">
                 <i className={`fa-solid ${stat.icon} ${stat.color} text-[10px] lg:text-xs`}></i>
                 <span className="text-xs lg:text-sm font-black text-white">{stat.value}</span>
                 <span className="text-[8px] lg:text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">{stat.label}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 px-8 lg:px-12 border-b border-white/5 overflow-x-auto hide-scrollbar shrink-0 mt-4">
        {['showcase', 'wallet', 'settings'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`py-5 text-[9px] lg:text-[11px] font-black uppercase tracking-[0.3em] border-b-2 whitespace-nowrap transition-all ${activeTab === tab ? 'border-pink-500 text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}
          >
            {tab === 'showcase' ? 'Collection' : tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="px-4 lg:px-12 pb-10 mt-6">
        {activeTab === 'showcase' && (
          <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
               <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveGalleryType('free')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeGalleryType === 'free' ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' : 'bg-zinc-900 text-zinc-600 border border-white/5 hover:text-zinc-400'}`}
                  >
                    PUBLIC
                  </button>
                  <button 
                    onClick={() => setActiveGalleryType('paid')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeGalleryType === 'paid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-zinc-900 text-zinc-600 border border-white/5 hover:text-zinc-400'}`}
                  >
                    PREMIUM
                  </button>
               </div>
               <button className="hidden sm:flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-white uppercase tracking-widest transition-colors">
                  <i className="fa-solid fa-plus"></i> Add New
               </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {galleryPhotos.filter(p => p.type === activeGalleryType).map((item) => (
                <div key={item.id} className="group relative aspect-square rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-900 shadow-xl cursor-pointer">
                  <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="gallery" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                     <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-white flex items-center gap-2">
                         <i className="fa-solid fa-heart text-pink-500"></i> {item.likes}
                       </span>
                       <span className="text-[10px] font-black text-white flex items-center gap-2">
                         <i className="fa-solid fa-comment text-indigo-400"></i> {item.comments}
                       </span>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="max-w-2xl mx-auto flex flex-col gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-panel p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] border-white/5 bg-gradient-to-br from-pink-600/10 via-transparent to-indigo-600/5 relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <p className="text-[10px] lg:text-[12px] font-black text-pink-500 uppercase tracking-widest mb-3">Available for Payout</p>
                <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-8">$1,284<span className="text-zinc-500 text-3xl">.50</span></h2>
                <button className="px-8 py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:bg-zinc-200 active:scale-95 transition-all">
                  WITHDRAW FUNDS
                </button>
              </div>
              <i className="fa-solid fa-vault absolute -bottom-10 -right-10 text-[12rem] text-white/[0.02]"></i>
            </div>
            
            <div className="glass-panel p-6 lg:p-8 rounded-[2.5rem] border-white/5 space-y-4 shadow-xl">
               <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 px-2">Primary Disbursement Method</h3>
               <div className="p-5 bg-zinc-900 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-pink-500/30 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-pink-500">
                       <i className="fa-solid fa-credit-card text-xl"></i>
                    </div>
                    <div>
                       <span className="text-sm font-black text-white block mb-1">{payoutSettings.cardNumber}</span>
                       <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">VISA GOLD • EXP {payoutSettings.cardExpiry}</span>
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-xs text-zinc-700 group-hover:text-pink-500 transition-colors"></i>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto glass-panel p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] border-white/5 space-y-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Display Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all shadow-inner"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Account Tier</label>
                  <div className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm text-pink-500 font-black tracking-widest uppercase">
                     ELITE PLATINUM
                  </div>
               </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Bio / Influence Description</label>
                <textarea 
                  value={formData.bio}
                  rows={4}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-pink-500/50 resize-none transition-all shadow-inner"
                />
             </div>
             <div className="pt-4">
                <button 
                  onClick={handleSave}
                  className="w-full md:w-auto px-12 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-pink-600/30 transition-all active:scale-95"
                >
                  UPGRADE SETTINGS
                </button>
             </div>
          </div>
        )}
      </div>

      {isSaved && (
        <div className="fixed bottom-24 lg:bottom-12 left-1/2 -translate-x-1/2 px-8 py-3 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-8 duration-500 z-[100]">
           <i className="fa-solid fa-check mr-2"></i> Vault Updated Successfully
        </div>
      )}
    </div>
  );
};

export default ProfileView;
