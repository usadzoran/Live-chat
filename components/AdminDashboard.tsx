
import React, { useState, useEffect } from 'react';
import { AdConfig } from '../types';
import { db, UserDB } from '../services/databaseService';

interface AdminDashboardProps {
  totalRevenue: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ totalRevenue }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'moderation' | 'nodes' | 'ads' | 'treasury'>('overview');
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<UserDB[]>([]);
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync data from DB
  const refreshData = async () => {
    setIsLoading(true);
    const stats = await db.getPlatformStats();
    const users = await db.getAllUsers();
    const currentAds = await db.getAds();
    
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

  const handleToggleAd = async (ad: AdConfig) => {
    const updated = { ...ad, enabled: !ad.enabled };
    await db.updateAdConfig(updated);
    refreshData();
  };

  const navItems = [
    { id: 'overview', label: 'Command Center', icon: 'fa-chart-pie' },
    { id: 'users', label: 'User Directory', icon: 'fa-users-gear' },
    { id: 'treasury', label: 'Treasury (Fin)', icon: 'fa-vault' },
    { id: 'ads', label: 'Ad Management', icon: 'fa-rectangle-ad' },
    { id: 'nodes', label: 'AI Infrastructure', icon: 'fa-server' },
  ] as const;

  if (isLoading) {
    return (
      <div className="h-full w-full bg-[#050505] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
           <i className="fa-solid fa-circle-notch animate-spin text-cyan-500 text-3xl"></i>
           <p className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.5em]">Syncing Master Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#050505] flex flex-col lg:flex-row overflow-hidden text-zinc-300 font-mono">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-white/5 bg-black/40 flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.4)]">
              <i className="fa-solid fa-shield-halved text-white text-sm"></i>
            </div>
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-widest">Master Node</h2>
              <p className="text-[8px] text-cyan-500 font-bold uppercase tracking-[0.2em]">Wahab Fresh Access</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 shadow-inner' : 'hover:bg-white/5 text-zinc-500'}`}
            >
              <i className={`fa-solid ${item.icon} w-4`}></i>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[8px] font-bold uppercase text-zinc-600">Memory Usage</span>
              <span className="text-[8px] font-bold text-cyan-500">64%</span>
            </div>
            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 w-[64%]"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 lg:h-16 border-b border-white/5 px-4 lg:px-8 flex items-center justify-between bg-black/20 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 lg:gap-4">
            <span className="hidden sm:inline text-[10px] text-zinc-600 uppercase font-black tracking-widest">Path:</span>
            <span className="text-[9px] lg:text-[10px] text-cyan-500 font-black uppercase tracking-widest">Root / {activeTab}</span>
          </div>
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${platformStats?.isLive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`}></div>
              <span className="hidden sm:inline text-[8px] font-black uppercase text-zinc-400">
                {platformStats?.isLive ? 'LIVE MODE' : 'SANDBOX MODE'}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 hide-scrollbar">
          {activeTab === 'overview' && (
            <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 lg:gap-4 bg-cyan-500/10 p-4 border border-cyan-500/20 rounded-2xl">
                 <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white shrink-0">
                    <i className="fa-solid fa-vampire text-lg lg:text-xl"></i>
                 </div>
                 <div>
                    <h2 className="text-xs lg:text-sm font-black text-white uppercase tracking-widest">Welcome, Wahab Fresh</h2>
                    <p className="text-[9px] lg:text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Master Node Status: Online</p>
                 </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                 {[
                   { label: 'Total Revenue', value: `$${platformStats.revenue.toLocaleString()}`, icon: 'fa-sack-dollar', color: 'text-emerald-400' },
                   { label: 'Registered Members', value: platformStats.userCount, icon: 'fa-users', color: 'text-pink-400' },
                   { label: 'System Liability', value: `$${platformStats.liabilityUsd.toLocaleString()}`, icon: 'fa-gem', color: 'text-cyan-400' },
                   { label: 'AI Endpoints', value: 'Active', icon: 'fa-bolt', color: 'text-yellow-400' },
                 ].map((stat, i) => (
                  <div key={i} className="p-4 lg:p-6 glass-panel rounded-2xl border-white/5 flex flex-col gap-3 lg:gap-4 group hover:border-cyan-500/20 transition-all">
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center ${stat.color}`}>
                        <i className={`fa-solid ${stat.icon} text-xs lg:text-base`}></i>
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-0.5 lg:mb-1">{stat.label}</p>
                      <p className="text-lg lg:text-2xl font-black text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-panel rounded-3xl border-white/5 overflow-hidden">
                     <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Member Distribution</h3>
                     </div>
                     <div className="p-8 space-y-6">
                        <div className="space-y-2">
                           <div className="flex justify-between text-[10px] font-black uppercase">
                              <span className="text-pink-400">Dolls</span>
                              <span className="text-white">{platformStats.dollCount}</span>
                           </div>
                           <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                              <div className="h-full bg-pink-500" style={{ width: `${(platformStats.dollCount / platformStats.userCount) * 100}%` }}></div>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between text-[10px] font-black uppercase">
                              <span className="text-blue-400">Mentors</span>
                              <span className="text-white">{platformStats.mentorCount}</span>
                           </div>
                           <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${(platformStats.mentorCount / platformStats.userCount) * 100}%` }}></div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="glass-panel p-8 rounded-3xl border-white/5 space-y-6">
                     <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Quick Node Logs</h3>
                     <div className="space-y-3 font-mono text-[9px] text-zinc-500">
                        <p className="flex gap-4"><span className="text-emerald-500">[OK]</span> DB Persistence Engine 3.1 initialized</p>
                        <p className="flex gap-4"><span className="text-emerald-500">[OK]</span> IndexedDB connection secure</p>
                        <p className="flex gap-4"><span className="text-cyan-500">[SYNC]</span> {platformStats.userCount} user profiles verified</p>
                        <p className="flex gap-4"><span className="text-pink-500">[ADMIN]</span> Wahab Fresh signed in via Master Access</p>
                        <p className="flex gap-4"><span className="text-amber-500">[WARN]</span> Crypto settlement pending approval</p>
                     </div>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Identity Management</h2>
                 <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{allUsers.length} total entities found</p>
              </div>

              <div className="glass-panel rounded-[2rem] border-white/5 overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[9px] text-zinc-600 uppercase tracking-widest bg-white/[0.02]">
                          <th className="p-6 font-black">User Identity</th>
                          <th className="p-6 font-black">Role</th>
                          <th className="p-6 font-black">Location</th>
                          <th className="p-6 font-black">Holdings</th>
                          <th className="p-6 font-black">Status</th>
                          <th className="p-6 font-black">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px]">
                        {allUsers.map((user, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="p-6">
                               <div className="flex items-center gap-3">
                                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff`} className="w-8 h-8 rounded-lg" alt="" />
                                  <div>
                                     <p className="font-bold text-white leading-none mb-1">{user.name}</p>
                                     <p className="text-[8px] text-zinc-500">{user.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="p-6">
                               <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-cyan-500/10 text-cyan-400' : user.role === 'doll' ? 'bg-pink-500/10 text-pink-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                  {user.role}
                               </span>
                            </td>
                            <td className="p-6 text-zinc-500 uppercase font-black">{user.country || 'Unknown'}</td>
                            <td className="p-6 font-black text-white">
                               <div className="flex items-center gap-2">
                                  <i className="fa-solid fa-gem text-[8px] text-cyan-500"></i>
                                  {user.diamonds.toLocaleString()}
                               </div>
                            </td>
                            <td className="p-6">
                               <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'banned' ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
                                  <span className={`uppercase text-[8px] font-black tracking-widest ${user.status === 'banned' ? 'text-red-500' : 'text-emerald-500'}`}>
                                     {user.status || 'active'}
                                  </span>
                               </div>
                            </td>
                            <td className="p-6">
                               <button 
                                 disabled={user.role === 'admin'}
                                 onClick={() => handleToggleUser(user.email)}
                                 className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${user.status === 'banned' ? 'bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white' : 'bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white'} disabled:opacity-20 disabled:cursor-not-allowed`}
                               >
                                  {user.status === 'banned' ? 'Restore' : 'Ban Access'}
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center justify-between">
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Ad Traffic Hub</h2>
                 <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Persistent Ad Configurations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {ads.map((ad) => (
                   <div key={ad.id} className="glass-panel p-6 rounded-[2rem] border border-white/5 flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-xl ${ad.enabled ? 'text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-zinc-600'}`}>
                               <i className="fa-solid fa-rectangle-ad"></i>
                            </div>
                            <div>
                               <h3 className="text-xs font-black text-white uppercase tracking-widest">{ad.title}</h3>
                               <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Slot: {ad.placement}</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => handleToggleAd(ad)}
                           className={`w-14 h-7 rounded-full relative transition-all duration-300 ${ad.enabled ? 'bg-cyan-600 shadow-[0_0_10px_rgba(8,145,178,0.4)]' : 'bg-zinc-800'}`}
                         >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ${ad.enabled ? 'left-8' : 'left-1'}`}></div>
                         </button>
                      </div>

                      <div className="h-32 rounded-xl border border-white/5 bg-black/40 relative overflow-hidden flex items-center justify-center">
                         {ad.imageUrl ? (
                            <img src={ad.imageUrl} className="w-full h-full object-cover opacity-40" alt="" />
                         ) : (
                            <i className="fa-solid fa-image text-2xl text-zinc-800"></i>
                         )}
                         <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                            <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Image Preview</span>
                            <p className="text-[8px] text-zinc-700 truncate w-full">{ad.link}</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <button className="py-3 rounded-xl bg-white/5 text-zinc-500 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">Edit Content</button>
                         <button className="py-3 rounded-xl bg-white/5 text-zinc-500 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">View Analytics</button>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'treasury' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
               <div className="flex flex-col gap-2">
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Platform Treasury</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">Merchant status & platform liquidity</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                       <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 text-2xl">
                          <i className="fa-brands fa-paypal"></i>
                       </div>
                       <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-widest">PayPal LIVE Merchant</h3>
                          <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Active Connection Status</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Live Client ID</label>
                          <div className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-xs text-white truncate font-mono">
                            {platformStats.merchantId}
                          </div>
                       </div>
                    </div>

                    <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <i className="fa-solid fa-circle-check text-green-500 text-[10px]"></i>
                          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live Gateway Connected</span>
                       </div>
                    </div>
                 </div>

                 <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 space-y-8">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Economic Health</h3>
                    <div className="space-y-6">
                       <div className="flex justify-between items-end border-b border-white/5 pb-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-black">Total Revenue</span>
                          <span className="text-2xl font-black text-emerald-400">${platformStats.revenue.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-white/5 pb-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-black">Total Payouts</span>
                          <span className="text-2xl font-black text-red-400">${platformStats.totalPayouts.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-white/5 pb-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-black">User Liabilities</span>
                          <span className="text-2xl font-black text-pink-500">${platformStats.liabilityUsd.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-end pt-2">
                          <span className="text-[10px] text-zinc-500 uppercase font-black italic">Platform Profitability</span>
                          <span className="text-2xl font-black text-white">
                             ${(platformStats.revenue - platformStats.totalPayouts).toLocaleString()}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'nodes' && (
             <div className="space-y-8 animate-in zoom-in duration-500">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-black text-white uppercase tracking-widest">AI Infrastructure</h2>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">Cluster Management & Endpoint Health</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {['Core Processor', 'Visual Synthesis', 'Voice Engine'].map((node, i) => (
                      <div key={i} className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-4 group">
                         <div className="w-16 h-16 rounded-[2rem] bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-2xl text-cyan-400 group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-microchip"></i>
                         </div>
                         <div className="text-center">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{node}</h4>
                            <p className="text-[8px] text-emerald-500 font-bold uppercase mt-1">Status: Optimal</p>
                         </div>
                         <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${60 + Math.random() * 30}%` }}></div>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-zinc-950/40">
                   <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Cluster Traffic Monitor</h3>
                   <div className="h-48 w-full flex items-end gap-2 px-2">
                      {Array.from({length: 30}).map((_, i) => (
                        <div key={i} className="flex-1 bg-cyan-500/20 hover:bg-cyan-500 transition-all rounded-t-sm" style={{ height: `${20 + Math.random() * 80}%` }}></div>
                      ))}
                   </div>
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
