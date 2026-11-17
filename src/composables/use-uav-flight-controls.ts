/**
 * 无人机直播画面：司空返航 / 暂停（悬停）控制
 */
import { uavApi } from "@/api/uav"
import {
  AI_DRONE_FLIGHT_CONFIRM_MESSAGE_CLASS,
  AI_DRONE_MAP_MODE_MESSAGE_Z_INDEX
} from "@/views/patrol/aiDrone/constants"
import { resolveSikongAuth } from "@/utils/ai-drone/sikong-token"
import {
  FLIGHT_COMMAND_COOLDOWN_MS,
  applyFlightCommandSuccess,
  createInitialFlightControlState,
  getFlightCommandSuccessMessage,
  getFlightControlToggleButtonState,
  getPauseToggleLabel,
  getReturnToggleLabel,
  getToggleCommand,
  isFlightCommandRateLimited,
  runFlightCommandWithLoading,
  shouldConfirmFlightCommand,
  type FlightControlState,
  type FlightControlToggle
} from "@/utils/ai-drone/uav-flight-control"

export interface UseUavFlightControlsOptions {
  airportSn: () => string
  deviceSn: () => string
  projectUuid: () => string
  /** 是否处于飞行中 */
  isFlying: () => boolean
  /** 弹窗有效且正在展示直播 */
  enabled: () => boolean
}

/** 飞行控制相关提示须压在地图模式全屏之上 */
function flightControlMessageOptions() {
  return { zIndex: AI_DRONE_MAP_MODE_MESSAGE_Z_INDEX, appendTo: document.body }
}

function flightControlConfirmOptions() {
  return {
    ...flightControlMessageOptions(),
    customClass: AI_DRONE_FLIGHT_CONFIRM_MESSAGE_CLASS,
    lockScroll: true,
    closeOnClickModal: false
  }
}

export function useUavFlightControls(options: UseUavFlightControlsOptions) {
  const flightControlState = ref<FlightControlState>(createInitialFlightControlState())
  const loadingFlightToggle = ref<FlightControlToggle | "">("")
  const lastFlightCommandAt = ref(0)

  /** 司空指令下发目标：优先机场 SN */
  const commandDeviceSn = computed(() => options.airportSn() || options.deviceSn())

  const sikongHeader = computed(() => resolveSikongAuth(options.projectUuid()))

  const showFlightControlBar = computed(
    () => options.enabled() && options.isFlying() && !!commandDeviceSn.value && !!sikongHeader.value
  )

  const returnToggleLabel = computed(() => getReturnToggleLabel(flightControlState.value))
  const pauseToggleLabel = computed(() => getPauseToggleLabel(flightControlState.value))

  const flightControlToggleButtons = computed(() =>
    getFlightControlToggleButtonState(flightControlState.value, !!loadingFlightToggle.value, lastFlightCommandAt.value)
  )

  function resetFlightControlState() {
    flightControlState.value = createInitialFlightControlState()
    loadingFlightToggle.value = ""
    lastFlightCommandAt.value = 0
  }

  function syncControls() {
    if (!options.enabled() || !options.isFlying()) {
      resetFlightControlState()
    }
  }

  function disposeControls() {
    resetFlightControlState()
  }

  async function handleFlightToggle(toggle: FlightControlToggle) {
    const toggleButtons = flightControlToggleButtons.value
    if (
      (toggle === "return" && !toggleButtons.returnToggle) ||
      (toggle === "pause" && !toggleButtons.pauseToggle) ||
      loadingFlightToggle.value
    ) {
      return
    }

    if (isFlightCommandRateLimited(lastFlightCommandAt.value)) {
      ElMessage.warning({
        message: `操作过于频繁，请 ${FLIGHT_COMMAND_COOLDOWN_MS / 1000}s 后再试`,
        ...flightControlMessageOptions()
      })
      return
    }

    const command = getToggleCommand(toggle, flightControlState.value)
    const header = sikongHeader.value
    const sn = commandDeviceSn.value
    if (!header || !sn) {
      ElMessage.error({
        message: "缺少司空鉴权信息，无法下发控制指令",
        ...flightControlMessageOptions()
      })
      return
    }

    if (shouldConfirmFlightCommand(command)) {
      try {
        await ElMessageBox.confirm("确认对该无人机下发返航指令？", "提示", {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning",
          ...flightControlConfirmOptions()
        })
      } catch {
        return
      }
    }

    loadingFlightToggle.value = toggle
    lastFlightCommandAt.value = Date.now()
    try {
      const res = await runFlightCommandWithLoading(() =>
        uavApi.sendFlightCommand(header, sn, { device_command: command })
      )
      if (res?.code === 0) {
        flightControlState.value = applyFlightCommandSuccess(flightControlState.value, command)
        ElMessage.success({
          message: getFlightCommandSuccessMessage(command),
          ...flightControlMessageOptions()
        })
      } else {
        ElMessage.error({
          message: res?.message || res?.msg || "指令下发失败",
          ...flightControlMessageOptions()
        })
      }
    } catch {
      ElMessage.error({
        message: "指令下发失败，请稍后重试",
        ...flightControlMessageOptions()
      })
    } finally {
      loadingFlightToggle.value = ""
    }
  }

  watch(
    () => [options.enabled(), options.isFlying()] as const,
    () => syncControls()
  )

  onBeforeUnmount(() => {
    disposeControls()
  })

  return {
    showFlightControlBar,
    returnToggleLabel,
    pauseToggleLabel,
    flightControlToggleButtons,
    loadingFlightToggle,
    handleFlightToggle,
    syncControls,
    disposeControls,
    resetFlightControlState
  }
}
