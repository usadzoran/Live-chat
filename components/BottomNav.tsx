
import React from 'react';
import { ViewType } from '../types';

interface BottomNavProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { id: 'feed', label: 'Explore', icon: 'fa-compass' },
    { id: 'discovery', label: 'Like Me', icon: 'fa-fire' },
    { id: 'live', label: 'Live', icon: 'fa-video', primary: true },
    { id: 'store', label: 'Shop', icon: 'fa-gem' },
    { id: 'profile', label: 'Account', icon: 'fa-user' },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] pb-safe px-3 md:px-0 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg">
      <div className="glass-panel mb-3 md:mb-0 py-2.5 px-4 md:px-8 rounded-[2rem] md:rounded-[2.5rem] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          if ('primary' in item && item.primary) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative -mt-10 md:-mt-12 flex flex-col items-center group transition-transform active:scale-90"
              >
                <div className={`
                  w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? 'stream-gradient text-white shadow-[0_0_30px_rgba(244,114,182,0.6)] scale-110' 
                    : 'bg-zinc-800 text-zinc-500 hover:text-white shadow-xl group-hover:scale-105 border border-white/5'
                  }
                `}>
                  <i className={`fa-solid ${item.icon} text-xl md:text-2xl`}></i>
                </div>
                <span className={`
                  mt-1 text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all duration-300
                  ${isActive ? 'text-pink-500' : 'text-zinc-600'}
                `}>
                  {item.label}
                </span>
              </button>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center gap-1 group py-1 min-w-[50px] active:scale-95 transition-transform"
            >
              <div className={`
                w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-300
                ${isActive 
                  ? 'text-white' 
                  : 'text-zinc-600 hover:text-zinc-400'
                }
              `}>
                <i className={`fa-solid ${item.icon} text-sm md:text-lg`}></i>
              </div>
              <span className={`
                text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all duration-300
                ${isActive ? 'text-pink-500' : 'text-zinc-700'}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
