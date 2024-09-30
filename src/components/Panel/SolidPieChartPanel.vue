<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
  >
    <EchartsEmpty v-if="!chart" />
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
/* eslint-disable */
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  title?: any
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
  const unit = response.dw || "个"
  const color = ["#71F28D", "#EDB53F", "#EB2927", "#9747FF", "#B90000"]
  const data = response.map((d, i) => {
    return {
      name: d.name,
      value: d.value,
      label: {
        color: color[i]
      }
    }
  })
  const legend: any = response.map((d) => d.name)
  const options = {
    title: {
      show: props.title,
      text: props.title,
      textStyle: {
        fontSize: 14,
        color: "rgb(51 133 255)"
      },
      left: "center",
      top: "1%"
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(0,0,0,0.7)",
      borderWidth: 0,
      axisPointer: {
        type: "shadow"
      },
      textStyle: {
        color: "#fff"
      },
      formatter: `{b}（${unit}）：{c}`
    },
    legend: {
      orient: "horizontal",
      icon: "circle",
      top: "center",
      right: "right",
      data: legend,
      textStyle: {
        color: "#fff"
      }
    },
    color: color,
    series: [
      {
        type: "pie",
        center: ["40%", "50%"],
        radius: "70%",
        labelLine: {
          show: true,
          lineStyle: {
            width: 2
          }
        },
        labelLayout: {
          draggable: true
        },
        label: {
          show: true,
          formatter: "{d|{d}}\n{b|{b}(%)}",
          rich: {
            b: {
              fontSize: 14,
              align: "center"
            },
            d: {
              fontSize: 14,
              align: "center"
            }
          },
          // padding: [8, 15],
          align: "center",
          lineHeight: 20
          // backgroundColor: "#F8FBFF"
        },
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      }
    ]
  }
  chart.setOption(options)
}
watch(
  () => props.data,
  () => {
    if (!chart) {
      initChart()
    }
    setOption()
  }
)
onMounted(() => {
  initChart()
  setOption()
})
onBeforeUnmount(() => {
  if (chart) {
    window.removeEventListener("resize", resize)
    chart.dispose()
    chart = null
    chartPanelRef.value = ""
  }
})
</script>

<style lang="scss" scoped>
.chart-panel {
  width: 100%;
  height: 100%;
  // height: 280px;
}
</style>
