<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
  ></div>
  <EmptyData v-show="!data" />
</template>
<!-- 雷达图 -->
<script lang="ts" setup>
// @ts-nocheck
/* eslint-disable */
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  title?: any
  colors?: any
  gradient?: any
}
const props = withDefaults(defineProps<Props>(), {
  gradient: false // 是否显示渐变
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
  const unit = response.dw || "个"
  const xAxis = response.xAxis
  const color = props.colors ? props.colors : ["#71F28D", "#EDB53F", "#EB2927", "#9747FF", "#B90000"]
  const maxArr = []
  response.data.map((d: any) => {
    maxArr.push(
      ...d.data.map((d: any) => {
        return Number(d.value)
      })
    )
  })
  const max = Math.max(...maxArr)
  const indicator = xAxis.map((d: any) => {
    return {
      name: d,
      min: 0,
      max: max
    }
  })
  const dataArr = []
  const data = response.data.map((d, i) => {
    const value = d.data.map((item: any) => {
      return Number(item.value)
    })
    dataArr.push({
      value: value,
      name: d.name,
      itemStyle: {
        lineStyle: {
          color: color[i]
        },
        shadowColor: color[i],
        shadowBlur: 10
      },
      areaStyle: {
        // 单项区域填充样式
        color: {
          type: "linear",
          x: 0, //右
          y: 0, //下
          x2: 1, //左
          y2: 1, //上
          colorStops: [
            {
              offset: 0,
              color: color[i]
            },
            {
              offset: 0.5,
              color: "rgba(0,0,0,0)"
            },
            {
              offset: 1,
              color: color[i]
            }
          ],
          globalCoord: false
        },
        opacity: 1 // 区域透明度
      }
    })
  })
  const options = {
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
      show: true,
      trigger: "item",
      confine: true
    },
    color,
    radar: {
      radius: "60%",
      axisName: {
        color: "#fff",
        fontSize: 14
      },
      indicator: indicator,
      splitArea: {
        // 坐标轴在 grid 区域中的分隔区域，默认不显示。
        show: false
      },
      axisLine: {
        //指向外圈文本的分隔线样式
        lineStyle: {
          color: "#1f71b6"
        }
      },
      splitLine: {
        lineStyle: {
          color: "#1f71b6", // 分隔线颜色
          width: 1 // 分隔线线宽
        }
      }
    },
    series: [
      {
        type: "radar",
        symbolSize: 4,
        label: {
          show: true,
          color: "#fff",
          fontSize: 10
        },
        lineStyle: {
          type: "dashed",
          color: "rgba(245, 166, 35, 1)",
          width: 1
        },
        data: dataArr
      }
    ],
    animation: true,
    animationDurationUpdate: 2000
  }
  chart.setOption(options)
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
      if (chart) {
        chart.dispose()
        chart = null
      }
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
