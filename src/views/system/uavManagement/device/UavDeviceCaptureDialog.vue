<script lang="ts" setup>
import { Search } from "@element-plus/icons-vue"
import Dialog from "@/components/Dialog/index.vue"
import { danieUavApi } from "@/api/danieUav"
import { getDroneLastPosition } from "@/api/system/uav-drone"
import { isDanieOk } from "@/utils/ai-drone/response"
import { fetchCapturePage, type UavCaptureCardRecord } from "@/utils/system/uav-capture-mapper"
import { UAV_AI_EVENT_CLASS_OPTIONS } from "@/views/researchManagement/aiDrone/constants"
import EventDetailDialog from "@/views/researchManagement/aiDrone/components/EventDetailDialog.vue"

defineOptions({ name: "UavDeviceCaptureDialog" })

const visible = ref(false)
const loading = ref(false)
const totalCount = ref(0)
const pageRecords = ref<UavCaptureCardRecord[]>([])
const deviceOptions = ref<{ label: string; value: string }[]>([])
const eventDetail = ref<Record<string, unknown> | null>(null)

const dateRange = ref<string[]>([])
const defaultTimeRange: [Date, Date] = [new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]
const processStatus = ref<string>("")
const deviceSn = ref("")
const eventType = ref("")
const favoriteFlag = ref("")
const currentPage = ref(1)
const pageSize = ref(12)

const processStatusOptions = [
  { label: "全部", value: "" },
  { label: "待研判", value: "false" },
  { label: "已研判", value: "true" }
]

const favoriteOptions = [
  { label: "全部", value: "" },
  { label: "已收藏", value: "true" },
  { label: "未收藏", value: "false" }
]

function parseOptionalBoolean(value: string): boolean | undefined {
  if (value === "true") return true
  if (value === "false") return false
  return undefined
}

function buildQueryParams() {
  return {
    page: currentPage.value,
    intPageSize: pageSize.value,
    startTime: dateRange.value?.[0],
    endTime: dateRange.value?.[1],
    sn: deviceSn.value || undefined,
    is_assessment: parseOptionalBoolean(processStatus.value),
    class_name: eventType.value || undefined,
    is_collection: parseOptionalBoolean(favoriteFlag.value)
  }
}

async function loadDeviceOptions() {
  try {
    const res = (await getDroneLastPosition()) as {
      success?: boolean
      response?: { device_sn?: string; device_name?: string }[]
    }
    if (isDanieOk(res) && Array.isArray(res.response)) {
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
  try {
    const result = await fetchCapturePage((p) => danieUavApi.GetPageAIAssessmentResult(p), buildQueryParams())
    pageRecords.value = result.list
    totalCount.value = result.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  getList()
}

function openCaptureDetail(item: UavCaptureCardRecord) {
  eventDetail.value = item.source
}

async function handleCollect(resultId: number, collection: boolean) {
  try {
    await ElMessageBox.confirm(`是否确认${collection ? "" : "取消"}收藏此条数据?`, "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    })
    const res = (await danieUavApi.PutAIResultCollection({ resultId, collection })) as {
      success?: boolean
      msg?: string
    }
    if (isDanieOk(res)) {
      ElMessage.success(`${collection ? "" : "取消"}收藏成功`)
      await getList()
      return
    }
    ElMessage.error(res?.msg || "操作失败")
  } catch {
    /* 用户取消 */
  }
}

async function handleDelete(resultId: number) {
  try {
    await ElMessageBox.confirm("是否确认删除此条数据?", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    })
    const res = (await danieUavApi.DeleteDroneAiResult({ aiResultId: resultId })) as {
      success?: boolean
      msg?: string
    }
    if (isDanieOk(res)) {
      ElMessage.success("删除成功")
      await getList()
      return
    }
    ElMessage.error(res?.msg || "删除失败")
  } catch {
    /* 用户取消 */
  }
}

function handleClose() {
  visible.value = false
  currentPage.value = 1
  pageRecords.value = []
  totalCount.value = 0
  dateRange.value = []
  processStatus.value = ""
  eventType.value = ""
  favoriteFlag.value = ""
  deviceSn.value = ""
}

/** 打开弹窗，可选默认设备 SN */
async function open(initialSn?: string) {
  visible.value = true
  currentPage.value = 1
  dateRange.value = []
  processStatus.value = ""
  eventType.value = ""
  favoriteFlag.value = ""
  deviceSn.value = initialSn ?? ""
  await loadDeviceOptions()
  await getList()
}

function onDetailSaved() {
  getList()
}

defineExpose({ open })
</script>

<template>
  <Dialog
    v-model="visible"
    title="全部抓拍"
    w="960px"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="uav-capture-dialog">
      <div class="search-content uav-capture-dialog__filters">
        <el-form
          :inline="true"
          label-width="auto"
        >
          <el-form-item label="时间：">
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="-"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="defaultTimeRange"
              start-placeholder="开始"
              end-placeholder="结束"
              teleported
            />
          </el-form-item>
          <el-form-item label="研判：">
            <el-select
              v-model="processStatus"
              clearable
              placeholder="处理状态"
              teleported
              popper-class="system-select-popper"
              style="width: 120px"
            >
              <el-option
                v-for="item in processStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="设备：">
            <el-select
              v-model="deviceSn"
              clearable
              placeholder="抓拍设备"
              teleported
              popper-class="system-select-popper"
              filterable
              style="width: 160px"
            >
              <el-option
                v-for="item in deviceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="类型：">
            <el-select
              v-model="eventType"
              clearable
              placeholder="事件类型"
              teleported
              popper-class="system-select-popper"
              style="width: 120px"
            >
              <el-option
                v-for="item in UAV_AI_EVENT_CLASS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="收藏：">
            <el-select
              v-model="favoriteFlag"
              clearable
              placeholder="是否收藏"
              teleported
              popper-class="system-select-popper"
              style="width: 120px"
            >
              <el-option
                v-for="item in favoriteOptions"
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

      <div
        v-loading="loading"
        class="uav-capture-dialog__body"
      >
        <ul
          v-if="pageRecords.length"
          class="uav-capture-dialog__grid"
        >
          <li
            v-for="item in pageRecords"
            :key="item.id"
            class="uav-capture-dialog__card"
            @click="openCaptureDetail(item)"
          >
            <img
              class="uav-capture-dialog__thumb"
              :src="item.image"
              alt=""
            />
            <div class="uav-capture-dialog__content">
              <time class="uav-capture-dialog__time">{{ item.capturedAt }}</time>
              <p class="uav-capture-dialog__location">{{ item.location }}</p>
              <div class="uav-capture-dialog__tags">
                <el-tag
                  size="small"
                  type="info"
                >
                  {{ item.eventType }}
                </el-tag>
                <el-tag
                  size="small"
                  :type="item.processStatus === '已研判' ? 'success' : 'warning'"
                >
                  {{ item.processStatus }}
                </el-tag>
              </div>
            </div>
            <div
              class="uav-capture-dialog__actions"
              @click.stop
            >
              <el-button
                link
                type="primary"
                @click="handleCollect(item.resultId, !item.isFavorite)"
              >
                {{ item.isFavorite ? "取消收藏" : "收藏" }}
              </el-button>
              <el-button
                link
                type="danger"
                @click="handleDelete(item.resultId)"
              >
                删除
              </el-button>
            </div>
          </li>
        </ul>
        <el-empty
          v-else-if="!loading"
          description="暂无数据"
        />
      </div>

      <div
        v-if="totalCount > pageSize"
        class="pagination-box uav-capture-dialog__footer"
      >
        <el-pagination
          v-model:current-page="currentPage"
          background
          layout="total, prev, pager, next"
          :total="totalCount"
          :page-size="pageSize"
          @current-change="getList"
        />
      </div>
    </div>
  </Dialog>

  <EventDetailDialog
    :detail="eventDetail"
    @close="eventDetail = null"
    @saved="onDetailSaved"
  />
</template>

<style scoped lang="scss">
.uav-capture-dialog__body {
  min-height: 200px;
  max-height: 52vh;
  overflow-y: auto;
}

.uav-capture-dialog__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.uav-capture-dialog__card {
  cursor: pointer;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  overflow: hidden;
  background: var(--el-fill-color-blank);
}

.uav-capture-dialog__thumb {
  display: block;
  width: 100%;
  height: 120px;
  object-fit: cover;
  background: #f0f0f0;
}

.uav-capture-dialog__content {
  padding: 8px 10px;
}

.uav-capture-dialog__time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.uav-capture-dialog__location {
  margin: 4px 0;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.uav-capture-dialog__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.uav-capture-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 10px 8px;
}

.uav-capture-dialog__footer {
  margin-top: 12px;
  justify-content: flex-end;
}
</style>
