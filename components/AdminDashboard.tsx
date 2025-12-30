import React, { useState, useEffect } from 'react';
import { AdConfig } from '../types';
import { api, UserDB } from '../services/databaseService';

interface AdminDashboardProps {
  totalRevenue: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ totalRevenue }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'ads' | 'treasury' | 'nodes'>('overview');
  const [platformStats, setPlatformStats] = useState<any>({ revenue: 0, totalPayouts: 0, userCount: 0, liabilityUsd: 0 });
  const [allUsers, setAllUsers] = useState<UserDB[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNuking, setIsNuking] = useState(false);
  
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [stats, users, withdrawals] = await Promise.all([
        api.getPlatformStats(),
        api.getAllUsers(),
        api.getAllWithdrawals()
      ]);
      setPlatformStats(stats);
      setAllUsers(users);
      setAllWithdrawals(withdrawals);
      setError(null);
    } catch (e: any) {
      console.error("Dashboard refresh failed", e);
      setError(e.message || "فشلت المزامنة مع السحابة.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNuke = async () => {
    if (!window.confirm("تحذير: أنت على وشك حذف جميع البيانات (المستخدمين، المنشورات، المعاملات) نهائياً! هل أنت متأكد؟")) return;
    
    setIsNuking(true);
    const res = await api.clearAllData();
    alert(res.message);
    setIsNuking(false);
    refreshData();
  };

  const navItems = [
    { id: 'overview', label: 'Command Center', icon: 'fa-chart-pie' },
    { id: 'users', label: 'User Repository', icon: 'fa-users-gear' },
    { id: 'treasury', label: 'Treasury & Sales', icon: 'fa-vault' },
    { id: 'ads', label: 'Ad Engine', icon: 'fa-rectangle-ad' },
    { id: 'nodes', label: 'Infrastructure', icon: 'fa-server' },
  ] as const;

  return (
    <div className="h-full w-full bg-[#050505] flex flex-col lg:flex-row overflow-hidden text-zinc-300 font-mono selection:bg-cyan-500/30">
      
      {/* Sidebar */}
      <aside className={`fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl lg:relative lg:flex lg:z-0 lg:bg-black/40 lg:w-72 border-r border-white/5 flex-col shrink-0 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
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

        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/5 text-zinc-500'}`}>
              <i className={`fa-solid ${item.icon} text-sm w-6`}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-white/5 px-6 lg:px-10 flex items-center justify-between bg-black/20 backdrop-blur-xl shrink-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400"><i className="fa-solid fa-bars"></i></button>
            <h1 className="text-lg font-black text-white uppercase italic tracking-tighter">System Navigation / {activeTab}</h1>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">Cloud Profit</span>
                <span className="text-sm font-black text-emerald-400">${platformStats.revenue.toFixed(2)}</span>
             </div>
             <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
                <i className={`fa-solid ${error ? 'fa-triangle-exclamation text-red-500' : 'fa-user-shield text-cyan-500'} text-xs`}></i>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Admin Control</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 hide-scrollbar">
          {isLoading && !allUsers.length ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
               <i className="fa-solid fa-circle-notch animate-spin text-3xl text-cyan-500 mb-4"></i>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Syncing with cloud...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     <div className="p-6 glass-panel rounded-3xl border-white/5 bg-emerald-500/5 flex flex-col gap-4">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Platform Sales</p>
                        <p className="text-2xl font-black text-white">${platformStats.revenue.toFixed(2)}</p>
                     </div>
                     <div className="p-6 glass-panel rounded-3xl border-white/5 bg-cyan-500/5 flex flex-col gap-4">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Member Count</p>
                        <p className="text-2xl font-black text-white">{platformStats.userCount}</p>
                     </div>
                     <div className="p-6 glass-panel rounded-3xl border-white/5 bg-pink-500/5 flex flex-col gap-4">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Doll Entities</p>
                        <p className="text-2xl font-black text-white">{platformStats.dollCount}</p>
                     </div>
                     <div className="p-6 glass-panel rounded-3xl border-white/5 bg-indigo-500/5 flex flex-col gap-4">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Payouts</p>
                        <p className="text-2xl font-black text-white">${platformStats.totalPayouts.toFixed(2)}</p>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'nodes' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                   <div className="glass-panel p-8 rounded-[3rem] border border-red-500/20 bg-red-500/5 space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg">
                            <i className="fa-solid fa-triangle-exclamation text-white"></i>
                         </div>
                         <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-tighter">Danger Zone: Project Reset</h2>
                            <p className="text-[9px] text-red-400 font-black uppercase tracking-widest">Administrative Factory Reset Protocol</p>
                         </div>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                         سيقوم هذا الخيار بمسح كافة البيانات من Firestore بالكامل. هذا الإجراء غير قابل للتراجع وسيتم تصفير كافة الحسابات، الأرباح، المنشورات، وسجلات العملات.
                      </p>
                      <button 
                        onClick={handleNuke}
                        disabled={isNuking}
                        className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-red-600/30 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
                      >
                        {isNuking ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-trash-can"></i>}
                        FACTORY RESET DATABASE
                      </button>
                   </div>

                   <div className="glass-panel p-8 rounded-[3rem] border-white/5 bg-zinc-900/40 space-y-6">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">System Nodes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
                            <span className="text-[10px] text-zinc-500 uppercase font-black">Firestore Cluster</span>
                            <span className="text-[10px] font-black text-emerald-500">CONNECTED</span>
                         </div>
                         <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
                            <span className="text-[10px] text-zinc-500 uppercase font-black">Media Storage</span>
                            <span className="text-[10px] font-black text-cyan-500">OPERATIONAL</span>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'treasury' && (
                <div className="space-y-10">
                   <div className="glass-panel p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent flex flex-col sm:flex-row justify-between items-center gap-8">
                      <div className="space-y-2 text-center sm:text-left">
                        <h2 className="text-4xl font-black text-white tracking-tighter">${platformStats.revenue.toLocaleString()}</h2>
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Cloud Treasury Value</p>
                      </div>
                      <button className="px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/30">Initiate Transfer</button>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Transaction Ledger</h3>
                      <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-white/5 text-[9px] text-zinc-600 uppercase tracking-widest bg-white/[0.02]">
                                <th className="p-8">Recipient</th>
                                <th className="p-8">Method</th>
                                <th className="p-8">Amount</th>
                                <th className="p-8">Node Status</th>
                              </tr>
                            </thead>
                            <tbody className="text-[10px]">
                              {allWithdrawals.length ? allWithdrawals.map((w, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                  <td className="p-8 font-black text-white">{w.userName}</td>
                                  <td className="p-8 text-zinc-400 font-mono">{w.paypalEmail}</td>
                                  <td className="p-8 text-emerald-500 font-black">${w.amountUsd.toFixed(2)}</td>
                                  <td className="p-8">
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[8px] font-black uppercase">Completed</span>
                                  </td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan={4} className="p-12 text-center text-zinc-700 font-black uppercase tracking-widest">No cloud records found</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Member Repository</h3>
                  <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5 text-[9px] text-zinc-600 uppercase tracking-widest bg-white/[0.02]">
                            <th className="p-8">Identity</th>
                            <th className="p-8">Permissions</th>
                            <th className="p-8">Vault</th>
                            <th className="p-8">Security</th>
                            <th className="p-8">Command</th>
                          </tr>
                        </thead>
                        <tbody className="text-[10px]">
                          {allUsers.map((u, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="p-8">
                                <div className="flex items-center gap-3">
                                  <img src={u.avatar} className="w-8 h-8 rounded-lg" alt="" />
                                  <div>
                                    <p className="font-black text-white">{u.name}</p>
                                    <p className="text-[8px] text-zinc-500">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-8">
                                <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${u.role === 'admin' ? 'bg-cyan-500/10 text-cyan-500' : 'bg-pink-500/10 text-pink-500'}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-8 font-black text-cyan-400">{u.diamonds.toLocaleString()}</td>
                              <td className="p-8">
                                <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${u.status === 'banned' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                  {u.status}
                                </span>
                              </td>
                              <td className="p-8">
                                <button onClick={() => api.toggleUserStatus(u.uid).then(refreshData)} className="p-2 hover:text-white transition-colors">
                                  <i className={`fa-solid ${u.status === 'banned' ? 'fa-user-check text-emerald-500' : 'fa-user-slash text-red-500'}`}></i>
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
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;