
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

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; bio?: string } | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('feed');

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
    // Check for specific admin credentials or secret portal access
    const isAdminUser = 
      (email === 'wahabfresh' || name === 'wahabfresh' || email === 'admin@mydoll.club') && 
      password === 'vampirewahab31';
    
    const isPortalAccess = window.location.hash === '#/admin-portal';

    if (isAdminUser || isPortalAccess) {
      setIsAdmin(true);
      setCurrentView('admin');
      setUser({ 
        name: isAdminUser ? 'Wahab Fresh' : name, 
        email: isAdminUser ? 'admin@mydoll.club' : email, 
        bio: "Master Node Administrator. System access granted." 
      });
    } else {
      setUser({ name, email, bio: "Elite member and digital connoisseur." });
    }
    
    setIsAuthenticated(true);
  };

  const handleUpdateUser = (updatedData: { name: string; email: string; bio?: string }) => {
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setShowAuth(false);
    setUser(null);
    setCurrentView('feed');
    window.location.hash = '';
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
        <div className={`absolute inset-0 ${currentView === 'admin' ? 'p-0' : 'p-3 pb-24 md:p-6 md:pb-6'} overflow-hidden`}>
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
