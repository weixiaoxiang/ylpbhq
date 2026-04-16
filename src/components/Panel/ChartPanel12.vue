<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
  ></div>
  <EmptyData v-show="!data" />
</template>

<script lang="ts" setup>
import chartIcon from "@/assets/images/forestResources/imgIcon.png"
import rank1 from "@/assets/images/forestResources/rank1.png"
import rank2 from "@/assets/images/forestResources/rank2.png"
import rank3 from "@/assets/images/forestResources/rank3.png"
import rank4 from "@/assets/images/forestResources/rank4.png"
// @ts-nocheck
/* eslint-disable */
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  colors?: any
  unit?: string
}
const props = withDefaults(defineProps<Props>(), {})
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
  // let chartIcon = `data:image/png;base64,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`;

  let echartData = response
  let attackSourcesColor = [
    new proxy.$echarts.graphic.LinearGradient(0, 1, 1, 1, [
      { offset: 0, color: "#EDB81A00" },
      { offset: 1, color: "#EDB81A" }
    ]),
    new proxy.$echarts.graphic.LinearGradient(0, 1, 1, 1, [
      { offset: 0, color: "#3FE9F500" },
      { offset: 1, color: "#3FE9F5" }
    ])
  ]

  let max = parseInt(echartData[0].value)
  for (let i = 0; i < echartData.length - 1; i++) {
    max = max < parseInt(echartData[i + 1].value) ? parseInt(echartData[i + 1].value) : max
  }

  const option = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(0,0,0,0.7)",
      borderWidth: 0,
      axisPointer: {
        type: "shadow"
      },
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      formatter: `{b}：{c}`,
      confine: true
    },
    legend: {
      show: false
    },
    grid: {
      top: "10%",
      bottom: "-10%",
      left: "-10%",
      right: "-10%",
      containLabel: true
    },
    xAxis: {
      show: false,
      type: "value"
    },
    yAxis: [
      {
        type: "category",
        inverse: true,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        data: echartData.map((item: any) => item.name),
        axisLabel: {
          // show: false,
          margin: 0,
          fontSize: 12,
          align: "left",
          color: "#fff",
          padding: [0, 0, 30, -20],
          interval: 0,
          rich: {
            a1: {
              color: "#fff",
              // backgroundColor: '#ff5454',
              backgroundColor: {
                image: rank1
              },
              width: 20,
              height: 9,
              align: "center",
              // borderRadius: 24,
              fontSize: 12,
              padding: [5, 0, 2, -3]
            },
            a2: {
              color: "#fff",
              // backgroundColor: '#ff5454',
              backgroundColor: {
                image: rank2
              },
              width: 20,
              height: 12,
              align: "center",
              // borderRadius: 24,
              fontSize: 12,
              padding: [5, 0, 2, -3]
            },
            a3: {
              color: "#fff",
              // backgroundColor: '#ff5454',
              backgroundColor: {
                image: rank3
              },
              width: 20,
              height: 12,
              align: "center",
              // borderRadius: 24,
              fontSize: 12,
              padding: [5, 0, 2, -3]
            },
            b: {
              color: "#fff",
              // backgroundColor: '#ff5454',
              backgroundColor: {
                image: rank4
              },
              width: 20,
              height: 12,
              align: "center",
              // borderRadius: 24,
              fontSize: 12,
              padding: [5, 0, 2, -3]
            }
          },
          formatter: function (params) {
            var index = echartData.map((item) => item.name).indexOf(params)
            index = index + 1
            if (index - 1 < 3) {
              return ["{a" + index + "|" + index + "}" + "  " + params].join("\n")
            } else {
              return ["{b|" + index + "}" + "  " + params].join("\n")
            }
          }
        }
      },
      {
        triggerEvent: true,
        show: true,
        inverse: true,
        data: echartData.map((item) => item.value),
        axisLine: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          interval: 0,
          // shadowOffsetX: '-60px',
          color: "#fff",
          align: "right",
          verticalAlign: "middle",
          margin: 50,
          lineHeight: 30,
          fontSize: 15,
          padding: [0, 0, 0, 0],
          formatter: "{value}亩"
        }
      }
    ],
    series: [
      {
        z: 2,
        name: "value",
        type: "bar",
        barWidth: 3,
        zlevel: 4,
        data: echartData.map((item: any, i: any) => {
          let itemStyle = {
            color: i % 2 == 0 ? attackSourcesColor[0] : attackSourcesColor[1]
          }
          return {
            value: item.value,
            itemStyle: itemStyle
          }
        }),
        label: {
          show: true,
          position: "insideRight",
          distance: -15,
          formatter: () => {
            return `{z|}{a|}`
          },
          rich: {
            a: {
              widht: 20,
              height: 20,
              backgroundColor: {
                image: chartIcon
              }
            }
          }
        }
      },
      {
        name: "背景",
        type: "bar",
        barWidth: 9,
        barGap: "-200%",
        itemStyle: {
          normal: {
            color: "#284570"
          }
        },
        data: new Array(echartData.length).fill(max * 2)
      }
    ]
  }
  chart.setOption(option)
  timer && clearInterval(timer)
  startTooltipAnimation()
}
let timer: any = null,
  currentIndex: any = 0
// 开始tooltip动画，高亮和选中当前项
const startTooltipAnimation = () => {
  if (!chart) return

  const dataLen = chart.getOption().series[0].data.length
  if (dataLen === 0) return

  let lastIndex = -1 // 记录上一次选中的索引

  const showTipAndSelect = (index: number) => {
    // 清除上一次的选中和高亮状态
    if (lastIndex !== -1) {
      chart.dispatchAction({
        type: "downplay",
        seriesIndex: 0,
        dataIndex: lastIndex
      })
      chart.dispatchAction({
        type: "unselect",
        seriesIndex: 0,
        dataIndex: lastIndex
      })
    }

    // 高亮和选中当前项
    chart.dispatchAction({
      type: "highlight",
      seriesIndex: 0,
      dataIndex: index
    })

    chart.dispatchAction({
      type: "showTip",
      seriesIndex: 0,
      dataIndex: index
    })

    chart.dispatchAction({
      type: "select",
      seriesIndex: 0,
      dataIndex: index
    })

    lastIndex = index // 更新上一次选中的索引
  }

  // 初始显示
  showTipAndSelect(currentIndex)
  currentIndex = (currentIndex + 1) % dataLen

  // 定时切换显示
  timer = setInterval(() => {
    showTipAndSelect(currentIndex)
    currentIndex = (currentIndex + 1) % dataLen
  }, 3000)
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
  width: 100%;
  height: 100%;
  // height: 280px;
}
</style>
