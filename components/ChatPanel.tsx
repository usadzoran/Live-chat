
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, Gift } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  userCoins?: number;
  onSendGift?: (gift: Gift) => void;
  onSupport?: () => void;
}

const GIFTS: Gift[] = [
  { id: '1', name: "Love", icon: 'fa-heart', cost: 1, color: 'text-rose-500' },
  { id: '2', name: 'Rose', icon: 'fa-spa', cost: 10, color: 'text-red-500' },
  { id: '3', name: 'Fire', icon: 'fa-fire', cost: 50, color: 'text-orange-500' },
  { id: '4', name: 'Crown', icon: 'fa-crown', cost: 500, color: 'text-amber-500' },
  { id: '5', name: 'Diamond', icon: 'fa-gem', cost: 1000, color: 'text-cyan-400' },
  { id: '6', name: 'Rocket', icon: 'fa-rocket', cost: 5000, color: 'text-indigo-500' },
];

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, userCoins = 0, onSendGift, onSupport }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showGifts, setShowGifts] = useState(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col glass-panel rounded-[2.5rem] lg:rounded-[3.5rem] border border-white/5 overflow-hidden relative bg-black/30 backdrop-blur-3xl shadow-2xl h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20">
            <i className="fa-solid fa-comments text-sm"></i>
          </div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Live Stream Feed</h3>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 bg-zinc-900/80 rounded-full border border-white/10">
           <i className="fa-solid fa-coins text-[10px] text-yellow-500"></i>
           <span className="text-[11px] font-black text-white tabular-nums tracking-tighter">{userCoins.toLocaleString()}</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-[0.05] text-center select-none">
            <i className="fa-solid fa-ghost text-6xl mb-4"></i>
            <p className="text-[9px] uppercase font-black tracking-[0.6em]">Secure Feed Active</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 duration-300 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 ${msg.sender === 'user' ? 'text-zinc-600' : 'text-pink-500'}`}>
                {msg.sender === 'user' ? 'Member' : 'System Companion'}
              </span>
              {msg.isGift ? (
                <div className="bg-gradient-to-br from-pink-600/20 to-indigo-600/20 border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
                   <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-xl shadow-inner border border-white/5">
                      <i className={`fa-solid ${msg.giftIcon} ${msg.sender === 'user' ? 'text-white' : 'text-pink-400'}`}></i>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-white uppercase tracking-widest mb-0.5">Sent {msg.giftName}</p>
                      <p className="text-[10px] text-pink-500 font-black">{msg.giftValue} Gems</p>
                   </div>
                </div>
              ) : (
                <div className={`max-w-[85%] px-4 py-3.5 rounded-2xl text-[11px] leading-relaxed shadow-lg ${msg.sender === 'user' ? 'bg-zinc-900 text-zinc-100 rounded-tr-none border border-white/5' : 'bg-pink-600/10 text-pink-50 border border-pink-500/20 rounded-tl-none backdrop-blur-md'}`}>
                  {msg.text}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Gifts Drawer */}
      {showGifts && (
        <div className="absolute inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-500 flex flex-col h-2/3 bg-zinc-950/98 backdrop-blur-3xl border-t border-white/10 rounded-t-[3rem] shadow-[0_-20px_100px_rgba(0,0,0,1)]">
           <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mt-4 mb-2 cursor-pointer" onClick={() => setShowGifts(false)}></div>
           <div className="p-6 flex justify-between items-center border-b border-white/5">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Support the Doll</h4>
              <button onClick={onSupport} className="text-[9px] font-black text-pink-500 uppercase underline">Get More Gems</button>
           </div>
           <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-4">
              {GIFTS.map(gift => (
                <button key={gift.id} onClick={() => { onSendGift?.(gift); setShowGifts(false); }} className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group">
                  <i className={`fa-solid ${gift.icon} ${gift.color} text-2xl mb-2 group-hover:scale-125 transition-transform`}></i>
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">{gift.name}</span>
                  <span className="text-[10px] font-black text-white">{gift.cost}</span>
                </button>
              ))}
           </div>
        </div>
      )}

      {/* Footer Input */}
      <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center gap-4 shrink-0">
        <div className="flex-1 relative">
           <input disabled type="text" placeholder="Awaiting neural link..." className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-[11px] text-zinc-600 focus:outline-none" />
        </div>
        <button 
          onClick={() => setShowGifts(!showGifts)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${showGifts ? 'bg-pink-600 text-white shadow-pink-600/40' : 'bg-zinc-900 text-zinc-500 hover:text-white border border-white/10'}`}
        >
          <i className="fa-solid fa-gift text-lg"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
