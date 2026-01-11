import { defineStore } from 'pinia'
import { initMockData } from '../mock/index.js'

// 主应用状态
export const useAppStore = defineStore('app', {
  state: () => ({
    user: null,
    isLogin: false,
    settings: {
      voiceEnabled: true,
      backupEnabled: false,
      notifications: {
        menstruation: true,
        todo: true,
        backup: false
      }
    }
  }),

  getters: {
    userInfo: (state) => state.user,
    isLoggedIn: (state) => state.isLogin
  },

  actions: {
    setUser(user) {
      this.user = user
      this.isLogin = true
      try {
        uni.setStorageSync('user', JSON.stringify(user))
      } catch (error) {
        console.error('保存用户数据失败:', error)
      }
    },

    logout() {
      this.user = null
      this.isLogin = false
      uni.removeStorageSync('user')
    },

    updateSettings(settings) {
      this.settings = { ...this.settings, ...settings }
      try {
        uni.setStorageSync('settings', JSON.stringify(this.settings))
      } catch (error) {
        console.error('保存设置失败:', error)
      }
    },

    loadUserData() {
      try {
        const user = uni.getStorageSync('user')
        const settings = uni.getStorageSync('settings')

        if (user) {
          this.user = typeof user === 'string' ? JSON.parse(user) : user
          this.isLogin = true
        } else {
          // 如果没有用户数据，初始化mock数据
          initMockData()
          const mockUser = uni.getStorageSync('userInfo')
          if (mockUser) {
            this.user = typeof mockUser === 'string' ? JSON.parse(mockUser) : mockUser
          }
        }

        if (settings) {
          this.settings = {
            ...this.settings,
            ...(typeof settings === 'string' ? JSON.parse(settings) : settings)
          }
        }
      } catch (error) {
        console.error('加载用户数据失败:', error)
      }
    }
  }
})
