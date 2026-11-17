import * as echarts from "echarts"
import type { EChartsOption } from "echarts"

/** 数据分析图表配色（鹞落坪蓝青主题） */
const SERIES_COLORS = [
  { color: "rgba(20, 201, 178, 1)", color1: "rgba(20, 201, 178, .35)" },
  { color: "rgba(126, 200, 255, 1)", color1: "rgba(126, 200, 255, .35)" },
  { color: "rgba(230, 168, 25, 1)", color1: "rgba(230, 168, 25, .35)" },
  { color: "rgba(199, 83, 9, 1)", color1: "rgba(199, 83, 9, .35)" },
  { color: "rgba(132, 199, 9, 1)", color1: "rgba(132, 199, 9, .35)" },
  { color: "rgba(235, 22, 221, 1)", color1: "rgba(235, 22, 221, .35)" },
  { color: "rgba(25, 107, 230, 1)", color1: "rgba(25, 107, 230, .35)" }
]

const EMPTY_TITLE: EChartsOption = {
  title: {
    text: "暂无数据",
    left: "center",
    top: "center",
    textStyle: { color: "rgba(255,255,255,.65)", fontSize: 14, fontWeight: "normal" }
  }
}

export interface AiAnalysisLegendItem {
  name: string
  color: string
}

/** 构建 AI 分析横向堆叠条形图（与大鲵一张图一致） */
export function buildAiAnalysisOption(rows: Record<string, unknown>[]): {
  option: EChartsOption
  legend: AiAnalysisLegendItem[]
} {
  const categories = ["火", "烟", "人员", "车辆"]
  const legend: AiAnalysisLegendItem[] = []
  const seriesData: echarts.SeriesOption[] = []

  rows.forEach((row, index) => {
    const palette = SERIES_COLORS[index % SERIES_COLORS.length]
    legend.push({ name: String(row.name), color: palette.color })
    const values = [row.FireCount, row.SmokeCount, row.PersonCount, row.CarCount].map((v) => Number(v) || 0)

    seriesData.push({
      name: String(row.name),
      type: "bar",
      barWidth: 11,
      yAxisIndex: 1,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: "rgba(255,255,255,0)" },
          { offset: 1, color: "rgba(255,255,255,.65)" }
        ]),
        borderRadius: [0, 1, 1, 0]
      },
      tooltip: { show: false },
      data: values
    })
    seriesData.push({
      name: String(row.name),
      type: "bar",
      barWidth: 9,
      barGap: index === 0 ? "-100%" : "50%",
      itemStyle: {
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: palette.color },
          { offset: 1, color: palette.color1 }
        ]),
        borderRadius: [0, 1, 1, 0]
      },
      data: values
    })
    seriesData.push({
      name: "",
      type: "pictorialBar",
      symbol: "rect",
      symbolSize: [5, 9],
      symbolOffset: [0, index === 0 ? -7 : 7],
      z: 5,
      itemStyle: {
        color: (params) =>
          new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: "#ffffff00" },
            { offset: 1, color: Number(params.value) === 0 ? "#ffffff00" : "rgba(255, 255, 255, .65)" }
          ]),
        borderRadius: [0, 1, 1, 0]
      },
      tooltip: { show: false },
      symbolPosition: "end",
      data: values
    })
  })

  if (seriesData.length === 0) {
    return { option: EMPTY_TITLE, legend: [] }
  }

  return {
    legend,
    option: {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(16, 52, 96, .85)",
        borderColor: "rgba(126, 200, 255, .35)",
        textStyle: { color: "#fff" }
      },
      grid: { left: 44, right: 16, top: 8, bottom: 12 },
      yAxis: [
        {
          data: categories,
          inverse: true,
          axisTick: { show: false },
          axisLine: { show: true, lineStyle: { color: "rgba(62, 140, 210, .45)" } },
          axisLabel: { color: "rgba(201, 215, 234, 1)", fontSize: 12, margin: 8 }
        },
        {
          data: [],
          inverse: true,
          show: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false }
        }
      ],
      xAxis: [
        {
          min: 0,
          splitLine: { show: true, lineStyle: { type: "dashed", color: "#2D4377", opacity: 0.5 } },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { show: false }
        }
      ],
      series: seriesData
    }
  }
}

export interface CarTypeLegendItem {
  name: string
  color: string
  value: number
}

/** 构建车辆类型环形图 */
export function buildCarTypeOption(rows: { type: string; count: number }[]): {
  option: EChartsOption
  legend: CarTypeLegendItem[]
} {
  const legend: CarTypeLegendItem[] = rows.map((row, index) => ({
    name: row.type,
    value: row.count,
    color: SERIES_COLORS[index % SERIES_COLORS.length].color
  }))

  if (legend.length === 0) {
    return { option: EMPTY_TITLE, legend: [] }
  }

  const pieCenter: [string, string] = ["50%", "50%"]

  return {
    legend,
    option: {
      tooltip: { trigger: "item" },
      series: [
        /* 内环装饰：与数据环共用中心，避免 graphic 贴图与饼图圆心偏移 */
        {
          type: "pie",
          radius: ["0%", "36%"],
          center: pieCenter,
          silent: true,
          animation: false,
          label: { show: false },
          tooltip: { show: false },
          data: [
            {
              value: 1,
              itemStyle: {
                color: {
                  type: "radial",
                  x: 0.5,
                  y: 0.5,
                  r: 0.8,
                  colorStops: [
                    { offset: 0, color: "rgba(28, 58, 92, 0.95)" },
                    { offset: 1, color: "rgba(12, 34, 58, 0.75)" }
                  ]
                }
              }
            }
          ]
        },
        {
          type: "pie",
          radius: ["42%", "58%"],
          center: pieCenter,
          padAngle: legend.length > 1 ? 2 : 0,
          itemStyle: {
            borderColor: "rgba(8, 28, 52, 0.6)",
            borderWidth: 1
          },
          emphasis: {
            scale: true,
            scaleSize: 4
          },
          label: { show: false },
          data: legend.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: item.color }
          }))
        }
      ]
    }
  }
}

/** 图表容器尺寸变化时重绘 */
export function bindChartResize(chart: echarts.ECharts | null, el: HTMLElement | null) {
  if (!chart || !el) return () => {}
  const ro = new ResizeObserver(() => chart.resize())
  ro.observe(el)
  return () => ro.disconnect()
}
