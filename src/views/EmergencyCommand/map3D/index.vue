<script lang="ts" setup>
import MapTool from "./component/MapTool.vue"
import MapPopup from "./component/MapPopup.vue"

const proxy = getCurrentInstance()!.proxy as any
const popupRef = ref<any>(null)
const { popupInfo, popupFormatType, removePopup, setBaseMapType, addLayerManageData, removeLayerManageData } =
  useCesiumMap(popupRef, {
    target: "map3d",
    flyTo: true,
    camera: {
      destination: [116.08732077806539, 30.87604217657325, 16068],
      orientation: [0.11105460590878202, -0.7723774476940868, 0.00012528923976695694]
    },
    modular: "综合态势分析"
  })
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "20px") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "20px") // 设置地图工具栏距底部距离
})
</script>
<template>
  <div class="map3d">
    <div
      class="map-box"
      id="map3d"
    ></div>
    <MapPopup
      ref="popupRef"
      :type="1"
      :format-name="popupFormatType"
      :info="popupInfo"
      @closePopup="removePopup"
    />
    <div class="section-bar">
      <!-- <MapFeatureSearch
        :features="vectorFeatures"
        @location="locationMap"
      /> -->
      <MapLayerManage
        modular="综合态势分析"
        :init-checked-keys="[35]"
        @addLayer="addLayerManageData"
        @removeLayer="removeLayerManageData"
      />
    </div>
    <!-- <ZoomControl /> -->
    <MapTool
      :hiddenTools="['measure', 'clear', 'fullscreen', 'toggleSidebar']"
      @switchMap="setBaseMapType"
    />
  </div>
</template>

<style lang="scss" scoped>
.map3d {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .map-box {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .section-bar {
    position: absolute;
    top: 20px;
    right: var(--maptool-sidebar-right);
    display: flex;
    gap: 15px;
    height: 32px;
    transition: all 0.3s ease-in-out;
    z-index: 1;
  }
  :deep(#navigationDiv) {
    .compass {
      top: 20px;
      right: 200px;
    }
  }
}
</style>
