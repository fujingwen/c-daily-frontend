<template>
  <view class="modules-section">
    <!-- 今日打卡 -->
    <view class="module-group" v-if="!isModuleGroupCompletelyHidden('dailyCheckIn')">
      <view class="group-header">
        <text class="group-title">今日打卡</text>
        <view class="header-right">
          <text class="progress-text" :style="{ color: themeColors.primary }">{{ getTodayCheckInCount }}/{{ dailyCheckInModules.length }}</text>
          <view class="hide-icon" @click.stop="handleModuleHideWithConfirm('dailyCheckIn')">✕</view>
        </view>
      </view>

      <view class="module-grid">
        <view
          v-for="type in dailyCheckInModules"
          :key="type"
          class="module-item"
          :class="{ checked: isTodayChecked(type) }"
          :style="{ 
            background: isTodayChecked(type) ? adjustOpacity(themeColors.primary, 0.1) : '#f8f8f8',
            borderColor: isTodayChecked(type) ? adjustOpacity(themeColors.primary, 0.3) : 'transparent'
          }"
          @click="goToAddRecord(type)"
        >
          <view class="module-icon">
            <text class="icon-text">{{ getModuleConfig(type).icon }}</text>
            <view v-if="isTodayChecked(type)" class="check-badge" :style="{ background: themeColors.success }">✓</view>
          </view>
          <text class="module-name" :style="{ color: isTodayChecked(type) ? themeColors.primary : '#666' }">
            {{ getModuleConfig(type).name }}
          </text>
        </view>
      </view>
    </view>

    <!-- 生活记录 -->
    <view class="module-group" v-if="!isModuleGroupCompletelyHidden('lifeRecord')">
      <view class="group-header">
        <text class="group-title">生活记录</text>
        <view class="hide-icon" @click.stop="handleModuleHideWithConfirm('lifeRecord')">✕</view>
      </view>

      <view class="module-grid">
        <view
          v-for="type in lifeRecordModules"
          :key="type"
          class="module-item"
          style="background: #f8f8f8;"
          @click="goToAddRecord(type)"
        >
          <view class="module-icon">
            <text class="icon-text">{{ getModuleConfig(type).icon }}</text>
          </view>
          <text class="module-name">{{ getModuleConfig(type).name }}</text>
        </view>
      </view>
    </view>

    <!-- 美食相关 -->
    <view class="module-group" v-if="!isModuleGroupCompletelyHidden('foodRelated')">
      <view class="group-header">
        <text class="group-title">美食相关</text>
        <view class="hide-icon" @click.stop="handleModuleHideWithConfirm('foodRelated')">✕</view>
      </view>

      <view class="module-grid">
        <view
          v-for="type in foodRelatedModules"
          :key="type"
          class="module-item"
          style="background: #f8f8f8;"
          @click="goToAddRecord(type)"
        >
          <view class="module-icon">
            <text class="icon-text">{{ getModuleConfig(type).icon }}</text>
          </view>
          <text class="module-name">{{ getModuleConfig(type).name }}</text>
        </view>
      </view>
    </view>

    <!-- 计划提醒 -->
    <view class="module-group" v-if="!isModuleGroupCompletelyHidden('planReminder')">
      <view class="group-header">
        <text class="group-title">计划提醒</text>
        <view class="hide-icon" @click.stop="handleModuleHideWithConfirm('planReminder')">✕</view>
      </view>

      <view class="module-grid">
        <view
          v-for="type in planReminderModules"
          :key="type"
          class="module-item"
          style="background: #f8f8f8;"
          @click="goToAddRecord(type)"
        >
          <view class="module-icon">
            <text class="icon-text">{{ getModuleConfig(type).icon }}</text>
          </view>
          <text class="module-name">{{ getModuleConfig(type).name }}</text>
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
import { useThemeStore } from "@/stores";

const props = defineProps({
  records: Array,
  moduleVisibilityStore: Object,
});

const emit = defineEmits(["module-hide", "module-show", "show-all-modules", "item-click"]);
const themeStore = useThemeStore();
const themeColors = computed(() => themeStore.currentThemeColors);

// 辅助函数
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
  emit('item-click');
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
    background: #fff;
    border-radius: 24rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
    
    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;
      
      .group-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }
      
      .header-right {
        display: flex;
        align-items: center;
        gap: 16rpx;
        
        .progress-text {
          font-size: 24rpx;
          font-weight: bold;
        }
        
        .hide-icon {
          font-size: 24rpx;
          color: #ccc;
          padding: 8rpx;
        }
      }
      
      .hide-icon {
        font-size: 24rpx;
        color: #ccc;
        padding: 8rpx;
      }
    }
    
    .module-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20rpx;
      
      .module-item {
        aspect-ratio: 1;
        border-radius: 24rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        transition: all 0.3s;
        border: 2rpx solid transparent;
        
        .module-icon {
          width: auto;
          height: auto;
          background: transparent;
          margin-bottom: 16rpx;
          position: relative;
          
          .icon-text {
            font-size: 56rpx;
            line-height: 1;
          }
          
          .check-badge {
            position: absolute;
            top: -6rpx;
            right: -16rpx;
            width: 32rpx;
            height: 32rpx;
            border-radius: 50%;
            color: #fff;
            font-size: 20rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2rpx solid #fff;
            box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
          }
        }
        
        .module-name {
          font-size: 26rpx;
          color: #666;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 90%;
          font-weight: 500;
        }
        
        &:active {
          transform: scale(0.96);
          opacity: 0.9;
        }
      }
    }
  }
}
</style>