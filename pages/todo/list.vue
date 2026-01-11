<template>
  <view class="todo-list-page">
    <!-- 顶部统计 -->
    <view class="stats-section card">
      <view class="stats-header">
        <text class="stats-title">待办统计</text>
      </view>
      <view class="stats-content">
        <view class="stat-item">
          <text class="stat-number">{{ pendingTodos.length }}</text>
          <text class="stat-label">待完成</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ overdueTodos.length }}</text>
          <text class="stat-label">已逾期</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ completedTodos.length }}</text>
          <text class="stat-label">已完成</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ allTodos.length }}</text>
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
        >
          <text class="tab-text">{{ filter.label }}</text>
          <text class="tab-count">{{ getFilterCount(filter.value) }}</text>
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
          'overdue': isOverdue(todo),
          'urgent': todo.priority === 'high'
        }"
        @click="goToDetail(todo)"
      >
        <view class="todo-main">
          <view class="todo-content">
            <text class="todo-text">{{ todo.content }}</text>
            <view class="todo-meta">
              <text v-if="todo.deadline" class="deadline">
                截止：{{ formatDate(todo.deadline, 'MM月DD日 HH:mm') }}
              </text>
              <text class="create-time">
                创建：{{ formatRelativeTime(todo.createTime) }}
              </text>
            </view>
          </view>

          <!-- 优先级标识 -->
          <view v-if="todo.priority && todo.priority !== 'low'" class="priority-badge" :class="todo.priority">
            <text class="priority-text">{{ getPriorityLabel(todo.priority) }}</text>
          </view>
        </view>

        <!-- 完成按钮 -->
        <view class="todo-actions">
          <CompleteButton
            :is-completed="todo.isCompleted"
            :on-complete="(data) => handleComplete(todo.recordId, data)"
            :disabled="todo.isCompleted"
          />
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredTodos.length === 0" class="empty-state">
      <text class="empty-text">{{ getEmptyText() }}</text>
      <button v-if="currentFilter === 'all'" class="add-button" @click="goToAdd">
        添加待办事项
      </button>
    </view>

    <!-- 添加按钮 -->
    <view class="fab" @click="goToAdd">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRecordStore } from '@/stores'
import { formatDate, formatRelativeTime } from '@/utils'
import { PRIORITY_TYPES } from '@/utils/constants.js'
import CompleteButton from '@/components/CompleteButton.vue'

const recordStore = useRecordStore()

// 响应式数据
const currentFilter = ref('pending')

// 筛选选项
const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待完成' },
  { value: 'overdue', label: '已逾期' },
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
      return '暂无待完成的事项'
    case 'overdue':
      return '暂无逾期事项'
    case 'completed':
      return '暂无已完成的事项'
    default:
      return '暂无待办事项'
  }
}

const handleComplete = async (recordId, completeData) => {
  try {
    // 更新记录状态
    const success = await recordStore.updateRecord(recordId, {
      isCompleted: completeData.isCompleted,
      completeRemark: completeData.completeRemark,
      completeTime: completeData.completeTime
    })

    if (success) {
      console.log('待办事项已完成:', recordId)
    } else {
      throw new Error('更新失败')
    }
  } catch (error) {
    console.error('完成待办事项失败:', error)
    throw error
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
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.stats-section {
  margin-bottom: 20rpx;

  .stats-header {
    margin-bottom: 20rpx;

    .stats-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .stats-content {
    display: flex;
    justify-content: space-between;

    .stat-item {
      text-align: center;

      .stat-number {
        display: block;
        font-size: 36rpx;
        color: #667eea;
        font-weight: bold;
        margin-bottom: 8rpx;
      }

      .stat-label {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.filter-section {
  margin-bottom: 20rpx;

  .filter-tabs {
    display: flex;
    background: white;
    border-radius: 16rpx;
    padding: 8rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

    .filter-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx 8rpx;
      border-radius: 12rpx;
      transition: all 0.3s;

      &.active {
        background: #667eea;

        .tab-text,
        .tab-count {
          color: white;
        }
      }

      .tab-text {
        font-size: 26rpx;
        color: #333;
        margin-bottom: 4rpx;
      }

      .tab-count {
        font-size: 20rpx;
        color: #999;
      }
    }
  }
}

.todo-list {
  .todo-item {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 16rpx;
    transition: all 0.3s;

    &.completed {
      opacity: 0.6;

      .todo-text {
        text-decoration: line-through;
        color: #999;
      }
    }

    &.overdue {
      border-left: 4rpx solid #ff3b30;
      background: #fff5f5;
    }

    &.urgent {
      border-left: 4rpx solid #ff9500;
      background: #fff8e6;
    }

    .todo-main {
      flex: 1;
      position: relative;

      .todo-content {
        .todo-text {
          font-size: 28rpx;
          color: #333;
          line-height: 1.4;
          margin-bottom: 12rpx;
        }

        .todo-meta {
          display: flex;
          flex-direction: column;
          gap: 8rpx;

          .deadline {
            font-size: 24rpx;
            color: #ff6b9d;
          }

          .create-time {
            font-size: 22rpx;
            color: #999;
          }
        }
      }

      .priority-badge {
        position: absolute;
        top: 0;
        right: 0;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
        font-size: 20rpx;

        &.high {
          background: #ff3b30;
          color: white;
        }

        &.mid {
          background: #ff9500;
          color: white;
        }

        .priority-text {
          font-weight: 500;
        }
      }
    }

    .todo-actions {
      flex-shrink: 0;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
  }

  .add-button {
    background: #667eea;
    color: white;
    border: none;
    padding: 20rpx 40rpx;
    border-radius: 50rpx;
    font-size: 28rpx;
  }
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.4);
  z-index: 999;

  .fab-icon {
    font-size: 48rpx;
    color: white;
    font-weight: bold;
  }
}

.card {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}
</style>