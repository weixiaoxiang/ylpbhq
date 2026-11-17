import Feature from "ol/Feature"
import Point from "ol/geom/Point"
import LineString from "ol/geom/LineString"
import type Map from "ol/Map"
import type View from "ol/View"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import { Icon, Stroke, Style } from "ol/style"
import { UAV_POSITION_MIN_MOVE_METERS, UAV_POSITION_POLL_MS } from "@/constants/uav-position-poll"
import type { LonLat } from "./coord-utils"
import { hasCoordChanged, hasMovedBeyondMeters } from "./coord-utils"
import type { LiveTrackOptions } from "./types"

export interface DroneLiveTrackController {
  /** 首次落点并进入跟随模式 */
  startAt: (pos: LonLat) => void
  /** 轮询到新位置时调用 */
  onPoll: (pos: LonLat) => void
  /** 停止轮询与动画并清除图层 */
  stop: () => void
  /** 飞行结束：停止动画与跟随，保留已绘制的轨迹与终点图标 */
  finishFlight: (finalPos?: LonLat | null) => void
  isActive: () => boolean
}

/** 鹞落坪地图为 EPSG:4326，几何坐标直接使用 [lng, lat] */
export function createDroneLiveTrackController(
  map: Map,
  view: View,
  options: LiveTrackOptions
): DroneLiveTrackController {
  const fixedZoom = options.fixedZoom ?? 17
  const animateMs = options.animateMs ?? UAV_POSITION_POLL_MS
  const minMoveMeters = options.minMoveMeters ?? UAV_POSITION_MIN_MOVE_METERS

  const pathSource = new VectorSource()
  const iconSource = new VectorSource()

  const pathLayer = new VectorLayer({
    source: pathSource,
    zIndex: 32,
    style: new Style({
      stroke: new Stroke({
        color: "#e74c3c",
        width: 10
      })
    })
  })

  const iconFeature = new Feature()
  iconFeature.setStyle(
    new Style({
      image: new Icon({
        src: options.iconUrl,
        anchor: [0.5, 0.5],
        scale: 0.55
      })
    })
  )

  const pathFeature = new Feature({
    geometry: new LineString([])
  })

  const iconLayer = new VectorLayer({
    source: iconSource,
    zIndex: 33
  })

  iconSource.addFeature(iconFeature)
  pathSource.addFeature(pathFeature)
  map.addLayer(pathLayer)
  map.addLayer(iconLayer)

  let active = false
  let displayed: LonLat | null = null
  let pathCoords4326: number[][] = []
  let rafId: number | null = null

  let animFrom: LonLat | null = null
  let animTo: LonLat | null = null
  let animStartMs = 0

  function lonLatToCoord(pos: LonLat): [number, number] {
    return [pos.lng, pos.lat]
  }

  function setIconPosition(pos: LonLat) {
    iconFeature.setGeometry(new Point(lonLatToCoord(pos)))
  }

  /** 已落点 + 当前帧位置（轨迹尖端与飞行图标同源） */
  function syncPathGeometry(framePos: LonLat | null = null) {
    const coords = pathCoords4326.map(([lng, lat]) => [lng, lat] as [number, number])
    if (framePos) {
      coords.push(lonLatToCoord(framePos))
    }
    pathFeature.setGeometry(new LineString(coords))
  }

  function followView(pos: LonLat) {
    view.setCenter(lonLatToCoord(pos))
    view.setZoom(fixedZoom)
  }

  function cancelAnimation() {
    if (rafId != null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function appendPathPoint(pos: LonLat) {
    const last = pathCoords4326[pathCoords4326.length - 1]
    if (!last || Math.abs(last[0] - pos.lng) > 1e-8 || Math.abs(last[1] - pos.lat) > 1e-8) {
      pathCoords4326.push([pos.lng, pos.lat])
      syncPathGeometry(null)
    }
  }

  function tick(now: number) {
    if (!animFrom || !animTo) return
    const elapsed = now - animStartMs
    const t = Math.min(1, elapsed / animateMs)
    const lng = animFrom.lng + (animTo.lng - animFrom.lng) * t
    const lat = animFrom.lat + (animTo.lat - animFrom.lat) * t
    const frame: LonLat = { lng, lat }
    displayed = frame
    setIconPosition(frame)
    syncPathGeometry(frame)
    followView(frame)
    map.render()
    if (t < 1) {
      rafId = requestAnimationFrame(tick)
      return
    }
    rafId = null
    appendPathPoint(animTo)
    syncPathGeometry(null)
  }

  function runAnimation(to: LonLat) {
    if (!displayed) {
      displayed = to
      setIconPosition(to)
      appendPathPoint(to)
      followView(to)
      return
    }
    if (!hasCoordChanged(displayed, to)) return
    cancelAnimation()
    animFrom = { ...displayed }
    animTo = to
    animStartMs = performance.now()
    rafId = requestAnimationFrame(tick)
  }

  return {
    startAt(pos: LonLat) {
      active = true
      cancelAnimation()
      pathCoords4326 = [[pos.lng, pos.lat]]
      displayed = { ...pos }
      setIconPosition(pos)
      syncPathGeometry(null)
      followView(pos)
    },

    onPoll(pos: LonLat) {
      if (!active) return
      const anchor = displayed
      if (anchor && !hasMovedBeyondMeters(anchor, pos, minMoveMeters)) {
        return
      }
      runAnimation(pos)
    },

    finishFlight(finalPos?: LonLat | null) {
      active = false
      cancelAnimation()
      if (animTo) {
        displayed = { ...animTo }
        setIconPosition(animTo)
        appendPathPoint(animTo)
        syncPathGeometry(null)
      }
      animFrom = null
      animTo = null
      if (finalPos) {
        if (!displayed) {
          displayed = { ...finalPos }
          pathCoords4326 = [[finalPos.lng, finalPos.lat]]
          setIconPosition(finalPos)
          syncPathGeometry(null)
        } else if (hasCoordChanged(displayed, finalPos)) {
          displayed = { ...finalPos }
          setIconPosition(finalPos)
          appendPathPoint(finalPos)
          syncPathGeometry(null)
        }
      }
    },

    stop() {
      active = false
      cancelAnimation()
      animFrom = null
      animTo = null
      displayed = null
      pathCoords4326 = []
      pathFeature.setGeometry(new LineString([]))
      iconFeature.setGeometry(undefined)
      pathSource.clear()
      pathSource.addFeature(pathFeature)
    },

    isActive() {
      return active
    }
  }
}
