<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
    :style="style"
  ></div>
  <EmptyData v-show="!data" />
</template>
<!-- 线图-柱状图 -->
<script lang="ts" setup>
// import { hexToRgba } from "@/utils/format"
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  style?: any
  lineColors?: any
  barColors?: any
  areaBackground?: any
  tooltipTotal?: any
  gradient?: any
  lineDashed?: any
  openEffect?: any
  openDivision?: any
  nodeShadow?: any
}
const props = withDefaults(defineProps<Props>(), {
  style: () => {
    return {
      width: "100%",
      height: "100%"
    }
  },
  areaBackground: false, //是否显示区域背景
  gradient: false,
  openEffect: false,
  tooltipTotal: false, // 是否显示tooltip合计数
  lineDashed: true,
  openDivision: false,
  nodeShadow: false // 是否显示节点阴影
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
const setOption = () => {
  const response = props.data

  // 柱状图颜色
  let xAxis: any = [],
    data: any = []
  const legend: any = []
  const unit = response.dw
  let bar: any
  if (response?.data.length === 0) {
    chart = null
    return
  } else {
    // 线条颜色
    const lineColors = props.lineColors
      ? JSON.parse(JSON.stringify(props.lineColors))
      : ["#faba5a", "#30b6ff", "#e6b825"]
    const barColors = props.barColors ? JSON.parse(JSON.stringify(props.barColors)) : ["#faba5a", "#30b6ff", "#e6b825"]
    xAxis = response.xAxis
    data = response.data.map((d: any) => {
      legend.push(d.name)
      if (d.type === "line") {
        let color = lineColors[0]
        lineColors.shift()
        return {
          name: d.name,
          yAxisIndex: unit.findIndex((item: any) => item === d.dw),
          type: "line",
          data: d.data,
          symbol: "circle",
          symbolSize: 8,
          smooth: props.openEffect ? false : true,
          lineStyle: {
            color: color,
            type: props.lineDashed ? "dashed" : "solid"
          },
          itemStyle: {
            color: color,
            borderColor: "#fff",
            borderWidth: 1,
            shadowBlur: props.nodeShadow ? 10 : 0, // 设置阴影模糊大小
            shadowColor: color, // 设置阴影颜色
            shadowOffsetX: 0, // 设置阴影 X 轴偏移
            shadowOffsetY: 0 // 设置阴影 Y 轴偏移
          },
          areaStyle: props.areaBackground
            ? {
                color: new proxy.$echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: color
                    },
                    {
                      offset: 0.8,
                      color: hexToRgba(color, 0.1)
                    }
                  ],
                  false
                ),
                shadowColor: "rgba(0, 0, 0, 0.1)",
                shadowBlur: 10
              }
            : null,
          zlevel: 10
        }
      } else {
        let color1, color2
        let color = barColors[0]
        barColors.shift()
        if (color) {
          if (color.indexOf("|") > -1) {
            color1 = color.split("|")[0]
            color2 = color.split("|")[1]
          } else {
            color1 = color
            color2 = hexToRgba(color, 0.2)
          }
        } else {
          color1 = "#7ecffd"
          color2 = "#01B3FF"
        }
        bar = d
        return {
          name: d.name,
          yAxisIndex: unit.findIndex((item: any) => item === d.dw),
          type: "bar",
          barWidth: 10,
          barMinWidth: 10,
          barMaxWidth: 40,
          itemStyle: {
            color: props.gradient
              ? new proxy.$echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: color1
                    },
                    {
                      offset: 0.9,
                      color: color2
                    }
                  ],
                  false
                )
              : color1,
            shadowColor: "rgba(0, 0, 0, 0.1)",
            shadowBlur: 10
          },
          data: d.data
        }
      }
    })
  }

  const options: any = {
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
        // 开启合计数
        if (props.tooltipTotal) {
          let total = 0
          params.forEach((param: any) => {
            if (param.seriesType === "pictorialBar") return
            total += param.value
          })
          str += `合计：${total} <br>`
        }
        params.forEach((param: any, i: number) => {
          const { seriesName, value, seriesType } = param
          if (seriesType === "pictorialBar") return
          str += `${seriesName}（${unit[i]}）：${value} <br>`
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
      itemWidth: 18,
      itemHeight: 10
    },
    grid: {
      top: "15%",
      right: "5%",
      left: "4%",
      bottom: "5",
      containLabel: true
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
        name: unit[0],
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
      },
      {
        name: unit[1],
        nameTextStyle: {
          fontSize: 14,
          color: "#8a96a8",
          align: "left"
        },
        position: "right",
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
          show: false
        }
      },
      {
        name: unit[2],
        nameTextStyle: {
          fontSize: 14,
          color: "#8a96a8",
          align: "left"
        },
        position: "right",
        offset: 25, // 调整以防止与第二个 Y 轴重叠
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
          show: false
        }
      }
    ],
    animation: true,
    animationDurationUpdate: 2000,
    series: data
  }
  // 线条效果
  if (props.openEffect) {
    // 线条颜色
    const lineColors = props.lineColors
      ? JSON.parse(JSON.stringify(props.lineColors))
      : ["#faba5a", "#30b6ff", "#e6b825"]
    const effects: any = []
    response?.data.forEach((item: any) => {
      // 非线条图不显示效果
      if (item.type !== "line") {
        return
      }
      let color = lineColors[0]
      lineColors.shift()
      const arr = item?.data.map((i: any) => {
        return [i.label, i.value]
      })
      if (arr.length < 2) return
      effects.push({
        name: item.name,
        type: "lines",
        yAxisIndex: unit.findIndex((ut: any) => ut === item.dw),
        coordinateSystem: "cartesian2d",
        symbolSize: 10,
        polyline: true,
        effect: {
          show: true,
          period: 10,
          trailLength: 0.4,
          symbolSize: 6,
          symbol: "circle",
          color: color
        },
        lineStyle: {
          width: 1,
          opacity: 0
        },
        // 光点
        data: [
          {
            coords: arr
          }
        ]
      })
    })
    options.series.push(...effects)
  }
  // 柱状图分隔
  if (bar && props.openDivision) {
    const barFind = response.data.find((i: any) => i.type === "bar")
    const yAxisIndex = unit.findIndex((item: any) => item === barFind.dw)
    data.push({
      // 分隔
      name: bar.name,
      type: "pictorialBar",
      yAxisIndex: yAxisIndex,
      itemStyle: {
        color: "rgba(26, 49, 73,1)" //"#1a314a"
      },
      symbolRepeat: "fixed",
      symbolMargin: 3,
      symbol: "rect",
      symbolClip: true,
      symbolSize: [10, 2],
      symbolPosition: "start",
      data: bar.data,
      zlevel: 1
    })
  }
  // 数据缩放
  if (response.data?.[0]?.data?.length > 24) {
    options.dataZoom = [
      {
        show: true,
        type: "slider",
        start: 0,
        end: (24 * 100) / response.data?.[0]?.data?.length,
        height: 20
      }
    ]
    options.grid.bottom = "20%"
  } else {
    options.dataZoom = {
      show: false,
      type: "slider",
      start: 0,
      end: 100
      // width: 15
    }
    options.grid.bottom = "5%"
  }
  chart.setOption(options)
  timer && clearInterval(timer)
  startTooltipAnimation()
}
let timer: any = null,
  currentIndex: any = 0
const startTooltipAnimation = () => {
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
    chartPanelRef.value = ""
  }
  timer && clearInterval(timer)
}
watch(
  () => props.data,
  (val) => {
    if (val) {
      if (!chart) {
        initChart()
      }
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
