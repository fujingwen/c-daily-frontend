<template>
  <view class="todo-list-page" :style="{ background: themeColors.background }">
    <!-- 顶部统计 -->
    <view class="stats-section card">
      <view class="stats-header">
        <text class="stats-title">待办统计</text>
      </view>
      <view class="stats-content">
        <view class="stat-item">
          <text class="stat-number" :style="{ color: themeColors.primary }">{{ pendingTodos.length }}</text>
          <text class="stat-label">待完成</text>
        </view>
        <view class="stat-item">
          <text class="stat-number" :style="{ color: themeColors.error }">{{ overdueTodos.length }}</text>
          <text class="stat-label">已逾期</text>
        </view>
        <view class="stat-item">
          <text class="stat-number" :style="{ color: themeColors.success }">{{ completedTodos.length }}</text>
          <text class="stat-label">已完成</text>
        </view>
        <view class="stat-item">
          <text class="stat-number" :style="{ color: themeColors.text }">{{ allTodos.length }}</text>
          <text class="stat-label">总数</text>
        </view>
      </view>
    </view>

    <!-- 筛选选项 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view
          v-for="filter in filterOptions"
          :key="filter.value"
          class="filter-tab"
          :class="{ active: currentFilter === filter.value }"
          @click="currentFilter = filter.value"
          :style="currentFilter === filter.value ? { background: themeColors.primary, color: '#fff' } : { color: themeColors.text }"
        >
          <text class="tab-text">{{ filter.label }}</text>
          <text class="tab-count" :style="{ opacity: currentFilter === filter.value ? 0.9 : 0.5 }">
            {{ getFilterCount(filter.value) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 待办列表 -->
    <view class="todo-list">
      <view
        v-for="todo in filteredTodos"
        :key="todo.recordId"
        class="todo-item card"
        :class="{
          'completed': todo.isCompleted,
          'overdue': isOverdue(todo)
        }"
        @click="goToDetail(todo)"
      >
        <!-- 左侧复选框 -->
        <view 
          class="checkbox-area" 
          @click.stop="handleToggleComplete(todo)"
        >
          <view 
            class="custom-checkbox" 
            :class="{ checked: todo.isCompleted }"
            :style="{ 
              borderColor: todo.isCompleted ? themeColors.success : '#ddd',
              background: todo.isCompleted ? themeColors.success : 'transparent'
            }"
          >
            <text v-if="todo.isCompleted" class="check-icon">✓</text>
          </view>
        </view>

        <!-- 中间内容 -->
        <view class="todo-main">
          <view class="todo-header">
            <text class="todo-text" :class="{ 'text-through': todo.isCompleted }">{{ todo.content }}</text>
            <!-- 优先级标签 -->
            <view 
              v-if="todo.priority && todo.priority !== 'low'" 
              class="priority-tag" 
              :class="todo.priority"
            >
              {{ getPriorityLabel(todo.priority) }}
            </view>
          </view>
          
          <view class="todo-meta">
            <view v-if="todo.deadline" class="meta-item deadline" :class="{ 'text-error': isOverdue(todo) }">
              <text class="icon">📅</text>
              <text>{{ formatDate(todo.deadline, 'MM-DD HH:mm') }}</text>
              <text v-if="isOverdue(todo)" class="overdue-tag">已逾期</text>
            </view>
            <view class="meta-item create-time">
              <text class="icon">🕒</text>
              <text>创建于 {{ formatRelativeTime(todo.createTime) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredTodos.length === 0" class="empty-state">
      <image src="/static/empty-box.png" mode="aspectFit" class="empty-image" v-if="false"></image>
      <text class="empty-text">{{ getEmptyText() }}</text>
      <button v-if="currentFilter === 'all'" class="add-button" @click="goToAdd" :style="{ background: themeColors.primary }">
        添加待办事项
      </button>
    </view>

    <!-- 添加按钮 -->
    <view class="fab" @click="goToAdd" :style="{ background: themeColors.primary, boxShadow: `0 8rpx 24rpx ${themeColors.primary}66` }">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRecordStore, useThemeStore } from '@/stores'
import { formatDate, formatRelativeTime } from '@/utils'
import { PRIORITY_TYPES } from '@/utils/constants.js'
import { vibrate } from "@/utils/hapticFeedback.js";

const recordStore = useRecordStore()
const themeStore = useThemeStore()
const themeColors = computed(() => themeStore.currentThemeColors)

// 响应式数据
const currentFilter = ref('pending')

// 筛选选项
const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待办' },
  { value: 'overdue', label: '逾期' },
  { value: 'completed', label: '已完成' }
]

// 计算属性
const allTodos = computed(() => {
  return recordStore.records.filter(record => record.moduleType === 'todo')
})

const pendingTodos = computed(() => {
  return allTodos.value.filter(todo => !todo.isCompleted)
})

const overdueTodos = computed(() => {
  return pendingTodos.value.filter(todo => isOverdue(todo))
})

const completedTodos = computed(() => {
  return allTodos.value.filter(todo => todo.isCompleted)
})

const filteredTodos = computed(() => {
  switch (currentFilter.value) {
    case 'pending':
      return pendingTodos.value
    case 'overdue':
      return overdueTodos.value
    case 'completed':
      return completedTodos.value
    default:
      return allTodos.value
  }
})

// 方法
const isOverdue = (todo) => {
  if (!todo.deadline || todo.isCompleted) return false
  return new Date(todo.deadline) < new Date()
}

const getPriorityLabel = (priority) => {
  const priorityType = PRIORITY_TYPES.find(p => p.value === priority)
  return priorityType ? priorityType.label : ''
}

const getFilterCount = (filterValue) => {
  switch (filterValue) {
    case 'pending':
      return pendingTodos.value.length
    case 'overdue':
      return overdueTodos.value.length
    case 'completed':
      return completedTodos.value.length
    default:
      return allTodos.value.length
  }
}

const getEmptyText = () => {
  switch (currentFilter.value) {
    case 'pending':
      return '太棒了，所有待办都完成了！'
    case 'overdue':
      return '没有逾期的事项，继续保持！'
    case 'completed':
      return '还没有完成的事项，加油！'
    default:
      return '暂无待办事项，点击右下角添加'
  }
}

const handleToggleComplete = async (todo) => {
  vibrate.light();
  try {
    const newStatus = !todo.isCompleted;
    const success = await recordStore.updateRecord(todo.recordId, {
      isCompleted: newStatus,
      completeTime: newStatus ? Date.now() : null
    })

    if (success) {
      if (newStatus) {
        uni.showToast({ title: '已完成', icon: 'success' });
      }
    }
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

const goToDetail = (todo) => {
  uni.navigateTo({
    url: `/pages/record/detail?id=${todo.recordId}`
  })
}

const goToAdd = () => {
  uni.navigateTo({
    url: '/pages/todo/add'
  })
}

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage()
})
</script>

<style lang="scss" scoped>
.todo-list-page {
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 160rpx;
  transition: background 0.3s;
}

.card {
  background: white;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.stats-section {
  margin-bottom: 24rpx;

  .stats-header {
    margin-bottom: 24rpx;
    .stats-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .stats-content {
    display: flex;
    justify-content: space-between;
    padding: 0 10rpx;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;

      .stat-number {
        font-size: 40rpx;
        font-weight: bold;
        line-height: 1;
      }

      .stat-label {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.filter-section {
  margin-bottom: 24rpx;

  .filter-tabs {
    display: flex;
    background: white;
    border-radius: 20rpx;
    padding: 8rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);

    .filter-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16rpx 0;
      border-radius: 16rpx;
      transition: all 0.3s ease;
      gap: 4rpx;

      .tab-text {
        font-size: 28rpx;
        font-weight: 500;
      }

      .tab-count {
        font-size: 20rpx;
      }
      
      &:active {
        transform: scale(0.98);
      }
    }
  }
}

.todo-list {
  .todo-item {
    display: flex;
    align-items: flex-start;
    gap: 24rpx;
    margin-bottom: 20rpx;
    transition: all 0.3s;
    padding: 30rpx;
    
    &:active {
      transform: scale(0.99);
    }

    &.completed {
      opacity: 0.6;
      background: #fafafa;
      box-shadow: none;
      border: 1px solid #eee;
    }

    .checkbox-area {
      padding-top: 6rpx;
      
      .custom-checkbox {
        width: 44rpx;
        height: 44rpx;
        border-radius: 50%;
        border: 4rpx solid #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        
        .check-icon {
          color: white;
          font-size: 28rpx;
          font-weight: bold;
        }
        
        &.checked {
          border-color: transparent;
        }
      }
    }

    .todo-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12rpx;

      .todo-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16rpx;
        
        .todo-text {
          font-size: 30rpx;
          color: #333;
          line-height: 1.5;
          font-weight: 500;
          flex: 1;
          
          &.text-through {
            text-decoration: line-through;
            color: #999;
          }
        }

        .priority-tag {
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
          white-space: nowrap;
          flex-shrink: 0;
          
          &.high {
            background: #ffe5e5;
            color: #ff3b30;
          }
          
          &.mid {
            background: #fff4e5;
            color: #ff9500;
          }
        }
      }

      .todo-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 24rpx;
        margin-top: 4rpx;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8rpx;
          font-size: 24rpx;
          color: #999;
          
          .icon {
            font-size: 24rpx;
          }
          
          &.text-error {
            color: #ff3b30;
          }
          
          .overdue-tag {
            background: #ff3b30;
            color: white;
            font-size: 18rpx;
            padding: 2rpx 8rpx;
            border-radius: 6rpx;
            margin-left: 8rpx;
          }
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
  }

  .add-button {
    color: white;
    border: none;
    padding: 20rpx 60rpx;
    border-radius: 50rpx;
    font-size: 30rpx;
    box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.1);
  }
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.9);
  }

  .fab-icon {
    font-size: 60rpx;
    color: white;
    font-weight: 300;
    margin-top: -6rpx;
  }
}
</style>