
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
    <div className="h-20 flex items-center justify-center gap-4 px-6 glass-panel rounded-3xl border border-zinc-800">
      <button 
        onClick={onToggleMic}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 border ${
          isMicMuted 
            ? 'bg-red-500/20 text-red-500 border-red-500/40 hover:bg-red-500/30' 
            : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
        }`}
      >
        <i className={`fa-solid ${isMicMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-lg`}></i>
      </button>

      <button 
        onClick={onToggleCam}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 border ${
          isCamOff 
            ? 'bg-red-500/20 text-red-500 border-red-500/40 hover:bg-red-500/30' 
            : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
        }`}
      >
        <i className={`fa-solid ${isCamOff ? 'fa-video-slash' : 'fa-video'} text-lg`}></i>
      </button>

      <div className="h-8 w-[1px] bg-zinc-800 mx-4"></div>

      {!isLive && !isConnecting ? (
        <button 
          onClick={onStart}
          className="px-8 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-3 active:scale-95"
        >
          <i className="fa-solid fa-play text-xs"></i>
          GO LIVE
        </button>
      ) : (
        <button 
          onClick={onStop}
          disabled={isConnecting}
          className={`px-8 h-12 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center gap-3 active:scale-95 ${
            isConnecting 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
              : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
          }`}
        >
          {isConnecting ? (
            <i className="fa-solid fa-circle-notch animate-spin"></i>
          ) : (
            <i className="fa-solid fa-stop text-xs"></i>
          )}
          {isConnecting ? 'CONNECTING' : 'END STREAM'}
        </button>
      )}

      <div className="h-8 w-[1px] bg-zinc-800 mx-4"></div>

      <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-all">
        <i className="fa-solid fa-gear text-lg"></i>
      </button>

      <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-all">
        <i className="fa-solid fa-share-nodes text-lg"></i>
      </button>
    </div>
  );
};

export default ControlBar;
