<script lang="ts" setup>
import Meteorological from "./meteorological.vue"
import Hydrology from "./hydrology.vue"
const { showCSB } = storeToRefs(useConfigStore())
const current = ref("水文")
const changeCate = (type: string) => {
  showCSB.value = true
  current.value = type
}
</script>
<template>
  <div class="ecologicalMonitoring">
    <div class="catelog">
      <div
        class="catelog-item"
        :class="{ current: current === '水文' }"
        @click="changeCate('水文')"
      >
        <img
          :src="$fun.getImg('researchManagement/water.png')"
          alt=""
        />
        水文
      </div>
      <div class="line"></div>
      <div
        class="catelog-item"
        :class="{ current: current === '气象' }"
        @click="changeCate('气象')"
      >
        <img
          :src="$fun.getImg('researchManagement/windmill.png')"
          alt=""
        />
        气象
      </div>
      <!-- <div class="line"></div>
      <div
        class="catelog-item"
        :class="{ current: current === '土壤' }"
        @click="changeCate('土壤')"
      >
        <img
          :src="$fun.getImg('researchManagement/turang.png')"
          alt=""
        />
        土壤
      </div> -->
    </div>
    <Meteorological v-if="current === '气象'" />
    <Hydrology v-if="current === '水文'" />
  </div>
</template>

<style lang="scss" scoped>
.ecologicalMonitoring {
  position: relative;
  height: 100%;
  .catelog {
    position: absolute;
    top: 20px;
    left: calc(calc(100% - 21.875vw) / 2);
    transform: translateX(-50%);
    width: 14.5833vw; //23.9583vw
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
      font-size: 0.7292vw;
      cursor: pointer;
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

  .map-box {
    position: relative;
    width: 100%;
    height: 100%;
  }
}
</style>
