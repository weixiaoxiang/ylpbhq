<script lang="ts" setup>
import { Refresh, Search } from "@element-plus/icons-vue"
import Pagination from "@/components/Pagination/index.vue"
import { uavApi, type UavAirportDroneRow } from "@/api/uav"
import { isUavApiOk } from "@/utils/ai-drone/response"
import UavDeviceCaptureDialog from "./UavDeviceCaptureDialog.vue"
import UavFlightRecordDialog from "./UavFlightRecordDialog.vue"

/** 系统管理 — 无人机设备列表（逻辑对齐大鲵 uavDeviceManage） */
defineOptions({ name: "SystemUavDevice" })

const queryForm = reactive({
  page: 1,
  intPageSize: 15,
  keyWord: "",
  isFly: "" as boolean | ""
})

const tableData = ref<UavAirportDroneRow[]>([])
const total = ref(0)
const loading = ref(false)

const captureDialogRef = ref<InstanceType<typeof UavDeviceCaptureDialog> | null>(null)
const flyDialogRef = ref<InstanceType<typeof UavFlightRecordDialog> | null>(null)

async function getList() {
  loading.value = true
  tableData.value = []
  try {
    const payload = { ...queryForm }
    if (payload.isFly === "") delete (payload as { isFly?: boolean | "" }).isFly
    const res = (await uavApi.GetPageDrone(payload)) as {
      success?: boolean
      response?: UavAirportDroneRow[]
    }
    if (isUavApiOk(res) && Array.isArray(res.response)) {
      tableData.value = res.response
      total.value = res.response.length
    } else {
      total.value = 0
    }
  } finally {
    loading.value = false
  }
}

function search() {
  queryForm.page = 1
  getList()
}

function resetQuery() {
  queryForm.keyWord = ""
  queryForm.isFly = ""
  queryForm.page = 1
  getList()
}

function handleChangePage() {
  getList()
}

/** 设备型号：兼容 PascalCase / 缺字段 */
function formatAirportModel(row: UavAirportDroneRow & Record<string, unknown>): string {
  const name = row.airportName ?? row.AirportName ?? row.airportModel
  if (typeof name === "string" && name.trim()) return name.trim()
  return "—"
}

function firstDroneSn(row: UavAirportDroneRow): string | undefined {
  return row.drones?.[0]?.droneSn
}

function openCapture(row: UavAirportDroneRow) {
  captureDialogRef.value?.open(firstDroneSn(row))
}

function openFlyRecord(row: UavAirportDroneRow) {
  flyDialogRef.value?.open(firstDroneSn(row))
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="page">
    <div class="search-content">
      <el-form
        class="queryForm"
        :model="queryForm"
        label-width="auto"
        :inline="true"
        @keyup.enter="search"
      >
        <el-form-item label="关键词：">
          <el-input
            v-model="queryForm.keyWord"
            clearable
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="是否飞行中：">
          <el-select
            v-model="queryForm.isFly"
            teleported
            popper-class="system-select-popper"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option
              label="是"
              :value="true"
            />
            <el-option
              label="否"
              :value="false"
            />
          </el-select>
        </el-form-item>
        <el-form-item label-width="0">
          <el-button
            type="primary"
            :icon="Search"
            @click="search"
          >
            查询
          </el-button>
          <el-button
            :icon="Refresh"
            @click="resetQuery"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-box">
      <el-table
        v-loading="loading"
        class="tableList"
        v-adaptive="{ bottom: 68 }"
        :data="tableData"
        stripe
        empty-text="暂无数据，请调整筛选条件"
      >
        <el-table-column
          type="index"
          width="60"
          label="序号"
          align="center"
        />
        <el-table-column
          label="设备型号"
          min-width="180"
        >
          <template #default="{ row }">
            <div class="uav-device-stack">
              <div class="uav-device-model">{{ formatAirportModel(row) }}</div>
              <div
                v-for="(child, idx) in row.drones ?? []"
                :key="idx"
                class="uav-device-child"
              >
                <span class="uav-device-indent">└</span>
                <span>{{ child.droneCallsign || child.droneName || "—" }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="设备 SN"
          min-width="200"
        >
          <template #default="{ row }">
            <div class="uav-device-stack">
              <div>{{ row.airportSn || "—" }}</div>
              <div
                v-for="(child, idx) in row.drones ?? []"
                :key="idx"
              >
                {{ child.droneSn || "—" }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="设备名称"
          min-width="120"
        >
          <template #default="{ row }">
            <div class="uav-device-stack">
              <div>{{ row.airportCallsign || "—" }}</div>
              <div
                v-for="(_, idx) in row.drones ?? []"
                :key="idx"
              >
                —
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="在线状态"
          min-width="120"
        >
          <template #default="{ row }">
            <div class="uav-device-stack">
              <div>
                <el-tag
                  :type="row.airportModeCode === 4 ? 'danger' : 'success'"
                  size="small"
                >
                  {{ row.onlineStatus === 1 ? "作业中" : "非作业" }}
                </el-tag>
              </div>
              <div
                v-for="child in row.drones ?? []"
                :key="child.droneSn || child.droneCallsign"
              >
                <el-tag
                  :type="child.isFly === 1 ? 'danger' : 'success'"
                  size="small"
                >
                  {{ child.isFly === 1 ? "飞行中" : "未飞行" }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="位置信息"
          min-width="200"
        >
          <template #default="{ row }">
            <span v-if="row.airportLongitude != null && row.airportLatitude != null">
              ({{ Number(row.airportLongitude).toFixed(6) }}, {{ Number(row.airportLatitude).toFixed(6) }})
            </span>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column
          label="机备信息"
          align="center"
          min-width="200"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="openCapture(row)"
            >
              查看事件
            </el-button>
            <el-button
              link
              type="primary"
              @click="openFlyRecord(row)"
            >
              飞行记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div
        v-if="total > 0"
        class="pagination-box"
      >
        <Pagination
          v-model:total="total"
          v-model:page="queryForm.page"
          v-model:limit="queryForm.intPageSize"
          @pagination="handleChangePage"
        />
      </div>
    </div>

    <UavDeviceCaptureDialog ref="captureDialogRef" />
    <UavFlightRecordDialog ref="flyDialogRef" />
  </div>
</template>

<style scoped lang="scss">
.uav-device-model {
  font-weight: 600;
}

.uav-device-child {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.uav-device-indent {
  margin-right: 4px;
}
</style>
