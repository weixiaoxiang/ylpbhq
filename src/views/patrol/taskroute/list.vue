<script lang="ts" setup>
import { GetTaskRouteByPage } from "@/api"
import dayjs from "dayjs"
interface Props {}
withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  handleToAdd: [boolean]
  handleToView: [any]
}>()
const proxy = getCurrentInstance()!.proxy as any
const { jgList } = storeToRefs(useConfigStore())
const params = ref<any>({
  mc: "",
  orgid: undefined,
  page: 1,
  intPageSize: 6
})
const list = ref<any>([])

const total = ref(0)
const getList = async () => {
  const { response } = await GetTaskRouteByPage(params.value)
  list.value = response.data
  total.value = response.dataCount
}
const handleCurrentChange = () => {
  getList()
}
const add = () => {
  emit("handleToAdd", true)
}
const view = (data: any) => {
  emit("handleToView", data)
}

// 导出
const exportData = async () => {
  // 定义列配置
  const columns = [
    { header: "ID", key: "Id", width: 5 },
    {
      header: "路线矢量图",
      key: "image",
      isImage: true,
      width: 20,
      imageSize: {
        height: 120 // 图片高度
      }
    },
    { header: "名称", key: "mc", width: 20 },
    { header: "编号", key: "bh", width: 20 },
    { header: "所属片区", key: "ssorg", width: 10 },
    { header: "起点名称", key: "startmc", width: 20 },
    { header: "起点经度", key: "startlon", width: 20 },
    { header: "起点纬度", key: "startlat", width: 20 },
    { header: "终点名称", key: "endmc", width: 20 },
    { header: "终点经度", key: "endlon", width: 20 },
    { header: "终点纬度", key: "endlat", width: 20 },
    { header: "路线长度（km）", key: "lxcd", width: 10 },
    { header: "打卡点个数", key: "pointcount", width: 10 },
    { header: "创建时间", key: "createtime", width: 20 },
    { header: "备注", key: "remark", width: 20 },
    { header: "打卡距离", key: "remark1", width: 10 }
  ]
  const { response } = await GetTaskRouteByPage({
    page: 1,
    intPageSize: 10000
  })
  // 准备数据
  const data = await Promise.all(
    response.data.map(async (item: any) => {
      // 图片
      const image = await wktToBase64Image(item.geom, {
        width: 200,
        height: 200,
        backgroundColor: "#7f8c8d",
        geometryColor: "#2ecc71",
        strokeColor: "#e74c3c",
        strokeWidth: 3
      })
      return {
        ...item,
        image // 添加生成的图片到导出数据中
      }
    })
  )

  // 导出Excel
  try {
    await ExcelExporter.exportExcel({
      fileName: `任务路线导出-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`,
      sheetName: "路线表",
      columns,
      data,
      imageQuality: 0.8,
      maxImageSize: 100
    })
  } catch (error) {
    console.error("导出失败:", error)
  }
}
onMounted(() => {
  getList()
  proxy.$mitt.on("refresh-list", getList)
})
onUnmounted(() => {
  proxy.$mitt.off("refresh-list", getList)
})
</script>
<template>
  <div class="list">
    <div class="search-box">
      <el-tree-select
        style="width: 320px"
        v-model="params.orgid"
        :data="jgList"
        :props="{ label: 'Name', value: 'Id', children: 'Children' }"
        :render-after-expand="false"
        :check-on-click-node="true"
        :default-expand-all="true"
        clearable
      />

      <div
        class="btn"
        @click="exportData"
      >
        导出
      </div>
      <el-input
        style="width: 244px"
        v-model="params.mc"
        placeholder="请输入路线名称"
        clearable
      />
      <div
        class="btn"
        @click="getList"
      >
        查询
      </div>
      <div
        class="btn"
        @click="add"
      >
        新增
      </div>
    </div>
    <el-scrollbar height="100%">
      <div class="con">
        <div
          class="box"
          v-for="item in list"
          :key="item.id"
          @click="view(item)"
        >
          <div>
            <span class="name">路线编号:</span>
            <span class="value">{{ item.bh }}</span>
          </div>
          <div>
            <span class="name">路线名称:</span>
            <span class="value">{{ item.mc }}</span>
          </div>
          <div>
            <span class="name">路线长度:</span>
            <span class="value">{{ item.lxcd }}km</span>
          </div>
          <div>
            <span class="name">打卡点数:</span>
            <span class="value">{{ item.pointcount }}个</span>
          </div>
          <div>
            <span class="name">所属机构:</span>
            <span class="value">{{ item.remark2 }}</span>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <el-pagination
      v-model:current-page="params.page"
      v-model:page-size="params.intPageSize"
      :page-sizes="[10, 20, 30, 40]"
      :background="false"
      :pager-count="5"
      layout="total, pager, jumper"
      :total="total"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.list {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #fff;
  width: 420px;
  position: absolute;
  top: 20px;
  right: 20px;
  bottom: 20px;
  background-color: rgba(11, 25, 39, 0.9);
  border: 1px solid #505b65;
  border-radius: 6px;
  box-shadow: 0 0 10px 1px rgba(255, 255, 255, 0.2) inset;
  z-index: 998;
  :deep(.search-box) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
    .el-input__wrapper,
    .el-select__wrapper {
      background-color: #121f28;
      box-shadow: none;
      border: 1px solid #656d74;
      border-radius: 0;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      padding: 4px 20px;
      background: linear-gradient(to right, #5a8ab6, #375577);
      cursor: pointer;
    }
  }
  :deep(.el-pagination) {
    margin-bottom: 10px;
    justify-content: center;
    .el-pager {
      li {
        background: transparent;
        color: #fff;
      }
      li.is-active {
        color: #195bdf;
        background-color: rgba(26, 39, 52, 0.5);
      }
    }
    .el-pagination__sizes,
    .el-pagination__total {
      color: #fff;
    }
    .el-input__wrapper {
      padding: 1px 2px;
      background-color: rgba(60, 93, 128, 0.5);
      box-shadow: none;
      .el-input__inner {
        color: #fff;
      }
    }
    .el-pagination__editor.el-input {
      width: 40px;
    }
    .el-pagination__jump {
      color: #fff;
    }
  }
  .con {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    overflow-y: hidden;
    padding: 10px;
    .box {
      padding: 10px;
      box-shadow: 0px 0px 4px 1px rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      border: #3b5b7f solid 1px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      color: #aab2b8;
      cursor: pointer;
      &:hover {
        background: linear-gradient(to bottom, rgba(37, 100, 171, 0.5), rgba(23, 44, 71, 0.5));
        color: #fff;
      }
      > div {
        display: flex;
        line-height: 2em;
        overflow: hidden;
        .name {
          width: 70px;
        }
        .value {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.custom-select-popper {
  /* 下拉框边框颜色 */
  &.el-select__popper.el-popper {
    border: 1px #18242c !important;
  }
  /* 下拉框padding颜色 */
  .el-select-dropdown__wrap {
    background-color: #18242c;
  }
  /* 下拉框背景颜色 */
  .el-select-dropdown__item {
    background: #18242c !important;
  }
  /* 下拉框文字颜色 */
  .el-select-dropdown__item {
    color: white;
    font-weight: 500;
  }
  /* 下拉款选项悬停背景 */
  .el-select-dropdown__item:hover {
    background: #141e26 !important;
  }
  /* 下拉框被选中的文字颜色 */
  .el-select-dropdown__item.is-selected {
    color: #1fa3df !important;
  }
  /* 倒三角样式 */
  .el-popper__arrow::before {
    border-color: #18242c !important;
    background: #18242c !important;
  }
}
</style>
