<template>
  <div class="left1">
    <BasePanel
      :title="selectName?.label + '查询统计'"
      class="overflow-hidden"
    >
      <template #contain>
        <div class="con">
          <div
            class="relative flex h-1/2 flex-col"
            style="height: 100%"
          >
            <div class="flexbox gap-2 bg-[#294064] text-sm leading-loose text-custom3">
              <img
                :src="$fun.getImg('arrow-left.png')"
                alt=""
              />
              功能分区{{ selectName?.label }}统计查询
              <img
                :src="$fun.getImg('arrow-right.png')"
                alt=""
              />
            </div>
            <div
              id="chart1"
              class="chart"
            ></div>
            <div class="search-box">
              <!-- <el-select v-model="queryForm.lin_zhong" placeholder="请选择"
                                popper-class="custom-select-popper" clearable @change="getList(1)">
                                <el-option v-for="item in options1" :key="item.name" :label="item.name"
                                    :value="item.name" />
                            </el-select> -->
              <el-input
                v-model="queryForm.xiao_ban"
                placeholder="请输入小班号"
                clearable
                @change="getList(1)"
                style="width: 100%"
              />
            </div>
            <div class="table-box">
              <el-table
                class="tableList"
                :data="tableData"
                stripe
                show-overflow-tooltip
                @row-click="handleRowClick"
              >
                <el-table-column
                  type="index"
                  label="序号"
                  width="55"
                  align="center"
                />
                <el-table-column
                  prop="lin_zhong"
                  label="类型"
                  align="center"
                >
                  <template #default="scope">
                    <span>{{ scope.row[selectName.value] }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="mian_ji"
                  label="面积（hm²）"
                  align="center"
                >
                  <template #default="scope">
                    <span>{{ scope.row.mian_ji.toFixed(2) }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="xiao_ban"
                  width="70"
                  label="小班号"
                  align="center"
                />
              </el-table>
            </div>
            <el-pagination
              v-model:current-page="queryForm.page"
              v-model:page-size="queryForm.intPageSize"
              :page-sizes="[10, 20, 30, 40]"
              :background="false"
              :pager-count="5"
              layout="prev, pager, next"
              :total="total"
              prev-text="上页"
              next-text="下页"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </template>
    </BasePanel>
  </div>
</template>

<script setup lang="ts">
import { forestResourcesApi } from "@/api/aiRemoteSensing"
import * as echarts from "echarts"
import "echarts-gl"
const props = defineProps(["selectName"])
import { useMap } from "./map"
const { resourceType } = useMap()

const options1 = ref<any>([])
const queryForm = reactive({
  page: 1,
  intPageSize: 10,
  lin_zhong: "",
  xiao_ban: ""
})
const total = ref(0)
const tableData = ref([])

watch(
  () => props.selectName,
  async () => {
    await getData()
  }
)

//统计查询
const getData = async () => {
  const res: any = await forestResourcesApi.getTypeForestResources({
    type: props.selectName.label
  })
  if (res.success) {
    options1.value = res.response
    let sum = res.response.reduce((a: any, b: any) => a + (b.value || 0), 0)

    let data = res.response.map((item: any) => {
      if (!item.name) item.name = "其它"
      item.color = resourceType.value[props.selectName.value][item.name]
      item.percent = ((item.value / sum) * 100).toFixed(2)
      item.itemStyle = {
        color: item.color
      }
      return item
    })
    initchart(data || [])
    getList(1)
  } else {
    initchart([])
  }
}
//查询表格数据
const emit = defineEmits(["getResource", "handleRowClick"])
const getList = async (val?: number) => {
  if (val == 1) queryForm.page = 1
  const res: any = await forestResourcesApi.getPageForestResources(queryForm)
  if (res.success) {
    total.value = res.response.dataCount
    tableData.value = res.response.data || []
  } else {
    tableData.value = []
    total.value = 0
  }
}
const getList1 = async (val?: number) => {
  let query = {
    page: 1,
    intPageSize: 9999
  }
  let data = []
  const res: any = await forestResourcesApi.getPageForestResources(query)
  if (res.success) {
    data = res.response.data || []
  }
  emit("getResource", data)
}
let chart1: any = null
import chartBg from "@/assets/images/aiRemoteSensing/slzy-img1.png"
const initchart = (data: any) => {
  chart1?.dispose && chart1.dispose() // 销毁实例
  let chart: any = document.getElementById("chart1")
  chart.removeAttribute("_echarts_instance_")
  chart1 = echarts.init(chart as HTMLDivElement)
  let option: any = null
  if (data.length == 0) {
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
    let legend: any = []
    const series: any = getPie3D(data, 0.8, 240, 28, 26, 0.5)
    let boxHeight = getHeight3D(series, 40) //通过传参设定3d饼/环的高度
    series.push({
      name: "pie2d",
      type: "pie",
      label: {
        show: false,
        opacity: 1,
        fontSize: 12,
        lineHeight: 20,
        color: "#fff"
      },
      labelLine: {
        length: 30,
        length2: 30
      },
      startAngle: -80, //起始角度，支持范围[0, 360]。
      clockwise: false, //饼图的扇区是否是顺时针排布。上述这两项配置主要是为了对齐3d的样式
      radius: ["20%", "50%"],
      center: ["50%", "50%"],
      data: data,
      itemStyle: {
        opacity: 0
      }
    })
    if (data.length > 4) {
      let obj1 = {
        show: true,
        left: "left",
        top: "11%",
        icon: "rect",
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10,
        textStyle: {
          color: "#fff",
          fontSize: 12
        },
        formatter: (name: any) => {
          let ele = data.find((d: any) => d.name === name)
          return name + "：" + ele.value.toFixed(2) + "hm²  占" + ele.percent + "%"
        },
        data: data.slice(0, 4)
      }
      let obj2 = {
        show: true,
        type: "scroll",
        left: "center",
        top: "4%",
        icon: "rect",
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10,
        textStyle: {
          color: "#fff",
          fontSize: 12
        },
        formatter: (name: any) => {
          let ele = data.find((d: any) => d.name === name)
          return name + "：" + ele.value.toFixed(2) + "hm²  占" + ele.percent + "%"
        },
        data: data.slice(4, data.length),
        pageIconColor: "greenyellow",
        pageIconInactiveColor: "orangered",
        pageIconSize: 8,
        pageTextStyle: {
          color: "#fff",
          fontSize: 12
        }
      }
      legend.push(obj1)
      legend.push(obj2)
    } else {
      let obj1 = {
        show: true,
        left: "left",
        top: "4%",
        icon: "rect",
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: "#fff",
          fontSize: 12
        },
        formatter: (name: any) => {
          let ele = data.find((d: any) => d.name === name)
          return name + "：" + ele.value.toFixed(2) + "hm²  占" + ele.percent + "%"
        },
        data: data
      }
      legend.push(obj1)
    }
    option = {
      legend: legend,
      tooltip: {
        confine: true,
        backgroundColor: "rgba(0,0,0,0.7)",
        textStyle: {
          color: "#fff"
        },
        formatter: (params: any) => {
          if (params.seriesName !== "mouseoutSeries" && params.seriesName !== "pie2d") {
            let bfb: any = (
              (option.series[params.seriesIndex].pieData.endRatio -
                option.series[params.seriesIndex].pieData.startRatio) *
              100
            ).toFixed(2)
            const value: any = option.series[params.seriesIndex].pieData.value
            return (
              `<div style='color:rgba(214, 243, 255, 0.9);'>` +
              `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>` +
              `${params.seriesName}<br/>` +
              `<span style='margin-right:20px'>${value}公顷</span>` +
              `<span >${bfb}%</span>` +
              `</div>`
            )
          }
        }
      },
      labelLine: {
        show: true,
        lineStyle: {
          color: "#7BC0CB"
        }
      },
      label: {
        show: true,
        position: "outside",
        formatter: "{b} \n{c}h㎡\n {d}%"
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
      graphic: {
        //图形中间图片
        elements: [
          {
            type: "image",
            style: {
              image: chartBg, //在这里放背景
              width: 287,
              height: 129
            },
            left: "center", // 水平居中
            bottom: 20 // 垂直居中
          }
        ]
      },
      grid3D: {
        show: false,
        boxHeight: boxHeight, //圆环的高度
        viewControl: {
          alpha: 30,
          beta: 30,
          distance: 400, //调整视角到主体的距离，类似调整zoom
          rotateSensitivity: 0, // 设置为0无法旋转
          zoomSensitivity: 0, // 设置为0无法缩放
          panSensitivity: 0, // 设置为0无法平移
          autoRotate: true // 自动旋转
        }
      },
      series: series
    }
  }
  chart1.clear()
  chart1.setOption(option)
  //获取3d丙图的最高扇区的高度
  function getHeight3D(series: any, height: any) {
    series.sort((a: any, b: any) => {
      return b.pieData.value - a.pieData.value
    })
    return (height * 20) / series[0].pieData.value
  }

  // 生成扇形的曲面参数方程，用于 series-surface.parametricEquation
  function getParametricEquation(startRatio: any, endRatio: any, isSelected: any, isHovered: any, k: any, h: any) {
    // 计算
    const midRatio = (startRatio + endRatio) / 2
    const startRadian = startRatio * Math.PI * 2
    const endRadian = endRatio * Math.PI * 2
    const midRadian = midRatio * Math.PI * 2
    // 如果只有一个扇形，则不实现选中效果。
    if (startRatio === 0 && endRatio === 1) {
      isSelected = false
    }
    // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
    k = 1
    // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
    const offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0
    const offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0
    // 计算高亮效果的放大比例（未高亮，则比例为 1）
    const hoverRate = isHovered ? 1.05 : 1
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
      x: function (u: any, v: any) {
        if (u < startRadian) {
          return offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
        }
        if (u > endRadian) {
          return offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
        }
        return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate
      },
      y: function (u: any, v: any) {
        if (u < startRadian) {
          return offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate
        }
        if (u > endRadian) {
          return offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate
        }
        return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate
      },
      z: function (u: any, v: any) {
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

  /**
   * 绘制3d图
   * @param pieData 总数据
   * @param internalDiameterRatio:透明的空心占比
   * @param distance 视角到主体的距离
   * @param alpha 旋转角度
   * @param pieHeight 立体的高度
   * @param opacity 饼或者环的透明度
   */
  function getPie3D(pieData: any, internalDiameterRatio: any, distance: any, alpha: any, pieHeight: any, opacity = 1) {
    const series: any = []
    let sumValue = 0
    let startValue = 0
    let endValue = 0
    const legendData = []
    const k =
      typeof internalDiameterRatio !== "undefined" ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio) : 1 / 3
    // 为每一个饼图数据，生成一个 series-surface 配置
    for (let i = 0; i < pieData.length; i += 1) {
      sumValue += pieData[i].value
      const seriesItem: any = {
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
      if (typeof pieData[i].itemStyle !== "undefined") {
        const itemStyle: any = {}
        if (typeof pieData[i].itemStyle.color !== "undefined") {
          itemStyle.color = pieData[i].itemStyle.color
        }
        if (typeof pieData[i].itemStyle.opacity !== "undefined") {
          itemStyle.opacity = pieData[i].itemStyle.opacity
        }
        seriesItem.itemStyle = itemStyle
      }
      series.push(seriesItem)
    }
    // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
    // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
    for (let i = 0; i < series.length; i += 1) {
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
    return series
  }
}
const handleCurrentChange = () => {
  getList()
}
const handleRowClick = (row: any) => {
  emit("handleRowClick", row)
}
onMounted(() => {
  getList1()
})
onBeforeUnmount(() => {})
</script>
<style lang="scss" scoped>
.left1 {
  width: 100%;
  height: 100%;
  position: relative;
  .con {
    position: relative;
    height: 100%;
  }

  .chart {
    width: 100%;
    height: 300px;
  }
  :deep(.search-box) {
    display: grid;
    //    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 10px 0;
    .el-input__wrapper,
    .el-select__wrapper {
      background-color: #0c284d;
      box-shadow: none;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 0;
      color: #fff;
    }
    .el-select__placeholder,
    .el-input__inner {
      color: #fff;
    }
  }
  .table-box {
    height: calc(100% - 425px);
  }
  :deep(.tableList) {
    height: 100%;
    background: transparent !important;
    &.el-table {
      --el-table-row-hover-bg-color: linear-gradient(90deg, #29a2b0 0%, #1e4e9c 100%);
      --el-table-border: none;
      --el-table-tr-bg-color: #183559;
      --el-fill-color-lighter: #204b78;
      .el-table__cell {
        color: #a7d2ca;
        border-bottom: 2px solid #172e50 !important;
        color: #dde3e8 !important;
      }
    }

    th.el-table__cell {
      background-color: #204b78 !important;
      border-bottom: 2px solid #172e50 !important;
      color: #dde3e8 !important;
    }

    .el-table--striped .el-table__body tr.el-table__row--striped td {
      background: #082948;
    }

    .el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
      background: #194570;
    }

    tr {
      background: #183559 !important;
    }

    td,
    .building-top .el-table th.is-leaf {
      border: none !important;
      color: #c2c8cf !important;
    }

    .el-table--enable-row-hover .el-table__body tr:hover > td {
      background-color: #082948;
    }

    .el-table__body tr.hover-row.current-row > td.el-table__cell,
    .el-table__body tr.hover-row.el-table__row--striped.current-row > td.el-table__cell,
    .el-table__body tr.hover-row.el-table__row--striped > td.el-table__cell,
    .el-table__body tr.hover-row > td.el-table__cell {
      background-color: rgba(0, 0, 0, 0.3) !important;
    }

    .el-table__inner-wrapper:before {
      height: 0 !important;
    }
  }
  :deep(.el-pagination) {
    margin-top: 10px;
    justify-content: center;

    .el-pager {
      li {
        background: transparent;
        color: #fff;
      }

      li.is-active {
        color: #195bdf;
        background-color: rgba(26, 39, 52, 0.5);
      }
    }

    .el-pagination__sizes,
    .el-pagination__total {
      color: #fff;
    }

    .el-input__wrapper {
      padding: 1px 2px;
      background-color: rgba(60, 93, 128, 0.5);
      box-shadow: none;

      .el-input__inner {
        color: #fff;
      }
    }

    .el-pagination__editor.el-input {
      width: 40px;
    }

    .el-pagination__jump {
      color: #fff;
    }
    button {
      width: 68px;
      height: 32px;
      background: #0b2135;
      box-sizing: border-box;
      border: 0.5px solid;
      color: #fff;
      border-image: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.3) -3%,
          rgba(255, 255, 255, 0.06) 47%,
          rgba(255, 255, 255, 0.3) 100%
        )
        0.5;
      box-shadow:
        inset -1px -1px 4px 0px rgba(0, 23, 227, 0.1),
        inset 1px 1px 4px 0px rgba(0, 23, 227, 0.1);
    }
  }
}
</style>
