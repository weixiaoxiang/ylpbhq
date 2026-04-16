<script lang="ts" setup>
import { GetBackgroundResourcesByMenuId, GetLeftMenuByTree, GetTopNumber } from "@/api"
import { ArrowRight, Search } from "@element-plus/icons-vue"
import BaseDetail from "./BaseDetail.vue"

interface Props {
  width?: number
  height?: number
}
withDefaults(defineProps<Props>(), {})

const props = {
  children: "children",
  label: "name"
}

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
// 左侧树形结构数据
const treeData = ref<any[]>([
  // {
  //   id: 1,
  //   level: "门",
  //   name: "脊索动物门",
  //   latin: "Chordata",
  //   children: [
  //     {
  //       id: 2,
  //       level: "纲",
  //       name: "哺乳纲",
  //       latin: "Mammalia",
  //       children: [
  //         {
  //           id: 3,
  //           level: "目",
  //           name: "食肉目",
  //           latin: "Carnivora",
  //           children: [
  //             {
  //               id: 4,
  //               level: "科",
  //               name: "犬科",
  //               latin: "Canidae",
  //               children: [
  //                 {
  //                   id: 5,
  //                   level: "属",
  //                   name: "犬属",
  //                   latin: "Canis",
  //                   children: [
  //                     {
  //                       id: 6,
  //                       level: "种",
  //                       name: "家犬",
  //                       latin: "Canis lupus familiaris"
  //                     },
  //                     {
  //                       id: 66,
  //                       level: "种",
  //                       name: "狼狗",
  //                       latin: "Canis lupus familiaris"
  //                     }
  //                   ]
  //                 }
  //               ]
  //             },
  //             {
  //               id: 7,
  //               level: "科",
  //               name: "猫科",
  //               latin: "Felidae",
  //               children: [
  //                 {
  //                   id: 8,
  //                   level: "属",
  //                   name: "豹属",
  //                   latin: "Panthera",
  //                   children: [
  //                     {
  //                       id: 9,
  //                       level: "种",
  //                       name: "狮",
  //                       latin: "Panthera leo"
  //                     },
  //                     {
  //                       id: 10,
  //                       level: "种",
  //                       name: "虎",
  //                       latin: "Panthera tigris"
  //                     }
  //                   ]
  //                 }
  //               ]
  //             },
  //             {
  //               id: 11,
  //               level: "科",
  //               name: "浣熊科",
  //               latin: "Procyonidae",
  //               children: [
  //                 {
  //                   id: 12,
  //                   level: "属",
  //                   name: "浣熊属",
  //                   latin: "Procyon",
  //                   children: [
  //                     {
  //                       id: 13,
  //                       level: "种",
  //                       name: "北美浣熊",
  //                       latin: "Procyon lotor"
  //                     }
  //                   ]
  //                 }
  //               ]
  //             },
  //             {
  //               id: 14,
  //               level: "科",
  //               name: "熊科",
  //               latin: "Ursidae",
  //               children: [
  //                 {
  //                   id: 15,
  //                   level: "属",
  //                   name: "熊属",
  //                   latin: "Ursus",
  //                   children: [
  //                     {
  //                       id: 16,
  //                       level: "种",
  //                       name: "北极熊",
  //                       latin: "Ursus maritimus"
  //                     },
  //                     {
  //                       id: 17,
  //                       level: "种",
  //                       name: "棕熊",
  //                       latin: "Ursus arctos"
  //                     }
  //                   ]
  //                 }
  //               ]
  //             }
  //           ]
  //         }
  //       ]
  //     },
  //     {
  //       id: 18,
  //       level: "纲",
  //       name: "鸟纲",
  //       latin: "Aves",
  //       children: [
  //         {
  //           id: 19,
  //           level: "目",
  //           name: "雀形目",
  //           latin: "Passeriformes",
  //           children: [
  //             {
  //               id: 20,
  //               level: "科",
  //               name: "麻雀科",
  //               latin: "Passeridae",
  //               children: [
  //                 {
  //                   id: 21,
  //                   level: "属",
  //                   name: "麻雀属",
  //                   latin: "Passer",
  //                   children: [
  //                     {
  //                       id: 22,
  //                       level: "种",
  //                       name: "家麻雀",
  //                       latin: "Passer domesticus"
  //                     }
  //                   ]
  //                 }
  //               ]
  //             }
  //           ]
  //         }
  //       ]
  //     },
  //     {
  //       id: 23,
  //       level: "纲",
  //       name: "爬行动物纲",
  //       latin: "Reptilia",
  //       children: [
  //         {
  //           id: 24,
  //           level: "目",
  //           name: "鳄鱼目",
  //           latin: "Crocodylia",
  //           children: [
  //             {
  //               id: 25,
  //               level: "科",
  //               name: "鳄科",
  //               latin: "Crocodylidae",
  //               children: [
  //                 {
  //                   id: 26,
  //                   level: "属",
  //                   name: "盐水鳄属",
  //                   latin: "Crocodylus",
  //                   children: [
  //                     {
  //                       id: 27,
  //                       level: "种",
  //                       name: "咸水鳄",
  //                       latin: "Crocodylus porosus"
  //                     }
  //                   ]
  //                 }
  //               ]
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   ]
  // }
])
let initTreeData: any = []
const getTreeData = async () => {
  loading.value = true
  try {
    const { response } = await GetLeftMenuByTree({
      remark: currentTab.value === 1 ? "动物" : "植物"
    })
    response.forEach((item: any) => {
      switch (item.blevel) {
        case 1:
          item.level = "界"
          break
        case 2:
          item.level = "门"
          break
        case 3:
          item.level = "纲"
          break
        case 4:
          item.level = "目"
          break
        case 5:
          item.level = "科"
          break
        case 6:
          item.level = "属"
          break
        case 7:
          item.level = "种"
          break
        default:
          break
      }
    })
    const data = getChild1(getTop1(response), response)
    treeData.value = data
    defaultExpandedKeys.value = [data[0].id]
    initTreeData = JSON.parse(JSON.stringify(treeData.value))
  } finally {
    loading.value = false
  }
}
let searchResults: any = []
const defaultExpandedKeys = ref<any[]>([])
const breadcrumbData = ref<any[]>(["动物界"])
const keyWord = ref("")
const treeRef = ref<any>(null)
// 实现搜索方法
const searchNodes = (nodes: any[], keyword: string, results: any[]): void => {
  for (const node of nodes) {
    // 如果当前节点匹配关键字，直接添加整个节点（包含其所有子节点）
    if (node.name.toLowerCase().includes(keyword.toLowerCase())) {
      results.push(node)
      continue // 跳过子节点遍历
    }

    // 当前节点不匹配时，如果有子节点则继续搜索
    if (node.children?.length) {
      searchNodes(node.children, keyword, results)
    }
  }
}
const handleEnter = () => {
  searchResults = []
  if (keyWord.value) {
    searchNodes(initTreeData, keyWord.value, searchResults)
    // 更新树的数据源为搜索结果
    treeData.value = searchResults
    defaultExpandedKeys.value = searchResults.map((item: any) => item.id)
  } else {
    // 恢复原始数据
    treeData.value = initTreeData
    defaultExpandedKeys.value = [1]
  }
}
const handleClear = () => {
  treeData.value = initTreeData
  defaultExpandedKeys.value = [1]
}

const chartData = ref<any>(null)
const handleNodeClick = async (data: any) => {
  chartData.value = data
  if (data.blevel !== 7) {
    breadcrumbData.value = getParentNames(initTreeData, data.id)
  } else {
    breadcrumbData.value = getParentNames1(initTreeData, data.id)
  }
}
// 图谱点击事件
const showBaseDetail = ref(false)
const info = ref<any>({})
const handleChartClick = async (data: any) => {
  const { response } = await GetBackgroundResourcesByMenuId({
    menuId: data.id
  })
  info.value = response
  showBaseDetail.value = true
}
// 获得动植物数量
const quantity = ref<any>({})
const getQuantity = async () => {
  const { response } = await GetTopNumber()
  quantity.value = response
}
const currentTab = ref(1)
const changeCurrentTab = (tab: number) => {
  currentTab.value = tab
  getTreeData()
  if (tab === 1) {
    breadcrumbData.value = ["动物界"]
  } else {
    breadcrumbData.value = ["植物界"]
  }
}
onMounted(() => {
  getQuantity() // 获得动植物数量
  getTreeData() // 获得树形结构数据
})
</script>
<template>
  <div
    class="species-query"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="title-box">
      <img
        :src="$fun.getImg('researchManagement/icon14.png')"
        alt=""
      />
      物种查询
    </div>
    <div class="mian panzoom-exclude">
      <div class="tree-box">
        <div class="tabs">
          <div
            :class="currentTab === 1 ? 'current' : ''"
            @click="changeCurrentTab(1)"
          >
            <img
              :src="$fun.getImg('backgroundResources/zxwz-icon1.png')"
              alt=""
            />动物<span>{{ quantity.dw }}个</span>
          </div>
          <div
            :class="currentTab === 2 ? 'current' : ''"
            @click="changeCurrentTab(2)"
          >
            <img
              :src="$fun.getImg('backgroundResources/zxwz-icon2.png')"
              alt=""
            />植物<span>{{ quantity.zw }}个</span>
          </div>
        </div>
        <el-breadcrumb
          style="margin: 5px 0"
          :separator-icon="ArrowRight"
        >
          <el-breadcrumb-item v-for="item in breadcrumbData">{{ item }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-input
          v-model.trim="keyWord"
          placeholder="请输入物种名称"
          :prefix-icon="Search"
          clearable
          size="small"
          @keydown.enter="handleEnter"
          @clear="handleClear"
        />
        <el-scrollbar height="100%">
          <el-tree
            v-loading="loading"
            element-loading-text="数据加载中..."
            :element-loading-spinner="svg"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-background="rgba(9, 58, 121, 0.6)"
            :data="treeData"
            ref="treeRef"
            class="tree-data"
            :props="props"
            node-key="id"
            :default-expanded-keys="defaultExpandedKeys"
            :default-expand-all="false"
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <span>{{ data.name }}</span>
                <span
                  v-if="data.children?.length"
                  class="node-count"
                  >({{ "下属分类" + data.children.length + "个" }})</span
                >
              </span>
            </template>
          </el-tree></el-scrollbar
        >
      </div>
      <div class="shape-box">
        <RelationChartPanel
          :data="chartData"
          @chartClick="handleChartClick"
        />
      </div>
    </div>
    <teleport
      defer
      to="#dataPanel"
    >
      <Modal
        id="baseDetail"
        v-model:show="showBaseDetail"
        disable-zoom
        :close-on-click-modal="false"
      >
        <template v-slot:container>
          <BaseDetail :data="info" />
        </template>
      </Modal>
    </teleport>
  </div>
</template>

<style lang="scss" scoped>
.species-query {
  width: 62.5vw;
  height: 720px;
  background: url("@/assets/images/dialog-bg.png") no-repeat center center / 100% 100%;
  display: flex;
  flex-direction: column;
  .title-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    margin-top: 20px;
    img {
      width: 1.3542vw;
      margin-right: 0.5208vw;
    }
  }
  :deep(.mian) {
    flex: 1;
    display: flex;
    padding: 0.5208vw 1.25vw 25px 1.25vw;
    gap: 0.5208vw;
    font-size: 0.625vw;
    color: #beccdc;
    overflow: hidden;
    .tree-box {
      display: flex;
      flex-direction: column;
      gap: 0.5208vw;
      overflow-y: hidden;
      width: 300px;
      height: 100%;
      padding: 0.5208vw;
      background-color: rgb(1, 19, 40);
      box-shadow: 0 0 10px 1px rgba(255, 255, 255, 0.1) inset;
      .tabs {
        display: flex;
        height: 26px;
        align-items: center;
        gap: 0.5208vw;
        > div {
          flex: 1;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.2083vw;
          background-color: #0d2f4f;
          transition: background-color 0.3s;
          cursor: pointer;
          &.current {
            background-color: #204c5c;
            box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.1);
          }
          img {
            width: 0.8333vw;
            margin-top: -0.3125vw;
          }
          span {
            font-size: 0.8333vw;
            color: #3696e8;
          }
        }
      }
      .el-input__wrapper,
      .el-input__inner {
        background-color: #0c284d;
        color: #aab4c1;
        box-shadow: none;
      }
      .el-breadcrumb__inner,
      .el-breadcrumb__separator {
        color: #beccdc;
        font-size: 0.7292vw;
      }
      .tree-data {
        background: transparent !important;
        color: #beccdc;
        .el-tree-node__expand-icon {
          font-size: 16px;
          // 使用自定义图片
          &::before {
            content: "";
            display: inline-block;
            width: 14px;
            height: 14px;
            background: url("@/assets/images/arrow-right.png") no-repeat center / contain;
            transition: transform 0.3s;
            transform: rotate(180deg);
          }
          // 隐藏默认图标
          & svg {
            display: none;
          }
        }
        .custom-tree-node {
          .node-count {
            margin-left: 4px;
            font-size: 10px;
            color: #1dc5c8;
          }
        }
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
      }
    }
    .shape-box {
      position: relative;
      flex: 1;
      height: 100%;
      background: url("@/assets/images/backgroundResources/shape-bg.png") no-repeat center center / 105% 105%;
    }
  }
}
</style>
