import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import ProfileView from './components/ProfileView';
import LandingPage from './components/LandingPage';
import FeedPage from './components/FeedPage';
import MessagesView from './components/MessagesView';
import DiscoveryView from './components/DiscoveryView';
import LiveBroadcasterView from './components/LiveBroadcasterView';
import AdminDashboard from './components/AdminDashboard';
import StoreView from './components/StoreView';
import BottomNav from './components/BottomNav';
import { ViewType } from './types';
import { db, UserDB, auth } from './services/databaseService';
import { LanguageProvider } from './contexts/LanguageContext';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<UserDB | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('feed');
  const [isInitializing, setIsInitializing] = useState(true);
  const [platformRevenue, setPlatformRevenue] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const u = await db.getUser(firebaseUser.uid);
        if (u) {
          setUser(u);
          setIsAuthenticated(true);
          setIsAdmin(u.role === 'admin' || u.email === 'admin@mydoll.club');
          if (u.lastActiveView) setCurrentView(u.lastActiveView);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
      }
      const rev = await db.getPlatformRevenue();
      setPlatformRevenue(rev);
      setTimeout(() => setIsInitializing(false), 1500);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      db.updateViewPreference(user.uid, currentView);
    }
  }, [currentView, isAuthenticated, user]);

  const handleLogin = async (name: string, email: string, password?: string) => {
    const isAdminUser = 
      (email === 'wahabfresh' || name === 'wahabfresh' || email === 'admin@mydoll.club') && 
      password === 'vampirewahab31';
    
    try {
      const cred = await signInAnonymously(auth);
      const uid = cred.user.uid;
      
      let u = await db.getUser(uid);
      if (!u) {
        u = await db.upsertUser({ 
          uid,
          name, 
          email, 
          diamonds: isAdminUser ? 0 : 50,
          bio: isAdminUser ? "Master Node Administrator" : "Elite member",
          usd_balance: 0,
          withdrawals: [],
          album: [],
          referralCount: 0,
          role: isAdminUser ? 'admin' : 'doll',
          lastActiveView: isAdminUser ? 'admin' : 'feed'
        });
      }

      setIsAdmin(isAdminUser || u.role === 'admin');
      setUser(u);
      setIsAuthenticated(true);
      setCurrentView(u.lastActiveView || 'feed');
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await db.logout();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    setCurrentView('feed');
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-[2.5rem] stream-gradient animate-pulse flex items-center justify-center shadow-[0_0_80px_rgba(244,114,182,0.4)]">
            <i className="fa-solid fa-face-grin-stars text-white text-4xl animate-bounce"></i>
          </div>
        </div>
        <div className="text-center animate-in fade-in duration-1000">
          <h2 className="text-white font-black tracking-[0.6em] uppercase text-[10px] mb-2">My Doll Club</h2>
          <p className="text-zinc-800 text-[8px] font-black uppercase tracking-[0.8em]">Secure Cloud Protocol Active</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showAuth ? (
      <AuthPage onLogin={handleLogin} onBack={() => setShowAuth(false)} />
    ) : (
      <LandingPage onGetStarted={() => setShowAuth(true)} />
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950 font-sans text-zinc-100 overflow-hidden">
      <Header user={user} isAdmin={isAdmin} onLogout={handleLogout} onNavigate={setCurrentView} />
      <main className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 ${currentView === 'admin' ? 'p-0' : 'p-3 pb-24 md:p-6 md:pb-8 lg:p-8 lg:pb-12'}`}>
          {currentView === 'profile' && user && (
            <ProfileView 
              user={user} 
              onUpdate={setUser} 
              onBack={() => setCurrentView('feed')} 
              onNavigate={setCurrentView} 
            />
          )}
          {currentView === 'feed' && user && <FeedPage user={user} />}
          {currentView === 'messages' && user && <MessagesView currentUser={user} />}
          {currentView === 'discovery' && <DiscoveryView />}
          {currentView === 'live' && <LiveBroadcasterView user={user || undefined} />}
          {currentView === 'admin' && <AdminDashboard totalRevenue={platformRevenue} />}
          {currentView === 'store' && user && (
            <StoreView 
              user={user} 
              onPurchaseSuccess={() => db.getUser(user.uid).then(setUser)} 
              onBack={() => setCurrentView('feed')} 
            />
          )}
        </div>
      </main>
      {currentView !== 'admin' && <BottomNav activeView={currentView} onNavigate={setCurrentView} />}
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;