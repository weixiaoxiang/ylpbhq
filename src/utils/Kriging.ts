import kriging from "@sakitam-gis/kriging"
import { Map } from "ol"
import ImageLayer from "ol/layer/Image"
import Static from "ol/source/ImageStatic"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import { Point } from "ol/geom"
import { Feature } from "ol"
import { Style, Circle, Fill, Stroke, Text } from "ol/style"

/**
 * 克里金插值数据点接口
 */
interface KrigingDataPoint {
  /** 监测点名称或标识 */
  name: string
  /** 经度坐标 (WGS84) */
  lon: number
  /** 纬度坐标 (WGS84) */
  lat: number
  /** 监测数值 */
  value: number
}

/**
 * 地理边界范围接口
 */
interface GeoExtent {
  /** 最小经度 */
  minLon: number
  /** 最大经度 */
  maxLon: number
  /** 最小纬度 */
  minLat: number
  /** 最大纬度 */
  maxLat: number
}

/**
 * RGB颜色接口
 */
interface RGBColor {
  r: number
  g: number
  b: number
}

/**
 * 克里金插值配置选项
 */
interface KrigingOptions {
  /**
   * 插值网格大小 - 控制插值计算的网格密度
   * - 值越大，插值越精细，但计算时间越长
   * - 建议范围: 80-300
   * - 默认: 200
   */
  gridSize?: number

  /**
   * Canvas画布分辨率 - 控制输出图像的清晰度
   * - 值越大，图像越清晰，但内存占用越大
   * - 建议与gridSize保持一定比例关系
   * - 默认: 1000
   */
  canvasSize?: number

  /**
   * 颜色插值段数 - 控制颜色过渡的平滑度
   * - 值越大，颜色过渡越平滑
   * - 建议范围: 500-3000
   * - 默认: 1000
   */
  totalSegments?: number

  /**
   * 颜色映射数组 - 从高值到低值的颜色渐变
   * - 数组第一个颜色对应最高值，最后一个对应最低值
   * - 支持十六进制颜色格式 (#RRGGBB)
   * - 默认: ["#EA5501", "#e57f23", "#dea03b", "#d5be52", "#cad060", "#B7EE78"]
   */
  colors?: string[]

  /**
   * 插值图层透明度
   * - 范围: 0-1
   * - 0为完全透明，1为完全不透明
   * - 默认: 0.8
   */
  opacity?: number

  /**
   * 图层层级 - 控制图层在地图上的显示顺序
   * - 值越大，图层越靠上
   * - 默认: 1
   */
  zIndex?: number

  /**
   * 克里金模型类型 - 选择空间相关性模型
   * - gaussian: 高斯模型，适合平滑过渡
   * - exponential: 指数模型，适合快速衰减
   * - spherical: 球状模型，适合有明确影响范围的数据
   * - 默认: 'gaussian'
   */
  modelType?: "gaussian" | "exponential" | "spherical"

  /**
   * 变差函数参数 - 控制空间相关性特征
   */
  variogramParams?: {
    /**
     * 块金效应 (nugget) - 零距离处的不连续性
     * - 表示测量误差或微观变异
     * - 值越大，表示随机噪声越大
     * - 默认: 0
     */
    nugget?: number

    /**
     * 变程 (range) - 空间自相关的影响距离
     * - 超过此距离，数据点之间基本不相关
     * - 值越小，插值变化越剧烈；值越大，插值越平滑
     * - 建议根据数据点分布密度调整
     * - 默认: 1000
     */
    range?: number

    /**
     * 基台值 (sill) - 变异函数的最大值
     * - 表示空间变异的总量
     * - 通常设置为与range相近或略大
     * - 默认: 1000
     */
    sill?: number
  }

  /**
   * 是否使用真实数据范围进行颜色映射
   * - true: 仅基于原始输入数据的最大最小值进行颜色映射（推荐）
   * - false: 包含虚拟点在内的所有数据范围
   * - 默认: true
   */
  useRealDataRange?: boolean

  /**
   * 虚拟点数值比例 - 当数据点<=2个时自动添加虚拟点
   * - 虚拟点值 = 真实数据平均值 × 此比例
   * - 用于保证克里金插值的稳定性
   * - 默认: 0.8
   */
  virtualPointRatio?: number

  /**
   * 是否显示数据点位图层
   * - true: 在插值图层上方显示原始数据点位置和数值
   * - false: 仅显示插值图层
   * - 点位样式: 青色圆点，数值显示在点位上方
   * - 默认: false
   */
  showPoint?: boolean

  /**
   * 是否启用数据采样优化
   * - true: 当数据点过多时，使用网格采样减少计算量
   * - false: 使用所有原始数据点进行插值
   * - 采样条件: 数据点数 > sampleGridCount²
   * - 推荐用于1000+个数据点的场景
   * - 默认: false
   */
  sample?: boolean

  /**
   * 采样网格数量（每个维度）
   * - 将数据空间划分为 N×N 的网格
   * - 每个网格内的点取平均值作为代表点
   * - 最终采样点数约为 N²
   * - 建议范围: 10-20
   * - 默认: 12 (约144个采样点)
   */
  sampleGridCount?: number

  /**
   * 地图坐标系统
   * - EPSG:4326: WGS84地理坐标系（经纬度）
   * - EPSG:3857: Web墨卡托投影坐标系（米）
   * - 必须与地图实例的坐标系保持一致
   * - 默认: 'EPSG:4326'
   */
  srid?: "EPSG:4326" | "EPSG:3857"
}

/**
 * 克里金插值结果接口
 */
interface KrigingResult {
  /** 插值图层 */
  layer: ImageLayer<Static>
  /** 点位图层 (当showPoint为true时存在) */
  pointLayer: VectorLayer<VectorSource> | null
  /** 更新插值数据 */
  update: (data: KrigingDataPoint[], boundary: number[][], options?: Partial<KrigingOptions>) => void
  /** 移除插值图层 */
  remove: () => void
  /** 获取插值统计信息 */
  getStats: () => {
    minValue: number
    maxValue: number
    meanValue: number
    dataPoints: number
  }
}

/**
 * 颜色处理工具类
 */
class ColorUtils {
  /**
   * 将十六进制颜色转换为RGB
   * @param hex 十六进制颜色值 (#RRGGBB 或 RRGGBB)
   * @returns RGB颜色对象
   */
  static hexToRgb(hex: string): RGBColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : { r: 0, g: 0, b: 0 }
  }

  /**
   * 根据数值在颜色数组间进行插值
   * @param value 当前数值
   * @param min 最小值
   * @param max 最大值
   * @param colors 颜色数组
   * @param totalSegments 总段数
   * @param opacity 透明度
   * @returns 插值后的RGBA颜色字符串
   */
  static interpolateColors(
    value: number,
    min: number,
    max: number,
    colors: string[],
    totalSegments: number = 1000,
    opacity: number = 0.8
  ): string {
    // 反转颜色数组 (高值到低值)
    const reversedColors = [...colors].reverse()

    // 处理所有值相等的情况（避免除零导致NaN）
    if (min === max) {
      // 返回中间颜色
      const middleIndex = Math.floor(reversedColors.length / 2)
      const middleColor = this.hexToRgb(reversedColors[middleIndex])
      return `rgba(${middleColor.r}, ${middleColor.g}, ${middleColor.b}, ${opacity})`
    }

    // 确保值在范围内
    const clampedValue = Math.max(min, Math.min(max, value))
    // 归一化值到0到1之间
    const normalized = (clampedValue - min) / (max - min)

    // 计算当前值所在的段索引
    const segmentSize = 1 / totalSegments
    const segmentIndex = Math.floor(normalized / segmentSize)

    // 计算颜色段索引
    const colorSegmentSize = totalSegments / (reversedColors.length - 1)
    const colorIndex = Math.floor(segmentIndex / colorSegmentSize)

    // 如果索引超出范围，返回最后一个颜色
    if (colorIndex >= reversedColors.length - 1) {
      const lastColor = this.hexToRgb(reversedColors[reversedColors.length - 1])
      return `rgba(${lastColor.r}, ${lastColor.g}, ${lastColor.b}, ${opacity})`
    }

    // 获取起始和结束颜色
    const startColor = this.hexToRgb(reversedColors[colorIndex])
    const endColor = this.hexToRgb(reversedColors[colorIndex + 1])

    // 计算插值因子
    const factor = (segmentIndex % colorSegmentSize) / colorSegmentSize

    // 返回插值后的颜色
    return `rgba(${Math.round(startColor.r + (endColor.r - startColor.r) * factor)}, ${Math.round(
      startColor.g + (endColor.g - startColor.g) * factor
    )}, ${Math.round(startColor.b + (endColor.b - startColor.b) * factor)}, ${opacity})`
  }

  /**
   * 获取默认颜色数组
   * @returns 默认颜色数组
   */
  static getDefaultColors(): string[] {
    return [
      "#EA5501", // 橙红
      "#e57f23", // 橙色
      "#dea03b", // 浅橙
      "#d5be52", // 黄色
      "#cad060", // 黄绿
      "#B7EE78" // 浅绿
    ]
  }
}

/**
 * 几何计算工具类
 */
class GeometryUtils {
  /**
   * 判断点是否在多边形内部 (射线法)
   * @param point 测试点坐标 [x, y]
   * @param polygon 多边形顶点数组
   * @returns 是否在多边形内部
   */
  static isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
    const [x, y] = point
    let inside = false

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i]
      const [xj, yj] = polygon[j]
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
      if (intersect) inside = !inside
    }

    return inside
  }

  /**
   * 计算多边形边界范围
   * @param polygon 多边形顶点数组
   * @returns 边界范围
   */
  static calculateExtent(polygon: number[][]): GeoExtent {
    const lons = polygon.map((p) => p[0])
    const lats = polygon.map((p) => p[1])

    return {
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats)
    }
  }

  /**
   * 计算两点间距离 (欧几里得距离)
   * @param point1 第一个点
   * @param point2 第二个点
   * @returns 距离
   */
  static calculateDistance(point1: [number, number], point2: [number, number]): number {
    const dx = point2[0] - point1[0]
    const dy = point2[1] - point1[1]
    return Math.sqrt(dx * dx + dy * dy)
  }
}

/**
 * 数据采样工具类
 */
class SamplingUtils {
  /**
   * 网格采样 - 保持空间分布特征
   * @param data 原始数据
   * @param gridCount 网格数量（每个维度）
   * @returns 采样后的数据
   */
  static gridSample(data: KrigingDataPoint[], gridCount: number = 12): KrigingDataPoint[] {
    if (!data || data.length === 0) return data

    // 计算数据范围
    const lons = data.map((d) => d.lon)
    const lats = data.map((d) => d.lat)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)

    const lonStep = (maxLon - minLon) / gridCount
    const latStep = (maxLat - minLat) / gridCount

    // 避免除以0
    if (lonStep === 0 || latStep === 0) return data

    // 为每个网格选择一个代表点
    const grid: { [key: string]: KrigingDataPoint[] } = {}
    data.forEach((point) => {
      const gridX = Math.floor((point.lon - minLon) / lonStep)
      const gridY = Math.floor((point.lat - minLat) / latStep)
      const key = `${gridX}_${gridY}`

      if (!grid[key]) {
        grid[key] = []
      }
      grid[key].push(point)
    })

    // 每个网格取平均值
    return Object.values(grid).map((points) => {
      const avgLon = points.reduce((sum, p) => sum + p.lon, 0) / points.length
      const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length
      const avgValue = points.reduce((sum, p) => sum + p.value, 0) / points.length

      return {
        name: points[0].name || "采样点",
        lon: avgLon,
        lat: avgLat,
        value: Number(avgValue.toFixed(2))
      }
    })
  }
}

/**
 * 克里金插值核心类
 */
class KrigingInterpolator {
  private map: Map
  private currentLayer: ImageLayer<Static> | null = null
  private currentPointLayer: VectorLayer<VectorSource> | null = null
  private stats: {
    minValue: number
    maxValue: number
    meanValue: number
    dataPoints: number
  } = {
    minValue: 0,
    maxValue: 0,
    meanValue: 0,
    dataPoints: 0
  }

  constructor(map: Map) {
    this.map = map
  }

  /**
   * 创建克里金插值图层
   * @param inputData 输入的监测点数据数组
   * @param boundary 研究区域边界多边形坐标数组
   * @param options 插值配置选项
   * @returns 克里金插值结果
   */
  createLayer(inputData: KrigingDataPoint[], boundary: number[][], options: KrigingOptions = {}): KrigingResult {
    // 合并默认配置
    const config = this.mergeOptions(options)

    // 验证输入数据
    this.validateInput(inputData, boundary)

    // 如果启用采样，先进行网格采样
    let dataForInterpolation = inputData
    let dataForDisplay = inputData // 用于显示的数据
    if (config.sample && inputData.length > config.sampleGridCount * config.sampleGridCount) {
      dataForInterpolation = SamplingUtils.gridSample(inputData, config.sampleGridCount)
      dataForDisplay = dataForInterpolation // 采样后，显示采样后的点位
      console.log(`数据采样: ${inputData.length} 个点 -> ${dataForInterpolation.length} 个点`)
    }

    // 计算边界范围
    const extent = GeometryUtils.calculateExtent(boundary)

    // 处理数据点
    const processedData = this.processDataPoints(dataForInterpolation, extent, config)

    // 计算统计信息
    this.calculateStats(processedData, config)

    // 训练克里金模型
    const variogram = this.trainKrigingModel(processedData, config)

    // 创建插值图层
    const layer = this.createInterpolationLayer(processedData, boundary, extent, variogram, config)

    // 添加到地图
    this.map.addLayer(layer)
    this.currentLayer = layer

    // 如果需要显示点位图层
    if (config.showPoint) {
      const pointLayer = this.createPointLayer(dataForDisplay, config)
      this.map.addLayer(pointLayer)
      this.currentPointLayer = pointLayer
      console.log(pointLayer.getSource()?.getFeatures())
    }

    return {
      layer,
      pointLayer: this.currentPointLayer,
      update: (newData, newBoundary, newOptions) => {
        this.updateLayer(newData, newBoundary, newOptions)
      },
      remove: () => {
        this.removeLayer()
      },
      getStats: () => ({ ...this.stats })
    }
  }

  /**
   * 更新插值图层
   */
  private updateLayer(
    newData: KrigingDataPoint[],
    newBoundary: number[][],
    newOptions: Partial<KrigingOptions> = {}
  ): void {
    this.removeLayer()
    this.createLayer(newData, newBoundary, newOptions)
  }

  /**
   * 移除插值图层
   */
  private removeLayer(): void {
    if (this.currentLayer) {
      this.map.removeLayer(this.currentLayer)
      this.currentLayer = null
    }
    if (this.currentPointLayer) {
      this.map.removeLayer(this.currentPointLayer)
      this.currentPointLayer = null
    }
  }

  /**
   * 合并配置选项
   */
  private mergeOptions(options: KrigingOptions): Required<KrigingOptions> {
    return {
      gridSize: options.gridSize ?? 200,
      canvasSize: options.canvasSize ?? 1000,
      totalSegments: options.totalSegments ?? 1000,
      colors: options.colors ?? ColorUtils.getDefaultColors(),
      opacity: options.opacity ?? 0.8,
      zIndex: options.zIndex ?? 1,
      modelType: options.modelType ?? "gaussian",
      useRealDataRange: options.useRealDataRange ?? true,
      virtualPointRatio: options.virtualPointRatio ?? 0.8,
      showPoint: options.showPoint ?? false,
      sample: options.sample ?? false,
      sampleGridCount: options.sampleGridCount ?? 12,
      srid: options.srid ?? "EPSG:4326",
      variogramParams: {
        nugget: options.variogramParams?.nugget ?? 0,
        range: options.variogramParams?.range ?? 1000,
        sill: options.variogramParams?.sill ?? 1000
      }
    }
  }

  /**
   * 验证输入数据
   */
  private validateInput(inputData: KrigingDataPoint[], boundary: number[][]): void {
    if (!inputData || inputData.length === 0) {
      throw new Error("输入数据不能为空")
    }

    if (!boundary || boundary.length < 3) {
      throw new Error("边界多边形至少需要3个顶点")
    }

    // 验证数据点格式
    for (const point of inputData) {
      if (typeof point.lon !== "number" || typeof point.lat !== "number" || typeof point.value !== "number") {
        throw new Error("数据点格式错误：经纬度和数值必须为数字类型")
      }
    }
  }

  /**
   * 处理数据点（添加虚拟点等）
   */
  private processDataPoints(
    inputData: KrigingDataPoint[],
    extent: GeoExtent,
    config: Required<KrigingOptions>
  ): KrigingDataPoint[] {
    const data = [...inputData]

    // 如果数据点少于两个，添加虚拟数据点
    if (data.length <= 2) {
      // 计算真实数据的平均值，用于虚拟点
      const realValues = inputData.map((d) => d.value)
      const avgValue = realValues.length > 0 ? realValues.reduce((sum, val) => sum + val, 0) / realValues.length : 0

      const virtualPoints: KrigingDataPoint[] = [
        { name: "虚拟点1", lon: extent.minLon, lat: extent.minLat, value: avgValue * config.virtualPointRatio },
        { name: "虚拟点2", lon: extent.maxLon, lat: extent.maxLat, value: avgValue * config.virtualPointRatio },
        { name: "虚拟点3", lon: extent.minLon, lat: extent.maxLat, value: avgValue * config.virtualPointRatio },
        { name: "虚拟点4", lon: extent.maxLon, lat: extent.minLat, value: avgValue * config.virtualPointRatio }
      ]
      data.push(...virtualPoints)
    }

    return data
  }

  /**
   * 计算统计信息
   */
  private calculateStats(data: KrigingDataPoint[], config: Required<KrigingOptions>): void {
    const values = data.map((d) => d.value)

    // 分离真实数据和虚拟数据
    const realData = data.filter((d) => !d.name.startsWith("虚拟点"))

    if (config.useRealDataRange && realData.length > 0) {
      // 使用真实数据范围
      const realValues = realData.map((d) => d.value)
      this.stats = {
        minValue: Math.min(...realValues),
        maxValue: Math.max(...realValues),
        meanValue: realValues.reduce((sum, val) => sum + val, 0) / realValues.length,
        dataPoints: realData.length
      }
    } else {
      // 使用所有数据范围
      this.stats = {
        minValue: Math.min(...values),
        maxValue: Math.max(...values),
        meanValue: values.reduce((sum, val) => sum + val, 0) / values.length,
        dataPoints: data.length
      }
    }
  }

  /**
   * 训练克里金模型
   */
  private trainKrigingModel(data: KrigingDataPoint[], config: Required<KrigingOptions>): any {
    const lons = data.map((d) => d.lon)
    const lats = data.map((d) => d.lat)
    const values = data.map((d) => d.value)

    return kriging.train(
      values,
      lons,
      lats,
      config.modelType,
      config.variogramParams.nugget ?? 0,
      config.variogramParams.range ?? 1000
    )
  }

  /**
   * 创建插值图层
   */
  private createInterpolationLayer(
    _data: KrigingDataPoint[],
    boundary: number[][],
    extent: GeoExtent,
    variogram: any,
    config: Required<KrigingOptions>
  ): ImageLayer<Static> {
    // 创建Canvas
    const canvas = document.createElement("canvas")
    canvas.width = config.canvasSize
    canvas.height = config.canvasSize
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("无法创建Canvas上下文")
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 计算步长
    const lonStep = (extent.maxLon - extent.minLon) / config.gridSize
    const latStep = (extent.maxLat - extent.minLat) / config.gridSize

    // 绘制插值结果
    for (let i = 0; i < config.gridSize; i++) {
      for (let j = 0; j < config.gridSize; j++) {
        const lon = extent.minLon + i * lonStep
        const lat = extent.minLat + j * latStep

        // 仅在点在多边形内部时进行插值计算
        if (GeometryUtils.isPointInPolygon([lon, lat], boundary)) {
          const value = kriging.predict(lon, lat, variogram)

          const x = (i / config.gridSize) * canvas.width
          const y = canvas.height - (j / config.gridSize) * canvas.height
          const width = canvas.width / config.gridSize
          const height = canvas.height / config.gridSize

          ctx.fillStyle = ColorUtils.interpolateColors(
            value,
            this.stats.minValue,
            this.stats.maxValue,
            config.colors,
            config.totalSegments,
            config.opacity
          )
          ctx.fillRect(x, y - height, width, height)
        }
      }
    }

    // 创建静态图层
    return new ImageLayer({
      zIndex: config.zIndex,
      source: new Static({
        url: canvas.toDataURL(),
        imageExtent: [extent.minLon, extent.minLat, extent.maxLon, extent.maxLat],
        projection: config.srid
      })
    })
  }

  /**
   * 创建点位图层
   * @param inputData 输入的监测点数据数组
   * @param config 配置选项
   * @returns 点位图层
   */
  private createPointLayer(inputData: KrigingDataPoint[], config: Required<KrigingOptions>): VectorLayer<VectorSource> {
    const features = inputData.map((point) => {
      const feature = new Feature({
        geometry: new Point([point.lon, point.lat]),
        name: point.name,
        value: point.value
      })

      feature.setStyle(
        new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({
              color: "#1abc9c"
            }),
            stroke: new Stroke({
              color: "#000",
              width: 2
            })
          }),
          text: new Text({
            text: String(point.value),
            font: "12px sans-serif",
            fill: new Fill({
              color: "#000"
            }),
            stroke: new Stroke({
              color: "#fff",
              width: 3
            }),
            offsetY: -15
          })
        })
      )

      return feature
    })
    return new VectorLayer({
      zIndex: config.zIndex + 1,
      source: new VectorSource({
        features
      })
    })
  }
}

/**
 * 创建克里金插值图层 (兼容旧版本API)
 * @param map OpenLayers地图实例
 * @param inputData 输入的监测点数据数组
 * @param boundary 研究区域边界多边形坐标数组
 * @param options 插值配置选项
 * @returns 克里金插值结果
 */
export function createKrigingLayer(
  map: Map,
  inputData: KrigingDataPoint[],
  boundary: number[][],
  options: KrigingOptions = {}
): KrigingResult {
  const interpolator = new KrigingInterpolator(map)
  return interpolator.createLayer(inputData, boundary, options)
}

/**
 * 创建克里金插值器实例
 * @param map OpenLayers地图实例
 * @returns 克里金插值器实例
 */
export function createKrigingInterpolator(map: Map): KrigingInterpolator {
  return new KrigingInterpolator(map)
}

/**
 * 测试数据和示例
 */
export class KrigingTestData {
  /**
   * 生成随机测试数据
   * @param count 数据点数量
   * @param extent 数据范围
   * @returns 随机测试数据
   */
  static generateRandomData(count: number, extent: GeoExtent): KrigingDataPoint[] {
    const data: KrigingDataPoint[] = []

    for (let i = 0; i < count; i++) {
      const lon = extent.minLon + Math.random() * (extent.maxLon - extent.minLon)
      const lat = extent.minLat + Math.random() * (extent.maxLat - extent.minLat)
      const value = Math.random() * 100 // 0-100的随机值

      data.push({
        name: `测试点${i + 1}`,
        lon,
        lat,
        value
      })
    }

    return data
  }

  /**
   * 生成网格测试数据
   * @param rows 行数
   * @param cols 列数
   * @param extent 数据范围
   * @returns 网格测试数据
   */
  static generateGridData(rows: number, cols: number, extent: GeoExtent): KrigingDataPoint[] {
    const data: KrigingDataPoint[] = []

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const lon = extent.minLon + (j / (cols - 1)) * (extent.maxLon - extent.minLon)
        const lat = extent.minLat + (i / (rows - 1)) * (extent.maxLat - extent.minLat)
        const value = Math.sin((lon * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * 50 + 50

        data.push({
          name: `网格点${i}-${j}`,
          lon,
          lat,
          value
        })
      }
    }

    return data
  }

  /**
   * 生成圆形边界
   * @param center 圆心坐标
   * @param radius 半径（度）
   * @param points 边界点数
   * @returns 圆形边界坐标
   */
  static generateCircleBoundary(center: [number, number], radius: number, points: number = 32): number[][] {
    const boundary: number[][] = []

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI
      const lon = center[0] + radius * Math.cos(angle)
      const lat = center[1] + radius * Math.sin(angle)
      boundary.push([lon, lat])
    }

    return boundary
  }

  /**
   * 生成矩形边界
   * @param extent 矩形范围
   * @returns 矩形边界坐标
   */
  static generateRectangleBoundary(extent: GeoExtent): number[][] {
    return [
      [extent.minLon, extent.minLat],
      [extent.maxLon, extent.minLat],
      [extent.maxLon, extent.maxLat],
      [extent.minLon, extent.maxLat]
    ]
  }

  /**
   * 获取示例数据
   * @returns 示例数据对象
   */
  static getExampleData(): {
    data: KrigingDataPoint[]
    boundary: number[][]
    extent: GeoExtent
  } {
    const extent: GeoExtent = {
      minLon: 116.0,
      maxLon: 117.0,
      minLat: 39.0,
      maxLat: 40.0
    }

    const data = this.generateRandomData(20, extent)
    const boundary = this.generateRectangleBoundary(extent)

    return { data, boundary, extent }
  }
}

/**
 * 使用示例
 */
export class KrigingExamples {
  /**
   * 基本使用示例
   */
  static basicExample(map: Map): KrigingResult {
    const { data, boundary } = KrigingTestData.getExampleData()

    return createKrigingLayer(map, data, boundary)
  }

  /**
   * 自定义配置示例
   */
  static customConfigExample(map: Map): KrigingResult {
    const { data, boundary } = KrigingTestData.getExampleData()

    const options: KrigingOptions = {
      gridSize: 150,
      canvasSize: 800,
      colors: ["#FF0000", "#FFFF00", "#00FF00"],
      opacity: 0.6,
      zIndex: 2,
      modelType: "exponential"
    }

    return createKrigingLayer(map, data, boundary, options)
  }

  /**
   * 高级使用示例
   */
  static advancedExample(map: Map): KrigingInterpolator {
    const interpolator = createKrigingInterpolator(map)

    // 创建初始图层
    const { data, boundary } = KrigingTestData.getExampleData()
    const result = interpolator.createLayer(data, boundary)

    // 获取统计信息
    const stats = result.getStats()
    console.log("插值统计信息:", stats)

    return interpolator
  }
}

// 导出类型和接口
export type { KrigingDataPoint, KrigingOptions, KrigingResult, GeoExtent, RGBColor }
