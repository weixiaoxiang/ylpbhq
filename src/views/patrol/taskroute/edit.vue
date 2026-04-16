<script lang="ts" setup>
import { Addxh_taskclockin, Addxh_taskroute, Updatexh_taskclockin, Updatexh_taskroute, Deletexh_taskroute } from "@/api"
interface Props {
  type?: string
  drawData?: any
  data: any
}
const props = withDefaults(defineProps<Props>(), {
  type: "",
  drawData: {},
  data: {}
})
const emit = defineEmits<{
  "update:show": [boolean]
  "update:type": [string]
}>()
const proxy = getCurrentInstance()!.proxy as any
const { jgList } = storeToRefs(useConfigStore())

const back = () => {
  resetForm()
  if (props.type === "编辑路线") {
    emit("update:type", "查看路线")
  } else {
    emit("update:show", false)
  }
}
const ruleFormRef = ref()
const rules = ref({
  mc: [
    {
      required: true,
      message: "路线名称必填",
      trigger: "blur"
    }
  ],
  bh: [
    {
      required: true,
      message: "路线编号必填",
      trigger: "blur"
    }
  ],
  ssorg: [
    {
      required: true,
      message: "所属机构必填",
      trigger: "change"
    }
  ],
  lxcd: [
    {
      required: true,
      message: "路线长度必填",
      trigger: "blur"
    }
  ],
  startcoor: [
    {
      required: true,
      message: "起点坐标必填",
      trigger: "blur"
    }
  ],
  endcoor: [
    {
      required: true,
      message: "终点坐标必填",
      trigger: "blur"
    }
  ]
})
const form = ref<any>({
  mc: "",
  bh: "",
  ssorg: undefined,
  startmc: "",
  startlon: "",
  startlat: "",
  endmc: "",
  endlon: "",
  endlat: "",
  lxcd: "",
  pointcount: 0,
  points: [],
  geom: ""
})
// 重置
const resetForm = () => {
  if (props.type === "新增路线" || props.type === "查看路线") {
    form.value = {
      mc: "",
      bh: "",
      ssorg: undefined,
      startmc: "",
      startlon: "",
      startlat: "",
      endmc: "",
      endlon: "",
      endlat: "",
      lxcd: "",
      pointcount: 0,
      points: [],
      geom: ""
    }
  }
  if (props.type === "编辑路线") {
    form.value = orginData
  }
  ruleFormRef?.value?.resetFields()
}
// 提交新增
const submit = () => {
  ruleFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const { response, success } = await Addxh_taskroute({
        mc: form.value.mc,
        bh: form.value.bh,
        ssorg: form.value.ssorg,
        startmc: form.value.startmc,
        startlon: form.value.startlon,
        startlat: form.value.startlat,
        endmc: form.value.endmc,
        endlon: form.value.endlon,
        endlat: form.value.endlat,
        lxcd: form.value.lxcd,
        pointcount: form.value.pointcount,
        geom: form.value.geom
      })
      if (success) {
        ElMessage.success("路线新增成功")
        const list: any = []
        form.value.points.forEach(async (item: any, index: any) => {
          list.push({
            mc: "打卡点" + (index + 1),
            lon: item.coor[0],
            lat: item.coor[1],
            lxid: response
          })
        })
        await Addxh_taskclockin(list)
      } else {
        ElMessage.error("路线新增失败")
      }
      resetForm()
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
      const { success } = await Updatexh_taskroute({
        Id: form.value.Id,
        mc: form.value.mc,
        bh: form.value.bh,
        ssorg: form.value.ssorg,
        startmc: form.value.startmc,
        startlon: form.value.startlon,
        startlat: form.value.startlat,
        endmc: form.value.endmc,
        endlon: form.value.endlon,
        endlat: form.value.endlat,
        lxcd: form.value.lxcd,
        pointcount: form.value.pointcount,
        geom: form.value.geom
      })
      if (success) {
        form.value.points.forEach(async (item: any) => {
          const data = orginData.points.find((i: any) => i.Id === item.id)
          const point = {
            mc: data.mc,
            lon: item.coor[0],
            lat: item.coor[1],
            lxid: data.lxid,
            Id: data.Id
          }
          await Updatexh_taskclockin(point)
        })
        ElMessage.success("路线修改成功")
      } else {
        ElMessage.error("路线修改失败")
      }
      proxy.$mitt.emit("refresh-list")
      emit("update:type", "")
      nextTick(() => {
        back()
      })
    }
  })
}
// 打开修改
const openModify = () => {
  emit("update:type", "编辑路线")
}
// 删除
const remove = () => {
  ElMessageBox.confirm("是否确认删除数据?", "", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      // jsonDel("routes", form.value.Id)
      const { success } = await Deletexh_taskroute({ Id: form.value.Id })
      if (success) {
        ElMessage.success("路线删除成功")
      } else {
        ElMessage.error("路线删除失败")
      }
      emit("update:type", "")
      proxy.$mitt.emit("refresh-list")
      back()
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消删除"
      })
    })
}
// 监听父组件传递的数据(drawBar组件的数据)
watch(
  () => props.drawData,
  (val) => {
    form.value.lxcd = val.cd || ""
    if (val.line) {
      form.value.geom = val.line.map((item: any) => item.join(" ")).join(",")
      const coors: any = val.line
      form.value.startcoor = coors[0]
      form.value.startlon = coors[0][0]
      form.value.startlat = coors[0][1]
      form.value.endcoor = coors[coors.length - 1]
      form.value.endlon = coors[coors.length - 1][0]
      form.value.endlat = coors[coors.length - 1][1]
    } else {
      form.value.geom = ""
      form.value.startcoor = ""
      form.value.startlon = ""
      form.value.startlat = ""
      form.value.endcoor = ""
      form.value.endlon = ""
      form.value.endlat = ""
    }
    form.value.points = val.points || [] // 点
    form.value.pointcount = val.points?.length || 0
  },
  {
    deep: true
  }
)
let orginData: any
watch(
  () => props.data,
  (val) => {
    form.value = JSON.parse(JSON.stringify(val))
    if (form.value.geom.indexOf("MULTILINESTRING") !== -1) {
      form.value.geom = form.value.geom.replace("MULTILINESTRING((", "").replace("))", "")
    } else if (form.value.geom.indexOf("LINESTRING") !== -1) {
      form.value.geom = form.value.geom.replace("LINESTRING(", "").replace(")", "")
    }
    form.value.startcoor = val.startlon + "," + val.startlat
    form.value.endcoor = val.endlon + "," + val.endlat
    form.value.ssorgmc = findNodeById(jgList.value, val.ssorg)?.Name
    orginData = JSON.parse(JSON.stringify(form.value))
  },
  {
    deep: true
  }
)
</script>
<template>
  <div
    v-if="type !== '查看路线'"
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
            label="路线名称"
            prop="mc"
          >
            <el-input
              v-model="form.mc"
              placeholder="请输入路线名称"
            />
          </el-form-item>
          <el-form-item
            label="线路编号"
            prop="bh"
          >
            <el-input
              v-model="form.bh"
              placeholder="请输入线路编号"
            />
          </el-form-item>
          <el-form-item
            label="所属机构"
            prop="ssorg"
          >
            <el-tree-select
              v-model="form.ssorg"
              :data="jgList"
              :props="{ label: 'Name', value: 'Id', children: 'Children' }"
              :render-after-expand="false"
              :check-on-click-node="true"
              :default-expand-all="true"
              clearable
            />
          </el-form-item>
          <el-form-item
            label="路线长度"
            prop="lxcd"
          >
            <el-input
              v-model="form.lxcd"
              placeholder="路线长度自动填充"
              readonly
            >
              <template #append>km</template>
            </el-input>
          </el-form-item>
          <el-form-item label="打卡点数">
            <el-input
              v-model="form.pointcount"
              placeholder="打卡点数自动填充"
              readonly
            >
              <template #append>个</template>
            </el-input>
          </el-form-item>
          <el-form-item label="起点名称">
            <el-input
              v-model="form.startmc"
              placeholder="请输入起点名称"
            />
          </el-form-item>
          <el-form-item label="终点名称">
            <el-input
              v-model="form.endmc"
              placeholder="请输入终点名称"
            />
          </el-form-item>
          <el-form-item
            label="起点坐标"
            prop="startcoor"
          >
            <el-input
              v-model="form.startcoor"
              placeholder="起点坐标自动填充"
              readonly
            />
          </el-form-item>
          <el-form-item
            label="终点坐标"
            prop="endcoor"
          >
            <el-input
              v-model="form.endcoor"
              placeholder="终点坐标自动填充"
              readonly
            />
          </el-form-item>
        </el-form>
        <div class="btns">
          <div @click="resetForm">重置</div>
          <div
            v-if="type === '新增路线'"
            @click="submit"
          >
            提交
          </div>
          <div
            v-if="type === '编辑路线'"
            @click="submitModify"
          >
            提交编辑
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
  <div
    v-else
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
        <div class="con">
          <div class="item">
            <div class="label">路线名称:</div>
            <div class="value">{{ form.mc }}</div>
          </div>
          <div class="item">
            <div class="label">线路编号:</div>
            <div class="value">{{ form.bh }}</div>
          </div>
          <div class="item">
            <div class="label">所属机构:</div>
            <div class="value">{{ form.ssorgmc }}</div>
          </div>
          <div class="item">
            <div class="label">路线长度(km):</div>
            <div class="value">{{ form.lxcd }}</div>
          </div>
          <div class="item">
            <div class="label">打卡点数(个):</div>
            <div class="value">{{ form.pointcount }}</div>
          </div>
          <div class="item">
            <div class="label">起点名称:</div>
            <div class="value">{{ form.startmc }}</div>
          </div>
          <div class="item">
            <div class="label">终点名称:</div>
            <div class="value">{{ form.endmc }}</div>
          </div>
          <div class="item">
            <div class="label">起点坐标:</div>
            <div class="value">{{ form.startlon + "," + form.startlat }}</div>
          </div>
          <div class="item">
            <div class="label">终点坐标:</div>
            <div class="value">{{ form.endlon + "," + form.endlat }}</div>
          </div>
        </div>
        <div class="btns">
          <div @click="openModify">编辑</div>
          <div @click="remove">删除</div>
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
  z-index: 1;
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
    .con {
      display: flex;
      flex-direction: column;
      padding: 5px 0;
      .item {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 15px 0;
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
    & > div:last-child {
      background: linear-gradient(to right, #5a8ab6, #375577);
    }
  }
}
</style>
<style lang="scss">
.custom-select-popper {
  /* 下拉框边框颜色 */
  &.el-select__popper.el-popper {
    border: 1px #18242c !important;
  }
  /* 下拉框padding颜色 */
  .el-select-dropdown__wrap {
    background-color: #18242c;
  }
  /* 下拉框背景颜色 */
  .el-select-dropdown__item {
    background: #18242c !important;
  }
  /* 下拉框文字颜色 */
  .el-select-dropdown__item {
    color: white;
    font-weight: 500;
  }
  /* 下拉款选项悬停背景 */
  .el-select-dropdown__item:hover {
    background: #141e26 !important;
  }
  /* 下拉框被选中的文字颜色 */
  .el-select-dropdown__item.is-selected {
    color: #1fa3df !important;
  }
  /* 倒三角样式 */
  .el-popper__arrow::before {
    border-color: #18242c !important;
    background: #18242c !important;
  }
}
</style>
