import { useState, useRef } from 'react';
import { ChevronDown, Check, Plus, X, AlertCircle } from 'lucide-react';
import type { Ingredient, IngredientCategory } from '../types';

interface CategorySectionProps {
  category: IngredientCategory;
  title: string;
  icon: string;
  iconBg: string;
  items: Ingredient[];
  onToggle: (category: IngredientCategory, id: string) => void;
  onAddCustom: (category: IngredientCategory, name: string) => void;
  onRemoveCustom: (category: IngredientCategory, id: string) => void;
}

const VISIBLE_COUNT = 4;

// 本地可食用性校验：拦截明显非食材输入
function validateIngredient(name: string, existing: Ingredient[]): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null; // 空输入不提示
  if (trimmed.length < 1) return '至少输入 1 个字符';
  if (trimmed.length > 15) return '食材名称不超过 15 个字';
  if (/^\d+$/.test(trimmed)) return '请输入食材名称，不能是纯数字';
  if (/^[^一-龥a-zA-Z]+$/.test(trimmed)) return '包含无法识别的字符';
  if (existing.some((i) => i.name === trimmed)) return '该食材已存在';
  return null; // 通过
}

function IngredientCard({ item, onToggle, onRemove }: {
  item: Ingredient;
  onToggle: () => void;
  onRemove?: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`relative flex flex-col items-center justify-center aspect-[4/5] rounded-[22px] transition-all cursor-pointer select-none ${
        item.selected
          ? 'bg-[#F2F8EB] border-2 border-[#84B741] shadow-[0_4px_12px_rgba(132,183,65,0.15)]'
          : 'bg-[#FAFAFA] border-2 border-transparent hover:bg-slate-50 active:scale-95'
      }`}
    >
      {/* 自定义食材删除按钮 */}
      {item.custom && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-400 hover:bg-red-400 rounded-full border-2 border-white flex items-center justify-center z-20 transition-colors"
        >
          <X size={9} strokeWidth={3} className="text-white" />
        </button>
      )}
      {item.selected && (
        <div className="absolute -bottom-2 -right-1 w-6 h-6 bg-[#84B741] rounded-full border-[2.5px] border-white flex items-center justify-center text-white shadow-md z-10 transform translate-x-[-2px] translate-y-[-2px]">
          <Check size={12} strokeWidth={4} />
        </div>
      )}
      {/* 自定义食材蓝点标识 */}
      {item.custom && (
        <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-blue-400 border border-white z-10" />
      )}
      <div className={`text-[36px] drop-shadow-md mb-2 transform transition-transform duration-300 ${item.selected ? 'scale-110' : 'hover:scale-110'}`}>
        {item.icon}
      </div>
      <div className={`text-[12px] font-bold text-center leading-tight px-1 ${item.selected ? 'text-[#709E35]' : 'text-slate-500'}`}>
        {item.name}
      </div>
    </div>
  );
}

export default function CategorySection({
  category,
  title,
  icon,
  iconBg,
  items,
  onToggle,
  onAddCustom,
  onRemoveCustom,
}: CategorySectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const hasMore = items.length > VISIBLE_COUNT;

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    const err = validateIngredient(trimmed, items);
    if (err) {
      setError(err);
      return;
    }
    if (!trimmed) return;
    onAddCustom(category, trimmed);
    setInputValue('');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setInputValue(''); setError(''); }
  };

  const handleInputChange = (v: string) => {
    setInputValue(v);
    if (error) setError(''); // 输入时清除错误
  };

  return (
    <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-50/50 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 ${iconBg} opacity-20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none`}></div>

      <div className="flex justify-between items-center mb-5 relative z-10">
        <div className="flex items-center gap-3 font-bold text-slate-800 text-lg">
          <span className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center text-xl shadow-sm border border-white`}>{icon}</span>
          <span className="tracking-wide">{title}</span>
        </div>
        <button
          onClick={() => { setExpanded(!expanded); setError(''); }}
          className="text-slate-400 text-sm flex items-center gap-1 font-medium hover:text-slate-600 transition-colors bg-slate-50 px-2 py-1 rounded-full"
        >
          {expanded ? '收起' : (hasMore ? '展开' : '添加')}
          <ChevronDown size={16} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="relative z-10">
        <div className="grid grid-cols-4 gap-3">
          {items.slice(0, VISIBLE_COUNT).map((item) => (
            <IngredientCard
              key={item.id}
              item={item}
              onToggle={() => onToggle(category, item.id)}
              onRemove={item.custom ? () => onRemoveCustom(category, item.id) : undefined}
            />
          ))}
        </div>

        {/* 展开区：更多食材 + 自定义输入框 */}
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {items.length > VISIBLE_COUNT && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {items.slice(VISIBLE_COUNT).map((item) => (
                <IngredientCard
                  key={item.id}
                  item={item}
                  onToggle={() => onToggle(category, item.id)}
                  onRemove={item.custom ? () => onRemoveCustom(category, item.id) : undefined}
                />
              ))}
            </div>
          )}

          {/* 自定义输入框 */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 mb-2 flex items-center gap-1">
              <Plus size={11} /> 没找到？手动添加食材
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`输入${title}名称，如：${
                    category === 'meat' ? '鸭肉' : 
                    category === 'vegetable' ? '青椒' : '料酒'
                  }`}
                  maxLength={15}
                  className={`w-full h-10 rounded-xl border px-3 text-sm text-slate-700 placeholder:text-slate-300 outline-none transition-colors ${
                    error
                      ? 'border-red-300 bg-red-50 focus:border-red-400'
                      : 'border-slate-200 bg-slate-50 focus:border-[#84B741] focus:bg-white'
                  }`}
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!inputValue.trim()}
                className="h-10 px-4 rounded-xl bg-[#84B741] text-white text-sm font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"
              >
                <Plus size={15} /> 添加
              </button>
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
