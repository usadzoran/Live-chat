
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
  { id: '2', name: 'Rose', icon: 'fa-spa', cost: 5, color: 'text-red-500' },
  { id: '3', name: 'Fire', icon: 'fa-fire', cost: 10, color: 'text-orange-500' },
  { id: '4', name: 'Star', icon: 'fa-star', cost: 50, color: 'text-yellow-400' },
  { id: '5', name: 'Crown', icon: 'fa-crown', cost: 100, color: 'text-amber-500' },
  { id: '6', name: 'Diamond', icon: 'fa-gem', cost: 500, color: 'text-cyan-400' },
  { id: '7', name: 'Rocket', icon: 'fa-rocket', cost: 1000, color: 'text-indigo-500' },
  { id: '8', name: 'Universe', icon: 'fa-earth-africa', cost: 9999, color: 'text-purple-500' },
];

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, userCoins = 0, onSendGift, onSupport }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col glass-panel rounded-[2.5rem] lg:rounded-[3.5rem] border border-white/5 overflow-hidden relative bg-black/20 backdrop-blur-3xl shadow-2xl h-full">
      {/* Chat Header */}
      <div className="p-6 border-b border-white/5 bg-white/[0.03] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20">
            <i className="fa-solid fa-comments-dollar text-sm"></i>
          </div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Live Interaction</h3>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 bg-zinc-900/80 rounded-full border border-white/10 shadow-inner">
           <i className="fa-solid fa-coins text-[10px] text-yellow-500"></i>
           <span className="text-[11px] font-black text-white tabular-nums tracking-tighter">{userCoins.toLocaleString()}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6 hide-scrollbar bg-gradient-to-b from-transparent to-black/30"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-[0.05] text-center px-10 select-none">
            <i className="fa-solid fa-shield-heart text-7xl mb-6"></i>
            <p className="text-[10px] uppercase font-black tracking-[0.6em]">Secure Feed Active</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col gap-2 animate-in slide-in-from-bottom-3 fade-in duration-500 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 px-1">
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${msg.sender === 'user' ? 'text-zinc-600' : 'text-pink-500'}`}>
                  {msg.sender === 'user' ? 'Member Identity' : 'Neural Core'}
                </span>
              </div>
              
              {msg.isGift ? (
                <div className="bg-gradient-to-br from-pink-600/20 via-pink-600/5 to-indigo-600/20 border border-white/10 rounded-2xl p-4 flex items-center gap-5 shadow-2xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-white/5 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-2xl shadow-inner border border-white/10 relative z-10">
                      <i className={`fa-solid ${msg.giftIcon} ${msg.sender === 'user' ? 'text-white' : 'text-pink-400'}`}></i>
                   </div>
                   <div className="relative z-10">
                      <p className="text-[9px] font-black text-white uppercase tracking-[0.2em] mb-0.5">Gift Dispatched: {msg.giftName}</p>
                      <p className="text-[10px] text-pink-400 font-black tabular-nums">{msg.giftValue} CREDITS</p>
                   </div>
                </div>
              ) : (
                <div className={`max-w-[85%] px-4 py-3.5 rounded-2xl text-[11px] leading-relaxed shadow-xl ${
                  msg.sender === 'user' 
                    ? 'bg-zinc-900/90 text-zinc-100 rounded-tr-none border border-white/10' 
                    : 'bg-pink-600/10 text-pink-50 border border-pink-500/20 rounded-tl-none backdrop-blur-md'
                }`}>
                  {msg.text}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Gift Picker Drawer */}
      {showGiftPicker && (
        <div className="absolute inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-500 flex flex-col h-[75%] bg-zinc-950/98 backdrop-blur-3xl border-t border-white/10 rounded-t-[3.5rem] shadow-[0_-20px_100px_rgba(0,0,0,1)]">
           <div className="w-16 h-1.5 bg-zinc-800 rounded-full mx-auto mt-5 mb-2 cursor-pointer" onClick={() => setShowGiftPicker(false)}></div>
           
           <div className="px-8 py-6 flex justify-between items-center shrink-0">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Contributor Arsenal</h4>
              <div className="flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                 <i className="fa-solid fa-coins text-xs text-yellow-500"></i>
                 <span className="text-xs font-black text-white tabular-nums">{userCoins.toLocaleString()}</span>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 lg:p-8 grid grid-cols-4 gap-4 lg:gap-6 hide-scrollbar">
              {GIFTS.map((gift) => (
                <button 
                  key={gift.id}
                  onClick={() => setSelectedGiftId(gift.id)}
                  className={`relative flex flex-col items-center p-3 rounded-2xl transition-all duration-300 border ${selectedGiftId === gift.id ? 'bg-pink-600/10 border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.2)]' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                >
                  <div className={`
                    w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center text-2xl lg:text-3xl mb-3 transition-transform
                    ${selectedGiftId === gift.id ? 'scale-110' : 'group-hover:scale-110'}
                  `}>
                    <i className={`fa-solid ${gift.icon} ${gift.color} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></i>
                  </div>
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest truncate w-full text-center">{gift.name}</span>
                  <span className="text-[10px] font-black text-white mt-1 tabular-nums">{gift.cost}</span>

                  {selectedGiftId === gift.id && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSendGift) onSendGift(gift);
                        setSelectedGiftId(null);
                        setShowGiftPicker(false);
                      }}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full w-[120%] py-2.5 bg-pink-600 rounded-xl text-[9px] font-black text-white uppercase tracking-[0.2em] shadow-2xl animate-in fade-in zoom-in duration-200 z-10"
                    >
                      SEND NOW
                    </button>
                  )}
                </button>
              ))}
           </div>

           <div className="p-10 mt-auto flex justify-center shrink-0">
              <button onClick={onSupport} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-zinc-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.3em]">Refill Account</button>
           </div>
        </div>
      )}

      {/* Message Input Container */}
      <div className="p-6 bg-white/[0.03] border-t border-white/5 flex items-center gap-4 shrink-0">
        <div className="flex-1 relative group">
           <div className="absolute inset-0 bg-pink-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
           <input 
             disabled
             type="text" 
             placeholder="Waiting for neural update..." 
             className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-[11px] text-zinc-400 placeholder:text-zinc-800 focus:outline-none focus:border-pink-500/30 transition-all shadow-inner relative z-10"
           />
        </div>
        <button 
          onClick={() => setShowGiftPicker(!showGiftPicker)}
          className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-2xl relative overflow-hidden group/gift ${showGiftPicker ? 'bg-pink-600 text-white shadow-pink-600/40 rotate-90' : 'bg-zinc-900 text-zinc-500 hover:text-white border border-white/10 hover:bg-zinc-800'}`}
        >
          <i className="fa-solid fa-gift text-lg relative z-10"></i>
          {!showGiftPicker && <div className="absolute inset-0 bg-gradient-to-t from-pink-600/10 to-transparent opacity-0 group-hover/gift:opacity-100 transition-opacity"></div>}
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
