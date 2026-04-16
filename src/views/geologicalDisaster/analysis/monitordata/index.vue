<template>
  <div class="earlyWarningManage-page">
    <div class="wrap wrap1">
      <div class="wrap-header">实时监测</div>
      <div class="wrap-content">
        <div class="select-box">
          <span>站点选择：</span>
          <el-select
            v-model="stationId"
            placeholder="请选择"
            @change="changeSelect"
            style="width: 280px"
          >
            <el-option
              v-for="item in options"
              :key="item.Id"
              :label="item.name"
              :value="item.equipmentId"
            >
            </el-option>
          </el-select>
          <div class="status-box">
            <div
              class="box online"
              v-if="stationStatus == 1"
            >
              <div class="icon"></div>
              <span>在线</span>
            </div>
            <div
              class="box offline"
              v-else-if="stationStatus == 2"
            >
              <div class="icon"></div>
              <span>离线</span>
            </div>
            <div
              class="box blue"
              v-else-if="stationStatus == 3"
            >
              <div class="icon"></div>
              <span>蓝色预警</span>
            </div>
            <div
              class="box yellow"
              v-else-if="stationStatus == 4"
            >
              <div class="icon"></div>
              <span>黄色预警</span>
            </div>
            <div
              class="box organge"
              v-else-if="stationStatus == 5"
            >
              <div class="icon"></div>
              <span>橙色预警</span>
            </div>
            <div
              class="box red"
              v-else-if="stationStatus == 6"
            >
              <div class="icon"></div>
              <span>红色预警</span>
            </div>
          </div>
          <div class="updatetime">更新时间：{{ updatetime }}</div>
        </div>
        <div class="jc-data">
          <div
            class="data-item"
            v-for="(item, index) in jcData"
            :key="index"
          >
            <div class="icon">
              <img :src="item.img" />
            </div>
            <div class="data">
              <div class="name">{{ item.name }}</div>
              <div class="value">{{ item.value }}{{ item.unit }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="wrap wrap2"
      style="margin-top: 15px"
    >
      <div class="wrap-header">统计分析</div>
      <div class="tabs">
        <div
          class="tab-item"
          :class="{ active: item.value == activeTab }"
          v-for="(item, index) in tabs"
          :key="index"
          @click="changeTab(item)"
        >
          {{ item.name }}
        </div>
      </div>
      <div class="wrap-content">
        <div class="search-box">
          <el-form
            class="queryForm"
            ref="queryFormRef"
            label-width="auto"
            :inline="true"
            @keyup.enter.native="handleQuery"
            clearable
          >
            <el-form-item
              label="日期范围:"
              prop="endTime"
            >
              <el-date-picker
                v-model="timeRange"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                :clearable="false"
              />
            </el-form-item>

            <el-form-item label-width="0">
              <el-button
                type="primary"
                plain
                @click="handleQuery"
                >查询</el-button
              >
              <el-button
                type="primary"
                @click="resetQuery"
                >重置</el-button
              >
              <el-button
                type="primary"
                @click="handleExport"
                >导出</el-button
              >
            </el-form-item>
          </el-form>
          <div class="btns">
            <div
              class="btn"
              :class="{ active: activeType == 1 }"
              @click="changeType(1)"
            >
              <SvgIcon icon-class="icon-echart" />
              图形
            </div>
            <div
              class="btn"
              :class="{ active: activeType == 2 }"
              @click="changeType(2)"
            >
              <SvgIcon icon-class="icon-table" />
              表格
            </div>
          </div>
        </div>
        <div
          v-show="activeType == 1"
          class="echart-box"
        >
          <div
            v-if="activeTab == 1"
            class="wyxb-box"
          >
            <div class="row3">
              <div class="col">
                <div class="b1"></div>
                <span>1cm</span>
              </div>
              <div class="col">
                <div class="b2"></div>
                <span>初始位置</span>
              </div>
              <div class="col">
                <div class="b3">
                  <el-icon>
                    <Plus />
                  </el-icon>
                </div>
                <span>当前位置</span>
              </div>
            </div>
            <div class="row1">
              <div class="zb">
                <div
                  class="xline"
                  :style="{ left: index * 10 + 'px' }"
                  v-for="(item, index) in 31"
                ></div>
                <div
                  class="yline"
                  :style="{ top: index * 10 + 'px' }"
                  v-for="(item, index) in 16"
                ></div>
                <div class="x"></div>
                <div class="y"></div>
                <!-- 初始位置 -->
                <div class="b2 cszb"></div>
                <!-- 当前位置 -->
                <div
                  class="currentposition"
                  :style="currentPositionStyle"
                >
                  <el-icon>
                    <Plus />
                  </el-icon>
                  <div class="currentpositionText">
                    水平位移：（{{ (currentPosition[0] / 10).toFixed(2) }},{{ (currentPosition[1] / 10).toFixed(2) }}）
                  </div>
                </div>
                <div
                  class="yj-circle"
                  v-for="(item, index) in warning"
                  :key="index"
                  :style="yjStyle(item)"
                ></div>
              </div>
              <div class="rule">
                <Rule :warning="warning" />
              </div>
              <div class="wy-tabs">
                <div
                  class="tab"
                  :class="{ active: activeWyTab == item }"
                  v-for="(item, index) in wyTabs"
                  @click="changeWyTab(item)"
                >
                  {{ item }}
                </div>
              </div>
            </div>
            <div class="row2">
              <div
                class="chart"
                :key="key"
                id="chart1"
              ></div>
            </div>
          </div>
          <div
            v-if="activeTab != 1"
            :key="key"
            class="chart"
            id="chartjc"
          ></div>
        </div>
        <div
          v-show="activeType == 2"
          class="table-box"
        >
          <el-table
            class="tableList"
            :data="tableData"
            stripe
            :key="key"
            :show-overflow-tooltip="true"
            :header-cell-style="{
              background: 'rgba(193, 209, 228, 0.08)',
              color: 'color: rgba(0, 0, 0, 0.4)',
              fontSize: '14px',
              height: '46px',
              borderBottom: '1px solid #E7E7E7'
            }"
          >
            <el-table-column
              type="index"
              width="55"
              label="序号"
              align="center"
            />
            <template v-if="activeTab == 1">
              <el-table-column
                prop="GC"
                label="高程变化（mm）"
                align="center"
              >
              </el-table-column>
              <el-table-column
                prop="BXL"
                label="北向量变化（mm）"
                align="center"
              >
              </el-table-column>
              <el-table-column
                prop="DXL"
                label="东向量变化（mm）"
                align="center"
              >
              </el-table-column>
            </template>
            <template v-else-if="activeTab == 2">
              <el-table-column
                prop="value"
                label="降雨量（mm）"
                align="center"
              >
              </el-table-column>
            </template>
            <template v-else-if="activeTab == 3">
              <el-table-column
                prop="value"
                label="土壤含水率（%）"
                align="center"
              >
              </el-table-column>
            </template>
            <template v-else-if="activeTab == 4">
              <el-table-column
                prop="value"
                label="地表裂缝（cm）"
                align="center"
              >
              </el-table-column>
            </template>
            <el-table-column
              prop="time"
              label="更新时间"
              align="center"
            >
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { geologicalDisasterApi } from "@/api/geologicalDisaster"
import { Plus } from "@element-plus/icons-vue"
import SvgIcon from "@/components/SvgIcon/index.vue"
import Rule from "../component/rule.vue"
import { getAssetsImages } from "@/hooks/useAssetsImages"
import dayjs from "dayjs"
//站点
const stationId = ref(null)
const stationStatus = ref(1) //状态
const updatetime = ref("") //更新时间
const key = ref(1)
const timeRange = ref([dayjs().subtract(1, "month").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]) //日期范围

const options = ref<any>([])
//监测数据
const jcData = ref<any>([
  {
    name: "高程变化",
    img: getAssetsImages("ScientificResearch/geologicalDisaster-jc1.png"),
    value: "0",
    unit: "mm"
  },
  {
    name: "降雨量",
    img: getAssetsImages("ScientificResearch/geologicalDisaster-jc2.png"),
    value: "0",
    unit: "mm"
  },
  {
    name: "北向量变化",
    img: getAssetsImages("ScientificResearch/geologicalDisaster-jc3.png"),
    value: "0",
    unit: "mm"
  },
  {
    name: "土壤含水率",
    img: getAssetsImages("ScientificResearch/geologicalDisaster-jc4.png"),
    value: "0",
    unit: "%"
  },
  {
    name: "东向量变化",
    img: getAssetsImages("ScientificResearch/geologicalDisaster-jc5.png"),
    value: "0",
    unit: "mm"
  },
  {
    name: "地表裂缝",
    img: getAssetsImages("ScientificResearch/geologicalDisaster-jc6.png"),
    value: "0",
    unit: "cm"
  }
])
//tab
const tabs = ref<any>([
  {
    name: "位移形变",
    value: 1
  },
  {
    name: "降雨量",
    value: 2
  },
  {
    name: "土壤含水率",
    value: 3
  },
  {
    name: "地缝裂缝",
    value: 4
  }
])
//位移形变
const wyTabs = ref(["X", "Y", "H"])
const activeWyTab = ref("X")

const activeType = ref(1) // 1图形 2表格
const activeTab = ref(1)

const tableData = ref<any>([])

//当前位置
const currentPosition = ref([3, 1]) //[x,y]
const currentPositionStyle = computed(() => {
  return {
    left: currentPosition.value[0] + 144 + "px",
    top: -currentPosition.value[1] + 69 + "px"
  }
})
//预警
const warning = ref([
  {
    name: "蓝色预警",
    GC: 120,
    color: "#0052D9"
  },
  {
    name: "黄色预警",
    GC: 100,
    color: "#D9B600"
  },
  {
    name: "橙色预警",
    GC: 80,
    color: "#D97500"
  },
  {
    name: "红色预警",
    GC: 50,
    color: "#D91A00"
  }
])
const yjStyle = (item) => {
  return {
    borderColor: item.color,
    width: item.GC + "px",
    height: item.GC + "px"
  }
}

//获取所有站点
const getData = () => {
  geologicalDisasterApi.getAllGeologicHazardEquipment({}).then((res: any) => {
    if (res.success) {
      options.value = res.response
      if (options.value.length > 0) {
        stationId.value = options.value[0].equipmentId
        changeSelect(stationId.value)
      }
    }
  })
}
//获取详情
let getDetail = (id) => {
  geologicalDisasterApi.getGeologicHazardReality({ equipmentId: id }).then((res) => {
    if (res.success) {
      jcData.value[0].value = res.response.gpsTotalZ.toFixed(1)
      jcData.value[2].value = res.response.gpsTotalY.toFixed(1)
      jcData.value[1].value = res.response.rainfall.toFixed(1)
      jcData.value[3].value = res.response.soilMoistureContent
      jcData.value[4].value = res.response.gpsTotalX.toFixed(1)
      jcData.value[5].value = res.response.surfaceCracks.toFixed(1)
    } else {
      // ElMessage.error(res.msg);
    }
  })
}
//统计分析
let wyxbData = {}
let otherData = []
const getData2 = async () => {
  let query: any = {
    startTime: dayjs(timeRange.value[0]).format("YYYY-MM-DD 00:00:00"),
    endTime: dayjs(timeRange.value[1]).format("YYYY-MM-DD 23:59:59"),
    equipmentId: stationId.value
  }
  if (activeTab.value == 1) {
    let { response } = await geologicalDisasterApi.getDisplacementDeformation(query)
    wyxbData = response
    if (response && response.DXL.length > 0) {
      currentPosition.value = [response.DXL[response.DXL.length - 1].value, response.BXL[response.BXL.length - 1].value]
    } else {
      currentPosition.value = [0, 0]
    }
    nextTick(() => {
      initChart1(response)
    })
  } else if (activeTab.value == 2) {
    query.timeType = "日"
    let { response } = await geologicalDisasterApi.getRainfallMonitoring(query)
    otherData = response
    nextTick(() => {
      initChart(response)
    })
  } else if (activeTab.value == 3) {
    let { response } = await geologicalDisasterApi.getSoilMoistureConten(query)
    otherData = response
    nextTick(() => {
      initChart(response)
    })
  } else if (activeTab.value == 4) {
    let { response } = await geologicalDisasterApi.getSurfaceCracks(query)
    otherData = response
    nextTick(() => {
      initChart(response)
    })
  }
}

//切换下拉框
const changeSelect = (val: any) => {
  let ele = options.value.find((item: any) => item.equipmentId == val)
  stationStatus.value = ele.status
  updatetime.value = ele.updateTime
  tableData.value = []
  getDetail(val)
  getData2()
}
//切换tab
const changeTab = (item) => {
  activeTab.value = item.value
  key.value = new Date().getTime()
  tableData.value = []
  nextTick(() => {
    getData2()
  })
}

//切换类型
const changeType = (val: number) => {
  activeType.value = val
  key.value = new Date().getTime()
  if (activeTab.value == 1) {
    nextTick(() => {
      initChart1(wyxbData)
    })
  } else {
    nextTick(() => {
      initChart(otherData)
    })
  }
}

//查询
const handleQuery = () => {
  getData2()
}
//重置
const resetQuery = () => {
  timeRange.value = [dayjs().subtract(1, "month").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]
  getData2()
}

//导出
const handleExport = () => {
  ElMessageBox.confirm("此操作将导出excel文件, 是否继续?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    let name = options.value.find((item: any) => item.equipmentId == stationId.value).name
    tableData.value = tableData.value.map((item) => {
      item.name = name
      return item
    })
    export2Excel(tableData.value)
  })
}
import { exportFile } from "@/utils/excel/ExportExcel"
function export2Excel(exportData) {
  let fieldConfig: any = []
  if (activeTab.value == 1) {
    fieldConfig = [
      {
        label: "设备名称",
        model: "name"
      },
      {
        label: "高程变化（mm）",
        model: "GC"
      },
      {
        label: "北向量变化（mm）",
        model: "BXL"
      },
      {
        label: "东向量变化（mm）",
        model: "DXL"
      },
      {
        label: "更新时间",
        model: "time"
      }
    ]
  } else if (activeTab.value == 2) {
    fieldConfig = [
      {
        label: "设备名称",
        model: "name"
      },
      {
        label: "降雨量（mm）",
        model: "value"
      },
      {
        label: "更新时间",
        model: "time"
      }
    ]
  } else if (activeTab.value == 3) {
    fieldConfig = [
      {
        label: "设备名称",
        model: "name"
      },
      {
        label: "土壤含水率（%）",
        model: "value"
      },
      {
        label: "更新时间",
        model: "time"
      }
    ]
  } else if (activeTab.value == 4) {
    fieldConfig = [
      {
        label: "设备名称",
        model: "name"
      },
      {
        label: "地表裂缝（cm）",
        model: "value"
      },
      {
        label: "更新时间",
        model: "time"
      }
    ]
  }
  // 获取需要导出的字段配置
  const export_fields = fieldConfig.map(({ label, model }) => ({
    [model]: label
  }))
  const export_data = exportData.map((obj) => {
    const newObj: any = {}
    export_fields.forEach((field) => {
      let arr: any = Object.entries(field)[0]
      newObj[arr[1]] = obj[arr[0]]
    })
    return newObj
  })
  exportFile(export_data, tabs.value[activeTab.value - 1].name)
}
//切换位移形变tab
const changeWyTab = (item) => {
  activeWyTab.value = item
  initChart1(wyxbData)
}

import * as echarts from "echarts"
import { HexToRGB } from "@/utils/index"
//echart--曲线图
let chart1: any = null
const initChart1 = (response) => {
  let data: any = []
  let data1: any = []
  let xAxisData: any = []
  let yAxisData: any = []
  let key = ""
  if (activeWyTab.value == "Y") {
    key = "BXL"
  } else if (activeWyTab.value == "X") {
    key = "DXL"
  } else if (activeWyTab.value == "H") {
    key = "GC"
  }

  let option: any = null
  if (!response || response.DXL.length == 0) {
    option = {
      title: {
        text: "暂无数据",
        left: "center",
        top: "center",
        textStyle: {
          color: "#247C86",
          fontSize: "14",
          fontWeight: "normal"
        }
      }
    }
  } else {
    data = response[key].map((item) => {
      return {
        name: item.statisticalTime,
        value: item.value
      }
    })
    response["GC"].forEach((item: any) => {
      tableData.value.push({
        time: item.statisticalTime,
        GC: item.value
      })
    })
    tableData.value.forEach((item: any, index) => {
      item.BXL = response["BXL"].find((it: any) => it.statisticalTime == item.time)?.value
      item.DXL = response["DXL"].find((it: any) => it.statisticalTime == item.time)?.value
    })
    if (activeType.value == 2) return
    chart1?.dispose && chart1.dispose() // 销毁实例
    let chart: any = document.getElementById("chart1")
    chart.removeAttribute("_echarts_instance_")
    chart1 = echarts.init(chart as HTMLDivElement)
    data.forEach((item: any) => {
      xAxisData.push(item.name)
      yAxisData.push(item.value)
      data1.push([item.name, item.value])
    })
    if (data.length === 0) {
      option = {
        title: {
          text: "暂无数据",
          left: "center",
          top: "center",
          textStyle: {
            color: "#247C86",
            fontSize: "14",
            fontWeight: "normal"
          }
        }
      }
    } else {
      option = {
        grid: {
          left: 40,
          right: 40,
          top: 40,
          bottom: 40
        },
        dataZoom: [
          {
            type: "slider",
            show: xAxisData.length > 24 ? true : false,
            xAxisIndex: [0],
            startValue: 0,
            endValue: 24,
            bottom: 0, //居下的距离
            height: 10,
            color: "transparent",
            fontSize: 9
          },
          {
            type: "inside",
            xAxisIndex: [0],
            start: 1,
            end: xAxisData.length - 1,
            filterMode: "weakFilter"
          }
        ],
        //X轴
        xAxis: {
          type: "category",
          name: "",
          data: xAxisData,
          show: true,
          // scale: true,
          axisTick: {
            show: false
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: "rgba(255,255,255,0.2)"
            }
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: "rgba(255,255,255,0.4)"
            }
          },
          axisLabel: {
            rotate: 0,
            color: "rgba(0, 0, 0, 0.5)",
            fontSize: 14,
            interval: "auto",
            formatter: function (value) {
              let name = value
              name = dayjs(name).format("YYYY-MM-DD HH:mm")
              return name
            }
          }
        },
        yAxis: {
          name: "mm",
          axisLine: {
            show: false,
            lineStyle: {
              color: "rgba(0, 0, 0, 0.5)"
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed",
              color: "rgba(0, 0, 0, 0.2)"
            }
          },
          axisLabel: {
            color: "rgba(0, 0, 0, 0.5)",
            fontSize: 14
          }
        },
        series: [
          {
            symbolSize: 20,
            data: data1,
            type: "scatter"
          }
        ]
      }
    }
  }
  chart1.clear()
  chart1.setOption(option)
  window.addEventListener("resize", resizeChart)
}
//echart--曲线图
let chartjc: any = null
const initChart = (response) => {
  let color = ["#02EC8A", "#02B4EC", "#EC9F02", "#cddc39"]
  let unit = ["mm", "mm", "%", "cm"]
  let name = tabs.value[activeTab.value - 1].name
  let data: any = []
  let xAxisData: any = []
  let yAxisData: any = []
  response.forEach((item) => {
    if (activeTab.value == 2) {
      data.push({ name: item.time, value: item.value })
    } else if (activeTab.value == 3) {
      data.push({
        name: item.statisticalTime,
        value: item.value
      })
    } else if (activeTab.value == 4) {
      data.push({
        name: item.statisticalTime,
        value: item.value
      })
    }
  })
  tableData.value = data.map((i) => {
    i.time = i.name
    return i
  })
  if (activeType.value == 2) return
  data.forEach((item: any) => {
    xAxisData.push(item.name)
    yAxisData.push(item.value)
  })

  chartjc?.dispose && chartjc.dispose() // 销毁实例
  let chart: any = document.getElementById("chartjc")
  chart.removeAttribute("_echarts_instance_")
  chartjc = echarts.init(chart as HTMLDivElement)
  let option: any = null
  if (data.length === 0) {
    option = {
      title: {
        text: "暂无数据",
        left: "center",
        top: "center",
        textStyle: {
          color: "#247C86",
          fontSize: "14",
          fontWeight: "normal"
        }
      }
    }
  } else {
    option = {
      tooltip: {
        backgroundColor: "#0052D9",
        borderColor: "rgba(115, 255, 196, 0.85)",
        color: "#fff",
        trigger: "axis",
        textStyle: {
          color: "#fff"
        },
        axisPointer: {
          type: "shadow"
        },
        formatter: function (params) {
          return params[0].name + " : " + params[0].value + unit[activeTab.value - 1]
        }
      },
      grid: {
        left: "2%",
        right: "2%",
        top: "35",
        bottom: "4%",
        containLabel: true
      },
      dataZoom: [
        {
          type: "slider",
          show: xAxisData.length > 24 ? true : false,
          xAxisIndex: [0],
          startValue: 0,
          endValue: 24,
          bottom: 0, //居下的距离
          height: 10,
          color: "transparent",
          fontSize: 9
        },
        {
          show: xAxisData.length > 24 ? true : false,
          type: "inside",
          xAxisIndex: [0],
          start: 1,
          end: xAxisData.length - 1,
          filterMode: "weakFilter"
        }
      ],
      //X轴
      xAxis: {
        name: "",
        data: xAxisData,
        show: true,
        type: "category",
        axisTick: {
          show: false
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: "rgba(255,255,255,0.2)"
          }
        },
        axisLine: {
          show: false,
          lineStyle: {
            color: "rgba(255,255,255,0.4)"
          }
        },
        axisLabel: {
          rotate: 0,
          color: "rgba(0, 0, 0, 0.5)",
          fontSize: 14,
          interval: "auto",
          formatter: function (value) {
            let name = value
            name = dayjs(name).format("YYYY-MM-DD HH:mm")
            return name
          }
        }
      },
      yAxis: {
        name: unit[activeTab.value - 1],
        axisLine: {
          show: false,
          lineStyle: {
            color: "rgba(0, 0, 0, 0.5)"
          }
        },
        show: true,
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            color: "rgba(0, 0, 0, 0.2)"
          }
        },
        axisLabel: {
          color: "rgba(0, 0, 0, 0.5)",
          fontSize: 14
        }
      },
      series: [
        {
          name: name,
          type: "line",
          smooth: true,
          symbolSize: 10,
          label: {
            show: false,
            position: "top",
            color: "rgba(1, 251, 246, 1)",
            fontSize: 16
          },
          itemStyle: {
            color: color[activeTab.value - 1]
          },
          areaStyle: {
            color: HexToRGB(color[activeTab.value - 1], 0.6)
          },
          emphasis: {
            focus: "series"
          },
          data: yAxisData
        }
      ]
    }
  }
  chartjc.clear()
  chartjc.setOption(option)
  window.addEventListener("resize", resizeChart)
}
// 窗口大小改变事件
function resizeChart() {
  chartjc?.resize()
  chart1?.resize()
}
onMounted(() => {
  getData()
})
onUnmounted(() => {
  window.removeEventListener("resize", resizeChart)
})
</script>

<style lang="scss" scoped>
.earlyWarningManage-page {
  font-size: 14px;
  .wrap {
    background: #ffffff;

    .wrap-header {
      display: flex;
      align-items: center;
      height: 48px;
      padding: 0 16px;
      color: #222222;
      font-size: 16px;
      border-bottom: 1px solid #e7e7e7;
      font-weight: 700;

      &::before {
        content: "";
        display: inline-block;
        width: 3px;
        height: 16px;
        background: #222222;
        margin-right: 10px;
      }
    }

    .wrap-content {
      padding: 20px;
    }
  }
  .wrap1 {
    .select-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      --el-input-border-color: #0052d9;
      .status-box {
        flex: 1;
        .box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 67px;
          height: 32px;
          margin-left: 10px;
          border-radius: 3px;
          background: rgba(0, 207, 158, 0.1);
          border: 1px solid rgba(0, 207, 158, 1);
          color: rgba(0, 207, 158, 1);
          .icon {
            position: relative;
            width: 14px;
            height: 14px;
            margin-right: 5px;
            border-radius: 50%;
            background: rgba(0, 207, 158, 0.3);
            &::before {
              content: "";
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translateX(-50%) translateY(-50%);
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: rgba(0, 207, 158, 1);
            }
          }
          span {
            font-weight: 500;
            font-size: 14px;
          }
        }
        .offline {
          background: rgba(153, 153, 153, 0.1);
          border: 1px solid rgba(153, 153, 153, 1);
          color: #999;
          .icon {
            background: rgba(153, 153, 153, 0.3);

            &::before {
              content: "";
              background: #999;
            }
          }
        }
        .blue {
          background: rgba(0, 82, 217, 0.1);
          border: 1px solid rgba(0, 82, 217, 1);
          color: #999;

          .icon {
            background: rgba(0, 82, 217, 0.3);

            &::before {
              content: "";
              background: rgba(0, 82, 217, 1);
            }
          }
        }
        .yellow {
          background: rgba(217, 182, 0, 0.1);
          border: 1px solid rgba(217, 182, 0, 1);
          color: #999;

          .icon {
            background: rgba(217, 182, 0, 0.3);

            &::before {
              content: "";
              background: rgba(217, 182, 0, 1);
            }
          }
        }
        .orange {
          background: rgba(217, 117, 0, 0.1);
          border: 1px solid rgba(217, 117, 0, 1);
          color: #999;

          .icon {
            background: rgba(217, 117, 0, 0.3);

            &::before {
              content: "";
              background: rgba(217, 117, 0, 1);
            }
          }
        }
        .red {
          background: rgba(217, 26, 0, 0.1);
          border: 1px solid rgba(217, 26, 0, 1);
          color: #999;

          .icon {
            background: rgba(217, 26, 0, 0.3);

            &::before {
              content: "";
              background: rgba(217, 26, 0, 1);
            }
          }
        }
      }
      .updatetime {
        margin-left: 40px;
        opacity: 0.5;
        color: #000000;
      }
      :deep(.el-input__wrapper) {
        //  --el-input-border-color: #0052D9;
        border-radius: 3px;
      }
    }
    .jc-data {
      display: flex;
      align-content: center;
      margin-top: 20px;
      .data-item {
        display: flex;
        align-items: center;
        margin-right: 94px;
        .icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          margin-right: 16px;
          background: #f2f3ff;
          img {
            width: 28px;
            height: 28px;
          }
        }
        .data {
          .name {
            color: rgba(0, 0, 0, 0.6);
          }
          .value {
            font-size: 28px;
            color: rgba(0, 0, 0, 0.9);
            line-height: 36px;
          }
        }
      }
    }
  }
  .wrap2 {
    .tabs {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e7e7e7;
      .tab-item {
        position: relative;
        height: 48px;
        line-height: 48px;
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
        font-weight: normal;
        margin-right: 16px;
        padding: 0 16px;
        cursor: pointer;
        &.active {
          color: #0052d9;
          border-bottom: 3px solid #0052d9;
        }
      }
    }
    .search-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      .btns {
        display: flex;
        align-items: center;
        border: 1px solid rgba(0, 0, 0, 0.1);
        height: 38px;

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 78px;
          height: 38px;
          color: #000000;
          font-size: 16px;
          cursor: pointer;

          .svg-icon {
            margin-right: 10px;
          }

          &.active {
            color: #0052d9;
            background: rgba(0, 82, 217, 0.2);
          }
        }
      }
    }
    .table-box,
    .echart-box {
      height: calc(100% - 54px);
      overflow: auto;
      .chart {
        width: 100%;
        height: 100%;
      }
    }
    .wyxb-box {
      height: 100%;
      .b2 {
        width: 10px;
        height: 10px;
        background: #16d148;
        border-radius: 50%;
      }
      .cszb {
        position: absolute;
        left: 151px;
        top: 76px;
        transform: translateX(-50%) translateY(-50%);
      }
      .currentposition {
        position: absolute;
        z-index: 2;
        transform: scale(1);
        font-weight: 700;
      }
      .yj-circle {
        position: absolute;
        left: 151px;
        top: 76px;
        transform: translateX(-50%) translateY(-50%);
        border-radius: 50%;
        border: 1px solid;
      }
      .row1 {
        position: relative;
        display: flex;
        align-items: center;
        height: 150px;
        .zb {
          position: relative;
          width: 300px;
          height: 150px;
          .xline {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 1px;
            background: #e7e7e7;
          }
          .yline {
            position: absolute;
            left: 0;
            right: 0;
            height: 1px;
            background: #e7e7e7;
          }
          .x {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 150px;
            width: 2px;
            background: #16d148;
            &::after {
              content: "Y北方向";
              display: inline-block;
              position: absolute;
              top: 0;
              left: 15px;
              color: #333;
              font-size: 14px;
              white-space: nowrap;
            }
          }
          .y {
            position: absolute;
            left: 0;
            right: 0;
            top: 75px;
            height: 2px;
            background: #16d148;
            &::after {
              content: "X东方向";
              display: inline-block;
              position: absolute;
              top: 5px;
              right: 0;
              color: #333;
              font-size: 14px;
              white-space: nowrap;
            }
          }
        }
        .rule {
          width: 300px;
          height: 150px;
        }
      }
      .row2 {
        height: calc(100% - 150px - 16px - 30px);
        margin-top: 16px;
      }
      .row3 {
        display: flex;
        align-items: center;
        height: 20px;
        margin-bottom: 10px;
        .col {
          display: flex;
          align-items: center;
          margin-right: 20px;
          span {
            margin-left: 6px;
          }
        }
        .b1 {
          width: 15px;
          height: 15px;
          border: 1px solid #e7e7e7;
        }

        .b3 {
          height: 16px;
          color: #000;
          font-size: 14px;
        }
      }
      .wy-tabs {
        position: absolute;
        bottom: 0;
        right: 0;
        display: flex;
        height: 40px;
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid #e7e7e7;
        .tab {
          width: 40px;
          line-height: 40px;
          color: #333;
          cursor: pointer;
          text-align: center;
          &:nth-child(2) {
            border-left: 1px solid #e7e7e7;
            border-right: 1px solid #e7e7e7;
          }
          &.active {
            background: #0052d9;
            color: #fff;
          }
        }
      }
    }
  }
  :deep(.el-form-item--default) {
    margin-bottom: 0;
  }
}
</style>
