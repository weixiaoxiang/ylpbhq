import { danieRequest } from "./request"

/** 司空请求头：token 与项目 uuid 都由调用方传入 */
interface SikongHeader {
  token: string
  projectUuid: string
}

function sikongHeaders(header: SikongHeader) {
  return {
    "X-User-Token": header.token,
    "X-Project-Uuid": header.projectUuid
  }
}

/**
 * 大鲵无人机业务接口 + 司空航飞接口
 * 路径前缀 /danieApi、/uavApi 由开发代理转发
 */
export const danieUavApi = {
  /** 无人机最新位置 */
  GetDroneLastPosition(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetDroneLastPosition", method: "get", params })
  },
  /** 机场位置 */
  GetAirportPosition(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetAirportPosition", method: "get", params })
  },
  /** 最新 AI 抓拍 */
  GetAISnapshot(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetAISnapshot", method: "get", params })
  },
  /** 收藏 / 取消收藏 */
  PutAIResultCollection(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/PutAIResultCollection", method: "put", params })
  },
  /** 删除识别结果 */
  DeleteDroneAiResult(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/DeleteDroneAiResult", method: "delete", params })
  },
  /** 识别事件统计（待研判 / 已研判 / 总量） */
  GetAIEventStatistics(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetAIEventStatistics", method: "get", params })
  },
  /** AI 分析柱状图 */
  GetAIAnalysis(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetAIAnalysis", method: "get", params })
  },
  /** 车辆类型 */
  GetAICarTypeAnalysis(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetAICarTypeAnalysis", method: "get", params })
  },
  /** 飞行统计 */
  GetFlightStatistics(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetFlightStatistics", method: "get", params })
  },
  /** 飞行任务状态 */
  GetFlyTaskStatistics(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetFlyTaskStatistics", method: "get", params })
  },
  /** 视频库分页 */
  GetPageAIVideoLib(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetPageAIVideoLib", method: "get", params })
  },
  /** 研判结果分页，空字符串表示不限研判结论 */
  GetPageAIAssessmentResult(params: Record<string, unknown> = {}) {
    return danieRequest({
      url: "/danieApi/api/Drone/GetPageAIAssessmentResult",
      method: "get",
      params: {
        ...params,
        assessment_result: params.assessment_result ?? ""
      }
    })
  },
  /** 提交研判 */
  PutDroneAiResult(data?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/PutDroneAiResult", method: "put", data })
  },
  /** 飞行轨迹点 */
  GetDroneFlyPoints(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetDroneFlyPoints", method: "get", params })
  },
  /** 预警事件分页 */
  GetPageAIWarningResult(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetPageAIWarningResult", method: "get", params })
  },
  /** 预警类型饼图 */
  GetAIWarningResultStatisticsPie(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetAIWarningResultStatisticsPie", method: "get", params })
  },
  /** 预警类型柱状图 */
  GetAIWarningResultStatisticsLine(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetAIWarningResultStatisticsLine", method: "get", params })
  },
  /** 预警数量统计 */
  GetAIWarningResultStatistics(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetAIWarningResultStatistics", method: "get", params })
  },
  /** 预警分析（高发类型、高发时段） */
  GetAIWarningResultAnalysis(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetAIWarningResultAnalysis", method: "get", params })
  },
  /** 预警处置 */
  PutAIWarningResult(data?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/PutAIWarningResult", method: "put", data })
  },
  /** 预警短信 */
  PostAIWarningSms(data?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/PostAIWarningSms", method: "post", data })
  },
  /** 无人机设备分页 */
  GetPageDrone(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetPageDrone", method: "get", params })
  },
  /** 航线高度等本地记录 */
  GetWaylines(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/GetWaylines", method: "get", params })
  },
  /** 更新航线记录 */
  PutWaylines(params?: unknown) {
    return danieRequest({ url: "/danieApi/api/Drone/PutWaylines", method: "put", params })
  },
  /** 司空任务列表 */
  taskList(header: SikongHeader, params?: unknown) {
    return danieRequest({
      url: "/uavApi/openapi/v0.1/flight-task/list",
      method: "get",
      headers: sikongHeaders(header),
      params
    })
  },
  /** 司空创建任务 */
  taskPost(header: SikongHeader, data?: unknown) {
    return danieRequest({
      url: "/uavApi/openapi/v0.1/flight-task",
      method: "post",
      headers: sikongHeaders(header),
      data
    })
  },
  /** 司空任务轨迹 */
  taskTrack(header: SikongHeader, params: { task_uuid: string }) {
    return danieRequest({
      url: `/uavApi/openapi/v0.1/flight-task/${params.task_uuid}/track`,
      method: "get",
      headers: sikongHeaders(header)
    })
  },
  /** 司空航线列表 */
  waylineList(header: SikongHeader, params?: unknown) {
    return danieRequest({
      url: "/uavApi/openapi/v0.1/wayline",
      method: "get",
      headers: sikongHeaders(header),
      params
    })
  },
  /** 司空航线详情（含 download_url） */
  waylineDetail(header: SikongHeader, params: { wayline_id: string }) {
    return danieRequest({
      url: `/uavApi/openapi/v0.1/wayline/${params.wayline_id}`,
      method: "get",
      headers: sikongHeaders(header)
    })
  }
}
