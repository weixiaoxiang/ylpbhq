<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :title="title" w="880px" append-to-body :close-on-click-modal="false" @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="right"
                :rules="rules" label-width="80px">
                <el-form-item label="名称" prop="mc">
                    <el-input v-model="form.mc" placeholder="请输入名称"></el-input>
                </el-form-item>
                <el-form-item label="拉丁名称" prop="ldmc">
                    <el-input v-model="form.ldmc" placeholder="请输入拉丁名称"></el-input>
                </el-form-item>
                <el-form-item label="俗称/俗名" prop="alias">
                    <el-input v-model="form.alias" placeholder="请输入俗称/俗名"></el-input>
                </el-form-item>
                <el-form-item label="类" prop="classify">
                    <el-select v-model="form.classify" clearable :teleported="false" placeholder="请选择类">
                        <el-option v-for="(item, index) in typelist" :label="item.label" :value="item.value"
                            :key="index"></el-option>
                    </el-select>
                    <!-- <el-input v-model="form.classify" placeholder="请输入类" :readonly="title=== '编辑'"></el-input> -->
                </el-form-item>
                <el-form-item label="保护等级" prop="plevel">
                    <el-select v-model="form.plevel" :teleported="false" clearable placeholder="请选择保护等级"
                        style="width: 100%">
                        <el-option label="国家Ⅰ级" value="国一"></el-option>
                        <el-option label="国家Ⅱ级" value="国二"></el-option>
                        <el-option label="省级Ⅰ级" value="省一"></el-option>
                        <el-option label="省级Ⅱ级" value="省二"></el-option>
                    </el-select>
                </el-form-item>
                <!-- <el-form-item label="生存环境" prop="schj">
                    <el-input type="textarea" :rows="2" v-model="form.schj" placeholder="请输入生存环境"></el-input>
                </el-form-item> -->
                <el-form-item label="特征特性" prop="tztx">
                    <el-input type="textarea" :rows="2" v-model="form.tztx" placeholder="请输入特征特性"></el-input>
                </el-form-item>
                <el-form-item label="习性" prop="habit">
                    <el-input type="textarea" :rows="2" v-model="form.habit" placeholder="请输入习性"></el-input>
                </el-form-item>
                <el-form-item label="珍稀物种" prop="zxwz">
                    <el-select v-model="form.zxwz" :teleported="false" placeholder="请选择珍稀物种" style="width: 100%">
                        <el-option label="是" :value="true"> </el-option>
                        <el-option label="否" :value="false"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="类别" prop="datatype">
                    <el-select v-model="form.datatype" :teleported="false" placeholder="请选择类别" style="width: 100%"
                        :disabled="title=== '编辑'">
                        <el-option label="动物" value="动物"> </el-option>
                        <el-option label="植物" value="植物"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="用途" prop="yt">
                    <el-input v-model="form.yt" placeholder="请输入用途"></el-input>
                </el-form-item>
                <!-- <el-form-item label="海拔" prop="hb">
                    <el-input v-model="form.hb" placeholder="请输入海拔"></el-input>
                </el-form-item> -->
                <el-form-item label="图片" prop="fileUrl" style="width: 100%;">
                    <UploadImg v-model="form.fileUrl
                        "></UploadImg>
                </el-form-item>
                <el-form-item label="经度" prop="lon">
                    <el-input v-model="form.lon" placeholder="请输入经度"></el-input>
                </el-form-item>
                <el-form-item label="纬度" prop="lat" class="position">
                    <el-input v-model="form.lat" placeholder="请输入纬度"></el-input>
                    <MapLocation class="Icon" style="margin-left: 5px" @click="positionShow = true" />
                </el-form-item>

            </el-form>
        </div>
        <template #footer class="dialog-footer">
            <el-button @click="close">取 消</el-button>
            <el-button :loading="loading" type="primary" @click="submit">提 交</el-button>
        </template>
        <Map v-if="positionShow" @closeMap="closeMap" :lonlat="[form.lon, form.lat]"></Map>
    </Dialog>
</template>

<script setup lang="ts">
import {  MapLocation } from '@element-plus/icons-vue'
import UploadImg from "@/components/Upload/UploadImg.vue";
import Dialog from "@/components/Dialog/index.vue";
import Map from "@/components/Map/index.vue";
import {
    animals_plantsApi
} from "@/api/SystemManage/localSurvey";
const props = defineProps({
    typelist: {
        type: Array as any,
        default: () => {
            return [];
        },
    }
});
const show = ref(false);
const positionShow = ref(false)
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const title = ref("新增");
//表单数据
const form = ref<any>({
    mc: '',
    datatype: '',
    blevelname: '',
});
// const fileList = ref<any>([]);
//校验规则
const rules = {
    mc: [{ required: true, trigger: 'blur', message: '请输入名称' },
       { min: 0, max: 50, message: '最大50字符', trigger: 'blur' },
    ],
    ldmc: [{ required: true, message: '请输入拉丁名称', trigger: 'blur' }],
    datatype: [{ required: true, message: '请选择类别', trigger: 'blur' }],
    zxwz: [{ required: true, message: '请选择类别', trigger: 'change' }],
    lon: [{ required: true, message: '请输入经度', trigger: ['blur', 'change'] }],
    lat: [{ required: true, message: '请输入纬度', trigger: ['blur', 'change'] }],

};
/** 打开弹窗 */
const openDialog = async (type: string, row?: any) => {
    show.value = true;
    title.value = type;
    console.log(row);
    clearForm();
    // 修改时，设置数据
    if (row) {
        if (type == '编辑') {
            form.value = Object.assign({}, row);
        } else if (type == '新增') {
            form.value.menuId = row.id;
            if (row.treePath && row.treePath.indexOf(',2,') > -1) {
                form.value.type = '植物';
            } else {
                form.value.type = '动物';
            }
            let filed = [{
                label: "门",
                prop: "men"
            }, {
                label: "纲",
                prop: "gang"
            }, {
                label: "目",
                prop: "mu"
            }, {
                label: "科",
                prop: "ke"
            }, {
                label: "属",
                prop: "shu"
            }];
            filed.forEach(item => {
                form.value[item.prop] = row.levelArr.find(i => i.
                    depthName == item.label).mc;
            })
            console.log("表单",form.value);
        }
    }
};
defineExpose({ openDialog }); // 提供 open 方法，用于打开弹窗

// 清空表单
const clearForm = () => {
    formRef.value?.resetFields();
    form.value = {
        mc: '',
        datatype: ''
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
                    animals_plantsApi.add(form.value).then((res:any) => {
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
                    animals_plantsApi.update(form.value).then((res:any) => {
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
// 关闭地图
const closeMap = (val: any) => {
    positionShow.value = false
    if (val) {
        form.value.lat = val[1]
        form.value.lon = val[0]
    }
}
</script>

<style lang="scss" scoped>
.form {
    .el-form {
        justify-content: space-between;
    }

    .el-form--inline .el-form-item {
        width: calc((100% - 20px) / 2);
        margin-right: 0;
        &:nth-child(2n+1){
            margin-right: 20px;
        }
    }
    .position{
        position: relative;
        width: 48% !important;
        .Icon {
            position: absolute;
            right: -24px;
            width: 1.2em;
            height: 1.2em;
            color: #333;
            cursor: pointer;
        }
    }
        
}
</style>
