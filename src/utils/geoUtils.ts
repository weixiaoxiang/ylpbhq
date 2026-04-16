import { Map, View } from "ol"
import { GeoJSON, WKT } from "ol/format"
import { Vector as VectorLayer } from "ol/layer"
import { Vector as VectorSource } from "ol/source"
import { Fill, Stroke, Style } from "ol/style"

// 缓存容器，避免重复创建和销毁DOM元素
let cachedContainer: HTMLDivElement | null = null

/**
 * 获取或创建缓存容器
 */
function getContainer(width: number, height: number, backgroundColor: string): HTMLDivElement {
  if (!cachedContainer) {
    cachedContainer = document.createElement("div")
    cachedContainer.style.position = "absolute"
    cachedContainer.style.left = "-9999px"
    document.body.appendChild(cachedContainer)
  }

  cachedContainer.style.width = `${width}px`
  cachedContainer.style.height = `${height}px`
  cachedContainer.style.backgroundColor = backgroundColor

  return cachedContainer
}

/**
 * 清理缓存容器
 */
function clearContainer() {
  if (cachedContainer) {
    document.body.removeChild(cachedContainer)
    cachedContainer = null
  }
}

/**
 * 创建样式对象
 */
function createStyle(options: { geometryColor?: string; strokeColor?: string; strokeWidth?: number }): Style {
  const { geometryColor = "green", strokeColor = "darkgreen", strokeWidth = 1 } = options

  return new Style({
    fill: new Fill({
      color: geometryColor
    }),
    stroke: new Stroke({
      color: strokeColor,
      width: strokeWidth
    })
  })
}

/**
 * 将WKT地理数据转换为base64图片
 * @param wkt WKT格式的地理数据字符串
 * @param options 配置选项
 * @returns Promise<string> 返回base64图片数据
 */
export function wktToBase64Image(
  wkt: string,
  options: {
    width?: number
    height?: number
    backgroundColor?: string
    geometryColor?: string
    strokeColor?: string
    strokeWidth?: number
    padding?: number
    pixelRatio?: number
    resolution?: number
  } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 默认配置
      const {
        width = 200,
        height = 200,
        backgroundColor = "white",
        geometryColor = "green",
        strokeColor = "darkgreen",
        strokeWidth = 1,
        padding = 5,
        pixelRatio = window.devicePixelRatio || 1,
        resolution = 2 // 默认使用2倍分辨率
      } = options

      // 获取缓存容器
      const container = getContainer(width, height, backgroundColor)

      // 解析WKT数据
      const wktFormat = new WKT()
      const features = wktFormat.readFeatures(wkt)

      // 创建矢量源
      const source = new VectorSource({
        features
      })

      // 创建样式
      const style = createStyle({
        geometryColor,
        strokeColor,
        strokeWidth
      })

      // 创建矢量图层
      const vectorLayer = new VectorLayer({
        source,
        style: () => {
          return style
        }
      })

      // 创建地图
      let map: Map | null = new Map({
        target: container,
        layers: [vectorLayer],
        view: new View({
          center: [0, 0],
          zoom: 2,
          projection: "EPSG:4326"
        }),
        pixelRatio: pixelRatio
      })

      // 调整视图以适应要素范围，并尽可能放大
      const extent = source.getExtent()
      map.getView().fit(extent, {
        padding: [padding, padding, padding, padding],
        maxZoom: 18,
        duration: 0
      })

      // 等待地图渲染完成
      map.once("rendercomplete", () => {
        // 创建canvas，使用更高的分辨率
        const canvas = document.createElement("canvas")
        // 设置canvas的CSS尺寸
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        // 设置canvas的实际尺寸（分辨率）
        canvas.width = width * resolution
        canvas.height = height * resolution
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("无法创建canvas上下文"))
          return
        }

        // 设置背景色
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 将地图渲染到canvas
        const mapCanvas = map?.getTargetElement().querySelector("canvas")
        if (mapCanvas) {
          // 使用高质量缩放
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(mapCanvas, 0, 0, canvas.width, canvas.height)
        }

        // 转换为base64
        const base64 = canvas.toDataURL("image/png")

        // 清理地图，但不移除容器
        map?.setTarget(undefined)
        map = null

        resolve(base64)
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 将GeoJSON地理数据转换为base64图片
 * @param geoJson GeoJSON格式的地理数据
 * @param options 配置选项
 * @returns Promise<string> 返回base64图片数据
 */
export function geoJsonToBase64Image(
  geoJson: any,
  options: {
    width?: number
    height?: number
    backgroundColor?: string
    geometryColor?: string
    strokeColor?: string
    strokeWidth?: number
    padding?: number
    pixelRatio?: number
    resolution?: number
  } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 默认配置
      const {
        width = 200,
        height = 200,
        backgroundColor = "white",
        geometryColor = "green",
        strokeColor = "darkgreen",
        strokeWidth = 1,
        padding = 5,
        pixelRatio = window.devicePixelRatio || 1,
        resolution = 2 // 默认使用2倍分辨率
      } = options

      // 获取缓存容器
      const container = getContainer(width, height, backgroundColor)

      // 创建矢量源
      const source = new VectorSource({
        features: new GeoJSON().readFeatures(geoJson)
      })

      // 创建样式
      const style = createStyle({
        geometryColor,
        strokeColor,
        strokeWidth
      })

      // 创建矢量图层
      const vectorLayer = new VectorLayer({
        source,
        style: () => style
      })

      // 创建地图
      let map: Map | null = new Map({
        target: container,
        layers: [vectorLayer],
        view: new View({
          center: [0, 0],
          zoom: 2,
          projection: "EPSG:4326"
        }),
        pixelRatio: pixelRatio
      })

      // 调整视图以适应要素范围，并尽可能放大
      const extent = source.getExtent()
      map.getView().fit(extent, {
        padding: [padding, padding, padding, padding],
        maxZoom: 18,
        duration: 0
      })

      // 等待地图渲染完成
      map.once("rendercomplete", () => {
        // 创建canvas，使用更高的分辨率
        const canvas = document.createElement("canvas")
        // 设置canvas的CSS尺寸
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        // 设置canvas的实际尺寸（分辨率）
        canvas.width = width * resolution
        canvas.height = height * resolution
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("无法创建canvas上下文"))
          return
        }

        // 设置背景色
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 将地图渲染到canvas
        const mapCanvas = map?.getTargetElement().querySelector("canvas")
        if (mapCanvas) {
          // 使用高质量缩放
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(mapCanvas, 0, 0, canvas.width, canvas.height)
        }

        // 转换为base64
        const base64 = canvas.toDataURL("image/png")

        // 清理地图，但不移除容器
        map?.setTarget(undefined)
        map = null

        resolve(base64)
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 批量处理地理数据并生成图片
 * @param data 地理数据数组
 * @param options 配置选项
 * @returns Promise<string[]> 返回base64图片数据数组
 */
export async function batchProcessGeoData(
  data: Array<{ wkt?: string; geoJson?: any }>,
  options: {
    width?: number
    height?: number
    backgroundColor?: string
    geometryColor?: string
    strokeColor?: string
    strokeWidth?: number
    padding?: number
    pixelRatio?: number
    resolution?: number
  } = {}
): Promise<string[]> {
  try {
    const results: string[] = []

    for (const item of data) {
      let base64: string

      if (item.wkt) {
        base64 = await wktToBase64Image(item.wkt, options)
      } else if (item.geoJson) {
        base64 = await geoJsonToBase64Image(item.geoJson, options)
      } else {
        throw new Error("数据必须包含wkt或geoJson属性")
      }

      results.push(base64)
    }

    // 处理完成后清理容器
    clearContainer()

    return results
  } catch (error) {
    // 发生错误时也要清理容器
    clearContainer()
    throw error
  }
}
