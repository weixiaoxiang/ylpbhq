<template>
  <div class="page">
      <div class="search-content">
          <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
              @keyup.enter.native="handleQuery" clearable>
              <el-form-item label="名称：">
                  <el-input v-model="queryParams.mc" clearable placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label-width="0">
                  <el-button type="primary" @click="handleQuery" :icon="Search">查询</el-button>
              </el-form-item>
          </el-form>
      </div>
      <div class="table-box">
          <el-table class="tableList" v-adaptive="{ bottom: 68 }" v-loading="loading" :data="tableList">
              <el-table-column type="index" width="60" label="序号" align="left" />
              <el-table-column prop="name" label="设备名称" align="left"> </el-table-column>
              <el-table-column prop="equipmentType" label="设备类型" align="left"></el-table-column>
              <el-table-column prop="ssdw" label="所属单位" align="left" />
              <el-table-column prop="sbpp" label="设备品牌" align="left" />
              <el-table-column prop="lon" label="经度" align="left"></el-table-column>
              <el-table-column prop="lat" label="纬度" align="left"></el-table-column>
              <el-table-column prop="sbxh" label="设备型号" align="left" />
              <el-table-column prop="fzr" label="负责人" align="left" />
              <el-table-column prop="lxdh" label="联系电话" align="left" />
              <el-table-column prop="status" label="设备状态" align="left">
                  <template #default="scope">
                      <el-tag>{{ scope.row.status }}</el-tag>
                  </template>
              </el-table-column>
              <el-table-column label="操作" fixed="right" width="180" align="center"
                  class-name="small-padding fixed-width">
                  <template #default="scope">
                      <el-button type="warning" @click="handleEdit(scope.row)">编辑</el-button>
                  </template>
              </el-table-column>
          </el-table>
      </div>
      <div class="pagination-box" v-if="total > 0">
          <pagination v-model:total="total" v-model:page="queryParams.page" v-model:limit="queryParams.intPageSize"
              @pagination="handleChangePage" />
      </div>
      <!-- 弹窗 -->
      <HandleForm ref="formRef" @success="getList()"></HandleForm>
  </div>
</template>
<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import HandleForm from "./form.vue";
import Pagination from "@/components/Pagination/index.vue";
import {
  waterWeatherApi
} from "@/api/SystemManage/image";
const queryParams = ref<any>({
  mc: '',
  page: 1,
  intPageSize: 15
});

const loading = ref(false);
const queryFormRef = ref();
const tableList = ref<any>([]);
const total = ref(0);
const formRef = ref(); //新增表单
//获取数据
const getList = (val?: number) => {
  if (val == 1) {
      queryParams.value.page = 1;
  }
  waterWeatherApi.getData(queryParams.value).then((res:any) => {
      if (res.success) {
          tableList.value = res.response.data;
          total.value = res.response.dataCount;
      } else {
          tableList.value = [];
          total.value = 0;
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
const handleAdd = async (row) => {
  formRef.value.openDialog(row ? "新增下级" : '新增', row);
};
//修改
const handleEdit = async (row: any) => {
  let data = Object.assign({}, row)
  formRef.value.openDialog("编辑", data);
};
//分页
const handleChangePage = (info: any) => {
  queryParams.value.page = info.page
  queryParams.value.intPageSize = info.limit
  getList()
}

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss"></style>
