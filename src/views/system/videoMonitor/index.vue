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
        <el-form-item label="监控名称：">
          <el-input
            v-model="queryParams.mc"
            clearable
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="类别：">
          <el-select
            style="width: 100px"
            v-model="queryParams.equipmentType"
            :teleported="false"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="(item, index) in optionType"
              :label="item.name"
              :value="item.name"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="0">
          <el-button
            type="primary"
            @click="handleQuery"
            :icon="Search"
            >查询</el-button
          >
          <!-- <el-button type="primary" @click="handleAdd(null)" :icon="Plus">新增</el-button> -->
        </el-form-item>
      </el-form>
    </div>
    <div class="table-box">
      <el-table
        class="tableList"
        v-loading="loading"
        :data="tableList"
      >
        <el-table-column
          type="index"
          width="60"
          label="序号"
          align="center"
        />
        <el-table-column
          prop="mc"
          label="监控名称"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="equipmentType"
          label="监控类型"
          align="center"
        ></el-table-column>
        <!--<el-table-column prop="equipmentmodel" label="型号" align="center"></el-table-column> 
                <el-table-column prop="ssreserve" label="所属保护区" align="center"></el-table-column>-->
        <el-table-column
          prop="lon"
          label="经度"
          align="center"
          width="200"
        ></el-table-column>
        <el-table-column
          prop="lat"
          label="纬度"
          align="center"
          width="200"
        ></el-table-column>
        <el-table-column
          prop="remark2"
          label="设备类型"
          align="center"
          width="200"
        ></el-table-column>

        <el-table-column
          label="操作"
          fixed="right"
          width="180"
          align="center"
          class-name="fixed-width"
        >
          <template #default="scope">
            <el-button
              type="warning"
              @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <!-- <el-button type="danger" @click.stop="handleDelete(scope.row.Id)">
                            删除
                        </el-button> -->
          </template>
        </el-table-column>
      </el-table>
    </div>
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
    <!-- 弹窗 -->
    <HandleForm
      ref="formRef"
      :optionType="optionType"
      @success="getList()"
    ></HandleForm>
  </div>
</template>
<script setup lang="ts">
import { Plus, Search } from "@element-plus/icons-vue"
import HandleForm from "./form.vue"
import Pagination from "@/components/Pagination/index.vue"
import { videoMonitorApi } from "@/api/SystemManage/videoMonitor"
const queryParams = ref<any>({
  mc: "",
  type: "",
  page: 1,
  intPageSize: 15
})
const optionType = ref<any>([
  { name: "人脸识别" },
  { name: "卡口监测" },
  { name: "防火监控点" },
  { name: "古树监控" },
  { name: "视频监控点" }
])

const loading = ref(false)
const queryFormRef = ref()
const tableList = ref<any>([])
const total = ref(0)
const formRef = ref() //新增表单
//获取数据
const getList = (val?: number) => {
  if (val == 1) {
    queryParams.value.page = 1
  }
  videoMonitorApi.getDataByPage(queryParams.value).then((res: any) => {
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
const handleAdd = async (row: any) => {
  formRef.value.openDialog(row ? "新增下级" : "新增", row)
}
//修改
const handleEdit = async (row: any) => {
  let data = Object.assign({}, row)
  formRef.value.openDialog("编辑", data)
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
