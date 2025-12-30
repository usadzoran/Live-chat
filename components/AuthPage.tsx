
import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

interface AuthPageProps {
  onLogin: (name: string, email: string, password?: string) => void;
  onBack?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const { t, isRTL } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(formData.name || formData.email.split('@')[0], formData.email, formData.password);
  };

  const isAdminPortal = window.location.hash === '#/admin-portal';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Immersive Animated Background Decorations */}
      <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[80%] ${isAdminPortal ? 'bg-cyan-600/15' : 'bg-pink-600/15'} blur-[180px] rounded-full animate-pulse`}></div>
      <div className={`absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] ${isAdminPortal ? 'bg-indigo-600/15' : 'bg-purple-600/15'} blur-[180px] rounded-full animate-pulse`} style={{ animationDelay: '3s' }}></div>
      
      {/* Floating Geometric Orbs */}
      <div className="absolute top-[10%] right-[5%] w-32 h-32 border border-white/5 rounded-[3rem] rotate-12 animate-float hidden lg:block opacity-40"></div>
      <div className="absolute bottom-[15%] left-[5%] w-40 h-40 border border-white/5 rounded-[4rem] -rotate-12 animate-float hidden lg:block opacity-40" style={{ animationDelay: '4s' }}></div>

      {onBack && (
        <button 
          onClick={onBack}
          className={`absolute top-8 ${isRTL ? 'right-8' : 'left-8'} flex items-center gap-3 text-zinc-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.3em] z-50 group`}
        >
          <i className={`fa-solid ${isRTL ? 'fa-arrow-right' : 'fa-arrow-left'} group-hover:${isRTL ? 'translate-x-1' : '-translate-x-1'} transition-transform`}></i>
          {isRTL ? 'العودة للرئيسية' : 'Back to home'}
        </button>
      )}

      <div className="w-full max-w-[460px] relative z-10 flex flex-col items-center">
        {/* Dynamic Logo Section */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-top-12 duration-1000">
           <div className={`w-24 h-24 rounded-[2.5rem] mx-auto ${isAdminPortal ? 'bg-cyan-600 shadow-cyan-600/40' : 'stream-gradient shadow-pink-600/40'} flex items-center justify-center shadow-2xl mb-8 relative group overflow-hidden transition-transform duration-500 hover:scale-105`}>
              <i className={`fa-solid ${isAdminPortal ? 'fa-shield-halved' : 'fa-face-grin-stars'} text-white text-4xl relative z-10`}></i>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
           </div>
           <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-2 italic">
             {isAdminPortal ? 'System Node' : (isLogin ? (isRTL ? 'تسجيل الدخول' : 'Access Club') : (isRTL ? 'انضم للنخبة' : 'Elite Entry'))}
           </h1>
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
             {isAdminPortal 
               ? 'Secured Administrative Terminal' 
               : (isLogin ? (isRTL ? 'تواصل مع الدمى والمدربين المفضلين لديك' : 'The destination for refined connections') : (isRTL ? 'سجل كمدرب أو دمية اليوم' : 'Enter the world of high-end companionship'))}
           </p>
        </div>

        {/* Premium Auth Card */}
        <div className="w-full glass-panel p-10 lg:p-12 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border-white/10 animate-in fade-in zoom-in duration-700 relative overflow-hidden group/card">
          {/* Internal Shimmer */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 blur-3xl rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {!isLogin && !isAdminPortal && (
              <div className="space-y-2 animate-in slide-in-from-left-4 duration-500">
                <label className={`text-[11px] font-black text-zinc-500 uppercase tracking-widest ${isRTL ? 'mr-2' : 'ml-2'}`}>
                  {isRTL ? 'الاسم المستعار' : 'Avatar Identity'}
                </label>
                <div className="relative group/input">
                  <i className={`fa-solid fa-user absolute ${isRTL ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-zinc-600 text-sm group-focus-within/input:text-pink-500 transition-colors`}></i>
                  <input
                    required
                    type="text"
                    placeholder={isRTL ? 'مثلاً: VIP_Persona' : 'e.g. VIP_Persona'}
                    className={`w-full bg-black/40 border border-white/5 rounded-3xl py-5 ${isRTL ? 'pr-16 pl-6' : 'pl-16 pr-6'} text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/5 transition-all shadow-inner`}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className={`text-[11px] font-black text-zinc-500 uppercase tracking-widest ${isRTL ? 'mr-2' : 'ml-2'}`}>
                {isRTL ? 'البريد أو المعرف' : 'Credential / Email'}
              </label>
              <div className="relative group/input">
                <i className={`fa-solid fa-envelope absolute ${isRTL ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-zinc-600 text-sm group-focus-within/input:text-pink-500 transition-colors`}></i>
                <input
                  required
                  type="text"
                  placeholder={isAdminPortal ? "Vault Auth Key" : (isRTL ? "البريد الإلكتروني" : "member@mydoll.club")}
                  className={`w-full bg-black/40 border border-white/5 rounded-3xl py-5 ${isRTL ? 'pr-16 pl-6' : 'pl-16 pr-6'} text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/5 transition-all shadow-inner`}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-[11px] font-black text-zinc-500 uppercase tracking-widest ${isRTL ? 'mr-2' : 'ml-2'}`}>
                {isRTL ? 'الرقم السري' : 'Security Pin'}
              </label>
              <div className="relative group/input">
                <i className={`fa-solid fa-lock absolute ${isRTL ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-zinc-600 text-sm group-focus-within/input:text-pink-500 transition-colors`}></i>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-black/40 border border-white/5 rounded-3xl py-5 ${isRTL ? 'pr-16 pl-6' : 'pl-16 pr-6'} text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/5 transition-all shadow-inner`}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-6 mt-6 rounded-3xl ${isAdminPortal ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30' : 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/30'} text-white font-black text-[11px] uppercase tracking-[0.4em] transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden group/btn`}
            >
              <span className="relative z-10">{isAdminPortal ? 'INITIALIZE SYSTEM' : (isLogin ? (isRTL ? 'دخول النادي' : 'INITIALIZE ACCESS') : (isRTL ? 'ابدأ الرحلة' : 'CREATE ACCOUNT'))}</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-700 skew-x-[-20deg]"></div>
            </button>
          </form>

          <div className="mt-10 flex items-center gap-6">
            <div className="h-[1px] flex-1 bg-white/5"></div>
            <span className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.5em] whitespace-nowrap">{isRTL ? 'هوية آمنة' : 'exclusive encryption'}</span>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>

          {!isAdminPortal && (
            <p className="mt-10 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
              {isLogin ? (isRTL ? "جديد في النادي؟" : "New member?") : (isRTL ? "بالفعل عضو؟" : "Part of the circle?") }
              <button
                onClick={() => setIsLogin(!isLogin)}
                className={`ml-3 ${isAdminPortal ? 'text-cyan-400' : 'text-pink-500'} font-black hover:text-white transition-colors underline underline-offset-8`}
              >
                {isLogin ? (isRTL ? 'انضم إلينا' : 'Apply Now') : (isRTL ? 'تسجيل الدخول' : 'Sign-in')}
              </button>
            </p>
          )}
        </div>
        
        {/* Verification Badge */}
        <div className="mt-16 flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-700 cursor-default">
           <i className="fa-solid fa-crown text-zinc-500"></i>
           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.6em]">The Gold Standard Of Social Networking</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
