<template>
  <div
    ref="chartPanelRef"
    class="chart-panel"
    id="chart-panel"
    :style="style"
  ></div>
  <EmptyData v-show="!data" />
</template>
<!-- 柱状图-反转 -->
<script lang="ts" setup>
import { getCurrentInstance } from "vue"
const proxy = getCurrentInstance()!.proxy as any
interface Props {
  data?: any
  title?: any
  style?: any
  gradient?: any
  colors?: any
  showLegend?: any
}
const props = withDefaults(defineProps<Props>(), {
  style: () => {
    return {
      width: "100%",
      height: "100%"
    }
  },
  gradient: false, // 是否显示渐变
  showLegend: true // 是否显示图例
})
const chartPanelRef = ref()
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
const setOption = async () => {
  const response = props.data
  const color = props.colors ? props.colors : ["#71F28D", "#EDB53F", "#EB2927", "#9747FF", "#B90000"]
  let xAxis: any = [],
    data: any = []
  const legend: any = []
  const unit = response.dw
  function getSymbolData(data: any) {
    let arr = []
    for (var i = 0; i < data.length; i++) {
      arr.push({
        value: data[i].value,
        symbolPosition: "end"
      })
    }
    return arr
  }
  if (!response || response?.data.length === 0) {
    chart = null
    return
  } else {
    xAxis = response.xAxis
    response.data.forEach((d: any, i: number) => {
      legend.push(d.name)
      let color1, color2
      if (props.gradient) {
        if (color[i].indexOf("|") > -1) {
          color1 = color[i].split("|")[0]
          color2 = color[i].split("|")[1]
        } else {
          color1 = color[i]
          color2 = hexToRgba(color[i], 0.2)
        }
      }
      data.push({
        name: d.name,
        type: "bar",
        yAxisIndex: 0,
        barWidth: 6,
        itemStyle: props.gradient
          ? {
              color: new proxy.$echarts.graphic.LinearGradient(
                0,
                0,
                1,
                0,
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
              ),
              shadowColor: "rgba(0, 0, 0, 0.1)",
              shadowBlur: 10,
              borderRadius: [0, 40, 40, 0]
            }
          : null,
        data: d.data
      })
      data.push({
        name: "XXX",
        type: "pictorialBar",
        symbol:
          "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAA6CAMAAADWZboaAAAAZlBMVEUAAABe3uVe3+Vf3uVf3+Zf3uVg3+Zg3+Zf3+Vi4OZh4OZg3+Z86/Bh3+Zi4Odj4Odi4OZ86/B76/B86/Bj4ed56+9x5+xn4umB7/N87PB36e+A7/N+7fF/7vJ/7vJ+7fGA7/OB7/PReX+lAAAAIXRSTlMABQkVDREmIhk3MR10LEFFPHh7cUprXE35h2XnqMLAp+mHAG9cAAAB5ElEQVRIx83WjU7CMBQFYIoiKMqU/XUboHv/l/Tce7t2XamDNSacETEmX86tlK2rx4py150o+MstMBLwWRfHKo6JCVxLnvmFGBjFQ58oF1//sUZhGy/ClSTWObgnL4O+bkeN4nY2okfNMbkRt9/vtxz8InoTsWplJSCzFxPmO8+GpSIByX3YQAuGDWtRKhKjCnxDXhF6Z4yxnZ20Wgko7BMRDmxtSGVaI4kdTIgb+zTYoJQlIMlDlmUFgrcDWWC201qSayqlTkiCddWWeV62VU0YlnpRi9VOKaSUsiyq/N0krwq2Ugt7lVpZl5BfHNiytjagMi+XYp0kCR45hMlivVQrE/uU5pXSrCB5bM6d1t2lOZItMqmliT3q5uVxqxzyW/ccfYLNKx7ZTeykMvNyac2yt2Fbc61MHLSC0rwoxbiNdlQ3GBm1NLHQsHUrtEXppR/ljNpW6DbSCoqlFiVoN6YdaFlgsSFVPs1BdT8OaB5QyQzVcaqWDows/zepxR8ObLglTrdtCRVuRNj4Rrxh+//0ke2f8KVL+Kon3GCSbmsJN9OUW3j6g0Ns+LgCij2u0h+Sghc8mlMPBMgdx5DFh59VmOVHrvmDnoNxCz3J7MFWsMuaLyR089xz/xhlfijvwutR8gv3zk6BLUUeCgAAAABJRU5ErkJggg==",
        symbolSize: [40, 40],
        symbolOffset: [20, 0],
        itemStyle: {
          color: "#14b1eb"
        },
        data: getSymbolData(d.data),
        tooltip: {
          show: false
        },
        zlevel: 2
      })
    })
  }

  const options: any = {
    title: {
      show: props.title,
      text: props.title,
      textStyle: {
        fontSize: 14,
        color: "rgb(51,133,255)"
      },
      left: "center",
      top: "1%"
    },
    color: color,
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(98, 73, 160,0.7)",
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
          str += `${seriesName}(${unit}) ： ${value} <br>`
        })
        return str
      }
    },
    legend: {
      show: props.showLegend,
      data: legend,
      align: "right",
      top: "10%",
      left: "center",
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      itemWidth: 20,
      itemHeight: 16
    },
    grid: {
      top: props.showLegend ? "20%" : "10%",
      right: "12%",
      left: "2",
      bottom: "10",
      containLabel: true
    },
    xAxis: [
      {
        name: unit,
        type: "value",
        position: "top",
        axisLine: {
          show: true,
          lineStyle: {
            color: "rgba(255,255,255,0.2)"
          }
        },
        axisLabel: {
          color: "#3a6779",
          fontSize: 12,
          interval: 0
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "rgba(255,255,255,0.2)",
            type: "dashed"
          }
        }
      }
    ],
    yAxis: [
      {
        type: "category",
        data: xAxis,
        axisLabel: {
          formatter: "{value}",
          color: "#d8ebfd",
          fontSize: 12
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "rgba(255,255,255,0.1)",
            width: 1
          }
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: "rgba(255,255,255,0.2)",
            type: "dashed"
          }
        },
        zlevel: 1
      }
    ],
    animation: true,
    animationDurationUpdate: 2000,
    series: data
  }

  if (response.data?.[0]?.data?.length > 15) {
    options.dataZoom = [
      {
        show: true,
        type: "slider",
        start: 0,
        end: (15 * 100) / response.data?.[0]?.data?.length,
        orient: "vertical",
        width: 15
      }
    ]
  } else {
    options.dataZoom = {
      show: false,
      type: "slider",
      start: 0,
      end: 100,
      orient: "vertical",
      width: 15
    }
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

defineExpose({
  resize
})
</script>

<style lang="scss" scoped>
.chart-panel {
  width: 100%;
  height: 100%;
  min-height: 280px;
}
</style>
