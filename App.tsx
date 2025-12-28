
import React, { useState } from 'react';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import ProfileView from './components/ProfileView';
import LandingPage from './components/LandingPage';
import PaymentModal from './components/PaymentModal';
import FeedPage from './components/FeedPage';
import MessagesView from './components/MessagesView';
import DiscoveryView from './components/DiscoveryView';
import BottomNav from './components/BottomNav';
import { ViewType } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; bio?: string } | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('feed');

  const handleLogin = (name: string, email: string) => {
    setUser({ name, email, bio: "Digital creator and AI enthusiast." });
    setIsAuthenticated(true);
  };

  const handleUpdateUser = (updatedData: { name: string; email: string; bio?: string }) => {
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowAuth(false);
    setUser(null);
    setCurrentView('feed');
  };

  if (!isAuthenticated) {
    if (showAuth) {
      return <AuthPage onLogin={handleLogin} onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return (
          <div className="h-full animate-in fade-in slide-in-from-right-8 duration-500">
            <ProfileView 
              user={user!} 
              onUpdate={handleUpdateUser} 
              onBack={() => setCurrentView('feed')} 
            />
          </div>
        );
      case 'feed':
        return (
          <div className="h-full animate-in fade-in slide-in-from-left-8 duration-500">
            <FeedPage user={user!} />
          </div>
        );
      case 'messages':
        return (
          <div className="h-full animate-in fade-in slide-in-from-bottom-8 duration-500">
            <MessagesView currentUser={user!} />
          </div>
        );
      case 'discovery':
        return (
          <div className="h-full animate-in fade-in zoom-in duration-500">
            <DiscoveryView />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 font-sans">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={setCurrentView} 
      />
      
      <main className="flex-1 overflow-hidden p-4 pb-24">
        {renderContent()}
      </main>

      <BottomNav 
        activeView={currentView} 
        onNavigate={setCurrentView} 
      />

      {showPayment && (
        <PaymentModal 
          streamerName={user?.name || "the creator"} 
          onClose={() => setShowPayment(false)} 
        />
      )}
    </div>
  );
};

export default App;
