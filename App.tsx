
import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import StreamView from './components/StreamView';
import ChatPanel from './components/ChatPanel';
import ControlBar from './components/ControlBar';
import AuthPage from './components/AuthPage';
import ProfileView from './components/ProfileView';
import LandingPage from './components/LandingPage';
import PaymentModal from './components/PaymentModal';
import FeedPage from './components/FeedPage';
import BottomNav from './components/BottomNav';
import { ChatMessage, StreamStatus, ViewType, Gift } from './types';
import { GeminiLiveService } from './services/geminiLiveService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; bio?: string } | null>(null);
  const [userCoins, setUserCoins] = useState(10000); // Starting balance
  const [status, setStatus] = useState<StreamStatus>(StreamStatus.IDLE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('stream');
  const [streamTitle, setStreamTitle] = useState('My Awesome Talent Stream');
  
  const geminiServiceRef = useRef<GeminiLiveService | null>(null);

  const handleLogin = (name: string, email: string) => {
    setUser({ name, email, bio: "Digital creator and AI enthusiast." });
    setIsAuthenticated(true);
  };

  const handleUpdateUser = (updatedData: { name: string; email: string; bio?: string }) => {
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
  };

  const handleLogout = () => {
    if (geminiServiceRef.current) {
      geminiServiceRef.current.disconnect();
    }
    setIsAuthenticated(false);
    setShowAuth(false);
    setUser(null);
    setStatus(StreamStatus.IDLE);
    setMessages([]);
    setCurrentView('stream');
  };

  const addMessage = useCallback((sender: 'user' | 'gemini', text: string, giftData?: Partial<ChatMessage>) => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      sender,
      text,
      timestamp: new Date(),
      ...giftData
    }]);
  }, []);

  const handleSendGift = (gift: Gift) => {
    if (userCoins >= gift.cost) {
      setUserCoins(prev => prev - gift.cost);
      addMessage('user', `Sent a ${gift.name}!`, {
        isGift: true,
        giftIcon: gift.icon,
        giftName: gift.name,
        giftValue: gift.cost
      });
      
      // Simulate Gemini reaction to gift
      setTimeout(() => {
        const reactions = [
          `Wow! Thank you for the ${gift.name}! That's amazing!`,
          `Huge appreciation for the ${gift.name}! You're a legend!`,
          `That ${gift.name} looks beautiful on stream! Thank you!`,
        ];
        addMessage('gemini', reactions[Math.floor(Math.random() * reactions.length)]);
      }, 1500);
    }
  };

  const handleStartStream = async () => {
    if (status !== StreamStatus.IDLE) return;
    
    setStatus(StreamStatus.CONNECTING);
    try {
      if (!geminiServiceRef.current) {
        geminiServiceRef.current = new GeminiLiveService();
      }

      await geminiServiceRef.current.connect({
        onOpen: () => setStatus(StreamStatus.LIVE),
        onClose: () => {
          setStatus(StreamStatus.IDLE);
          addMessage('gemini', '[Stream Ended]');
        },
        onError: (err) => {
          console.error(err);
          setStatus(StreamStatus.ERROR);
        },
        onTranscription: (sender, text) => {
          addMessage(sender, text);
        }
      });
    } catch (error) {
      console.error("Connection failed", error);
      setStatus(StreamStatus.ERROR);
    }
  };

  const handleStopStream = () => {
    if (geminiServiceRef.current) {
      geminiServiceRef.current.disconnect();
    }
    setStatus(StreamStatus.IDLE);
  };

  const toggleMic = () => {
    const newState = !isMicMuted;
    setIsMicMuted(newState);
    if (geminiServiceRef.current) {
      geminiServiceRef.current.setMicEnabled(!newState);
    }
  };

  const toggleCam = () => {
    const newState = !isCamOff;
    setIsCamOff(newState);
    if (geminiServiceRef.current) {
      geminiServiceRef.current.setCamEnabled(!newState);
    }
  };

  if (!isAuthenticated) {
    if (showAuth) {
      return <AuthPage onLogin={handleLogin} onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'stream':
        return (
          <div className="h-full flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex-1 flex flex-col gap-4 relative min-h-0">
              <StreamView 
                status={status} 
                isCamOff={isCamOff} 
                title={streamTitle}
                onTitleChange={setStreamTitle}
              />
              <ControlBar 
                status={status}
                isMicMuted={isMicMuted}
                isCamOff={isCamOff}
                onStart={handleStartStream}
                onStop={handleStopStream}
                onToggleMic={toggleMic}
                onToggleCam={toggleCam}
              />
            </div>
            <div className="w-full md:w-96 flex flex-col min-h-0">
              <ChatPanel 
                messages={messages} 
                userCoins={userCoins}
                onSendGift={handleSendGift}
                onSupport={() => setShowPayment(true)} 
              />
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="h-full animate-in fade-in slide-in-from-right-8 duration-500">
            <ProfileView 
              user={user!} 
              onUpdate={handleUpdateUser} 
              onBack={() => setCurrentView('stream')} 
            />
          </div>
        );
      case 'feed':
        return (
          <div className="h-full animate-in fade-in slide-in-from-left-8 duration-500">
            <FeedPage user={user!} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 font-sans">
      <Header 
        status={status} 
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
