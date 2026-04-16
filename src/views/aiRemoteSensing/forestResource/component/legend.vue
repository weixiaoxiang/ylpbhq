<template>
  <div class="legend-box">
    <el-radio-group
      v-model="selectName"
      @change="changeSelect"
    >
      <el-radio
        :value="item.label"
        v-for="(item, index) in selectList"
        :key="index"
        :label="item.label"
      >
        {{ item.label }}
      </el-radio>
    </el-radio-group>
  </div>
</template>

<script lang="ts" setup>
const selectList = ref<any>([
  {
    label: "土地权属",
    value: "ld_qs"
  },
  {
    label: "森林类别",
    value: "sen_lin_lb"
  },
  {
    label: "起源名称",
    value: "qi_yuan"
  },
  {
    label: "土地利用",
    value: "di_lei"
  },
  {
    label: "林种结构",
    value: "lin_zhong"
  }
])
const selectName = ref<any>("")
const emit = defineEmits(["changeResource"])
const changeSelect = (value: any) => {
  let ele = selectList.value.find((item: any) => item.label === selectName.value)
  emit("changeResource", ele)
}
onMounted(() => {
  selectName.value = "土地权属"
  let ele = selectList.value.find((item: any) => item.label === selectName.value)
  emit("changeResource", ele)
})
</script>

<style scoped lang="scss">
.legend-box {
  height: fit-content;
  padding: 16px 28px;
  background: rgba(12, 40, 77, 0.7);
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.15);
  .el-radio-group {
    flex-direction: column;
  }
  .el-radio {
    color: #fff;
    opacity: 0.65;
  }
  .el-radio:last-child {
    margin-right: 32px;
  }
}
</style>
