<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="600px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="top"
                :rules="rules">
                <el-form-item label="机构名称：" prop="name">
                    <el-input v-model="form.name" placeholder="请输入机构名称" filterable clearable></el-input>
                </el-form-item>
                <el-form-item label="上级组织机构：" v-if="form.parentid != 0">
                    <el-input v-model="form.parentname" placeholder="上级组织机构名称" disabled></el-input>
                </el-form-item>
                <el-form-item label="排序：" prop="sort">
                    <el-input-number v-model="form.sort" controls-position="right" :min="0" />
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
import { organizeApi } from "@/api/SystemManage/organize";
const show = ref(false);
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const title = ref("新增");
//表单数据
const form = ref<any>({
    name: '',
    parentname: '',
    parentid: '',
    createtime: new Date().toLocaleString().replaceAll('/', '-'),
    updatetime: new Date().toLocaleString().replaceAll('/', '-'),
    effective: true,
    remark: '',
    sort: 1,
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
    if (type == '新增') {
        if (row == 0) {
            form.value.parentid = 0;
        }
        else {
            form.value.parentid = row.Id;
            form.value.parentname = row.name;
        }
    } else if (type == '编辑') {
        form.value = Object.assign({}, row);
    }
};
defineExpose({ openDialog }); // 提供 open 方法，用于打开弹窗

// 清空表单
const clearForm = () => {
    formRef.value?.resetFields();
    form.value = {
        name: '',
        parentname: '',
        parentid: '',
        createtime: new Date().toLocaleString().replaceAll('/', '-'),
        updatetime: new Date().toLocaleString().replaceAll('/', '-'),
        effective: true,
        remark: '',
        sort: 1,
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
            delete form.value.parentname;
            form.value.remark = form.value.name
            if (title.value === "新增") {
                try {
                    organizeApi.add(form.value).then((res) => {
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
                    organizeApi.update(form.value).then((res) => {
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
