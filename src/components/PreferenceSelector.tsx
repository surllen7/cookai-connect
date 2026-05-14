import React from 'react';

interface Tag {
  id: string;
  label: string;
  emoji: string;
}

interface PreferenceSelectorProps {
  title: string;
  icon: string;
  tags: Tag[];
  selected: string[];
  onToggle: (id: string) => void;
  hint?: string;
}

export default function PreferenceSelector({
  title,
  icon,
  tags,
  selected,
  onToggle,
  hint = '可选',
}: PreferenceSelectorProps) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          {title}
        </h3>
        {hint && <span className="text-xs text-slate-400 font-medium">{hint}</span>}
      </div>
      <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1">
        {tags.map((tag) => {
          const isSelected = selected.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => onToggle(tag.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 border ${
                isSelected
                  ? 'bg-gradient-to-r from-[#9ED05B] to-[#A8DC64] text-white border-transparent shadow-md shadow-[#84B741]/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tag.emoji}</span>
              <span>{tag.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
