<script lang="ts" setup>
import Feature from "ol/Feature"
import Map from "ol/Map"
import View from "ol/View"
import LineString from "ol/geom/LineString"
import Point from "ol/geom/Point"
import TileLayer from "ol/layer/Tile"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import XYZ from "ol/source/XYZ"
import { Fill, Stroke, Style, Circle } from "ol/style"

/** 抓拍详情内嵌飞行轨迹小地图（EPSG:4326） */
interface FlyPoint {
  longitude: number
  latitude: number
}

interface TrajectoryPayload {
  longitude?: number
  latitude?: number
  geom?: FlyPoint[]
}

const props = defineProps<{
  payload: TrajectoryPayload | null
}>()

const mapHost = ref<HTMLDivElement | null>(null)
let map: Map | null = null
let trackLayer: VectorLayer<VectorSource> | null = null

function buildTrackSource(payload: TrajectoryPayload | null) {
  const source = new VectorSource()
  if (!payload) return source

  const points = Array.isArray(payload.geom) ? payload.geom : []
  const coords = points
    .map((p) => [Number(p.longitude), Number(p.latitude)] as [number, number])
    .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat))

  if (coords.length >= 2) {
    const line = new Feature({ geometry: new LineString(coords) })
    line.setStyle(
      new Style({
        stroke: new Stroke({ color: "#ffb020", width: 3 })
      })
    )
    source.addFeature(line)
  }

  const snapLon = Number(payload.longitude)
  const snapLat = Number(payload.latitude)
  if (Number.isFinite(snapLon) && Number.isFinite(snapLat)) {
    const snap = new Feature({ geometry: new Point([snapLon, snapLat]) })
    snap.setStyle(
      new Style({
        image: new Circle({
          radius: 7,
          fill: new Fill({ color: "#7ec8ff" }),
          stroke: new Stroke({ color: "#fff", width: 2 })
        })
      })
    )
    source.addFeature(snap)
  }

  return source
}

function renderTrack() {
  if (!map || !trackLayer) return
  const source = buildTrackSource(props.payload)
  trackLayer.setSource(source)
  if (source.getFeatures().length === 0) return
  map.getView().fit(source.getExtent(), { padding: [24, 24, 24, 24], maxZoom: 16, duration: 200 })
}

function initMap() {
  if (!mapHost.value || map) return
  trackLayer = new VectorLayer({ source: new VectorSource(), zIndex: 2 })
  map = new Map({
    target: mapHost.value,
    layers: [
      new TileLayer({
        source: new XYZ({
          url: "https://t6.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"
        })
      }),
      trackLayer
    ],
    view: new View({
      projection: "EPSG:4326",
      center: [116.06260425906204, 31.02858713581041],
      zoom: 12,
      minZoom: 3,
      maxZoom: 18
    }),
    controls: []
  })
  renderTrack()
}

watch(
  () => props.payload,
  () => renderTrack(),
  { deep: true }
)

onMounted(() => {
  nextTick(() => initMap())
})

onBeforeUnmount(() => {
  map?.setTarget(undefined)
  map = null
  trackLayer = null
})
</script>

<template>
  <div class="event-traj-map">
    <div
      ref="mapHost"
      class="event-traj-map__canvas"
    />
    <div
      v-if="!payload?.geom?.length"
      class="event-traj-map__empty"
    >
      暂无轨迹数据
    </div>
  </div>
</template>

<style scoped lang="scss">
.event-traj-map {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 120px;
  overflow: hidden;
  border-radius: 6px;
}

.event-traj-map__canvas {
  width: 100%;
  height: 100%;
}

.event-traj-map__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: rgba(201, 215, 234, 0.65);
  pointer-events: none;
  background: rgba(6, 16, 30, 0.35);
}
</style>
