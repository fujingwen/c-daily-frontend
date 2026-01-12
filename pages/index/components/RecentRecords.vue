<template>
  <view class="recent-records">
    <view class="section-header">
      <text class="section-title">最近记录</text>
      <text class="section-more" @click="goToRecordList" :style="{ color: themeColors.primary }">查看全部</text>
    </view>

    <view class="record-list" v-if="recentRecords.length > 0">
      <view
        class="record-item"
        v-for="record in recentRecords"
        :key="record.recordId"
        @click="goToRecordDetail(record)"
      >
        <view class="record-icon-box" :style="{ background: '#f8f8f8' }">
          <text class="record-icon">{{ getModuleConfig(record.moduleType).icon }}</text>
        </view>
        <view class="record-content">
          <view class="record-top">
            <text class="module-name">{{ getModuleConfig(record.moduleType).name }}</text>
            <text class="record-time">{{ formatRelativeTime(record.createTime) }}</text>
          </view>
          <text class="record-detail">{{ getRecordSummary(record) }}</text>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-text">暂无记录，开始记录你的生活吧～</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { MODULE_CONFIG } from '@/utils/constants';
import { formatRelativeTime } from '@/utils';
import { useThemeStore } from "@/stores";

const props = defineProps({
  records: Array
});

const themeStore = useThemeStore();
const themeColors = computed(() => themeStore.currentThemeColors);

// 计算属性
const recentRecords = computed(() => {
  return props.records.slice(0, 5);
});

// 方法
const getModuleConfig = (type) => {
  return MODULE_CONFIG[type] || { name: "未知", icon: "❓", color: "#999" };
};

const getRecordSummary = (record) => {
  switch (record.moduleType) {
    case "mood":
      return `心情：${record.moodType} ${record.description || ""}`;
    case "weight":
      return `体重：${record.weightValue}kg`;
    case "milkTea":
      return `${record.name} - ${record.shop}`;
    case "account":
      return `${record.type === "income" ? "收入" : "支出"}：¥${record.amount}`;
    case "todo":
      return record.content;
    case "food":
      return `${record.foodName}${
        record.restaurant ? ` - ${record.restaurant}` : ""
      }`;
    case "keyword":
      return `关键字：${record.keywords?.join("、") || ""}`;
    case "exercise":
      return `${record.exerciseType} ${record.duration}分钟`;
    default:
      return "记录详情";
  }
};

const goToRecordDetail = (record) => {
  uni.navigateTo({
    url: `/pages/record/detail?id=${record.recordId}`,
  });
};

const goToRecordList = () => {
  uni.switchTab({
    url: "/pages/modules/modules",
  });
};
</script>

<style lang="scss" scoped>
.recent-records {
  padding: 0 20rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding: 0 4rpx;

    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }

    .section-more {
      font-size: 26rpx;
    }
  }

  .record-list {
    .record-item {
      background: white;
      border-radius: 20rpx;
      padding: 20rpx;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
      margin-bottom: 16rpx;
      display: flex;
      align-items: center;
      gap: 20rpx;
      
      .record-icon-box {
        width: 80rpx;
        height: 80rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .record-icon {
          font-size: 40rpx;
        }
      }
      
      .record-content {
        flex: 1;
        
        .record-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8rpx;
          
          .module-name {
            font-size: 26rpx;
            font-weight: bold;
            color: #333;
          }
          
          .record-time {
            font-size: 22rpx;
            color: #999;
          }
        }
        
        .record-detail {
          font-size: 24rpx;
          color: #666;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 500rpx;
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 80rpx 0;

    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>