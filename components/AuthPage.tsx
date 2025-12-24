
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
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full"></div>

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
          <div className="w-16 h-16 rounded-2xl stream-gradient flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-2">
            <i className="fa-solid fa-broadcast-tower text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Join GeminiLive'}
          </h1>
          <p className="text-zinc-500 text-sm text-center">
            {isLogin ? 'Sign in to start your next stream' : 'Create an account to start sharing your talent'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm"></i>
                <input
                  required
                  type="text"
                  placeholder="Enter your name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm"></i>
              <input
                required
                type="email"
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm"></i>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <button type="button" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 mt-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98]"
          >
            {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-zinc-800"></div>
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">or continue with</span>
          <div className="h-[1px] flex-1 bg-zinc-800"></div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-zinc-300">
            <i className="fa-brands fa-google"></i> Google
          </button>
          <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-zinc-300">
            <i className="fa-brands fa-github"></i> GitHub
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-indigo-400 font-bold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
