<script lang="ts" setup>
import { GetSys_LayermanagerDirec, GetZH_LayerManager } from "@/api"

interface Props {
  filterId?: number | null // 过滤id
  initCheckedKeys?: any[] | null // 默认选中节点
  modular?: string // 模块名称
  initShow?: boolean // 默认是否显示图层选择
  initLegendCheckbox?: boolean // 是否显示图层选择
  declutter?: boolean // 是否整理点
  cluster?: boolean // 是否开启点聚合
}
const props = withDefaults(defineProps<Props>(), {
  filterId: null,
  initCheckedKeys: null,
  modular: "",
  initShow: true,
  initLegendCheckbox: false,
  declutter: false,
  cluster: false
})
const emit = defineEmits<{
  addLayer: [any, any]
  removeLayer: [any]
  setDeclutter: [any]
  setCluster: [any]
}>()
const declutter = ref<boolean>(props.declutter)
const cluster = ref<boolean>(props.cluster)
// 整理点
const handleDeclutter = () => {
  // console.log(declutter.value)
  emit("setDeclutter", declutter.value)
}
// 开启点聚合
const handleCluster = () => {
  // console.log(cluster.value)
  emit("setCluster", cluster.value)
}
// 获得地图所有数据
const getMapLayerData = async (node: any) => {
  return GetZH_LayerManager({
    layerid: node.id
  }).then((res: any) => {
    const data = res.response
    emit("addLayer", data, {
      id: node.id,
      mc: node.mc,
      geometryType: node.tabtype === 0 ? "point" : node.tabtype === 1 ? "line" : "polygon",
      legend: node.legend,
      tabchname: node.tabchname,
      tabname: node.tabname,
      searchfiled: node.searchfiled,
      searchfiledch: node.searchfiledch
    })
  })
}
// 移除地图数据
const removeMapLayerData = (node: any) => {
  emit("removeLayer", node)
}

const showMapLegend = ref(props.initShow)
const handleShowMapLegend = () => {
  showMapLegend.value = !showMapLegend.value
}
// 地图树形结构数据
const treeRef = ref<any>(null)
const mapTreeData = ref<any[]>([])
const getMapTreeData = async () => {
  const { response } = await GetSys_LayermanagerDirec({
    mkname: props.modular ? "," + props.modular + "," : ""
  })
  // const s: any[] = []
  // 格式图例
  response.forEach((item: any) => {
    if (item.legendcolour) {
      const legendcolour = JSON.parse(item.legendcolour)
      item.legend = legendcolour
    }
  })
  const treeData = arrayToTree(response, {
    id: "id",
    children: "children",
    pid: "parentid"
  })
  if (treeData) {
    if (props.filterId) {
      mapTreeData.value = findDescendants(treeData, props.filterId, { format: "tree" }) as any
    } else {
      mapTreeData.value = treeData
    }
    if (!mapTreeData.value || mapTreeData.value?.length === 0) {
      return
    }
    if (props.initCheckedKeys) {
      treeRef.value.setCheckedKeys(props.initCheckedKeys)
      // 遍历每一个
      props.initCheckedKeys.forEach((item: any) => {
        const nodes: any = findNodes(mapTreeData.value, item, { key: "id" })
        if (nodes?.length > 0) {
          const descendants = findDescendants(mapTreeData.value, nodes[0].id, { hasChildren: false })
          descendants?.push(nodes[0])
          handleCheck(null, { checkedNodes: descendants })
        }
      })
    } else {
      // 默认选中第一个
      treeRef.value.setCheckedKeys([mapTreeData.value[0].id])
      const descendants = findDescendants(mapTreeData.value, mapTreeData.value[0].id, { hasChildren: false })
      descendants?.push(mapTreeData.value[0])
      handleCheck(null, { checkedNodes: descendants })
    }
  }
}
const defaultProps = ref({
  children: "children",
  label: "mc"
})

const loading = ref(false)
const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
// 记录上一次选中的节点
let lastCheckedKeys: any = []
// 选中节点
const handleCheck = async (_: any, b: any) => {
  // console.log(JSON.parse(JSON.stringify(b.checkedKeys)))
  loading.value = true
  const checkedNodes = b.checkedNodes
  const nodes = checkedNodes.filter((item: any) => !item.children)
  // 计算新增的节点
  const addedNodes = nodes.filter((node: any) => !lastCheckedKeys.find((item: any) => item.id === node.id))
  // 计算移除的节点
  const removedNodes = lastCheckedKeys.filter((node: any) => !nodes.find((item: any) => item.id === node.id))
  // 更新lastCheckedKeys为当前选中的节点
  lastCheckedKeys = nodes
  // 添加地图数据
  const promiseArr: any[] = []
  addedNodes.forEach((node: any) => {
    promiseArr.push(getMapLayerData(node))
  })

  Promise.all(promiseArr).then((_: any) => {
    loading.value = false
  })
  // 移除地图数据
  removedNodes.forEach((node: any) => {
    removeMapLayerData(node)
  })
}
let timer: any = null
onMounted(() => {
  // 为了页面首屏加载不卡顿，延迟0.2秒加载地图图层及数据
  timer = setTimeout(() => {
    getMapTreeData()
  }, 500)
})
onBeforeUnmount(() => {
  timer && clearTimeout(timer)
})
</script>
<template>
  <div class="map-legend-box">
    <div
      class="map-legend-name"
      @click="handleShowMapLegend"
    >
      <span>地图图例</span>
      <i-ep-arrow-down
        class="arrow-down"
        :class="{ active: showMapLegend }"
      />
    </div>
    <div
      v-loading="loading"
      element-loading-text="数据加载中..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(9, 58, 121, 0.6)"
      class="box-bottom"
      :class="{ active: showMapLegend }"
    >
      <div
        v-if="initLegendCheckbox"
        class="map-legend-checkbox"
      >
        <el-checkbox
          v-model="declutter"
          label="整理"
          @change="handleDeclutter"
        />
        <el-checkbox
          v-model="cluster"
          label="聚合"
          @change="handleCluster"
        />
      </div>
      <el-scrollbar max-height="240px">
        <el-tree
          ref="treeRef"
          :data="mapTreeData"
          show-checkbox
          node-key="id"
          :props="defaultProps"
          :default-expand-all="true"
          @check="handleCheck"
        >
          <template #default="{ data }">
            <div
              v-if="data.children"
              class="father-node-label"
            >
              {{ data.mc }}
            </div>
            <div
              v-else
              class="child-node-label"
            >
              <img
                v-if="data.tabtype === 0"
                class="legend-point"
                :src="'/statisUrl/' + data.legend[0].icon"
                alt=""
              />
              <div
                v-else-if="data.tabtype === 1"
                class="legend-line"
                :style="{
                  background: data.legend[0].strokecolor
                }"
              ></div>
              <div
                v-else-if="data.tabtype === 2"
                class="legend-polygon"
                :style="{
                  background: data.legend[0].fillcolor,
                  borderColor: data.legend[0].strokecolor
                }"
              ></div>
              <span class="label-text"> {{ data.mc }}</span>
              <span v-if="[63, 64, 65, 66, 67].includes(data.id)">({{ data.count }})</span>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss">
// 自定义图例图框的样式
.map-legend-box {
  width: fit-content;
  min-width: 145px;
  background-color: #0c284d;
  border-radius: 2px;
  color: #aab4c1;
  .map-legend-name {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.5208vw;
    border: 1px solid #304868;
    cursor: pointer;
    user-select: none;
    .arrow-down {
      transition: transform 0.3s ease-in-out;
      &.active {
        transform: rotate(180deg);
      }
    }
  }
  .box-bottom {
    width: 100%;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
    opacity: 0.9;
    &.active {
      max-height: calc(240px + 24px);
    }
    .map-legend-checkbox {
      background-color: #0c284d;
      color: #aab4c1;
      padding: 0.5208vw 0.5208vw 0 0.5208vw;
      border-left: 1px solid #304868;
      border-right: 1px solid #304868;
      border-bottom: 1px solid #304868;
      .el-checkbox {
        margin-right: 0.7813vw;
        height: 24px;
      }
      .el-checkbox__label {
        color: #aab4c1;
      }
      .el-checkbox__inner {
        background-color: #0c284d;
        border: 1px solid #304868;
      }
      .el-checkbox__input.is-checked .el-checkbox__inner {
        background-color: #0a438d;
      }
      .el-checkbox__input.is-checked .el-checkbox__inner:after {
        color: #aab4c1;
      }
    }
    .el-tree {
      margin-top: 0px;
      background-color: #0c284d;
      color: #aab4c1;
      border: 1px solid #304868;
      border-top: none;
      padding: 0.5208vw;
      .el-tree-node__content:hover {
        background-color: transparent;
      }
      .el-tree-node:focus > .el-tree-node__content {
        background-color: transparent;
      }
      .el-checkbox__inner {
        background-color: #0c284d;
        border: 1px solid #304868;
      }
      .el-checkbox__input.is-checked .el-checkbox__inner {
        background-color: #0a438d;
      }
      .el-checkbox__input.is-checked .el-checkbox__inner:after {
        color: #aab4c1;
      }
      /* 隐藏所有折叠图标 */
      .el-tree-node__expand-icon {
        display: none;
      }

      /* 移除图标占位，避免多余的缩进 */
      // .el-tree-node__content {
      //   padding-left: 10px !important;
      // }
      .child-node-label {
        display: flex;
        align-items: center;
        gap: 5px;
        .legend-point {
          // width: 18px;
          height: 20px;
        }
        .legend-line {
          width: 18px;
          height: 2px;
        }
        .legend-polygon {
          width: 18px;
          height: 10px;
          border-width: 2px;
          border-style: solid;
          border-color: #fff;
        }
      }
    }
  }
}
</style>
