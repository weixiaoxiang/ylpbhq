<script lang="ts" setup>
import { GetSys_LayerImageInformation_Bch } from "@/api"

interface Props {
  filterId?: number | null // 过滤id
  initCheckedKeys?: any[] | null // 默认选中节点
  map?: any // 地图实例
  initShow?: boolean // 默认是否显示图层选择
}
const props = withDefaults(defineProps<Props>(), {
  filterId: null,
  initCheckedKeys: null,
  initShow: true
})
const map = toRaw(props.map)
const layers: any = {}
// 获得地图影像
const getMapLayerData = (node: any) => {
  let map_img = new TileLayer({
    source: new XYZ({
      url: node.url + "{z}/{y}/{x}.png"
    }),
    visible: true
  })
  map_img.set("title", "基础影像底图选择(美图)")
  map.addLayer(map_img)
  layers[node.id] = map_img
}
// 移除地图影像
const removeMapLayerData = (node: any) => {
  if (layers[node.id]) {
    map.removeLayer(layers[node.id])
  }
}

const showMapLegend = ref(props.initShow)
const handleShowMapLegend = () => {
  showMapLegend.value = !showMapLegend.value
}
// 地图树形结构数据
const treeRef = ref<any>(null)
const mapTreeData = ref<any[]>([])
const getBaseLayerTreeData = async () => {
  const { response: imglist } = await GetSys_LayerImageInformation_Bch()

  const treeData = imglist
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
        const nodes: any = findNodes(mapTreeData.value, item, { children: "list", key: "id" })
        if (nodes?.length > 0) {
          const descendants = findDescendants(mapTreeData.value, nodes[0].id, { children: "list", hasChildren: false })
          descendants?.push(nodes[0])
          handleCheck(null, { checkedNodes: descendants })
        }
      })
    } else {
      // 默认选中第一个
      treeRef.value.setCheckedKeys([mapTreeData.value[0].id])
      const descendants = findDescendants(mapTreeData.value, mapTreeData.value[0].id, {
        children: "list",
        hasChildren: false
      })
      descendants?.push(mapTreeData.value[0])
      handleCheck(null, { checkedNodes: descendants })
    }
  }
}
const defaultProps = ref({
  children: "list",
  label: "name"
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
  const nodes = checkedNodes.filter((item: any) => !item.list)
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
    getBaseLayerTreeData()
  }, 200)
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
      <span>影像数据集</span>
      <i-ep-arrow-down />
    </div>
    <div
      class="box-bottom"
      :class="{ active: showMapLegend }"
    >
      <el-scrollbar max-height="240px">
        <el-tree
          v-loading="loading"
          element-loading-text="数据加载中..."
          :element-loading-spinner="svg"
          element-loading-svg-view-box="-10, -10, 50, 50"
          element-loading-background="rgba(9, 58, 121, 0.6)"
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
              {{ data.name }}
            </div>
            <div
              v-else
              class="child-node-label"
            >
              <span class="label-text"> {{ data.name }}</span>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
