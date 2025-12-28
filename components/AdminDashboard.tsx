
import React, { useState, useEffect } from 'react';
import { AdConfig } from '../types';
import { db } from '../services/databaseService';

interface AdminDashboardProps {
  totalRevenue: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ totalRevenue }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'moderation' | 'nodes' | 'ads' | 'treasury'>('overview');
  const [merchantId, setMerchantId] = useState('');
  const [isLive, setIsLive] = useState(false);
  
  // Sync merchant info from DB
  useEffect(() => {
    const fetchStats = async () => {
      const stats = await db.getPlatformStats();
      setMerchantId(stats.merchantId);
      setIsLive(stats.isLive);
    };
    fetchStats();
  }, []);

  const [ads, setAds] = useState<AdConfig[]>([
    { id: '1', placement: 'under_header', enabled: true, title: 'Luxury Watches', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80', link: '#' },
    { id: '2', placement: 'before_publication', enabled: false, title: 'Crypto Elite', imageUrl: '', link: '#' },
    { id: '3', placement: 'under_publication', enabled: true, title: 'Diamond Club', imageUrl: 'https://images.unsplash.com/photo-1588444833098-4205565e2482?auto=format&fit=crop&w=400&q=80', link: '#' },
    { id: '4', placement: 'footer', enabled: true, title: 'Private Jet Rentals', imageUrl: '', link: '#' },
  ]);

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, trend: '+12.5%', icon: 'fa-sack-dollar', color: 'text-emerald-400' },
    { label: 'Active Dolls', value: '124,052', trend: '+3.2%', icon: 'fa-user-astronaut', color: 'text-pink-400' },
    { label: 'Live Streams', value: '842', trend: '-1.4%', icon: 'fa-video', color: 'text-indigo-400' },
    { label: 'AI Latency', value: '42ms', trend: 'Stable', icon: 'fa-bolt', color: 'text-cyan-400' },
  ];

  const recentUsers = [
    { name: 'Crystal_Doll', role: 'Doll', joined: '2m ago', status: 'Live', balance: '$4,200' },
    { name: 'VIP_Morgan', role: 'Mentor', joined: '15m ago', status: 'Offline', balance: '$85,000' },
    { name: 'Digital_Eve', role: 'Doll', joined: '1h ago', status: 'Banned', balance: '$0' },
    { name: 'SugarKing99', role: 'Mentor', joined: '3h ago', status: 'Online', balance: '$12,450' },
  ];

  const navItems = [
    { id: 'overview', label: 'Command Center', icon: 'fa-chart-pie' },
    { id: 'users', label: 'User Directory', icon: 'fa-users-gear' },
    { id: 'treasury', label: 'Treasury (Fin)', icon: 'fa-vault' },
    { id: 'moderation', label: 'Moderation Q', icon: 'fa-user-shield' },
    { id: 'ads', label: 'Ad Management', icon: 'fa-rectangle-ad' },
    { id: 'nodes', label: 'AI Infrastructure', icon: 'fa-server' },
  ] as const;

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
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`}></div>
              <span className="hidden sm:inline text-[8px] font-black uppercase text-zinc-400">
                {isLive ? 'LIVE MODE' : 'SANDBOX MODE'}
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
                {stats.map((stat, i) => (
                  <div key={i} className="p-4 lg:p-6 glass-panel rounded-2xl border-white/5 flex flex-col gap-3 lg:gap-4 group hover:border-cyan-500/20 transition-all">
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center ${stat.color}`}>
                        <i className={`fa-solid ${stat.icon} text-xs lg:text-base`}></i>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded bg-zinc-900 ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.trend}
                      </span>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-0.5 lg:mb-1">{stat.label}</p>
                      <p className="text-lg lg:text-2xl font-black text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-panel rounded-3xl border-white/5 overflow-hidden">
                     <div className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <h3 className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-widest">Activity Log</h3>
                        <button className="text-[8px] text-cyan-500 font-bold uppercase tracking-widest hover:underline">Export</button>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead>
                            <tr className="border-b border-white/5 text-[8px] text-zinc-600 uppercase tracking-widest">
                              <th className="p-4 lg:p-6 font-black">Entity</th>
                              <th className="p-4 lg:p-6 font-black">Role</th>
                              <th className="p-4 lg:p-6 font-black">Status</th>
                              <th className="p-4 lg:p-6 font-black">Equity</th>
                            </tr>
                          </thead>
                          <tbody className="text-[9px] lg:text-[10px]">
                            {recentUsers.map((user, i) => (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <td className="p-4 lg:p-6 font-bold text-white">{user.name}</td>
                                <td className="p-4 lg:p-6 text-zinc-500 uppercase tracking-widest">{user.role}</td>
                                <td className="p-4 lg:p-6">
                                  <span className={`px-2 py-0.5 rounded uppercase text-[8px] font-black ${
                                    user.status === 'Live' ? 'bg-red-500/10 text-red-500' :
                                    user.status === 'Banned' ? 'bg-zinc-800 text-zinc-600 line-through' :
                                    'bg-green-500/10 text-green-500'
                                  }`}>
                                    {user.status}
                                  </span>
                                </td>
                                <td className="p-4 lg:p-6 font-black text-white group-hover:text-cyan-400 transition-colors">{user.balance}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'treasury' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
               <div className="flex flex-col gap-2">
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Platform Treasury</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">Merchant status for user diamond purchases</p>
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
                            {merchantId}
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
              </div>

              <div className="glass-panel p-10 rounded-[3rem] border-white/10 flex flex-col md:flex-row items-center justify-between gap-12">
                 <div className="flex-1 space-y-4 text-center md:text-left">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Treasury Liquidity</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed font-bold">
                       Current System Balance: <span className="text-white">${totalRevenue.toLocaleString()}</span>. All transactions are logged in the secure cloud database.
                    </p>
                 </div>
                 
                 <div className="shrink-0 flex flex-col gap-3">
                    <button className="px-12 py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-zinc-200 transition-all active:scale-95">
                       INITIATE SETTLEMENT
                    </button>
                    <p className="text-center text-[8px] font-black text-zinc-600 uppercase tracking-widest">Requires 2FA Approval</p>
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
