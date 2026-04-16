<template>
  <div class="page">
      <div class="search-content">
          <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
              @keyup.enter.native="handleQuery" clearable>
              <el-form-item label="图层名称：">
                  <el-input v-model="queryParams.keyWord" clearable placeholder="请输入"></el-input>
              </el-form-item>
              <el-form-item label-width="0">
                  <el-button type="primary" @click="handleQuery" :icon="Search">查询</el-button>
                  <el-button type="primary" @click="handleAdd(null)" :icon="Plus">新增</el-button>
              </el-form-item>
          </el-form>
      </div>
      <div class="table-box">
          <el-table class="tableList" v-adaptive v-loading="loading" :data="tableList" highlight-current-row
              :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" row-key="id">
              <el-table-column type="index" width="60" label="序号" align="left" />
              <el-table-column prop="mc" label="图层名称" align="left"> </el-table-column>
              <el-table-column prop="tabtype" label="图层类型" align="center">
                  <template #default="scope">{{getTabType(scope.row.tabtype)}}</template>
              </el-table-column>
              <!-- <el-table-column prop="icon" label="图标" align="left">
                  <template #default="scope">
                      <el-image v-if="scope.row.tabtype == 0 || scope.row.tabtype == '本底资源'" :src="'/imageApi/' + scope.row.icon"
                          :preview-src-list="['/statisUrl/' + scope.row.icon]" :preview-teleported="true"
                          hide-on-click-modal style="width: 30px;" />
                      <div v-else :style="getStyle(scope.row)"></div>
                  </template>
              </el-table-column> -->
              <!-- <el-table-column prop="effective" label="是否展示" key="effective" align="left">
                  <template #default="scope">
                      <el-switch v-model="scope.row.effective" :active-value="true" :inactive-value="false"
                          @change="handleStatusChange(scope.row)" />
                  </template>
              </el-table-column> -->
              <el-table-column prop="creattime" label="创建时间" align="left">
              </el-table-column>
              <el-table-column label="操作" fixed="right" width="380" align="center"
                  class-name="small-padding fixed-width">
                  <template #default="scope">
                      <el-button type="warning" @click="handleEdit(scope.row)">编辑</el-button>
                      <el-button type="danger" @click.stop="handleDelete(scope.row.id)">
                          删除
                      </el-button>
                      <el-button v-if="getTabType(scope.row.tabtype)=='文件夹'" type="primary" @click.stop="handleAdd(scope.row)">
                          添加下级
                      </el-button>
                  </template>
              </el-table-column>
          </el-table>
      </div>
      <!-- 弹窗 -->
      <HandleForm ref="formRef" @success="getList()"></HandleForm>
  </div>
</template>
<script setup lang="ts">
import { Plus, Search } from "@element-plus/icons-vue";
import HandleForm from "./form.vue";
import { handleTree } from "@/utils/tree";
import {
  layerApi
} from "@/api/SystemManage/layer";
const queryParams = ref<any>({
  keyWord: ''
});

const loading = ref(false);
const queryFormRef = ref();
const tableList = ref<any>([]);
const formRef = ref(); //新增表单

const getTabType = (type:any) => {
  if (type == 0) {
      return '点'
  }
  else if (type == 1) {
      return '线'
  }
  else if (type == 2) {
      return '面'
  }
  else if (type == null) {
      return '文件夹'
  }
}
const getStyle = (row:any) => {
  if (row.tabtype == '1') {
      return {
          width: '30px',
          height: '2px',
          background: row.frame,
      };
  }
  else if (row.tabtype == '2') {
      return {
          width: '30px',
          height: '20px',
          background: row.fill,
          border: `1px solid ${row.frame}`,
      };
  }
}
//获取数据
const getList = () => {
  loading.value = true;
  layerApi.getLayerTree(queryParams.value).then((res:any) => {
      loading.value = false;
      console.log(res.response);
      
      if (res.success) {

          tableList.value = handleTree(res.response, 'id', 'parentid', 'children');
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
const handleAdd = async (row:any) => {
  formRef.value.openDialog(row ?"新增下级":'新增', row);
};
//修改
const handleEdit = async (row: any) => {
  let data = Object.assign({}, row)
  formRef.value.openDialog("编辑", data);
};


//修改状态
const handleStatusChange = async (row:any) => {
  try {
      // 发起修改状态
      layerApi.updateStatus(row).then((res:any) => {
          if (res.success) {
              ElMessage({
                  type: "success",
                  message: "修改成功",
              });
              // await getList();// 刷新列表
          } else {
              row.effective = !row.effective;
          }
      });
  } catch {
      // 取消后，进行恢复按钮
      row.effective = !row.effective;
  }
};
//删除
const handleDelete = (id: number) => {
  ElMessageBox.confirm("是否确认删除此条数据?", "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
  })
      .then(() => {
          layerApi.delete({ layerId: id,is_del:true }).then((res: any) => {
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

<style scoped lang="scss"></style>
