<script lang="ts" setup>
interface Props {
  info?: any
}
const props = withDefaults(defineProps<Props>(), {
  info: () => {}
})
watch(
  () => props.info,
  (newVal) => {
    console.log(newVal)
  }
)
const emit = defineEmits<{
  closePopup: [boolean]
}>()
const close = () => {
  emit("closePopup", true)
}
</script>
<template>
  <div
    class="map3d-popup"
    id="map3d-popup"
  >
    <div
      class="map-popup-close"
      @click="close"
    >
      <i-ep-circle-close-filled />
    </div>
    <div class="map-popup-content">
      <div class="map-popup-content-title">
        <span>地图弹窗</span>
      </div>
      <div class="map-popup-content-body">
        <div class="item">
          <span class="label">字段名称：</span>
          <span class="value">weixiaoxiangweixiaoxiang</span>
        </div>
        <div class="item">
          <span class="label">字段名称：</span>
          <span class="value">weixiaoxiangweixiaoxiang</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map3d-popup {
  position: absolute;
  // top: 50%;
  // left: 50%;
  width: fit-content;
  max-width: 300px;
  background-color: rgba(0, 0, 0, 1);
  border-radius: 8px;
  box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  color: #fff;
  z-index: 1000;
  // 添加倒三角
  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid rgba(0, 0, 0, 1);
  }
  .map-popup-close {
    position: absolute;
    top: -15px;
    right: -20px;
    cursor: pointer;
    color: #000;
    font-weight: 700;
    font-size: 18px;
  }
  .map-popup-content {
    padding: 10px;
    &-title {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    &-body {
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: #eee;
      .item {
        display: flex;
        align-items: center;
        .label {
          width: 70px;
          flex-shrink: 0;
        }
        .value {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #999;
        }
      }
    }
  }
}
</style>
