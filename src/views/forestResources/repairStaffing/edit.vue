<script lang="ts" setup>
import {
  AddForestResourcesPrepared,
  CheckForestResourcesPrepared,
  GetForestResourcesPlanListByPage,
  UpdateForestResourcesPrepared
} from "@/api"
import SingleUpload from "@/components/Upload/SingleUpload.vue"
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
}>()
const proxy = getCurrentInstance()!.proxy as any
const { user } = storeToRefs(useConfigStore())
const typeList = [
  { label: "封山育林", value: "1" },
  { label: "新造林", value: "2" },
  { label: "森林抚育", value: "3" },
  { label: "退化林修复", value: "4" }
]
const isAddAgain = ref(false) //是否继续新增
const ghrwList = ref<any>([])
const getGhrwList = async () => {
  const { response } = await GetForestResourcesPlanListByPage({
    page: 1,
    intPageSize: 999
  })
  ghrwList.value = response.data
}
const changeGhrw = (val: any) => {
  // console.log(val)
  form.value.planname = val.planname
  form.value.planid = val.id
  form.value.plantype = typeList.find((item: any) => item.value === val.plantype)?.label
  form.value.years = val.years
  form.value.planarea = val.planarea
  form.value.planperimeter = val.planperimeter
  form.value.amount = val.amount
  form.value.content = val.content
  const geom = val.geom
  ghrwDrawTool && ghrwDrawTool.clearDrawData() // 清除规划任务绘制
  if (geom) {
    const feature: any = new WKT().readFeature(geom)
    // 直接处理已有要素
    createDrawTool()
    ghrwDrawTool.initInteractions([feature], false, false, false, true)
  }
}
const treeList = ref<any>({
  封山育林: [
    {
      label: "落叶松"
    },
    {
      label: "油松"
    },
    {
      label: "栎类"
    },
    {
      label: "桦木"
    }
  ],
  新造林: [
    {
      label: "杨树"
    },
    {
      label: "杉木"
    },
    {
      label: "马尾松"
    },
    {
      label: "刺槐"
    }
  ],
  森林抚育: [
    {
      label: "云杉"
    },
    {
      label: "樟子松"
    },
    {
      label: "核桃楸"
    },
    {
      label: "黄波罗"
    }
  ],
  退化林修复: [
    {
      label: "侧柏"
    },
    {
      label: "水曲柳"
    },
    {
      label: "蒙古扁桃"
    },
    {
      label: "沙棘"
    }
  ]
})

const wayList = ref<any>({
  封山育林: [
    {
      label: "全封"
    },
    {
      label: "半封"
    },
    {
      label: "轮封"
    },
    {
      label: "补植补播"
    }
  ],
  新造林: [
    {
      label: "造林规划与设计"
    },
    {
      label: "全面整地"
    },
    {
      label: "块状整地"
    },
    {
      label: "带状整地"
    },
    {
      label: "苗木选择与栽植"
    }
  ],
  森林抚育: [
    {
      label: "间伐（透光伐、疏伐、生长伐）"
    },
    {
      label: "修枝"
    },
    {
      label: "割灌除草"
    }
  ],
  退化林修复: [
    {
      label: "补植补造"
    },
    {
      label: "树种更替"
    },
    {
      label: "土壤改良"
    },
    {
      label: "病虫害防治"
    },
    {
      label: "火灾防控"
    }
  ]
})
const back = () => {
  fileGuid.value = ""
  resetForm() // 重置表单
  isAddAgain.value = false

  if (props.type === "编辑" || props.type === "核查") {
    emit("update:type", "查看")
  } else {
    emit("update:show", false)
    emit("update:type", "")
  }

  // 清除规划任务绘制
  ghrwDrawTool && ghrwDrawTool.clearDrawData()
  // 清除图层绘制
  drawTool && drawTool.clearDrawData()
}
const ruleFormRef = ref()
const rules = ref({
  xbh: [
    {
      required: true,
      message: "小斑号必填",
      trigger: "blur"
    }
  ],
  treetype: [
    {
      required: true,
      message: "种植树种必填",
      trigger: "blur"
    }
  ],
  xbarea: [
    {
      required: true,
      message: "小斑面积必填",
      trigger: "blur"
    }
  ],
  numbertree: [
    {
      required: true,
      message: "种植密度必填",
      trigger: "blur"
    }
  ],
  plantway: [
    {
      required: true,
      message: "种植方式必填",
      trigger: "blur"
    }
  ],
  starttime: [
    {
      required: true,
      message: "开始时间必填",
      trigger: "blur"
    }
  ],
  yjfinishtime: [
    {
      required: true,
      message: "预计完成时间必填",
      trigger: "blur"
    }
  ]
})
const form = ref<any>({
  planname: ""
})
const form1 = ref<any>({})

// 重置
const resetForm = () => {
  if (props.type === "新增") {
    form.value = {}
    form1.value = {}
  }
  if (props.type === "编辑" || props.type === "查看") {
    form1.value = JSON.parse(JSON.stringify(props.data))
    const find = ghrwList.value.find((item: any) => item.id === form1.value.planid)
    // 填充数据
    if (find) {
      form.value.planname = find.planname
      form.value.planid = find.id
      form.value.plantype = typeList.find((item: any) => item.value === find.plantype)?.label
      form.value.years = find.years
      form.value.planarea = find.planarea
      form.value.planperimeter = find.planperimeter
      form.value.amount = find.amount
      form.value.content = find.content
      form.value.geom = find.geom
    }
  }
  ruleFormRef?.value?.resetFields()
}
const fileGuid = ref("")
// 上传成功
const uploadSuccess = ({ response, uploadFile, uploadFiles }: any) => {
  // console.log("成功", response, uploadFile, uploadFiles)
  fileGuid.value = response.data.msg
  ElMessage.success("上传成功")
}
const uploadFiles = ref<any>([])
// 上传失败
const uploadError = ({ error, uploadFile, uploadFiles }: any) => {
  console.log("失败", error, uploadFile, uploadFiles)
  ElMessage.error("上传失败")
}
// 上传移除
const uploadRemove = ({ uploadFile, uploadFiles }: any) => {
  console.log("移除", uploadFile, uploadFiles)
}
// 提交新增
const submit = () => {
  if (!form.value.planname) {
    ElMessage.error("规划任务名称必填")
    return
  }
  ruleFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const { success } = await AddForestResourcesPrepared({
        ...form1.value,
        fileguid: fileGuid.value,
        planid: form.value.planid,
        createuser: user.value.userName,
        createtime: dayjs().format("YYYY-MM-DD HH:mm:ss")
      })
      if (success) {
        ElMessage.success("新增成功")
      } else {
        ElMessage.error("新增失败")
      }
      proxy.$mitt.emit("refresh-list")

      if (!isAddAgain.value) {
        emit("update:type", "")
        nextTick(() => {
          back()
        })
      } else {
        fileGuid.value = ""
        uploadFiles.value = []
        form.value = {}
        form1.value = {}
        // 清除绘制
        ghrwDrawTool && ghrwDrawTool.clearDrawData()
        // 清除绘制
        drawTool && drawTool.clearDrawData()
      }
    }
  })
}
// 提交修改
const submitModify = () => {
  if (!form.value.planname) {
    ElMessage.error("规划任务名称必填")
    return
  }
  ruleFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const { success } = await UpdateForestResourcesPrepared({
        ...form1.value,
        fileguid: fileGuid.value,
        planid: form.value.planid,
        createuser: user.value.userName,
        createtime: dayjs().format("YYYY-MM-DD HH:mm:ss")
      })
      if (success) {
        ElMessage.success("编辑成功")
      } else {
        ElMessage.error("编辑失败")
      }
      proxy.$mitt.emit("refresh-list")
      form.value = {}
      form1.value = {}
      // 清除绘制
      ghrwDrawTool && ghrwDrawTool.clearDrawData()
      // 清除绘制
      drawTool && drawTool.clearDrawData()
      emit("update:type", "")
      nextTick(() => {
        back()
      })
    }
  })
}
// 打开修改
const openModify = () => {
  // 清除规划任务绘制
  ghrwDrawTool && ghrwDrawTool.clearDrawData()
  // 清除图层绘制
  drawTool && drawTool.clearDrawData()
  emit("update:type", "编辑")
}
const toChecked = () => {
  emit("update:type", "核查")
}
// 提交核查
const submitCheck = async () => {
  const { success } = await CheckForestResourcesPrepared({
    id: form1.value.id,
    treetypesfhc: form1.value.treetypesfhc,
    treetyperemark: form1.value.treetyperemark,
    numbertreesfhc: form1.value.numbertreesfhc,
    numbertreeremark: form1.value.numbertreeremark,
    plantwaysfhc: form1.value.plantwaysfhc,
    plantwayremark: form1.value.plantwayremark,
    checktime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    checkuser: user.value.userName,
    state: "已核查"
  })
  if (success) {
    ElMessage.success("核查成功")
  } else {
    ElMessage.error("核查失败")
  }
  proxy.$mitt.emit("refresh-list")
  emit("update:type", "")
  nextTick(() => {
    back()
  })
}
// 删除
const remove = () => {
  ElMessageBox.confirm("是否确认删除数据?", "", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      // proxy.$mitt.emit("refresh-list")
      // emit("update:type", "")
      // nextTick(() => {
      //   back()
      // })
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消删除"
      })
    })
}
let ghrwDrawTool: any = null
const createDrawTool = (type?: number) => {
  if (!type) type = 1
  if (type === 1) {
    if (!ghrwDrawTool)
      ghrwDrawTool = new DrawOLShape(toRaw(props.map), {
        title: "绘制规划任务图层",
        zIndex: 20,
        single: true, // 只允许单次绘制
        style: {
          strokeWidth: 2,
          strokeColor: "rgba(38, 222, 129, 1)",
          fillColor: "rgba(38, 222, 129, 0.3)",
          lineDash: [10, 10]
        }
      })
  }
  if (type === 2) {
    if (!drawTool)
      drawTool = new DrawOLShape(toRaw(props.map), {
        title: "绘制图层",
        zIndex: 21,
        clearable: true,
        single: true, // 只允许单次绘制
        select: true,
        modify: 1,
        style: {
          strokeWidth: 2,
          strokeColor: "rgba(230, 126, 34, 1)",
          fillColor: "rgba(230, 126, 34, 0.3)",
          lineDash: [10, 10]
        }
      })
  }
}
let drawTool: any = null
const drawHandle = (type: string) => {
  if (type === "draw") {
    createDrawTool(2)
    drawTool.drawMultiPolygon({
      end: (feature: any) => {
        if (feature) {
          form1.value.xbarea = DrawOLShape.calculateArea(feature, "mu").area.toFixed(2)
          form1.value.geom = new WKT().writeFeature(feature)
        }
      },
      modifyend: (eve: any) => {
        if (eve.features.length > 0) {
          form1.value.xbarea = DrawOLShape.calculateArea(eve.features[0], "mu").area.toFixed(2)
          form1.value.geom = new WKT().writeFeature(eve.features[0])
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
      form1.value.xbarea = ""
      form1.value.geom = ""
    }
  }
  if (type === "cancel") {
    drawTool && drawTool.destroy()
    drawTool = null
    form1.value.xbarea = ""
    form1.value.geom = ""
  }
}
const toBoolean = (value: any): boolean => {
  return !(value === null || value === undefined || value === "" || value === "false" || value === false)
}
watch(
  () => props.type,
  async (val) => {
    if (drawTool && val !== "核查") {
      drawTool.destroy()
      drawTool = null
    }
    // 获得规划任务列表
    if (ghrwList.value.length === 0) {
      await getGhrwList()
    }
    if (val === "新增") {
      form.value = {}
      form1.value = {}
      createDrawTool() // 绘制规划任务
      createDrawTool(2) // 绘制图层
    }
    if (val === "查看" || val === "编辑") {
      createDrawTool() // 绘制规划任务
      createDrawTool(2) // 绘制图层
      // 将‘false’转换为布尔值
      props.data.numbertreesfhc = toBoolean(props.data.numbertreesfhc)
      props.data.plantwaysfhc = toBoolean(props.data.plantwaysfhc)
      props.data.treetypesfhc = toBoolean(props.data.treetypesfhc)
      form1.value = JSON.parse(JSON.stringify(props.data))
      const find = ghrwList.value.find((item: any) => item.id === form1.value.planid)
      // 填充数据
      if (find) {
        form.value.planname = find.planname
        form.value.planid = find.id
        form.value.plantype = typeList.find((item: any) => item.value === find.plantype)?.label
        form.value.years = find.years
        form.value.planarea = find.planarea
        form.value.planperimeter = find.planperimeter
        form.value.amount = find.amount
        form.value.content = find.content
        form.value.geom = find.geom
      }
      if (form.value.geom) {
        const feature: any = new WKT().readFeature(form.value.geom)
        ghrwDrawTool.initInteractions([feature], false, false, false, true)
      }
      if (form1.value.geom) {
        const feature: any = new WKT().readFeature(form1.value.geom)
        const featureExtents = feature.getGeometry().getExtent()!
        if (featureExtents?.[0] !== "Infinity") {
          // 跳转view
          props.map.getView().fit(featureExtents, {
            duration: 1000
          })
        }

        if (val === "查看") {
          drawTool.initInteractions([feature], false, false, false, true)
        } else if (val === "编辑") {
          drawTool.initInteractions([feature], true, true, false, true, {
            modifyend: (eve: any) => {
              if (eve.features.length > 0) {
                form1.value.xbarea = DrawOLShape.calculateArea(eve.features[0], "mu").area.toFixed(2)
                form1.value.geom = new WKT().writeFeature(eve.features[0])
              }
            }
          })
        }
      }
      if (form1.value.filelist) {
        fileGuid.value = form1.value.fileguid
        uploadFiles.value = form1.value.filelist.map((item: any) => {
          return {
            url: "/statisUrl" + item.filepath,
            name: item.filename
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
onMounted(() => {
  // getGhrwList()
})
onUnmounted(() => {
  if (ghrwDrawTool) {
    ghrwDrawTool.destroy()
    ghrwDrawTool = null
  }
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
          :model="form1"
          :rules="rules"
          ref="ruleFormRef"
          label-width="120px"
          label-position="left"
        >
          <div class="info-title">规划任务信息</div>
          <el-form-item
            label="规划任务名称"
            required
          >
            <el-select
              v-model="form.planname"
              placeholder="请选择"
              popper-class="custom-select-popper"
              @change="changeGhrw"
            >
              <el-option
                v-for="item in ghrwList"
                :key="item.id"
                :label="item.planname"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="类型"
            prop="plantype"
          >
            <el-input
              v-model="form.plantype"
              placeholder="自动填充"
              readonly
            />
          </el-form-item>
          <el-form-item label="年份">
            <el-input
              v-model="form.years"
              placeholder="自动填充"
              readonly
            />
          </el-form-item>
          <el-form-item label="金额">
            <el-input
              v-model="form.amount"
              placeholder="自动填充"
              readonly
            />
          </el-form-item>
          <el-form-item label="规划面积">
            <el-input
              v-model="form.planarea"
              placeholder="自动填充"
              readonly
            >
              <template #append>亩</template>
            </el-input>
          </el-form-item>
          <el-form-item label="规划周长">
            <el-input
              v-model="form.planperimeter"
              placeholder="自动填充"
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
              placeholder="自动填充"
              type="textarea"
              resize="none"
              :rows="3"
              readonly
            />
          </el-form-item>
          <div class="info-title">种植信息</div>
          <el-form-item
            label="小斑号"
            prop="xbh"
          >
            <el-input
              v-model="form1.xbh"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
          <el-form-item
            label="种植树种"
            prop="treetype"
          >
            <el-select
              v-model="form1.treetype"
              placeholder="请选择"
              popper-class="custom-select-popper"
            >
              <el-option
                v-for="item in treeList[form.plantype]"
                :key="item.label"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="小斑面积"
            prop="xbarea"
          >
            <el-input
              v-model="form1.xbarea"
              placeholder="自动填充"
              readonly
            >
              <template #append>亩</template>
            </el-input>
          </el-form-item>
          <el-form-item
            v-if="form.plantype === '新造林'"
            label="种植密度"
            prop="numbertree"
          >
            <el-input
              v-model="form1.numbertree"
              placeholder="株数=密度*3"
              type="number"
              clearable
            >
              <template #prepend>每亩</template>
              <template #append
                >株，共{{ form1.numbertree ? Math.floor(form1.numbertree * form1.xbarea) : 0 }}株</template
              >
            </el-input>
          </el-form-item>
          <el-form-item
            label="种植方式"
            prop="plantway"
          >
            <el-select
              v-model="form1.plantway"
              placeholder="请选择"
              popper-class="custom-select-popper"
            >
              <el-option
                v-for="item in wayList[form.plantype]"
                :key="item.label"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </el-form-item>
          <div class="info-title">时间安排</div>
          <el-form-item
            label="开始时间"
            prop="starttime"
          >
            <el-date-picker
              style="width: 100%"
              popper-class="custom-datepicker-popper"
              v-model="form1.starttime"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择开始时间"
              align="right"
            />
          </el-form-item>
          <el-form-item
            label="预计完成时间"
            prop="yjfinishtime"
          >
            <el-date-picker
              style="width: 100%"
              popper-class="custom-datepicker-popper"
              v-model="form1.yjfinishtime"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择预计完成时间"
              align="right"
            />
          </el-form-item>
          <el-form-item label="关键节点">
            <el-date-picker
              style="width: 100%"
              popper-class="custom-datepicker-popper"
              v-model="form1.keynodes"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择关键节点"
              align="right"
            />
          </el-form-item>
          <div class="info-title">附件</div>
          <!-- <FileUpload /> -->
          <Upload
            v-model:model-value="uploadFiles"
            accept="*"
            :params="{ guid: fileGuid }"
            :size="80"
            :auto-upload="false"
            :show-upload-btn="true"
            :limit="10"
            :multiple="true"
            :edit="false"
            action="/api/Img/UploadPicToFile"
            @success="uploadSuccess"
            @error="uploadError"
            @remove="uploadRemove"
          />
          <div
            v-show="type !== '编辑'"
            tyle="margin-left: 25px"
          >
            <el-checkbox
              v-model="isAddAgain"
              label="继续创建下一条"
            />
          </div>
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
          <div @click="back">返回</div>
        </div>
      </el-scrollbar>
    </div>
    <div
      v-dragable
      class="draw-tool"
    >
      <div class="tool-title">绘制工具</div>
      <div class="tool-box v-dragable--disable">
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
      <div class="tool-text">面积：{{ form1.xbarea }}亩</div>
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
          <img
            class="checkIcon"
            :src="
              form1.state === '已核查'
                ? $fun.getImg('forestResources/checked_icon.svg')
                : $fun.getImg('forestResources/unChecked_icon.svg')
            "
            alt=""
          />
          <div class="info-title">规划任务信息</div>
          <div class="info-box">
            <div class="item">
              <div class="label">规划任务名称:</div>
              <div class="value">{{ form.planname }}</div>
            </div>
            <div class="item">
              <div class="label">类型:</div>
              <div class="value">{{ form.plantype }}</div>
            </div>
            <div class="item">
              <div class="label">年份:</div>
              <div class="value">{{ form.years }}</div>
            </div>
            <div class="item">
              <div class="label">金额:</div>
              <div class="value">{{ form.amount }}</div>
            </div>
            <div class="item">
              <div class="label">规划面积:</div>
              <div class="value">{{ form.planarea }}km</div>
            </div>
            <div class="item">
              <div class="label">规划周长:</div>
              <div class="value">{{ form.planperimeter }}个</div>
            </div>
            <div class="item row-item">
              <div class="label">内容:</div>
              <div class="value">{{ form.content }}</div>
            </div>
          </div>
          <div class="info-title">种植信息</div>
          <div class="info-box">
            <div class="item">
              <div class="label">小班号:</div>
              <div class="value">{{ form1.xbh }}</div>
            </div>
            <div class="item">
              <div class="label">种植树种:</div>
              <div class="value">{{ form1.treetype }}</div>
            </div>
            <div class="item">
              <div class="label">小班面积:</div>
              <div class="value">{{ form1.xbarea }}</div>
            </div>
            <div
              v-if="form.plantype === '新造林'"
              class="item"
            >
              <div class="label">种植密度:</div>
              <div class="value">{{ form1.numbertree }}个</div>
            </div>
            <div class="item row-item">
              <div class="label">方式:</div>
              <div class="value">{{ form1.plantway }}</div>
            </div>
          </div>
          <div class="info-title">时间安排</div>
          <div class="info-box">
            <div class="item">
              <div class="label">开始时间:</div>
              <div class="value">{{ form1.starttime }}</div>
            </div>
            <div class="item">
              <div class="label">预计完成时间:</div>
              <div class="value">{{ form1.yjfinishtime }}</div>
            </div>
            <div class="item">
              <div class="label">关键节点:</div>
              <div class="value">{{ form1.keynodes }}</div>
            </div>
          </div>
          <div class="info-title">附件</div>
          <div class="info-box">
            <div class="item">
              <!-- <div class="label">无</div> -->
              <!-- <div class="value">{{ form.xbh }}</div> -->
              <div
                v-if="form1?.filelist?.length > 0"
                class="img-box"
              >
                <el-image
                  v-for="item in form1.filelist"
                  :key="item.id"
                  :src="'/statisUrl/' + item.filepath"
                  alt=""
                  fit="fill"
                >
                  <template #placeholder>
                    <el-skeleton
                      class="image-placeholder"
                      style="width: 100%; height: 100%"
                      animated
                    >
                      <template #template>
                        <el-skeleton-item
                          variant="image"
                          style="width: 100%; height: 100%"
                        />
                      </template>
                    </el-skeleton>
                  </template>
                  <template #error>
                    <div class="image-slot">
                      <i-ep-picture />
                      <span style="margin-left: 3px">暂无预览</span>
                    </div>
                  </template></el-image
                >
              </div>
              <div
                v-else
                class="label"
              >
                无
              </div>
            </div>
          </div>
          <template v-if="form1.state === '已核查'">
            <div class="info-title">种植信息完成情况</div>
            <div
              class="info-box"
              style="margin: 10px 0"
            >
              <div class="row row1">
                <div class="clum">信息</div>
                <div class="clum">标准</div>
                <div class="clum clum1">是否完成</div>
                <div class="clum">备注</div>
              </div>
              <div class="row">
                <div class="clum">种植树种</div>
                <div
                  class="clum"
                  :title="form1.treetype"
                >
                  {{ form1.treetype }}
                </div>
                <div class="clum clum1">
                  <el-switch
                    v-model="form1.treetypesfhc"
                    disabled
                  />
                </div>
                <div class="clum">
                  <el-input
                    v-model="form1.treetyperemark"
                    placeholder=""
                    size="small"
                    disabled
                    clearable
                  >
                  </el-input>
                </div>
              </div>
              <div
                v-if="form1.plantype === '新造林'"
                class="row"
              >
                <div class="clum">种植密度</div>
                <div
                  class="clum"
                  :title="form1.numbertree"
                >
                  {{ form1.numbertree }}
                </div>
                <div class="clum clum1">
                  <el-switch
                    v-model="form1.numbertreesfhc"
                    disabled
                  />
                </div>
                <div class="clum">
                  <el-input
                    v-model="form1.numbertreeremark"
                    placeholder=""
                    size="small"
                    clearable
                    disabled
                  >
                  </el-input>
                </div>
              </div>
              <div class="row">
                <div class="clum">种植方式</div>
                <div
                  class="clum"
                  :title="form1.plantway"
                >
                  {{ form1.plantway }}
                </div>
                <div class="clum clum1">
                  <el-switch
                    v-model="form1.plantwaysfhc"
                    disabled
                  />
                </div>
                <div class="clum">
                  <el-input
                    v-model="form1.plantwayremark"
                    placeholder=""
                    size="small"
                    clearable
                    disabled
                  >
                  </el-input>
                </div>
              </div>
            </div>
            <div class="info-box">
              <div class="item">
                <div
                  class="label"
                  style="width: auto"
                >
                  核查人员:
                </div>
                <div class="value">{{ user.userName }}</div>
              </div>
              <div class="item">
                <div
                  class="label"
                  style="width: auto"
                >
                  核查时间:
                </div>
                <div class="value">{{ dayjs().format("YYYY-MM-DD HH:mm:ss") }}</div>
              </div>
            </div>
          </template>
        </div>

        <div
          v-if="form1.state !== '已核查'"
          class="btns"
        >
          <div @click="openModify">编辑</div>
          <div @click="toChecked">去核查</div>
        </div>
      </el-scrollbar>
    </div>
  </div>
  <!-- 核查 -->
  <div
    v-else-if="type === '核查'"
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
          <div class="info-title">规划任务信息</div>
          <div class="info-box">
            <div class="item">
              <div class="label">规划任务名称:</div>
              <div class="value">{{ form.planname }}</div>
            </div>
            <div class="item">
              <div class="label">类型:</div>
              <div class="value">{{ form.plantype }}</div>
            </div>
            <div class="item">
              <div class="label">年份:</div>
              <div class="value">{{ form.years }}</div>
            </div>
            <div class="item">
              <div class="label">金额:</div>
              <div class="value">{{ form.amount }}</div>
            </div>
            <div class="item">
              <div class="label">规划面积:</div>
              <div class="value">{{ form.planarea }}km</div>
            </div>
            <div class="item">
              <div class="label">规划周长:</div>
              <div class="value">{{ form.planperimeter }}个</div>
            </div>
            <div class="item row-item">
              <div class="label">内容:</div>
              <div class="value">{{ form.content }}</div>
            </div>
          </div>
          <div class="info-title">时间安排</div>
          <div class="info-box">
            <div class="item">
              <div class="label">开始时间:</div>
              <div class="value">{{ form1.starttime }}</div>
            </div>
            <div class="item">
              <div class="label">预计完成时间:</div>
              <div class="value">{{ form1.yjfinishtime }}</div>
            </div>
            <div class="item">
              <div class="label">关键节点:</div>
              <div class="value">{{ form1.keynodes }}</div>
            </div>
          </div>
          <div class="info-title">附件</div>
          <div
            class="info-box"
            style="margin: 10px 0"
          >
            <div class="item">
              <!-- <div class="label">无</div> -->
              <!-- <div class="value">{{ form.xbh }}</div> -->
              <div
                v-if="form1?.filelist?.length > 0"
                class="img-box"
              >
                <el-image
                  v-for="item in form1.filelist"
                  :key="item.id"
                  :src="'/statisUrl/' + item.filepath"
                  alt=""
                  fit="fill"
                >
                  <template #placeholder>
                    <el-skeleton
                      class="image-placeholder"
                      style="width: 100%; height: 100%"
                      animated
                    >
                      <template #template>
                        <el-skeleton-item
                          variant="image"
                          style="width: 100%; height: 100%"
                        />
                      </template>
                    </el-skeleton>
                  </template>
                  <template #error>
                    <div class="image-slot">
                      <i-ep-picture />
                      <span style="margin-left: 3px">暂无预览</span>
                    </div>
                  </template></el-image
                >
              </div>
              <div
                v-else
                class="label"
              >
                无
              </div>
            </div>
          </div>

          <div class="info-title">种植信息完成情况</div>
          <div
            class="info-box"
            style="margin: 10px 0"
          >
            <div class="row row1">
              <div class="clum">信息</div>
              <div class="clum">标准</div>
              <div class="clum clum1">是否完成</div>
              <div class="clum">备注</div>
            </div>
            <div class="row">
              <div class="clum">种植树种</div>
              <div class="clum">{{ form1.treetype }}</div>
              <div class="clum clum1">
                <el-switch v-model="form1.treetypesfhc" />
              </div>
              <div class="clum">
                <el-input
                  v-model="form1.treetyperemark"
                  placeholder=""
                  size="small"
                  clearable
                >
                </el-input>
              </div>
            </div>
            <div
              v-if="form1.plantype === '新造林'"
              class="row"
            >
              <div class="clum">种植密度</div>
              <div class="clum">{{ form1.numbertree }}</div>
              <div class="clum clum1">
                <el-switch v-model="form1.numbertreesfhc" />
              </div>
              <div class="clum">
                <el-input
                  v-model="form1.numbertreeremark"
                  placeholder=""
                  size="small"
                  clearable
                >
                </el-input>
              </div>
            </div>
            <div class="row">
              <div class="clum">种植方式</div>
              <div class="clum">{{ form1.plantway }}</div>
              <div class="clum clum1">
                <el-switch v-model="form1.plantwaysfhc" />
              </div>
              <div class="clum">
                <el-input
                  v-model="form1.plantwayremark"
                  placeholder=""
                  size="small"
                  clearable
                >
                </el-input>
              </div>
            </div>
          </div>
          <div class="info-box">
            <div class="item">
              <div
                class="label"
                style="width: auto"
              >
                核查人员:
              </div>
              <div class="value">{{ user.userName }}</div>
            </div>
            <div class="item">
              <div
                class="label"
                style="width: auto"
              >
                核查时间:
              </div>
              <div class="value">{{ dayjs().format("YYYY-MM-DD HH:mm:ss") }}</div>
            </div>
          </div>
        </div>
        <div class="btns">
          <div @click="submitCheck">提交</div>
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

  :deep(.el-switch__core) {
    background: transparent !important;
    border: 1px solid #84d3e7 !important;
  }

  :deep(.el-switch.is-checked .el-switch__core .el-switch__action) {
    background: #84d3e7 !important;
  }

  :deep(.el-switch.is-checked .el-switch__core) {
    border-color: #84d3e7 !important;
    background: var(--el-switch-on-color) !important;
  }

  :deep(.el-switch__core .el-switch__action) {
    background: #84d3e7 !important;
  }
  :deep(.el-checkbox__inner) {
    background: #0c284db2;
    border: 1px solid #ffffff26;
  }
  :deep(.el-checkbox__label) {
    color: #01b3ff65;
  }

  :deep(.form) {
    height: calc(100% - 48px);
    padding: 10px 20px;

    .el-form-item {
      margin-bottom: 18px;
    }
    .el-input.is-disabled {
      .el-input__wrapper {
        background-color: #1a2d3f;
      }
    }

    .is-disabled.el-select__wrapper {
      background-color: #1a2d3f;
    }

    .el-form-item__label {
      color: #beccdc;
      justify-content: flex-end;
    }

    .el-input__wrapper,
    .el-select__wrapper {
      background-color: #0c284db2;
      box-shadow: none;
      border: 1px solid #ffffff15;
      border-radius: 0;
      color: #ffffff65;
    }

    .el-input__inner {
      order: -1;
    }

    .el-input-group__prepend,
    .el-input-group__append {
      padding: 0 10px;
      box-shadow: none;
      background-color: #53616d;
      color: #bac0c5;
    }

    .el-textarea__inner {
      box-shadow: none;
      background-color: #0c284db2;
      border: 1px solid #ffffff15;
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
      position: relative;

      .checkIcon {
        position: absolute;
        top: 0px;
        right: 10px;
      }

      .info-box {
        // display: flex;
        flex-wrap: wrap;
        overflow: hidden;

        .item {
          display: flex;
          width: 100%;
          line-height: 2em;
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
          .img-box {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            .el-image {
              width: 100px;
              height: 100px;
              .image-slot {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                border: 1px dashed #999;
                color: var(--el-text-color-secondary);
                font-size: 0.9375vw;
              }
            }
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

        .row {
          display: flex;
          justify-content: space-evenly;
          margin-bottom: 10px;
          align-items: center;
          height: 32px;
          line-height: 32px;
          color: #beccdc;

          .clum {
            width: 18%;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .clum1 {
            width: 24%;
          }
        }

        .row1 {
          background: #194570;
          border-radius: 5px;
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

  .info-title {
    color: #2cfefe;
    font-size: 14px;
    margin-bottom: 10px;
    padding-left: 24px;
    background: url("@/assets/images/forestResources/edit-title-bg.png") no-repeat left center;
  }

  .btns {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
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
