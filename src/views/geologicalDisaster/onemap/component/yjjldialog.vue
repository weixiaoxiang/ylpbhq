<template>
  <div class="data-panel-yjjl">
    <div class="title-box">
      <img
        :src="$fun.getImg('researchManagement/icon14.png')"
        alt=""
      />
      <div>预警信息</div>
    </div>
    <div class="mian">
      <div class="search-content">
        <el-form
          class="queryForm"
          ref="queryFormRef"
          :model="queryParams"
          label-width="auto"
          :inline="true"
          @keyup.enter.native="handleQuery"
          clearable
        >
          <el-form-item label="报警设备">
            <el-select
              v-model="queryParams.equipmentIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择"
            >
              <el-option
                v-for="item in options1"
                :key="item.deviceserial"
                :label="item.monitorpointname"
                :value="item.deviceserial"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="报警等级">
            <el-select
              v-model="queryParams.alarmLevels"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择"
            >
              <el-option
                v-for="item in options2"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="预警因子">
            <el-select
              v-model="queryParams.fields"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择"
            >
              <el-option
                v-for="item in options3"
                :key="item.id"
                :label="item.name"
                :value="item.name"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="报警状态">
            <el-select
              v-model="queryParams.status"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择"
            >
              <el-option
                v-for="item in options4"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="报警时间">
            <el-date-picker
              v-model="timeRange"
              type="datetimerange"
              :shortcuts="shortcuts"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            />
          </el-form-item>

          <el-form-item label-width="0">
            <div
              class="fun-btn"
              :class="{ active: currentbtnTool === 1 }"
              @click="handleQuery()"
            >
              <img
                src="/images/geologicalDisaster/btn-cx.png"
                alt=""
              />
              查询
            </div>
            <div
              class="fun-btn"
              :class="{ active: currentbtnTool === 2 }"
              @click="resetcx"
            >
              <img
                src="/images/geologicalDisaster/btn-cz.png"
                alt=""
              />
              重置
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-box">
        <el-table
          class="tableList"
          :data="tableData"
          stripe
          :header-cell-style="{
            background: '#204b78',
            color: 'rgba(255, 255, 255, .75)',
            fontSize: '14px',
            height: '32px',
            borderBottom: '1px solid #204b78'
          }"
        >
          <el-table-column
            type="index"
            width="60"
            label="序号"
            align="center"
          />
          <el-table-column
            prop="happentime"
            label="预警时间"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="monitorpointname"
            label="设备名称"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="levelname"
            label="预警等级"
            align="center"
          />
          <el-table-column
            prop="datatypename"
            label="预警因子"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="status"
            label="预警状态"
            align="center"
          />
        </el-table>
      </div>
    </div>
    <history
      class="main2"
      ref="historyVideoRef"
    ></history>
  </div>
</template>
<script lang="ts" setup>
import dayjs from "dayjs"
import { geologicalDisasterApi } from "@/api/geologicalDisaster"
import history from "@/components/hkVideo/historyyjjl.vue"
const currentbtnTool = ref()
const shortcuts = [
  {
    text: "最近24小时",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 1)
      return [start, end]
    }
  },
  {
    text: "最近一周",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    }
  },
  {
    text: "最近一个月",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    }
  },
  {
    text: "最近三个月",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [start, end]
    }
  },
  {
    text: "最近半年",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 6)
      return [start, end]
    }
  }
]
const queryParams = ref<any>({
  equipmentIds: [],
  alarmLevels: [],
  fields: [],
  status: [],
  startTime: "",
  endTime: "",
  page: 1,
  intPageSize: 15
})

const options1 = ref<any>([])
const options2 = ref<any>([
  {
    id: 3,
    name: "蓝色预警"
  },
  {
    id: 4,
    name: "黄色预警"
  },
  {
    id: 5,
    name: "橙色预警"
  },
  {
    id: 6,
    name: "红色预警"
  }
])
const options3 = ref<any>([
  {
    id: 1,
    name: "高程变化"
  },
  {
    id: 2,
    name: "北向量变化"
  },
  {
    id: 3,
    name: "东向量变化"
  },
  {
    id: 4,
    name: "降雨量"
  },
  {
    id: 5,
    name: "土壤含水率"
  }
])
const options4 = ref<any>([
  {
    id: 0,
    name: "待处理"
  },
  {
    id: 1,
    name: "处理中"
  },
  {
    id: 2,
    name: "已处理"
  },
  {
    id: 3,
    name: "误报"
  }
])
const timeRange = ref([])
const total = ref(0)
const queryFormRef = ref()
const tableData = ref<any>([])

// 查询
const handleQuery = () => {
  currentbtnTool.value = 1
  queryParams.value.page = 1
  getList()
}
// 重置查询
const resetcx = () => {
  nextTick(() => {
    currentbtnTool.value = 2
    queryParams.value.equipmentIds = []
    queryParams.value.alarmLevels = []
    queryParams.value.fields = []
    queryParams.value.status = []
    queryParams.value.startTime = ""
    queryParams.value.endTime = ""
    handleQuery()
  })
}
//获取数据
const getList = (val?: number) => {
  if (val == 1) {
    queryParams.value.page = 1
  }
  if (timeRange.value && timeRange.value.length > 0) {
    queryParams.value.startTime = dayjs(timeRange.value[0]).format("YYYY-MM-DD HH:mm:ss")
    queryParams.value.endTime = dayjs(timeRange.value[1]).format("YYYY-MM-DD HH:mm:ss")
  } else {
    queryParams.value.startTime = ""
    queryParams.value.endTime = ""
  }

  geologicalDisasterApi.GetPageAlarmRecord(queryParams.value).then((res: any) => {
    if (res.success) {
      tableData.value = res.response.data
      total.value = res.response.dataCount
    } else {
      tableData.value = []
      total.value = 0
    }
  })
}
const historyVideoRef = ref()

//获取所有设备
const getData = () => {
  geologicalDisasterApi.GetAllGeologicHazardEquipment({}).then((res: any) => {
    if (res.success) {
      options1.value = res.response
    }
  })
}

onMounted(() => {
  getData()
  getList()
})
</script>

<style lang="scss" scoped>
.dialogleft {
  position: absolute;
  top: vh(110);
  left: 55px;
  background: url("images/geologicalDisaster/dialogleft.png") no-repeat center center / cover;
  width: 158px;
  height: vh(879);
  z-index: 10000;
  .content {
    margin-top: 60px;
  }
  .left-item {
    display: flex;
    margin-bottom: 20px;
    align-items: center;
    &.active {
      background: linear-gradient(-90deg, rgba(30, 60, 112, 0.2) 0%, #1e3c70 100%);

      &::before {
        content: "";
        display: inline-block;
        width: 4px;
        height: 40px;
        background: #25ccea;
        margin-right: 10px;
      }
    }

    .text {
      font-family: Microsoft YaHei;
      font-size: 18px;
      font-weight: 400;
      line-height: 40px;
      text-align: left;
      text-underline-position: from-font;
      text-decoration-skip-ink: none;
      color: #5e8bb8;
      font-size: 16px;
    }
    .text1 {
      font-family: Microsoft YaHei;
      font-size: 18px;
      font-weight: 400;
      line-height: 40px;
      text-align: left;
      text-underline-position: from-font;
      text-decoration-skip-ink: none;
      color: #fff;
      font-size: 16px;
    }
  }
}
.closepop {
  position: absolute;
  top: vh(100);
  left: vw(1830);
  width: 40px;
  height: 40px;
  background: url("/images/geologicalDisaster/closepop.png") no-repeat center center / 20px 20px;
  cursor: pointer;
}

.data-panel-yjjl {
  width: vw(1320);
  height: vh(885);
  background: url("/images/geologicalDisaster/dialog-bg.png") no-repeat center center / 100% 100%;
  display: flex;
  flex-direction: column;
  .el-form-item__label-wrap {
    display: flex;
    color: #fff;
  }
  :deep(.el-select__wrapper) {
    align-items: center;
    background-color: #0c284d;
    box-shadow: none !important;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.1490196078);
    cursor: pointer;
    display: flex;
    font-size: 14px;
    gap: 6px;
    line-height: 24px;
    min-height: 32px;
    padding: 4px 12px;
    position: relative;
    text-align: left;
    transform: translateZ(0);
    transition: var(--el-transition-duration);
    width: 150px;
  }
  :deep(.el-range-editor) {
    box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
    width: 300px;
  }

  .el-form--inline .el-form-item {
    display: inline-flex;
    margin-right: 10px;
    vertical-align: middle;
  }

  :deep(.el-tag.is-closable) {
    padding-right: 5px;
    background: rgba(0, 0, 0, 0);
  }

  :deep(.el-form-item__label) {
    align-items: flex-start;
    box-sizing: border-box;
    color: var(--el-text-color-regular);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: var(--el-form-label-font-size);
    height: 32px;
    justify-content: flex-end;
    line-height: 32px;
    padding: 0 12px 0 0;
    color: #fff;
  }
  :deep(.hover-row) {
    background: linear-gradient(90deg, #29a2b0 0%, #1e4e9c 100%);
  }
  :deep(.el-table--enable-row-hover .el-table__body tr:hover) {
    background: linear-gradient(90deg, #29a2b0 0%, #1e4e9c 100%);
  }

  .el-table .cell.el-tooltip {
    min-width: 50px;
    white-space: nowrap;
    display: flex;
    align-items: center;
  }

  :deep(.el-table .cell) {
    display: flex;
    justify-content: center;
  }
  .title-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70px;
    color: #fff;
    img {
      width: 1.3542vw;
      margin-right: 0.5208vw;
    }
  }
  .mian {
    flex: 1;
    display: flex;
    padding: 0 55px;
    flex-direction: column;
    overflow-y: hidden;
    height: calc(100% - 70px);

    :deep(.search-content) {
      background: initial;
      .fun-btn {
        width: 88.55px;
        height: 33.73px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
        background: #00000080;

        border: 1px solid #365375;
        border-radius: 2px;
        color: #fff;
        cursor: pointer;

        &.active {
          background: linear-gradient(270deg, #365375 0%, #5b8bb7 100%);

          img {
            opacity: 1;
          }
        }
      }
      .el-date-editor {
        background-color: #0c284d;
        color: #aab4c1;
        box-shadow: none;
        border: 1px solid #365375;
      }
      .el-range-input {
        color: #aab4c1;
      }
      .el-range-separator {
        color: #aab4c1;
      }
    }

    .table-box {
      padding-top: 20px;
      height: calc(100% - 100px);

      .level-blue {
        height: 23px;
        display: block;
        border: 1px solid;
        border-image-source: linear-gradient(90deg, #1eaccd 0%, #217aa2 100%);
        background: linear-gradient(90deg, #33b7dc 0%, rgba(51, 183, 220, 0.5) 100%);
        width: 59.93px;
        height: 21.5px;
      }
      .level-orange {
        height: 23px;
        display: block;
        width: 59.93px;
        height: 21.5px;
        border: 1px solid;
        background: linear-gradient(90deg, #7a430d 0%, rgba(122, 67, 13, 0.5) 100%);
        border-image-source: linear-gradient(90deg, #c5832d 0%, #673304 100%);
      }

      .level-red {
        width: 59.93px;
        height: 21.5px;
        height: 23px;
        display: block;
        border: 1px solid;
        background: linear-gradient(90deg, #8d2c26 0%, rgba(141, 44, 38, 0.5) 100%);
        border-image-source: linear-gradient(90deg, #cc4d44 0%, #a1190d 100%);
      }

      .level-yellow {
        height: 23px;
        display: block;
        width: 59.93px;
        height: 21.5px;
        background: linear-gradient(90deg, #c2bb1c 0%, rgba(194, 187, 28, 0.5) 100%);
        border: 1px solid;
        border-image-source: linear-gradient(90deg, #afa51c 0%, #46502a 100%);
      }

      .tableList {
        height: 100%;
        &.el-table {
          background: transparent !important;
          color: rgba(255, 255, 255, 0.8);
          --el-table-row-hover-bg-color: linear-gradient(90deg, #29a2b0 0%, #1e4e9c 100%);
          --el-table-border: none;
          --el-table-tr-bg-color: #183559;
          --el-fill-color-lighter: #204b78;
          .el-table__cell {
            color: #a7d2ca;
            padding: 0;

            border-bottom: 2px solid #172e50 !important;
            color: #dde3e8 !important;
          }

          tbody tr {
            height: 32px;
          }
        }
        .level {
          display: flex;
          align-items: center;
          font-size: 14px;
          justify-content: center;

          .icon {
            position: relative;
            width: 4px;
            height: 4px;
            margin-right: 5px;
            border-radius: 50%;

            &::after {
              content: "";
              display: inline-block;
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translateX(-50%) translateY(-50%);
              width: 8px;
              height: 8px;
              opacity: 0.3;
              border-radius: 50%;
              box-sizing: border-box;
              border: 1px solid #fff;
              background: rgba(224, 0, 0, 0.3);
            }
          }
        }
      }
    }
  }
  .main2 {
    position: relative;
    width: 100%;
    height: calc(100% - 70px);
  }
}
</style>
<style lang="scss"></style>
