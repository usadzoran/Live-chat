
import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { db, UserDB } from '../services/databaseService';

interface StoreViewProps {
  user: UserDB;
  onPurchaseSuccess: () => void;
  onBack: () => void;
}

const DIAMOND_PACKS = [
  { id: 'pack-1', amount: 10, price: 0.50, label: 'Pocket Sack' },
  { id: 'pack-2', amount: 50, price: 2.50, label: 'Starter Pack' },
  { id: 'pack-3', amount: 100, price: 5.00, label: 'Vibe Chest' },
  { id: 'pack-4', amount: 500, price: 25.00, label: 'Elite Vault' },
  { id: 'pack-5', amount: 1000, price: 50.00, label: 'Sugar Master' },
  { id: 'pack-6', amount: 5000, price: 250.00, label: 'Infinite Empire' },
];

const StoreView: React.FC<StoreViewProps> = ({ user, onPurchaseSuccess, onBack }) => {
  const [selectedPack, setSelectedPack] = useState<typeof DIAMOND_PACKS[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logs, setLogs] = useState<{msg: string, status: 'ok' | 'loading' | 'pending'}[]>([]);

  // Real Live Client ID provided by user
  const LIVE_CLIENT_ID = "AchOwxrubWXLdT64U9AmBydM9n7EEgA_psh3nXWi0PPhRvxZRtdHNCpXYxggnKV-dMef3JGMMzdeGvEW";

  const handleSelectPack = (pack: typeof DIAMOND_PACKS[0]) => {
    setSelectedPack(pack);
    setLogs([]);
  };

  const handleApprove = async (data: any) => {
    setIsProcessing(true);
    const newLogs: typeof logs = [
      { msg: 'PayPal Authorization Received', status: 'ok' },
      { msg: `Order ID: ${data.orderID}`, status: 'ok' },
      { msg: 'Contacting Secure Database...', status: 'loading' },
      { msg: 'Capturing Funds to Admin Wallet...', status: 'pending' },
      { msg: 'Syncing User Gem Balance...', status: 'pending' },
    ];
    setLogs([...newLogs]);

    // Secure server-side capture simulation
    const result = await db.capturePaypalOrder(
      data.orderID,
      user.email,
      selectedPack!.amount,
      selectedPack!.price
    );

    if (result.success) {
      newLogs[2].status = 'ok';
      newLogs[3].status = 'ok';
      newLogs[4].status = 'ok';
      setLogs([...newLogs]);

      onPurchaseSuccess();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      setSelectedPack(null);
    } else {
      alert(result.message);
    }
    setIsProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-6 overflow-y-auto pb-32 hide-scrollbar">
      {/* Vault Balance Display */}
      <div className="flex items-center justify-between px-4 mt-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Gem Vault</h1>
          <p className="text-[10px] text-pink-500 font-black uppercase tracking-[0.3em] mt-1">Live Database Connection Active</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900 rounded-2xl border border-white/5 shadow-2xl">
           <i className="fa-solid fa-gem text-cyan-400 text-sm"></i>
           <span className="text-xl font-black text-white">{user.diamonds.toLocaleString()}</span>
        </div>
      </div>

      {/* Packs Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 px-4">
        {DIAMOND_PACKS.map((pack) => (
          <div 
            key={pack.id} 
            className={`glass-panel p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group ${selectedPack?.id === pack.id ? 'border-pink-500 bg-pink-500/10' : 'border-white/5 hover:border-pink-500/20 hover:bg-white/[0.02]'}`}
            onClick={() => handleSelectPack(pack)}
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
                 <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Authenticated Live Gateway</h4>
                 <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase tracking-tighter">
                    Using Live credentials. Funds go directly to the Admin wallet. Gems are granted only upon "COMPLETED" status from PayPal API.
                 </p>
              </div>
           </div>
           <button onClick={onBack} className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] hover:text-white transition-colors">Return to Elite Hub</button>
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedPack && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md glass-panel p-8 rounded-[3rem] border-white/10 shadow-2xl space-y-6 relative overflow-hidden text-center">
            <div className="absolute top-6 right-6">
              <button onClick={() => setSelectedPack(null)} disabled={isProcessing} className="text-zinc-600 hover:text-white transition-all disabled:opacity-0">
                 <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-cyan-600/20 flex items-center justify-center text-3xl text-cyan-400 mx-auto shadow-2xl mb-2">
                <i className="fa-solid fa-gem"></i>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Secure Checkout</h3>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Gems to be added: {selectedPack.amount.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Value</span>
               <span className="text-xl font-black text-white">${selectedPack.price.toFixed(2)} USD</span>
            </div>

            {isProcessing ? (
               <div className="space-y-6 animate-in zoom-in duration-300">
                <div className="p-6 bg-zinc-950 border border-white/10 rounded-[2rem] text-left space-y-3">
                    {logs.map((log, i) => (
                      <div key={i} className={`flex items-center gap-3 transition-opacity ${log.status === 'pending' ? 'opacity-20' : 'opacity-100'}`}>
                        {log.status === 'ok' ? (
                          <i className="fa-solid fa-circle-check text-green-500 text-[10px]"></i>
                        ) : log.status === 'loading' ? (
                          <i className="fa-solid fa-circle-notch animate-spin text-indigo-400 text-[10px]"></i>
                        ) : (
                          <i className="fa-solid fa-circle text-zinc-800 text-[10px]"></i>
                        )}
                        <span className={`text-[9px] font-black uppercase tracking-widest ${log.status === 'loading' ? 'text-white' : 'text-zinc-500'}`}>
                          {log.msg}
                        </span>
                      </div>
                    ))}
                </div>
                <p className="text-[8px] text-indigo-400 font-black uppercase animate-pulse">Running Server-Side Capture...</p>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-left ml-2">Pay with PayPal (LIVE)</p>
                <div className="relative z-0">
                   <PayPalScriptProvider options={{ "client-id": LIVE_CLIENT_ID, currency: "USD" }}>
                      <PayPalButtons 
                        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [{
                              description: `My Doll Gems - Pack: ${selectedPack.amount}`,
                              amount: { value: selectedPack.price.toString() }
                            }]
                          });
                        }}
                        onApprove={handleApprove}
                      />
                   </PayPalScriptProvider>
                </div>
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
              <span>Payment Captured Successfully. Your Vault is Replenished.</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default StoreView;
