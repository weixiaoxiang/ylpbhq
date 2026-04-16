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
        label-jobposition="top"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item
          label="用户名"
          prop="user_name"
        >
          <el-input
            v-model="form.user_name"
            placeholder="-请输入用户名-"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="用户密码"
          prop="user_psw"
          v-if="title == '新增'"
        >
          <el-input
            type="password"
            show-password
            autocomplete="new-password"
            v-model="form.user_psw"
            placeholder="-请输入用户密码-"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="真实姓名"
          prop="real_name"
        >
          <el-input
            v-model="form.real_name"
            placeholder="-请输入真实姓名-"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="user_tel"
        >
          <el-input
            v-model="form.user_tel"
            placeholder="-请输入手机号-"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="职务"
          prop="jobposition"
        >
          <el-input
            v-model="form.jobposition"
            placeholder="-请输入职务-"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="角色"
          prop="pcrole"
        >
          <el-select
            v-model="form.pcrole"
            :teleported="false"
            placeholder="请选择角色"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="item in roleOption"
              :label="item.roleName"
              :value="item.Id"
              :key="item.Id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="组织机构"
          prop="organi_structure"
        >
          <el-tree-select
            v-model="form.organi_structure"
            :data="treeOrgData"
            check-strictly
            :render-after-expand="false"
            :props="defaultProps"
            default-expand-all
            node-key="Id"
            clearable
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
    </div>
    <template
      #footer
      class="dialog-footer"
    >
      <el-button @click="close">取 消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="submit"
        >提 交</el-button
      >
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "@/components/Dialog/index.vue"
import { userApi } from "@/api/SystemManage/user"
let props = defineProps(["roleOption"])
const show = ref(false)
const loadForm = ref(false)
const loading = ref<any>(false)
const formRef = ref()
const title = ref("添加")
//表单数据
const form = ref<any>({
  user_name: "",
  real_name: "",
  user_psw: "",
  user_tel: "",
  jobposition: "",
  pcrole: "",
  organi_structure: ""
})
//校验规则
const rules = {
  user_name: [
    { required: true, trigger: "blur", message: "请输入用户名" },
    { min: 0, max: 50, message: "最大50字符", trigger: "blur" }
  ],
  real_name: [
    { required: true, trigger: "blur", message: "请输入真实姓名" },
    { min: 0, max: 50, message: "最大50字符", trigger: "blur" }
  ],
  user_tel: [
    { required: true, trigger: "blur", message: "请输入手机号" },
    {
      pattern: /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/,
      message: "请输入正确的手机号码",
      trigger: "blur"
    }
  ],
  user_psw: [
    { required: true, trigger: "blur", message: "请输入密码" },
    {
      pattern: /(?=.*[a-z_])(?=.*\d)(?=.*[^a-z0-9_])[\S]{8,}/i,
      message: "密码必须包含字母、数字和特殊字符，且长度要在8位以上！",
      trigger: "blur"
    }
  ],
  pcrole: [{ required: true, trigger: "change", message: "请选择角色" }],
  organi_structure: [{ required: true, trigger: "change", message: "请选择机构" }]
}
/** 打开弹窗 */
const openDialog = async (type: string, row?: any) => {
  show.value = true
  title.value = type
  clearForm()
  getOrganize()
  // 修改时，设置数据
  if (row?.id) {
    // loadForm.value = true;
    form.value = Object.assign(form.value, row)
  }
}
defineExpose({ openDialog }) // 提供 open 方法，用于打开弹窗
// 清空表单
const clearForm = () => {
  formRef.value?.resetFields()
  form.value = {
    user_name: "",
    real_name: "",
    user_psw: "",
    user_tel: "",
    jobposition: "",
    pcrole: ""
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
  loading.value = true
  const userPsw = encryptText(form.value.user_psw)
  formRef.value.validate((valid: any) => {
    if (valid) {
      if (title.value === "新增") {
        try {
          userApi
            .add({
              ...form.value,
              user_psw: userPsw
            })
            .then((res: any) => {
              loading.value = false
              if (res.success) {
                ElMessage.success(res.msg)
                close()
                // 发送操作成功的事件
                emit("success")
              } else {
                ElMessage.error(res.msg)
              }
            })
        } finally {
          loading.value = false
        }
      } else if (title.value === "编辑") {
        try {
          if (form.value.user_state && form.value.user_state == "正常") {
            form.value.user_state = 0
          } else if (form.value.user_state && form.value.user_state == "失效") {
            form.value.user_state = 1
          }
          if (form.value.receive_state && form.value.receive_state == "正常") {
            form.value.receive_state = 0
          } else if (form.value.receive_state && form.value.receive_state == "禁止") {
            form.value.receive_state = 1
          }
          if (typeof form.value.organi_structure == "string") {
            form.value.organi_structure = form.value.organi_structureid
          }

          userApi
            .update({
              ...form.value,
              user_psw: userPsw
            })
            .then((res: any) => {
              loading.value = false
              if (res.success) {
                ElMessage.success(res.msg)
                close()
                // 发送操作成功的事件
                emit("success")
              } else {
                ElMessage.error(res.msg)
              }
            })
        } finally {
          loading.value = false
        }
      }
    }
  })
}
import { organizeApi } from "@/api/SystemManage/organize"
//机构树
const treeOrgData = ref<any>([])
const defaultProps = ref<any>({
  label: "name",
  children: "children"
})
//获取所属机构
const getOrganize = () => {
  organizeApi
    .getDataByPage({
      effective: true
    })
    .then((res: any) => {
      if (res.success) {
        treeOrgData.value = res.response
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
    width: 48%;
    margin-right: 10px;
  }
}
</style>
