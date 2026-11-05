/** 右侧看板宽度（一张图，与 maptool-sidebar-right 联动） */
export const AI_DRONE_BOARD_WIDTH = 660

/** AI 分析页：底部视频库高度（对齐一张图抓拍条，与地图工具条 bottom 联动） */
export const AI_DRONE_AI_ANALYSIS_VIDEO_HEIGHT = 268

/** AI 分析页：底部视频库与容器底边间距 */
export const AI_DRONE_AI_ANALYSIS_VIDEO_GAP = 10

/** AI 分析页：右侧研判列表宽度 */
export const AI_DRONE_AI_ANALYSIS_RIGHT_WIDTH = 420

/** 左侧 PageTabs 占用宽度（与 pages-tabs 定位一致） */
export const AI_DRONE_TABS_OFFSET = 200

/** AI 分析：地图区设备栏宽度（与图例右缘对齐） */
export const AI_DRONE_AI_ANALYSIS_DEVICE_RAIL_WIDTH = 268

/** AI 分析：地图图例与设备栏距容器顶（与 section-bar 32px 高对齐） */
export const AI_DRONE_AI_ANALYSIS_MAP_OVERLAY_TOP = 18

/** 右侧看板距容器右缘（与各子页 aside 的 right: 10px 一致，图例定位需叠加此值） */
export const AI_DRONE_PANEL_EDGE_INSET = 10

/** AI 分析：设备栏 / 图例距右侧面板左缘间距 */
export const AI_DRONE_AI_ANALYSIS_OVERLAY_GAP = 12

/** AI 分析：图例占位宽（MapLayerManage min-width 145px + 边距，用于设备栏 right 计算） */
export const AI_DRONE_AI_ANALYSIS_LEGEND_WIDTH = 168

/** AI 分析：设备栏与图例水平间距 */
export const AI_DRONE_AI_ANALYSIS_LEGEND_DEVICE_GAP = 12

/** 一张图底部「最新抓拍」面板高度（与地图工具条、左侧菜单居中联动） */
export const AI_DRONE_ONE_MAP_CAPTURE_HEIGHT = 268

/** 抓拍面板距容器底边间距 */
export const AI_DRONE_ONE_MAP_CAPTURE_GAP = 10

/** 事件预警：右侧统计栏宽度 */
export const AI_DRONE_EVENT_WARNING_STATS_WIDTH = 380

/** 事件预警：「今日预警」面板最小高度（与大鲵一致，单独占一块可视区） */
export const AI_DRONE_EVENT_WARNING_TODAY_MIN_HEIGHT = 300

/** 事件预警：预警事件列（地图与统计栏之间） */
export const AI_DRONE_EVENT_WARNING_EVENT_WIDTH = 340

/** 事件预警：底部「预警类型分析」高度（与 AI 分析视频库一致） */
export const AI_DRONE_EVENT_WARNING_BOTTOM_HEIGHT = AI_DRONE_AI_ANALYSIS_VIDEO_HEIGHT

/** 事件预警：「预警统计」面板最小高度 */
export const AI_DRONE_EVENT_WARNING_KPI_MIN_HEIGHT = 132

/** 事件预警：「预警分析」面板最小高度 */
export const AI_DRONE_EVENT_WARNING_ANALYSIS_MIN_HEIGHT = 148

/** 事件预警：面板间距 */
export const AI_DRONE_EVENT_WARNING_PANEL_GAP = 10

/** 航飞计划：右侧「计划库」宽度（与 AI 分析研判列一致，图例/工具条共用同一 right 栈） */
export const AI_DRONE_FLIGHT_PLAN_PANEL_WIDTH = AI_DRONE_AI_ANALYSIS_RIGHT_WIDTH

/** 航线统计条距左侧 Tab、右侧看板的内边距（与大鲵 hfjh 地图顶栏一致） */
export const AI_DRONE_WAYLINE_STATS_EDGE_GAP = 16

/** 顶部 Tab / 图例行占用高度（PageTabs 与 section-bar 区域，用于地图可视区上边界） */
export const AI_DRONE_MAP_TOP_CHROME = 48

/** 打开直播时，机位在可视区中心的向下微调（弹框在机位上方，略下移避免整体偏上） */
export const AI_DRONE_LIVE_VIEW_FOCUS_BIAS_Y = 56

/** 各子页地图默认 center + zoom（切换 Tab 时恢复） */
export interface AiDroneMapInitialView {
  center: [number, number]
  zoom: number
}

export const AI_DRONE_MAP_INITIAL_ONE_MAP: AiDroneMapInitialView = {
  center: [116.21409542422317, 30.992958207902763],
  zoom: 12
}

export const AI_DRONE_MAP_INITIAL_AI_ANALYSIS: AiDroneMapInitialView = {
  center: [116.17246754031204, 30.991241151136126],
  zoom: 12
}

export const AI_DRONE_MAP_INITIAL_EVENT_WARNING: AiDroneMapInitialView = {
  center: [116.22718460421585, 30.986304612932045],
  zoom: 12
}

export const AI_DRONE_MAP_INITIAL_FLIGHT_PLAN: AiDroneMapInitialView = {
  center: [116.13890745637595, 31.03078475053754],
  zoom: 13
}

/** 按路由 path 解析当前子页默认视野 */
export function resolveAiDroneMapInitialView(path: string): AiDroneMapInitialView {
  if (path.includes("/aiAnalysis")) return AI_DRONE_MAP_INITIAL_AI_ANALYSIS
  if (path.includes("/eventWarning")) return AI_DRONE_MAP_INITIAL_EVENT_WARNING
  if (path.includes("/flightPlan")) return AI_DRONE_MAP_INITIAL_FLIGHT_PLAN
  return AI_DRONE_MAP_INITIAL_ONE_MAP
}

/** AI 分析：左侧 Tab 列占用（与 .pages-tabs left:10 + 宽度一致） */
export function getAiAnalysisLeftMapInset(): number {
  return AI_DRONE_PANEL_EDGE_INSET + AI_DRONE_TABS_OFFSET
}

/** AI 分析：右侧浮层占用（研判列 + 图例 + 设备栏，地图主视野在偏左上方） */
export function getAiAnalysisRightMapInset(): number {
  return (
    AI_DRONE_PANEL_EDGE_INSET +
    AI_DRONE_AI_ANALYSIS_RIGHT_WIDTH +
    AI_DRONE_AI_ANALYSIS_OVERLAY_GAP +
    AI_DRONE_AI_ANALYSIS_LEGEND_WIDTH +
    AI_DRONE_AI_ANALYSIS_LEGEND_DEVICE_GAP +
    AI_DRONE_AI_ANALYSIS_DEVICE_RAIL_WIDTH
  )
}

/** AI 分析：底部视频库占用高度 */
export function getAiAnalysisBottomMapInset(): number {
  return AI_DRONE_AI_ANALYSIS_VIDEO_HEIGHT + AI_DRONE_AI_ANALYSIS_VIDEO_GAP + AI_DRONE_PANEL_EDGE_INSET
}

/** AI 分析事件类型，与大鲵筛选、研判类别一致 */
export const UAV_AI_EVENT_CLASS_OPTIONS = [
  { label: "车辆", value: "车辆" },
  { label: "行人", value: "行人" },
  { label: "施工车辆", value: "施工车辆" },
  { label: "垂钓", value: "fishing" },
  { label: "无效", value: "无效" }
]
