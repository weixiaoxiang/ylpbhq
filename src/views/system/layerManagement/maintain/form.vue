<template>
    <!-- 新增修改对话框 -->
    <Dialog v-model="show" :isBg="true" :title="title" w="600px" append-to-body :close-on-click-modal="false"
        @close="close">
        <div class="form">
            <el-form ref="formRef" v-loading="loadForm" :model="form" :inline="true" label-position="left"
                :rules="rules">
                <div class="layer-fields">
                    <el-form-item label="图层名称：" prop="name">
                        <el-input v-model="form.name" placeholder="请输入图层名称"></el-input>
                    </el-form-item>
                    <el-form-item label="图层类型：" prop="type">
                        <el-select v-model="form.type" :teleported="false" placeholder="请选择">
                            <el-option v-for="(item, index) in optionsType" :key="index" :label="item.label"
                                :value="item.label">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <template v-if="form.type != '文件夹'">
                    <div class="layer-fields">
                        <el-form-item label="表名：" prop="tableName"
                            :rules="{ required: false, message: '不能为空', trigger: 'change' }">
                            <el-input v-model="form.tableName" placeholder="请输入表名" @change="getFileds"
                                :disabled="title == '编辑' ? true : false"></el-input>
                        </el-form-item>
                        <el-form-item v-if="form.type != '保护区界线'" label="查询条件：" prop="sWhere">
                            <el-input v-model="form.sWhere" placeholder="请输入查询条件"></el-input>
                        </el-form-item>

                        <el-form-item v-if="optionsField.length > 0" label="弹出框字段：" prop="fields"
                            :rules="{ required: false, message: '不能为空', trigger: 'change' }" style="width: 100%;">
                            <el-select v-model="form.fields" :teleported="false" placeholder="请选择" multiple
                                collapse-tags collapse-tags-tooltip :max-collapse-tags="5" style="width: 100%;">
                                <el-option v-for="(item, index) in optionsField" :key="index" :label="item.fieldCNName"
                                    :value="item.fieldName">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="所属模块：" prop="ssmk">
                            <el-select v-model="form.ssmk" multiple collapse-tags :teleported="false" placeholder="请选择">
                                <el-option v-for="(item, index) in functionList" :key="index" :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="显示状态：">
                            <el-radio-group v-model="form.isshow">
                                <el-radio :label="1">显示</el-radio>
                                <el-radio :label="0">隐藏</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </div>
                    <div v-for="(item, index) in layerFields" :key="index + 100" class="layer-fields">
                        <el-form-item label="类型">
                            <el-input v-model="item.type" placeholder="请输入"></el-input>
                        </el-form-item>
                        <el-form-item label="填充颜色" v-if="form.type == '面'" prop="'popuFields.' + index + '.fill'">
                            <el-color-picker v-model="item.fillcolor" show-alpha :key="index" />
                        </el-form-item>
                        <el-form-item label="边框颜色" v-if="form.type == '线' || form.type == '面'">
                            <el-color-picker v-model="item.strokecolor" :key="index" />
                        </el-form-item>
                        <el-form-item label="边框是否虚线：" v-if="form.type == '线' || form.type == '面'">
                            <el-radio-group v-model="item.strokedash">
                                <el-radio :label="true">是</el-radio>
                                <el-radio :label="false">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="边框宽度：" prop="strokewidth" v-if="form.type == '线' || form.type == '面'">
                            <el-input-number v-model="item.strokewidth" controls-position="right" :min="0" />
                        </el-form-item>
                        <el-form-item label="文字颜色">
                            <el-color-picker v-model="item.textcolor" :key="index" />
                        </el-form-item>
                        <el-form-item label="文字大小：" prop="textsize">
                            <el-input-number v-model="item.textsize" controls-position="right" :min="0" />
                        </el-form-item>
                        <el-form-item label="文字水平偏移量：" prop="offsetTextX">
                            <el-input-number v-model="item.offsetTextX" controls-position="right" />
                        </el-form-item>
                        <el-form-item label="文字垂直偏移量：" prop="offsetTextY">
                            <el-input-number v-model="item.offsetTextY" controls-position="right" />
                        </el-form-item>
                        <el-form-item label="图例颜色">
                            <el-color-picker v-model="item.value" :key="index" />
                        </el-form-item>
                        <el-form-item label="定位图标：" v-if="form.type == '点'">
                            <UploadImg v-model="item.icon"></UploadImg>
                        </el-form-item>
                        <el-button :icon="Minus" plain circle class="minus-layer-field" type="warning" @click="addLayerField('-',index)"/>
                    </div>
                    <el-button type="primary" plain :icon="Plus" circle class="add-layer-field" @click="addLayerField('+')" />
                </template>
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
    Minus,
    Plus
  } from '@element-plus/icons-vue'
import { layerApi } from "@/api/SystemManage/layer";
import UploadImg from "@/components/Upload/UploadImg.vue";
import Dialog from "@/components/Dialog/index.vue";
const optionsType = [
    {
        value: null,
        label: '文件夹'
    },
    {
        value: 0,
        label: '点'
    },
    {
        value: 1,
        label: '线'
    },
    {
        value: 2,
        label: '面'
    },
    // {
    //     value: 5,
    //     label: '监控点'
    // },
    // {
    //     value: 3,
    //     label: '保护区界线'
    // },
    // {
    //     value: 4,
    //     label: '本底资源'
    // }
]
const layerFields = ref<any>([])
const optionsField = ref<any>([]) //弹出框字段

const show = ref(false);
const loadForm = ref(false);
const loading = ref(false);
const formRef = ref();
const title = ref("添加");
const functionList = ref<any>([]);

//获取配置模块列表
const getFunctionList = async () => {
    const res: any = await layerApi.GetLayerFunctionalCatalog({});
    if (res.success) {
        functionList.value = res.response;
    }
}
//表单数据
const form = ref<any>({
    name: '',
    type: '文件夹',
    createTime: new Date().toLocaleString().replaceAll('/', '-'),
});
//校验规则
const rules = {
    name: [{ required: true, trigger: "blur", message: "请输入图层名称" },
    { min: 0, max: 50, message: '最大50字符', trigger: 'blur' },
    ],
    type: [{ required: true, trigger: "change", message: "请选择图层类型" }
    ]
};


const addLayerField = (txt:any,index?:any) => {
    let query = {
        id: '',
        name: '',
        type: '',
        fillcolor: '',
        strokecolor: '',
        strokedash: false,
        strokewidth: 0,
        textcolor: '',
        textsize: 0,
        offsetTextX: 0,
        offsetTextY: 0,
        icon: '',
        value: ''
    }
    if(txt == '-'){
        layerFields.value.splice(index,1)
    }else{
        layerFields.value.push(query)
    }
}
//数组
const strChangeArr = (str: string) => {
    if (str) {
        let str1 = str.slice(2, str.length - 2)
        return str1.split(',')
    }
}
//获取图层的类型
const getRowType = (tabtype: any) => {
    if (tabtype == 0) {
        return '点'
    } else if (tabtype == 1) {
        return '线'
    } else if (tabtype == 2) {
        return '面'
    } else if (tabtype == null) {
        return '文件夹'
    }
}
/** 打开弹窗 */
const openDialog = async (type: string, row?: any) => {
    console.log(row);
    getFunctionList()
    show.value = true;
    title.value = type;
    clearForm();
    if (type == '新增') {
        form.value.type = '文件夹';
        form.value.llevel = 0;

    }
    else if (type == '新增下级') {
        form.value = {
            llevel: Number(row.llevel) + 1,
            //  hasData: true,
            pId: row.id,
            name: '',
            type: '点',
            tableName: '',
            sWhere: '',

        };
        return;
    }
    // 修改时，设置数据
    else if (row) {
        // if (!row.hasData) {
        //     form.value = row;
        //     form.value.llevel = 1;
        //     return;
        // }
        layerApi.getDetail({ layerId: row.id }).then(async (res: any) => {
            if (res.success) {
                form.value = {
                    Id: res.response.Id,
                    name: res.response.name,
                    type: getRowType(res.response.tabtype),
                    tableName: res.response.tableName,
                    sWhere: res.response.sWhere,
                    fill: res.response.fill,
                    frame: res.response.frame,
                    pId: res.response.pId,
                    llevel: res.response.llevel,
                    ssmk: strChangeArr(res.response.ssmk),
                    // sWhere:res.response.sWhere,
                    // icon: res.response.icon,
                    isshow: res.response.isshow,
                    fields: res.response.fields.map((i: any) => i.fieldName)
                    // fields: res.response.showfiled.split(','),
                };
                if (!form.value.type) {
                    form.value.type = '点'
                }
                // form.value.llevel = 2;
                if (form.value.tableName) {
                    await getFileds(form.value.tableName)
                }
                // else {
                if (res.response.legendcolour) {
                    layerFields.value = JSON.parse(res.response.legendcolour)
                } else {
                    layerFields.value = []
                }

                // }

            }
        })
    }
};
//根据表名获取表字段
const getFileds = (tableName: any) => {
    if (tableName) {
        layerApi.getFieldsByTableName({ tableName: tableName }).then((res: any) => {
            if (res.success) {
                optionsField.value = res.response
            }
        })
    }

}
defineExpose({ openDialog }); // 提供 open 方法，用于打开弹窗
// 清空表单
const clearForm = () => {
    formRef.value?.resetFields();
    form.value = {
        name: '',
        type: '文件夹',
        createTime: new Date().toLocaleString().replaceAll('/', '-'),
    };
    layerFields.value = []
    optionsField.value = []
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
            let query: any = Object.assign({}, form.value);
            loading.value = true;
            if (title.value === "新增") {
                query.pId = 0;
                if (form.value.type == '文件夹') {
                    query = {
                        pId: 0,
                        name: form.value.name,
                        type: form.value.type,
                        // hasData:false
                    }
                }
            } else if (title.value === "编辑") {
                if (form.value.type == '文件夹') {
                    query = {
                        name: form.value.name,
                        Id: form.value.Id,
                        pId: form.value.pId,
                        type: form.value.type
                    }
                } else {
                    query = {
                        Id: query.Id,
                        name: query.name,
                        type: query.type,
                        tableName: query.tableName,
                        sWhere: query.sWhere,
                        fill: query.fill,
                        frame: query.frame,
                        pId: query.pId,
                        //    icon: query.icon,
                        //    hasData: true,

                        isshow: query.isshow
                    };
                    query.fields = []
                    let arr1: any = []
                    let arr2: any = []
                    if (form.value.fields && form.value.fields.length > 0) {
                        form.value.fields.forEach((item: any) => {
                            let ele = optionsField.value.find((i: any) => i.fieldName == item)
                            if (ele) {
                                query.fields.push(ele)
                                arr1.push(ele.fieldName)
                                arr2.push(ele.fieldCNName)
                            }
                        })

                        query.showfiled = arr1.join(",")
                        query.showfiledch = arr2.join(",")
                    }

                }
            } else if (title.value === "新增下级" && form.value.type != '文件夹') {
                let arr: any = []
                let arr1: any = []
                let arr2: any = []
                form.value.fields?.forEach((item: any) => {
                    let ele: any = optionsField.value.find((i: any) => i.fieldName == item)
                    if (ele) {
                        arr.push(ele)
                        arr1.push(ele.fieldName)
                        arr2.push(ele.fieldCNName)
                    }
                })
                query.fields = arr;
                query.showfiled = arr1.join(",")
                query.showfiledch = arr2.join(",")
            }
            try {
                if (query.type == '保护区界线') {
                    query.text = JSON.stringify(layerFields.value)
                }
                // else if (query.type == '本底资源') {
                //     query.hasData = false
                // }
                if (query.type == '文件夹') query.tabtype = null
                else if (query.type == '点') query.tabtype = 0
                else if (query.type == '线') query.tabtype = 1
                else if (query.type == '面') query.tabtype = 2
                delete query.type

                if (form.value.ssmk) {
                    query.ssmk = ',' + form.value.ssmk.join(',') + ','
                }
                if (layerFields.value.length > 0) {
                    query.legendcolour = JSON.stringify(layerFields.value)
                }
                else {
                    query.legendcolour = null
                }
                layerApi.add(query).then((res: any) => {
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
        width: 48%;
        margin-right: 0;
        display: flex;
        align-items: flex-start;
    }

    .layer-fields {
        background: #fff;
        padding: 10px;
        margin-bottom: 10px;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        position: relative;
        .minus-layer-field{
            position:absolute;
            right: 10px;
            top: 10px;
        }
    }

    .add-layer-field {
        margin-left: auto;
        margin-right: 0;
        cursor: pointer;
    }
}
</style>
