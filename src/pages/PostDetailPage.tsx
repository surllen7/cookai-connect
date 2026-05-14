import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Bookmark, ChefHat, Send, CornerDownRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';

// ── 类型 ──────────────────────────────────────────────────────

interface PostDetail {
  id: string;
  title: string;
  content: string | null;
  images: string[];
  tags: string[];
  likes_count: number;
  saves_count: number;
  comments_count: number;
  recipe_id: string | null;
  created_at: string;
  author: { username: string | null; nickname: string | null; avatar_emoji: string };
  liked: boolean;
  saved: boolean;
}

interface Comment {
  id: string;
  content: string;
  likes_count: number;
  created_at: string;
  parent_id: string | null;
  author: { username: string | null; nickname: string | null; avatar_emoji: string };
  liked: boolean;
  replies: Comment[];
}

// ── 工具 ──────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  return `${Math.floor(h / 24)}天前`;
}

function displayName(a: { nickname: string | null; username: string | null }) {
  return a.nickname ?? a.username ?? '知食分子';
}

// ── 评论项组件 ────────────────────────────────────────────────

function CommentItem({
  comment,
  onLike,
  onReply,
}: {
  comment: Comment;
  onLike: (id: string, toLike: boolean, isReply?: boolean, parentId?: string) => void;
  onReply: (id: string, name: string) => void;
}) {
  return (
    <div className="flex gap-3 py-3">
      <div className="w-8 h-8 rounded-full bg-[#EAF2D7] flex items-center justify-center text-base flex-shrink-0">
        {comment.author.avatar_emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-slate-700">{displayName(comment.author)}</span>
          <span className="text-[10px] text-slate-400">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">{comment.content}</p>
        <div className="flex items-center gap-4 mt-1.5">
          <button
            onClick={() => onReply(comment.id, displayName(comment.author))}
            className="text-[11px] text-slate-400 flex items-center gap-1 active:text-[#84B741]"
          >
            <CornerDownRight size={11} /> 回复
          </button>
          <button
            onClick={() => onLike(comment.id, !comment.liked)}
            className="flex items-center gap-1 text-[11px] text-slate-400 active:scale-95"
          >
            <Heart
              size={11}
              fill={comment.liked ? '#ef4444' : 'none'}
              stroke={comment.liked ? '#ef4444' : 'currentColor'}
            />
            <span className={comment.liked ? 'text-red-400' : ''}>{comment.likes_count || ''}</span>
          </button>
        </div>

        {/* 子回复 */}
        {comment.replies.length > 0 && (
          <div className="mt-2 bg-slate-50 rounded-xl px-3 py-1 space-y-2">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2 pt-2 first:pt-2">
                <div className="w-6 h-6 rounded-full bg-[#EAF2D7] flex items-center justify-center text-xs flex-shrink-0">
                  {reply.author.avatar_emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-semibold text-slate-700">{displayName(reply.author)}</span>
                    <span className="text-[10px] text-slate-400">{timeAgo(reply.created_at)}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{reply.content}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <button
                      onClick={() => onReply(comment.id, displayName(reply.author))}
                      className="text-[10px] text-slate-400 flex items-center gap-1 active:text-[#84B741]"
                    >
                      <CornerDownRight size={10} /> 回复
                    </button>
                    <button
                      onClick={() => onLike(reply.id, !reply.liked, true, comment.id)}
                      className="flex items-center gap-1 text-[10px] text-slate-400"
                    >
                      <Heart
                        size={10}
                        fill={reply.liked ? '#ef4444' : 'none'}
                        stroke={reply.liked ? '#ef4444' : 'currentColor'}
                      />
                      <span className={reply.liked ? 'text-red-400' : ''}>{reply.likes_count || ''}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 主页面 ────────────────────────────────────────────────────

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 获取帖子详情
  const fetchPost = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, content, images, tags, likes_count, saves_count, comments_count, recipe_id, created_at, profiles(username, nickname, avatar_emoji)')
      .eq('id', id)
      .single();

    if (error || !data) { setLoadingPost(false); return; }

    let liked = false;
    let saved = false;
    if (user) {
      const { data: l } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_type', 'post')
        .eq('target_id', id)
        .maybeSingle();
      liked = !!l;
      const { data: s } = await supabase
        .from('saves')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_type', 'post')
        .eq('target_id', id)
        .maybeSingle();
      saved = !!s;
    }

    const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    setPost({
      id: data.id,
      title: data.title,
      content: data.content,
      images: data.images ?? [],
      tags: data.tags ?? [],
      likes_count: data.likes_count,
      saves_count: data.saves_count,
      comments_count: data.comments_count,
      recipe_id: data.recipe_id,
      created_at: data.created_at,
      author: {
        username: (profile as any)?.username ?? null,
        nickname: (profile as any)?.nickname ?? null,
        avatar_emoji: (profile as any)?.avatar_emoji ?? '🥑',
      },
      liked,
      saved,
    });
    setLoadingPost(false);
  }, [id, user]);

  // 获取评论列表
  const fetchComments = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('comments')
      .select('id, content, likes_count, created_at, parent_id, profiles(username, nickname, avatar_emoji)')
      .eq('target_type', 'post')
      .eq('target_id', id)
      .order('created_at', { ascending: true });

    if (error || !data) return;

    // 查当前用户对评论的点赞
    let likedCommentIds = new Set<string>();
    if (user) {
      const { data: lData } = await supabase
        .from('likes')
        .select('target_id')
        .eq('user_id', user.id)
        .eq('target_type', 'comment');
      likedCommentIds = new Set((lData ?? []).map((l) => l.target_id));
    }

    const toComment = (raw: any): Comment => {
      const profile = Array.isArray(raw.profiles) ? raw.profiles[0] : raw.profiles;
      return {
        id: raw.id,
        content: raw.content,
        likes_count: raw.likes_count,
        created_at: raw.created_at,
        parent_id: raw.parent_id,
        author: {
          username: profile?.username ?? null,
          nickname: profile?.nickname ?? null,
          avatar_emoji: profile?.avatar_emoji ?? '🥑',
        },
        liked: likedCommentIds.has(raw.id),
        replies: [],
      };
    };

    const rootComments: Comment[] = [];
    const replyMap = new Map<string, Comment[]>();

    data.forEach((raw) => {
      const c = toComment(raw);
      if (!c.parent_id) {
        rootComments.push(c);
      } else {
        const arr = replyMap.get(c.parent_id) ?? [];
        arr.push(c);
        replyMap.set(c.parent_id, arr);
      }
    });

    rootComments.forEach((c) => {
      c.replies = replyMap.get(c.id) ?? [];
    });

    setComments(rootComments);
  }, [id, user]);

  useEffect(() => { fetchPost(); fetchComments(); }, [fetchPost, fetchComments]);

  // 点赞帖子
  const handleLikePost = async () => {
    if (!user) { navigate('/login'); return; }
    if (!post) return;
    const toLike = !post.liked;
    setPost((p) => p ? { ...p, liked: toLike, likes_count: p.likes_count + (toLike ? 1 : -1) } : p);
    if (toLike) {
      await supabase.from('likes').insert({ user_id: user.id, target_type: 'post', target_id: post.id });
    } else {
      await supabase.from('likes').delete()
        .eq('user_id', user.id).eq('target_type', 'post').eq('target_id', post.id);
    }
  };

  // 收藏帖子
  const handleSavePost = async () => {
    if (!user) { navigate('/login'); return; }
    if (!post) return;
    const toSave = !post.saved;
    setPost((p) => p ? { ...p, saved: toSave, saves_count: p.saves_count + (toSave ? 1 : -1) } : p);
    if (toSave) {
      await supabase.from('saves').insert({ user_id: user.id, target_type: 'post', target_id: post.id });
    } else {
      await supabase.from('saves').delete()
        .eq('user_id', user.id).eq('target_type', 'post').eq('target_id', post.id);
    }
  };

  // 点赞评论（乐观更新）
  const handleLikeComment = async (commentId: string, toLike: boolean, isReply = false, parentId?: string) => {
    if (!user) { navigate('/login'); return; }

    setComments((prev) => prev.map((c) => {
      if (!isReply && c.id === commentId) {
        return { ...c, liked: toLike, likes_count: c.likes_count + (toLike ? 1 : -1) };
      }
      if (isReply && c.id === parentId) {
        return {
          ...c,
          replies: c.replies.map((r) =>
            r.id === commentId ? { ...r, liked: toLike, likes_count: r.likes_count + (toLike ? 1 : -1) } : r
          ),
        };
      }
      return c;
    }));

    if (toLike) {
      await supabase.from('likes').insert({ user_id: user.id, target_type: 'comment', target_id: commentId });
    } else {
      await supabase.from('likes').delete()
        .eq('user_id', user.id).eq('target_type', 'comment').eq('target_id', commentId);
    }
  };

  // 设置回复目标
  const handleReply = (commentId: string, name: string) => {
    if (!user) { navigate('/login'); return; }
    setReplyTo({ id: commentId, name });
    setInputValue(`回复 @${name}：`);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // 提交评论
  const handleSubmit = async () => {
    if (!user) { navigate('/login'); return; }
    const text = inputValue.trim();
    if (!text || !id) return;

    // 去掉"回复 @xxx：" 前缀，只保留正文
    const content = replyTo ? text.replace(/^回复 @.+?：/, '').trim() : text;
    if (!content) return;

    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      user_id: user.id,
      target_type: 'post',
      target_id: id,
      parent_id: replyTo?.id ?? null,
      content,
    });

    if (!error) {
      setInputValue('');
      setReplyTo(null);
      await fetchComments();
      // 同步更新帖子评论数
      setPost((p) => p ? { ...p, comments_count: p.comments_count + 1 } : p);
    }
    setSubmitting(false);
  };

  // ── 渲染 ────────────────────────────────────────────────────

  if (loadingPost) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#84B741] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 text-slate-400">
        <div className="text-5xl">😕</div>
        <p className="text-sm">帖子不存在或已删除</p>
        <button onClick={() => navigate(-1)} className="text-[#84B741] text-sm">返回</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 顶部导航 */}
      <header className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-slate-100 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-600">
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#EAF2D7] flex items-center justify-center text-base flex-shrink-0">
            {post.author.avatar_emoji}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{displayName(post.author)}</p>
            <p className="text-[10px] text-slate-400">{timeAgo(post.created_at)}</p>
          </div>
        </div>
      </header>

      {/* 正文区（可滚动） */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* 图片轮播 */}
        {post.images.length > 0 && (
          <div className="relative">
            <div
              className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
              onScroll={(e) => {
                const el = e.currentTarget;
                setImgIndex(Math.round(el.scrollLeft / el.clientWidth));
              }}
            >
              {post.images.map((url, i) => (
                <div key={i} className="flex-shrink-0 w-full snap-center aspect-square">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {post.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.images.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all ${i === imgIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 无图时展示菜谱 emoji */}
        {post.images.length === 0 && (
          <div className="h-48 bg-[#F4F9EE] flex items-center justify-center text-7xl">
            {post.recipe_id ? '🍳' : '✍️'}
          </div>
        )}

        <div className="px-4 pt-4 pb-2">
          {/* 菜谱角标 */}
          {post.recipe_id && (
            <div className="inline-flex items-center gap-1 bg-[#84B741]/10 text-[#84B741] text-[11px] font-bold px-2 py-0.5 rounded-full mb-2">
              <ChefHat size={11} /> 菜谱帖
            </div>
          )}

          <h1 className="text-lg font-bold text-slate-800 leading-snug">{post.title}</h1>

          {post.content && (
            <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          )}

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs text-[#84B741] bg-[#F4F9EE] px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 点赞/收藏/评论计数行 */}
          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-slate-100">
            <button onClick={handleLikePost} className="flex items-center gap-1.5 active:scale-95 transition-transform">
              <Heart
                size={20}
                fill={post.liked ? '#ef4444' : 'none'}
                stroke={post.liked ? '#ef4444' : '#94a3b8'}
              />
              <span className={`text-sm ${post.liked ? 'text-red-500' : 'text-slate-500'}`}>{post.likes_count}</span>
            </button>
            <button onClick={handleSavePost} className="flex items-center gap-1.5 active:scale-95 transition-transform">
              <Bookmark
                size={20}
                fill={post.saved ? '#84B741' : 'none'}
                stroke={post.saved ? '#84B741' : '#94a3b8'}
              />
              <span className={`text-sm ${post.saved ? 'text-[#84B741]' : 'text-slate-500'}`}>{post.saves_count}</span>
            </button>
            <div className="flex items-center gap-1.5 text-slate-500">
              <MessageCircle size={20} stroke="#94a3b8" />
              <span className="text-sm">{post.comments_count}</span>
            </div>
          </div>
        </div>

        {/* 评论区 */}
        <div className="px-4 pb-4">
          <h2 className="text-sm font-bold text-slate-700 mt-2 mb-1">
            评论 {comments.length > 0 ? `(${post.comments_count})` : ''}
          </h2>

          {comments.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-slate-300 gap-2">
              <MessageCircle size={32} />
              <p className="text-xs">还没有评论，来说第一句吧</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  onLike={handleLikeComment}
                  onReply={handleReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部评论输入栏 */}
      <div className="flex-shrink-0 border-t border-slate-100 bg-white px-4 py-3 pb-safe">
        {replyTo && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] text-slate-400">回复 @{replyTo.name}</span>
            <button
              onClick={() => { setReplyTo(null); setInputValue(''); }}
              className="text-[11px] text-slate-400 underline"
            >
              取消
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#EAF2D7] flex items-center justify-center text-base flex-shrink-0">
            {user ? '😊' : '👤'}
          </div>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => { if (!user) { navigate('/login'); } }}
            placeholder={user ? (replyTo ? `回复 @${replyTo.name}…` : '说点什么…') : '登录后发表评论'}
            className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none placeholder:text-slate-400"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !inputValue.trim()}
            className="w-9 h-9 rounded-full bg-[#84B741] flex items-center justify-center text-white disabled:opacity-40 active:scale-95 transition-transform flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
