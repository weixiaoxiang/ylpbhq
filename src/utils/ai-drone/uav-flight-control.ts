/** 司空实时控制指令类型 */
export type FlightCommand = "return_home" | "return_home_cancel" | "flighttask_pause" | "flighttask_recovery"

/** 双按钮切换类型 */
export type FlightControlToggle = "return" | "pause"

/** 飞行控制状态 */
export interface FlightControlState {
  /** 返航中：返航按钮展示「取消返航」 */
  isReturning: boolean
  /** 已暂停：暂停按钮展示「恢复」 */
  isPaused: boolean
  /** 点击返航或取消返航后，暂停/恢复永久禁用 */
  pauseRecoveryLocked: boolean
}

/** 两个切换按钮的可点击状态 */
export interface FlightControlToggleButtonState {
  returnToggle: boolean
  pauseToggle: boolean
}

/** 指令中文文案 */
const FLIGHT_COMMAND_LABELS: Record<FlightCommand, string> = {
  return_home: "返航",
  return_home_cancel: "取消返航",
  flighttask_pause: "暂停",
  flighttask_recovery: "恢复"
}

/** 每次点击最少 loading 时长（毫秒） */
export const FLIGHT_COMMAND_LOADING_MS = 3000

/** 两次指令之间的最短间隔，防止频繁请求 */
export const FLIGHT_COMMAND_COOLDOWN_MS = 3000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/** 初始控制状态 */
export function createInitialFlightControlState(): FlightControlState {
  return {
    isReturning: false,
    isPaused: false,
    pauseRecoveryLocked: false
  }
}

/** 是否处于指令冷却期 */
export function isFlightCommandRateLimited(lastCommandAt: number): boolean {
  if (!lastCommandAt) return false
  return Date.now() - lastCommandAt < FLIGHT_COMMAND_COOLDOWN_MS
}

/** 返航切换按钮文案 */
export function getReturnToggleLabel(state: FlightControlState): string {
  return state.isReturning ? "取消返航" : "返航"
}

/** 暂停切换按钮文案 */
export function getPauseToggleLabel(state: FlightControlState): string {
  return state.isPaused ? "恢复" : "暂停"
}

/** 返航切换按钮当前应下发的指令 */
export function getReturnToggleCommand(state: FlightControlState): FlightCommand {
  return state.isReturning ? "return_home_cancel" : "return_home"
}

/** 暂停切换按钮当前应下发的指令 */
export function getPauseToggleCommand(state: FlightControlState): FlightCommand {
  return state.isPaused ? "flighttask_recovery" : "flighttask_pause"
}

/** 根据切换类型获取即将下发的指令 */
export function getToggleCommand(toggle: FlightControlToggle, state: FlightControlState): FlightCommand {
  return toggle === "return" ? getReturnToggleCommand(state) : getPauseToggleCommand(state)
}

/**
 * 计算两个切换按钮是否可点击
 * loading 或冷却期间全部禁用
 */
export function getFlightControlToggleButtonState(
  state: FlightControlState,
  isLoading: boolean,
  lastCommandAt = 0
): FlightControlToggleButtonState {
  if (isLoading || isFlightCommandRateLimited(lastCommandAt)) {
    return {
      returnToggle: false,
      pauseToggle: false
    }
  }

  return {
    returnToggle: true,
    pauseToggle: !state.pauseRecoveryLocked
  }
}

/** 指令下发成功后更新状态机 */
export function applyFlightCommandSuccess(state: FlightControlState, command: FlightCommand): FlightControlState {
  if (command === "return_home") {
    return {
      ...state,
      isReturning: true,
      pauseRecoveryLocked: true
    }
  }

  if (command === "return_home_cancel") {
    return {
      ...state,
      isReturning: false,
      pauseRecoveryLocked: true
    }
  }

  if (command === "flighttask_pause") {
    return {
      ...state,
      isPaused: true
    }
  }

  if (command === "flighttask_recovery") {
    return {
      ...state,
      isPaused: false
    }
  }

  return state
}

/** 返航指令是否需要二次确认 */
export function shouldConfirmFlightCommand(command: FlightCommand): boolean {
  return command === "return_home"
}

/** 获取指令成功提示文案 */
export function getFlightCommandSuccessMessage(command: FlightCommand): string {
  return `${FLIGHT_COMMAND_LABELS[command] || "指令"}下发成功`
}

/** 执行指令并保证最少 loading 时长 */
export async function runFlightCommandWithLoading<T>(task: () => Promise<T>): Promise<T> {
  const [result] = await Promise.all([task(), sleep(FLIGHT_COMMAND_LOADING_MS)])
  return result
}
