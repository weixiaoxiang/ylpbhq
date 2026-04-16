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
          label="角色名称："
          prop="roleName"
        >
          <el-input
            v-model="form.roleName"
            type="text"
            placeholder="请输入角色名称"
          />
        </el-form-item>

        <el-form-item
          label="角色类型："
          prop="type"
        >
          <el-select
            style="width: 100%"
            v-model="form.type"
            :teleported="false"
            placeholder="请选择角色类型"
          >
            <el-option
              v-for="item in typeOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="描述："
          prop="roleDescription"
        >
          <el-input
            v-model="form.roleDescription"
            type="text"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item
          label="状态："
          prop="effective"
        >
          <el-radio-group v-model="form.effective">
            <el-radio :label="true">正常</el-radio>
            <el-radio :label="false">失效</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="默认页："
          prop="defaultRedirect"
          style="width: 100%"
        >
          <el-tree-select
            v-model="form.defaultRedirect"
            node-key="fullPath"
            :data="fullPathRootList"
            :render-after-expand="false"
            :props="defaultRedirectProps"
            style="width: 260px"
            @change="changeRedirectTree"
          />
        </el-form-item>
        <el-form-item
          label="菜单："
          prop="menuIds"
          style="width: 100%"
        >
          <el-card
            style="width: 100%"
            v-if="show"
          >
            <el-tree
              ref="treeRef"
              :data="menuData"
              :props="defaultProps"
              empty-text="加载中，请稍候"
              node-key="Id"
              show-checkbox
            />
          </el-card>
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
import { roleApi } from "@/api/SystemManage/role"
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
const defaultRedirectProps = ref({
  label: "name",
  value: "fullPath",
  children: "children"
})
//表单数据
const form = ref<any>({
  roleName: "",
  type: "",
  effective: true,
  roleDescription: ""
})
//校验规则
const rules = {
  roleName: [
    { required: true, message: "请输入角色名称", trigger: "blur" },
    { min: 0, max: 50, message: "最大50字符", trigger: "blur" }
  ],
  type: [{ required: true, message: "请选择类型", trigger: "change" }]
}
// 角色类型下拉框
const typeOption = ref([
  {
    value: 2,
    label: "后台"
  },
  {
    value: 1,
    label: "前台"
  },
  {
    value: 3,
    label: "前后、后台"
  }
])
const menuData = ref<any>([]) // 菜单树
const treeRef = ref() // 菜单树组件 Ref
let fullPathRootList = ref<any[]>([])
/**
 * 为树形结构的每个节点添加 fullPath
 * @param list 要处理的树形数据
 * @param parentPath 父节点的路径
 */
const addFullPath = (list: any[], parentPath: string = "") => {
  list.forEach((item) => {
    // 判断当前节点的 path 是否以 '/' 开头
    if (item.path.startsWith("/")) {
      item.fullPath = item.path
    } else {
      // 如果不是以 '/' 开头，需要拼接父路径
      // 确保父路径末尾有 '/'
      const normalizedParentPath = parentPath.endsWith("/") ? parentPath : `${parentPath}/`
      item.fullPath = `${normalizedParentPath}${item.path}`
    }

    // 如果有子节点，递归处理
    if (item.children && item.children.length > 0) {
      addFullPath(item.children, item.fullPath)
    }
  })
  return list
}
const changeRedirectTree = (data: any) => {
  //   console.log(data, fullPathRootList, 11)
  const findNode = findNodes(fullPathRootList.value, data, { key: "Id" })
  if (findNode?.length > 0) {
    form.value.defaultRedirect = findNode[0].fullPath
  }
  //   console.log(findNode, 11)
}
/** 打开弹窗 */
const openDialog = async (type: string, id?: number) => {
  show.value = true
  title.value = type
  clearForm()
  nextTick(() => {
    treeRef.value.setCheckedKeys([])
  })
  // 修改时，设置数据
  if (id) {
    loadForm.value = true
    try {
      roleApi
        .getDetail({
          Id: id
        })
        .then((res: any) => {
          if (res.success) {
            form.value = {
              Id: res.response.role.Id,
              roleName: res.response.role.roleName,
              type: res.response.role.type,
              effective: res.response.role.effective,
              roleDescription: res.response.role.roleDescription,
              routeIds: res.response.routeIds,
              defaultRedirect: res.response.role.defaultRedirect
            }
            menuApi.getDataTree({ effective: true }).then((res: any) => {
              menuData.value = handleTree(res.response, "Id", "pId")
              fullPathRootList.value = addFullPath(menuData.value)
              nextTick(() => {
                // treeRef.value.setCheckedKeys(res.response.routeIds);
                // 设置选中
                form.value.routeIds.forEach((menuId: number) => {
                  treeRef.value.setChecked(menuId, true, false)
                })
              })
            })
          }
        })
    } finally {
      loadForm.value = false
    }
  } else {
    menuApi.getDataTree({ effective: true }).then((res: any) => {
      menuData.value = handleTree(res.response, "Id", "pId")
      fullPathRootList.value = addFullPath(menuData.value)
    })
  }
}
defineExpose({ openDialog }) // 提供 open 方法，用于打开弹窗

// 清空表单
const clearForm = () => {
  formRef.value?.resetFields()
  form.value = {
    roleName: "",
    type: "",
    effective: true,
    roleDescription: "",
    defaultRedirect: ""
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
      loading.value = true
      const checkedMenuIds: number[] = treeRef.value.getCheckedNodes(false, true).map((node: any) => node.Id)
      const query = {
        role: form.value,
        routeIds: checkedMenuIds
      }
      if (title.value === "新增") {
        try {
          roleApi.add(query).then((res: any) => {
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
          roleApi.update(query).then((res: any) => {
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
</script>

<style lang="scss" scoped>
.form {
  .el-form {
    justify-content: space-between;
  }

  .el-form--inline .el-form-item {
    width: 48%;
    margin-right: 0;
  }
}
</style>
