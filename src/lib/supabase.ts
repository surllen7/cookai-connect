import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] 未配置环境变量，数据持久化功能不可用');
}

export const supabase = createClient<Database>(supabaseUrl ?? '', supabaseAnonKey ?? '');
