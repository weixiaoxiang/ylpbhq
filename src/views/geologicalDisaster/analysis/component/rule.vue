<template>
  <view class="rule-box">
    <div class="split-line">
      <div
        class="split-line-item"
        v-for="(item, index) in 50"
      >
        <span
          class="name"
          v-if="item % 10 == 0 || item == 1"
          >{{ item == 1 ? 0 : item }}cm</span
        >
      </div>
    </div>
    <div class="line"></div>
    <div
      class="yj-line"
      v-for="(item, index) in warning"
      :style="lineStyle(item)"
    ></div>
  </view>
</template>

<script setup lang="ts">
const props = defineProps({
  warning: {
    type: Array,
    default: []
  },
  number: {
    type: Number,
    default: 50
  }
})
//样式
const lineStyle = (item) => {
  return {
    height: "2px",
    width: "100px",
    background: item.color,
    top: `${(item.GC * 3) / 10 - 3}px`
  }
}
</script>

<style scoped lang="scss">
.rule-box {
  position: relative;
  display: flex;
  justify-content: flex-end;
  height: 150px;
  width: 160px;
  padding-right: 80px;
  margin-left: 20px;
  color: #333;
  text-align: right;
  line-height: 0px;
  background: #e6eefb;
  .line {
    width: 2px;
    height: 100%;
    background: #333;
  }
  .split-line {
    position: relative;

    .split-line-item {
      position: relative;
      width: 5px;
      height: 1px;
      background: #333;
      margin-bottom: 2px;
      margin-left: auto;
      &:nth-child(10n),
      &:nth-child(1) {
        width: 10px;
      }
      span {
        position: absolute;
        left: -70px;
        top: -10px;
        display: inline-block;
        width: 60px;
        height: 20px;
        line-height: 20px;
        text-align: right;
      }
    }
  }
  .yj-line {
    position: absolute;
    left: 60px;
  }
}
</style>
