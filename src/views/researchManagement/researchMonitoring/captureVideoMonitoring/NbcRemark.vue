<script lang="ts" setup>
import { PutCarIsSwById } from "@/api"
interface Props {
  show?: boolean
  data?: any
}
const props = withDefaults(defineProps<Props>(), {
  show: false,
  data: {}
})
const emit = defineEmits<{
  refresh: []
  "update:show": [boolean]
}>()
const remark = ref<string>("")
const cancel = () => {
  emit("update:show", false)
}
const confirm = async () => {
  const { success, msg } = await PutCarIsSwById({
    id: props.data.id,
    updatetype: 2,
    issf: "是",
    remark: remark.value
  })
  if (success) {
    ElMessage.success("操作成功")
  } else {
    ElMessage.info(msg)
  }
  emit("refresh")
  emit("update:show", false)
}
</script>
<template>
  <div class="vehicle-base-details">
    <h3>备注说明</h3>
    <div class="contain panzoom-exclude">
      <el-input
        type="textarea"
        v-model="remark"
        :rows="15"
        :autosize="false"
        maxlength="500"
        resize="none"
        show-word-limit
        placeholder="请输入备注说明"
      ></el-input>
      <div class="btns">
        <div
          class="btn1"
          @click="cancel"
        >
          取消
        </div>
        <div
          class="btn2"
          @click="confirm"
        >
          确认
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vehicle-base-details {
  display: flex;
  flex-direction: column;
  width: 37.5vw;
  height: 500px;
  background: url("@/assets/images/dialog-bg1.png") no-repeat center center / 100% 100%;
  font-size: 0.7292vw;
  color: #beccdc;
  padding: 20px 1.8229vw 30px 1.8229vw;
  h3 {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 1.25vw;
    font-weight: bold;
    font-style: italic;
  }
  :deep(.contain) {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .el-textarea {
      .el-textarea__inner {
        background-color: #0d3250;
        box-shadow: none;
        border-radius: 8px;
        color: #fff;
      }
      .el-input__count {
        background: none;
      }
    }
    .btns {
      display: flex;
      margin: 0 auto;
      gap: 2.0833vw;
      .btn1 {
        width: 88px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7292vw;
        color: #2aeaf7;
        border: 1px solid #2aeaf7;
        border-radius: 8px;
        box-shadow: 0 0 5px 2px #2aeaf7 inset;
        cursor: pointer;
      }
      .btn2 {
        width: 88px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7292vw;
        color: #fff;
        background-color: #198497;
        border: 1px solid #2aeaf7;
        border-radius: 8px;
        cursor: pointer;
      }
    }
  }
}
</style>
