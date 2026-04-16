<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="800px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="top" :rules="rules"
                :disabled="true">
                <el-form-item label="巡护人" prop="">
                    <el-input v-model="form.User_Name" readonly placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="巡护图片" prop="">
                    <el-image style="width: 150px; max-height: 150px" :src="'/statisUrl/' + form.GjImg"
                        hide-on-click-modal close-on-press-escape :preview-src-list="['/statisUrl/' + form.GjImg]"
                        fit="cover" />
                </el-form-item>
                <el-form-item label="巡护方式" prop="">
                    <el-input v-model="form.Xhtype" readonly placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="巡护公里(km)" prop="">
                    <el-input v-model="form.Xhkm" readonly placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="巡护时长" prop="">
                    <el-input v-model="form.Xhtime" readonly placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="巡护日期" prop="">
                    <el-input v-model="form.XhRq" readonly placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="开始时间" prop="">
                    <el-input v-model="form.StartTime" readonly placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="结束时间" prop="">
                    <el-input v-model="form.StopTime" readonly placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="采集个数" prop="">
                    <el-input v-model="form.CollectionCount" readonly placeholder=""></el-input>
                </el-form-item>
                <el-form-item label="报警个数" prop="">
                    <el-input v-model="form.AlarmCount" readonly placeholder=""></el-input>
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
