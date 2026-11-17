import type Map from "ol/Map"
import type View from "ol/View"
import droneFlyingIcon from "@/assets/images/ai-drone/drone-flying.png"
import {
  createDroneLiveTrackController,
  type DroneLiveTrackController
} from "@/utils/ai-drone/drone-live-track/drone-live-track-controller"
import {
  pickDroneFromResponse,
  resolveDeviceTargetFromSnapshot,
  resolvePlanDeviceTarget,
  snapshotMatchesTarget
} from "@/utils/ai-drone/drone-live-track/plan-device-match"
import { snapshotToLonLat } from "@/utils/ai-drone/drone-live-track/coord-utils"
import { UAV_POSITION_MIN_MOVE_METERS } from "@/constants/uav-position-poll"
import type { DronePositionSnapshot, PlanDeviceTarget } from "@/utils/ai-drone/drone-live-track/types"

interface UseDroneLiveTrackOptions {
  getMap: () => Map | undefined
  getView: () => View | undefined
}

export function useDroneLiveTrack(options: UseDroneLiveTrackOptions) {
  let controller: DroneLiveTrackController | null = null
  let activeTarget: PlanDeviceTarget | null = null
  let tracking = false

  function ensureController(): DroneLiveTrackController | null {
    const map = options.getMap()
    const view = options.getView()
    if (!map || !view) return null
    if (!controller) {
      controller = createDroneLiveTrackController(map, view, {
        iconUrl: droneFlyingIcon,
        fixedZoom: 17,
        minMoveMeters: UAV_POSITION_MIN_MOVE_METERS
      })
    }
    return controller
  }

  function startDeviceTrack(target: PlanDeviceTarget, initialList?: DronePositionSnapshot[]) {
    activeTarget = { ...target }
    tracking = true

    const ctrl = ensureController()
    if (!ctrl) return

    const drone = pickDroneFromResponse(initialList, activeTarget)
    const pos = snapshotToLonLat(drone)
    if (pos) {
      ctrl.startAt(pos)
    }
  }

  function startDeviceTrackFromSnapshot(snapshot: DronePositionSnapshot, initialList?: DronePositionSnapshot[]) {
    startDeviceTrack(resolveDeviceTargetFromSnapshot(snapshot), initialList ?? [snapshot])
  }

  function startPlanTrack(
    plan: Record<string, unknown>,
    fallbackAirportSn?: string,
    initialList?: DronePositionSnapshot[]
  ) {
    activeTarget = resolvePlanDeviceTarget(plan, fallbackAirportSn)
    tracking = true

    const ctrl = ensureController()
    if (!ctrl) return

    const drone = pickDroneFromResponse(initialList, activeTarget)
    const pos = snapshotToLonLat(drone)
    if (pos) {
      ctrl.startAt(pos)
    }
  }

  function stopPlanTrack() {
    tracking = false
    activeTarget = null
    controller?.stop()
  }

  function stopDeviceTrack() {
    stopPlanTrack()
  }

  function feedPositions(list: DronePositionSnapshot[]) {
    if (!tracking || !activeTarget) return

    const drone = pickDroneFromResponse(list, activeTarget)
    if (!drone) return

    if (!drone.is_fly) {
      const wasTracking = tracking
      const ctrl = ensureController()
      ctrl?.finishFlight(snapshotToLonLat(drone))
      tracking = false
      activeTarget = null
      if (wasTracking) {
        const label = drone.device_name?.toString().trim() || "该无人机"
        ElMessage.success({
          message: `${label} 飞行已结束，地图已保留本次飞行轨迹。`,
          duration: 5000
        })
      }
      return
    }

    const pos = snapshotToLonLat(drone)
    if (!pos) return

    const ctrl = ensureController()
    if (!ctrl) return

    if (!ctrl.isActive()) {
      ctrl.startAt(pos)
      return
    }
    ctrl.onPoll(pos)
  }

  /** 跟踪中时从 loadDrone 列表中剔除该机，避免双图标 */
  function filterDevicesForMap(list: DronePositionSnapshot[]): DronePositionSnapshot[] {
    if (!tracking || !activeTarget) return list
    return list.filter((it) => !snapshotMatchesTarget(it, activeTarget!))
  }

  function isTracking(): boolean {
    return tracking
  }

  return {
    startPlanTrack,
    startDeviceTrack,
    startDeviceTrackFromSnapshot,
    stopPlanTrack,
    stopDeviceTrack,
    feedPositions,
    filterDevicesForMap,
    isTracking
  }
}
