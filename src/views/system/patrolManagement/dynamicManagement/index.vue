<template>
  <div class="page">
    <div class="search-content">
      <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
        @keyup.enter.native="handleQuery" clearable>
        <el-form-item label="动态标题:" label-width="84px">
          <el-input v-model="queryParams.Mc" placeholder="请输入动态标题" clearable></el-input>
        </el-form-item>
        <el-form-item label-width="0">
          <el-button type="primary" @click="handleQuery" :icon="Search">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-box">
      <el-table class="tableList" v-adaptive="{ bottom: 68 }" :data="tableData">
        <el-table-column type="index" width="65" label="序号" align="center">
        </el-table-column>
        <el-table-column prop="nametitle" label="标题" align="center">
        </el-table-column>
        <el-table-column prop="contenttext" label="简介摘要" align="center">
        </el-table-column>
        <el-table-column prop="type" label="类型" align="center">
        </el-table-column>
        <el-table-column prop="sharenumber" label="分享数" show-overflow-tooltip align="center">
        </el-table-column>
        <el-table-column prop="fabnumber" label="点赞数" align="center">
        </el-table-column>
        <el-table-column prop="readcount" label="阅读次数" align="center"> </el-table-column>
        <!-- <el-table-column prop="real_lat" label="纬度" align="center"> </el-table-column> -->
        <el-table-column prop="createtime" label="创建时间" align="center">
        </el-table-column>
        <el-table-column prop="reporttime" label="操作" align="center">
          <template #default="scope">
            <!-- <el-button type="warning" @click="handleEdit(scope.row)">查看</el-button> -->
            <el-button type="danger" @click.stop="handleDelete(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-box" v-if="total > 0">
        <pagination v-model:total="total" v-model:page="queryParams.page" v-model:limit="queryParams.intPageSize"
          @pagination="handleChangePage" />
      </div>
    </div>
    <!-- <HandleForm ref="formRef"></HandleForm> -->
  </div>
</template>
<script setup lang="ts">
import {
  dynamicApi
} from "@/api/SystemManage/patrol";
import Pagination from "@/components/Pagination/index.vue";
import { Search } from "@element-plus/icons-vue";
// import HandleForm from "./form.vue"
const queryParams = ref<any>({
  Mc: "",
  startTime: "",
  endTime: "",
  page: 1,
  intPageSize: 15,
  alarmtype:null
});
const optionType = ref<any>([])

const total = ref(0);
const queryFormRef = ref();
const tableData = ref<any>([]);
const formRef = ref(); //新增表单

//获取数据
const getList = (val?: number) => {
  if (val == 1) {
    queryParams.value.page = 1;
  }
  dynamicApi.getDataByPage(queryParams.value).then((res: any) => {
    if (res.success) {
      tableData.value = res.response.data;
      total.value = res.response.dataCount;
    } else {
      tableData.value = [];
      total.value = 0;
    }
  });
};
//修改
const handleEdit = async (row: any) => {
  let data = Object.assign({}, row)
  formRef.value.openDialog("查看", data);
};
//删除
const handleDelete = (id: number) => {
  ElMessageBox.confirm("是否确认删除此条数据?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      dynamicApi.delete({ id: id }).then((res: any) => {
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
//分页
const handleChangePage = (info: any) => {
  queryParams.value.page = info.page
  queryParams.value.intPageSize = info.limit
  getList()
}
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

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss"></style>
