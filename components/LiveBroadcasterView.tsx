import React, { useState, useEffect } from 'react';
import StreamView from './StreamView';
import ChatPanel from './ChatPanel';
import ControlBar from './ControlBar';
import { StreamStatus, ChatMessage, Gift } from '../types';
import { GeminiLiveService } from '../services/geminiLiveService';
import { api, UserDB } from '../services/databaseService';

interface LiveBroadcasterViewProps {
  user?: UserDB;
}

const LiveBroadcasterView: React.FC<LiveBroadcasterViewProps> = ({ user }) => {
  const [status, setStatus] = useState<StreamStatus>(StreamStatus.IDLE);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [title, setTitle] = useState("Exclusive VIP Session");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [coins, setCoins] = useState(user?.diamonds || 0);
  
  const [service] = useState(() => new GeminiLiveService());

  useEffect(() => {
    return () => {
      service.disconnect();
      if (user) api.endLiveSession(user.uid);
    };
  }, [service, user]);

  const handleStart = async () => {
    setStatus(StreamStatus.CONNECTING);
    try {
      await service.connect({
        onOpen: async () => {
          setStatus(StreamStatus.LIVE);
          if (user) {
            await api.startLiveSession({
              uid: user.uid,
              userName: user.name,
              userAvatar: user.avatar || '',
              title,
              viewerCount: 0,
              startedAt: Date.now()
            });
          }
        },
        onClose: () => {
          setStatus(StreamStatus.IDLE);
          if (user) api.endLiveSession(user.uid);
        },
        onError: () => {
          setStatus(StreamStatus.IDLE);
          if (user) api.endLiveSession(user.uid);
        },
        onTranscription: (sender, text) => {
          setMessages(prev => [...prev, {
            id: Math.random().toString(),
            sender,
            text,
            timestamp: new Date()
          }]);
        }
      });
    } catch (err) {
      console.error(err);
      setStatus(StreamStatus.IDLE);
    }
  };

  const handleStop = () => {
    service.disconnect();
    setStatus(StreamStatus.IDLE);
    if (user) api.endLiveSession(user.uid);
  };

  const handleSendGift = (gift: Gift) => {
    if (coins < gift.cost) return;
    setCoins(prev => prev - gift.cost);
    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      sender: 'user',
      text: '',
      timestamp: new Date(),
      isGift: true,
      giftIcon: gift.icon,
      giftName: gift.name,
      giftValue: gift.cost
    }]);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-[1800px] mx-auto overflow-hidden">
      <div className="flex-1 lg:flex-[2] flex flex-col gap-4 lg:gap-6 h-full overflow-hidden min-h-0">
        <div className="flex-1 min-h-0">
          <StreamView 
            status={status} 
            isCamOff={isCamOff} 
            title={title} 
            onTitleChange={setTitle} 
          />
        </div>
        
        <div className="shrink-0 pb-1 lg:pb-0">
          <ControlBar 
            status={status}
            isMicMuted={isMicMuted}
            isCamOff={isCamOff}
            onStart={handleStart}
            onStop={handleStop}
            onToggleMic={() => {
              setIsMicMuted(!isMicMuted);
              service.setMicEnabled(!isMicMuted);
            }}
            onToggleCam={() => {
              setIsCamOff(!isCamOff);
              service.setCamEnabled(!isCamOff);
            }}
          />
        </div>
      </div>

      <div className="flex-1 lg:flex-none lg:w-[400px] xl:w-[450px] min-h-[300px] lg:h-full overflow-hidden">
        <ChatPanel 
          messages={messages} 
          userCoins={coins}
          onSendGift={handleSendGift}
          onSupport={() => {}}
        />
      </div>
    </div>
  );
};

export default LiveBroadcasterView;