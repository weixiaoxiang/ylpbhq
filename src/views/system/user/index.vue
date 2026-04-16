<template>
  <div class="page">
    <div class="search-content">
      <el-form
        class="queryForm"
        ref="queryFormRef"
        :model="queryParams"
        label-width="auto"
        :inline="true"
        @keyup.enter.native="handleQuery"
        clearable
      >
        <el-form-item
          label="关键字:"
          prop="keyWord"
        >
          <el-input
            v-model="queryParams.keyWord"
            placeholder="-请输入关键字-"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item
          label="角色:"
          prop="roleId"
        >
          <el-select
            v-model="queryParams.roleId"
            :teleported="false"
            placeholder="请选择角色"
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
        <el-form-item label-width="0">
          <el-button
            type="primary"
            :icon="Search"
            @click="handleQuery"
            >查询</el-button
          >
          <el-button
            type="primary"
            plain
            :icon="Plus"
            @click="handleAdd"
            >新增</el-button
          >
        </el-form-item>
        <el-form-item label-width="0">
          <el-button
            type="success"
            :icon="ChatLineSquare"
            @click="openLoginModeDialog"
            >切换登录方式</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <div class="table-box">
      <el-table
        class="tableList"
        :data="tableData"
      >
        <el-table-column
          type="index"
          width="80"
          label="序号"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="user_name"
          label="用户名"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="real_name"
          label="真实姓名"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="organi_structure"
          label="所属机构"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="user_tel"
          label="手机号"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="jobposition"
          label="职务"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="roleName"
          label="角色"
          align="center"
        >
          <template #default="scope">
            <span>{{ getRoleName(scope.row.pcrole) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="user_state"
          label="状态"
          width="160"
          align="center"
        >
          <template #default="scope">
            <!-- :disabled="!checkPermi(['sys:user:editStatus'])" -->
            <el-switch
              v-model="scope.row.user_state"
              active-value="正常"
              inactive-value="禁止"
              @change="handleStatusChange(scope.row)"
            />
            <!-- <el-tag type="primary" v-if="scope.row.user_state=='正常'">{{ scope.row.user_state }}</el-tag>
                          <el-tag type="info" v-else>{{ scope.row.user_state }}</el-tag> -->
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="280"
          align="center"
        >
          <template #default="scope">
            <el-button
              type="warning"
              @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="success"
              @click="handleUpdatePwd(scope.row.id)"
              >修改密码</el-button
            >
            <el-button
              type="danger"
              @click.stop="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div
        class="pagination-box"
        v-if="total > 0"
      >
        <pagination
          v-model:total="total"
          v-model:page="queryParams.page"
          v-model:limit="queryParams.intPageSize"
          @pagination="handleChangePage"
        />
      </div>
    </div>
    <!-- 弹窗 -->
    <userForm
      ref="formRef"
      :roleOption="roleOption"
      @success="getList(1)"
    ></userForm>
    <updatePwdForm ref="updatePwdFormRef"></updatePwdForm>
    <LoginMode ref="loginModeRef"></LoginMode>
  </div>
</template>
<script setup lang="ts">
import userForm from "./form.vue"
import updatePwdForm from "./updatePwdForm.vue"
import { userApi } from "@/api/SystemManage/user.ts"
import { checkPermi } from "@/utils/permission.ts"
import { roleApi } from "@/api/SystemManage/role.ts"
import Pagination from "@/components/Pagination/index.vue"
import { Plus, Edit, Search, ChatLineSquare } from "@element-plus/icons-vue"
import LoginMode from "./loginMode.vue"
const formRef = ref()
const updatePwdFormRef = ref()
const loginModeRef = ref()
const queryParams = ref<any>({
  username: "",
  realname: "",
  usertel: "",
  page: 1,
  intPageSize: 15
})
//角色下拉框
const roleOption = ref<any>([])
const total = ref(0)
const queryFormRef = ref()
const tableData = ref<any>([])
//获取数据
const getList = (val?: any) => {
  console.log("val", val)

  if (val == 1) {
    queryParams.value.page = 1
  }
  //   else if(val != undefined){
  //     queryParams.value.page = val.page;
  //     queryParams.value.intPageSize = val.limit;
  //   }
  userApi.getDataByPage(queryParams.value).then((res: any) => {
    if (res.success) {
      tableData.value = res.response.data
      total.value = res.response.dataCount
    } else {
      tableData.value = []
      total.value = 0
    }
  })
}
// 获取角色数据
const getRoleData = () => {
  let query = {
    page: 1,
    intPageSize: 15,
    user_state: true
  }
  roleApi.getDataByPage(query).then((res: any) => {
    if (res.success) {
      roleOption.value = res.response.data
    } else {
      roleOption.value = []
    }
  })
}
// 查询
const handleQuery = () => {
  queryParams.value.page = 1
  getList()
}
// 重置查询
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}
// 添加
const handleAdd = async () => {
  formRef.value.openDialog("新增")
}
//修改
const handleEdit = async (row: any) => {
  formRef.value.openDialog("编辑", row)
}
//修改状态
const handleStatusChange = async (row: any) => {
  try {
    // 发起修改状态
    //   userApi.updateStatus({ userId: row.id, user_state: row.user_state=='正常'?0:1 }).then((res:any) => {
    //       if (res.success) {
    //           ElMessage({
    //               type: "success",
    //               message: "修改成功",
    //           });
    //           // await getList();// 刷新列表
    //       } else{
    //           row.user_state = !row.user_state;
    //       }
    //  });
    let query = Object.assign({}, row)
    if (query.user_state && query.user_state == "正常") {
      query.user_state = 0
    } else if (query.user_state && (query.user_state == "失效" || query.user_state == "禁止")) {
      query.user_state = 1
    }
    if (query.receive_state && query.receive_state == "正常") {
      query.receive_state = 0
    } else if (query.receive_state && query.receive_state == "禁止") {
      query.receive_state = 1
    }
    if (typeof query.organi_structure == "string") {
      query.organi_structure = query.organi_structureid
    }
    userApi.update(query).then((res: any) => {
      if (res.success) {
        ElMessage.success(res.msg)
      } else {
        row.user_state = !row.user_state
      }
    })
  } catch {
    // 取消后，进行恢复按钮
    row.user_state = !row.user_state
  }
}
//删除
const handleDelete = (id: number) => {
  ElMessageBox.confirm("是否确认删除此条数据?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    userApi.delete({ userId: id }).then((res: any) => {
      if (res.success) {
        ElMessage({
          type: "success",
          message: "删除成功"
        })
        handleQuery()
      } else {
        ElMessage({
          type: "error",
          message: res.msg
        })
      }
    })
  })
}

//修改密码
const handleUpdatePwd = (id: any) => {
  updatePwdFormRef.value.openDialog("修改密码", id)
}
//列表获取角色名称
const getRoleName = (roleId: any, txt?: any) => {
  let roleName = ""
  roleOption.value.forEach((item: any) => {
    if (item.Id == roleId) {
      roleName = item.roleName
    }
  })
  return roleName
}
//分页
const handleChangePage = (info: any) => {
  queryParams.value.page = info.page
  queryParams.value.intPageSize = info.limit
  getList()
}

// 切换登录方式
const openLoginModeDialog = () => {
  loginModeRef.value.openDialog()
}

onMounted(() => {
  getList()
  getRoleData()
})
</script>

<style scoped lang="scss"></style>
