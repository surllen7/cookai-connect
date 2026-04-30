import { Search, ChevronDown, Check, Trash2, Home, Users, User, ArrowRight, Sparkles, ChefHat, Clock, Flame, Heart, Bookmark, Share2, ArrowLeft, MoreHorizontal, Settings, PlusCircle, LayoutGrid, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

// Initial state for ingredients
const INITIAL_INGREDIENTS = {
  meat: [
    { id: 'beef', name: '牛肉', icon: '🥩', selected: true },
    { id: 'chicken', name: '鸡肉', icon: '🍗', selected: false },
    { id: 'pork', name: '猪肉', icon: '🥓', selected: false },
    { id: 'shrimp', name: '虾仁', icon: '🍤', selected: false },
    { id: 'lamb', name: '羊肉', icon: '🍖', selected: false },
  ],
  vegetable: [
    { id: 'broccoli', name: '西兰花', icon: '🥦', selected: false },
    { id: 'tomato', name: '番茄', icon: '🍅', selected: true },
    { id: 'lettuce', name: '生菜', icon: '🥬', selected: false },
    { id: 'carrot', name: '胡萝卜', icon: '🥕', selected: false },
    { id: 'mushroom', name: '香菇', icon: '🍄', selected: false },
  ],
  condiment: [
    { id: 'garlic', name: '大蒜', icon: '🧄', selected: false },
    { id: 'ginger', name: '生姜', icon: '🫚', selected: true },
    { id: 'onion', name: '葱', icon: '🧅', selected: false },
    { id: 'soy_sauce', name: '生抽', icon: '🍾', selected: false },
    { id: 'chili', name: '辣椒', icon: '🌶️', selected: false },
  ]
};

// Mock community posts
const COMMUNITY_POSTS = [
  { id: 1, title: '周末在家做顿好的，红烧肉yyds！', author: '美食课代表', likes: 2341, image: 'https://images.unsplash.com/photo-1544025162-811114bd2446?q=80&w=1000&auto=format&fit=crop', height: 'h-64' },
  { id: 2, title: '减脂期也能吃的全麦轻食餐', author: 'FitGirl', likes: 892, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop', height: 'h-48' },
  { id: 3, title: '零失败！空气炸锅版烤鸡翅', author: '大厨养成记', likes: 4500, image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?q=80&w=1000&auto=format&fit=crop', height: 'h-56' },
  { id: 4, title: '一碗治愈心灵的日式拉面', author: '拉面控', likes: 1205, image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=1000&auto=format&fit=crop', height: 'h-64' },
];

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'loading' | 'recipe' | 'community' | 'profile'>('home');
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);

  // Toggle ingredient selection
  const toggleIngredient = (category: keyof typeof INITIAL_INGREDIENTS, id: string) => {
    setIngredients(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    }));
  };

  // Clear all selections
  const clearSelections = () => {
    setIngredients({
      meat: INITIAL_INGREDIENTS.meat.map(i => ({...i, selected: false})),
      vegetable: INITIAL_INGREDIENTS.vegetable.map(i => ({...i, selected: false})),
      condiment: INITIAL_INGREDIENTS.condiment.map(i => ({...i, selected: false}))
    });
  };

  // Loading state effect
  useEffect(() => {
    if (currentView === 'loading') {
      const timer = setTimeout(() => {
        setCurrentView('recipe');
      }, 3500); // Simulate AI loading
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  return (
    <div className="max-w-md mx-auto h-screen bg-[#FDFBF7] relative flex flex-col font-sans overflow-hidden shadow-2xl sm:border-x sm:border-slate-200">
      
      {/* View: Home (Smart Match) */}
      {currentView === 'home' && (
        <>
          <header className="px-6 pt-12 pb-4 flex items-center justify-between bg-[#FDFBF7] z-10 shrink-0">
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-[#84B741]">CookAI</span> <span className="text-slate-800">Connect</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 border border-slate-100 hover:bg-slate-50 transition-colors">
                <Search size={20} />
              </button>
              <div 
                className="w-10 h-10 rounded-full bg-[#EAF2D7] border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setCurrentView('profile')}
              >
                <div className="text-2xl pt-1">🥑</div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto pb-44 px-6 hide-scrollbar relative">
            <div className="flex justify-between items-end mb-6 mt-2">
              <div>
                <h1 className="text-[32px] font-bold text-slate-800 mb-1 flex items-center gap-2 relative">
                  选择食材
                  <div className="h-1.5 w-16 bg-[#84B741] rounded-full absolute bottom-1 right-0 opacity-40 rotate-[-4deg]"></div>
                </h1>
                <p className="text-[13px] text-slate-500 flex items-center">
                  选择你拥有的食材，AI 帮你搭配美味菜谱 <Sparkles size={14} className="ml-1 text-yellow-400" />
                </p>
              </div>
              <button 
                onClick={clearSelections}
                className="flex items-center gap-1 text-[#84B741] bg-[#F2F8E8] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#E1EFD0] hover:bg-[#EAF4DE] transition-colors active:scale-95"
              >
                <Trash2 size={14} /> 清空
              </button>
            </div>

            <div className="space-y-5">
              <CategorySection category="meat" title="肉类" icon="🥩" iconBg="bg-red-50" items={ingredients.meat} onToggle={toggleIngredient} />
              <CategorySection category="vegetable" title="蔬菜" icon="🥬" iconBg="bg-green-50" items={ingredients.vegetable} onToggle={toggleIngredient} />
              <CategorySection category="condiment" title="调料" icon="🧂" iconBg="bg-amber-50" items={ingredients.condiment} onToggle={toggleIngredient} />
            </div>
          </main>

          {/* Floating Action Button */}
          <div className="absolute bottom-24 left-0 right-0 px-6 flex justify-center pointer-events-none z-20">
            <button 
              onClick={() => setCurrentView('loading')}
              className="pointer-events-auto w-full max-w-[340px] h-[72px] rounded-full bg-gradient-to-r from-[#9ED05B] via-[#A8DC64] to-[#F7DE70] shadow-[0_12px_30px_rgba(158,208,91,0.35)] flex items-center justify-between px-3 pr-6 overflow-hidden relative group transform hover:scale-[1.02] transition-transform active:scale-[0.98]"
            >
              <Sparkles size={16} className="absolute top-4 left-32 text-white/60" />
              <Sparkles size={12} className="absolute bottom-3 right-16 text-white/60" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-inner">
                  <span className="font-bold text-xl leading-none pt-1">AI</span>
                </div>
                <div className="text-left flex flex-col justify-center">
                  <div className="text-white font-bold text-[22px] leading-tight tracking-wide drop-shadow-sm">AI 智能搭配</div>
                  <div className="text-white/95 text-[11px] font-medium tracking-wide">让 AI 帮你生成美味菜谱</div>
                </div>
              </div>
              <ArrowRight className="text-white relative z-10" size={24} strokeWidth={2.5} />
            </button>
          </div>
        </>
      )}

      {/* View: Community */}
      {currentView === 'community' && (
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
            {/* Simple split for masonry layout approximation */}
            <div className="w-1/2 flex flex-col gap-4">
              {COMMUNITY_POSTS.filter((_, i) => i % 2 === 0).map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <div className="w-1/2 flex flex-col gap-4 mt-6">
              {COMMUNITY_POSTS.filter((_, i) => i % 2 !== 0).map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </main>
          
          <button className="absolute bottom-28 right-6 w-14 h-14 bg-[#84B741] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-20">
            <PlusCircle size={28} />
          </button>
        </div>
      )}

      {/* View: Profile */}
      {currentView === 'profile' && (
        <div className="flex flex-col h-full w-full bg-white relative pb-24">
          <header className="px-6 pt-12 pb-2 flex justify-between items-center bg-white z-10">
            <div className="w-10 h-10"></div> {/* Spacer */}
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
              <button className="flex-1 py-3 font-bold text-[#84B741] flex justify-center items-center gap-2 relative">
                <LayoutGrid size={18} /> 我的发布
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#84B741] rounded-t-full"></div>
              </button>
              <button className="flex-1 py-3 font-medium text-slate-400 flex justify-center items-center gap-2">
                <Bookmark size={18} /> 收藏菜谱
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-1 mt-1">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-slate-100 flex items-center justify-center text-slate-300">
                  <ImageIcon size={32} />
                </div>
              ))}
            </div>
          </main>
        </div>
      )}

      {/* View: Loading & Streaming State */}
      {currentView === 'loading' && (
        <div className="flex flex-col items-center justify-center h-full w-full relative z-50 bg-[#FDFBF7]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#F2F8E8] to-[#FDFBF7] opacity-50"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-8">
            <div className="w-48 h-48 mb-8 relative">
              <div className="absolute inset-0 bg-[#A8DC64] rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="absolute inset-4 bg-[#F7DE70] rounded-full blur-2xl opacity-20 animate-pulse delay-700"></div>
              
              <div className="w-full h-full bg-white rounded-full shadow-xl border-4 border-[#FDFBF7] flex items-center justify-center relative overflow-hidden">
                <ChefHat size={64} className="text-[#84B741] drop-shadow-md" />
                <Sparkles size={24} className="absolute top-8 right-8 text-yellow-400 animate-bounce" />
                <Sparkles size={16} className="absolute bottom-10 left-10 text-yellow-300 animate-ping" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="inline-block animate-pulse">AI大厨正在为您构思菜谱</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#84B741] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-1.5 h-1.5 bg-[#84B741] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                <span className="w-1.5 h-1.5 bg-[#84B741] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
              </span>
            </h2>

            <div className="w-full max-w-[280px] space-y-4">
              <div className="h-3 w-3/4 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="h-3 w-full bg-slate-200 rounded-full animate-pulse delay-75"></div>
              <div className="h-3 w-5/6 bg-slate-200 rounded-full animate-pulse delay-150"></div>
              <div className="h-3 w-1/2 bg-[#E1EFD0] rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      )}

      {/* View: Recipe Detail Page */}
      {currentView === 'recipe' && (
        <div className="flex flex-col h-full w-full bg-white relative overflow-hidden hide-scrollbar z-50">
          <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 pt-12 pb-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
            <button onClick={() => setCurrentView('home')} className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95">
              <ArrowLeft size={20} />
            </button>
            <button className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-32 hide-scrollbar">
            <div className="w-full h-80 bg-slate-200 relative">
              <img 
                src="https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=2070&auto=format&fit=crop" 
                alt="番茄土豆炖牛腩" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            <div className="px-6 -mt-10 relative z-10 bg-white rounded-t-[32px] pt-8">
              <div className="flex items-center gap-2 text-[#84B741] font-semibold text-sm mb-2">
                <Sparkles size={16} /> AI 专属生成
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">
                番茄浓汤炖牛肉<br/>
                <span className="text-xl font-normal text-slate-500">Tomato Beef Stew</span>
              </h1>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><Clock size={16} /></div>
                  <span className="font-medium text-sm">45 分钟</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center"><Flame size={16} /></div>
                  <span className="font-medium text-sm">新手友好</span>
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#84B741] rounded-full"></div>
                  所需配料
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <IngredientItem name="牛肉" amount="300g" />
                  <IngredientItem name="番茄" amount="2个" />
                  <IngredientItem name="生姜" amount="3片" />
                  <IngredientItem name="盐/生抽" amount="适量" />
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#84B741] rounded-full"></div>
                  烹饪步骤
                </h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#84B741] before:via-[#E1EFD0] before:to-transparent">
                  <StepItem num={1} text="将牛肉切块，冷水下锅加入生姜焯水去腥，捞出洗净备用。" />
                  <StepItem num={2} text="番茄顶部划十字，开水烫去外皮，切成小丁备用。番茄丁越小，汤汁越浓郁。" />
                  <StepItem num={3} text="热锅冷油，下入番茄丁翻炒至出红油，加入焯好的牛肉块继续翻炒均匀。" />
                  <StepItem num={4} text="加入没过食材的开水，大火烧开后转小火慢炖 40 分钟，出锅前加盐调味即可。" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-white border-t border-slate-100 flex items-center justify-between px-6 pb-6 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="flex gap-4">
              <button className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-red-500 transition-colors">
                <Heart size={24} />
                <span className="text-[10px] font-medium">1.2w</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-700 transition-colors">
                <Share2 size={24} />
                <span className="text-[10px] font-medium">分享</span>
              </button>
            </div>
            
            <button className="flex-1 ml-6 h-14 rounded-full bg-slate-900 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 active:scale-95 transition-all">
              <Bookmark size={20} /> 保存到我的菜谱
            </button>
          </div>
        </div>
      )}

      {/* Global Bottom Navigation (Visible only on main tabs) */}
      {['home', 'community', 'profile'].includes(currentView) && (
        <nav className="absolute bottom-0 left-0 right-0 h-[88px] bg-white/95 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-2 pb-6 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <NavItem icon={<Home size={26} strokeWidth={2.5} />} label="首页" active={currentView === 'home'} onClick={() => setCurrentView('home')} />
          <NavItem icon={<Users size={26} strokeWidth={2.5} />} label="社区" active={currentView === 'community'} onClick={() => setCurrentView('community')} />
          <NavItem icon={<User size={26} strokeWidth={2.5} />} label="我的" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
        </nav>
      )}
      
      {/* Home tab indicator bar (iOS style) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-slate-800 rounded-full z-50"></div>
    </div>
  );
}

// --- Subcomponents ---

function PostCard({ post }: { post: any }) {
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
          <div className="flex items-center gap-1">
            <Heart size={14} /> {post.likes}
          </div>
        </div>
      </div>
    </div>
  );
}

function IngredientItem({ name, amount }: { name: string, amount: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex justify-between items-center">
      <span className="font-semibold text-slate-700">{name}</span>
      <span className="text-slate-500 text-sm font-medium">{amount}</span>
    </div>
  );
}

function StepItem({ num, text }: { num: number, text: string }) {
  return (
    <div className="relative flex items-start">
      <div className="w-8 h-8 rounded-full bg-[#EAF4DE] border-2 border-white flex items-center justify-center z-10 shrink-0 shadow-sm text-[#84B741] font-bold text-sm">
        {num}
      </div>
      <div className="ml-4 bg-white border border-slate-100 shadow-sm rounded-2xl p-4 text-slate-600 text-sm leading-relaxed flex-1">
        {text}
      </div>
    </div>
  );
}

function CategorySection({ 
  category, 
  title, 
  icon, 
  iconBg, 
  items, 
  onToggle 
}: { 
  category: string, 
  title: string, 
  icon: string, 
  iconBg: string, 
  items: any[],
  onToggle: (cat: any, id: string) => void 
}) {
  return (
    <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50/50 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 ${iconBg} opacity-20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none`}></div>
      
      <div className="flex justify-between items-center mb-5 relative z-10">
        <div className="flex items-center gap-3 font-bold text-slate-800 text-lg">
          <span className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center text-xl shadow-sm border border-white`}>{icon}</span>
          <span className="tracking-wide">{title}</span>
        </div>
        <button className="text-slate-400 text-sm flex items-center gap-1 font-medium hover:text-slate-600 transition-colors bg-slate-50 px-2 py-1 rounded-full">
          展开 <ChevronDown size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-3 relative z-10">
        {items.map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onToggle(category, item.id)}
            className={`relative flex flex-col items-center justify-center aspect-[4/5] rounded-[22px] transition-all cursor-pointer select-none ${item.selected ? 'bg-[#F2F8EB] border-2 border-[#84B741] shadow-[0_4px_12px_rgba(132,183,65,0.15)]' : 'bg-[#FAFAFA] border-2 border-transparent hover:bg-slate-50 active:scale-95'}`}
          >
            {item.selected && (
              <div className="absolute -bottom-2 -right-1 w-6 h-6 bg-[#84B741] rounded-full border-[2.5px] border-white flex items-center justify-center text-white shadow-md z-10 transform translate-x-[-2px] translate-y-[-2px]">
                <Check size={12} strokeWidth={4} />
              </div>
            )}
            <div className={`text-[36px] drop-shadow-md mb-2 transform transition-transform duration-300 ${item.selected ? 'scale-110' : 'hover:scale-110'}`}>{item.icon}</div>
            <div className={`text-[12px] font-bold ${item.selected ? 'text-[#709E35]' : 'text-slate-500'}`}>{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 gap-1 relative ${active ? 'text-[#84B741]' : 'text-[#A0AEC0] hover:text-slate-600'} active:scale-95 transition-transform`}>
      <div className={`transition-all duration-300 ease-spring ${active ? '-translate-y-1 scale-110 drop-shadow-sm' : ''}`}>
        {icon}
      </div>
      <span className={`text-[11px] ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
      <div className={`absolute -bottom-3 w-1.5 h-1.5 rounded-full bg-[#84B741] transition-all duration-300 ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
    </button>
  );
}
