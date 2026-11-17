/** 司空 projectUuid 可能出现的字段名（大小写/下划线混用） */
const PROJECT_UUID_KEY_HINTS = [
  "projectuuid",
  "project_uuid",
  "sikongprojectuuid",
  "sikong_project_uuid",
  "fkprojectuuid"
]

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUuidLike(value: string): boolean {
  return UUID_RE.test(value)
}

/** 从 GetPageDrone 行/无人机对象中抽取司空 projectUuid */
export function pickProjectUuid(obj: Record<string, unknown> | null | undefined): string {
  if (!obj || typeof obj !== "object") return ""

  for (const [key, raw] of Object.entries(obj)) {
    if (raw == null) continue
    const normalizedKey = key.replace(/_/g, "").toLowerCase()
    if (!PROJECT_UUID_KEY_HINTS.some((h) => normalizedKey.includes(h.replace(/_/g, "")))) {
      continue
    }
    const text = String(raw).trim()
    if (text && isUuidLike(text)) return text
  }

  const direct = String(obj.projectUuid ?? obj.ProjectUuid ?? obj.project_uuid ?? obj.ProjectUUID ?? "").trim()
  if (direct && isUuidLike(direct)) return direct

  for (const value of Object.values(obj)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue
    const nested = pickProjectUuid(value as Record<string, unknown>)
    if (nested) return nested
  }

  return ""
}

/** 机场 SN（dock） */
export function rowAirportSn(row: Record<string, unknown>): string {
  return String(
    row.airportSn ??
      row.AirportSn ??
      row.airport_sn ??
      row.sn ??
      row.Sn ??
      row.dock_sn ??
      row.DockSn ??
      row.dockSn ??
      ""
  ).trim()
}

export function isSikongUuid(value: string): boolean {
  return isUuidLike(value)
}
