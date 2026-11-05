import JSZip from "jszip"
import LineString from "ol/geom/LineString"
import { getLength } from "ol/sphere"

/** 航点，coordinates 为 "经度,纬度,高度" */
export interface WaylineWaypoint {
  name: string
  coordinates: string
}

export interface WaylineStats {
  nodeCount: number
  lengthLabel: string
}

/** 从 KML 文本解析航点，按 wpml:index 排序 */
export function parseWaylineKmlXml(kml: string): WaylineWaypoint[] {
  const xmlDoc = new DOMParser().parseFromString(kml, "text/xml")
  const placemarks = xmlDoc.getElementsByTagName("Placemark")
  const array: WaylineWaypoint[] = []
  Array.from(placemarks).forEach((placemark) => {
    const point = placemark.getElementsByTagName("Point")[0]
    if (!point) return
    const coordinatesEl = point.getElementsByTagName("coordinates")[0]
    const indexEl = placemark.getElementsByTagName("wpml:index")[0]
    const coordinates = coordinatesEl?.textContent?.replace(/\n/g, "").trim()
    const name = indexEl?.textContent?.trim() ?? ""
    if (!coordinates || name === "") return
    array.push({ name, coordinates })
  })
  array.sort((a, b) => Number(a.name) - Number(b.name))
  return array
}

function formatWaylineLength(meters: number): string {
  if (meters > 100) return `${Math.round((meters / 1000) * 100) / 100} km`
  return `${Math.round(meters * 100) / 100} m`
}

/** 按大地线计算航线长度 */
export function computeWaylineStats(waypoints: WaylineWaypoint[]): WaylineStats {
  const nodeCount = waypoints.length
  if (nodeCount < 2) return { nodeCount, lengthLabel: formatWaylineLength(0) }
  const coords = waypoints.map((wp) => {
    const parts = wp.coordinates.split(",")
    return [parseFloat(parts[0]), parseFloat(parts[1])] as [number, number]
  })
  const meters = getLength(new LineString(coords), { projection: "EPSG:4326" })
  return { nodeCount, lengthLabel: formatWaylineLength(meters) }
}

/**
 * 从司空航线 zip 包中读取首个 .kml 并解析航点（与大鲵 wayline-stats 一致，使用 JSZip）
 */
export async function parseWaylineFromZipBlob(blob: Blob): Promise<WaylineWaypoint[]> {
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer())
  if (head[0] === 0x50 && head[1] === 0x4b) {
    const zip = await JSZip.loadAsync(blob)
    const kmlEntry = zip.file(/\.kml$/i)[0]
    if (!kmlEntry) {
      throw new Error("航线压缩包中未找到 KML 文件")
    }
    const kmlText = await kmlEntry.async("string")
    return parseWaylineKmlXml(kmlText)
  }
  const kmlText = new TextDecoder().decode(await blob.arrayBuffer())
  return parseWaylineKmlXml(kmlText)
}
