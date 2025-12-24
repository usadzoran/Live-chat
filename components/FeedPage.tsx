
import React, { useState } from 'react';
import { Publication, Comment } from '../types';

interface FeedPageProps {
  user: { name: string; avatar?: string };
}

const FeedPage: React.FC<FeedPageProps> = ({ user }) => {
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

  const handlePost = () => {
    if (!newPostText.trim()) return;

    const newPub: Publication = {
      id: Math.random().toString(36).substr(2, 9),
      user: user.name,
      userAvatar: `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`,
      type: selectedType,
      content: selectedType === 'text' ? newPostText : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80', // Simulating upload
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

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col gap-6 overflow-y-auto pb-12 hide-scrollbar px-2">
      {/* Create Publication */}
      <div className="glass-panel p-6 rounded-[2rem] border-white/5">
        <div className="flex gap-4 mb-4">
          <img src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} className="w-12 h-12 rounded-xl" alt="avatar" />
          <textarea
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
            placeholder="Share your talent or thoughts..."
            rows={2}
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex gap-3">
            <button 
              onClick={() => setSelectedType('text')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedType === 'text' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
            >
              <i className="fa-solid fa-font"></i> Text
            </button>
            <button 
              onClick={() => setSelectedType('image')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedType === 'image' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
            >
              <i className="fa-solid fa-image"></i> Photo
            </button>
            <button 
              onClick={() => setSelectedType('video')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedType === 'video' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
            >
              <i className="fa-solid fa-film"></i> Short (8s)
            </button>
          </div>
          <button 
            onClick={handlePost}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            PUBLISH
          </button>
        </div>
      </div>

      {/* Publications List */}
      <div className="space-y-6">
        {publications.map((pub) => (
          <PublicationCard 
            key={pub.id} 
            pub={pub} 
            onInteraction={handleInteraction} 
            onComment={addComment}
          />
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

  return (
    <div className="glass-panel rounded-[2rem] border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={pub.userAvatar} className="w-10 h-10 rounded-xl" alt="avatar" />
            <div>
              <p className="text-sm font-bold text-white">{pub.user}</p>
              <p className="text-[10px] text-zinc-500">{pub.timestamp.toLocaleDateString()} • {pub.type.toUpperCase()}</p>
            </div>
          </div>
          <button className="text-zinc-600 hover:text-white transition-colors">
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>

        {pub.type === 'text' ? (
          <p className="text-sm text-zinc-300 leading-relaxed mb-4">{pub.content}</p>
        ) : pub.type === 'image' ? (
          <div className="space-y-4">
             {pub.description && <p className="text-sm text-zinc-300 mb-2">{pub.description}</p>}
             <div className="rounded-2xl overflow-hidden border border-white/5">
                <img src={pub.content} className="w-full h-auto object-cover max-h-96" alt="post content" />
             </div>
          </div>
        ) : (
          <div className="space-y-4">
             {pub.description && <p className="text-sm text-zinc-300 mb-2">{pub.description}</p>}
             <div className="rounded-2xl overflow-hidden border border-white/5 relative aspect-video bg-black flex items-center justify-center">
                <div className="absolute top-4 left-4 z-10 px-2 py-1 bg-red-600 text-[8px] font-black text-white rounded-md uppercase tracking-widest">Short (8s)</div>
                <i className="fa-solid fa-play text-4xl text-white opacity-40"></i>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
             </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          <div className="flex gap-4">
            <button 
              onClick={() => onInteraction(pub.id, 'like')}
              className="flex items-center gap-2 text-zinc-500 hover:text-indigo-400 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10">
                <i className="fa-solid fa-heart text-xs"></i>
              </div>
              <span className="text-xs font-bold">{pub.likes}</span>
            </button>
            <button 
              onClick={() => onInteraction(pub.id, 'dislike')}
              className="flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-500/10">
                <i className="fa-solid fa-thumbs-down text-xs"></i>
              </div>
              <span className="text-xs font-bold">{pub.dislikes}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 transition-colors group ${showComments ? 'text-indigo-400' : 'text-zinc-500 hover:text-indigo-400'}`}
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10">
                <i className="fa-solid fa-comment text-xs"></i>
              </div>
              <span className="text-xs font-bold">{pub.comments.length}</span>
            </button>
          </div>
          <button className="text-zinc-600 hover:text-white transition-colors">
            <i className="fa-solid fa-share-nodes"></i>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="bg-white/5 p-6 border-t border-white/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-4 max-h-60 overflow-y-auto hide-scrollbar">
            {pub.comments.length > 0 ? pub.comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <img src={`https://ui-avatars.com/api/?name=${c.user}&background=3f3f46&color=fff`} className="w-8 h-8 rounded-lg shrink-0" alt="avatar" />
                <div className="flex-1 bg-zinc-900/50 rounded-2xl p-3 border border-white/5">
                   <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold text-white">{c.user}</p>
                      <p className="text-[8px] text-zinc-600">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                   <p className="text-xs text-zinc-400">{c.text}</p>
                </div>
              </div>
            )) : (
              <p className="text-[10px] text-zinc-600 italic text-center py-4">Be the first to comment!</p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <input 
              type="text" 
              placeholder="Add a comment..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
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
              className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white"
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
