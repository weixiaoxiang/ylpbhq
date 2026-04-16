<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="600px" he append-to-body :close-on-click-modal="false" @close="close">
        <div class="form" v-if="title!='运维设备'">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="right"
                :rules="rules" label-width="auto">
                <el-form-item label="厂商名称：" prop="manufacturerName">
                    <el-input v-model="form.manufacturerName" placeholder="-请输入厂商名称-"></el-input>
                </el-form-item>
                <el-form-item label="厂商类型：" prop="manufacturerType">
                    <el-select v-model="form.manufacturerType" :teleported="false" placeholder="请选择设备类型" clearable
                        style="width:100%">
                        <el-option v-for="item in option2" :label="item.label" :value="item.label"
                            :key="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="负责人姓名：" prop="chargeName">
                    <el-input v-model="form.chargeName" placeholder="-请输入负责人姓名-"></el-input>
                </el-form-item>
                <el-form-item label="联系电话：" prop="phone">
                    <el-input v-model="form.phone" placeholder="-请输入联系电话-"></el-input>
                </el-form-item>
                <el-form-item label="邮箱：" prop="email">
                    <el-input v-model="form.email" placeholder="-请输入邮箱-"></el-input>
                </el-form-item>
                <el-form-item label="是否启用：" prop="effective">
                    <el-radio-group v-model="form.effective">
                        <el-radio :label="true">启用</el-radio>
                        <el-radio :label="false">停用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
        </div>
        <div class="form" style="height: 300px;" v-else-if="title == '运维设备'">
            <!-- <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="right"
                :rules="rules" label-width="auto">
                <el-form-item label="设备：" prop="manufacturerName">
                    <el-tree-select v-model="equipmentIds" node-key="equipmentId" :data="equipmentArr" multiple
                        :render-after-expand="false" :teleported="false" show-checkbox check-strictly
                        style="width: 100%" :props="props" />
                </el-form-item>
            </el-form> -->
            <el-tree ref="treeRef" v-model="equipmentIds" node-key="equipmentId" :data="equipmentArr" show-checkbox
                check-strictly style="width: 100%" :props="props" default-expand-all />

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
    postManufacturer,
    getEquipmentIdsByManufacturerId,
    getEquipments,
    updateManufacturerEquipmentIds
} from "@/api/SystemManage/maintenanceManage";
const show = ref(false);
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const treeRef = ref();
const title = ref("添加");
const props = {
    label: 'equipmentName',
    children: 'equipments'
}
const option2 = ref([{ label: "管理员", value: 1 }, { label: "运维", value: 0 }]);
//表单数据
const form = ref<any>({
    manufacturerType: '',
    manufacturerName: '',
    effective: true,
    chargeName: '',
    phone: '',
    email: '',
});
//校验规则
const rules = {
    manufacturerName: [{
        required: true, trigger: 'blur', message: '请输入厂商名称',
    }, { min: 0, max: 100, message: '最大100字符', trigger: 'blur' },],
    manufacturerType: [{
        required: true, trigger: 'change', message: '请输入选择类型',
    }],
    chargeName: [{
        required: true, trigger: 'blur', message: '请输入负责人姓名',
    }, { min: 0, max: 10, message: '最大10字符', trigger: 'blur' },],
    phone: [{ required: true, trigger: "blur", message: "请输入手机号" },
        {
            pattern: /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
        }],
    email: [{ required: true, trigger: "blur", message: "请输入邮箱" },
        {
            pattern: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
            message: "请输入正确的邮箱",
            trigger: "blur",
        }],
};
const equipmentArr = ref<any>([]); // 设备列表
const equipmentIds = ref<any>([]); // 设备id列表
/** 打开弹窗 */
const openDialog = async (type: string, row?: any) => {
    show.value = true;
    title.value = type;
    clearForm();
    // 修改时，设置数据
    if (type=='编辑') {
        console.log(form);
        form.value = Object.assign({}, row);
    } else if (type == '运维设备') {
        form.value = Object.assign({}, row);
     getEquipments({
                manufacturerId: row.Id,
            }).then((res) => {
                if (res.success) {
                    equipmentArr.value = res.response.map((item, index) => {
                        item.equipmentId = 999 + index;
                        item.equipmentName = item.equipmentType;
                        return item;

                    });
                } else {
                    equipmentArr.value = []
                }
                getEquipmentIdsByManufacturerId({
                    manufacturerId: row.Id,
                }).then((res) => {
                    if (res.success) {
                        nextTick(() => {
                            treeRef.value.setCheckedKeys(res.response);
                          
                        });
                    }
                });
            });
}
};
defineExpose({ openDialog }); // 提供 open 方法，用于打开弹窗
// 清空表单
const clearForm = () => {
    formRef.value?.resetFields();
    form.value = {
        manufacturerType: '',
        manufacturerName: '',
        effective: true,
        chargeName: '',
        phone: '',
        email: '',
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
    if (title.value == '运维设备') {
        let select = treeRef.value!.getCheckedKeys(false);
        console.log(select);
        if (select.length == 0) {
            ElMessage.error('请选择设备');
            return;
        }
        updateManufacturerEquipmentIds({
            manufacturerId: form.value.Id,
            equipmentIds: select
        }).then((res) => {
            if (res.success) {
                ElMessage.success(res.msg);
                close()
                // 发送操作成功的事件
                emit("success");
            } else {
                ElMessage.error(res.msg);
            }
        });
        return;
    }
    formRef.value.validate((valid) => {
        if (valid) {
            loading.value = true;
            try {
                postManufacturer(form.value).then((res) => {
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
    .el-form--inline .el-form-item {
        width: 100%;
        margin-right: 0;
    }
}
:deep(.el-tree-node){
    //叶子节点显示复选框，其他节点不显示复选框
        .is-leaf~.el-checkbox .el-checkbox__inner {
            display: flex;
        }
.el-checkbox__input>.el-checkbox__inner {
        display: none;
    }
   
}
</style>
