import { useState } from 'react';
import { Settings, LayoutGrid, Bookmark, Image as ImageIcon } from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');

  return (
    <div className="flex flex-col h-full w-full bg-white relative pb-24">
      <header className="px-6 pt-12 pb-2 flex justify-between items-center bg-white z-10">
        <div className="w-10 h-10"></div>
        <button className="w-10 h-10 flex items-center justify-center text-slate-600">
          <Settings size={22} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="px-6 pt-2 pb-6 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#EAF2D7] border-4 border-white shadow-md flex items-center justify-center text-6xl pt-2">
            🥑
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">美食控牛油果</h1>
            <p className="text-sm text-slate-500 mb-3">CookAI 号: cook_avocado</p>
            <div className="flex gap-6 text-slate-800 font-medium">
              <div className="flex flex-col items-center"><span className="text-lg font-bold">12</span><span className="text-xs text-slate-500">关注</span></div>
              <div className="flex flex-col items-center"><span className="text-lg font-bold">345</span><span className="text-xs text-slate-500">粉丝</span></div>
              <div className="flex flex-col items-center"><span className="text-lg font-bold">1.2k</span><span className="text-xs text-slate-500">获赞与收藏</span></div>
            </div>
          </div>
        </div>

        <div className="px-6 text-sm text-slate-600 mb-6">
          热爱生活，热爱厨房。用AI探索无限美味可能 ✨
        </div>

        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 font-bold flex justify-center items-center gap-2 relative ${
              activeTab === 'posts' ? 'text-[#84B741]' : 'font-medium text-slate-400'
            }`}
          >
            <LayoutGrid size={18} /> 我的发布
            {activeTab === 'posts' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#84B741] rounded-t-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 font-bold flex justify-center items-center gap-2 relative ${
              activeTab === 'saved' ? 'text-[#84B741]' : 'font-medium text-slate-400'
            }`}
          >
            <Bookmark size={18} /> 收藏菜谱
            {activeTab === 'saved' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#84B741] rounded-t-full"></div>
            )}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 mt-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-slate-100 flex items-center justify-center text-slate-300">
              <ImageIcon size={32} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
