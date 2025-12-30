
import React, { useState, useRef, useEffect } from 'react';
import { Publication, Comment } from '../types';
import { db } from '../services/databaseService';
import { useTranslation } from '../contexts/LanguageContext';

interface FeedPageProps {
  user: { name: string; avatar?: string; email: string; uid: string };
}

const FeedPage: React.FC<FeedPageProps> = ({ user }) => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [selectedType, setSelectedType] = useState<'text' | 'image' | 'video'>('text');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const { t, isRTL } = useTranslation();
  
  // Pull to Refresh States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const refreshThreshold = 80;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time Firestore Subscription: Ensures data is always fresh without manual reloads
  useEffect(() => {
    const unsubscribe = db.subscribeToFeed((newPubs) => {
      setPublications([...newPubs]);
      setIsRefreshing(false);
      setPullDistance(0);
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (selectedType === 'text' && !newPostText.trim()) return;
    if (selectedType !== 'text' && !mediaUrl) return;

    setIsPublishing(true);
    try {
      await db.addPublication({
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
      // Scroll to top to see the new post instantly
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error("Publishing failed", e);
      alert(isRTL ? "فشل النشر، يرجى التحقق من الاتصال" : "Publishing failed, please check connection");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Data is real-time via subscription, but we simulate visual feedback to reassure the user
    setTimeout(() => {
      setIsRefreshing(false);
      setPullDistance(0);
    }, 800);
  };

  // Pull to Refresh Handlers
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
      if (resistedDiff > 10 && e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const onTouchEnd = () => {
    if (pullDistance >= refreshThreshold) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
    setIsPulling(false);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-950">
      {/* Pull to Refresh Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-40 pointer-events-none transition-all duration-200"
        style={{ height: `${pullDistance}px`, opacity: pullDistance / refreshThreshold }}
      >
        <div className={`w-10 h-10 rounded-full bg-zinc-900 border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.2)] flex items-center justify-center transition-transform ${isRefreshing ? 'animate-spin' : ''}`}>
          <i className={`fa-solid ${isRefreshing ? 'fa-circle-notch' : 'fa-arrow-down'} text-pink-500 text-sm transition-transform`} style={{ transform: `rotate(${Math.min(pullDistance * 2, 180)}deg)` }}></i>
        </div>
      </div>

      <div 
        ref={containerRef} 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="h-full w-full overflow-y-auto pb-32 hide-scrollbar px-3 lg:px-6 transition-transform duration-200"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        <div className="max-w-3xl mx-auto space-y-6 pt-6">
          <div className={`flex items-center justify-between px-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
              {isRTL ? 'خلاصة النخبة' : 'Elite Feed'}
              <div className="flex gap-1 items-center">
                 <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-cyan-500 animate-ping' : 'bg-pink-500 animate-pulse'} shadow-[0_0_10px_rgba(236,72,153,0.8)]`}></div>
                 <span className="text-[9px] text-pink-500 font-black tracking-widest uppercase">
                   {isRefreshing ? (isRTL ? 'تحديث...' : 'Syncing...') : (isRTL ? 'بث مباشر' : 'Live Global')}
                 </span>
              </div>
            </h2>
            <button 
              onClick={handleRefresh}
              className={`w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all ${isRefreshing ? 'animate-spin text-pink-500' : ''}`}
            >
              <i className="fa-solid fa-rotate"></i>
            </button>
          </div>

          {/* Create Post Section */}
          <div className="glass-panel p-6 lg:p-10 rounded-[2.5rem] border-white/5 shadow-2xl bg-gradient-to-br from-zinc-900/40 to-transparent">
            <div className={`flex gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=f472b6&color=fff`} className="w-14 h-14 rounded-2xl shadow-xl border border-white/5" alt="avatar" />
              <textarea
                className={`flex-1 bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-pink-500/40 resize-none transition-all shadow-inner ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={isRTL ? 'شارك شيئاً مع النادي...' : 'Share with the club...'} 
                rows={2} 
                value={newPostText} 
                onChange={(e) => setNewPostText(e.target.value)}
              />
            </div>

            {mediaUrl && (
              <div className="mb-4 relative rounded-3xl overflow-hidden border border-white/10 aspect-video bg-black/60 shadow-inner">
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

            <div className={`flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {[
                  { id: 'text', icon: 'fa-font', label: isRTL ? 'نص' : 'Text' },
                  { id: 'image', icon: 'fa-image', label: isRTL ? 'صورة' : 'Photo' },
                  { id: 'video', icon: 'fa-clapperboard', label: isRTL ? 'فيديو' : 'Short' }
                ].map((type) => (
                  <button 
                    key={type.id} 
                    onClick={() => {
                      setSelectedType(type.id as any);
                      if (type.id !== 'text') fileInputRef.current?.click();
                    }} 
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedType === type.id ? 'bg-pink-600 text-white shadow-xl shadow-pink-600/30' : 'bg-white/5 text-zinc-500 hover:bg-white/10 border border-white/5'}`}
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
                className="px-12 py-3.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-pink-600/40 active:scale-95 group relative overflow-hidden"
              >
                <span className="relative z-10">{isPublishing ? <i className="fa-solid fa-circle-notch animate-spin"></i> : (isRTL ? 'نـشر' : 'PUBLISH')}</span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 skew-x-[-20deg]"></div>
              </button>
            </div>
          </div>

          {/* Publications List */}
          <div className="space-y-8 pb-10">
            {publications.map((pub) => (
              <PublicationCard 
                key={pub.id} 
                pub={pub} 
                onLike={() => db.likePublication(pub.id)} 
                onDislike={() => db.dislikePublication(pub.id)}
                onComment={(text) => {
                  const newComment: Comment = { 
                    id: Math.random().toString(36).substr(2, 9), 
                    user: user.name, 
                    text, 
                    timestamp: new Date() 
                  };
                  db.addCommentToPublication(pub.id, newComment);
                }} 
                isRTL={isRTL} 
              />
            ))}
            {publications.length === 0 && !isRefreshing && (
              <div className="py-24 flex flex-col items-center justify-center opacity-30 text-center space-y-5">
                 <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center">
                   <i className="fa-solid fa-cloud text-pink-500 text-3xl animate-pulse"></i>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
                   {isRTL ? 'بانتظار وصول البيانات السحابية...' : 'Awaiting Global Cloud Stream...'}
                 </p>
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
  onLike: () => void;
  onDislike: () => void;
  onComment: (text: string) => void;
  isRTL: boolean;
}

const PublicationCard: React.FC<PublicationCardProps> = ({ pub, onLike, onDislike, onComment, isRTL }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  // Helper to safely format timestamp
  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts instanceof Date ? ts : (typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts));
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] bg-zinc-900/30 backdrop-blur-xl group">
      <div className="p-8 lg:p-10">
        <div className={`flex items-center justify-between mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="relative">
              <img src={pub.userAvatar} className="w-14 h-14 rounded-2xl object-cover shadow-2xl border border-white/10" alt="avatar" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-zinc-900 rounded-full shadow-lg shadow-emerald-500/30"></div>
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-base font-black text-white leading-none mb-1.5">{pub.user}</p>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">
                  {formatTime(pub.timestamp)}
                </span>
                <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
                <span className="text-[9px] text-pink-500/80 font-black uppercase tracking-widest">{pub.type}</span>
              </div>
            </div>
          </div>
          <button className="w-12 h-12 rounded-2xl bg-white/5 text-zinc-600 hover:text-white hover:bg-white/10 transition-all border border-white/5">
            <i className="fa-solid fa-ellipsis"></i>
          </button>
        </div>

        {pub.type === 'text' ? (
          <p className={`text-sm lg:text-lg text-zinc-100 leading-relaxed mb-8 font-medium italic ${isRTL ? 'text-right' : 'text-left'}`}>"{pub.content}"</p>
        ) : (
          <div className="space-y-6 mb-8">
             {pub.description && <p className={`text-sm text-zinc-300 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{pub.description}</p>}
             <div className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-950 relative shadow-2xl group/media">
                <div className="absolute inset-0 bg-pink-600/5 opacity-0 group-hover/media:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                {pub.type === 'image' ? (
                  <img src={pub.content} className="w-full h-auto object-cover max-h-[700px] transition-transform duration-[2s] group-hover/media:scale-105" alt="post" />
                ) : (
                  <video src={pub.content} className="w-full h-auto object-cover max-h-[700px]" autoPlay muted loop playsInline />
                )}
             </div>
          </div>
        )}

        <div className={`flex items-center justify-between pt-8 border-t border-white/5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex gap-6 lg:gap-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button onClick={onLike} className={`flex items-center gap-4 transition-all active:scale-125 group/like ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover/like:bg-pink-500/10 transition-all shadow-xl group-active/like:text-pink-500">
                <i className="fa-solid fa-heart text-sm text-zinc-500 group-hover/like:text-pink-500"></i>
              </div>
              <span className="text-[11px] font-black text-zinc-500 group-hover/like:text-white tabular-nums">{pub.likes}</span>
            </button>
            <button onClick={onDislike} className={`flex items-center gap-4 transition-all active:scale-125 group/dislike ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover/dislike:bg-red-500/10 transition-all shadow-xl group-active/dislike:text-red-500">
                <i className="fa-solid fa-thumbs-down text-sm text-zinc-500 group-hover/dislike:text-red-500"></i>
              </div>
              <span className="text-[11px] font-black text-zinc-500 group-hover/dislike:text-white tabular-nums">{pub.dislikes}</span>
            </button>
            <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-4 transition-all active:scale-95 group/comm ${showComments ? 'text-indigo-400' : 'text-zinc-500'} ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all ${showComments ? 'bg-indigo-500/10' : 'bg-white/5'}`}>
                <i className="fa-solid fa-comment text-sm"></i>
              </div>
              <span className="text-[11px] font-black group-hover/comm:text-white tabular-nums">{pub.comments?.length || 0}</span>
            </button>
          </div>
          <button className="flex items-center gap-3 text-zinc-700 hover:text-white transition-all active:scale-90">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-xl border border-white/5">
                <i className="fa-solid fa-share-nodes text-sm"></i>
             </div>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="bg-black/40 p-8 lg:p-10 border-t border-white/5 space-y-8 animate-in slide-in-from-top-6 duration-500">
          <div className="space-y-6 max-h-96 overflow-y-auto hide-scrollbar px-2">
            {pub.comments?.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(c => (
              <div key={c.id} className={`flex gap-5 animate-in fade-in slide-in-from-left-4 duration-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <img src={`https://ui-avatars.com/api/?name=${c.user}&background=333&color=fff`} className="w-10 h-10 rounded-xl shrink-0 shadow-xl" alt="avatar" />
                <div className={`flex-1 bg-zinc-900/60 rounded-3xl p-5 border border-white/5 shadow-inner ${isRTL ? 'text-right' : 'text-left'}`}>
                   <div className={`flex justify-between items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">{c.user}</p>
                      <span className="text-[9px] text-zinc-700 font-bold uppercase">{formatTime(c.timestamp)}</span>
                   </div>
                   <p className="text-xs text-zinc-400 leading-relaxed font-medium">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={`flex gap-4 pt-8 border-t border-white/5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <input 
              type="text" 
              placeholder={isRTL ? 'أضف تعليقك هنا...' : 'Add to the conversation...'} 
              value={commentText} 
              onChange={(e) => setCommentText(e.target.value)}
              className={`flex-1 bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-pink-500/30 transition-all shadow-inner ${isRTL ? 'text-right' : 'text-left'}`}
              onKeyDown={(e) => { if (e.key === 'Enter') { onComment(commentText); setCommentText(''); } }}
            />
            <button 
              onClick={() => { onComment(commentText); setCommentText(''); }} 
              className="w-14 h-14 rounded-2xl bg-pink-600 flex items-center justify-center text-white shadow-2xl shadow-pink-600/30 hover:bg-pink-500 transition-all active:scale-90"
            >
              <i className={`fa-solid fa-paper-plane text-xs ${isRTL ? 'rotate-180' : ''}`}></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
