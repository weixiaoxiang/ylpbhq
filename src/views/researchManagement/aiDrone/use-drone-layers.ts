import type { Ref } from "vue"
import Feature from "ol/Feature"
import Map from "ol/Map"
import LineString from "ol/geom/LineString"
import Point from "ol/geom/Point"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import { Icon, Stroke, Style, Circle, Fill, Text } from "ol/style"
import wrjIcon from "@/assets/images/ai-drone/loc_wrj.png"
import type { WaylineWaypoint } from "@/utils/ai-drone/wayline-stats"

/** 在巡护概况同一张地图上叠加无人机、抓拍点和航线，不重新初始化底图 */
export function useDroneLayers(map: Ref<Map | null>) {
  let droneSource: VectorSource | null = null
  let snapSource: VectorSource | null = null
  let waylineSource: VectorSource | null = null

  function ensureLayers() {
    if (!map.value || droneSource) return
    droneSource = new VectorSource()
    snapSource = new VectorSource()
    waylineSource = new VectorSource()
    map.value.addLayer(
      new VectorLayer({
        source: waylineSource,
        zIndex: 20
      })
    )
    map.value.addLayer(
      new VectorLayer({
        source: droneSource,
        zIndex: 30
      })
    )
    map.value.addLayer(
      new VectorLayer({
        source: snapSource,
        zIndex: 31
      })
    )
  }

  function readLonLat(item: Record<string, unknown>): [number, number] | null {
    const lon = Number(item.longitude ?? item.lon ?? item.lng)
    const lat = Number(item.latitude ?? item.lat)
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon === 0 || lat === 0) return null
    return [lon, lat]
  }

  /** 刷新无人机点，不改变当前视野 */
  function setDrones(list: Record<string, unknown>[]) {
    ensureLayers()
    if (!droneSource) return
    droneSource.clear()
    list.forEach((item) => {
      const coord = readLonLat(item)
      if (!coord) return
      const feature = new Feature({ geometry: new Point(coord) })
      feature.set("aiKind", "drone")
      feature.set("payload", item)
      feature.setStyle(
        new Style({
          image: new Icon({
            src: wrjIcon,
            anchor: [0.5, 1],
            scale: 0.7
          })
        })
      )
      droneSource!.addFeature(feature)
    })
  }

  /** 定位一条抓拍。传 null 时只清除高亮 */
  function focusSnap(item: Record<string, unknown> | null) {
    ensureLayers()
    if (!snapSource || !map.value) return
    snapSource.clear()
    if (!item) return
    const coord = readLonLat(item)
    if (!coord) return
    const feature = new Feature({ geometry: new Point(coord) })
    feature.set("aiKind", "snap")
    feature.set("payload", item)
    feature.setStyle(
      new Style({
        image: new Circle({
          radius: 7,
          fill: new Fill({ color: "#ffb020" }),
          stroke: new Stroke({ color: "#fff", width: 2 })
        })
      })
    )
    snapSource.addFeature(feature)
    map.value.getView().animate({ center: coord, zoom: 15, duration: 400 })
  }

  function clearWayline() {
    waylineSource?.clear()
  }

  /** 把航点画成线，并缩放到这条航线 */
  function showWayline(waypoints: WaylineWaypoint[]) {
    ensureLayers()
    if (!waylineSource || !map.value) return
    waylineSource.clear()
    const coords = waypoints
      .map((wp) => {
        const [lon, lat] = wp.coordinates.split(",").map((part) => Number(part))
        return [lon, lat] as [number, number]
      })
      .filter((coord) => Number.isFinite(coord[0]) && Number.isFinite(coord[1]))
    if (coords.length === 0) return
    const line = new Feature({ geometry: new LineString(coords) })
    line.setStyle(
      new Style({
        stroke: new Stroke({ color: "#3ec6ff", width: 3 })
      })
    )
    waylineSource.addFeature(line)
    coords.forEach((coord, index) => {
      const point = new Feature({ geometry: new Point(coord) })
      point.setStyle(
        new Style({
          image: new Circle({
            radius: 5,
            fill: new Fill({ color: "#3ec6ff" }),
            stroke: new Stroke({ color: "#fff", width: 1 })
          }),
          text: new Text({
            text: String(index + 1),
            offsetY: -14,
            fill: new Fill({ color: "#fff" })
          })
        })
      )
      waylineSource!.addFeature(point)
    })
    map.value.getView().fit(waylineSource.getExtent(), {
      padding: [80, 460, 80, 260],
      maxZoom: 16,
      duration: 400
    })
  }

  return { setDrones, focusSnap, showWayline, clearWayline }
}
