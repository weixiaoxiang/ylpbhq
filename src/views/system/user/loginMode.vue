<template>
  <!-- 新增修改对话框 -->
  <Dialog
    v-model="show"
    :title="title"
    w="600px"
    append-to-body
    :close-on-click-modal="false"
    @close="close"
  >
    <div class="form">
      <el-form
        ref="formRef"
        v-loading="loadForm"
        :model="form"
        :inline="true"
        label-position="top"
      >
        <el-form-item
          label="登录方式"
          prop="pwd"
        >
          <el-checkbox-group
            v-model="checkboxGroup"
            :min="1"
            :max="2"
            @change="change"
          >
            <el-checkbox
              v-for="mode in modes"
              :label="mode.type"
              :value="mode.type"
            />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </div>
    <template
      #footer
      class="dialog-footer"
    >
      <el-button @click="close">取 消</el-button>
      <el-button
        :loading="loading"
        type="primary"
        @click="submit"
        >提 交</el-button
      >
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { PutLoginMethod } from "@/api"
import Dialog from "@/components/Dialog/index.vue"
const { loginMethodList } = useConfigStore()
const show = ref(false)
const loadForm = ref(false)
const loading = ref(false)
const formRef = ref()
const title = ref("修改登录方式")
//表单数据
const form = ref<any>({
  pwd: "",
  id: 0
})
const modes = ref<any>([])
const checkboxGroup = ref(["账号登录", "短信验证"])
const change = (value: any) => {
  modes.value.forEach((item: any) => {
    item.status = value.includes(item.type)
  })
}
/** 打开弹窗 */
const openDialog = async (type: string, id?: number) => {
  show.value = true
  title.value = type
  clearForm()
  form.value.id = id
}
defineExpose({ openDialog }) // 提供 open 方法，用于打开弹窗

// 获得登录方式
const getLoginMethod = async () => {
  const response = await loginMethodList()
  if (response) {
    modes.value = response.sort((a: any, b: any) => a.id - b.id)
    checkboxGroup.value = modes.value.filter((item: any) => item.status).map((item: any) => item.type)
  }
}

// 清空表单
const clearForm = () => {
  formRef.value?.resetFields()
  form.value = {
    pwd: "",
    id: 0,
    newPassword: ""
  }
}
//关闭弹框
const close = () => {
  show.value = false
  loading.value = false
}
// 确认
const emit = defineEmits(["success"])
const submit = () => {
  formRef.value.validate(async (valid: any) => {
    if (valid) {
      loading.value = true
      try {
        const promises = modes.value.map((item: any) => {
          return PutLoginMethod({
            id: item.id,
            status: item.status
          })
        })
        const res = await Promise.all(promises)
        if (res.every((item: any) => item.success)) {
          ElMessage.success("修改成功")
          close()
        } else {
          ElMessage.error(res.find((item: any) => !item.success)?.msg)
        }
      } finally {
        loading.value = false
      }
    }
  })
}
watch(show, (newVal) => {
  if (newVal) {
    getLoginMethod()
  }
})
</script>

<style lang="scss" scoped>
.form {
  .el-form {
    justify-content: space-between;
  }

  .el-form--inline .el-form-item {
    width: 100%;
    margin-right: 0;
  }
}
</style>
