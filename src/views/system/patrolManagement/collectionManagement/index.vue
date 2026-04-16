<template>
  <div class="page">
    <div class="search-content">
      <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
        @keyup.enter.native="handleQuery" clearable>
        <el-form-item label="采集人：" prop="user_name">
          <el-input v-model="queryParams.user_name" clearable placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="类别：">
          <el-select style="width: 200px;" v-model="queryParams.collectiontype" :teleported="false" placeholder="请选择"
            clearable>
            <el-option v-for="(item, index) in optionType"  :label="item.typename" :value="item.Id"
              :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间：">
          <el-date-picker v-model="queryParams.collectiontimes" type="date" placeholder="请选择时间" align="right"
            :disabled-date="disabledDate1" format="YYYY-MM-DD" value-format="YYYY-MM-DD 00:00:00"></el-date-picker>
          -
          <el-date-picker v-model="queryParams.collectiontimee" type="date" placeholder="请选择时间" align="right"
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
        <el-table-column prop="collectionname" label="采集名称" align="center">
        </el-table-column>
        <el-table-column prop="collectiontypename" label="采集类型" align="center">
        </el-table-column>
        <el-table-column prop="real_name" label="采集人" align="center">
        </el-table-column>
        <el-table-column prop="remark" label="采集地址" align="center">
        </el-table-column>
        <el-table-column prop="locationtype" label="定位类型" align="center">
        </el-table-column>
        <el-table-column prop="real_lon" label="经度" align="center">
        </el-table-column>
        <el-table-column prop="real_lat" label="纬度" align="center">
        </el-table-column>
        <el-table-column prop="uploaddate" label="采集时间" align="center">
        </el-table-column>
        <el-table-column prop="name" label="所属机构" align="center">
        </el-table-column>
        <el-table-column label="操作" fixed="right" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button v-hasPerm="['sys:notice:edit']" type="warning" @click="handleEdit(scope.row)">查看</el-button>
            <el-button v-hasPerm="['sys:notice:delete']" type="danger" @click.stop="handleDelete(scope.row.id)">
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
    <!-- 弹窗 -->
    <organizeForm ref="formRef"></organizeForm>

  </div>
</template>
<script setup lang="ts">
import { Plus, Search } from "@element-plus/icons-vue";
import organizeForm from "./form.vue";
import {
  collectApi,
  collectTypeApi
} from "@/api/SystemManage/patrol";
import Pagination from "@/components/Pagination/index.vue";
const queryParams = ref<any>({
  user_name: "",
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
  collectApi.getDataByPage(queryParams.value).then((res: any) => {
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
//获取采集类型列表
const getTypeList = () => {
  collectTypeApi.getDataByPage({
    page: 1,
    intPageSize: 1000
  }).then((res: any) => {
    if (res.success) {
      optionType.value = res.response.data
    }
  })
}
//修改
const handleEdit = async (row: any) => {
  formRef.value.openDialog("查看", row);
};
const disabledDate1 = (time: Date) => {
  if (queryParams.collectiontimee) {
    return time.getTime() > new Date(queryParams.collectiontimee).getTime()
  } else {
    return false
  }
}

const disabledDate2 = (time: Date) => {
  if (queryParams.collectiontimes) {
    return time.getTime() < new Date(queryParams.collectiontimes).getTime()
  } else {
    return false
  }
}
//删除
const handleDelete = (id: number) => {
  ElMessageBox.confirm("是否确认删除此条数据?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      collectApi.delete({ id: id }).then((res: any) => {
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
onMounted(() => {
  getList();
  getTypeList()
});
</script>

<style scoped lang="scss"></style>
