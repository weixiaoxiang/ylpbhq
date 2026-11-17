import type { WaylineStats, WaylineWaypoint } from "@/utils/ai-drone/wayline-stats"

/** 航飞计划预览后的航线缓存，地图模式可秒开绿线 */
export interface WaylineMapCacheEntry {
  waypoints: WaylineWaypoint[]
  stats: WaylineStats
  projectUuid?: string
  airportSn?: string
  waylineId?: string
  updatedAt: number
}

let lastEntry: WaylineMapCacheEntry | null = null

export function setWaylineMapCache(entry: Omit<WaylineMapCacheEntry, "updatedAt">) {
  if (!entry.waypoints?.length) return
  lastEntry = {
    ...entry,
    updatedAt: Date.now()
  }
}

/** 匹配 projectUuid / airportSn；否则不匹配时返回 null */
export function getWaylineMapCache(
  projectUuid?: string,
  airportSn?: string,
  maxAgeMs = 2 * 60 * 60 * 1000
): WaylineMapCacheEntry | null {
  if (!lastEntry) return null
  if (Date.now() - lastEntry.updatedAt > maxAgeMs) {
    lastEntry = null
    return null
  }

  const uuid = projectUuid?.trim()
  const sn = airportSn?.trim()
  if (uuid && lastEntry.projectUuid && uuid !== lastEntry.projectUuid) return null
  if (sn && lastEntry.airportSn && sn !== lastEntry.airportSn) return null
  return lastEntry
}

export function peekWaylineMapCache(): WaylineMapCacheEntry | null {
  return lastEntry
}
