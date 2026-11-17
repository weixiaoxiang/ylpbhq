import type { InjectionKey, Ref } from "vue"
import type { WaylineStats, WaylineWaypoint } from "@/utils/ai-drone/wayline-stats"
import type { LoadWaylinePayload } from "@/utils/ai-drone/load-wayline-payload"
import type { ShowWaylineOptions } from "./use-drone-layers"

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
  showWayline: (waypoints: WaylineWaypoint[], options?: ShowWaylineOptions) => void
  /** 按司空 download_url 下载并绘制航线，可附带 projectUuid 等供地图模式缓存 */
  loadWaylineUrl: (input?: string | LoadWaylinePayload) => void | Promise<void>
  clearWayline: () => void
  /** 航飞计划：按任务开始实时轨迹（GetDroneLastPosition 轮询驱动） */
  startPlanLiveTrack: (
    plan: Record<string, unknown>,
    fallbackAirportSn?: string,
    positions?: Record<string, unknown>[]
  ) => void
  stopPlanLiveTrack: () => void
  clearWaylineAndPlanTrack: () => void
}

export const AI_DRONE_KEY: InjectionKey<AiDroneContext> = Symbol("ai-drone")
