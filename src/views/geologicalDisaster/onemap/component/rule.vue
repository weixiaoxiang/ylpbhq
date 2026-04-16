<template>
  <view class="rule-box">
    <div class="corner-top-right"></div>
    <div class="corner-bottom-left"></div>
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
  height: 155px;
  width: 160px;
  padding-right: 80px;
  padding-top: 5px;
  margin-left: 20px;
  color: #333;
  text-align: right;
  line-height: 0px;
  //background: #e6eefb;
  background: #22416580;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 15px;
    height: 15px;
  }

  &::before {
    top: 0;
    left: 0;
    border-top: 2px solid #38eaed;
    border-left: 2px solid #38eaed;
    z-index: 999;
  }
  &::after {
    bottom: 0;
    right: 0;
    border-bottom: 2px solid #38eaed;
    border-right: 2px solid #38eaed;
  }

  .corner-top-right::before,
  .corner-bottom-left::after {
    content: "";
    position: absolute;
    width: 15px;
    height: 15px;
    z-index: 999;
  }
  .corner-top-right::before {
    top: 0;
    right: 0;
    border-top: 2px solid #38eaed;
    border-right: 2px solid #38eaed;
  }
  .corner-bottom-left::after {
    bottom: 0;
    left: 0;
    border-bottom: 2px solid #38eaed;
    border-left: 2px solid #38eaed;
  }

  .line {
    width: 2px;
    height: 100%;
    background: #5582ac;

    // border: 1px solid #5582AC
  }
  .split-line {
    position: relative;

    .split-line-item {
      position: relative;
      width: 5px;
      height: 1px;
      //   background: #333;
      background: #5582ac;

      margin-bottom: 2px;
      margin-left: auto;
      &:nth-child(10n),
      &:nth-child(1) {
        width: 10px;
      }
      span {
        color: #fff;
        position: absolute;
        left: -70px;
        top: -10px;
        display: inline-block;
        width: 60px;
        height: 20px;
        line-height: 20px;
        text-align: right;
      }

      .name {
        font-family: FZLanTingHeiS-R-GB;
        font-size: 8px;
        font-weight: 400;
        line-height: 18px;
      }
    }
  }
  .yj-line {
    position: absolute;
    left: 30px;
  }
}
</style>
