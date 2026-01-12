<template>
  <view class="food-recommend-page">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">今天吃什么？</text>
      <text class="subtitle">让转盘帮你解决选择困难症</text>
    </view>

    <!-- 餐次选择 -->
    <view class="meal-selector card">
      <view class="selector-header">
        <view class="selector-title">选择餐次</view>
        <view class="add-btn" @click="openAddModal">
          <text class="add-icon">+</text>
          <text class="add-text">添加选项</text>
        </view>
      </view>
      <view class="meal-options">
        <view
          v-for="meal in mealTypes"
          :key="meal.value"
          class="meal-option"
          :class="{ active: selectedMeal === meal.value }"
          @click="selectMeal(meal.value)"
        >
          <text class="meal-emoji">{{ meal.emoji }}</text>
          <text class="meal-label">{{ meal.label }}</text>
        </view>
      </view>
    </view>

    <!-- 转盘抽取 -->
    <view class="roulette-section card">
      <view class="roulette-header">
        <text class="roulette-title">🎯 美食转盘</text>
        <text class="roulette-subtitle">让转盘帮你决定吃什么</text>
      </view>

      <view class="roulette-container">
        <view class="roulette-wrapper">
          <view
            class="roulette-wheel"
            :class="{ spinning: isSpinning }"
            :style="{ 
              transform: `rotate(${rotation}deg)`,
              background: wheelGradient
            }"
          >
            <view
              v-for="(food, index) in wheelFoods"
              :key="index"
              class="roulette-item"
              :style="{
                transform: `rotate(${index * (360 / wheelFoods.length) + (360 / wheelFoods.length / 2)}deg) translateY(-140rpx)`,
              }"
            >
              <text class="food-text">{{ food }}</text>
            </view>
          </view>
          <!-- 中心装饰 -->
          <view class="wheel-center">
            <view class="center-dot"></view>
          </view>
        </view>
        <view class="roulette-pointer"></view>
      </view>

      <view class="roulette-actions">
        <button
          class="spin-btn"
          :class="{ spinning: isSpinning }"
          @click="spinWheel"
          :disabled="isSpinning"
        >
          <text class="spin-text">{{
            isSpinning ? "转盘转动中..." : "开始转盘"
          }}</text>
        </button>
      </view>
    </view>

    <!-- 推荐结果 -->
    <view v-if="recommendedFood" class="recommendation card">
      <view class="recommendation-header">
        <text class="recommendation-title">🎉 今天就吃这个</text>
        <view class="refresh-btn" @click="spinWheel">
          <text class="refresh-icon">🎲</text>
          <text class="refresh-text">再转一次</text>
        </view>
      </view>

      <view class="food-result">
        <view class="food-icon">{{ getFoodEmoji(recommendedFood) }}</view>
        <text class="food-name">{{ recommendedFood }}</text>
        <view class="food-actions">
          <button class="btn btn-primary" @click="recordFood">记录这餐</button>
          <button class="btn btn-secondary" @click="searchNearby">
            附近餐厅
          </button>
        </view>
      </view>
    </view>

    <!-- 快速选择 -->
    <view class="quick-actions">
      <button
        class="quick-btn random-btn"
        @click="quickRandom"
        :disabled="!selectedMeal"
      >
        <text class="btn-icon">🎲</text>
        <text class="btn-text">快速随机</text>
      </button>

      <button class="quick-btn history-btn" @click="goToHistory">
        <text class="btn-icon">📋</text>
        <text class="btn-text">用餐记录</text>
      </button>
      
      <button class="quick-btn manage-btn" @click="goToManageFoods">
        <text class="btn-icon">⚙️</text>
        <text class="btn-text">管理菜单</text>
      </button>
    </view>

    <!-- 最近记录 -->
    <view v-if="recentFoodRecords.length > 0" class="recent-records">
      <view class="section-header">
        <text class="section-title">最近用餐</text>
        <text class="section-more" @click="goToHistory">查看全部</text>
      </view>

      <view class="record-list">
        <view
          v-for="record in recentFoodRecords.slice(0, 3)"
          :key="record.recordId"
          class="record-item card"
          @click="goToRecordDetail(record)"
        >
          <view class="record-header">
            <view class="meal-info">
              <text class="meal-emoji">{{
                getMealEmoji(record.mealType)
              }}</text>
              <text class="meal-name">{{ record.foodName }}</text>
            </view>
            <text class="record-time">{{
              formatRelativeTime(record.createTime)
            }}</text>
          </view>
          <view class="record-details">
            <text v-if="record.restaurant" class="restaurant"
              >📍 {{ record.restaurant }}</text
            >
            <view v-if="record.rating" class="rating">
              <text
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= record.rating }"
                >⭐</text
              >
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 食物分类快捷入口 -->
    <view class="food-categories">
      <view class="section-header">
        <text class="section-title">按分类选择</text>
      </view>

      <view class="category-grid">
        <view
          v-for="category in foodCategories"
          :key="category.name"
          class="category-item"
          @click="selectCategory(category)"
        >
          <text class="category-icon">{{ category.icon }}</text>
          <text class="category-name">{{ category.name }}</text>
        </view>
      </view>
    </view>

    <!-- 添加食物弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加美食选项</text>
          <text class="modal-close" @click="closeAddModal">✕</text>
        </view>
        <view class="modal-body">
          <view class="input-group">
            <text class="label">餐次</text>
            <view class="meal-tags">
              <view 
                v-for="meal in mealTypes" 
                :key="meal.value"
                class="meal-tag"
                :class="{ active: addForm.mealTypes.includes(meal.value) }"
                @click="toggleMealType(meal.value)"
              >
                {{ meal.label }}
              </view>
            </view>
          </view>
          <view class="input-group">
            <text class="label">食物名称</text>
            <input 
              class="food-input"
              v-model="addForm.name" 
              placeholder="请输入食物名称，如：黄焖鸡米饭"
              :focus="true"
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="closeAddModal">取消</button>
          <button class="btn-confirm" @click="confirmAddFood">确定添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useRecordStore } from "@/stores";
import {
  MEAL_TYPES,
  FOOD_RECOMMENDATIONS,
  MODULE_TYPES,
} from "@/utils/constants";
import { formatRelativeTime } from "@/utils";

const recordStore = useRecordStore();

// 响应式数据
const selectedMeal = ref("lunch");
const recommendedFood = ref("");
const isSpinning = ref(false);
const rotation = ref(0);
const customFoods = ref({}); // 存储自定义食物 { breakfast: [], lunch: [], ... }
const showAddModal = ref(false);
const addForm = reactive({
  mealTypes: ['lunch'], // 改为数组支持多选
  name: ''
});

// 计算属性
const mealTypes = computed(() => MEAL_TYPES);

const recentFoodRecords = computed(() => {
  return recordStore.records
    .filter((record) => record.moduleType === MODULE_TYPES.FOOD)
    .slice(0, 5);
});

const wheelFoods = computed(() => {
  if (!selectedMeal.value) return [];
  
  // 获取默认推荐
  const defaultFoods = FOOD_RECOMMENDATIONS[selectedMeal.value] || [];
  // 获取自定义食物
  const myFoods = customFoods.value[selectedMeal.value] || [];
  
  // 合并并去重
  const allFoods = [...new Set([...myFoods, ...defaultFoods])];
  
  // 如果数量太多，随机取12个，优先保留自定义的
  if (allFoods.length > 12) {
    const others = allFoods.filter(f => !myFoods.includes(f));
    // 打乱默认食物
    const shuffledOthers = others.sort(() => 0.5 - Math.random());
    return [...myFoods, ...shuffledOthers].slice(0, 12);
  }
  
  return allFoods;
});

const wheelGradient = computed(() => {
  if (wheelFoods.value.length === 0) return '#ddd';
  
  const colors = [
    "#ff6b9d", "#ff9f43", "#10ac84", "#5f27cd", 
    "#00d2d3", "#ff3838", "#2e86de", "#f368e0",
    "#54a0ff", "#5f27cd", "#ff9f43", "#ee5253"
  ];
  
  const anglePerItem = 360 / wheelFoods.value.length;
  let gradient = 'conic-gradient(';
  
  wheelFoods.value.forEach((_, index) => {
    const color = colors[index % colors.length];
    const startAngle = index * anglePerItem;
    const endAngle = (index + 1) * anglePerItem;
    gradient += `${color} ${startAngle}deg ${endAngle}deg,`;
  });
  
  return gradient.slice(0, -1) + ')';
});

const foodCategories = computed(() => [
  {
    name: "中餐",
    icon: "🥢",
    foods: ["宫保鸡丁", "红烧肉", "麻婆豆腐", "糖醋里脊", "鱼香肉丝"],
  },
  {
    name: "西餐",
    icon: "🍝",
    foods: ["意大利面", "牛排", "汉堡", "披萨", "沙拉"],
  },
  {
    name: "日料",
    icon: "🍣",
    foods: ["寿司", "拉面", "天妇罗", "日式咖喱", "鳗鱼饭"],
  },
  {
    name: "韩料",
    icon: "🍲",
    foods: ["韩式拌饭", "烤肉", "泡菜汤", "炸鸡", "冷面"],
  },
  {
    name: "快餐",
    icon: "🍔",
    foods: ["汉堡", "炸鸡", "薯条", "热狗", "三明治"],
  },
  {
    name: "火锅",
    icon: "🍲",
    foods: ["四川火锅", "清汤火锅", "麻辣烫", "关东煮", "小火锅"],
  },
]);

// 方法
const selectMeal = (mealType) => {
  selectedMeal.value = mealType;
  recommendedFood.value = "";
};

const openAddModal = () => {
  addForm.mealTypes = [selectedMeal.value || 'lunch'];
  addForm.name = '';
  showAddModal.value = true;
};

const toggleMealType = (type) => {
  const index = addForm.mealTypes.indexOf(type);
  if (index > -1) {
    // 如果已经选中且不是最后一个，则移除
    if (addForm.mealTypes.length > 1) {
      addForm.mealTypes.splice(index, 1);
    } else {
      uni.showToast({ title: '至少选择一个餐次', icon: 'none' });
    }
  } else {
    // 如果未选中，则添加
    addForm.mealTypes.push(type);
  }
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const confirmAddFood = () => {
  if (!addForm.name.trim()) {
    uni.showToast({ title: '请输入食物名称', icon: 'none' });
    return;
  }
  
  if (addForm.mealTypes.length === 0) {
    uni.showToast({ title: '请至少选择一个餐次', icon: 'none' });
    return;
  }
  
  let addedCount = 0;
  
  addForm.mealTypes.forEach(type => {
    if (!customFoods.value[type]) {
      customFoods.value[type] = [];
    }
    
    // 检查是否重复
    if (!customFoods.value[type].includes(addForm.name)) {
      // 添加到列表头部
      customFoods.value[type].unshift(addForm.name);
      addedCount++;
    }
  });
  
  if (addedCount > 0) {
    // 保存到本地存储
    uni.setStorageSync('customFoods', JSON.stringify(customFoods.value));
    uni.showToast({ title: `成功添加到${addedCount}个餐次`, icon: 'success' });
    closeAddModal();
    
    // 如果当前选中的是添加的餐次之一，重置转盘
    if (addForm.mealTypes.includes(selectedMeal.value)) {
      recommendedFood.value = "";
    }
  } else {
    uni.showToast({ title: '该食物在所选餐次中已存在', icon: 'none' });
  }
};

const goToManageFoods = () => {
  uni.navigateTo({
    url: '/pages/food/manage'
  });
};

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

const spinWheel = () => {
  if (isSpinning.value || !selectedMeal.value || wheelFoods.value.length === 0)
    return;

  isSpinning.value = true;

  // 随机旋转角度 (至少转3圈)
  const randomAngle = Math.random() * 360;
  const spins = 3 + Math.random() * 2; // 3-5圈
  const totalRotation = spins * 360 + randomAngle;

  rotation.value += totalRotation;

  // 计算最终停在哪个食物上
  const finalAngle = rotation.value % 360;
  const itemAngle = 360 / wheelFoods.value.length;
  const selectedIndex =
    Math.floor((360 - finalAngle + itemAngle / 2) / itemAngle) %
    wheelFoods.value.length;

  setTimeout(() => {
    isSpinning.value = false;
    recommendedFood.value = wheelFoods.value[selectedIndex];

    // 震动反馈
    uni.vibrateShort();

    // 显示结果提示
    uni.showToast({
      title: `🎉 ${recommendedFood.value}`,
      icon: "none",
      duration: 2000,
    });
  }, 3000);
};

const quickRandom = () => {
  if (!selectedMeal.value) return;

  // 使用当前的 wheelFoods 池子，这样也包含了自定义食物
  const foods = wheelFoods.value;
  if (foods && foods.length > 0) {
    const randomIndex = Math.floor(Math.random() * foods.length);
    recommendedFood.value = foods[randomIndex];

    uni.showToast({
      title: `🎲 ${recommendedFood.value}`,
      icon: "none",
    });
  }
};

const selectCategory = (category) => {
  const randomIndex = Math.floor(Math.random() * category.foods.length);
  recommendedFood.value = category.foods[randomIndex];

  uni.showToast({
    title: `${category.icon} ${recommendedFood.value}`,
    icon: "none",
  });
};

const getItemColor = (index) => {
  const colors = [
    "#ff6b9d",
    "#ff9f43",
    "#10ac84",
    "#5f27cd",
    "#00d2d3",
    "#ff3838",
    "#2e86de",
    "#f368e0",
  ];
  return colors[index % colors.length];
};

const getFoodEmoji = (foodName) => {
  const emojiMap = {
    火锅: "🍲",
    烧烤: "🍖",
    寿司: "🍣",
    拉面: "🍜",
    汉堡: "🍔",
    披萨: "🍕",
    意大利面: "🍝",
    牛排: "🥩",
    炸鸡: "🍗",
    薯条: "🍟",
    三明治: "🥪",
    沙拉: "🥗",
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (foodName.includes(key)) return emoji;
  }

  return "🍽️";
};

const recordFood = () => {
  if (!recommendedFood.value) return;

  uni.navigateTo({
    url: `/pages/record/add?type=${
      MODULE_TYPES.FOOD
    }&foodName=${encodeURIComponent(recommendedFood.value)}&mealType=${
      selectedMeal.value
    }`,
  });
};

const searchNearby = () => {
  if (!recommendedFood.value) return;

  uni.showToast({
    title: "正在搜索附近餐厅...",
    icon: "loading",
  });

  setTimeout(() => {
    uni.showModal({
      title: "附近餐厅",
      content: `为您找到3家提供"${recommendedFood.value}"的餐厅`,
      confirmText: "查看",
      success: (res) => {
        if (res.confirm) {
          uni.showToast({
            title: "功能开发中",
            icon: "none",
          });
        }
      },
    });
  }, 1000);
};

const goToHistory = () => {
  uni.navigateTo({
    url: `/pages/record/list?type=${MODULE_TYPES.FOOD}`,
  });
};

const goToRecordDetail = (record) => {
  uni.navigateTo({
    url: `/pages/record/detail?id=${record.recordId}`,
  });
};

const getMealEmoji = (mealType) => {
  const meal = MEAL_TYPES.find((m) => m.value === mealType);
  return meal ? meal.emoji : "🍽️";
};

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();
  loadCustomFoods();

  // 根据当前时间自动选择餐次
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) {
    selectedMeal.value = "breakfast";
  } else if (hour >= 10 && hour < 14) {
    selectedMeal.value = "lunch";
  } else if (hour >= 14 && hour < 18) {
    selectedMeal.value = "snack";
  } else {
    selectedMeal.value = "dinner";
  }
});
</script>

<style lang="scss" scoped>
.food-recommend-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.header {
  background: linear-gradient(135deg, #ff6347, #ff7f50);
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
  color: white;

  .title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    margin-bottom: 12rpx;
  }

  .subtitle {
    font-size: 28rpx;
    opacity: 0.9;
  }
}

  .meal-selector {
    margin: 20rpx;

    .selector-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .selector-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .add-btn {
        display: flex;
        align-items: center;
        gap: 4rpx;
        padding: 8rpx 16rpx;
        background: #f0f0f0;
        border-radius: 20rpx;
        
        .add-icon {
          font-size: 28rpx;
          color: #ff6347;
          font-weight: bold;
        }
        
        .add-text {
          font-size: 24rpx;
          color: #666;
        }
        
        &:active {
          opacity: 0.8;
        }
      }
    }

  .meal-options {
    display: flex;
    gap: 16rpx;
    flex-wrap: wrap;

    .meal-option {
      flex: 1;
      min-width: 120rpx;
      padding: 20rpx 16rpx;
      background: #f8f8f8;
      border-radius: 16rpx;
      text-align: center;
      transition: all 0.3s;

      &.active {
        background: #ff6347;
        color: white;
      }

      .meal-emoji {
        display: block;
        font-size: 32rpx;
        margin-bottom: 8rpx;
      }

      .meal-label {
        font-size: 24rpx;
      }
    }
  }
}

.roulette-section {
  margin: 20rpx;
  text-align: center;

  .roulette-header {
    margin-bottom: 30rpx;

    .roulette-title {
      display: block;
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
    }

    .roulette-subtitle {
      font-size: 26rpx;
      color: #666;
    }
  }

  .roulette-container {
    position: relative;
    width: 560rpx;
    height: 560rpx;
    margin: 0 auto 40rpx;
    display: flex;
    justify-content: center;
    align-items: center;

    .roulette-wrapper {
      position: relative;
      width: 500rpx;
      height: 500rpx;
      border-radius: 50%;
      box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.2);
      border: 10rpx solid white;
      overflow: hidden;
      
      .roulette-wheel {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: relative;
        transition: transform 3s cubic-bezier(0.23, 1, 0.32, 1);

        &.spinning {
          transition: transform 3s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .roulette-item {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          /* transform-origin is center by default for absolute full size */
          
          .food-text {
            font-size: 26rpx;
            color: white;
            font-weight: bold;
            text-shadow: 1rpx 1rpx 2rpx rgba(0, 0, 0, 0.3);
            /* Text is positioned by the parent transform */
            white-space: nowrap;
          }
        }
      }
      
      .wheel-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100rpx;
        height: 100rpx;
        background: white;
        border-radius: 50%;
        box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 5;
        
        .center-dot {
          width: 20rpx;
          height: 20rpx;
          background: #ff6347;
          border-radius: 50%;
        }
      }
    }

    .roulette-pointer {
      position: absolute;
      top: -10rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 20rpx solid transparent;
      border-right: 20rpx solid transparent;
      border-top: 50rpx solid #ff6347;
      filter: drop-shadow(0 4rpx 4rpx rgba(0,0,0,0.2));
      z-index: 10;
      
      &::after {
        content: '';
        position: absolute;
        top: -50rpx;
        left: -10rpx;
        width: 20rpx;
        height: 20rpx;
        background: #a12c15;
        border-radius: 50%;
      }
    }
  }

  .roulette-actions {
    .spin-btn {
      width: 300rpx;
      height: 80rpx;
      background: linear-gradient(135deg, #ff6347, #ff7f50);
      color: white;
      border: none;
      border-radius: 40rpx;
      font-size: 32rpx;
      font-weight: bold;
      transition: all 0.3s;

      &:disabled {
        opacity: 0.6;
        background: #ccc;
      }

      &.spinning {
        animation: pulse 1s infinite;
      }

      .spin-text {
        color: white;
      }
    }
  }
}

.recommendation {
  margin: 20rpx;

  .recommendation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .recommendation-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 20rpx;
      background: #ff6347;
      color: white;
      border-radius: 20rpx;
      font-size: 24rpx;
    }
  }

  .food-result {
    text-align: center;
    padding: 40rpx 20rpx;

    .food-icon {
      font-size: 80rpx;
      margin-bottom: 20rpx;
    }

    .food-name {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 30rpx;
    }

    .food-actions {
      display: flex;
      gap: 20rpx;
      justify-content: center;

      .btn {
        padding: 20rpx 40rpx;
        border-radius: 50rpx;
        border: none;
        font-size: 28rpx;
        transition: all 0.3s;

        &.btn-primary {
          background: #ff6347;
          color: white;
        }

        &.btn-secondary {
          background: #f8f8f8;
          color: #333;
        }
      }
    }
  }
}

.quick-actions {
  display: flex;
  gap: 20rpx;
  padding: 0 20rpx;
  margin-bottom: 40rpx;

  .quick-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30rpx 20rpx;
    background: white;
    border-radius: 20rpx;
    border: none;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    transition: all 0.3s;

    &:disabled {
      opacity: 0.5;
    }

    .btn-icon {
      font-size: 40rpx;
      margin-bottom: 12rpx;
    }

    .btn-text {
      font-size: 28rpx;
      color: #333;
    }
  }

  .random-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;

    .btn-text {
      color: white;
    }
  }
}

.recent-records,
.food-categories {
  margin: 0 20rpx 40rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .section-more {
      font-size: 28rpx;
      color: #ff6347;
    }
  }

  .record-item {
    margin-bottom: 16rpx;

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;

      .meal-info {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .meal-emoji {
          font-size: 24rpx;
        }

        .meal-name {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
        }
      }

      .record-time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .record-details {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .restaurant {
        font-size: 26rpx;
        color: #666;
      }

      .rating {
        .star {
          font-size: 20rpx;
          color: #ddd;

          &.filled {
            color: #ffd700;
          }
        }
      }
    }
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;

  .category-item {
    background: white;
    padding: 30rpx 20rpx;
    border-radius: 16rpx;
    text-align: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    transition: all 0.3s;

    &:active {
      transform: scale(0.95);
    }

    .category-icon {
      display: block;
      font-size: 40rpx;
      margin-bottom: 12rpx;
    }

    .category-name {
      font-size: 26rpx;
      color: #333;
    }
  }
}

// 弹窗样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  
  .modal-content {
    width: 600rpx;
    background: white;
    border-radius: 24rpx;
    padding: 32rpx;
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32rpx;
      
      .modal-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .modal-close {
        font-size: 40rpx;
        color: #999;
        line-height: 1;
        padding: 10rpx;
      }
    }
    
    .modal-body {
      margin-bottom: 32rpx;
      
      .input-group {
        margin-bottom: 24rpx;
        
        .label {
          display: block;
          font-size: 28rpx;
          color: #666;
          margin-bottom: 16rpx;
        }
        
        .meal-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 16rpx;
          
          .meal-tag {
            padding: 12rpx 24rpx;
            background: #f5f5f5;
            border-radius: 30rpx;
            font-size: 26rpx;
            color: #666;
            
            &.active {
              background: #ff6347;
              color: white;
            }
          }
        }
        
        .food-input {
          width: 100%;
          height: 80rpx;
          background: #f8f8f8;
          border-radius: 12rpx;
          padding: 0 24rpx;
          font-size: 28rpx;
          box-sizing: border-box;
        }
      }
    }
    
    .modal-footer {
      display: flex;
      gap: 20rpx;
      
      button {
        flex: 1;
        height: 80rpx;
        line-height: 80rpx;
        border-radius: 40rpx;
        font-size: 28rpx;
        border: none;
        
        &.btn-cancel {
          background: #f5f5f5;
          color: #666;
        }
        
        &.btn-confirm {
          background: #ff6347;
          color: white;
        }
      }
    }
  }
}

.card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
