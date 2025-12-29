
import React, { useState, useEffect } from 'react';
import { AdConfig } from '../types';
import { db, UserDB } from '../services/databaseService';

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
  
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [stats, users, withdrawals] = await Promise.all([
        db.getPlatformStats(),
        db.getAllUsers(),
        db.getAllWithdrawals()
      ]);
      setPlatformStats(stats);
      setAllUsers(users);
      setAllWithdrawals(withdrawals);
      setError(null);
    } catch (e: any) {
      console.error("Dashboard refresh failed", e);
      setError(e.message || "فشلت المزامنة مع السحابة. تحقق من الأذونات.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

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
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Wahab Fresh</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 hide-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error} - تأكد من تحديث Security Rules في Firebase!
            </div>
          )}

          {isLoading && !allUsers.length ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
               <i className="fa-solid fa-circle-notch animate-spin text-3xl text-cyan-500 mb-4"></i>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">جاري الاتصال بـ Cloud Treasury...</p>
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
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Members Debt (Gems)</p>
                        <p className="text-2xl font-black text-white">{(platformStats.liabilityUsd * 100).toLocaleString()}</p>
                     </div>
                     <div className="p-6 glass-panel rounded-3xl border-white/5 bg-pink-500/5 flex flex-col gap-4">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Entities</p>
                        <p className="text-2xl font-black text-white">{platformStats.userCount}</p>
                     </div>
                     <div className="p-6 glass-panel rounded-3xl border-white/5 bg-indigo-500/5 flex flex-col gap-4">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Payouts</p>
                        <p className="text-2xl font-black text-white">${platformStats.totalPayouts.toFixed(2)}</p>
                     </div>
                  </div>

                  <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
                     <h3 className="text-xs font-black text-white uppercase tracking-widest">Infrastructure Status</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between">
                           <span className="text-[10px] text-zinc-500 uppercase">Firestore DB</span>
                           <span className={`text-[10px] font-black ${error ? 'text-red-500' : 'text-emerald-500'}`}>{error ? 'ERROR' : 'CONNECTED'}</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between">
                           <span className="text-[10px] text-zinc-500 uppercase">PayPal API</span>
                           <span className="text-[10px] text-cyan-500 font-black">ACTIVE</span>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'treasury' && (
                <div className="space-y-10">
                   <div className="glass-panel p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent flex flex-col sm:flex-row justify-between items-center gap-8">
                      <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white tracking-tighter">${platformStats.revenue.toLocaleString()}</h2>
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">إجمالي مبيعات الجواهر (Real-time)</p>
                      </div>
                      <button className="px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/30">Transfer to Private Account</button>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">سجل السحوبات والتحويلات</h3>
                      <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-white/5 text-[9px] text-zinc-600 uppercase tracking-widest bg-white/[0.02]">
                                <th className="p-8">المستخدم</th>
                                <th className="p-8">PayPal Email</th>
                                <th className="p-8">المبلغ</th>
                                <th className="p-8">الحالة</th>
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
                                  <td colSpan={4} className="p-12 text-center text-zinc-700 font-black uppercase tracking-widest">لا توجد سجلات سحب حالياً</td>
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
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">قاعدة بيانات المستخدمين</h3>
                  <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5 text-[9px] text-zinc-600 uppercase tracking-widest bg-white/[0.02]">
                            <th className="p-8">المستخدم</th>
                            <th className="p-8">الدور</th>
                            <th className="p-8">الجواهر</th>
                            <th className="p-8">الحالة</th>
                            <th className="p-8">إجراءات</th>
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
                                <button onClick={() => db.toggleUserStatus(u.email).then(refreshData)} className="p-2 hover:text-white transition-colors">
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
