<template>
  <view class="index-page">
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

    <!-- 模块快捷入口 - 分组显示 -->
    <ModuleGroups
      :records="recordStore.records"
      :module-visibility-store="moduleVisibilityStore"
      @module-hide="handleModuleHide"
      @module-show="handleModuleShow"
      @show-all-modules="handleShowAllModules"
    />

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
import { ref, onMounted } from "vue";
import { useRecordStore, useAppStore, useModuleVisibilityStore } from "@/stores";
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
const testFun = async () => {
  try {
    console.log('开始测试Supabase连接...')
    let { data: records, error } = await supabase
      .from('records')
      .select('*')
    if (error) {
      console.error('查询错误:', error)
      throw error
    }
    console.log('查询成功，获取到', records?.length || 0, '条记录')
    console.log('records:', records)
  } catch (error) {
    console.error('查询记录失败:', error)
  }
}

// 在组件挂载后执行测试
onMounted(() => {
  testFun()
})

const recordStore = useRecordStore();
const appStore = useAppStore();
const moduleVisibilityStore = useModuleVisibilityStore();

// 响应式数据
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

  recordStore.loadFromStorage()
  appStore.loadUserData()

  // 初始化模块可见性状态
  await moduleVisibilityStore.loadFromStorage()

  console.log('记录数据:', recordStore.records.length)
  console.log('模块可见性状态:', moduleVisibilityStore.hiddenModulesCount)

  // 如果没有数据，强制初始化mock数据
  if (recordStore.records.length === 0) {
    console.log('没有记录数据，初始化mock数据...')
    const { initMockData } = await import('@/mock/index.js')
    initMockData()
    recordStore.loadFromStorage()
    console.log('Mock数据初始化完成，记录数量:', recordStore.records.length)
  }

  await loadReminders()

  console.log('提醒数据加载完成:', {
    weather: weatherInfo.value,
    holidays: upcomingHolidays.value.length,
    birthdays: upcomingBirthdays.value.length,
    todos: pendingTodos.value.length,
    menstruation: menstruationReminder.value
  })
});
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F4, #F8F4FF);
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
</style>
