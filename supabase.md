# Supabase集成文档

## 1. 安装

```bash
yarn add @supabase/supabase-js
```

## 2. 目录结构

```
项目根目录/
├── supabase/
│   ├── supabase.js           # Supabase客户端配置和初始化
│   ├── supabaseService.js    # Supabase服务层，封装数据库操作
│   └── auth.js               # 认证服务，处理用户认证逻辑
├── utils/
│   ├── index.js              # 统一导出所有工具函数和服务
│   └── storageManager.js     # 存储管理器
├── main.js                   # 应用入口，初始化所有服务
└── supabase.md               # Supabase集成文档
```

## 3. 配置说明

### 3.1 客户端配置 (supabase.js)

- 配置Supabase连接信息
- 设置认证选项
- 导出Supabase客户端实例

### 3.2 服务层 (supabaseService.js)

- 封装数据库CRUD操作
- 处理数据同步（在线/离线）
- 管理同步队列
- 提供便捷的API接口

### 3.3 认证服务 (auth.js)

- 处理用户登录/注册/登出
- 管理认证状态
- 提供认证状态监听器
- 封装认证相关API

## 4. 使用方法

### 4.1 初始化服务

在main.js中已经自动初始化所有服务：

```javascript
import { initSupabase } from './supabase/supabaseService.js'
import { initAuth } from './supabase/auth.js'

// 初始化Supabase服务
initSupabase().catch(error => {
  console.error('Supabase服务初始化失败:', error)
})

// 初始化认证服务
initAuth().catch(error => {
  console.error('认证服务初始化失败:', error)
})
```

### 4.2 用户认证

```javascript
import { login, register, logout, getAuthUser, isAuthenticated } from './supabase/auth.js'

// 用户登录
async function handleLogin(email, password) {
  try {
    const result = await login(email, password)
    console.log('登录成功:', result)
  } catch (error) {
    console.error('登录失败:', error)
  }
}

// 用户注册
async function handleRegister(email, password, userData) {
  try {
    const result = await register(email, password, userData)
    console.log('注册成功:', result)
  } catch (error) {
    console.error('注册失败:', error)
  }
}

// 用户登出
async function handleLogout() {
  try {
    await logout()
    console.log('登出成功')
  } catch (error) {
    console.error('登出失败:', error)
  }
}

// 检查认证状态
if (isAuthenticated()) {
  const user = getAuthUser()
  console.log('当前用户:', user)
}
```

### 4.3 数据库操作

```javascript
import { createRecord, getRecords, updateRecord, deleteRecord } from './supabase/supabaseService.js'

// 创建记录
async function createMilkTeaRecord(data) {
  try {
    const result = await createRecord('milk_tea_records', data)
    console.log('创建记录成功:', result)
    return result
  } catch (error) {
    console.error('创建记录失败:', error)
  }
}

// 获取记录列表
async function getMilkTeaRecords(filters = {}) {
  try {
    const options = {
      orderBy: 'created_at',
      ascending: false,
      limit: 10
    }
    const records = await getRecords('milk_tea_records', filters, options)
    console.log('获取记录成功:', records)
    return records
  } catch (error) {
    console.error('获取记录失败:', error)
  }
}

// 更新记录
async function updateMilkTeaRecord(id, data) {
  try {
    const result = await updateRecord('milk_tea_records', id, data)
    console.log('更新记录成功:', result)
    return result
  } catch (error) {
    console.error('更新记录失败:', error)
  }
}

// 删除记录
async function deleteMilkTeaRecord(id) {
  try {
    const result = await deleteRecord('milk_tea_records', id)
    console.log('删除记录成功:', result)
    return result
  } catch (error) {
    console.error('删除记录失败:', error)
  }
}
```

### 4.4 数据同步

```javascript
import { syncData, getSyncStatus } from './supabase/supabaseService.js'

// 手动触发数据同步
async function triggerSync() {
  try {
    await syncData()
    console.log('数据同步成功')
  } catch (error) {
    console.error('数据同步失败:', error)
  }
}

// 获取同步状态
function checkSyncStatus() {
  const status = getSyncStatus()
  console.log('同步状态:', status)
  return status
}
```

## 5. 环境变量配置

在项目根目录下创建`.env`文件，添加以下配置：

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 6. 离线支持

- 自动检测网络状态
- 离线时将操作加入同步队列
- 网络恢复时自动同步数据
- 支持本地数据缓存

## 7. 注意事项

1. 确保在生产环境中正确配置环境变量
2. 敏感操作需要进行权限验证
3. 定期清理过期数据
4. 监控同步状态，及时处理同步失败
5. 对于大量数据操作，考虑分批处理

## 8. 扩展建议

- 添加数据迁移功能
- 实现数据备份和恢复
- 增加数据验证和转换
- 实现高级查询功能
- 添加数据统计和分析
