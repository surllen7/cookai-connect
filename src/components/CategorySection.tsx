import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { Ingredient, IngredientCategory } from '../types';

interface CategorySectionProps {
  category: IngredientCategory;
  title: string;
  icon: string;
  iconBg: string;
  items: Ingredient[];
  onToggle: (category: IngredientCategory, id: string) => void;
}

const VISIBLE_COUNT = 4;

export default function CategorySection({
  category,
  title,
  icon,
  iconBg,
  items,
  onToggle,
}: CategorySectionProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > VISIBLE_COUNT;

  return (
    <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50/50 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 ${iconBg} opacity-20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none`}></div>

      <div className="flex justify-between items-center mb-5 relative z-10">
        <div className="flex items-center gap-3 font-bold text-slate-800 text-lg">
          <span className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center text-xl shadow-sm border border-white`}>{icon}</span>
          <span className="tracking-wide">{title}</span>
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 text-sm flex items-center gap-1 font-medium hover:text-slate-600 transition-colors bg-slate-50 px-2 py-1 rounded-full"
          >
            {expanded ? '收起' : '展开'}
            <ChevronDown size={16} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 relative z-10">
        {items.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => onToggle(category, item.id)}
            className={`relative flex flex-col items-center justify-center aspect-[4/5] rounded-[22px] transition-all cursor-pointer select-none ${
              !expanded && idx >= VISIBLE_COUNT
                ? 'max-h-0 opacity-0 overflow-hidden -mb-3 mt-0 pointer-events-none'
                : 'max-h-40 opacity-100'
            } ${
              item.selected
                ? 'bg-[#F2F8EB] border-2 border-[#84B741] shadow-[0_4px_12px_rgba(132,183,65,0.15)]'
                : 'bg-[#FAFAFA] border-2 border-transparent hover:bg-slate-50 active:scale-95'
            }`}
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
