/** 接口返回的无人机位置快照 */
export interface DronePositionSnapshot {
  device_id?: number | string
  device_sn?: string
  airport_sn?: string
  device_name?: string
  latitude?: string | number
  longitude?: string | number
  is_fly?: boolean
  [key: string]: unknown
}

/** 计划关联设备匹配条件 */
export interface PlanDeviceTarget {
  airportSn?: string
  deviceSn?: string
  deviceId?: number | string
}

/** 实时轨迹控制器选项 */
export interface LiveTrackOptions {
  iconUrl: string
  /** 跟随飞行时固定缩放级别 */
  fixedZoom?: number
  /** 位置插值时长，默认与轮询一致 */
  animateMs?: number
  /** 位移低于该值（米）不更新动画 */
  minMoveMeters?: number
}
