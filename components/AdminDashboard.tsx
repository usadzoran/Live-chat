
import React, { useState, useEffect } from 'react';
import { AdConfig } from '../types';
import { db, UserDB } from '../services/databaseService';

interface AdminDashboardProps {
  totalRevenue: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ totalRevenue }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'ads' | 'treasury' | 'nodes'>('overview');
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<UserDB[]>([]);
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDB | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [editingAd, setEditingAd] = useState<AdConfig | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    const [stats, users, currentAds] = await Promise.all([
      db.getPlatformStats(),
      db.getAllUsers(),
      db.getAds()
    ]);
    setPlatformStats(stats);
    setAllUsers(users);
    setAds(currentAds);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleToggleUser = async (email: string) => {
    await db.toggleUserStatus(email);
    refreshData();
  };

  const handleDeleteUser = async (email: string) => {
    if (confirm(`Delete user ${email}?`)) {
      await db.deleteUser(email);
      refreshData();
    }
  };

  const handleUpsertUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const userData: UserDB = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      diamonds: parseInt(fd.get('diamonds') as string) || 0,
      usd_balance: parseFloat(fd.get('usd_balance') as string) || 0,
      role: fd.get('role') as any,
      status: fd.get('status') as any,
      withdrawals: editingUser?.withdrawals || [],
      album: editingUser?.album || [],
    };
    await db.upsertUser(userData);
    setShowUserModal(false);
    refreshData();
  };

  const handleUpsertAd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const adData: AdConfig = {
      id: editingAd?.id || `ad_${Date.now()}`,
      title: fd.get('title') as string,
      link: fd.get('link') as string,
      imageUrl: fd.get('imageUrl') as string,
      placement: fd.get('placement') as any,
      enabled: fd.get('enabled') === 'on',
    };
    await db.updateAdConfig(adData);
    setShowAdModal(false);
    refreshData();
  };

  const handleDeleteAd = async (id: string) => {
    if (confirm('Delete this ad?')) {
      await db.deleteAd(id);
      refreshData();
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full bg-[#050505] flex items-center justify-center font-mono">
        <i className="fa-solid fa-circle-notch animate-spin text-cyan-500 text-3xl"></i>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Command Center', icon: 'fa-chart-pie' },
    { id: 'users', label: 'User Directory', icon: 'fa-users-gear' },
    { id: 'treasury', label: 'Platform Wallet', icon: 'fa-vault' },
    { id: 'ads', label: 'Ad Management', icon: 'fa-rectangle-ad' },
    { id: 'nodes', label: 'Infrastructure', icon: 'fa-server' },
  ] as const;

  return (
    <div className="h-full w-full bg-[#050505] flex flex-col lg:flex-row overflow-hidden text-zinc-300 font-mono">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-white/5 bg-black/40 flex-col shrink-0">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.4)]">
            <i className="fa-solid fa-shield-halved text-white text-sm"></i>
          </div>
          <div>
            <h2 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Master Node</h2>
            <p className="text-[8px] text-cyan-500 font-bold uppercase tracking-[0.2em] mt-1">Wahab Fresh Access</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto hide-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-white/5 text-zinc-500'}`}
            >
              <i className={`fa-solid ${item.icon} w-4`}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 lg:h-16 border-b border-white/5 px-4 lg:px-8 flex items-center justify-between bg-black/20 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
             <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Root / {activeTab}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${platformStats?.isLive ? 'bg-green-500' : 'bg-amber-500'} shadow-[0_0_8px]`}></div>
                <span className="text-[8px] font-black uppercase text-zinc-500">{platformStats?.isLive ? 'LIVE' : 'SANDBOX'}</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 hide-scrollbar">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                   { label: 'Platform Revenue', value: `$${platformStats.revenue.toFixed(2)}`, icon: 'fa-dollar-sign', color: 'text-emerald-400' },
                   { label: 'Total Diamonds', value: platformStats.liabilityUsd * 100, icon: 'fa-gem', color: 'text-cyan-400' },
                   { label: 'Active Users', value: platformStats.userCount, icon: 'fa-users', color: 'text-pink-400' },
                   { label: 'Total Payouts', value: `$${platformStats.totalPayouts.toFixed(2)}`, icon: 'fa-money-bill-transfer', color: 'text-indigo-400' },
                 ].map((stat, i) => (
                  <div key={i} className="p-5 glass-panel rounded-2xl border-white/5 flex flex-col gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center ${stat.color}`}>
                      <i className={`fa-solid ${stat.icon}`}></i>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-xl font-black text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="glass-panel p-6 rounded-3xl border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Quick Infrastructure Status</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Main Cloud Node</span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase">Optimal [99.9%]</span>
                   </div>
                   <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Gemini Native Audio Cluster</span>
                      <span className="text-[10px] font-black text-cyan-500 uppercase">Synced [12ms]</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">User Repository</h2>
                  <button 
                    onClick={() => { setEditingUser(null); setShowUserModal(true); }}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-600/20 active:scale-95 transition-all"
                  >
                    Add Entity
                  </button>
               </div>

               <div className="glass-panel rounded-3xl border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[9px] text-zinc-600 uppercase tracking-widest bg-white/[0.02]">
                          <th className="p-6 font-black">Identity</th>
                          <th className="p-6 font-black">Holdings (Gems / USD)</th>
                          <th className="p-6 font-black">Role / Status</th>
                          <th className="p-6 font-black">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px]">
                        {allUsers.map((u, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="p-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/5 overflow-hidden">
                                     <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random&color=fff`} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                     <p className="font-black text-white">{u.name}</p>
                                     <p className="text-[8px] text-zinc-600">{u.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="p-6">
                               <div className="flex flex-col gap-1">
                                  <span className="text-cyan-400 font-black flex items-center gap-1.5"><i className="fa-solid fa-gem text-[8px]"></i> {u.diamonds.toLocaleString()}</span>
                                  <span className="text-emerald-400 font-black">${u.usd_balance.toFixed(2)}</span>
                               </div>
                            </td>
                            <td className="p-6">
                               <div className="flex flex-col gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest w-fit ${u.role === 'admin' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-pink-500/10 text-pink-400'}`}>{u.role}</span>
                                  <span className={`text-[7px] font-black uppercase tracking-widest ${u.status === 'banned' ? 'text-red-500' : 'text-emerald-500'}`}>{u.status}</span>
                               </div>
                            </td>
                            <td className="p-6">
                               <div className="flex items-center gap-2">
                                  <button onClick={() => { setEditingUser(u); setShowUserModal(true); }} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all"><i className="fa-solid fa-pen text-[8px]"></i></button>
                                  <button onClick={() => handleToggleUser(u.email)} className={`w-8 h-8 rounded-lg ${u.status === 'banned' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} flex items-center justify-center transition-all`}><i className={`fa-solid ${u.status === 'banned' ? 'fa-check' : 'fa-ban'} text-[8px]`}></i></button>
                                  <button onClick={() => handleDeleteUser(u.email)} disabled={u.role === 'admin'} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-600 flex items-center justify-center text-zinc-500 hover:text-white transition-all disabled:opacity-10"><i className="fa-solid fa-trash text-[8px]"></i></button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'treasury' && (
             <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col gap-2 mb-6">
                   <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Treasury Management</h2>
                   <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Platform Liquidity & Settlements</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="glass-panel p-8 rounded-3xl border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent flex flex-col justify-between">
                      <div className="space-y-2">
                        <i className="fa-brands fa-paypal text-3xl text-indigo-400"></i>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Gateway Settlement</h3>
                        <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">Admin Payout Wallet</p>
                      </div>
                      <div className="mt-8 flex justify-between items-end">
                         <div className="space-y-1">
                            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Settled Funds</p>
                            <p className="text-3xl font-black text-white">${platformStats.revenue.toFixed(2)}</p>
                         </div>
                         <button className="px-6 py-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">Withdraw Revenue</button>
                      </div>
                   </div>

                   <div className="glass-panel p-8 rounded-3xl border-white/5 space-y-8">
                      <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Platform Exposure</h3>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">User Diamond Debt</span>
                            <span className="text-xl font-black text-cyan-400">${platformStats.liabilityUsd.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Pending Payouts</span>
                            <span className="text-xl font-black text-pink-400">$0.00</span>
                         </div>
                         <div className="flex justify-between items-center pt-2">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Net Capital Gain</span>
                            <span className="text-2xl font-black text-white">${(platformStats.revenue - platformStats.totalPayouts).toFixed(2)}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Ad Traffic Engine</h2>
                  <button 
                    onClick={() => { setEditingAd(null); setShowAdModal(true); }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    Create Ad Slot
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ads.map(ad => (
                    <div key={ad.id} className="glass-panel p-6 rounded-3xl border-white/5 flex flex-col gap-6 relative group overflow-hidden">
                       <div className="flex items-center justify-between z-10">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${ad.enabled ? 'bg-cyan-600/20 text-cyan-400' : 'bg-zinc-800 text-zinc-600'}`}>
                             <i className="fa-solid fa-rectangle-ad"></i>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => { setEditingAd(ad); setShowAdModal(true); }} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all"><i className="fa-solid fa-pen text-[8px]"></i></button>
                             <button onClick={() => handleDeleteAd(ad.id)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-600 flex items-center justify-center text-zinc-500 hover:text-white transition-all"><i className="fa-solid fa-trash text-[8px]"></i></button>
                          </div>
                       </div>
                       
                       <div className="z-10">
                          <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">{ad.title}</h4>
                          <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Placement: {ad.placement}</p>
                       </div>

                       <div className="aspect-video rounded-xl overflow-hidden border border-white/5 bg-zinc-950/50 z-10">
                          <img src={ad.imageUrl} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" />
                       </div>

                       <div className={`absolute top-0 right-0 w-16 h-16 ${ad.enabled ? 'bg-cyan-500/10' : 'bg-red-500/10'} blur-3xl rounded-full -translate-y-1/2 translate-x-1/2`}></div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'nodes' && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
               <i className="fa-solid fa-microchip text-4xl mb-2"></i>
               <h3 className="text-xs font-black uppercase tracking-[0.5em]">Network Subsystem Online</h3>
               <p className="text-[10px] font-bold max-w-xs leading-loose">Visual synthesis clusters are operating at nominal capacity. No errors detected in the AI reasoning chain.</p>
            </div>
          )}
        </div>
      </main>

      {/* User CRUD Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-md glass-panel p-8 rounded-[3rem] border-white/10 shadow-2xl relative overflow-hidden">
              <button onClick={() => setShowUserModal(false)} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><i className="fa-solid fa-xmark text-lg"></i></button>
              <div className="mb-8">
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{editingUser ? 'Modify Entity' : 'Inject New Entity'}</h2>
                 <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mt-1">Direct Database Write Privilege</p>
              </div>

              <form onSubmit={handleUpsertUser} className="space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Identity Name</label>
                    <input name="name" defaultValue={editingUser?.name || ''} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-xs text-white focus:outline-none focus:border-cyan-500/50" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Master Email (UID)</label>
                    <input name="email" readOnly={!!editingUser} defaultValue={editingUser?.email || ''} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-xs text-white focus:outline-none focus:border-cyan-500/50 disabled:opacity-30" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Diamonds</label>
                        <input name="diamonds" type="number" defaultValue={editingUser?.diamonds || 0} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-xs text-white focus:outline-none focus:border-cyan-500/50" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Cash Balance ($)</label>
                        <input name="usd_balance" type="number" step="0.01" defaultValue={editingUser?.usd_balance || 0} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-xs text-white focus:outline-none focus:border-cyan-500/50" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Security Role</label>
                        <select name="role" defaultValue={editingUser?.role || 'doll'} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-xs text-white focus:outline-none focus:border-cyan-500/50 appearance-none">
                           <option value="doll">Doll</option>
                           <option value="mentor">Mentor</option>
                           <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Node Status</label>
                        <select name="status" defaultValue={editingUser?.status || 'active'} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-xs text-white focus:outline-none focus:border-cyan-500/50 appearance-none">
                           <option value="active">Active</option>
                           <option value="banned">Banned</option>
                        </select>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-4 bg-cyan-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-cyan-600/20 active:scale-95 transition-all mt-4">COMMIT TRANSACTION</button>
              </form>
           </div>
        </div>
      )}

      {/* Ad CRUD Modal */}
      {showAdModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-md glass-panel p-8 rounded-[3rem] border-white/10 shadow-2xl relative overflow-hidden">
              <button onClick={() => setShowAdModal(false)} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><i className="fa-solid fa-xmark text-lg"></i></button>
              <div className="mb-8">
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{editingAd ? 'Modify Ad Logic' : 'Provision New Ad'}</h2>
                 <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mt-1">Traffic Subsystem Config</p>
              </div>

              <form onSubmit={handleUpsertAd} className="space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Internal Ad Title</label>
                    <input name="title" defaultValue={editingAd?.title || ''} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-xs text-white focus:outline-none focus:border-emerald-500/50" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Media URL (Image)</label>
                    <input name="imageUrl" defaultValue={editingAd?.imageUrl || ''} placeholder="https://..." required className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-xs text-white focus:outline-none focus:border-emerald-500/50" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">HTML Redirection Link / Logic</label>
                    <textarea name="link" defaultValue={editingAd?.link || ''} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-[10px] text-emerald-400 font-mono focus:outline-none focus:border-emerald-500/50 h-24 resize-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Deployment Slot</label>
                        <select name="placement" defaultValue={editingAd?.placement || 'under_header'} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-xs text-white focus:outline-none focus:border-emerald-500/50 appearance-none">
                           <option value="under_header">Header Banner</option>
                           <option value="before_publication">Pre-Feed Slot</option>
                           <option value="under_publication">Post-Feed Slot</option>
                           <option value="footer">Footer Global</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3 pt-6 px-4">
                       <input type="checkbox" name="enabled" defaultChecked={editingAd?.enabled ?? true} className="w-4 h-4 accent-emerald-500" />
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Live Status</label>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-all mt-4">SYNC AD ENGINE</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
