<script lang="ts" setup>
import {
  APP_GetElectronicfenceWarnTypeSelect,
  GetElectronicfenceStatistics_EquipmentList,
  GetElectronicfenceWarningByPage
} from "@/api"

const date = ref<any>()
const changeDate = () => {
  if (!date.value) {
    params.value.startTime = ""
    params.value.endTime = ""
    return
  }
  params.value.startTime = date.value[0]
  params.value.endTime = date.value[1]
}
const params = ref<any>({
  warnlevel: "",
  warntype: "",
  status: "",
  startTime: "",
  endTime: ""
})
// 获得设备列表数据
const sblbList = ref<any>([])
const getSblbList = async () => {
  const { response } = await GetElectronicfenceStatistics_EquipmentList()
  sblbList.value = response
}

// 预警类型
const yjlxList = ref<any>([])
const getYjlxList = async () => {
  const { response } = await APP_GetElectronicfenceWarnTypeSelect()
  yjlxList.value = response
}
// 预警等级
const yjdjList = ref<any>(["一级预警", "二级预警", "三级预警"])
const search = () => {
  page.value = 1
  getTableData()
}
const reset = () => {
  params.value = {
    warnlevel: "",
    warntype: "",
    status: "",
    startTime: "",
    endTime: ""
  }
  search()
}
const tableData = ref<any>([])
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
const tableColumns = ref<any>([
  {
    label: "设备名称",
    prop: "name"
  },
  {
    label: "预警等级",
    prop: "warnlevel"
  },
  {
    label: "预警类型",
    prop: "warntype"
  },
  {
    label: "预警描述",
    prop: "describe"
  },
  // {
  //   label: "状态",
  //   prop: "status"
  // },
  {
    label: "设备类型",
    prop: "eqtypename"
  },
  {
    label: "预警时间",
    prop: "warntime"
  }
  // 暂时不需要
  // {
  //   label: "操作",
  //   type: "operation",
  //   width: 80,
  //   btns: [
  //     {
  //       label: "查看",
  //       textColor: "#00a2f3",
  //       bgColor: "transparent"
  //     }
  //   ]
  // }
])
const page = ref(1)
const intPageSize = ref(10)
const total = ref(0)
const handleCurrentChange = (val: number) => {
  page.value = val
  getTableData()
}
const handleSizeChange = (val: number) => {
  page.value = 1
  intPageSize.value = val
  getTableData()
}
const getTableData = async () => {
  loading.value = true
  try {
    const { response } = await GetElectronicfenceWarningByPage({
      ...params.value,
      page: page.value,
      intPageSize: intPageSize.value
    })
    total.value = response.dataCount
    tableData.value = response.data
  } catch (error) {
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getSblbList() // 获得设备列表
  getYjlxList() // 获得预警类型列表
  getTableData() // 获得表格数据
})
</script>
<template>
  <div class="warning-record">
    <div class="search-box">
      <el-form
        :model="params"
        label-width="80px"
        inline
      >
        <el-form-item label="设备名称">
          <el-select
            v-model="params.name"
            placeholder="请选择设备名称"
            :teleported="false"
            clearable
            popper-class="custom-select-popper"
          >
            <el-option
              v-for="item in sblbList"
              :key="item.equipmentId"
              :label="item.name"
              :value="item.name || ''"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预警等级">
          <el-select
            v-model="params.warnlevel"
            placeholder="请选择预警等级"
            :teleported="false"
            clearable
            popper-class="custom-select-popper"
          >
            <el-option
              v-for="item in yjdjList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预警类型">
          <el-select
            v-model="params.warntype"
            placeholder="请选择预警类型"
            :teleported="false"
            clearable
            popper-class="custom-select-popper"
          >
            <el-option
              v-for="item in yjlxList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="状态">
          <el-select
            v-model="params.status"
            placeholder="请选择状态"
            :teleported="false"
            clearable
            popper-class="custom-select-popper"
          >
            <el-option
              label="未读"
              value="未读"
            />
            <el-option
              label="已读"
              value="已读"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item
          label="时间选择"
          class="date-box"
        >
          <div class="date-types"></div>
          <el-date-picker
            v-model="date"
            type="daterange"
            value-format="YYYY-MM-DD"
            placeholder="请选择时间"
            popper-class="custom-datepicker-popper"
            @change="changeDate"
          />
        </el-form-item>
        <el-form-item class="search-btns">
          <div class="btns">
            <div
              class="btn btn1"
              @click="search"
            >
              查询
            </div>
            <div
              class="btn btn2"
              @click="reset"
            >
              重置
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div
      v-loading="loading"
      element-loading-text="数据加载中..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(9, 58, 121, 0.6)"
      class="contain-box"
    >
      <ElTablePanel
        ref="elTablePanelRef"
        :showIndex="true"
        :selection="false"
        :columns="tableColumns"
        :data="tableData"
      />
    </div>
    <div class="footer-box">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="intPageSize"
        :page-sizes="[10, 20, 30, 40]"
        :background="false"
        :pager-count="5"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.warning-record {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-size: 0.7292vw;
  .search-box {
    :deep(.el-form) {
      .el-form-item {
        margin-right: 14px;
        .el-form-item__content {
          border: 1px solid #304868;
          border-radius: 2px;
          width: 160px;
        }
      }
      .el-form-item__label {
        color: #fff;
      }
      .date-box {
        .el-form-item__content {
          border: none;
          width: 240px;
        }
        .el-date-editor {
          width: 240px;
          border: 1px solid #304868;
          border-radius: 2px;
        }
      }
      .el-input__inner {
        color: #aab4c1;
      }
      .search-btns {
        .btns {
          display: flex;
          gap: 10px;
          padding: 0 10px;
          .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 32px;
            padding: 4px 1.0417vw;
            cursor: pointer;
          }
          .btn1 {
            background: #041324;
          }
          .btn2 {
            background: linear-gradient(to right, #5a8ab6, #375577);
          }
        }
        .el-form-item__content {
          border: none;
          width: fit-content;
        }
      }
    }
  }
  .contain-box {
    flex: 1;
    opacity: 0.8;
    overflow: hidden;
  }
  .footer-box {
    margin: 10px 0 20px 0;
    :deep(.el-pagination) {
      margin-bottom: 10px;
      justify-content: center;
      font-size: 0.7292vw;
      .el-select {
        width: 6.6667vw;
      }
      .el-pager {
        li {
          color: #fff;
          margin: 0 0.2604vw;
          background-color: #0b2a4e;
          border-top-left-radius: 10px;
          border-bottom-right-radius: 10px;
          font-size: 0.7292vw;
          min-width: 1.6667vw;
        }
        li.is-active {
          color: #fff;
          background-color: #5886b2;
          border-top-left-radius: 10px;
          border-bottom-right-radius: 10px;
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
        width: 2.0833vw;
      }
      .el-pagination__jump {
        color: #fff;
        margin-left: 0.8333vw;
      }
      button,
      button.is-disabled,
      button:disabled {
        background: none;
        color: #fff;
        min-width: 1.6667vw;
        margin-left: 0.8333vw;
      }
    }
  }
}
</style>
