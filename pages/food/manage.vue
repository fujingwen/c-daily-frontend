<template>
  <view class="manage-food-page">
    <view class="header">
      <text class="title">菜单管理</text>
      <text class="subtitle">管理您的自定义美食选项</text>
    </view>

    <view class="meal-tabs">
      <view 
        v-for="meal in mealTypes" 
        :key="meal.value"
        class="tab-item"
        :class="{ active: currentTab === meal.value }"
        @click="currentTab = meal.value"
      >
        <text class="tab-emoji">{{ meal.emoji }}</text>
        <text class="tab-label">{{ meal.label }}</text>
      </view>
    </view>

    <view class="food-list-container">
      <view v-if="currentFoods.length > 0" class="food-list">
        <view 
          v-for="(food, index) in currentFoods" 
          :key="index"
          class="food-item card"
        >
          <text class="food-name">{{ food }}</text>
          <view class="delete-btn" @click="deleteFood(index)">
            <u-icon name="trash" color="#ff3b30" size="20"></u-icon>
          </view>
        </view>
      </view>
      
      <view v-else class="empty-state">
        <text class="empty-emoji">🍽️</text>
        <text class="empty-text">暂无自定义菜单</text>
        <text class="empty-desc">去添加一些您喜欢的食物吧</text>
      </view>
    </view>
    
    <view class="footer-actions">
      <button class="btn-add" @click="goBack">返回添加</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { MEAL_TYPES } from '@/utils/constants';

const currentTab = ref('lunch');
const customFoods = ref({});

const mealTypes = computed(() => MEAL_TYPES);

const currentFoods = computed(() => {
  return customFoods.value[currentTab.value] || [];
});

const loadCustomFoods = () => {
  try {
    const saved = uni.getStorageSync('customFoods');
    if (saved) {
      customFoods.value = JSON.parse(saved);
    }
  } catch (e) {
    console.error('加载自定义食物失败', e);
  }
};

const deleteFood = (index) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${currentFoods.value[index]}"吗？`,
    success: (res) => {
      if (res.confirm) {
        const foods = customFoods.value[currentTab.value];
        foods.splice(index, 1);
        
        // 更新本地存储
        uni.setStorageSync('customFoods', JSON.stringify(customFoods.value));
        uni.showToast({ title: '已删除', icon: 'none' });
      }
    }
  });
};

const goBack = () => {
  uni.navigateBack();
};

onMounted(() => {
  loadCustomFoods();
});
</script>

<style lang="scss" scoped>
.manage-food-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: white;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
  
  .title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
  }
  
  .subtitle {
    font-size: 26rpx;
    color: #999;
  }
}

.meal-tabs {
  display: flex;
  background: white;
  padding: 20rpx;
  margin-bottom: 20rpx;
  overflow-x: auto;
  
  .tab-item {
    flex: 1;
    min-width: 140rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx 0;
    margin: 0 8rpx;
    border-radius: 16rpx;
    transition: all 0.3s;
    
    &.active {
      background: #e6f7ff;
      
      .tab-label {
        color: #007aff;
        font-weight: bold;
      }
    }
    
    .tab-emoji {
      font-size: 32rpx;
      margin-bottom: 8rpx;
    }
    
    .tab-label {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.food-list {
  padding: 0 24rpx;
  
  .food-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 30rpx;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    
    .food-name {
      font-size: 30rpx;
      color: #333;
    }
    
    .delete-btn {
      padding: 10rpx;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100rpx;
  
  .empty-emoji {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }
  
  .empty-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 12rpx;
  }
  
  .empty-desc {
    font-size: 26rpx;
    color: #999;
  }
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: white;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  
  .btn-add {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    background: #007aff;
    color: white;
    border-radius: 40rpx;
    font-size: 30rpx;
    border: none;
    
    &:active {
      opacity: 0.9;
    }
  }
}
</style>
