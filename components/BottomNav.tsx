
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
    { id: 'messages', label: 'Messages', icon: 'fa-paper-plane' },
    { id: 'profile', label: 'Profile', icon: 'fa-user' },
  ] as const;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-lg">
      <div className="glass-panel py-3 px-6 rounded-[2.5rem] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          // Fix: Use 'in' operator to safely check for the 'primary' property on the union type of navItems
          if ('primary' in item && item.primary) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative -mt-8 flex flex-col items-center group"
              >
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? 'stream-gradient text-white shadow-[0_0_30px_rgba(168,85,247,0.6)] scale-110' 
                    : 'bg-zinc-800 text-zinc-400 hover:text-white shadow-xl group-hover:scale-105'
                  }
                `}>
                  <i className={`fa-solid ${item.icon} text-xl`}></i>
                </div>
                <span className={`
                  mt-2 text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300
                  ${isActive ? 'text-indigo-400' : 'text-zinc-600'}
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
              className="relative flex flex-col items-center gap-1 group py-1 min-w-[50px]"
            >
              <div className={`
                w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300
                ${isActive 
                  ? 'text-white' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }
              `}>
                <i className={`fa-solid ${item.icon} text-sm`}></i>
              </div>
              <span className={`
                text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300
                ${isActive ? 'text-indigo-400 opacity-100' : 'text-zinc-600 opacity-60 group-hover:opacity-100'}
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
