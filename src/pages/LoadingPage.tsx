import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Sparkles } from 'lucide-react';

export default function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/recipe');
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

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
          <div className="h-3 w-3/4 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="h-3 w-full bg-slate-200 rounded-full animate-pulse delay-75"></div>
          <div className="h-3 w-5/6 bg-slate-200 rounded-full animate-pulse delay-150"></div>
          <div className="h-3 w-1/2 bg-[#E1EFD0] rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
    </div>
  );
}
