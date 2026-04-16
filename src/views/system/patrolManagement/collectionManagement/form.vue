<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="800px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="top" :rules="rules"
                :disabled="true">
                <el-form-item label="采集名称">
                    <el-input v-model="form.collectionname" placeholder="-请输入采集名称-"></el-input>
                </el-form-item>
                <el-form-item label="采集类型">
                    <el-input v-model="form.collectiontypename" placeholder="-请输入采集类型-"></el-input>
                </el-form-item>
                <el-form-item label="采集人">
                    <el-input v-model="form.real_name" placeholder="-请输入采集人-"></el-input>
                </el-form-item>
                <el-form-item label="采集地址">
                    <el-input v-model="form.remark" placeholder="-请输入采集地址-"></el-input>
                </el-form-item>
                <el-form-item label="部门名称">
                    <el-input v-model="form.name" placeholder="-请输入部门名称-"></el-input>
                </el-form-item>
                <el-form-item label="定位类型">
                    <el-input v-model="form.locationtype" placeholder="-请输入定位类型-"></el-input>
                </el-form-item>
                <el-form-item label="经度">
                    <el-input v-model="form.real_lon" placeholder="-请输入经度-"></el-input>
                </el-form-item>
                <el-form-item label="纬度">
                    <el-input v-model="form.real_lat" placeholder="-请输入纬度-"></el-input>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="form.describe" placeholder="-请输入描述-"></el-input>
                </el-form-item>
                <el-form-item label="图片">
                    <el-image v-for="(item, index) in imageList" style="width: 150px; max-height: 150px" :key="index"
                        :src="item" hide-on-click-modal close-on-press-escape :preview-src-list="imageList"
                        fit="cover" />
                </el-form-item>
                <el-form-item label="采集时间" prop="remark">
                    <el-input v-model="form.remark" placeholder="-请输入采集时间-"></el-input>
                </el-form-item>
                <el-form-item label="采集位置" prop="remark" class="map">
                    <Map :lonlat="[form.real_lon, form.real_lat]" :isClick="false"></Map>
                </el-form-item>
            </el-form>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import UploadImg from "@/components/Upload/UploadImg.vue";
import Dialog from "@/components/Dialog/index.vue";
import Map from "@/components/Map/index.vue";
import { collectTypeApi } from "@/api/SystemManage/patrol";
const show = ref(false);
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const title = ref("新增");
const imageList = ref<any>([])
const parentorgtype = ref<any>([]) // 上级组织机构
//表单数据
const form = ref<any>({
    typename: '',
    remark: '',
});
//校验规则
const rules = {
    typename: [{ required: true, message: "请输入类型名称", trigger: "blur" },
    ]
};
/** 打开弹窗 */
const openDialog = async (type: string, row?: any) => {
    show.value = true;
    title.value = type;
    clearForm();
    // 修改时，设置数据
    if (row) {
        form.value = Object.assign({}, row);
        imageList.value = row.filelist.map((item: any) => {
            return '/statisUrl/' + item.filepath
        })
    }
};
defineExpose({ openDialog }); // 提供 open 方法，用于打开弹窗

// 清空表单
const clearForm = () => {
    formRef.value?.resetFields();
    form.value = {
        typename: '',
        remark: '',
    };
};
//关闭弹框
const close = () => {
    show.value = false;
    loading.value = false;
};

</script>

<style lang="scss" scoped>
.form {
    .el-form--inline .el-form-item {
        width: 100%;
        margin-right: 0;
    }

    .map {
        :deep(.el-form-item__content) {
            width: 100%;
            height: 400px;
            position: relative;
        }
    }


}

:deep(.el-textarea.is-disabled) {
    .el-textarea__inner {
        background-color: var(--el-bg-color) !important;
        color: #606266 !important;
        cursor: text !important;
    }
}

:deep(.el-input.is-disabled) {
    .el-input__inner {
        color: #606266;
        -webkit-text-fill-color: #606266;
        cursor: text;
    }

    .el-input__wrapper {
        background-color: var(--el-bg-color);
        box-shadow: 0 0 0 1px var(--el-disabled-border-color) inset;
        cursor: text;
    }
}
</style>
