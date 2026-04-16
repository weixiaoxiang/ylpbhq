<script lang="ts" setup>
import { GetInfraredCamera_Rlt, GetIrcameraWgList } from "@/api"
import useOlMap from "@/hooks/useOlMap"

interface Props {
  /** 与 GetPestEquipmentStatistics_Rlfbt 一致的查询参数，如 startTime、endTime 及业务筛选字段 */
  apiParams?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  apiParams: () => ({})
})

/** 接口单行：经纬度 + 数值，weight 由 value 相对极值归一化到 [0,1] */
interface HeatPointRow {
  name?: string
  lon: number | string
  lat: number | string
  value: number | string
  weight?: number
}

function withNormalizedWeight(rows: HeatPointRow[]): HeatPointRow[] {
  const values = rows.map((row) => Number(row.value)).filter((n) => !Number.isNaN(n))
  if (values.length === 0) {
    return rows.map((row) => ({ ...row, weight: 0 }))
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  return rows.map((row) => {
    const v = Number(row.value)
    if (Number.isNaN(v)) {
      return { ...row, weight: 0 }
    }
    const weight = max === min ? 1 : (v - min) / (max - min)
    return { ...row, weight }
  })
}

const MAP_TARGET = "infrared-species-heat-map"
const modular = ref("红外相机监测")
const { addWzHeatMapData, addHwxjWgPolygon, addLayerManageData, removeLayerManageData } = useOlMap(undefined, {
  target: MAP_TARGET,
  zoom: 13,
  center: [116.1292869, 31.030022]
})

/** 仅展示 apiParams.dwname，空则不渲染卡片 */
const dwnameDisplay = computed(() => String(props.apiParams?.dwname ?? "").trim())

// 获得红外相机网格并加载在地图上
const getHwxjWgList = async () => {
  const { response } = await GetIrcameraWgList()
  addHwxjWgPolygon(response)
}
onMounted(async () => {
  try {
    getHwxjWgList()
    const { response } = await GetInfraredCamera_Rlt({
      ...props.apiParams
    })
    const list = Array.isArray(response) ? (response as HeatPointRow[]) : []
    addWzHeatMapData(withNormalizedWeight(list))
  } catch {
    ElMessage.error("热力图数据加载失败")
  }
})
</script>

<template>
  <div class="panzoom-exclude">
    <div
      :id="MAP_TARGET"
      class="map-box"
    >
      <div
        v-if="dwnameDisplay"
        class="species-card"
        role="status"
      >
        <div class="species-card__accent" />
        <div class="species-card__body">
          <div class="species-card__label">
            <span class="species-card__dot" />
            物种名称
          </div>
          <div
            class="species-card__value"
            :title="dwnameDisplay"
          >
            {{ dwnameDisplay }}
          </div>
        </div>
      </div>
      <div class="section-bar">
        <MapLayerManage
          :modular="modular"
          :init-checked-keys="[35]"
          @addLayer="addLayerManageData"
          @removeLayer="removeLayerManageData"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map-box {
  position: relative;
  width: 1500px;
  height: 900px;
  background-color: rgba(0, 0, 0, 1);

  .species-card {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
    min-width: 200px;
    max-width: min(360px, 42vw);
    padding: 1px;
    border-radius: 12px;
    background: linear-gradient(
      135deg,
      rgba(64, 180, 255, 0.45) 0%,
      rgba(32, 90, 140, 0.25) 50%,
      rgba(64, 180, 255, 0.2) 100%
    );
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  }

  .species-card__accent {
    position: absolute;
    left: 14px;
    top: 50%;
    width: 3px;
    height: 56%;
    border-radius: 2px;
    transform: translateY(-50%);
    background: linear-gradient(180deg, #5dcef5 0%, #2b8ec9 50%, #1a5a8a 100%);
    opacity: 0.95;
  }

  .species-card__body {
    position: relative;
    padding: 12px 18px 12px 26px;
    border-radius: 11px;
    background: linear-gradient(160deg, rgba(18, 42, 68, 0.94) 0%, rgba(8, 22, 40, 0.92) 100%);
    backdrop-filter: blur(14px);
  }

  .species-card__label {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    color: rgba(160, 210, 255, 0.72);
  }

  .species-card__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ec9ff;
    box-shadow: 0 0 10px rgba(78, 201, 255, 0.75);
  }

  .species-card__value {
    font-size: 17px;
    font-weight: 600;
    line-height: 1.45;
    color: #f0f8ff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }

  .section-bar {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    display: flex;
    gap: 15px;
    height: 32px;
    transition: opacity 0.3s ease-in-out;
  }
}
</style>
