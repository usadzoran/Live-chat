
import React, { useState, useRef } from 'react';
import { ViewType, WithdrawalRecord } from '../types';
import { db, UserDB, AlbumPhoto } from '../services/databaseService';

interface ProfileViewProps {
  user: UserDB;
  onUpdate: (updated: UserDB) => void;
  onBack: () => void;
  onNavigate: (view: ViewType) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate, onBack, onNavigate }) => {
  const [formData, setFormData] = useState<UserDB>({ 
    ...user,
    avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&size=256&background=f472b6&color=fff`,
    cover: user.cover || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80",
    album: user.album || []
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'showcase' | 'wallet' | 'settings'>('showcase');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAlbumUploadModal, setShowAlbumUploadModal] = useState(false);
  const [withdrawData, setWithdrawData] = useState({ email: user.email, gems: 100 });
  const [newPhotoData, setNewPhotoData] = useState({ url: '', price: 0, caption: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    const updated = await db.upsertUser(formData);
    onUpdate(updated);
    setIsEditing(false);
    showToast("Profile Updated", "success");
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover' | 'album') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (target === 'avatar') {
        setFormData({ ...formData, avatar: result });
      } else if (target === 'cover') {
        setFormData({ ...formData, cover: result });
      } else if (target === 'album') {
        setNewPhotoData({ ...newPhotoData, url: result });
        setShowAlbumUploadModal(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddAlbumPhoto = () => {
    const newPhoto: AlbumPhoto = {
      id: `photo_${Date.now()}`,
      url: newPhotoData.url,
      price: newPhotoData.price,
      caption: newPhotoData.caption
    };
    const updatedAlbum = [...formData.album, newPhoto];
    const newFormData = { ...formData, album: updatedAlbum };
    setFormData(newFormData);
    db.upsertUser(newFormData); // Direct persist for album changes
    setShowAlbumUploadModal(false);
    setNewPhotoData({ url: '', price: 0, caption: '' });
    showToast("Photo added to collection", "success");
  };

  const handleWithdraw = async () => {
    setIsProcessing(true);
    const result = await db.requestWithdrawal(user.email, withdrawData.email, withdrawData.gems);
    
    if (result.success) {
      const freshUser = await db.getUser(user.email);
      if (freshUser) onUpdate(freshUser);
      setShowWithdrawModal(false);
      showToast(result.message, "success");
    } else {
      showToast(result.message, "error");
    }
    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col gap-4 overflow-y-auto pb-24 lg:pb-32 hide-scrollbar px-1 relative">
      
      {/* Hero Section */}
      <div className="relative h-48 md:h-72 lg:h-80 rounded-[2rem] lg:rounded-[3rem] overflow-hidden shrink-0 shadow-2xl border border-white/5 group bg-zinc-900">
        <img src={formData.cover} className="w-full h-full object-cover" alt="cover" />
        {isEditing && (
          <div onClick={() => coverInputRef.current?.click()} className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            <i className="fa-solid fa-camera text-4xl mb-2 text-white"></i>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Change Banner</span>
            <input type="file" ref={coverInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
        <button onClick={onBack} className="absolute top-6 left-6 w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/10 z-20"><i className="fa-solid fa-arrow-left text-xs"></i></button>
        <div className="absolute top-6 right-6 px-4 py-2 bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-2">
           <i className="fa-solid fa-gem text-cyan-400 text-[10px]"></i>
           <span className="text-xs font-black text-white">{user.diamonds.toLocaleString()}</span>
        </div>
      </div>

      {/* Header Info */}
      <div className="px-6 lg:px-12 -mt-16 relative z-10 flex flex-col items-center md:flex-row md:items-end gap-6 lg:gap-8">
        <div className="relative shrink-0 group">
          <div className="w-32 h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden border-4 md:border-8 border-zinc-950 shadow-2xl bg-zinc-900">
            <img src={formData.avatar} className="w-full h-full object-cover" alt="avatar" />
            {isEditing && (
              <div onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fa-solid fa-camera text-2xl text-white"></i>
                <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            {isEditing ? (
              <input 
                type="text" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-1 text-2xl font-black text-white focus:outline-none focus:border-pink-500/50"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            ) : (
              <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight">{formData.name}</h1>
            )}
            <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-green-600 text-white shadow-lg' : 'bg-white/5 text-zinc-400 hover:text-white'}`}>
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
          {isEditing ? (
            <textarea 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:border-pink-500/50 mt-2 h-20"
              value={formData.bio || ''}
              placeholder="Tell your fans something about you..."
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
          ) : (
            <p className="text-zinc-500 text-xs italic">{formData.bio || 'Elite Member of My Doll Circle'}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 px-8 lg:px-12 border-b border-white/5 mt-4">
        {['showcase', 'wallet', 'settings'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`py-5 text-[9px] lg:text-[11px] font-black uppercase tracking-[0.3em] border-b-2 transition-all ${activeTab === tab ? 'border-pink-500 text-white' : 'border-transparent text-zinc-600'}`}>
            {tab === 'showcase' ? 'Collection' : tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="px-4 lg:px-12 pb-10 mt-6">
        {activeTab === 'showcase' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">My Gallery</h3>
              <button 
                onClick={() => albumInputRef.current?.click()}
                className="px-4 py-2 bg-pink-600/10 border border-pink-500/20 text-pink-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-pink-600 hover:text-white transition-all"
              >
                <i className="fa-solid fa-plus mr-2"></i> Add Photo
                <input type="file" ref={albumInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'album')} />
              </button>
            </div>

            {formData.album && formData.album.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.album.map((photo) => (
                  <div key={photo.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 shadow-xl bg-zinc-900">
                    <img src={photo.url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt={photo.caption} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      {photo.caption && <p className="text-[10px] text-white font-bold mb-1 truncate">{photo.caption}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-pink-500 uppercase">{photo.price > 0 ? `${photo.price} Gems` : 'Free'}</span>
                        <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><i className="fa-solid fa-ellipsis-v text-[10px]"></i></button>
                      </div>
                    </div>
                    {photo.price > 0 && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-zinc-950/80 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1.5">
                         <i className="fa-solid fa-lock text-[8px] text-pink-500"></i>
                         <span className="text-[9px] font-black text-white">{photo.price}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 opacity-30 border-2 border-dashed border-white/10 rounded-[3rem]">
                <i className="fa-solid fa-images text-4xl mb-4"></i>
                <p className="text-xs uppercase font-black tracking-widest">No photos in your collection yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Balance Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 bg-gradient-to-br from-cyan-600/10 to-transparent">
                 <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3">Diamond Balance</p>
                 <div className="flex items-center gap-4 mb-6">
                    <i className="fa-solid fa-gem text-4xl text-cyan-400"></i>
                    <h2 className="text-5xl font-black text-white">{user.diamonds.toLocaleString()}</h2>
                 </div>
                 <button onClick={() => onNavigate('store')} className="w-full py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Buy More</button>
              </div>

              <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 bg-gradient-to-br from-emerald-600/10 to-transparent">
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Cash Earnings</p>
                 <div className="flex items-center gap-4 mb-6">
                    <i className="fa-solid fa-money-bill-transfer text-4xl text-emerald-400"></i>
                    <h2 className="text-5xl font-black text-white">${(user.diamonds / 100).toFixed(2)}</h2>
                 </div>
                 <button onClick={() => setShowWithdrawModal(true)} className="w-full py-4 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Withdraw Cash</button>
              </div>
            </div>

            {/* Payout History */}
            <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden">
               <div className="p-6 border-b border-white/5 bg-white/5">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Withdrawal History</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-[10px] uppercase font-black tracking-widest">
                   <thead>
                     <tr className="border-b border-white/5 text-zinc-600">
                       <th className="p-6">Date</th>
                       <th className="p-6">Amount</th>
                       <th className="p-6">Method</th>
                       <th className="p-6">Status</th>
                     </tr>
                   </thead>
                   <tbody>
                     {user.withdrawals && user.withdrawals.length > 0 ? user.withdrawals.map((w, i) => (
                       <tr key={i} className="border-b border-white/5 text-zinc-300">
                         <td className="p-6">{new Date(w.timestamp).toLocaleDateString()}</td>
                         <td className="p-6 text-emerald-400">${w.amountUsd.toFixed(2)}</td>
                         <td className="p-6">{w.paypalEmail}</td>
                         <td className="p-6">
                            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500">{w.status}</span>
                         </td>
                       </tr>
                     )) : (
                       <tr><td colSpan={4} className="p-12 text-center text-zinc-700">No transactions recorded</td></tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Album Upload Modal */}
      {showAlbumUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-md glass-panel p-8 rounded-[3rem] border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
              <button onClick={() => setShowAlbumUploadModal(false)} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><i className="fa-solid fa-xmark text-lg"></i></button>
              
              <div className="text-center space-y-2">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Add to Gallery</h3>
                 <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Post a free or premium photo</p>
              </div>

              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-white/5 bg-zinc-900">
                <img src={newPhotoData.url} className="w-full h-full object-cover" alt="preview" />
              </div>

              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Caption</label>
                    <input 
                      type="text" 
                      value={newPhotoData.caption}
                      onChange={(e) => setNewPhotoData({...newPhotoData, caption: e.target.value})}
                      placeholder="Summer vibes..."
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-pink-500/50" 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Price (Gems)</label>
                    <input 
                      type="number" 
                      value={newPhotoData.price}
                      onChange={(e) => setNewPhotoData({...newPhotoData, price: parseInt(e.target.value) || 0})}
                      placeholder="0 for free"
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-pink-500/50" 
                    />
                    <p className="text-[8px] text-zinc-500 font-bold uppercase mt-1">Set a price to make this a premium photo</p>
                 </div>
              </div>

              <button 
                onClick={handleAddAlbumPhoto}
                className="w-full py-5 bg-pink-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl active:scale-95"
              >
                UPLOAD TO COLLECTION
              </button>
           </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-md glass-panel p-8 rounded-[3rem] border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
              <button onClick={() => setShowWithdrawModal(false)} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><i className="fa-solid fa-xmark text-lg"></i></button>
              
              <div className="text-center space-y-2">
                 <div className="w-16 h-16 rounded-full bg-emerald-600/20 flex items-center justify-center text-3xl text-emerald-400 mx-auto border border-emerald-500/20"><i className="fa-solid fa-vault"></i></div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Convert to Cash</h3>
                 <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">100 Gems = $1.00 USD</p>
              </div>

              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">PayPal Email</label>
                    <input 
                      type="email" 
                      value={withdrawData.email}
                      onChange={(e) => setWithdrawData({...withdrawData, email: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-emerald-500/50" 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Gems to Convert</label>
                    <input 
                      type="number" 
                      value={withdrawData.gems}
                      onChange={(e) => setWithdrawData({...withdrawData, gems: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-emerald-500/50" 
                    />
                 </div>
                 <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">You will receive</span>
                    <span className="text-lg font-black text-emerald-400">${(withdrawData.gems / 100).toFixed(2)}</span>
                 </div>
              </div>

              <button 
                onClick={handleWithdraw}
                disabled={isProcessing || withdrawData.gems < 100 || withdrawData.gems > user.diamonds}
                className="w-full py-5 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'CONFIRM WITHDRAWAL'}
              </button>
           </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-4 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
           {toast.msg}
        </div>
      )}
    </div>
  );
};

export default ProfileView;
