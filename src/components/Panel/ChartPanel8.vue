<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
  ></div>
  <EmptyData v-show="!data" />
</template>

<script lang="ts" setup>
// @ts-nocheck
/* eslint-disable */
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
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
  const response = props.data?.exponent || 40
  const color = props.colors ? props.colors : ["#68d626", "#d1338a", "#edff48"]
  let colorSet = []
  color.forEach((item: any, index: any) => {
    colorSet.push(
      new proxy.$echarts.graphic.LinearGradient(
        0,
        0,
        0,
        1,
        [
          { offset: 0, color: item },
          { offset: 1, color: hexToRgba(item, 0.1) }
        ],
        false
      )
    )
  })
  const options = {
    series: [
      {
        name: "内部进度条",
        type: "gauge",
        center: ["50%", "70%"],
        radius: "80%",
        startAngle: 180,
        endAngle: 0,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            color: [
              [
                response / 100,
                new proxy.$echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: "#f43725"
                    },
                    {
                      offset: 0.5,
                      color: "#fa633e"
                    },
                    {
                      offset: 1,
                      color: "#58ab3e"
                    }
                  ],
                  false
                )
              ],
              [1, "#404d5c"]
            ],
            width: 15
          }
        },
        axisLabel: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        itemStyle: {
          color: "#f6442c"
        },
        textStyle: {
          padding: [0, 0, 0, 0],
          fontSize: 18,
          color: "#fff",
          fontWeight: "700"
        },
        data: [
          {
            show: false,
            name: props.data?.describe,
            value: response,
            title: {
              offsetCenter: ["0", "40"],
              color: "#fff",
              fontSize: 16
            },
            detail: {
              offsetCenter: ["0", 20],
              color: "#fff",
              fontSize: 16
            }
          }
        ],
        pointer: {
          show: true,
          length: "45%",
          radius: "20%",
          width: 4 //指针粗细
        },
        animationDuration: 4000
      },
      {
        name: "外部刻度",
        type: "gauge",
        center: ["50%", "70%"],
        radius: "120%",
        min: 0, //最小刻度
        max: 100, //最大刻度
        splitNumber: 10, //刻度数量
        startAngle: 180,
        endAngle: 0,
        axisLine: {
          show: false
        },
        //仪表盘轴线
        axisLabel: {
          show: true,
          color: "#fff",
          distance: -10,
          formatter: function (v) {
            return v
          }
        },
        //刻度标签。
        axisTick: {
          show: true,
          splitNumber: 7,
          lineStyle: {
            color: "#009990",
            width: 1
          },
          length: -8
        },
        //刻度样式
        splitLine: {
          show: true,
          length: -12,
          lineStyle: {
            color: "#009990"
          }
        },
        //分隔线样式
        detail: {
          show: false
        },
        pointer: {
          show: false
        }
      }
    ],
    animation: true,
    animationDurationUpdate: 2000
  }
  chart.setOption(options)
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
}
</style>
