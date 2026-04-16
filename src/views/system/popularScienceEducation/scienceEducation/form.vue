<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="800px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="top"
                :rules="rules">
                <el-form-item label="文章名称" prop="mc">
                    <el-input v-model="form.mc" placeholder="-请输入文章名称-"></el-input>
                </el-form-item>
                <el-form-item label="作者" prop="author">
                    <el-input v-model="form.author" placeholder="-请输入作者-"></el-input>
                </el-form-item>
                <el-form-item label="来源" prop="sources">
                    <el-input v-model="form.sources" placeholder="-请输入来源-"></el-input>
                </el-form-item>
                <el-form-item label="文章类别:" prop="typename">
                    <el-select v-model="form.typename" :teleported="false" placeholder="请选择文章类别"
                        style="width: 100%;">
                        <el-option v-for="item in optionType" :label="item.label" :value="item.value"
                            :key="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="文章内容:" prop="contents" style="width: 100%;">
                    <Editor v-model:modelValue="form.contents"></Editor>
                </el-form-item>
                <el-form-item label="封面图片" prop="coverimgurl">
                    <UploadImg v-model="form.coverimgurl"></UploadImg>
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
import UploadImg  from "@/components/Upload/UploadImg.vue";
import Dialog from "@/components/Dialog/index.vue";
import {
    PopularScienceEducationApi
} from "@/api/SystemManage/PopularScienceEducation";
const props = defineProps({
    optionType: {
        type: Array as any,
        default: () => [],
    },
});
const show = ref(false);
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const title = ref("新增");
//表单数据
const form = ref<any>({
    mc: '',
    titles: '',
    author: '',
    sources: '',
    typename: '',
    contents: '',
    coverimgurl: '',
});
//校验规则
const rules = {
    mc: [{ required: true, trigger: 'blur', message: '请输入文章名称' },
        { min: 0, max: 50, message: '最大50字符', trigger: 'blur' },
    ],
    titles: [{ required: true, trigger: 'blur', message: '请输入主题' }],
    typename: [{ required: true, trigger: 'change', message: '请选择文章类别' }],
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
        typename: '',
        contents: '',
        coverimgurl: '',
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
                try {
                    PopularScienceEducationApi.add(form.value).then((res:any) => {
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
                    PopularScienceEducationApi.update(form.value).then((res:any) => {
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
    .el-form {
        justify-content: space-between;
    }

    .el-form--inline .el-form-item {
        width: calc((100% - 20px) / 2);
        margin-right: 0;

        &:nth-child(2n) {
            margin-left: 20px;
        }

        &:last-child {
            width: 100%;
            margin-left: 0;
        }
    }
}
</style>
