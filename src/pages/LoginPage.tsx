import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, CheckCircle, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

// ── 校验 ──────────────────────────────────────────────────────────────────────

function validateEmail(email: string): string | null {
  if (!email.trim()) return '请输入邮箱地址';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '请输入有效的邮箱地址';
  return null;
}

function validatePassword(pwd: string): string | null {
  if (!pwd) return '请输入密码';
  if (pwd.length < 8) return '密码至少 8 位';
  return null;
}

// ── 通用组件 ──────────────────────────────────────────────────────────────────

function EmailInput({ value, onChange, error }: {
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">邮箱地址</label>
      <div className={`flex items-center bg-white border rounded-2xl px-4 gap-3 transition-colors focus-within:border-[#84B741] ${error ? 'border-red-300' : 'border-slate-200'}`}>
        <Mail size={16} className="text-slate-400 shrink-0" />
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="your@email.com"
          inputMode="email"
          autoComplete="email"
          className="flex-1 bg-transparent text-slate-800 placeholder-slate-300 text-sm outline-none h-14"
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  );
}

function PasswordInput({ label, value, onChange, placeholder, autoComplete, error }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string; error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{label}</label>
      <div className={`flex items-center bg-white border rounded-2xl px-4 gap-3 transition-colors focus-within:border-[#84B741] ${error ? 'border-red-300' : 'border-slate-200'}`}>
        <Lock size={16} className="text-slate-400 shrink-0" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '请输入密码'}
          autoComplete={autoComplete ?? 'current-password'}
          className="flex-1 bg-transparent text-slate-800 placeholder-slate-300 text-sm outline-none h-14"
        />
        <button type="button" onClick={() => setShow(!show)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 shrink-0">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, loading }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-14 rounded-full bg-gradient-to-r from-[#9ED05B] to-[#A8DC64] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
    >
      {loading ? (
        <span className="flex gap-1">
          {[0, 150, 300].map((d) => (
            <span key={d} className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </span>
      ) : children}
    </button>
  );
}

// ── 登录表单 ──────────────────────────────────────────────────────────────────

function LoginForm() {
  const navigate = useNavigate();
  const { signIn } = useAuthContext();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const handleLogin = async () => {
    const emailErr    = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (emailErr || passwordErr) {
      setErrors({ email: emailErr ?? '', password: passwordErr ?? '' });
      return;
    }
    setLoading(true);
    setErrors({});
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      setErrors({ general: '邮箱或密码错误，请重新输入' });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <EmailInput value={email} onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: '' })); }} error={errors.email} />
      <PasswordInput
        label="密码"
        value={password}
        onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: '' })); }}
        error={errors.password}
      />
      {errors.general && <p className="text-red-400 text-xs text-center -mt-1">{errors.general}</p>}
      <PrimaryButton onClick={handleLogin} loading={loading}>
        <Sparkles size={18} /> 登录 <ArrowRight size={18} />
      </PrimaryButton>
      <p className="text-xs text-slate-400 text-center">忘记密码？登录后可在个人中心重置为默认密码</p>
    </div>
  );
}

// ── 注册表单 ──────────────────────────────────────────────────────────────────

function RegisterForm() {
  const { signUp } = useAuthContext();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const handleRegister = async () => {
    const emailErr    = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr  = confirm !== password ? '两次密码输入不一致' : null;
    if (emailErr || passwordErr || confirmErr) {
      setErrors({ email: emailErr ?? '', password: passwordErr ?? '', confirm: confirmErr ?? '' });
      return;
    }
    setLoading(true);
    setErrors({});
    const { error } = await signUp(email.trim(), password);
    setLoading(false);
    if (error) {
      const msg = (error as { message?: string })?.message ?? '';
      if (msg.toLowerCase().includes('already registered')) {
        setErrors({ email: '该邮箱已注册，请直接登录' });
      } else {
        setErrors({ general: '注册失败，请稍后重试' });
      }
      return;
    }
    setSent(true);
  };

  // 发送成功 → 提示查收邮件
  if (sent) {
    return (
      <div className="flex flex-col items-center gap-5 pt-2">
        <div className="w-20 h-20 rounded-full bg-[#F2F8EB] flex items-center justify-center">
          <CheckCircle size={40} className="text-[#84B741]" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">验证邮件已发送</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            请查收 <span className="font-semibold text-slate-700">{email}</span> 的收件箱，
            点击邮件中的验证链接完成注册
          </p>
        </div>
        <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <p className="text-xs text-amber-700 leading-relaxed">
            💡 没收到？请检查垃圾邮件箱，或等待 1-2 分钟后重试
          </p>
        </div>
        <button
          onClick={() => setSent(false)}
          className="flex items-center gap-1 text-slate-400 text-sm"
        >
          <ChevronLeft size={15} /> 重新填写信息
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <EmailInput
        value={email}
        onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: '' })); }}
        error={errors.email}
      />
      <PasswordInput
        label="设置密码（至少 8 位）"
        value={password}
        onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: '' })); }}
        placeholder="至少 8 位"
        autoComplete="new-password"
        error={errors.password}
      />
      <PasswordInput
        label="确认密码"
        value={confirm}
        onChange={(v) => { setConfirm(v); setErrors((e) => ({ ...e, confirm: '' })); }}
        placeholder="再次输入密码"
        autoComplete="new-password"
        error={errors.confirm}
      />
      {errors.general && <p className="text-red-400 text-xs text-center -mt-1">{errors.general}</p>}
      <PrimaryButton onClick={handleRegister} loading={loading}>
        <Mail size={18} /> 发送验证邮件 <ArrowRight size={18} />
      </PrimaryButton>
      <p className="text-xs text-slate-400 text-center leading-relaxed">
        注册即表示同意用户协议与隐私政策
      </p>
    </div>
  );
}

// ── 主页面 ────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  return (
    <div className="flex flex-col h-full w-full bg-[#FDFBF7] px-6 pt-14 pb-10 overflow-y-auto hide-scrollbar">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-[72px] h-[72px] rounded-[24px] bg-gradient-to-br from-[#9ED05B] to-[#A8DC64] flex items-center justify-center shadow-lg mb-4">
          <span className="text-4xl">🥑</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          <span className="text-[#84B741]">CookAI</span> Connect
        </h1>
        <p className="text-sm text-slate-400">用 AI 发现专属你的美味菜谱</p>
      </div>

      {/* Tab 切换 */}
      <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
        {(['login', 'register'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
            }`}
          >
            {t === 'login' ? '登录' : '注册'}
          </button>
        ))}
      </div>

      {tab === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
