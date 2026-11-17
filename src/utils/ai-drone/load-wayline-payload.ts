/** 航飞计划预览航线时携带的元数据，供主地图与地图模式缓存 */
export interface LoadWaylinePayload {
  downloadUrl?: string
  projectUuid?: string
  airportSn?: string
  waylineId?: string
}

export function normalizeLoadWaylineInput(input?: string | LoadWaylinePayload): {
  downloadUrl?: string
  meta: Omit<LoadWaylinePayload, "downloadUrl">
} {
  if (!input) {
    return { downloadUrl: undefined, meta: {} }
  }
  if (typeof input === "string") {
    return { downloadUrl: input, meta: {} }
  }
  const { downloadUrl, ...meta } = input
  return { downloadUrl, meta }
}
