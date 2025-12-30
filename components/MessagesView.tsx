
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, PrivateMessage } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface MessagesViewProps {
  currentUser: { name: string; email: string };
}

const STICKERS = [
  { icon: 'fa-rocket', color: 'text-blue-400' },
  { icon: 'fa-fire', color: 'text-orange-500' },
  { icon: 'fa-heart', color: 'text-rose-500' },
  { icon: 'fa-star', color: 'text-yellow-400' },
  { icon: 'fa-ghost', color: 'text-zinc-400' },
  { icon: 'fa-bolt', color: 'text-amber-400' },
  { icon: 'fa-gem', color: 'text-cyan-400' },
  { icon: 'fa-robot', color: 'text-indigo-400' },
  { icon: 'fa-cat', color: 'text-pink-400' },
  { icon: 'fa-pizza-slice', color: 'text-orange-400' },
  { icon: 'fa-ice-cream', color: 'text-pink-200' },
  { icon: 'fa-alien', color: 'text-green-400' },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    participantName: 'AlphaStreamer',
    participantAvatar: 'https://ui-avatars.com/api/?name=AlphaStreamer&background=a855f7&color=fff',
    lastMessage: 'Yo, check my latest stream clip!',
    unreadCount: 2,
    isOnline: true,
    messages: [
      { id: 'm1', senderId: '1', text: 'Hey there!', timestamp: new Date(Date.now() - 3600000), type: 'text' },
      { id: 'm2', senderId: 'me', text: 'Sup! How is it going?', timestamp: new Date(Date.now() - 3500000), type: 'text' },
      { id: 'm3', senderId: '1', text: 'Yo, check my latest stream clip!', timestamp: new Date(Date.now() - 3400000), type: 'text' },
    ]
  },
  {
    id: '2',
    participantName: 'VibeCheck',
    participantAvatar: 'https://ui-avatars.com/api/?name=VibeCheck&background=6366f1&color=fff',
    lastMessage: 'That AI feature is sick.',
    unreadCount: 0,
    isOnline: false,
    messages: [
      { id: 'v1', senderId: 'me', text: 'What do you think of the new update?', timestamp: new Date(Date.now() - 7200000), type: 'text' },
      { id: 'v2', senderId: '2', text: 'That AI feature is sick.', timestamp: new Date(Date.now() - 7100000), type: 'text' },
    ]
  }
];

const MessagesView: React.FC<MessagesViewProps> = ({ currentUser }) => {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(conversations[0].id);
  const [inputText, setInputText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Call States
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'active'>('connecting');
  const [callTime, setCallTime] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const callTimerRef = useRef<number | null>(null);

  // Gemini Live Session Refs
  const liveSessionRef = useRef<any>(null);
  const outAudioCtxRef = useRef<AudioContext | null>(null);
  const inAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const activeConv = conversations.find(c => c.id === activeId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // Audio Processing Helpers
  const encodeBase64 = (bytes: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeBase64 = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const startVoiceCall = async () => {
    if (!activeConv) return;
    setIsCalling(true);
    setCallStatus('connecting');
    setCallTime(0);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    outAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    inAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setCallStatus('active');
            callTimerRef.current = window.setInterval(() => setCallTime(prev => prev + 1), 1000);
            
            // Start streaming mic to Gemini
            const source = inAudioCtxRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encodeBase64(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inAudioCtxRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outAudioCtxRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioCtxRef.current.currentTime);
              const buffer = await decodeAudioData(decodeBase64(audioData), outAudioCtxRef.current, 24000, 1);
              const source = outAudioCtxRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outAudioCtxRef.current.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              audioSourcesRef.current.add(source);
              source.onended = () => audioSourcesRef.current.delete(source);
            }
            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => endCall(),
          onerror: (e) => {
            console.error("Live call error", e);
            endCall();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: `You are ${activeConv.participantName} in a private voice call. Adopt their personality. Be conversational, friendly, and brief in your spoken responses. Current user is ${currentUser.name}.`,
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Call failed", err);
      setIsCalling(false);
    }
  };

  const endCall = () => {
    setIsCalling(false);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (liveSessionRef.current) liveSessionRef.current.close();
    audioSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    audioSourcesRef.current.clear();
    outAudioCtxRef.current?.close();
    inAudioCtxRef.current?.close();
  };

  const addMessageToActive = (partialMsg: Partial<PrivateMessage>) => {
    if (!activeId) return;
    const newMessage: PrivateMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'me',
      timestamp: new Date(),
      type: 'text',
      ...partialMsg
    } as PrivateMessage;

    setConversations(prev => prev.map(c => {
      if (c.id === activeId) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: newMessage.type === 'text' ? newMessage.text! : `Sent a ${newMessage.type}`
        };
      }
      return c;
    }));
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    addMessageToActive({ text: inputText, type: 'text' });
    setInputText('');
  };

  const handleSendSticker = (stickerIcon: string) => {
    addMessageToActive({ stickerIcon, type: 'sticker' });
    setShowStickers(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const voiceUrl = URL.createObjectURL(audioBlob);
        addMessageToActive({ voiceUrl, voiceDuration: recordingTime, type: 'voice' });
        setRecordingTime(0);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex gap-6 overflow-hidden max-w-6xl mx-auto w-full relative">
      {/* Sidebar */}
      <div className={`flex-col w-full md:w-80 glass-panel rounded-[2rem] overflow-hidden border-white/5 ${activeId && 'hidden md:flex'} flex`}>
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
             <i className="fa-solid fa-paper-plane text-indigo-500 text-sm"></i>
             Messages
          </h2>
          <div className="mt-4 relative">
             <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs"></i>
             <input 
               type="text" 
               placeholder="Search chats..." 
               className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500/50"
             />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar p-2 space-y-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeId === conv.id ? 'bg-indigo-600/10 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'}`}
            >
              <div className="relative">
                <img src={conv.participantAvatar} className="w-12 h-12 rounded-xl" alt="avatar" />
                {conv.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-zinc-950 rounded-full"></div>
                )}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-bold text-white truncate">{conv.participantName}</p>
                </div>
                <p className="text-[10px] text-zinc-500 truncate">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <div className={`flex-1 flex flex-col glass-panel rounded-[2.5rem] overflow-hidden border-white/5 relative ${!activeId && 'hidden md:flex'}`}>
        {activeConv ? (
          <>
            <div className="p-6 border-b border-white/5 bg-zinc-900/40 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveId(null)} className="md:hidden w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                <img src={activeConv.participantAvatar} className="w-10 h-10 rounded-xl" alt="avatar" />
                <div>
                  <p className="text-sm font-bold text-white">{activeConv.participantName}</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{activeConv.isOnline ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={startVoiceCall}
                  className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-lg active:scale-90"
                >
                  <i className="fa-solid fa-phone"></i>
                </button>
                <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                  <i className="fa-solid fa-video"></i>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar bg-black/20">
              {activeConv.messages.map((msg) => {
                const isMe = msg.senderId === 'me';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      {msg.type === 'text' && (
                        <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5 shadow-xl'}`}>
                          {msg.text}
                        </div>
                      )}
                      {msg.type === 'sticker' && (
                        <div className="p-2 transition-transform hover:scale-110 cursor-default">
                           <i className={`fa-solid ${msg.stickerIcon} text-5xl drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]`}></i>
                        </div>
                      )}
                      {msg.type === 'voice' && <VoiceMessage msg={msg} isMe={isMe} formatTime={formatTime} />}
                      <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest px-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Voice Call Overlay */}
            {isCalling && (
              <div className="absolute inset-0 z-[60] bg-zinc-950 flex flex-col items-center justify-between p-12 animate-in slide-in-from-bottom-full duration-500">
                <div className="w-full flex justify-end">
                   <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Encypted</span>
                   </div>
                </div>

                <div className="flex flex-col items-center gap-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-600/20 rounded-[3rem] blur-2xl animate-pulse scale-150"></div>
                    <div className="w-48 h-48 rounded-[3.5rem] border-4 border-indigo-500 p-2 relative z-10">
                      <img src={activeConv.participantAvatar} className="w-full h-full rounded-[3rem] object-cover" alt="caller" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-white mb-2">{activeConv.participantName}</h2>
                    <p className="text-sm font-bold text-indigo-400 uppercase tracking-[0.2em] animate-pulse">
                      {callStatus === 'connecting' ? 'Calling...' : formatTime(callTime)}
                    </p>
                  </div>
                </div>

                <div className="w-full max-w-sm flex items-center justify-around gap-6">
                  <button className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/10 transition-all">
                    <i className="fa-solid fa-microphone-slash"></i>
                  </button>
                  <button 
                    onClick={endCall}
                    className="w-20 h-20 rounded-[2.5rem] bg-red-600 flex items-center justify-center text-white text-2xl shadow-2xl shadow-red-600/40 hover:scale-110 active:scale-95 transition-all"
                  >
                    <i className="fa-solid fa-phone-slash"></i>
                  </button>
                  <button className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/10 transition-all">
                    <i className="fa-solid fa-volume-high"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-6 bg-zinc-950/40 border-t border-white/5 relative">
              {showStickers && (
                <div className="absolute bottom-full left-6 mb-2 w-64 glass-panel rounded-3xl p-4 border border-white/10 grid grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-300 z-50 shadow-2xl">
                   {STICKERS.map((s, i) => (
                     <button 
                       key={i} 
                       onClick={() => handleSendSticker(s.icon)}
                       className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all hover:scale-125"
                      >
                       <i className={`fa-solid ${s.icon} ${s.color} text-xl`}></i>
                     </button>
                   ))}
                </div>
              )}

              <div className="flex items-center gap-3 bg-zinc-900 rounded-2xl p-2 border border-white/5 focus-within:border-indigo-500/50 transition-colors">
                <button 
                  onClick={() => setShowStickers(!showStickers)}
                  className={`w-10 h-10 rounded-xl transition-colors ${showStickers ? 'text-indigo-400 bg-white/5' : 'text-zinc-600 hover:text-white'}`}
                >
                  <i className="fa-solid fa-face-smile text-xs"></i>
                </button>
                
                {isRecording ? (
                  <div className="flex-1 flex items-center justify-between px-4 text-xs h-10 bg-red-500/10 rounded-xl animate-pulse">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                        <span className="text-red-500 font-black tracking-widest uppercase text-[10px]">Recording</span>
                     </div>
                     <div className="flex gap-0.5 items-center">
                        {[1,2,3,4,3,2,3,4,3,2].map((h, i) => (
                          <div key={i} className="w-0.5 bg-red-500 rounded-full" style={{ height: `${20 + Math.random() * 60}%` }}></div>
                        ))}
                     </div>
                     <span className="font-mono text-white font-black">{formatTime(recordingTime)}</span>
                  </div>
                ) : (
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Message...`} 
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none px-2"
                  />
                )}

                {!inputText.trim() && (
                   <button 
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={isRecording ? stopRecording : undefined}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center touch-none select-none ${isRecording ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-125 z-50' : 'bg-white/5 text-zinc-600 hover:text-white'}`}
                  >
                    <i className="fa-solid fa-microphone text-xs"></i>
                  </button>
                )}
                
                {(inputText.trim()) && (
                  <button 
                    onClick={handleSendMessage}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/40"
                  >
                    <i className="fa-solid fa-paper-plane text-xs"></i>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
            <i className="fa-solid fa-comments text-4xl text-indigo-500 mb-6"></i>
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Select a chat</h3>
          </div>
        )}
      </div>
    </div>
  );
};

interface VoiceMessageProps {
  msg: PrivateMessage;
  isMe: boolean;
  formatTime: (s: number) => string;
}

const VoiceMessage: React.FC<VoiceMessageProps> = ({ msg, isMe, formatTime }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(msg.voiceUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`px-4 py-3 rounded-2xl flex items-center gap-4 border border-white/5 min-w-[200px] shadow-lg ${isMe ? 'bg-indigo-600/20 rounded-tr-none' : 'bg-zinc-800 rounded-tl-none'}`}>
      <button 
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white active:scale-90"
      >
        <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-[10px] ${!isPlaying ? 'ml-0.5' : ''}`}></i>
      </button>
      <div className="flex-1 h-6 flex items-center gap-1 overflow-hidden">
        {[1,2,3,4,3,2,4,5,4,3,2,1,2,3,2,1].map((h, i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''} ${isMe ? 'bg-indigo-400' : 'bg-white/20'}`} 
            style={{ 
              height: `${20 + h * 15}%`,
              opacity: isPlaying ? 1 : 0.6
            }}
          ></div>
        ))}
      </div>
      <span className="text-[10px] font-black text-white/60 font-mono tabular-nums">{formatTime(msg.voiceDuration || 0)}</span>
    </div>
  );
};

export default MessagesView;
