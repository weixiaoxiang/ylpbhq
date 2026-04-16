<script lang="ts" setup>
import FacialRecognition from "./facialRecognition.vue"
import FireWarning from "./fireWarning.vue"
import VehicleCheckpoint from "./vehicleCheckpoint.vue"
import VideoSurveillance from "./videoSurveillance.vue"

const { showCSB } = storeToRefs(useConfigStore())
const current = ref("车辆卡口")
const changeCate = (type: string) => {
  showCSB.value = true
  current.value = type
}
</script>
<template>
  <div class="captureVideoMonitoring">
    <div class="catelog">
      <div
        class="catelog-item"
        :class="{ current: current === '车辆卡口' }"
        @click="changeCate('车辆卡口')"
      >
        <img
          :src="$fun.getImg('researchManagement/car.png')"
          alt=""
        />
        车辆卡口
      </div>
      <div class="line"></div>
      <div
        class="catelog-item"
        :class="{ current: current === '视频监控' }"
        @click="changeCate('视频监控')"
      >
        <img
          :src="$fun.getImg('researchManagement/video.png')"
          alt=""
        />
        视频监控
      </div>
      <div class="line"></div>
      <div
        class="catelog-item"
        :class="{ current: current === '人脸识别' }"
        @click="changeCate('人脸识别')"
      >
        <img
          :src="$fun.getImg('researchManagement/face.png')"
          alt=""
        />
        人脸识别
      </div>
      <div class="line"></div>
      <div
        class="catelog-item"
        :class="{ current: current === '火情预警' }"
        @click="changeCate('火情预警')"
      >
        <img
          :src="$fun.getImg('researchManagement/fire.png')"
          alt=""
        />
        火情预警
      </div>
    </div>
    <VehicleCheckpoint v-if="current === '车辆卡口'" />
    <VideoSurveillance v-if="current === '视频监控'" />
    <FacialRecognition v-if="current === '人脸识别'" />
    <FireWarning v-if="current === '火情预警'" />
  </div>
</template>

<style lang="scss" scoped>
.captureVideoMonitoring {
  position: relative;
  height: 100%;
  .catelog {
    position: absolute;
    top: 20px;
    left: calc(calc(100% - 21.875vw) / 2);
    transform: translateX(-50%);
    width: 20.8333vw; // 23.9583vw
    height: 33px;
    z-index: 1;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    background: url("@/assets/images/researchManagement/catelog-bg.png") no-repeat center center / 100% 100%;
    .catelog-item {
      display: flex;
      align-items: center;
      height: 100%;
      gap: 5px;
      color: #4fbef1;
      cursor: pointer;
      font-size: 0.7292vw;
      &.current {
        color: #edaa27;
        font-size: 0.8333vw;
        font-weight: 700;
      }
    }
    .line {
      width: 1px;
      height: 14px;
      background-color: #4fbef1;
    }
  }
}
</style>
