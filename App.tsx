
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

  // Sync currentView to localStorage whenever it changes to persist navigation state
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('mydoll_active_view', currentView);
    }
  }, [currentView, isAuthenticated]);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/admin-portal' && !isAuthenticated) {
        setShowAuth(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    const init = async () => {
      setIsInitializing(true);
      const hash = window.location.hash;
      
      // Handle Referral logic
      if (hash.includes('ref=')) {
        try {
          const encodedEmail = hash.split('ref=')[1];
          const decodedEmail = atob(encodedEmail);
          setPendingReferrer(decodedEmail);
        } catch (e) {
          console.error("Invalid referral link");
        }
      }

      // 🔐 RESTORE SESSION: Check if user was previously logged in
      const savedSession = localStorage.getItem('mydoll_active_user');
      const savedView = localStorage.getItem('mydoll_active_view') as ViewType;

      if (savedSession) {
        try {
          // Fetch fresh data from DB to ensure session is still valid
          const u = await db.getUser(savedSession);
          if (u) {
            setUser(u);
            setIsAuthenticated(true);
            
            // Restore last active view or default to feed
            if (savedView) {
              setCurrentView(savedView);
            }

            // Check Admin Status based on role or specific admin emails
            const isSystemAdmin = u.role === 'admin' || u.email === 'admin@mydoll.club' || u.name === 'wahabfresh';
            if (isSystemAdmin) {
              setIsAdmin(true);
              // If admin portal hash is present, force admin view
              if (hash === '#/admin-portal') {
                setCurrentView('admin');
              }
            }
          } else {
            // User not found in DB, clear local stale session
            localStorage.removeItem('mydoll_active_user');
            localStorage.removeItem('mydoll_active_view');
          }
        } catch (e) {
          console.error("Session restoration failed", e);
        }
      }

      // Handle direct navigation to admin portal
      if (hash === '#/admin-portal' && !savedSession) {
        setShowAuth(true);
      }

      // Load platform revenue for admin context if needed
      const rev = await db.getPlatformRevenue();
      setPlatformRevenue(rev);
      
      // Professional loading transition
      setTimeout(() => setIsInitializing(false), 1200);
    };

    init();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogin = async (name: string, email: string, password?: string) => {
    // Admin credentials bypass/override
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
    
    // Save to localStorage for persistence
    localStorage.setItem('mydoll_active_user', email);
    localStorage.setItem('mydoll_active_view', u.role === 'admin' ? 'admin' : 'feed');
    
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
    // ONLY clear when explicitly requested
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

  // Loading Screen (Professional UX)
  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-[2.5rem] stream-gradient animate-pulse flex items-center justify-center shadow-[0_0_80px_rgba(244,114,182,0.4)]">
            <i className="fa-solid fa-face-grin-stars text-white text-4xl animate-bounce"></i>
          </div>
          <div className="absolute inset-0 border-2 border-white/5 rounded-[2.8rem] scale-125 animate-spin duration-[4s]"></div>
        </div>
        <div className="text-center animate-in fade-in zoom-in duration-1000">
          <h2 className="text-white font-black tracking-[0.5em] uppercase text-xs mb-3">My Doll Club</h2>
          <p className="text-zinc-800 text-[10px] font-black uppercase tracking-[0.8em]">Restoring Secure Session...</p>
        </div>
      </div>
    );
  }

  // Auth Routing
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
