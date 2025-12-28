
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
  const [allWithdrawals, setAllWithdrawals] = useState<any[]>([]);
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDB | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [editingAd, setEditingAd] = useState<AdConfig | null>(null);
  
  // Gem Management Modal
  const [showGemModal, setShowGemModal] = useState(false);
  const [gemTargetUser, setGemTargetUser] = useState<UserDB | null>(null);
  const [gemAdjustment, setGemAdjustment] = useState<number>(0);

  const refreshData = async () => {
    setIsLoading(true);
    const [stats, users, currentAds, withdrawals] = await Promise.all([
      db.getPlatformStats(),
      db.getAllUsers(),
      db.getAds(),
      db.getAllWithdrawals()
    ]);
    setPlatformStats(stats);
    setAllUsers(users);
    setAds(currentAds);
    setAllWithdrawals(withdrawals);
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

  const handleWalletReset = async () => {
    if (confirm("NUCLEAR OPTION: Reset all user wallets and platform revenue to ZERO? This cannot be undone.")) {
      await db.resetAllWallets();
      refreshData();
      alert("All wallets have been zeroed and synced to DB.");
    }
  };

  const handleAdjustGems = async () => {
    if (!gemTargetUser) return;
    const newTotal = Math.max(0, (gemTargetUser.diamonds || 0) + gemAdjustment);
    await db.upsertUser({
      ...gemTargetUser,
      diamonds: newTotal
    });
    setShowGemModal(false);
    setGemAdjustment(0);
    setGemTargetUser(null);
    refreshData();
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

  const navItems = [
    { id: 'overview', label: 'Command Center', icon: 'fa-chart-pie' },
    { id: 'users', label: 'User Repository', icon: 'fa-users-gear' },
    { id: 'treasury', label: 'Treasury & Sales', icon: 'fa-vault' },
    { id: 'ads', label: 'Ad Engine', icon: 'fa-rectangle-ad' },
    { id: 'nodes', label: 'Infrastructure', icon: 'fa-server' },
  ] as const;

  if (isLoading) {
    return (
      <div className="h-full w-full bg-[#050505] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-solid fa-circle-notch animate-spin text-cyan-500 text-3xl"></i>
          <p className="text-[10px] text-cyan-800 uppercase tracking-[0.5em]">Syncing Master Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#050505] flex flex-col lg:flex-row overflow-hidden text-zinc-300 font-mono selection:bg-cyan-500/30">
      
      {/* Navigation Drawer / Sidebar */}
      <aside className={`
        fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl lg:relative lg:flex lg:z-0 lg:bg-black/40 lg:w-72 border-r border-white/5 flex-col shrink-0 transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(8,145,178,0.4)]">
              <i className="fa-solid fa-shield-halved text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-widest leading-none">Admin Portal</h2>
              <p className="text-[8px] text-cyan-500 font-bold uppercase tracking-[0.2em] mt-1">Master Access</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-3 overflow-y-auto hide-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === item.id 
                  ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(8,145,178,0.1)]' 
                  : 'hover:bg-white/5 text-zinc-500'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-sm w-6`}></i>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">System Online</span>
            </div>
            <p className="text-[7px] text-zinc-600 font-bold leading-relaxed uppercase">Global cluster response at 14ms nominal</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Header Bar */}
        <header className="h-20 border-b border-white/5 px-6 lg:px-10 flex items-center justify-between bg-black/20 backdrop-blur-xl shrink-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400">
              <i className="fa-solid fa-bars"></i>
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest leading-none mb-1">Navigation / {activeTab}</span>
              <h1 className="text-lg font-black text-white uppercase italic tracking-tighter">
                {navItems.find(n => n.id === activeTab)?.label}
              </h1>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">Platform Revenue</span>
                <span className="text-sm font-black text-emerald-400">${platformStats?.revenue.toFixed(2)}</span>
             </div>
             <div className="w-[1px] h-8 bg-white/5"></div>
             <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
                <i className="fa-solid fa-user-shield text-cyan-500 text-xs"></i>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Wahab Fresh</span>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 hide-scrollbar bg-[radial-gradient(circle_at_top_right,_rgba(8,145,178,0.05),_transparent_40%)]">
          
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: 'Total Sales Revenue', value: `$${platformStats.revenue.toFixed(2)}`, icon: 'fa-dollar-sign', color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                   { label: 'Circulating Gems', value: (platformStats.liabilityUsd * 100).toLocaleString(), icon: 'fa-gem', color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
                   { label: 'Total Entities', value: platformStats.userCount, icon: 'fa-users', color: 'text-pink-400', bg: 'bg-pink-500/5' },
                   { label: 'Total Payouts', value: `$${platformStats.totalPayouts.toFixed(2)}`, icon: 'fa-money-bill-transfer', color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
                 ].map((stat, i) => (
                  <div key={i} className={`p-6 glass-panel rounded-3xl border-white/5 flex flex-col gap-6 relative overflow-hidden group ${stat.bg}`}>
                    <div className={`w-12 h-12 rounded-2xl bg-zinc-950/50 border border-white/5 flex items-center justify-center text-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                      <i className={`fa-solid ${stat.icon}`}></i>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                      <p className="text-2xl font-black text-white">{stat.value}</p>
                    </div>
                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color.replace('text', 'bg')}/5 blur-3xl -translate-y-1/2 translate-x-1/2`}></div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Infrastructure Nodes</h3>
                    <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Nominal</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                     {[
                       { name: 'Payment Capture API', status: 'Online', value: 'Sync: Active', color: 'text-emerald-500' },
                       { name: 'Withdrawal Processor', status: 'Ready', value: '$20 Min Enforcement', color: 'text-cyan-500' },
                       { name: 'Core Ledger Synchronizer', status: 'Synced', value: '100%', color: 'text-pink-500' },
                       { name: 'Admin Settlement Node', status: 'Secured', value: 'Encrypted', color: 'text-indigo-500' },
                     ].map((node, i) => (
                       <div key={i} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{node.name}</span>
                          <div className="text-right">
                             <p className={`text-[9px] font-black ${node.color} uppercase tracking-widest`}>{node.status}</p>
                             <p className="text-[8px] text-zinc-600 font-bold uppercase mt-0.5">{node.value}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-center items-center text-center space-y-6 bg-gradient-to-br from-cyan-600/5 to-transparent">
                   <div className="w-20 h-20 rounded-3xl bg-zinc-950/50 flex items-center justify-center text-3xl text-cyan-500 border border-white/5 shadow-2xl">
                      <i className="fa-solid fa-microchip"></i>
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">AI Reasoning Chain</h3>
                     <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed max-w-xs mx-auto">Gemini 3 Pro clusters are processing cross-modal data streams for real-time engagement monitoring.</p>
                   </div>
                   <div className="flex gap-2">
                      {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="w-1.5 h-6 bg-cyan-500/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">User Repository</h2>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Total Entity Count: {allUsers.length}</p>
                  </div>
                  <button 
                    onClick={() => { setEditingUser(null); setShowUserModal(true); }}
                    className="px-8 py-4 bg-cyan-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-cyan-600/30 active:scale-95 transition-all"
                  >
                    Inject New Entity
                  </button>
               </div>

               <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[9px] text-zinc-600 uppercase tracking-widest bg-white/[0.02]">
                          <th className="p-8 font-black">Identity</th>
                          <th className="p-8 font-black">Holdings</th>
                          <th className="p-8 font-black">Auth Status</th>
                          <th className="p-8 font-black text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px]">
                        {allUsers.map((u, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="p-8">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 overflow-hidden">
                                     <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random&color=fff`} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                     <p className="font-black text-white text-xs">{u.name}</p>
                                     <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{u.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="p-8">
                               <div className="flex flex-col gap-2">
                                  <span className="text-cyan-400 font-black flex items-center gap-2 text-xs"><i className="fa-solid fa-gem text-[10px]"></i> {u.diamonds.toLocaleString()}</span>
                                  <span className="text-emerald-500 font-black tracking-widest">${(u.diamonds / 100).toFixed(2)} USD Value</span>
                               </div>
                            </td>
                            <td className="p-8">
                               <div className="flex flex-col gap-2">
                                  <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit ${u.role === 'admin' ? 'bg-cyan-500/10 text-cyan-400' : u.role === 'doll' ? 'bg-pink-500/10 text-pink-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                    {u.role}
                                  </span>
                                  <span className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${u.status === 'banned' ? 'text-red-500' : 'text-emerald-500'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'banned' ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></div>
                                    {u.status}
                                  </span>
                               </div>
                            </td>
                            <td className="p-8">
                               <div className="flex items-center justify-end gap-3">
                                  <button onClick={() => { setGemTargetUser(u); setShowGemModal(true); }} className="w-10 h-10 rounded-xl bg-cyan-600/10 hover:bg-cyan-600 hover:text-white flex items-center justify-center text-cyan-400 transition-all border border-transparent" title="Manage Gems">
                                    <i className="fa-solid fa-gem text-[10px]"></i>
                                  </button>
                                  <button onClick={() => { setEditingUser(u); setShowUserModal(true); }} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-cyan-600/20 hover:text-cyan-400 flex items-center justify-center text-zinc-500 transition-all border border-transparent hover:border-cyan-500/30">
                                    <i className="fa-solid fa-pen text-[10px]"></i>
                                  </button>
                                  <button onClick={() => handleToggleUser(u.email)} className={`w-10 h-10 rounded-xl ${u.status === 'banned' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'} flex items-center justify-center transition-all border border-transparent`}>
                                    <i className={`fa-solid ${u.status === 'banned' ? 'fa-check' : 'fa-ban'} text-[10px]`}></i>
                                  </button>
                                  <button onClick={() => handleDeleteUser(u.email)} disabled={u.role === 'admin'} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-600/20 hover:text-red-500 flex items-center justify-center text-zinc-500 transition-all disabled:opacity-5 border border-transparent">
                                    <i className="fa-solid fa-trash text-[10px]"></i>
                                  </button>
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
             <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex flex-col gap-2 mb-8">
                   <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Treasury Operations</h2>
                   <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Global Platform Liquidity Protocol</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="glass-panel p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-950/50 flex items-center justify-center text-4xl text-indigo-400 border border-white/5 shadow-2xl">
                          <i className="fa-brands fa-paypal"></i>
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-widest">Admin Settlement</h3>
                        <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase italic">Master Payout Gateway (Live)</p>
                      </div>
                      <div className="mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Total Revenue Capture (Sales)</p>
                            <p className="text-5xl font-black text-white tracking-tighter">${platformStats.revenue.toLocaleString()}</p>
                         </div>
                         <button className="px-10 py-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/40 active:scale-95">Withdraw Revenue</button>
                      </div>
                      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full"></div>
                   </div>

                   <div className="glass-panel p-10 rounded-[3rem] border-white/5 space-y-10 bg-gradient-to-br from-pink-600/5 to-transparent shadow-2xl">
                      <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Platform Liabilities</h3>
                         <i className="fa-solid fa-vault text-zinc-800 text-xl"></i>
                      </div>
                      <div className="space-y-6">
                         <div className="flex justify-between items-center border-b border-white/5 pb-6">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Member Gem Liability</span>
                            <span className="text-2xl font-black text-cyan-400">${platformStats.liabilityUsd.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-white/5 pb-6">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">System Payout Buffer</span>
                            <span className="text-2xl font-black text-pink-400">$0.00</span>
                         </div>
                         <div className="flex justify-between items-center pt-4">
                            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em]">Net Operational Surplus</span>
                            <div className="text-right">
                               <p className="text-4xl font-black text-white tracking-tighter">${(platformStats.revenue - platformStats.totalPayouts).toLocaleString()}</p>
                               <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Ready for settlement</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Withdrawal Management</h3>
                   <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 text-[9px] text-zinc-600 uppercase tracking-widest bg-white/[0.02]">
                              <th className="p-8 font-black">User</th>
                              <th className="p-8 font-black">PayPal Email</th>
                              <th className="p-8 font-black">Amount</th>
                              <th className="p-8 font-black">Timestamp</th>
                              <th className="p-8 font-black">Status</th>
                            </tr>
                          </thead>
                          <tbody className="text-[10px]">
                            {allWithdrawals.length > 0 ? allWithdrawals.map((w, i) => (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="p-8 font-black text-white">{w.userName}</td>
                                <td className="p-8 text-zinc-400 font-mono">{w.paypalEmail}</td>
                                <td className="p-8 text-emerald-500 font-black">${w.amountUsd.toFixed(2)}</td>
                                <td className="p-8 text-zinc-500">{new Date(w.timestamp).toLocaleString()}</td>
                                <td className="p-8">
                                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[8px] font-black uppercase tracking-widest">{w.status}</span>
                                </td>
                              </tr>
                            )) : (
                              <tr><td colSpan={5} className="p-16 text-center text-zinc-600 font-bold uppercase tracking-widest">No withdrawal requests found</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Traffic Control Engine</h2>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Active Ad Slots: {ads.length}</p>
                  </div>
                  <button 
                    onClick={() => { setEditingAd(null); setShowAdModal(true); }}
                    className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/30 active:scale-95 transition-all"
                  >
                    Provision New Ad Slot
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {ads.map(ad => (
                    <div key={ad.id} className="glass-panel p-8 rounded-[3rem] border-white/5 flex flex-col gap-8 relative group overflow-hidden bg-black/40 hover:bg-black/60 transition-all shadow-2xl">
                       <div className="flex items-center justify-between z-10">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${ad.enabled ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/20' : 'bg-zinc-900 text-zinc-600 border border-white/5'}`}>
                             <i className="fa-solid fa-rectangle-ad"></i>
                          </div>
                          <div className="flex gap-3">
                             <button onClick={() => { setEditingAd(ad); setShowAdModal(true); }} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all"><i className="fa-solid fa-pen text-[10px]"></i></button>
                             <button onClick={() => handleDeleteAd(ad.id)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-600 flex items-center justify-center text-zinc-500 hover:text-white transition-all"><i className="fa-solid fa-trash text-[10px]"></i></button>
                          </div>
                       </div>
                       
                       <div className="z-10">
                          <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2 truncate">{ad.title}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-black px-2 py-1 bg-white/5 rounded-md border border-white/5">Slot: {ad.placement.replace('_', ' ')}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${ad.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{ad.enabled ? 'Live' : 'Paused'}</span>
                          </div>
                       </div>

                       <div className="aspect-video rounded-2xl overflow-hidden border border-white/5 bg-zinc-950/80 z-10 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
                          <img src={ad.imageUrl} className="w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity" alt="preview" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">View Visual Asset</span>
                             </div>
                          </div>
                       </div>

                       <div className={`absolute top-0 right-0 w-32 h-32 ${ad.enabled ? 'bg-cyan-500/10' : 'bg-red-500/10'} blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 transition-colors`}></div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'nodes' && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-500">
               <div className="relative">
                  <div className="absolute inset-0 bg-cyan-600/20 blur-[80px] rounded-full animate-pulse"></div>
                  <div className="w-32 h-32 rounded-[3rem] bg-zinc-950 border-4 border-cyan-500/30 flex items-center justify-center text-5xl text-cyan-500 relative z-10 shadow-2xl">
                    <i className="fa-solid fa-microchip"></i>
                  </div>
               </div>
               <div className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-[0.5em] text-white">Grid System Nominal</h3>
                  <p className="text-[10px] font-bold text-zinc-600 max-w-sm leading-loose uppercase tracking-widest">Global cluster monitoring active. Infrastructure shards operating at 99.99% efficiency. No anomalies detected in AI reasoning chains.</p>
               </div>
               
               <div className="flex flex-col gap-4 w-full max-w-xs">
                  <button 
                    onClick={handleWalletReset}
                    className="w-full py-4 bg-red-600/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-600/10 active:scale-95"
                  >
                    <i className="fa-solid fa-radiation mr-2"></i>
                    Purge & Reset All Wallets
                  </button>
               </div>

               <div className="flex gap-4">
                  {[1,2,3,4,5,6,7].map(i => (
                    <div key={i} className="w-2 h-10 bg-cyan-500/10 rounded-full flex items-end overflow-hidden border border-white/5">
                      <div className="w-full bg-cyan-500 animate-[move-gradient_2s_ease_infinite]" style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.2}s` }}></div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Gem Management Modal */}
      {showGemModal && gemTargetUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 font-mono">
           <div className="w-full max-w-md glass-panel p-10 rounded-[3.5rem] border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-cyan-600/10 to-transparent">
              <button onClick={() => setShowGemModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
              
              <div className="mb-10 text-center">
                 <div className="w-16 h-16 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-3xl text-cyan-400 mx-auto mb-4 shadow-[0_0_20px_rgba(8,145,178,0.3)]">
                    <i className="fa-solid fa-gem"></i>
                 </div>
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Manage Gems</h2>
                 <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Adjusting holdings for {gemTargetUser.name}</p>
              </div>

              <div className="space-y-6">
                 <div className="p-6 bg-black/40 rounded-2xl border border-white/5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Current Balance</span>
                       {/* Fix: replaced 'u' with 'gemTargetUser' */}
                       <span className="text-lg font-black text-white">{gemTargetUser.diamonds.toLocaleString()} <i className="fa-solid fa-gem text-cyan-400 text-xs ml-1"></i></span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-4">
                       <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Adjustment</span>
                       <span className={`text-lg font-black ${gemAdjustment >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {gemAdjustment >= 0 ? '+' : ''}{gemAdjustment}
                       </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-4">
                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">New Balance</span>
                       <span className="text-2xl font-black text-cyan-400">{Math.max(0, gemTargetUser.diamonds + gemAdjustment).toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Amount to Add/Subtract</label>
                    <input 
                       type="number"
                       value={gemAdjustment}
                       onChange={(e) => setGemAdjustment(parseInt(e.target.value) || 0)}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-xl font-black text-white focus:outline-none focus:border-cyan-500/50 text-center"
                       placeholder="e.g. 500"
                    />
                 </div>

                 <div className="grid grid-cols-3 gap-3">
                    {[100, 500, 1000].map(amt => (
                       <button 
                          key={amt}
                          onClick={() => setGemAdjustment(amt)}
                          className="py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black hover:bg-cyan-600 hover:text-white transition-all"
                       >
                          +{amt}
                       </button>
                    ))}
                 </div>

                 <button 
                    onClick={handleAdjustGems}
                    className="w-full py-5 bg-cyan-600 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-cyan-600/40 active:scale-95 transition-all mt-4"
                 >
                    APPLY ADJUSTMENT
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* User CRUD Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-lg glass-panel p-10 rounded-[3.5rem] border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-cyan-600/5 to-transparent">
              <button onClick={() => setShowUserModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
              <div className="mb-10 text-center sm:text-left">
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{editingUser ? 'Modify Entity' : 'Inject Entity'}</h2>
                 <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Direct Master-Database Access Protocol</p>
              </div>

              <form onSubmit={handleUpsertUser} className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Identity Display</label>
                      <input name="name" defaultValue={editingUser?.name || ''} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Master Email</label>
                      <input name="email" readOnly={!!editingUser} defaultValue={editingUser?.email || ''} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed" />
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Diamond Load</label>
                        <input name="diamonds" type="number" defaultValue={editingUser?.diamonds || 0} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Cash Balance ($)</label>
                        <input name="usd_balance" type="number" step="0.01" defaultValue={editingUser?.usd_balance || 0} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">System Role</label>
                        <div className="relative">
                          <select name="role" defaultValue={editingUser?.role || 'doll'} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer">
                             <option value="doll">Doll Entity</option>
                             <option value="mentor">Mentor Entity</option>
                             <option value="admin">System Master</option>
                          </select>
                          <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"></i>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Node Status</label>
                        <div className="relative">
                          <select name="status" defaultValue={editingUser?.status || 'active'} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer">
                             <option value="active">Operational</option>
                             <option value="banned">Quarantined</option>
                          </select>
                          <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"></i>
                        </div>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-cyan-600 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-cyan-600/40 active:scale-95 transition-all mt-6">COMMIT TRANSACTION</button>
              </form>
           </div>
        </div>
      )}

      {showAdModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-lg glass-panel p-10 rounded-[3.5rem] border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-emerald-600/5 to-transparent">
              <button onClick={() => setShowAdModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
              <div className="mb-10 text-center sm:text-left">
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{editingAd ? 'Modify Ad Logic' : 'Provision Ad Slot'}</h2>
                 <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Traffic Subsystem Dynamic Config</p>
              </div>

              <form onSubmit={handleUpsertAd} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Internal Title Reference</label>
                    <input name="title" defaultValue={editingAd?.title || ''} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Media Asset Endpoint (URL)</label>
                    <input name="imageUrl" defaultValue={editingAd?.imageUrl || ''} placeholder="https://cloud.assets.com/..." required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Redirection Payload / HTML Logic</label>
                    <textarea name="link" defaultValue={editingAd?.link || ''} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-[11px] text-emerald-400 font-mono focus:outline-none focus:border-emerald-500/50 h-32 resize-none shadow-inner leading-relaxed" placeholder="<div onclick='redirect(...)'>...</div>" />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Deployment Target</label>
                        <div className="relative">
                          <select name="placement" defaultValue={editingAd?.placement || 'under_header'} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer">
                             <option value="under_header">Header Banner</option>
                             <option value="before_publication">Pre-Feed Inset</option>
                             <option value="under_publication">Post-Feed Inset</option>
                             <option value="footer">Global Footer</option>
                          </select>
                          <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"></i>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 pt-6 px-4">
                       <div className="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" name="enabled" defaultChecked={editingAd?.enabled ?? true} className="w-5 h-5 accent-emerald-500 rounded border-white/10" />
                       </div>
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Status</label>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-emerald-600/40 active:scale-95 transition-all mt-6">SYNC TRAFFIC ENGINE</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
