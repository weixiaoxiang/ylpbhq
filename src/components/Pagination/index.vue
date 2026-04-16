<template>
  <div
    :class="{ hidden: hidden }"
    class="pagination"
  >
    <!-- @size-change="handleSizeChange" -->
    <!-- :page-sizes="pageSizes" -->
    <!-- :pager-count="pagerCount" -->

    <el-pagination
      :page-sizes="pageSizes"
      v-model:current-page="internalCurrentPage"
      v-model:page-size="internalPageSize"
      :background="background"
      :total="total"
      :layout="layout"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue"
import { scrollTo } from "@/utils/scroll-to"

const props = defineProps({
  total: {
    required: true,
    type: Number as PropType<number>,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  pagerCount: {
    type: Number,
    default: 7
  },
  limit: {
    type: Number,
    default: 20
  },
  pageSizes: {
    type: Array as PropType<number[]>,
    default() {
      return [10, 15, 20, 30, 50]
    }
  },
  layout: {
    type: String,
    default: "total, sizes, prev, pager, next, jumper"
  },
  background: {
    type: Boolean,
    default: true
  },
  autoScroll: {
    type: Boolean,
    default: true
  },
  hidden: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(["pagination"])

const internalCurrentPage = ref(props.page)
const internalPageSize = ref(props.limit)
watch(
  () => props.page,
  (newVal) => {
    internalCurrentPage.value = newVal
  }
)
watch(
  () => props.limit,
  (newVal) => {
    internalPageSize.value = newVal
  }
)
const handleSizeChange = (val: number) => {
  internalPageSize.value = val
  emit("pagination", { page: internalCurrentPage.value, limit: val })
  if (props.autoScroll) {
    scrollTo(0, 800)
  }
}

const handleCurrentChange = (val: number) => {
  internalCurrentPage.value = val
  emit("pagination", { page: val, limit: internalPageSize.value })
  if (props.autoScroll) {
    scrollTo(0, 800)
  }
}
</script>

<style lang="scss" scoped>
.pagination {
  &.hidden {
    display: none;
  }
}
</style>
