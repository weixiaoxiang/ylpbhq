<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="800px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="top"
                :disabled="true">
                <el-form-item label="真实名称">
                    <el-input v-model="form.username" placeholder="-请输入真实名称-"></el-input>
                </el-form-item>
                <el-form-item label="周数">
                    <el-input v-model="form.weeks" placeholder="-请输入周数-"></el-input>
                </el-form-item>
                <el-form-item label="上周主要工作标题">
                    <el-input v-model="form.lastweekreporttitle" placeholder="-请输入周数-"></el-input>
                </el-form-item>
                <el-form-item label="上周主要工作">
                    <el-input v-model="form.lastweekreport" type="textarea" :rows="3" placeholder="-请输入周数-"></el-input>
                </el-form-item>
                <el-form-item label="本周主要工作标题">
                    <el-input v-model="form.thisweekreporttitle" placeholder="-请输入周数-"></el-input>
                </el-form-item>
                <el-form-item label="本周主要工作">
                    <el-input v-model="form.thisweekreport" type="textarea" :rows="3" placeholder="-请输入周数-"></el-input>
                </el-form-item>
                <el-form-item label="上传日期">
                    <el-input v-model="form.reporttime" placeholder="-请输入上传日期-"></el-input>
                </el-form-item>
            </el-form>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import Dialog from "@/components/Dialog/index.vue";
const show = ref(false);
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const title = ref("新增");
//表单数据
const form = ref<any>({
});
/** 打开弹窗 */
const openDialog = async (type: string, row?: any) => {
    show.value = true;
    title.value = type;
    clearForm();
    // 修改时，设置数据
    if (row) {
        form.value = Object.assign({}, row);
    }
};
defineExpose({ openDialog }); // 提供 open 方法，用于打开弹窗

// 清空表单
const clearForm = () => {
    formRef.value?.resetFields();
    form.value = {
    };
};
//关闭弹框
const close = () => {
    show.value = false;
    loading.value = false;
};
// 确认
const emit = defineEmits(["success"]);


</script>

<style lang="scss" scoped>
.form {
    .el-form--inline .el-form-item {
        width: 100%;
        margin-right: 0;
    }
}

:deep(.el-textarea.is-disabled){
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
        cursor:text;
    }
}
</style>
