import { Search, PlusCircle } from 'lucide-react';
import PostCard from '../components/PostCard';
import { COMMUNITY_POSTS } from '../constants/mockData';

export default function CommunityPage() {
  const leftPosts = COMMUNITY_POSTS.filter((_, i) => i % 2 === 0);
  const rightPosts = COMMUNITY_POSTS.filter((_, i) => i % 2 !== 0);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 relative pb-24">
      <header className="px-6 pt-12 pb-2 bg-white flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-6 text-lg font-bold">
          <button className="text-slate-400">关注</button>
          <button className="text-slate-800 relative">
            发现
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#84B741] rounded-full"></div>
          </button>
        </div>
        <button className="w-10 h-10 flex items-center justify-center text-slate-600">
          <Search size={22} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-20 hide-scrollbar flex gap-4">
        <div className="w-1/2 flex flex-col gap-4">
          {leftPosts.map((post) => (
            <PostCard key={`col1-${post.id}`} post={post} />
          ))}
        </div>
        <div className="w-1/2 flex flex-col gap-4 mt-6">
          {rightPosts.map((post) => (
            <PostCard key={`col2-${post.id}`} post={post} />
          ))}
        </div>
      </main>

      <button className="absolute bottom-28 right-6 w-14 h-14 bg-[#84B741] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-20">
        <PlusCircle size={28} />
      </button>
    </div>
  );
}
