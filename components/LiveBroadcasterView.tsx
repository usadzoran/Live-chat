
import React, { useState, useEffect } from 'react';
import StreamView from './StreamView';
import ChatPanel from './ChatPanel';
import ControlBar from './ControlBar';
import { StreamStatus, ChatMessage, Gift } from '../types';
import { GeminiLiveService } from '../services/geminiLiveService';

const LiveBroadcasterView: React.FC = () => {
  const [status, setStatus] = useState<StreamStatus>(StreamStatus.IDLE);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [title, setTitle] = useState("Exploring the Future of Social AI");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [coins, setCoins] = useState(12450);
  
  const [service] = useState(() => new GeminiLiveService());

  useEffect(() => {
    return () => {
      service.disconnect();
    };
  }, [service]);

  const handleStart = async () => {
    setStatus(StreamStatus.CONNECTING);
    try {
      await service.connect({
        onOpen: () => setStatus(StreamStatus.LIVE),
        onClose: () => setStatus(StreamStatus.IDLE),
        onError: () => setStatus(StreamStatus.IDLE),
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
    <div className="h-full flex flex-col md:flex-row gap-6 max-w-[1600px] mx-auto">
      <div className="flex-[2] flex flex-col gap-6 h-full overflow-hidden">
        <StreamView 
          status={status} 
          isCamOff={isCamOff} 
          title={title} 
          onTitleChange={setTitle} 
        />
        <ControlBar 
          status={status}
          isMicMuted={isMicMuted}
          isCamOff={isCamOff}
          onStart={handleStart}
          onStop={handleStop}
          onToggleMic={() => {
            setIsMicMuted(!isMicMuted);
            service.setMicEnabled(isMicMuted);
          }}
          onToggleCam={() => {
            setIsCamOff(!isCamOff);
            service.setCamEnabled(isCamOff);
          }}
        />
      </div>

      <div className="flex-1 h-full min-w-[320px] max-w-[450px]">
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
