
import React, { useState, useEffect, useRef } from 'react';

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
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const selectedPackRef = useRef<typeof DIAMOND_PACKS[0] | null>(null);

  // Sync ref with state for the PayPal callback
  useEffect(() => {
    selectedPackRef.current = selectedPack;
  }, [selectedPack]);

  const handleBuy = (pack: typeof DIAMOND_PACKS[0]) => {
    setSelectedPack(pack);
    setPaymentMethod(null);
  };

  const confirmVisaPurchase = () => {
    if (!selectedPack) return;
    setIsProcessing(true);
    // Simulate card processing
    setTimeout(() => {
      onPurchase(selectedPack.amount);
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      setSelectedPack(null);
      setPaymentMethod(null);
    }, 2000);
  };

  useEffect(() => {
    let paypalButton: any = null;

    if (paymentMethod === 'paypal' && selectedPack && paypalContainerRef.current) {
      const containerId = paypalContainerRef.current.id;
      // Clear container before rendering
      paypalContainerRef.current.innerHTML = '';
      
      const pp = (window as any).paypal;
      if (pp && pp.HostedButtons) {
        try {
          paypalButton = pp.HostedButtons({
            hostedButtonId: "MUH345U2QKVG8",
            onApprove: (data: any, actions: any) => {
              console.log("Transaction Approved:", data);
              const pack = selectedPackRef.current;
              if (pack) {
                // AUTOMATIC CREDIT: The onPurchase callback updates the global state in App.tsx
                onPurchase(pack.amount);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 5000);
                setSelectedPack(null);
                setPaymentMethod(null);
              }
            },
            onCancel: () => {
              console.log("Transaction Cancelled");
            },
            onError: (err: any) => {
              console.error("PayPal Execution Error:", err);
            }
          });
          
          paypalButton.render(`#${containerId}`);
        } catch (err) {
          console.error("PayPal Rendering Error:", err);
        }
      } else {
        console.error("PayPal SDK not loaded properly. Ensure client-id and components are correct in index.html");
      }
    }

    return () => {
      // Cleanup if needed, though HostedButtons cleanup is internal
    };
  }, [paymentMethod, selectedPack, onPurchase]);

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-6 overflow-y-auto pb-32 hide-scrollbar">
      {/* Header Section */}
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

      {/* Hero Banner */}
      <div className="px-4">
        <div className="w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden relative border border-white/5 shadow-2xl group">
          <img 
            src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80" 
            className="w-full h-full object-cover opacity-60 brightness-75" 
            alt="promo" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-center px-12">
             <div className="inline-block w-fit px-3 py-1 bg-pink-600 rounded-lg text-[8px] font-black text-white uppercase tracking-widest mb-4">PLATINUM OFFER</div>
             <h2 className="text-4xl font-black text-white leading-none mb-2">Double Vault Unlock</h2>
             <p className="text-zinc-400 text-xs font-medium max-w-sm">Support your favorite creators. Every diamond sent through our secure gateway is tracked in real-time.</p>
          </div>
        </div>
      </div>

      {/* Diamond Packs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 px-4">
        {DIAMOND_PACKS.map((pack) => (
          <div 
            key={pack.id} 
            className={`glass-panel p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group ${selectedPack?.id === pack.id ? 'border-pink-500 bg-pink-500/5' : 'border-white/5 hover:border-pink-500/20 hover:bg-white/[0.02]'}`}
            onClick={() => handleBuy(pack)}
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-950/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-gem text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"></i>
            </div>
            <div className="text-center mt-2">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{pack.label}</p>
               <h3 className="text-2xl font-black text-white">{pack.amount.toLocaleString()}</h3>
            </div>
            <div className={`w-full py-3 rounded-xl border flex items-center justify-center mt-2 transition-all ${selectedPack?.id === pack.id ? 'bg-pink-600 border-pink-500 text-white' : 'bg-white/5 border-white/10 text-zinc-300 group-hover:bg-pink-600 group-hover:border-pink-500 group-hover:text-white'}`}>
               <span className="text-xs font-black">${pack.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Security Info */}
      <div className="px-4">
        <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-400 text-xl">
                 <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div className="max-w-md">
                 <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Elite Security Protocols</h4>
                 <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase tracking-tighter">
                    Transactions are processed directly through the Admin Merchant Wallet. Your profile balance is updated automatically upon confirmation.
                 </p>
              </div>
           </div>
           <button onClick={onBack} className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] hover:text-white transition-colors">Return to Dashboard</button>
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPack && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md glass-panel p-8 rounded-[3rem] border-white/10 shadow-2xl space-y-6 relative overflow-hidden text-center">
            <div className="absolute top-6 right-6">
              <button onClick={() => setSelectedPack(null)} className="text-zinc-600 hover:text-white">
                 <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-cyan-600/20 flex items-center justify-center text-3xl text-cyan-400 mx-auto shadow-2xl mb-2">
                <i className="fa-solid fa-gem"></i>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Confirm Selection</h3>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Adding {selectedPack.amount.toLocaleString()} Diamonds to Profile</p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Transaction</span>
               <span className="text-xl font-black text-white">${selectedPack.price.toFixed(2)}</span>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-left ml-2">Choose Payment Channel</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod('visa')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${paymentMethod === 'visa' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'}`}
                >
                  <i className="fa-brands fa-cc-visa text-2xl"></i>
                  <span className="text-[8px] font-black uppercase tracking-widest">Debit/Credit</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${paymentMethod === 'paypal' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'}`}
                >
                  <i className="fa-brands fa-paypal text-2xl"></i>
                  <span className="text-[8px] font-black uppercase tracking-widest">PayPal</span>
                </button>
              </div>
            </div>

            {/* Visa Flow */}
            {paymentMethod === 'visa' && (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                <div className="space-y-2 text-left">
                  <input type="text" placeholder="Card Number" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM/YY" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500" />
                    <input type="text" placeholder="CVC" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <button 
                  onClick={confirmVisaPurchase}
                  disabled={isProcessing}
                  className="w-full py-5 bg-pink-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? <i className="fa-solid fa-circle-notch animate-spin"></i> : `COMPLETE PAYMENT`}
                </button>
              </div>
            )}

            {/* PayPal Flow */}
            {paymentMethod === 'paypal' && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl text-center min-h-[160px] flex flex-col items-center justify-center">
                    <div id="paypal-container-MUH345U2QKVG8" ref={paypalContainerRef} className="w-full flex justify-center py-2">
                        <div className="animate-pulse flex flex-col items-center gap-2">
                            <i className="fa-brands fa-paypal text-3xl text-blue-400"></i>
                            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.2em]">Connecting to PayPal...</span>
                        </div>
                    </div>
                    <p className="text-[8px] text-zinc-500 uppercase tracking-widest mt-4">
                      Diamonds are added instantly to your profile upon confirmation.
                    </p>
                </div>
              </div>
            )}

            {!paymentMethod && (
               <div className="py-8 text-zinc-600 italic text-[10px] uppercase tracking-widest">
                 Please select your preferred gateway
               </div>
            )}
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[110] px-10 py-5 bg-green-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-[0_20px_60px_rgba(22,163,74,0.4)] animate-in slide-in-from-top-12 duration-500">
           <div className="flex items-center gap-3">
              <i className="fa-solid fa-circle-check text-lg"></i>
              <span>Payment Successful. Diamonds Synchronized.</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default StoreView;
