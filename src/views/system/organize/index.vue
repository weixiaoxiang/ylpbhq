<template>
  <div class="page">
      <div class="search-content">
          <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
              @keyup.enter.native="handleQuery" clearable>
              <el-form-item label="组织机构名称：">
                  <el-input v-model="queryParams.keyWord" clearable placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label-width="0">
                  <el-button type="primary" @click="handleQuery" :icon="Search">查询</el-button>
                  <el-button v-hasPerm="['sys:organize:add']" type="primary" plain @click="handleAdd(0)"
                      :icon="Plus">新增</el-button>
              </el-form-item>
          </el-form>
      </div>
      <div class="table-box">
          <el-table v-adaptive class="tableList" default-expand-all :data="tableList" highlight-current-row
              row-key="Id">
              <el-table-column type="index" width="60" label="序号" align="center" />
              <el-table-column prop="name" label="组织机构名称">
              </el-table-column>
              <el-table-column prop="createtime" label="创建时间" align="center" width="200">
              </el-table-column>
              <el-table-column label="排序" align="center" width="80" prop="sort" />
              <el-table-column label="操作" fixed="right" width="280" align="center"
                  class-name="small-padding fixed-width">
                  <template #default="scope">
                      <el-button v-hasPerm="['sys:organize:add']" type="primary"
                          @click="handleAdd(scope.row)">新增</el-button>
                      <el-button v-hasPerm="['sys:organize:edit']" type="warning"
                          @click="handleEdit(scope.row)">编辑</el-button>
                      <el-button v-hasPerm="['sys:organize:delete']" type="danger"
                          @click.stop="handleDelete(scope.row.Id)">
                          删除
                      </el-button>
                  </template>
              </el-table-column>
          </el-table>
      </div>
      <!-- 弹窗 -->
      <organizeForm ref="formRef" @success="getList(1)"></organizeForm>

  </div>
</template>
<script setup lang="ts">
import { Plus,Search } from "@element-plus/icons-vue";
import organizeForm from "./form.vue";
import { handleTree } from "@/utils/tree"
import {
  organizeApi
} from "@/api/SystemManage/organize";
const queryParams = ref<any>({
  keyWord: "",
});
const queryFormRef = ref();
const tableList = ref<any>([]);
const formRef = ref(); //新增表单
const defaultProps = ref<any>({
  label: 'name',
  children: 'children',
})
//获取数据
const getList = (val?: number) => {
  if (val == 1) {
      queryParams.value.page = 1;
  }
  organizeApi.getDataByPage(queryParams.value).then((res) => {
      if (res.success) {
          tableList.value = res.response;
      } else {
          tableList.value = [];
      }
  });
};

// 查询
const handleQuery = () => {
  queryParams.value.page = 1;
  getList();
};
// 重置查询
const resetQuery = () => {
  queryFormRef.value.resetFields();
  handleQuery();
}
// 添加
const handleAdd = async (row: any) => {
  formRef.value.openDialog("新增", row);
};
//修改
const handleEdit = async (row: any) => {
  formRef.value.openDialog("编辑", row);
};
//删除
const handleDelete = (id: number) => {
  ElMessageBox.confirm("是否确认删除此条数据?", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
  })
      .then(() => {
          organizeApi.delete({ organizationId:id}).then((res: any) => {
              if (res.success) {
                  ElMessage({
                      type: "success",
                      message: "删除成功",
                  });
                  handleQuery();
              } else {
                  ElMessage({
                      type: "error",
                      message: res.msg,
                  });
              }
          });
      })
};
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">

</style>
