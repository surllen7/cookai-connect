import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, ArrowRight, Sparkles, Download } from 'lucide-react';
import CategorySection from '../components/CategorySection';
import PreferenceSelector from '../components/PreferenceSelector';
import IOSInstallGuide from '../components/IOSInstallGuide';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { INITIAL_INGREDIENTS, FLAVOR_TAGS, COOK_METHOD_TAGS } from '../constants/mockData';
import type { IngredientCategory, IngredientsState } from '../types';

const ABUNDANCE_THRESHOLD = 6;

export default function HomePage() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState<IngredientsState>(INITIAL_INGREDIENTS);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const { installable, handleInstall, isIOS, isStandalone } = usePWAInstall();

  const toggleIngredient = (category: IngredientCategory, id: string) => {
    setIngredients((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      ),
    }));
  };

  const addCustomIngredient = (category: IngredientCategory, name: string) => {
    const id = `custom_${category}_${Date.now()}`;
    setIngredients((prev) => ({
      ...prev,
      [category]: [
        ...prev[category],
        { id, name, icon: '🥘', selected: true, custom: true },
      ],
    }));
  };

  const removeCustomIngredient = (category: IngredientCategory, id: string) => {
    setIngredients((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item.id !== id),
    }));
  };

  const clearSelections = () => {
    setIngredients({
      meat: INITIAL_INGREDIENTS.meat.map((i) => ({ ...i, selected: false })),
      vegetable: INITIAL_INGREDIENTS.vegetable.map((i) => ({ ...i, selected: false })),
      condiment: INITIAL_INGREDIENTS.condiment.map((i) => ({ ...i, selected: false })),
    });
    setSelectedFlavors([]);
    setSelectedMethods([]);
  };

  const toggleFlavor = (id: string) => {
    setSelectedFlavors((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleMethod = (id: string) => {
    setSelectedMethods((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const mainIngredients = [...ingredients.meat, ...ingredients.vegetable]
    .filter((i) => i.selected)
    .map((i) => i.name);
  const condiments = ingredients.condiment
    .filter((i) => i.selected)
    .map((i) => i.name);

  const totalSelected = mainIngredients.length + condiments.length;
  const isAbundance = mainIngredients.length >= ABUNDANCE_THRESHOLD;

  return (
    <>
      {isIOS && !isStandalone && <IOSInstallGuide />}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between bg-[#FDFBF7] z-10 shrink-0">
        <div className="text-2xl font-bold tracking-tight">
          <span className="text-[#84B741]">CookAI</span> <span className="text-slate-800">Connect</span>
        </div>
        <div className="flex items-center gap-3">
          {installable && (
            <button 
              onClick={handleInstall}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#9ED05B] to-[#A8DC64] shadow-md flex items-center justify-center text-white border border-white hover:opacity-90 transition-all animate-bounce-subtle"
              title="安装应用"
            >
              <Download size={20} strokeWidth={2.5} />
            </button>
          )}
          <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 border border-slate-100 hover:bg-slate-50 transition-colors">
            <Search size={20} />
          </button>
          <div
            className="w-10 h-10 rounded-full bg-[#EAF2D7] border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate('/profile')}
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

        {/* 食材过多提示 banner */}
        {isAbundance && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <span className="text-lg">✨</span>
            <div>
              <p className="text-xs font-bold text-amber-700">食材有点多！</p>
              <p className="text-[11px] text-amber-600">AI 将从 {mainIngredients.length} 种主食材中精选最佳搭配为你生成菜谱</p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          <CategorySection
            category="meat"
            title="肉类"
            icon="🥩"
            iconBg="bg-red-50"
            items={ingredients.meat}
            onToggle={toggleIngredient}
            onAddCustom={addCustomIngredient}
            onRemoveCustom={removeCustomIngredient}
          />
          <CategorySection
            category="vegetable"
            title="蔬菜"
            icon="🥬"
            iconBg="bg-green-50"
            items={ingredients.vegetable}
            onToggle={toggleIngredient}
            onAddCustom={addCustomIngredient}
            onRemoveCustom={removeCustomIngredient}
          />
          <CategorySection
            category="condiment"
            title="调料"
            icon="🧂"
            iconBg="bg-amber-50"
            items={ingredients.condiment}
            onToggle={toggleIngredient}
            onAddCustom={addCustomIngredient}
            onRemoveCustom={removeCustomIngredient}
          />

          <PreferenceSelector
            title="口味偏好"
            icon="🍳"
            tags={FLAVOR_TAGS}
            selected={selectedFlavors}
            onToggle={toggleFlavor}
          />
          
          <PreferenceSelector
            title="烹饪方式"
            icon="🔪"
            tags={COOK_METHOD_TAGS}
            selected={selectedMethods}
            onToggle={toggleMethod}
          />
        </div>
      </main>

      <div className="absolute bottom-24 left-0 right-0 px-6 flex justify-center pointer-events-none z-20">
        <button
          onClick={() =>
            navigate('/loading', {
              state: {
                mainIngredients,
                condiments,
                originalIngredients: mainIngredients,
                preferences: { flavors: selectedFlavors, cookMethods: selectedMethods },
              },
            })
          }
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
              <div className="text-white/95 text-[11px] font-medium tracking-wide">
                {totalSelected > 0
                  ? `已选 ${totalSelected} 种食材${selectedFlavors.length > 0 || selectedMethods.length > 0 ? ' · 包含偏好' : ''}${isAbundance ? ' · 精选模式' : ''}`
                  : '让 AI 帮你生成美味菜谱'}
              </div>
            </div>
          </div>
          <ArrowRight className="text-white relative z-10" size={24} strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
}
