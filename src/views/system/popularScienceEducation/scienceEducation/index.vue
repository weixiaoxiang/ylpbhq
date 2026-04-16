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
        <el-form-item label="文章名称：">
          <el-input
            v-model="queryParams.mc"
            clearable
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="作者：">
          <el-input
            v-model="queryParams.author"
            clearable
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="来源：">
          <el-input
            v-model="queryParams.sources"
            clearable
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="文章类别：">
          <el-select
            v-model="queryParams.typename"
            style="width: 150px"
            :teleported="false"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="item in optionType"
              :label="item.label"
              :value="item.value"
              :key="item.value"
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
          <el-button
            type="primary"
            plain
            @click="handleAdd"
            :icon="Plus"
            >新增</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <div class="table-box">
      <el-table
        class="tableList"
        v-adaptive="{ bottom: 68 }"
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
          label="文章名称"
          width="130"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="author"
          label="作者"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="sources"
          label="来源"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="typename"
          label="类别"
          align="center"
        >
          <template #default="scope">
            {{ typeName(scope.row.typename) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="coverimgurl"
          label="封面图片"
          align="center"
        >
          <template #default="scope">
            <el-image
              v-if="scope.row.coverimgurl"
              style="width: 80px; height: 48px"
              fit="cover"
              :src="getImgUrl(scope.row.coverimgurl)"
              :preview-src-list="[getImgUrl(scope.row.coverimgurl)]"
              :preview-teleported="true"
              hide-on-click-modal
            >
              <template #error>
                <div
                  class="error-image-slot"
                  style="color: #333"
                >
                  <el-icon><icon-picture /></el-icon>
                  暂无图片
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column
          prop="publishtime"
          label="发表时间"
          width="200"
          align="center"
        >
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="220"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              type="warning"
              @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              @click.stop="handleDelete(scope.row.Id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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
    </div>
    <!-- 弹窗 -->
    <HandleForm
      ref="formRef"
      :optionType="optionType"
      @success="getList(1)"
    ></HandleForm>
  </div>
</template>
<script setup lang="ts">
import { Plus, Search } from "@element-plus/icons-vue"
import HandleForm from "./form.vue"
import { PopularScienceEducationApi } from "@/api/SystemManage/PopularScienceEducation"
import Pagination from "@/components/Pagination/index.vue"
const queryParams = ref<any>({
  mc: "",
  titles: "",
  author: "",
  sources: "",
  typename: null,
  page: 1,
  intPageSize: 15
})
const optionType = ref<any>([])
const total = ref(0)
const queryFormRef = ref()
const tableList = ref<any>([])
const formRef = ref() //新增表单
const typeName = (id: any) => {
  let ele = optionType.value.find((item: any) => item.label == id)
  return ele ? ele.label : ""
}
const getImgUrl = (val: any) => {
  if (val) {
    if (val.substring(0, 1) === "/") {
      return "/statisUrl" + val
    } else {
      return "/statisUrl/" + val
    }
  }
}
//获取数据
const getList = (val?: number) => {
  if (val == 1) {
    queryParams.value.page = 1
  }
  PopularScienceEducationApi.getDataByPage(queryParams.value).then((res: any) => {
    if (res.success) {
      tableList.value = res.response.data
      total.value = res.response.dataCount
    } else {
      tableList.value = []
      total.value = 0
    }
  })
}
//获取文章类别
const getParentorgtypeList = () => {
  optionType.value = []
  PopularScienceEducationApi.GetArticleType({}).then((res: any) => {
    if (res.success) {
      if (res.response.length > 0) {
        res.response.forEach((item: any) => {
          optionType.value.push({
            label: item.mc,
            value: item.mc
          })
        })
      }
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
const handleAdd = async () => {
  formRef.value.openDialog("新增")
}
//修改
const handleEdit = async (row: any) => {
  formRef.value.openDialog("编辑", row)
}
//删除
const handleDelete = (id: number) => {
  ElMessageBox.confirm("是否确认删除此条数据?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    PopularScienceEducationApi.delete({ id: id }).then((res: any) => {
      if (res.success) {
        ElMessage({
          type: "success",
          message: "删除成功"
        })
        handleQuery()
      } else {
        ElMessage({
          type: "error",
          message: res.msg
        })
      }
    })
  })
}
//分页
const handleChangePage = (info: any) => {
  queryParams.value.page = info.page
  queryParams.value.intPageSize = info.limit
  getList()
}
onMounted(() => {
  getList()
  getParentorgtypeList()
})
</script>

<style scoped lang="scss"></style>
