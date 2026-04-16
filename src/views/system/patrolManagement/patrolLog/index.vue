<template>
  <div class="page">
    <div class="search-content">
      <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
        @keyup.enter.native="handleQuery" clearable>
        <el-form-item label="巡护名称:" label-width="84px">
          <el-input v-model="queryParams.xhname" placeholder="请输入巡护名称查询" clearable></el-input>
        </el-form-item>
        <el-form-item label="巡护人员:" label-width="84px">
          <el-input v-model="queryParams.username" placeholder="请输入巡护人员查询" clearable></el-input>
        </el-form-item>
        <el-form-item label="时间：">
          <el-date-picker v-model="queryParams.startTime" type="date" placeholder="请选择时间" align="right"
            :disabled-date="disabledDate1" format="YYYY-MM-DD" value-format="YYYY-MM-DD 00:00:00"></el-date-picker>
          -
          <el-date-picker v-model="queryParams.endTime" type="date" placeholder="请选择时间" align="right"
            :disabled-date="disabledDate2" format="YYYY-MM-DD" value-format="YYYY-MM-DD 23:59:59"></el-date-picker>
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
        <el-table-column prop="xhname" label="巡护名称" align="center">
        </el-table-column>
        <el-table-column prop="real_name" label="巡护人员" align="center">
        </el-table-column>
        <el-table-column prop="createtime" label="创建时间" align="center">
        </el-table-column>
        <el-table-column prop="xhweather" label="巡护天气" align="center">
        </el-table-column>
        <!-- <el-table-column prop="czinfo" label="操作内容" align="center">
        </el-table-column> -->
      </el-table>
      <div class="pagination-box" v-if="total > 0">
        <pagination v-model:total="total" v-model:page="queryParams.page" v-model:limit="queryParams.intPageSize"
          @pagination="handleChangePage" />
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">
import {
  patrolLogApi
} from "@/api/SystemManage/patrol";
import Pagination from "@/components/Pagination/index.vue";
import { Search } from "@element-plus/icons-vue";
const queryParams = ref<any>({
  xhname: "",
  username: '',
  page: 1,
  intPageSize: 15,
  startTime: "",
  endTime: "",
});

const total = ref(0);
const queryFormRef = ref();
const tableData = ref<any>([]);
const disabledDate1 = (time: Date) => {
  if (queryParams.endTime) {
    return time.getTime() > new Date(queryParams.endTime).getTime()
  } else {
    return false
  }
}

const disabledDate2 = (time: Date) => {
  if (queryParams.startTime) {
    return time.getTime() < new Date(queryParams.startTime).getTime()
  } else {
    return false
  }
}
//获取数据
const getList = (val?: number) => {
  if (val == 1) {
    queryParams.value.page = 1;
  }
  patrolLogApi.getDataByPage(queryParams.value).then((res: any) => {
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
