
import React, { useState, useRef, useEffect } from 'react';
import { Publication, Comment, AdConfig } from '../types';
import { GoogleGenAI } from '@google/genai';

interface FeedPageProps {
  user: { name: string; avatar?: string };
}

const FeedPage: React.FC<FeedPageProps> = ({ user }) => {
  const [adConfig] = useState<AdConfig[]>([
    { id: '1', placement: 'under_header', enabled: true, title: 'Luxury Watches', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80', link: '#' },
    { id: '3', placement: 'under_publication', enabled: true, title: 'Diamond Gifting', imageUrl: 'https://images.unsplash.com/photo-1588444833098-4205565e2482?auto=format&fit=crop&w=400&q=80', link: '#' },
  ]);

  const [publications, setPublications] = useState<Publication[]>([
    {
      id: '1',
      user: 'AlphaStreamer',
      userAvatar: 'https://ui-avatars.com/api/?name=AlphaStreamer&background=a855f7&color=fff',
      type: 'image',
      content: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      description: 'Check out my new gaming setup! 🚀',
      likes: 124,
      dislikes: 2,
      comments: [
        { id: 'c1', user: 'TechGuru', text: 'Clean setup, man!', timestamp: new Date() }
      ],
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      user: 'VibeCheck',
      userAvatar: 'https://ui-avatars.com/api/?name=VibeCheck&background=6366f1&color=fff',
      type: 'text',
      content: 'Just had an amazing session with Gemini AI. The live interaction is getting better every day!',
      likes: 56,
      dislikes: 0,
      comments: [],
      timestamp: new Date(Date.now() - 7200000)
    }
  ]);

  const [newPostText, setNewPostText] = useState('');
  const [selectedType, setSelectedType] = useState<'text' | 'image' | 'video'>('text');
  
  // Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const PULL_THRESHOLD = 80;

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
      // Rubber banding effect
      const dampedDiff = Math.pow(diff, 0.8);
      setPullDistance(dampedDiff);
      if (dampedDiff > 5) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > PULL_THRESHOLD) {
      triggerRefresh();
    }
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
        contents: 'Generate a short, luxury-themed social media post for an elite social club called My Doll. Include a username (one word), a witty or high-end text content, and suggest a type (image or text). Return as JSON: { "username": "", "content": "", "type": "text" | "image" }',
        config: { responseMimeType: 'application/json' }
      });

      const data = JSON.parse(response.text || '{}');
      
      const newUpdate: Publication = {
        id: Math.random().toString(36).substr(2, 9),
        user: data.username || 'EliteMember',
        userAvatar: `https://ui-avatars.com/api/?name=${data.username || 'User'}&background=random&color=fff`,
        type: data.type || 'text',
        content: data.type === 'image' 
          ? 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' 
          : data.content,
        description: data.type === 'image' ? data.content : undefined,
        likes: Math.floor(Math.random() * 50),
        dislikes: 0,
        comments: [],
        timestamp: new Date()
      };

      setPublications(prev => [newUpdate, ...prev]);
    } catch (error) {
      console.error("Failed to fetch real-time updates:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePost = () => {
    if (!newPostText.trim()) return;

    const newPub: Publication = {
      id: Math.random().toString(36).substr(2, 9),
      user: user.name,
      userAvatar: `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`,
      type: selectedType,
      content: selectedType === 'text' ? newPostText : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
      description: selectedType !== 'text' ? newPostText : undefined,
      likes: 0,
      dislikes: 0,
      comments: [],
      timestamp: new Date()
    };

    setPublications([newPub, ...publications]);
    setNewPostText('');
  };

  const handleInteraction = (pubId: string, action: 'like' | 'dislike') => {
    setPublications(prev => prev.map(p => {
      if (p.id === pubId) {
        return {
          ...p,
          likes: action === 'like' ? p.likes + 1 : p.likes,
          dislikes: action === 'dislike' ? p.dislikes + 1 : p.dislikes
        };
      }
      return p;
    }));
  };

  const addComment = (pubId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      user: user.name,
      text,
      timestamp: new Date()
    };
    setPublications(prev => prev.map(p => {
      if (p.id === pubId) {
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    }));
  };

  const renderAd = (placement: AdConfig['placement']) => {
    const ad = adConfig.find(a => a.placement === placement && a.enabled);
    if (!ad) return null;

    return (
      <div className="glass-panel p-4 lg:p-6 rounded-3xl border border-cyan-500/10 shadow-[0_0_20px_rgba(8,145,178,0.05)] flex items-center gap-4 group transition-all hover:border-cyan-500/30 mb-6 last:mb-0">
        <div className="shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-zinc-900 overflow-hidden border border-white/5">
           {ad.imageUrl ? (
              <img src={ad.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="ad" />
           ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700">
                 <i className="fa-solid fa-rectangle-ad text-2xl"></i>
              </div>
           )}
        </div>
        <div className="flex-1">
           <div className="flex items-center gap-2 mb-1">
              <span className="text-[7px] lg:text-[8px] font-black text-cyan-400 uppercase tracking-widest border border-cyan-400/30 px-1.5 py-0.5 rounded bg-cyan-400/5">SPONSORED</span>
              <h4 className="text-[10px] lg:text-xs font-black text-white uppercase tracking-tight">{ad.title}</h4>
           </div>
           <p className="text-[9px] lg:text-[10px] text-zinc-500 line-clamp-2">Experience the luxury of {ad.title}. Exclusive for My Doll Elite members.</p>
           <a href={ad.link} className="inline-flex items-center gap-2 mt-2 text-[8px] lg:text-[9px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400">
              Explore Now <i className="fa-solid fa-arrow-right"></i>
           </a>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="max-w-3xl mx-auto h-full flex flex-col gap-4 lg:gap-8 overflow-y-auto pb-24 lg:pb-32 hide-scrollbar px-2 relative"
      style={{ transform: `translateY(${pullDistance}px)`, transition: isPulling.current ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
    >
      {/* Refresh Indicator */}
      <div 
        className="absolute left-0 right-0 flex items-center justify-center transition-opacity" 
        style={{ top: `-${Math.max(40, pullDistance)}px`, opacity: pullDistance / PULL_THRESHOLD }}
      >
        <div className={`w-10 h-10 rounded-full glass-panel flex items-center justify-center shadow-2xl ${isRefreshing ? 'animate-spin' : ''}`}>
           <i className={`fa-solid fa-gem text-pink-500 transition-transform ${pullDistance > PULL_THRESHOLD ? 'rotate-180 scale-125' : ''}`}></i>
        </div>
      </div>

      {isRefreshing && (
        <div className="flex items-center justify-center py-4 animate-pulse">
           <span className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em]">Syncing Elite Vault...</span>
        </div>
      )}
      
      {/* Placement: Under Header */}
      {renderAd('under_header')}

      {/* Create Publication */}
      <div className="glass-panel p-4 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border-white/5 shadow-xl">
        <div className="flex gap-4 mb-4">
          <img src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl" alt="avatar" />
          <textarea
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none transition-all"
            placeholder="Share your talent or thoughts..."
            rows={2}
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4">
          <div className="flex gap-2 lg:gap-3">
            {[
              { id: 'text', icon: 'fa-font', label: 'Text' },
              { id: 'image', icon: 'fa-image', label: 'Photo' },
              { id: 'video', icon: 'fa-film', label: 'Short' }
            ].map((type) => (
              <button 
                key={type.id}
                onClick={() => setSelectedType(type.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${selectedType === type.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
              >
                <i className={`fa-solid ${type.icon}`}></i> {type.label}
              </button>
            ))}
          </div>
          <button 
            onClick={handlePost}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-600/30 ml-auto sm:ml-0"
          >
            PUBLISH
          </button>
        </div>
      </div>

      {/* Publications List */}
      <div className="space-y-6 lg:space-y-10">
        {publications.map((pub, idx) => (
          <React.Fragment key={pub.id}>
            <PublicationCard 
              pub={pub} 
              onInteraction={handleInteraction} 
              onComment={addComment}
            />
            {/* Placement: Under Publication (Inserted after the first post) */}
            {idx === 0 && renderAd('under_publication')}
          </React.Fragment>
        ))}
      </div>

      {/* Manual Refresh Hint */}
      <div className="flex justify-center py-10 opacity-30">
         <button onClick={triggerRefresh} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">
            Tap to Load Older Threads
         </button>
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

  return (
    <div className="glass-panel rounded-[2rem] lg:rounded-[2.5rem] border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl">
      <div className="p-5 lg:p-8">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center gap-3">
            <img src={pub.userAvatar} className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl" alt="avatar" />
            <div>
              <p className="text-sm font-bold text-white leading-none mb-1">{pub.user}</p>
              <p className="text-[9px] lg:text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                {pub.timestamp.toLocaleDateString()} • {pub.type}
              </p>
            </div>
          </div>
          <button className="w-8 h-8 rounded-lg hover:bg-white/5 text-zinc-600 hover:text-white transition-all">
            <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
          </button>
        </div>

        {pub.type === 'text' ? (
          <p className="text-sm lg:text-base text-zinc-300 leading-relaxed mb-4 lg:mb-6">{pub.content}</p>
        ) : pub.type === 'image' ? (
          <div className="space-y-4 lg:space-y-6">
             {pub.description && <p className="text-sm text-zinc-300">{pub.description}</p>}
             <div className="rounded-2xl lg:rounded-3xl overflow-hidden border border-white/5 bg-zinc-900">
                <img src={pub.content} className="w-full h-auto object-cover max-h-[500px]" alt="post content" />
             </div>
          </div>
        ) : (
          <div className="space-y-4 lg:space-y-6">
             {pub.description && <p className="text-sm text-zinc-300">{pub.description}</p>}
             <div className="rounded-2xl lg:rounded-3xl overflow-hidden border border-white/5 relative aspect-video bg-black flex items-center justify-center group cursor-pointer">
                <div className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-red-600 text-[8px] font-black text-white rounded-md uppercase tracking-widest shadow-lg">Short (8s)</div>
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white scale-100 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-play text-2xl ml-1"></i>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 lg:mt-8 pt-4 border-t border-white/5">
          <div className="flex gap-2 lg:gap-6">
            <button 
              onClick={() => onInteraction(pub.id, 'like')}
              className="flex items-center gap-2 text-zinc-500 hover:text-indigo-400 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10">
                <i className="fa-solid fa-heart text-xs"></i>
              </div>
              <span className="text-[10px] lg:text-xs font-black">{pub.likes}</span>
            </button>
            <button 
              onClick={() => onInteraction(pub.id, 'dislike')}
              className="flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/10">
                <i className="fa-solid fa-thumbs-down text-xs"></i>
              </div>
              <span className="text-[10px] lg:text-xs font-black">{pub.dislikes}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 transition-colors group ${showComments ? 'text-indigo-400' : 'text-zinc-500 hover:text-indigo-400'}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${showComments ? 'bg-indigo-500/10' : 'bg-white/5'} group-hover:bg-indigo-500/10`}>
                <i className="fa-solid fa-comment text-xs"></i>
              </div>
              <span className="text-[10px] lg:text-xs font-black">{pub.comments.length}</span>
            </button>
          </div>
          <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-zinc-600 hover:text-white transition-all">
            <i className="fa-solid fa-share-nodes text-xs"></i>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="bg-white/5 p-5 lg:p-8 border-t border-white/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-4 max-h-72 overflow-y-auto hide-scrollbar">
            {pub.comments.length > 0 ? pub.comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <img src={`https://ui-avatars.com/api/?name=${c.user}&background=3f3f46&color=fff`} className="w-8 h-8 rounded-lg shrink-0" alt="avatar" />
                <div className="flex-1 bg-zinc-900/50 rounded-2xl p-3 border border-white/5">
                   <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold text-white">{c.user}</p>
                      <p className="text-[8px] text-zinc-600 uppercase font-bold">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                   <p className="text-xs text-zinc-400 leading-relaxed">{c.text}</p>
                </div>
              </div>
            )) : (
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center py-6 opacity-40">Be the first to leave a mark</p>
            )}
          </div>
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <input 
              type="text" 
              placeholder="Add a comment..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onComment(pub.id, commentText);
                  setCommentText('');
                }
              }}
            />
            <button 
              onClick={() => {
                onComment(pub.id, commentText);
                setCommentText('');
              }}
              className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              <i className="fa-solid fa-paper-plane text-[10px]"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
