<template>
  <!-- 新增修改对话框 -->
  <Dialog
    v-model="show"
    :title="title"
    w="650px"
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
        label-position="left"
        :rules="rules"
        label-width="auto"
      >
        <el-form-item
          label="父级菜单："
          prop="pId"
        >
          <el-tree-select
            v-model="form.pId"
            :teleported="false"
            placeholder="选择上级菜单"
            :data="menuOptions"
            filterable
            check-strictly
            :props="defaultProps"
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item
          label="菜单名称："
          prop="name"
        >
          <el-input
            v-model="form.name"
            placeholder="请输入菜单名称"
          />
        </el-form-item>

        <el-form-item
          label="菜单类型："
          prop="type"
        >
          <el-radio-group
            v-model="form.type"
            @change="onMenuTypeChange"
          >
            <el-radio :label="1">目录</el-radio>
            <el-radio :label="2">菜单</el-radio>
            <el-radio :label="3">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="form.type == 1 || form.type == 2"
          label="路由路径："
          prop="path"
        >
          <el-input
            v-if="form.type == 1"
            v-model="form.path"
            placeholder="system"
          />
          <el-input
            v-else
            v-model="form.path"
            placeholder="user"
          />
        </el-form-item>
        <el-form-item
          v-if="form.type !== 3"
          label="是否跳转："
        >
          <el-radio-group v-model="isRedirect">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- 组件页面完整路径 -->
        <el-form-item
          v-if="form.type == 2"
          label="页面路径："
          prop="component"
        >
          <el-input
            v-model="form.component"
            placeholder=""
            style="width: 95%"
          >
            <!-- <template
              v-if="form.type == 2"
              #prepend
              >src/views/</template
            > -->
            <template
              v-if="form.type == 2"
              #append
              >.vue</template
            >
          </el-input>
        </el-form-item>
        <el-form-item
          v-if="form.type != 3 && isRedirect"
          label="跳转路径："
          prop="redirect"
        >
          <el-input
            v-model="form.redirect"
            clearable
            placeholder=""
          />
        </el-form-item>
        <el-form-item
          v-if="form.type != 3"
          label="组件名字："
          prop="componentName"
        >
          <el-input
            v-model="form.componentName"
            clearable
            placeholder="例如说：SystemUser"
          />
        </el-form-item>
        <!-- 权限标识 -->
        <el-form-item
          v-if="form.type == 3"
          label="权限标识："
          prop="perm"
        >
          <el-input
            v-model="form.perm"
            placeholder="sys:user:add"
          />
        </el-form-item>
        <el-form-item
          v-if="form.type !== 3"
          label="图标："
          prop="icon"
        >
          <!-- 图标选择器 -->
          <icon-select v-model="form.icon" />
        </el-form-item>
        <el-form-item
          v-if="form.type !== 3"
          label="显示状态："
        >
          <el-radio-group v-model="form.visible">
            <el-radio :label="true">显示</el-radio>
            <el-radio :label="false">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="form.type !== 3"
          label="菜单状态："
        >
          <el-radio-group v-model="form.effective">
            <el-radio :label="true">正常</el-radio>
            <el-radio :label="false">失效</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="排序："
          prop="sort"
        >
          <el-input-number
            v-model="form.sort"
            style="width: 100px"
            controls-position="right"
            :min="0"
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
import IconSelect from "@/components/IconSelect/index.vue"
import { menuApi } from "@/api/SystemManage/menu"
import { handleTree } from "@/utils/tree"
const show = ref(false)
const loadForm = ref(false)
const loading = ref(false)
const formRef = ref()
const title = ref("添加")
const defaultProps = ref({
  label: "name",
  value: "Id",
  children: "children"
})
//表单数据
const isRedirect = ref(false) //是否跳转
const form = ref<any>({
  pId: 0,
  visible: true,
  effective: true,
  redirect: "",
  sort: 1,
  type: 1
})
//校验规则
const rules = {
  pId: [{ required: true, message: "请选择顶级菜单", trigger: "blur" }],
  name: [
    { required: true, message: "请输入菜单名称", trigger: "blur" },
    { min: 0, max: 50, message: "最大50字符", trigger: "blur" }
  ],
  type: [{ required: true, message: "请选择菜单类型", trigger: "blur" }],
  path: [{ required: true, message: "请输入路由路径", trigger: "blur" }],
  component: [{ required: true, message: "请输入组件完整路径", trigger: "blur" }],
  redirect: [{ required: true, message: "请输入跳转路径", trigger: "blur" }]
}
//菜单下拉框
const menuOptions = ref<any[]>([])
const menuCacheData = reactive({
  type: "",
  path: ""
})
/** 打开弹窗 */
const openDialog = async (type: string, id?: number) => {
  menuApi
    .getDataTree({ effective: true })
    .then((res) => {
      let data = res.response.filter((item) => {
        return item.type == 1 || item.type == 2
      })
      data = handleTree(data, "Id", "pId")
      menuOptions.value = [{ Id: 0, name: "顶级菜单", children: data }]
    })
    .then(() => {
      show.value = true
      title.value = type
      clearForm()
      if (type == "编辑") {
        console.log(id)
        menuApi.getDetail({ Id: id }).then((res) => {
          Object.assign(form.value, res.response)
          menuCacheData.type = res.response.type
          menuCacheData.path = res.response.path ?? ""
          if (form.value.redirect) {
            isRedirect.value = true
          } else {
            isRedirect.value = false
          }
        })
      } else {
        form.value.pId = id
      }
    })
}
defineExpose({ openDialog }) // 提供 open 方法，用于打开弹窗
// 清空表单
const clearForm = () => {
  formRef.value?.resetFields()
  form.value = {
    pId: 0,
    visible: true,
    effective: true,
    sort: 1,
    type: 1,
    redirect: "",
    path: ""
  }
  isRedirect.value = false
}
//关闭弹框
const close = () => {
  show.value = false
  loading.value = false
  isRedirect.value = false
}
// 确认
const emit = defineEmits(["success"])
const submit = () => {
  formRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = true
      if (!isRedirect.value) {
        form.value.redirect = ""
      } else {
        // form.value.component = ""
      }
      if (title.value == "新增") {
        try {
          menuApi.add(form.value).then((res: any) => {
            if (res.success) {
              loading.value = false
              ElMessage.success(res.msg)
              close()
              // 发送操作成功的事件
              emit("success")
            } else {
              loading.value = false
              ElMessage.error(res.msg)
            }
          })
        } finally {
          loading.value = false
        }
      } else {
        try {
          menuApi.update(form.value).then((res: any) => {
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
/** 菜单类型切换事件处理 */
function onMenuTypeChange() {
  // 如果菜单类型改变，清空路由路径；未改变在切换后还原路由路径
  if (form.value.type !== menuCacheData.type) {
    form.value.path = ""
  } else {
    form.value.path = menuCacheData.path
  }
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
