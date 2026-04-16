import { buffer } from "@turf/turf"
import { Feature, Overlay, Collection } from "ol"
import { GeoJSON } from "ol/format"
import { MultiPolygon, Polygon, MultiLineString, MultiPoint } from "ol/geom"
import { Draw, Select, Modify, Snap, Translate } from "ol/interaction"
import { createBox } from "ol/interaction/Draw"
import { Vector as VectorLayer } from "ol/layer"
import { Vector as VectorSource } from "ol/source"
import { Fill, Icon, Stroke, Style } from "ol/style"
import { unByKey } from "ol/Observable"
import { getArea, getLength } from "ol/sphere"
// 默认点图标
const pointIcon =
  "data:image/png;base64,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"

/**
 * OpenLayers图形绘制工具类
 * 测试环境下依赖@turf/turf@7.1.0、ol@10.1.0、ol-ext@4.0.23
 * 作者：魏晓翔
 * 支持点、线、面、圆等图形的绘制,并提供缓冲区分析功能
 * 支持多要素绘制
 * 支持设置清除选项、单次绘制选项、选择、修改、平移、提示框、要素样式、绘制过程中的临时样式、选择要素样式
 * 支持设置绘制过程中的回调函数，如开始绘制、结束绘制、选择要素、修改要素、平移要素等
 * 提供计算面积、长度等静态方法
 * 基本使用:
 * ```js
 * // 1. 初始化绘制工具
 * const drawTool = new DrawOLShape(map, {
 *   title: '绘制图层',
 *   style: {
 *     strokeColor: '#ff0000',
 *     fillColor: 'rgba(255,0,0,0.3)'
 *   }
 * });
 *
 * // 2. 绘制点
 * drawTool.drawPoint({
 *   buffer: 1000, // 缓冲区半径(米)
 *   start: () => {
 *     console.log('开始绘制点');
 *   },
 *   end: (feature) => {
 *     console.log('绘制点完成', feature);
 *   }
 * });
 *
 * // 3. 绘制线
 * drawTool.drawLine({
 *   buffer: 500,
 *   end: (feature) => {
 *     // 获取线的坐标
 *     const coords = feature.getGeometry().getCoordinates();
 *     console.log('线坐标:', coords);
 *   }
 * });
 *
 * // 4. 绘制面
 * drawTool.drawPolygon({
 *   end: (feature) => {
 *     // 获取面积
 *     const area = feature.getGeometry().getArea();
 *     console.log('面积:', area);
 *   }
 * });
 *
 * // 5. 停止绘制,移除相关事件
 * drawTool.deactivate();
 *
 * // 6. 清除绘制内容
 * drawTool.clearDrawData();
 *
 * // 7. 销毁实例,清理资源
 * drawTool.destroy();
 * drawTool = null
 * ```
 * 方法说明:
 * - drawPoint(options): 绘制点
 * - drawLine(options): 绘制线
 * - drawPolygon(options): 绘制面
 * - 其他等等
 * - deactivate(): 停止绘制
 * - destroy(): 销毁实例
 * - clearDrawData(): 清除绘制内容
 * - clearInteractions(): 清除交互
 * - clearTooltip(): 清除提示框
 * - initInteractions(): 初始化交互
 * - setSelect(): 设置选择
 * - setModify(): 设置修改
 * - setTranslate(): 设置平移
 * - removeLastPoint(): 撤销绘制过程中的最后一个点
 * - getLayer(): 获取绘制图层
 * - calculateLength(): 计算线的长度
 * - calculateArea(): 计算面的面积
 *
 */
export class DrawOLShape {
  /**
   * 构造函数
   * @param {Object} map - OpenLayers地图实例
   * @param {Object} options - 配置项
   * @param {string} options.title - 图层标题
   * @param {number} options.zIndex - 图层层级,默认10
   * @param {Object} options.style - 要素样式
   * @param {string} options.style.pointIcon - 点图标URL
   * @param {number} options.style.iconScale - 图标缩放比例,默认1
   * @param {Array} options.style.iconAnchor - 图标锚点,默认[0.5, 1]
   * @param {number} options.style.strokeWidth - 线宽,默认2
   * @param {string} options.style.strokeColor - 线颜色,默认#409EFF
   * @param {string} options.style.fillColor - 填充颜色,默认rgba(64,158,255,0.3)
   * @param {Array} options.style.lineDash - 虚线样式,默认null
   * @param {Object} options.drawStyle - 绘制过程中的临时样式,配置同options.style
   * @param {string} options.drawStyle.pointIcon - 点图标URL
   * @param {number} options.drawStyle.iconScale - 图标缩放比例,默认1.1
   * @param {Array} options.drawStyle.iconAnchor - 图标锚点,默认[0.5, 1]
   * @param {number} options.drawStyle.strokeWidth - 线宽,默认2
   * @param {string} options.drawStyle.strokeColor - 线颜色,默认#409EFF
   * @param {string} options.drawStyle.fillColor - 填充颜色,默认rgba(64,158,255,0.3)
   * @param {Array} options.drawStyle.lineDash - 虚线样式,默认null
   * @param {Object} options.selectStyle - 选择要素样式,配置同options.style
   * @param {string} options.selectStyle.pointIcon - 点图标URL
   * @param {number} options.selectStyle.iconScale - 图标缩放比例,默认1.2
   * @param {Array} options.selectStyle.iconAnchor - 图标锚点,默认[0.5, 1]
   * @param {number} options.selectStyle.strokeWidth - 线宽,默认3
   * @param {string} options.selectStyle.strokeColor - 线颜色,默认#409EFF
   * @param {string} options.selectStyle.fillColor - 填充颜色,默认rgba(64,158,255,0.3)
   * @param {Array} options.selectStyle.lineDash - 虚线样式,默认null
   * @param {Object} options.tooltip - 提示文本，默认启用。优先使用drawOptions.tooltipContent的值
   * @param {string} options.tooltip.point - 点绘制提示
   * @param {string} options.tooltip.linestring - 线绘制提示
   * @param {string} options.tooltip.polygon - 面绘制提示
   * @param {string} options.tooltip.circle - 圆绘制提示
   * @param {string} options.tooltip.rect - 矩形绘制提示
   * @param {string} options.tooltip.square - 正方形绘制提示
   * @param {string} options.tooltip.triangle - 三角形绘制提示
   * @param {string} options.tooltip.hexagon - 六边形绘制提示
   * @param {string} options.tooltip.star - 五角星绘制提示
   * @param {string} options.tooltip.multipolygon - 多边形绘制提示
   * @param {string} options.tooltip.multilinestring - 多线段绘制提示
   * @param {string} options.tooltip.multipoint - 多点绘制提示
   * @param {boolean} options.select - 是否启用选择功能,默认false
   * @param {boolean} options.modify - 是否启用修改功能,默认false
   * @param {boolean} options.translate - 是否启用平移功能,默认false
   * @param {boolean} options.clearable - 是否清除上一次绘制,默认true
   * @param {boolean} options.single - 是否单次绘制,默认false，对于多要素绘制，该参数无效
   */
  constructor(map, options = {}) {
    this.map = map

    this.options = {
      // 图层标题
      title: options.title || "绘制图层",
      // 图层层级
      zIndex: options.zIndex || 10,
      // 要素样式
      style: {
        pointIcon: options.style?.pointIcon || pointIcon,
        iconScale: options.style?.iconScale || 1,
        iconAnchor: options.style?.iconAnchor || [0.5, 1],
        strokeWidth: options.style?.strokeWidth || 2,
        strokeColor: options.style?.strokeColor || "rgba(64, 158, 255,1)",
        fillColor: options.style?.fillColor || "rgba(64, 158, 255, 0.3)",
        lineDash: options.style?.lineDash || null
      },
      // 绘制过程中的临时样式
      drawStyle: {
        pointIcon: options.drawStyle?.pointIcon || pointIcon,
        iconScale: options.drawStyle?.iconScale || 1.1,
        iconAnchor: options.drawStyle?.iconAnchor || [0.5, 1],
        strokeWidth: options.drawStyle?.strokeWidth || 2,
        strokeColor: options.drawStyle?.strokeColor || "rgba(142, 68, 173,1)",
        fillColor: options.drawStyle?.fillColor || "rgba(142, 68, 173, 0.3)",
        lineDash: options.drawStyle?.lineDash || null
      },
      // 选择要素样式
      selectStyle: {
        pointIcon: options.selectStyle?.pointIcon || pointIcon,
        iconScale: options.selectStyle?.iconScale || 1.2,
        iconAnchor: options.selectStyle?.iconAnchor || [0.5, 1],
        strokeWidth: options.selectStyle?.strokeWidth || 3,
        strokeColor: options.selectStyle?.strokeColor || "rgba(255, 77, 79, 1)",
        fillColor: options.selectStyle?.fillColor || "rgba(255, 77, 79, 0.3)",
        lineDash: options.selectStyle?.lineDash || null
      },
      // 是否启用修改功能
      modify: options.modify ?? false,
      // 是否启用选择功能
      select: options.select ?? false,
      // 是否启用平移功能
      translate: options.translate ?? false,
      // 是否启用提示框
      tooltip:
        options.tooltip === false
          ? false
          : {
            point: options.tooltip?.point || "单击完成点标注",
            linestring: options.tooltip?.line || "单击确定起点，双击结束绘制",
            polygon: options.tooltip?.polygon || "单击确定起点，双击结束绘制",
            circle: options.tooltip?.circle || "单击确定圆心，移动鼠标确定半径，再次单击结束绘制",
            rect: options.tooltip?.rect || "单击确定起点，移动鼠标确定矩形，再次单击结束绘制",
            square: options.tooltip?.square || "单击确定中心，移动鼠标确定大小，再次单击结束绘制",
            triangle: options.tooltip?.triangle || "单击确定中心，移动鼠标确定大小，再次单击结束绘制",
            hexagon: options.tooltip?.hexagon || "单击确定中心，移动鼠标确定大小，再次单击结束绘制",
            star: options.tooltip?.star || "单击确定中心，移动鼠标确定大小，再次单击结束绘制",
            multipolygon:
              options.tooltip?.multipolygon || "单击确定起点，双击结束当前多边形绘制，按 ESC 完成整体绘制",
            multilinestring:
              options.tooltip?.multilinestring || "单击确定起点，双击结束当前线段绘制，按 ESC 完成整体绘制",
            multipoint: options.tooltip?.multipoint || "单击添加点，按 ESC 完成整体绘制"
          },
      // 是否清除上一次绘制
      clearable: options.clearable ?? true,
      // 是否单次绘制，默认false，对于多要素绘制，该参数无效
      single: options.single ?? false
    }
    // 创建矢量图层
    this.vectorSource = new VectorSource()
    this.vectorLayer = this.createVectorLayer()
    this.map.addLayer(this.vectorLayer)

    // 记录当前的绘制工具
    this.draw = null
    this.isDrawing = false // 是否正在绘制
    this.isActive = false // 是否激活

    this.select = null // 选择工具
    this.modify = null // 修改工具
    this.snap = null // 捕捉工具,跟随modify默认开启
    this.translate = null // 平移工具
    this.selectListener = null // 选择事件
    this.modifyStartListener = null // 开始修改事件
    this.modifyEndListener = null // 结束修改事件
    this.translateStartListener = null // 开始平移事件
    this.translateEndListener = null // 结束平移事件
    this.translatingListener = null // 平移中事件

    this.handleKeyDown = this.handleKeyDown.bind(this) // 绑定键盘事件
    this.escKeyListener = null // ESC键监听

    this.tooltip = null // 提示框
    this.tooltipElement = null // 提示框元素
    this.mouseOutHandler = null // 鼠标移出事件
    this.mouseEnterHandler = null // 鼠标移入事件
    this.pointerMoveHandler = null // 鼠标移动事件
    if (this.options.tooltip !== false) {
      this.initTooltip()
    }

    // 添加 MultiPolygon 相关属性
    this.multiPolygonFeatures = []
    this.drawingMultiPolygon = false
    // 添加 MultiLineString 相关属性
    this.multiLineStringFeatures = []
    this.drawingMultiLineString = false
    // 添加 MultiPoint 相关属性
    this.multiPointFeatures = []
    this.drawingMultiPoint = false
  }
  /**
   * 创建矢量图层
   * @returns {VectorLayer} 矢量图层
   */
  createVectorLayer() {
    return new VectorLayer({
      zIndex: this.options.zIndex,
      source: this.vectorSource,
      style: (feature) => {
        const geometry = feature.getGeometry()
        if (!geometry) return

        const customStyle = feature.getStyle()
        if (customStyle) return customStyle

        const style = new Style()
        // 根据几何类型设置样式
        if (geometry.getType() === "Point" || geometry.getType() === "MultiPoint") {
          style.setImage(
            new Icon({
              src: this.options.style.pointIcon,
              scale: this.options.style.iconScale,
              anchor: this.options.style.iconAnchor
            })
          )
        } else {
          style.setStroke(
            new Stroke({
              color: this.options.style.strokeColor,
              width: this.options.style.strokeWidth,
              lineDash: this.options.style.lineDash
            })
          )
          style.setFill(
            new Fill({
              color: this.options.style.fillColor
            })
          )
        }

        return style
      }
    })
  }
  /**
   * 创建绘制样式
   * @param {string} type - 几何类型
   * @returns {Style} 绘制样式，默认样式为绘制过程中的样式drawStyle
   */
  createDrawStyle(type) {
    const style = new Style()

    if (type === "Point") {
      style.setImage(
        new Icon({
          src: this.options.drawStyle.pointIcon,
          scale: this.options.drawStyle.iconScale,
          anchor: this.options.drawStyle.iconAnchor
        })
      )
    } else {
      style.setStroke(
        new Stroke({
          color: this.options.drawStyle.strokeColor,
          width: this.options.drawStyle.strokeWidth,
          lineDash: this.options.drawStyle.lineDash
        })
      )
      style.setFill(
        new Fill({
          color: this.options.drawStyle.fillColor
        })
      )
    }

    return style
  }

  /**
   * 初始化提示框
   */
  initTooltip() {
    this.tooltipElement = document.createElement("div")
    this.tooltipElement.className = "ol-tooltip custom-ol-tooltip"
    this.tooltipElement.style.cssText = `
      position: relative;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 4px;
      color: white;
      padding: 4px 8px;
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
      display: none;
    `

    this.tooltip = new Overlay({
      element: this.tooltipElement,
      offset: [15, 0],
      positioning: "center-left"
    })

    this.map.addOverlay(this.tooltip)

    this.mouseOutHandler = () => {
      if (this.tooltipElement) {
        this.tooltipElement.style.display = "none"
      }
    }

    this.mouseEnterHandler = () => {
      if (this.isActive && this.tooltipElement) {
        this.tooltipElement.style.display = "block"
      }
    }
    // 添加tooltip鼠标移出和移入地图元素时的事件监听
    const viewport = this.map.getViewport()
    viewport.addEventListener("mouseout", this.mouseOutHandler)
    viewport.addEventListener("mouseenter", this.mouseEnterHandler)
  }

  /**
   * 更新提示框
   * @param {Object} evt - 事件对象
   * @param {string} text - 提示文本
   */
  updateTooltip(evt, text) {
    if (this.tooltip && this.tooltipElement) {
      this.tooltipElement.innerHTML = text
      this.tooltip.setPosition(evt.coordinate)
    }
  }

  /**
   * 创建旋转多边形
   * @param {number} sides - 多边形边数
   * @returns {Function} 多边形绘制函数
   */
  createRotateRegularPolygon(sides) {
    return (coordinates, geometry) => {
      if (coordinates.length < 2) return null

      const center = coordinates[0]
      const last = coordinates[1]

      const dx = last[0] - center[0]
      const dy = last[1] - center[1]
      const radius = Math.sqrt(dx * dx + dy * dy)
      const rotation = Math.atan2(dy, dx)

      const coords = []
      for (let i = 0; i < sides; i++) {
        const angle = (2 * Math.PI * i) / sides + rotation
        coords.push([center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)])
      }
      coords.push(coords[0])

      if (!geometry) {
        geometry = new Polygon([coords])
      } else {
        geometry.setCoordinates([coords])
      }
      return geometry
    }
  }

  /**
   * 初始化绘制
   * @param {string} type - 几何类型,支持Point、LineString、Polygon、Rect、Square、Triangle、Hexagon、Star、Circle、MultiPolygon、MultiLineString、MultiPoint
   * @param {Object} drawOptions - 绘制选项
   * @param {Function} drawOptions.start - 开始绘制回调，返回绘制的要素feature
   * @param {Function} drawOptions.end - 结束绘制回调，返回绘制的要素feature
   * @param {Function} drawOptions.select - 选择回调，返回selected、deselected、selectedFeatures
   * @param {Function} drawOptions.modifystart - 修改开始回调，返回features、event
   * @param {Function} drawOptions.modifyend - 修改结束回调，返回features、event
   * @param {Function} drawOptions.translatestart - 平移开始回调，返回features、event
   * @param {Function} drawOptions.translating - 平移中回调，返回features、coordinate、event
   * @param {Function} drawOptions.translateend - 平移结束回调，返回features、event
   * @param {Function} drawOptions.tooltipContent - 提示内容，优先使用传入的tooltipContent，否则根据type获取默认提示
   * @param {number} drawOptions.buffer - 缓冲区半径(米)
   */
  initDraw(type, drawOptions = {}) {
    // 如果已经存在绘制工具，则先移除
    if (this.draw) {
      this.map.removeInteraction(this.draw)
    }
    // 如果已经存在鼠标移动事件监听，则先移除
    if (this.pointerMoveHandler) {
      this.map.un("pointermove", this.pointerMoveHandler)
    }
    // 定义绘制配置
    const drawConfig = {
      source: this.vectorSource,
      style: () => this.createDrawStyle(type === "Rect" ? "Polygon" : type)
    }
    // 根据type设置绘制配置
    switch (type) {
      case "Rect":
        drawConfig.type = "Circle"
        drawConfig.geometryFunction = createBox()
        break
      case "Square":
        drawConfig.type = "Circle"
        drawConfig.geometryFunction = this.createRotateRegularPolygon(4)
        break
      case "Triangle":
        drawConfig.type = "Circle"
        drawConfig.geometryFunction = this.createRotateRegularPolygon(3)
        break
      case "Hexagon":
        drawConfig.type = "Circle"
        drawConfig.geometryFunction = this.createRotateRegularPolygon(6)
        break
      case "Star":
        drawConfig.type = "Circle"
        drawConfig.geometryFunction = (coordinates, geometry) => {
          if (coordinates.length < 2) return null

          const center = coordinates[0]
          const last = coordinates[1]

          const dx = last[0] - center[0]
          const dy = last[1] - center[1]
          const radius = Math.sqrt(dx * dx + dy * dy)
          const rotation = Math.atan2(dy, dx)
          const innerRadius = radius * 0.382

          const starCoords = []
          for (let i = 0; i < 10; i++) {
            const angle = (Math.PI / 5) * i + rotation
            const r = i % 2 === 0 ? radius : innerRadius
            starCoords.push([center[0] + r * Math.cos(angle), center[1] + r * Math.sin(angle)])
          }
          starCoords.push(starCoords[0])

          if (!geometry) {
            geometry = new Polygon([starCoords])
          } else {
            geometry.setCoordinates([starCoords])
          }
          return geometry
        }
        break
      default:
        drawConfig.type = type
    }
    // 创建绘制工具
    this.draw = new Draw(drawConfig)
    // 激活绘制工具
    this.isActive = true

    // 如果启用了提示框，则添加鼠标移动事件监听
    if (this.options.tooltip !== false) {
      // 优先使用传入的 tooltipContent，否则根据类型获取默认提示
      const tooltipMsg = drawOptions.tooltipContent || this.options.tooltip[type.toLowerCase()]
      // 添加鼠标移动事件监听
      this.pointerMoveHandler = (evt) => {
        // 如果绘制工具激活并且提示框元素存在，则显示提示框，并更新提示内容
        if (this.isActive && this.tooltipElement) {
          this.tooltipElement.style.display = "block"
          this.updateTooltip(evt, tooltipMsg)
        }
      }
      // 添加鼠标移动事件监听
      this.map.on("pointermove", this.pointerMoveHandler)
    }

    // 添加键盘事件监听
    document.addEventListener("keydown", this.handleKeyDown)
    // 添加绘制开始事件监听
    this.draw.on("drawstart", () => {
      // 如果启用了清除功能并且绘制状态为true
      if (this.options.clearable && !this.isDrawing) {
        // 如果当前绘制的是多要素，并且尚未绘制任何点，则清除之前的绘制数据
        if (
          (this.drawingMultiPolygon && this.multiPolygonFeatures.length === 0) ||
          (this.drawingMultiLineString && this.multiLineStringFeatures.length === 0) ||
          (this.drawingMultiPoint && this.multiPointFeatures.length === 0)
        ) {
          this.clearDrawData()
        } else if (!this.drawingMultiPolygon && !this.drawingMultiLineString && !this.drawingMultiPoint) {
          // 如果当前绘制的是单要素，则清除之前的绘制数据
          this.clearDrawData()
        }
      }
      // 设置绘制状态为true
      this.isDrawing = true
      // 调用绘制开始回调
      drawOptions.start?.()
    })

    // 添加绘制结束事件监听
    this.draw.on("drawend", (event) => {
      const feature = event.feature
      // 开启缓冲区分析并且当前不是多要素绘制(目前暂时不支持多要素的缓冲区分析！！)
      if (drawOptions.buffer && !this.drawingMultiPolygon && !this.drawingMultiLineString && !this.drawingMultiPoint) {
        try {
          // 设置绘制要素的样式
          feature.setStyle(
            new Style({
              stroke: new Stroke({
                color: this.options.style.strokeColor,
                width: this.options.style.strokeWidth,
                lineDash: this.options.style.lineDash
              }),
              fill: new Fill({
                color: "rgba(0,0,0,0)"
              })
            })
          )

          const geojsonFormat = new GeoJSON()
          const geojson = geojsonFormat.writeFeatureObject(feature)
          const buffered = buffer(geojson, drawOptions.buffer, { units: "meters" })
          const bufferedFeature = geojsonFormat.readFeature(buffered)

          bufferedFeature.setStyle(
            new Style({
              stroke: new Stroke({
                color: this.options.style.strokeColor,
                width: this.options.style.strokeWidth,
                lineDash: this.options.style.lineDash
              }),
              fill: new Fill({
                color: this.options.style.fillColor
              })
            })
          )
          bufferedFeature.setProperties({
            featureType: "绘制图层-缓冲区-" + type
          })
          this.vectorSource.addFeature(bufferedFeature)
          drawOptions.end?.(bufferedFeature)
        } catch (error) {
          console.error("缓冲区分析失败:", error)
        }
      } else {
        feature.setStyle(null)
        feature.setProperties({
          featureType: "绘制图层-" + type
        })
        drawOptions.end?.(feature)
      }

      this.isDrawing = false

      // 不是多要素绘制时
      if (!this.drawingMultiPolygon && !this.drawingMultiLineString && !this.drawingMultiPoint) {
        // 如果single为true，则清除绘制工具
        if (this.options.single) {
          this.deactivate()
        }
        // 如果绘制不是多要素绘制，并且不是缓冲区，并且启用了选择或修改或平移功能，则初始化选择和修改和平移功能
        if (!drawOptions.buffer && (this.options.select || this.options.modify || this.options.translate)) {
          // 延迟，避免当前绘制的结果还未添加到图层中，造成initInteractions逻辑错误
          setTimeout(() => {
            this.initInteractions([feature], this.options.select, this.options.modify, this.options.translate, {
              select: drawOptions.select,
              modifystart: drawOptions.modifystart,
              modifyend: drawOptions.modifyend,
              translatestart: drawOptions.translatestart,
              translating: drawOptions.translating,
              translateend: drawOptions.translateend
            }, true)
          }, 100)
        }
      }
    })

    this.map.addInteraction(this.draw)
  }
  /**
   * 初始化选择、修改和平移功能
   * 可以直接使用这个方法直接对已知元素进行修改操作.（点要素时可以仅设置enableTranslate为true）
   * @param {Array<Feature>} features - 要处理的要素数组
   * @param {boolean} enableSelect - 是否启用选择功能，默认false。开启时默认选中所有要素
   * @param {boolean} enableModify - 是否启用修改功能，默认false
   * @param {boolean} enableTranslate - 是否启用平移功能，默认false
   * @param {boolean} isAdd - 是否添加要素到内置的绘画图层，默认true。为false时，不添加要素到内置的绘画图层。
   * @param {Object} callbacks - 回调函数对象
   * @param {Function} callbacks.select - 选择事件回调
   * @param {Function} callbacks.modifystart - 修改开始事件回调
   * @param {Function} callbacks.modifyend - 修改结束事件回调
   * @param {Function} callbacks.translatestart - 平移开始事件回调
   * @param {Function} callbacks.translating - 平移过程事件回调
   * @param {Function} callbacks.translateend - 平移结束事件回调
   */
  initInteractions(features = [], enableSelect = false, enableModify = false, enableTranslate = false, isAdd = true, callbacks = {}) {
    // 清除现有的交互和监听器
    this.clearInteractions()
    // 添加要素到图层
    if (isAdd) {
      features.forEach((feature) => {
        if (!this.vectorSource.hasFeature(feature)) {
          this.vectorSource.addFeature(feature)
        }
      })
    }
    // 选择
    this.setSelect(enableSelect, features, callbacks)
    // 修改
    this.setModify(enableModify, features, callbacks)
    // 平移
    this.setTranslate(enableTranslate, features, callbacks)
  }

  /**
   * 设置选择
   * @param {boolean} enableSelect - 是否启用选择功能，默认false。开启时默认选中所有要素
   * @param {Object} callbacks - 回调函数对象
   * @param {Function} callbacks.select - 选择事件回调
   * @param {Array<Feature>} features - 要处理的要素数组
   */
  setSelect(enableSelect, features, callbacks) {
    if (enableSelect) {
      // 初始化选择交互
      this.select = new Select({
        layers: [this.vectorLayer],
        style: (feature) => {
          const geometry = feature.getGeometry()
          const type = geometry.getType()

          const style = new Style({
            stroke: new Stroke({
              color: this.options.selectStyle.strokeColor,
              width: this.options.selectStyle.strokeWidth,
              lineDash: this.options.selectStyle.lineDash
            }),
            fill: new Fill({
              color: this.options.selectStyle.fillColor
            })
          })

          if (type.includes("Point")) {
            style.setImage(
              new Icon({
                src: this.options.selectStyle.pointIcon,
                scale: this.options.selectStyle.iconScale,
                anchor: this.options.selectStyle.iconAnchor
              })
            )
          }

          return style
        }
      })

      // 添加选择事件监听器
      if (callbacks?.select) {
        this.selectListener = this.select.on("select", (event) => {
          callbacks.select({
            selected: event.selected,
            deselected: event.deselected,
            selectedFeatures: this.select.getFeatures()
          })
        })
      }

      this.map.addInteraction(this.select)

      // 默认选中所有要素
      this.select.getFeatures().extend(features)
    } else {
      if (this.selectListener) {
        unByKey(this.selectListener)
        this.selectListener = null
      }
      if (this.select) {
        this.map.removeInteraction(this.select)
        this.select = null
      }
    }
  }
  /**
   * 设置修改
   * @param {boolean} enableModify - 是否启用修改功能，默认false
   * @param {Object} callbacks - 回调函数对象
   * @param {Function} callbacks.modifystart - 修改开始事件回调
   * @param {Function} callbacks.modifyend - 修改结束事件回调
   * @param {Array<Feature>} features - 要处理的要素数组
   */
  setModify(enableModify, features, callbacks) {
    if (enableModify) {
      // 初始化修改交互
      this.modify = new Modify({
        features: this.select ? this.select.getFeatures() : new Collection(features)
      })

      // 添加修改开始事件监听器
      if (callbacks?.modifystart) {
        this.modifyStartListener = this.modify.on("modifystart", (event) => {
          const features = event.features.getArray()
          callbacks.modifystart({
            features,
            event
          })
        })
      }

      // 添加修改结束事件监听器
      if (callbacks?.modifyend) {
        this.modifyEndListener = this.modify.on("modifyend", (event) => {
          const features = event.features.getArray()
          callbacks.modifyend({
            features,
            event
          })
        })
      }

      this.map.addInteraction(this.modify)

      // 默认添加捕捉功能
      this.snap = new Snap({
        source: this.vectorSource
      })
      this.map.addInteraction(this.snap)
    } else {
      if (this.modifyStartListener) {
        unByKey(this.modifyStartListener)
        this.modifyStartListener = null
      }
      if (this.modifyEndListener) {
        unByKey(this.modifyEndListener)
        this.modifyEndListener = null
      }
      if (this.modify) {
        this.map.removeInteraction(this.modify)
        this.modify = null
      }
      if (this.snap) {
        this.map.removeInteraction(this.snap)
        this.snap = null
      }
    }
  }
  /**
   * 设置平移
   * @param {boolean} enableTranslate - 是否启用平移功能，默认false
   * @param {Object} callbacks - 回调函数对象
   * @param {Function} callbacks.translatestart - 平移开始事件回调
   * @param {Function} callbacks.translating - 平移过程事件回调
   * @param {Function} callbacks.translateend - 平移结束事件回调
   * @param {Array<Feature>} features - 要处理的要素数组
   */
  setTranslate(enableTranslate, features, callbacks) {
    if (enableTranslate) {
      this.translate = new Translate({
        features: this.select ? this.select.getFeatures() : new Collection(features)
      })

      // 添加平移开始事件监听器
      if (callbacks?.translatestart) {
        this.translateStartListener = this.translate.on("translatestart", (event) => {
          callbacks.translatestart({
            features: event.features.getArray(),
            event
          })
        })
      }

      // 添加平移过程事件监听器
      if (callbacks?.translating) {
        this.translatingListener = this.translate.on("translating", (event) => {
          callbacks.translating({
            features: event.features.getArray(),
            coordinate: event.coordinate,
            event
          })
        })
      }
      // 添加平移结束事件监听器
      if (callbacks?.translateend) {
        this.translateEndListener = this.translate.on("translateend", (event) => {
          callbacks.translateend({
            features: event.features.getArray(),
            event
          })
        })
      }

      this.map.addInteraction(this.translate)
    } else {
      if (this.translateStartListener) {
        unByKey(this.translateStartListener)
        this.translateStartListener = null
      }
      if (this.translatingListener) {
        unByKey(this.translatingListener)
        this.translatingListener = null
      }
      if (this.translateEndListener) {
        unByKey(this.translateEndListener)
        this.translateEndListener = null
      }
      if (this.translate) {
        this.map.removeInteraction(this.translate)
        this.translate = null
      }
    }
  }
  /**
   * 撤销绘制过程中的最后一个点
   * @returns {Object} 撤销结果
   * @returns {boolean} returns.success - 是否撤销成功
   * @returns {string} returns.message - 结果信息
   */
  removeLastPoint() {
    try {
      // 检查是否有活动的绘制工具
      if (!this.draw) {
        return {
          success: false,
          message: "当前没有活动的绘制工具"
        }
      }

      // 检查绘制工具是否支持 removeLastPoint
      if (typeof this.draw.removeLastPoint !== "function") {
        return {
          success: false,
          message: "当前绘制工具不支持撤销点"
        }
      }

      // 尝试移除最后一个点
      this.draw.removeLastPoint()

      return {
        success: true,
        message: "撤销成功"
      }
    } catch (error) {
      console.error("移除最后一个点时发生错误:", error)
      return {
        success: false,
        message: `操作失败: ${error.message}`
      }
    }
  }
  /**
   * 处理键盘事件
   * @private
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyDown(event) {
    // 检查是否按下 Z 键（可以根据需要修改快捷键）
    if (event.key === "z" || event.key === "Z") {
      // 如果同时按下了 Ctrl 键，执行撤销上一步
      if (event.ctrlKey) {
        event.preventDefault() // 阻止默认行为
        this.removeLastPoint()
      }
    }
  }
  /**
   * 销毁绘制工具,并移除相关事件监听器
   */
  deactivate() {
    this.isActive = false
    this.isDrawing = false

    // 隐藏tooltip
    if (this.tooltipElement) {
      this.tooltipElement.style.display = "none"
    }

    // 移除鼠标移动事件监听,主要用于提示tooltip
    if (this.pointerMoveHandler) {
      this.map.un("pointermove", this.pointerMoveHandler)
      this.pointerMoveHandler = null
    }

    // 移除键盘事件监听，主要是ctrl+z撤销
    document.removeEventListener("keydown", this.handleKeyDown)

    // 移除ESC键监听
    if (this.escKeyListener) {
      document.removeEventListener("keydown", this.escKeyListener)
      this.escKeyListener = null
    }

    if (this.draw) {
      this.map.removeInteraction(this.draw)
      this.draw = null
    }
  }
  /**
   * 清除绘制数据
   */
  clearDrawData() {
    if (this.vectorSource) {
      this.vectorSource.clear()
    }
  }
  /**
   * 清除多要素临时绘制的要素
   */
  clearTemporaryFeatures() {
    this.vectorSource.getFeatures().forEach((f) => {
      if (f.get("isTemporaryMultiPolygon") || f.get("isTemporaryMultiLineString") || f.get("isTemporaryMultiPoint")) {
        this.vectorSource.removeFeature(f)
      }
    })
  }
  /**
   * 清除tooltip和相关事件监听器
   */
  clearTooltip() {
    // 清除tooltip
    if (this.tooltip) {
      this.map.removeOverlay(this.tooltip)
      this.tooltip = null
    }
    // 清除tooltip元素
    if (this.tooltipElement) {
      if (this.tooltipElement.parentNode) {
        this.tooltipElement.parentNode.removeChild(this.tooltipElement)
      }
      this.tooltipElement = null
    }
    // 清除鼠标移出地图事件监听器
    if (this.mouseOutHandler) {
      this.map.getViewport().removeEventListener("mouseout", this.mouseOutHandler)
      this.mouseOutHandler = null
    }
    // 清除鼠标移入地图事件监听器
    if (this.mouseEnterHandler) {
      this.map.getViewport().removeEventListener("mouseenter", this.mouseEnterHandler)
      this.mouseEnterHandler = null
    }
    // 清除鼠标移动事件监听器
    if (this.pointerMoveHandler) {
      this.map.un("pointermove", this.pointerMoveHandler)
      this.pointerMoveHandler = null
    }
  }
  /**
   * 清除交互和事件监听器
   */
  clearInteractions() {
    // 清除事件监听器
    if (this.selectListener) {
      unByKey(this.selectListener)
      this.selectListener = null
    }
    if (this.modifyStartListener) {
      unByKey(this.modifyStartListener)
      this.modifyStartListener = null
    }
    if (this.modifyEndListener) {
      unByKey(this.modifyEndListener)
      this.modifyEndListener = null
    }
    if (this.translateStartListener) {
      unByKey(this.translateStartListener)
      this.translateStartListener = null
    }
    if (this.translatingListener) {
      unByKey(this.translatingListener)
      this.translatingListener = null
    }
    if (this.translateEndListener) {
      unByKey(this.translateEndListener)
      this.translateEndListener = null
    }

    // 清除交互
    if (this.select) {
      this.map.removeInteraction(this.select)
      this.select = null
    }
    if (this.modify) {
      this.map.removeInteraction(this.modify)
      this.modify = null
    }
    if (this.snap) {
      this.map.removeInteraction(this.snap)
      this.snap = null
    }
    if (this.translate) {
      this.map.removeInteraction(this.translate)
      this.translate = null
    }
  }
  /**
   * 销毁实例，释放所有相关资源
   */
  destroy() {
    this.clearInteractions()
    this.deactivate()
    this.clearTooltip()
    this.clearDrawData()

    if (this.vectorLayer) {
      this.map.removeLayer(this.vectorLayer)
      this.vectorLayer = null
    }

    this.multiPolygonFeatures = []
    this.multiLineStringFeatures = []
    this.multiPointFeatures = []
    this.drawingMultiPolygon = false
    this.drawingMultiLineString = false
    this.drawingMultiPoint = false
    this.map = null
  }
  /**
   * 获取绘制图层
   * @returns {Layer} 绘制图层
   */
  getLayer() {
    return this.vectorLayer
  }
  /**
   * 绘制点
   * @param {Object} options - 绘制选项
   */
  drawPoint(options = {}) {
    this.initDraw("Point", options)
  }
  /**
   * 绘制线
   * @param {Object} options - 绘制选项
   */
  drawLine(options = {}) {
    this.initDraw("LineString", options)
  }
  /**
   * 绘制多边形
   * @param {Object} options - 绘制选项
   */
  drawPolygon(options = {}) {
    this.initDraw("Polygon", options)
  }
  /**
   * 绘制圆
   * @param {Object} options - 绘制选项
   */
  drawCircle(options = {}) {
    this.initDraw("Circle", options)
  }
  /**
   * 绘制矩形
   * @param {Object} options - 绘制选项
   */
  drawRect(options = {}) {
    this.initDraw("Rect", options)
  }
  /**
   * 绘制正方形
   * @param {Object} options - 绘制选项
   */
  drawSquare(options = {}) {
    this.initDraw("Square", options)
  }
  /**
   * 绘制三角形
   * @param {Object} options - 绘制选项
   */
  drawTriangle(options = {}) {
    this.initDraw("Triangle", options)
  }
  /**
   * 绘制六边形
   * @param {Object} options - 绘制选项
   */
  drawHexagon(options = {}) {
    this.initDraw("Hexagon", options)
  }
  /**
   * 绘制星形
   * @param {Object} options - 绘制选项
   */
  drawStar(options = {}) {
    this.initDraw("Star", options)
  }
  /**
   * 绘制多边形
   * @param {Object} options - 绘制选项
   */
  drawMultiPolygon(options = {}) {
    this.drawingMultiPolygon = true
    this.multiPolygonFeatures = []

    const startDrawing = () => {
      this.initDraw(options.type || "Polygon", {
        ...options,
        // 覆盖默认的 tooltip 内容
        tooltipContent: options.tooltipContent || this.options.tooltip.multipolygon,
        start: () => {
          options.start?.()
        },
        end: (feature) => {
          // 保存绘制的多边形
          if (feature.getGeometry()) {
            this.multiPolygonFeatures.push(feature.getGeometry().clone())
            this.updateMultiPolygon()
          }

          // 延迟启动下一次绘制，避免与当前绘制的结束事件冲突
          setTimeout(() => {
            // 非缓冲区时，清除临时绘制的polygon要素
            !options.buffer && this.vectorSource.removeFeature(feature)
            if (this.drawingMultiPolygon) {
              // 确保还在绘制模式
              startDrawing()
            }
          }, 100)
        }
      })
    }

    // 添加 ESC 键监听以结束整体绘制
    this.escKeyListener = (event) => {
      if (event.key === "Escape" && this.drawingMultiPolygon) {
        this.finishMultiPolygon(options)
      }
    }
    document.addEventListener("keydown", this.escKeyListener)

    startDrawing()
  }
  /**
   * 更新多边形显示
   */
  updateMultiPolygon() {
    if (this.multiPolygonFeatures.length === 0) return

    const multiPolygon = new MultiPolygon([])
    multiPolygon.setCoordinates(this.multiPolygonFeatures.map((polygon) => polygon.getCoordinates()))

    const feature = new Feature({
      geometry: multiPolygon
    })

    // 使用style样式来区分临时状态
    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: this.options.style.strokeColor,
          width: this.options.style.strokeWidth,
          lineDash: this.options.style.lineDash
        }),
        fill: new Fill({
          color: this.options.style.fillColor
        })
      })
    )

    // 清除之前的临时MultiPolygon
    this.vectorSource.getFeatures().forEach((f) => {
      if (f.get("isTemporaryMultiPolygon")) {
        this.vectorSource.removeFeature(f)
      }
    })

    feature.set("isTemporaryMultiPolygon", true)
    this.vectorSource.addFeature(feature)
  }
  /**
   * 完成多边形绘制
   * @param {Object} options - 绘制选项
   */
  finishMultiPolygon(options = {}) {
    if (!this.drawingMultiPolygon || this.multiPolygonFeatures.length === 0) return

    this.deactivate() // 结束绘制

    const multiPolygon = new MultiPolygon([])
    multiPolygon.setCoordinates(this.multiPolygonFeatures.map((polygon) => polygon.getCoordinates()))
    // 创建最终要素
    const finalFeature = new Feature({
      geometry: multiPolygon
    })
    // 只在最终完成时执行一次缓冲区分析
    if (options.buffer) {
      try {
        const geojsonFormat = new GeoJSON()
        const geojson = geojsonFormat.writeFeatureObject(finalFeature)
        const buffered = buffer(geojson, options.buffer, { units: "meters" })
        const bufferedFeature = geojsonFormat.readFeature(buffered)
        // 设置样式
        bufferedFeature.setStyle(
          new Style({
            stroke: new Stroke({
              color: this.options.style.strokeColor,
              width: this.options.style.strokeWidth,
              lineDash: this.options.style.lineDash
            }),
            fill: new Fill({
              color: this.options.style.fillColor
            })
          })
        )

        // 清除临时绘制的要素
        this.clearTemporaryFeatures()
        // 设置要素类型
        bufferedFeature.setProperties({
          featureType: "绘制图层-缓冲区-" + bufferedFeature.getGeometry().getType()
        })
        // 添加要素到图层
        this.vectorSource.addFeature(bufferedFeature)
        // 调用结束回调
        options.end?.(bufferedFeature)
      } catch (error) {
        console.error("缓冲区分析失败:", error)
      }
    } else {
      // 非缓冲区时，清除临时绘制的要素
      this.clearTemporaryFeatures()
      // 设置要素类型
      finalFeature.setProperties({
        featureType: "绘制图层-" + finalFeature.getGeometry().getType()
      })
      // 添加要素到图层
      this.vectorSource.addFeature(finalFeature)
      // 调用结束回调
      options.end?.(finalFeature)
    }
    // 清除绘制状态
    this.drawingMultiPolygon = false
    this.multiPolygonFeatures = []
    // 如果非缓冲区且有交互，则初始化交互
    if (!options.buffer && (this.options.select || this.options.modify || this.options.translate)) {
      this.initInteractions([finalFeature], this.options.select, this.options.modify, this.options.translate, {
        select: options.select,
        modifystart: options.modifystart,
        modifyend: options.modifyend,
        translatestart: options.translatestart,
        translating: options.translating,
        translateend: options.translateend
      }, true)
    }
  }
  /**
   * 绘制多线
   * @param {Object} options - 绘制选项
   */
  drawMultiLineString(options = {}) {
    this.drawingMultiLineString = true
    this.multiLineStringFeatures = []

    const startDrawing = () => {
      this.initDraw("LineString", {
        ...options,
        // 覆盖默认的 tooltip 内容
        tooltipContent: options.tooltipContent || this.options.tooltip.multilinestring,
        start: () => {
          options.start?.()
        },
        end: (feature) => {
          if (feature.getGeometry()) {
            this.multiLineStringFeatures.push(feature.getGeometry().clone())
            this.updateMultiLineString()
          }
          // 延迟启动下一次绘制，避免与当前绘制的结束事件冲突
          setTimeout(() => {
            // 非缓冲区时，清除临时绘制的linestring要素
            !options.buffer && this.vectorSource.removeFeature(feature)
            if (this.drawingMultiLineString) {
              startDrawing()
            }
          }, 100)
        }
      })
    }

    this.escKeyListener = (event) => {
      if (event.key === "Escape" && this.drawingMultiLineString) {
        this.finishMultiLineString(options)
      }
    }
    document.addEventListener("keydown", this.escKeyListener)

    startDrawing()
  }

  /**
   * 更新 MultiLineString 显示
   */
  updateMultiLineString() {
    if (this.multiLineStringFeatures.length === 0) return

    const multiLineString = new MultiLineString([])
    multiLineString.setCoordinates(this.multiLineStringFeatures.map((line) => line.getCoordinates()))

    const feature = new Feature({
      geometry: multiLineString
    })

    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: this.options.style.strokeColor,
          width: this.options.style.strokeWidth,
          lineDash: this.options.style.lineDash
        })
      })
    )

    // 清除临时绘制的要素
    this.vectorSource.getFeatures().forEach((f) => {
      if (f.get("isTemporaryMultiLineString")) {
        this.vectorSource.removeFeature(f)
      }
    })
    // 设置要素类型
    feature.set("isTemporaryMultiLineString", true)
    // 添加要素到图层
    this.vectorSource.addFeature(feature)
  }

  /**
   * 完成 MultiLineString 绘制
   * @param {Object} options - 绘制选项
   */
  finishMultiLineString(options = {}) {
    if (!this.drawingMultiLineString || this.multiLineStringFeatures.length === 0) return

    this.deactivate()

    const multiLineString = new MultiLineString([])
    multiLineString.setCoordinates(this.multiLineStringFeatures.map((line) => line.getCoordinates()))
    const finalFeature = new Feature({
      geometry: multiLineString
    })

    if (options.buffer) {
      try {
        const geojsonFormat = new GeoJSON()
        const geojson = geojsonFormat.writeFeatureObject(finalFeature)
        const buffered = buffer(geojson, options.buffer, { units: "meters" })
        const bufferedFeature = geojsonFormat.readFeature(buffered)
        // 设置样式
        bufferedFeature.setStyle(
          new Style({
            stroke: new Stroke({
              color: this.options.style.strokeColor,
              width: this.options.style.strokeWidth,
              lineDash: this.options.style.lineDash
            }),
            fill: new Fill({
              color: this.options.style.fillColor
            })
          })
        )

        // 清除临时绘制的要素
        this.clearTemporaryFeatures()
        // 设置要素类型
        bufferedFeature.setProperties({
          featureType: "绘制图层-缓冲区-" + bufferedFeature.getGeometry().getType()
        })
        // 添加要素到图层
        this.vectorSource.addFeature(bufferedFeature)
        // 调用结束回调
        options.end?.(bufferedFeature)
      } catch (error) {
        console.error("缓冲区分析失败:", error)
      }
    } else {
      this.clearTemporaryFeatures()
      finalFeature.setProperties({
        featureType: "绘制图层-" + finalFeature.getGeometry().getType()
      })
      this.vectorSource.addFeature(finalFeature)
      options.end?.(finalFeature)
    }

    this.drawingMultiLineString = false
    this.multiLineStringFeatures = []

    if (!options.buffer && (this.options.select || this.options.modify || this.options.translate)) {
      this.initInteractions([finalFeature], this.options.select, this.options.modify, this.options.translate, {
        select: options.select,
        modifystart: options.modifystart,
        modifyend: options.modifyend,
        translatestart: options.translatestart,
        translating: options.translating,
        translateend: options.translateend
      }, true)
    }
  }

  /**
   * 绘制多点
   * @param {Object} options - 绘制选项
   */
  drawMultiPoint(options = {}) {
    this.drawingMultiPoint = true
    this.multiPointFeatures = []

    const startDrawing = () => {
      this.initDraw("Point", {
        ...options,
        // 覆盖默认的 tooltip 内容
        tooltipContent: options.tooltipContent || this.options.tooltip.multipoint,
        start: () => {
          options.start?.()
        },
        end: (feature) => {
          if (feature.getGeometry()) {
            this.multiPointFeatures.push(feature.getGeometry().clone())
            this.updateMultiPoint()
          }
          // 延迟启动下一次绘制，避免与当前绘制的结束事件冲突
          setTimeout(() => {
            // 非缓冲区时，清除临时绘制的point要素
            !options.buffer && this.vectorSource.removeFeature(feature)
            if (this.drawingMultiPoint) {
              startDrawing()
            }
          }, 100)
        }
      })
    }

    this.escKeyListener = (event) => {
      if (event.key === "Escape" && this.drawingMultiPoint) {
        this.finishMultiPoint(options)
      }
    }
    document.addEventListener("keydown", this.escKeyListener)

    startDrawing()
  }

  /**
   * 更新 MultiPoint 显示
   */
  updateMultiPoint() {
    if (this.multiPointFeatures.length === 0) return

    const multiPoint = new MultiPoint([])
    multiPoint.setCoordinates(this.multiPointFeatures.map((point) => point.getCoordinates()))

    const feature = new Feature({
      geometry: multiPoint
    })

    // 使用style样式
    feature.setStyle(
      new Style({
        image: new Icon({
          src: this.options.style.pointIcon,
          scale: this.options.style.iconScale * 0.8, // 临时状态稍小一点
          anchor: this.options.style.iconAnchor
        })
      })
    )

    this.vectorSource.getFeatures().forEach((f) => {
      if (f.get("isTemporaryMultiPoint")) {
        this.vectorSource.removeFeature(f)
      }
    })

    feature.set("isTemporaryMultiPoint", true)
    this.vectorSource.addFeature(feature)
  }

  /**
   * 完成 MultiPoint 绘制
   * @param {Object} options - 绘制选项
   */
  finishMultiPoint(options = {}) {
    if (!this.drawingMultiPoint || this.multiPointFeatures.length === 0) return

    this.deactivate()

    const multiPoint = new MultiPoint([])
    multiPoint.setCoordinates(this.multiPointFeatures.map((point) => point.getCoordinates()))

    const finalFeature = new Feature({
      geometry: multiPoint
    })

    if (options.buffer) {
      try {
        const geojsonFormat = new GeoJSON()
        const geojson = geojsonFormat.writeFeatureObject(finalFeature)
        const buffered = buffer(geojson, options.buffer, { units: "meters" })
        const bufferedFeature = geojsonFormat.readFeature(buffered)

        bufferedFeature.setStyle(
          new Style({
            stroke: new Stroke({
              color: this.options.style.strokeColor,
              width: this.options.style.strokeWidth,
              lineDash: this.options.style.lineDash
            }),
            fill: new Fill({
              color: this.options.style.fillColor
            })
          })
        )

        this.clearTemporaryFeatures()
        bufferedFeature.setProperties({
          featureType: "绘制图层-缓冲区-" + bufferedFeature.getGeometry().getType()
        })
        this.vectorSource.addFeature(bufferedFeature)
        options.end?.(bufferedFeature)
      } catch (error) {
        console.error("缓冲区分析失败:", error)
        // 在错误时显示原始点
        this.clearTemporaryFeatures()
        this.vectorSource.addFeature(finalFeature)
        options.end?.(finalFeature)
      }
    } else {
      this.clearTemporaryFeatures()
      finalFeature.setProperties({
        featureType: "绘制图层-" + finalFeature.getGeometry().getType()
      })
      this.vectorSource.addFeature(finalFeature)
      options.end?.(finalFeature)
    }

    this.drawingMultiPoint = false
    this.multiPointFeatures = []

    if (!options.buffer && (this.options.select || this.options.modify || this.options.translate)) {
      this.initInteractions([finalFeature], this.options.select, this.options.modify, this.options.translate, {
        select: options.select,
        modifystart: options.modifystart,
        modifyend: options.modifyend,
        translatestart: options.translatestart,
        translating: options.translating,
        translateend: options.translateend
      }, true)
    }
  }

  /**
   * 计算要素的周长/长度，对传入要素进行周长/长度计算
   * @param {Feature} feature - OpenLayers要素
   * @param {string} unit - 长度单位：'m'(米) | 'km'(公里)
   * @returns {Object} 返回周长/长度计算结果
   * @returns {number} returns.length - 周长/长度值
   * @returns {string} returns.unit - 单位
   * @returns {string} returns.text - 格式化后的文本
   * @static
   */
  static calculateLength(feature, unit = "m", projection = "EPSG:4326") {
    if (!feature) return null
    const geometry = feature.getGeometry()
    if (!geometry) return null

    let length = 0
    const type = geometry.getType()

    try {
      switch (type) {
        case "LineString":
          length = getLength(geometry, {
            projection: projection
          })
          break

        case "MultiLineString":
          // 多线段则累加每段的长度
          length = geometry.getLineStrings().reduce((sum, line) => {
            return (
              sum +
              getLength(line, {
                projection: projection
              })
            )
          }, 0)
          break

        case "Polygon":
          // 面的周长是所有环的长度之和
          const polygonRings = geometry.getLinearRings()
          length = polygonRings.reduce((sum, ring) => {
            return (
              sum +
              getLength(ring, {
                projection: projection
              })
            )
          }, 0)
          break

        case "MultiPolygon":
          // 多面的周长是所有面的周长之和
          const polygons = geometry.getPolygons()
          length = polygons.reduce((sum, polygon) => {
            const rings = polygon.getLinearRings()
            const polygonLength = rings.reduce((ringSum, ring) => {
              return (
                ringSum +
                getLength(ring, {
                  projection: projection
                })
              )
            }, 0)
            return sum + polygonLength
          }, 0)
          break

        case "Circle":
          // 圆的周长：2πr
          const radius = geometry.getRadius()
          length = 2 * Math.PI * radius
          break

        default:
          return null // 不支持的几何类型
      }

      // 单位换算和格式化
      let formattedLength
      let unitText

      switch (unit.toLowerCase()) {
        case "km":
          formattedLength = length / 1000
          unitText = "公里"
          break
        case "m":
        default:
          formattedLength = length
          unitText = "米"
          break
      }

      // 格式化数字
      const formatNumber = (num) => {
        if (num >= 1000000) {
          return (num / 1000000).toFixed(2) + "百万"
        } else if (num >= 1000) {
          return (num / 1000).toFixed(2) + "千"
        } else {
          return num.toFixed(2)
        }
      }

      return {
        length: formattedLength,
        unit: unit,
        text: `${formatNumber(formattedLength)}${unitText}`
      }
    } catch (error) {
      console.error("计算周长/长度时发生错误:", error)
      return null
    }
  }

  /**
   * 批量计算多个要素的总周长/长度，对传入要素数组进行周长/长度计算
   * @param {Array<Feature>} features - OpenLayers要素数组
   * @param {string} unit - 长度单位：'m' | 'km'
   * @returns {Object} 返回周长/长度计算结果
   * @static
   */
  static calculateTotalLength(features, unit = "m") {
    if (!Array.isArray(features) || features.length === 0) return null

    try {
      let totalLength = 0

      features.forEach((feature) => {
        const result = DrawOLShape.calculateLength(feature, "m") // 先用米计算
        if (result) {
          totalLength += result.length
        }
      })

      // 转换单位
      let formattedLength
      let unitText

      switch (unit.toLowerCase()) {
        case "km":
          formattedLength = totalLength / 1000
          unitText = "公里"
          break
        case "m":
        default:
          formattedLength = totalLength
          unitText = "米"
          break
      }

      return {
        length: formattedLength,
        unit: unit,
        text: `${formattedLength.toFixed(2)}${unitText}`
      }
    } catch (error) {
      console.error("计算总周长/长度时发生错误:", error)
      return null
    }
  }

  /**
   * 计算要素的面积，对传入要素进行面积计算
   * @param {Feature} feature - OpenLayers要素
   * @param {string} unit - 面积单位：'m2'(平方米) | 'km2'(平方公里) | 'ha'(公顷) | 'mu'(亩)
   * @returns {Object} 返回面积计算结果
   * @returns {number} returns.area - 面积值
   * @returns {string} returns.unit - 面积单位
   * @returns {string} returns.text - 格式化后的文本
   * @static
   */
  static calculateArea(feature, unit = "m²", projection = "EPSG:4326") {
    if (!feature) return null

    const geometry = feature.getGeometry()
    if (!geometry) return null

    let area = 0
    const type = geometry.getType()

    try {
      switch (type) {
        case "Polygon":
          area = getArea(geometry, {
            projection: projection
          })
          break
        case "MultiPolygon":
          // 多面则累加每个面的面积
          area = geometry.getPolygons().reduce((sum, polygon) => {
            return (
              sum +
              getArea(polygon, {
                projection: projection
              })
            )
          }, 0)
          break
        case "Circle":
          // 圆形使用多边形近似计算
          const polygon = new Polygon.fromCircle(geometry, 64) // 64边形近似
          area = getArea(polygon, {
            projection: projection
          })
          break
        default:
          return null // 不支持的几何类型
      }

      // 单位换算和格式化
      let formattedArea
      let unitText

      switch (unit.toLowerCase()) {
        case "km²":
          formattedArea = area / 1000000
          unitText = "平方公里"
          break
        case "ha":
          formattedArea = area / 10000
          unitText = "公顷"
          break
        case "mu":
          formattedArea = area / 666.67 // 1亩约等于666.67平方米
          unitText = "亩"
          break
        case "m²":
        default:
          formattedArea = area
          unitText = "平方米"
          break
      }

      // 格式化数字
      const formatNumber = (num) => {
        if (num >= 1000000) {
          return (num / 1000000).toFixed(2) + "百万"
        } else if (num >= 1000) {
          return (num / 1000).toFixed(2) + "千"
        } else {
          return num.toFixed(2)
        }
      }

      return {
        area: formattedArea,
        unit: unit,
        text: `${formatNumber(formattedArea)}${unitText}`
      }
    } catch (error) {
      console.error("计算面积时发生错误:", error)
      return null
    }
  }

  /**
   * 批量计算多个要素的总面积，对传入要素数组进行面积计算
   * @param {Array<Feature>} features - OpenLayers要素数组
   * @param {string} unit - 面积单位：'m2' | 'km2' | 'ha' | 'mu'
   * @returns {Object} 返回面积计算结果
   * @static
   */
  static calculateTotalArea(features, unit = "m2") {
    if (!Array.isArray(features) || features.length === 0) return null

    try {
      let totalArea = 0

      features.forEach((feature) => {
        const result = DrawOLShape.calculateArea(feature, "m2") // 先用平方米计算
        if (result) {
          totalArea += result.area
        }
      })

      // 转换单位
      let formattedArea
      let unitText

      switch (unit.toLowerCase()) {
        case "km2":
          formattedArea = totalArea / 1000000
          unitText = "平方公里"
          break
        case "ha":
          formattedArea = totalArea / 10000
          unitText = "公顷"
          break
        case "mu":
          formattedArea = totalArea / 666.67
          unitText = "亩"
          break
        case "m2":
        default:
          formattedArea = totalArea
          unitText = "平方米"
          break
      }

      return {
        area: formattedArea,
        unit: unit,
        text: `${formattedArea.toFixed(2)}${unitText}`
      }
    } catch (error) {
      console.error("计算总面积时发生错误:", error)
      return null
    }
  }
}
