<template>
  <div class="page">
    <!-- 搜索栏 -->
    <div class="search-content">
      <el-form
        class="queryForm"
        ref="queryFormRef"
        :model="queryParams"
        label-width="auto"
        @keyup.enter.native="handleQuery"
        clearable
      >
        <el-form-item
          label="菜单名称:"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            placeholder="菜单名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="状态:"
          prop="effective"
        >
          <el-select
            style="width: 200px"
            v-model="queryParams.effective"
            :teleported="false"
            placeholder="请选择状态"
            clearable
          >
            <el-option
              v-for="item in stateList"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="0">
          <el-button
            type="primary"
            @click="handleQuery"
            :icon="Search"
            >查询</el-button
          >
          <el-button
            type="primary"
            plain
            @click="handleAdd(0)"
            :icon="Plus"
            >新增</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <!-- 表格 -->
    <div class="table-content">
      <el-table
        v-loading="loading"
        :default-expand-all="false"
        :data="menuList"
        highlight-current-row
        row-key="Id"
      >
        <el-table-column label="菜单名称">
          <template #default="scope">
            <svg-icon
              v-if="scope.row.icon"
              :name="scope.row.type === 3 ? 'button' : scope.row.icon"
            />
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column
          label="类型"
          align="center"
          width="100"
        >
          <template #default="scope">
            <el-tag
              v-if="scope.row.type === 1"
              type="warning"
              >目录</el-tag
            >
            <el-tag
              v-else-if="scope.row.type === 2"
              type="success"
              >菜单</el-tag
            >
            <el-tag
              v-else-if="scope.row.type === 3"
              type="danger"
              >按钮</el-tag
            >
          </template>
        </el-table-column>

        <el-table-column
          label="路由路径"
          align="left"
          prop="path"
        >
          <template #default="scope">
            <span v-if="scope.row.redirect">{{ scope.row.redirect }}</span>
            <span v-else>{{ scope.row.path }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="组件路径"
          align="left"
          prop="component"
        />

        <!-- <el-table-column label="权限标识" align="center" width="160" prop="perm" /> -->

        <el-table-column
          label="菜单状态"
          align="center"
          width="80"
        >
          <template #default="scope">
            <el-tag
              v-if="scope.row.effective"
              type="success"
              >显示</el-tag
            >
            <el-tag
              v-else
              type="info"
              >隐藏</el-tag
            >
          </template>
        </el-table-column>

        <el-table-column
          label="排序"
          align="center"
          width="80"
          prop="sort"
        />

        <el-table-column
          fixed="right"
          align="center"
          label="操作"
          width="280"
        >
          <template #default="scope">
            <el-button
              v-if="scope.row.type == 1 || scope.row.type == 2"
              type="primary"
              @click.stop="handleAdd(scope.row.Id)"
            >
              新增
            </el-button>

            <el-button
              type="warning"
              @click="handleEdit(scope.row.Id)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              @click.stop="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <MenuForm
      ref="formRef"
      @success="handleQuery"
    />
  </div>
</template>

<script setup lang="ts">
import { menuApi } from "@/api/SystemManage/menu"
import { handleTree } from "@/utils/tree"
import { Plus, Search } from "@element-plus/icons-vue"
import MenuForm from "./form.vue"

defineOptions({
  name: "Menu",
  inheritAttrs: false
})
const defaultProps = ref({
  label: "name",
  value: "Id",
  children: "children"
})

const queryFormRef = ref(ElForm)
const formRef = ref()
const loading = ref(false)
const queryParams = reactive<any>({})
const menuList = ref<any[]>([])

const stateList = ref([
  {
    value: true,
    label: "正常"
  },
  {
    value: false,
    label: "失效"
  }
])

/**
 * 查询
 */
function handleQuery() {
  // 重置父组件
  loading.value = true
  if (queryParams.effective === "") {
    queryParams.effective = null
  }
  menuApi
    .getDataTree(queryParams)
    .then((res) => {
      menuList.value = handleTree(res.response, "Id", "pId")
    })
    .then(() => {
      loading.value = false
    })
}

// 重置查询
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}
// 添加
const handleAdd = async (id) => {
  formRef.value.openDialog("新增", id)
}
//修改
const handleEdit = async (id) => {
  formRef.value.openDialog("编辑", id)
}
//删除
const handleDelete = (row: any) => {
  // let arr = treeToList([row], { children: 'children' })
  // let ids = arr.map((item: any) => item.Id);
  // console.log(ids);
  ElMessageBox.confirm("是否确认删除此条数据?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      menuApi.delete({ routeId: row.Id }).then((res: any) => {
        if (res.success) {
          ElMessage({
            type: "success",
            message: "删除成功"
          })
          handleQuery()
        } else {
          ElMessage({
            type: "error",
            message: res.msg
          })
        }
      })
    })
    .catch(() => {})
}
const getRouteTree = async () => {
  const { response } = await menuApi.getDataTree({})
  // console.log(response, 111)
  return response
}
// #region 测试
/**
 * 为树形结构的每个节点添加 fullPath
 * @param list 要处理的树形数据
 * @param parentPath 父节点的路径
 */
function addFullPath(list: any[], parentPath: string = "") {
  list.forEach((item) => {
    // 判断当前节点的 path 是否以 '/' 开头
    if (item.path.startsWith("/")) {
      item.fullPath = item.path
    } else {
      // 如果不是以 '/' 开头，需要拼接父路径
      // 确保父路径末尾有 '/'
      const normalizedParentPath = parentPath.endsWith("/") ? parentPath : `${parentPath}/`
      item.fullPath = `${normalizedParentPath}${item.path}`
    }

    // 如果有子节点，递归处理
    if (item.children && item.children.length > 0) {
      addFullPath(item.children, item.fullPath)
    }
  })
  return list
}
const getTest = (MENULIST: any) => {
  MENULIST.forEach((item: any) => {
    item.id = item.Id
  })
  // 将MENULIST根据sort升序
  const sortMenuList = MENULIST.sort((a: any, b: any) => a.sort - b.sort)
  // 将sortMenuList筛选effective!==false的,菜单中不展示/login等页面
  const effectiveMenuList = sortMenuList.filter((item) => item.effective)
  // 菜单列表
  const menuList = arrayToTree(
    JSON.parse(JSON.stringify(effectiveMenuList)),
    { id: "id", pid: "pId", children: "children" },
    true
  )
  const fullPathRootList = addFullPath(menuList)
  // 完整列表
  const allList = arrayToTree(
    JSON.parse(JSON.stringify(sortMenuList)),
    { id: "id", pid: "pId", children: "children" },
    false
  )
  const systemList = findNodes(allList, "System", { key: "componentName" })
  const noSystemList = removeNode(allList, "System", { key: "componentName" })
  const rootList: any = [...systemList, ...noSystemList]
  noSystemList.forEach((item) => {
    if (item.componentName === "Layouts") {
      for (let i = 0; i < item.children.length; i++) {
        if (item.children[i].componentName === "Tourism") {
          for (let j = 0; j < item.children[i].children.length; j++) {
            if (
              ["TourismPanorama", "ScienceEducation", "CommunityBuilding"].includes(
                item.children[i].children[j].componentName
              )
            ) {
              item.children.push(JSON.parse(JSON.stringify(item.children[i].children[j])))
              item.children[i].children.splice(j, 1)
              j--
            }
          }
          rootList.push(JSON.parse(JSON.stringify(item.children[i])))
          item.children.splice(i, 1)
          i--
        }
      }
    }
  })
  // console.log(rootList, fullPathRootList, 111)
}
// #endregion
onMounted(async () => {
  handleQuery()
  // const li = await getRouteTree()
  // getTest(li)
})
</script>
<style lang="scss" scoped>
.page {
  // height: 1000px;
  height: calc(100% - 100px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .table-content {
    flex: 1;
    overflow: hidden;
    .el-table {
      height: 100%;
    }
  }
}
</style>
