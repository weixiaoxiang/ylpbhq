<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
  ></div>
  <EmptyData v-show="!data" />
</template>
<!-- 3D饼图 -->
<script lang="ts" setup>
// @ts-nocheck
/* eslint-disable */
import { color } from "echarts"
import "echarts-gl"
import { he } from "element-plus/es/locale/index.mjs"
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  unit?: any
  size?: any
  title?: any
  colors?: any
  gradient?: any
  showLabel?: any
  showLegend?: any
}
const props = withDefaults(defineProps<Props>(), {
  gradient: true, // 是否显示渐变
  showLabel: false, // 是否显示标签
  showLegend: true, // 是否显示图例
  unit: "",
  size: "1" // 默认使用1号尺寸：柱子的最高高度为600最高，可自行尝试调整其他
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
  const color = ["#2053a3", "#a88944", "#3ea49e", "#474f64"]
  const data = response.map((d, i) => {
    return {
      name: d.name,
      value: d.value,
      itemStyle: {
        color: color[i]
      }
    }
  })
  const legend: any = response.map((d) => d.name)
  // 传入数据生成 option
  var options = getPie3D(data, 0.59)
  chart.setOption(options)
  // 监听鼠标事件，实现饼图选中效果（单选），近似实现高亮（放大）效果。
  let selectedIndex = ""
  let hoveredIndex = ""

  // 监听 mouseover，近似实现高亮（放大）效果
  chart.on("mouseover", function (params) {
    // 准备重新渲染扇形所需的参数
    let isSelected
    let isHovered
    let startRatio
    let endRatio
    let k

    // 如果触发 mouseover 的扇形当前已高亮，则不做操作
    if (hoveredIndex === params.seriesIndex) {
      return

      // 否则进行高亮及必要的取消高亮操作
    } else {
      // 如果当前有高亮的扇形，取消其高亮状态（对 option 更新）
      if (hoveredIndex !== "") {
        // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 false。
        isSelected = options.series[hoveredIndex].pieStatus.selected
        isHovered = false
        startRatio = options.series[hoveredIndex].pieData.startRatio
        endRatio = options.series[hoveredIndex].pieData.endRatio
        k = options.series[hoveredIndex].pieStatus.k

        // 对当前点击的扇形，执行取消高亮操作（对 option 更新）
        options.series[hoveredIndex].parametricEquation = getParametricEquation(
          startRatio,
          endRatio,
          isSelected,
          isHovered,
          k,
          options.series[hoveredIndex].pieData.value
        )
        options.series[hoveredIndex].pieStatus.hovered = isHovered

        // 将此前记录的上次选中的扇形对应的系列号 seriesIndex 清空
        hoveredIndex = ""
      }

      // 如果触发 mouseover 的扇形不是透明圆环，将其高亮（对 option 更新）
      if (params.seriesName !== "mouseoutSeries") {
        // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 true。
        isSelected = options.series[params.seriesIndex].pieStatus.selected
        isHovered = true
        startRatio = options.series[params.seriesIndex].pieData.startRatio
        endRatio = options.series[params.seriesIndex].pieData.endRatio
        k = options.series[params.seriesIndex].pieStatus.k

        // 对当前点击的扇形，执行高亮操作（对 option 更新）
        options.series[params.seriesIndex].parametricEquation = getParametricEquation(
          startRatio,
          endRatio,
          isSelected,
          isHovered,
          k,
          options.series[params.seriesIndex].pieData.value + 5
        )
        options.series[params.seriesIndex].pieStatus.hovered = isHovered

        // 记录上次高亮的扇形对应的系列号 seriesIndex
        hoveredIndex = params.seriesIndex
      }

      // 使用更新后的 option，渲染图表
      chart.setOption(options)
    }
  })
  // 监听窗口大小变化，调整图表尺寸
}
// 生成扇形的曲面参数方程，用于 series-surface.parametricEquation
const getParametricEquation = (startRatio, endRatio, isSelected, isHovered, k, h) => {
  // 计算
  let midRatio = (startRatio + endRatio) / 2

  let startRadian = startRatio * Math.PI * 2
  let endRadian = endRatio * Math.PI * 2
  let midRadian = midRatio * Math.PI * 2

  // 如果只有一个扇形，则不实现选中效果。
  if (startRatio === 0 && endRatio === 1) {
    isSelected = false
  }

  // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
  k = typeof k !== "undefined" ? k : 1 / 3

  // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
  let offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0
  let offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0

  // 计算高亮效果的放大比例（未高亮，则比例为 1）
  let hoverRate = isHovered ? 1.05 : 1

  // 返回曲面参数方程
  return {
    u: {
      min: -Math.PI,
      max: Math.PI * 3,
      step: Math.PI / 32
    },

    v: {
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 20
    },

    x: function (u, v) {
      if (u < startRadian) {
        return offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
      }
      if (u > endRadian) {
        return offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
      }
      return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate
    },

    y: function (u, v) {
      if (u < startRadian) {
        return offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate
      }
      if (u > endRadian) {
        return offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate
      }
      return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate
    },

    z: function (u, v) {
      if (u < -Math.PI * 0.5) {
        return Math.sin(u)
      }
      if (u > Math.PI * 2.5) {
        return Math.sin(u) * h * 0.1
      }
      return Math.sin(v) > 0 ? 1 * h * 0.1 : -1
    }
  }
}

// 生成模拟 3D 饼图的配置项
const getPie3D = (pieData, internalDiameterRatio) => {
  let series = []
  let sumValue = 0
  let startValue = 0
  let endValue = 0
  let legendData = []
  let k =
    typeof internalDiameterRatio !== "undefined" ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio) : 1 / 3
  let maxValue = 0
  // 为每一个饼图数据，生成一个 series-surface 配置
  for (let i = 0; i < pieData.length; i++) {
    sumValue += pieData[i].value
    maxValue = Math.max(maxValue, pieData[i].value)
    let seriesItem = {
      name: typeof pieData[i].name === "undefined" ? `series${i}` : pieData[i].name,
      type: "surface",
      parametric: true,
      wireframe: {
        show: false
      },
      pieData: pieData[i],
      pieStatus: {
        selected: false,
        hovered: false,
        k: k
      }
    }

    if (typeof pieData[i].itemStyle != "undefined") {
      let itemStyle = {}

      typeof pieData[i].itemStyle.color != "undefined" ? (itemStyle.color = pieData[i].itemStyle.color) : null
      typeof pieData[i].itemStyle.opacity != "undefined" ? (itemStyle.opacity = pieData[i].itemStyle.opacity) : null

      seriesItem.itemStyle = itemStyle
    }
    series.push(seriesItem)
  }

  // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
  // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
  for (let i = 0; i < series.length; i++) {
    endValue = startValue + series[i].pieData.value

    series[i].pieData.startRatio = startValue / sumValue
    series[i].pieData.endRatio = endValue / sumValue
    series[i].parametricEquation = getParametricEquation(
      series[i].pieData.startRatio,
      series[i].pieData.endRatio,
      false,
      false,
      k,
      series[i].pieData.value
    )

    startValue = endValue

    legendData.push(series[i].name)
  }

  // 补充一个透明的圆环，用于支撑高亮功能的近似实现。
  series.push({
    name: "mouseoutSeries",
    type: "surface",
    parametric: true,
    wireframe: {
      show: false
    },
    itemStyle: {
      opacity: 0
    },
    parametricEquation: {
      u: {
        min: 0,
        max: Math.PI * 2,
        step: Math.PI / 20
      },
      v: {
        min: 0,
        max: Math.PI,
        step: Math.PI / 20
      },
      x: function (u, v) {
        return Math.sin(v) * Math.sin(u) + Math.sin(u)
      },
      y: function (u, v) {
        return Math.sin(v) * Math.cos(u) + Math.cos(u)
      },
      z: function (u, v) {
        return Math.cos(v) > 0 ? 0.1 : -0.1
      }
    }
  })
  let size = {}

  if (props.size === "1") {
    size = {
      grid3DLeft: "10",
      grid3DTop: "0",
      grid3DWidth: 240,
      grid3DHeight: 240,
      boxHeight: 600 / maxValue
    }
  }

  // 准备待返回的配置项，把准备好的 legendData、series 传入。
  let option = {
    title: {
      show: props.title,
      text: props.title,
      textStyle: {
        fontSize: 14,
        color: "rgb(255, 255 ,255)"
      },
      subtext: sumValue + props.unit,
      subtextStyle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#00ff9c"
      },
      left: "center",
      top: "0"
    },
    legend: {
      show: props.showLegend,
      orient: "vertical",
      icon: "circle",
      bottom: "center",
      right: "10",
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
      data: legendData,
      textStyle: {
        color: "#fff",
        fontSize: 10,
        rich: {
          a: {
            width: 10,
            height: 10,
            color: "#00fef0",
            fontSize: 10
          }
        }
      },
      formatter: (params: any) => {
        const value = pieData.find((d) => d.name === params).value || 0
        const precent = ((value / sumValue) * 100).toFixed(0)
        return `${params}  {a|${value + props.unit}  ${precent}%}`
      }
    },
    tooltip: {
      backgroundColor: "rgba(0,0,0,0.7)",
      borderWidth: 0,
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      formatter: (params) => {
        if (params.seriesName !== "mouseoutSeries") {
          return `${params.seriesName}<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>${option.series[params.seriesIndex].pieData.value}`
        }
      }
    },
    xAxis3D: {
      min: -1,
      max: 1
    },
    yAxis3D: {
      min: -1,
      max: 1
    },
    zAxis3D: {
      min: -1,
      max: 1
    },
    grid3D: {
      show: true,
      left: size.grid3DLeft,
      top: size.grid3DTop,
      width: size.grid3DWidth,
      height: size.grid3DHeight,
      boxHeight: size.boxHeight, // 设置高度
      viewControl: {
        //3d效果可以放大、旋转等，请自己去查看官方配置
        alpha: 40,
        // beta: 40,
        rotateSensitivity: 0,
        zoomSensitivity: 0.5,
        panSensitivity: 0.5,
        autoRotate: true
      },
      //后处理特效可以为画面添加高光、景深、环境光遮蔽（SSAO）、调色等效果。可以让整个画面更富有质感。
      postEffect: {
        //配置这项会出现锯齿，请自己去查看官方配置有办法解决
        enable: true,
        bloom: {
          enable: true,
          bloomIntensity: 0.1
        },
        SSAO: {
          enable: true,
          quality: "medium",
          radius: 2
        }
      }
    },
    series: series
  }
  return option
}
const getRandomHexColor = () => {
  // 生成一个随机的 0 到 16777215 之间的整数
  const randomInt = Math.floor(Math.random() * 16777215)
  // 将整数转换为 16 进制字符串，并确保它是 6 位数
  const hexColor = `#${randomInt.toString(16).padStart(6, "0")}`
  return hexColor
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
