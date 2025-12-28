
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

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<UserDB | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('feed');
  const [platformRevenue, setPlatformRevenue] = useState<number>(0);

  // Load from Database on mount
  useEffect(() => {
    const init = async () => {
      const savedSession = localStorage.getItem('mydoll_active_user');
      if (savedSession) {
        const u = await db.getUser(savedSession);
        if (u) {
          setUser(u);
          setIsAuthenticated(true);
          // Check if it's admin
          if (u.email === 'admin@mydoll.club' || u.name === 'wahabfresh') {
            setIsAdmin(true);
          }
        }
      }
      const rev = await db.getPlatformRevenue();
      setPlatformRevenue(rev);
    };
    init();
  }, []);

  const handleLogin = async (name: string, email: string, password?: string) => {
    const isAdminUser = 
      (email === 'wahabfresh' || name === 'wahabfresh' || email === 'admin@mydoll.club') && 
      password === 'vampirewahab31';
    
    let u = await db.getUser(email);
    if (!u) {
      // Added missing mandatory properties for UserDB: usd_balance and withdrawals
      u = await db.upsertUser({ 
        name, 
        email, 
        diamonds: isAdminUser ? 99999 : 50,
        bio: isAdminUser ? "Master Node Administrator" : "Elite member",
        usd_balance: 0,
        withdrawals: []
      });
    }

    if (isAdminUser || window.location.hash === '#/admin-portal') {
      setIsAdmin(true);
      setCurrentView('admin');
    }
    
    setUser(u);
    setIsAuthenticated(true);
    localStorage.setItem('mydoll_active_user', email);
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
  };

  // This is called after a successful "capture" from the store
  const handlePurchaseSuccess = async () => {
    if (!user) return;
    const freshUser = await db.getUser(user.email);
    const freshRev = await db.getPlatformRevenue();
    setUser(freshUser);
    setPlatformRevenue(freshRev);
  };

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

export default App;
