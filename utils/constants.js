// 模块类型常量
export const MODULE_TYPES = {
  DAILY_MOOD: 'dailyMood',
  WEIGHT: 'weight',
  MILK_TEA: 'milkTea',
  WISH: 'wish',
  MENSTRUATION: 'menstruation',
  ESSAY: 'essay',
  ACCOUNT: 'account',
  TODO: 'todo',
  BIRTHDAY: 'birthday',
  FOOD: 'food',
  RECIPE: 'recipe',
  EXERCISE: 'exercise'
}

// 模块分组配置
export const MODULE_GROUPS = {
  dailyCheckIn: {
    name: '今日打卡',
    icon: '✨',
    color: '#667eea',
    modules: ['dailyMood', 'milkTea', 'weight', 'exercise']
  },
  lifeRecord: {
    name: '生活记录',
    icon: '📋',
    color: '#ff6b9d',
    modules: ['essay', 'account', 'menstruation', 'wish']
  },
  foodRelated: {
    name: '美食相关',
    icon: '🍽️',
    color: '#ff6347',
    modules: ['food', 'recipe']
  },
  planReminder: {
    name: '计划提醒',
    icon: '📅',
    color: '#5856d6',
    modules: ['todo', 'birthday']
  }
}

// 模块配置
export const MODULE_CONFIG = {
  [MODULE_TYPES.DAILY_MOOD]: {
    name: '今日心情',
    icon: '😊',
    color: '#ff9500',
    group: 'dailyCheckIn',
    fields: ['moodType', 'keywords', 'description']
  },
  [MODULE_TYPES.WEIGHT]: {
    name: '体重',
    icon: '⚖️',
    color: '#007aff',
    group: 'dailyCheckIn',
    fields: ['weightValue', 'measureTime', 'remark']
  },
  [MODULE_TYPES.MILK_TEA]: {
    name: '咖啡',
    icon: '☕',
    color: '#8D6E63',
    group: 'dailyCheckIn',
    fields: ['name', 'shop', 'sugar', 'ice', 'price', 'drinkTime', 'remark']
  },
  [MODULE_TYPES.EXERCISE]: {
    name: '运动',
    icon: '🏃',
    color: '#34c759',
    group: 'dailyCheckIn',
    fields: ['exerciseType', 'duration', 'calories', 'distance', 'remark']
  },
  [MODULE_TYPES.WISH]: {
    name: '买买买',
    icon: '🛍️',
    color: '#ff3b30',
    group: 'lifeRecord',
    fields: ['productName', 'price', 'priority', 'status', 'link', 'remark']
  },
  [MODULE_TYPES.MENSTRUATION]: {
    name: '姨妈记录',
    icon: '🌸',
    color: '#ff2d92',
    group: 'lifeRecord',
    fields: ['startDate', 'endDate', 'flow', 'painLevel', 'remark']
  },
  [MODULE_TYPES.ESSAY]: {
    name: '碎碎念',
    icon: '💭',
    color: '#34c759',
    group: 'lifeRecord',
    fields: ['essayType', 'content', 'canAppend']
  },
  [MODULE_TYPES.ACCOUNT]: {
    name: '记账',
    icon: '💰',
    color: '#ff9500',
    group: 'lifeRecord',
    fields: ['type', 'amount', 'category', 'payType', 'remark']
  },
  [MODULE_TYPES.TODO]: {
    name: '待办事项',
    icon: '✅',
    color: '#5856d6',
    group: 'planReminder',
    fields: ['content', 'priority', 'deadline', 'isCompleted', 'completeRemark']
  },
  [MODULE_TYPES.BIRTHDAY]: {
    name: '生日记录',
    icon: '🎂',
    color: '#ff6b9d',
    group: 'planReminder',
    fields: ['name', 'birthday', 'relationship', 'phone', 'address', 'notes', 'reminderSettings']
  },
  [MODULE_TYPES.FOOD]: {
    name: '今天吃什么',
    icon: '🍽️',
    color: '#ff6347',
    group: 'foodRelated',
    fields: ['mealType', 'foodName', 'restaurant', 'price', 'rating', 'tags', 'photos', 'remark']
  },
  [MODULE_TYPES.RECIPE]: {
    name: '我的菜谱',
    icon: '👨‍🍳',
    color: '#32cd32',
    group: 'foodRelated',
    fields: ['recipeName', 'category', 'difficulty', 'cookTime', 'servings', 'ingredients', 'steps', 'tips', 'photos', 'tags']
  }
}

// 心情类型
export const MOOD_TYPES = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'sad', label: '难过', emoji: '😢' },
  { value: 'calm', label: '平静', emoji: '😌' },
  { value: 'angry', label: '生气', emoji: '😠' },
  { value: 'excited', label: '兴奋', emoji: '🤩' },
  { value: 'tired', label: '疲惫', emoji: '😴' },
  { value: 'anxious', label: '焦虑', emoji: '😰' },
  { value: 'grateful', label: '感恩', emoji: '🙏' }
]

// 优先级
export const PRIORITY_TYPES = [
  { value: 'low', label: '低', color: '#34c759' },
  { value: 'mid', label: '中', color: '#ff9500' },
  { value: 'high', label: '高', color: '#ff3b30' }
]

// 甜度选项
export const SUGAR_TYPES = [
  { value: 'no', label: '无糖' },
  { value: 'slight', label: '微糖' },
  { value: 'half', label: '半糖' },
  { value: 'full', label: '全糖' }
]

// 冰度选项
export const ICE_TYPES = [
  { value: 'no', label: '去冰' },
  { value: 'less', label: '少冰' },
  { value: 'normal', label: '正常冰' },
  { value: 'hot', label: '热饮' }
]

// 经量选项
export const FLOW_TYPES = [
  { value: 'less', label: '少量' },
  { value: 'mid', label: '中量' },
  { value: 'more', label: '大量' }
]

// 痛经程度
export const PAIN_LEVELS = [
  { value: 'none', label: '无' },
  { value: 'light', label: '轻微' },
  { value: 'mid', label: '中度' },
  { value: 'heavy', label: '重度' }
]

// 收支类型
export const ACCOUNT_TYPES = [
  { value: 'income', label: '收入', color: '#34c759' },
  { value: 'expense', label: '支出', color: '#ff3b30' }
]

// 支出分类
export const EXPENSE_CATEGORIES = [
  '餐饮', '购物', '交通', '娱乐', '医疗', '教育', '住房', '其他'
]

// 收入分类
export const INCOME_CATEGORIES = [
  '工资', '兼职', '红包', '投资', '其他'
]

// 支付方式
export const PAY_TYPES = [
  { value: 'wechat', label: '微信' },
  { value: 'alipay', label: '支付宝' },
  { value: 'cash', label: '现金' },
  { value: 'card', label: '银行卡' }
]//关系类型
export const RELATIONSHIP_TYPES = [
  { value: 'family', label: '家人' },
  { value: 'friend', label: '朋友' },
  { value: 'colleague', label: '同事' },
  { value: 'classmate', label: '同学' },
  { value: 'lover', label: '恋人' },
  { value: 'other', label: '其他' }
]

// 生日提醒设置
export const BIRTHDAY_REMINDER_TYPES = [
  { value: 30, label: '提前30天', color: '#007aff' },
  { value: 7, label: '提前7天', color: '#ff9500' },
  { value: 3, label: '提前3天', color: '#ff3b30' },
  { value: 2, label: '提前2天', color: '#ff2d92' },
  { value: 1, label: '提前1天', color: '#5856d6' },
  { value: 0, label: '当天', color: '#34c759' }
]

// 默认提醒设置
export const DEFAULT_BIRTHDAY_REMINDERS = [30, 7, 3, 1, 0]

// 重复类型
export const REPEAT_TYPES = [
  { value: 'none', label: '不重复' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' }
]

// 运动类型
export const EXERCISE_TYPES = [
  { value: 'running', label: '跑步', emoji: '🏃', unit: 'km' },
  { value: 'walking', label: '步行', emoji: '🚶', unit: 'km' },
  { value: 'cycling', label: '骑行', emoji: '🚴', unit: 'km' },
  { value: 'swimming', label: '游泳', emoji: '🏊', unit: 'm' },
  { value: 'yoga', label: '瑜伽', emoji: '🧘', unit: 'min' },
  { value: 'gym', label: '健身', emoji: '🏋️', unit: 'min' },
  { value: 'basketball', label: '篮球', emoji: '🏀', unit: 'min' },
  { value: 'football', label: '足球', emoji: '⚽', unit: 'min' },
  { value: 'badminton', label: '羽毛球', emoji: '🏸', unit: 'min' },
  { value: 'tennis', label: '网球', emoji: '🎾', unit: 'min' },
  { value: 'hiking', label: '徒步', emoji: '🥾', unit: 'km' },
  { value: 'dancing', label: '跳舞', emoji: '💃', unit: 'min' },
  { value: 'other', label: '其他', emoji: '🎯', unit: 'min' }
]

// 餐次类型
export const MEAL_TYPES = [
  { value: 'breakfast', label: '早餐', emoji: '🌅' },
  { value: 'lunch', label: '午餐', emoji: '☀️' },
  { value: 'dinner', label: '晚餐', emoji: '🌙' },
  { value: 'snack', label: '零食', emoji: '🍿' },
  { value: 'drink', label: '饮品', emoji: '🥤' }
]

// 食物标签
export const FOOD_TAGS = [
  '中餐', '西餐', '日料', '韩料', '泰餐', '意餐', '快餐',
  '火锅', '烧烤', '面食', '米饭', '汤品', '甜品', '素食',
  '辣', '不辣', '清淡', '重口味', '健康', '高热量'
]

// 评分选项
export const RATING_OPTIONS = [
  { value: 1, label: '很差', emoji: '😞' },
  { value: 2, label: '一般', emoji: '😐' },
  { value: 3, label: '还行', emoji: '🙂' },
  { value: 4, label: '不错', emoji: '😊' },
  { value: 5, label: '很棒', emoji: '🤩' }
]

// 推荐食物数据库
export const FOOD_RECOMMENDATIONS = {
  breakfast: [
    '豆浆油条', '小笼包', '煎饼果子', '包子', '粥配咸菜',
    '三明治', '牛奶麦片', '鸡蛋灌饼', '蒸蛋羹', '面条'
  ],
  lunch: [
    '宫保鸡丁', '红烧肉', '麻婆豆腐', '糖醋里脊', '鱼香肉丝',
    '意大利面', '汉堡薯条', '日式拉面', '韩式拌饭', '泰式咖喱'
  ],
  dinner: [
    '火锅', '烧烤', '小龙虾', '水煮鱼', '口水鸡',
    '牛排', '寿司', '韩式烤肉', '海鲜大咖', '家常菜'
  ],
  snack: [
    '薯片', '爆米花', '坚果', '水果', '酸奶',
    '蛋糕', '冰淇淋', '巧克力', '饼干', '果冻'
  ],
  drink: [
    '奶茶', '咖啡', '果汁', '汽水', '茶',
    '豆浆', '牛奶', '酸奶', '椰汁', '柠檬水'
  ]
}

// 菜谱分类
export const RECIPE_CATEGORIES = [
  { value: 'home_cooking', label: '家常菜', icon: '🏠' },
  { value: 'soup', label: '汤品', icon: '🍲' },
  { value: 'dessert', label: '甜品', icon: '🍰' },
  { value: 'snack', label: '小食', icon: '🍿' },
  { value: 'drink', label: '饮品', icon: '🥤' },
  { value: 'breakfast', label: '早餐', icon: '🌅' },
  { value: 'lunch', label: '午餐', icon: '☀️' },
  { value: 'dinner', label: '晚餐', icon: '🌙' },
  { value: 'vegetarian', label: '素食', icon: '🥬' },
  { value: 'seafood', label: '海鲜', icon: '🦐' },
  { value: 'meat', label: '肉类', icon: '🥩' },
  { value: 'noodles', label: '面食', icon: '🍜' }
]

// 难度等级
export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: '简单', color: '#32cd32', icon: '⭐' },
  { value: 'medium', label: '中等', color: '#ffa500', icon: '⭐⭐' },
  { value: 'hard', label: '困难', color: '#ff4500', icon: '⭐⭐⭐' }
]

// 烹饪时间选项
export const COOK_TIME_OPTIONS = [
  { value: '10', label: '10分钟内' },
  { value: '30', label: '30分钟内' },
  { value: '60', label: '1小时内' },
  { value: '120', label: '2小时内' },
  { value: '180', label: '3小时以上' }
]

// 份量选项
export const SERVING_OPTIONS = [
  { value: '1', label: '1人份' },
  { value: '2', label: '2人份' },
  { value: '3-4', label: '3-4人份' },
  { value: '5-6', label: '5-6人份' },
  { value: '6+', label: '6人以上' }
]

// 菜谱标签
export const RECIPE_TAGS = [
  '快手菜', '下饭菜', '减脂', '增肌', '儿童', '老人',
  '孕妇', '素食', '无油', '少盐', '微辣', '中辣', '重辣',
  '清淡', '重口味', '营养', '美容', '补血', '暖胃'
]

// 碎碎念类型
export const ESSAY_TYPES = [
  { value: 'thoughts', label: '碎碎念', emoji: '💭', color: '#34c759' },
  { value: 'wish', label: '许个愿', emoji: '🌟', color: '#ff9500' },
  { value: 'advice', label: '给自己的忠告', emoji: '💡', color: '#007aff' },
  { value: 'complain', label: '吐槽一下', emoji: '😤', color: '#ff3b30' },
  { value: 'gratitude', label: '感恩时刻', emoji: '🙏', color: '#ff6b9d' },
  { value: 'reflection', label: '今日反思', emoji: '🤔', color: '#5856d6' }
]

// 中国节日数据（公历和农历）
export const CHINESE_HOLIDAYS = [
  // 公历节日
  { name: '元旦', date: '01-01', type: 'solar', holiday: true, emoji: '🎊' },
  { name: '情人节', date: '02-14', type: 'solar', holiday: false, emoji: '💕' },
  { name: '妇女节', date: '03-08', type: 'solar', holiday: false, emoji: '👩' },
  { name: '植树节', date: '03-12', type: 'solar', holiday: false, emoji: '🌳' },
  { name: '愚人节', date: '04-01', type: 'solar', holiday: false, emoji: '🤡' },
  { name: '劳动节', date: '05-01', type: 'solar', holiday: true, emoji: '💪' },
  { name: '青年节', date: '05-04', type: 'solar', holiday: false, emoji: '🧑' },
  { name: '儿童节', date: '06-01', type: 'solar', holiday: false, emoji: '👶' },
  { name: '建党节', date: '07-01', type: 'solar', holiday: false, emoji: '🎉' },
  { name: '建军节', date: '08-01', type: 'solar', holiday: false, emoji: '🎖️' },
  { name: '教师节', date: '09-10', type: 'solar', holiday: false, emoji: '👨‍🏫' },
  { name: '国庆节', date: '10-01', type: 'solar', holiday: true, emoji: '🇨🇳' },
  { name: '万圣节', date: '10-31', type: 'solar', holiday: false, emoji: '🎃' },
  { name: '光棍节', date: '11-11', type: 'solar', holiday: false, emoji: '💔' },
  { name: '平安夜', date: '12-24', type: 'solar', holiday: false, emoji: '🎄' },
  { name: '圣诞节', date: '12-25', type: 'solar', holiday: false, emoji: '🎅' },
  // 2025年农历节日（转换为公历日期）
  { name: '春节', date: '01-29', type: 'lunar', holiday: true, emoji: '🧧', year: 2025 },
  { name: '元宵节', date: '02-12', type: 'lunar', holiday: false, emoji: '🏮', year: 2025 },
  { name: '清明节', date: '04-04', type: 'lunar', holiday: true, emoji: '🌿', year: 2025 },
  { name: '端午节', date: '05-31', type: 'lunar', holiday: true, emoji: '🐲', year: 2025 },
  { name: '七夕节', date: '08-29', type: 'lunar', holiday: false, emoji: '💑', year: 2025 },
  { name: '中秋节', date: '10-06', type: 'lunar', holiday: true, emoji: '🥮', year: 2025 },
  { name: '重阳节', date: '10-29', type: 'lunar', holiday: false, emoji: '🏔️', year: 2025 },
  // 2026年农历节日
  { name: '春节', date: '02-17', type: 'lunar', holiday: true, emoji: '🧧', year: 2026 },
  { name: '元宵节', date: '03-03', type: 'lunar', holiday: false, emoji: '🏮', year: 2026 },
  { name: '清明节', date: '04-05', type: 'lunar', holiday: true, emoji: '🌿', year: 2026 },
  { name: '端午节', date: '06-19', type: 'lunar', holiday: true, emoji: '🐲', year: 2026 },
  { name: '中秋节', date: '09-25', type: 'lunar', holiday: true, emoji: '🥮', year: 2026 }
]

// 买买买优先级类型
export const SHOPPING_PRIORITY_TYPES = [
  { value: 'must_buy', label: '早晚要买', emoji: '🔥', color: '#ff3b30' },
  { value: 'consider', label: '纠结一下', emoji: '🤔', color: '#ff9500' },
  { value: 'just_look', label: '我就看看', emoji: '👀', color: '#34c759' }
]

// 买买买状态类型
export const SHOPPING_STATUS_TYPES = [
  { value: 'pending', label: '待购买', emoji: '⏳', color: '#007aff' },
  { value: 'bought', label: '已买', emoji: '✅', color: '#34c759' },
  { value: 'cancelled', label: '不买了', emoji: '❌', color: '#8e8e93' }
]