<script lang="ts" setup>
import MapDrawBar from "../components/MapDrawBar.vue"
import MapLegend from "@/components/Map/MapLegend.vue"
import MapTool from "@/components/Map/MapTool.vue"
import PageTabs from "../components/PageTabs.vue"
import edit from "./edit.vue"
import list from "./list.vue"
import { Getxh_taskclockinByPage } from "@/api"
defineOptions({
  name: "TaskRoute"
})
// 图例
const legendList = ref([
  {
    label: "巡护起点",
    icon: "legend-icon1.png"
  },
  {
    label: "巡护终点",
    icon: "legend-icon2.png"
  },
  {
    label: "计划打卡点",
    icon: "legend-icon4.png"
  }
])
const popup = ref<any>(null)
const { map, getLineStringFeature, getPointFeatures, addLayerManageData, removeLayerManageData } = useOlMap(popup)
const showEdit = ref(false)
const editType = ref<string>("新增路线")
const drawBarData = ref<any>(null) // drawBar组件的数据
const data = ref<any>(null) // list单条数据
const handleDrawChange = (data: any) => {
  drawBarData.value = data
}
const handleToAdd = (bo: boolean) => {
  modifyFeatures.value = null
  showEdit.value = bo
  editType.value = "新增路线"
}
const modifyFeatures = shallowRef<any>([])
// 查看路线
const handleToView = async (item: any) => {
  const { response, success } = await Getxh_taskclockinByPage({ lxid: item.Id })
  if (success) {
    const points = response.data
    item.points = points
    modifyFeatures.value = [getLineStringFeature(item.geom), ...getPointFeatures(points)]
  } else {
    // console.log([getLineStringFeature(item.geom)])
    modifyFeatures.value = [getLineStringFeature(item.geom)]
  }
  showEdit.value = true
  editType.value = "查看路线"
  data.value = item
}
const { showCSB } = storeToRefs(useConfigStore())
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "450px") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "20px") // 设置地图工具栏距底部距离
})
</script>

<template>
  <div class="task-route">
    <PageTabs class="pages-tabs" />
    <div class="section-bar">
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
      <!-- <MapPopup
        ref="popup"
        :type="3"
        @close="closePopup"
      /> -->
      <MapTool
        v-if="map"
        :map="map"
      />
      <MapLegend :list="legendList" />
      <MapDrawBar
        v-if="map && showEdit"
        :map="map"
        :loadFeatures="modifyFeatures"
        :type="editType"
        @change="handleDrawChange"
      />
      <list
        v-show="!showEdit && showCSB"
        @handleToAdd="handleToAdd"
        @handleToView="handleToView"
      />
      <transition
        name="el-fade-in"
        mode="out-in"
      >
        <edit
          v-show="showEdit && showCSB"
          :draw-data="drawBarData"
          :data="data"
          v-model:show="showEdit"
          v-model:type="editType"
        />
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.task-route {
  position: relative;
  height: 100%;
  .pages-tabs {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
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
}
</style>
