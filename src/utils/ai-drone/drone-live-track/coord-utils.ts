import LineString from "ol/geom/LineString"
import { getLength } from "ol/sphere"

const COORD_EPS = 1e-7

/** 解析接口经纬度为 number */
export function parseCoord(value: string | number | null | undefined): number | null {
  if (value == null || value === "") return null
  const n = typeof value === "number" ? value : parseFloat(String(value))
  return Number.isFinite(n) ? n : null
}

export interface LonLat {
  lng: number
  lat: number
}

export function snapshotToLonLat(
  snapshot: { longitude?: string | number; latitude?: string | number } | null | undefined
): LonLat | null {
  const lng = parseCoord(snapshot?.longitude)
  const lat = parseCoord(snapshot?.latitude)
  if (lng == null || lat == null) return null
  return { lng, lat }
}

/** 经纬度是否有实质变化（度数阈值，用于动画起止去重） */
export function hasCoordChanged(prev: LonLat | null, next: LonLat | null): boolean {
  if (!prev || !next) return true
  return Math.abs(prev.lng - next.lng) > COORD_EPS || Math.abs(prev.lat - next.lat) > COORD_EPS
}

/** 两点间大地线距离（米） */
export function getLonLatDistanceMeters(a: LonLat, b: LonLat): number {
  const line = new LineString([
    [a.lng, a.lat],
    [b.lng, b.lat]
  ])
  return getLength(line, { projection: "EPSG:4326" })
}

/** 位移达到 minMeters 才认为需要更新轨迹 */
export function hasMovedBeyondMeters(prev: LonLat | null, next: LonLat | null, minMeters: number): boolean {
  if (!prev || !next) return true
  if (minMeters <= 0) return hasCoordChanged(prev, next)
  return getLonLatDistanceMeters(prev, next) >= minMeters
}
