
import React, { useState } from 'react';

interface AuthPageProps {
  onLogin: (name: string, email: string) => void;
  onBack?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth logic
    onLogin(formData.name || formData.email.split('@')[0], formData.email);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-pink-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full"></div>

      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest z-50"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back to home
        </button>
      )}

      <div className="w-full max-w-md glass-panel p-8 rounded-[2.5rem] relative z-10 shadow-2xl border-white/5 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-16 h-16 rounded-3xl stream-gradient flex items-center justify-center shadow-2xl shadow-pink-500/30 mb-4">
            <i className="fa-solid fa-face-grin-stars text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            {isLogin ? 'Member Login' : 'Join Elite Circle'}
          </h1>
          <p className="text-zinc-500 text-sm text-center">
            {isLogin 
              ? 'Connect with your favorite Dolls or Mentors' 
              : 'Sign up as a Mentor or a Doll today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nickname</label>
              <div className="relative">
                <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm"></i>
                <input
                  required
                  type="text"
                  placeholder="e.g. VIP_Mentor"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm"></i>
              <input
                required
                type="email"
                placeholder="vip@mydoll.club"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm"></i>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-4 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs tracking-widest transition-all active:scale-[0.98] shadow-2xl shadow-pink-600/20"
          >
            {isLogin ? 'ACCESS CLUB' : 'START JOURNEY'}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-zinc-800"></div>
          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">secure identity</span>
          <div className="h-[1px] flex-1 bg-zinc-800"></div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500">
          {isLogin ? "New to the elite circle?" : "Already a member?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-pink-400 font-bold hover:underline"
          >
            {isLogin ? 'Join My Doll' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
