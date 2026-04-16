<script lang="ts" setup>
const popup1 = ref<any>(null)
const popup2 = ref<any>(null)
const modular = ref("病虫害监测")
const { maps, popupInfos, closePopup, addLayerManageData, removeLayerManageData } = useTimeComparisonOlMap({
  targets: ["map1", "map2"],
  popups: [popup1, popup2],
  zoom: 12,
  center: [116.11222219116, 31.02850184],
  openOverlay: false,
  overlayOffset: [0, -60],
  overlayPositioning: "bottom-center",
  vectorLayerDeclutter: false
})

onMounted(() => {})
</script>
<template>
  <div class="time-comparison">
    <div class="time-comparison-left">
      <div class="section-bar">
        <BaseLayerSelect
          v-if="maps[0]"
          :map="maps[0]"
          :init-checked-keys="[2023]"
          :init-show="false"
        />
        <MapLayerManage
          :modular="modular"
          :init-checked-keys="[35, 41]"
          :init-show="false"
          @addLayer="(data, option) => addLayerManageData(0, data, option)"
          @removeLayer="(data) => removeLayerManageData(0, data)"
        />
      </div>
      <div
        class="map-box"
        id="map1"
      >
        <MapPopup
          ref="popup1"
          :type="2"
          format-name="枯木多时相对比"
          :info="popupInfos[0]"
          @close="closePopup(0)"
        />
      </div>
    </div>
    <div class="time-comparison-right">
      <div class="section-bar">
        <BaseLayerSelect
          v-if="maps[1]"
          :map="maps[1]"
          :init-checked-keys="[15]"
          :init-show="false"
        />
        <MapLayerManage
          :modular="modular"
          :init-checked-keys="[35, 41]"
          :init-show="false"
          @addLayer="(data, option) => addLayerManageData(1, data, option)"
          @removeLayer="(data) => removeLayerManageData(1, data)"
        />
      </div>
      <div
        class="map-box"
        id="map2"
      >
        <MapPopup
          ref="popup2"
          :type="2"
          format-name="枯木多时相对比"
          :info="popupInfos[1]"
          @close="closePopup(1)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.time-comparison {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  gap: 0.5208vw;
  > div {
    position: relative;
    flex: 1;
    .el-select {
      position: absolute;
      top: 0.5208vw;
      right: 0.5208vw;
      width: 140px;
      z-index: 1;
    }
    .map-box {
      width: 100%;
      height: 100%;
    }
  }
  .section-bar {
    position: absolute;
    top: 20px;
    right: 0.2604vw;
    display: flex;
    gap: 0.2604vw;
    height: 32px;
    z-index: 1;
    // transition: all 0.3s ease-in-out;
  }
}
</style>
