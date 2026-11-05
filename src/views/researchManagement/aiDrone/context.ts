import type { InjectionKey, Ref } from "vue"
import type { WaylineStats, WaylineWaypoint } from "@/utils/ai-drone/wayline-stats"

/** 四个子页面共用的地图动作和弹窗入口 */
export interface AiDroneContext {
  devices: Ref<Record<string, unknown>[]>
  waylineStats: Ref<WaylineStats | null>
  /** 处置或研判成功后加一，列表据此刷新 */
  refreshTick: Ref<number>
  openEventDetail: (item: Record<string, unknown>) => void
  openWarnDetail: (item: Record<string, unknown>) => void
  openLive: (item: Record<string, unknown>) => void
  openVideo: (item: Record<string, unknown>) => void
  focusSnap: (item: Record<string, unknown> | null) => void
  showWayline: (waypoints: WaylineWaypoint[]) => void
  /** 按司空返回的 download_url 下载并绘制航线 */
  loadWaylineUrl: (downloadUrl?: string) => void
  clearWayline: () => void
}

export const AI_DRONE_KEY: InjectionKey<AiDroneContext> = Symbol("ai-drone")
