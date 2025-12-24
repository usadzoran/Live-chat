
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, Gift } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  userCoins?: number;
  onSendGift?: (gift: Gift) => void;
  onSupport?: () => void;
}

const GIFTS: Gift[] = [
  { id: '1', name: "Je t'adore", icon: 'fa-face-kiss-wink-heart', cost: 1, color: 'text-yellow-400' },
  { id: '2', name: 'Rose', icon: 'fa-spa', cost: 1, color: 'text-rose-500' },
  { id: '3', name: 'Prêt(e)!', icon: 'fa-face-grin-stars', cost: 1, color: 'text-yellow-300' },
  { id: '4', name: 'Cœur', icon: 'fa-heart', cost: 1, color: 'text-emerald-400' },
  { id: '5', name: 'Cœur mains', icon: 'fa-hand-holding-heart', cost: 5, color: 'text-pink-400' },
  { id: '6', name: 'Coffre', icon: 'fa-box-open', cost: 100, color: 'text-amber-500' },
  { id: '7', name: 'Platform', icon: 'fa-music', cost: 1, color: 'text-purple-400' },
  { id: '8', name: 'Cornet', icon: 'fa-ice-cream', cost: 1, color: 'text-orange-200' },
  { id: '9', name: 'Gâteau', icon: 'fa-cake-candles', cost: 500, color: 'text-pink-300' },
  { id: '10', name: 'Record', icon: 'fa-compact-disc', cost: 1, color: 'text-blue-400' },
  { id: '11', name: 'Diamant', icon: 'fa-gem', cost: 1000, color: 'text-cyan-300' },
  { id: '12', name: 'Univers', icon: 'fa-earth-africa', cost: 9999, color: 'text-indigo-400' },
];

const MULTIPLIERS = [
  { label: 'x5', cost: 5 },
  { label: 'x20', cost: 20 },
  { label: 'x50', cost: 50 },
  { label: 'x100', cost: 100 },
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

  const selectedGift = GIFTS.find(g => g.id === selectedGiftId);

  return (
    <div className="flex-1 flex flex-col glass-panel rounded-3xl border border-zinc-800 overflow-hidden relative">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <i className="fa-solid fa-comments text-indigo-500"></i>
            LIVE TRANSCRIPTION
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 rounded-full border border-white/5">
             <i className="fa-solid fa-coins text-[10px] text-yellow-500"></i>
             <span className="text-[10px] font-black text-white">{userCoins.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-6">
            <i className="fa-solid fa-ghost text-4xl mb-4"></i>
            <p className="text-xs uppercase tracking-widest font-bold">Waiting for energy...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col gap-1 animate-in slide-in-from-bottom-2 fade-in duration-300 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[9px] font-bold uppercase tracking-tighter ${msg.sender === 'user' ? 'text-zinc-500' : 'text-indigo-400'}`}>
                  {msg.sender === 'user' ? 'You' : 'Gemini'}
                </span>
              </div>
              
              {msg.isGift ? (
                <div className="bg-gradient-to-r from-pink-600/10 to-indigo-600/10 border border-white/5 rounded-2xl p-2.5 flex items-center gap-3 shadow-xl">
                   <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-lg">
                      <i className={`fa-solid ${msg.giftIcon}`}></i>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">Sent {msg.giftName}</p>
                      <p className="text-[10px] text-indigo-300">{msg.giftValue} Coins</p>
                   </div>
                </div>
              ) : (
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-zinc-800 text-zinc-200 rounded-tr-none' 
                    : 'bg-indigo-600/10 text-indigo-100 border border-indigo-500/20 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* OVERHAULED GIFT PICKER (TIKTOK STYLE) */}
      {showGiftPicker && (
        <div className="absolute inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300 flex flex-col h-2/3 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 rounded-t-[2rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
           {/* Multiplier Bar */}
           <div className="flex items-center gap-2 p-4 overflow-x-auto hide-scrollbar border-b border-white/5">
              {MULTIPLIERS.map((m) => (
                <div key={m.label} className="flex-shrink-0 min-w-[70px] aspect-video bg-zinc-900 rounded-xl border border-white/5 p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors">
                   <span className="text-xs font-black text-white">{m.label}</span>
                   <div className="flex items-center gap-1 mt-0.5">
                      <i className="fa-solid fa-coins text-[8px] text-yellow-500"></i>
                      <span className="text-[9px] text-zinc-500">{m.cost}</span>
                   </div>
                </div>
              ))}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 ml-auto">
                 <i className="fa-solid fa-question text-[10px] text-zinc-500"></i>
              </div>
           </div>

           {/* Gifts Grid */}
           <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-y-6 gap-x-2 hide-scrollbar">
              {GIFTS.map((gift) => (
                <button 
                  key={gift.id}
                  onClick={() => setSelectedGiftId(gift.id)}
                  className={`relative flex flex-col items-center group transition-all duration-200 ${selectedGiftId === gift.id ? 'scale-105' : ''}`}
                >
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-1.5 transition-all
                    ${selectedGiftId === gift.id ? 'bg-zinc-800 ring-2 ring-pink-500 shadow-2xl shadow-pink-500/20' : 'hover:bg-white/5'}
                  `}>
                    <i className={`fa-solid ${gift.icon} ${gift.color}`}></i>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-300 text-center truncate w-full px-1">{gift.name}</span>
                  <div className="flex items-center gap-1">
                    <i className="fa-solid fa-coins text-[8px] text-yellow-500"></i>
                    <span className="text-[10px] font-bold text-zinc-500">{gift.cost}</span>
                  </div>

                  {/* Individual Send Button for Selected */}
                  {selectedGiftId === gift.id && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSendGift) onSendGift(gift);
                        setSelectedGiftId(null);
                      }}
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10 w-full py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full text-[10px] font-black text-white uppercase tracking-tighter shadow-xl shadow-pink-600/30 animate-in zoom-in-50 duration-200"
                    >
                      Envoyer
                    </button>
                  )}
                </button>
              ))}
           </div>

           {/* Picker Footer */}
           <div className="p-5 bg-zinc-900/50 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button onClick={() => setShowGiftPicker(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                    <i className="fa-solid fa-share-nodes"></i>
                 </button>
                 <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                    <i className="fa-solid fa-pen"></i>
                 </button>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={onSupport}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full border border-white/10 group active:scale-95 transition-all"
                >
                  <i className="fa-solid fa-coins text-yellow-500 text-xs"></i>
                  <span className="text-sm font-black text-white">{userCoins.toLocaleString()}</span>
                  <i className="fa-solid fa-chevron-right text-[8px] text-zinc-500 group-hover:translate-x-1 transition-transform"></i>
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex items-center gap-3">
        <div className="relative flex-1 group">
           <input 
             disabled
             type="text" 
             placeholder="Dis quelque chose..." 
             className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
           />
           <div className="absolute right-3 top-1/2 -translate-y-1/2">
             <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center">
               <i className="fa-solid fa-microphone text-[10px] text-indigo-500 animate-pulse"></i>
             </div>
           </div>
        </div>
        <button 
          onClick={() => setShowGiftPicker(!showGiftPicker)}
          className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-lg ${showGiftPicker ? 'bg-pink-600 text-white shadow-pink-600/20' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}
        >
          <i className="fa-solid fa-gift text-sm"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
