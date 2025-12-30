
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
    <div className="flex-1 flex flex-col glass-panel rounded-[2.5rem] lg:rounded-[3.5rem] border border-white/5 overflow-hidden relative bg-black/20 backdrop-blur-3xl shadow-2xl">
      {/* Chat Header */}
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
            <i className="fa-solid fa-comments text-sm"></i>
          </div>
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Live Interaction</h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-full border border-white/5 shadow-inner">
           <i className="fa-solid fa-coins text-[10px] text-yellow-500"></i>
           <span className="text-[11px] font-black text-white tabular-nums">{userCoins.toLocaleString()}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar bg-gradient-to-b from-transparent to-black/20"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10 text-center px-10">
            <i className="fa-solid fa-message text-6xl mb-6"></i>
            <p className="text-[10px] uppercase font-black tracking-[0.5em]">Establishing Chat Node...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col gap-2 animate-in slide-in-from-bottom-4 fade-in duration-500 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 px-1">
                <span className={`text-[9px] font-black uppercase tracking-widest ${msg.sender === 'user' ? 'text-zinc-600' : 'text-pink-500'}`}>
                  {msg.sender === 'user' ? 'Member' : 'Gemini AI'}
                </span>
              </div>
              
              {msg.isGift ? (
                <div className="bg-gradient-to-r from-pink-600/20 to-indigo-600/20 border border-white/10 rounded-2xl p-3 flex items-center gap-4 shadow-2xl animate-pulse">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shadow-inner">
                      <i className={`fa-solid ${msg.giftIcon} ${msg.sender === 'user' ? 'text-white' : 'text-pink-400'}`}></i>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Sent {msg.giftName}</p>
                      <p className="text-[9px] text-pink-400 font-bold">{msg.giftValue} Coins</p>
                   </div>
                </div>
              ) : (
                <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-xl ${
                  msg.sender === 'user' 
                    ? 'bg-zinc-800/80 text-zinc-100 rounded-tr-none border border-white/5' 
                    : 'bg-pink-600/10 text-pink-50 border border-pink-500/20 rounded-tl-none backdrop-blur-md'
                }`}>
                  {msg.text}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Gift Picker Overlay */}
      {showGiftPicker && (
        <div className="absolute inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-500 flex flex-col h-[65%] bg-zinc-950/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[3rem] shadow-[0_-20px_80px_rgba(0,0,0,0.8)]">
           <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mt-4 mb-2"></div>
           
           <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Support the Creator</h4>
              <div className="flex items-center gap-2">
                 <i className="fa-solid fa-coins text-xs text-yellow-500"></i>
                 <span className="text-xs font-black text-white">{userCoins.toLocaleString()}</span>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 grid grid-cols-4 gap-4 hide-scrollbar">
              {GIFTS.map((gift) => (
                <button 
                  key={gift.id}
                  onClick={() => setSelectedGiftId(gift.id)}
                  className={`relative flex flex-col items-center p-2 rounded-2xl transition-all duration-300 ${selectedGiftId === gift.id ? 'bg-white/5 ring-1 ring-pink-500/50 shadow-2xl' : 'hover:bg-white/5'}`}
                >
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2 transition-all
                    ${selectedGiftId === gift.id ? 'scale-110' : ''}
                  `}>
                    <i className={`fa-solid ${gift.icon} ${gift.color}`}></i>
                  </div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter truncate w-full text-center">{gift.name}</span>
                  <span className="text-[10px] font-black text-white mt-0.5">{gift.cost}</span>

                  {selectedGiftId === gift.id && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSendGift) onSendGift(gift);
                        setSelectedGiftId(null);
                        setShowGiftPicker(false);
                      }}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full w-full py-2 bg-pink-600 rounded-xl text-[8px] font-black text-white uppercase tracking-widest shadow-2xl animate-in fade-in zoom-in duration-200 z-10"
                    >
                      SEND
                    </button>
                  )}
                </button>
              ))}
           </div>

           <div className="p-8 mt-auto flex justify-center">
              <button onClick={onSupport} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-zinc-400 hover:text-white transition-all uppercase tracking-widest">Top up Balance</button>
           </div>
        </div>
      )}

      {/* Input Section */}
      <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center gap-4">
        <div className="flex-1 relative group">
           <input 
             disabled
             type="text" 
             placeholder="Waiting for AI response..." 
             className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-zinc-400 placeholder:text-zinc-700 focus:outline-none focus:border-pink-500/30 transition-all shadow-inner"
           />
        </div>
        <button 
          onClick={() => setShowGiftPicker(!showGiftPicker)}
          className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-2xl ${showGiftPicker ? 'bg-pink-600 text-white shadow-pink-600/40 rotate-90' : 'bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 border border-white/5'}`}
        >
          <i className="fa-solid fa-gift text-sm"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
