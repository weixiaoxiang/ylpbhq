<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="600px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="top"
                :rules="rules">
                <el-form-item label="页面名称：" prop="styleName">
                    <el-input v-model="form.styleName" type="text" placeholder="请输入页面名称" />
                </el-form-item>
                <el-form-item label="标识：" prop="identification">
                    <el-input v-model="form.identification" type="text" placeholder="请输入标识" :disabled="title=='编辑'?true:false"/>
                </el-form-item>
                <el-form-item label="图层：" prop="menuIds" style="width: 100%">
                    <el-card style="width: 100%" v-if="show">
                        <el-tree ref="treeRef" :data="menuData" :props="defaultProps" empty-text="加载中，请稍候" node-key="Id"
                            show-checkbox />
                    </el-card>
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
import { handleTree } from "@/utils/tree";
import {
    layerApi
} from "@/api/SystemManage/layer";
const show = ref(false);
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const title = ref("添加");
const defaultProps = ref({
    label: "name",
    value: "Id",
    children: "children",
});
//表单数据
const form = ref<any>({
    styleName: "",
    identification: "",
    layerIds: [],
    sort:0
});
//校验规则
const rules = {
    styleName: [{ required: true, message: "请输入页面名称", trigger: "blur" },
    { min: 0, max: 50, message: '最大50字符', trigger: 'blur' },
    ],
    identification: [{ required: true, message: "请输入标识", trigger: "blur" }],
};
const menuData = ref<any>([]); // 菜单树
const treeRef = ref(); // 菜单树组件 Ref
/** 打开弹窗 */
const openDialog = async (type: string, id?: number) => {
    show.value = true;
    title.value = type;
    clearForm();
    nextTick(() => {
        treeRef.value.setCheckedKeys([]);
    });
    // 修改时，设置数据
    if (id) {
        loadForm.value = true;
        try {
            layerApi.getLayerStyleBystyleId({
                styleId: id,
            }).then((res) => {
                if (res.success) {
                    form.value = {
                        Id: res.response.Id,
                        styleName: res.response.styleName,
                        identification: res.response.identification,
                        layerIds: res.response.layerIds
                    };
                    layerApi.getLayerTree({ effective: true }).then((res) => {
                        menuData.value = handleTree(res.response, "Id", "pId");
                        nextTick(() => {
                            // treeRef.value.setCheckedKeys(res.response.routeIds);
                            // 设置选中
                            form.value.layerIds.forEach((menuId: number) => {
                                treeRef.value.setChecked(menuId, true, false);
                            });
                        });
                    });
                }
            });
        } finally {
            loadForm.value = false;
        }
    } else {
       layerApi.getLayerTree({ effective: true }).then((res) => {
            menuData.value = handleTree(res.response, "Id", "pId");
        });
    }
};
defineExpose({ openDialog }); // 提供 open 方法，用于打开弹窗

// 清空表单
const clearForm = () => {
    formRef.value?.resetFields();
    form.value = {
        styleName: "",
        identification: "",
        layerIds: [],
        sort: 0
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
            const checkedMenuIds: number[] = treeRef.value
                .getCheckedNodes(false, true)
                .map((node: any) => node.Id);
           form.value.layerIds = checkedMenuIds;
           if (title.value === "编辑") {
                
            }
            try {
                layerApi.postLayerStyle(form.value).then((res) => {
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
        width: 48%;
        margin-right: 0;
    }
}
</style>
