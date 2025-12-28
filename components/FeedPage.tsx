
import React, { useState, useRef, useEffect } from 'react';
import { Publication, Comment, AdConfig } from '../types';
import { GoogleGenAI } from '@google/genai';
import { db } from '../services/databaseService';

interface FeedPageProps {
  user: { name: string; avatar?: string; email?: string };
}

const FeedPage: React.FC<FeedPageProps> = ({ user }) => {
  const [adConfig] = useState<AdConfig[]>([
    { id: '1', placement: 'under_header', enabled: true, title: 'Luxury Watches', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80', link: '#' },
    { id: '3', placement: 'under_publication', enabled: true, title: 'Diamond Gifting', imageUrl: 'https://images.unsplash.com/photo-1588444833098-4205565e2482?auto=format&fit=crop&w=400&q=80', link: '#' },
  ]);

  const [publications, setPublications] = useState<Publication[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [selectedType, setSelectedType] = useState<'text' | 'image' | 'video'>('text');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  
  // Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [showNewPostsToast, setShowNewPostsToast] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const PULL_THRESHOLD = 80;

  // Initial load and Auto-refresh
  useEffect(() => {
    fetchGlobalFeed();
    const interval = setInterval(() => fetchGlobalFeed(true), 15000); // Silent auto refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchGlobalFeed = async (isSilent: boolean = false) => {
    const globalPubs = await db.getGlobalPublications();
    if (isSilent && globalPubs.length > publications.length && publications.length > 0) {
      setShowNewPostsToast(true);
      setTimeout(() => setShowNewPostsToast(false), 5000);
    }
    setPublications(globalPubs);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].pageY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;
    if (diff > 0) {
      const dampedDiff = Math.pow(diff, 0.8);
      setPullDistance(dampedDiff);
      if (dampedDiff > 5) e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > PULL_THRESHOLD) triggerRefresh();
    isPulling.current = false;
    setPullDistance(0);
  };

  const triggerRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Generate a short luxury social post for My Doll. Return JSON: { "username": "", "content": "", "type": "text" | "image" }',
        config: { responseMimeType: 'application/json' }
      });

      const data = JSON.parse(response.text || '{}');
      const newUpdate: Publication = {
        id: Math.random().toString(36).substr(2, 9),
        user: data.username || 'EliteMember',
        userAvatar: `https://ui-avatars.com/api/?name=${data.username || 'Elite'}&background=random&color=fff`,
        type: data.type || 'text',
        content: data.type === 'image' ? 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' : data.content,
        description: data.type === 'image' ? data.content : undefined,
        likes: Math.floor(Math.random() * 50),
        dislikes: 0,
        comments: [],
        timestamp: new Date()
      };

      await db.addPublication(newUpdate);
      await fetchGlobalFeed();
    } catch (error) {
      console.error("AI refresh failed", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 8.5) {
          alert('Video must be 8 seconds or shorter.');
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
        processFile(file);
      };
      video.src = URL.createObjectURL(file);
    } else {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (selectedType === 'text' && !newPostText.trim()) return;
    if (selectedType !== 'text' && !mediaUrl) return;

    const newPub: Publication = {
      id: Math.random().toString(36).substr(2, 9),
      user: user.name,
      userAvatar: `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`,
      type: selectedType,
      content: selectedType === 'text' ? newPostText : mediaUrl!,
      description: selectedType !== 'text' ? newPostText : undefined,
      likes: 0,
      dislikes: 0,
      comments: [],
      timestamp: new Date()
    };
    await db.addPublication(newPub);
    setNewPostText('');
    setMediaUrl(null);
    setSelectedType('text');
    await fetchGlobalFeed();
  };

  const handleInteraction = async (pubId: string, action: 'like' | 'dislike') => {
    const updatedPubs = publications.map(p => {
      if (p.id === pubId) {
        const updated = { ...p, likes: action === 'like' ? p.likes + 1 : p.likes, dislikes: action === 'dislike' ? p.dislikes + 1 : p.dislikes };
        db.updatePublication(updated);
        return updated;
      }
      return p;
    });
    setPublications(updatedPubs);
  };

  const addComment = async (pubId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: Comment = { id: Math.random().toString(36).substr(2, 9), user: user.name, text, timestamp: new Date() };
    const updatedPubs = publications.map(p => {
      if (p.id === pubId) {
        const updated = { ...p, comments: [...p.comments, newComment] };
        db.updatePublication(updated);
        return updated;
      }
      return p;
    });
    setPublications(updatedPubs);
  };

  return (
    <div 
      ref={containerRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
      className="max-w-3xl mx-auto h-full flex flex-col gap-4 lg:gap-8 overflow-y-auto pb-24 lg:pb-32 hide-scrollbar px-2 relative"
      style={{ transform: `translateY(${pullDistance}px)`, transition: isPulling.current ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
    >
      {/* Auto Refresh Alert */}
      {showNewPostsToast && (
        <div onClick={() => { fetchGlobalFeed(); setShowNewPostsToast(false); containerRef.current?.scrollTo({top: 0, behavior: 'smooth'}); }} className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-pink-600 rounded-full shadow-2xl shadow-pink-600/30 text-[10px] font-black uppercase tracking-widest text-white cursor-pointer border border-white/20 animate-bounce">
          New Activity in Elite Feed
        </div>
      )}

      {/* Header with Live Status */}
      <div className="flex items-center justify-between px-4 mt-2">
        <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-2">
          Explore Feed
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
          </span>
        </h2>
        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Auto-Sync: Active</span>
      </div>

      {/* Create Publication */}
      <div className="glass-panel p-4 lg:p-8 rounded-[2rem] border-white/5 shadow-xl">
        <div className="flex gap-4 mb-4">
          <img src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl" alt="avatar" />
          <textarea
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-pink-500/50 resize-none transition-all"
            placeholder="Share an elite update..." rows={2} value={newPostText} onChange={(e) => setNewPostText(e.target.value)}
          />
        </div>

        {mediaUrl && (
          <div className="mb-4 relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black/40">
             {selectedType === 'image' ? (
               <img src={mediaUrl} className="w-full h-full object-cover" alt="Preview" />
             ) : (
               <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop />
             )}
             <button 
               onClick={() => setMediaUrl(null)}
               className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-all"
             >
               <i className="fa-solid fa-xmark"></i>
             </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4">
          <div className="flex gap-2 lg:gap-3">
            {[
              { id: 'text', icon: 'fa-font', label: 'Text' },
              { id: 'image', icon: 'fa-image', label: 'Photo' },
              { id: 'video', icon: 'fa-clapperboard', label: 'Short' }
            ].map((type) => (
              <button 
                key={type.id} 
                onClick={() => {
                  setSelectedType(type.id as any);
                  if (type.id !== 'text') {
                    fileInputRef.current?.click();
                  }
                }} 
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${selectedType === type.id ? 'bg-pink-600 text-white shadow-lg' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
              >
                <i className={`fa-solid ${type.icon}`}></i> {type.label}
              </button>
            ))}
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              accept={selectedType === 'image' ? "image/*" : "video/*"} 
              onChange={handleFileChange} 
            />
          </div>
          <button onClick={handlePost} className="px-8 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95">PUBLISH</button>
        </div>
      </div>

      {/* Global Publications List */}
      <div className="space-y-6 lg:space-y-10">
        {publications.map((pub) => (
          <PublicationCard key={pub.id} pub={pub} onInteraction={handleInteraction} onComment={addComment} />
        ))}
      </div>
    </div>
  );
};

interface PublicationCardProps {
  pub: Publication;
  onInteraction: (id: string, action: 'like' | 'dislike') => void;
  onComment: (id: string, text: string) => void;
}

const PublicationCard: React.FC<PublicationCardProps> = ({ pub, onInteraction, onComment }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="glass-panel rounded-[2rem] border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl">
      <div className="p-5 lg:p-8">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center gap-3">
            <img src={pub.userAvatar} className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl" alt="avatar" />
            <div>
              <p className="text-sm font-bold text-white leading-none mb-1">{pub.user}</p>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                {new Date(pub.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {pub.type}
              </p>
            </div>
          </div>
        </div>

        {pub.type === 'text' ? (
          <p className="text-sm lg:text-base text-zinc-300 leading-relaxed mb-4 lg:mb-6">{pub.content}</p>
        ) : (
          <div className="space-y-4 lg:space-y-6">
             {pub.description && <p className="text-sm text-zinc-300">{pub.description}</p>}
             <div className="rounded-2xl lg:rounded-3xl overflow-hidden border border-white/5 bg-zinc-900 relative">
                {pub.type === 'image' ? (
                  <img src={pub.content} className="w-full h-auto object-cover max-h-[500px]" alt="post" />
                ) : (
                  <video 
                    ref={videoRef}
                    src={pub.content} 
                    className="w-full h-auto object-cover max-h-[500px]" 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                  />
                )}
                {pub.type === 'video' && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md">
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Elite Short</span>
                  </div>
                )}
             </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 lg:mt-8 pt-4 border-t border-white/5">
          <div className="flex gap-2 lg:gap-6">
            <button onClick={() => onInteraction(pub.id, 'like')} className="flex items-center gap-2 text-zinc-500 hover:text-pink-400 group">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-pink-500/10 transition-colors">
                <i className="fa-solid fa-heart text-xs"></i>
              </div>
              <span className="text-[10px] font-black">{pub.likes}</span>
            </button>
            <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-2 transition-colors group ${showComments ? 'text-indigo-400' : 'text-zinc-500 hover:text-indigo-400'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${showComments ? 'bg-indigo-500/10' : 'bg-white/5'}`}>
                <i className="fa-solid fa-comment text-xs"></i>
              </div>
              <span className="text-[10px] font-black">{pub.comments.length}</span>
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="bg-white/5 p-5 lg:p-8 border-t border-white/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-4 max-h-72 overflow-y-auto hide-scrollbar">
            {pub.comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <img src={`https://ui-avatars.com/api/?name=${c.user}&background=3f3f46&color=fff`} className="w-8 h-8 rounded-lg shrink-0" alt="avatar" />
                <div className="flex-1 bg-zinc-900/50 rounded-2xl p-3 border border-white/5">
                   <p className="text-[10px] font-bold text-white mb-1">{c.user}</p>
                   <p className="text-xs text-zinc-400 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <input 
              type="text" placeholder="Comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500/50"
              onKeyDown={(e) => { if (e.key === 'Enter') { onComment(pub.id, commentText); setCommentText(''); } }}
            />
            <button onClick={() => { onComment(pub.id, commentText); setCommentText(''); }} className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center text-white"><i className="fa-solid fa-paper-plane text-[10px]"></i></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
