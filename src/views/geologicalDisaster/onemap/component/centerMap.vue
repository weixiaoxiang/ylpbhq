<template>
  <div class="patrolOverview-section">
    <div
      class="map"
      id="map1"
    ></div>

    <Popup class="popup" />
    <LayerControl
      class="LayerControl"
      ref="layerControlRef"
      @loadFeatures="mapInit?.loadFeatures"
      @removeFeature="mapInit?.removeFeature"
      @loadJX="mapInit?.loadJxAndGqh"
      identification="dzzhjc"
    />
  </div>
</template>

<script setup lang="ts">
import Popup from "./popup.vue"
import Overlay from "ol/Overlay"
let mapInit: any = null

onMounted(() => {})

const emit = defineEmits(["update:modelValue"])
onBeforeUnmount(() => {})
</script>
<style lang="scss" scoped>
.patrolOverview-section {
  position: relative;
  width: 100%;
  height: vh(620);
  margin: 20px 0;
  overflow: hidden;
  z-index: 0;
  box-sizing: border-box;
  border: 1.2px solid;
  border-image: linear-gradient(180deg, rgba(193, 242, 224, 0.15) 8%, rgba(255, 255, 255, 0.35) 75%);

  .popup {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 150px;
    top: 80px;
    z-index: 999;
  }
  .map {
    width: 100%;
    height: 100%;
    :deep(.ol-overlaycontainer-stopevent) {
      z-index: 9999 !important;
    }
  }
  .search {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 2;

    .icon {
      position: absolute;
      right: 0;
      top: 0;
      width: 40px;
      height: 40px;
      cursor: pointer;
    }
  }

  :deep(.search-box) {
    display: flex;
    align-items: center;
    position: absolute;
    pointer-events: all;
    top: 20px;
    left: 20px;
    width: 280px;
    z-index: 99;

    .el-input__wrapper {
      width: 200px;
      height: 34px;
      line-height: 34px;
      background: rgba(12, 42, 40, 0.85);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35) inset;
      border-radius: 0;

      .el-input__inner {
        height: 34px;
        line-height: 34px;
        color: #fff;
      }
    }

    .el-select__input {
      color: #fff;
    }
  }
  :deep(.LayerControl) {
    right: 20px;
    top: 80px;

    .treebox {
      max-height: calc(100vh - vh(118) - 120px - 310px);
    }
  }
}
</style>
