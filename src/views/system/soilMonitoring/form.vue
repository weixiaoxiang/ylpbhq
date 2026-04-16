<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="600px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="left"
                :rules="rules">
                <el-form-item label="设备名称：" prop="name">
                    <el-input v-model="form.name" :disabled='true' placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="温度：" prop="temperature">
                    <el-input v-model="form.temperature" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="湿度：" prop="humidity">
                    <el-input v-model="form.humidity" placeholder="请输入"></el-input>
                </el-form-item>
                
                <el-form-item label="监测时间：" prop="monitortime">
                    <el-date-picker v-model="form.monitortime" format="YYYY-MM-DD HH:mm:ss" style="width: 100%;" type="datetime" placeholder="请选择" />
                </el-form-item>
                <el-form-item label="深度(cm)：" prop="depth">
                    <el-input v-model="form.depth" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="供电方式：" prop="gdfs">
                    <el-input v-model="form.gdfs" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="外壳：" prop="wk">
                    <el-input v-model="form.wk" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="防护等级：" prop="bhdj">
                    <el-input v-model="form.bhdj" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="输出信号：" prop="scxh">
                    <el-input v-model="form.scxh" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="功耗：" prop="gh">
                    <el-input v-model="form.gh" placeholder="请输入"></el-input>
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
    soilApi
} from "@/api/SystemManage/image";
import Dialog from "@/components/Dialog/index.vue";
const show = ref(false);
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const title = ref("添加");
//表单数据
const form = ref<any>({
    name: '',
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
        name: '',
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
            //     id:form.value.id,
            //     sb_guid:form.value.sb_guid,
            //     name:form.value.name,
            //     bh:form.value.bh,
            //     lon:form.value.lon,
            //     lat:form.value.lat,
            //     hb:form.value.hb,
            //     pd:form.value.pd,
            //     px:form.value.px,
            //     pw:form.value.pw,
            //     settime:form.value.settime,
            //     paybacktime:form.value.paybacktime,
            //     dl:form.value.dl,
            //     dlstate:form.value.dlstate,
            // }
            loading.value = true;
            if (title.value === "新增") {
            } else if (title.value === "编辑") {
            }
            try {
                soilApi.update(query).then((res:any) => {
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
