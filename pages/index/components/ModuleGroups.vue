<template>
  <view class="modules-section">
    <!-- 今日打卡 -->
    <view class="module-group" v-if="!isModuleGroupCompletelyHidden('dailyCheckIn')">
      <view class="checkin-card">
        <view class="checkin-header">
          <view class="header-left">
            <text class="checkin-icon">🌟</text>
            <text class="checkin-title">今日打卡</text>
          </view>
          <view class="header-right">
            <text class="checkin-progress">{{ getTodayCheckInCount }}/{{ dailyCheckInModules.length }}</text>
            <view class="hide-button" @click.stop="handleModuleHideWithConfirm('dailyCheckIn')">
              <text class="hide-text">✕</text>
            </view>
          </view>
        </view>

        <!-- 打卡模块网格 -->
        <view class="module-grid">
          <view
            v-for="type in dailyCheckInModules"
            :key="type"
            class="module-item"
            :class="{ checked: isTodayChecked(type) }"
            @click="goToAddRecord(type)"
          >
            <view
              class="module-icon"
              :style="{ backgroundColor: getModuleConfig(type).color }"
            >
              <text class="icon-text">{{ getModuleConfig(type).icon }}</text>
              <!-- 完成标记 -->
              <view v-if="isTodayChecked(type)" class="check-badge">
                <text class="check-text">✓</text>
              </view>
            </view>
            <text class="module-name" :class="{ checked: isTodayChecked(type) }">
              {{ getModuleConfig(type).name }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 生活记录 -->
    <view class="module-group" v-if="!isModuleGroupCompletelyHidden('lifeRecord')">
      <view class="group-card">
        <view class="group-header">
          <view class="group-title">
            <text class="title-text">📋 生活记录</text>
          </view>
          <view class="header-actions">
            <view class="hide-button" @click.stop="handleModuleHideWithConfirm('lifeRecord')">
              <text class="hide-text">✕</text>
            </view>
          </view>
        </view>

        <view class="module-grid">
          <view
            v-for="type in lifeRecordModules"
            :key="type"
            class="module-item"
            @click="goToAddRecord(type)"
          >
            <view
              class="module-icon"
              :style="{ backgroundColor: getModuleConfig(type).color }"
            >
              <text class="icon-text">{{ getModuleConfig(type).icon }}</text>
            </view>
            <text class="module-name">{{ getModuleConfig(type).name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 美食相关 -->
    <view class="module-group" v-if="!isModuleGroupCompletelyHidden('foodRelated')">
      <view class="group-card">
        <view class="group-header">
          <view class="group-title">
            <text class="title-text">🍽️ 美食相关</text>
          </view>
          <view class="header-actions">
            <view class="hide-button" @click.stop="handleModuleHideWithConfirm('foodRelated')">
              <text class="hide-text">✕</text>
            </view>
          </view>
        </view>

        <view class="module-grid">
          <view
            v-for="type in foodRelatedModules"
            :key="type"
            class="module-item"
            @click="goToAddRecord(type)"
          >
            <view
              class="module-icon"
              :style="{ backgroundColor: getModuleConfig(type).color }"
            >
              <text class="icon-text">{{ getModuleConfig(type).icon }}</text>
            </view>
            <text class="module-name">{{ getModuleConfig(type).name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 计划提醒 -->
    <view class="module-group" v-if="!isModuleGroupCompletelyHidden('planReminder')">
      <view class="group-card">
        <view class="group-header">
          <view class="group-title">
            <text class="title-text">📅 计划提醒</text>
          </view>
          <view class="header-actions">
            <view class="hide-button" @click.stop="handleModuleHideWithConfirm('planReminder')">
              <text class="hide-text">✕</text>
            </view>
          </view>
        </view>

        <view class="module-grid">
          <view
            v-for="type in planReminderModules"
            :key="type"
            class="module-item"
            @click="goToAddRecord(type)"
          >
            <view
              class="module-icon"
              :style="{ backgroundColor: getModuleConfig(type).color }"
            >
              <text class="icon-text">{{ getModuleConfig(type).icon }}</text>
            </view>
            <text class="module-name">{{ getModuleConfig(type).name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 隐藏模块的悬浮按钮 -->
    <template
      v-for="groupKey in hiddenModuleGroups"
      :key="`floating-${groupKey}`"
    >
      <FloatingButton
        :visible="true"
        :module-config="{
          type: groupKey,
          name: MODULE_GROUPS[groupKey].name,
          icon: MODULE_GROUPS[groupKey].icon,
          color: MODULE_GROUPS[groupKey].color,
        }"
        :on-click="() => handleModuleShow(groupKey)"
      />
    </template>

    <!-- 显示所有模块按钮 -->
    <ShowAllModulesButton
      :visible="moduleVisibilityStore.hasHiddenModules"
      :hidden-count="moduleVisibilityStore.hiddenModulesCount"
      :on-click="handleShowAllModules"
    />
  </view>
</template>

<script setup>
import { computed } from "vue";
import { MODULE_CONFIG, MODULE_GROUPS } from "@/utils/constants";
import { getTodayRange } from "@/utils";
import FloatingButton from "@/components/FloatingButton.vue";
import ShowAllModulesButton from "@/components/ShowAllModulesButton.vue";
import { vibrate } from "@/utils/hapticFeedback.js";

const props = defineProps({
  records: Array,
  moduleVisibilityStore: Object,
});

const emit = defineEmits(["module-hide", "module-show", "show-all-modules"]);

// 模块分组
const dailyCheckInModules = computed(() => MODULE_GROUPS.dailyCheckIn.modules);
const lifeRecordModules = computed(() => MODULE_GROUPS.lifeRecord.modules);
const foodRelatedModules = computed(() => MODULE_GROUPS.foodRelated.modules);
const planReminderModules = computed(() => MODULE_GROUPS.planReminder.modules);

// 隐藏的模块组
const hiddenModuleGroups = computed(() => {
  return Object.keys(MODULE_GROUPS).filter((groupKey) =>
    isModuleGroupCompletelyHidden(groupKey)
  );
});

// 今日打卡状态
const todayCheckInStatus = computed(() => {
  const { start, end } = getTodayRange();
  const status = {};

  dailyCheckInModules.value.forEach((moduleType) => {
    const hasRecord = props.records.some(
      (record) =>
        record.moduleType === moduleType &&
        record.createTime >= start &&
        record.createTime <= end
    );
    status[moduleType] = hasRecord;
  });

  return status;
});

// 今日打卡数量
const getTodayCheckInCount = computed(() => {
  return Object.values(todayCheckInStatus.value).filter(Boolean).length;
});

// 方法
const getModuleConfig = (type) => {
  return MODULE_CONFIG[type] || { name: "未知", icon: "❓", color: "#999" };
};

const isTodayChecked = (moduleType) => {
  return todayCheckInStatus.value[moduleType] || false;
};

const isModuleGroupCompletelyHidden = (groupKey) => {
  return props.moduleVisibilityStore.isModuleHidden(groupKey);
};

const goToAddRecord = (moduleType) => {
  if (moduleType === "food") {
    uni.navigateTo({
      url: "/pages/food/recommend",
    });
  } else if (moduleType === "recipe") {
    uni.navigateTo({
      url: "/pages/recipe/list",
    });
  } else if (moduleType === "wish") {
    uni.navigateTo({
      url: "/pages/shopping/list",
    });
  } else if (moduleType === "todo") {
    // 对于待办事项，直接跳转到专门的添加页面
    uni.navigateTo({
      url: "/pages/todo/add",
    });
  } else {
    // 对于其他模块，使用原有的跳转方式
    uni.setStorageSync('addRecordType', moduleType);
    uni.navigateTo({
      url: "/pages/record/add",
    });
  }
};

const handleModuleHide = async (groupKey) => {
  emit("module-hide", groupKey);
};

const handleModuleShow = async (groupKey) => {
  emit("module-show", groupKey);
};

const handleShowAllModules = async () => {
  emit("show-all-modules");
};

const handleModuleHideWithConfirm = async (groupKey) => {
  try {
    vibrate.light();
    const groupName = MODULE_GROUPS[groupKey]?.name || "该模块组";

    const result = await new Promise((resolve) => {
      uni.showModal({
        title: "确认隐藏",
        content: `确定要隐藏"${groupName}"吗？隐藏后可以通过悬浮按钮或"显示所有模块"按钮恢复。`,
        confirmText: "隐藏",
        cancelText: "取消",
        success: (res) => {
          resolve(res.confirm);
        },
        fail: () => {
          resolve(false);
        },
      });
    });

    if (result) {
      vibrate.medium();
      await handleModuleHide(groupKey);
      uni.showToast({
        title: "已隐藏",
        icon: "success",
      });
    }
  } catch (error) {
    console.error("隐藏模块组失败:", error);
    vibrate.error();
    uni.showToast({
      title: "操作失败，请重试",
      icon: "none",
    });
  }
};
</script>

<style lang="scss" scoped>
.modules-section {
  padding: 0 20rpx 20rpx 20rpx;

  .module-group {
    margin-bottom: 20rpx;
  }

  // 今日打卡卡片样式
  .checkin-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

    .checkin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .checkin-icon {
          font-size: 24rpx;
        }

        .checkin-title {
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .checkin-progress {
          font-size: 24rpx;
          color: #ff6b9d;
          font-weight: bold;
        }

        .hide-button {
          width: 56rpx;
          height: 56rpx;
          border-radius: 50%;
          border: 2rpx solid #ff3b30;
          display: flex;
          align-items: center;
          justify-content: center;

          .hide-text {
            font-size: 20rpx;
            color: #ff3b30;
            font-weight: bold;
          }
        }
      }
    }
  }

  .group-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  }

  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .group-title {
      .title-text {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .count-text {
        font-size: 24rpx;
        color: #ff6b9d;
        font-weight: bold;
      }

      .hide-button {
        width: 56rpx;
        height: 56rpx;
        border-radius: 50%;
        border: 2rpx solid #ff3b30;
        display: flex;
        align-items: center;
        justify-content: center;

        .hide-text {
          font-size: 20rpx;
          color: #ff3b30;
          font-weight: bold;
        }
      }
    }
  }

  .module-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .module-item {
      width: calc((100% - 64rpx) / 5);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx 8rpx;
      border-radius: 16rpx;
      transition: all 0.3s;
      position: relative;

      &.checked {
        background: rgba(102, 126, 234, 0.1);
      }

      &:active {
        transform: scale(0.95);
      }

      .module-icon {
        width: 70rpx;
        height: 70rpx;
        border-radius: 18rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10rpx;
        position: relative;

        .icon-text {
          font-size: 32rpx;
        }

        .check-badge {
          position: absolute;
          top: -8rpx;
          right: -8rpx;
          width: 24rpx;
          height: 24rpx;
          border-radius: 50%;
          background: #34c759;
          display: flex;
          align-items: center;
          justify-content: center;

          .check-text {
            font-size: 16rpx;
            color: white;
            font-weight: bold;
          }
        }
      }

      .module-name {
        font-size: 22rpx;
        color: #333;
        text-align: center;

        &.checked {
          color: #667eea;
        }
      }
    }
  }
}
</style>