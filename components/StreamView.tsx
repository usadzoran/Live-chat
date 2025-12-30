
import React, { useEffect, useRef } from 'react';
import { StreamStatus } from '../types';

interface StreamViewProps {
  status: StreamStatus;
  isCamOff: boolean;
  title: string;
  onTitleChange: (newTitle: string) => void;
}

const StreamView: React.FC<StreamViewProps> = ({ status, isCamOff, title, onTitleChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isLive = status === StreamStatus.LIVE;
  const isIdle = status === StreamStatus.IDLE;

  useEffect(() => {
    if (status === StreamStatus.LIVE || status === StreamStatus.CONNECTING) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(err => console.error("Camera access failed", err));
    } else if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  }, [status]);

  return (
    <div className="flex-1 rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden glass-panel relative shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col bg-black border border-white/5 group">
      {/* Cinematic CRT/Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03] overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }}></div>
      </div>

      {/* Top Overlays */}
      <div className="absolute top-0 inset-x-0 p-6 lg:p-10 z-30 flex justify-between items-start pointer-events-none">
        <div className="max-w-md pointer-events-auto">
          {isIdle ? (
            <input 
              type="text" value={title} onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Session Title..."
              className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-4 text-lg font-black text-white focus:outline-none focus:border-pink-500/50 shadow-2xl transition-all"
            />
          ) : (
            <div className="flex items-center gap-4 px-6 py-3 bg-black/50 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-top-4 duration-500">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
              <h1 className="text-sm font-black text-white uppercase tracking-tighter truncate max-w-[200px]">{title}</h1>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pointer-events-auto">
          <div className="px-4 py-2 bg-black/50 backdrop-blur-3xl rounded-xl border border-white/10 flex items-center gap-3 shadow-xl">
            <i className="fa-solid fa-eye text-pink-500 text-[10px]"></i>
            <span className="text-[10px] font-black text-white">{isLive ? '1.4K' : '0'}</span>
          </div>
          <div className="px-4 py-2 bg-black/50 backdrop-blur-3xl rounded-xl border border-white/10 flex items-center gap-3 shadow-xl">
            <i className="fa-solid fa-heart text-rose-500 text-[10px]"></i>
            <span className="text-[10px] font-black text-white">{isLive ? '12.8K' : '0'}</span>
          </div>
        </div>
      </div>

      {/* AI Visualizer Side Tab */}
      {isLive && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 opacity-60">
          <div className="flex gap-1 h-32 items-center">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-1 bg-pink-500 rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDuration: `${0.5 + Math.random()}s` }}></div>
            ))}
          </div>
          <p className="text-[7px] font-black text-pink-500 uppercase tracking-[0.4em] rotate-90 whitespace-nowrap">Neural Core Active</p>
        </div>
      )}

      {/* Main Video Element */}
      <video
        ref={videoRef} autoPlay playsInline muted
        className={`w-full h-full object-cover transition-all duration-1000 ${isIdle || isCamOff ? 'opacity-0 scale-110 blur-2xl' : 'opacity-100 scale-100'}`}
      />

      {/* Center Placeholders */}
      {(isIdle || isCamOff) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 animate-in fade-in zoom-in duration-700">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-pink-500/10 blur-[60px] rounded-full animate-pulse"></div>
            <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-[3.5rem] bg-zinc-900/60 flex items-center justify-center border border-white/10 shadow-inner relative z-10">
              <i className={`fa-solid ${isIdle ? 'fa-clapperboard' : 'fa-video-slash'} text-5xl lg:text-7xl text-zinc-800`}></i>
            </div>
            {isLive && isCamOff && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-red-600 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-xl whitespace-nowrap">
                Privacy Active
              </div>
            )}
          </div>
          <p className="text-xl lg:text-3xl font-black text-white uppercase tracking-tighter mb-1">{isIdle ? 'Ready to Go Live' : 'Camera Feed Paused'}</p>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">{isIdle ? 'Configure your session below' : 'Viewers see your avatar'}</p>
        </div>
      )}

      {/* Bottom Profile Badge */}
      {!isIdle && (
        <div className="absolute bottom-8 left-8 right-8 z-30 flex justify-between items-end pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-pink-500 shadow-2xl">
              <img src="https://ui-avatars.com/api/?name=Admin&background=f472b6&color=fff" className="w-full h-full object-cover" />
            </div>
            <div className="px-5 py-2.5 bg-black/40 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-2xl">
              <p className="text-[9px] font-black text-pink-500 uppercase tracking-widest mb-0.5">Primary Node</p>
              <p className="text-sm font-black text-white">System Master</p>
            </div>
          </div>
          
          <div className="px-5 py-4 bg-black/40 backdrop-blur-3xl rounded-2xl border border-white/10 flex items-center gap-4 pointer-events-auto">
            <div className="text-right">
              <p className="text-[10px] font-black text-white">1080p60</p>
              <div className="flex gap-0.5 justify-end mt-1">
                {[1,2,3,4,5].map(i => <div key={i} className={`w-0.5 h-2 rounded-full ${i <= 4 ? 'bg-emerald-500' : 'bg-zinc-800'}`}></div>)}
              </div>
            </div>
            <div className="w-[1px] h-6 bg-white/10"></div>
            <i className="fa-solid fa-satellite-dish text-emerald-500 text-sm animate-pulse"></i>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamView;
