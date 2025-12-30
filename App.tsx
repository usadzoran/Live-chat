
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

  // Persistence: Use Firebase Auth Listener instead of localStorage
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsInitializing(true);
      
      if (firebaseUser) {
        // Find user by email (linked to Firebase Auth or our custom store)
        // Note: For simplicity, we use the email as the link
        const email = firebaseUser.email || firebaseUser.uid; 
        const u = await db.getUser(email);
        
        if (u) {
          setUser(u);
          setIsAuthenticated(true);
          setIsAdmin(u.role === 'admin' || u.email === 'admin@mydoll.club');
          
          // Restore View directly from Database
          if (u.lastActiveView) {
            setCurrentView(u.lastActiveView);
          }
          
          if (window.location.hash === '#/admin-portal' && (u.role === 'admin' || u.email === 'admin@mydoll.club')) {
            setCurrentView('admin');
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
      }

      const rev = await db.getPlatformRevenue();
      setPlatformRevenue(rev);
      
      setTimeout(() => setIsInitializing(false), 1200);
    });

    return () => unsubscribe();
  }, []);

  // Sync Current View to Database on change
  useEffect(() => {
    if (isAuthenticated && user) {
      db.updateViewPreference(user.email, currentView);
    }
  }, [currentView, isAuthenticated, user]);

  const handleLogin = async (name: string, email: string, password?: string) => {
    const isAdminUser = 
      (email === 'wahabfresh' || name === 'wahabfresh' || email === 'admin@mydoll.club') && 
      password === 'vampirewahab31';
    
    // In a real app, you'd use signInWithEmailAndPassword. 
    // Here we use anonymous sign-in or a simple link to simulate auth without setup complexity.
    await signInAnonymously(auth);
    
    let u = await db.getUser(email);
    if (!u) {
      u = await db.upsertUser({ 
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
  };

  const handleLogout = async () => {
    await db.logout();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    setCurrentView('feed');
    window.location.hash = '';
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-[2.5rem] stream-gradient animate-pulse flex items-center justify-center shadow-[0_0_80px_rgba(244,114,182,0.4)]">
            <i className="fa-solid fa-face-grin-stars text-white text-4xl animate-bounce"></i>
          </div>
          <div className="absolute inset-0 border-2 border-white/10 rounded-[2.8rem] scale-125 animate-spin duration-[4s]"></div>
        </div>
        <div className="text-center animate-in fade-in zoom-in duration-1000">
          <h2 className="text-white font-black tracking-[0.6em] uppercase text-[10px] mb-2">My Doll Club</h2>
          <p className="text-zinc-800 text-[8px] font-black uppercase tracking-[0.8em]">Cloud Syncing Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showAuth ? <AuthPage onLogin={handleLogin} onBack={() => setShowAuth(false)} /> : <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950 font-sans text-zinc-100 overflow-hidden">
      <Header user={user} isAdmin={isAdmin} onLogout={handleLogout} onNavigate={setCurrentView} />
      <main className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 ${currentView === 'admin' ? 'p-0' : 'p-3 pb-24 md:p-6 md:pb-8 lg:p-8 lg:pb-12'}`}>
          {currentView === 'profile' && <ProfileView user={user!} onUpdate={setUser} onBack={() => setCurrentView('feed')} onNavigate={setCurrentView} />}
          {currentView === 'feed' && <FeedPage user={user!} />}
          {currentView === 'messages' && <MessagesView currentUser={user!} />}
          {currentView === 'discovery' && <DiscoveryView />}
          {currentView === 'live' && <LiveBroadcasterView />}
          {currentView === 'admin' && <AdminDashboard totalRevenue={platformRevenue} />}
          {currentView === 'store' && <StoreView user={user!} onPurchaseSuccess={() => db.getUser(user!.email).then(setUser)} onBack={() => setCurrentView('feed')} />}
        </div>
      </main>
      {currentView !== 'admin' && <BottomNav activeView={currentView} onNavigate={setCurrentView} />}
    </div>
  );
};

const App: React.FC = () => <LanguageProvider><AppContent /></LanguageProvider>;
export default App;
