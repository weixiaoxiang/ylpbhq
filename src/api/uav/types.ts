/** 系统管理 — 无人机设备分页查询参数 */
export interface UavPageDroneQuery {
  page?: number
  intPageSize?: number
  keyWord?: string
  /** 是否飞行中 */
  isFly?: boolean | ""
}

/** 机场下挂载的无人机子设备 */
export interface UavDroneChild {
  droneSn?: string
  droneName?: string
  droneCallsign?: string
  isFly?: number
  longitude?: number
  latitude?: number
}

/** 机场 + 无人机组合行（GetPageDrone 单条） */
export interface UavAirportDroneRow {
  airportName?: string
  airportSn?: string
  airportCallsign?: string
  airportDeviceId?: string
  airportLongitude?: number
  airportLatitude?: number
  airportModeCode?: number
  onlineStatus?: number
  user_state?: string
  drones?: UavDroneChild[]
}

/** 航线列表查询 */
export interface UavWaylineQuery {
  keyWord?: string
  wayline_uuid?: string
}

/** 航线配置行（GetWaylines） */
export interface UavWaylineRow {
  Id?: number
  wayline_uuid?: string
  wayline_name?: string
  wayline_height?: number | string
}

/** 飞行录像库分页查询 */
export interface UavVideoLibQuery {
  page?: number
  intPageSize?: number
  sn?: string
  startTime?: string
  endTime?: string
}

/** 飞行录像单条 */
export interface UavVideoLibItem {
  name?: string
  drone_name?: string
  create_time?: string
  cover_path_local?: string
}
