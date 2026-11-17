import axios from "axios"
import { uavApi } from "@/api/uav"
import { getSikongToken } from "@/utils/ai-drone/sikong-token"
import { parseWaylineFromZipBlob, type WaylineWaypoint } from "@/utils/ai-drone/wayline-stats"

/** 计划列表项唯一键（司空 flight-task 常用 uuid，未必有 id） */
export function resolveFlightTaskId(task: Record<string, unknown> | null | undefined): string {
  if (!task) return ""
  const candidates = [task.uuid, task.task_uuid, task.id]
  for (const c of candidates) {
    if (c != null && String(c).trim()) return String(c).trim()
  }
  return ""
}

/** 列表高亮用：有 uuid 用 uuid，否则用索引兜底，避免 id 全空时全部 active */
export function planListItemKey(task: Record<string, unknown>, index: number): string {
  const id = resolveFlightTaskId(task)
  return id || `plan-index-${index}`
}

/** 从司空飞行任务/计划项解析关联航线 id */
export function resolveWaylineIdFromTask(task: Record<string, unknown> | null | undefined): string {
  if (!task) return ""
  const wayline = task.wayline as Record<string, unknown> | undefined
  const candidates = [task.wayline_uuid, task.wayline_id, task.file_id, wayline?.uuid, wayline?.id]
  for (const c of candidates) {
    if (c != null && String(c).trim()) return String(c).trim()
  }
  return ""
}

function isSikongOk(res: { code?: number } | null | undefined): boolean {
  if (res?.code != null && res.code !== 0) return false
  return true
}

/** 按航线 id 拉取司空 kmz 下载地址 */
export async function fetchWaylineDownloadUrl(projectUuid: string, waylineId: string): Promise<string | null> {
  if (!projectUuid?.trim() || !waylineId?.trim()) return null
  try {
    const detailRes = (await uavApi.waylineDetail(
      {
        token: getSikongToken(),
        projectUuid
      },
      { wayline_id: waylineId }
    )) as { code?: number; data?: { download_url?: string } }
    if (!isSikongOk(detailRes) || !detailRes.data?.download_url) return null
    return detailRes.data.download_url
  } catch {
    return null
  }
}

/** 按航线 id 拉取 KML 航点（与航飞计划预览同源） */
export async function fetchWaylineWaypointsById(
  projectUuid: string,
  waylineId: string
): Promise<WaylineWaypoint[] | null> {
  if (!projectUuid?.trim() || !waylineId?.trim()) return null
  try {
    const downloadUrl = await fetchWaylineDownloadUrl(projectUuid, waylineId)
    if (!downloadUrl) return null
    const response = await axios.get<Blob>(downloadUrl, { responseType: "blob" })
    return await parseWaylineFromZipBlob(response.data)
  } catch {
    return null
  }
}
