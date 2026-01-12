<template>
  <view class="coffee-form">
    <view class="form-item">
      <text class="form-label">咖啡名称</text>
      <u-input
        :value="formData.name"
        @input="updateFormData('name', $event)"
        placeholder="请输入咖啡名称"
      />
    </view>
    <view class="form-item">
      <text class="form-label">咖啡店</text>
      <u-input
        :value="formData.shop"
        @input="updateFormData('shop', $event)"
        placeholder="请输入店铺名称"
      />
    </view>
    <view class="form-item">
      <text class="form-label">甜度</text>
      <u-radio-group
        :value="formData.sugar"
        @change="updateFormData('sugar', $event)"
      >
        <u-radio
          v-for="sugar in sugarTypes"
          :key="sugar.value"
          :name="sugar.value"
          :label="sugar.label"
        />
      </u-radio-group>
    </view>
    <view class="form-item">
      <text class="form-label">冰度</text>
      <u-radio-group
        :value="formData.ice"
        @change="updateFormData('ice', $event)"
      >
        <u-radio
          v-for="ice in iceTypes"
          :key="ice.value"
          :name="ice.value"
          :label="ice.label"
        />
      </u-radio-group>
    </view>
    <view class="form-item">
      <text class="form-label">价格 (元)</text>
      <u-input
        :value="formData.price"
        @input="updateFormData('price', $event)"
        type="digit"
        placeholder="请输入价格"
      />
    </view>
    <view class="form-item">
      <text class="form-label">备注</text>
      <u-textarea
        :value="formData.remark"
        @input="updateFormData('remark', $event)"
        placeholder="口感、推荐度等"
      />
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { SUGAR_TYPES, ICE_TYPES } from '@/utils/constants';

const props = defineProps({
  formData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:formData']);

const sugarTypes = computed(() => SUGAR_TYPES);
const iceTypes = computed(() => ICE_TYPES);

const updateFormData = (key, value) => {
  emit('update:formData', { ...props.formData, [key]: value });
};
</script>

<style lang="scss" scoped>
.coffee-form {
  .form-item {
    margin-bottom: 30rpx;

    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 12rpx;
      font-weight: 500;
    }
  }
}
</style>