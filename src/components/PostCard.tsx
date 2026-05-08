import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { Post } from '../types';

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => prev + (liked ? -1 : 1));
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
      <div className={`w-full ${post.height} bg-slate-200 relative`}>
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-2">{post.title}</h3>
        <div className="flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-slate-200"></div>
            <span>{post.author}</span>
          </div>
          <button
            onClick={toggleLike}
            className="flex items-center gap-1 transition-colors"
          >
            <Heart
              size={14}
              fill={liked ? '#ef4444' : 'none'}
              stroke={liked ? '#ef4444' : 'currentColor'}
            />
            <span className={liked ? 'text-red-500' : ''}>{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
