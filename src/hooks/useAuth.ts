import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// 重置默认密码：Cookai@ + 邮箱前缀前6位（不足6位补0）
export function buildDefaultPassword(email: string): string {
  const prefix = email.split('@')[0].toLowerCase().slice(0, 6).padEnd(6, '0');
  return `Cookai@${prefix}`;
}

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 注册：发送验证邮件
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error };
  };

  // 登录：邮箱或用户名 + 密码
  const signIn = async (identifier: string, password: string) => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    let email = identifier.trim();

    if (!isEmail) {
      const { data, error: lookupError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier.trim())
        .single();
      if (lookupError || !data?.email) {
        return { error: { message: 'username_not_found' } };
      }
      email = data.email;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  // 发送 OTP 验证码
  const sendOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    return { error };
  };

  // 验证 OTP，同时设置密码和用户名
  const verifyOtp = async (
    email: string,
    token: string,
    password?: string,
    username?: string,
  ) => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) return { error };

    let existed = false;

    if (password) {
      const { error: pwdError } = await supabase.auth.updateUser({ password });
      if (pwdError) {
        if ((pwdError as { code?: string }).code === 'same_password') {
          existed = true; // 邮箱已注册，忽略 same_password
        } else {
          return { error: pwdError };
        }
      }
    }

    if (username && data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: data.user.id, username, email });
      if (profileError) return { error: profileError };
    }

    return { error: null, existed };
  };

  // 重置为默认密码（已登录状态）
  const resetToDefaultPassword = async (email: string) => {
    const defaultPwd = buildDefaultPassword(email);
    const { error } = await supabase.auth.updateUser({ password: defaultPwd });
    return { error, defaultPassword: defaultPwd };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signUp, signIn, sendOtp, verifyOtp, resetToDefaultPassword, signOut };
}
