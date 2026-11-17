import type { DronePositionSnapshot, PlanDeviceTarget } from "./types"

/** 从司空 flight-task 计划项解析设备标识（优先计划 sn，再回退当前下拉机场） */
export function resolvePlanDeviceTarget(
  plan: Record<string, unknown> | null | undefined,
  fallbackAirportSn?: string
): PlanDeviceTarget {
  const airportSn =
    pickString(plan?.sn) || pickString(plan?.dock_sn) || pickString(plan?.airport_sn) || pickString(fallbackAirportSn)
  const deviceSn = pickString(plan?.device_sn) || pickString(plan?.drone_sn)
  const deviceId = plan?.device_id ?? plan?.drone_device_id
  return {
    airportSn: airportSn || undefined,
    deviceSn: deviceSn || undefined,
    deviceId: deviceId != null ? deviceId : undefined
  }
}

function pickString(value: unknown): string {
  if (value == null) return ""
  const s = String(value).trim()
  return s
}

/** 在 GetDroneLastPosition 列表中定位计划对应设备 */
export function pickDroneFromResponse(
  list: DronePositionSnapshot[] | null | undefined,
  target: PlanDeviceTarget
): DronePositionSnapshot | null {
  if (!Array.isArray(list) || list.length === 0) return null

  const byId = target.deviceId != null ? list.find((it) => String(it.device_id) === String(target.deviceId)) : null
  if (byId) return byId

  if (target.deviceSn) {
    const hit = list.find((it) => it.device_sn === target.deviceSn)
    if (hit) return hit
  }

  if (target.airportSn) {
    const hit = list.find((it) => it.airport_sn === target.airportSn || it.device_sn === target.airportSn)
    if (hit) return hit
  }

  return null
}

/** 从 GetDroneLastPosition 单条记录解析跟踪目标 */
export function resolveDeviceTargetFromSnapshot(item: DronePositionSnapshot | null | undefined): PlanDeviceTarget {
  if (!item) return {}
  return {
    deviceId: item.device_id != null ? item.device_id : undefined,
    deviceSn: item.device_sn ? String(item.device_sn).trim() : undefined,
    airportSn: item.airport_sn ? String(item.airport_sn).trim() : undefined
  }
}

/** 判断快照是否匹配跟踪目标 */
export function snapshotMatchesTarget(snapshot: DronePositionSnapshot, target: PlanDeviceTarget): boolean {
  if (target.deviceId != null && String(snapshot.device_id) === String(target.deviceId)) {
    return true
  }
  if (target.deviceSn && snapshot.device_sn === target.deviceSn) return true
  if (target.airportSn && (snapshot.airport_sn === target.airportSn || snapshot.device_sn === target.airportSn)) {
    return true
  }
  return false
}
