<script lang="ts" setup>
import PageTabs from "../components/PageTabs.vue"
import Edit from "./edit.vue"
import List from "./list.vue"

defineOptions({
  name: "PatrolRecord"
})
const route = useRoute()
const { showCSB } = storeToRefs(useConfigStore())
const popup = ref<any>(null)
const { closePopup, map, addLayerManageData, removeLayerManageData } = useOlMap(popup)
const data = ref<any>(null) // list单条数据
const showEdit = ref(false)
// list点击查看
const handleToView = (item: any) => {
  data.value = item
  showEdit.value = true
}

// 通过点击巡护概况-查看人员历史巡护数据，初始化list参数
const initListParams = ref<any>(route.query?.userid ? { userid: Number(route.query.userid) } : null)

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
      <MapPopup
        ref="popup"
        :type="3"
        @close="closePopup"
      />
      <MapTool
        v-if="map"
        :map="map"
      />
      <MapLegend />
      <List
        v-show="!showEdit && showCSB"
        v-bind="initListParams ? { initParams: initListParams } : {}"
        @handleToView="handleToView"
      />
      <transition
        name="el-fade-in"
        mode="out-in"
      >
        <Edit
          v-if="showEdit && showCSB"
          v-model:show="showEdit"
          :data="data"
          :map="map"
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
