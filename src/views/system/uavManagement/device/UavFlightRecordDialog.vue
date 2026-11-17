<script lang="ts" setup>
import { Search } from "@element-plus/icons-vue"
import Dialog from "@/components/Dialog/index.vue"
import Pagination from "@/components/Pagination/index.vue"
import { uavApi, type UavVideoLibItem } from "@/api/uav"
import { uavFileUrl } from "@/utils/ai-drone/file-url"
import { isUavApiOk } from "@/utils/ai-drone/response"

defineOptions({ name: "UavFlightRecordDialog" })

const visible = ref(false)
const loading = ref(false)
const dateRange = ref<string[]>([])
const tableData = ref<UavVideoLibItem[]>([])
const total = ref(0)
const deviceOptions = ref<{ label: string; value: string }[]>([])

const queryForm = reactive({
  page: 1,
  intPageSize: 12,
  sn: "" as string
})

function resolveCover(path?: string) {
  if (!path) return ""
  return uavFileUrl(path)
}

async function loadDeviceOptions() {
  try {
    const res = (await uavApi.GetDroneLastPosition()) as {
      success?: boolean
      response?: { device_sn?: string; device_name?: string }[]
    }
    if (isUavApiOk(res) && Array.isArray(res.response)) {
      deviceOptions.value = res.response
        .filter((d) => d.device_sn)
        .map((d) => ({
          label: d.device_name || d.device_sn || "",
          value: d.device_sn as string
        }))
    }
  } catch {
    deviceOptions.value = []
  }
}

async function getList() {
  loading.value = true
  tableData.value = []
  try {
    const res = (await uavApi.GetPageAIVideoLib({
      ...queryForm,
      startTime: dateRange.value?.[0],
      endTime: dateRange.value?.[1],
      sn: queryForm.sn || undefined
    })) as {
      success?: boolean
      response?: { data?: UavVideoLibItem[]; dataCount?: number }
    }
    if (isUavApiOk(res) && res.response) {
      tableData.value = res.response.data ?? []
      total.value = res.response.dataCount ?? 0
    } else {
      total.value = 0
    }
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.page = 1
  getList()
}

function handleClose() {
  visible.value = false
  tableData.value = []
  total.value = 0
  dateRange.value = []
  queryForm.sn = ""
  queryForm.page = 1
}

/** 打开弹窗并可选默认设备 SN */
async function open(initialSn?: string) {
  visible.value = true
  queryForm.page = 1
  queryForm.sn = initialSn ?? ""
  dateRange.value = []
  await loadDeviceOptions()
  await getList()
}

defineExpose({ open })
</script>

<template>
  <Dialog
    v-model="visible"
    title="飞行录像管理"
    w="960px"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="uav-flight-record">
      <div class="search-content">
        <el-form
          :inline="true"
          label-width="auto"
        >
          <el-form-item label="时间：">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="-"
              value-format="YYYY-MM-DD"
              start-placeholder="开始"
              end-placeholder="结束"
              teleported
            />
          </el-form-item>
          <el-form-item label="设备：">
            <el-select
              v-model="queryForm.sn"
              clearable
              placeholder="抓拍设备"
              teleported
              popper-class="system-select-popper"
              filterable
              style="width: 180px"
            >
              <el-option
                v-for="item in deviceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :icon="Search"
              @click="handleSearch"
            >
              搜索
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <ul
        v-loading="loading"
        class="uav-flight-record__grid"
      >
        <li
          v-for="(item, index) in tableData"
          :key="index"
          class="uav-flight-record__card"
        >
          <el-image
            class="uav-flight-record__cover"
            :src="resolveCover(item.cover_path_local)"
            fit="cover"
          >
            <template #error>
              <div class="uav-flight-record__cover-fallback">暂无封面</div>
            </template>
          </el-image>
          <div class="uav-flight-record__meta">
            <p class="uav-flight-record__name">{{ item.name || "—" }}</p>
            <p class="uav-flight-record__sub">
              {{ item.drone_name || "—" }}
              <span v-if="item.create_time">{{ item.create_time }}</span>
            </p>
          </div>
        </li>
        <li
          v-if="!loading && tableData.length === 0"
          class="uav-flight-record__empty"
        >
          <el-empty description="暂无数据" />
        </li>
      </ul>

      <div
        v-if="total > 0"
        class="pagination-box"
      >
        <Pagination
          v-model:total="total"
          v-model:page="queryForm.page"
          v-model:limit="queryForm.intPageSize"
          @pagination="getList"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped lang="scss">
.uav-flight-record__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  min-height: 120px;
  padding: 0;
  margin: 12px 0 0;
  list-style: none;
}

.uav-flight-record__card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  overflow: hidden;
}

.uav-flight-record__cover {
  display: block;
  width: 100%;
  height: 100px;
}

.uav-flight-record__cover-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}

.uav-flight-record__meta {
  padding: 8px 10px;
}

.uav-flight-record__name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.uav-flight-record__sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.uav-flight-record__empty {
  grid-column: 1 / -1;
}
</style>
