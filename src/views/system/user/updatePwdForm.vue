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
        :rules="rules"
      >
        <el-form-item
          label="新密码"
          prop="pwd"
        >
          <el-input
            type="password"
            show-password
            autocomplete="new-password"
            v-model="form.pwd"
            placeholder="-请输入新密码-"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="确认新密码"
          prop="newPassword"
        >
          <el-input
            type="password"
            show-password
            autocomplete="new-password"
            v-model="form.newPassword"
            placeholder="-请确认新密码-"
          ></el-input>
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
import Dialog from "@/components/Dialog/index.vue"
import { userApi } from "@/api/SystemManage/user"
const show = ref(false)
const loadForm = ref(false)
const loading = ref(false)
const formRef = ref()
const title = ref("修改密码")
//表单数据
const form = ref<any>({
  pwd: "",
  id: 0,
  newPassword: ""
})
//校验规则
const rules = {
  pwd: [
    { required: true, trigger: "blur", message: "请输入密码" },
    {
      pattern: /(?=.*[a-z_])(?=.*\d)(?=.*[^a-z0-9_])[\S]{8,}/i,
      message: "密码必须包含字母、数字和特殊字符，且长度要在8位以上！",
      trigger: "blur"
    }
  ],
  newPassword: [
    { required: true, trigger: "blur", message: "请输入密码" },
    {
      pattern: /(?=.*[a-z_])(?=.*\d)(?=.*[^a-z0-9_])[\S]{8,}/i,
      message: "密码必须包含字母、数字和特殊字符，且长度要在8位以上！",
      trigger: "blur"
    }
  ]
}

/** 打开弹窗 */
const openDialog = async (type: string, id?: number) => {
  show.value = true
  title.value = type
  clearForm()
  form.value.id = id
}
defineExpose({ openDialog }) // 提供 open 方法，用于打开弹窗
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
  formRef.value.validate((valid: any) => {
    if (valid) {
      const userPsw = encryptText(form.value.pwd)
      loading.value = true
      if (form.value.newPassword != form.value.pwd) {
        ElMessage.warning("两次密码不一致！请重新输入")
        form.value.newPassword = ""
        form.value.pwd = ""
        loading.value = false
        return
      }
      try {
        userApi
          .updatePwd({
            userId: form.value.id,
            pwd: userPsw
          })
          .then((res: any) => {
            if (res.success) {
              ElMessage({
                type: "success",
                message: "修改密码成功"
              })
              close()
            } else {
              ElMessage({
                type: "error",
                message: res.msg
              })
            }
          })
      } finally {
        loading.value = false
      }
    }
  })
}
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
