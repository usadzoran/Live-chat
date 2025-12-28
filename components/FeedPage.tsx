
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Publication, Comment, AdConfig } from '../types';
import { GoogleGenAI } from '@google/genai';
import { db } from '../services/databaseService';

interface FeedPageProps {
  user: { name: string; avatar?: string; email?: string };
}

const FeedPage: React.FC<FeedPageProps> = ({ user }) => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [selectedType, setSelectedType] = useState<'text' | 'image' | 'video'>('text');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  
  // Pull to Refresh & Sync State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [showNewPostsToast, setShowNewPostsToast] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const PULL_THRESHOLD = 80;

  const fetchGlobalFeed = useCallback(async (isSilent: boolean = false) => {
    const globalPubs = await db.getGlobalPublications();
    
    setPublications(prev => {
      // If we have new posts and we're not at the top, show the "New Activity" pill
      if (isSilent && globalPubs.length > prev.length && prev.length > 0) {
        // Only show toast if user is scrolled down
        if (containerRef.current && containerRef.current.scrollTop > 100) {
          setShowNewPostsToast(true);
        } else {
          // If at top, just update naturally
          return globalPubs;
        }
        return prev; // Keep old until they click toast or manual refresh
      }
      return globalPubs;
    });
  }, []);

  // Listen for storage events (Realtime simulation across tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('mydoll_cloud_db')) {
        fetchGlobalFeed(true);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    fetchGlobalFeed();
    const interval = setInterval(() => fetchGlobalFeed(true), 8000); // Poll every 8s for "Realtime" feel
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [fetchGlobalFeed]);

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
      // Add resistance to the pull
      const dampedDiff = Math.min(diff * 0.4, 120);
      setPullDistance(dampedDiff);
      
      // Prevent browser default pull-to-refresh on mobile
      if (diff > 10) {
        if (e.cancelable) e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance >= PULL_THRESHOLD) {
      triggerRefresh();
    }
    isPulling.current = false;
    setPullDistance(0);
  };

  const triggerRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    try {
      // Simulate/Trigger an AI post to make the feed feel alive on refresh
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Generate a short luxury social post for an elite club. Use different rich personas. Return JSON: { "username": "string", "content": "string", "type": "text" | "image" }',
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
      console.error("Manual refresh failed", error);
      // Still fetch what we have if AI fails
      await fetchGlobalFeed();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePost = async () => {
    if (selectedType === 'text' && !newPostText.trim()) return;
    if (selectedType !== 'text' && !mediaUrl) return;

    const newPub: Publication = {
      id: Math.random().toString(36).substr(2, 9),
      user: user.name,
      userAvatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`,
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
    // Scroll to top to see new post
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInteraction = async (pubId: string, action: 'like' | 'dislike') => {
    // Optimistic UI Update
    setPublications(prev => prev.map(p => {
      if (p.id === pubId) {
        const updated = { 
          ...p, 
          likes: action === 'like' ? p.likes + 1 : p.likes, 
          dislikes: action === 'dislike' ? p.dislikes + 1 : p.dislikes 
        };
        db.updatePublication(updated);
        return updated;
      }
      return p;
    }));
  };

  const addComment = async (pubId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: Comment = { 
      id: Math.random().toString(36).substr(2, 9), 
      user: user.name, 
      text, 
      timestamp: new Date() 
    };
    setPublications(prev => prev.map(p => {
      if (p.id === pubId) {
        const updated = { ...p, comments: [...p.comments, newComment] };
        db.updatePublication(updated);
        return updated;
      }
      return p;
    }));
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-950">
      
      {/* Pull down indicator background */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none transition-opacity"
        style={{ height: pullDistance, opacity: pullDistance / PULL_THRESHOLD }}
      >
        <div className={`flex flex-col items-center gap-2 transition-all ${pullDistance >= PULL_THRESHOLD ? 'scale-110' : 'scale-100'}`}>
           <div className={`w-10 h-10 rounded-full bg-zinc-900 border flex items-center justify-center shadow-xl transition-colors ${pullDistance >= PULL_THRESHOLD ? 'border-pink-500 text-pink-500' : 'border-white/10 text-zinc-500'}`}>
              {isRefreshing ? (
                <i className="fa-solid fa-circle-notch animate-spin"></i>
              ) : (
                <i 
                  className="fa-solid fa-gem" 
                  style={{ transform: `rotate(${pullDistance * 4}deg)` }}
                ></i>
              )}
           </div>
           <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">
             {isRefreshing ? 'Syncing...' : (pullDistance >= PULL_THRESHOLD ? 'Release to Refresh' : 'Pull to Sync')}
           </span>
        </div>
      </div>

      <div 
        ref={containerRef} 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove} 
        onTouchEnd={handleTouchEnd}
        className="h-full w-full overflow-y-auto pb-32 hide-scrollbar px-2 lg:px-4"
        style={{ 
          transform: `translateY(${pullDistance}px)`, 
          transition: isPulling.current ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
        }}
      >
        {/* Floating New Posts Button */}
        {showNewPostsToast && (
          <div 
            onClick={() => { fetchGlobalFeed(); setShowNewPostsToast(false); containerRef.current?.scrollTo({top: 0, behavior: 'smooth'}); }} 
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-pink-600 rounded-full shadow-2xl shadow-pink-600/40 text-[10px] font-black uppercase tracking-[0.2em] text-white cursor-pointer border border-white/20 animate-in fade-in slide-in-from-top-4 duration-500"
          >
            <i className="fa-solid fa-arrow-up mr-2"></i>
            New Elite Activity
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-6 pt-4">
          {/* Header */}
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
              Elite Feed
              <div className="flex gap-1 items-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></div>
                 <span className="text-[8px] text-pink-500 not-italic tracking-widest uppercase">Live</span>
              </div>
            </h2>
          </div>

          {/* Create Publication */}
          <div className="glass-panel p-6 lg:p-8 rounded-[2.5rem] border-white/5 shadow-2xl bg-gradient-to-br from-zinc-900/50 to-transparent">
            <div className="flex gap-4 mb-4">
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} className="w-12 h-12 rounded-2xl shadow-lg" alt="avatar" />
              <textarea
                className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 resize-none transition-all"
                placeholder="What's on your elite mind?" rows={2} value={newPostText} onChange={(e) => setNewPostText(e.target.value)}
              />
            </div>

            {mediaUrl && (
              <div className="mb-4 relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black/40 shadow-inner group">
                 {selectedType === 'image' ? (
                   <img src={mediaUrl} className="w-full h-full object-cover" alt="Preview" />
                 ) : (
                   <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop />
                 )}
                 <button 
                   onClick={() => setMediaUrl(null)}
                   className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-all backdrop-blur-md border border-white/10"
                 >
                   <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6">
              <div className="flex gap-3">
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
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedType === type.id ? 'bg-pink-600 text-white shadow-xl shadow-pink-600/20' : 'bg-white/5 text-zinc-500 hover:bg-white/10 border border-white/5'}`}
                  >
                    <i className={`fa-solid ${type.icon}`}></i> {type.label}
                  </button>
                ))}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept={selectedType === 'image' ? "image/*" : "video/*"} 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setMediaUrl(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </div>
              <button onClick={handlePost} className="px-10 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-pink-600/30 active:scale-95">PUBLISH</button>
            </div>
          </div>

          {/* Global Publications List */}
          <div className="space-y-8 pb-10">
            {publications.map((pub) => (
              <PublicationCard key={pub.id} pub={pub} onInteraction={handleInteraction} onComment={addComment} />
            ))}
            
            {publications.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                 <i className="fa-solid fa-wind text-5xl"></i>
                 <p className="text-xs font-black uppercase tracking-widest">Feed is being provisioned...</p>
              </div>
            )}
          </div>
        </div>
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
    <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] bg-zinc-900/30 backdrop-blur-sm">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={pub.userAvatar} className="w-11 h-11 rounded-2xl object-cover shadow-lg" alt="avatar" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-black text-white leading-none mb-1">{pub.user}</p>
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(pub.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
                <span className="text-[8px] text-pink-500/80 font-black uppercase tracking-widest">{pub.type}</span>
              </div>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-white/5 text-zinc-600 hover:text-white transition-all">
            <i className="fa-solid fa-ellipsis"></i>
          </button>
        </div>

        {pub.type === 'text' ? (
          <p className="text-sm lg:text-base text-zinc-200 leading-relaxed mb-6 font-medium selection:bg-pink-500/30">{pub.content}</p>
        ) : (
          <div className="space-y-4 mb-6">
             {pub.description && <p className="text-sm text-zinc-300 font-medium">{pub.description}</p>}
             <div className="rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 relative shadow-inner group">
                {pub.type === 'image' ? (
                  <img src={pub.content} className="w-full h-auto object-cover max-h-[600px] group-hover:scale-[1.02] transition-transform duration-700" alt="post" />
                ) : (
                  <video 
                    ref={videoRef}
                    src={pub.content} 
                    className="w-full h-auto object-cover max-h-[600px]" 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
             </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex gap-4 lg:gap-8">
            <button 
              onClick={() => onInteraction(pub.id, 'like')} 
              className="flex items-center gap-3 text-zinc-500 hover:text-pink-500 transition-all active:scale-125 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-pink-500/10 group-active:text-pink-500 transition-all shadow-lg">
                <i className="fa-solid fa-heart text-xs"></i>
              </div>
              <span className="text-[10px] font-black tracking-widest">{pub.likes}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)} 
              className={`flex items-center gap-3 transition-all active:scale-95 group ${showComments ? 'text-indigo-400' : 'text-zinc-500 hover:text-indigo-400'}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all ${showComments ? 'bg-indigo-500/10' : 'bg-white/5'}`}>
                <i className="fa-solid fa-comment text-xs"></i>
              </div>
              <span className="text-[10px] font-black tracking-widest">{pub.comments.length}</span>
            </button>
          </div>
          <button className="flex items-center gap-3 text-zinc-600 hover:text-white transition-all active:scale-95 group">
             <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all shadow-lg">
                <i className="fa-solid fa-share-nodes text-xs"></i>
             </div>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="bg-black/20 p-6 lg:p-8 border-t border-white/5 space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="space-y-4 max-h-80 overflow-y-auto hide-scrollbar px-1">
            {pub.comments.map(c => (
              <div key={c.id} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                <img src={`https://ui-avatars.com/api/?name=${c.user}&background=3f3f46&color=fff`} className="w-8 h-8 rounded-xl shrink-0 shadow-md" alt="avatar" />
                <div className="flex-1 bg-zinc-900/80 rounded-2xl p-4 border border-white/5 shadow-inner">
                   <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">{c.user}</p>
                      <span className="text-[8px] text-zinc-700 font-bold uppercase">{new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <p className="text-xs text-zinc-400 leading-relaxed selection:bg-pink-500/20">{c.text}</p>
                </div>
              </div>
            ))}
            {pub.comments.length === 0 && (
              <p className="text-[10px] text-zinc-700 font-black uppercase text-center tracking-[0.2em] py-4">No elite thoughts yet</p>
            )}
          </div>
          <div className="flex gap-3 pt-6 border-t border-white/5">
            <input 
              type="text" placeholder="Add to the conversation..." value={commentText} onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-5 py-3 text-xs text-white focus:outline-none focus:border-pink-500/50 transition-all shadow-inner"
              onKeyDown={(e) => { if (e.key === 'Enter') { onComment(pub.id, commentText); setCommentText(''); } }}
            />
            <button onClick={() => { onComment(pub.id, commentText); setCommentText(''); }} className="w-12 h-12 rounded-2xl bg-pink-600 flex items-center justify-center text-white shadow-xl shadow-pink-600/30 hover:bg-pink-500 transition-all active:scale-90"><i className="fa-solid fa-paper-plane text-[10px]"></i></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
