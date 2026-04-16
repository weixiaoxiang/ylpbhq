<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="500px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="top"
                :rules="rules">
                <el-form-item label="名称" prop="filename">
                    <el-input v-model="form.filename" placeholder="-请输入名称-"></el-input>
                </el-form-item>
                <el-form-item label="视频" prop="filepath">
                    <UploadVideo v-model="form.filepath"></UploadVideo>
                </el-form-item>
            </el-form>
        </div>
        <template #footer class="dialog-footer">
            <el-button @click="close">取 消</el-button>
            <el-button :loading="loading" type="primary" @click="submit">提 交</el-button>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import UploadVideo from "@/components/Upload/UploadVideo.vue";
import Dialog from "@/components/Dialog/index.vue";
import { scienceEducationApi } from '@/api/ScienceTourism/index'
const show = ref(false);
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const title = ref("新增");
//表单数据
const form = ref<any>({
    filename: '',
    filepath: '',
    filetype: '视频',
    uploaddate: new Date().toLocaleString().replaceAll('/', '-'),
});
//校验规则
const rules = {
    filename: [{ required: true, trigger: 'blur', message: '请输入名称' },
    { min: 0, max: 50, message: '最大50字符', trigger: 'blur' },
    ],
    filepath: [{ required: true, trigger: 'change', message: '请上传视频地址' }],
};
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
        filename: '',
        filepath: '',
        filetype: '视频',
        uploaddate: new Date().toLocaleString().replaceAll('/', '-'),
    };
};
//关闭弹框
const close = () => {
    show.value = false;
    loading.value = false;
};
// 确认
const emit = defineEmits(["success"]);
const submit = () => {
    formRef.value.validate((valid:any) => {
        if (valid) {
            loading.value = true;
            if (title.value === "新增") {

            } else if (title.value === "编辑") {

            }
            try {
                scienceEducationApi.postMjzy(form.value).then((res:any) => {
                    if (res.success) {
                        ElMessage.success(res.msg);
                        close()
                        // 发送操作成功的事件
                        emit("success");
                    } else {
                        ElMessage.error(res.msg);
                    }
                });
            } finally {
                loading.value = false;
            }
        }
    });
};

</script>

<style lang="scss" scoped>
.form {
    .el-form {
        justify-content: space-between;
    }

    .el-form--inline .el-form-item {
        width: 100%;
        margin-right: 0;
    }
}
</style>
