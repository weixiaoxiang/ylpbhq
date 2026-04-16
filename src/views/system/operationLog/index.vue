<template>
  <div class="page">
      <div class="search-content">
          <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
              @keyup.enter.native="handleQuery" clearable>
              <el-form-item label="关键字:" label-width="74px">
                  <el-input v-model="queryParams.keyWord" placeholder="请输入关键字查询" clearable></el-input>
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
              <el-table-column prop="real_name" label="操作人姓名" align="center">
              </el-table-column>
              <!-- <el-table-column prop="phone" label="操作人手机号" align="center">
              </el-table-column> -->
              <el-table-column prop="cztime" label="操作时间" align="center">
              </el-table-column>
              <el-table-column prop="cztype" label="操作类型" align="center">
              </el-table-column>
              <el-table-column prop="czinfo" label="操作内容" align="center">
              </el-table-column>
          </el-table>
          <div class="pagination-box" v-if="total > 0">
              <pagination v-model:total="total" v-model:page="queryParams.page"
                  v-model:limit="queryParams.intPageSize" @pagination="handleChangePage" />
          </div>
      </div>

  </div>
</template>
<script setup lang="ts">
import {
  operateLog
} from "@/api/SystemManage/log";
import Pagination from "@/components/Pagination/index.vue";
import { Search } from "@element-plus/icons-vue";
const queryParams = ref<any>({
  keyWord: "",
  page: 1,
  intPageSize: 15,
});

const total = ref(0);
const queryFormRef = ref();
const tableData = ref<any>([]);
//获取数据
const getList = (val?: number) => {
  if (val == 1) {
      queryParams.value.page = 1;
  }
  operateLog(queryParams.value).then((res) => {
      if (res.success) {
          tableData.value = res.response.data;
          total.value = res.response.dataCount;
      } else {
          tableData.value = [];
          total.value = 0;
      }
  });
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
