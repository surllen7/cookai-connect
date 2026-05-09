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

  // 注册：发送验证邮件（Supabase 触发 Auth Hook → Resend）
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error };
  };

  // 登录：邮箱 + 密码
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
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

  return { user, session, loading, signUp, signIn, resetToDefaultPassword, signOut };
}
