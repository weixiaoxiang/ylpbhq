<template>
  <!-- 新增修改对话框 -->
  <Dialog
    v-model="show"
    :title="title"
    w="600px"
    append-to-body
    :close-on-click-modal="false"
    @close="close"
  >
    <div class="form">
      <el-form
        ref="formRef"
        v-loading="loadForm"
        :model="form"
        :inline="true"
        label-position="left"
        :rules="rules"
      >
        <el-form-item
          label="名称："
          prop="name"
        >
          <el-input
            v-model="form.name"
            placeholder="请输入名称"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="年份："
          prop="year"
        >
          <el-input
            v-model="form.year"
            placeholder="请输入年份"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="影像地址："
          prop="url"
        >
          <el-input
            v-model="form.url"
            placeholder="请输入影像地址"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="所属模块："
          prop="ssmk"
        >
          <el-select
            v-model="form.ssmk"
            multiple
            collapse-tags
            :teleported="false"
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in functionList"
              :key="index"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="影像类型：">
          <el-radio-group v-model="form.imagetype">
            <el-radio label="影像地图">影像地图</el-radio>
            <el-radio label="矢量地图">矢量地图</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="模块类型：">
          <el-select
            v-model="form.type"
            :teleported="false"
            placeholder="请选择"
            clearable
          >
            <el-option
              label="枯木"
              value="枯木"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="排序："
          prop="sort"
        >
          <el-input-number
            v-model="form.sort"
            style="width: 100px"
            controls-position="right"
            :min="0"
          />
        </el-form-item>
      </el-form>
    </div>
    <template
      #footer
      class="dialog-footer"
    >
      <el-button @click="close">取 消</el-button>
      <el-button
        :loading="loading"
        type="primary"
        @click="submit"
        >提 交</el-button
      >
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { layerApi } from "@/api/SystemManage/layer"
import { imageApi } from "@/api/SystemManage/image"
import Dialog from "@/components/Dialog/index.vue"
const show = ref(false)
const loadForm = ref(false)
const loading = ref(false)
const formRef = ref()
const title = ref("添加")
const functionList = ref<any>([])
//表单数据
const form = ref<any>({
  name: "",
  year: "",
  url: "",
  sort: 1,
  type: "",
  effective: true,
  createtime: new Date().toLocaleString().replaceAll("/", "-")
})
//校验规则
const rules = {
  name: [
    { required: true, trigger: "blur", message: "请输入影像名称" },
    { min: 0, max: 50, message: "最大50字符", trigger: "blur" }
  ],
  year: [{ required: true, trigger: "blur", message: "请输入年份" }],
  url: [{ required: true, trigger: "blur", message: "请输入影像地址" }]
}
/** 打开弹窗 */
const openDialog = async (type: string, row?: any) => {
  show.value = true
  title.value = type
  clearForm()
  getFunctionList()
  // 修改时，设置数据
  if (row) {
    form.value = Object.assign({}, row)
    if (row.ssmk) {
      form.value.ssmk = row.ssmk.split(",").filter((item: any) => item !== "")
    }
  }
}
defineExpose({ openDialog }) // 提供 open 方法，用于打开弹窗
// 清空表单
const clearForm = () => {
  formRef.value?.resetFields()
  form.value = {
    name: "",
    year: "",
    url: "",
    type: "",
    sort: 1,
    effective: true,
    createtime: new Date().toLocaleString().replaceAll("/", "-")
  }
}

//关闭弹框
const close = () => {
  show.value = false
  loading.value = false
}
// 确认
const emit = defineEmits(["success"])
const submit = () => {
  formRef.value.validate((valid: any) => {
    if (valid) {
      let query: any = Object.assign({}, form.value)
      loading.value = true
      if (title.value === "新增") {
      } else if (title.value === "编辑") {
      }
      try {
        if (form.value.ssmk) {
          query.ssmk = "," + form.value.ssmk.join(",") + ","
        }
        imageApi.add(query).then((res: any) => {
          loading.value = false
          if (res.success) {
            ElMessage.success(res.msg)
            close()
            // 发送操作成功的事件
            emit("success")
          } else {
            ElMessage.error(res.msg)
          }
        })
      } finally {
        loading.value = false
      }
    }
  })
}
//获取配置模块列表
const getFunctionList = async () => {
  const res: any = await layerApi.GetLayerFunctionalCatalog({})
  if (res.success) {
    functionList.value = res.response
  }
}
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
