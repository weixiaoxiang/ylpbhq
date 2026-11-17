/** 视频库单条记录：兼容 camelCase / PascalCase / snake_case 字段 */

export function getVideoTaskUuid(item: Record<string, unknown>): string {
  const raw = item.taskUuid ?? item.task_uuid ?? item.taskUUID ?? item.TaskUuid
  return raw != null ? String(raw) : ""
}

export function getVideoDeviceSn(item: Record<string, unknown>): string {
  const raw = item.sn ?? item.device_sn ?? item.drone_sn ?? item.droneSn
  return raw != null ? String(raw) : ""
}

/** 列表选中态、v-for :key 使用的稳定唯一键 */
export function getVideoItemKey(item: Record<string, unknown>): string {
  const candidates = [item.id, item.Id, item.videoId, item.taskUuid, item.task_uuid, item.uuid, item.name]
  for (const raw of candidates) {
    if (raw != null && String(raw).trim() !== "") {
      return String(raw)
    }
  }
  return ""
}

export function isSameVideoKey(a: string, b: string): boolean {
  if (!a || !b) return false
  return a === b
}
