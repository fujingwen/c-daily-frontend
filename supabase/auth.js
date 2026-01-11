// 认证服务，处理用户认证逻辑
import { signIn, signUp, signOut, getCurrentUser } from './supabaseService.js'
import storageManager from '../utils/storageManager.js'

// 认证状态
const AUTH_STATUS = {
  UNINITIALIZED: 'uninitialized',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  CHECKING: 'checking'
}

class AuthService {
  constructor() {
    this.status = AUTH_STATUS.UNINITIALIZED
    this.currentUser = null
    this.listeners = new Map()
  }

  // 初始化认证服务
  async initialize() {
    try {
      this.status = AUTH_STATUS.CHECKING

      // 检查本地存储中是否有会话
      const storedSession = await storageManager.getItem('supabase.session')

      if (storedSession) {
        // 尝试使用存储的会话恢复认证状态
        this.currentUser = await getCurrentUser()
        if (this.currentUser) {
          this.status = AUTH_STATUS.AUTHENTICATED
        } else {
          this.status = AUTH_STATUS.UNAUTHENTICATED
        }
      } else {
        this.status = AUTH_STATUS.UNAUTHENTICATED
      }

      console.log('认证服务初始化成功，状态:', this.status)
    } catch (error) {
      console.error('认证服务初始化失败:', error)
      this.status = AUTH_STATUS.UNAUTHENTICATED
    }
  }

  // 用户登录
  async login(email, password) {
    try {
      const result = await signIn(email, password)
      this.currentUser = result.user
      this.status = AUTH_STATUS.AUTHENTICATED
      this.notifyListeners('login', this.currentUser)
      return result
    } catch (error) {
      console.error('登录失败:', error)
      this.status = AUTH_STATUS.UNAUTHENTICATED
      throw error
    }
  }

  // 用户注册
  async register(email, password, userData = {}) {
    try {
      const result = await signUp(email, password, userData)
      return result
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  }

  // 用户登出
  async logout() {
    try {
      await signOut()
      this.currentUser = null
      this.status = AUTH_STATUS.UNAUTHENTICATED
      this.notifyListeners('logout')
      return true
    } catch (error) {
      console.error('登出失败:', error)
      throw error
    }
  }

  // 获取当前认证状态
  getStatus() {
    return this.status
  }

  // 获取当前用户
  getUser() {
    return this.currentUser
  }

  // 检查用户是否已认证
  isAuthenticated() {
    return this.status === AUTH_STATUS.AUTHENTICATED
  }

  // 添加认证状态监听器
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
  }

  // 移除认证状态监听器
  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback)
    }
  }

  // 通知监听器
  notifyListeners(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback({ event, data, timestamp: Date.now() })
        } catch (error) {
          console.error('监听器回调执行失败:', error)
        }
      })
    }
  }
}

// 创建全局实例
const authService = new AuthService()

// 导出便捷方法
export const initAuth = () => authService.initialize()
export const login = (email, password) => authService.login(email, password)
export const register = (email, password, userData) => authService.register(email, password, userData)
export const logout = () => authService.logout()
export const getAuthStatus = () => authService.getStatus()
export const getAuthUser = () => authService.getUser()
export const isAuthenticated = () => authService.isAuthenticated()
export const addAuthListener = (event, callback) => authService.addListener(event, callback)
export const removeAuthListener = (event, callback) => authService.removeListener(event, callback)

export default authService