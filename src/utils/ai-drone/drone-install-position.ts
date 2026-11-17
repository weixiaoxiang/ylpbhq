import { parseCoord, snapshotToLonLat, type LonLat } from "@/utils/ai-drone/drone-live-track/coord-utils"
import type { DronePositionSnapshot } from "@/utils/ai-drone/drone-live-track/types"

/** 设备安装点坐标（首次观测后冻结，不随 GetDroneLastPosition 移动） */
const installPositionCache = new Map<string, LonLat>()

function deviceCacheKey(item: DronePositionSnapshot): string {
  if (item.device_id != null) return `id:${item.device_id}`
  if (item.device_sn) return `sn:${item.device_sn}`
  if (item.airport_sn) return `ap:${item.airport_sn}`
  return ""
}

function isValidMapCoord(lng: number, lat: number): boolean {
  return lng !== 0 && lat !== 0
}

/**
 * 解析机场/安装点坐标（优先接口中的机场字段，避免用飞行中的机体坐标当安装点）
 */
function resolveDockInstallLonLat(item: DronePositionSnapshot): LonLat | null {
  const lng = parseCoord(item.airport_longitude ?? item.airportLongitude ?? item.dock_longitude ?? item.dockLongitude)
  const lat = parseCoord(item.airport_latitude ?? item.airportLatitude ?? item.dock_latitude ?? item.dockLatitude)
  if (lng == null || lat == null || !isValidMapCoord(lng, lat)) return null
  return { lng, lat }
}

/**
 * 可作为安装点冻结的坐标：机场 > 待机时机体坐标；飞行中且无机库字段时不写入缓存
 */
function resolveInstallSeedPosition(item: DronePositionSnapshot): LonLat | null {
  const dock = resolveDockInstallLonLat(item)
  if (dock) return dock
  if (item.is_fly) return null
  return snapshotToLonLat(item)
}

/**
 * 首次见到有效安装点即冻结，之后标点始终使用该点
 */
export function rememberInstallPositionOnce(item: DronePositionSnapshot): void {
  const key = deviceCacheKey(item)
  if (!key || installPositionCache.has(key)) return
  const seed = resolveInstallSeedPosition(item)
  if (seed) installPositionCache.set(key, seed)
}

/** 地图 loc_wrj 标点：冻结安装点 + 仍合并 is_fly 等最新状态；飞行中缺坐标时回退缓存 */
export function applyInstallPositionForMapMarkers(list: DronePositionSnapshot[]): DronePositionSnapshot[] {
  const result: DronePositionSnapshot[] = []
  for (const item of list) {
    const key = deviceCacheKey(item)
    rememberInstallPositionOnce(item)
    const fixed = key ? installPositionCache.get(key) : undefined
    const seed = fixed ?? resolveInstallSeedPosition(item) ?? snapshotToLonLat(item)
    const cachedOnly = key ? installPositionCache.get(key) : undefined
    const pos = seed ?? cachedOnly
    if (!pos) continue
    result.push({
      ...item,
      longitude: pos.lng,
      latitude: pos.lat
    })
  }
  return result
}

/** 页面加载时用 GetPageDrone 等静态数据预置安装点（轮询尚未返回坐标时也能显示标点） */
export function seedInstallPositionFromDeviceRow(item: Record<string, unknown>): void {
  const key = deviceCacheKey(item as DronePositionSnapshot)
  if (!key || installPositionCache.has(key)) return
  const lng = parseCoord(item.airportLongitude ?? item.airport_longitude ?? item.longitude)
  const lat = parseCoord(item.airportLatitude ?? item.airport_latitude ?? item.latitude)
  if (lng == null || lat == null || !isValidMapCoord(lng, lat)) return
  installPositionCache.set(key, { lng, lat })
}
