import dayjs from "dayjs"

/** 司空航线模板类型 → 中文（与大鲵 HFJH 一致） */
export const WAYLINE_TEMPLATE_LABELS: Record<string, string> = {
  waypoint: "航点航线",
  mapping_2d: "建图航拍",
  mapping_3d: "倾斜摄影",
  mapping_strip: "带状航线",
  facade: "斜面航线",
  solid: "几何体航线",
  mapping_gobject: "贴近摄影"
}

export function formatWaylineTemplateTypes(types: unknown): string {
  if (!Array.isArray(types)) return "—"
  return types.map((key) => WAYLINE_TEMPLATE_LABELS[String(key)] || String(key)).join("、")
}

/** 计划时间：接口多为秒级时间戳，兼容毫秒与字符串 */
export function formatPlanTimestamp(value: unknown): string {
  if (value == null || value === "") return "—"
  const num = Number(value)
  if (Number.isFinite(num) && num > 0) {
    const d = num > 1e12 ? dayjs(num) : dayjs.unix(num)
    return d.isValid() ? d.format("YYYY-MM-DD HH:mm") : "—"
  }
  const parsed = dayjs(String(value))
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm") : "—"
}

export interface FlightPlanCreateForm {
  sn: string
  name: string
  wayline_uuid: string
  waylineName: string
  time_zone: string
  rth_altitude: number | undefined
  rth_mode: "preset" | "optimal"
  wayline_precision_type: "rtk" | "gps"
  out_of_control_action_in_flight: "return_home" | "continue_task"
  resumable_status: "manual" | "auto"
  task_type: "immediate" | "timed" | "recurring" | "continuous"
  repeat_type: "daily" | "weekly" | "monthly"
  repeat_type2: "absolute_monthly" | "relative_monthly"
  repeat_option: {
    interval: number
    days_of_week: number[]
    days_of_month: number[]
    week_of_month: number
  }
  begin_at: string
  scheduleDateRange: string[]
  recurring_task_start_time_list: string[]
  continuous_task_periods: string[][]
  min_battery_capacity: number
}

export function createDefaultFlightPlanForm(): FlightPlanCreateForm {
  return {
    sn: "",
    name: "",
    wayline_uuid: "",
    waylineName: "",
    time_zone: "Asia/Shanghai",
    rth_altitude: 100,
    rth_mode: "preset",
    wayline_precision_type: "rtk",
    out_of_control_action_in_flight: "return_home",
    resumable_status: "manual",
    task_type: "immediate",
    repeat_type: "daily",
    repeat_type2: "absolute_monthly",
    repeat_option: {
      interval: 1,
      days_of_week: [],
      days_of_month: [],
      week_of_month: 1
    },
    begin_at: "",
    scheduleDateRange: [],
    recurring_task_start_time_list: [""],
    continuous_task_periods: [["", ""]],
    min_battery_capacity: 90
  }
}

/**
 * 组装司空 taskPost 请求体（逻辑对齐大鲵 addPlan.vue submit）
 */
export function buildTaskPostPayload(form: FlightPlanCreateForm): Record<string, unknown> | null {
  if (!form.sn || !form.name || !form.wayline_uuid) return null

  let repeatType: string = form.repeat_type
  if (form.repeat_type === "monthly") {
    repeatType = form.repeat_type2
  }

  let payload: Record<string, unknown> = {
    sn: form.sn,
    name: form.name,
    wayline_uuid: form.wayline_uuid,
    time_zone: form.time_zone,
    rth_altitude: form.rth_altitude,
    rth_mode: form.rth_mode,
    wayline_precision_type: form.wayline_precision_type,
    out_of_control_action_in_flight: form.out_of_control_action_in_flight,
    resumable_status: form.resumable_status,
    task_type: form.task_type,
    repeat_type: repeatType
  }

  if (form.task_type === "timed") {
    if (!form.begin_at) return null
    payload = {
      ...payload,
      repeat_type: "nonrepeating",
      begin_at: dayjs(form.begin_at).unix()
    }
    return payload
  }

  if (form.task_type === "immediate") {
    payload.repeat_type = "nonrepeating"
    return payload
  }

  const range = form.scheduleDateRange
  if (!range?.[0] || !range?.[1]) return null

  if (form.task_type === "recurring") {
    const firstTime = form.recurring_task_start_time_list[0]
    if (!firstTime) return null
    payload.begin_at = dayjs(`${range[0]} ${firstTime}`).unix()
    payload.end_at = dayjs(`${range[1]} 23:59:59`).unix()
    payload.recurring_task_start_time_list = form.recurring_task_start_time_list
      .filter(Boolean)
      .map((item) => dayjs(`${range[0]} ${item}`).unix())
  } else if (form.task_type === "continuous") {
    const period = form.continuous_task_periods[0]
    if (!period?.[0] || !period?.[1]) return null
    payload.begin_at = dayjs(`${range[0]} ${period[0]}`).unix()
    payload.end_at = dayjs(`${range[1]} 23:59:59`).unix()
    payload.continuous_task_periods = form.continuous_task_periods
      .filter((row) => row[0] && row[1])
      .map((row) => [dayjs(`${range[0]} ${row[0]}`).unix(), dayjs(`${range[0]} ${row[1]}`).unix()])
    payload.min_battery_capacity = Number(form.min_battery_capacity)
  }

  const repeatOption: Record<string, unknown> = {
    interval: Number(form.repeat_option.interval)
  }
  if (form.repeat_type === "weekly") {
    repeatOption.days_of_week = [...form.repeat_option.days_of_week]
  } else if (form.repeat_type === "monthly" && form.repeat_type2 === "absolute_monthly") {
    repeatOption.days_of_month = [...form.repeat_option.days_of_month]
  } else if (form.repeat_type === "monthly" && form.repeat_type2 === "relative_monthly") {
    repeatOption.week_of_month = form.repeat_option.week_of_month
    repeatOption.days_of_week = [form.repeat_option.days_of_week[0] ?? 0]
  }
  payload.repeat_option = repeatOption

  return payload
}
