<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="800px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="top"
                :rules="rules">
                <el-form-item label="类型名称" prop="typename">
                    <el-input v-model="form.typename" placeholder="-请输入类型名称-"></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="form.remark" placeholder="-请输入备注-"></el-input>
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
import { alarmTypeApi } from "@/api/SystemManage/patrol";
const show = ref(false);
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const title = ref("新增");
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
// 确认
const emit = defineEmits(["success"]);
const submit = () => {
    formRef.value.validate((valid: any) => {
        if (valid) {
            loading.value = true;
            if (title.value === "新增") {
                try {
                    alarmTypeApi.add(form.value).then((res: any) => {
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
                    alarmTypeApi.update(form.value).then((res: any) => {
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
