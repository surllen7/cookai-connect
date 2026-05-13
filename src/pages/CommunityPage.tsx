import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, Heart, ChefHat } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';

interface CommunityPost {
  id: string;
  title: string;
  content: string | null;
  images: string[];
  tags: string[];
  likes_count: number;
  recipe_id: string | null;
  created_at: string;
  author: {
    username: string | null;
    avatar_emoji: string;
  };
  liked?: boolean;
}

function PostCard({ post, onLike }: { post: CommunityPost; onLike: (id: string, liked: boolean) => void }) {
  const imgHeight = 140 + Math.floor(Math.random() * 80);
  const coverImg = post.images[0];

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
      <div className="w-full bg-slate-100 relative" style={{ height: imgHeight }}>
        {coverImg ? (
          <img src={coverImg} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-[#F4F9EE]">
            🍳
          </div>
        )}
        {post.recipe_id && (
          <div className="absolute top-2 left-2 bg-[#84B741]/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <ChefHat size={9} /> 菜谱
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-2">{post.title}</h3>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] text-[#84B741] bg-[#F4F9EE] px-1.5 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#EAF2D7] flex items-center justify-center text-xs">
              {post.author.avatar_emoji}
            </div>
            <span className="truncate max-w-[60px]">{post.author.username ?? '美食家'}</span>
          </div>
          <button
            onClick={() => onLike(post.id, !post.liked)}
            className="flex items-center gap-1 transition-colors active:scale-95"
          >
            <Heart
              size={14}
              fill={post.liked ? '#ef4444' : 'none'}
              stroke={post.liked ? '#ef4444' : 'currentColor'}
            />
            <span className={post.liked ? 'text-red-500' : ''}>{post.likes_count}</span>
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
      .select('id, title, content, images, tags, likes_count, recipe_id, created_at, profiles(username, avatar_emoji)')
      .order('created_at', { ascending: false })
      .limit(40);

    if (error || !data) { setLoading(false); return; }

    // 查当前用户的点赞状态
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

    // 乐观更新
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
    <div className="flex flex-col h-full w-full bg-slate-50 relative pb-24">
      <header className="px-6 pt-12 pb-2 bg-white flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-6 text-lg font-bold">
          {(['following', 'discover'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-2 transition-colors ${activeTab === tab ? 'text-slate-800' : 'text-slate-400'}`}
            >
              {tab === 'following' ? '关注' : '发现'}
              {activeTab === tab && (
                <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#84B741] rounded-full" />
              )}
            </button>
          ))}
        </div>
        <button className="w-10 h-10 flex items-center justify-center text-slate-600">
          <Search size={22} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-20 hide-scrollbar">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-[#84B741] border-t-transparent animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400 gap-3">
            <div className="text-5xl">🍽️</div>
            <p className="text-sm">还没有人发布菜谱</p>
            <p className="text-xs text-slate-300">成为第一个分享的人吧！</p>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="w-1/2 flex flex-col gap-4">
              {leftPosts.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLike} />
              ))}
            </div>
            <div className="w-1/2 flex flex-col gap-4 mt-6">
              {rightPosts.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLike} />
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
        className="absolute bottom-28 right-6 w-14 h-14 bg-[#84B741] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-20"
      >
        <PlusCircle size={28} />
      </button>
    </div>
  );
}
