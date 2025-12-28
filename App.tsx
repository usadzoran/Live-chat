
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
import BottomNav from './components/BottomNav';
import { ViewType } from './types';

const SESSION_KEY = 'mydoll_session_v1';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; bio?: string; avatar?: string; cover?: string } | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('feed');

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const { user: savedUser, isAdmin: savedIsAdmin } = JSON.parse(savedSession);
        setUser(savedUser);
        setIsAdmin(savedIsAdmin);
        setIsAuthenticated(true);
        // If they were on admin, stay on admin, else go to feed
        if (savedIsAdmin && window.location.hash === '#/admin-portal') {
          setCurrentView('admin');
        }
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  // Sync session to localStorage whenever auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user, isAdmin }));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [isAuthenticated, user, isAdmin]);

  // Secret Link Detection
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/admin-portal') {
        setShowAuth(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check on mount
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogin = (name: string, email: string, password?: string) => {
    const isAdminUser = 
      (email === 'wahabfresh' || name === 'wahabfresh' || email === 'admin@mydoll.club') && 
      password === 'vampirewahab31';
    
    const isPortalAccess = window.location.hash === '#/admin-portal';

    let loggedInUser;
    if (isAdminUser || isPortalAccess) {
      setIsAdmin(true);
      setCurrentView('admin');
      loggedInUser = { 
        name: isAdminUser ? 'Wahab Fresh' : name, 
        email: isAdminUser ? 'admin@mydoll.club' : email, 
        bio: "Master Node Administrator. System access granted." 
      };
    } else {
      loggedInUser = { name, email, bio: "Elite member and digital connoisseur." };
    }
    
    setUser(loggedInUser);
    setIsAuthenticated(true);
  };

  const handleUpdateUser = (updatedData: Partial<{ name: string; email: string; bio?: string; avatar?: string; cover?: string }>) => {
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setShowAuth(false);
    setUser(null);
    setCurrentView('feed');
    window.location.hash = '';
    localStorage.removeItem(SESSION_KEY);
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
        return <ProfileView user={user!} onUpdate={handleUpdateUser} onBack={() => setCurrentView('feed')} />;
      case 'feed':
        return <FeedPage user={user!} />;
      case 'messages':
        return <MessagesView currentUser={user!} />;
      case 'discovery':
        return <DiscoveryView />;
      case 'live':
        return <LiveBroadcasterView />;
      case 'admin':
        return <AdminDashboard />;
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
