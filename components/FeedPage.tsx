import React, { useState, useRef, useEffect } from 'react';
import { Publication, Comment } from '../types';
import { api } from '../services/databaseService';
import { useTranslation } from '../contexts/LanguageContext';
import { Timestamp } from 'firebase/firestore';

interface FeedPageProps {
  user: { name: string; avatar?: string; email: string; uid: string };
}

interface PublicationWithState extends Publication {
  isPending?: boolean;
}

const FEATURED_CREATORS = [
  { name: 'Aurora', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', live: true },
  { name: 'Sasha', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop', live: false },
  { name: 'Luna', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', live: true },
  { name: 'Jade', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop', live: false },
  { name: 'Amara', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop', live: true },
  { name: 'Chloe', avatar: 'https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=400&h=400&fit=crop', live: false },
];

const FeedPage: React.FC<FeedPageProps> = ({ user }) => {
  const [publications, setPublications] = useState<PublicationWithState[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [selectedType, setSelectedType] = useState<'text' | 'image' | 'video'>('text');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const { t, isRTL } = useTranslation();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const refreshThreshold = 80;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = api.subscribeToFeed((newPubs) => {
      setPublications(newPubs);
      setIsRefreshing(false);
      setPullDistance(0);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePost = async () => {
    if (selectedType === 'text' && !newPostText.trim()) return;
    if (selectedType !== 'text' && !mediaUrl) return;

    setIsPublishing(true);
    try {
      await api.addPublication({
        user: user.name,
        userAvatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=f472b6&color=fff`,
        type: selectedType,
        content: selectedType === 'text' ? newPostText : mediaUrl!,
        description: selectedType !== 'text' ? newPostText : undefined,
        likes: 0,
        dislikes: 0,
        comments: []
      });
      
      setNewPostText('');
      setMediaUrl(null);
      setSelectedType('text');
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(isRTL ? "تم النشر في النادي!" : "Shared with the Club!");
    } catch (e) {
      console.error("Publishing failed", e);
      alert(isRTL ? "فشل النشر" : "Cloud Sync Failed");
    } finally {
      setIsPublishing(false);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].pageY;
      setIsPulling(true);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;

    if (diff > 0 && containerRef.current && containerRef.current.scrollTop <= 0) {
      const resistedDiff = Math.min(diff * 0.4, 150);
      setPullDistance(resistedDiff);
      if (resistedDiff > 10 && e.cancelable) e.preventDefault();
    }
  };

  const onTouchEnd = () => {
    if (pullDistance >= refreshThreshold) {
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1000);
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-950">
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-pink-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
           {toastMsg}
        </div>
      )}

      {/* Pull Down Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-40 pointer-events-none transition-all duration-200"
        style={{ height: `${pullDistance}px`, opacity: pullDistance / refreshThreshold }}
      >
        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-pink-500/30 flex items-center justify-center">
          <i className={`fa-solid ${isRefreshing ? 'fa-circle-notch animate-spin' : 'fa-arrow-down'} text-pink-500 text-[10px]`}></i>
        </div>
      </div>

      <div 
        ref={containerRef} 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="h-full w-full overflow-y-auto pb-40 hide-scrollbar transition-transform duration-200"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        <div className="max-w-3xl mx-auto pt-6 space-y-6 px-4">
          
          {/* Header & Activity Pulse */}
          <div className={`flex items-center justify-between px-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Elite Feed</h2>
              <div className={`flex items-center gap-2 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                 <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></div>
                 <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">Live Global Stream</span>
              </div>
            </div>
            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all">
              <i className="fa-solid fa-bolt-lightning text-xs"></i>
            </button>
          </div>

          {/* Featured Creators Bar */}
          <div className="w-full overflow-x-auto hide-scrollbar pb-2">
            <div className={`flex gap-5 min-w-max px-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {FEATURED_CREATORS.map((creator, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className={`p-1 rounded-[1.8rem] border-2 transition-all group-hover:scale-105 ${creator.live ? 'border-pink-500' : 'border-zinc-800'}`}>
                    <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border-2 border-zinc-950">
                      <img src={creator.avatar} className="w-full h-full object-cover" alt={creator.name} />
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{creator.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Create Post Studio */}
          <div className="glass-panel p-6 lg:p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-zinc-900/40 to-black/20 relative group/studio">
            <div className={`flex gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=f472b6&color=fff`} className="w-12 h-12 rounded-2xl shadow-xl border border-white/5 object-cover" alt="avatar" />
              <textarea
                className={`flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-pink-500/20 resize-none transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={isRTL ? 'شارك شيئاً مع النخبة...' : 'Share something exclusive...'} 
                rows={2} 
                value={newPostText} 
                onChange={(e) => setNewPostText(e.target.value)}
              />
            </div>

            {mediaUrl && (
              <div className="mb-6 relative rounded-[2rem] overflow-hidden border border-white/10 aspect-video bg-black shadow-2xl">
                 {selectedType === 'image' ? (
                   <img src={mediaUrl} className="w-full h-full object-cover" alt="Preview" />
                 ) : (
                   <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop />
                 )}
                 <button onClick={() => setMediaUrl(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-all backdrop-blur-md">
                   <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>
            )}

            <div className={`flex items-center justify-between border-t border-white/5 pt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex gap-2">
                {[
                  { id: 'text', icon: 'fa-font', label: 'TXT' },
                  { id: 'image', icon: 'fa-image', label: 'IMG' },
                  { id: 'video', icon: 'fa-clapperboard', label: 'CLIP' }
                ].map((type) => (
                  <button 
                    key={type.id} 
                    onClick={() => {
                      setSelectedType(type.id as any);
                      if (type.id !== 'text') fileInputRef.current?.click();
                    }} 
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${selectedType === type.id ? 'bg-pink-600 text-white shadow-lg' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
                  >
                    <i className={`fa-solid ${type.icon}`}></i> {type.label}
                  </button>
                ))}
                <input type="file" ref={fileInputRef} hidden accept={selectedType === 'image' ? "image/*" : "video/*"} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setMediaUrl(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} />
              </div>
              <button 
                onClick={handlePost} 
                disabled={isPublishing}
                className="px-8 py-3 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
              >
                {isPublishing ? <i className="fa-solid fa-circle-notch animate-spin"></i> : (isRTL ? 'نشر' : 'POST')}
              </button>
            </div>
          </div>

          {/* Publications Feed */}
          <div className="space-y-10 pb-20">
            {publications.map((pub) => (
              <PublicationCard 
                key={pub.id} 
                pub={pub} 
                onLike={() => api.likePublication(pub.id)} 
                onDislike={() => api.dislikePublication(pub.id)}
                onComment={(text) => {
                  api.addCommentToPublication(pub.id, { 
                    id: Math.random().toString(36).substr(2, 9), 
                    user: user.name, 
                    text, 
                    timestamp: Timestamp.now().toDate() 
                  });
                }} 
                isRTL={isRTL} 
                showToast={showToast}
              />
            ))}
            
            {publications.length === 0 && !isRefreshing && (
              <div className="py-32 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                 <i className="fa-solid fa-satellite-dish text-5xl animate-pulse"></i>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em]">Establishing Secure Feed...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface PublicationCardProps {
  pub: PublicationWithState;
  onLike: () => void;
  onDislike: () => void;
  onComment: (text: string) => void;
  isRTL: boolean;
  showToast: (msg: string) => void;
}

const PublicationCard: React.FC<PublicationCardProps> = ({ pub, onLike, onDislike, onComment, isRTL, showToast }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts instanceof Date ? ts : (typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts));
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const handleShare = async () => {
    const shareData = {
      title: 'My Doll Club',
      text: `Check out this post from ${pub.user}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast(isRTL ? "تم نسخ الرابط" : "Link Copied!");
    }
  };

  return (
    <div className={`glass-panel rounded-[2.5rem] border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 bg-zinc-900/30 backdrop-blur-xl group ${pub.isPending ? 'opacity-70' : ''}`}>
      
      <div className="p-6 lg:p-8">
        <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="relative">
              <img src={pub.userAvatar} className="w-12 h-12 rounded-2xl object-cover shadow-2xl border border-white/10" alt="avatar" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-pink-500 border-4 border-zinc-950 rounded-full"></div>
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-black text-white">{pub.user}</p>
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{formatTime(pub.timestamp)}</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-600 hover:text-white transition-all">
            <i className="fa-solid fa-ellipsis"></i>
          </button>
        </div>

        {pub.type === 'text' ? (
          <p className={`text-base lg:text-xl text-zinc-100 leading-relaxed mb-6 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{pub.content}</p>
        ) : (
          <div className="space-y-4 mb-6">
             {pub.description && <p className={`text-sm text-zinc-300 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{pub.description}</p>}
             <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-zinc-950 relative shadow-2xl group/media">
                <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Ultra HD</span>
                </div>
                {pub.type === 'image' ? (
                  <img src={pub.content} className="w-full h-auto object-cover max-h-[600px] transition-transform duration-[3s] group-hover/media:scale-105" alt="post" />
                ) : (
                  <video src={pub.content} className="w-full h-auto object-cover max-h-[600px]" autoPlay muted loop playsInline />
                )}
             </div>
          </div>
        )}

        <div className={`flex items-center justify-between pt-6 border-t border-white/5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button onClick={onLike} className={`flex items-center gap-2 group/btn active:scale-125 transition-transform ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/btn:bg-pink-500/10 transition-colors">
                <i className="fa-solid fa-heart text-xs text-zinc-500 group-hover/btn:text-pink-500"></i>
              </div>
              <span className="text-[10px] font-black text-zinc-500 tabular-nums">{pub.likes}</span>
            </button>
            <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-2 group/btn transition-transform ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${showComments ? 'bg-indigo-500/10' : 'bg-white/5'}`}>
                <i className={`fa-solid fa-comment text-xs ${showComments ? 'text-indigo-400' : 'text-zinc-500'}`}></i>
              </div>
              <span className="text-[10px] font-black text-zinc-500 tabular-nums">{pub.comments?.length || 0}</span>
            </button>
          </div>
          <button onClick={handleShare} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-600 hover:text-white">
             <i className="fa-solid fa-share-nodes text-xs"></i>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="bg-black/40 p-6 lg:p-8 border-t border-white/5 space-y-6 animate-in slide-in-from-top-4">
          <div className="space-y-4 max-h-80 overflow-y-auto hide-scrollbar">
            {pub.comments?.map(c => (
              <div key={c.id} className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <img src={`https://ui-avatars.com/api/?name=${c.user}&background=333&color=fff`} className="w-8 h-8 rounded-lg shrink-0" alt="avatar" />
                <div className={`flex-1 bg-zinc-900/60 rounded-2xl p-4 border border-white/5 ${isRTL ? 'text-right' : 'text-left'}`}>
                   <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">{c.user}</p>
                   <p className="text-xs text-zinc-400 font-medium">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={`flex gap-3 pt-6 border-t border-white/5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <input 
              type="text" 
              placeholder={isRTL ? 'أضف تعليق...' : 'Add a comment...'} 
              value={commentText} 
              onChange={(e) => setCommentText(e.target.value)}
              className={`flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-500/20 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
              onKeyDown={(e) => { if (e.key === 'Enter') { onComment(commentText); setCommentText(''); } }}
            />
            <button 
              onClick={() => { onComment(commentText); setCommentText(''); }} 
              className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center text-white"
            >
              <i className={`fa-solid fa-paper-plane text-[10px] ${isRTL ? 'rotate-180' : ''}`}></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;