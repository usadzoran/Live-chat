
import React, { useState, useRef } from 'react';
import { PayoutSettings, ViewType } from '../types';

interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  cover?: string;
  diamonds: number;
}

interface GalleryItem {
  id: string;
  url: string;
  likes: string;
  comments: string;
  type: 'free' | 'paid';
  price?: number;
  isUnlocked?: boolean;
}

interface ProfileViewProps {
  user: UserProfile;
  onUpdate: (updated: UserProfile) => void;
  onBack: () => void;
  onNavigate: (view: ViewType) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate, onBack, onNavigate }) => {
  const [formData, setFormData] = useState<UserProfile>({ 
    ...user,
    avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&size=256&background=f472b6&color=fff`,
    cover: user.cover || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80"
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'showcase' | 'wallet' | 'settings'>('showcase');
  const [activeGalleryType, setActiveGalleryType] = useState<'free' | 'paid'>('free');
  
  // Dynamic Gallery State
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryItem[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=600&q=80', likes: '1.2k', comments: '45', type: 'free' },
    { id: '2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80', likes: '890', comments: '22', type: 'free' },
    { id: '3', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', likes: '2.4k', comments: '112', type: 'paid', price: 99 },
    { id: '6', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', likes: '920', comments: '28', type: 'paid', price: 150 },
  ]);

  // Unlock simulation state
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newUpload, setNewUpload] = useState({
    url: '',
    type: 'free' as 'free' | 'paid',
    price: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover' | 'album') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (target === 'avatar') setFormData(prev => ({ ...prev, avatar: result }));
        if (target === 'cover') setFormData(prev => ({ ...prev, cover: result }));
        if (target === 'album') setNewUpload(prev => ({ ...prev, url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToAlbum = () => {
    if (!newUpload.url) return;
    const item: GalleryItem = {
      id: Math.random().toString(36).substr(2, 9),
      url: newUpload.url,
      likes: '0',
      comments: '0',
      type: newUpload.type,
      price: newUpload.type === 'paid' ? newUpload.price : undefined
    };
    setGalleryPhotos(prev => [item, ...prev]);
    setShowUploadModal(false);
    setNewUpload({ url: '', type: 'free', price: 0 });
    setActiveGalleryType(item.type);
  };

  const handleUnlock = (item: GalleryItem) => {
    if (unlockedIds.has(item.id)) return;
    const price = item.price || 0;
    if (user.diamonds < price) {
      setErrorToast(`Insufficient Diamonds. You need ${price - user.diamonds} more.`);
      setTimeout(() => setErrorToast(null), 3000);
      return;
    }

    onUpdate({ ...user, diamonds: user.diamonds - price });
    setUnlockedIds(new Set([...Array.from(unlockedIds), item.id]));
  };

  const deleteItem = (id: string) => {
    setGalleryPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveProfile = () => {
    onUpdate(formData);
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col gap-4 overflow-y-auto pb-24 lg:pb-32 hide-scrollbar px-1 relative">
      
      {/* Hero Section */}
      <div className="relative h-48 md:h-72 lg:h-80 rounded-[2rem] lg:rounded-[3rem] overflow-hidden shrink-0 shadow-2xl border border-white/5 group">
        <img 
          src={formData.cover} 
          className="w-full h-full object-cover transition-all duration-700" 
          alt="cover" 
        />
        {isEditing && (
          <div 
            onClick={() => coverInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <i className="fa-solid fa-camera text-4xl mb-2 text-white"></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Change Banner</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none"></div>
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-all z-20"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
        </button>
        <div className="absolute top-6 right-6 px-4 py-2 bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-2">
           <i className="fa-solid fa-gem text-cyan-400 text-[10px]"></i>
           <span className="text-xs font-black text-white">{user.diamonds.toLocaleString()}</span>
        </div>
        <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
      </div>

      {/* Profile Header Info */}
      <div className="px-6 lg:px-12 -mt-16 relative z-10 flex flex-col items-center md:flex-row md:items-end gap-6 lg:gap-8">
        <div className="relative shrink-0 group">
          <div className="w-32 h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden border-4 md:border-8 border-zinc-950 shadow-2xl bg-zinc-900">
            <img 
              src={formData.avatar} 
              className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
              alt="avatar" 
            />
            {isEditing && (
              <div 
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <i className="fa-solid fa-camera text-2xl text-white"></i>
              </div>
            )}
          </div>
          <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
          <div className="absolute bottom-2 right-2 w-9 h-9 rounded-xl bg-pink-600 border-4 border-zinc-950 flex items-center justify-center text-white shadow-xl">
             <i className="fa-solid fa-check text-xs"></i>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 lg:mb-4">
            <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight">{formData.name}</h1>
            <button 
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10'}`}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
          <p className="text-zinc-500 text-xs lg:text-base max-w-2xl mb-4 lg:mb-6 line-clamp-2 italic leading-relaxed">
            {formData.bio || 'Living the dream in the My Doll elite social club. Always online, always exclusive.'}
          </p>
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
               <button 
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl"
               >
                  <i className="fa-solid fa-plus"></i> Upload New
               </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {galleryPhotos.filter(p => p.type === activeGalleryType).map((item) => (
                <div key={item.id} className="group relative aspect-square rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-900 shadow-xl cursor-pointer">
                  {/* Mystery Blur for fans, or creator viewing paid content */}
                  <img 
                    src={item.url} 
                    className={`w-full h-full object-cover transition-all duration-700 ${item.type === 'paid' && !isEditing && !unlockedIds.has(item.id) ? 'blur-2xl scale-110 brightness-50' : 'group-hover:scale-110'}`} 
                    alt="gallery" 
                  />
                  
                  {item.type === 'paid' && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-600/90 backdrop-blur-md rounded-lg shadow-xl border border-white/20 z-10 flex items-center gap-2">
                       <i className="fa-solid fa-gem text-[10px] text-cyan-300"></i>
                       <span className="text-[10px] font-black text-white">{item.price}</span>
                    </div>
                  )}

                  {item.type === 'paid' && !isEditing && !unlockedIds.has(item.id) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-[5]">
                       <button 
                        onClick={(e) => { e.stopPropagation(); handleUnlock(item); }}
                        className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-indigo-600 hover:scale-110 transition-all group/lock"
                       >
                          <i className="fa-solid fa-lock text-white text-xl group-hover/lock:hidden"></i>
                          <i className="fa-solid fa-key text-white text-xl hidden group-hover/lock:block"></i>
                       </button>
                       <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                          <p className="text-[8px] font-black text-white/80 uppercase tracking-[0.3em]">Unlock for {item.price} Diamonds</p>
                       </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6 z-10">
                     <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black text-white flex items-center gap-2">
                         <i className="fa-solid fa-heart text-pink-500"></i> {item.likes}
                       </span>
                       <button 
                        onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                        className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                       >
                         <i className="fa-solid fa-trash-can text-[10px]"></i>
                       </button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="max-w-2xl mx-auto flex flex-col gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-panel p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] border-white/5 bg-gradient-to-br from-indigo-600/10 via-transparent to-pink-600/5 relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <p className="text-[10px] lg:text-[12px] font-black text-pink-500 uppercase tracking-widest mb-3">Your Influence Balance</p>
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-16 h-16 rounded-3xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-3xl text-cyan-400">
                      <i className="fa-solid fa-gem"></i>
                   </div>
                   <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter">
                    {user.diamonds.toLocaleString()}
                   </h2>
                </div>
                <button 
                  onClick={() => onNavigate('store')}
                  className="px-8 py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:bg-zinc-200 active:scale-95 transition-all"
                >
                  GET MORE DIAMONDS
                </button>
              </div>
              <i className="fa-solid fa-gem absolute -bottom-10 -right-10 text-[12rem] text-white/[0.02]"></i>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="glass-panel p-6 rounded-[2rem] border-white/5 flex flex-col gap-2">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Lifetime Unlocked</p>
                  <p className="text-2xl font-black text-white">42</p>
               </div>
               <div className="glass-panel p-6 rounded-[2rem] border-white/5 flex flex-col gap-2">
                  <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Top Creator Rank</p>
                  <p className="text-2xl font-black text-pink-500">#124</p>
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
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-lg glass-panel p-8 rounded-[3rem] border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-6 right-6">
                <button onClick={() => setShowUploadModal(false)} className="text-zinc-600 hover:text-white transition-colors">
                   <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Add to Album</h3>
                 <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Share exclusive visual art with your elite circle</p>
              </div>

              {!newUpload.url ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video rounded-[2rem] border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-pink-500/50 hover:bg-white/5 transition-all"
                >
                   <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600">
                      <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
                   </div>
                   <span className="text-xs font-bold text-zinc-500">Select Image to Upload</span>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'album')} />
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="aspect-video rounded-[2rem] overflow-hidden border border-white/10 relative group">
                    <img src={newUpload.url} className="w-full h-full object-cover" alt="preview" />
                    <button 
                      onClick={() => setNewUpload(prev => ({ ...prev, url: '' }))}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setNewUpload(prev => ({ ...prev, type: 'free' }))}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${newUpload.type === 'free' ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-600/20' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}
                    >
                      Public Album
                    </button>
                    <button 
                      onClick={() => setNewUpload(prev => ({ ...prev, type: 'paid' }))}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${newUpload.type === 'paid' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}
                    >
                      Premium Album
                    </button>
                  </div>

                  {newUpload.type === 'paid' && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Unlock Price (Diamonds)</label>
                       <div className="relative">
                          <i className="fa-solid fa-gem absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 text-xs"></i>
                          <input 
                            type="number" 
                            placeholder="Set price..."
                            value={newUpload.price}
                            onChange={(e) => setNewUpload(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                          />
                       </div>
                    </div>
                  )}

                  <button 
                    onClick={handleAddToAlbum}
                    className="w-full py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-[1.5rem] shadow-2xl transition-all active:scale-95"
                  >
                    FINALIZE UPLOAD
                  </button>
                </div>
              )}
           </div>
        </div>
      )}

      {isSaved && (
        <div className="fixed bottom-24 lg:bottom-12 left-1/2 -translate-x-1/2 px-8 py-3 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-8 duration-500 z-[100]">
           <i className="fa-solid fa-check mr-2"></i> Vault Updated Successfully
        </div>
      )}

      {errorToast && (
        <div className="fixed bottom-24 lg:bottom-12 left-1/2 -translate-x-1/2 px-8 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-8 duration-500 z-[100]">
           <i className="fa-solid fa-triangle-exclamation mr-2"></i> {errorToast}
        </div>
      )}
    </div>
  );
};

export default ProfileView;
