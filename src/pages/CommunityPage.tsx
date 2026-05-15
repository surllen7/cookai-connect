import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, Heart, ChefHat, MessageCircle, Bookmark, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';

interface CommunityPost {
  id: string;
  title: string;
  content: string | null;
  images: string[];
  tags: string[];
  likes_count: number;
  comments_count: number;
  saves_count: number;
  recipe_id: string | null;
  created_at: string;
  author: {
    username: string | null;
    avatar_emoji: string;
  };
  liked?: boolean;
}

function PostCard({ post, onLike, onClick }: { post: CommunityPost; onLike: (id: string, liked: boolean) => void; onClick: (id: string) => void }) {
  const imgHeight = 160 + Math.floor(Math.random() * 100);
  const coverImg = post.images[0];

  return (
    <div onClick={() => onClick(post.id)} className="group bg-white rounded-[24px] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col active:scale-[0.97] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] cursor-pointer">
      <div className="w-full bg-slate-50 relative overflow-hidden" style={{ height: imgHeight }}>
        {coverImg ? (
          <img src={coverImg} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-[#F9FBFA]">
            🍳
          </div>
        )}
        {post.recipe_id && (
          <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/20 shadow-sm">
            <ChefHat size={10} strokeWidth={3} /> RECIPE
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-[14px] leading-[1.5] mb-2 line-clamp-2 group-hover:text-[#84B741] transition-colors">{post.title}</h3>
        
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px] shrink-0 border border-white shadow-sm">
              {post.author.avatar_emoji}
            </div>
            <span className="text-[11px] font-bold text-slate-500 truncate">{post.author.username ?? '美食家'}</span>
          </div>
          
          <button
            onClick={(e) => { e.stopPropagation(); onLike(post.id, !post.liked); }}
            className={`flex items-center gap-1 transition-all active:scale-125 ${post.liked ? 'text-red-500' : 'text-slate-300 hover:text-slate-400'}`}
          >
            <Heart
              size={14}
              fill={post.liked ? '#ef4444' : 'none'}
              strokeWidth={post.liked ? 0 : 2.5}
            />
            <span className="text-[11px] font-black">{post.likes_count > 0 ? post.likes_count : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'following'>('discover');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, content, images, tags, likes_count, comments_count, saves_count, recipe_id, created_at, profiles(username, avatar_emoji)')
      .order('created_at', { ascending: false })
      .limit(40);

    if (error || !data) { setLoading(false); return; }

    let likedIds = new Set<string>();
    if (user) {
      const { data: likeData } = await supabase
        .from('likes')
        .select('target_id')
        .eq('user_id', user.id)
        .eq('target_type', 'post');
      likedIds = new Set((likeData ?? []).map((l) => l.target_id));
    }

    setPosts(
      data.map((p) => {
        const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
        return {
          id: p.id,
          title: p.title,
          content: p.content,
          images: p.images ?? [],
          tags: p.tags ?? [],
          likes_count: p.likes_count,
          comments_count: p.comments_count ?? 0,
          saves_count: p.saves_count ?? 0,
          recipe_id: p.recipe_id,
          created_at: p.created_at,
          author: {
            username: (profile as { username?: string | null })?.username ?? null,
            avatar_emoji: (profile as { avatar_emoji?: string })?.avatar_emoji ?? '🥑',
          },
          liked: likedIds.has(p.id),
        };
      })
    );
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleLike = async (postId: string, toLike: boolean) => {
    if (!user) { navigate('/login'); return; }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: toLike, likes_count: p.likes_count + (toLike ? 1 : -1) }
          : p
      )
    );
    if (toLike) {
      await supabase.from('likes').insert({ user_id: user.id, target_type: 'post', target_id: postId });
    } else {
      await supabase.from('likes').delete()
        .eq('user_id', user.id).eq('target_type', 'post').eq('target_id', postId);
    }
  };

  const leftPosts = posts.filter((_, i) => i % 2 === 0);
  const rightPosts = posts.filter((_, i) => i % 2 !== 0);

  return (
    <div className="flex flex-col h-full w-full bg-[#FDFBF7] relative pb-24">
      {/* Header */}
      <header className="sticky top-0 px-6 pt-12 pb-3 bg-[#FDFBF7]/80 backdrop-blur-xl flex items-center justify-between z-30 transition-all border-b border-transparent">
        <div className="flex items-center gap-6">
          {(['following', 'discover'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-1 text-lg font-black transition-all duration-300 ${
                activeTab === tab ? 'text-slate-900 scale-110' : 'text-slate-400 font-bold hover:text-slate-500'
              }`}
            >
              {tab === 'following' ? '关注' : '发现'}
              {activeTab === tab && (
                <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-[#84B741] rounded-full opacity-60 animate-in fade-in zoom-in duration-300" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center text-slate-600 bg-white shadow-sm border border-slate-100 rounded-full hover:bg-slate-50 transition-all hover:scale-105 active:scale-95">
            <Search size={20} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24 hide-scrollbar">
        {/* Weekly Challenge Banner */}
        {activeTab === 'discover' && (
          <div className="mb-6 group px-1">
            <div 
              className="bg-gradient-to-br from-[#FF8C42] to-[#FF5E62] rounded-[32px] p-6 text-white shadow-[0_12px_30px_rgba(255,140,66,0.25)] relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
              onClick={() => navigate('/', { state: { challenge: '#一个番茄能做什么#', ingredient: '番茄' } })}
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-black/5 rounded-full blur-2xl" />
              
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase border border-white/20">
                  Weekly Hot Challenge
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 200}ms` }} />
                  ))}
                </div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-black mb-1 flex items-center gap-2 drop-shadow-md">
                  #一个番茄能做什么#
                  <Sparkles size={20} className="text-yellow-200" />
                </h2>
                <p className="text-[12px] text-white/90 font-medium mb-4">发挥你的创意，分享番茄的无限可能 ✨</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2.5">
                      {['🍅', '🍳', '🍝'].map((emoji, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-base shadow-sm ring-2 ring-transparent group-hover:ring-white/20 transition-all">
                          {emoji}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-white/80 ml-1">99+ 位美食家已参加</span>
                  </div>
                  
                  <button className="bg-white text-[#FF5E62] px-5 py-2 rounded-full text-[12px] font-black shadow-[0_4px_12px_rgba(255,255,255,0.3)] hover:translate-y-[-2px] transition-transform flex items-center gap-1.5">
                    立即参与 <PlusCircle size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-[3px] border-[#84B741] border-t-transparent animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-32 text-slate-400 gap-4 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-2 animate-bounce-subtle">🍽️</div>
            <div>
              <p className="font-bold text-slate-800">还没有人发布菜谱</p>
              <p className="text-xs text-slate-400 mt-1">成为第一个分享的人吧！</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 px-1">
            <div className="w-1/2 flex flex-col gap-4">
              {leftPosts.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLike} onClick={() => navigate(`/post/${post.id}`)} />
              ))}
            </div>
            <div className="w-1/2 flex flex-col gap-4 mt-8">
              {rightPosts.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLike} onClick={() => navigate(`/post/${post.id}`)} />
              ))}
            </div>
          </div>
        )}
      </main>

      <button
        onClick={() => {
          if (!user) { navigate('/login'); return; }
          navigate('/publish', { state: {} });
        }}
        className="fixed bottom-28 right-6 w-14 h-14 bg-[#84B741] text-white rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(132,183,65,0.4)] hover:scale-110 active:scale-95 transition-all z-40 border-4 border-white"
      >
        <PlusCircle size={30} strokeWidth={2.5} />
      </button>
    </div>
  );
}
