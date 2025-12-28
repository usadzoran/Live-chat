
import React, { useState } from 'react';

interface StoreViewProps {
  diamonds: number;
  onPurchase: (amount: number) => void;
  onBack: () => void;
}

const DIAMOND_PACKS = [
  { id: 'pack-1', amount: 10, price: 0.05, label: 'Starter Sack' },
  { id: 'pack-2', amount: 100, price: 0.50, label: 'Vibe Pack' },
  { id: 'pack-3', amount: 500, price: 2.50, label: 'Elite Chest' },
  { id: 'pack-4', amount: 1000, price: 5.00, label: 'Sugar Vault' },
  { id: 'pack-5', amount: 5000, price: 25.00, label: 'Grand Master' },
  { id: 'pack-6', amount: 10000, price: 50.00, label: 'Infinite Empire' },
];

const StoreView: React.FC<StoreViewProps> = ({ diamonds, onPurchase, onBack }) => {
  const [selectedPack, setSelectedPack] = useState<typeof DIAMOND_PACKS[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'visa' | 'paypal' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBuy = (pack: typeof DIAMOND_PACKS[0]) => {
    setSelectedPack(pack);
    setPaymentMethod(null); // Reset payment method on new selection
  };

  const confirmPurchase = () => {
    if (!selectedPack || !paymentMethod) return;
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      onPurchase(selectedPack.amount);
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setSelectedPack(null);
      setPaymentMethod(null);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-6 overflow-y-auto pb-32 hide-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mt-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Diamond Vault</h1>
          <p className="text-[10px] text-pink-500 font-black uppercase tracking-[0.3em] mt-1">Refuel your digital influence</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900 rounded-[1.5rem] border border-white/5 shadow-2xl">
           <i className="fa-solid fa-gem text-cyan-400 text-sm"></i>
           <span className="text-xl font-black text-white">{diamonds.toLocaleString()}</span>
        </div>
      </div>

      {/* Featured Banner */}
      <div className="px-4">
        <div className="w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden relative border border-white/5 shadow-2xl group">
          <img 
            src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80" 
            className="w-full h-full object-cover opacity-60 brightness-75" 
            alt="promo" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-center px-12">
             <div className="inline-block w-fit px-3 py-1 bg-pink-600 rounded-lg text-[8px] font-black text-white uppercase tracking-widest mb-4">LIMITED OFFER</div>
             <h2 className="text-4xl font-black text-white leading-none mb-2">Double Influence Week</h2>
             <p className="text-zinc-400 text-xs font-medium max-w-sm">Every diamond pack purchased today grants elite-tier profile visibility for 24 hours.</p>
          </div>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 px-4">
        {DIAMOND_PACKS.map((pack) => (
          <div 
            key={pack.id} 
            className="glass-panel p-6 rounded-[2rem] border border-white/5 flex flex-col items-center gap-4 group hover:border-pink-500/20 hover:bg-white/[0.02] transition-all cursor-pointer relative overflow-hidden"
            onClick={() => handleBuy(pack)}
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-950/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              <i className={`fa-solid fa-gem text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]`}></i>
            </div>
            <div className="text-center">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{pack.label}</p>
               <h3 className="text-2xl font-black text-white">{pack.amount.toLocaleString()}</h3>
            </div>
            <div className="w-full py-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center group-hover:bg-pink-600 group-hover:border-pink-500 transition-all">
               <span className="text-xs font-black text-zinc-300 group-hover:text-white">${pack.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="px-4">
        <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-400 text-xl">
                 <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div className="max-w-md">
                 <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Secure Transactions</h4>
                 <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase tracking-tighter">
                    All diamond purchases are processed through bank-grade encryption. Your influence is our priority.
                 </p>
              </div>
           </div>
           <button onClick={onBack} className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] hover:text-white transition-colors">Return to Dashboard</button>
        </div>
      </div>

      {/* Enhanced Checkout Modal */}
      {selectedPack && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md glass-panel p-8 rounded-[3rem] border-white/10 shadow-2xl space-y-6 relative overflow-hidden text-center">
            <div className="absolute top-6 right-6">
              <button onClick={() => setSelectedPack(null)} className="text-zinc-600 hover:text-white">
                 <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-cyan-600/20 flex items-center justify-center text-3xl text-cyan-400 mx-auto shadow-2xl mb-2">
                <i className="fa-solid fa-gem"></i>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Diamond Purchase</h3>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Adding {selectedPack.amount.toLocaleString()} Diamonds to Vault</p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total to Pay</span>
               <span className="text-xl font-black text-white">${selectedPack.price.toFixed(2)}</span>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-left ml-2">Select Payment Provider</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod('visa')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${paymentMethod === 'visa' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-zinc-500'}`}
                >
                  <i className="fa-brands fa-cc-visa text-2xl"></i>
                  <span className="text-[8px] font-black uppercase tracking-widest">Visa / Card</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${paymentMethod === 'paypal' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-zinc-500'}`}
                >
                  <i className="fa-brands fa-paypal text-2xl"></i>
                  <span className="text-[8px] font-black uppercase tracking-widest">PayPal</span>
                </button>
              </div>
            </div>

            {/* Conditional Payment Forms */}
            {paymentMethod === 'visa' && (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                <input 
                  type="text" 
                  placeholder="Card Number" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="MM/YY" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500" />
                  <input type="text" placeholder="CVC" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-center animate-in slide-in-from-top-2">
                <p className="text-[10px] text-blue-300 font-bold">Secure redirection to PayPal authorized portal...</p>
              </div>
            )}

            <button 
              onClick={confirmPurchase}
              disabled={isProcessing || !paymentMethod}
              className={`w-full py-5 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl transition-all active:scale-95 ${!paymentMethod ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-pink-600 shadow-pink-600/40'}`}
            >
              {isProcessing ? (
                <i className="fa-solid fa-circle-notch animate-spin"></i>
              ) : (
                `CONFIRM & PAY $${selectedPack.price.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[110] px-8 py-4 bg-green-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl animate-in slide-in-from-top-12 duration-500">
           <i className="fa-solid fa-check mr-2"></i> Diamonds Credited to your Vault
        </div>
      )}
    </div>
  );
};

export default StoreView;
