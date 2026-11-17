<script lang="ts" setup>
import { Edit, Refresh, Search } from "@element-plus/icons-vue"
import { uavApi, type UavWaylineRow } from "@/api/uav"
import { isUavApiOk } from "@/utils/ai-drone/response"

/** 系统管理 — 航线配置（逻辑对齐大鲵 uavWaylineManage） */
defineOptions({ name: "SystemUavWayline" })

const queryForm = reactive({
  keyWord: ""
})

const tableData = ref<UavWaylineRow[]>([])
const loading = ref(false)
const editInputRef = ref<{ focus: () => void } | null>(null)
const editingUuid = ref<string | null>(null)
const oldHeight = ref<string | number>("")

function hasWaylineHeight(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false
  return true
}

function formatWaylineHeight(value: unknown): string {
  if (!hasWaylineHeight(value)) return "—"
  return String(value)
}

async function getList() {
  loading.value = true
  tableData.value = []
  try {
    const res = (await uavApi.GetWaylines({ ...queryForm })) as {
      success?: boolean
      response?: UavWaylineRow[]
    }
    if (isUavApiOk(res) && Array.isArray(res.response)) {
      tableData.value = res.response
    }
  } finally {
    loading.value = false
  }
}

function search() {
  getList()
}

function resetQuery() {
  queryForm.keyWord = ""
  getList()
}

/** 仅通过编辑图标进入修改，避免误触单元格 */
function startHeightEdit(row: UavWaylineRow) {
  if (!row.wayline_uuid) return
  oldHeight.value = row.wayline_height ?? ""
  editingUuid.value = row.wayline_uuid
  nextTick(() => {
    editInputRef.value?.focus()
  })
}

/** 失焦提交：未变更则还原 */
async function commitHeightEdit(row: UavWaylineRow) {
  editingUuid.value = null
  if (!row.wayline_uuid) return

  const next = row.wayline_height
  const prev = oldHeight.value
  if ((!next && !prev) || String(prev) === String(next)) {
    row.wayline_height = prev
    return
  }

  loading.value = true
  try {
    const res = (await uavApi.PutWaylines({
      wayline_uuid: row.wayline_uuid,
      wayline_height: next ?? ""
    })) as { success?: boolean; msg?: string }
    if (isUavApiOk(res)) {
      ElMessage.success(res.msg || "保存成功")
    } else {
      row.wayline_height = prev
      ElMessage.error(res.msg || "保存失败")
    }
  } catch {
    row.wayline_height = prev
    ElMessage.error("保存失败")
  } finally {
    loading.value = false
  }
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
        <el-form-item label="航线名称：">
          <el-input
            v-model="queryForm.keyWord"
            clearable
            placeholder="请输入"
          />
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
        v-adaptive="{ bottom: 20 }"
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
          prop="wayline_name"
          label="航线名称"
          align="center"
          min-width="200"
        />
        <el-table-column
          prop="wayline_height"
          label="最低返航高度（相对机场）"
          align="center"
          min-width="280"
        >
          <template #default="{ row }">
            <el-input
              v-if="editingUuid === row.wayline_uuid"
              ref="editInputRef"
              size="small"
              v-model="row.wayline_height"
              style="max-width: 160px"
              @blur="commitHeightEdit(row)"
              @keyup.enter="commitHeightEdit(row)"
            />
            <div
              v-else
              class="uav-wayline-height-cell"
            >
              <span
                class="uav-wayline-height"
                :class="{ 'is-empty': !hasWaylineHeight(row.wayline_height) }"
              >
                {{ formatWaylineHeight(row.wayline_height) }}
              </span>
              <span
                class="uav-wayline-height-edit"
                title="编辑返航高度"
                @click.stop="startHeightEdit(row)"
              >
                <el-icon>
                  <Edit />
                </el-icon>
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.uav-wayline-height-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 24px;
}

.uav-wayline-height-edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 2px;
  color: var(--el-color-primary);
  cursor: pointer;
  border-radius: 4px;
}

.uav-wayline-height-edit:hover {
  background: var(--el-color-primary-light-9);
}

.uav-wayline-height {
  padding: 2px 6px;
  min-width: 48px;
}

.uav-wayline-height.is-empty {
  color: var(--el-text-color-secondary);
}
</style>
