<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="600px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="top"
                :rules="rules">
                <el-form-item label="名称" prop="mc">
                    <el-input v-model="form.mc" placeholder="请输入名称"></el-input>
                </el-form-item>
                <el-form-item label="级别" prop="blevelname">
                    <el-input v-model="form.blevelname" placeholder="请输入级别" disabled></el-input>
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
import Dialog from "@/components/Dialog/index.vue";
import {
    speciesResourcesApi
} from "@/api/SystemManage/localSurvey";
const show = ref(false);
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const title = ref("新增");
//表单数据
const form = ref<any>({
    mc: '',
    blevelname: '',
    parentid: 0,
});
//校验规则
const rules = {
    mc: [{ required: true, trigger: 'blur', message: '请输入名称' },
    { min: 0, max: 50, message: '最大50字符', trigger: 'blur' },
    ],
    blevelname: [{ required: true, message: '请输入级别', trigger: 'blur' }]
};
/** 打开弹窗 */
const openDialog = async (type: string, row?: any) => {
    show.value = true;
    title.value = type;
    clearForm();
    // 修改时，设置数据
    if (row) {
        console.log(row);
        if (type == '编辑') {
            form.value = Object.assign({}, row);
        } else if (type == '新增') {
            const type = ['界', '门', '纲', '目', '科', '属']
            const index = type.indexOf(row.blevelname)
            form.value.blevelname = type[index + 1]
            form.value.parentid = row.id
            title.value = '新增下级'
        }
    }
};
defineExpose({ openDialog }); // 提供 open 方法，用于打开弹窗

// 清空表单
const clearForm = () => {
    formRef.value?.resetFields();
    form.value = {
        mc: '',
        btype: '',
        blevelname: '',
        remark1: '',
        parentid: 0,
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
    formRef.value.validate((valid) => {
        if (valid) {
            loading.value = true;
            if (title.value === "新增下级") {
                try {
                    speciesResourcesApi.add(form.value).then((res) => {
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
                    speciesResourcesApi.update(form.value).then((res) => {
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
