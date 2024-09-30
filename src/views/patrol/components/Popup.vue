<script lang="ts" setup>
interface Props {
  info?: any
  // type在这里是一个枚举类型
  type?: 1 | 2 | 3
  formatName?: string
}
const props = withDefaults(defineProps<Props>(), {
  info: () => {
    return {
      title: "小标题",
      content: "内容",
      time: "2021-08-09 14:32:00"
    }
  },
  type: 1,
  formatName: "巡护概况"
})
const emit = defineEmits<{
  close: []
}>()
const calssstyle = computed(() => {
  return `map-popup${props.type}`
})
const closePopup = () => {
  emit("close")
}
</script>
<template>
  <div
    id="map-popup"
    class="map-popup"
    :class="calssstyle"
  >
    <div
      class="close"
      @click="closePopup"
    >
      <el-icon><i-ep-circle-close /></el-icon>
    </div>
    <div class="container">
      <div class="title">{{ info.title }}</div>
      <ul class="con">
        <li>监测时间：{{ info.time }}</li>
        <li>监测指标：{{ info.content }}</li>
        <li>监测时间：{{ info.time }}</li>
      </ul>
    </div>
    <div></div>
  </div>
</template>

<style lang="scss" scoped>
#map-popup {
  // position: relative;
  // position: absolute;
  // top: 50%;
  // left: 50%;
  // transform: translate(-50%, -50%);
  max-width: 350px;
  padding-left: 55px;
  padding-top: 10px;
  font-size: 14px;
  color: #fff;
  .close {
    position: absolute;
    top: 15px;
    right: 5px;
    font-size: 22px;
    font-weight: bold;
    cursor: pointer;
  }
  .container {
    margin-left: -10px;
    margin-bottom: 70px;
    .title {
      font-size: 16px;
      padding: 5px 10px;
      text-align: left;
    }
    .con {
      display: flex;
      flex-direction: column;
      padding: 5px 10px;
      li {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  &::before {
    position: absolute;
    top: 0;
    right: 0;
    transform: translateX(1px) translateY(calc(100% + 2px));
    display: block;
    content: "";
    width: 120px;
    height: 5px;
  }
  &::after {
    position: absolute;
    bottom: 0;
    left: 0;
    display: block;
    content: "";
    width: 53px;
    height: 80px;
  }
}
.map-popup1 {
  $color1: #2cadff;
  $color2: #051d42;
  .close {
    color: #2ba9fa;
  }
  .container {
    border: 2px $color1 solid;
    background-color: $color2;
    .title {
      // 左右颜色渐变
      background: linear-gradient(to right, $color1, $color2);
    }
  }

  &::before {
    background: url("@/assets/images/patrol/popup-top1.svg") no-repeat left bottom / 100% 100%;
  }
  &::after {
    background: url("@/assets/images/patrol/popup-footer1.svg") no-repeat left bottom / 100% 100%;
  }
}
.map-popup2 {
  $color1: #28ec47;
  $color2: #042b1b;
  .close {
    color: $color1;
  }
  .container {
    border: 2px $color1 solid;
    background-color: $color2;
    .title {
      // 左右颜色渐变
      background: linear-gradient(to right, $color1, $color2);
    }
  }

  &::before {
    background: url("@/assets/images/patrol/popup-top2.svg") no-repeat left bottom / 100% 100%;
  }
  &::after {
    background: url("@/assets/images/patrol/popup-footer2.svg") no-repeat left bottom / 100% 100%;
  }
}
.map-popup3 {
  $color1: #eaa727;
  $color2: #271e07;
  .close {
    color: $color1;
  }
  .container {
    border: 2px $color1 solid;
    background-color: $color2;
    .title {
      // 左右颜色渐变
      background: linear-gradient(to right, $color1, $color2);
    }
  }

  &::before {
    background: url("@/assets/images/patrol/popup-top3.svg") no-repeat left bottom / 100% 100%;
  }
  &::after {
    background: url("@/assets/images/patrol/popup-footer3.svg") no-repeat left bottom / 100% 100%;
  }
}
</style>
