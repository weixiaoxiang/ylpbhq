<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
    :style="style"
  ></div>
  <EmptyData v-show="!data" />
</template>
<!-- 柱状图-3D -->
<script lang="ts" setup>
// @ts-nocheck
/* eslint-disable */
import { hexToRgba } from "@/utils/format"
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  style?: any
  leftColors?: any
  rightColors?: any
  topColors?: any
}
const props = withDefaults(defineProps<Props>(), {
  style: () => {
    return {
      width: "100%",
      height: "100%"
    }
  },
  leftColors: () => ["#01a1fb", "#183551"],
  rightColors: () => ["#01b0fb", "#163a59"],
  topColors: () => ["#0071d9", "#00b0fe"]
})
const chartPanelRef = ref("")
let chart: any = null
const initChart = async () => {
  if (!chart) {
    chart = proxy.$echarts.init(chartPanelRef.value, null, {
      devicePixelRatio: 2.5
    })
  }
  window.addEventListener("resize", resize)
}
const resize = () => {
  if (chart) {
    chart.resize()
  }
}
const setPloygon = () => {
  let barWidth = 48 / props.data.data.length
  // 设置barWidth的最大值和最小值
  const maxBarWidth = 12
  const minBarWidth = 2
  barWidth = Math.max(minBarWidth, Math.min(maxBarWidth, barWidth))

  const CubeLeft = proxy.$echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0
    },
    buildPath: function (ctx, shape) {
      const xAxisPoint = shape.xAxisPoint
      const c0 = [shape.x, shape.y]
      const c1 = [shape.x - barWidth, shape.y - barWidth]
      const c2 = [xAxisPoint[0] - barWidth, xAxisPoint[1] - barWidth]
      const c3 = [xAxisPoint[0], xAxisPoint[1]]
      ctx.moveTo(c0[0], c0[1]).lineTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).closePath()
    }
  })
  const CubeRight = proxy.$echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0
    },
    buildPath: function (ctx, shape) {
      const xAxisPoint = shape.xAxisPoint
      const c1 = [shape.x, shape.y]
      const c2 = [xAxisPoint[0], xAxisPoint[1]]
      const c3 = [xAxisPoint[0] + barWidth * 2, xAxisPoint[1] - barWidth]
      const c4 = [shape.x + barWidth * 2, shape.y - barWidth]
      ctx.moveTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).lineTo(c4[0], c4[1]).closePath()
    }
  })
  const CubeTop = proxy.$echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0
    },
    buildPath: function (ctx, shape) {
      const c1 = [shape.x, shape.y]
      const c2 = [shape.x + barWidth * 2, shape.y - barWidth]
      const c3 = [shape.x + barWidth, shape.y - barWidth * 2]
      const c4 = [shape.x - barWidth, shape.y - barWidth]
      ctx.moveTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).lineTo(c4[0], c4[1]).closePath()
    }
  })
  proxy.$echarts.graphic.registerShape("CubeLeft", CubeLeft)
  proxy.$echarts.graphic.registerShape("CubeRight", CubeRight)
  proxy.$echarts.graphic.registerShape("CubeTop", CubeTop)
}
const setOption = () => {
  setPloygon()
  const response = props.data
  let xAxis: any = [],
    data: any = []
  const legend: any = []
  const unit = response.dw
  if (response?.data.length === 0) {
    chart = null
    return
  } else {
    xAxis = response.xAxis
    data = response.data
  }
  const options = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0,0,0,0.7)",
      borderWidth: 0,
      axisPointer: {
        type: "shadow"
      },
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      formatter: (params: any) => {
        let str = `${params[0].name} <br>`
        params.forEach((param: any) => {
          const { seriesName, value } = param
          str += `${value}(${unit})`
        })
        return str
      }
    },
    legend: {
      data: legend,
      align: "right",
      top: "top",
      left: "center",
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      itemWidth: 20,
      itemHeight: 16
    },
    grid: {
      top: "15%",
      right: "5%",
      left: "8%",
      bottom: "15%"
    },
    xAxis: [
      {
        type: "category",
        data: xAxis,
        axisLine: {
          show: true,
          lineStyle: {
            color: "#686a6c",
            type: "dashed"
          }
        },
        axisTick: {
          show: false // 是否显示坐标轴轴线
        },
        axisLabel: {
          margin: 10,
          color: "#c3cdd7",
          fontSize: 14
          // interval: 0
        }
      }
    ],
    yAxis: [
      {
        name: unit,
        nameTextStyle: {
          fontSize: 14,
          color: "#8a96a8"
        },
        axisLabel: {
          formatter: "{value}",
          color: "#6c7880"
        },
        axisTick: {
          show: false // 是否显示坐标轴轴线
        },
        axisLine: {
          show: false
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#32414c",
            type: "dashed"
          }
        }
        // boundaryGap: ["20%", "20%"]
      }
    ],
    series: [
      {
        type: "custom",
        renderItem: (params: any, api: any) => {
          const location = api.coord([api.value(0), api.value(1)])
          return {
            type: "group",
            children: [
              {
                type: "CubeLeft",
                shape: {
                  api,
                  xValue: api.value(0),
                  yValue: api.value(1),
                  x: location[0],
                  y: location[1],
                  xAxisPoint: api.coord([api.value(0), 0])
                },
                style: {
                  fill: new proxy.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: props.leftColors[0]
                    },
                    {
                      offset: 1,
                      color: props.leftColors[1]
                    }
                  ])
                }
              },
              {
                type: "CubeRight",
                shape: {
                  api,
                  xValue: api.value(0),
                  yValue: api.value(1),
                  x: location[0],
                  y: location[1],
                  xAxisPoint: api.coord([api.value(0), 0])
                },
                style: {
                  fill: new proxy.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: props.rightColors[0]
                    },
                    {
                      offset: 1,
                      color: props.rightColors[1]
                    }
                  ])
                }
              },
              {
                type: "CubeTop",
                shape: {
                  api,
                  xValue: api.value(0),
                  yValue: api.value(1),
                  x: location[0],
                  y: location[1],
                  xAxisPoint: api.coord([api.value(0), 0])
                },
                style: {
                  fill: new proxy.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: props.topColors[0]
                    },
                    {
                      offset: 1,
                      color: props.topColors[1]
                    }
                  ])
                }
              }
            ]
          }
        },
        data: data
      }
    ],
    animation: true,
    animationDurationUpdate: 2000
  }
  chart.setOption(options, { lazyUpdate: true })
  timer && clearInterval(timer)
  startTooltipAnimation()
}
let timer: any = null,
  currentIndex: any = 0
const startTooltipAnimation = () => {
  if (!chart) return
  const dataLen = chart.getOption().series[0].data.length
  chart.dispatchAction({
    type: "showTip",
    seriesIndex: 0,
    dataIndex: currentIndex
  })
  currentIndex = (currentIndex + 1) % dataLen
  timer = setInterval(() => {
    chart.dispatchAction({
      type: "showTip",
      seriesIndex: 0,
      dataIndex: currentIndex
    })
    currentIndex = (currentIndex + 1) % dataLen
  }, 3000) // 每3秒移动一次
}

// 销毁chart
const disposeChart = () => {
  if (chart) {
    window.removeEventListener("resize", resize)
    chart.dispose()
    chart = null
  }
  timer && clearInterval(timer)
}
watch(
  () => props.data,
  (val) => {
    if (val) {
      // 完全销毁并重新创建图表
      disposeChart()
      initChart()
      setOption()
    } else {
      disposeChart()
    }
  }
)
onMounted(() => {
  if (props.data) {
    initChart()
    setOption()
  }
})
onBeforeUnmount(() => {
  disposeChart()
})
</script>

<style lang="scss" scoped>
.chart-panel {
  // width: 100%;
  // height: 100%;
}
</style>
