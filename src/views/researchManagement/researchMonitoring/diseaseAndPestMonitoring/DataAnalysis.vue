<script lang="ts" setup>
import {
  GetPestEquipment_All,
  GetPestEquipmentStatistics_Rlfbt,
  GetPestEquipmentStatistics_Sbhcgk,
  GetPestEquipmentStatistics_Sbhcxq,
  GetPestEquipmentStatistics_Wsdhctj,
  GetPestSpeciesContents
} from "@/api"
import dayjs from "dayjs"

const date = ref<any>(dayjs().startOf("week").format("YYYY-MM-DD"))
const dateTypes = ref<any>([
  {
    name: "周",
    type: "week"
  },
  {
    name: "月",
    type: "month"
  },
  {
    name: "年",
    type: "year"
  },
  {
    name: "自定义",
    type: "daterange"
  }
])
const dateType = ref<any>("week")

// 改变日期类型
const changeDateType = (type: string) => {
  dateType.value = type
  if (type === "week") {
    date.value = dayjs().startOf("week").format("YYYY-MM-DD")
  } else if (type === "month") {
    date.value = dayjs().startOf("month").format("YYYY-MM-DD")
  } else if (type === "year") {
    date.value = dayjs().startOf("year").format("YYYY-MM-DD")
  } else {
    date.value = [dayjs().format("YYYY-MM-DD"), dayjs().add(1, "day").format("YYYY-MM-DD")]
  }
  params.value.timeType = type === "week" ? "周" : type === "month" ? "月" : type === "year" ? "年" : "周"
  changeDate()
}
// 改变日期
const changeDate = () => {
  if (!date.value) {
    params.value.startTime = ""
    params.value.endTime = ""
    return
  }
  if (dateType.value === "daterange") {
    params.value.startTime = date.value[0]
    params.value.endTime = date.value[1]
  }
  if (dateType.value === "week") {
    params.value.startTime = date.value
    params.value.endTime = dayjs(date.value).endOf("week").format("YYYY-MM-DD")
  } else if (dateType.value === "month") {
    params.value.startTime = date.value
    params.value.endTime = dayjs(date.value).endOf("month").format("YYYY-MM-DD")
  } else if (dateType.value === "year") {
    params.value.startTime = date.value
    params.value.endTime = dayjs(date.value).endOf("year").format("YYYY-MM-DD")
  }
}
const params = ref<any>({
  startTime: "",
  endTime: "",
  timeType: "周"
})
changeDate()
const search = () => {
  if (params.value.startTime === "" || params.value.endTime === "") {
    ElMessage.warning("请选择时间")
    return
  }
  getChartData1()
  getChartData2()
  getChartData3()
}

// 虫害种类
const insectType = ref<any>("")
// 获得害虫列表
const pestList = ref<any[]>([])
const getPestList = async () => {
  const { response } = await GetPestSpeciesContents()
  pestList.value = response
  insectType.value = response[0]
  getChartData1() // 设备害虫概况
}

// 测报灯
const lightType = ref<any>("")
// 获得虫情测报灯列表
const pestEquipmentList = ref<any[]>([])
const getPestEquipmentList = async () => {
  const { response } = await GetPestEquipment_All()
  pestEquipmentList.value = response
  lightType.value = response[0].equipmentname
  getChartData3() // 设备害虫详情
}
// 改变害虫种类
const changeInsectType = (_: string) => {
  getChartData1()
}
// 设备害虫概况
const chartData1 = ref<any>(null)
const getChartData1 = async () => {
  // chartData1.value = {
  //   dw: ["种", "只"],
  //   xAxis: ["虫情测报灯1", "虫情测报灯2", "虫情测报灯3", "虫情测报灯4", "虫情测报灯5", "虫情测报灯6", "虫情测报灯7"],
  //   data: [
  //     {
  //       name: "害虫种类",
  //       type: "line",
  //       dw: "种",
  //       data: [
  //         {
  //           label: "虫情测报灯1",
  //           value: 10
  //         },
  //         {
  //           label: "虫情测报灯2",
  //           value: 24
  //         },
  //         {
  //           label: "虫情测报灯3",
  //           value: 92
  //         },
  //         {
  //           label: "虫情测报灯4",
  //           value: 40
  //         },
  //         {
  //           label: "虫情测报灯5",
  //           value: 87
  //         },
  //         {
  //           label: "虫情测报灯6",
  //           value: 64
  //         },
  //         {
  //           label: "虫情测报灯7",
  //           value: 19
  //         }
  //       ]
  //     },
  //     {
  //       name: "害虫数量",
  //       type: "line",
  //       dw: "只",
  //       data: [
  //         {
  //           label: "虫情测报灯1",
  //           value: 101
  //         },
  //         {
  //           label: "虫情测报灯2",
  //           value: 224
  //         },
  //         {
  //           label: "虫情测报灯3",
  //           value: 192
  //         },
  //         {
  //           label: "虫情测报灯4",
  //           value: 40
  //         },
  //         {
  //           label: "虫情测报灯5",
  //           value: 67
  //         },
  //         {
  //           label: "虫情测报灯6",
  //           value: 46
  //         },
  //         {
  //           label: "虫情测报灯7",
  //           value: 159
  //         }
  //       ]
  //     }
  //   ]
  // }
  const { response } = await GetPestEquipmentStatistics_Sbhcgk({
    ...params.value,
    pesttype: insectType.value
  })
  if (response) {
    let dw: any = []
    response.yAxis.forEach((item: any) => {
      if (item.name === "害虫种类") {
        dw.push("种")
        item.unit = "种"
      }
      if (item.name === "害虫数量") {
        dw.push("只")
        item.unit = "只"
      }
    })
    chartData1.value = {
      dw: dw,
      xAxis: response.xAxis,
      data: response.yAxis.map((item: any) => ({
        name: item.name,
        type: "line",
        dw: item.unit,
        data: item.value.map((d: any, index: number) => {
          return {
            label: response.xAxis[index],
            value: d
          }
        })
      }))
    }
  } else {
    chartData1.value = null
  }
}
// 温湿度害虫统计
const chartData2 = ref<any>(null)
const getChartData2 = async () => {
  // chartData2.value = {
  //   dw: ["℃", "%", "只"],
  //   xAxis: ["11月1日", "11月2日", "11月3日", "11月4日", "11月5日", "11月6日", "11月7日"],
  //   data: [
  //     {
  //       name: "环境温度",
  //       type: "bar",
  //       dw: "℃",
  //       data: [
  //         {
  //           label: "11月1日",
  //           value: 10
  //         },
  //         {
  //           label: "11月2日",
  //           value: 24
  //         },
  //         {
  //           label: "11月3日",
  //           value: 92
  //         },
  //         {
  //           label: "11月4日",
  //           value: 40
  //         },
  //         {
  //           label: "11月5日",
  //           value: 87
  //         },
  //         {
  //           label: "11月6日",
  //           value: 64
  //         },
  //         {
  //           label: "11月7日",
  //           value: 19
  //         }
  //       ]
  //     },
  //     {
  //       name: "环境湿度",
  //       type: "bar",
  //       dw: "%",
  //       data: [
  //         {
  //           label: "11月1日",
  //           value: 101
  //         },
  //         {
  //           label: "11月2日",
  //           value: 224
  //         },
  //         {
  //           label: "11月3日",
  //           value: 192
  //         },
  //         {
  //           label: "11月4日",
  //           value: 40
  //         },
  //         {
  //           label: "11月5日",
  //           value: 67
  //         },
  //         {
  //           label: "11月6日",
  //           value: 46
  //         },
  //         {
  //           label: "11月7日",
  //           value: 159
  //         }
  //       ]
  //     },
  //     {
  //       name: "害虫数量",
  //       type: "line",
  //       dw: "只",
  //       data: [
  //         {
  //           label: "11月1日",
  //           value: 101
  //         },
  //         {
  //           label: "11月2日",
  //           value: 224
  //         },
  //         {
  //           label: "11月3日",
  //           value: 192
  //         },
  //         {
  //           label: "11月4日",
  //           value: 40
  //         },
  //         {
  //           label: "11月5日",
  //           value: 67
  //         },
  //         {
  //           label: "11月6日",
  //           value: 46
  //         },
  //         {
  //           label: "11月7日",
  //           value: 159
  //         }
  //       ]
  //     }
  //   ]
  // }
  const { response } = await GetPestEquipmentStatistics_Wsdhctj({
    ...params.value
  })
  let dw: any = []
  response.yAxis.forEach((item: any) => {
    if (item.name === "环境温度") {
      dw.push("℃")
      item.dw = "℃"
      item.type = "bar"
    }
    if (item.name === "环境湿度") {
      dw.push("%")
      item.dw = "%"
      item.type = "bar"
    }
    if (item.name === "害虫数量") {
      dw.push("只")
      item.dw = "只"
      item.type = "line"
    }
    item.data = item.value.map((d: any, index: number) => {
      return {
        label: response.xAxis[index],
        value: d
      }
    })
  })
  chartData2.value = {
    dw: dw,
    xAxis: response.xAxis,
    data: response.yAxis
  }
}
// 改变测报灯
const changeLightType = (_: string) => {
  getChartData3()
}
// 设备害虫详情
const chartData3 = ref<any>(null)
const getChartData3 = async () => {
  // chartData3.value = {
  //   dw: "只",
  //   xAxis: ["害虫1", "害虫2", "害虫3", "害虫4", "害虫5", "害虫6", "害虫7"],
  //   data: [
  //     {
  //       name: "数量",
  //       data: [
  //         {
  //           label: "害虫1",
  //           value: 10
  //         },
  //         {
  //           label: "害虫2",
  //           value: 24
  //         },
  //         {
  //           label: "害虫3",
  //           value: 92
  //         },
  //         {
  //           label: "害虫4",
  //           value: 40
  //         },
  //         {
  //           label: "害虫5",
  //           value: 87
  //         },
  //         {
  //           label: "害虫6",
  //           value: 64
  //         },
  //         {
  //           label: "害虫7",
  //           value: 19
  //         }
  //       ]
  //     }
  //   ]
  // }
  const { response } = await GetPestEquipmentStatistics_Sbhcxq({
    ...params.value,
    equipmentname: lightType.value
  })
  if (response?.length > 0) {
    chartData3.value = {
      dw: "只",
      xAxis: response.map((item: any) => item.xAxis),
      data: [
        {
          name: "数量",
          data: response.map((item: any) => {
            return {
              label: item.xAxis,
              value: item.yAxis
            }
          })
        }
      ]
    }
  } else {
    chartData3.value = null
  }
}

// 获得热力图数据
const hotParams = ref<any>({
  startTime: "",
  endTime: ""
})
const getHotMapData = async () => {
  const { response } = await GetPestEquipmentStatistics_Rlfbt({
    ...hotParams.value
  })
  addHotMapData(response)
}

const { map, addHotMapData, addLayerManageData } = useOlMap(undefined, {
  target: "map-hot-box",
  zoom: 12,
  center: [116.0992869, 31.016022]
})
onMounted(() => {
  getPestList() // 获得害虫列表
  getPestEquipmentList() // 获得虫情测报灯列表
  getChartData2() // 温湿度害虫统计
  getHotMapData() // 获得热力图数据
})
</script>
<template>
  <div class="data-analysis">
    <MapLayerManage
      v-show="false"
      :modular="'病虫害监测'"
      :init-checked-keys="[35]"
      @addLayer="addLayerManageData"
    />
    <div class="search-box">
      <el-form
        :model="params"
        label-width="80px"
        inline
      >
        <el-form-item
          label="时间选择"
          class="date-box"
        >
          <div class="date-types">
            <div
              v-for="item in dateTypes"
              :key="item.type"
              :class="{ active: item.type === dateType }"
              @click="changeDateType(item.type)"
            >
              {{ item.name }}
            </div>
          </div>
          <el-date-picker
            v-model="date"
            :type="dateType"
            :format="dateType === 'week' ? 'YYYY[年]ww[周]' : undefined"
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
              <i-ep-data-analysis style="margin-right: 4px" />
              开始统计
            </div>
            <!-- <div
              class="btn btn2"
            >
              <i-ep-paperclip style="margin-right: 4px" />
              导出
            </div> -->
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div class="contain-box">
      <div class="left-box">
        <div>
          <div class="hd">
            <img
              :src="$fun.getImg('backgroundResources/icon1.png')"
              alt=""
            />
            <span>设备害虫概况</span>
          </div>
          <div class="chart">
            <LineBarChartPanel
              :lineColors="['#15a134', '#417064']"
              :gradient="true"
              :area-background="true"
              :open-effect="true"
              :node-shadow="true"
              :line-dashed="false"
              :data="chartData1"
            />
          </div>
          <el-select
            class="custom-select"
            v-model="insectType"
            placeholder="请选择虫害种类"
            :teleported="false"
            size="small"
            clearable
            popper-class="custom-select-popper"
            @change="changeInsectType"
          >
            <el-option
              v-for="item in pestList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </div>
        <div>
          <div class="hd">
            <img
              :src="$fun.getImg('backgroundResources/icon1.png')"
              alt=""
            />
            <span>温湿度害虫统计</span>
          </div>
          <div class="chart">
            <LineBarChartPanel
              :lineColors="['#8B5DFF']"
              :gradient="true"
              :barColors="['#8BF20B|#41F0D9', '#cba720']"
              :area-background="true"
              :open-division="false"
              :open-effect="true"
              :node-shadow="true"
              :data="chartData2"
            />
          </div>
        </div>
      </div>
      <div class="right-box">
        <div class="hd">
          <img
            :src="$fun.getImg('backgroundResources/icon1.png')"
            alt=""
          />
          <span>设备害虫详情</span>
        </div>
        <el-select
          class="custom-select"
          v-model="lightType"
          placeholder="请选择测报灯"
          :teleported="false"
          clearable
          size="small"
          popper-class="custom-select-popper"
          @change="changeLightType"
        >
          <el-option
            v-for="item in pestEquipmentList"
            :key="item.id"
            :label="item.equipmentname"
            :value="item.equipmentname"
          />
        </el-select>
        <div class="chart">
          <BarReversalChartPanel
            :show-legend="false"
            :colors="['#c7543f|#81eff3']"
            :gradient="true"
            :data="chartData3"
          />
        </div>
        <div
          class="map-box"
          id="map-hot-box"
        >
          <MapTool
            v-if="map"
            :map="map"
            :hiddenTools="['measure', 'clear', 'switchMap', 'toggleSidebar']"
            style="bottom: 0px !important; right: 0px !important"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-analysis {
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
        }
      }
      .el-form-item__label {
        color: #fff;
      }
      .date-box {
        .el-form-item__content {
          border: none;
        }
        .date-types {
          display: flex;
          gap: 10px;
          margin-right: 10px;
          > div {
            display: flex;
            align-items: center;
            height: 26px;
            padding: 0 1.0417vw;
            background-color: #205e7e;
            cursor: pointer;
            &.active {
              background-color: #378fbc;
            }
          }
        }
        .el-date-editor {
          width: 240px;
          border: 1px solid #304868;
          border-radius: 2px;
        }
      }
      .search-btns {
        .el-form-item__content {
          border: none;
        }
      }
      .el-input__inner {
        color: #aab4c1;
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
  }
  .contain-box {
    flex: 1;
    overflow: hidden;
    display: flex;
    gap: 0.5208vw;
    .left-box {
      width: 60%;
      display: flex;
      flex-direction: column;
      > div {
        position: relative;
        flex: 1;
        display: flex;
        flex-direction: column;
        .chart {
          flex: 1;
          margin-top: 20px;
        }
      }
    }
    .right-box {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      .chart {
        position: relative;
        flex: 1;
        margin-bottom: 10px;
      }
      .map-box {
        position: relative;
        flex: 1;
        border-radius: 8px;
        overflow: hidden;
      }
    }
    .hd {
      display: flex;
      align-items: center;
      height: 1.6667vw;
      color: #3be3de;
      gap: 0.3125vw;
      img {
        width: 0.9375vw;
      }
    }
    .custom-select {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 120px;
      border: 1px solid #304868;
      border-radius: 3px;
      z-index: 1;
    }
  }
}
</style>
