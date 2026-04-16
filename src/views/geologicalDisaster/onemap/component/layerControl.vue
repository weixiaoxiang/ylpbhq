<template>
  <div class="layerControl-section">
    <div class="layerControl">
      <div class="map-legend-box">
        <div
          class="map-legend"
          @click="handleShowMapLegend"
        >
          <span>地图图例</span>
          <i-ep-arrow-down />
        </div>
        <div
          class="box-bottom"
          :class="{ active: showMapLegend }"
        >
          <el-scrollbar max-height="240px">
            <el-tree
              v-loading="loading"
              element-loading-background="rgba(9, 58, 121, 0.6)"
              ref="treeRef"
              :data="treeData"
              show-checkbox
              node-key="Id"
              :props="defaultProps"
              default-expand-all
              @check-change="handleCheckNode"
            />
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// import { handleTree } from "@/utils/tree"
// import { geographicalInfoApi } from "@/api/GeographicalInformationSystem/index"
// import { localResourcesApi } from "@/api/ScientificResearch"
const props = defineProps({
  identification: {
    type: String,
    default: ""
  },
  activeLayer: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const showMapLegend = ref(true)
const handleShowMapLegend = () => {
  showMapLegend.value = !showMapLegend.value
}
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
const showLayer = ref(false)
const emit = defineEmits(["loadFeatures", "removeFeature", "loadJX"])
const defaultProps = ref<any>({
  label: "name",
  children: "children"
})
const treeRef = ref<any>(null)
const treeData = ref<any>([
  {
    id: 1,
    name: "保护区界限",
    children: [
      {
        id: 2,
        name: "勘界后"
      },
      {
        id: 3,
        name: "勘界前"
      }
    ]
  }
])
const loading = ref<boolean>(false)
const { proxy } = getCurrentInstance() as any
const handleCheckNode = (node: any, bo: any) => {
  // if (node.children?.length > 0) return
  // if (bo) {
  //   if (node?.type == "保护区界线") {
  //     emit("loadJX", {
  //       name: node.name,
  //       show: true
  //     })
  //     proxy.$mitt.emit("legendData", {
  //       name: node.name,
  //       data: JSON.parse(node.text),
  //       type: "add"
  //     })
  //   } else if (node?.type == "本底资源") {
  //     getAnimalList(node)
  //   } else {
  //     layerSearch(node)
  //   }
  // } else {
  //   if (node?.type == "保护区界线") {
  //     emit("loadJX", {
  //       name: node.name,
  //       show: false
  //     })
  //     proxy.$mitt.emit("legendData", {
  //       name: node.name,
  //       data: JSON.parse(node.text),
  //       type: "remove"
  //     })
  //   } else {
  //     emit("removeFeature", node.Id)
  //   }
  // }
}
const layerSearch = (node) => {
  node.disabled = true
  geographicalInfoApi
    .GetGeographicLayer({
      treeId: node.Id
    })
    .then((res) => {
      node.disabled = false
      if (res.success && res.response) {
        let data: any = res.response.map((item: any) => {
          item.featureType = node?.type
          item.pointType = node?.name
          item.icon = node?.icon
          item.frame = node?.frame
          item.fill = node?.fill
          return item
        })
        emit("loadFeatures", data)
      }
    })
}
//查询数据
const getData = () => {
  geographicalInfoApi
    .GetGeographicTree({
      identification: props.identification
    })
    .then((res) => {
      if (res.success) {
        let ids: any = []
        let data = res.response.map((item) => {
          if (item?.name == "勘界前") {
            ids.push(item.Id)
          }
          return item
        })
        treeData.value = handleTree(data, "Id", "pId", "children")
        setTimeout(() => {
          if (props.activeLayer?.length > 0) {
            ids.push(...props.activeLayer)
          }
          treeRef.value.setCheckedKeys(ids)
        }, 500)
      }
    })
}
const getStyle = (row) => {
  if (row.type == "线") {
    return {
      width: "20px",
      height: "2px",
      background: row.frame
    }
  } else if (row.type == "面") {
    return {
      width: "20px",
      height: "20px",
      background: row.fill,
      border: `1px solid ${row.frame}`
    }
  }
}
//获取动植物列表
const getAnimalList = (node) => {
  let name = node.name
  let zxwz = false
  let type = ""
  if (name == "动物" || name == "植物") {
    type = name
  } else if (name == "珍稀植物") {
    zxwz = true
    type = "植物"
  } else if (name == "珍稀动物") {
    zxwz = true
    type = "动物"
  }

  let query = {
    page: 1,
    intPageSize: 9999,
    zxwz: zxwz,
    type: type
  }
  localResourcesApi.getPageResources(query).then((res) => {
    if (res.success) {
      let data = res.response.data
      data = data.map((item: any) => {
        let obj = {
          mc: item.mc,
          geom: `POINT(${item.lon * 1} ${item.lat * 1})`,
          pointType: "本底资源",
          type: item.type,
          id: item.Id,
          treeid: node.Id,
          icon: node.icon,
          zxwz: item.zxwz,
          alias: item.alias,
          classify: item.classify,
          fileUrl: item.fileUrl,
          ke: item.ke,
          shu: item.shu,
          plevel: item.plevel,
          ldmc: item.ldmc
        }
        return obj
      })
      emit("loadFeatures", data)
    }
  })
}
onMounted(() => {
  // getData()
})
</script>

<style lang="scss" scoped>
// $topHeaderHeight: vh(118);
.layerControl-section {
  position: absolute;
  top: vh(40);
  // right: vw(850);
  right: calc(23vw);
  .icon {
    width: 40px;
    height: 40px;
    margin-bottom: 20px;
    cursor: pointer;
    pointer-events: all;
  }
}
.layerControl {
  position: absolute;
  width: 170px;
  top: 0;
  right: 80px;
  // background-color: rgba(4, 46, 46, 0.75);
  box-shadow: 0px 0px 13px 0px rgba(42, 42, 42, 0.18);
  transition: height 0.5s;
  // z-index: 999;
  // color: #fff;
  pointer-events: all;

  .map-legend-box {
    width: 140px;
    background-color: #0c284d;
    border-radius: 2px;
    color: #aab4c1;
    .map-legend {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 0.5208vw;
      border: 1px solid #304868;
      cursor: pointer;
      user-select: none;
    }
    .box-bottom {
      width: 100%;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.1s ease-in-out;
      &.active {
        max-height: 240px;
      }
      .el-tree {
        margin-top: 0px;
        background-color: #0c284d;
        color: #aab4c1;
        border: 1px solid #304868;
        border-top: none;
        padding: 0.5208vw;
        :deep(.el-tree-node__content:hover) {
          background-color: transparent;
        }
        .el-tree-node:focus > .el-tree-node__content {
          background-color: transparent;
        }
        :deep(.el-checkbox__inner) {
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
      }
    }
  }
}

.operate-box {
  position: relative;
  width: 100%;
  height: 100%;
}

:deep(.el-loading-mask) {
  background-color: transparent;
}

:deep(.el-loading-spinner .path) {
  stroke: rgba(1, 255, 209, 1);
}

.header {
  position: relative;
  display: flex;
  align-items: center;
  height: 36px;
  // border-top: 2px solid rgba(1, 255, 209, 1);
  background: #0c284d;
  padding: 4px 10px 6px;
  font-size: 16px;
  font-weight: 550;
  color: #fff;

  line-height: 36px;

  border: 1px solid #304868;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;

  img {
    width: 30px;
    height: 30px;
    margin-right: 8px;
  }
}

.treebox {
  padding: 10px;
  max-height: 600px;
  box-sizing: border-box;
  overflow: auto;
  background: #0c284db2;
  opacity: 0.4;

  :deep(.el-tree) {
    background-color: transparent;
    color: #fff;
    --el-tree-node-hover-bg-color: unset;

    .el-tree-node__content:hover {
      background-color: transparent;
    }

    .el-checkbox__inner {
      background-color: #06172c;
      border: 1px solid #365375;
    }

    .el-checkbox__input.is-checked .el-checkbox__inner {
      background: #0c284db2;
    }

    .el-tree-node__content:hover {
      background: #0c284db2;
      // color: #fff;
    }

    .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
      background: #0c284db2;
      color: #fff;
    }

    .el-tree-node__expand-icon {
      color: #fff;
      font-size: 18px;
    }

    .el-tree-node__content {
      position: relative;
      height: 36px;
      margin-bottom: 1px;
      // background: #fff;
    }
    .custom-tree-node {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding-right: 10px;
      .icon1 {
        img {
          width: 20px;
          height: 20px;
        }
      }
    }
  }
}
</style>
