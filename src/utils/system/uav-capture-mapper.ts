import { danieFileUrl } from "@/utils/ai-drone/file-url"
import { isAiResultAssessed } from "@/utils/ai-drone/ai-assessment-status"
import { unwrapPage } from "@/utils/ai-drone/response"

/** 系统管理 — 抓拍卡片展示模型 */
export interface UavCaptureCardRecord {
  id: string
  resultId: number
  image: string
  location: string
  capturedAt: string
  eventType: string
  processStatus: string
  isFavorite: boolean
  /** 原始接口行，供 EventDetailDialog 使用 */
  source: Record<string, unknown>
}

function resolveEventTypeLabel(className: string | null | undefined): string {
  const name = String(className ?? "").trim()
  if (!name) return "未知类型"
  const lower = name.toLowerCase()
  if (lower === "fishing") return "垂钓"
  if (lower === "person" || lower === "pedestrian") return "行人"
  if (lower === "vehicle") return "车辆"
  if (lower === "invalid") return "无效"
  return name
}

function resolveLocation(item: Record<string, unknown>): string {
  const droneName = String(item.droneName ?? "").trim()
  if (droneName) return droneName
  const lon = item.longitude
  const lat = item.latitude
  if (lon != null && lat != null) return `经度：${lon} 纬度：${lat}`
  return "未知点位"
}

/** 单条研判结果 → 弹窗卡片 */
export function mapAiRowToCaptureCard(item: Record<string, unknown>): UavCaptureCardRecord {
  const judged = isAiResultAssessed(item as { is_assessment?: boolean; assessment_result?: string })
  const resultId = Number(item.resultId ?? item.id ?? 0)
  return {
    id: String(resultId),
    resultId,
    image: danieFileUrl(String(item.image_url_local ?? "")),
    location: resolveLocation(item),
    capturedAt: String(item.create_time ?? "").trim(),
    eventType: resolveEventTypeLabel(String(item.class_name ?? "")),
    processStatus: judged ? "已研判" : "待研判",
    isFavorite: Boolean(item.is_collection),
    source: { ...item, resultId }
  }
}

/** 分页拉取研判列表并映射为卡片 */
export async function fetchCapturePage(
  fetcher: (params: Record<string, unknown>) => Promise<unknown>,
  params: Record<string, unknown>
): Promise<{ list: UavCaptureCardRecord[]; total: number }> {
  const res = (await fetcher(params)) as { success?: boolean; response?: unknown }
  const { list, total } = unwrapPage(res)
  return {
    list: list.map((row) => mapAiRowToCaptureCard(row)),
    total
  }
}
