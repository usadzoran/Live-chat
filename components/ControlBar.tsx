
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
    <div className="h-16 md:h-20 flex items-center justify-center gap-2 md:gap-4 px-3 md:px-6 glass-panel rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl">
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleMic}
          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-200 border ${
            isMicMuted 
              ? 'bg-red-500/20 text-red-500 border-red-500/40' 
              : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800'
          }`}
        >
          <i className={`fa-solid ${isMicMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-sm md:text-lg`}></i>
        </button>

        <button 
          onClick={onToggleCam}
          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-200 border ${
            isCamOff 
              ? 'bg-red-500/20 text-red-500 border-red-500/40' 
              : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800'
          }`}
        >
          <i className={`fa-solid ${isCamOff ? 'fa-video-slash' : 'fa-video'} text-sm md:text-lg`}></i>
        </button>
      </div>

      <div className="h-6 w-[1px] bg-zinc-800 mx-1 md:mx-2"></div>

      <div className="flex-1 max-w-[140px] md:max-w-none">
        {!isLive && !isConnecting ? (
          <button 
            onClick={onStart}
            className="w-full h-10 md:h-12 rounded-xl md:rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-black text-[10px] md:text-sm shadow-xl shadow-pink-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap px-2"
          >
            <i className="fa-solid fa-play text-[8px] md:text-xs"></i>
            GO LIVE
          </button>
        ) : (
          <button 
            onClick={onStop}
            disabled={isConnecting}
            className={`w-full h-10 md:h-12 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${
              isConnecting 
                ? 'bg-zinc-900 text-zinc-600 border border-white/5' 
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
            }`}
          >
            {isConnecting ? (
              <i className="fa-solid fa-circle-notch animate-spin"></i>
            ) : (
              <i className="fa-solid fa-stop text-[8px] md:text-xs"></i>
            )}
            {isConnecting ? 'CONNECT...' : 'STOP'}
          </button>
        )}
      </div>

      <div className="h-6 w-[1px] bg-zinc-800 mx-1 md:mx-2"></div>

      <button className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center bg-zinc-900 text-zinc-600 border border-white/5">
        <i className="fa-solid fa-gear text-sm md:text-lg"></i>
      </button>
    </div>
  );
};

export default ControlBar;
