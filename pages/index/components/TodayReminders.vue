<template>
  <view v-if="hasAnyReminder" class="today-reminders">
    <!-- 顶部概览卡片 (日期+天气+语录) -->
    <view class="overview-card" :style="{ background: themeColors.surface }">
      <view class="date-weather-row">
        <view class="date-info">
          <text class="day-text" :style="{ color: themeColors.primary }">{{ formatDate(Date.now(), "DD") }}</text>
          <view class="month-year">
            <text class="month-text">{{ formatDate(Date.now(), "MM月") }}</text>
            <text class="weekday-text">{{ formatDate(Date.now(), "dddd") }}</text>
          </view>
        </view>
        
        <view class="weather-info" v-if="weatherInfo">
          <view class="weather-main">
            <text class="weather-icon">{{ weatherInfo.emoji }}</text>
            <text class="weather-temp">{{ weatherInfo.temp }}</text>
          </view>
          <text class="weather-desc">{{ weatherInfo.desc }} | {{ weatherInfo.tip }}</text>
        </view>
      </view>
      
      <view class="quote-section" v-if="dailyQuote">
        <text class="quote-mark">"</text>
        <text class="quote-text">{{ dailyQuote }}</text>
      </view>
    </view>

    <!-- 提醒列表 -->
    <view class="reminders-list">
      <!-- 经期提醒 -->
      <view class="reminder-item" v-if="menstruationReminder" :style="{ borderLeftColor: '#ff6b9d' }">
        <view class="reminder-icon-box" :style="{ background: '#fff0f6' }">
          <text class="reminder-icon">{{ menstruationReminder.emoji }}</text>
        </view>
        <view class="reminder-content">
          <text class="reminder-title">经期提醒</text>
          <text class="reminder-desc">{{ menstruationReminder.message }}</text>
        </view>
      </view>

      <!-- 生日提醒 -->
      <view 
        class="reminder-item" 
        v-for="birthday in upcomingBirthdays.slice(0, 1)" 
        :key="birthday.recordId"
        @click="goToBirthdayDetail(birthday.recordId)"
        :style="{ borderLeftColor: themeColors.warning }"
      >
        <view class="reminder-icon-box" :style="{ background: adjustOpacity(themeColors.warning, 0.1) }">
          <text class="reminder-icon">🎂</text>
        </view>
        <view class="reminder-content">
          <text class="reminder-title">{{ birthday.name }}的生日</text>
          <text class="reminder-desc">还有 {{ birthday.daysUntil }} 天 ({{ birthday.age }}岁)</text>
        </view>
      </view>

      <!-- 节日提醒 -->
      <view 
        class="reminder-item" 
        v-for="(holiday, index) in upcomingHolidays.slice(0, 1)" 
        :key="index"
        :style="{ borderLeftColor: themeColors.success }"
      >
        <view class="reminder-icon-box" :style="{ background: adjustOpacity(themeColors.success, 0.1) }">
          <text class="reminder-icon">{{ holiday.emoji }}</text>
        </view>
        <view class="reminder-content">
          <text class="reminder-title">{{ holiday.name }}</text>
          <text class="reminder-desc">还有 {{ holiday.daysUntil }} 天 {{ holiday.holiday ? "（放假）" : "" }}</text>
        </view>
      </view>

      <!-- 待办事项 -->
      <view class="todo-group" v-if="pendingTodos && pendingTodos.length > 0">
        <view class="group-header">
          <text class="group-title">待办事项 ({{ pendingTodos.length }})</text>
          <text class="group-more" v-if="pendingTodos.length > 3" @click="goToTodoList">查看全部</text>
        </view>
        
        <view 
          v-for="todo in pendingTodos.slice(0, 3)" 
          :key="todo.recordId"
          class="todo-simple-item"
          @click="goToTodoDetail(todo.recordId)"
          :style="{ background: themeColors.surface }"
        >
          <view class="todo-check" @click.stop="handleTodoComplete(todo)" :style="{ borderColor: themeColors.primary }">
            <view class="todo-check-inner" :style="{ background: themeColors.primary }"></view>
          </view>
          <view class="todo-body">
            <text class="todo-text">{{ todo.content }}</text>
            <text class="todo-meta" :style="{ color: getTodoColor(todo) }">{{ getTodoDaysText(todo) }}</text>
          </view>
          <view class="todo-close" @click.stop="handleTodoClose(todo)">
            <text>✕</text>
          </view>
        </view>
      </view>
    </view>
  </view>

  <!-- 自定义确认弹窗 -->
  <view v-if="showConfirmModal" class="modal-overlay" @click="closeModal">
    <view class="modal-content" @click.stop :style="{ background: themeColors.surface }">
      <view class="modal-header">
        <text class="modal-title">{{ modalData.title }}</text>
      </view>
      <view class="modal-body">
        <text class="modal-message">{{ modalData.message }}</text>
        <view class="note-section">
          <text class="note-label">备注：</text>
          <textarea
            v-model="noteInput"
            class="note-textarea"
            :placeholder="modalData.placeholder"
            maxlength="200"
            :style="{ background: themeColors.background }"
          />
        </view>
      </view>
      <view class="modal-footer">
        <button class="modal-button cancel-button" @click="closeModal">取消</button>
        <button 
          class="modal-button confirm-button" 
          @click="confirmAction"
          :style="{ background: themeColors.primary, color: '#fff' }"
        >{{ modalData.confirmText }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { formatDate } from "@/utils";
import { useThemeStore } from "@/stores";

const props = defineProps({
  weatherInfo: Object,
  dailyQuote: String,
  menstruationReminder: Object,
  pendingTodos: Array,
  upcomingBirthdays: Array,
  upcomingHolidays: Array,
});

const emit = defineEmits(["todo-complete", "todo-close"]);
const themeStore = useThemeStore();
const themeColors = computed(() => themeStore.currentThemeColors);

// 辅助函数：调整颜色透明度
const adjustOpacity = (hex, opacity) => {
  let c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){
          c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+opacity+')';
  }
  return hex;
}

// 弹窗相关数据
const showConfirmModal = ref(false);
const noteInput = ref('');
const modalData = ref({});
const currentTodo = ref(null);
const currentAction = ref('');

// 关闭弹窗
const closeModal = () => {
  showConfirmModal.value = false;
  noteInput.value = '';
  modalData.value = {};
  currentTodo.value = null;
  currentAction.value = '';
};

// 确认操作
const confirmAction = () => {
  if (currentAction.value === 'complete') {
    const completeData = {
      ...currentTodo.value,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      completionNote: noteInput.value || '',
      status: 'completed'
    };
    emit("todo-complete", completeData);
    uni.showToast({
      title: '已完成',
      icon: 'success',
      duration: 1500
    });
  } else if (currentAction.value === 'close') {
    const closeData = {
      ...currentTodo.value,
      isCompleted: false,
      closedAt: new Date().toISOString(),
      closeNote: noteInput.value || '',
      status: 'closed'
    };
    emit("todo-close", closeData);
    uni.showToast({
      title: '已关闭',
      icon: 'success',
      duration: 1500
    });
  }
  closeModal();
};

// 计算属性
const hasAnyReminder = computed(() => {
  return props.weatherInfo ||
    props.dailyQuote ||
    (props.upcomingHolidays && props.upcomingHolidays.length > 0) ||
    (props.upcomingBirthdays && props.upcomingBirthdays.length > 0) ||
    (props.pendingTodos && props.pendingTodos.length > 0) ||
    props.menstruationReminder;
});

// 获取待办事项天数文本
const getTodoDaysText = (todo) => {
  if (todo.urgency === "overdue") {
    if (todo.deadline) {
      const deadline = new Date(todo.deadline);
      const today = new Date();
      const daysDiff = Math.ceil((today.getTime() - deadline.getTime()) / (1000 * 3600 * 24));
      return `已逾期${daysDiff}天`;
    }
    return "已逾期";
  } else if (todo.urgency === "today") {
    return "今天截止";
  } else if (todo.deadline) {
    const deadline = new Date(todo.deadline);
    const today = new Date();
    const daysDiff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return `${daysDiff}天后截止`;
  }
  return "";
};

const getTodoColor = (todo) => {
  if (todo.urgency === "overdue") return themeColors.value.error;
  if (todo.urgency === "today") return themeColors.value.warning;
  return themeColors.value.textSecondary;
};

// 方法
const goToTodoDetail = (recordId) => {
  uni.navigateTo({ url: `/pages/record/detail?id=${recordId}` });
};

const goToTodoList = () => {
  uni.navigateTo({ url: "/pages/todo/list" });
};

const goToBirthdayDetail = (recordId) => {
  uni.navigateTo({ url: `/pages/birthday/detail?id=${recordId}` });
};

const handleTodoComplete = (todo) => {
  currentTodo.value = todo;
  currentAction.value = 'complete';
  modalData.value = {
    title: '完成待办事项',
    message: `确定要完成"${todo.content}"吗？`,
    placeholder: '输入完成备注（可选）...',
    confirmText: '完成'
  };
  showConfirmModal.value = true;
};

const handleTodoClose = (todo) => {
  currentTodo.value = todo;
  currentAction.value = 'close';
  modalData.value = {
    title: '关闭待办事项',
    message: `确定要关闭"${todo.content}"吗？`,
    placeholder: '输入关闭原因（可选）...',
    confirmText: '关闭'
  };
  showConfirmModal.value = true;
};
</script>

<style lang="scss" scoped>
.today-reminders {
  padding: 0 20rpx;
  margin-bottom: 20rpx;
}

.overview-card {
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  .date-weather-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24rpx;
    
    .date-info {
      display: flex;
      align-items: center;
      gap: 16rpx;
      
      .day-text {
        font-size: 64rpx;
        font-weight: bold;
        line-height: 1;
      }
      
      .month-year {
        display: flex;
        flex-direction: column;
        
        .month-text {
          font-size: 24rpx;
          color: #666;
          font-weight: 500;
        }
        
        .weekday-text {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
    
    .weather-info {
      text-align: right;
      
      .weather-main {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8rpx;
        margin-bottom: 4rpx;
        
        .weather-icon {
          font-size: 32rpx;
        }
        
        .weather-temp {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
        }
      }
      
      .weather-desc {
        font-size: 22rpx;
        color: #999;
      }
    }
  }
  
  .quote-section {
    position: relative;
    padding-left: 24rpx;
    
    .quote-mark {
      position: absolute;
      left: 0;
      top: -10rpx;
      font-size: 40rpx;
      color: #eee;
      font-family: serif;
    }
    
    .quote-text {
      font-size: 26rpx;
      color: #666;
      font-style: italic;
      line-height: 1.5;
    }
  }
}

.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.reminder-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  border-left: 8rpx solid #ccc;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.03);
  
  .reminder-icon-box {
    width: 80rpx;
    height: 80rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .reminder-icon {
      font-size: 40rpx;
    }
  }
  
  .reminder-content {
    flex: 1;
    
    .reminder-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 4rpx;
      display: block;
    }
    
    .reminder-desc {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.todo-group {
  margin-top: 10rpx;
  
  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    padding: 0 4rpx;
    
    .group-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }
    
    .group-more {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .todo-simple-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
    
    .todo-check {
      width: 36rpx;
      height: 36rpx;
      border-radius: 50%;
      border: 2rpx solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .todo-check-inner {
        width: 20rpx;
        height: 20rpx;
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      &:active .todo-check-inner {
        opacity: 0.5;
      }
    }
    
    .todo-body {
      flex: 1;
      
      .todo-text {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 4rpx;
        display: block;
      }
      
      .todo-meta {
        font-size: 22rpx;
      }
    }
    
    .todo-close {
      padding: 10rpx;
      color: #ccc;
      font-size: 24rpx;
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  border-radius: 24rpx;
  width: 600rpx;
  max-width: 90vw;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 32rpx 32rpx 16rpx;
  
  .modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    display: block;
  }
}

.modal-body {
  padding: 24rpx 32rpx;
  
  .modal-message {
    font-size: 28rpx;
    color: #666;
    text-align: center;
    display: block;
    margin-bottom: 24rpx;
  }
  
  .note-section {
    .note-label {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 8rpx;
      display: block;
    }
    
    .note-textarea {
      width: 100%;
      height: 120rpx;
      border-radius: 12rpx;
      padding: 16rpx;
      font-size: 26rpx;
      box-sizing: border-box;
    }
  }
}

.modal-footer {
  display: flex;
  padding: 24rpx 32rpx 32rpx;
  gap: 20rpx;
  
  .modal-button {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    border-radius: 40rpx;
    font-size: 28rpx;
    border: none;
    
    &.cancel-button {
      background: #f5f5f5;
      color: #666;
    }
    
    &.confirm-button {
      font-weight: bold;
    }
    
    &::after {
      border: none;
    }
  }
}
</style>