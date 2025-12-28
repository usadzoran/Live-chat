
import React, { useState } from 'react';
import { ViewType } from '../types';

interface HeaderProps {
  user: { name: string; email: string } | null;
  isAdmin?: boolean;
  onLogout: () => void;
  onNavigate: (view: ViewType) => void;
}

const Header: React.FC<HeaderProps> = ({ user, isAdmin, onLogout, onNavigate }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className={`h-16 flex items-center justify-between px-6 glass-panel border-b ${isAdmin ? 'border-cyan-500/20' : 'border-zinc-800'} z-10 relative`}>
      <div className="flex items-center gap-8">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onNavigate('feed')}
        >
          <div className={`w-10 h-10 rounded-2xl ${isAdmin ? 'bg-cyan-600 shadow-cyan-500/20' : 'stream-gradient shadow-pink-500/20'} flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
            <i className={`fa-solid ${isAdmin ? 'fa-shield-halved' : 'fa-face-grin-stars'} text-white text-xl`}></i>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl tracking-tighter leading-none">
              <span className="font-light text-zinc-400">My</span>
              <span className="font-black text-white ml-1">Doll</span>
            </h1>
            <p className={`text-[8px] ${isAdmin ? 'text-cyan-500' : 'text-pink-500'} uppercase tracking-[0.3em] font-black mt-1`}>
              {isAdmin ? 'Admin Console' : 'Elite Social'}
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => onNavigate('feed')}
            className="text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-[0.2em] transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-compass"></i>
            Explore Feed
          </button>
          {isAdmin && (
            <button 
              onClick={() => onNavigate('admin')}
              className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-[0.2em] transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-terminal"></i>
              Dashboard
            </button>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {!isAdmin && (
          <button 
            onClick={() => onNavigate('messages')}
            className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <i className="fa-solid fa-bell"></i>
            <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border border-zinc-950"></span>
          </button>
        )}

        <div className="h-8 w-[1px] bg-zinc-800 mx-2"></div>
        
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:bg-white/5 p-1 pr-3 rounded-full transition-colors group"
          >
            <div className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center overflow-hidden">
               <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=${isAdmin ? '0891b2' : 'f472b6'}&color=fff`} alt="avatar" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-white leading-none">{user?.name || 'Anonymous'}</p>
              <p className={`text-[10px] ${isAdmin ? 'text-cyan-500' : 'text-zinc-500'} leading-none mt-1 uppercase font-black tracking-tighter`}>
                {isAdmin ? 'System Master' : 'Creator'}
              </p>
            </div>
            <i className={`fa-solid fa-chevron-down text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}></i>
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-48 glass-panel rounded-2xl border border-zinc-800 shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-zinc-800 bg-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Signed in as</p>
                  <p className="text-xs font-bold text-white truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  {!isAdmin && (
                    <button 
                      onClick={() => { onNavigate('profile'); setShowDropdown(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <i className="fa-solid fa-user text-zinc-600"></i> Profile
                    </button>
                  )}
                  {isAdmin && (
                    <button 
                      onClick={() => { onNavigate('admin'); setShowDropdown(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors"
                    >
                      <i className="fa-solid fa-lock text-cyan-600"></i> Dashboard
                    </button>
                  )}
                  <div className="h-[1px] bg-zinc-800 my-1 mx-2"></div>
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
