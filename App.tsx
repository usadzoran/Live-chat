
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
import { db, UserDB } from './services/databaseService';
import { LanguageProvider } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<UserDB | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('feed');
  const [isInitializing, setIsInitializing] = useState(true);
  const [platformRevenue, setPlatformRevenue] = useState<number>(0);
  const [pendingReferrer, setPendingReferrer] = useState<string | null>(null);

  // Sync currentView to localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('mydoll_active_view', currentView);
    }
  }, [currentView, isAuthenticated]);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/admin-portal') {
        setShowAuth(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    const init = async () => {
      setIsInitializing(true);
      const hash = window.location.hash;
      
      // Handle Referral
      if (hash.includes('ref=')) {
        try {
          const encodedEmail = hash.split('ref=')[1];
          const decodedEmail = atob(encodedEmail);
          setPendingReferrer(decodedEmail);
        } catch (e) {
          console.error("Invalid referral link");
        }
      }

      // Restore Session
      const savedSession = localStorage.getItem('mydoll_active_user');
      const savedView = localStorage.getItem('mydoll_active_view') as ViewType;

      if (savedSession) {
        try {
          const u = await db.getUser(savedSession);
          if (u) {
            setUser(u);
            setIsAuthenticated(true);
            
            // Restore View
            if (savedView) {
              setCurrentView(savedView);
            }

            // Check Admin Status
            const isSystemAdmin = u.email === 'admin@mydoll.club' || u.name === 'wahabfresh' || u.role === 'admin';
            if (isSystemAdmin) {
              setIsAdmin(true);
              if (hash === '#/admin-portal' || !hash || hash === '#/') {
                setCurrentView('admin');
              }
            }
          } else {
            // If user no longer exists in DB, clear local session
            localStorage.removeItem('mydoll_active_user');
            localStorage.removeItem('mydoll_active_view');
          }
        } catch (e) {
          console.error("Session restoration failed", e);
        }
      }

      // Always allow showing auth if hash is admin portal even if not logged in
      if (hash === '#/admin-portal' && !savedSession) {
        setShowAuth(true);
      }

      const rev = await db.getPlatformRevenue();
      setPlatformRevenue(rev);
      
      // Artificial slight delay for a smooth professional transition
      setTimeout(() => setIsInitializing(false), 800);
    };

    init();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogin = async (name: string, email: string, password?: string) => {
    const isAdminUser = 
      (email === 'wahabfresh' || name === 'wahabfresh' || email === 'admin@mydoll.club') && 
      password === 'vampirewahab31';
    
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
        referredBy: pendingReferrer || undefined,
        referralCount: 0,
        role: isAdminUser ? 'admin' : 'doll'
      });
      setPendingReferrer(null);
    }

    if (isAdminUser || u.role === 'admin' || window.location.hash === '#/admin-portal') {
      setIsAdmin(true);
      setCurrentView('admin');
    }
    
    setUser(u);
    setIsAuthenticated(true);
    localStorage.setItem('mydoll_active_user', email);
    
    if (window.location.hash !== '#/admin-portal') {
      window.location.hash = '';
    }
  };

  const handleUpdateUser = async (updatedData: Partial<UserDB>) => {
    if (!user) return;
    const updated = await db.upsertUser({ ...user, ...updatedData });
    setUser(updated);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setShowAuth(false);
    setUser(null);
    setCurrentView('feed');
    window.location.hash = '';
    localStorage.removeItem('mydoll_active_user');
    localStorage.removeItem('mydoll_active_view');
  };

  const handlePurchaseSuccess = async () => {
    if (!user) return;
    const freshUser = await db.getUser(user.email);
    const freshRev = await db.getPlatformRevenue();
    setUser(freshUser);
    setPlatformRevenue(freshRev);
  };

  // Professional Loading Screen
  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-[2rem] stream-gradient animate-pulse flex items-center justify-center shadow-[0_0_50px_rgba(244,114,182,0.3)]">
            <i className="fa-solid fa-face-grin-stars text-white text-3xl animate-bounce"></i>
          </div>
          <div className="absolute inset-0 border-2 border-white/10 rounded-[2.2rem] scale-110 animate-spin duration-[3s]"></div>
        </div>
        <div className="text-center">
          <h2 className="text-white font-black tracking-[0.4em] uppercase text-xs mb-2">My Doll Club</h2>
          <p className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.6em]">Initializing Elite Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showAuth) {
      return <AuthPage onLogin={handleLogin} onBack={() => {
        setShowAuth(false);
        window.location.hash = '';
      }} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return <ProfileView user={user!} onUpdate={handleUpdateUser} onBack={() => setCurrentView('feed')} onNavigate={setCurrentView} />;
      case 'feed':
        return <FeedPage user={user!} />;
      case 'messages':
        return <MessagesView currentUser={user!} />;
      case 'discovery':
        return <DiscoveryView />;
      case 'live':
        return <LiveBroadcasterView />;
      case 'admin':
        return <AdminDashboard totalRevenue={platformRevenue} />;
      case 'store':
        return <StoreView 
          user={user!}
          onPurchaseSuccess={handlePurchaseSuccess}
          onBack={() => setCurrentView('feed')} 
        />;
      default:
        return <FeedPage user={user!} />;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950 font-sans text-zinc-100 selection:bg-pink-500/30 overflow-hidden">
      <Header 
        user={user} 
        isAdmin={isAdmin}
        onLogout={handleLogout} 
        onNavigate={setCurrentView} 
      />
      
      <main className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 ${currentView === 'admin' ? 'p-0' : 'p-3 pb-24 md:p-6 md:pb-8 lg:p-8 lg:pb-12'} overflow-hidden`}>
          {renderContent()}
        </div>
      </main>

      {currentView !== 'admin' && (
        <BottomNav 
          activeView={currentView} 
          onNavigate={setCurrentView} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;
