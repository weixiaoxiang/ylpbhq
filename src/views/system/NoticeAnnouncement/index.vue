<template>
    <div class="page">
        <div class="search-content">
            <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
                @keyup.enter.native="handleQuery" clearable>
                <el-form-item label="主标题：" prop="noticetitle">
                    <el-input v-model="queryParams.noticetitle" clearable placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label-width="0">
                    <el-button type="primary" @click="handleQuery" :icon="Search">查询</el-button>
                    <el-button v-hasPerm="['sys:notice:add']" type="primary" plain @click="handleAdd"
                        :icon="Plus">新增</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table-box">
            <el-table class="tableList" v-adaptive="{ bottom: 68 }" :data="tableList">
                <el-table-column type="index" width="60" label="序号" align="center" />
                <el-table-column prop="noticetitle" label="主标题" width="330" align="center">
                </el-table-column>
                <el-table-column prop="subtitle" label="副标题" align="center">
                </el-table-column>
                <el-table-column prop="createtime" label="发布时间" align="center">
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="220" align="center"
                    class-name="small-padding fixed-width">
                    <template #default="scope">
                        <el-button v-hasPerm="['sys:notice:edit']" type="warning"
                            @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button v-hasPerm="['sys:notice:delete']" type="danger"
                            @click.stop="handleDelete(scope.row.Id)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination-box" v-if="total > 0">
                <pagination v-model:total="total" v-model:page="queryParams.page"
                    v-model:limit="queryParams.intPageSize" @pagination="handleChangePage" />
            </div>
        </div>
        <!-- 弹窗 -->
        <organizeForm ref="formRef" @success="getList(1)"></organizeForm>

    </div>
</template>
<script setup lang="ts">
import { Plus,Search } from "@element-plus/icons-vue";
import organizeForm from "./form.vue";
import {
    noticeApi
} from "@/api/SystemManage/notice";
import Pagination from "@/components/Pagination/index.vue";
const queryParams = ref<any>({
    noticetitle: "",
    page: 1,
    intPageSize: 15,
});
const total = ref(0);
const queryFormRef = ref();
const tableList = ref<any>([]);
const formRef = ref(); //新增表单
//获取数据
const getList = (val?: number) => {
    if (val == 1) {
        queryParams.value.page = 1;
    }
    noticeApi.getDataByPage(queryParams.value).then((res:any) => {
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
const handleAdd = async () => {
    formRef.value.openDialog("新增");
};
//修改
const handleEdit = async (row: any) => {
    formRef.value.openDialog("编辑", row);
};
//删除
const handleDelete = (id: number) => {
    ElMessageBox.confirm("是否确认删除此条数据?", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(() => {
            noticeApi.delete({ id:id}).then((res: any) => {
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
});
</script>

<style scoped lang="scss">

</style>
