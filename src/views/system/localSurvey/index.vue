<template>
    <div class="page">
        <div class="search-content">
            <el-form class="queryForm" ref="queryFormRef" :model="queryParams" label-width="auto" :inline="true"
                @keyup.enter.native="handleQuery" clearable>
                <el-form-item label="名称：">
                    <el-input v-model="queryParams.mc" clearable placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="级别：">
                    <el-select style="width: 150px;" v-model="queryParams.blevelname" clearable :teleported="false" placeholder="请选择类">
                        <el-option v-for="(item, index) in typelist" :label="item.label" :value="item.value"
                            :key="index"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label-width="0">
                    <el-button type="primary" @click="handleQuery" :icon="Search">查询</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table-box">
            <el-table class="tableList" v-adaptive v-loading="loading" :data="tableList" highlight-current-row
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" lazy :load="load" row-key="id">
                <!-- <el-table-column type="index" width="60" label="序号" align="center">
                </el-table-column> -->
                <el-table-column prop="mc" label="名称" align="left" width="300">
                </el-table-column>
                <el-table-column prop="blevelname" label="级别" align="center">
                </el-table-column>
                <el-table-column prop="creattime" label="创建时间" align="center">
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="380" align="center"
                    class-name="small-padding fixed-width">
                    <template #default="scope">
                        <el-button type="success" @click="handleDetail(scope.row)">查看</el-button>
                        <el-button type="warning" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button v-if="scope.row.blevelname!== '界'" type="danger"
                            @click.stop="handleDelete(scope.row.id)">
                            删除
                        </el-button>
                        <el-button v-if="scope.row.blevelname!== '属'" type="primary" @click.stop="handleAdd(scope.row)">
                            添加下级
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 弹窗 -->
        <HandleForm ref="formRef" :typelist="typelist" @success="getList(1)"></HandleForm>
        <Detail v-if="detailVisible" :pData="pData" @closePage="detailVisible=false"></Detail>
    </div>
</template>
<script setup lang="ts">
import { Plus,Search } from "@element-plus/icons-vue";
import HandleForm from "./form.vue";
import Detail from "./detail.vue";
import {
    speciesResourcesApi
} from "@/api/SystemManage/localSurvey";
import { handleTree } from "@/utils/tree";
const queryParams = ref<any>({
    typemc: '',
    mc: '',
    btype: '',
    blevelname: '',
    page: 1,
    intPageSize: 10000
});
const typelist = ref<any>([
    {
        value: '界',
        label: '界',
    },
    {
        value: '门',
        label: '门',
    },
    {
        value: '纲',
        label: '纲',
    },
    {
        value: '目',
        label: '目',
    },
    {
        value: '科',
        label: '科',
    },
    {
        value: '属',
        label: '属',
    }
])
const loading = ref(false);
const queryFormRef = ref();
let tableData:any =[];
const tableList = ref<any>([]);
const formRef = ref(); //新增表单
const detailVisible = ref(false);
const pData = ref<any>(null);
//获取数据
const getList = (val?: number) => {
    if (val == 1) {
        queryParams.value.page = 1;
    }
    loading.value = true;
        speciesResourcesApi.getDataByPage(queryParams.value).then((res:any) => {
            loading.value = false;
            if (res.success) {
                tableData= res.response.data;
                // tableList.value = tableData.filter((item: any) => {
                //         return !tableData.some((i: any) => {
                //             return i.id === item.pId
                //         })
                //     })
                //     .map((item: any) => {
                //         item.hasChildren = tableData.some(
                //             (child: any) => child.pId === item.id
                //         )
                //         return item
                //     })
                tableList.value = handleTree(tableData, 'id', 'parentid', 'children');
                console.log(tableList.value);
                
            } else {
                tableList.value = [];
            }
        });
};
const load = (tree: any, treeNode: any, resolve: any) => {
    console.log(tree)
    const parentid = tree.id
    const children = tableData.filter((item: any) => item.pId === parentid)
    children.forEach((item: any) => {
        item.hasChildren = tableData.some((child: any) => child.pId === item.id)
    })
    setTimeout(() => {
        loading.value = false
        resolve(children)
    }, 500)
}

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
    formRef.value.openDialog("新增",row);
};
//修改
const handleEdit = async (row: any) => {
    formRef.value.openDialog("编辑", row);
};

//查看
const handleDetail = async (row: any) => {
    
    if (row.blevelname == '属') {
        row.levelArr = parentTree(tableData, row.id) 
    }
    pData.value = row;
   
    detailVisible.value = true;
};
const parentTree=(arr, id)=> {
    //arr 所有的树数据 id 某个子节点的id
    var temp:any = [];
    var callback = function (nowArr, id) {
        //先定义个函数寻找子节点位置 找到后 再找改节点父元素位置 以此类推
        for (var i = 0; i < nowArr.length; i++) {
            var item:any = nowArr[i];
            if (item.id === id) {
                temp.push(item);
                callback(arr, item.pId); //pid 父级ID
                break;
            } else {
                if (item.children) {
                    callback(item.children, id); //menus 子节点字段名称
                }
            }
        }
    };
    callback(arr, id);
    return temp; //最后返回
}
//删除
const handleDelete = (id: number) => {
    ElMessageBox.confirm("是否确认删除此条数据?", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(() => {
            speciesResourcesApi.delete({ id:id}).then((res: any) => {
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

onMounted(() => {
    getList();
});
</script>

<style scoped lang="scss">

</style>
