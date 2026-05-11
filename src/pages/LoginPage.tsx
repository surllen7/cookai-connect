import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, ChevronLeft, User } from 'lucide-react';
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

function validateUsername(username: string): string | null {
  if (!username.trim()) return '请输入用户名';
  if (username.length < 3) return '用户名至少 3 个字符';
  if (username.length > 20) return '用户名最多 20 个字符';
  if (!/^[a-zA-Z0-9_一-龥]+$/.test(username)) return '只能包含字母、数字、下划线或中文';
  return null;
}

// ── 通用输入组件 ───────────────────────────────────────────────────────────────

function IdentifierInput({ value, onChange, error }: {
  value: string; onChange: (v: string) => void; error?: string;
}) {
  const isEmail = value.includes('@');
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">账号 / 邮箱</label>
      <div className={`flex items-center bg-white border rounded-2xl px-4 gap-3 transition-colors focus-within:border-[#84B741] ${error ? 'border-red-300' : 'border-slate-200'}`}>
        {isEmail
          ? <Mail size={16} className="text-slate-400 shrink-0" />
          : <User size={16} className="text-slate-400 shrink-0" />
        }
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="输入用户名或邮箱"
          autoComplete="username"
          className="flex-1 bg-transparent text-slate-800 placeholder-slate-300 text-sm outline-none h-14"
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  );
}

function EmailInput({ value, onChange, error, disabled }: {
  value: string; onChange: (v: string) => void; error?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">邮箱地址</label>
      <div className={`flex items-center bg-white border rounded-2xl px-4 gap-3 transition-colors focus-within:border-[#84B741] ${error ? 'border-red-300' : 'border-slate-200'} ${disabled ? 'opacity-60' : ''}`}>
        <Mail size={16} className="text-slate-400 shrink-0" />
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="your@email.com"
          inputMode="email"
          autoComplete="email"
          disabled={disabled}
          className="flex-1 bg-transparent text-slate-800 placeholder-slate-300 text-sm outline-none h-14 disabled:cursor-not-allowed"
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  );
}

function UsernameInput({ value, onChange, error, disabled }: {
  value: string; onChange: (v: string) => void; error?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">用户名</label>
      <div className={`flex items-center bg-white border rounded-2xl px-4 gap-3 transition-colors focus-within:border-[#84B741] ${error ? 'border-red-300' : 'border-slate-200'} ${disabled ? 'opacity-60' : ''}`}>
        <User size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="3-20 位，字母 / 数字 / 下划线 / 中文"
          autoComplete="off"
          disabled={disabled}
          className="flex-1 bg-transparent text-slate-800 placeholder-slate-300 text-sm outline-none h-14 disabled:cursor-not-allowed"
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
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const handleLogin = async () => {
    const isEmail = identifier.includes('@');
    const idErr   = isEmail ? validateEmail(identifier) : (!identifier.trim() ? '请输入账号或邮箱' : null);
    const pwdErr  = validatePassword(password);
    if (idErr || pwdErr) {
      setErrors({ identifier: idErr ?? '', password: pwdErr ?? '' });
      return;
    }
    setLoading(true);
    setErrors({});
    const { error } = await signIn(identifier.trim(), password);
    setLoading(false);
    if (error) {
      const msg = (error as { message?: string })?.message ?? '';
      if (msg === 'username_not_found') {
        setErrors({ identifier: '账号不存在，请检查后重试' });
      } else {
        setErrors({ general: '账号或密码错误，请重新输入' });
      }
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <IdentifierInput
        value={identifier}
        onChange={(v) => { setIdentifier(v); setErrors((e) => ({ ...e, identifier: '' })); }}
        error={errors.identifier}
      />
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

// ── 注册表单（用户名 + 邮箱 + 密码 + OTP 内联展开）────────────────────────────

function RegisterForm() {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuthContext();
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent]   = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [topBanner, setTopBanner] = useState<{ type: 'info' | 'error'; message: string } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSend = async () => {
    const usernameErr = validateUsername(username);
    const emailErr    = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr  = confirm !== password ? '两次密码输入不一致' : null;
    if (usernameErr || emailErr || passwordErr || confirmErr) {
      setErrors({
        username: usernameErr ?? '',
        email: emailErr ?? '',
        password: passwordErr ?? '',
        confirm: confirmErr ?? '',
      });
      return;
    }
    setLoading(true);
    setErrors({});
    const { error } = await sendOtp(email.trim());
    setLoading(false);
    if (error) { setErrors({ email: '发送失败，请稍后重试' }); return; }
    setOtpSent(true);
    setCooldown(60);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleResend = async () => {
    setLoading(true);
    setErrors({});
    setOtp(['', '', '', '', '', '']);
    const { error } = await sendOtp(email.trim());
    setLoading(false);
    if (error) { setErrors({ otp: '重新发送失败，请稍后重试' }); return; }
    setCooldown(60);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setErrors((e) => ({ ...e, otp: '' }));
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleRegister = async () => {
    const token = otp.join('');
    if (token.length < 6) { setErrors({ otp: '请输入完整的 6 位验证码' }); return; }
    setLoading(true);
    setErrors({});
    setTopBanner(null);
    const { error, existed } = await verifyOtp(email.trim(), token, password, username.trim());
    setLoading(false);
    if (error) {
      const msg = (error as { message?: string })?.message ?? '';
      if (msg.includes('duplicate') || msg.includes('unique')) {
        setErrors({ otp: '该用户名已被使用，请返回修改' });
      } else {
        setErrors({ otp: '验证码错误或已过期，请重试' });
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } else if (existed) {
      setTopBanner({ type: 'info', message: '该邮箱已注册，系统已自动登录您的账号' });
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 顶部提示横幅 */}
      {topBanner && (
        <div className={`px-4 py-3 rounded-2xl text-sm font-medium ${
          topBanner.type === 'info'
            ? 'bg-[#F2F8E8] text-[#5B8C1C] border border-[#D2E8B0]'
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {topBanner.message}
        </div>
      )}

      {/* 用户名 */}
      <UsernameInput
        value={username}
        onChange={(v) => { setUsername(v); setErrors((e) => ({ ...e, username: '' })); }}
        error={errors.username}
        disabled={otpSent}
      />

      {/* 邮箱 */}
      <div>
        <EmailInput
          value={email}
          onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: '' })); }}
          error={errors.email}
          disabled={otpSent}
        />
        {otpSent && (
          <button
            onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); setErrors({}); setCooldown(0); }}
            className="flex items-center gap-1 text-xs text-slate-400 mt-2 ml-1"
          >
            <ChevronLeft size={13} /> 返回修改
          </button>
        )}
      </div>

      {/* 密码（发送前显示） */}
      {!otpSent && (
        <>
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
          <PrimaryButton onClick={handleSend} loading={loading}>
            <Mail size={18} /> 发送验证码 <ArrowRight size={18} />
          </PrimaryButton>
        </>
      )}

      {/* OTP 输入区（发送后内联展开） */}
      {otpSent && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-500">输入 6 位验证码</label>
              <span className="text-xs text-slate-400">
                {cooldown > 0 ? `${cooldown}s 后可重发` : (
                  <button onClick={handleResend} disabled={loading} className="text-[#84B741] font-medium">
                    重新发送
                  </button>
                )}
              </span>
            </div>
            <div className="flex gap-2 justify-between">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`w-[14%] aspect-square text-center text-xl font-bold bg-white border rounded-2xl outline-none transition-colors focus:border-[#84B741] ${errors.otp ? 'border-red-300' : 'border-slate-200'}`}
                />
              ))}
            </div>
            {errors.otp && <p className="text-red-400 text-xs mt-2 text-center">{errors.otp}</p>}
            <p className="text-xs text-slate-400 mt-2 text-center">
              验证码已发送至 <span className="text-slate-600 font-medium">{email}</span>
            </p>
          </div>
          <PrimaryButton onClick={handleRegister} loading={loading} disabled={otp.join('').length < 6}>
            <Sparkles size={18} /> 注册账号 <ArrowRight size={18} />
          </PrimaryButton>
        </div>
      )}

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
      <div className="flex flex-col items-center mb-8">
        <div className="w-[72px] h-[72px] rounded-[24px] bg-gradient-to-br from-[#9ED05B] to-[#A8DC64] flex items-center justify-center shadow-lg mb-4">
          <span className="text-4xl">🥑</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          <span className="text-[#84B741]">CookAI</span> Connect
        </h1>
        <p className="text-sm text-slate-400">用 AI 发现专属你的美味菜谱</p>
      </div>

      <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
        {([['login', '登录'], ['register', '注册']] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
