<script lang="ts" setup>
import PageTabs from "../components/PageTabs.vue"
import Edit from "./edit.vue"
import List from "./list.vue"
import { Deletexh_taskinfo } from "@/api"
defineOptions({
  name: "Task"
})
const proxy = getCurrentInstance()!.proxy as any
const popup = ref<any>(null)
const { closePopup, map, addLayerManageData, removeLayerManageData } = useOlMap(popup)
const data = ref<any>(null) // list单条数据
const showEdit = ref(false)
const editType = ref("")
// list点击新增
const handleToAdd = () => {
  data.value = null
  showEdit.value = true
  editType.value = "新增任务"
}
// list点击查看
const handleToView = (item: any, tab: string) => {
  data.value = item
  showEdit.value = true
  // 根据tab判断是查看任务还是查看派发
  editType.value = tab === "任务管理" ? "查看任务" : "查看派发"
}
// list点击编辑
const handleToModify = (item: any) => {
  data.value = item
  showEdit.value = true
  editType.value = "编辑任务"
}
// list点击派发
const handleToDistribute = (item: any) => {
  data.value = item
  showEdit.value = true
  editType.value = "派发任务"
}
const handleToRemove = (item: any) => {
  ElMessageBox.confirm("是否确认删除数据?", "", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { success } = await Deletexh_taskinfo({
        id: item.Id
      })
      if (success) {
        ElMessage({
          type: "success",
          message: "删除成功"
        })
      } else {
        ElMessage({
          type: "error",
          message: "删除失败"
        })
      }
      proxy.$mitt.emit("refresh-list")
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消删除"
      })
    })
}
const { showCSB } = storeToRefs(useConfigStore())
const { setVariable } = useCssVariables()
onMounted(() => {
  setVariable("maptool-sidebar-right", "450px") // 设置地图工具栏距右侧距离
  setVariable("maptool-sidebar-bottom", "20px") // 设置地图工具栏距底部距离
})
</script>

<template>
  <div class="task">
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
        @handleToAdd="handleToAdd"
        @handleToView="handleToView"
        @handleToModify="handleToModify"
        @handleToDistribute="handleToDistribute"
        @handleToRemove="handleToRemove"
      />
      <transition
        name="el-fade-in"
        mode="out-in"
      >
        <Edit
          v-if="showEdit && showCSB"
          :map="map"
          v-model:show="showEdit"
          v-model:type="editType"
          :data="data"
        />
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.task {
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
