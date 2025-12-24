
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
    <div className="flex-1 rounded-3xl overflow-hidden glass-panel relative shadow-2xl group border border-zinc-800 flex flex-col">
      
      {/* Dynamic Title Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-30 pointer-events-none">
        <div className="max-w-xl mx-auto pointer-events-auto">
          {isIdle ? (
            <div className="relative group/input">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity"></div>
              <input 
                type="text" 
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Enter stream title..."
                className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 text-lg font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-center shadow-2xl"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pointer-events-none opacity-0 group-hover/input:opacity-100 transition-opacity">
                <i className="fa-solid fa-pen-to-square"></i>
                Edit Title
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="px-8 py-3 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl inline-block">
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    {title}
                  </h1>
               </div>
               <div className="mt-2 px-3 py-1 bg-indigo-600/20 border border-indigo-500/20 rounded-full">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Broadcast Session Active</span>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Background/Offline State */}
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 overflow-hidden">
        {(status === StreamStatus.IDLE || isCamOff) && (
          <div className="flex flex-col items-center gap-4 text-center z-10 animate-in fade-in duration-500">
            <div className="w-24 h-24 rounded-full bg-zinc-800/50 flex items-center justify-center border border-zinc-700">
              <i className="fa-solid fa-user-ninja text-4xl text-zinc-600"></i>
            </div>
            <div>
              <p className="text-zinc-400 font-medium">Camera is disabled</p>
              <p className="text-xs text-zinc-600">Go live to start the stream</p>
            </div>
          </div>
        )}
        
        {/* Background animation for techy feel */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>
      </div>

      {/* Main Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-700 ${status !== StreamStatus.IDLE && !isCamOff ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Stream Stats Overlays (Bottom) */}
      <div className="absolute top-24 left-6 flex flex-col gap-2 pointer-events-none z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500' : 'bg-zinc-500'}`}></div>
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            {isLive ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
          <i className="fa-solid fa-eye text-[10px] text-zinc-400"></i>
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">{isLive ? '1.2K' : '0'}</span>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 pointer-events-none z-20">
         <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
            <h2 className="text-sm font-bold text-white">{isIdle ? 'Stream Setup' : title}</h2>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Real-time AI Engagement</p>
         </div>
      </div>

      {/* Visual Indicator of AI Active */}
      {status === StreamStatus.LIVE && (
        <div className="absolute top-24 right-6 flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-indigo-500/30 z-20">
           <div className="flex gap-1 items-end h-4 w-8">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="flex-1 bg-indigo-500 rounded-t-sm animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
             ))}
           </div>
           <span className="text-[10px] font-bold text-indigo-200">AI LISTENING</span>
        </div>
      )}
    </div>
  );
};

export default StreamView;
