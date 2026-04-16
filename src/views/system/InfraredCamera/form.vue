<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="600px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="left"
                :rules="rules">
                <el-form-item label="名称：" prop="mc">
                    <el-input v-model="form.mc" :disabled='true' placeholder="请输入名称"></el-input>
                </el-form-item>
                <el-form-item label="相机编号：" prop="bh">
                    <el-input v-model="form.bh" :disabled='true' placeholder="请输入相机编号"></el-input>
                </el-form-item>
                <el-form-item label="经度：" prop="lon">
                    <el-input v-model="form.lon" :disabled='true' placeholder="请输入经度"></el-input>
                </el-form-item>
                <el-form-item label="纬度：" prop="lat">
                    <el-input v-model="form.lat" :disabled='true' placeholder="请输入纬度"></el-input>
                </el-form-item>
                <el-form-item label="海拔：" prop="hb">
                    <el-input v-model="form.hb" placeholder="请输入海拔"></el-input>
                </el-form-item>
                <el-form-item label="坡度：" prop="pd">
                    <el-input v-model="form.pd" placeholder="请输入坡度"></el-input>
                </el-form-item>
                <el-form-item label="坡向：" prop="px">
                    <el-input v-model="form.px" placeholder="请输入坡向"></el-input>
                </el-form-item>
                <el-form-item label="坡位：" prop="pw">
                    <el-input v-model="form.pw" placeholder="请输入坡位"></el-input>
                </el-form-item>
                <el-form-item label="放置时间：" prop="pw">
                    <el-date-picker v-model="form.settime" format="YYYY-MM-DD HH:mm:ss" style="width: 100%;" type="datetime" placeholder="请选择" />
                </el-form-item>
                <el-form-item label="回收时间：" prop="pw">
                    <el-date-picker v-model="form.paybacktime" format="YYYY-MM-DD HH:mm:ss" style="width: 100%;" type="datetime" placeholder="请选择" />
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
    infraredApi
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
    mc: [{ required: true, trigger: "blur", message: "请输入名称" },
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
    formRef.value.validate((valid) => {
        if (valid) {
            // let query: any = Object.assign({}, form.value);
            let query = {
                id:form.value.id,
                sb_guid:form.value.sb_guid,
                mc:form.value.mc,
                bh:form.value.bh,
                lon:form.value.lon,
                lat:form.value.lat,
                hb:form.value.hb,
                pd:form.value.pd,
                px:form.value.px,
                pw:form.value.pw,
                settime:form.value.settime,
                paybacktime:form.value.paybacktime,
                dl:form.value.dl,
                dlstate:form.value.dlstate,
            }
            loading.value = true;
            if (title.value === "新增") {
            } else if (title.value === "编辑") {
            }
            try {

                infraredApi.update(query).then((res:any) => {
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
