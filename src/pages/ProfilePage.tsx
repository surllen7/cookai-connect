import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChefHat, KeyRound, Lock, Eye, EyeOff, X, Copy, Check, Send, Settings, LogOut, Heart, Pencil, ChevronRight } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useSavedRecipes } from '../hooks/useSavedRecipes';
import { buildDefaultPassword } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

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

// ── emoji 头像选择器弹窗 ──────────────────────────────────────────────────────
const AVATAR_EMOJIS = ['🥑', '🍳', '🥘', '🍜', '🍱', '🥗', '🍕', '🍣', '🥩', '🌮', '🧆', '🫕', '🍲', '🥟', '🍤', '🧁', '🍰', '🫖', '🌿', '🫚'];

function AvatarPickerModal({ current, onSave, onClose }: {
  current: string; onSave: (emoji: string) => void; onClose: () => void;
}) {
  const [selected, setSelected] = useState(current);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-[28px] px-5 pt-5 pb-10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-slate-800">选择头像</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-5 gap-3 mb-6">
          {AVATAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelected(emoji)}
              className={`w-full aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all active:scale-95 ${
                selected === emoji ? 'bg-[#84B741]/15 ring-2 ring-[#84B741]' : 'bg-slate-50'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <button
          onClick={() => { onSave(selected); onClose(); }}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#9ED05B] to-[#A8DC64] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <Check size={16} /> 确认选择
        </button>
      </div>
    </div>
  );
}

// ── 编辑昵称弹窗 ──────────────────────────────────────────────────────────────
function EditNicknameModal({ current, onSave, onClose }: {
  current: string; onSave: (name: string) => void; onClose: () => void;
}) {
  const [value, setValue] = useState(current);
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) { setError('昵称不能为空'); return; }
    if (trimmed.length > 20) { setError('昵称最多 20 个字符'); return; }
    onSave(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-[28px] px-5 pt-5 pb-10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-slate-800">修改昵称</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400"><X size={18} /></button>
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 gap-3 focus-within:border-[#84B741] transition-colors mb-1">
          <Pencil size={15} className="text-slate-400 shrink-0" />
          <input
            autoFocus
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            maxLength={20}
            placeholder="输入新昵称"
            className="flex-1 bg-transparent text-slate-800 placeholder-slate-300 text-sm outline-none h-14"
          />
          <span className="text-xs text-slate-300">{value.length}/20</span>
        </div>
        {error && <p className="text-red-400 text-xs ml-1 mb-3">{error}</p>}
        <p className="text-xs text-slate-400 mb-5 ml-1">昵称用于展示，可随时修改；登录账号 (username) 不变</p>
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#9ED05B] to-[#A8DC64] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <Check size={16} /> 保存昵称
        </button>
      </div>
    </div>
  );
}

// ── 设置底部抽屉 ──────────────────────────────────────────────────────────────
function SettingsDrawer({ email, avatarEmoji, nickname, onClose, onEditNickname, onEditAvatar, onChangePwd, onResetPwd, onSignOut }: {
  email: string | null;
  avatarEmoji: string;
  nickname: string;
  onClose: () => void;
  onEditNickname: () => void;
  onEditAvatar: () => void;
  onChangePwd: () => void;
  onResetPwd: () => void;
  onSignOut: () => void;
}) {
  const open = (fn: () => void) => { onClose(); setTimeout(fn, 150); };

  const Row = ({ icon, label, sub, onClick, iconBg }: {
    icon: React.ReactNode; label: string; sub?: string; onClick: () => void; iconBg: string;
  }) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-slate-100 transition-colors">
      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <ChevronRight size={16} className="text-slate-300" />
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-[28px] px-5 pt-5 pb-10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <h2 className="text-base font-bold text-slate-800 mb-4 px-1">账号设置</h2>

        {/* 用户信息 */}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">用户信息</p>
        <div className="bg-slate-50 rounded-[20px] divide-y divide-slate-100 overflow-hidden mb-3">
          <Row
            icon={<span className="text-xl">{avatarEmoji}</span>}
            label="更换头像"
            sub="点击选择 emoji 头像"
            iconBg="bg-[#F4F9EE]"
            onClick={() => open(onEditAvatar)}
          />
          <Row
            icon={<Pencil size={16} className="text-violet-500" />}
            label="修改昵称"
            sub={nickname}
            iconBg="bg-violet-100"
            onClick={() => open(onEditNickname)}
          />
        </div>

        {/* 账户安全 */}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">账户安全</p>
        <div className="bg-slate-50 rounded-[20px] divide-y divide-slate-100 overflow-hidden mb-3">
          <Row
            icon={<Lock size={16} className="text-blue-500" />}
            label="修改密码"
            sub="验证当前密码后设置新密码"
            iconBg="bg-blue-100"
            onClick={() => open(onChangePwd)}
          />
          <Row
            icon={<KeyRound size={16} className="text-amber-500" />}
            label="重置为默认密码"
            sub="Cookai@邮箱前缀前6位"
            iconBg="bg-amber-100"
            onClick={() => open(onResetPwd)}
          />
        </div>

        {/* 退出 */}
        <div className="bg-slate-50 rounded-[20px] overflow-hidden">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-slate-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
              <LogOut size={16} className="text-red-500" />
            </div>
            <p className="text-sm font-semibold text-red-500">退出登录</p>
          </button>
        </div>
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
  const { user, signOut, updateProfile } = useAuthContext();
  const { savedRecipes, loading } = useSavedRecipes(user?.id);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [savedSubTab, setSavedSubTab] = useState<'recipes' | 'posts'>('recipes');
  const [showSettings, setShowSettings]           = useState(false);
  const [showResetModal, setShowResetModal]       = useState(false);
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);
  const [showEditNickname, setShowEditNickname]   = useState(false);
  const [showAvatarPicker, setShowAvatarPicker]   = useState(false);
  const [nickname, setNickname] = useState('美食探索者');
  const [avatarEmoji, setAvatarEmoji] = useState('🥑');
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [savedPosts, setSavedPosts] = useState<UserPost[]>([]);
  const [savedPostsLoading, setSavedPostsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('profiles').select('nickname, avatar_emoji').eq('id', user.id).single()
      .then(({ data }) => {
        if (data?.nickname) setNickname(data.nickname);
        if (data?.avatar_emoji) setAvatarEmoji(data.avatar_emoji);
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
      .then(({ data }) => { setUserPosts(data ?? []); setPostsLoading(false); });
  }, [user?.id, activeTab]);

  useEffect(() => {
    if (!user?.id || activeTab !== 'saved' || savedSubTab !== 'posts') return;
    const fetchSavedPosts = async () => {
      setSavedPostsLoading(true);
      const { data: saves } = await supabase
        .from('saves')
        .select('target_id')
        .eq('user_id', user.id)
        .eq('target_type', 'post')
        .order('created_at', { ascending: false });

      if (!saves || saves.length === 0) {
        setSavedPosts([]);
        setSavedPostsLoading(false);
        return;
      }

      const postIds = saves.map((s) => s.target_id);
      const { data: posts } = await supabase
        .from('posts')
        .select('id, title, images, likes_count, created_at')
        .in('id', postIds);

      if (posts) {
        const sortedPosts = posts.sort((a, b) => postIds.indexOf(a.id) - postIds.indexOf(b.id));
        setSavedPosts(sortedPosts);
      }
      setSavedPostsLoading(false);
    };
    fetchSavedPosts();
  }, [user?.id, activeTab, savedSubTab]);

  const handleSaveNickname = async (name: string) => {
    setNickname(name);
    await updateProfile({ nickname: name });
  };

  const handleSaveAvatar = async (emoji: string) => {
    setAvatarEmoji(emoji);
    await updateProfile({ avatar_emoji: emoji });
  };

  const handleSignOut = async () => { await signOut(); navigate('/login'); };
  const email = user?.email ?? null;
  const totalLikes = userPosts.reduce((sum, p) => sum + p.likes_count, 0);

  return (
    <div className="flex flex-col h-full w-full bg-[#FDFBF7] relative pb-24">

      {/* 顶部右侧设置按钮 */}
      <div className="absolute top-12 right-5 z-10">
        <button
          onClick={() => setShowSettings(true)}
          className="w-9 h-9 rounded-full bg-white/80 border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 active:scale-95 transition-all"
        >
          <Settings size={18} />
        </button>
      </div>

      <main className="flex-1 overflow-y-auto hide-scrollbar">

        {/* 头像区（居中） */}
        <div className="flex flex-col items-center pt-14 pb-5 px-6">
          {/* 圆形头像 */}
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D4EEB0] to-[#A8DC64] border-4 border-white shadow-lg flex items-center justify-center text-5xl">
              {avatarEmoji}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#84B741] border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>

          {/* 用户名 */}
          <h1 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            {nickname}
            <span className="text-base">🌿</span>
          </h1>

          {/* 签名/邮箱 */}
          <p className="text-xs text-slate-400 text-center mb-5">
            用心烹饪每一餐，把生活过成喜欢的味道。
          </p>

          {/* 统计数据 */}
          <div className="flex items-center gap-10">
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1">
                <Heart size={13} className="text-[#84B741]" />
                <span className="text-base font-bold text-slate-800">
                  {totalLikes >= 10000 ? `${(totalLikes / 10000).toFixed(1)}w` : totalLikes}
                </span>
              </div>
              <span className="text-xs text-slate-400">获赞</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1">
                <span className="text-base">☆</span>
                <span className="text-base font-bold text-slate-800">{savedRecipes.length}</span>
              </div>
              <span className="text-xs text-slate-400">收藏</span>
            </div>
          </div>
        </div>

        {/* Tab 胶囊切换 */}
        <div className="flex px-5 gap-3 mb-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'posts'
                ? 'bg-[#84B741] text-white shadow-md shadow-[#84B741]/30'
                : 'bg-white border border-slate-200 text-slate-500'
            }`}
          >
            📋 我的发布
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'saved'
                ? 'bg-[#84B741] text-white shadow-md shadow-[#84B741]/30'
                : 'bg-white border border-slate-200 text-slate-500'
            }`}
          >
            ☆ 我的收藏
          </button>
        </div>

        {/* 内容区 */}
        {activeTab === 'posts' ? (
          postsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-[#84B741] border-t-transparent animate-spin" />
            </div>
          ) : userPosts.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-400 gap-3">
              <div className="text-5xl">📸</div>
              <p className="text-sm font-medium text-slate-500">还没有发布任何内容</p>
              <button onClick={() => navigate('/')} className="text-[#84B741] text-sm font-semibold">
                去生成菜谱并发布 →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5 px-0">
              {userPosts.map((post) => (
                <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="relative aspect-square bg-[#F4F9EE] overflow-hidden active:scale-[0.98] transition-transform cursor-pointer">
                  {post.images[0]
                    ? <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-5xl">🍳</div>
                  }
                  {/* 底部点赞数渐变遮罩 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2.5 py-2">
                    <span className="flex items-center gap-1 text-white text-xs font-semibold">
                      <Heart size={11} fill="white" stroke="none" />
                      {post.likes_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col">
            <div className="flex px-5 gap-4 mb-3 border-b border-slate-100">
              <button
                onClick={() => setSavedSubTab('recipes')}
                className={`pb-2 text-sm font-bold transition-colors relative ${
                  savedSubTab === 'recipes' ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                菜谱
                {savedSubTab === 'recipes' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#84B741] rounded-full" />
                )}
              </button>
              <button
                onClick={() => setSavedSubTab('posts')}
                className={`pb-2 text-sm font-bold transition-colors relative ${
                  savedSubTab === 'posts' ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                帖子
                {savedSubTab === 'posts' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#84B741] rounded-full" />
                )}
              </button>
            </div>

            {savedSubTab === 'recipes' ? (
              loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-4 border-[#84B741] border-t-transparent animate-spin" />
                </div>
              ) : savedRecipes.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-slate-400 gap-3">
                  <ChefHat size={40} className="text-slate-200" />
                  <p className="text-sm font-medium text-slate-500">还没有收藏任何菜谱</p>
                  <button onClick={() => navigate('/')} className="text-[#84B741] text-sm font-semibold">
                    去选食材，让 AI 生成 →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 px-5">
                  {savedRecipes.map(({ id, recipe, saved_at }) => (
                    <div key={id} className="flex items-center gap-4 py-4" onClick={() => navigate('/recipe', { state: { recipeResponse: { mode: 'recipe', data: recipe } } })}>
                      <div className="w-14 h-14 rounded-2xl bg-[#F4F9EE] flex items-center justify-center text-2xl shrink-0 border border-[#E8F4D4]">
                        🍳
                      </div>
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
              savedPostsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-4 border-[#84B741] border-t-transparent animate-spin" />
                </div>
              ) : savedPosts.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-slate-400 gap-3">
                  <div className="text-5xl">📌</div>
                  <p className="text-sm font-medium text-slate-500">还没有收藏任何帖子</p>
                  <button onClick={() => navigate('/community')} className="text-[#84B741] text-sm font-semibold">
                    去社区逛逛 →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-0.5 px-0">
                  {savedPosts.map((post) => (
                    <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="relative aspect-square bg-[#F4F9EE] overflow-hidden active:scale-[0.98] transition-transform cursor-pointer">
                      {post.images[0]
                        ? <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-5xl">🍳</div>
                      }
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2.5 py-2">
                        <span className="flex items-center gap-1 text-white text-xs font-semibold">
                          <Heart size={11} fill="white" stroke="none" />
                          {post.likes_count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </main>

      {/* 设置抽屉 */}
      {showSettings && (
        <SettingsDrawer
          email={email}
          avatarEmoji={avatarEmoji}
          nickname={nickname}
          onClose={() => setShowSettings(false)}
          onEditNickname={() => setShowEditNickname(true)}
          onEditAvatar={() => setShowAvatarPicker(true)}
          onChangePwd={() => setShowChangePwdModal(true)}
          onResetPwd={() => setShowResetModal(true)}
          onSignOut={handleSignOut}
        />
      )}
      {showEditNickname && (
        <EditNicknameModal
          current={nickname}
          onSave={handleSaveNickname}
          onClose={() => setShowEditNickname(false)}
        />
      )}
      {showAvatarPicker && (
        <AvatarPickerModal
          current={avatarEmoji}
          onSave={handleSaveAvatar}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}
      {showChangePwdModal && (
        <ChangePasswordModal onClose={() => setShowChangePwdModal(false)} />
      )}
      {showResetModal && email && (
        <ResetPasswordModal email={email} onClose={() => setShowResetModal(false)} />
      )}
    </div>
  );
}
