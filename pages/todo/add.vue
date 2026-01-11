<template>
  <view class="add-todo-page">
    <view class="form-container">
      <!-- 待办事项表单 -->
      <view class="form-section card">
        <view class="section-title">添加待办事项</view>

        <!-- 合并TodoForm组件的模板 -->
        <view class="todo-form">
          <view class="form-item">
            <text class="form-label">待办内容</text>
            <u-textarea
              v-model="formData.content"
              placeholder="请输入待办事项..."
              maxlength="100"
              count
            />
          </view>

          <view class="form-item">
            <text class="form-label">优先级</text>
            <u-radio-group
              :model-value="formData.priority"
              @update:model-value="updateFormData('priority', $event)"
            >
              <u-radio
                v-for="priority in priorityTypes"
                :key="priority.value"
                :name="priority.value"
                :label="priority.label"
              />
            </u-radio-group>
          </view>

          <view class="form-item">
            <text class="form-label">截止时间</text>
            <view class="deadline-input" @click="showDatePicker = true">
              <text class="deadline-text">
                {{
                  formData.deadline
                    ? formatDeadline(formData.deadline)
                    : "选择截止时间（可选）"
                }}
              </text>
            </view>

            <u-datetime-picker
              :show="showDatePicker"
              :model-value="formData.deadline"
              @update:model-value="updateDeadline"
              @close="showDatePicker = false"
              @cancel="showDatePicker = false"
              mode="datetime"
            />
          </view>

          <!-- 循环事项设置 -->
          <view class="form-item">
            <view class="recurring-header">
              <text class="form-label">循环事项</text>
              <u-switch
                :model-value="formData.isRecurring || false"
                @update:model-value="updateFormData('isRecurring', $event)"
                active-color="#5856d6"
              />
            </view>

            <view class="recurring-settings" v-if="formData.isRecurring">
              <view class="form-item">
                <text class="form-label">循环类型</text>
                <u-radio-group
                  :value="formData.repeatType || 'none'"
                  @change="updateFormData('repeatType', $event)"
                >
                  <u-radio
                    v-for="repeatType in repeatTypes"
                    :key="repeatType.value"
                    :name="repeatType.value"
                    :label="repeatType.label"
                  />
                </u-radio-group>
              </view>

              <!-- 循环间隔设置 -->
              <view
                class="form-item"
                v-if="
                  ['daily', 'weekly', 'monthly'].includes(formData.repeatType)
                "
              >
                <text class="form-label">循环间隔</text>
                <view class="interval-selector">
                  <u-number-box
                    :value="formData.repeatInterval || 1"
                    @change="updateFormData('repeatInterval', $event)"
                    :min="1"
                    :max="12"
                  />
                  <text class="interval-unit">{{
                    getRepeatIntervalUnit(formData.repeatType)
                  }}</text>
                </view>
              </view>

              <!-- 每周设置 -->
              <view class="form-item" v-if="formData.repeatType === 'weekly'">
                <text class="form-label">每周</text>
                <view class="weekday-selector">
                  <view
                    class="weekday-item"
                    :class="{ active: formData.repeatDayOfWeek === index }"
                    v-for="(day, index) in weekDays"
                    :key="index"
                    @click="updateFormData('repeatDayOfWeek', index)"
                  >
                    <text class="weekday-text">{{ day }}</text>
                  </view>
                </view>
              </view>

              <!-- 每月设置 -->
              <view class="form-item" v-if="formData.repeatType === 'monthly'">
                <text class="form-label">每月</text>
                <view class="day-selector">
                  <u-number-box
                    :value="formData.repeatDayOfMonth || 1"
                    @change="updateFormData('repeatDayOfMonth', $event)"
                    :min="1"
                    :max="31"
                  />
                  <text class="day-unit">号</text>
                </view>
              </view>

              <!-- 循环说明 -->
              <view class="recurring-description">
                <text class="desc-text">{{ getRecurringDescription() }}</text>
              </view>
            </view>
          </view>
        </view>
        <!-- 合并TodoForm组件的模板结束 -->
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
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
import { ref, computed } from "vue";
import { useRecordStore } from "@/stores";
import { showToast, formatDate } from "@/utils";
import { PRIORITY_TYPES, REPEAT_TYPES } from "@/utils/constants";

const recordStore = useRecordStore();

// 响应式数据
const formData = ref({
  moduleType: "todo",
  createTime: Date.now(),
  content: "",
  priority: "low",
  deadline: null,
  isRecurring: false,
  repeatType: "none",
  repeatInterval: 1,
  repeatDayOfWeek: null,
  repeatDayOfMonth: null,
});

// 合并TodoForm组件的响应式数据
const showDatePicker = ref(false);
const weekDays = ["一", "二", "三", "四", "五", "六", "日"];
const priorityTypes = computed(() => PRIORITY_TYPES);
const repeatTypes = computed(() => REPEAT_TYPES);

// 方法
const updateFormData = (key, value) => {
  // 添加调试日志
  console.log(`updateFormData called with key: ${key}, value:`, value);
  console.log(`value type: ${typeof value}`);

  // 处理不同类型的事件对象或直接值
  let processedValue = value;

  // 特别处理u-textarea的输入事件
  if (key === "content") {
    console.log("Processing content input...");

    // u-textarea组件的input事件对象结构
    if (value && typeof value === "object" && value.detail) {
      console.log("Event object with detail:", value.detail);

      // uni-app的u-textarea组件可能有不同的事件结构
      if (typeof value.detail === "string") {
        // 有些版本可能直接在detail中传递字符串
        processedValue = value.detail;
      } else if (value.detail.value !== undefined) {
        // 标准的uni-app组件事件结构
        processedValue = value.detail.value;
      } else {
        // 兜底方案，尝试将整个事件对象转换为字符串
        processedValue = JSON.stringify(value);
      }
    } else if (typeof value === "string") {
      // 直接传递字符串的情况
      processedValue = value;
    }
  }
  // 处理其他字段
  else if (value && typeof value === "object") {
    // 处理uni-app组件的事件对象
    if ("detail" in value && "value" in value.detail) {
      processedValue = value.detail.value;
    }
    // 处理Vue 3 v-model的事件对象
    else if ("value" in value) {
      processedValue = value.value;
    }
    // 其他情况保持原样
  }

  console.log(`processedValue for ${key}:`, processedValue);

  const newFormData = { ...formData.value, [key]: processedValue };

  // 当关闭循环事项时，重置所有循环相关字段
  if (key === "isRecurring" && !processedValue) {
    newFormData.repeatType = "none";
    newFormData.repeatInterval = 1;
    newFormData.repeatDayOfWeek = null;
    newFormData.repeatDayOfMonth = null;
  }

  console.log("Updating formData:", newFormData);
  formData.value = newFormData;
  console.log("formData after update:", formData.value);
};

// 合并TodoForm组件的方法
const updateDeadline = (value) => {
  updateFormData("deadline", value);
  showDatePicker.value = false;
};

const formatDeadline = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

const getRepeatIntervalUnit = (repeatType) => {
  const unitMap = {
    daily: "天",
    weekly: "周",
    monthly: "月",
    yearly: "年",
  };
  return unitMap[repeatType] || "天";
};

const getRecurringDescription = () => {
  if (!formData.value.isRecurring || !formData.value.repeatType) {
    return "";
  }

  const { repeatType, repeatInterval, repeatDayOfWeek, repeatDayOfMonth } =
    formData.value;

  if (repeatType === "none") {
    return "不重复";
  }

  let description = "";

  if (repeatInterval > 1) {
    description += `每${repeatInterval}${getRepeatIntervalUnit(repeatType)}`;
  } else {
    const typeMap = {
      daily: "每天",
      weekly: "每周",
      monthly: "每月",
      yearly: "每年",
    };
    description +=
      typeMap[repeatType] || "每" + getRepeatIntervalUnit(repeatType);
  }

  if (
    repeatType === "weekly" &&
    repeatDayOfWeek !== null &&
    repeatDayOfWeek !== undefined
  ) {
    description += `周${weekDays[repeatDayOfWeek]}`;
  }

  if (repeatType === "monthly" && repeatDayOfMonth) {
    description += `${repeatDayOfMonth}号`;
  }

  return description;
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

    // 处理表单数据
    processFormData();

    // 保存记录
    await recordStore.addRecord(formData.value);
    showToast("保存成功", "success");

    // setTimeout(() => {
    //   uni.navigateBack();
    // }, 1500);
  } catch (error) {
    console.error("保存记录失败:", error);
    showToast("保存失败，请重试", "error");
  }
};

const validateForm = () => {
  console.log(formData.value);
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
  if (formData.value.isRecurring && formData.value.repeatType !== "none") {
    if (
      formData.value.repeatType === "weekly" &&
      (formData.value.repeatDayOfWeek === null ||
        formData.value.repeatDayOfWeek === undefined)
    ) {
      showToast("请选择循环的具体星期", "none");
      return false;
    }
    if (
      formData.value.repeatType === "monthly" &&
      (!formData.value.repeatDayOfMonth ||
        formData.value.repeatDayOfMonth < 1 ||
        formData.value.repeatDayOfMonth > 31)
    ) {
      showToast("请选择有效的循环日期", "none");
      return false;
    }
  }
  return true;
};

const processFormData = () => {
  // 处理循环事项数据
  if (!formData.value.isRecurring) {
    // 如果不是循环事项，重置相关字段
    formData.value.repeatType = "none";
    formData.value.repeatInterval = 1;
    formData.value.repeatDayOfWeek = null;
    formData.value.repeatDayOfMonth = null;
  } else {
    // 确保数字字段是数字类型
    if (formData.value.repeatInterval)
      formData.value.repeatInterval = Number(formData.value.repeatInterval);
    if (formData.value.repeatDayOfMonth)
      formData.value.repeatDayOfMonth = Number(formData.value.repeatDayOfMonth);
  }
};
</script>

<style lang="scss" scoped>
.add-todo-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-top: 0;
  overflow: hidden;
}

.form-container {
  height: 100%;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 20rpx;
  padding: 30rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.cancel-button {
  flex: 1;
  height: 80rpx;
  background: #f5f5f5;
  border: none;
  border-radius: 12rpx;
}

.save-button {
  flex: 1;
  height: 80rpx;
  background: #ff6b9d;
  border: none;
  border-radius: 12rpx;
}

.button-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.save-button .button-text {
  color: white;
}

/* 合并TodoForm组件的样式 */
.todo-form {
  .form-item {
    margin-bottom: 30rpx;

    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 12rpx;
      font-weight: 500;
    }

    .deadline-input {
      border: 2rpx solid #e9ecef;
      border-radius: 12rpx;
      padding: 20rpx;
      background: white;
      transition: all 0.3s;

      &:active {
        border-color: #5856d6;
        background: rgba(88, 86, 214, 0.05);
      }

      .deadline-text {
        font-size: 28rpx;
        color: #333;

        &:empty::before {
          content: "选择截止时间（可选）";
          color: #999;
        }
      }
    }
  }

  .recurring-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }

  .recurring-settings {
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 20rpx;
    border: 2rpx solid #e9ecef;

    .form-item {
      margin-bottom: 20rpx;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .interval-selector {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .interval-unit {
      font-size: 26rpx;
      color: #666;
      font-weight: 500;
    }
  }

  .weekday-selector {
    display: flex;
    gap: 8rpx;
    justify-content: space-between;

    .weekday-item {
      flex: 1;
      padding: 16rpx 8rpx;
      text-align: center;
      border-radius: 8rpx;
      border: 2rpx solid #dee2e6;
      background: white;
      transition: all 0.3s;

      &.active {
        background: #5856d6;
        border-color: #5856d6;
        color: white;
      }

      .weekday-text {
        font-size: 24rpx;
        font-weight: 500;
      }
    }
  }

  .day-selector {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .day-unit {
      font-size: 26rpx;
      color: #666;
      font-weight: 500;
    }
  }

  .recurring-description {
    margin-top: 16rpx;
    padding: 16rpx;
    background: rgba(88, 86, 214, 0.1);
    border-radius: 8rpx;
    border: 2rpx solid rgba(88, 86, 214, 0.2);

    .desc-text {
      font-size: 26rpx;
      color: #5856d6;
      font-weight: 500;
    }
  }
}
</style>
