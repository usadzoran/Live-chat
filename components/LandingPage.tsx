
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { t, isRTL } = useTranslation();
  const [clickCount, setClickCount] = useState(0);
  const [showOverride, setShowOverride] = useState(false);

  // Reset click count after 2 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => setClickCount(0), 2000);
    return () => clearTimeout(timer);
  }, [clickCount]);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 5) {
      setShowOverride(true);
      setTimeout(() => {
        window.location.hash = '#/admin-portal';
        onGetStarted();
      }, 1000);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-zinc-950 flex flex-col relative overflow-hidden text-white">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-zinc-900">
        <img 
          src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Luxury" 
          className="w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
        <div className={`absolute inset-0 bg-gradient-to-${isRTL ? 'l' : 'r'} from-zinc-950 via-transparent to-transparent`}></div>
      </div>

      {/* Secret Override Overlay */}
      {showOverride && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono">
           <div className="text-cyan-500 animate-pulse text-xl font-black mb-4">
             [ SYSTEM OVERRIDE ]
           </div>
           <div className="w-64 h-1 bg-zinc-900 rounded-full overflow-hidden">
             <div className="h-full bg-cyan-500 animate-[move-gradient_1s_ease_infinite] w-full"></div>
           </div>
           <p className="mt-4 text-[10px] text-cyan-800 uppercase tracking-[0.5em]">Initializing Admin Protocol...</p>
        </div>
      )}

      <nav className="absolute top-0 w-full h-20 flex items-center justify-between px-6 z-50">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group"
          onClick={handleLogoClick}
        >
          <div className={`w-10 h-10 rounded-xl stream-gradient flex items-center justify-center shadow-2xl transition-all duration-300 ${clickCount > 0 ? 'scale-110 shadow-cyan-500/50' : 'group-hover:scale-105'}`}>
            <i className={`fa-solid fa-face-grin-stars text-white text-xl ${clickCount > 0 ? 'text-cyan-200' : ''}`}></i>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tighter leading-none">My Doll</h1>
            <p className="text-[8px] text-pink-500 uppercase tracking-widest font-black">Elite Circle</p>
          </div>
          {clickCount > 0 && (
            <div className="ml-4 flex gap-1">
              {Array.from({ length: clickCount }).map((_, i) => (
                <div key={i} className="w-1 h-1 bg-cyan-500 rounded-full animate-ping"></div>
              ))}
            </div>
          )}
        </div>
        <button 
          onClick={onGetStarted}
          className="px-5 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-[9px] font-black tracking-widest transition-all uppercase"
        >
          ENTER
        </button>
      </nav>

      <div className={`relative z-10 flex-1 flex flex-col justify-center px-6 md:px-20 max-w-6xl ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className={`space-y-4 md:space-y-8 animate-in fade-in slide-in-from-${isRTL ? 'right' : 'left'}-8 duration-1000`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full">
            <span className="text-[8px] md:text-[10px] font-black text-pink-400 uppercase tracking-widest">{t('elite_discovery')}</span>
          </div>
          
          <h1 className="text-4xl md:text-8xl font-black leading-[1.1] tracking-tighter">
            {isRTL ? 'اكتشاف النخبة' : 'Elite Meets'} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-400 to-purple-500 animate-gradient">
               {isRTL ? 'الفن الرقمي.' : 'Digital Art.'}
            </span>
          </h1>
          
          <p className="text-sm md:text-xl text-zinc-500 max-w-xl leading-relaxed">
             {isRTL ? 'مرحباً بكم في الوجهة الأولى للصفوة. اعثر على رفيقك المثالي في الوقت الفعلي.' : 'Welcome to the premier destination for high-end digital companionship. Find your perfect Doll in real-time.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-pink-600 text-white hover:bg-pink-500 font-black text-xs rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              {t('be_member')}
              <i className="fa-solid fa-crown text-[10px]"></i>
            </button>
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-zinc-900/80 border border-white/5 text-zinc-100 font-black text-xs rounded-2xl transition-all active:scale-95"
            >
               {isRTL ? 'عرض المعرض' : 'VIEW THE GALLERY'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
