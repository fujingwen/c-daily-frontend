import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import uView from './uni_modules/uview-plus'
import App from './App.vue'
import { initStorage } from './utils/storageManager.js'
// import { initSupabase } from './supabase/supabaseService.js'
// import { initAuth } from './supabase/auth.js'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(uView)

  // 初始化存储管理器
  initStorage().catch(error => {
    console.error('存储管理器初始化失败:', error)
    // 可以在这里添加其他错误处理逻辑，如显示用户友好的提示
  })

  // // 初始化Supabase服务
  // initSupabase().catch(error => {
  //   console.error('Supabase服务初始化失败:', error)
  //   // 可以在这里添加其他错误处理逻辑，如显示用户友好的提示
  // })

  // // 初始化认证服务
  // initAuth().catch(error => {
  //   console.error('认证服务初始化失败:', error)
  //   // 可以在这里添加其他错误处理逻辑，如显示用户友好的提示
  // })

  return {
    app,
    pinia
  }
}