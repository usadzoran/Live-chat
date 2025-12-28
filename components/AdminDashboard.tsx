
import React, { useState } from 'react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'moderation' | 'nodes'>('overview');

  const stats = [
    { label: 'Total Revenue', value: '$842,500', trend: '+12.5%', icon: 'fa-sack-dollar', color: 'text-emerald-400' },
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

  return (
    <div className="h-full w-full bg-[#050505] flex flex-col overflow-hidden text-zinc-300 font-mono">
      {/* Admin Sidebar */}
      <div className="flex h-full">
        <aside className="w-64 border-r border-white/5 bg-black/40 flex flex-col">
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
            {[
              { id: 'overview', label: 'Command Center', icon: 'fa-chart-pie' },
              { id: 'users', label: 'User Directory', icon: 'fa-users-gear' },
              { id: 'moderation', label: 'Moderation Q', icon: 'fa-user-shield' },
              { id: 'nodes', label: 'AI Infrastructure', icon: 'fa-server' },
            ].map(item => (
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
          <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Path:</span>
              <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Root / {activeTab}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-[8px] font-black uppercase text-zinc-400">System Nominal</span>
              </div>
              <button className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                <i className="fa-solid fa-bell text-xs"></i>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 hide-scrollbar">
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 bg-cyan-500/10 p-4 border border-cyan-500/20 rounded-2xl">
                   <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white">
                      <i className="fa-solid fa-vampire text-xl"></i>
                   </div>
                   <div>
                      <h2 className="text-sm font-black text-white uppercase tracking-widest">Welcome back, Wahab Fresh</h2>
                      <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Master Node Status: Online</p>
                   </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="p-6 glass-panel rounded-2xl border-white/5 flex flex-col gap-4 group hover:border-cyan-500/20 transition-all">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center ${stat.color}`}>
                          <i className={`fa-solid ${stat.icon}`}></i>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded bg-zinc-900 ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {stat.trend}
                        </span>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-white">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Dashboard Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel rounded-3xl border-white/5 overflow-hidden">
                       <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                          <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Recent Activity Log</h3>
                          <button className="text-[8px] text-cyan-500 font-bold uppercase tracking-widest hover:underline">Download CSV</button>
                       </div>
                       <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-white/5 text-[8px] text-zinc-600 uppercase tracking-widest">
                                <th className="p-6 font-black">Entity</th>
                                <th className="p-6 font-black">Role</th>
                                <th className="p-6 font-black">Timestamp</th>
                                <th className="p-6 font-black">Status</th>
                                <th className="p-6 font-black">Equity</th>
                              </tr>
                            </thead>
                            <tbody className="text-[10px]">
                              {recentUsers.map((user, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                  <td className="p-6 font-bold text-white">{user.name}</td>
                                  <td className="p-6 text-zinc-500 uppercase tracking-widest">{user.role}</td>
                                  <td className="p-6 text-zinc-600">{user.joined}</td>
                                  <td className="p-6">
                                    <span className={`px-2 py-0.5 rounded uppercase text-[8px] font-black ${
                                      user.status === 'Live' ? 'bg-red-500/10 text-red-500' :
                                      user.status === 'Banned' ? 'bg-zinc-800 text-zinc-600 line-through' :
                                      'bg-green-500/10 text-green-500'
                                    }`}>
                                      {user.status}
                                    </span>
                                  </td>
                                  <td className="p-6 font-black text-white group-hover:text-cyan-400 transition-colors">{user.balance}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-3xl border-white/5">
                       <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">AI Node Status</h3>
                       <div className="space-y-6">
                         {[
                           { name: 'Gemini-2.5-Flash', load: '24%', status: 'Stable' },
                           { name: 'Veo-3.1-Fast', load: '89%', status: 'Warning' },
                           { name: 'Realtime-Voice-A', load: '45%', status: 'Stable' },
                         ].map((node, i) => (
                           <div key={i} className="space-y-2">
                             <div className="flex justify-between items-end">
                               <p className="text-[10px] font-bold text-zinc-400">{node.name}</p>
                               <p className={`text-[8px] font-black uppercase ${node.status === 'Stable' ? 'text-green-500' : 'text-amber-500'}`}>{node.status}</p>
                             </div>
                             <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                               <div className={`h-full transition-all duration-1000 ${node.status === 'Stable' ? 'bg-cyan-500' : 'bg-amber-500'}`} style={{ width: node.load }}></div>
                             </div>
                           </div>
                         ))}
                       </div>
                    </div>

                    <div className="p-6 bg-cyan-600/5 border border-cyan-500/20 rounded-3xl relative overflow-hidden group">
                       <div className="relative z-10">
                         <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Master Broadcast</h3>
                         <p className="text-[9px] text-zinc-500 mb-4 leading-relaxed">Send a global announcement to all active Dolls and Mentors.</p>
                         <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-cyan-600/20 active:scale-95">
                           OPEN COMMAND CONSOLE
                         </button>
                       </div>
                       <i className="fa-solid fa-bullhorn absolute -bottom-4 -right-4 text-6xl text-cyan-500/10 transition-transform group-hover:scale-110"></i>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'overview' && (
              <div className="h-full flex flex-col items-center justify-center opacity-40 text-center space-y-4">
                 <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                    <i className="fa-solid fa-screwdriver-wrench text-xl text-zinc-600"></i>
                 </div>
                 <h2 className="text-sm font-black text-white uppercase tracking-widest">{activeTab} system pending</h2>
                 <p className="text-[10px] max-w-xs leading-relaxed">This module is currently in the sync phase. Real-time data will populate once the next block is confirmed.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
