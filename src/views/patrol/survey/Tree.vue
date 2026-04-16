<script lang="ts" setup>
import { GetSsxh_UserTree } from "@/api"
const props = {
  children: "Children",
  label: "Name"
}
const proxy = getCurrentInstance()!.proxy as any
const data = ref([])
const searchWord = ref("")
const treeRef = ref<any>(null)
watch(searchWord, (val) => {
  treeRef.value!.filter(val)
})
const filterNode = (value: any, data: any) => {
  if (!value) return true
  return data.Name.indexOf(value) !== -1
}

let selected: any = []
const handleCheck = (data: any, _selected: any) => {
  const leafNodes = []
  const checkedKeys = _selected.checkedKeys
  let type = ""
  if (data.Children) {
    const allLeafNodes = getLeafNodes(data.Children)
    allLeafNodes.map((item: any) => {
      if (!selected.includes(item.Id)) {
        selected.push(item.Id)
        type = "添加"
        leafNodes.push(item)
      } else if (checkedKeys.indexOf(item.Id) === -1) {
        selected.splice(selected.indexOf(item.Id), 1)
        type = "删除"
        leafNodes.push(item)
      }
    })
  } else {
    if (!selected.includes(data.Id)) {
      selected.push(data.Id)
      leafNodes.push(data)
      type = "添加"
    } else if (checkedKeys.indexOf(data.Id) === -1) {
      selected.splice(selected.indexOf(data.Id), 1)
      leafNodes.push(data)
      type = "删除"
    }
  }
  proxy.$mitt.emit("updateXhOnline", { type, leafNodes })
}
const handleNodeClick = (data: any) => {
  // 点击人员
  if (!data.Children) {
    proxy.$mitt.emit("locationMap", {
      type: "点击树定位巡护人员",
      data: {
        id: data.Id
      }
    })
  }
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
const loading = ref(false)
const getTree = async () => {
  loading.value = true
  try {
    const { response } = await GetSsxh_UserTree({})
    data.value = response
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
  nextTick(() => {
    treeRef.value!.setCheckedKeys(selected)
  })
}
const intervalId = setInterval(() => {
  getTree()
}, 60000)
onMounted(async () => {
  await getTree()
  nextTick(() => {
    data.value.forEach((item) => {
      handleCheck(item, { checkedKeys: selected })
      treeRef.value!.setCheckedKeys(selected)
    })
  })
})
onBeforeUnmount(() => {
  intervalId && clearInterval(intervalId)
})
</script>
<template>
  <el-scrollbar
    v-loading="loading"
    element-loading-text="请稍候..."
    :element-loading-spinner="svg"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-background="rgba(0, 0, 0, 0.3)"
    height="100%"
  >
    <el-input
      v-model="searchWord"
      placeholder="请输入搜索关键字"
      clearable
    >
      <template #suffix>
        <el-icon class="el-input__icon"><i-ep-search /></el-icon>
      </template>
    </el-input>
    <el-tree
      :data="data"
      ref="treeRef"
      class="tree-data"
      :props="props"
      node-key="Id"
      show-checkbox
      default-expand-all
      :filter-node-method="filterNode"
      @check="handleCheck"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <div
          v-if="data.Children"
          class="father-node-label"
        >
          {{ data.Name }}
        </div>
        <div
          v-else
          class="child-node-label"
          :class="{
            'status-1': data.Status === '巡护',
            'status-2': data.Status === '登录',
            'status-3': data.Status === '离线'
          }"
        >
          <span class="label-text"> {{ data.Name }}</span>
          <span class="status-text">{{ data.Status }}</span>
        </div>
      </template>
    </el-tree></el-scrollbar
  >
</template>

<style lang="scss">
.tree-data {
  background: transparent !important;
  .el-tree-node:focus > .el-tree-node__content {
    background-color: #1b345a;
  }
  .el-tree-node__content:hover {
    background-color: #1b345a;
  }
  .el-tree-node__content {
    height: 42px;
  }
  .father-node-label {
    font-size: 16px;
    color: #01b3ff;
  }
  .child-node-label {
    padding-left: 14px;
    background: url("@/assets/images/patrol/circle.png") no-repeat left center / 10px 10px;
    font-size: 14px;
    color: #fff;
    .label-text {
      display: inline-block;
      // width: 50px;
      margin-right: 8px;
    }
  }
  .child-node-label {
    &.status-1 {
      background: url("@/assets/images/patrol/active-circle.png") no-repeat left center / 10px 10px;
      .status-text {
        background-color: #118b50;
        color: #fff;
        padding: 2px 4px;
      }
    }
    &.status-2 {
      background: url("@/assets/images/patrol/circle1.png") no-repeat left center / 10px 10px;
      .status-text {
        padding: 2px 4px;
        background-color: #ffc300;
      }
    }
    &.status-3 {
      background: url("@/assets/images/patrol/circle.png") no-repeat left center / 10px 10px;
      .status-text {
        padding: 2px 4px;
        background-color: #496c8c;
        color: #ccc;
      }
    }
  }
  .el-checkbox {
    .is-indeterminate {
      .el-checkbox__inner {
        background: #0d202e;
        border: 1px solid #01b3ff;
        &::before {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #01b3ff;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
      }
    }
    .el-checkbox__inner {
      background: rgb(17, 34, 46);
      border: 1px solid #3e3e3e;
      will-change: transform;
      width: 17px;
      height: 17px;
      &::after {
        border: none;
        width: 8px;
        height: 8px;
        left: 50%;
        top: 50%;
        transform: scale(0) translate(-50%, -50%);
        transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform;
      }
    }
  }
  .el-checkbox.is-checked {
    .el-checkbox__inner {
      background: #0d202e;
      border: 1px solid #01b3ff;
      will-change: transform;
      &::after {
        border: none;
        background: #01b3ff;
        top: 50%;
        left: 50%;
        transform: scale(1) translate(-50%, -50%);
        will-change: transform;
      }
    }
  }
  .el-tree-node__expand-icon {
    color: #01b3ff;
  }
}
</style>
