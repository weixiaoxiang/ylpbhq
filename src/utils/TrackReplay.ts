// @ts-nocheck
import Feature from "ol/Feature"
import { MultiPoint, Point, LineString } from "ol/geom"
import { Vector as VectorLayer } from "ol/layer"
import { getVectorContext } from "ol/render"
import { Vector as VectorSource } from "ol/source"
import { getLength } from "ol/sphere"
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from "ol/style"

const startIcon =
  "data:image/png;base64,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"
const endIcon =
  "data:image/png;base64,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"
// 箭头
// const currentIcon =
//   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJaSURBVFhH7ZY/aBRREMZn5i4rChFsjEhQL6ccJJeAVUAsUokm+J+sWliKgliIIjGJsGK8pBCrFBaWloK1hWAhdopnxBxc7kAIiI2FnXrZcfZuvMvdZXff2yrF/Zr3fW/h7Tdvdh8PISFfhmaXAeFmoJnh4Wi14NUfWEI6WsETXhoJJtUGi5xUaU2iAF/Xa5NSdUYtMMJ48dD9cbVWJNsB9qdUNiHCUyqtsA7wfvD2ThnONlwLomRtsA6w29kV9H6g4VpISxK1wToAEzc/vk6StMEqQCl3rx8ZptV2gchnVBpjFeBvrS+ovr/htgKP2rbBrgXsn1YVim0bjAN8PjCzhxAvqw0H4aIqI4wDoENTDJBSG4qc7XmbNhgHIIYLKmNJpyn0T+nEKEAxe3evVH9ebTzMl1TFYhQgDY5xRQESNmfaBqMAzHxFpTEpgnMqI4kNUMp5++WEOaHWHERXVSSxAWobfyJ6jx9kvz+p6WTIpA3xLWAI+/ff+LThEpCLgO90rg1KYeix/Z/IAB8zcwdlON5wm0B4ib8dd6y8VB2uLpSxxsF2v248bIEQ/zdEBuij+sKdPB9Ze+yOrHs/1cPwt8L3Hei48vW/0ikFB1ezc8fUbElkAKmg7euXrX6SrxSuySjvaufImvdrtVKelnvBC52q44MfuQuht+JiZj6XIr+kVuAH+crigppIVrKzz2Th62p/SOh9qrsI3QFCv1m9VHHL9OUBo5XCDTk8nqodWDk8M6G6i/AAgGWp+q3ceK+OVZaWddqYfHXxjgyPgjUcSslaPXr02JYA/AM6SJe+GL9+lQAAAABJRU5ErkJggg=='
// 小车
const currentIcon =
  "data:image/png;base64,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"

/**
 * 轨迹回放类
 * 用于在地图上实现轨迹播放和回放功能
 *
 * @example
 * // 基本使用
 * const trackReplay = new TrackReplay({
 *   map: mapInstance, // 地图实例
 *   feature: featureInstance, // 轨迹要素
 *   mode: 'track', // 模式：track-轨迹播放，replay-轨迹回放
 *   speed: 50, // 播放速度
 *   showFirstPoint: false, // 是否显示起始点
 *   showNode: false, // 是否显示轨迹节点
 *   styles: { // 自定义样式
 *     StartPoint: {
 *       image: {
 *         scale: 0.7
 *       }
 *     }
 *   }
 * })
 *
 * // 开始播放
 * trackReplay.startAnimation()
 *
 * // 暂停播放
 * trackReplay.stopAnimation()
 *
 * // 结束播放
 * trackReplay.endAnimation()
 *
 * // 重置播放
 * trackReplay.resetAnimation()
 *
 * // 设置播放速度
 * trackReplay.setSpeed(100)
 *
 * // 设置是否显示节点
 * trackReplay.setShowNode(true)
 *
 * // 设置当前点图标
 * trackReplay.setCurrentIcon('path/to/icon.png')
 *
 * // 销毁实例
 * trackReplay.destroyed()
 */
class TrackReplay {
  /** 播放模式：track-轨迹播放，replay-轨迹回放 */
  mode = "track"

  /** 地图实例 */
  map = null

  /** 矢量图层 */
  vector = null

  /** 矢量数据源 */
  source = null

  /** 轨迹要素(LineString or MultiLineString) */
  feature = null

  /** 当前点要素 */
  currentPoint = null

  /** 当前点几何对象 */
  drawMarkPoint = null

  /** 当前绘制线(mode=replay时使用) */
  currentLine = null

  /** 轨迹几何对象 */
  route = null

  /** 轨迹类型：LineString 或 MultiLineString */
  routeType = null

  /** 当前段索引 */
  routeIndex = 0

  /** 轨迹总长度 */
  routeLength = 0

  /** 已播放的轨迹长度 */
  moveSegmentsLength = 0

  /** 轨迹段数 */
  routeSegments = 0

  /** 是否正在播放 */
  animating = false

  /** 当前段播放进度(0-1) */
  distance = 0

  /** 上一帧时间戳 */
  lastTime = 0

  /** 是否显示起始点 */
  showFirstPoint = false

  /** 是否显示轨迹节点 */
  showNode = false

  /** 播放速度 */
  speed = 50

  /** 上一帧坐标点 */
  lastCoordinate = null

  /** 样式配置 */
  styles = {
    /** 起点样式 */
    StartPoint: new Style({
      image: new Icon({
        src: startIcon,
        scale: 0.7,
        anchor: [0.5, 1]
      })
    }),
    /** 终点样式 */
    EndPoint: new Style({
      image: new Icon({
        src: endIcon,
        scale: 0.7,
        anchor: [0.5, 1]
      })
    }),
    /** 当前点样式 */
    CurrentPoint: new Style({
      image: new Icon({
        src: currentIcon,
        scale: 0.7,
        anchor: [0.5, 0.5],
        color: "white"
      })
    }),
    /** 当前线样式 */
    CurrentLine: new Style({
      stroke: new Stroke({
        color: "#27c45e",
        width: 3
      })
    }),
    /** 线样式 */
    LineString: [
      new Style({
        stroke: new Stroke({
          color: "#27c45e",
          width: 3
        })
      })
    ],
    /** 多线样式 */
    MultiLineString: [
      new Style({
        stroke: new Stroke({
          color: "#27c45e",
          width: 3
        })
      })
    ],
    /** 节点样式 */
    LineStringNode: new Style({
      image: new CircleStyle({
        radius: 3,
        fill: new Fill({
          color: "#27c45e"
        })
      }),
      geometry: function (feature) {
        if (feature.getGeometry().getType() === "MultiLineString") {
          var coordinates = feature.getGeometry().getCoordinates()
          var flatCoordinates = TrackReplay.flatten(coordinates, 1)
          return new MultiPoint(flatCoordinates)
        } else if (feature.getGeometry().getType() === "LineString") {
          var coordinates = feature.getGeometry().getCoordinates()
          return new MultiPoint(coordinates)
        }
      }
    })
  }
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {Object} options.map - 地图实例
   */
  constructor(options) {
    if (!options || !options.map) {
      throw new Error("Map instance is required")
    }
    if (!options || !options.feature) {
      throw new Error("Feature instance is required")
    }

    // 只对 styles 属性进行深度融合
    if (options.styles) {
      this.deepMerge(this.styles, options.styles)
    }

    // 其他属性直接赋值
    Object.keys(options).forEach((key) => {
      if (key !== "styles") {
        this[key] = options[key]
      }
    })

    this.route = options.feature.getGeometry()
    this.routeType = options.feature.getGeometry().getType()
    if (this.routeType === "MultiLineString") {
      this.routeSegments = this.route.getLineStrings().length
    } else if (this.routeType === "LineString") {
      this.routeSegments = 1
    }
    this.routeLength = TrackReplay.getGeometryLength(this.route)

    this.lastCoordinate = null // 用于存储上一个坐标
    this.styles.CurrentPoint.getImage().load()
    this.setShowNode(this.showNode)
    this.init()
  }
  init() {
    this.source = new VectorSource()
    this.vector = new VectorLayer({
      zIndex: 999,
      title: "轨迹地图",
      source: this.source,
      style: (f) => this.styles[f.getGeometry().getType()]
    })
    this.map.addLayer(this.vector)
    if (this.mode === "track") {
      this.addTrackFeature()
    } else if (this.mode === "replay") {
      this.addReplayFeature()
      // this.addTrackFeature()
    }
    // 判断是否有 onCreated 回调函数，如果有则执行
    if (this.onCreated) {
      this.onCreated()
    }
  }
  // 初始化轨迹播放要素
  addTrackFeature() {
    let startCoordinate
    let endCoordinate
    // 添加起始点
    if (this.routeType === "LineString") {
      startCoordinate = this.route.getFirstCoordinate()
      endCoordinate = this.route.getLastCoordinate()
    } else if (this.routeType === "MultiLineString") {
      startCoordinate = this.route.getLineString(0).getFirstCoordinate()
      endCoordinate = this.route.getLineString(this.routeSegments - 1).getLastCoordinate()
    }
    //  起点
    let startPoint = new Feature(new Point(startCoordinate))
    startPoint.setStyle(this.styles.StartPoint)
    this.source.addFeature(startPoint)
    //  终点
    let endPoint = new Feature(new Point(endCoordinate))
    endPoint.setStyle(this.styles.EndPoint)
    this.source.addFeature(endPoint)
    // 当前点位
    this.currentPoint = new Feature(new Point(startCoordinate))
    this.currentPoint.setStyle(this.styles.CurrentPoint)
    this.source.addFeature(this.currentPoint)
    // vectorContext绘制当前点
    this.drawMarkPoint = this.currentPoint.getGeometry().clone()
    if (!this.showFirstPoint) {
      this.currentPoint.setGeometry(null)
    }
    this.source.addFeature(this.feature)
  }
  addReplayFeature() {
    this.currentLine = new Feature(new LineString([]))
    this.currentLine.setStyle(this.styles.CurrentLine)
    this.source.addFeature(this.currentLine)
  }
  // 开始动画
  startAnimation() {
    if (this.mode === "track") {
      this.startTrackAnimation()
    } else if (this.mode === "replay") {
      this.startReplayAnimation()
    }
  }
  // 停止动画
  stopAnimation() {
    if (this.mode === "track") {
      this.stopTrackAnimation()
    } else if (this.mode === "replay") {
      this.stopReplayAnimation()
    }
  }
  // 结束动画
  endAnimation() {
    if (this.mode === "track") {
      this.endTrackAnimation()
    } else if (this.mode === "replay") {
      this.endReplayAnimation()
    }
  }
  // 重置动画
  resetAnimation() {
    if (this.mode === "track") {
      this.resetTrackAnimation()
    } else if (this.mode === "replay") {
      this.resetReplayAnimation()
    }
  }
  // 轨迹播放函数
  moveTrackFeature(event) {
    let currentRoute
    if (this.routeType === "MultiLineString") {
      currentRoute = this.route.getLineString(this.routeIndex)
    } else if (this.routeType === "LineString") {
      currentRoute = this.route
    }
    const time = event.frameState.time
    const elapsedTime = time - this.lastTime
    this.distance = (this.distance + (this.speed * elapsedTime) / 1e5) % 2
    this.lastTime = time
    if (this.distance >= 1) {
      this.routeIndex++
      this.distance = 0
      this.moveSegmentsLength += TrackReplay.getGeometryLength(currentRoute)
      // 当所有线路播放完毕，停止动画
      if (this.routeIndex >= this.routeSegments) {
        this.endAnimation()
        return
      }
    }
    // 判断是否到达终点，避免最后一次绘制产生误差，让当前点位始终能直接到达终点
    if (1 - this.distance < (this.speed * elapsedTime) / 1e5) {
      this.distance = 1
    }
    const currentCoordinate = currentRoute.getCoordinateAt(this.distance)
    // 计算运动方向
    if (this.lastCoordinate) {
      const angle = this.calculateAngle(this.lastCoordinate, currentCoordinate)
      this.styles.CurrentPoint.getImage().setRotation(Math.PI / 2 - angle)
    }

    // 更新 lastCoordinate
    this.lastCoordinate = JSON.parse(JSON.stringify(currentCoordinate))
    this.drawMarkPoint.setCoordinates(currentCoordinate)
    const vectorContext = getVectorContext(event)
    vectorContext.setStyle(this.styles.CurrentPoint)
    vectorContext.drawGeometry(this.drawMarkPoint)
    // 判断是否有 onProcess 回调函数，如果有则执行
    if (this.onProcess) {
      const moveLength = this.moveSegmentsLength + TrackReplay.getGeometryLength(currentRoute) * this.distance
      const proportion = ((moveLength / this.routeLength) * 100).toFixed(1)
      // Math.round((moveLength / this.routeLength) * 100)
      this.onProcess(proportion)
    }
    this.map.render()
  }
  // 开始轨迹播放动画
  startTrackAnimation() {
    if (this.animating) return
    this.map.render()
    this.animating = true
    this.lastTime = Date.now()
    // 保存 moveTrackFeature 绑定后的引用
    this.boundMoveFeature = this.moveTrackFeature.bind(this)
    this.vector.on("postrender", this.boundMoveFeature)
    this.currentPoint.setGeometry(null)
    // 判断是否有 onStart 回调函数，如果有则执行
    if (this.onStart) {
      this.onStart()
    }
  }
  // 暂停轨迹播放动画
  stopTrackAnimation() {
    if (!this.animating) return
    this.animating = false
    this.currentPoint.setGeometry(this.drawMarkPoint)
    this.stopMovingFeature()
    // 判断是否有 onStop 回调函数，如果有则执行
    if (this.onStop) {
      this.onStop()
    }
  }
  // 结束轨迹播放动画
  endTrackAnimation() {
    if (!this.animating) return
    this.animating = false
    this.currentPoint.setGeometry(this.drawMarkPoint)
    this.stopMovingFeature()
    this.routeIndex = 0
    this.moveSegmentsLength = 0
    this.distance = 0
    this.lastCoordinate = null
    // 判断是否有 onEnd 回调函数，如果有则执行
    if (this.onEnd) {
      this.onEnd()
    }
  }
  // 重置轨迹播放动画
  resetTrackAnimation() {
    this.stopTrackAnimation()
    this.routeIndex = 0
    this.distance = 0
    this.lastCoordinate = null
    this.currentPoint.setGeometry(null)
    this.drawMarkPoint.setCoordinates([0, 0])
    this.startTrackAnimation()
  }
  // 开始轨迹回放动画
  startReplayAnimation() {
    if (this.animating) return
    this.map.render()
    this.animating = true
    this.lastTime = Date.now()
    this.boundMoveFeature = this.moveReplayFeature.bind(this)
    this.vector.on("postrender", this.boundMoveFeature)
    // 计算第一个点
    if (this.routeType === "MultiLineString") {
      this.currentLine.setGeometry(new LineString([this.route.getLineString(0).getFirstCoordinate()])) // 初始化当前线
    } else if (this.routeType === "LineString") {
      this.currentLine.setGeometry(new LineString([this.route.getFirstCoordinate()])) // 初始化当前线
    }
    if (this.onStart) {
      this.onStart()
    }
  }
  // 暂停轨迹回放动画
  stopReplayAnimation() {
    if (!this.animating) return
    this.animating = false
    this.stopMovingFeature()
    if (this.onStop) {
      this.onStop()
    }
  }
  // 结束轨迹回放动画
  endReplayAnimation() {
    if (!this.animating) return
    this.animating = false
    this.stopMovingFeature()
    this.routeIndex = 0
    this.moveSegmentsLength = 0
    this.distance = 0
    this.lastCoordinate = null
    if (this.onEnd) {
      this.onEnd()
    }
  }
  // 重置轨迹回放动画
  resetReplayAnimation() {
    this.stopReplayAnimation()
    this.routeIndex = 0
    this.distance = 0
    this.lastCoordinate = null
    this.currentLine.setGeometry(new LineString([])) // 重置当前线
    this.startReplayAnimation()
  }
  // 轨迹回放函数
  moveReplayFeature(event) {
    let currentRoute
    if (this.routeType === "MultiLineString") {
      currentRoute = this.route.getLineString(this.routeIndex)
    } else if (this.routeType === "LineString") {
      currentRoute = this.route
    }
    const time = event.frameState.time
    const elapsedTime = time - this.lastTime
    this.distance = (this.distance + (this.speed * elapsedTime) / 1e5) % 2
    this.lastTime = time
    if (this.distance >= 1) {
      this.routeIndex++
      this.distance = 0
      this.moveSegmentsLength += TrackReplay.getGeometryLength(currentRoute)
      if (this.routeIndex >= this.routeSegments) {
        this.endReplayAnimation()
        return
      }
    }
    if (1 - this.distance < (this.speed * elapsedTime) / 1e5) {
      this.distance = 1
    }
    const currentCoordinate = currentRoute.getCoordinateAt(this.distance)
    if (this.lastCoordinate) {
      const newCoordinates = this.currentLine.getGeometry().getCoordinates()
      newCoordinates.push(currentCoordinate)
      this.currentLine.setGeometry(new LineString(newCoordinates))
    } else {
      this.currentLine.setGeometry(new LineString([currentCoordinate]))
    }
    this.lastCoordinate = JSON.parse(JSON.stringify(currentCoordinate))
    const vectorContext = getVectorContext(event)
    vectorContext.setStyle(this.styles.CurrentLine)
    vectorContext.drawGeometry(this.currentLine.getGeometry())
    if (this.onProcess) {
      const moveLength = this.moveSegmentsLength + TrackReplay.getGeometryLength(currentRoute) * this.distance
      const proportion = ((moveLength / this.routeLength) * 100).toFixed(1)
      this.onProcess(proportion)
    }
    this.map.render()
  }

  // 销毁
  destroyed() {
    // 移除事件监听器
    this.stopMovingFeature()
    // 从地图中移除图层
    this.map.removeLayer(this.vector)
    // 清理其他资源
    this.source.clear()
    this.vector = null
    this.source = null
    if (this.onCreated) {
      this.onCreated = null
    }
    if (this.onProcess) {
      this.onProcess = null
    }
    if (this.onStart) {
      this.onStart = null
    }
    if (this.onEnd) {
      this.onEnd = null
    }
    if (this.onStop) {
      this.onStop = null
    }
  }
  stopMovingFeature() {
    // 移除事件监听器
    this.boundMoveFeature && this.vector.un("postrender", this.boundMoveFeature)
  }
  getStyleFunction(type) {
    return this.styles[type]
  }
  // 计算两点之间的角度,返回弧度角度值,保留两位小数
  calculateAngle(startCoordinate, endCoordinate) {
    const dx = endCoordinate[0] - startCoordinate[0]
    const dy = endCoordinate[1] - startCoordinate[1]
    return Math.atan2(dy, dx).toFixed(2)
  }
  // 设置是否显示节点，仅在轨迹播放时有效，mode=replay时无效
  setShowNode(value) {
    this.showNode = value
    if (this.mode === "track") {
      const length = this.styles.LineString.length
      if (length === 1 && this.showNode) {
        this.styles.LineString.push(this.styles.LineStringNode)
        this.styles.MultiLineString.push(this.styles.LineStringNode)
      } else if (length === 2 && !this.showNode) {
        this.styles.LineString.pop()
        this.styles.MultiLineString.pop()
      }
    }
    if (this.vector) {
      this.vector.changed()
    }
  }
  setSpeed(num) {
    this.speed = num
  }
  // 设置currentIcon
  setCurrentIcon(icon) {
    this.styles.CurrentPoint.setImage(
      new Icon({
        src: icon,
        scale: 0.7,
        anchor: [0.5, 0.5],
        color: "white"
      })
    )
  }
  // 多维数组递归扁平化 n 层,当n=1时只将数组去掉一层，例如三维数组转成二维数组
  static flatten(arr, n = 0) {
    if (n > 0) {
      // 如果 n 大于 0，则递归扁平化 n 层
      return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? TrackReplay.flatten(val, n - 1) : val), [])
    } else {
      // 如果 n 为负数，则返回原数组
      return arr.slice()
    }
  }
  // 计算geometry的长度
  static getGeometryLength(geometry) {
    return getLength(geometry, {
      projection: "EPSG:4326"
    })
  }
  /**
   * 深度融合赋值方法
   * @param target 目标对象
   * @param source 源对象
   */
  private deepMerge(target: any, source: any) {
    // 避免循环引用
    if (source === target) return

    Object.keys(source).forEach((key) => {
      // 跳过原型链上的属性
      if (!Object.prototype.hasOwnProperty.call(source, key)) return

      const sourceValue = source[key]
      const targetValue = target[key]

      // 如果是对象且不是数组，进行递归合并
      if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
        if (!targetValue) {
          target[key] = {}
        }
        this.deepMerge(target[key], sourceValue)
      } else {
        // 直接赋值
        target[key] = sourceValue
      }
    })
  }
}
export default TrackReplay
