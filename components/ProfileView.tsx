
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
    paypalEmail: 'creator.payouts@example.com',
    cardNumber: '**** **** **** 4421',
    cardExpiry: '12/26',
    cardHolder: user.name
  });

  const [galleryPhotos, setGalleryPhotos] = useState<GalleryItem[]>([
    { id: 1, url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=600&q=80', likes: '1.2k', comments: '45', type: 'free' },
    { id: 2, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80', likes: '890', comments: '22', type: 'free' },
    { id: 3, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', likes: '2.4k', comments: '112', type: 'paid', price: 15.00 },
    { id: 4, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', likes: '560', comments: '12', type: 'paid', price: 9.99 },
    { id: 5, url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80', likes: '1.1k', comments: '34', type: 'free' },
    { id: 6, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', likes: '920', comments: '28', type: 'paid', price: 25.50 },
  ]);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const mockStats = [
    { label: 'Followers', value: '1.2k', icon: 'fa-users', color: 'text-indigo-400' },
    { label: 'Avg. Views', value: '4.5k', icon: 'fa-chart-simple', color: 'text-purple-400' },
    { label: 'Level', value: '24', icon: 'fa-bolt', color: 'text-yellow-400' },
  ];

  const badges = [
    { icon: 'fa-medal', color: 'text-amber-400', label: 'Top Tier' },
    { icon: 'fa-fire', color: 'text-orange-500', label: 'Daily Streak' },
    { icon: 'fa-brain', color: 'text-indigo-400', label: 'AI Pioneer' },
  ];

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col gap-6 overflow-y-auto pb-24 hide-scrollbar px-2 relative">
      {/* Hero Section with Cover */}
      <div className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden group shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
          alt="cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-colors z-20"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <button className="absolute bottom-6 right-6 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all">
          <i className="fa-solid fa-camera mr-2"></i> Update Cover
        </button>
      </div>

      {/* Main Profile Info Overlay */}
      <div className="px-8 -mt-20 relative z-10 flex flex-col md:flex-row items-end gap-6">
        <div className="relative shrink-0 mx-auto md:mx-0">
          <div className="w-36 h-36 rounded-[2.5rem] overflow-hidden border-8 border-zinc-950 shadow-2xl bg-zinc-900">
            <img 
              src={`https://ui-avatars.com/api/?name=${user.name}&size=144&background=6366f1&color=fff`} 
              className="w-full h-full object-cover" 
              alt="avatar" 
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-indigo-600 border-4 border-zinc-950 flex items-center justify-center text-white shadow-lg">
             <i className="fa-solid fa-check text-xs"></i>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left pb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-white tracking-tight">{user.name}</h1>
            <div className="flex gap-2">
              {badges.map((badge, i) => (
                <div key={i} className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center group relative cursor-help">
                  <i className={`fa-solid ${badge.icon} ${badge.color} text-xs`}></i>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[8px] font-bold text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                    {badge.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-zinc-400 text-sm max-w-xl mb-4 italic leading-relaxed">
            {user.bio || 'AI Creator sharing digital dreams. Live every day at 6 PM EST.'}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
             {mockStats.map((stat, i) => (
               <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                 <i className={`fa-solid ${stat.icon} ${stat.color} text-[10px]`}></i>
                 <span className="text-xs font-bold text-white">{stat.value}</span>
                 <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{stat.label}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-8 px-8 border-b border-white/5">
        <button 
          onClick={() => setActiveTab('showcase')}
          className={`py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'showcase' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}
        >
          Gallery & Showcase
        </button>
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'wallet' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}
        >
          Wallet & Earnings
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'settings' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}
        >
          Account Settings
        </button>
      </div>

      {/* Content Rendering based on activeTab */}
      <div className="px-4 animate-in fade-in duration-500">
        {activeTab === 'showcase' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveGalleryType('free')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${activeGalleryType === 'free' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-500 border border-white/5'}`}
                  >
                    FREE ASSETS
                  </button>
                  <button 
                    onClick={() => setActiveGalleryType('paid')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${activeGalleryType === 'paid' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-500 border border-white/5'}`}
                  >
                    PREMIUM CONTENT
                  </button>
               </div>
               <button className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
                 <i className="fa-solid fa-plus"></i> Upload New
               </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {galleryPhotos.filter(p => p.type === activeGalleryType).map((item) => (
                <div key={item.id} className="group relative aspect-square rounded-[2rem] overflow-hidden border border-white/5 bg-zinc-900/50 cursor-pointer">
                  <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="gallery" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                     <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                           <i className="fa-solid fa-heart text-red-500"></i> {item.likes}
                        </div>
                        <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                           <i className="fa-solid fa-comment text-indigo-400"></i> {item.comments}
                        </div>
                     </div>
                     {item.type === 'paid' && (
                       <div className="px-3 py-1 bg-purple-600 rounded-lg text-white font-black text-[10px] shadow-xl">
                          ${item.price?.toFixed(2)}
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="md:col-span-2 space-y-6">
                <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Total Balance</p>
                   <div className="flex items-end gap-3 mb-8">
                      <h2 className="text-6xl font-black text-white">$1,284<span className="text-zinc-500 text-3xl">.50</span></h2>
                      <div className="mb-2 px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-lg border border-green-500/20">
                        +12% this month
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
                         <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Upcoming Payout</p>
                         <p className="text-lg font-bold text-white">$450.25</p>
                      </div>
                      <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
                         <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Total Earned</p>
                         <p className="text-lg font-bold text-white">$12,400</p>
                      </div>
                   </div>
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem] border-white/5">
                   <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                     <i className="fa-solid fa-clock-rotate-left text-zinc-600"></i> Recent Payouts
                   </h3>
                   <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                                 <i className="fa-solid fa-arrow-down-long"></i>
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-white">Monthly Payout #{100-i}</p>
                                 <p className="text-[9px] text-zinc-500">Oct {20-i}, 2024</p>
                              </div>
                           </div>
                           <p className="text-xs font-bold text-green-400">+$1,200.00</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="glass-panel p-6 rounded-3xl border-white/5">
                   <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Payout Method</h3>
                   {payoutSettings.method === 'card' ? (
                     <div className="p-4 bg-zinc-900 rounded-2xl border border-indigo-500/30 relative group cursor-pointer">
                        <i className="fa-solid fa-credit-card text-2xl text-indigo-400 mb-3"></i>
                        <p className="text-xs font-bold text-white">{payoutSettings.cardNumber}</p>
                        <p className="text-[10px] text-zinc-500">Expires {payoutSettings.cardExpiry}</p>
                        <div className="absolute top-4 right-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                           <i className="fa-solid fa-pen text-[10px]"></i>
                        </div>
                     </div>
                   ) : (
                     <div className="p-4 bg-zinc-900 rounded-2xl border border-blue-500/30 relative group cursor-pointer">
                        <i className="fa-brands fa-paypal text-2xl text-blue-400 mb-3"></i>
                        <p className="text-xs font-bold text-white truncate">{payoutSettings.paypalEmail}</p>
                        <p className="text-[10px] text-zinc-500">Connected</p>
                     </div>
                   )}
                   <button className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                     Update Payment Method
                   </button>
                </div>

                <div className="glass-panel p-6 rounded-3xl border-white/5 bg-zinc-900/30">
                   <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Support</h3>
                   <p className="text-[11px] text-zinc-500 mb-4 leading-relaxed">Need help with your earnings? Our dedicated creator support team is here to help.</p>
                   <button className="w-full py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
                      Open Support Ticket
                   </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Public Profile</h3>
                <button 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-lg transition-all ${isEditing ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:bg-indigo-500/10'}`}
                >
                  {isEditing ? 'SAVE CHANGES' : 'EDIT'}
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Display Name</label>
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 disabled:opacity-50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 disabled:opacity-50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Creator Bio</label>
                  <textarea 
                    rows={4}
                    disabled={!isEditing}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 disabled:opacity-50 transition-all resize-none"
                    placeholder="Tell your fans something about yourself..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Social Links</h3>
                <div className="space-y-4">
                   <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-white/5">
                      <i className="fa-brands fa-instagram text-pink-500"></i>
                      <input className="bg-transparent text-xs text-white focus:outline-none flex-1" placeholder="instagram.com/handle" />
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-white/5">
                      <i className="fa-brands fa-tiktok text-white"></i>
                      <input className="bg-transparent text-xs text-white focus:outline-none flex-1" placeholder="tiktok.com/@handle" />
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-white/5">
                      <i className="fa-brands fa-twitter text-blue-400"></i>
                      <input className="bg-transparent text-xs text-white focus:outline-none flex-1" placeholder="twitter.com/handle" />
                   </div>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border-red-500/20 bg-red-500/5">
                <h3 className="text-sm font-bold text-red-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation"></i> Danger Zone
                </h3>
                <p className="text-[10px] text-zinc-600 mb-4">Deleting your account is permanent and will remove all content.</p>
                <button className="px-6 py-2 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isSaved && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-500 text-white rounded-2xl shadow-2xl font-bold text-xs animate-in slide-in-from-bottom-8 fade-in duration-300">
           Settings saved successfully!
        </div>
      )}
    </div>
  );
};

export default ProfileView;
