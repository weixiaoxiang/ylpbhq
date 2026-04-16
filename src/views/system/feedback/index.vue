<template>
    <div class="page">
        <div class="search-content">
            <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
                @keyup.enter.native="handleQuery" clearable>
                <el-form-item label="关键字:" label-width="74px">
                    <el-input v-model="queryParams.mc" placeholder="请输入问题类型或问题描述" clearable></el-input>
                </el-form-item>
                <el-form-item label="上报人:" label-width="74px">
                    <el-input v-model="queryParams.real_name" placeholder="请输入上报人" clearable></el-input>
                </el-form-item>
                <el-form-item label="时间：">
                    <el-date-picker v-model="queryParams.startTime" type="date" placeholder="请选择时间" align="right"
                        :disabled-date="disabledDate1" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD 00:00:00"></el-date-picker>
                    -
                    <el-date-picker v-model="queryParams.endTime" type="date" placeholder="请选择时间" align="right"
                        :disabled-date="disabledDate2" format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD 23:59:59"></el-date-picker>
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
                <el-table-column prop="remark" label="上报人">
                </el-table-column>
                <el-table-column prop="types" label="问题类型">
                </el-table-column>
                <el-table-column prop="yjcontent" label="问题描述" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="uptime" label="上传时间" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="pictureid" label="图片" align="center">
                    <template #default="scope">
                        <el-image v-if="scope.row.pictureid" :src="'/statisUrl/' + scope.row.pictureid"
                            :preview-src-list="['/statisUrl/' + scope.row.pictureid]" style="height: 100px;" :preview-teleported="true"
                            fit="contain">
                        </el-image>
                        <span v-else>暂无图片</span>
                    </template>
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
    getxh_ideabackByPage
} from "@/api/SystemManage/log";
import Pagination from "@/components/Pagination/index.vue";
import { Search } from "@element-plus/icons-vue";
const queryParams = ref<any>({
    mc: "",
    real_name: "",
    startTime: "",
    endTime: "",
    page: 1,
    intPageSize: 15,
});
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
const total = ref(0);
const queryFormRef = ref();
const tableData = ref<any>([]);
//获取数据
const getList = (val?: number) => {
    if (val == 1) {
        queryParams.value.page = 1;
    }
    getxh_ideabackByPage(queryParams.value).then((res:any) => {
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
