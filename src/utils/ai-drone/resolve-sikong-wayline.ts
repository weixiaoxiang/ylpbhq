import { mapDroneDeviceItem, getSikongToken } from "@/utils/ai-drone/sikong-token"
import { peekWaylineMapCache } from "@/utils/ai-drone/wayline-map-cache"
import { isSikongUuid, pickProjectUuid, rowAirportSn } from "@/utils/ai-drone/sikong-field-pickers"

export interface SikongDeviceBinding {
  projectUuid: string
  airportSn: string
  deviceSn?: string
}

function projectUuidFromJwt(): string {
  try {
    const token = getSikongToken()
    const part = token.split(".")[1]
    if (!part) return ""
    const json = JSON.parse(atob(part)) as Record<string, unknown>
    const uuid = String(json.project_uuid ?? json.projectUuid ?? "").trim()
    return isSikongUuid(uuid) ? uuid : ""
  } catch {
    return ""
  }
}

function envProjectUuidFallback(): string {
  const env = String(import.meta.env.VITE_SIKONG_PROJECT_UUID ?? "").trim()
  return isSikongUuid(env) ? env : ""
}

function findSikongBinding(
  pageDroneList: Array<Record<string, unknown>>,
  deviceSn?: string,
  airportSnHint?: string
): SikongDeviceBinding | null {
  if (!Array.isArray(pageDroneList) || pageDroneList.length === 0) return null

  const device = (deviceSn || "").trim()
  const hint = (airportSnHint || "").trim()

  for (const row of pageDroneList) {
    const airportSn = rowAirportSn(row)
    const rowUuid = pickProjectUuid(row)
    const mapped = mapDroneDeviceItem(row)
    const mappedUuid = mapped ? pickProjectUuid(mapped) : ""

    const drones = row.drones as Record<string, unknown>[] | undefined
    if (device && Array.isArray(drones)) {
      for (const d of drones) {
        const dsn = String(d.device_sn ?? d.DeviceSn ?? d.sn ?? d.Sn ?? "").trim()
        if (dsn !== device) continue
        const projectUuid = pickProjectUuid(d) || mappedUuid || rowUuid
        return { projectUuid, airportSn, deviceSn: dsn }
      }
    }

    if (hint && airportSn && airportSn === hint) {
      const projectUuid = mappedUuid || rowUuid || pickProjectUuid(drones?.[0] ?? {})
      if (projectUuid) return { projectUuid, airportSn }
    }
  }

  return null
}

export function resolveProjectUuidForSn(
  pageDroneList: Array<Record<string, unknown>>,
  deviceSn?: string,
  airportSn?: string
): string {
  if (!Array.isArray(pageDroneList) || pageDroneList.length === 0) return ""
  const device = (deviceSn || "").trim()
  const airport = (airportSn || "").trim()
  const lookup = device || airport
  if (!lookup) return ""

  for (const row of pageDroneList) {
    const dockSn = rowAirportSn(row)
    const rowUuid = pickProjectUuid(row)
    const mappedUuid = pickProjectUuid(mapDroneDeviceItem(row) ?? {})

    if (dockSn && (dockSn === lookup || dockSn === airport)) {
      const uuid = rowUuid || mappedUuid
      if (uuid) return uuid
    }

    const drones = row.drones as Record<string, unknown>[] | undefined
    if (Array.isArray(drones)) {
      for (const d of drones) {
        const dsn = String(d.device_sn ?? d.DeviceSn ?? d.sn ?? d.drone_sn ?? "").trim()
        if (!dsn || (dsn !== lookup && dsn !== device)) continue
        return pickProjectUuid(d) || mappedUuid || rowUuid
      }
    }

    const flatSn = String(row.device_sn ?? "").trim()
    if (flatSn && flatSn === lookup) {
      return rowUuid || mappedUuid
    }
  }
  return ""
}

export function resolveAirportSnForDevice(
  pageDroneList: Array<Record<string, unknown>>,
  deviceSn?: string,
  airportSnHint?: string
): string {
  const hint = (airportSnHint || "").trim()
  const device = (deviceSn || "").trim()

  if (Array.isArray(pageDroneList) && pageDroneList.length > 0) {
    for (const row of pageDroneList) {
      const dockSn = rowAirportSn(row)
      if (!dockSn) continue
      if (hint && hint === dockSn) return dockSn
      const drones = row.drones as Record<string, unknown>[] | undefined
      if (!Array.isArray(drones)) continue
      const matchedDrone = drones.some((d) => {
        const dsn = String(d.device_sn ?? d.sn ?? "").trim()
        return dsn === hint || dsn === device
      })
      if (matchedDrone) return dockSn
    }
    if (hint) {
      for (const row of pageDroneList) {
        if (rowAirportSn(row) === hint) return hint
      }
    }
  }

  return hint || device
}

/** 地图模式 / 拉执行中航线：统一解析 projectUuid + airportSn */
export function resolveSikongWaylineQuery(
  pageDroneList: Array<Record<string, unknown>>,
  opts: { projectUuid?: string; deviceSn?: string; airportSn?: string }
): { projectUuid: string; airportSn: string } {
  const binding = findSikongBinding(pageDroneList, opts.deviceSn, opts.airportSn)
  const cacheUuid = peekWaylineMapCache()?.projectUuid

  const projectUuid =
    opts.projectUuid?.trim() ||
    binding?.projectUuid ||
    cacheUuid?.trim() ||
    resolveProjectUuidForSn(pageDroneList, opts.deviceSn, opts.airportSn) ||
    projectUuidFromJwt() ||
    envProjectUuidFallback()

  const airportSn = binding?.airportSn || resolveAirportSnForDevice(pageDroneList, opts.deviceSn, opts.airportSn)

  return {
    projectUuid: projectUuid.trim(),
    airportSn: airportSn.trim()
  }
}
