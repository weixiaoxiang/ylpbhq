<template>
  <div class="page">
    <div class="search-content">
      <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
        @keyup.enter.native="handleQuery" clearable>
        <el-form-item label="巡护人：" prop="username">
          <el-input v-model="queryParams.username" clearable placeholder="请输入"></el-input>
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
          <!-- <el-button v-hasPerm="['sys:notice:add']" type="primary" plain @click="handleAdd" :icon="Plus">新增</el-button> -->
        </el-form-item>
      </el-form>
    </div>
    <div class="table-box">
      <el-table class="tableList" v-adaptive="{ bottom: 68 }" :data="tableList">
        <el-table-column type="index" width="60" label="序号" align="center" />
        <el-table-column prop="User_Name" label="巡护人" align="center">
        </el-table-column>
        <el-table-column prop="Xhtype" label="巡护方式" align="center">
        </el-table-column>
        <el-table-column prop="Xhtime" label="巡护时长" align="center">
        </el-table-column>
        <el-table-column prop="Xhkm" label="巡护里程(km)" align="center">
        </el-table-column>
        <el-table-column prop="XhRq" label="巡护日期" align="center">
        </el-table-column>
        <el-table-column label="操作" fixed="right" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button v-hasPerm="['sys:notice:edit']" type="warning" @click="handleEdit(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-box" v-if="total > 0">
        <pagination v-model:total="total" v-model:page="queryParams.page" v-model:limit="queryParams.intPageSize"
          @pagination="handleChangePage" />
      </div>
    </div>
    <!-- 弹窗 -->
    <organizeForm ref="formRef"></organizeForm>

  </div>
</template>
<script setup lang="ts">
import { Plus, Search } from "@element-plus/icons-vue";
import organizeForm from "./form.vue";
import {
  patrolApi,
} from "@/api/SystemManage/patrol";
import Pagination from "@/components/Pagination/index.vue";
const queryParams = ref<any>({
  username: "",
  page: 1,
  intPageSize: 15,
});
const total = ref(0);
const queryFormRef = ref();
const tableList = ref<any>([]);
const formRef = ref(); //新增表单

const optionType = ref<any>([])
//获取数据
const getList = (val?: number) => {
  if (val == 1) {
    queryParams.value.page = 1;
  }
  patrolApi.getDataByPage(queryParams.value).then((res: any) => {
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

//修改
const handleEdit = async (row: any) => {
  formRef.value.openDialog("查看", row);
};
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
