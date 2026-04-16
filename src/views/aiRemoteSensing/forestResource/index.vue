<template>
  <div class="forestResource">
    <div class="section-bar">
      <Legend @changeResource="changeResource" />
      <MapLayerManage
        :filter-id="33"
        :init-checked-keys="[35]"
        @addLayer="addLayerManageData"
        @removeLayer="removeLayerManageData"
      />
    </div>
    <div
      class="map-box"
      id="map"
    >
      <MapDetailPopup
        ref="detailPopup"
        @close="closePop"
        :detailData="detailData"
      />
      <MapTool
        v-if="map"
        :map="map"
      />
    </div>
    <div class="left">
      <transition
        enter-active-class="animate__animated animate__bounceInLeft"
        leave-active-class="animate__animated animate__bounceOutLeft"
        appear
        appear-active-class="animate__animated animate__bounceInLeft"
      >
        <Left
          v-show="showCSB"
          :selectName="selectName"
          @getResource="loadResource"
          @handleRowClick="handleRowClick"
        />
      </transition>
    </div>
    <!-- <div class="section-bar1">
      <Legend @changeResource="changeResource" />
    </div> -->
  </div>
</template>

<script lang="ts" setup>
import Left from "./component/left.vue"
import Legend from "./component/legend.vue"
import MapDetailPopup from "./component/popup.vue"
const detailPopup = ref<any>()
const { map, addLayerManageData, removeLayerManageData } = useOlMap()
import { useMap } from "./component/map"
const { showCSB } = storeToRefs(useConfigStore())
const { initMap, loadResource, changeResourceType, loadPopup, closePop, detailData, handleRowClick } = useMap()
const { setVariable } = useCssVariables()
const selectName = ref<any>(null)
// 改变资源类型
const changeResource = (type: any) => {
  selectName.value = type
  nextTick(() => {
    changeResourceType(type.value)
  })
}
onMounted(() => {
  setVariable("maptool-sidebar-right", "20px") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "20px") // 设置地图工具栏距底部距离
  // setVariable("maptool-sidebar-right", "calc(21.875vw + 40px)") // 设置地图工具栏距右侧距离
  nextTick(() => {
    initMap(map.value)
    loadPopup(detailPopup.value.$el)
  })
})
</script>

<style lang="scss" scoped>
.forestResource {
  position: relative;
  width: 100%;
  height: 100%;
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
  .map-box {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .section-bar1 {
    position: absolute;
    top: 20px;
    // right: calc(21.875vw + 40px);
    left: var(--maptool-sidebar-right);
    display: flex;
    gap: 15px;
    z-index: 1;
    transition: all 0.3s ease-in-out;
  }
  .left {
    position: absolute;
    top: 20px;
    bottom: 20px;
    left: 20px;
    z-index: 1;
    width: 21.875vw;
    overflow: hidden;
  }
}
</style>
