
import React, { useState } from 'react';

interface PaymentModalProps {
  streamerName: string;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ streamerName, onClose }) => {
  const [method, setMethod] = useState<'paypal' | 'card'>('card');
  const [amount, setAmount] = useState<number>(10);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const amounts = [5, 10, 25, 50, 100];

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
    }, 2000);
  };

  if (completed) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
        <div className="w-full max-w-sm glass-panel p-8 rounded-[2.5rem] border-white/5 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-6 text-3xl">
            <i className="fa-solid fa-check"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Support Sent!</h2>
          <p className="text-sm text-zinc-400 mb-8">You just sent ${amount.toFixed(2)} to {streamerName}. They've been notified!</p>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all"
          >
            BACK TO STREAM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="w-full max-w-md glass-panel rounded-[2.5rem] border-white/5 shadow-2xl relative z-10 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
        {/* Header */}
        <div className="p-8 pb-4">
          <button onClick={onClose} className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
          <h2 className="text-2xl font-bold text-white mb-1">Support {streamerName}</h2>
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Send a digital gift to show your appreciation</p>
        </div>

        {/* Amount Selection */}
        <div className="px-8 mb-6">
           <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 block">Select Amount</label>
           <div className="grid grid-cols-5 gap-2">
             {amounts.map((a) => (
               <button 
                 key={a}
                 onClick={() => setAmount(a)}
                 className={`py-2 rounded-xl text-xs font-bold transition-all border ${amount === a ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'}`}
               >
                 ${a}
               </button>
             ))}
           </div>
           <div className="mt-3 relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">$</span>
             <input 
               type="number"
               className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
               placeholder="Custom amount"
               value={amount}
               onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
             />
           </div>
        </div>

        {/* Payment Methods */}
        <div className="px-8 mb-6">
           <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 block">Payment Method</label>
           <div className="flex gap-4">
             <button 
               onClick={() => setMethod('card')}
               className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl border transition-all ${method === 'card' ? 'bg-zinc-800 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-zinc-500'}`}
             >
               <i className="fa-solid fa-credit-card"></i>
               <span className="text-xs font-bold uppercase tracking-wider">Card</span>
             </button>
             <button 
               onClick={() => setMethod('paypal')}
               className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl border transition-all ${method === 'paypal' ? 'bg-zinc-800 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-zinc-500'}`}
             >
               <i className="fa-brands fa-paypal"></i>
               <span className="text-xs font-bold uppercase tracking-wider">PayPal</span>
             </button>
           </div>
        </div>

        {/* Dynamic Form Content */}
        <form onSubmit={handlePay} className="px-8 pb-8 space-y-4">
          {method === 'card' ? (
            <div className="space-y-4 animate-in fade-in duration-300">
               <div className="space-y-1">
                 <input 
                   required
                   type="text"
                   placeholder="Cardholder Name"
                   className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                 />
               </div>
               <div className="space-y-1">
                 <input 
                   required
                   type="text"
                   placeholder="Card Number"
                   className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <input 
                   required
                   type="text"
                   placeholder="MM/YY"
                   className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                 />
                 <input 
                   required
                   type="text"
                   placeholder="CVC"
                   className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                 />
               </div>
            </div>
          ) : (
            <div className="p-6 bg-blue-600/10 border border-blue-600/20 rounded-2xl text-center animate-in fade-in duration-300">
              <i className="fa-brands fa-paypal text-3xl text-blue-400 mb-3"></i>
              <p className="text-xs text-blue-200">You will be redirected to PayPal to securely complete your donation.</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={processing || amount <= 0}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
          >
            {processing ? (
              <i className="fa-solid fa-circle-notch animate-spin"></i>
            ) : (
              `SUPPORT WITH $${amount.toFixed(2)}`
            )}
          </button>
          
          <div className="flex items-center justify-center gap-2 opacity-30">
            <i className="fa-solid fa-shield-halved text-[10px] text-zinc-500"></i>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Secure SSL Encrypted Payment</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
