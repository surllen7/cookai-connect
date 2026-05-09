import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Bookmark, LogOut, Clock, ChefHat, KeyRound, X, Copy, Check } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useSavedRecipes } from '../hooks/useSavedRecipes';
import { buildDefaultPassword } from '../hooks/useAuth';

// 邮箱脱敏：user@gmail.com → us**@gmail.com
function formatEmail(email: string | null | undefined): string {
  if (!email) return '未绑定邮箱';
  const [name, domain] = email.split('@');
  const masked = name.slice(0, 2) + '*'.repeat(Math.max(name.length - 2, 2));
  return `${masked}@${domain}`;
}

// 昵称：取邮箱 @ 前的部分（最多8位）
function buildNickname(email: string | null | undefined): string {
  if (!email) return '美食探索者';
  return email.split('@')[0].slice(0, 8);
}

// ── 重置默认密码弹窗 ──────────────────────────────────────────────────────────
function ResetPasswordModal({ email, onClose }: { email: string; onClose: () => void }) {
  const { resetToDefaultPassword } = useAuthContext();
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [defaultPwd, setDefaultPwd] = useState('');
  const [copied, setCopied]     = useState(false);
  const [error, setError]       = useState('');

  const handleReset = async () => {
    setLoading(true);
    setError('');
    const { error, defaultPassword } = await resetToDefaultPassword(email);
    setLoading(false);
    if (error) {
      setError('重置失败，请稍后重试');
    } else {
      setDefaultPwd(defaultPassword);
      setDone(true);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(defaultPwd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-t-[28px] px-6 pt-6 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 拖拽条 */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-slate-800">重置为默认密码</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {!done ? (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
              <p className="text-sm text-amber-700 font-semibold mb-1">⚠️ 注意</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                默认密码格式为 <span className="font-mono font-bold">Cookai@邮箱前缀前6位</span>，
                重置后请尽快登录并修改为个人密码。
              </p>
            </div>
            {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}
            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full h-13 rounded-full bg-gradient-to-r from-[#9ED05B] to-[#A8DC64] text-white font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 py-4"
            >
              {loading ? (
                <span className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </span>
              ) : (
                <><KeyRound size={18} /> 确认重置密码</>
              )}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#F2F8EB] flex items-center justify-center">
              <Check size={28} className="text-[#84B741]" />
            </div>
            <p className="text-base font-bold text-slate-800">密码已重置</p>
            <p className="text-xs text-slate-500 text-center">你的新默认密码如下，请妥善保存：</p>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 w-full">
              <span className="flex-1 font-mono text-sm font-bold text-slate-800 tracking-widest">{defaultPwd}</span>
              <button onClick={handleCopy} className="text-slate-400 hover:text-[#84B741] transition-colors">
                {copied ? <Check size={16} className="text-[#84B741]" /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center">建议登录后在安全设置中修改为个人密码</p>
            <button
              onClick={onClose}
              className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm active:scale-95 transition-all"
            >
              我知道了
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 主页面 ────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { savedRecipes, loading } = useSavedRecipes(user?.id);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('saved');
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const email    = user?.email ?? null;
  const nickname = buildNickname(email);

  return (
    <div className="flex flex-col h-full w-full bg-white relative pb-24">
      <header className="px-6 pt-12 pb-2 flex justify-between items-center bg-white z-10">
        <div className="w-10 h-10" />
        <button
          onClick={handleSignOut}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar">
        {/* 头像 + 信息 */}
        <div className="px-6 pt-2 pb-4 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[#EAF2D7] border-4 border-white shadow-md flex items-center justify-center text-5xl shrink-0">
            🥑
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-800 truncate">{nickname}</h1>
            <p className="text-xs text-slate-400 mb-3">{formatEmail(email)}</p>
            <div className="flex gap-5 text-slate-800">
              <div className="flex flex-col items-center">
                <span className="text-base font-bold">{savedRecipes.length}</span>
                <span className="text-xs text-slate-400">收藏</span>
              </div>
            </div>
          </div>
        </div>

        {/* 账号设置卡片 */}
        <div className="mx-6 mb-5 bg-slate-50 rounded-[22px] divide-y divide-slate-100 border border-slate-100">
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-100/60 rounded-[22px] active:scale-[0.99] transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <KeyRound size={16} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">重置为默认密码</p>
              <p className="text-xs text-slate-400">重置为 Cookai@邮箱前缀前6位</p>
            </div>
          </button>
        </div>

        {/* Tab */}
        <div className="flex border-b border-slate-100 relative">
          {(['posts', 'saved'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 font-bold flex justify-center items-center gap-2 ${
                activeTab === t ? 'text-[#84B741]' : 'text-slate-400'
              }`}
            >
              {t === 'posts' ? <><LayoutGrid size={17} /> 我的发布</> : <><Bookmark size={17} /> 收藏菜谱</>}
            </button>
          ))}
          <div
            className="absolute bottom-0 h-1 w-1/2 bg-[#84B741] rounded-t-full transition-transform duration-300"
            style={{ transform: `translateX(${activeTab === 'posts' ? '0%' : '100%'})` }}
          />
        </div>

        {/* 内容区 */}
        {activeTab === 'saved' ? (
          loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-[#84B741] border-t-transparent animate-spin" />
            </div>
          ) : savedRecipes.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-400 gap-3">
              <ChefHat size={40} className="text-slate-200" />
              <p className="text-sm">还没有收藏任何菜谱</p>
              <button onClick={() => navigate('/')} className="text-[#84B741] text-sm font-semibold">
                去选食材，让 AI 生成 →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {savedRecipes.map(({ id, recipe, saved_at }) => (
                <div key={id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F4F9EE] flex items-center justify-center text-2xl shrink-0">🍳</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{recipe.name}</p>
                    <p className="text-xs text-slate-400 truncate">{recipe.nameEn}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={11} />{recipe.cookTime}</span>
                      <span>{recipe.difficulty}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-300 shrink-0">
                    {new Date(saved_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center py-16 text-slate-400 gap-3">
            <LayoutGrid size={40} className="text-slate-200" />
            <p className="text-sm">社区发布功能即将上线</p>
          </div>
        )}
      </main>

      {showResetModal && email && (
        <ResetPasswordModal email={email} onClose={() => setShowResetModal(false)} />
      )}
    </div>
  );
}
