<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
  ></div>
  <EmptyData v-show="!data" />
</template>
<!-- 空心圆饼图 -->
<script lang="ts" setup>
// @ts-nocheck
/* eslint-disable */
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  title?: any
  dw?: any
  colors?: any
  gradient?: any
  showLabel?: any
  showLegend?: any
}
const props = withDefaults(defineProps<Props>(), {
  gradient: true, // 是否显示渐变
  showLabel: false, // 是否显示标签
  showLegend: true // 是否显示图例
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
  const unit = props.dw || "个"
  const color = props.colors ? props.colors : ["#71F28D", "#EDB53F", "#EB2927", "#9747FF", "#B90000"]
  let count = 0
  const data = response.map((d, i) => {
    count += d.value
    return {
      name: d.name,
      value: d.value,
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
                  color: color[i]
                },
                {
                  offset: 0.8,
                  color: hexToRgba(color[i], 0.1)
                }
              ],
              false
            )
          : color[i]
      }
    }
  })
  const legend: any = response.map((d) => d.name)
  const func = (params) => {
    if (params.name !== "") {
      return params.name + "\n" + params.value + unit + "(" + params.percent + "%" + ")"
    } else {
      return ""
    }
  }
  const options = {
    title: {
      show: props.title,
      text: props.title,
      textStyle: {
        fontSize: 16,
        color: "rgb(255, 255 ,255)"
      },
      subtext: count + unit,
      subtextStyle: {
        fontSize: 18,
        color: "#1563ff"
      },
      left: "70%",
      top: "5%"
    },
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
      formatter: `{b}（${unit}）：{c}`,
      confine: true
    },
    legend: {
      show: props.showLegend,
      orient: "horizontal",
      icon: "rect",
      bottom: "10",
      left: "center",
      itemWidth: 14,
      itemHeight: 10,
      data: legend,
      textStyle: {
        color: "#fff",
        fontSize: 10
      }
    },
    series: [
      {
        type: "pie",
        center: props.showLegend ? ["50%", "50%"] : ["50%", "55%"],
        radius: ["51%", "55%"],
        label: {
          show: props.showLabel,
          formatter: func,
          fontSize: 12, //此处修改字体大小
          lineHeight: 16,
          color: "inherit"
        },
        labelLine: {
          show: props.showLabel,
          length: 6, //引导线的长度
          length2: 16,
          color: "#ffffff",
          lineStyle: {
            width: 1 //引导线的宽度
          }
        },
        labelLayout: {
          draggable: true
        },
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      },
      {
        center: props.showLegend ? ["50%", "50%"] : ["50%", "55%"],
        radius: ["45%", "51%"],
        type: "pie",
        label: {
          show: false
        },
        emphasis: {
          show: false
        },
        labelLine: {
          show: false
        },
        animation: false,
        tooltip: {
          show: false
        },
        itemStyle: {
          color: "rgba(250,250,250,0.5)",
          opacity: 0.2
        },
        data: data
      },
      {
        type: "pie",
        center: props.showLegend ? ["50%", "50%"] : ["50%", "55%"],
        radius: ["44%", "45%"],
        itemStyle: {
          shadowBlur: 2,
          shadowColor: "rgba(0, 118, 239,1)",
          color: "#1563ff"
        },
        label: {
          show: false
        },
        emphasis: {
          show: false
        },
        data: [1000]
      },
      {
        type: "pie",
        emphasis: {
          show: false
        },
        center: props.showLegend ? ["50%", "50%"] : ["50%", "55%"],
        radius: ["51%", "55%"],
        labelLine: {
          show: false //指示线隐藏
        },
        label: {
          show: true,
          position: "center",
          formatter: [
            "{a|}" // 使用富文本标记设置文字样式和背景图片
          ].join("\n"),
          rich: {
            a: {
              fontSize: 12,
              width: 75, // 设置背景图片宽度
              height: 75, // 设置背景图片高度
              backgroundColor: {
                image: proxy.$fun.getImg("bigDataAnalysis/g1.png") // 设置背景图片
              }
            }
          }
        },
        data: data
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
      chart.dispose()
      chart = null
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
