import dayjs from "dayjs"
import { uavApi } from "@/api/uav"
import { getSikongToken } from "@/utils/ai-drone/sikong-token"
import { computeWaylineStats, type WaylineStats, type WaylineWaypoint } from "@/utils/ai-drone/wayline-stats"
import { fetchWaylineWaypointsById, resolveWaylineIdFromTask } from "@/utils/ai-drone/wayline-map-preview"

export interface ExecutingWaylineResult {
  waypoints: WaylineWaypoint[]
  stats: WaylineStats | null
}

const UNFINISHED_STATUS = "waiting,starting_failure,executing,paused,suspended"

function isSikongOk(res: { code?: number } | null | undefined): boolean {
  if (res?.code != null && res.code !== 0) return false
  return true
}

function extractTaskList(res: { data?: { list?: Record<string, unknown>[] } } | null | undefined) {
  const list = res?.data?.list
  return Array.isArray(list) ? list : []
}

/** 与航飞计划未完成列表一致的时间窗 */
function unfinishedTaskTimeRange() {
  const begin = dayjs().format("YYYY-MM-DD")
  const end = dayjs().add(1, "month").format("YYYY-MM-DD")
  return {
    begin_at: dayjs(`${begin} 00:00:00`).unix(),
    end_at: dayjs(`${end} 23:59:59`).unix()
  }
}

function taskDockSn(task: Record<string, unknown>): string {
  return String(task.sn ?? task.dock_sn ?? task.airport_sn ?? "").trim()
}

function pickExecutingTask(list: Record<string, unknown>[], airportSn: string) {
  const scoped = airportSn ? list.filter((t) => taskDockSn(t) === airportSn) : list
  const pool = scoped.length > 0 ? scoped : list
  return (
    pool.find((t) => String(t.status) === "executing") ??
    pool.find((t) => String(t.status) === "paused") ??
    pool.find((t) => String(t.status) === "waiting") ??
    pool[0] ??
    null
  )
}

async function requestTaskList(projectUuid: string, params: Record<string, unknown>) {
  const token = getSikongToken()
  const res = (await uavApi.taskList({ token, projectUuid }, params)) as {
    code?: number
    data?: { list?: Record<string, unknown>[] }
  }
  if (!isSikongOk(res)) return []
  return extractTaskList(res)
}

/** 查询指定机场当前执行中任务的航线航点 */
export async function fetchExecutingWaylineForDevice(
  projectUuid: string,
  airportSn: string
): Promise<ExecutingWaylineResult | null> {
  if (!projectUuid?.trim() || !airportSn?.trim()) return null
  const token = getSikongToken()
  if (!token?.trim()) return null

  try {
    const timeRange = unfinishedTaskTimeRange()
    let list = await requestTaskList(projectUuid, {
      sn: airportSn,
      status: UNFINISHED_STATUS,
      ...timeRange,
      name: ""
    })

    if (!list.length) {
      list = await requestTaskList(projectUuid, {
        status: UNFINISHED_STATUS,
        ...timeRange,
        name: ""
      })
      list = list.filter((t) => taskDockSn(t) === airportSn)
    }

    const task = pickExecutingTask(list, airportSn)
    if (!task) return null

    const waylineId = resolveWaylineIdFromTask(task)
    if (!waylineId) return null

    const waypoints = await fetchWaylineWaypointsById(projectUuid, waylineId)
    if (!waypoints?.length) return null

    return {
      waypoints,
      stats: computeWaylineStats(waypoints)
    }
  } catch {
    return null
  }
}
