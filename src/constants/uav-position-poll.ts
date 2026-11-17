/** GetDroneLastPosition 轮询间隔（ms），与实时飞行动画 duration 一致 */
export const UAV_POSITION_POLL_MS = 20_000

/** 低于该位移（米）视为抖动，不触发轨迹/飞行动画 */
export const UAV_POSITION_MIN_MOVE_METERS = 5
