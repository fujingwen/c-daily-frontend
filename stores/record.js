import { defineStore } from 'pinia'
import { initMockData } from '../mock/index.js'
import { createTodo, updateTodo, deleteTodo } from '../supabase/supabaseService.js'
import { useAppStore } from './app.js'

// 记录数据状态
export const useRecordStore = defineStore('record', {
  state: () => ({
    records: [],
    currentModule: null,
    filterDate: null
  }),

  getters: {
    // 按模块分组的记录
    recordsByModule: (state) => {
      const grouped = {}
      state.records.forEach(record => {
        if (!grouped[record.moduleType]) {
          grouped[record.moduleType] = []
        }
        grouped[record.moduleType].push(record)
      })
      return grouped
    },

    // 按日期分组的记录
    recordsByDate: (state) => {
      const grouped = {}
      state.records.forEach(record => {
        const date = new Date(record.createTime).toDateString()
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(record)
      })
      return grouped
    },

    // 获取指定模块的记录
    getRecordsByModule: (state) => (moduleType) => {
      return state.records.filter(record => record.moduleType === moduleType)
    }
  },

  actions: {
    // 添加记录
    async addRecord(record) {
      const newRecord = {
        recordId: this.generateId(),
        userId: useAppStore().user?.userId || 'local',
        createTime: Date.now(),
        updateTime: Date.now(),
        ...record
      }

      console.log('准备添加新记录:', newRecord)

      this.records.unshift(newRecord)
      this.saveToStorage()

      // 如果是待办事项，同时保存到Supabase
      if (record.moduleType === 'todo') {
        try {
          // 转换为Supabase需要的数据格式
          const todoData = {
            id: newRecord.recordId,
            user_id: newRecord.userId,
            content: newRecord.content || '',
            priority: newRecord.priority || 'normal',
            deadline: newRecord.deadline ? new Date(newRecord.deadline).toISOString() : null,
            is_recurring: newRecord.isRecurring || false,
            repeat_type: newRecord.repeatType || 'none',
            repeat_interval: newRecord.repeatInterval || 1,
            repeat_day_of_week: newRecord.repeatDayOfWeek || null,
            repeat_day_of_month: newRecord.repeatDayOfMonth || null,
            is_completed: false,
            created_at: new Date(newRecord.createTime).toISOString(),
            updated_at: new Date(newRecord.updateTime).toISOString()
          }

          console.log('准备保存待办事项到Supabase:', todoData)

          // 保存到Supabase
          const result = await createTodo(todoData)
          console.log('待办事项保存到Supabase成功:', result)

          // 更新本地记录的同步状态
          const localIndex = this.records.findIndex(r => r.recordId === newRecord.recordId)
          if (localIndex !== -1) {
            this.records[localIndex]._syncStatus = 'synced'
            this.records[localIndex]._remoteId = result.id
            this.saveToStorage()
          }
        } catch (error) {
          console.error('待办事项保存到Supabase失败:', error)
          console.error('失败的完整错误信息:', JSON.stringify(error, null, 2))

          // 更新本地记录的同步状态
          const localIndex = this.records.findIndex(r => r.recordId === newRecord.recordId)
          if (localIndex !== -1) {
            this.records[localIndex]._syncStatus = 'failed'
            this.saveToStorage()
          }

          // 保存失败不影响本地记录
        }
      }

      return newRecord
    },

    // 更新记录
    async updateRecord(recordId, updates) {
      const index = this.records.findIndex(r => r.recordId === recordId)
      if (index !== -1) {
        const updatedRecord = {
          ...this.records[index],
          ...updates,
          updateTime: Date.now()
        }

        this.records[index] = updatedRecord
        this.saveToStorage()

        // 如果是待办事项，同时更新到Supabase
        if (updatedRecord.moduleType === 'todo') {
          try {
            // 转换为Supabase需要的数据格式
            const todoData = {
              content: updatedRecord.content || '',
              priority: updatedRecord.priority || 'normal',
              deadline: updatedRecord.deadline || null,
              is_recurring: updatedRecord.isRecurring || false,
              repeat_type: updatedRecord.repeatType || 'none',
              repeat_interval: updatedRecord.repeatInterval || 1,
              repeat_day_of_week: updatedRecord.repeatDayOfWeek || null,
              repeat_day_of_month: updatedRecord.repeatDayOfMonth || null,
              is_completed: updatedRecord.isCompleted || false,
              complete_remark: updatedRecord.completeRemark || '',
              completed_at: updatedRecord.completeTime ? new Date(updatedRecord.completeTime).toISOString() : null,
              updated_at: new Date(updatedRecord.updateTime).toISOString()
            }

            // 更新Supabase中的记录
            const result = await updateTodo(recordId, todoData)
            console.log('待办事项更新到Supabase成功:', result)
          } catch (error) {
            console.error('待办事项更新到Supabase失败:', error)
            // 更新失败不影响本地记录
          }
        }

        return true
      }
      return false
    },

    // 删除记录
    async deleteRecord(recordId) {
      const index = this.records.findIndex(r => r.recordId === recordId)
      if (index !== -1) {
        const deletedRecord = this.records[index]
        this.records.splice(index, 1)
        this.saveToStorage()

        // 如果是待办事项，同时从Supabase中删除
        if (deletedRecord.moduleType === 'todo') {
          try {
            const result = await deleteTodo(recordId)
            console.log('待办事项从Supabase删除成功:', result)
          } catch (error) {
            console.error('待办事项从Supabase删除失败:', error)
            // 删除失败不影响本地记录
          }
        }
      }
    },

    // 加载本地数据
    loadFromStorage() {
      try {
        const records = uni.getStorageSync('records')
        if (records) {
          // 如果是字符串，需要解析
          this.records = typeof records === 'string' ? JSON.parse(records) : records
        } else {
          // 如果没有本地数据，初始化mock数据
          console.log('没有找到本地记录数据，初始化mock数据')
          initMockData()
          const mockRecords = uni.getStorageSync('records')
          if (mockRecords) {
            this.records = typeof mockRecords === 'string' ? JSON.parse(mockRecords) : mockRecords
          }
        }
      } catch (error) {
        console.error('加载记录数据失败:', error)
        this.records = []
      }
    },

    // 保存到本地
    saveToStorage() {
      try {
        uni.setStorageSync('records', JSON.stringify(this.records))
      } catch (error) {
        console.error('保存记录数据失败:', error)
      }
    },

    // 生成唯一ID
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substring(2)
    }
  }
})
