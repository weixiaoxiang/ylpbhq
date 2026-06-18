<template>
  <div class="data-panel-jcfx">
    <div class="title-box">
      <img
        :src="$fun.getImg('researchManagement/icon14.png')"
        alt=""
      />
      <div>监测分析</div>
    </div>
    <div class="mian">
      <div class="wrapjc wrap1">
        <div class="wrap-header">
          <div class="jt"></div>
          <div class="titlename">实时监测</div>
        </div>
        <div class="wrap-content">
          <div class="select-box">
            <span style="color: #fff">站点选择：</span>
            <el-select
              v-model="stationId"
              placeholder="请选择"
              @change="changeSelect"
              style="width: 280px"
            >
              <el-option
                v-for="item in options"
                :key="item.monitorpointid"
                :label="item.monitorpointname"
                :value="item.monitorpointid"
              >
              </el-option>
            </el-select>
            <div class="status-box">
              <div class="online"></div>
            </div>
            <!-- <div class="updatetime">更新时间：{{ updatetime }}</div> -->
          </div>
          <div class="jc-data">
            <div
              :class="['data-item', index % 2 !== 0 ? 'odd-background' : 'even-background']"
              v-for="(item, index) in jcData"
              :key="index"
            >
              <div class="icon">
                <img
                  :src="item.img"
                  style="width: 100%; height: 100%"
                />
              </div>
              <div class="data">
                <div class="value">
                  {{ item.value }}<span style="font-size: 15px"> {{ item.unit }}</span>
                </div>
                <div class="name">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="wrapjc wrap2">
        <div class="wrap-header">
          <div class="jt"></div>
          <div class="titlename">统计分析</div>
        </div>
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
        <div class="wrap2-content">
          <div class="search-box2">
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
                <div
                  class="fun-btn"
                  :class="{ active: currentbtnTool === 1 }"
                  @click="handleQuery"
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
                  @click="resetQuery"
                >
                  <img
                    src="/images/geologicalDisaster/btn-cz.png"
                    alt=""
                  />
                  重置
                </div>
                <div
                  class="fun-btn"
                  :class="{ active: currentbtnTool === 3 }"
                  @click="handleExport"
                >
                  <img
                    src="/images/geologicalDisaster/btn-dc.png"
                    alt=""
                  />
                  导出
                </div>
              </el-form-item>
            </el-form>
            <div class="btns">
              <div
                class="btn first-btn"
                :class="{ active: activeType == 1 }"
                @click="changeType(1)"
              >
                <div
                  v-if="activeType == 1"
                  class="pictureon"
                ></div>
                <div
                  v-else
                  class="pictureclose"
                ></div>
                <!-- <SvgIcon icon-class="icon-echart" /> -->
                图形
              </div>
              <div
                class="btn"
                :class="{ active: activeType == 2 }"
                @click="changeType(2)"
              >
                <div
                  v-if="activeType == 2"
                  class="tableon"
                ></div>
                <div
                  v-else
                  class="tableclose"
                ></div>
                <!-- <SvgIcon icon-class="icon-table" /> -->
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
                  <div class="corner-top-right"></div>
                  <div class="corner-bottom-left"></div>
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
                      水平位移：（{{ (currentPosition[0] / 10).toFixed(2) }},{{
                        (currentPosition[1] / 10).toFixed(2)
                      }}）
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
                  <div class="gcbh">{{ (currentHeight / 10).toFixed(2) }}cm</div>
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
                  id="chartxyz"
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
              height="100%"
              stripe
              :key="key"
              show-overflow-tooltip
              :header-cell-style="{
                background: '#204b78',
                color: 'rgba(255, 255, 255, .75)',
                fontSize: '14px',
                height: '46px',
                borderBottom: '1px solid #204b78'
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
                  label="地表裂缝（mm）"
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
  </div>
</template>
<script lang="ts" setup>
import dayjs from "dayjs"
import * as echarts from "echarts"
import { geologicalDisasterApi } from "@/api/geologicalDisaster"
import { HexToRGB } from "@/utils/index"
import { Plus } from "@element-plus/icons-vue"
import Rule from "./rule.vue"
//站点
const stationId = <any>ref(null)
const key = ref(1)
const timeRange = ref([dayjs().subtract(1, "month").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]) //日期范围
const currentbtnTool = ref()
//统计分析
let wyxbData = {}
let otherData: any = []
const getData2 = async () => {
  let query: any = {
    startTime: dayjs(timeRange.value[0]).format("YYYY-MM-DD 00:00:00"),
    endTime: dayjs(timeRange.value[1]).format("YYYY-MM-DD 23:59:59"),
    equipmentId: stationId.value
  }
  if (activeTab.value == 1) {
    let { response } = await geologicalDisasterApi.GetDisplacementDeformation(query)
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
    let { response } = await geologicalDisasterApi.GetRainfallMonitoring(query)
    otherData = response
    nextTick(() => {
      initChart(response)
    })
  } else if (activeTab.value == 3) {
    let { response } = await geologicalDisasterApi.GetSoilMoistureContent(query)
    otherData = response
    nextTick(() => {
      initChart(response)
    })
  } else if (activeTab.value == 4) {
    let { response } = await geologicalDisasterApi.GetSurfaceCracks(query)
    otherData = response
    nextTick(() => {
      initChart(response)
    })
  }
}

//切换下拉框
const changeSelect = (val: any) => {
  tableData.value = []
  getDetail(val)
  getData2()
}
//重置
const resetQuery = () => {
  currentbtnTool.value = 2
  timeRange.value = [dayjs().subtract(1, "month").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]
  getData2()
}

//导出
const handleExport = () => {
  currentbtnTool.value = 3
  ElMessageBox.confirm("此操作将导出excel文件, 是否继续?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    let name = options.value.find((item: any) => item.monitorpointid == stationId.value).monitorpointname
    tableData.value = tableData.value.map((item: any) => {
      item.name = name
      return item
    })
    export2Excel(tableData.value)
  })
}
import { exportFile } from "@/utils/excel/ExportExcel"

function export2Excel(exportData: any) {
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
        label: "地表裂缝（mm）",
        model: "value"
      },
      {
        label: "更新时间",
        model: "time"
      }
    ]
  }
  // 获取需要导出的字段配置
  const export_fields = fieldConfig.map(({ label, model }: any) => ({
    [model]: label
  }))
  const export_data = exportData.map((obj: any) => {
    const newObj: any = {}
    export_fields.forEach((field: any) => {
      let arr: any = Object.entries(field)[0]
      newObj[arr[1]] = obj[arr[0]]
    })
    return newObj
  })
  exportFile(export_data, tabs.value[activeTab.value - 1].name)
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
//监测数据
const jcData = ref<any>([
  {
    name: "高程变化",
    img: "/images/geologicalDisaster/dialogimage/ssjcicon1.png",
    value: "0",
    unit: "mm"
  },
  {
    name: "降雨量",
    img: "/images/geologicalDisaster/dialogimage/ssjcicon2.png",
    value: "0",
    unit: "mm"
  },
  {
    name: "北向量变化",
    img: "/images/geologicalDisaster/dialogimage/ssjcicon3.png",
    value: "0",
    unit: "mm"
  },
  {
    name: "土壤含水率",
    img: "/images/geologicalDisaster/dialogimage/ssjcicon4.png",
    value: "0",
    unit: "%"
  },
  {
    name: "东向量变化",
    img: "/images/geologicalDisaster/dialogimage/ssjcicon5.png",
    value: "0",
    unit: "mm"
  },
  {
    name: "地表裂缝",
    img: "/images/geologicalDisaster/dialogimage/ssjcicon6.png",
    value: "0",
    unit: "mm"
  }
])
const activeTab = ref(1)
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
const activeType = ref(1) // 1图形 2表格
//当前位置
const currentPosition = ref([3, 1]) //[x,y]
//当前高度
const currentHeight = ref(0)
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
const yjStyle = (item: any) => {
  return {
    borderColor: item.color,
    width: item.GC + "px",
    height: item.GC + "px"
  }
}

//获取所有站点
const getData = async () => {
  geologicalDisasterApi.GeologicHazard_DevicSelect({}).then((res: any) => {
    if (res.success) {
      options.value = res.response
      if (options.value.length > 0) {
        stationId.value = options.value[0].monitorpointid
        tableData.value = []
        getDetail(stationId.value)
        getData2()
      }
    }
  })
}
//获取详情
let getDetail = (id: any) => {
  geologicalDisasterApi.GetGeologicHazardReality({ equipmentId: id }).then((res: any) => {
    if (res.success) {
      jcData.value[0].value = res.response.gpsTotalZ.toFixed(1)
      jcData.value[2].value = res.response.gpsTotalY.toFixed(1)
      jcData.value[1].value = res.response.rainfall.toFixed(1)
      jcData.value[3].value = res.response.soilMoistureContent
      jcData.value[4].value = res.response.gpsTotalX.toFixed(1)
      jcData.value[5].value = res.response.surfaceCracks.toFixed(1)

      currentHeight.value = res.response.gpsTotalZ.toFixed(1)
    } else {
      // ElMessage.error(res.msg);
    }
  })
}
//位移形变
const wyTabs = ref(["X", "Y", "H"])
const tableData = ref<any>([])
const activeWyTab = ref("X")
//切换位移形变tab
const changeWyTab = (item: any) => {
  activeWyTab.value = item
  initChart1(wyxbData)
}
//查询
const handleQuery = () => {
  currentbtnTool.value = 1
  nextTick(() => {
    getData2()
  })
}
const options = ref<any>([])

//切换tab
const changeTab = (item: any) => {
  activeTab.value = item.value //控制统计分析中的tab切换
  key.value = new Date().getTime()
  tableData.value = []
  nextTick(() => {
    getData2()
  })
}

//echart--曲线图
let chart1: any = null
const initChart1 = (response: any) => {
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
    data = response[key].map((item: any) => {
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
    tableData.value.forEach((item: any) => {
      item.BXL = response["BXL"].find((it: any) => it.statisticalTime == item.time)?.value
      item.DXL = response["DXL"].find((it: any) => it.statisticalTime == item.time)?.value
    })
    if (activeType.value == 2) return
    chart1?.dispose && chart1.dispose() // 销毁实例
    let chart: any = document.getElementById("chartxyz")
    // chart.removeAttribute("_echarts_instance_")
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
            color: "#fff",
            fontSize: 14,
            interval: "auto",
            formatter: function (value: any) {
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
              color: "#fff"
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed",
              color: "#FFFFFF33"
            }
          },
          axisLabel: {
            color: "#fff",
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
  chart1?.clear()
  chart1?.setOption(option)
  window.addEventListener("resize", resizeChart)
}
//echart--曲线图
let chartjc: any = null
const initChart = (response: any) => {
  let color = ["#02EC8A", "#02B4EC", "#EC9F02", "#cddc39"]
  let unit = ["mm", "mm", "%", "mm"]
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
          color: "#fff",
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
            color: "#fff"
          }
        },
        show: true,
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            color: "#FFFFFF33"
          }
        },
        axisLabel: {
          color: "#fff",
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

.data-panel-jcfx {
  width: vw(1320);
  height: vh(885);
  background: url("/images/geologicalDisaster/dialog-bg.png") no-repeat center center / 100% 100%;
  display: flex;
  flex-direction: column;
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
    padding: 0 120px;
    flex-direction: column;
    overflow-y: hidden;
    height: calc(100% - 70px);

    .wrapjc {
      background: none !important;

      .wrap-header {
        display: flex;
        align-items: center;
        height: 18px;
        color: #fff;
        font-size: 16px;
        font-weight: 700;

        .jt {
          width: 16px;
          height: 15px;
          background: url("/images/geologicalDisaster/dialogimage/jt.png") no-repeat center center;
        }
        .titlename {
          width: 100%;
          height: 18px;
          margin-left: 10px;

          color: #2cfefe;
        }
      }

      .wrap-content {
        padding: 20px 0px;
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
              width: 66px;
              height: 36px;
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
          border-radius: 3px;
        }
      }
      .jc-data {
        display: flex;
        align-content: center;
        justify-content: space-between;

        margin-top: 20px;
        .odd-background {
          width: 193.67px;
          height: 65.33px;
          background: url("/images/geologicalDisaster/row1-2.png") no-repeat center center;
          background-size: 100% 100%;
        }
        .even-background {
          width: 193.67px;
          height: 65.33px;
          background: url("/images/geologicalDisaster/row1-1.png") no-repeat center center;
          background-size: 100% 100%;
        }
        .data-item {
          display: flex;
          align-items: center;
          width: 193.67px;
          height: 65.33px;

          .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 66px;
            height: 36px;
            margin-right: 16px;
            img {
              width: 28px;
              height: 28px;
            }
          }
          .data {
            .name {
              color: #beccdc;
              font-family: Microsoft YaHei;
              font-size: 12px;
              font-weight: 400;
              line-height: 18px;
              text-align: left;
              text-underline-position: from-font;
              text-decoration-skip-ink: none;
            }
            .value {
              color: #3be3de;
              font-family: Quantico;
              font-size: 20px;
              font-weight: 700;
              line-height: 18px;
              text-align: left;
              text-underline-position: from-font;
              text-decoration-skip-ink: none;
            }
          }
        }
      }
    }
    .wrap2 {
      height: calc(100% - 185px);
      .wrap2-content {
        height: calc(100% - 90px);
      }
      .tabs {
        display: flex;
        align-items: center;
        margin-top: 18px;
        .tab-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 161px;
          height: 38px;
          color: #ffffff;
          font-family: FZLanTingHeiS-R-GB;
          line-height: 18px;
          text-align: left;
          text-underline-position: from-font;
          text-decoration-skip-ink: none;

          font-size: 14px;
          font-weight: normal;
          margin-right: 9px;
          background: url("/images/geologicalDisaster/row2-2.png") no-repeat center center;
          background-size: 100% 100%;
          cursor: pointer;
          &.active {
            color: #2cfefe;
            background: url("/images/geologicalDisaster/row2-1.png") no-repeat center center;
            background-size: 100% 100%;
          }
        }
      }
      :deep(.search-box2) {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 35px;
        // height: 36px;
        .btns {
          display: flex;
          align-items: center;
          border: 1px solid rgba(0, 0, 0, 0.1);
          height: 36px;
          margin-bottom: 20px;
          .pictureon {
            width: 15px;
            height: 14px;
            background: url("/images/geologicalDisaster/picture-on.png") no-repeat center center / 100% 100%;
            margin-right: 3px;
          }

          .pictureclose {
            width: 15px;
            height: 14px;

            background: url("/images/geologicalDisaster/picture-close.png") no-repeat center center / 100% 100%;
            margin-right: 3px;
          }

          .tableon {
            width: 13.13px;
            height: 13.13px;

            background: url("/images/geologicalDisaster/table-on.png") no-repeat center center / 100% 100%;
            margin-right: 3px;
          }

          .tableclose {
            width: 13.13px;
            height: 13.13px;
            background: url("/images/geologicalDisaster/table-close.png") no-repeat center center / 100% 100%;
            margin-right: 3px;
          }

          .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 78px;
            height: 36px;
            color: #2aeaf7;
            font-size: 16px;

            border: 0.5px solid #2aeaf7;

            border-radius: 3px;

            cursor: pointer;

            .svg-icon {
              margin-right: 10px;
            }

            &.active {
              color: #fff;
              border: 0.5px solid #2aeaf7;
              box-shadow: 0px 4px 4px 0px #00000040;
              background: linear-gradient(
                270deg,
                #2aeaf7 -3.17%,
                rgba(42, 234, 247, 0.5) 5.08%,
                rgba(42, 234, 247, 0.5) 93.93%,
                #2aeaf7 104.94%
              );
            }
          }
          .first-btn {
            margin-right: 20px;
          }
        }

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
      .table-box,
      .echart-box {
        overflow: auto;
        height: calc(100% - 156px);
        margin-top: 15px;
        .chart {
          width: 100%;
          height: 100%;
        }
        .tableList {
          &.el-table {
            background: transparent !important;
            color: rgba(255, 255, 255, 0.8);
            --el-table-row-hover-bg-color: rgba(0, 0, 0, 0.8);
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
      .wyxb-box {
        height: 100%;
        width: 100%;
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

          .currentpositionText {
            color: #ffffff;
          }
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
          height: 40%;
          .zb {
            position: relative;
            width: 300px;
            height: 155px;
            background: #142c44;

            &::before,
            &::after {
              content: "";
              position: absolute;
              width: 15px;
              height: 15px;
            }

            &::before {
              top: 0;
              left: 0;
              border-top: 2px solid #38eaed;
              border-left: 2px solid #38eaed;
              z-index: 999;
            }
            &::after {
              bottom: 0;
              right: 0;
              border-bottom: 2px solid #38eaed;
              border-right: 2px solid #38eaed;
            }

            .corner-top-right::before,
            .corner-bottom-left::after {
              content: "";
              position: absolute;
              width: 15px;
              height: 15px;
              z-index: 999;
            }
            .corner-top-right::before {
              top: 0;
              right: 0;
              border-top: 2px solid #38eaed;
              border-right: 2px solid #38eaed;
            }
            .corner-bottom-left::after {
              bottom: 0;
              left: 0;
              border-bottom: 2px solid #38eaed;
              border-left: 2px solid #38eaed;
            }
            .xline {
              position: absolute;
              top: 0;
              bottom: 0;
              width: 1px;
              background: #153a54;
            }
            .yline {
              position: absolute;
              left: 0;
              right: 0;
              height: 1px;
              background: #153a54;
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
                color: #39f0f2;

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
                color: #39f0f2;
                font-size: 14px;
                white-space: nowrap;
              }
            }
          }
          .rule {
            width: 300px;
            height: 150px;
            position: relative;
            .gcbh {
              position: absolute;
              top: 2px;
              left: 100px;
              color: #20fe20;
              height: 10px;
            }
          }
        }
        .row2 {
          width: 100%;
          height: 50%;
          .chart {
            width: 100%;
            height: 100%;
          }
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
            color: #fff;
            span {
              margin-left: 6px;
            }
          }
          .b1 {
            width: 15px;
            height: 15px;
            border: 1px solid #5582ac;
          }
          .b2 {
            width: 10.53px;
            height: 10.53px;
            background: #95f320;
          }

          .b3 {
            height: 16px;
            color: #fff;
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
          .tab {
            width: 40px;
            line-height: 40px;
            color: #2aeaf7;
            border: 0.5px solid #2aeaf7;
            border-radius: 3px;
            cursor: pointer;
            text-align: center;
            &.active {
              color: #fff;
              border: 0.5px solid #2aeaf7;
              box-shadow: 0px 4px 4px 0px #00000040;
              background: linear-gradient(
                270deg,
                #2aeaf7 -3.17%,
                rgba(42, 234, 247, 0.5) 5.08%,
                rgba(42, 234, 247, 0.5) 93.93%,
                #2aeaf7 104.94%
              );
            }
          }

          .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 78px;
            height: 36px;
            color: #2aeaf7;
            font-size: 16px;

            border: 0.5px solid #2aeaf7;

            border-radius: 3px;

            cursor: pointer;

            .svg-icon {
              margin-right: 10px;
            }

            &.active {
              color: #fff;
              border: 0.5px solid #2aeaf7;
              box-shadow: 0px 4px 4px 0px #00000040;
              background: linear-gradient(
                270deg,
                #2aeaf7 -3.17%,
                rgba(42, 234, 247, 0.5) 5.08%,
                rgba(42, 234, 247, 0.5) 93.93%,
                #2aeaf7 104.94%
              );
            }
          }
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

.el-select__wrapper {
  align-items: center;
  background-color: #0c284d;
  box-shadow: none !important;
  box-sizing: border-box;
  border: 1px solid #ffffff26;

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
}

.el-select__placeholder {
  color: #e6e9f1;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
}

.el-table__inner-wrapper {
  height: 95%;
}

.el-icon svg {
  height: 1em;
  width: 1em;
}
</style>
