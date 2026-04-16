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

                <el-form-item label-width="0">
                    <el-button type="primary" @click="handleQuery" :icon="Search">查询</el-button>
                    <el-button type="primary" plain :icon="Plus" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table-box">
            <el-table class="tableList" v-adaptive="{ bottom: 68 }" :data="tableData">
                <el-table-column type="index" width="65" label="序号" align="center">
                </el-table-column>
                <el-table-column prop="manufacturerName" label="厂商名称" align="center">
                </el-table-column>
                <el-table-column prop="manufacturerType" label="厂商类型" align="center">
                </el-table-column>
                <el-table-column prop="chargeName" label="负责人姓名" align="center">
                </el-table-column>
                <el-table-column prop="phone" label="联系电话" align="center">
                </el-table-column>
                <el-table-column prop="email" label="邮箱" align="center">
                </el-table-column>
                <el-table-column prop="effective" label="是否启用" align="center">
                    <template #default="scope">
                        <el-switch v-model="scope.row.effective" :active-value="true" :inactive-value="false"
                            @change="handleStatusChange(scope.row)" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="280" align="center">
                    <template #default="scope">
                        <el-button type="warning"
                            @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button  type="success"
                            @click="handleEquipent(scope.row)">运维设备</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-box" v-if="total > 0">
                <pagination v-model:total="total" v-model:page="queryParams.page"
                    v-model:limit="queryParams.intPageSize" @pagination="getList" />
            </div>
        </div>
        <!-- 弹窗 -->
        <HandleForm ref="formRef" @success="getList(1)"></HandleForm>
    </div>
</template>
<script setup lang="ts">
import {
    getPageManufacturer,
    updateManufacturerStatus
} from "@/api/SystemManage/maintenanceManage";
import HandleForm from "./equipmentForm.vue";
import Pagination from "@/components/Pagination/index.vue";
import { Search, Plus } from "@element-plus/icons-vue";
const queryParams = ref<any>({
    keyWord: "",
    manufacturerType:'',
    page: 1,
    intPageSize: 15,
});
const option1 = ref([{ label: "管理员", value: 1 }, { label: "运维", value: 0 }]);
const total = ref(0);
const queryFormRef = ref();
const formRef = ref();
const tableData = ref<any>([]);
//获取数据
const getList = (val?: number) => {
    if (val == 1) {
        queryParams.value.page = 1;
    }
    getPageManufacturer(queryParams.value).then((res) => {
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
// 添加
const handleAdd = async () => {
    formRef.value.openDialog("新增");
};
//修改
const handleEdit = async (row) => {
    formRef.value.openDialog("编辑", row);
};
//修改状态
const handleStatusChange = async (row) => {
    try {
        // 发起修改状态
        updateManufacturerStatus({ manufacturerId: row.Id, effective: row.effective }).then(res => {
            if (res.success) {
                ElMessage({
                    type: "success",
                    message: "修改成功",
                });
            } else {
                row.effective = !row.effective;
            }
        });

    } catch {
        // 取消后，进行恢复按钮
        row.effective = !row.effective;
    }
};
//运维设备
const handleEquipent = (row) => {
    formRef.value.openDialog("运维设备", row);
}

onMounted(() => {
    getList();
});
</script>

<style scoped lang="scss"></style>
