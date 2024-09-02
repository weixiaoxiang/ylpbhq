<template>
  <div class="year-range-picker">
    <el-date-picker
      v-model="startYear"
      type="year"
      placeholder="开始年份"
      class="year-picker"
      style="max-width: 104px !important"
      @change="changeStartYear"
      format="YYYY"
      value-format="YYYY"
    />
    <span class="range-word"> 至 </span>
    <el-date-picker
      v-model="endYear"
      type="year"
      placeholder="结束年份"
      class="year-picker"
      style="max-width: 104px !important"
      @change="changeEndYear"
      format="YYYY"
      value-format="YYYY"
    />
  </div>
</template>

<script setup lang="ts">
//导入多语言配置
import { ElMessage } from "element-plus"

interface IProps {
  yearRange: Array<any>
}
const props = withDefaults(defineProps<IProps>(), {
  yearRange: () => []
})
//绑定年份
const startYear = ref("")
const endYear = ref("")
const emits = defineEmits(["yearChanged"])
watchEffect(() => {
  startYear.value = String(props.yearRange[0])
  endYear.value = String(props.yearRange[1])
})

const changeStartYear = (val: any) => {
  if (Number(val) && Number(endYear.value) && Number(startYear.value) > Number(endYear.value)) {
    startYear.value = ""
    return ElMessage.error("请输入开始年份")
  }
  if (val) {
    startYear.value = val
  }
  const times = [Number(startYear.value) || "", Number(endYear.value) || ""]

  // 将改动传回父组件
  emits("yearChanged", times)
}
const changeEndYear = (val: any) => {
  if (Number(val) && Number(startYear.value) && Number(startYear.value) > Number(endYear.value)) {
    endYear.value = ""
    return ElMessage.error("请输入结束年份")
  }

  if (val) {
    endYear.value = val
  }
  const times = [Number(startYear.value) || "", Number(endYear.value) || ""]

  emits("yearChanged", times)
}
</script>

<style scoped lang="scss">
.year-range-picker {
  color: black;
  text-align: center;
  font-size: 18px;
}

.range-word {
  margin-left: 4px;
  margin-right: 4px;
  color: #909399;
  font-size: 14px;
}

.year-picker {
  max-width: 100px !important;
}
</style>
