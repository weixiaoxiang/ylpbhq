<template>
  <!-- 新增修改对话框 -->
  <Dialog
    v-model="show"
    :title="title"
    w="900px"
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
        label-width="auto"
      >
        <el-form-item
          label="监控名称："
          prop="mc"
        >
          <el-input
            v-model="form.mc"
            :disabled="true"
            placeholder="请输入名称"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="设备id："
          prop="deviceid"
        >
          <el-input
            v-model="form.deviceid"
            :disabled="true"
            placeholder="请输入设备id"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="经度："
          prop="lon"
        >
          <el-input
            v-model="form.lon"
            placeholder="请输入经度"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="纬度："
          prop="lat"
          class="position"
        >
          <el-input
            v-model="form.lat"
            placeholder="请输入纬度"
            :disabled="true"
          ></el-input>
          <!-- <MapLocation class="Icon" style="margin-left: 5px" @click="positionShow = true" /> -->
        </el-form-item>
        <el-form-item label="设备国标编号：">
          <el-input
            v-model="form.deviceid"
            placeholder="请输入"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="类别："
          prop="remark"
        >
          <el-select
            v-model="form.remark"
            :teleported="false"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="item in optionType"
              :label="item.name"
              :value="item.name"
              :key="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属保护区：">
          <el-input
            v-model="form.ssreserve"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="编号：">
          <el-input
            v-model="form.bh"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="地址：">
          <el-input
            v-model="form.address"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="描述：">
          <el-input
            v-model="form.describeinfo"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="IP：">
          <el-input
            v-model="form.ip"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="端口：">
          <el-input
            v-model="form.port"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="生产厂商：">
          <el-input
            v-model="form.manufacturer"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="型号：">
          <el-input
            v-model="form.equipmentmodel"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="固件版本：">
          <el-input
            v-model="form.firmware"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="传输协议（UDP/TCP）：">
          <el-input
            v-model="form.transport"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="数据流传输模式：">
          <el-input
            v-model="form.streammode"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="维护单位：">
          <el-input
            v-model="form.whdw"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="设备状态：">
          <el-radio-group v-model="form.statu">
            <el-radio label="在线">在线</el-radio>
            <el-radio label="离线">离线</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设备类型：">
          <el-radio-group v-model="form.remark2">
            <el-radio label="枪机"></el-radio>
            <el-radio label="球机"></el-radio>
          </el-radio-group>
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
    <Map
      v-if="positionShow"
      @closeMap="closeMap"
      :lonlat="[form.lon, form.lat]"
    ></Map>
  </Dialog>
</template>

<script setup lang="ts">
import { videoMonitorApi } from "@/api/SystemManage/videoMonitor"
import Dialog from "@/components/Dialog/index.vue"
import Map from "@/components/Map/index.vue"
const props = defineProps({
  optionType: {
    type: Array as any,
    default: () => {
      return []
    }
  }
})
const positionShow = ref(false)
const show = ref(false)
const loadForm = ref(false)
const loading = ref(false)
const formRef = ref()
const title = ref("添加")
//表单数据
const form = ref<any>({
  mc: "",
  type: "",
  deviceid: "",
  lon: "",
  lat: ""
})
//校验规则
const rules = {
  mc: [
    { required: true, trigger: "blur", message: "请输入监控名称" },
    { min: 0, max: 50, message: "最大50字符", trigger: "blur" }
  ],
  remark: [{ required: true, trigger: "change", message: "请选择类别" }],
  deviceid: [{ required: true, trigger: "blur", message: "请输入设备id" }],
  lon: [{ required: true, trigger: ["blur", "change"], message: "请输入经度" }],
  lat: [{ required: true, trigger: ["blur", "change"], message: "请输入纬度" }]
}
/** 打开弹窗 */
const openDialog = async (type: string, row?: any) => {
  show.value = true
  title.value = type
  clearForm()
  // 修改时，设置数据
  if (row) {
    form.value = Object.assign({}, row)
  }
  console.log(form.value)
}
defineExpose({ openDialog }) // 提供 open 方法，用于打开弹窗
// 清空表单
const clearForm = () => {
  formRef.value?.resetFields()
  form.value = {
    mc: "",
    type: "",
    deviceid: "",
    lon: "",
    lat: ""
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
  formRef.value.validate((valid) => {
    if (valid) {
      try {
        let query: any = Object.assign({}, form.value)
        console.log(query)
        loading.value = true
        if (title.value === "新增") {
          videoMonitorApi.add(query).then((res) => {
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
        } else if (title.value === "编辑") {
          videoMonitorApi.update(query).then((res) => {
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
        }
      } finally {
        loading.value = false
      }
    }
  })
}

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
  min-height: 100px;
  .position {
    position: relative;
    .Icon {
      position: absolute;
      right: -24px;
      width: 1.2em;
      height: 1.2em;
      color: #333;
      cursor: pointer;
    }
  }
  :deep(.el-form) {
    .el-form-item {
      .el-form-item__content {
        width: 160px;
      }
    }
  }
}
</style>
