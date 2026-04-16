<template>
  <div class="geologicalDisaster-section wrapgeo">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">地表裂缝监测</div>
      </div>
      <div class="title-con">
        <div class="tabs">
          <div
            class="tab"
            :class="{ active: activeTab == item }"
            v-for="(item, index) in typeOption"
            :key="index"
            @click="clickTab(item)"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>
    <div class="line"></div>
    <div class="wrap-con">
      <div
        id="chart3"
        class="chart"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { geologicalDisasterApi } from "@/api/geologicalDisaster"
import dayjs from "dayjs"
import * as echarts from "echarts"
const props = defineProps({
  equipmentId: {
    type: [Number, String],
    default: null
  }
})

const typeOption = ref(["今日", "本月", "本年"])
const activeTab = ref("本月")
const clickTab = (val: any) => {
  activeTab.value = val
  getData()
}
let chart3: any = null

const getData = async () => {
  let query = {
    startTime: "",
    endTime: "",
    equipmentId: props.equipmentId,
    timeType: activeTab.value
  }
  if (activeTab.value == "今日") {
    query.startTime = dayjs().format("YYYY-MM-DD 00:00:00")
    query.endTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
  } else if (activeTab.value == "本月") {
    query.startTime = dayjs().startOf("month").format("YYYY-MM-DD 00:00:00")
    query.endTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
  } else if (activeTab.value == "本年") {
    query.startTime = dayjs().startOf("year").format("YYYY-MM-DD 00:00:00")
    query.endTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
  }
  let { response } = await geologicalDisasterApi.GetSurfaceCracks(query)
  let yAxisData: any = []
  let data: any = []
  let option: any = null
  if (response && response.length > 0) {
    chart3?.dispose && chart3.dispose() // 销毁实例
    chart3 = echarts.init(document.getElementById("chart3") as HTMLDivElement)

    if (response.length === 0) {
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
      for (let i = 0; i < response.length; i++) {
        yAxisData.push(response[i].statisticalTime)
        data.push(response[i].value)
      }
      option = {
        grid: {
          top: "15%", // 距离容器顶部10%
          bottom: "15%", // 距离容器底部10%
          left: "10%", // 距离容器左侧10%
          right: "5%" // 距离容器右侧10%
        },
        xAxis: {
          type: "category",
          boundaryGap: true,
          axisTick: {
            show: false
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: "#CFDAE5" //轴线和单位颜色
            }
          },
          axisLabel: {
            rotate: 0,
            fontSize: 12,
            color: "#fff",
            interval: "auto",
            formatter: function (value: any) {
              let name = value
              if (activeTab.value === "今日") {
                name = dayjs(name).format("H点")
              } else if (activeTab.value === "本月") {
                name = dayjs(name).format("D号")
              } else if (activeTab.value === "本年") {
                name = dayjs(name).format("M月")
              }
              return name
            }
          },
          data: yAxisData
        },
        yAxis: {
          type: "value",
          name: "单位：mm",
          nameTextStyle: {
            fontSize: 14,
            color: "#CFDAE5",
            padding: [0, 0, 0, 0]
          },
          axisLine: {
            lineStyle: {
              color: "#CFDAE5" //轴线和单位颜色
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "#636e72", // 设置刻度线颜色为白色

              type: [2, 3],
              dashOffset: 2
            }
          }
        },
        series: [
          {
            name: "数据",
            type: "line",
            symbol: "diamond",
            // smooth: true,
            // label: {
            //   show: true,
            //   position: "top",
            //   textStyle: {
            //     fontSize: 14,
            //     color: "#9FB4C8"
            //   }
            // },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: "rgba(54,161,255,0.6)" // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "rgba(25,104,255,0)" // 100% 处的颜色
                  }
                ],
                global: false // 缺省为 false
              }
            },
            lineStyle: {
              color: "#3AA1E5",
              width: 2,
              type: "solid"
            },
            // itemStyle: {
            //   borderWidth: 2,
            //   borderColor: "#FFFFFF",
            //   color: "#7EC0FD",
            //   // 阴影配置
            //   shadowBlur: 10, // 阴影模糊大小
            //   shadowColor: "rgba(255, 255, 255, 1)", // 白色半透明阴影
            //   shadowOffsetX: 0, // 阴影水平偏移
            //   shadowOffsetY: 0 // 阴影垂直偏移
            // },

            data: data.map((item: any) => {
              return {
                value: item,
                symbolSize: 8,
                itemStyle: {
                  borderWidth: 2,
                  borderColor: "#FFFFFF",
                  color: "#7EC0FD",
                  // 阴影配置
                  shadowBlur: 10, // 阴影模糊大小
                  shadowColor: "rgba(255, 255, 255, 1)", // 白色半透明阴影
                  shadowOffsetX: 0, // 阴影水平偏移
                  shadowOffsetY: 0 // 阴影垂直偏移
                }
              }
            })
          }
        ]
      }
    }
  }
  if (chart3) {
    chart3.clear()
    option && chart3.setOption(option)
    window.addEventListener("resize", resizeChart)
  }
}

// 窗口大小改变事件
function resizeChart() {
  chart3.resize()
}

watch(
  () => props.equipmentId,
  (newVal, oldVal) => {
    if (newVal) {
      nextTick(() => {
        getData()
      })
    }
  },
  {
    immediate: true
  }
)
onMounted(() => {
  // getData()
})
onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart)
})
</script>
<style lang="scss" scoped>
.geologicalDisaster-section {
  height: vh(301);
  //   height: 301px;
  margin: 20px 0;
}
</style>
