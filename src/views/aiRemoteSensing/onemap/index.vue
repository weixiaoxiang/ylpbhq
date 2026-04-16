<script setup lang="ts">
import Left1 from "./component/left1.vue"
import Left2 from "./component/left2.vue"
import Right1 from "./component/right1.vue"
import Right2 from "./component/right2.vue"
const popup = ref<any>(null)
const modular = ref("AI+遥感一张图")
const { showCSB } = storeToRefs(useConfigStore())

const {
  closePopup,
  popupFormatType,
  popupInfo,
  map,
  vectorFeatures,
  locationMap,
  addLayerManageData,
  removeLayerManageData
} = useOlMap(popup, {
  zoom: 13,
  center: [116.11027952, 31.029082],
  modular: modular.value,
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center",
  vectorLayerDeclutter: false,
  showClusterLayer: false
})

const showDataPanel = ref(false)
const closeDataPanel = () => {
  initTabParams.value = null
}
const initTab = ref<any>(null)
const initTabParams = ref<any>(null)
// 点击地图弹框中点击查看历史AI分析记录
const handleHistoryData = (data: any) => {
  initTab.value = "AI分析记录"
  initTabParams.value = data
  showDataPanel.value = true
}

const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "calc(20px)") // 设置地图工具栏距底部距离
})
</script>
<template>
  <div class="AIRemoteSensing-page">
    <div
      class="map"
      id="map"
    >
      <MapPopup
        ref="popup"
        :format-name="popupFormatType"
        :info="popupInfo"
        @close="closePopup"
        @handleHistoryDataClick="handleHistoryData"
      />
      <MapTool
        v-if="map"
        :map="map"
      />
    </div>
    <div class="section-bar">
      <MapFeatureSearch
        :features="vectorFeatures"
        @location="locationMap"
      />
      <MapLayerManage
        :init-checked-keys="[35]"
        @addLayer="addLayerManageData"
        @removeLayer="removeLayerManageData"
      />
    </div>
    <transition
      enter-active-class="animate__animated animate__bounceInLeft"
      leave-active-class="animate__animated animate__fadeOut"
      appear
      appear-active-class="animate__animated animate__bounceInLeft"
    >
      <div
        v-show="showCSB"
        class="left"
      >
        <Left1 />
        <Left2 />
      </div>
    </transition>
    <transition
      enter-active-class="animate__animated animate__bounceInRight"
      leave-active-class="animate__animated animate__fadeOut"
      appear
      appear-active-class="animate__animated animate__bounceInRight"
    >
      <div
        v-show="showCSB"
        class="right"
      >
        <Right1 />
        <Right2
          v-if="map"
          :map="map"
          :features="vectorFeatures"
        />
      </div>
    </transition>
    <Modal
      id="dataPanel"
      v-model:show="showDataPanel"
      disable-zoom
      :close-on-click-modal="false"
      @close="closeDataPanel"
    >
      <template v-slot:container>
        <PanelData
          :tab="initTab"
          :tab-params="initTabParams"
        />
      </template>
    </Modal>
  </div>
</template>

<style lang="scss" scoped>
.AIRemoteSensing-page {
  display: flex;
  justify-content: space-between;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0 20px;
  overflow: hidden;
  .section-bar {
    position: absolute;
    top: 20px;
    // right: calc(21.875vw + 40px);
    right: var(--maptool-sidebar-right);
    display: flex;
    gap: 15px;
    height: 32px;
    z-index: 1;
    transition: all 0.3s ease-in-out;
  }
  .map {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;

    .popup {
      position: absolute;
      left: 550px;
      top: 80px;
      z-index: 999;
    }
    :deep(.ol-overlaycontainer-stopevent) {
      z-index: 9999 !important;
    }

    :deep(.ol-rotate-reset) {
      display: none;
    }
    :deep(.ol-zoom-in) {
      display: none;
    }
    :deep(.ol-zoom-out) {
      display: none;
    }
  }
  .left {
    margin-top: vh(20);
    bottom: vh(20);
    z-index: 9;
    width: vw(420);
  }
  .right {
    margin-top: vh(20);
    bottom: vh(20);
    z-index: 9;
    width: vw(420);
  }
}
</style>
<style lang="scss"></style>
