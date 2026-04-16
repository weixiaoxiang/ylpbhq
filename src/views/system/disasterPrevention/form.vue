<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="600px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="left"
                :rules="rules">
                <el-form-item label="名称：" prop="name">
                    <el-input v-model="form.name" :disabled='true' placeholder="请输入名称"></el-input>
                </el-form-item>
                <el-form-item label="监控code：" prop="monitorCode">
                    <el-input v-model="form.monitorCode" :disabled='true' placeholder="请输入相机编号"></el-input>
                </el-form-item>
                <el-form-item label="经度：" prop="lon">
                    <el-input v-model="form.lon" :disabled='true' placeholder="请输入经度"></el-input>
                </el-form-item>
                <el-form-item label="纬度：" prop="lat">
                    <el-input v-model="form.lat" :disabled='true' placeholder="请输入纬度"></el-input>
                </el-form-item>
                <el-form-item label="所属单位：" prop="ssdw">
                    <el-input v-model="form.ssdw" placeholder="请输入海拔"></el-input>
                </el-form-item>
                <el-form-item label="运维单位：" prop="ywdw">
                    <el-input v-model="form.ywdw" placeholder="请输入坡度"></el-input>
                </el-form-item>
                <el-form-item label="运维电话：" prop="ywdh">
                    <el-input v-model="form.ywdh" placeholder="请输入坡向"></el-input>
                </el-form-item>
                <el-form-item label="设备类型：" prop="sblx">
                    <el-input v-model="form.sblx" placeholder="请输入坡位"></el-input>
                </el-form-item>
                <el-form-item label="设备状态：" prop="status">
                    <el-select v-model="form.status" placeholder="请选择">
                        <el-option label="正常" :value="1"></el-option>
                        <el-option label="离线" :value="2"></el-option>
                        <el-option label="蓝色告警" :value="3"></el-option>
                        <el-option label="黄色告警" :value="4"></el-option>
                        <el-option label="橙色告警" :value="5"></el-option>
                        <el-option label="红色告警" :value="6"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="是否启用：">
                    <el-radio-group v-model="form.effective">
                        <el-radio :label="true">正常</el-radio>
                        <el-radio :label="false">失效</el-radio>
                    </el-radio-group>
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
import {
    disasterApi
} from "@/api/SystemManage/image";
import Dialog from "@/components/Dialog/index.vue";
const show = ref(false);
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const title = ref("添加");
//表单数据
const form = ref<any>({
    mc: '',
    bh: '',
    lon: '',
    lat: 1,
    effective: true,
});
//校验规则
const rules = {
    name: [{ required: true, trigger: "blur", message: "请输入名称" },
    { min: 0, max: 50, message: '最大50字符', trigger: 'blur' },
    ],
    lon: [{ required: true, trigger: "blur", message: "请输入经度" }
    ],
    lat: [{ required: true, trigger: "blur", message: "请输入纬度" }
    ],
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
        bh: '',
        lon: '',
        lat: 1,
        effective: true,
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
            let query: any = Object.assign({}, form.value);
            // let query = {
            //     equipmentId:form.value.equipmentId,
            //     name:form.value.name,
            //     ssdw:form.value.ssdw,
            //     ywdw:form.value.ywdw,
            //     lon:form.value.lon,
            //     lat:form.value.lat,
            //     ywdh:form.value.ywdh,
            //     sblx:form.value.sblx,
            //     monitorId:form.value.monitorId,
            //     monitorCode:form.value.monitorCode,
            //     status:form.value.status,
            //     sort:form.value.sort,
            //     effective:form.value.effective,
            // }
            loading.value = true;
            if (title.value === "新增") {
            } else if (title.value === "编辑") {
            }
            try {

                disasterApi.update(query).then((res:any) => {
                    loading.value = false;
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
    min-height: 100px;

    .el-form {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .el-form--inline .el-form-item {
        width: 100%;
        margin-right: 0;
    }
}
</style>
