
import React, { useState, useRef, useMemo } from 'react';
import { ViewType, WithdrawalRecord } from '../types';
import { db, UserDB, MIN_WITHDRAW_GEMS, GEMS_PER_DOLLAR } from '../services/databaseService';
import { Timestamp } from 'firebase/firestore';

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
    album: user.album || [],
    dob: user.dob || '',
    gender: user.gender || 'women',
    country: user.country || '',
    referralCount: user.referralCount || 0
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'showcase' | 'wallet' | 'settings'>('showcase');
  
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  const [photoForm, setPhotoForm] = useState({ url: '', price: 0, caption: '' });

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleWithdraw = async () => {
    // Already implemented logic in App/DB
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover' | 'album') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'album') {
        setPhotoForm(prev => ({ ...prev, url: base64 }));
        setShowAlbumModal(true);
      } else {
        setFormData(prev => ({ ...prev, [type]: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const savePhotoToAlbum = async () => {
    if (!photoForm.url) return;
    setIsProcessing(true);
    
    const newPhoto = {
      id: Math.random().toString(36).substr(2, 9),
      url: photoForm.url,
      caption: photoForm.caption,
      price: photoForm.price,
      timestamp: Timestamp.now()
    };

    const updatedAlbum = [newPhoto, ...(formData.album || [])];
    const updatedUser = { ...formData, album: updatedAlbum };
    
    try {
      const result = await db.upsertUser(updatedUser);
      setFormData(result);
      onUpdate(result);
      setShowAlbumModal(false);
      setPhotoForm({ url: '', price: 0, caption: '' });
      showToast("Photo added to collection!", "success");
    } catch (e) {
      showToast("Failed to save photo", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!window.confirm("Delete this photo?")) return;
    
    const updatedAlbum = (formData.album || []).filter((p: any) => p.id !== photoId);
    const updatedUser = { ...formData, album: updatedAlbum };
    
    try {
      const result = await db.upsertUser(updatedUser);
      setFormData(result);
      onUpdate(result);
      showToast("Photo removed", "success");
    } catch (e) {
      showToast("Failed to delete", "error");
    }
  };

  const saveProfileSettings = async () => {
    setIsProcessing(true);
    try {
      const result = await db.upsertUser(formData);
      setFormData(result);
      onUpdate(result);
      setIsEditing(false);
      showToast("Profile updated!", "success");
    } catch (e) {
      showToast("Update failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentUsdValue = (user.diamonds || 0) / GEMS_PER_DOLLAR;
  const canWithdraw = (user.diamonds || 0) >= MIN_WITHDRAW_GEMS;

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col gap-4 overflow-y-auto pb-24 lg:pb-32 hide-scrollbar px-1 relative">
      
      {/* Hero Section */}
      <div className="relative h-48 md:h-72 lg:h-80 rounded-[2rem] lg:rounded-[3rem] overflow-hidden shrink-0 shadow-2xl border border-white/5 group bg-zinc-900">
        <img src={formData.cover} className="w-full h-full object-cover" alt="cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
        <button onClick={onBack} className="absolute top-6 left-6 w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/10 z-20"><i className="fa-solid fa-arrow-left text-xs"></i></button>
        
        {isEditing && (
          <button onClick={() => coverInputRef.current?.click()} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
            Change Cover
          </button>
        )}
        
        <div className="absolute top-6 right-6 px-4 py-2 bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-2">
           <i className="fa-solid fa-gem text-cyan-400 text-[10px]"></i>
           <span className="text-xs font-black text-white">{(user.diamonds || 0).toLocaleString()}</span>
        </div>
        <input type="file" ref={coverInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
      </div>

      {/* Header Info */}
      <div className="px-6 lg:px-12 -mt-16 relative z-10 flex flex-col items-center md:flex-row md:items-end gap-6 lg:gap-8">
        <div className="relative shrink-0 group">
          <div className="w-32 h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden border-4 md:border-8 border-zinc-950 shadow-2xl bg-zinc-900">
            <img src={formData.avatar} className="w-full h-full object-cover" alt="avatar" />
          </div>
          {isEditing && (
            <button onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white rounded-[2.5rem] lg:rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity">
              <i className="fa-solid fa-camera text-2xl"></i>
            </button>
          )}
          <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight">{formData.name}</h1>
            <div className="flex gap-2">
               <button onClick={() => setIsEditing(!isEditing)} className="px-4 py-1.5 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all">
                {isEditing ? 'Discard' : 'Edit Profile'}
              </button>
              {isEditing && (
                <button onClick={saveProfileSettings} disabled={isProcessing} className="px-4 py-1.5 bg-pink-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-pink-600/20 active:scale-95">
                  {isProcessing ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
          <p className="text-zinc-500 text-xs italic">{formData.bio || 'Elite Member of My Doll Circle'}</p>
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
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">My Collection</h3>
                <button onClick={() => albumInputRef.current?.click()} className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-pink-600/30 active:scale-95 transition-all flex items-center gap-3">
                   <i className="fa-solid fa-plus"></i> Add to Collection
                </button>
                <input type="file" ref={albumInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'album')} />
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {formData.album && formData.album.length > 0 ? (
                  formData.album.map((photo: any) => (
                    <div key={photo.id} className="relative aspect-square rounded-3xl overflow-hidden glass-panel border border-white/5 group bg-zinc-900 shadow-xl">
                       <img src={photo.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={photo.caption} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                          <p className="text-[10px] text-white font-medium mb-2 line-clamp-2">{photo.caption}</p>
                          <div className="flex justify-between items-center">
                             <div className="px-2 py-1 bg-white/10 rounded-lg backdrop-blur-md">
                                <span className="text-[8px] font-black text-white uppercase">{photo.price > 0 ? `${photo.price} Gems` : 'Free'}</span>
                             </div>
                             <button onClick={() => deletePhoto(photo.id)} className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all">
                                <i className="fa-solid fa-trash-can text-[10px]"></i>
                             </button>
                          </div>
                       </div>
                       {photo.price > 0 && (
                         <div className="absolute top-3 right-3 px-2 py-1 bg-cyan-500 rounded-lg shadow-lg">
                           <span className="text-[8px] font-black text-white uppercase tracking-tighter">Premium</span>
                         </div>
                       )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-20 text-center">
                     <i className="fa-solid fa-images text-5xl mb-4"></i>
                     <p className="text-xs font-black uppercase tracking-[0.4em]">Collection is empty</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 bg-gradient-to-br from-cyan-600/10 to-transparent">
                 <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3">Gem Balance</p>
                 <div className="flex items-center gap-4 mb-6">
                    <i className="fa-solid fa-gem text-4xl text-cyan-400"></i>
                    <h2 className="text-5xl font-black text-white">{(user.diamonds || 0).toLocaleString()}</h2>
                 </div>
                 <button onClick={() => onNavigate('store')} className="w-full py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Buy More</button>
              </div>

              <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 bg-gradient-to-br from-emerald-600/10 to-transparent">
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Cash Earnings</p>
                 <div className="flex items-center gap-4 mb-6">
                    <i className="fa-solid fa-money-bill-transfer text-4xl text-emerald-400"></i>
                    <h2 className="text-5xl font-black text-white">${currentUsdValue.toFixed(2)}</h2>
                 </div>
                 <div className="space-y-3">
                    <button 
                      onClick={() => setShowWithdrawModal(true)} 
                      disabled={!canWithdraw}
                      className={`w-full py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all ${canWithdraw ? 'bg-emerald-600 text-white shadow-emerald-600/20 active:scale-95' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                    >
                      {canWithdraw ? 'Withdraw Cash' : 'Insufficient Balance'}
                    </button>
                    {!canWithdraw && (
                       <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest text-center">
                          Min withdrawal: 2000 Gems ($20). Need {(MIN_WITHDRAW_GEMS - (user.diamonds || 0)).toLocaleString()} more.
                       </p>
                    )}
                 </div>
              </div>
            </div>

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
                       <th className="p-6">Status</th>
                     </tr>
                   </thead>
                   <tbody>
                     {user.withdrawals && user.withdrawals.length > 0 ? user.withdrawals.map((w, i) => (
                       <tr key={i} className="border-b border-white/5 text-zinc-300">
                         <td className="p-6">{w.timestamp instanceof Timestamp ? w.timestamp.toDate().toLocaleDateString() : new Date(w.timestamp).toLocaleDateString()}</td>
                         <td className="p-6 text-emerald-400">${w.amountUsd.toFixed(2)}</td>
                         <td className="p-6">
                            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500">{w.status}</span>
                         </td>
                       </tr>
                     )) : (
                       <tr><td colSpan={3} className="p-12 text-center text-zinc-700">No transactions recorded</td></tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
           <div className="max-w-2xl mx-auto glass-panel p-8 lg:p-12 rounded-[3rem] border-white/5 space-y-8 animate-in fade-in duration-500">
              <div className="space-y-4">
                 <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">Public Identity</h4>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Display Name</label>
                       <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-pink-500/50" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Biography</label>
                       <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-pink-500/50 resize-none h-24" />
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">Profile Details</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Gender</label>
                       <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as any})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-pink-500/50">
                          <option value="men">Men</option>
                          <option value="women">Women</option>
                          <option value="other">Other</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Country</label>
                       <input type="text" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-pink-500/50" />
                    </div>
                 </div>
              </div>

              <button onClick={saveProfileSettings} disabled={isProcessing} className="w-full py-5 bg-pink-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl active:scale-95 disabled:opacity-50">
                 {isProcessing ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'UPDATE ALL SETTINGS'}
              </button>
           </div>
        )}
      </div>

      {/* Album Upload Modal */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="w-full max-w-lg glass-panel p-8 lg:p-10 rounded-[3rem] border-white/10 shadow-2xl space-y-8 relative">
              <button onClick={() => setShowAlbumModal(false)} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><i className="fa-solid fa-xmark text-lg"></i></button>
              
              <div className="text-center">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter">New Collection Entry</h3>
                 <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Premium content increases your earnings</p>
              </div>

              <div className="flex gap-8">
                 <div className="w-1/3 aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black">
                    <img src={photoForm.url} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Caption</label>
                       <input type="text" value={photoForm.caption} onChange={(e) => setPhotoForm({...photoForm, caption: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-pink-500/50" placeholder="A brief description..." />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Price (Gems)</label>
                       <div className="relative">
                          <i className="fa-solid fa-gem absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 text-[10px]"></i>
                          <input type="number" value={photoForm.price} onChange={(e) => setPhotoForm({...photoForm, price: parseInt(e.target.value) || 0})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-pink-500/50" />
                       </div>
                       <p className="text-[8px] text-zinc-700 font-bold uppercase mt-1">Set to 0 for free access</p>
                    </div>
                 </div>
              </div>

              <button onClick={savePhotoToAlbum} disabled={isProcessing} className="w-full py-5 bg-pink-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl active:scale-95 disabled:opacity-50">
                 {isProcessing ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'SAVE TO COLLECTION'}
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
                 <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">100 Gems = $1.00 USD | Min 2,000 Gems</p>
              </div>

              <div className="space-y-4">
                 <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">You will receive</span>
                    <span className="text-lg font-black text-emerald-400">${((user.diamonds || 0) / GEMS_PER_DOLLAR).toFixed(2)}</span>
                 </div>
              </div>

              <button 
                onClick={handleWithdraw}
                disabled={isProcessing || !canWithdraw}
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
