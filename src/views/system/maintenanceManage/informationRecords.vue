<template>
    <div class="page">
        <div class="search-content">
            <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
                @keyup.enter.native="handleQuery" clearable>
                <el-form-item label="关键字:" label-width="74px">
                    <el-input v-model="queryParams.keyWord" placeholder="请输入关键字查询" clearable></el-input>
                </el-form-item>
                <el-form-item label="厂商类型：">
                    <el-select style="width: 120px;" v-model="queryParams.manufacturerType" :teleported="false" placeholder="请选择" clearable>
                        <el-option v-for="item in option1" :label="item.label" :value="item.label"
                            :key="item.value"></el-option>
                    </el-select>
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
                <el-table-column prop="chargeName" label="负责人姓名" align="center">
                </el-table-column>
                <el-table-column prop="phone" label="发送手机号码" align="center">
                </el-table-column>
                <el-table-column prop="content" label="发送内容" align="center">
                </el-table-column>
                <el-table-column prop="sendTime" label="发送时间" align="center">
                </el-table-column>
                <el-table-column prop="sendType" label="发送类型" align="center">
                </el-table-column>
                <el-table-column prop="manufacturerType" label="厂商类型" align="center">
                </el-table-column>
                <el-table-column prop="manufacturerName" label="厂商名称" align="center">
                </el-table-column>
            </el-table>

            <div class="pagination-box" v-if="total > 0">
                <pagination v-model:total="total" v-model:page="queryParams.page"
                    v-model:limit="queryParams.intPageSize" @pagination="getList" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import {
    getPageSMSLog
} from "@/api/SystemManage/maintenanceManage";
import Pagination from "@/components/Pagination/index.vue";
import { Search } from "@element-plus/icons-vue";
const queryParams = ref<any>({
    keyWord: "",
    manufacturerType: '',
    startTime: '',
    endTime: '',
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
const option1 = ref([{
    value: 1,
    label: '管理员'
}, {
        value: 2,
        label: '运维'
    }])
const total = ref(0);
const queryFormRef = ref();
const tableData = ref<any>([]);
//获取数据
const getList = (val?: number) => {
    if (val == 1) {
        queryParams.value.page = 1;
    }
    getPageSMSLog(queryParams.value).then((res) => {
        if (res.success) {
            tableData.value = res.response.data;
            total.value = res.response.dataCount;
        } else {
            tableData.value = [];
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

onMounted(() => {
    getList();
});
</script>

<style scoped lang="scss"></style>
