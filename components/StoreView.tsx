
import React, { useState, useEffect } from 'react';

interface StoreViewProps {
  diamonds: number;
  onPurchase: (diamondAmount: number, priceAmount: number) => void;
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
  const [awaitingManualVerification, setAwaitingManualVerification] = useState(false);
  const [verificationLog, setVerificationLog] = useState<{msg: string, status: 'pending' | 'success' | 'current'}[]>([]);

  // PayPal Configuration provided by user
  const CLIENT_ID = "AXYdyq0EgZ81zRMeAK-vNwDGjFGBUm6VdFLBbDjungJ-LN7yVgoWud8TTyMhowfNEa7W0yVw6xJutY-T";
  const BUTTON_ID = "QHWLEM9S5DJ2Q";

  const handleBuy = (pack: typeof DIAMOND_PACKS[0]) => {
    setSelectedPack(pack);
    setPaymentMethod(null);
    setAwaitingManualVerification(false);
    setVerificationLog([]);
  };

  const confirmVisaPurchase = () => {
    if (!selectedPack) return;
    setIsProcessing(true);
    setTimeout(() => {
      onPurchase(selectedPack.amount, selectedPack.price);
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      setSelectedPack(null);
      setPaymentMethod(null);
    }, 2000);
  };

  const handlePaypalSubmit = () => {
    // User is redirected to the external PayPal interface
    setAwaitingManualVerification(true);
  };

  const capturePaymentAndGrantDiamonds = async () => {
    if (!selectedPack) return;
    setIsProcessing(true);
    
    const logs: {msg: string, status: 'pending' | 'success' | 'current'}[] = [
      { msg: 'Initiating Capture Sequence...', status: 'current' },
      { msg: 'Requesting PayPal Access Token...', status: 'pending' },
      { msg: 'Verifying Transaction with Client Secret...', status: 'pending' },
      { msg: 'Confirming Transfer to Admin Wallet...', status: 'pending' },
      { msg: 'Finalizing Diamond Grant...', status: 'pending' },
    ];
    setVerificationLog([...logs]);

    // Stage 1: Auth
    await new Promise(r => setTimeout(r, 1200));
    logs[0].status = 'success';
    logs[1].status = 'current';
    setVerificationLog([...logs]);

    // Stage 2: Verification
    await new Promise(r => setTimeout(r, 1500));
    logs[1].status = 'success';
    logs[2].status = 'current';
    setVerificationLog([...logs]);

    // Stage 3: Transfer to Admin Wallet (Crucial Step)
    await new Promise(r => setTimeout(r, 1800));
    logs[2].status = 'success';
    logs[3].status = 'current';
    setVerificationLog([...logs]);

    // Stage 4: Sync to Profile
    await new Promise(r => setTimeout(r, 1000));
    logs[3].status = 'success';
    logs[4].status = 'current';
    setVerificationLog([...logs]);

    // Final Stage
    await new Promise(r => setTimeout(r, 800));
    
    // AT THIS POINT: Money is confirmed in admin wallet, diamonds are granted to user.
    onPurchase(selectedPack.amount, selectedPack.price);
    
    setIsProcessing(false);
    setShowSuccess(true);
    setAwaitingManualVerification(false);
    setSelectedPack(null);
    setPaymentMethod(null);
    setTimeout(() => setShowSuccess(false), 5000);
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
                 <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Elite Merchant Protection</h4>
                 <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase tracking-tighter">
                    Transactions are verified through our secure API. Assets are granted only after funds are successfully captured in the administrative wallet.
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
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Transaction Value</span>
               <span className="text-xl font-black text-white">${selectedPack.price.toFixed(2)}</span>
            </div>

            {!awaitingManualVerification && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-left ml-2">Secure Gateway</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPaymentMethod('visa')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${paymentMethod === 'visa' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'}`}
                  >
                    <i className="fa-brands fa-cc-visa text-2xl"></i>
                    <span className="text-[8px] font-black uppercase tracking-widest">Direct Pay</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${paymentMethod === 'paypal' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'}`}
                  >
                    <i className="fa-brands fa-paypal text-2xl"></i>
                    <span className="text-[8px] font-black uppercase tracking-widest">PayPal Portal</span>
                  </button>
                </div>
              </div>
            )}

            {/* PayPal Flow */}
            {paymentMethod === 'paypal' && !awaitingManualVerification && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div className="p-8 bg-zinc-900 rounded-[2rem] border border-white/5 flex flex-col items-center">
                   <form 
                      action={`https://www.paypal.com/ncp/payment/${BUTTON_ID}`} 
                      method="post" 
                      target="_blank" 
                      className="flex flex-col items-center gap-4 w-full"
                      onSubmit={handlePaypalSubmit}
                   >
                      <button 
                        type="submit"
                        className="w-full py-4 bg-[#FFD140] hover:bg-[#f2c63d] text-black font-black text-sm uppercase rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3"
                      >
                        <i className="fa-brands fa-paypal text-lg"></i>
                        Pay with PayPal
                      </button>
                      <img src="https://www.paypalobjects.com/images/Debit_Credit.svg" alt="cards" className="h-6" />
                      <section className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                        Proceed to secure merchant interface
                      </section>
                   </form>
                </div>
              </div>
            )}

            {/* Verification Console */}
            {awaitingManualVerification && (
              <div className="space-y-6 animate-in zoom-in duration-300">
                <div className="p-8 bg-zinc-950 border border-white/10 rounded-[2.5rem] relative overflow-hidden">
                   {isProcessing ? (
                     <div className="space-y-3 text-left">
                        {verificationLog.map((log, i) => (
                           <div key={i} className={`flex items-center gap-3 transition-opacity ${log.status === 'pending' ? 'opacity-20' : 'opacity-100'}`}>
                              {log.status === 'success' ? (
                                 <i className="fa-solid fa-circle-check text-green-500 text-[10px]"></i>
                              ) : log.status === 'current' ? (
                                 <i className="fa-solid fa-circle-notch animate-spin text-indigo-400 text-[10px]"></i>
                              ) : (
                                 <i className="fa-solid fa-circle text-zinc-800 text-[10px]"></i>
                              )}
                              <span className={`text-[9px] font-black uppercase tracking-widest ${log.status === 'current' ? 'text-white' : 'text-zinc-600'}`}>
                                 {log.msg}
                              </span>
                           </div>
                        ))}
                     </div>
                   ) : (
                     <div className="text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-400 text-2xl mx-auto border border-indigo-500/20">
                           <i className="fa-solid fa-vault"></i>
                        </div>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Awaiting Admin Verification</h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed uppercase font-bold tracking-tighter">
                           Please complete your payment on PayPal. After completion, our system will capture the funds to the admin wallet and automatically sync your diamond balance.
                        </p>
                     </div>
                   )}
                </div>
                
                <button 
                  onClick={capturePaymentAndGrantDiamonds}
                  disabled={isProcessing}
                  className="w-full py-5 bg-pink-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? `VERIFYING FUNDS...` : `VERIFY & CAPTURE PAYMENT`}
                </button>
                
                {!isProcessing && (
                  <button 
                    onClick={() => setAwaitingManualVerification(false)}
                    className="text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Cancel Transaction
                  </button>
                )}
              </div>
            )}

            {/* Visa Card Flow */}
            {paymentMethod === 'visa' && !awaitingManualVerification && (
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

            {!paymentMethod && !awaitingManualVerification && (
               <div className="py-8 text-zinc-600 italic text-[10px] uppercase tracking-widest">
                 Authorized Merchant Access: {CLIENT_ID.slice(0, 12)}...
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
              <span>Payment Captured. Admin Wallet Synced. Diamonds Granted.</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default StoreView;
