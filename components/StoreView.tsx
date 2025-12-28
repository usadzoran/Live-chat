
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
  const [awaitingVerification, setAwaitingVerification] = useState(false);

  const handleBuy = (pack: typeof DIAMOND_PACKS[0]) => {
    setSelectedPack(pack);
    setPaymentMethod(null);
    setAwaitingVerification(false);
  };

  const confirmVisaPurchase = () => {
    if (!selectedPack) return;
    setIsProcessing(true);
    setTimeout(() => {
      onPurchase(selectedPack.amount);
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      setSelectedPack(null);
      setPaymentMethod(null);
    }, 2000);
  };

  const handlePaypalClick = () => {
    // When using a standard form, we can't detect when the payment is finished programmatically
    // from this window easily without webhooks. For this UI, we'll show a "Verification" state.
    setAwaitingVerification(true);
  };

  const verifyManualPayment = () => {
    if (!selectedPack) return;
    setIsProcessing(true);
    // Simulate verification of the transaction
    setTimeout(() => {
      onPurchase(selectedPack.amount);
      setIsProcessing(false);
      setShowSuccess(true);
      setAwaitingVerification(false);
      setSelectedPack(null);
      setPaymentMethod(null);
      setTimeout(() => setShowSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-6 overflow-y-auto pb-32 hide-scrollbar">
      {/* Vault Balance Display */}
      <div className="flex items-center justify-between px-4 mt-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Diamond Vault</h1>
          <p className="text-[10px] text-pink-500 font-black uppercase tracking-[0.3em] mt-1">Enhance your digital presence</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900 rounded-2xl border border-white/5 shadow-2xl">
           <i className="fa-solid fa-gem text-cyan-400 text-sm"></i>
           <span className="text-xl font-black text-white">{diamonds.toLocaleString()}</span>
        </div>
      </div>

      {/* Packs Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 px-4">
        {DIAMOND_PACKS.map((pack) => (
          <div 
            key={pack.id} 
            className={`glass-panel p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group ${selectedPack?.id === pack.id ? 'border-pink-500 bg-pink-500/10' : 'border-white/5 hover:border-pink-500/20 hover:bg-white/[0.02]'}`}
            onClick={() => handleBuy(pack)}
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-950/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-gem text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"></i>
            </div>
            <div className="text-center mt-3">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{pack.label}</p>
               <h3 className="text-2xl font-black text-white">{pack.amount.toLocaleString()}</h3>
            </div>
            <div className={`w-full py-3 rounded-xl border flex items-center justify-center mt-4 transition-all ${selectedPack?.id === pack.id ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-600/20' : 'bg-white/5 border-white/10 text-zinc-300 group-hover:bg-pink-600 group-hover:border-pink-500 group-hover:text-white'}`}>
               <span className="text-xs font-black uppercase tracking-widest">${pack.price.toFixed(2)}</span>
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
                 <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Secure Checkout</h4>
                 <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase tracking-tighter">
                    Using direct merchant forms to prevent browser security blocks. Transactions are processed on PayPal's secure servers.
                 </p>
              </div>
           </div>
           <button onClick={onBack} className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] hover:text-white transition-colors">Return to Elite Hub</button>
        </div>
      </div>

      {/* Checkout Selection Modal */}
      {selectedPack && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md glass-panel p-8 rounded-[3rem] border-white/10 shadow-2xl space-y-6 relative overflow-hidden text-center">
            <div className="absolute top-6 right-6">
              <button onClick={() => setSelectedPack(null)} className="text-zinc-600 hover:text-white transition-all">
                 <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-cyan-600/20 flex items-center justify-center text-3xl text-cyan-400 mx-auto shadow-2xl mb-2">
                <i className="fa-solid fa-gem"></i>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Vault Top-Up</h3>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Selected: {selectedPack.amount.toLocaleString()} Diamonds</p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount</span>
               <span className="text-xl font-black text-white">${selectedPack.price.toFixed(2)}</span>
            </div>

            {/* Provider Selection */}
            {!awaitingVerification && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-left ml-2">Select Provider</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPaymentMethod('visa')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${paymentMethod === 'visa' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'}`}
                  >
                    <i className="fa-brands fa-cc-visa text-2xl"></i>
                    <span className="text-[8px] font-black uppercase tracking-widest">Card Pay</span>
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
            )}

            {/* PayPal Direct Form */}
            {paymentMethod === 'paypal' && !awaitingVerification && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div className="p-8 bg-zinc-900 rounded-[2rem] border border-white/5">
                   <form 
                      action="https://www.paypal.com/ncp/payment/8TN879EM3GXUW" 
                      method="post" 
                      target="_blank" 
                      className="flex flex-col items-center gap-4"
                      onSubmit={handlePaypalClick}
                   >
                      <button 
                        type="submit"
                        className="w-full py-4 bg-[#FFD140] hover:bg-[#f2c63d] text-black font-black text-sm uppercase rounded-xl transition-all active:scale-95 shadow-lg"
                      >
                        Buy Now with PayPal
                      </button>
                      <img src="https://www.paypalobjects.com/images/Debit_Credit.svg" alt="cards" className="h-6" />
                      <section className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                        Powered by <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="paypal" className="h-3 inline-block align-middle ml-1" />
                      </section>
                   </form>
                </div>
                <p className="text-[8px] text-zinc-500 uppercase tracking-widest">
                  Clicking "Buy Now" opens a new secure tab.
                </p>
              </div>
            )}

            {/* Awaiting Verification State */}
            {awaitingVerification && (
              <div className="space-y-6 animate-in zoom-in duration-300">
                <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem]">
                   <i className="fa-solid fa-hourglass-half text-3xl text-indigo-400 mb-4 animate-pulse"></i>
                   <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Awaiting Completion</h4>
                   <p className="text-[10px] text-zinc-400 leading-relaxed uppercase font-bold tracking-tighter">
                      Once you finish the payment in the new tab, click below to verify and sync your vault.
                   </p>
                </div>
                <button 
                  onClick={verifyManualPayment}
                  disabled={isProcessing}
                  className="w-full py-5 bg-pink-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? <i className="fa-solid fa-circle-notch animate-spin"></i> : `VERIFY & CLAIM DIAMONDS`}
                </button>
                <button 
                  onClick={() => setAwaitingVerification(false)}
                  className="text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancel or Choose Another Method
                </button>
              </div>
            )}

            {/* Visa Card Flow */}
            {paymentMethod === 'visa' && !awaitingVerification && (
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
                  {isProcessing ? <i className="fa-solid fa-circle-notch animate-spin"></i> : `PAY SECURELY`}
                </button>
              </div>
            )}

            {!paymentMethod && !awaitingVerification && (
               <div className="py-8 text-zinc-600 italic text-[10px] uppercase tracking-widest">
                 Please select your secure gateway
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
              <span>Vault Replenished. Your Profile is Updated.</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default StoreView;
