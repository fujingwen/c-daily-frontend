<template>
  <view id="app">
    <!-- uni-app不需要router-view，页面路由由框架自动处理 -->
  </view>
</template>

<script>
import birthdayService from "./utils/birthdayService.js";
import { useThemeStore } from "@/stores";
import { storeToRefs } from "pinia";

export default {
  name: "App",
  onLaunch() {
    console.log("App Launch");
    // 初始化应用
    this.initApp();
  },
  onShow() {
    console.log("App Show");
    // 每次显示时检查生日提醒
    birthdayService.manualCheck();
  },
  onHide() {
    console.log("App Hide");
  },
  methods: {
    initApp() {
      // 初始化主题
      const themeStore = useThemeStore();
      themeStore.loadTheme();
      
      // 监听主题变化更新系统UI
      // 注意：App.vue中无法直接使用watch监听store，因为App.vue在store初始化前可能就已经创建
      // 但在onLaunch中store已经可用
      
      // 初始化生日提醒服务
      setTimeout(() => {
        birthdayService.init();
      }, 1000); // 延迟1秒启动，确保应用完全加载
    },
  },
};
</script>

<style lang="scss">
/* 引入 uview-plus 样式 */
@import '@/uni_modules/uview-plus/index.scss';

/* 全局样式 - 使用标准变量 */
page {
  background-color: $uni-bg-color-grey;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', SimSun, sans-serif;
}

.container {
  padding: $uni-spacing-row-base;
}

.u-card-custom {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-row-lg;
  margin-bottom: $uni-spacing-row-base;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.u-btn-primary-custom {
  background: linear-gradient(135deg, #ff6b9d 0%, #764ba2 100%);
  color: $uni-text-color-inverse;
  border-radius: $uni-border-radius-circle;
}

.u-text-primary-custom {
  color: #ff6b9d;
}

.u-text-secondary-custom {
  color: $uni-text-color-grey;
  font-size: $uni-font-size-sm;
}

/* 自定义主题色 */
:root {
  --u-primary: #ff6b9d;
  --u-success: #34c759;
  --u-warning: #ff9500;
  --u-error: #ff3b30;
  --u-info: #007aff;
}
</style>
