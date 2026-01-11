// Supabase服务层，封装数据库操作
import supabase from './supabase.js'
import storageManager from '../utils/storageManager.js'

// 数据同步状态
const SYNC_STATUS = {
  NOT_SYNCED: 'not_synced',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  ERROR: 'error'
}

class SupabaseService {
  constructor() {
    this.isInitialized = false
    this.syncQueue = []
    this.syncInProgress = false
  }

  // 初始化服务
  async initialize() {
    if (this.isInitialized) {
      return
    }

    try {
      // 监听认证状态变化
      this.setupAuthListeners()

      // 检查网络连接
      this.setupNetworkListeners()

      this.isInitialized = true
      console.log('Supabase服务初始化成功')
    } catch (error) {
      console.error('Supabase服务初始化失败:', error)
      throw error
    }
  }

  // 设置认证监听器
  setupAuthListeners() {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('认证状态变化:', event, session)

      // 当用户登录时，同步本地数据到Supabase
      if (event === 'SIGNED_IN') {
        this.syncLocalDataToSupabase()
      }

      // 当用户登出时，清除本地认证信息
      if (event === 'SIGNED_OUT') {
        storageManager.removeItem('supabase.session')
      }
    })
  }

  // 设置网络监听器
  setupNetworkListeners() {
    // 监听网络状态变化
    window.addEventListener('online', () => {
      console.log('网络连接恢复，开始同步数据')
      this.processSyncQueue()
    })

    window.addEventListener('offline', () => {
      console.log('网络连接断开')
    })
  }

  // 用户认证相关方法
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // 保存会话到本地存储
      await storageManager.setItem('supabase.session', data.session)

      return data
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      return data
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      // 清除本地会话
      await storageManager.removeItem('supabase.session')

      return true
    } catch (error) {
      console.error('登出失败:', error)
      throw error
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) throw error

      return user
    } catch (error) {
      console.error('获取当前用户失败:', error)
      return null
    }
  }

  // 数据操作方法 - 通用CRUD
  async create(table, data) {
    try {
      // 添加创建时间和更新时间
      const payload = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log(`准备在${table}表创建数据:`, payload)

      const { data: result, error } = await supabase
        .from(table)
        .insert(payload)
        .select()

      if (error) {
        console.error(`在${table}表创建数据失败的详细错误:`, error)
        throw error
      }

      console.log(`在${table}表创建数据成功:`, result)

      return result[0]
    } catch (error) {
      console.error(`在${table}表创建数据失败:`, error)
      console.error(`失败的完整错误信息:`, JSON.stringify(error, null, 2))

      // 如果网络错误，将操作加入同步队列
      if (this.isNetworkError(error)) {
        this.addToSyncQueue('create', table, data)
        return { ...data, id: this.generateLocalId(), _sync_status: SYNC_STATUS.NOT_SYNCED }
      }

      throw error
    }
  }

  async read(table, filters = {}, options = {}) {
    try {
      let query = supabase.from(table)

      // 应用筛选条件
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value)
          } else {
            query = query.eq(key, value)
          }
        })
      }

      // 应用选项
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending || false })
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.offset(options.offset)
      }

      const { data, error } = await query.select()

      if (error) throw error

      return data
    } catch (error) {
      console.error(`从${table}表读取数据失败:`, error)

      // 如果网络错误，尝试从本地存储获取数据
      if (this.isNetworkError(error)) {
        return await storageManager.getItem(`supabase.${table}`, [])
      }

      throw error
    }
  }

  async update(table, id, data) {
    try {
      // 添加更新时间
      const payload = {
        ...data,
        updated_at: new Date().toISOString()
      }

      const { data: result, error } = await supabase
        .from(table)
        .update(payload)
        .eq('id', id)
        .select()

      if (error) throw error

      return result[0]
    } catch (error) {
      console.error(`在${table}表更新数据失败:`, error)

      // 如果网络错误，将操作加入同步队列
      if (this.isNetworkError(error)) {
        this.addToSyncQueue('update', table, { id, ...data })
        return { id, ...data, _sync_status: SYNC_STATUS.NOT_SYNCED }
      }

      throw error
    }
  }

  async delete(table, id) {
    try {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .select()

      if (error) throw error

      return data[0]
    } catch (error) {
      console.error(`从${table}表删除数据失败:`, error)

      // 如果网络错误，将操作加入同步队列
      if (this.isNetworkError(error)) {
        this.addToSyncQueue('delete', table, { id })
        return { id, _sync_status: SYNC_STATUS.NOT_SYNCED }
      }

      throw error
    }
  }

  // 数据同步方法
  async syncLocalDataToSupabase() {
    try {
      // 获取本地存储的所有数据
      const localKeys = await storageManager.getAllKeys()
      const syncableKeys = localKeys.filter(key => key.startsWith('supabase.queue.') || key.startsWith('local.'))

      for (const key of syncableKeys) {
        const data = await storageManager.getItem(key)
        if (data) {
          // 处理同步
          await this.processSyncData(key, data)
        }
      }

      console.log('本地数据同步到Supabase完成')
    } catch (error) {
      console.error('本地数据同步失败:', error)
    }
  }

  // 添加到同步队列
  async addToSyncQueue(operation, table, data) {
    const queueItem = {
      id: this.generateLocalId(),
      operation,
      table,
      data,
      timestamp: Date.now(),
      attempts: 0
    }

    this.syncQueue.push(queueItem)

    // 保存队列到本地存储
    await storageManager.setItem('supabase.sync.queue', this.syncQueue)

    // 如果网络在线，立即处理队列
    if (navigator.onLine) {
      this.processSyncQueue()
    }
  }

  // 处理同步队列
  async processSyncQueue() {
    if (this.syncInProgress || this.syncQueue.length === 0) {
      return
    }

    this.syncInProgress = true

    try {
      while (this.syncQueue.length > 0) {
        const item = this.syncQueue.shift()

        try {
          await this.executeSyncItem(item)
          item._sync_status = SYNC_STATUS.SYNCED
        } catch (error) {
          console.error('处理同步项失败:', error)
          item.attempts++
          item._sync_status = SYNC_STATUS.ERROR

          // 如果尝试次数少于3次，重新加入队列
          if (item.attempts < 3) {
            this.syncQueue.push(item)
          }
        }
      }

      // 更新本地存储的队列
      await storageManager.setItem('supabase.sync.queue', this.syncQueue)

    } finally {
      this.syncInProgress = false
    }
  }

  // 执行同步项
  async executeSyncItem(item) {
    switch (item.operation) {
      case 'create':
        return await this.create(item.table, item.data)
      case 'update':
        return await this.update(item.table, item.data.id, item.data)
      case 'delete':
        return await this.delete(item.table, item.data.id)
      default:
        throw new Error(`未知的同步操作: ${item.operation}`)
    }
  }

  // 辅助方法
  isNetworkError(error) {
    return error.message?.includes('NetworkError') ||
           error.code?.includes('NETWORK_ERROR') ||
           !navigator.onLine
  }

  generateLocalId() {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 获取当前同步状态
  getSyncStatus() {
    return {
      queueLength: this.syncQueue.length,
      isSyncing: this.syncInProgress,
      hasErrors: this.syncQueue.some(item => item._sync_status === SYNC_STATUS.ERROR)
    }
  }
}

// 创建全局实例
const supabaseService = new SupabaseService()

// 导出便捷方法
export const initSupabase = () => supabaseService.initialize()
export const signIn = (email, password) => supabaseService.signIn(email, password)
export const signUp = (email, password, userData) => supabaseService.signUp(email, password, userData)
export const signOut = () => supabaseService.signOut()
export const getCurrentUser = () => supabaseService.getCurrentUser()
export const createRecord = (table, data) => supabaseService.create(table, data)
export const getRecords = (table, filters, options) => supabaseService.read(table, filters, options)
export const updateRecord = (table, id, data) => supabaseService.update(table, id, data)
export const deleteRecord = (table, id) => supabaseService.delete(table, id)
export const syncData = () => supabaseService.syncLocalDataToSupabase()
export const getSyncStatus = () => supabaseService.getSyncStatus()

// 待办事项专用服务函数
export const createTodo = (todoData) => supabaseService.create('todos', todoData)
export const getTodos = (filters = {}, options = {}) => supabaseService.read('todos', filters, options)
export const updateTodo = (id, todoData) => supabaseService.update('todos', id, todoData)
export const deleteTodo = (id) => supabaseService.delete('todos', id)
export const completeTodo = (id, completedAt = new Date().toISOString()) => supabaseService.update('todos', id, { is_completed: true, completed_at: completedAt })

export const getPendingTodos = () => supabaseService.read('todos', { is_completed: false }, { orderBy: 'priority', ascending: false })
export const getCompletedTodos = () => supabaseService.read('todos', { is_completed: true }, { orderBy: 'completed_at', ascending: false })

export default supabaseService