<template>
  <div class="page">
      <div class="search-content">
          <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
              @keyup.enter.native="handleQuery" clearable>
              <el-form-item label="关键字:">
                  <el-input v-model="queryParams.keyWord" placeholder="请输入关键字查询" clearable></el-input>
              </el-form-item>
              <el-form-item label-width="0">
                  <el-button type="primary" @click="handleQuery" :icon="Search">查询</el-button>
                  <!-- <el-button type="primary" plain @click="handleAdd" :icon="Plus">新增</el-button> -->
              </el-form-item>
          </el-form>
      </div>
      <div class="table-box">
          <el-table class="tableList" v-adaptive="{ bottom: 68 }" :data="tableList">
              <el-table-column type="index" width="65" label="序号" align="center">
              </el-table-column>
              <el-table-column prop="name" label="页面名称" align="center">
              </el-table-column>
              <el-table-column prop="identification" label="标识" align="center">
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" align="center">
              </el-table-column>
              <el-table-column label="操作" fixed="right" width="220" align="center"
                  class-name="small-padding fixed-width">
                  <template #default="scope">
                      <el-button type="warning" @click="handleEdit(scope.row)">编辑</el-button>

                  </template>
              </el-table-column>
          </el-table>
      </div>
      <!-- 弹窗 -->
      <dialogForm ref="formRef" @success="getList()"></dialogForm>


  </div>
</template>
<script setup lang="ts">
import { Plus, Search } from "@element-plus/icons-vue";
import dialogForm from "./form.vue";
import {
  layerApi
} from "@/api/SystemManage/layer";
const queryParams = ref<any>({
  keyWord: ""
});

const queryFormRef = ref();
const tableList = ref<any>([]);
const formRef = ref(); //新增表单
//获取数据
const getList = () => {
  layerApi.getLayerStyles(queryParams.value).then((res) => {
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
const handleAdd = async () => {
  formRef.value.openDialog("新增");
};
//修改
const handleEdit = async (row: any) => {
  formRef.value.openDialog("编辑", row.Id);
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss"></style>
