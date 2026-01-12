<template>
  <view class="record-detail-page" v-if="record">
    <!-- 记录头部 -->
    <view class="record-header card">
      <view class="header-info">
        <view class="module-info">
          <text class="module-emoji">{{
            getModuleConfig(record.moduleType).icon
          }}</text>
          <text class="module-name">{{
            getModuleConfig(record.moduleType).name
          }}</text>
        </view>
        <text class="record-time">{{
          formatDate(record.createTime, "YYYY-MM-DD HH:mm")
        }}</text>
      </view>
      <view class="header-actions">
        <u-button size="small" @click="editRecord">编辑</u-button>
        <u-button size="small" type="error" @click="deleteRecord"
          >删除</u-button
        >
      </view>
    </view>

    <!-- 记录内容 -->
    <view class="record-content card">
      <!-- 心情记录 -->
      <template v-if="record.moduleType === 'mood'">
        <view class="content-item">
          <text class="item-label">心情类型</text>
          <view class="mood-display">
            <text class="mood-emoji">{{ getMoodEmoji(record.moodType) }}</text>
            <text class="mood-text">{{ getMoodLabel(record.moodType) }}</text>
          </view>
        </view>
        <view class="content-item" v-if="record.description">
          <text class="item-label">心情描述</text>
          <text class="item-value">{{ record.description }}</text>
        </view>
      </template>

      <!-- 体重记录 -->
      <template v-if="record.moduleType === 'weight'">
        <view class="content-item">
          <text class="item-label">体重</text>
          <text class="item-value weight-value"
            >{{ record.weightValue }} kg</text
          >
        </view>
        <view class="content-item" v-if="record.measureTime">
          <text class="item-label">测量时间</text>
          <text class="item-value">{{
            formatDate(record.measureTime, "YYYY-MM-DD HH:mm")
          }}</text>
        </view>
        <view class="content-item" v-if="record.remark">
          <text class="item-label">备注</text>
          <text class="item-value">{{ record.remark }}</text>
        </view>
      </template>

      <!-- 咖啡记录 -->
      <template v-if="record.moduleType === 'milkTea'">
        <view class="content-item">
          <text class="item-label">咖啡名称</text>
          <text class="item-value">{{ record.name }}</text>
        </view>
        <view class="content-item" v-if="record.shop">
          <text class="item-label">咖啡店</text>
          <text class="item-value">{{ record.shop }}</text>
        </view>
        <view class="content-item">
          <text class="item-label">甜度</text>
          <text class="item-value">{{ getSugarLabel(record.sugar) }}</text>
        </view>
        <view class="content-item">
          <text class="item-label">冰度</text>
          <text class="item-value">{{ getIceLabel(record.ice) }}</text>
        </view>
        <view class="content-item" v-if="record.price">
          <text class="item-label">价格</text>
          <text class="item-value price-value">¥{{ record.price }}</text>
        </view>
        <view class="content-item" v-if="record.remark">
          <text class="item-label">备注</text>
          <text class="item-value">{{ record.remark }}</text>
        </view>
      </template>

      <!-- 记账记录 -->
      <template v-if="record.moduleType === 'account'">
        <view class="content-item">
          <text class="item-label">类型</text>
          <text class="item-value" :class="record.type">
            {{ record.type === "income" ? "收入" : "支出" }}
          </text>
        </view>
        <view class="content-item">
          <text class="item-label">金额</text>
          <text class="item-value amount-value" :class="record.type">
            {{ record.type === "income" ? "+" : "-" }}¥{{ record.amount }}
          </text>
        </view>
        <view class="content-item" v-if="record.category">
          <text class="item-label">分类</text>
          <text class="item-value">{{ record.category }}</text>
        </view>
        <view class="content-item" v-if="record.payType">
          <text class="item-label">支付方式</text>
          <text class="item-value">{{ getPayTypeLabel(record.payType) }}</text>
        </view>
        <view class="content-item" v-if="record.remark">
          <text class="item-label">备注</text>
          <text class="item-value">{{ record.remark }}</text>
        </view>
      </template>

      <!-- 待办事项 -->
      <template v-if="record.moduleType === 'todo'">
        <view class="content-item">
          <text class="item-label">内容</text>
          <text class="item-value">{{ record.content }}</text>
        </view>
        <view class="content-item">
          <text class="item-label">优先级</text>
          <text class="item-value priority-value" :class="record.priority">
            {{ getPriorityLabel(record.priority) }}
          </text>
        </view>
        <view class="content-item" v-if="record.deadline">
          <text class="item-label">截止时间</text>
          <text class="item-value">{{
            formatDate(record.deadline, "YYYY-MM-DD HH:mm")
          }}</text>
        </view>
        <view class="content-item">
          <text class="item-label">状态</text>
          <text class="item-value" :class="{ completed: record.isCompleted }">
            {{ record.isCompleted ? "已完成" : "未完成" }}
          </text>
        </view>
        <view
          class="content-item"
          v-if="record.isCompleted && record.completeRemark"
        >
          <text class="item-label">完成备注</text>
          <text class="item-value">{{ record.completeRemark }}</text>
        </view>
      </template>

      <!-- 食物记录 -->
      <template v-if="record.moduleType === 'food'">
        <view class="content-item">
          <text class="item-label">餐次类型</text>
          <view class="meal-display">
            <text class="meal-emoji">{{ getMealEmoji(record.mealType) }}</text>
            <text class="meal-text">{{ getMealLabel(record.mealType) }}</text>
          </view>
        </view>
        <view class="content-item">
          <text class="item-label">食物名称</text>
          <text class="item-value food-name">{{ record.foodName }}</text>
        </view>
        <view class="content-item" v-if="record.restaurant">
          <text class="item-label">餐厅/地点</text>
          <text class="item-value">📍 {{ record.restaurant }}</text>
        </view>
        <view class="content-item" v-if="record.price">
          <text class="item-label">价格</text>
          <text class="item-value price-value">¥{{ record.price }}</text>
        </view>
        <view class="content-item" v-if="record.rating">
          <text class="item-label">评分</text>
          <view class="rating-display">
            <text
              v-for="i in 5"
              :key="i"
              class="star"
              :class="{ filled: i <= record.rating }"
              >⭐</text
            >
            <text class="rating-text">{{ getRatingLabel(record.rating) }}</text>
          </view>
        </view>
        <view class="content-item" v-if="record.tags && record.tags.length > 0">
          <text class="item-label">标签</text>
          <view class="tags-display">
            <text class="tag" v-for="tag in record.tags" :key="tag">{{
              tag
            }}</text>
          </view>
        </view>
        <view class="content-item" v-if="record.remark">
          <text class="item-label">备注</text>
          <text class="item-value">{{ record.remark }}</text>
        </view>
      </template>

      <!-- 今日关键字记录 -->
      <template v-if="record.moduleType === 'keyword'">
        <view class="content-item">
          <text class="item-label">今日关键字</text>
          <view class="keywords-display">
            <text
              v-for="(keyword, index) in record.keywords"
              :key="index"
              class="keyword-tag"
            >
              {{ keyword }}
            </text>
          </view>
        </view>
        <view class="content-item" v-if="record.description">
          <text class="item-label">今日感想</text>
          <text class="item-value">{{ record.description }}</text>
        </view>
      </template>

      <!-- 运动记录 -->
      <template v-if="record.moduleType === 'exercise'">
        <view class="content-item">
          <text class="item-label">运动类型</text>
          <view class="exercise-display">
            <text class="exercise-emoji">{{
              getExerciseEmoji(record.exerciseType)
            }}</text>
            <text class="exercise-text">{{
              getExerciseLabel(record.exerciseType)
            }}</text>
          </view>
        </view>
        <view class="content-item">
          <text class="item-label">运动时长</text>
          <text class="item-value exercise-value"
            >{{ record.duration }} 分钟</text
          >
        </view>
        <view class="content-item" v-if="record.calories">
          <text class="item-label">消耗热量</text>
          <text class="item-value">{{ record.calories }} 千卡</text>
        </view>
        <view class="content-item" v-if="record.distance">
          <text class="item-label">运动距离</text>
          <text class="item-value"
            >{{ record.distance }}
            {{ getExerciseUnit(record.exerciseType) }}</text
          >
        </view>
        <view class="content-item" v-if="record.remark">
          <text class="item-label">备注</text>
          <text class="item-value">{{ record.remark }}</text>
        </view>
      </template>

      <!-- 月经记录 -->
      <template v-if="record.moduleType === 'menstruation'">
        <view class="content-item">
          <text class="item-label">经期日期</text>
          <view class="date-range">
            <text class="date-text">{{ record.startDate }}</text>
            <text class="date-separator" v-if="record.endDate">~</text>
            <text class="date-text" v-if="record.endDate">{{ record.endDate }}</text>
            <text class="date-text" v-else>至今</text>
          </view>
        </view>
        <view class="content-item">
          <text class="item-label">经量</text>
          <text class="item-value">{{ getFlowLabel(record.flow) }}</text>
        </view>
        <view class="content-item">
          <text class="item-label">痛经程度</text>
          <text class="item-value">{{ getPainLabel(record.painLevel) }}</text>
        </view>
        <view class="content-item" v-if="record.remark">
          <text class="item-label">备注</text>
          <text class="item-value">{{ record.remark }}</text>
        </view>
      </template>
    </view>

    <!-- 操作记录 -->
    <view class="record-meta card">
      <view class="meta-item">
        <text class="meta-label">创建时间</text>
        <text class="meta-value">{{
          formatDate(record.createTime, "YYYY-MM-DD HH:mm:ss")
        }}</text>
      </view>
      <view class="meta-item" v-if="record.updateTime !== record.createTime">
        <text class="meta-label">更新时间</text>
        <text class="meta-value">{{
          formatDate(record.updateTime, "YYYY-MM-DD HH:mm:ss")
        }}</text>
      </view>
      <view class="meta-item">
        <text class="meta-label">记录ID</text>
        <text class="meta-value">{{ record.recordId }}</text>
      </view>
    </view>
  </view>

  <view v-else class="empty-state">
    <text class="empty-text">记录不存在</text>
    <u-button type="primary" @click="goBack">返回</u-button>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRecordStore } from "@/stores";
import {
  MODULE_CONFIG,
  MOOD_TYPES,
  SUGAR_TYPES,
  ICE_TYPES,
  PAY_TYPES,
  PRIORITY_TYPES,
  MEAL_TYPES,
  RATING_OPTIONS,
  RECIPE_CATEGORIES,
  DIFFICULTY_LEVELS,
  EXERCISE_TYPES,
  FLOW_TYPES,
  PAIN_LEVELS,
} from "@/utils/constants";
import { formatDate, showConfirm, showToast } from "@/utils";

const recordStore = useRecordStore();

// 响应式数据
const record = ref(null);

// 方法
const getModuleConfig = (type) => {
  return MODULE_CONFIG[type] || { name: "未知", icon: "❓" };
};

const getMoodEmoji = (type) => {
  const mood = MOOD_TYPES.find((m) => m.value === type);
  return mood ? mood.emoji : "❓";
};

const getMoodLabel = (type) => {
  const mood = MOOD_TYPES.find((m) => m.value === type);
  return mood ? mood.label : "未知";
};

const getExerciseEmoji = (type) => {
  const exercise = EXERCISE_TYPES.find((e) => e.value === type);
  return exercise ? exercise.emoji : "🏃";
};

const getExerciseLabel = (type) => {
  const exercise = EXERCISE_TYPES.find((e) => e.value === type);
  return exercise ? exercise.label : "未知";
};

const getExerciseUnit = (type) => {
  const exercise = EXERCISE_TYPES.find((e) => e.value === type);
  return exercise ? exercise.unit : "km";
};

const getSugarLabel = (type) => {
  const sugar = SUGAR_TYPES.find((s) => s.value === type);
  return sugar ? sugar.label : "未知";
};

const getIceLabel = (type) => {
  const ice = ICE_TYPES.find((i) => i.value === type);
  return ice ? ice.label : "未知";
};

const getPayTypeLabel = (type) => {
  const pay = PAY_TYPES.find((p) => p.value === type);
  return pay ? pay.label : "未知";
};

const getPriorityLabel = (type) => {
  const priority = PRIORITY_TYPES.find((p) => p.value === type);
  return priority ? priority.label : "未知";
};

const getMealEmoji = (type) => {
  const meal = MEAL_TYPES.find((m) => m.value === type);
  return meal ? meal.emoji : "🍽️";
};

const getMealLabel = (type) => {
  const meal = MEAL_TYPES.find((m) => m.value === type);
  return meal ? meal.label : "未知";
};

const getRatingLabel = (rating) => {
  const ratingOption = RATING_OPTIONS.find((r) => r.value === rating);
  return ratingOption ? ratingOption.label : "未评分";
};

const getFlowLabel = (flow) => {
  const flowType = FLOW_TYPES.find((f) => f.value === flow);
  return flowType ? flowType.label : "未知";
};

const getPainLabel = (pain) => {
  const painType = PAIN_LEVELS.find((p) => p.value === pain);
  return painType ? painType.label : "未知";
};

const editRecord = () => {
  uni.navigateTo({
    url: `/pages/record/add?id=${record.value.recordId}&edit=true`,
  });
};

const deleteRecord = async () => {
  const confirmed = await showConfirm("确定要删除这条记录吗？");
  if (confirmed) {
    recordStore.deleteRecord(record.value.recordId);
    showToast("删除成功", "success");
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }
};

const goBack = () => {
  uni.navigateBack();
};

// 生命周期
onMounted(() => {
  recordStore.loadFromStorage();

  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options;

  if (options.id) {
    const foundRecord = recordStore.records.find(
      (r) => r.recordId === options.id
    );
    if (foundRecord) {
      record.value = foundRecord;
    }
  }
});
</script>

<style lang="scss" scoped>
.record-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.record-header {
  margin-bottom: 20rpx;

  .header-info {
    margin-bottom: 20rpx;

    .module-info {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 8rpx;

      .module-emoji {
        font-size: 32rpx;
      }

      .module-name {
        font-size: 32rpx;
        color: #333;
        font-weight: bold;
      }
    }

    .record-time {
      font-size: 28rpx;
      color: #666;
    }
  }

  .header-actions {
    display: flex;
    gap: 12rpx;
  }
}

.record-content {
  margin-bottom: 20rpx;

  .content-item {
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .item-label {
      display: block;
      font-size: 28rpx;
      color: #666;
      margin-bottom: 8rpx;
    }

    .item-value {
      display: block;
      font-size: 30rpx;
      color: #333;
      line-height: 1.4;

      &.weight-value {
        font-size: 36rpx;
        font-weight: bold;
        color: #667eea;
      }

      &.price-value {
        font-size: 32rpx;
        font-weight: 500;
        color: #ff9500;
      }

      &.amount-value {
        font-size: 36rpx;
        font-weight: bold;

        &.income {
          color: #34c759;
        }

        &.expense {
          color: #ff3b30;
        }
      }

      &.priority-value {
        &.low {
          color: #34c759;
        }

        &.mid {
          color: #ff9500;
        }

        &.high {
          color: #ff3b30;
        }
      }

      &.completed {
        color: #34c759;
      }

      &.income {
        color: #34c759;
      }

      &.expense {
        color: #ff3b30;
      }
    }

    .mood-display {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .mood-emoji {
        font-size: 36rpx;
      }

      .mood-text {
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
      }
    }

    .meal-display {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .meal-emoji {
        font-size: 36rpx;
      }

      .meal-text {
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
      }
    }

    .rating-display {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .star {
        font-size: 24rpx;
        color: #ddd;

        &.filled {
          color: #ffd700;
        }
      }

      .rating-text {
        font-size: 26rpx;
        color: #666;
        margin-left: 8rpx;
      }
    }

    .tags-display {
      display: flex;
      gap: 8rpx;
      flex-wrap: wrap;

      .tag {
        font-size: 22rpx;
        color: #ff6347;
        background: rgba(255, 99, 71, 0.1);
        padding: 6rpx 12rpx;
        border-radius: 12rpx;
        border: 1rpx solid rgba(255, 99, 71, 0.3);
      }
    }

    .food-name {
      font-size: 36rpx;
      font-weight: bold;
      color: #ff6347;
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .date-text {
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
      }

      .date-separator {
        font-size: 28rpx;
        color: #666;
      }
    }
  }
}

.record-meta {
  .meta-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .meta-label {
      font-size: 28rpx;
      color: #666;
    }

    .meta-value {
      font-size: 26rpx;
      color: #999;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;

  .empty-text {
    font-size: 32rpx;
    color: #666;
    margin-bottom: 40rpx;
  }
}
</style>

.keywords-display { display: flex; flex-wrap: wrap; gap: 12rpx; .keyword-tag {
font-size: 26rpx; color: #667eea; background: rgba(102, 126, 234, 0.1); padding:
8rpx 16rpx; border-radius: 16rpx; border: 1rpx solid rgba(102, 126, 234, 0.3); }
} .exercise-display { display: flex; align-items: center; gap: 12rpx;
.exercise-emoji { font-size: 36rpx; } .exercise-text { font-size: 30rpx; color:
#333; font-weight: 500; } } .exercise-value { font-size: 36rpx; font-weight:
bold; color: #34c759; }
