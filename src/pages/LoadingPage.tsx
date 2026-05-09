import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Sparkles } from 'lucide-react';
import { generateRecipe } from '../lib/recipeApi';
const FALLBACK_RECIPE = {
  name: '番茄浓汤炖牛肉',
  nameEn: 'Tomato Beef Stew',
  cookTime: '45分钟',
  difficulty: '新手友好',
  servings: '1-2人份',
  ingredients: [
    { name: '牛肉', amount: '300g' },
    { name: '番茄', amount: '2个' },
    { name: '生姜', amount: '3片' },
    { name: '生抽', amount: '1勺' },
    { name: '盐', amount: '适量' },
  ],
  steps: [
    { title: '处理食材', content: '将牛肉切块，冷水下锅加入生姜焯水去腥，捞出洗净备用。' },
    { title: '准备番茄', content: '番茄顶部划十字，开水烫去外皮，切成小丁备用，丁越小汤汁越浓郁。' },
    { title: '炒出红油', content: '热锅冷油，下入番茄丁中火翻炒至出红油，约 3 分钟。' },
    { title: '慢炖入味', content: '加入焯好的牛肉块翻炒均匀，加开水没过食材，大火烧开转小火炖 40 分钟。' },
    { title: '出锅调味', content: '加盐和生抽调味，大火收汁至浓稠即可出锅装盘。' },
  ],
  tip: '牛肉焯水时加几片生姜和料酒，能有效去除腥味，汤色也更清亮。',
};

export default function LoadingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const called = useRef(false);
  const [progress, setProgress] = useState(0);
  const [streamText, setStreamText] = useState('');

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const mainIngredients: string[] = state?.mainIngredients ?? [];
    const condiments: string[] = state?.condiments ?? [];

    const run = async () => {
      try {
        const response = await generateRecipe(mainIngredients, condiments, (delta) => {
          setStreamText((prev) => {
            const next = prev + delta;
            // 粗略用字符数估算进度，上限 90%（留给解析阶段）
            setProgress(Math.min(90, Math.floor((next.length / 800) * 90)));
            return next;
          });
        });
        setProgress(100);
        navigate('/recipe', { state: { recipeResponse: response }, replace: true });
      } catch (err) {
        console.error('[CookAI] 菜谱生成失败，使用示例菜谱', err);
        navigate('/recipe', { state: { recipeResponse: { mode: 'recipe', data: FALLBACK_RECIPE } }, replace: true });
      }
    };

    run();
  }, [navigate, state]);

  return (
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
            <span className="w-1.5 h-1.5 bg-[#84B741] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-[#84B741] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-[#84B741] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
        </h2>

        <div className="w-full max-w-[280px] space-y-4">
          {/* 进度条 */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#84B741] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* 流式文本预览（最多显示最近 60 字） */}
          {streamText ? (
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono break-all line-clamp-3">
              {streamText.slice(-60)}
            </p>
          ) : (
            <>
              <div className="h-3 w-3/4 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="h-3 w-full bg-slate-200 rounded-full animate-pulse delay-75"></div>
              <div className="h-3 w-5/6 bg-slate-200 rounded-full animate-pulse delay-150"></div>
              <div className="h-3 w-1/2 bg-[#E1EFD0] rounded-full animate-pulse delay-300"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
