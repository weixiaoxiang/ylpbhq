<template>
  <div class="operate-box">
    <div class="treebox">
      <el-tree
        ref="treeRef"
        v-loading="loading"
        :data="treeData"
        show-checkbox
        node-key="Id"
        default-expand-all
        :props="defaultProps"
        @check="handleCheckNode"
        icon-class="el-icon-arrow-down"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ data.name }}</span>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { handleTree } from "@/utils/tree"
import { communityBuildingApi } from "@/api/CommunityBuilding/index"
// import { localResourcesApi } from '@/api/ScientificResearch';
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
// const showLayer = ref(false)
const emit = defineEmits(["glFeatures"])
const defaultProps = ref<any>({
  label: "name",
  children: "children"
})
const treeRef = ref<any>(null)
const treeData = ref<any>([])
const loading = ref<boolean>(false)
const { proxy } = getCurrentInstance() as any
const handleCheckNode = (node: any, bo: any) => {
  if (node.sqlevel === 1) return
  if (bo) {
    emit("glFeatures", {
      name: node.name,
      bo: bo
    })
  } else {
  }
}

//查询数据
const getData = () => {
  communityBuildingApi.GetCommunityListByTree({}).then((res) => {
    if (res.status == 200) {
      let ids: any = []
      let data = res.response
      treeData.value = handleTree(data, "id", "parentid", "children")
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
  getData()
})
</script>

<style lang="scss" scoped>
.layerControl-section {
}
.layerControl {
  position: absolute;
  width: 360px;
  top: 0;
  right: 80px;
  background-color: rgba(4, 46, 46, 0.75);
  box-shadow: 0px 0px 13px 0px rgba(42, 42, 42, 0.18);
  transition: height 0.5s;
  z-index: 999;
  color: #fff;
  pointer-events: all;
}

.operate-box {
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
  border-top: 2px solid rgba(1, 255, 209, 1);
  background: linear-gradient(180deg, rgba(1, 255, 209, 0.5) 0%, rgba(1, 255, 209, 0) 100%);
  padding: 4px 10px 6px;
  font-size: 16px;
  font-weight: 550;
  color: #fff;

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

  :deep(.el-tree) {
    background-color: transparent;
    // color: #fff;
    --el-tree-node-hover-bg-color: unset;

    .el-tree-node__content:hover {
      background-color: transparent;
    }

    .el-checkbox__inner {
      background-color: transparent;
      border: 1px solid #ffffff;
    }

    .el-checkbox__input.is-checked .el-checkbox__inner {
      background: #01b3ff;
    }

    .el-tree-node__content:hover {
      // background: #02c2ad;
      background: #1d3962bf;

      color: #fff;
    }

    .el-tree-node__children {
      .el-tree-node__children {
        background: rgba(29, 57, 98, 1);
        & > .is-checked {
          border: 1px solid #01b3ff;
        }
      }
    }

    .el-tree-node__expand-icon {
      color: #01b3ff;
      font-size: 18px;
    }

    .el-tree-node__content {
      position: relative;
      height: 36px;
      margin-bottom: 1px;
      background: rgba(29, 57, 98, 0.75);
      color: rgba(255, 255, 255, 0.65);
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
        border: 1px solid #01b3ff;
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
}
</style>
