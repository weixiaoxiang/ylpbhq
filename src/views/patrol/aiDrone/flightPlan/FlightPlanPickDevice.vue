<script lang="ts" setup>
import { uavApi } from "@/api/uav"
import { mapDroneDeviceItem } from "@/utils/ai-drone/sikong-token"
import { isUavApiOk } from "@/utils/ai-drone/response"

/** 新建计划：选择机场设备（对齐大鲵 leftListSB） */
defineOptions({ name: "FlightPlanPickDevice" })

const emit = defineEmits<{
  back: []
  pick: [device: Record<string, unknown>]
}>()

const loading = ref(false)
const devices = ref<Record<string, unknown>[]>([])

function deviceLabel(item: Record<string, unknown>) {
  return String(item.airportCallsign || item.device_name || item.droneName || "未命名机场")
}

async function loadDevices() {
  loading.value = true
  try {
    const res = (await uavApi.GetPageDrone({ page: 1, intPageSize: 20 })) as {
      response?: Record<string, unknown>[]
    }
    if (!isUavApiOk(res) || !Array.isArray(res.response)) {
      devices.value = []
      return
    }
    devices.value = res.response
      .filter((row) => Array.isArray(row.drones) && (row.drones as unknown[]).length > 0)
      .map((item) => mapDroneDeviceItem(item as { drones?: Record<string, unknown>[] }))
      .filter(Boolean) as Record<string, unknown>[]
  } finally {
    loading.value = false
  }
}

onMounted(loadDevices)
</script>

<template>
  <div
    v-loading="loading"
    class="flight-plan-pick"
    element-loading-background="rgba(8, 24, 48, 0.72)"
  >
    <div class="flight-plan-pick__head">
      <span
        >设备 <b>{{ devices.length }}</b></span
      >
      <button
        type="button"
        class="flight-plan-pick__back"
        @click="emit('back')"
      >
        退出
      </button>
    </div>
    <ul class="flight-plan-pick__list ai-scroll">
      <li
        v-for="(item, index) in devices"
        :key="String(item.airportSn || item.device_sn || index)"
        class="flight-plan-pick__row"
        @click="emit('pick', item)"
      >
        <div class="flight-plan-pick__row-head">
          <span>{{ deviceLabel(item) }}</span>
          <span
            class="flight-plan-pick__tag"
            :class="item.airportOnlineStatus ? 'is-online' : 'is-offline'"
          >
            {{ item.airportOnlineStatus ? "在线" : "不在线" }}
          </span>
        </div>
        <p class="flight-plan-pick__meta">{{ item.isFly ? "设备工作中" : "设备空闲中" }}</p>
        <p class="flight-plan-pick__meta">{{ item.droneName || "—" }}</p>
      </li>
      <li
        v-if="!loading && devices.length === 0"
        class="flight-plan-pick__empty"
      >
        暂无数据
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@import "./flight-plan-theme.scss";

.flight-plan-pick {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 10px;
  border-radius: 8px;
  border: 1px solid rgba(56, 98, 140, 0.35);
  background: linear-gradient(165deg, rgba(10, 32, 58, 0.72), rgba(6, 18, 36, 0.55));
}

.flight-plan-pick__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #9ad4ff;
  border-bottom: 1px solid rgba(56, 98, 140, 0.4);

  b {
    margin-left: 6px;
    color: #6ec4ff;
    font-weight: 600;
  }
}

.flight-plan-pick__back {
  padding: 4px 12px;
  font-size: 12px;
  color: #6ec4ff;
  border: 1px solid rgba(88, 186, 241, 0.45);
  border-radius: 4px;
  background: rgba(10, 32, 58, 0.92);
  cursor: pointer;

  &:hover {
    background: rgba(28, 72, 110, 0.65);
  }
}

.flight-plan-pick__list {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
}

.flight-plan-pick__row {
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid rgba(56, 98, 140, 0.45);
  border-radius: 6px;
  background: rgba(8, 24, 48, 0.65);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: rgba(88, 186, 241, 0.5);
    box-shadow: 0 0 0 1px rgba(88, 186, 241, 0.12);
  }
}

.flight-plan-pick__row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
  font-weight: 600;
}

.flight-plan-pick__tag {
  flex-shrink: 0;
  padding: 0 6px;
  font-size: 11px;
  border-radius: 2px;

  &.is-online {
    color: #7ec8ff;
    border: 1px solid rgba(126, 200, 255, 0.45);
  }

  &.is-offline {
    color: #ff8a8a;
    border: 1px solid rgba(255, 138, 138, 0.45);
  }
}

.flight-plan-pick__meta {
  margin: 0;
  font-size: 11px;
  color: rgba(190, 204, 220, 0.75);
  line-height: 1.5;
}

.flight-plan-pick__empty {
  padding: 32px 8px;
  text-align: center;
  color: rgba(255, 255, 255, 0.45);
  list-style: none;
}

.ai-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(62, 140, 210, 0.5) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(62, 140, 210, 0.45);
    border-radius: 4px;
  }
}
</style>
