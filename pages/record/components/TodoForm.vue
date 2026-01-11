<template>
  <view class="todo-form">
    <view class="form-item">
      <text class="form-label">待办内容</text>
      <u-textarea
        :value="formData.content"
        @input="updateFormData('content', $event)"
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
          v-if="['daily', 'weekly', 'monthly'].includes(formData.repeatType)"
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
</template>

<script setup>
import { computed, ref } from "vue";
import { PRIORITY_TYPES, REPEAT_TYPES } from "@/utils/constants";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:formData"]);

const showDatePicker = ref(false);

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

const priorityTypes = computed(() => PRIORITY_TYPES);
const repeatTypes = computed(() => REPEAT_TYPES);

const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

const updateFormData = (key, value) => {
  // 处理不同类型的事件对象或直接值
  let processedValue = value;
  if (value && typeof value === 'object') {
    // 处理uni-app组件的事件对象（如u-textarea）
    if ('detail' in value && 'value' in value.detail) {
      processedValue = value.detail.value;
    }
    // 处理Vue 3 v-model的事件对象
    else if ('value' in value) {
      processedValue = value.value;
    }
    // 其他情况保持原样
  }

  const newFormData = { ...props.formData, [key]: processedValue };

  // 当关闭循环事项时，重置所有循环相关字段
  if (key === "isRecurring" && !processedValue) {
    newFormData.repeatType = "none";
    newFormData.repeatInterval = 1;
    newFormData.repeatDayOfWeek = null;
    newFormData.repeatDayOfMonth = null;
  }

  emit("update:formData", newFormData);
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
  if (!props.formData.isRecurring || !props.formData.repeatType) {
    return "";
  }

  const { repeatType, repeatInterval, repeatDayOfWeek, repeatDayOfMonth } =
    props.formData;

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
</script>

<style lang="scss" scoped>
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
