import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: unknown }>;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  sendOtp: (email: string) => Promise<{ error: unknown }>;
  verifyOtp: (email: string, token: string, password?: string, username?: string) => Promise<{ error: unknown; existed?: boolean }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ error: unknown }>;
  resetToDefaultPassword: (email: string) => Promise<{ error: unknown; defaultPassword: string }>;
  updateProfile: (updates: { nickname?: string; avatar_emoji?: string }) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
