<script lang="ts" setup>
import { AddForestResourcesPlan, DeleteForestResourcesPlan, UpdateForestResourcesPlan } from "@/api"
import dayjs from "dayjs"

interface Props {
  type?: string
  data?: any
  map: any
}
const props = withDefaults(defineProps<Props>(), {
  type: "",
  data: {},
  map: {}
})
const emit = defineEmits<{
  "update:show": [boolean]
  "update:type": [string]
  updateType: [any]
}>()
const proxy = getCurrentInstance()!.proxy as any
const typeList = [
  { label: "封山育林", value: "1" },
  { label: "新造林", value: "2" },
  { label: "森林抚育", value: "3" },
  { label: "退化林修复", value: "4" }
]
const back = () => {
  resetForm()
  emit("update:show", false)
  if (props.type === "编辑") {
    emit("updateType", "查看")
  } else {
    emit("update:type", "")
  }
}
const ruleFormRef = ref()
const rules = ref({
  planarea: [
    {
      required: true,
      message: "规划面积必填",
      trigger: "blur"
    }
  ],
  planperimeter: [
    {
      required: true,
      message: "规划周长必填",
      trigger: "blur"
    }
  ]
})
const form = ref<any>({
  planperimeter: 0,
  planarea: 0
})

// 重置
const resetForm = () => {
  if (props.type === "新增") {
    form.value = {
      planarea: 0,
      planperimeter: 0
    }
  }
  if (props.type === "编辑") {
    form.value = JSON.parse(JSON.stringify(props.data))
  }
  ruleFormRef?.value?.resetFields()
}

const { user } = storeToRefs(useConfigStore())
// 提交新增
const submit = () => {
  ruleFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // console.log(form.value)
      const { success } = await AddForestResourcesPlan({
        ...form.value,
        createuser: user.value.userName,
        createtime: dayjs().format("YYYY-MM-DD HH:mm:ss")
      })
      if (success) {
        ElMessage.success("新增成功")
      } else {
        ElMessage.error("新增失败")
      }
      proxy.$mitt.emit("refresh-list")
      emit("update:type", "")
      nextTick(() => {
        back()
      })
    }
  })
}
// 提交修改
const submitModify = () => {
  ruleFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // console.log(form.value)
      const { success } = await UpdateForestResourcesPlan({
        ...form.value
      })
      if (success) {
        ElMessage.success("修改成功")
      } else {
        ElMessage.error("修改失败")
      }
      proxy.$mitt.emit("refresh-list")
      emit("update:type", "")
      emit("update:show", false)
    }
  })
}
// 打开修改
const openModify = () => {
  emit("updateType", "编辑")
}
// 删除
const remove = () => {
  ElMessageBox.confirm("是否确认删除数据?", "", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { success, msg } = await DeleteForestResourcesPlan({
        id: form.value.id
      })
      if (success) {
        ElMessage.success(`删除成功`)
      } else {
        ElMessage.info(`${msg}`)
      }
      proxy.$mitt.emit("refresh-list")
      emit("update:type", "")
      nextTick(() => {
        back()
      })
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消删除"
      })
    })
}
// watch(
//   () => props.data,
//   (val) => {
//     if (val) {
//     }
//   },
//   {
//     deep: true,
//     immediate: true
//   }
// )
let drawTool: any
const drawHandle = (type: string) => {
  if (type === "draw") {
    if (!drawTool) {
      drawTool = new DrawOLShape(toRaw(props.map), {
        title: "绘制图层",
        zIndex: 2,
        clearable: true,
        single: true, // 只允许单次绘制
        select: true,
        modify: true
      })
    }
    drawTool.drawPolygon({
      end: (feature: any) => {
        // console.log(feature, "绘制结束")
        if (feature) {
          form.value.planarea = DrawOLShape.calculateArea(feature, "mu").area.toFixed(2)
          form.value.planperimeter = DrawOLShape.calculateLength(feature, "km").length.toFixed(2)
          form.value.geom = new WKT().writeFeature(feature)
        }
      },
      modifyend: (eve: any) => {
        // console.log(eve, "修改结束")
        if (eve.features.length > 0) {
          form.value.planarea = DrawOLShape.calculateArea(eve.features[0], "mu").area.toFixed(2)
          form.value.planperimeter = DrawOLShape.calculateLength(eve.features[0], "km").length.toFixed(2)
          form.value.geom = new WKT().writeFeature(eve.features[0])
        }
      }
    })
  }
  if (type === "undo" && drawTool) {
    const undoResult = drawTool.removeLastPoint()
    if (undoResult.success) {
      ElMessage.info(undoResult.message)
    } else {
      ElMessage.warning(undoResult.message)
    }
  }
  if (type === "redo") {
    if (drawTool) {
      drawTool.destroy()
      drawTool = null
      drawHandle("draw")
    }
  }
  if (type === "cancel") {
    drawTool && drawTool.destroy()
    drawTool = null
  }
}
watch(
  () => props.type,
  (val) => {
    // 删除绘制工具
    if (drawTool) {
      drawTool.destroy()
      drawTool = null
    }
    if (val === "新增") {
      form.value = {}
    }
    if (val === "查看" || val === "编辑") {
      form.value = JSON.parse(JSON.stringify(props.data))
      // console.log(form.value)
      form.value.plantypeName = typeList.find((item: any) => item.value === form.value.plantype)?.label
      const geom = form.value.geom
      if (geom) {
        const feature: any = new WKT().readFeature(geom)
        // 创建绘制工具实例
        drawTool = new DrawOLShape(toRaw(props.map), {
          title: "绘制图层",
          zIndex: 2,
          single: true // 只允许单次绘制
        })
        // 直接处理已有要素
        drawTool.initInteractions([feature], val === "编辑", val === "编辑", false, true, {
          modifyend: (event: any) => {
            const f = event.features[0]
            // 面积
            form.value.planarea = DrawOLShape.calculateArea(f, "mu").area.toFixed(2)
            // 周长
            form.value.planperimeter = DrawOLShape.calculateLength(f, "km").length.toFixed(2)
            form.value.geom = new WKT().writeFeature(f)
          }
        })
      }
    }
  },
  {
    deep: true,
    immediate: true
  }
)
onUnmounted(() => {
  // 删除绘制工具
  if (drawTool) {
    drawTool.destroy()
    drawTool = null
  }
})
</script>
<template>
  <!-- 新增和编辑 -->
  <div
    v-if="type === '新增' || type === '编辑'"
    class="edit-panel"
  >
    <div class="title">
      <div class="title-text">
        <img
          :src="$fun.getImg('patrol/edit-title.png')"
          alt=""
        />
        {{ type }}
      </div>
      <div
        class="back"
        @click="back"
      >
        <img
          :src="$fun.getImg('patrol/edit-back.png')"
          alt=""
        />
      </div>
    </div>
    <div class="form">
      <el-scrollbar height="100%">
        <el-form
          :model="form"
          :rules="rules"
          ref="ruleFormRef"
          label-width="auto"
          label-position="top"
        >
          <el-form-item
            label="规划任务名称"
            prop="planname"
          >
            <el-input
              v-model="form.planname"
              placeholder="请输入规划任务名称"
            />
          </el-form-item>
          <el-form-item
            label="类型"
            prop="plantype"
          >
            <el-select
              v-model="form.plantype"
              placeholder="请选择类型"
              popper-class="custom-select-popper"
            >
              <el-option
                v-for="item in typeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="年份">
            <el-date-picker
              style="width: 100%"
              popper-class="custom-datepicker-popper"
              v-model="form.years"
              value-format="YYYY年"
              format="YYYY年"
              type="year"
              placeholder="请选择年份"
            />
          </el-form-item>
          <el-form-item label="金额">
            <el-input
              v-model="form.amount"
              placeholder="请输入金额"
            >
              <template #append>元</template>
            </el-input>
          </el-form-item>
          <el-form-item
            label="规划面积"
            prop="planarea"
          >
            <el-input
              v-model="form.planarea"
              placeholder="地图框选自动填充"
              readonly
            >
              <template #append>亩</template>
            </el-input>
          </el-form-item>
          <el-form-item
            label="规划周长"
            prop="planperimeter"
          >
            <el-input
              v-model="form.planperimeter"
              placeholder="地图框选自动填充"
              readonly
            >
              <template #append>km</template>
            </el-input>
          </el-form-item>
          <el-form-item
            label="内容"
            prop="content"
          >
            <el-input
              v-model="form.content"
              placeholder="请输入内容"
              type="textarea"
              resize="none"
              :rows="7"
            />
          </el-form-item>
          <el-form-item
            label="是否编制"
            prop="sfprepared"
          >
            <el-radio-group v-model="form.sfprepared">
              <el-radio value="是">是</el-radio>
              <el-radio value="否">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div class="btns">
          <div
            v-if="type === '新增'"
            @click="submit"
          >
            提交
          </div>
          <div
            v-if="type === '编辑'"
            @click="submitModify"
          >
            提交编辑
          </div>
          <div @click="resetForm">重置</div>
        </div>
      </el-scrollbar>
    </div>
    <div
      v-dragable
      class="draw-tool"
    >
      <div class="tool-title">绘制工具</div>
      <div class="tool-box">
        <div
          class="box"
          @click="drawHandle('draw')"
        >
          <i-ep-ChatRound />
          画面
        </div>
        <div
          class="box"
          style="width: 100px"
          @click="drawHandle('undo')"
        >
          <i-ep-Back />
          撤销ctrl+z
        </div>
        <div
          class="box"
          @click="drawHandle('redo')"
        >
          <i-ep-RefreshLeft />
          重画
        </div>
        <div
          class="box"
          @click="drawHandle('cancel')"
        >
          <i-ep-Close />
          清除
        </div>
      </div>
      <div class="tool-text">长度：{{ form.planperimeter }}km，面积：{{ form.planarea }}亩</div>
    </div>
  </div>
  <!-- 查看 -->
  <div
    v-else-if="type === '查看'"
    class="edit-panel"
  >
    <div class="title">
      <div class="title-text">
        <img
          :src="$fun.getImg('patrol/edit-title.png')"
          alt=""
        />
        {{ type }}
      </div>
      <div
        class="back"
        @click="back"
      >
        <img
          :src="$fun.getImg('patrol/edit-back.png')"
          alt=""
        />
      </div>
    </div>
    <div class="form">
      <el-scrollbar height="100%">
        <div class="info">
          <!-- <div class="info-title">基础信息</div> -->
          <div class="info-box">
            <div class="item">
              <div class="label">规划任务名称:</div>
              <div class="value">{{ form.planname }}</div>
            </div>
            <div class="item">
              <div class="label">类型:</div>
              <div class="value">{{ form.plantypeName }}</div>
            </div>
            <div class="item">
              <div class="label">年份:</div>
              <div class="value">{{ form.years }}年</div>
            </div>
            <div class="item">
              <div class="label">金额:</div>
              <div class="value">{{ form.amount }}元</div>
            </div>
            <div class="item">
              <div class="label">规划面积:</div>
              <div class="value">{{ form.planarea }}亩</div>
            </div>
            <div class="item">
              <div class="label">规划周长:</div>
              <div class="value">{{ form.planperimeter }}km</div>
            </div>
            <div class="item row-item">
              <div class="label">内容:</div>
              <div class="value">{{ form.content }}</div>
            </div>
            <!-- <div class="item row-item btn1" @click="openModify">
              编辑
            </div> -->
          </div>
        </div>
        <div class="btns">
          <div @click="openModify">编辑</div>
          <div @click="remove">删除</div>
          <div @click="back">返回</div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.edit-panel {
  width: 420px;
  position: absolute;
  top: 20px;
  right: 20px;
  bottom: 20px;
  background-color: rgba(11, 25, 39, 0.9);
  border: 1px solid #505b65;
  border-radius: 6px;
  box-shadow: 0 0 10px 1px rgba(255, 255, 255, 0.2) inset;
  z-index: 9;
  font-size: 14px;
  color: #fff;

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    line-height: 48px;
    height: 48px;
    background-color: rgba(61, 69, 79, 0.3);

    .title-text {
      display: flex;
      align-items: center;
      color: #b6c9e5;
      font-size: 16px;
      gap: 5px;

      img {
        width: 16px;
        height: 16px;
      }
    }

    .back {
      width: 18px;
      height: 16px;
      cursor: pointer;
      line-height: initial;

      img {
        width: 100%;
        height: 100%;
      }
    }
  }

  :deep(.form) {
    height: calc(100% - 48px);
    padding: 10px 20px;

    .el-input.is-disabled {
      .el-input__wrapper {
        background-color: #1a2d3f;
      }
    }

    .is-disabled.el-select__wrapper {
      background-color: #1a2d3f;
    }

    .el-form-item__label {
      color: #fff;
    }

    .el-input__wrapper,
    .el-select__wrapper {
      background-color: #121f28;
      box-shadow: none;
      border: 1px solid #656d74;
      border-radius: 0;
    }

    .el-input-group__append {
      box-shadow: none;
      background-color: #53616d;
      color: #bac0c5;
    }

    .el-textarea__inner {
      box-shadow: none;
      background-color: #121f28;
      border: 1px solid #656d74;
      color: #bac0c5;
    }

    .el-radio-group {
      .el-radio__input.is-checked + .el-radio__label {
        color: #90c5e5;
      }

      .el-radio__input.is-checked .el-radio__inner {
        border-color: #90c5e5;
        background: #90c5e5;
      }
    }

    .con {
      display: flex;
      flex-direction: column;
      padding: 5px 10px;

      .item {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 5px 0;

        .label {
          color: #fff;
          width: 120px;
        }

        .value {
          color: #bac0c5;
          flex: 1;
        }

        &:not(:last-child) {
          border-bottom: 1px #3b5b7f solid;
        }
      }
    }

    .info {
      color: #fff;
      padding: 10px 0;

      .info-title {
        color: #fff;
        font-size: 16px;
        margin-bottom: 10px;
        padding-left: 34px;
        background: url("@/assets/images/patrol/edit-title-bg.png") no-repeat left center;
      }

      .info-box {
        // display: flex;
        flex-wrap: wrap;
        overflow: hidden;

        .item {
          display: flex;
          width: 100%;
          line-height: 3em;
          text-overflow: ellipsis;
          white-space: nowrap;

          .label {
            width: 150px;
            text-align: right;
            margin-right: 20px;
            color: #beccdc;
          }

          .value {
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #beccdc;
          }
        }

        .row-item {
          width: 100%;

          .value {
            flex: 1;
            white-space: wrap;
            overflow: hidden;
          }
        }

        .btn1 {
          justify-content: center;
          background: linear-gradient(to right, #5ab5b0, #367672);
          cursor: pointer;
        }
      }

      .btn2 {
        display: flex;
        justify-content: center;
        align-items: center;
        line-height: 3em;
        justify-content: center;
        background: linear-gradient(to right, #e86b05, #ed5c08);
        cursor: pointer;
      }

      .steps {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 10px;
        overflow-y: auto;

        .step {
          height: 60px;
          padding-left: 20px;
          background: url("@/assets/images/patrol/step-left-bg.png") no-repeat left center;
          line-height: 2em;

          .status {
            font-size: 16px;
          }
        }
      }

      .statistics {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;

        .statistics-item {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 72px;
          gap: 5px;
          background: url("@/assets/images/patrol/edit-statistics-bg.png") no-repeat center center / 100% 100%;

          img {
            width: 36px;
            height: 36px;
          }

          > div {
            .value {
              font-size: 16px;
            }

            .label {
              font-size: 14px;
              color: #abb1b7;
            }
          }
        }
      }
    }
  }

  .btns {
    display: flex;
    align-items: center;
    gap: 10px;

    > div {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 2em;
      background-color: #020a11;
      font-size: 16px;
      color: #fff;
      border: 1px #365375 solid;
      cursor: pointer;
    }

    & > div:first-child {
      background: linear-gradient(to right, #5a8ab6, #375577);
    }
    & > div:nth-child(2) {
      background: #ff7f50;
    }
  }
  .draw-tool {
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fff;
    font-size: 14px;
    color: #000;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    .tool-title {
      display: flex;
      justify-content: center;
      align-items: center;
      line-height: 2em;
      background-color: #e7f7f3;
    }
    .tool-box {
      display: flex;
      cursor: pointer;
      .box {
        width: 70px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        &:hover {
          background-color: #e7f7f3;
        }
      }
    }
    .tool-text {
      display: flex;
      height: 32px;
      justify-content: center;
      align-items: center;
      background-color: #dadada;
    }
  }
}
</style>
