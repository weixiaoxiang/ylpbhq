import { uavRequest } from "./request"

export type {
  UavPageDroneQuery,
  UavDroneChild,
  UavAirportDroneRow,
  UavWaylineQuery,
  UavWaylineRow,
  UavVideoLibQuery,
  UavVideoLibItem
} from "./types"

/** 司空请求头：token 与项目 uuid 都由调用方传入 */
interface SikongHeader {
  token: string
  projectUuid: string
}

/** 司空实时控制指令（返航 / 暂停任务等） */
export type SikongFlightCommand = "return_home" | "return_home_cancel" | "flighttask_pause" | "flighttask_recovery"

function sikongHeaders(header: SikongHeader) {
  return {
    "X-User-Token": header.token,
    "X-Project-Uuid": header.projectUuid
  }
}

const DRONE = "Drone"

/**
 * 鹞落坪后端无人机接口 + 大疆司空航飞（/uavApi 代理）
 */
export const uavApi = {
  GetDroneLastPosition(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetDroneLastPosition`, method: "get", params })
  },
  GetAirportPosition(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetAirportPosition`, method: "get", params })
  },
  GetAISnapshot(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetAISnapshot`, method: "get", params })
  },
  PutAIResultCollection(params?: unknown) {
    return uavRequest({ url: `${DRONE}/PutAIResultCollection`, method: "put", params })
  },
  DeleteDroneAiResult(params?: unknown) {
    return uavRequest({ url: `${DRONE}/DeleteDroneAiResult`, method: "delete", params })
  },
  GetAIEventStatistics(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetAIEventStatistics`, method: "get", params })
  },
  GetAIAnalysis(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetAIAnalysis`, method: "get", params })
  },
  GetAICarTypeAnalysis(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetAICarTypeAnalysis`, method: "get", params })
  },
  GetFlightStatistics(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetFlightStatistics`, method: "get", params })
  },
  GetFlyTaskStatistics(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetFlyTaskStatistics`, method: "get", params })
  },
  GetPageAIVideoLib(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetPageAIVideoLib`, method: "get", params })
  },
  GetPageAIAssessmentResult(params: Record<string, unknown> = {}) {
    return uavRequest({
      url: `${DRONE}/GetPageAIAssessmentResult`,
      method: "get",
      params: {
        ...params,
        assessment_result: params.assessment_result ?? ""
      }
    })
  },
  PutDroneAiResult(data?: unknown) {
    return uavRequest({ url: `${DRONE}/PutDroneAiResult`, method: "put", data })
  },
  GetDroneFlyPoints(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetDroneFlyPoints`, method: "get", params })
  },
  GetPageAIWarningResult(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetPageAIWarningResult`, method: "get", params })
  },
  GetAIWarningResultStatisticsPie(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetAIWarningResultStatisticsPie`, method: "get", params })
  },
  GetAIWarningResultStatisticsLine(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetAIWarningResultStatisticsLine`, method: "get", params })
  },
  GetAIWarningResultStatistics(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetAIWarningResultStatistics`, method: "get", params })
  },
  GetAIWarningResultAnalysis(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetAIWarningResultAnalysis`, method: "get", params })
  },
  PutAIWarningResult(data?: unknown) {
    return uavRequest({ url: `${DRONE}/PutAIWarningResult`, method: "put", data })
  },
  PostAIWarningSms(data?: unknown) {
    return uavRequest({ url: `${DRONE}/PostAIWarningSms`, method: "post", data })
  },
  GetPageDrone(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetPageDrone`, method: "get", params })
  },
  GetWaylines(params?: unknown) {
    return uavRequest({ url: `${DRONE}/GetWaylines`, method: "get", params })
  },
  PutWaylines(params?: unknown) {
    return uavRequest({ url: `${DRONE}/PutWaylines`, method: "put", params })
  },
  taskList(header: SikongHeader, params?: unknown) {
    return uavRequest({
      url: "/uavApi/openapi/v0.1/flight-task/list",
      method: "get",
      headers: sikongHeaders(header),
      params
    })
  },
  taskPost(header: SikongHeader, data?: unknown) {
    return uavRequest({
      url: "/uavApi/openapi/v0.1/flight-task",
      method: "post",
      headers: sikongHeaders(header),
      data
    })
  },
  taskTrack(header: SikongHeader, params: { task_uuid: string }) {
    return uavRequest({
      url: `/uavApi/openapi/v0.1/flight-task/${params.task_uuid}/track`,
      method: "get",
      headers: sikongHeaders(header)
    })
  },
  waylineList(header: SikongHeader, params?: unknown) {
    return uavRequest({
      url: "/uavApi/openapi/v0.1/wayline",
      method: "get",
      headers: sikongHeaders(header),
      params
    })
  },
  waylineDetail(header: SikongHeader, params: { wayline_id: string }) {
    return uavRequest({
      url: `/uavApi/openapi/v0.1/wayline/${params.wayline_id}`,
      method: "get",
      headers: sikongHeaders(header)
    })
  },
  /** 司空 v2 实时控制：返航、暂停/恢复等（deviceSn 一般为机场 SN） */
  sendFlightCommand(header: SikongHeader, deviceSn: string, data: { device_command: SikongFlightCommand }) {
    return uavRequest<{ code?: number; message?: string; msg?: string }>({
      url: `/uavApi/openapi/v2.0/device/${deviceSn}/command`,
      method: "post",
      headers: {
        ...sikongHeaders(header),
        "Content-Type": "application/json"
      },
      data
    })
  }
}
