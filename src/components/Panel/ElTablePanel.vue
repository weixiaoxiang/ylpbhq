<script lang="ts" setup>
import { u } from "@/utils/viewerjs"
interface Column {
  type?: string
  prop: string
  label: string
  width?: string
  showOverflowTooltip?: boolean
  [key: string]: any
}
interface Props {
  selection?: boolean
  showIndex?: boolean
  tableTypeLevel1?: string
  tableTypeLevel2?: string
  columns?: Column[]
  data?: any[]
}
const props = withDefaults(defineProps<Props>(), {
  selection: false,
  showIndex: false,
  tableTypeLevel1: "默认", // 表格一级类型
  tableTypeLevel2: "默认", // 表格二级类型
  columns: () => [],
  data: () => []
})
const proxy = getCurrentInstance()!.proxy as any
const tableRef = ref<any>()
const doLayout = () => {
  tableRef.value.doLayout()
}
// 预览图片
const preview = (url: string) => {
  if (!url) return ElMessage.warning("暂无预览")
  u.showPreviewImg(0, [url])
}
const handleBtn = (type: string, _row: any) => {
  // console.log(type, _row)
  proxy.$mitt.emit("handleTableBtnClick", {
    type,
    tableTypeLevel1: props.tableTypeLevel1,
    tableTypeLevel2: props.tableTypeLevel2,
    row: JSON.parse(JSON.stringify(_row))
  })
}

defineExpose({
  doLayout
})
</script>

<template>
  <div class="el-tabel-panel size-full overflow-hidden">
    <el-table
      ref="tableRef"
      :data="data"
      style="width: 100%"
      height="100%"
      stripe
    >
      <el-table-column
        v-if="selection"
        type="selection"
        width="55"
      />
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="60"
        align="center"
      />
      <template
        v-for="column in columns"
        :key="column.prop"
      >
        <el-table-column
          v-if="!column.type"
          :prop="column.prop"
          :label="column.label"
          :width="column.width || 'auto'"
          :show-overflow-tooltip="column.showOverflowTooltip"
          align="center"
        >
          <template #default="{ row }">
            <span :class="{ 'latin-text': column.label.indexOf('拉丁') !== -1 }">{{ row[column.prop] }}</span>
          </template>
        </el-table-column>
        <!-- 插槽 -->
        <el-table-column
          v-else-if="column.type === 'slot'"
          :label="column.label"
          :width="column.width || 'auto'"
          :show-overflow-tooltip="column.showOverflowTooltip"
          align="center"
        >
          <template
            v-if="column.label === '采集/报警点'"
            #default="{ row }"
          >
            <span>{{ row.CollectionCount }}/{{ row.AlarmCount }}</span>
          </template>
          <template
            v-if="column.label === '车牌图片'"
            #default="{ row }"
          >
            <el-image
              :src="'/vehicleStaticUrl' + row.platepicurlall"
              fit="contain"
              @click="preview(row.platepicurlall ? '/vehicleStaticUrl' + row.platepicurlall : '')"
            >
              <template #error>
                <div class="image-slot">
                  <i-ep-picture />
                  <span style="margin-left: 3px">暂无预览</span>
                </div>
              </template>
            </el-image>
          </template>
          <template
            v-if="column.label === '车辆图片'"
            #default="{ row }"
          >
            <el-image
              :src="'/vehicleStaticUrl' + row.vehiclepicurlall"
              fit="contain"
              @click="preview(row.vehiclepicurlall ? '/vehicleStaticUrl' + row.vehiclepicurlall : '')"
            >
              <template #placeholder>
                <el-skeleton
                  style="width: 100%; height: 100%"
                  :loading="true"
                  animated
                >
                  <template #template>
                    <el-skeleton-item
                      variant="image"
                      style="width: 100%; height: 100%"
                    /> </template
                ></el-skeleton>
              </template>
              <template #error>
                <div class="image-slot">
                  <i-ep-picture />
                  <span style="margin-left: 3px">暂无预览</span>
                </div>
              </template>
            </el-image>
          </template>
          <template
            v-if="column.label === '采集图片'"
            #default="{ row }"
          >
            <el-image
              :src="'/statisUrl/' + row.filelist?.[0]?.filepath"
              fit="contain"
              style="max-height: 100px"
              @click="preview(row.filelist?.[0]?.filepath ? '/statisUrl/' + row.filelist?.[0]?.filepath : '')"
            >
              <template #placeholder>
                <el-skeleton
                  style="width: 100%; height: 100%"
                  :loading="true"
                  animated
                >
                  <template #template>
                    <el-skeleton-item
                      variant="image"
                      style="width: 100%; height: 100%"
                    /> </template
                ></el-skeleton>
              </template>
              <template #error>
                <div class="image-slot">
                  <i-ep-picture />
                  <span style="margin-left: 3px">暂无预览</span>
                </div>
              </template>
            </el-image>
          </template>
          <template
            v-if="column.label === '物种图片'"
            #default="{ row }"
          >
            <el-image
              :src="'/statisUrl/' + row.filelist?.[0]?.filepath"
              fit="contain"
              style="max-height: 100px"
              @click="preview(row.filelist?.[0]?.filepath ? '/statisUrl/' + row.filelist?.[0]?.filepath : '')"
            >
              <template #placeholder>
                <el-skeleton
                  style="width: 100%; height: 100%"
                  :loading="true"
                  animated
                >
                  <template #template>
                    <el-skeleton-item
                      variant="image"
                      style="width: 100%; height: 100%"
                    /> </template
                ></el-skeleton>
              </template>
              <template #error>
                <div class="image-slot">
                  <i-ep-picture />
                  <span style="margin-left: 3px">暂无预览</span>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column
          v-else-if="column.type === 'operation'"
          :label="column.label"
          :width="column.width || 'auto'"
          :show-overflow-tooltip="column.showOverflowTooltip"
          align="center"
        >
          <template #default="{ row }">
            <div class="btns">
              <div
                class="btn-wrapper"
                v-for="btn in column.btns"
                :class="[]"
                :style="{
                  color: btn.textColor || '#fff',
                  backgroundColor: btn.bgColor || '#666'
                }"
              >
                <template v-if="btn.label === '设为黑名单'">
                  <span
                    v-if="row.isblacklist === '是'"
                    class="btn disabled"
                    >{{ btn.label }}</span
                  >
                  <span
                    v-else
                    class="btn"
                    @click="handleBtn(btn.label, row)"
                    >{{ btn.label }}</span
                  >
                </template>
                <template v-else-if="btn.label === '设为内部车'">
                  <span
                    v-if="row.isinside === '是'"
                    class="btn disabled"
                    >{{ btn.label }}</span
                  >
                  <span
                    v-else
                    class="btn"
                    @click="handleBtn(btn.label, row)"
                    >{{ btn.label }}</span
                  >
                </template>
                <template v-else>
                  <span
                    class="btn"
                    @click="handleBtn(btn.label, row)"
                    >{{ btn.label }}</span
                  >
                </template>
              </div>
            </div>
          </template>
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<style lang="scss">
.el-tabel-panel {
  background: transparent !important;
  .el-table {
    font-size: 0.7292vw;
    // background-color: transparent !important;
    background-color: rgba(23, 48, 76, 0.6);
  }
  th.el-table__cell {
    background-color: #204b78 !important;
    border-bottom: 2px solid #172e50 !important;
    color: #dde3e8 !important;
  }
  .el-table--striped .el-table__body tr.el-table__row--striped td {
    background: #082948;
  }
  .el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
    background: #194570;
  }
  tr {
    background: #183559 !important;
  }
  td,
  .building-top .el-table th.is-leaf {
    border: none !important;
    color: #c2c8cf !important;
  }
  .el-table--enable-row-hover .el-table__body tr:hover > td {
    background-color: #082948 !important;
  }
  .el-table__body tr.hover-row.current-row > td.el-table__cell,
  .el-table__body tr.hover-row.el-table__row--striped.current-row > td.el-table__cell,
  .el-table__body tr.hover-row.el-table__row--striped > td.el-table__cell,
  .el-table__body tr.hover-row > td.el-table__cell {
    background-color: rgba(0, 0, 0, 0.3) !important;
  }

  .el-table__inner-wrapper:before {
    height: 0 !important;
  }
  .btns {
    display: flex;
    justify-content: center;
    gap: 5px;
    .btn-wrapper {
      .btn {
        padding: 4px 8px;
        cursor: pointer;
        user-select: none;
        &.disabled {
          cursor: not-allowed;
          color: #999;
        }
      }
    }
  }

  .el-checkbox__inner {
    background-color: #06172c;
    border: none;
  }
  .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #15b392;
  }
  .el-image {
    width: 100%;
    min-height: 42px;
    .image-slot {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      border: 1px dashed #999;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }
  .el-skeleton {
    .el-skeleton-item {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
