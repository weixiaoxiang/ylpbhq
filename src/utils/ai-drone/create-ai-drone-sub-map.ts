import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import XYZ from "ol/source/XYZ"
import { AI_DRONE_MAP_INITIAL_ONE_MAP } from "@/views/patrol/aiDrone/constants"

const TIANDITU_IMG_URL =
  "https://t6.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"

export interface CreateAiDroneSubMapOptions {
  center?: [number, number]
  zoom?: number
}

/**
 * 地图模式左侧面板等场景：独立 EPSG:4326 小地图，与主壳 useOlMap 投影一致
 */
export function createAiDroneSubMap(host: HTMLElement, options?: CreateAiDroneSubMapOptions): Map {
  const center = options?.center ?? AI_DRONE_MAP_INITIAL_ONE_MAP.center
  const zoom = options?.zoom ?? AI_DRONE_MAP_INITIAL_ONE_MAP.zoom

  return new Map({
    target: host,
    layers: [
      new TileLayer({
        source: new XYZ({ url: TIANDITU_IMG_URL })
      })
    ],
    view: new View({
      projection: "EPSG:4326",
      center,
      zoom,
      minZoom: 3,
      maxZoom: 18
    }),
    controls: []
  })
}

/** 分屏尺寸变化后刷新 OL 渲染区域 */
export function resizeAiDroneSubMap(map: Map | null | undefined) {
  map?.updateSize()
}
