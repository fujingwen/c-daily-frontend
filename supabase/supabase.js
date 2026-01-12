// Supabase客户端配置和初始化
import { createClient } from '@supabase/supabase-js'

// 从环境变量或配置中获取Supabase凭证
// 注意：在生产环境中，这些值应该通过环境变量注入
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 使用localStorage在浏览器中持久化会话
    storageKey: 'supabase.auth.token',
    // 自动刷新会话
    autoRefreshToken: true,
    // 监听会话变化
    persistSession: true,
    // 检测路由变化（用于Vue Router）
    detectSessionInUrl: false
  }
})

// 提供Vue组合式函数，方便在组件中使用Supabase
export function useSupabase() {
  return {
    supabase
  }
}

export default supabase