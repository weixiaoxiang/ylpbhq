<script lang="ts" setup>
interface Column {
  prop: string
  label: string
  width?: string
  showOverflowTooltip?: boolean
}
interface Props {
  showIndex?: boolean
  columns?: Column[]
  data?: any[]
}
withDefaults(defineProps<Props>(), {
  showIndex: false,
  columns: () => [],
  data: () => []
})
</script>

<template>
  <div class="el-tabel-panel size-full overflow-hidden">
    <el-table
      :data="data"
      style="width: 100%"
      height="100%"
      stripe
    >
      <el-table-column
        v-if="showIndex"
        type="序号"
        width="60"
        align="center"
      />
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width || 'auto'"
        :show-overflow-tooltip="column.showOverflowTooltip"
        align="center"
      />
    </el-table>
  </div>
</template>

<style lang="scss">
.el-tabel-panel {
  background: transparent !important;
  .el-table {
    background-color: transparent !important;
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
    background: #183559;
  }
  td,
  .building-top .el-table th.is-leaf {
    border: none !important;
    color: #c2c8cf !important;
  }
  .el-table--enable-row-hover .el-table__body tr:hover > td {
    background-color: #082948;
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
}
</style>
