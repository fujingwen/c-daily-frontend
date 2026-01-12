<template>
  <view class="modules-page">
    <!-- 数据统计 -->
    <view class="data-stats card">
      <view class="stats-content">
        <view class="stat-item">
          <text class="stat-value">{{ totalRecords }}</text>
          <text class="stat-label">总记录</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ todayRecords }}</text>
          <text class="stat-label">今日</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ weekRecords }}</text>
          <text class="stat-label">本周</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ monthRecords }}</text>
          <text class="stat-label">本月</text>
        </view>
      </view>
    </view>

    <!-- 模块列表 -->
    <view class="modules-container">
      <view 
        v-for="(group, groupKey) in moduleGroups" 
        :key="groupKey" 
        class="module-group"
      >
        <view class="group-header">
          <text class="group-title">{{ group.name }}</text>
        </view>
        
        <view class="module-grid">
          <view
            v-for="moduleType in group.modules"
            :key="moduleType"
            class="module-card"
            @click="goToModuleRecords(moduleType)"
          >
            <view class="module-icon" :style="{ backgroundColor: getModuleConfig(moduleType).color + '15' }">
              <text class="icon-emoji">{{ getModuleConfig(moduleType).icon }}</text>
            </view>
            <text class="module-name">{{ getModuleConfig(moduleType).name }}</text>
            <text class="module-count">{{ getModuleRecordCount(moduleType) }}条</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions card">
      <view class="actions-header">
        <text class="actions-title">快捷操作</text>
      </view>
      <view class="actions-grid">
        <view class="action-item" @click="goToAddRecord">
          <view class="action-icon primary">
            <u-icon name="plus" color="#fff" size="20"></u-icon>
          </view>
          <text class="action-name">新增记录</text>
        </view>
        <view class="action-item" @click="goToSearch">
          <view class="action-icon warning">
            <u-icon name="search" color="#fff" size="20"></u-icon>
          </view>
          <text class="action-name">搜索记录</text>
        </view>
        <view class="action-item" @click="exportData">
          <view class="action-icon success">
            <u-icon name="download" color="#fff" size="20"></u-icon>
          </view>
          <text class="action-name">导出数据</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRecordStore } from "@/stores";
import { MODULE_CONFIG, MODULE_GROUPS, MODULE_TYPES } from "@/utils/constants";
import {
  getTodayRange,
  getWeekRange,
  getMonthRange,
  showToast,
} from "@/utils";

const recordStore = useRecordStore();

// 计算属性
const moduleGroups = computed(() => MODULE_GROUPS);

const totalRecords = computed(() => recordStore.records.length);

const todayRecords = computed(() => {
  const { start, end } = getTodayRange();
  return recordStore.records.filter(
    (record) => record.createTime >= start && record.createTime <= end
  ).length;
});

const weekRecords = computed(() => {
  const { start, end } = getWeekRange();
  return recordStore.records.filter(
    (record) => record.createTime >= start && record.createTime <= end
  ).length;
});

const monthRecords = computed(() => {
  const { start, end } = getMonthRange();
  return recordStore.records.filter(
    (record) => record.createTime >= start && record.createTime <= end
  ).length;
});

// 方法
const getModuleConfig = (type) => {
  return MODULE_CONFIG[type] || { name: '未知', icon: '❓', color: '#999' };
};

const getModuleRecordCount = (type) => {
  return recordStore.records.filter((record) => record.moduleType === type)
    .length;
};

const goToModuleRecords = (type) => {
  // 根据不同模块类型跳转到对应的列表页
  switch (type) {
    case MODULE_TYPES.TODO:
      uni.navigateTo({ url: '/pages/todo/list' });
      break;
    case MODULE_TYPES.BIRTHDAY:
      uni.navigateTo({ url: '/pages/birthday/list' });
      break;
    case MODULE_TYPES.WISH:
      uni.navigateTo({ url: '/pages/shopping/list' });
      break;
    case MODULE_TYPES.RECIPE:
      uni.navigateTo({ url: '/pages/recipe/list' });
      break;
    case MODULE_TYPES.FOOD:
      // 美食推荐页可能没有列表页，或者就是推荐页
      uni.navigateTo({ url: '/pages/food/recommend' });
      break;
    default:
      // 其他通用模块跳转到通用记录列表
      uni.navigateTo({
        url: `/pages/record/list?module=${type}`,
      });
  }
};

const goToAddRecord = () => {
  uni.navigateTo({
    url: "/pages/record/add",
  });
};

const goToSearch = () => {
  uni.navigateTo({
    url: "/pages/record/list?search=true",
  });
};

const exportData = () => {
  showToast("导出功能开发中...", "none");
};

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();
});
</script>

<style lang="scss" scoped>
.modules-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
  padding-bottom: 40rpx;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.data-stats {
  .stats-content {
    display: flex;
    justify-content: space-between;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      
      .stat-value {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
      }
      
      .stat-label {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.modules-container {
  .module-group {
    margin-bottom: 32rpx;
    
    .group-header {
      margin-bottom: 20rpx;
      padding-left: 8rpx;
      border-left: 6rpx solid #3c9cff;
      line-height: 1;
      
      .group-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-left: 12rpx;
      }
    }
    
    .module-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20rpx;
      
      .module-card {
        background: #fff;
        border-radius: 20rpx;
        padding: 24rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
        transition: all 0.3s;
        
        &:active {
          transform: scale(0.96);
        }
        
        .module-icon {
          width: 80rpx;
          height: 80rpx;
          border-radius: 24rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16rpx;
          
          .icon-emoji {
            font-size: 40rpx;
          }
        }
        
        .module-name {
          font-size: 26rpx;
          color: #333;
          font-weight: 500;
          margin-bottom: 8rpx;
          text-align: center;
        }
        
        .module-count {
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }
}

.quick-actions {
  .actions-header {
    margin-bottom: 24rpx;
    
    .actions-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }
  }
  
  .actions-grid {
    display: flex;
    justify-content: space-around;
    
    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12rpx;
      
      .action-icon {
        width: 88rpx;
        height: 88rpx;
        border-radius: 24rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        
        &.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 8rpx 16rpx rgba(102, 126, 234, 0.3);
        }
        
        &.warning {
          background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
          box-shadow: 0 8rpx 16rpx rgba(246, 211, 101, 0.3);
        }
        
        &.success {
          background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
          box-shadow: 0 8rpx 16rpx rgba(132, 250, 176, 0.3);
        }
        
        &:active {
          transform: scale(0.9);
        }
      }
      
      .action-name {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}
</style>
