
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
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Could not access camera for preview", err));
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [status]);

  return (
    <div className="flex-1 rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden glass-panel relative shadow-[0_0_100px_rgba(0,0,0,0.5)] group border border-white/5 flex flex-col bg-black">
      
      {/* Cinematic Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }}></div>

      {/* Top Overlay: Title & Stats */}
      <div className="absolute top-0 left-0 right-0 p-8 z-30 pointer-events-none flex justify-between items-start">
        <div className="max-w-md pointer-events-auto">
          {isIdle ? (
            <div className="relative group/input">
              <input 
                type="text" 
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Session Title..."
                className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white placeholder:text-zinc-700 focus:outline-none focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-2xl"
              />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
               <div className="px-6 py-3 bg-black/40 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-2xl inline-flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
                  <h1 className="text-lg font-black text-white tracking-tight uppercase italic">{title}</h1>
               </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end pointer-events-auto">
           <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-3xl rounded-xl border border-white/10 shadow-xl">
              <i className="fa-solid fa-eye text-pink-500 text-xs"></i>
              <span className="text-xs font-black text-white tabular-nums">{isLive ? '1.8K' : '0'}</span>
           </div>
           <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-3xl rounded-xl border border-white/10 shadow-xl">
              <i className="fa-solid fa-heart text-rose-500 text-xs"></i>
              <span className="text-xs font-black text-white tabular-nums">{isLive ? '12.4K' : '0'}</span>
           </div>
        </div>
      </div>

      {/* AI Listening Waveform */}
      {isLive && (
        <div className="absolute top-1/2 right-8 -translate-y-1/2 z-30 flex flex-col items-center gap-4 pointer-events-none">
           <div className="flex gap-1 items-center h-16">
             {[1,2,3,4,5,6,7,8].map(i => (
               <div key={i} className="w-1 bg-pink-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.5)]" 
                 style={{ 
                   height: `${30 + Math.random() * 70}%`, 
                   animationDuration: `${0.5 + Math.random()}s`,
                   opacity: 0.6 + Math.random() * 0.4 
                 }}
               ></div>
             ))}
           </div>
           <span className="text-[8px] font-black text-pink-500 uppercase tracking-[0.4em] rotate-90 origin-center translate-y-8">AI Companion Active</span>
        </div>
      )}

      {/* Placeholder State */}
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 overflow-hidden">
        {(status === StreamStatus.IDLE || isCamOff) && (
          <div className="flex flex-col items-center gap-8 text-center z-10 animate-in fade-in zoom-in duration-1000">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-600/20 blur-[60px] rounded-full animate-pulse"></div>
              <div className="w-32 h-32 rounded-[3rem] bg-zinc-900 flex items-center justify-center border border-white/5 relative z-10 shadow-2xl">
                <i className="fa-solid fa-video-slash text-5xl text-zinc-800"></i>
              </div>
            </div>
            <div>
              <p className="text-xl font-black text-white uppercase tracking-tighter mb-2">Feed Encrypted</p>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Go Live to Start Broadcasting</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-all duration-1000 ${status !== StreamStatus.IDLE && !isCamOff ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
      />

      {/* Bottom Information Overlay */}
      {!isIdle && (
        <div className="absolute bottom-8 left-8 right-8 z-30 flex justify-between items-end pointer-events-none">
           <div className="flex items-center gap-4 pointer-events-auto">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-pink-500 shadow-lg shadow-pink-500/20">
                 <img src="https://ui-avatars.com/api/?name=Admin&background=f472b6&color=fff" className="w-full h-full object-cover" alt="streamer" />
              </div>
              <div className="glass-panel px-5 py-3 rounded-2xl border-white/10 bg-black/20 backdrop-blur-3xl">
                 <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-0.5">Streamer Node</p>
                 <p className="text-sm font-black text-white tracking-tight">Master Admin</p>
              </div>
           </div>
           
           <div className="flex items-center gap-3 glass-panel px-4 py-3 rounded-2xl border-white/10 pointer-events-auto bg-black/20 backdrop-blur-3xl">
              <div className="flex flex-col items-end">
                 <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Resolution</p>
                 <p className="text-[10px] font-black text-white">1080p · 60FPS</p>
              </div>
              <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
              <i className="fa-solid fa-signal text-[10px] text-emerald-500"></i>
           </div>
        </div>
      )}
    </div>
  );
};

export default StreamView;
