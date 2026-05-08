import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Sparkles, Clock, Flame, Heart, Share2, Bookmark, Check } from 'lucide-react';

function IngredientItem({ name, amount }: { name: string; amount: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex justify-between items-center">
      <span className="font-semibold text-slate-700">{name}</span>
      <span className="text-slate-500 text-sm font-medium">{amount}</span>
    </div>
  );
}

function StepItem({ num, text }: { num: number; text: string }) {
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

export default function RecipePage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const handleSave = () => {
    if (saved) return;
    setSaved(true);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden hide-scrollbar z-50">
      {/* Toast */}
      <div
        className={`absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg transition-all duration-300 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <Check size={16} className="text-[#84B741]" />
        已保存到我的菜谱
      </div>

      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 pt-12 pb-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <button onClick={() => navigate('/')} className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-95">
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
            番茄浓汤炖牛肉<br />
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

        <button
          onClick={handleSave}
          className={`flex-1 ml-6 h-14 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${
            saved
              ? 'bg-[#84B741] text-white'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {saved ? (
            <>
              <Check size={20} /> 已保存
            </>
          ) : (
            <>
              <Bookmark size={20} /> 保存到我的菜谱
            </>
          )}
        </button>
      </div>
    </div>
  );
}
