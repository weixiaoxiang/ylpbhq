<script lang="ts" setup>
import {
  GetAllEnvironmentalEquipment,
  GetEnvironmentStatisticalAnalysis_list,
  GetWaterStatisticalAnalysis_list,
  GetWaterStatisticalAnalysis_Zxt,
  GetEnvironmentStatisticalAnalysis_Zxt
} from "@/api"
import dayjs from "dayjs"
interface Props {
  width?: number
  height?: number
  type?: string
  id?: string
}
const props = withDefaults(defineProps<Props>(), {
  type: "水文"
})
defineEmits<{
  "update:show": [boolean]
}>()
const params = ref<any>({
  equipmentId: props.id,
  timeType: "日",
  time: dayjs().format("YYYY-MM-DD")
})
const sssbList = ref<any[]>([])
// 获得所属设备列表
const getAllEnvironmentalEquipment = async () => {
  const { response } = await GetAllEnvironmentalEquipment({
    equipmentType: props.type
  })
  sssbList.value = response
}
const search = () => {
  page.value = 1
  getList()
  getLineData()
}
const getList = async () => {
  // tableData.value = []
  // total.value = 0
  if (props.type === "水文") {
    const { response } = await GetWaterStatisticalAnalysis_list({
      ...params.value,
      page: page.value,
      intPageSize: intPageSize.value
    })
    tableData.value = response.data
    total.value = response.dataCount
  }
  if (props.type === "气象") {
    const { response } = await GetEnvironmentStatisticalAnalysis_list({
      ...params.value,
      page: page.value,
      intPageSize: intPageSize.value
    })
    tableData.value = response.data
    total.value = response.dataCount
  }
}
const exportData = async () => {
  let columns: any[] = []
  let data: any[] = []
  if (props.type === "水文") {
    const { response } = await GetWaterStatisticalAnalysis_list({
      ...params.value,
      page: 1,
      intPageSize: 100000
    })
    columns = [
      { header: "日期时间", key: "time", width: 20 },
      { header: "PH值", key: "ph", width: 10 },
      { header: "水温(℃)", key: "wd", width: 10 },
      { header: "电导率(μs/cm)", key: "ddl", width: 20 },
      { header: "浊度(NTU)", key: "zd", width: 10 },
      { header: "溶解氧(mg/L)", key: "hyl", width: 20 },
      { header: "氨氮(mg/L)", key: "ammonia", width: 10 }
    ]
    data = response.data
  }
  if (props.type === "气象") {
    const { response } = await GetEnvironmentStatisticalAnalysis_list({
      ...params.value,
      page: 1,
      intPageSize: 100000
    })
    columns = [
      { header: "日期时间", key: "time", width: 20 },
      { header: "PM2.5(μg/m³)", key: "PM2_5", width: 20 },
      { header: "湿度(%)", key: "hs", width: 10 },
      { header: "温度(℃)", key: "hw", width: 10 },
      { header: "负氧离子(个/cm³)", key: "fylz", width: 20 },
      { header: "光照强度(Lux)", key: "gzd", width: 20 },
      { header: "风向(°)", key: "fx", width: 10 },
      { header: "风速(m/s)", key: "ssfs", width: 10 },
      { header: "降雨量(mm)", key: "yljglj", width: 10 }
    ]
    data = response.data
  }
  ExcelExporter.exportExcel({
    fileName: `${props.type}统计分析-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`,
    sheetName: props.type,
    columns,
    data
  })
}

const dateType = ref<any>("date")
const changeDateType = () => {
  if (dateType.value === "date") {
    params.value.timeType = "日"
  } else if (dateType.value === "month") {
    params.value.timeType = "月"
  } else if (dateType.value === "year") {
    params.value.timeType = "年"
  }
}
const tableColumns = ref<any[]>([])
const tableData = ref<any>([])

const page = ref(1)
const intPageSize = ref(10)
const total = ref(0)
const handleCurrentChange = (val: number) => {
  page.value = val
  getList()
}
const handleSizeChange = (val: number) => {
  page.value = 1
  intPageSize.value = val
  getList()
}

const currentTab = ref<any>("PM2.5")
const tabs = ref<any>([])
const changeTab = () => {
  getLineData()
}

const lineData = ref<any>()
const getLineData = async () => {
  // lineData.value = {
  //   dw: "km",
  //   xAxis: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
  //   data: [
  //     {
  //       name: "去年",
  //       data: [
  //         { label: "01", value: "867.784" },
  //         { label: "02", value: "418.636" },
  //         { label: "03", value: "756.956" },
  //         { label: "04", value: "504.631" },
  //         { label: "05", value: "188.199" },
  //         { label: "06", value: "23.163" },
  //         { label: "07", value: "144.486" },
  //         { label: "08", value: "97.827" },
  //         { label: "09", value: "97.277" },
  //         { label: "10", value: "1478.160" },
  //         { label: "11", value: "1896.292" },
  //         { label: "12", value: "74.499" }
  //       ]
  //     },
  //     {
  //       name: "今年",
  //       data: [
  //         { label: "01", value: "0.024" },
  //         { label: "02", value: "0.289" },
  //         { label: "03", value: "510.236" },
  //         { label: "04", value: "219.942" },
  //         { label: "05", value: "319.311" },
  //         { label: "06", value: "185.895" },
  //         { label: "07", value: "126.311" },
  //         { label: "08", value: "88.105" },
  //         { label: "09", value: "20.478" },
  //         { label: "10", value: "698.154" },
  //         { label: "11", value: null },
  //         { label: "12", value: null }
  //       ]
  //     }
  //   ]
  // }
  let data, dw
  if (props.type === "水文") {
    const { response } = await GetWaterStatisticalAnalysis_Zxt({
      equipmentId: params.value.equipmentId,
      dataType: currentTab.value,
      startTime: params.value.time,
      timetype: params.value.timeType
    })
    data = response
    dw =
      currentTab.value === "PH值"
        ? ""
        : currentTab.value === "水温"
          ? "℃"
          : currentTab.value === "电导率"
            ? "μs/cm"
            : currentTab.value === "浊度"
              ? "NTU"
              : currentTab.value === "溶解氧"
                ? "mg/L"
                : currentTab.value === "氨氮"
                  ? "mg/L"
                  : ""
  }
  if (props.type === "气象") {
    const { response } = await GetEnvironmentStatisticalAnalysis_Zxt({
      equipmentId: params.value.equipmentId,
      dataType: currentTab.value,
      startTime: params.value.time,
      timetype: params.value.timeType
    })
    data = response
    dw =
      currentTab.value === "PM2.5"
        ? "μg/m³"
        : currentTab.value === "湿度"
          ? "%"
          : currentTab.value === "温度"
            ? "℃"
            : currentTab.value === "负氧离子"
              ? "个/cm³"
              : currentTab.value === "光照强度"
                ? "Lux"
                : currentTab.value === "风向"
                  ? "°"
                  : currentTab.value === "风速"
                    ? "m/s"
                    : currentTab.value === "降雨量"
                      ? "mm"
                      : ""
  }
  if (data?.[0]?.childer?.length > 0) {
    lineData.value = {
      dw: dw,
      // // 去重取x轴数据，data数组中每个childer子数组中取name，然后flat展平
      xAxis: Array.from(
        new Set(data.flatMap((d: any) => (Array.isArray(d.childer) ? d.childer.map((item: any) => item.name) : [])))
      ),
      data: data.map((item: any) => ({
        name: item.name,
        data: item.childer.map((item: any) => {
          return {
            label: item.name,
            value: item.value
          }
        })
      }))
    }
  } else {
    lineData.value = null
  }
}
onMounted(() => {
  if (props.type === "水文") {
    tableColumns.value = [
      {
        label: "日期时间",
        prop: "time",
        width: 140
      },
      {
        label: "PH值",
        prop: "ph",
        width: 60
      },
      {
        label: "水温(℃)",
        prop: "wd",
        width: 140
      },
      {
        label: "电导率(μs/cm)",
        prop: "ddl",
        width: 140
      },
      {
        label: "浊度(NTU)",
        prop: "zd",
        width: 140
      },
      {
        label: "溶解氧(mg/L)",
        prop: "hyl",
        width: 140
      },
      {
        label: "氨氮(mg/L)",
        prop: "ammonia",
        width: 140
      }
    ]
    tabs.value = ["PH值", "水温", "电导率", "浊度", "溶解氧", "氨氮"]
    currentTab.value = "PH值"
  }
  if (props.type === "气象") {
    tableColumns.value = [
      {
        label: "日期时间",
        prop: "time",
        width: 140
      },
      {
        label: "PM2.5(μg/m³)",
        prop: "PM2_5",
        width: 140
      },
      {
        label: "温度(℃)",
        prop: "hw",
        width: 140
      },
      {
        label: "湿度(%)",
        prop: "hs",
        width: 140
      },
      {
        label: "负氧离子(个/cm³)",
        prop: "fylz",
        width: 180
      },
      {
        label: "光照强度(Lux)",
        prop: "gzd",
        width: 140
      },
      {
        label: "风向(°)",
        prop: "fx",
        width: 140
      },
      {
        label: "风速(m/s)",
        prop: "ssfs",
        width: 140
      },
      {
        label: "降雨量(mm)",
        prop: "yljglj",
        width: 140
      }
    ]
    tabs.value = ["PM2.5", "湿度", "温度", "负氧离子", "光照强度", "风向", "风速", "降雨量"]
    currentTab.value = "PM2.5"
  }
  getAllEnvironmentalEquipment() // 获得所属设备列表
  getList()
  getLineData()
})
</script>
<template>
  <div
    class="data-panel"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <div class="title-box">
      <img
        :src="$fun.getImg('researchManagement/icon14.png')"
        alt=""
      />
      统计分析
    </div>
    <div class="mian panzoom-exclude">
      <div class="search-box">
        <el-form
          :model="params"
          label-width="80px"
          inline
        >
          <el-form-item label="所属设备">
            <el-select
              v-model="params.equipmentId"
              placeholder="请选择所属设备"
              :teleported="false"
              clearable
              popper-class="custom-select-popper"
            >
              <template #label="{ label, value }">
                <span>{{ label }}</span>
                <!-- <span class="status1">在线</span> -->
              </template>
              <el-option
                v-for="item in sssbList"
                :key="item.Id"
                :label="item.name"
                :value="item.equipmentId"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="统计间隔"
            class="date-box"
          >
            <el-select
              v-model="dateType"
              placeholder="请选择统计间隔"
              :teleported="false"
              popper-class="custom-select-popper"
              @change="changeDateType"
            >
              <el-option
                label="日"
                value="date"
              />
              <el-option
                label="月"
                value="month"
              />
              <el-option
                label="年"
                value="year"
              />
            </el-select>
            <el-date-picker
              :key="dateType"
              v-model="params.time"
              value-format="YYYY-MM-DD"
              popper-class="custom-datepicker-popper"
              :type="dateType"
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
                @click="exportData"
              >
                导出
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div class="contain-box">
        <div class="table-contain">
          <div class="table-contain-box">
            <ElTablePanel
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
              layout="total, sizes, pager, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
        <div class="chart-contain">
          <el-segmented
            v-model="currentTab"
            :options="tabs"
            class="custom-segmented"
            @change="changeTab"
          />
          <div class="chart-box">
            <LineChartPanel
              path="path://M 0 -8 L 7 -4 L 7 4 L 0 8 L -7 4 L -7 -4 Z M 0 -2 A 2 2 0 1 1 0 2 A 2 2 0 1 1 0 -2 Z"
              :symbol-size="14"
              :colors="['#fb0d6d', '#00EB10']"
              :node-shadow="true"
              :open-effect="true"
              :data="lineData"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-panel {
  width: 62.5vw;
  height: 720px;
  background: url("@/assets/images/dialog-bg.png") no-repeat center center / 100% 100%;
  display: flex;
  flex-direction: column;
  .title-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70px;
    img {
      width: 1.3542vw;
      margin-right: 0.5208vw;
    }
  }
  .mian {
    flex: 1;
    display: flex;
    padding: 0 24px;
    flex-direction: column;
    overflow-y: hidden;
    .search-box {
      :deep(.el-form) {
        .el-form-item {
          margin-right: 14px;
        }
        .el-form-item__label {
          color: #fff;
        }
        .date-box {
          .el-form-item__content {
            width: max-content;
            gap: 10px;
            display: flex;
            border: none;
            .el-select {
              width: 80px;
              border: 1px solid #304868;
              border-radius: 2px;
            }
            .el-date-editor {
              width: 220px;
              .el-input__wrapper {
                background: #0c284d;
                border: 1px solid #304868;
                box-shadow: none;
                border-radius: 2px;
                .el-input__inner {
                  color: #aab4c1;
                }
              }
            }
          }
        }
        .el-form-item__content {
          border: 1px solid #304868;
          border-radius: 2px;
          width: 140px;
        }
        .search-btns {
          .el-form-item__content {
            border: none;
          }
        }
      }
      .btns {
        display: flex;
        gap: 10px;
        padding: 0 10px;
        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 68px;
          height: 32px;
          padding: 4px 20px;
          cursor: pointer;
        }
        .btn1 {
          background: linear-gradient(to right, #5a8ab6, #375577);
        }
        .btn2 {
          background: #051324;
        }
      }
    }
    .contain-box {
      flex: 1;
      display: flex;
      gap: 10px;
      opacity: 0.8;
      overflow: hidden;
      .table-contain {
        display: flex;
        flex-direction: column;
        width: 50%;
        .table-contain-box {
          flex: 1;
          overflow: hidden;
        }
        .footer-box {
          margin: 10px 0 20px 0;
          overflow: hidden;
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
      .chart-contain {
        flex: 1;
        display: flex;
        flex-direction: column;
        .chart-box {
          position: relative;
          flex: 1;
          margin: 10px 0 20px 0;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.custom-segmented {
  background: #08203b !important;
  .el-segmented__item-selected {
    background: #194570;
  }
  .el-segmented__item-label {
    font-size: 0.7292vw;
    color: #beccdc;
  }
  .el-segmented__item.is-selected {
    .el-segmented__item-label {
      color: #fff !important;
    }
  }
  .el-segmented__item {
    padding: 0 4px;
  }
  .el-segmented__item:not(.is-disabled):not(.is-selected):hover {
    background: #04101e;
  }
}
</style>
