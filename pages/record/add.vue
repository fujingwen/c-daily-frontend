<template>
  <view class="add-record-page">
    <view class="form-container">
      <!-- 模块选择（仅在未指定类型时显示） -->
      <view class="form-section card" v-if="!isDirectMode">
        <view class="section-title">快速记录</view>

        <!-- 快速笔记入口 -->
        <view class="quick-note-section">
          <view class="quick-note-card" @click="selectModule('essay')">
            <view class="note-icon">📝</view>
            <view class="note-content">
              <text class="note-title">写笔记</text>
              <text class="note-desc">记录今天的想法和感受</text>
            </view>
            <view class="note-arrow">→</view>
          </view>
        </view>

        <!-- 其他常用记录 -->
        <view class="section-subtitle">其他记录类型</view>
        <view class="module-selector">
          <view
            class="module-option"
            :class="{ active: currentModule === type }"
            v-for="(config, type) in moduleConfig"
            :key="type"
            @click="selectModule(type)"
          >
            <text class="option-emoji">{{ config.icon }}</text>
            <text class="option-name">{{ config.name }}</text>
          </view>
        </view>
      </view>

      <!-- 动态表单 -->
      <view class="form-section card" v-if="currentModule">
        <view class="section-title">{{
          getModuleConfig(currentModule).name
        }}</view>

        <!-- 菜谱记录表单 -->
        <template v-if="currentModule === 'recipe'">
          <view class="redirect-notice">
            <view class="notice-icon">👨‍🍳</view>
            <text class="notice-title">菜谱功能</text>
            <text class="notice-desc"
              >菜谱功能有专门的页面，点击下方按钮前往</text
            >
            <button class="redirect-btn" @click="goToRecipeList">
              前往菜谱页面
            </button>
          </view>
        </template>

        <!-- 心情记录表单 -->
        <DailyMoodForm
          v-else-if="currentModule === 'dailyMood'"
          :form-data="formData"
          @update:form-data="updateFormData"
        />

        <!-- 体重记录表单 -->
        <WeightForm
          v-else-if="currentModule === 'weight'"
          :form-data="formData"
          @update:form-data="updateFormData"
        />

        <!-- 奶茶记录表单 -->
        <MilkTeaForm
          v-else-if="currentModule === 'milkTea'"
          :form-data="formData"
          @update:form-data="updateFormData"
        />

        <!-- 记账表单 -->
        <AccountForm
          v-else-if="currentModule === 'account'"
          :form-data="formData"
          @update:form-data="updateFormData"
        />

        <!-- 待办事项表单 -->
        <TodoForm
          v-else-if="currentModule === 'todo'"
          :form-data="formData"
          @update:form-data="updateFormData"
        />

        <!-- 食物记录表单 -->
        <FoodForm
          v-else-if="currentModule === 'food'"
          :form-data="formData"
          @update:form-data="updateFormData"
        />

        <!-- 运动记录表单 -->
        <ExerciseForm
          v-else-if="currentModule === 'exercise'"
          :form-data="formData"
          @update:form-data="updateFormData"
        />

        <!-- 碎碎念记录表单 -->
        <EssayForm
          v-else-if="currentModule === 'essay'"
          :form-data="formData"
          :records="recordStore.records"
          @update:form-data="updateFormData"
          @append-essay="appendToEssay"
        />

        <!-- 月经记录表单 -->
        <MenstruationForm
          v-else-if="currentModule === 'menstruation'"
          :form-data="formData"
          :records="recordStore.records"
          @update:form-data="updateFormData"
        />

        <!-- 买买买表单 -->
        <ShoppingForm
          v-else-if="currentModule === 'wish'"
          :initial-data="formData"
          @submit="handleSubmit"
        />

        <!-- 通用描述字段（如果表单组件中没有包含） -->
        <view class="form-item" v-if="showDescription">
          <text class="form-label">详细描述</text>
          <u-textarea
            v-model="formData.description"
            placeholder="详细描述一下..."
            maxlength="500"
            count
          />
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons" v-if="currentModule">
        <button class="cancel-button" @click="handleCancel">
          <text class="button-text">取消</text>
        </button>
        <button class="save-button" @click="handleSave">
          <text class="button-text">保存</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRecordStore } from "@/stores";
import {
  MODULE_CONFIG,
  MOOD_TYPES,
  SUGAR_TYPES,
  ICE_TYPES,
  ACCOUNT_TYPES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAY_TYPES,
  PRIORITY_TYPES,
  MEAL_TYPES,
  FOOD_TAGS,
  RATING_OPTIONS,
  EXERCISE_TYPES,
  ESSAY_TYPES,
} from "@/utils/constants";
import { showToast, formatDate } from "@/utils";

// 组件导入
import DailyMoodForm from "./components/DailyMoodForm.vue";
import WeightForm from "./components/WeightForm.vue";
import MilkTeaForm from "./components/MilkTeaForm.vue";
import AccountForm from "./components/AccountForm.vue";
import TodoForm from "./components/TodoForm.vue";
import FoodForm from "./components/FoodForm.vue";
import ExerciseForm from "./components/ExerciseForm.vue";
import EssayForm from "./components/EssayForm.vue";
import MenstruationForm from "./components/MenstruationForm.vue";
import ShoppingForm from "./components/ShoppingForm.vue";

const recordStore = useRecordStore();

// 响应式数据
const currentModule = ref("");
const formData = ref({});
const isDirectMode = ref(false); // 是否直接进入模式（从今日打卡进入）
const keywordInput = ref(""); // 关键字输入框

// 计算属性
const moduleConfig = computed(() => MODULE_CONFIG);
const moodTypes = computed(() => MOOD_TYPES);
const sugarTypes = computed(() => SUGAR_TYPES);
const iceTypes = computed(() => ICE_TYPES);
const accountTypes = computed(() => ACCOUNT_TYPES);
const payTypes = computed(() => PAY_TYPES);
const priorityTypes = computed(() => PRIORITY_TYPES);
const mealTypes = computed(() => MEAL_TYPES);
const foodTags = computed(() => FOOD_TAGS);
const ratingOptions = computed(() => RATING_OPTIONS);

// 检查是否需要显示通用描述字段
const showDescription = computed(() => {
  // 只有特定模块才显示通用描述字段
  const modulesWithDescription = ['dailyMood', 'exercise', 'food'];
  return modulesWithDescription.includes(currentModule.value) && !formData.value.description;
});

// 关键字相关数据
const recentKeywords = computed(() => {
  const keywords = new Set();
  recordStore.records.forEach(record => {
    if (record.moduleType === 'dailyMood' && record.keywords) {
      record.keywords.forEach(keyword => keywords.add(keyword));
    }
  });
  return Array.from(keywords).slice(0, 10);
});

const commonKeywords = ['开心', '难过', '兴奋', '疲惫', '忙碌', '轻松', '焦虑', '平静', '充实', '无聊'];

// 方法
const getModuleConfig = (type) => {
  return MODULE_CONFIG[type] || { name: "未知", icon: "❓", color: "#999" };
};

const selectModule = (moduleType) => {
  currentModule.value = moduleType;
  initFormData(moduleType);
  // 保存当前记录类型到本地存储，以便刷新页面后恢复状态
  uni.setStorageSync('currentRecordModule', moduleType);
};

const updateFormData = (newFormData) => {
  formData.value = newFormData;
};

const initFormData = (moduleType) => {
  const baseData = {
    moduleType,
    createTime: Date.now(),
  };

  switch (moduleType) {
    case 'dailyMood':
      formData.value = {
        ...baseData,
        moodType: 'happy',
        keywords: [],
        description: '',
      };
      break;
    case 'weight':
      formData.value = {
        ...baseData,
        weightValue: '',
        measureTime: Date.now(),
        remark: '',
      };
      break;
    case 'milkTea':
      formData.value = {
        ...baseData,
        name: '',
        shop: '',
        sugar: 'normal',
        ice: 'normal',
        price: '',
        remark: '',
      };
      break;
    case 'account':
      formData.value = {
        ...baseData,
        type: 'expense',
        amount: '',
        category: '',
        payType: 'cash',
        remark: '',
      };
      break;
    case 'todo':
      formData.value = {
        ...baseData,
        content: '',
        priority: 'low',
        deadline: null,
        isRecurring: false,
        repeatType: 'none',
        repeatInterval: 1,
        repeatDayOfWeek: null,
        repeatDayOfMonth: null,
      };
      break;
    case 'food':
      formData.value = {
        ...baseData,
        mealType: 'lunch',
        foodName: '',
        restaurant: '',
        price: '',
        rating: 3,
        tags: [],
        remark: '',
      };
      break;
    case 'exercise':
      formData.value = {
        ...baseData,
        exerciseType: 'running',
        duration: '',
        calories: '',
        distance: '',
        remark: '',
      };
      break;
    case 'essay':
      formData.value = {
        ...baseData,
        essayType: 'thoughts',
        content: '',
      };
      break;
    case 'menstruation':
      // 从 URL 参数获取预设日期
      const today = new Date();
      const defaultDate = formatDate(today, 'YYYY-MM-DD');

      formData.value = {
        ...baseData,
        startDate: options.date || defaultDate,
        endDate: null,
        flow: 'mid',
        painLevel: 'none',
        remark: '',
      };

      // 处理从日历页面传入的特殊操作
      if (options.action === 'start' && options.date) {
        formData.value.startDate = options.date;
        formData.value.endDate = null;
      }
      break;
    default:
      formData.value = baseData;
  }
};

const appendToEssay = (essay) => {
  formData.value.content = essay.content + '\n\n';
};

const goToRecipeList = () => {
  uni.navigateTo({
    url: "/pages/recipe/list",
  });
};

const handleCancel = () => {
  uni.navigateBack();
};

const handleSave = async () => {
  try {
    // 验证必填字段
    if (!validateForm()) {
      return;
    }

    // 处理特定模块的数据
    processFormData();

    // 保存记录
    if (isEditing.value) {
      await recordStore.updateRecord(editingRecordId.value, formData.value);
      showToast("更新成功", "success");
    } else {
      await recordStore.addRecord(formData.value);
      showToast("保存成功", "success");
    }

    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    console.error('保存记录失败:', error);
    showToast("保存失败，请重试", "error");
  }
};

const validateForm = () => {
  switch (currentModule.value) {
    case 'weight':
      if (!formData.value.weightValue) {
        showToast("请输入体重", "none");
        return false;
      }
      break;
    case 'milkTea':
      if (!formData.value.name) {
        showToast("请输入奶茶名称", "none");
        return false;
      }
      break;
    case 'account':
      if (!formData.value.amount) {
        showToast("请输入金额", "none");
        return false;
      }
      break;
    case 'todo':
      if (!formData.value.content) {
        showToast("请输入待办内容", "none");
        return false;
      }

      // 验证截止时间
      if (formData.value.deadline && formData.value.deadline < Date.now()) {
        showToast("截止时间不能是过去时间", "none");
        return false;
      }

      // 验证循环事项设置
      if (formData.value.isRecurring && formData.value.repeatType !== 'none') {
        if (formData.value.repeatType === 'weekly' && (formData.value.repeatDayOfWeek === null || formData.value.repeatDayOfWeek === undefined)) {
          showToast("请选择循环的具体星期", "none");
          return false;
        }
        if (formData.value.repeatType === 'monthly' && (!formData.value.repeatDayOfMonth || formData.value.repeatDayOfMonth < 1 || formData.value.repeatDayOfMonth > 31)) {
          showToast("请选择有效的循环日期", "none");
          return false;
        }
      }
      break;
    case 'food':
      if (!formData.value.foodName) {
        showToast("请输入食物名称", "none");
        return false;
      }
      break;
    case 'exercise':
      if (!formData.value.duration) {
        showToast("请输入运动时长", "none");
        return false;
      }
      break;
    case 'essay':
      if (!formData.value.content) {
        showToast("请输入内容", "none");
        return false;
      }
      break;
  }
  return true;
};

const processFormData = () => {
  // 处理特殊字段
  switch (currentModule.value) {
    case 'food':
      // 确保评分是数字
      formData.value.rating = Number(formData.value.rating);
      break;
    case 'exercise':
      // 确保数字字段是数字类型
      if (formData.value.duration) formData.value.duration = Number(formData.value.duration);
      if (formData.value.calories) formData.value.calories = Number(formData.value.calories);
      if (formData.value.distance) formData.value.distance = Number(formData.value.distance);
      break;
    case 'account':
      // 确保金额是数字
      if (formData.value.amount) formData.value.amount = Number(formData.value.amount);
      break;
    case 'todo':
      // 处理循环事项数据
      if (!formData.value.isRecurring) {
        // 如果不是循环事项，重置相关字段
        formData.value.repeatType = 'none';
        formData.value.repeatInterval = 1;
        formData.value.repeatDayOfWeek = null;
        formData.value.repeatDayOfMonth = null;
      } else {
        // 确保数字字段是数字类型
        if (formData.value.repeatInterval) formData.value.repeatInterval = Number(formData.value.repeatInterval);
        if (formData.value.repeatDayOfMonth) formData.value.repeatDayOfMonth = Number(formData.value.repeatDayOfMonth);
      }
      break;
  }
};

// 编辑模式相关
const isEditing = ref(false);
const editingRecordId = ref('');

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();

  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;

  // 检查是否是编辑模式
  if (options.edit === 'true' && options.id) {
    isEditing.value = true;
    editingRecordId.value = options.id;

    const record = recordStore.records.find(r => r.recordId === options.id);
    if (record) {
      currentModule.value = record.moduleType;
      formData.value = { ...record };
    }
  }

  // 检查是否直接指定了类型
  else if (options.type) {
    isDirectMode.value = true;
    currentModule.value = options.type;
    initFormData(options.type);

    // 处理特殊参数
    if (options.type === 'food') {
      if (options.foodName) {
        formData.value.foodName = decodeURIComponent(options.foodName);
      }
      if (options.mealType) {
        formData.value.mealType = options.mealType;
      }
    }
  }

  // 检查是否有预设的记录类型
  else {
    const addRecordType = uni.getStorageSync('addRecordType');
    if (addRecordType) {
      isDirectMode.value = true;
      currentModule.value = addRecordType;
      initFormData(addRecordType);
      uni.removeStorageSync('addRecordType');
    }
    // 检查本地存储中的当前记录类型（用于刷新页面后恢复状态）
    else {
      const savedModule = uni.getStorageSync('currentRecordModule');
      if (savedModule) {
        isDirectMode.value = true;
        currentModule.value = savedModule;
        initFormData(savedModule);
      }
    }
  }
});

// 页面卸载时清除本地存储中的当前记录类型
onBeforeUnmount(() => {
  uni.removeStorageSync('currentRecordModule');
});
</script>

<style lang="scss" scoped>
.add-record-page {
  height: calc(100vh - 44px - 20rpx); /* 减去导航栏高度和页面内边距 */
  background: #f5f5f5;
  padding: 20rpx;
  padding-top: 0; /* 避免双重内边距 */
  overflow: hidden; /* 阻止默认滚动 */

  .form-container {
    height: 100%;
    overflow-y: auto; /* 内容区域可以滚动 */

    .form-section {
      margin-bottom: 20rpx;
      padding: 30rpx;
      background: white;
      border-radius: 16rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

      .section-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 24rpx;
        text-align: center;
      }

      .section-subtitle {
        font-size: 28rpx;
        color: #666;
        margin: 24rpx 0 16rpx;
        font-weight: 500;
      }
    }

    .quick-note-section {
      margin-bottom: 20rpx;

      .quick-note-card {
        display: flex;
        align-items: center;
        padding: 24rpx;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16rpx;
        color: white;
        transition: all 0.3s;

        &:active {
          transform: scale(0.98);
        }

        .note-icon {
          font-size: 40rpx;
          margin-right: 20rpx;
        }

        .note-content {
          flex: 1;

          .note-title {
            display: block;
            font-size: 30rpx;
            font-weight: 600;
            margin-bottom: 8rpx;
          }

          .note-desc {
            font-size: 24rpx;
            opacity: 0.9;
          }
        }

        .note-arrow {
          font-size: 32rpx;
          opacity: 0.8;
        }
      }
    }

    .module-selector {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16rpx;

      .module-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24rpx 16rpx;
        border-radius: 16rpx;
        border: 2rpx solid #eee;
        transition: all 0.3s;
        background: white;

        &.active {
          border-color: #ff6b9d;
          background: rgba(255, 107, 157, 0.1);
          transform: scale(1.02);
        }

        &:active {
          background: #f8f8f8;
        }

        .option-emoji {
          font-size: 40rpx;
          margin-bottom: 12rpx;
        }

        .option-name {
          font-size: 24rpx;
          color: #333;
          text-align: center;
          font-weight: 500;
        }
      }
    }

    .redirect-notice {
      text-align: center;
      padding: 60rpx 40rpx;

      .notice-icon {
        font-size: 80rpx;
        margin-bottom: 20rpx;
      }

      .notice-title {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 16rpx;
      }

      .notice-desc {
        font-size: 26rpx;
        color: #666;
        margin-bottom: 30rpx;
        line-height: 1.5;
      }

      .redirect-btn {
        background: #5856d6;
        color: white;
        border-radius: 12rpx;
        padding: 20rpx 40rpx;
        font-size: 28rpx;
        font-weight: 500;
        border: none;
        transition: all 0.3s;

        &:active {
          background: #4a46c4;
          transform: scale(0.98);
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 20rpx;
      padding: 30rpx 20rpx;
      margin-top: 30rpx;
      background: white;
      border-radius: 20rpx;
      box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
      position: sticky;
      bottom: 0;

      .cancel-button,
      .save-button {
        flex: 1;
        border-radius: 16rpx;
        // padding: 28rpx 20rpx;
        font-size: 32rpx;
        font-weight: 600;
        border: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

        .button-text {
          color: inherit;
          font-size: inherit;
          font-weight: inherit;
        }
      }

      .cancel-button {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        color: #6c757d;
        border: 2rpx solid #dee2e6;

        &:active {
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
          transform: scale(0.98);
        }
      }

      .save-button {
        background: linear-gradient(135deg, #ff6b9d 0%, #ff4081 100%);
        color: white;
        border: 2rpx solid rgba(255, 107, 157, 0.3);
        box-shadow: 0 4rpx 16rpx rgba(255, 107, 157, 0.3);

        &:active {
          background: linear-gradient(135deg, #ff4081 0%, #f50057 100%);
          transform: scale(0.98);
          box-shadow: 0 2rpx 8rpx rgba(255, 107, 157, 0.4);
        }
      }
    }
  }
}
</style>