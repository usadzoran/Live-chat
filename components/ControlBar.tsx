
import React from 'react';
import { StreamStatus } from '../types';

interface ControlBarProps {
  status: StreamStatus;
  isMicMuted: boolean;
  isCamOff: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleMic: () => void;
  onToggleCam: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({ 
  status, 
  isMicMuted, 
  isCamOff, 
  onStart, 
  onStop, 
  onToggleMic, 
  onToggleCam 
}) => {
  const isConnecting = status === StreamStatus.CONNECTING;
  const isLive = status === StreamStatus.LIVE;

  return (
    <div className="h-20 lg:h-24 flex items-center justify-between px-6 lg:px-10 glass-panel rounded-[2rem] lg:rounded-[3rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-3xl relative overflow-hidden group">
      
      {/* Decorative Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleMic}
          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
            isMicMuted 
              ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
              : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <i className={`fa-solid ${isMicMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-lg`}></i>
        </button>

        <button 
          onClick={onToggleCam}
          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
            isCamOff 
              ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
              : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <i className={`fa-solid ${isCamOff ? 'fa-video-slash' : 'fa-video'} text-lg`}></i>
        </button>
      </div>

      <div className="flex-1 flex justify-center max-w-[280px]">
        {!isLive && !isConnecting ? (
          <button 
            onClick={onStart}
            className="w-full h-12 lg:h-14 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs lg:text-sm shadow-[0_0_30px_rgba(219,39,119,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 group/btn overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
            <i className="fa-solid fa-play text-xs relative z-10"></i>
            <span className="relative z-10 tracking-[0.2em]">GO LIVE</span>
          </button>
        ) : (
          <button 
            onClick={onStop}
            disabled={isConnecting}
            className={`w-full h-12 lg:h-14 rounded-2xl font-black text-xs lg:text-sm transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl ${
              isConnecting 
                ? 'bg-zinc-900 text-zinc-600 border border-white/5 cursor-wait' 
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40'
            }`}
          >
            {isConnecting ? (
              <i className="fa-solid fa-circle-notch animate-spin"></i>
            ) : (
              <i className="fa-solid fa-stop text-xs"></i>
            )}
            <span className="tracking-[0.2em]">{isConnecting ? 'CONNECTING' : 'END SESSION'}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center bg-zinc-900/50 text-zinc-600 border border-white/5 hover:text-white hover:bg-zinc-800 transition-all">
          <i className="fa-solid fa-share-nodes text-lg"></i>
        </button>
        <button className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center bg-zinc-900/50 text-zinc-600 border border-white/5 hover:text-white hover:bg-zinc-800 transition-all">
          <i className="fa-solid fa-gear text-lg"></i>
        </button>
      </div>
    </div>
  );
};

export default ControlBar;
