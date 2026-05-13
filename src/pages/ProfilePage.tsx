import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Bookmark, LogOut, Clock, ChefHat, KeyRound, Lock, Eye, EyeOff, X, Copy, Check, Send } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useSavedRecipes } from '../hooks/useSavedRecipes';
import { buildDefaultPassword } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

// 邮箱脱敏：user@gmail.com → us**@gmail.com
function formatEmail(email: string | null | undefined): string {
  if (!email) return '未绑定邮箱';
  const [name, domain] = email.split('@');
  const masked = name.slice(0, 2) + '*'.repeat(Math.max(name.length - 2, 2));
  return `${masked}@${domain}`;
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

// ── 修改密码弹窗 ──────────────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { changePassword } = useAuthContext();
  const [oldPwd, setOldPwd]       = useState('');
  const [newPwd, setNewPwd]       = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [show, setShow]           = useState<Record<string, boolean>>({});
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');

  const toggleShow = (key: string) => setShow((s) => ({ ...s, [key]: !s[key] }));

  const handleChange = async () => {
    if (!oldPwd) { setError('请输入当前密码'); return; }
    if (newPwd.length < 8) { setError('新密码至少 8 位'); return; }
    if (newPwd !== confirmPwd) { setError('两次新密码不一致'); return; }
    setLoading(true);
    setError('');
    const { error } = await changePassword(oldPwd, newPwd);
    setLoading(false);
    if (error) {
      setError((error as { message?: string }).message ?? '修改失败');
    } else {
      setDone(true);
    }
  };

  const pwdInput = (key: string, label: string, value: string, onChange: (v: string) => void, placeholder: string) => (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{label}</label>
      <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 gap-3 focus-within:border-[#84B741] transition-colors">
        <Lock size={16} className="text-slate-400 shrink-0" />
        <input
          type={show[key] ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-slate-800 placeholder-slate-300 text-sm outline-none h-14"
        />
        <button type="button" onClick={() => toggleShow(key)} className="text-slate-400 hover:text-slate-600 p-1 shrink-0">
          {show[key] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-[28px] px-6 pt-6 pb-10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-slate-800">修改密码</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {!done ? (
          <div className="flex flex-col gap-4">
            {pwdInput('old', '当前密码', oldPwd, setOldPwd, '请输入当前密码')}
            {pwdInput('new', '新密码（至少 8 位）', newPwd, setNewPwd, '请输入新密码')}
            {pwdInput('confirm', '确认新密码', confirmPwd, setConfirmPwd, '再次输入新密码')}
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button
              onClick={handleChange}
              disabled={loading || !oldPwd || !newPwd || !confirmPwd}
              className="w-full h-13 rounded-full bg-gradient-to-r from-[#9ED05B] to-[#A8DC64] text-white font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 py-4"
            >
              {loading ? (
                <span className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </span>
              ) : (
                <><KeyRound size={18} /> 确认修改</>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#F2F8EB] flex items-center justify-center">
              <Check size={28} className="text-[#84B741]" />
            </div>
            <p className="text-base font-bold text-slate-800">密码已修改</p>
            <p className="text-xs text-slate-500">请使用新密码登录</p>
            <button onClick={onClose} className="w-full h-12 rounded-full bg-slate-900 text-white font-bold text-sm active:scale-95 transition-all">
              我知道了
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 主页面 ────────────────────────────────────────────────────────────────────

interface UserPost {
  id: string;
  title: string;
  images: string[];
  likes_count: number;
  created_at: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { savedRecipes, loading } = useSavedRecipes(user?.id);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('saved');
  const [showResetModal, setShowResetModal]       = useState(false);
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);
  const [displayName, setDisplayName] = useState('美食探索者');
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('profiles').select('username').eq('id', user.id).single()
      .then(({ data }) => {
        if (data?.username) setDisplayName(data.username);
      });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || activeTab !== 'posts') return;
    setPostsLoading(true);
    supabase
      .from('posts')
      .select('id, title, images, likes_count, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUserPosts(data ?? []);
        setPostsLoading(false);
      });
  }, [user?.id, activeTab]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const email = user?.email ?? null;

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
            <h1 className="text-xl font-bold text-slate-800 truncate">{displayName}</h1>
            <p className="text-xs text-slate-400 mb-3">{formatEmail(email)}</p>
            <div className="flex gap-5 text-slate-800">
              <div className="flex flex-col items-center">
                <span className="text-base font-bold">{savedRecipes.length}</span>
                <span className="text-xs text-slate-400">收藏</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-base font-bold">{userPosts.length}</span>
                <span className="text-xs text-slate-400">发布</span>
              </div>
            </div>
          </div>
        </div>

        {/* 账号设置卡片 */}
        <div className="mx-6 mb-5 bg-slate-50 rounded-[22px] divide-y divide-slate-100 border border-slate-100">
          <button
            onClick={() => setShowChangePwdModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-100/60 active:scale-[0.99] transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Lock size={16} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">修改密码</p>
              <p className="text-xs text-slate-400">验证当前密码后设置新密码</p>
            </div>
          </button>
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-100/60 active:scale-[0.99] transition-all"
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
          postsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-[#84B741] border-t-transparent animate-spin" />
            </div>
          ) : userPosts.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-400 gap-3">
              <LayoutGrid size={40} className="text-slate-200" />
              <p className="text-sm">还没有发布任何内容</p>
              <button
                onClick={() => navigate('/')}
                className="text-[#84B741] text-sm font-semibold"
              >
                去生成菜谱并发布 →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-4">
              {userPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                  <div className="w-full h-28 bg-[#F4F9EE] flex items-center justify-center text-4xl">
                    {post.images[0]
                      ? <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
                      : '🍳'
                    }
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug mb-2">{post.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Send size={10} /> 已发布
                      </span>
                      <span>{post.likes_count} 赞</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {showChangePwdModal && (
        <ChangePasswordModal onClose={() => setShowChangePwdModal(false)} />
      )}
      {showResetModal && email && (
        <ResetPasswordModal email={email} onClose={() => setShowResetModal(false)} />
      )}
    </div>
  );
}
