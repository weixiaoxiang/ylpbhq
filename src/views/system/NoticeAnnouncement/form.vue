<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="800px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="top"
                :rules="rules">
                <el-form-item label="主标题" prop="noticetitle">
                    <el-input v-model="form.noticetitle" placeholder="-请输入主标题-"></el-input>
                </el-form-item>
                <el-form-item label="副标题" prop="subtitle">
                    <el-input v-model="form.subtitle" placeholder="-请输入副标题-"></el-input>
                </el-form-item>
                <el-form-item label="图片上传" prop="picture">
                    <UploadImg v-model="form.picture"></UploadImg>
                </el-form-item>
                <el-form-item label="简介内容" prop="content">
                    <Editor v-model="form.content"></Editor>
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
import UploadImg from "@/components/Upload/UploadImg.vue";
import Dialog from "@/components/Dialog/index.vue";
import { noticeApi } from "@/api/SystemManage/notice";
const show = ref(false);
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const title = ref("新增");
const parentorgtype = ref<any>([]) // 上级组织机构
//表单数据
const form = ref<any>({
    mc: '',
    titles: '',
    author: '',
    sources: '',
    sssq: null,
    contents: '',
    picture: '',
    createtime: new Date().toLocaleString().replaceAll('/', '-'),
});
//校验规则
const rules = {
    name: [{ required: true, message: "请输入名称", trigger: "blur" },
    { min: 0, max: 50, message: '最大50字符', trigger: 'blur' },
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
    }
};
defineExpose({ openDialog }); // 提供 open 方法，用于打开弹窗

// 清空表单
const clearForm = () => {
    formRef.value?.resetFields();
    form.value = {
        mc: '',
        titles: '',
        author: '',
        sources: '',
        sssq: null,
        contents: '',
        picture: '',
        createtime: new Date().toLocaleString().replaceAll('/', '-'),
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
    formRef.value.validate((valid: any) => {
        if (valid) {
            loading.value = true;
            if (title.value === "新增") {
                try {
                    noticeApi.add(form.value).then((res: any) => {
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
            } else if (title.value === "编辑") {
                try {
                    noticeApi.update(form.value).then((res: any) => {
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
        }
    });
};

</script>

<style lang="scss" scoped>
.form {
    .el-form--inline .el-form-item {
        width: 100%;
        margin-right: 0;
    }
}
</style>
