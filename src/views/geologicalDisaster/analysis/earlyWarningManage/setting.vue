<template>
  <div class="earlyWarningManage-page">
    <div class="wrap">
      <div class="wrap-header">阈值设置</div>
      <div class="wrap-content">
        <el-table
          class="tableList"
          :data="tableData1"
          stripe
          :show-overflow-tooltip="true"
          :header-cell-style="{
            background: 'rgba(193, 209, 228, 0.08)',
            color: 'color: rgba(0, 0, 0, 0.4)',
            fontSize: '14px',
            height: '46px',
            borderBottom: '1px solid #E7E7E7'
          }"
        >
          <el-table-column
            type="index"
            width="55"
            label="序号"
            align="center"
          />
          <el-table-column
            prop="name"
            label="因子名称"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="unit"
            label="因子单位"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="level1"
            label="红色预警"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="level2"
            label="橙色预警"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="level3"
            label="黄色预警"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="level4"
            label="蓝色预警"
            align="center"
          >
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- <Dialog v-model="show" :title="title" w="600px" append-to-body :close-on-click-modal="false" @close="close">
            <div class="form" v-if="type=='阈值设置'">
                <el-alert style="margin-bottom: 20px;" title="以监测数据的绝对值和阈值对比，大于等于阈值上限时，生成预警信息！" type="warning"
                    show-icon />
                <el-form ref="formRef" :model="form" :inline="true" label-position="right" :rules="rules"
                    label-width="100px">
                    <el-form-item label="一级预警：" prop="level1">
                        <el-input-number v-model="form.level1" :min="-999" :max="999" controls-position="right" />
                    </el-form-item>
                    <el-form-item label="二级预警：" prop="level2">
                        <el-input-number v-model="form.level2" :min="-999" :max="999" controls-position="right" />
                    </el-form-item>
                    <el-form-item label="三级预警：" prop="level3">
                        <el-input-number v-model="form.level3" :min="-999" :max="999" controls-position="right" />
                    </el-form-item>
                    <el-form-item label="四级预警：" prop="level4">
                        <el-input-number v-model="form.level4" :min="-999" :max="999" controls-position="right" />
                    </el-form-item>
                </el-form>
            </div>
            <div class="form" v-else-if="type == '播报设置'">
                <el-form ref="formRef" :model="form" :inline="true" label-position="left" :rules="rules">
                    <el-form-item label="播报时间间隔(min)：" prop="level1">
                        <el-input-number v-model="form.level1" :min="0" :max="999" controls-position="right" />
                    </el-form-item>
                    <el-form-item label="最大播报次数：" prop="level2">
                        <el-input-number v-model="form.level2" :min="0" :max="999" controls-position="right" />
                    </el-form-item>
                    <el-form-item label="播报内容：" prop="level3" style="width: 100%">
                        <el-input v-model="form.content1" maxlength="30" style="width: 100%" placeholder="请输入内容"
                            show-word-limit type="textarea" />
                    </el-form-item>
                    <el-form-item label="推送内容：" prop="level4" style="width: 100%;margin-left: 0;">
                        <el-input v-model="form.content2" maxlength="30" style="width: 100%" placeholder="请输入内容"
                            show-word-limit type="textarea" />
                    </el-form-item>
                </el-form>
            </div>
            <template #footer class="dialog-footer">
                <el-button @click="close">取 消</el-button>
                <el-button :loading="loading" type="primary" @click="submit">提 交</el-button>
            </template>
        </Dialog> -->
  </div>
</template>

<script setup lang="ts">
const tableData1 = ref([
  {
    id: 1,
    name: "高程变化",
    unit: "mm",
    level1: 50,
    level2: 100,
    level3: 150,
    level4: 200,
    updateTime: "2023-04-15"
  },
  {
    id: 1,
    name: "北向量变化",
    unit: "mm",
    level1: 50,
    level2: 100,
    level3: 150,
    level4: 200,
    updateTime: "2023-04-15"
  },
  {
    id: 1,
    name: "东向量变化",
    unit: "mm",
    level1: 50,
    level2: 100,
    level3: 150,
    level4: 200,
    updateTime: "2023-04-15"
  },
  {
    id: 1,
    name: "降雨量",
    unit: "mm",
    level1: 50,
    level2: 100,
    level3: 150,
    level4: 200,
    updateTime: "2023-04-15"
  },
  {
    id: 1,
    name: "土壤含水率",
    unit: "mm",
    level1: 50,
    level2: 100,
    level3: 150,
    level4: 200,
    updateTime: "2023-04-15"
  },
  {
    id: 1,
    name: "地表裂缝",
    unit: "mm",
    level1: 50,
    level2: 100,
    level3: 150,
    level4: 200,
    updateTime: "2023-04-15"
  }
])
const tableData2 = ref([
  {
    id: 1,
    name: "一级预警",
    unit: "mm",
    level1: 50,
    level2: 100,
    level3: 150,
    level4: 200,
    updateTime: "2023-04-15"
  },
  {
    id: 1,
    name: "二级预警",
    unit: "mm",
    level1: 50,
    level2: 100,
    level3: 150,
    level4: 200,
    updateTime: "2023-04-15"
  },
  {
    id: 1,
    name: "三级预警",
    unit: "mm",
    level1: 50,
    level2: 100,
    level3: 150,
    level4: 200,
    updateTime: "2023-04-15"
  },
  {
    id: 1,
    name: "四级预警",
    level1: 10,
    level2: 100,
    level3: 150,
    level4: 200,
    updateTime: "2023-04-15"
  }
])

//弹框
const type = ref("")
const show = ref(false)
const formRef = ref()
const title = ref("添加")
const loading = ref(false)
//表单数据
const form = ref<any>({
  typename: ""
})
//校验规则
const rules = {
  level1: [
    {
      required: true,
      trigger: "change",
      message: "请输入一级预警"
    }
  ],
  level2: [
    {
      required: true,
      trigger: "change",
      message: "请输入一级预警"
    }
  ],
  level3: [
    {
      required: true,
      trigger: "change",
      message: "请输入一级预警"
    }
  ],
  level4: [
    {
      required: true,
      trigger: "change",
      message: "请输入一级预警"
    }
  ],
  content: [
    {
      required: true,
      trigger: "blur",
      message: "请输入一级预警"
    },
    { min: 0, max: 100, message: "最大100字符", trigger: "blur" }
  ]
}

//阈值编辑
const handleEdit = (row) => {
  type.value = "阈值设置"
  form.value = Object.assign({}, row)
  show.value = true
  title.value = row.name + type.value + `(${row.unit})`
}
//播报编辑
const handleEdit1 = (row) => {
  type.value = "播报设置"
  title.value = row.name + type.value
  form.value = Object.assign({}, row)
  show.value = true
}

//关闭弹框
const close = () => {
  show.value = false
  loading.value = false
}
//提交表单
const submit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      try {
        // lineApi.update(form.value).then((res) => {
        //     if (res.success) {
        //         ElMessage.success(res.msg);
        //         close()
        //         // 发送操作成功的事件
        //         emit("success");
        //     } else {
        //         ElMessage.error(res.msg);
        //     }
        // });
      } finally {
        loading.value = false
      }
    }
  })
}
onMounted(() => {})
</script>

<style lang="scss" scoped>
.earlyWarningManage-page {
  .wrap {
    background: #ffffff;
    .wrap-header {
      display: flex;
      align-items: center;
      height: 48px;
      padding: 0 16px;
      color: #222222;
      font-size: 16px;
      border-bottom: 1px solid #e7e7e7;
      font-weight: 700;
      &::before {
        content: "";
        display: inline-block;
        width: 3px;
        height: 16px;
        background: #222222;
        margin-right: 10px;
      }
    }

    .wrap-content {
      padding: 20px;
    }
  }
}
//  .form{
//      .el-form {
//          justify-content: space-between;
//      }

//      .el-form--inline .el-form-item {
//          width: calc((100% - 20px) / 2);
//          margin-right: 0;

//          &:nth-child(2n) {
//              margin-left: 20px;
//          }
//      }
//  }
</style>
