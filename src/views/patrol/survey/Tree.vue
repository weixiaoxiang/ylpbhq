<script lang="ts" setup>
const props = {
  children: "children",
  label: "label"
}
const data = ref([
  {
    label: "安徽古井园",
    children: [
      {
        label: "安徽省林业局",
        children: [
          {
            label: "郭青青",
            status: "巡护中"
          },
          {
            label: "魏晓翔",
            status: "已完成"
          },
          {
            label: "张北",
            status: "未开始"
          }
        ]
      }
    ]
  },
  {
    label: "安徽古井园",
    children: [
      {
        label: "安徽省林业局",
        children: [
          {
            label: "郭青青",
            status: "巡护中"
          },
          {
            label: "魏晓翔",
            status: "已完成"
          },
          {
            label: "张北",
            status: "未开始"
          }
        ]
      }
    ]
  },
  {
    label: "安徽古井园",
    children: [
      {
        label: "安徽省林业局",
        children: [
          {
            label: "郭青青",
            status: "巡护中"
          },
          {
            label: "魏晓翔",
            status: "已完成"
          },
          {
            label: "张北",
            status: "未开始"
          }
        ]
      }
    ]
  },
  {
    label: "安徽古井园",
    children: [
      {
        label: "安徽省林业局",
        children: [
          {
            label: "郭青青",
            status: "巡护中"
          },
          {
            label: "魏晓翔",
            status: "已完成"
          },
          {
            label: "张北",
            status: "未开始"
          }
        ]
      }
    ]
  }
])
const searchWord = ref("")
const treeRef = ref<any>(null)
watch(searchWord, (val) => {
  treeRef.value!.filter(val)
})
const filterNode = (value: any, data: any) => {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}
const handleCheckChange = (data: any, checked: any) => {
  console.log(data, checked)
}
</script>
<template>
  <el-scrollbar height="100%">
    <el-input
      v-model="searchWord"
      placeholder="请输入搜索关键字"
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
      show-checkbox
      default-expand-all
      :filter-node-method="filterNode"
      @check-change="handleCheckChange"
    >
      <template #default="{ node, data }">
        <div
          v-if="data.children"
          class="father-node-label"
        >
          {{ node.label }}
        </div>
        <div
          v-else
          class="child-node-label"
        >
          <span class="label-text"> {{ node.label }}</span>
          <span
            :class="{
              'status-1': data.status === '巡护中',
              'status-2': data.status === '已完成',
              'status-3': data.status === '未开始'
            }"
            >{{ data.status }}</span
          >
        </div>
      </template>
    </el-tree></el-scrollbar
  >
</template>

<style lang="scss">
.tree-data {
  background: transparent;
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
    color: #afb6c0;
    .label-text {
      display: inline-block;
      width: 50px;
    }
    .status-1 {
      background-color: green;
      padding: 2px 4px;
    }
    .status-2 {
      padding: 2px 4px;
      background-color: blue;
    }
    .status-3 {
      padding: 2px 4px;
      background-color: orangered;
    }
  }

  .is-checked {
    .child-node-label {
      background: url("@/assets/images/patrol/active-circle.png") no-repeat left center / 10px 10px;
    }
  }
  .el-checkbox {
    .is-indeterminate {
      .el-checkbox__inner {
        background: #01b3ff;
        border: 1px solid #01b3ff;
      }
    }
    .el-checkbox__inner {
      background: rgb(17, 34, 46);
      border: 1px solid #3e3e3e;
    }
  }
  .el-checkbox.is-checked {
    .el-checkbox__inner {
      background: #01b3ff;
      border: 1px solid #01b3ff;
    }
  }
  .el-tree-node__expand-icon {
    color: #01b3ff;
  }
}
</style>
