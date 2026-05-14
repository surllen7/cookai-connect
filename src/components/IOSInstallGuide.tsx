import { useState } from 'react';
import { Share, X } from 'lucide-react';

export default function IOSInstallGuide() {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-[320px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 border border-[#EAF2D7] relative">
        <button 
          onClick={() => setShow(false)}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1"
        >
          <X size={14} />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F2F8EB] flex items-center justify-center shrink-0">
            <Share size={20} className="text-[#84B741]" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 mb-0.5">安装 Savorly-识味 到桌面</p>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              点击下方工具栏的 <span className="inline-block px-1 bg-slate-100 rounded font-medium">分享按钮</span>，
              向下滑动找到并选择 <span className="font-semibold text-slate-700 underline underline-offset-2 decoration-[#84B741]">添加到主屏幕</span>。
            </p>
          </div>
        </div>
        
        {/* 指向下方的三角形 */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-[#EAF2D7] rotate-45 shadow-[4px_4px_10px_rgba(0,0,0,0.02)]"></div>
      </div>
    </div>
  );
}
