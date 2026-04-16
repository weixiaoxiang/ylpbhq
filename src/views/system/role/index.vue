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
        <el-form-item label="关键字:">
          <el-input
            v-model="queryParams.keyWord"
            placeholder="请输入关键字查询"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item
          label="状态:"
          prop="effective"
        >
          <el-select
            v-model="queryParams.effective"
            :teleported="false"
            placeholder="请选择状态"
            filterable
            clearable
          >
            <el-option
              v-for="item in stateOption"
              :key="item.label"
              :value="item.value"
              :label="item.label"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="0">
          <el-button
            type="primary"
            @click="handleQuery"
            :icon="Search"
            >查询</el-button
          >
          <el-button
            type="primary"
            plain
            @click="handleAdd"
            :icon="Plus"
            >新增</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <div class="table-box">
      <el-table
        class="tableList"
        :data="tableList"
      >
        <el-table-column
          type="index"
          width="65"
          label="序号"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="roleName"
          label="角色名称"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="type"
          label="角色类型"
          align="center"
        >
          <template #default="scope">
            <span v-if="scope.row.type == 2">后台</span>
            <span v-else-if="scope.row.type == 1">前台</span>
            <span v-else-if="scope.row.type == 3">前台、后台</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="effective"
          label="状态"
          align="center"
        >
          <template #default="scope">
            <el-switch
              v-model="scope.row.effective"
              :disabled="!checkPermi(['sys:role:editStatus'])"
              :active-value="true"
              :inactive-value="false"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          align="center"
        >
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="220"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              type="warning"
              @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              @click.stop="handleDelete(scope.row.Id)"
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
    <roleForm
      ref="formRef"
      @success="getList(1)"
    ></roleForm>
  </div>
</template>
<script setup lang="ts">
import { Plus, Search } from "@element-plus/icons-vue"
import roleForm from "./form.vue"
import { checkPermi } from "@/utils/permission"
import { roleApi } from "@/api/SystemManage/role"
import Pagination from "@/components/Pagination/index.vue"
const queryParams = ref<any>({
  keyWord: "",
  page: 1,
  intPageSize: 15
})
// 状态下拉框
const stateOption = ref([
  {
    value: true,
    label: "正常"
  },
  {
    value: false,
    label: "失效"
  }
])
const total = ref(0)
const queryFormRef = ref()
const tableList = ref<any>([])
const formRef = ref() //新增表单
//获取数据
const getList = (val?: number) => {
  if (val == 1) {
    queryParams.value.page = 1
  }
  roleApi.getDataByPage(queryParams.value).then((res) => {
    if (res.success) {
      tableList.value = res.response.data
      total.value = res.response.dataCount
    } else {
      tableList.value = []
      total.value = 0
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
  formRef.value.openDialog("编辑", row.Id)
}
//修改状态
const handleStatusChange = async (row) => {
  try {
    // 发起修改状态
    roleApi.updateStatus({ Id: row.Id, effective: row.effective }).then((res) => {
      if (res.success) {
        ElMessage({
          type: "success",
          message: "修改成功"
        })
        // await getList();// 刷新列表
      } else {
        row.effective = !row.effective
      }
    })
  } catch {
    // 取消后，进行恢复按钮
    row.effective = !row.effective
  }
}
//删除
const handleDelete = (id: number) => {
  ElMessageBox.confirm("是否确认删除此条数据?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    roleApi.delete({ roleId: id }).then((res: any) => {
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
//分页
const handleChangePage = (info: any) => {
  queryParams.value.page = info.page
  queryParams.value.intPageSize = info.limit
  getList()
}
onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss"></style>
