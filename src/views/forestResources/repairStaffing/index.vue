<script lang="ts" setup>
import PageTabs from "../components/PageTabs.vue"
import Edit from "./edit.vue"
import List from "./list.vue"

defineOptions({
  name: "RepairStaffing"
})
const { showCSB } = storeToRefs(useConfigStore())
const popup = ref<any>(null)
const modular = ref("森林资源一张图")
const {
  vectorFeatures,
  locationMap,
  closePopup,
  popupInfo,
  map,
  popupFormatType,
  addLayerManageData,
  removeLayerManageData
} = useOlMap(popup, {
  popupFormatType: "",
  zoom: 13,
  center: [116.1292869, 31.036022],
  modular: modular.value,
  openOverlay: false,
  overlayOffset: [0, -60],
  overlayPositioning: "bottom-center",
  vectorLayerMode: "vectorImage",
  vectorLayerDeclutter: true
})
const data = ref<any>(null) // list单条数据
const showEdit = ref(false)
const editType = ref("")
// 新增
const handleToAdd = (bo: boolean) => {
  showEdit.value = bo
  editType.value = "新增"
}
// list点击查看
const handleToView = (item: any) => {
  editType.value = "查看"
  data.value = item
  showEdit.value = true
}
//点击编辑
const updateType = (type: any) => {
  editType.value = type
  showEdit.value = true
}
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "450px") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "20px") // 设置地图工具栏距底部距离
})
</script>

<template>
  <div class="record">
    <PageTabs class="pages-tabs" />
    <div class="section-bar">
      <MapFeatureSearch
        :features="vectorFeatures"
        @location="locationMap"
      />
      <MapLayerManage
        :modular="modular"
        :init-checked-keys="[533]"
        @addLayer="addLayerManageData"
        @removeLayer="removeLayerManageData"
      />
    </div>
    <div
      class="map-box"
      id="map"
    >
      <MapPopup
        ref="popup"
        :type="2"
        :format-name="popupFormatType"
        :info="popupInfo"
        @close="closePopup"
      />
      <MapTool
        v-if="map"
        :map="map"
      />
      <!-- <MapLegend /> -->
      <List
        v-show="!showEdit && showCSB"
        @handleToAdd="handleToAdd"
        @handleToView="handleToView"
      />
      <transition
        name="el-fade-in"
        mode="out-in"
      >
        <Edit
          v-show="showEdit && showCSB"
          v-model:show="showEdit"
          :data="data"
          :map="map"
          v-model:type="editType"
        />
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.record {
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
