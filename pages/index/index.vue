<template>
  <view class="index-page" :style="{ background: themeStore.currentThemeColors.backgroundGradient }">
    <!-- 主题切换器 -->
    <view class="theme-switcher" v-if="showThemeSwitch">
      <text class="theme-title">选择主题风格</text>
      <view class="theme-list">
        <view 
          class="theme-item" 
          v-for="(theme, key) in themeStore.themes" 
          :key="key"
          @click="switchTheme(key)"
        >
          <view 
            class="theme-color" 
            :style="{ background: theme.primary, borderColor: themeStore.currentTheme === key ? theme.accent : 'transparent' }"
            :class="{ active: themeStore.currentTheme === key }"
          ></view>
          <text class="theme-name" :style="{ color: themeStore.currentTheme === key ? theme.primary : '#666' }">{{ theme.name }}</text>
        </view>
      </view>
    </view>

    <!-- 顶部固定区域 -->
    <view class="sticky-header" :style="{ background: themeStore.currentThemeColors.backgroundGradient }">
      <!-- 顶部导航栏/Logo区域 -->
      <view class="nav-header" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="header-content">
          <view class="header-left">
            <text class="title">Coffee Daily</text>
            <text class="subtitle">记录每一个美好瞬间</text>
          </view>
          <view class="header-right">
            <view @click="toggleThemeSwitch" class="icon-btn">
              <text style="font-size: 40rpx;">🎨</text>
            </view>
            <view @click="openModulePopup" class="plus-btn">
              <u-icon name="plus" color="#fff" size="22"></u-icon>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 今日提醒模块 -->
    <TodayReminders
      :weather-info="weatherInfo"
      :daily-quote="dailyQuote"
      :menstruation-reminder="menstruationReminder"
      :pending-todos="pendingTodos"
      :upcoming-birthdays="upcomingBirthdays"
      :upcoming-holidays="upcomingHolidays"
      @todo-complete="handleTodoComplete"
    />

    <!-- 模块快捷入口抽屉 -->
    <u-popup
      :show="showModulePopup"
      mode="bottom"
      border-radius="40"
      :safe-area-inset-bottom="true"
      :lock-scroll="true"
      @close="closeModulePopup"
    >
      <view class="module-popup-content">
        <view class="popup-header">
          <text class="popup-title">记录生活</text>
          <view class="close-btn" @click="closeModulePopup">
            <u-icon name="close" color="#999" size="20"></u-icon>
          </view>
        </view>
        <scroll-view scroll-y style="max-height: 70vh; padding-bottom: 40rpx;">
          <ModuleGroups
            :records="recordStore.records"
            :module-visibility-store="moduleVisibilityStore"
            @module-hide="handleModuleHide"
            @module-show="handleModuleShow"
            @show-all-modules="handleShowAllModules"
            @item-click="closeModulePopup"
          />
        </scroll-view>
      </view>
    </u-popup>

    <!-- 最近记录 -->
    <RecentRecords :records="recordStore.records" />

    <!-- 待办事项完成确认弹窗 -->
    <u-modal
      v-model="showCompleteModal"
      title="完成待办事项"
      :show-cancel-button="true"
      confirm-text="确认完成"
      cancel-text="取消"
      @confirm="confirmComplete"
      @cancel="closeCompleteModal"
    >
      <view class="modal-content">
        <view class="todo-info" v-if="currentTodo">
          <u-text :text="currentTodo.content" type="primary" size="16"></u-text>
        </view>
        <view class="remark-section">
          <u-text text="完成备注（可选）" size="14" color="#666"></u-text>
          <u-input
            v-model="completeRemark"
            type="textarea"
            placeholder="添加完成备注..."
            :maxlength="100"
            :show-word-limit="true"
            :auto-height="true"
            border="surround"
            style="margin-top: 10rpx;"
          ></u-input>
        </view>
      </view>
    </u-modal>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRecordStore, useAppStore, useModuleVisibilityStore, useThemeStore } from "@/stores";
import birthdayService from "@/utils/birthdayService.js";
import reminderService from "@/utils/reminderService.js";
import { vibrate } from "@/utils/hapticFeedback.js";

// 导入组件
import TodayReminders from "./components/TodayReminders.vue";
import ModuleGroups from "./components/ModuleGroups.vue";
import RecentRecords from "./components/RecentRecords.vue";

// 直接从supabase目录导入，避免中间层可能的问题
import { useSupabase } from "@/supabase/supabase";
const { supabase } = useSupabase();

const recordStore = useRecordStore();
const appStore = useAppStore();
const moduleVisibilityStore = useModuleVisibilityStore();
const themeStore = useThemeStore();

// 响应式数据
const statusBarHeight = ref(0);
const weatherInfo = ref(null);
const dailyQuote = ref('');
const upcomingHolidays = ref([]);
const upcomingBirthdays = ref([]);
const pendingTodos = ref([]);
const menstruationReminder = ref(null);

// 待办事项完成相关数据
const showCompleteModal = ref(false);
const currentTodo = ref(null);
const completeRemark = ref('');

// 模块抽屉相关
const showModulePopup = ref(false);
const openModulePopup = () => {
  showModulePopup.value = true;
  vibrate.light();
};
const closeModulePopup = () => {
  showModulePopup.value = false;
};

// 主题切换相关
const showThemeSwitch = ref(false);
const toggleThemeSwitch = () => {
  showThemeSwitch.value = !showThemeSwitch.value;
  vibrate.light();
};
const switchTheme = (themeKey) => {
  themeStore.setTheme(themeKey);
  vibrate.medium();
};

// 加载提醒数据
const loadReminders = async () => {
  try {
    // 获取天气信息
    weatherInfo.value = await reminderService.getWeatherInfo();

    // 获取今日语录
    dailyQuote.value = reminderService.getDailyQuote();

    // 获取节日提醒
    upcomingHolidays.value = reminderService.getUpcomingHolidays();

    // 获取生日提醒
    const birthdayRecords = birthdayService.getBirthdayRecords();
    upcomingBirthdays.value = reminderService.getUpcomingBirthdays(birthdayRecords);

    // 获取待办事项
    pendingTodos.value = reminderService.getPendingTodos(recordStore.records);

    // 获取姨妈期提醒
    menstruationReminder.value = reminderService.getMenstruationReminder(recordStore.records);
  } catch (error) {
    console.error("加载提醒数据失败:", error);
  }
};

// 待办事项完成相关方法
const handleTodoComplete = (todo) => {
  vibrate.light();
  currentTodo.value = todo;
  showCompleteModal.value = true;
};

const closeCompleteModal = () => {
  showCompleteModal.value = false;
  currentTodo.value = null;
  completeRemark.value = '';
};

const confirmComplete = async () => {
  try {
    if (!currentTodo.value) return;

    vibrate.medium();

    // 更新待办事项状态
    const success = recordStore.updateRecord(currentTodo.value.recordId, {
      isCompleted: true,
      completeRemark: completeRemark.value.trim(),
      completeTime: Date.now()
    });

    if (success) {
      uni.showToast({
        title: '已完成',
        icon: 'success'
      });

      // 重新加载提醒数据
      await loadReminders();
      closeCompleteModal();
    } else {
      throw new Error('更新失败');
    }
  } catch (error) {
    console.error('完成待办事项失败:', error);
    vibrate.error();
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 模块隐藏相关方法
const handleModuleHide = async (groupKey) => {
  try {
    await moduleVisibilityStore.hideModule(groupKey);
    console.log(`模块组 ${groupKey} 已隐藏`);
  } catch (error) {
    console.error('隐藏模块组失败:', error);
    uni.showToast({
      title: '隐藏失败，请重试',
      icon: 'none'
    });
  }
};

const handleModuleShow = async (groupKey) => {
  try {
    await moduleVisibilityStore.showModule(groupKey);
    console.log(`模块组 ${groupKey} 已显示`);
  } catch (error) {
    console.error('显示模块组失败:', error);
    uni.showToast({
      title: '显示失败，请重试',
      icon: 'none'
    });
  }
};

const handleShowAllModules = async () => {
  try {
    await moduleVisibilityStore.showAllModules();
    console.log('所有模块组已显示');
    uni.showToast({
      title: '所有模块已恢复显示',
      icon: 'success'
    });
  } catch (error) {
    console.error('显示所有模块失败:', error);
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  }
};

// 生命周期
onMounted(async () => {
  console.log('首页开始加载...')
  
  // 获取系统状态栏高度
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight || 0;

  recordStore.loadFromStorage()
  appStore.loadUserData()

  // 初始化模块可见性状态
  await moduleVisibilityStore.loadFromStorage()

  // 如果没有数据，强制初始化mock数据
  if (recordStore.records.length === 0) {
    console.log('没有记录数据，初始化mock数据...')
    const { initMockData } = await import('@/mock/index.js')
    initMockData()
    recordStore.loadFromStorage()
  }

  await loadReminders()
});
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  transition: background 0.3s ease;
  padding-bottom: 40rpx;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  /* 确保背景不透明，防止滚动时内容重叠 */
  background: inherit;
}

.nav-header {
  padding: 0 30rpx 20rpx;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    
    .header-left {
      .title {
        font-size: 44rpx;
        font-weight: bold;
        color: #333;
        display: block;
      }
      
      .subtitle {
        font-size: 24rpx;
        color: #666;
        display: block;
        margin-top: 4rpx;
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 24rpx;
      
      .icon-btn {
        padding: 10rpx;
      }
      
      .plus-btn {
        width: 72rpx;
        height: 72rpx;
        background: #333;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15);
        
        &:active {
          transform: scale(0.92);
        }
      }
    }
  }
}

.theme-switcher {
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  margin: 20rpx;
  border-radius: 20rpx;
  
  .theme-title {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 16rpx;
    display: block;
  }
  
  .theme-list {
    display: flex;
    gap: 20rpx;
    overflow-x: auto;
    padding-bottom: 10rpx;
    
    .theme-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      
      .theme-color {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        border: 4rpx solid transparent;
        transition: all 0.3s;
        
        &.active {
          transform: scale(1.1);
          box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.2);
        }
      }
      
      .theme-name {
        font-size: 20rpx;
        color: #666;
      }
    }
  }
}

.modal-content {
  padding: 20rpx;

  .todo-info {
    margin-bottom: 20rpx;
    padding: 16rpx;
    background: $uni-bg-color-grey;
    border-radius: $uni-border-radius-lg;
  }

  .remark-section {
    margin-top: 20rpx;
  }
}

.module-popup-content {
  background: #f8f8f8;
  border-radius: 40rpx 40rpx 0 0;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 40rpx;
    background: #fff;
    border-radius: 40rpx 40rpx 0 0;
    
    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .close-btn {
      padding: 10rpx;
    }
  }
}
</style>
