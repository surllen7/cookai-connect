import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, MoreHorizontal, Sparkles, Clock,
  Heart, Share2, Bookmark, Check, ChefHat, Plus,
  ArrowRight, Users, BarChart2, ListChecks, LogIn,
} from 'lucide-react';
import type { Recipe, RecipeStep, RecipeSuggestion, RecipeApiResponse } from '../types';
import { useAuthContext } from '../context/AuthContext';
import { useSavedRecipes } from '../hooks/useSavedRecipes';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=2070&auto=format&fit=crop';

// 常见食材 emoji 映射
const INGREDIENT_EMOJI: Record<string, string> = {
  牛肉: '🥩', 鸡肉: '🍗', 猪肉: '🥓', 虾仁: '🍤', 羊肉: '🍖', 鸡蛋: '🥚',
  番茄: '🍅', 西兰花: '🥦', 生菜: '🥬', 胡萝卜: '🥕', 香菇: '🍄', 青椒: '🫑',
  土豆: '🥔', 茄子: '🍆', 洋葱: '🧅', 大葱: '🧅', 豆腐: '🫘',
  大蒜: '🧄', 生姜: '🫚', 葱: '🧅', 生抽: '🍾', 辣椒: '🌶️',
  盐: '🧂', 油: '🫙', 料酒: '🍶', 淀粉: '🌾', 老抽: '🍾', 蚝油: '🫙',
  白糖: '🍬', 醋: '🫗', 豆瓣酱: '🥫', 花椒: '🌿', 八角: '⭐',
};

// ── 菜谱详情视图 ──────────────────────────────────────

function RecipeView({ recipe }: { recipe: Recipe }) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 hide-scrollbar">

      {/* 全屏头图 + 菜名覆盖 */}
      <div className="w-full h-64 relative">
        <img src={PLACEHOLDER_IMAGE} alt={recipe.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <p className="text-white/70 text-sm font-medium mb-1">{recipe.nameEn}</p>
          <h1 className="text-[26px] font-bold text-white leading-tight">{recipe.name}</h1>
        </div>
      </div>

      {/* 白色内容卡 */}
      <div className="bg-white rounded-t-[28px] -mt-5 relative z-10 px-5 pt-6">

        {/* AI 精选食材 banner */}
        {recipe.selectedFrom && recipe.selectedFrom.length > 0 && (
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
            <div className="w-7 h-7 rounded-full bg-blue-400 flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-500 mb-1">AI 主厨精选</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                从你的食材中精选了：
                <span className="font-semibold text-slate-700">{recipe.selectedFrom.join('、')}</span>
              </p>
              {recipe.selectionNote && (
                <p className="text-[11px] text-slate-400 mt-1">{recipe.selectionNote}</p>
              )}
            </div>
          </div>
        )}

        {/* 三栏 stats */}
        <div className="flex items-center justify-around py-4 bg-slate-50 rounded-2xl mb-7">
          <div className="flex flex-col items-center gap-1">
            <Clock size={18} className="text-[#84B741]" />
            <span className="text-[11px] text-slate-400 mt-0.5">烹饪时间</span>
            <span className="text-sm font-bold text-slate-700">{recipe.cookTime}</span>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="flex flex-col items-center gap-1">
            <BarChart2 size={18} className="text-[#84B741]" />
            <span className="text-[11px] text-slate-400 mt-0.5">难度</span>
            <span className="text-sm font-bold text-slate-700">{recipe.difficulty}</span>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="flex flex-col items-center gap-1">
            <Users size={18} className="text-[#84B741]" />
            <span className="text-[11px] text-slate-400 mt-0.5">适合</span>
            <span className="text-sm font-bold text-slate-700">{recipe.servings ?? '1-2人份'}</span>
          </div>
        </div>

        {/* 食材清单 */}
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-4">
            <Sparkles size={16} className="text-[#84B741]" /> 食材清单
          </h2>
          <div className="grid grid-cols-4 gap-x-3 gap-y-4">
            {recipe.ingredients.map((ing) => (
              <div key={ing.name} className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-full bg-[#F4F9EE] border border-[#E6F2D5] flex items-center justify-center text-2xl">
                  {INGREDIENT_EMOJI[ing.name] ?? '🥘'}
                </div>
                <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{ing.name}</span>
                <span className="text-[11px] text-slate-400">{ing.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 详细步骤 */}
        <div className="mb-7">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-5">
            <ListChecks size={16} className="text-[#84B741]" /> 详细步骤
          </h2>
          <div className="space-y-1">
            {recipe.steps.map((step: RecipeStep, i: number) => (
              <div key={i} className="flex gap-3">
                {/* 左侧时间轴 */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-[#84B741] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                    {i + 1}
                  </div>
                  {i < recipe.steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-[#D8EFBB] mt-1 mb-1 min-h-[20px]" />
                  )}
                </div>
                {/* 右侧卡片 */}
                <div className="flex-1 bg-white border border-slate-100 rounded-2xl px-4 py-3.5 shadow-sm mb-2">
                  <p className="text-sm font-bold text-slate-800 mb-1.5">{step.title}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI 小贴士 */}
        {recipe.tip && (
          <div className="flex items-start gap-3 bg-[#F4F9EE] border border-[#E6F2D5] rounded-2xl p-4 mb-8">
            <div className="w-7 h-7 rounded-full bg-[#84B741] flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#84B741] mb-1">小贴士</p>
              <p className="text-xs text-slate-500 leading-relaxed">{recipe.tip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 推荐方案视图 ──────────────────────────────────────

const CARD_STYLES = [
  { bg: 'bg-orange-50', border: 'border-orange-100', dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-500' },
  { bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-500' },
  { bg: 'bg-purple-50', border: 'border-purple-100', dot: 'bg-purple-400', badge: 'bg-purple-100 text-purple-500' },
];

function SuggestionCard({ suggestion, index, onPress }: {
  suggestion: RecipeSuggestion;
  index: number;
  onPress: () => void;
}) {
  const style = CARD_STYLES[index % 3];
  return (
    <button
      onClick={onPress}
      className={`w-full text-left rounded-[24px] border p-5 ${style.bg} ${style.border} active:scale-[0.98] transition-transform`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${style.dot}`} />
            <span className="text-xs font-semibold text-slate-500">方案 {index + 1}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 leading-tight">{suggestion.name}</h3>
          <p className="text-sm text-slate-400 mt-0.5">{suggestion.nameEn}</p>
        </div>
        <ChefHat size={30} className="text-slate-300 shrink-0 mt-1" />
      </div>
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{suggestion.description}</p>
      <div className="flex items-center gap-3 mb-4">
        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
          <Clock size={11} />{suggestion.cookTime}
        </span>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
          <BarChart2 size={11} />{suggestion.difficulty}
        </span>
      </div>
      {suggestion.additionalIngredients.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-400 mb-2">还需要准备：</p>
          <div className="flex flex-wrap gap-2">
            {suggestion.additionalIngredients.map((ing) => (
              <span key={ing} className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">
                <Plus size={10} className="text-[#84B741]" />{ing}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center justify-end gap-1 text-[#84B741] text-sm font-bold mt-1">
        查看完整做法 <ArrowRight size={15} />
      </div>
    </button>
  );
}

function SuggestionsView({ suggestions, onSelect }: {
  suggestions: RecipeSuggestion[];
  onSelect: (s: RecipeSuggestion) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 hide-scrollbar">
      <div className="px-5 pt-20 pb-6">
        <div className="flex items-center gap-2 text-[#84B741] font-semibold text-xs mb-3">
          <Sparkles size={14} /> AI 为你推荐
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">发现更多可能</h1>
        <p className="text-sm text-slate-400 mb-7">点击方案，AI 为你生成完整步骤菜谱</p>
        <div className="space-y-4">
          {suggestions.map((s, i) => (
            <SuggestionCard key={s.name} suggestion={s} index={i} onPress={() => onSelect(s)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 主页面 ────────────────────────────────────────────

export default function RecipePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const recipeResponse: RecipeApiResponse | undefined = state?.recipeResponse;
  const originalIngredients: string[] = state?.originalIngredients ?? [];

  const { user } = useAuthContext();
  const { saveRecipe, isRecipeSaved } = useSavedRecipes(user?.id);

  const recipe = recipeResponse?.mode === 'recipe' ? recipeResponse.data as Recipe : null;
  const alreadySaved = recipe ? isRecipeSaved(recipe.name) : false;

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleSave = async () => {
    if (!recipe) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (alreadySaved) return;
    setSaving(true);
    const ok = await saveRecipe(recipe);
    setSaving(false);
    showToast(ok ? '已保存到我的菜谱' : '保存失败，请重试');
  };

  const handleSelectSuggestion = (suggestion: RecipeSuggestion) => {
    navigate('/recipe', {
      state: {
        recipeResponse: { mode: 'recipe', data: suggestion },
        originalIngredients,
      },
    });
  };

  if (!recipeResponse) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
        <p>没有找到菜谱数据</p>
        <button onClick={() => navigate('/')} className="text-[#84B741] underline">返回首页</button>
      </div>
    );
  }

  const isSuggestions = recipeResponse.mode === 'suggestions';

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden hide-scrollbar z-50">

      {/* Toast */}
      <div className={`absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg transition-all duration-300 ${
        toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <Check size={16} className="text-[#84B741]" />
        {toastMsg}
      </div>

      {/* 顶部导航（悬浮在头图上） */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 pt-12 pb-4 bg-gradient-to-b from-black/30 to-transparent pointer-events-none">
        <button onClick={() => navigate(-1)} className="pointer-events-auto w-10 h-10 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95">
          <ArrowLeft size={20} />
        </button>
        {!isSuggestions && (
          <button className="pointer-events-auto w-10 h-10 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>

      {/* 内容区 */}
      {isSuggestions
        ? <SuggestionsView suggestions={recipeResponse.data as RecipeSuggestion[]} onSelect={handleSelectSuggestion} />
        : <RecipeView recipe={recipeResponse.data as Recipe} />
      }

      {/* 底部操作栏 */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {!isSuggestions ? (
          <div className="flex items-center gap-4 px-5 py-4 pb-6">
            {/* 左侧操作 */}
            <div className="flex gap-3">
              <button className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-red-500 transition-colors">
                <Heart size={22} />
                <span className="text-[10px]">收藏</span>
              </button>
              <button className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors">
                <Share2 size={22} />
                <span className="text-[10px]">分享</span>
              </button>
            </div>
            {/* 收藏按钮 */}
            <button
              onClick={handleSave}
              disabled={saving || alreadySaved}
              className={`flex-1 h-13 rounded-full font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all py-3.5 disabled:opacity-70 disabled:scale-100 ${
                alreadySaved ? 'bg-[#84B741] text-white' : 'bg-slate-900 text-white'
              }`}
            >
              {alreadySaved ? (
                <><Check size={18} /> 已保存</>
              ) : !user ? (
                <><LogIn size={18} /> 登录后保存</>
              ) : saving ? (
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                <><Bookmark size={18} /> 保存到我的菜谱</>
              )}
            </button>
          </div>
        ) : (
          <div className="px-5 py-4 pb-6">
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#9ED05B] to-[#A8DC64] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              <Sparkles size={18} /> 重新选择食材
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
