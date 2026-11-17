<script lang="ts" setup>
import type Map from "ol/Map"
import type View from "ol/View"
import { uavApi } from "@/api/uav"
import { useDroneLiveTrack } from "@/composables/use-drone-live-track"
import { UAV_POSITION_POLL_MS } from "@/constants/uav-position-poll"
import { fetchExecutingWaylineForDevice } from "@/utils/ai-drone/fetch-executing-wayline"
import { getWaylineMapCache, peekWaylineMapCache } from "@/utils/ai-drone/wayline-map-cache"
import { resolveSikongWaylineQuery } from "@/utils/ai-drone/resolve-sikong-wayline"
import { createAiDroneSubMap, resizeAiDroneSubMap } from "@/utils/ai-drone/create-ai-drone-sub-map"
import { isUavApiOk } from "@/utils/ai-drone/response"
import {
  pickDroneFromResponse,
  resolveDeviceTargetFromSnapshot
} from "@/utils/ai-drone/drone-live-track/plan-device-match"
import type { DronePositionSnapshot } from "@/utils/ai-drone/drone-live-track/types"
import { computeWaylineStats, type WaylineStats, type WaylineWaypoint } from "@/utils/ai-drone/wayline-stats"
import { useDroneLayers } from "../use-drone-layers"

interface Props {
  deviceSn: string
  airportSn?: string
  projectUuid?: string
  droneProjectList?: Record<string, unknown>[]
  /** 全屏可见时才需要持续 updateSize */
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  airportSn: "",
  projectUuid: "",
  droneProjectList: () => [],
  active: true
})

const mapHost = ref<HTMLDivElement | null>(null)
const miniMap = shallowRef<Map | null>(null)
const waylineStats = ref<WaylineStats | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null
let resizeObserver: ResizeObserver | null = null
let waylineLoadedKey = ""
let pageDroneListCache: Record<string, unknown>[] | null = null

const layers = useDroneLayers(miniMap)

const liveTrack = useDroneLiveTrack({
  getMap: () => miniMap.value ?? undefined,
  getView: () => miniMap.value?.getView() as View | undefined
})

async function ensurePageDroneList(): Promise<Record<string, unknown>[]> {
  if (props.droneProjectList?.length) {
    return props.droneProjectList
  }
  if (pageDroneListCache) return pageDroneListCache
  try {
    const res = (await uavApi.GetPageDrone({ page: 1, intPageSize: 20 })) as {
      success?: boolean
      response?: Record<string, unknown>[]
    }
    if (isUavApiOk(res) && Array.isArray(res.response)) {
      pageDroneListCache = res.response.filter(
        (it) => Array.isArray((it as { drones?: unknown[] }).drones) && (it as { drones: unknown[] }).drones.length > 0
      )
    } else {
      pageDroneListCache = []
    }
  } catch {
    pageDroneListCache = []
  }
  return pageDroneListCache
}

function paintWayline(waypoints: WaylineWaypoint[]) {
  if (!miniMap.value || !waypoints.length) return
  waylineStats.value = computeWaylineStats(waypoints)
  layers.showWayline(waypoints, { variant: "plan", skipViewFit: true })
}

function tryApplyCachedWayline(uuid: string, airportSn: string) {
  const cached = getWaylineMapCache(uuid, airportSn) ?? peekWaylineMapCache()
  if (!cached?.waypoints?.length) return
  paintWayline(cached.waypoints)
}

async function loadExecutingWayline() {
  if (!miniMap.value) return
  const pageDroneList = await ensurePageDroneList()
  const { projectUuid: uuid, airportSn } = resolveSikongWaylineQuery(pageDroneList, {
    projectUuid: props.projectUuid,
    deviceSn: props.deviceSn,
    airportSn: props.airportSn
  })

  const loadKey = `remote:${uuid}:${airportSn}`
  if (loadKey === waylineLoadedKey && waylineStats.value) return

  tryApplyCachedWayline(uuid, airportSn)

  if (!uuid || !airportSn) return

  const result = await fetchExecutingWaylineForDevice(uuid, airportSn)
  if (!result?.waypoints?.length) return

  waylineLoadedKey = loadKey
  paintWayline(result.waypoints)
}

async function pollPositions() {
  try {
    const res = (await uavApi.GetDroneLastPosition({})) as {
      success?: boolean
      response?: DronePositionSnapshot[]
    }
    if (!isUavApiOk(res)) return
    const list = res.response || []
    const target = resolveDeviceTargetFromSnapshot({
      device_sn: props.deviceSn,
      airport_sn: props.airportSn
    })
    const drone = pickDroneFromResponse(list, target)
    if (!drone) return
    if (!liveTrack.isTracking()) {
      liveTrack.startDeviceTrack(target, list)
      return
    }
    liveTrack.feedPositions(list)
  } catch {
    /* 轮询失败静默，下次再试 */
  }
}

function initMap() {
  if (!mapHost.value || miniMap.value) return
  miniMap.value = createAiDroneSubMap(mapHost.value)
  resizeAiDroneSubMap(miniMap.value)
  void loadExecutingWayline()
}

function bindResizeObserver() {
  if (!mapHost.value || resizeObserver) return
  resizeObserver = new ResizeObserver(() => {
    resizeAiDroneSubMap(miniMap.value)
  })
  resizeObserver.observe(mapHost.value)
}

onMounted(async () => {
  await nextTick()
  initMap()
  bindResizeObserver()
  await pollPositions()
  pollTimer = setInterval(pollPositions, UAV_POSITION_POLL_MS)
})

watch(
  () => [props.projectUuid, props.airportSn, props.deviceSn, props.droneProjectList?.length] as const,
  () => {
    waylineLoadedKey = ""
    void loadExecutingWayline()
  }
)

watch(
  () => props.active,
  (visible) => {
    if (visible) {
      nextTick(() => {
        resizeAiDroneSubMap(miniMap.value)
        requestAnimationFrame(() => resizeAiDroneSubMap(miniMap.value))
      })
    }
  }
)

onBeforeUnmount(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  liveTrack.stopDeviceTrack()
  resizeObserver?.disconnect()
  resizeObserver = null
  layers.clearWayline()
  miniMap.value?.setTarget(undefined)
  miniMap.value = null
})
</script>

<template>
  <div class="drone-live-track-map-panel">
    <div
      v-if="waylineStats"
      class="drone-live-track-map-panel__stats"
    >
      <div class="drone-live-track-map-panel__stats-pill">
        <div class="drone-live-track-map-panel__stats-metric">
          <span class="drone-live-track-map-panel__stats-label">节点数量</span>
          <span class="drone-live-track-map-panel__stats-value">{{ waylineStats.nodeCount }}</span>
        </div>
        <span
          class="drone-live-track-map-panel__stats-divider"
          aria-hidden="true"
        />
        <div class="drone-live-track-map-panel__stats-metric">
          <span class="drone-live-track-map-panel__stats-label">航线长度</span>
          <span class="drone-live-track-map-panel__stats-value">{{ waylineStats.lengthLabel }}</span>
        </div>
      </div>
    </div>
    <div
      ref="mapHost"
      class="drone-live-track-map-panel__map"
    />
  </div>
</template>

<style scoped lang="scss">
.drone-live-track-map-panel {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;

  &__map {
    width: 100%;
    height: 100%;
  }

  &__stats {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 5;
    display: flex;
    justify-content: center;
    padding-top: 16px;
    pointer-events: none;
  }
}
</style>
