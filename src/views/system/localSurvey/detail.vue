<template>
    <div class="page">
        <div class="search-content">
            <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
                @keyup.enter.native="handleQuery" clearable>
                <el-form-item label="名称：">
                    <el-input v-model="queryParams.mc" clearable placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="保护等级：">
                    <el-select v-model="queryParams.plevel" :teleported="false" placeholder="请选择保护等级"
                        style="width: 150px" clearable>
                        <el-option label="国家Ⅰ级" value="国一"></el-option>
                        <el-option label="国家Ⅱ级" value="国二"></el-option>
                        <el-option label="省级Ⅰ级" value="省一"></el-option>
                        <el-option label="省级Ⅱ级" value="省二"></el-option>
                        <el-option label="省级" value="省级"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label-width="0">
                    <el-button type="primary" @click="handleQuery" :icon="Search">查询</el-button>
                    <el-button v-if="pData.depthName == '属'" type="primary" plain @click="handleAdd(pData)"
                        :icon="Plus">新增</el-button>
                    <el-button type="primary" :icon="Bottom" @click="handleExcel">导出</el-button>
                </el-form-item>
                <div class="close-btn" @click="closePage">
                    <el-icon>
                        <Close />
                    </el-icon>
                </div>
            </el-form>
        </div>
        <div class="table-box">
            <el-table class="tableList" v-adaptive="{ bottom: 68 }" :data="tableList" v-loading="loading">
                <el-table-column type="index" width="60" label="序号" align="center">
                </el-table-column>
                <el-table-column prop="mc" label="名称" width="150" align="center">
                </el-table-column>
                <el-table-column prop="ldmc" width="300" label="拉丁名称" align="center">
                </el-table-column>
                <el-table-column prop="type" label="类别" align="center"> </el-table-column>
                <el-table-column prop="plevel" label="保护等级" align="center">
                    <template #default="scope">
                        <span v-if="scope.row.plevel == '国一'">
                            国家一级
                        </span>
                        <span v-else-if="scope.row.plevel == '国二'">
                            国家二级
                        </span>
                        <span v-else-if="scope.row.plevel == '省一'">
                            省级一级
                        </span>
                        <span v-else-if="scope.row.plevel == '省二'">
                            省级一级
                        </span>
                        <span v-else>
                            {{ scope.row.plevel }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" width="200" label="创建时间" align="center">
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="220" align="center"
                    class-name="small-padding fixed-width">
                    <template #default="scope">
                        <el-button type="warning" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="danger" @click.stop="handleDelete(scope.row.id)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination-box" v-if="total > 0">
                <pagination v-model:total="total" v-model:page="queryParams.page"
                    v-model:limit="queryParams.intPageSize" @pagination="handleChangePage" />
            </div>
        </div>
        <!-- 弹窗 -->
        <HandleForm ref="formRef" :typelist="typelist" @success="getList(1)"></HandleForm>

    </div>
</template>
<script setup lang="ts">
import { Plus, Search, Close, Bottom } from "@element-plus/icons-vue";
import HandleForm from "./detailForm.vue";
import {
    animals_plantsApi
} from "@/api/SystemManage/localSurvey";
const props = defineProps({
    pData: {
        type: Object,
        default: () => ({})
    }
})
const queryParams = ref<any>({
    mc: '',
    plevel:null,
    parentid: 0,
    page: 1,
    intPageSize: 15
});
const typelist = ref<any>([
    {
        value: '鱼类',
        label: '鱼类',
    },
    {
        value: '两栖类',
        label: '两栖类',
    },
    {
        value: '爬行类',
        label: '爬行类',
    },
    {
        value: '鸟类',
        label: '鸟类',
    },
    {
        value: '脊索类',
        label: '脊索类',
    },
    {
        value: '昆虫类',
        label: '昆虫类',
    },
    {
        value: '兽类',
        label: '兽类',
    },
    {
        value: '哺乳类',
        label: '哺乳类',
    },
    {
        value: '被子植物',
        label: '被子植物',
    },
    {
        value: '裸子植物',
        label: '裸子植物',
    },
    {
        value: '蕨类植物',
        label: '蕨类植物',
    },
    {
        value: '藓类植物',
        label: '藓类植物',
    },
    {
        value: '藓类植物',
        label: '藓类植物',
    },
    {
        value: '苔藓植物',
        label: '苔藓植物',
    },
    {
        value: '地衣植物',
        label: '地衣植物',
    },
    {
      value: '其他',
      label: '其他',
    },
])
const loading = ref(false);
const queryFormRef = ref();
const total = ref(0);
const tableList = ref<any>([]);
const formRef = ref(); //新增表单
const emit = defineEmits(["closePage"]);
const closePage = () => {
    emit("closePage");
}
//获取数据
const getList = (val?: number) => {
    if (val == 1) {
        queryParams.value.page = 1;
    }
    loading.value = true;
    animals_plantsApi.getDataByPage(queryParams.value).then((res:any) => {
        loading.value = false;
        if (res.success) {
            tableList.value = res.response.data;
            total.value = res.response.dataCount;
        } else {
            tableList.value = [];
            total.value = 0;
        }
    });
};

// 查询
const handleQuery = () => {
    queryParams.value.page = 1;
    getList();
};
// 重置查询
const resetQuery = () => {
    queryFormRef.value.resetFields();
    handleQuery();
}

// 添加
const handleAdd = async (row:any) => {
    
    formRef.value.openDialog("新增", row);
};
//修改
const handleEdit = async (row: any) => {
    formRef.value.openDialog("编辑", row);
};


//删除
const handleDelete = (id: number) => {
    ElMessageBox.confirm("是否确认删除此条数据?", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(() => {
            animals_plantsApi.delete({ id: id }).then((res: any) => {
                if (res.success) {
                    ElMessage({
                        type: "success",
                        message: "删除成功",
                    });
                    handleQuery();
                } else {
                    ElMessage({
                        type: "error",
                        message: res.msg,
                    });
                }
            });
        })
};

//导出
import { ElLoading } from 'element-plus'
import "element-plus/theme-chalk/el-loading.css";
const handleExcel = () => {
    ElMessageBox.confirm('此操作将导出excel文件, 是否继续?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: "warning",
    })
        .then(() => {
            let query = {
                ...queryParams,
                page: 1,
                intPageSize: 999999,
            };
            const loading = ElLoading.service({
                lock: true,
                text: '导出中……',
                background: 'rgba(0, 0, 0, 0.7)',
            })
            try {
                animals_plantsApi.getDataByPage(query).then((res: any) => {
                    loading.close()
                    if (res.success) {
                        var exportData = res.response.data
                        export2Excel(exportData)
                    } else {
                        ElMessage.warning("无数据导出！");
                    }
                });
            } catch (error) {
                loading.close()
            }

        })
};
import { exportFile } from "@/utils/excel/ExportExcel";
function export2Excel(exportData:any) {
    const fieldConfig = [
        {
            'label': '名称', // 标签
            'model': 'mc',// 字段名
        },
        {
            'label': '拉丁名称',
            'model': 'ldmc',
        },
        {
            'label': '俗称/俗名',
            'model': 'alias',
        },
        {
            'label': '种类',
            'model': 'classify',
        },
        {
            'label': '类别',
            'model': 'type',
        },
        {
            'label': '保护等级',
            'model': 'plevel',
        },
        {
            'label': '特征特性',
            'model': 'tztx',
        },
        {
            'label': '习性',
            'model': 'habit',
        },
        {
            'label': '珍稀物种',
            'model': 'zxwz',
        },
        {
            'label': '用途',
            'model': 'yt',
        },
        {
            'label': '科',
            'model': 'ke',
        },
        {
            'label': '属',
            'model': 'shu',
        },
        {
            'label': '经度',
            'model': 'lon',
        },
        {
            'label': '纬度',
            'model': 'lat',
        }
    ]
    // 获取需要导出的字段配置
    const export_fields = fieldConfig.map(({ label, model }) => ({ [model]: label }))
    const export_data = exportData.map(obj => {
        const newObj = {};
        export_fields.forEach(field => {
            const [key, value] = Object.entries(field)[0];
            newObj[value] = obj[key];
        });
        return newObj;
    });
    exportFile(export_data, '动植物');
}
//分页
const handleChangePage = (info: any) => {
    queryParams.value.page = info.page
    queryParams.value.intPageSize = info.limit
    getList()
}
onMounted(() => {
    console.log(props.pData)
    queryParams.value.parentid = props.pData.id;
    getList();
});
</script>

<style scoped lang="scss">
.page{
    position: absolute;
    top: 15px;
    left: 15px;
    right: 15px;
    bottom: 15px;
    background: #fff;
    z-index: 999;
    .search-content{
        .close-btn{
            position: absolute;
            right: 20px;
            top: 20px;
            color: #333;
            font-size: 20px;
            cursor: pointer;
        }
    }
}
</style>
