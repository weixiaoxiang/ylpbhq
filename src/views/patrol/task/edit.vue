<script lang="ts" setup>
import {
  Getxh_taskclockinByPage,
  Addxh_taskinfo,
  Updatexh_taskinfo,
  Addxh_taskmisson,
  GetMissonByTaskId,
  Deletexh_taskinfo,
  GetRwgl_Gjxq,
  GetTaskRouteByPage
} from "@/api"
import pointIcon from "@/assets/images/patrol/legend-icon4.png"
import startIcon from "@/assets/images/patrol/legend-icon1.png"
import endIcon from "@/assets/images/patrol/legend-icon2.png"
import editIcon from "@/assets/images/patrol/legend-icon4.png"
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
const { user, rwRouteList, ryList } = storeToRefs(useConfigStore())

const back = () => {
  resetForm()
  emit("update:show", false)
  emit("update:type", "")
  // 清空图层
  const layer = props.map
    .getLayers()
    .getArray()
    .find((item: any) => item.get("title") === "矢量图层")
  if (layer) {
    layer.getSource().clear()
  }
}
const ruleFormRef = ref()
const rules = ref({
  tasknumber: [
    {
      required: true,
      message: "任务编号必填",
      trigger: "blur"
    }
  ],
  taskheader: [
    {
      required: true,
      message: "任务名称必填",
      trigger: "blur"
    }
  ],
  lineid: [
    {
      required: true,
      message: "路线编号必填",
      trigger: "blur"
    }
  ],
  lxmc: [
    {
      required: true,
      message: "路线名称必填",
      trigger: "blur"
    }
  ],
  lxcd: [
    {
      required: true,
      message: "路线长度必填",
      trigger: "blur"
    }
  ],
  ds: [
    {
      required: true,
      message: "打卡点数必填",
      trigger: "blur"
    }
  ],
  zxsj: [
    {
      required: true,
      message: "执行时间必填",
      trigger: "blur"
    }
  ],
  tasktype: [
    {
      required: true,
      message: "任务类型必填",
      trigger: "blur"
    }
  ],
  zxrArr: [
    {
      required: true,
      message: "执行人员必填",
      trigger: "change"
    }
  ],
  type: [
    {
      required: true,
      message: "任务类型必填",
      trigger: "change"
    }
  ],
  intervaltime: [
    {
      required: true,
      message: "任务间隔必填",
      trigger: "blur"
    }
  ]
})
const form = ref<any>({
  statue: "启用" // 状态默认为启用
})

// 重置
const resetForm = () => {
  if (props.type === "新增任务") {
    form.value = {
      tasktype: "",
      patroltype: "",
      taskcontent: "",
      missionperson: 0,
      launchtime: "",
      lineid: undefined,
      statue: "启用", // 状态默认为启用
      mode: "",
      remark: ""
    }
  }
  if (props.type === "编辑任务" || props.type === "派发任务") {
    form.value = JSON.parse(JSON.stringify(props.data))
    date.value = ""
  }
  ruleFormRef?.value?.resetFields()
}
const changeRoute = (val: string) => {
  const route = rwRouteList.value.find((item: any) => item.value === val)
  form.value.lxmc = route.label
  form.value.lxcd = route.lxcd
  form.value.pointcount = route.pointcount
}
const getRouteById = async () => {
  const { response } = await GetTaskRouteByPage({ id: form.value.taskrouteid })
  let features = []
  if (response?.data?.length > 0) {
    const geom = response.data[0].geom
    const feature = new WKT().readFeature(geom)
    feature.setStyle([
      new Style({
        image: new Icon({
          src: startIcon,
          scale: 1.2,
          anchor: [0.5, 1]
        }),
        stroke: new Stroke({
          color: "#00FF9C",
          width: 3
        })
      }),
      new Style({
        image: new Icon({
          src: startIcon,
          scale: 1.2,
          anchor: [0.5, 1]
        }),
        geometry: (f: any) => {
          const coordinates = f.getGeometry()!.getCoordinates()[0]
          return new Point(coordinates[0])
        }
      }),
      new Style({
        image: new Icon({
          src: endIcon,
          scale: 1.2,
          anchor: [0.5, 1]
        }),
        geometry: (f: any) => {
          const coordinates = f.getGeometry()!.getCoordinates()?.[f.getGeometry()!.getCoordinates().length - 1]
          return new Point(coordinates[coordinates.length - 1])
        }
      })
    ])
    features.push(feature)
  }
  const { response: response1, success } = await Getxh_taskclockinByPage({ lxid: form.value.taskrouteid })
  if (success) {
    const points = response1.data
    points.forEach((item: any) => {
      const feature = new Feature({
        geometry: new Point([parseFloat(item.lon), parseFloat(item.lat)])
      })
      feature.setProperties(item)
      feature.setStyle(
        new Style({
          image: new Icon({
            src: pointIcon,
            scale: 1.2,
            anchor: [0.5, 1]
          })
        })
      )
      features.push(feature)
    })
  }
  const layer = props.map
    .getLayers()
    .getArray()
    .find((item: any) => item.get("title") === "矢量图层")
  if (layer) {
    layer.getSource().clear()
    layer.getSource().addFeatures(features)
    const extent = layer.getSource().getExtent()
    if (extent[0] !== Infinity) {
      props.map.getView().fit(layer.getSource().getExtent(), {
        padding: [20, 20, 20, 20],
        duration: 500
      })
    }
  }
}
// 提交新增
const submit = () => {
  ruleFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const { success } = await Addxh_taskinfo({
        taskheader: form.value.taskheader,
        tasknumber: form.value.tasknumber,
        taskcontent: form.value.taskcontent,
        lineid: form.value.lineid,
        statue: form.value.statue,
        missionperson: form.value.missionperson
      })
      if (success) {
        ElMessage({
          type: "success",
          message: "新增成功"
        })
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
      const { success } = await Updatexh_taskinfo({
        taskheader: form.value.taskheader,
        tasknumber: form.value.tasknumber,
        taskcontent: form.value.taskcontent,
        lineid: form.value.lineid,
        statue: form.value.statue,
        missionperson: form.value.missionperson,
        launchtime: form.value.launchtime,
        Id: form.value.Id
      })
      if (success) {
        ElMessage({
          type: "success",
          message: "修改成功"
        })
      }
      proxy.$mitt.emit("refresh-list")
      emit("update:type", "")
      nextTick(() => {
        back()
      })
    }
  })
}
// 提交派发
const submitDistribute = () => {
  ruleFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const { success } = await Addxh_taskmisson({
        taskid: form.value.Id,
        startTime: form.value.startTime,
        endTime: form.value.endTime,
        type: form.value.type,
        zxrArr: form.value.zxrArr,
        cjrid: form.value.cjrid,
        intervaltime: form.value.intervaltime
      })
      if (success) {
        ElMessage({
          type: "success",
          message: "派发成功"
        })
      } else {
        ElMessage({
          type: "error",
          message: "派发失败"
        })
      }
      // 刷新列表
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
  emit("update:type", "编辑任务")
}
const taskPfList = ref<any>([])
// 查询任务的派发记录
const getMissonByTaskId = async (taskId?: any) => {
  const { response } = await GetMissonByTaskId({
    taskId: taskId || form.value.Id
  })
  taskPfList.value = response
}
// 删除
const remove = () => {
  ElMessageBox.confirm("是否确认删除数据?", "", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { success } = await Deletexh_taskinfo({
        id: form.value.Id
      })
      if (success) {
        ElMessage({
          type: "success",
          message: "删除成功"
        })
      } else {
        ElMessage({
          type: "error",
          message: "删除失败"
        })
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
const date = ref<any>("")
const changeDate = () => {
  if (date) {
    form.value.startTime = date.value[0]
    form.value.endTime = date.value[1]
  } else {
    form.value.startTime = ""
    form.value.endTime = ""
  }
}
const changeZxry = (val: any) => {
  form.value.zxrArr = val.join(",")
}
const tjInfo = ref<any>({
  Xhtime: 0,
  Xhkm: 0,
  AllClockPoint: 0,
  DoneClockPoint: 0,
  AlarmCount: 0,
  CollectionCount: 0,
  Xhtype: ""
})
const getRwgl_Gjxq = async () => {
  const { response } = await GetRwgl_Gjxq({ xhid: form.value.xhid })
  if (response?.length > 0) {
    tjInfo.value = response[0]
  }
}
watch(
  () => props.data,
  (val) => {
    if (val) {
      form.value = JSON.parse(JSON.stringify(val))
      if (form.value.lineid) {
        const route = rwRouteList.value.find((item: any) => item.value === form.value.lineid)
        if (route) {
          form.value.lxbh = route.bh
          form.value.lxmc = route.label
          form.value.lxcd = route.lxcd
          form.value.pointcount = route.pointcount
        }
      }
    }
  },
  {
    deep: true,
    immediate: true
  }
)
watch(
  () => props.type,
  (val) => {
    if (val === "新增任务") {
      form.value = {
        tasknumber: new Date().getTime(),
        tasktype: "",
        patroltype: "",
        taskcontent: "",
        missionperson: user.value.userId,
        launchtime: "",
        lineid: undefined,
        statue: "启用", // 状态默认为启用
        mode: "",
        remark: ""
      }
    }
    if (val === "查看任务") {
      getMissonByTaskId()
      // getRwgl_Gjxq()
    }
    if (val === "派发任务") {
      form.value.cjrid = user.value.userId
      form.value.cjrname = user.value.userName
    }
    if (val === "查看派发") {
      // 获得任务派发记录
      getMissonByTaskId(form.value.taskid)
      // 获得任务概况
      getRwgl_Gjxq()
      // 展示路线
      getRouteById()
    }
  },
  {
    deep: true,
    immediate: true
  }
)
</script>
<template>
  <!-- 新增任务和编辑任务 -->
  <div
    v-if="type === '新增任务' || type === '编辑任务'"
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
            label="任务编号"
            prop="tasknumber"
          >
            <el-input
              v-model="form.tasknumber"
              placeholder="任务编号自动填充"
              readonly
            />
          </el-form-item>
          <el-form-item
            label="任务名称"
            prop="taskheader"
          >
            <el-input
              v-model="form.taskheader"
              placeholder="请输入任务名称"
            />
          </el-form-item>
          <el-form-item
            label="路线编号"
            prop="lineid"
          >
            <el-select
              v-model="form.lineid"
              placeholder="请选择或搜索路线编号"
              popper-class="custom-select-popper"
              @change="changeRoute"
            >
              <el-option
                v-for="item in rwRouteList"
                :key="item.value"
                :label="item.bh"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="路线名称">
            <el-input
              v-model="form.lxmc"
              placeholder="路线名称自动填充"
              readonly
            >
            </el-input>
          </el-form-item>
          <el-form-item label="路线长度">
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
          <el-form-item
            label="任务内容"
            prop="taskcontent"
          >
            <el-input
              v-model="form.taskcontent"
              placeholder="请输入任务内容"
              type="textarea"
              resize="none"
              :rows="7"
            />
          </el-form-item>
          <el-form-item
            label="状态"
            prop="statue"
          >
            <el-radio-group v-model="form.statue">
              <el-radio
                value="启用"
                size="large"
                >启用</el-radio
              >
              <el-radio
                value="停用"
                size="large"
                >停用</el-radio
              >
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div class="btns">
          <div @click="resetForm">重置</div>
          <div
            v-if="type === '新增任务'"
            @click="submit"
          >
            提交
          </div>
          <div
            v-if="type === '编辑任务'"
            @click="submitModify"
          >
            提交编辑
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
  <!-- 查看任务 -->
  <div
    v-else-if="type === '查看任务'"
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
          <div class="info-title">基础信息</div>
          <div class="info-box">
            <div class="item">
              <div class="label">任务编号:</div>
              <div class="value">{{ form.tasknumber }}</div>
            </div>
            <div class="item">
              <div class="label">任务名称:</div>
              <div class="value">{{ form.taskheader }}</div>
            </div>
            <div class="item">
              <div class="label">路线编号:</div>
              <div class="value">{{ form.lxbh }}</div>
            </div>
            <div class="item">
              <div class="label">路线名称:</div>
              <div class="value">{{ form.lxmc }}</div>
            </div>
            <div class="item">
              <div class="label">路线长度:</div>
              <div class="value">{{ form.lxcd }}km</div>
            </div>
            <div class="item">
              <div class="label">打卡点数:</div>
              <div class="value">{{ form.pointcount }}个</div>
            </div>
            <div class="item row-item">
              <div class="label">任务内容:</div>
              <div class="value">{{ form.taskcontent }}</div>
            </div>
            <div class="item">
              <div class="label">状态:</div>
              <div class="value">{{ form.statue }}</div>
            </div>
            <div class="item">
              <div class="label">创建人:</div>
              <div class="value">{{ form.missionperson }}</div>
            </div>
            <div class="item row-item">
              <div class="label">创建时间:</div>
              <div class="value">{{ form.launchtime }}</div>
            </div>
            <div
              class="item row-item btn1"
              @click="openModify"
            >
              编辑
            </div>
          </div>
        </div>
        <div class="info">
          <div class="info-title">历史派发</div>
          <el-scrollbar height="470px">
            <div
              v-if="taskPfList.length > 0"
              class="steps"
            >
              <div
                v-for="(step, i) in taskPfList"
                :key="i"
                class="step"
              >
                <!-- <div class="time">2024-12-30 12:00:00</div>
              <div class="status">开始巡护</div> -->
                <div class="time">{{ step.updatetime }}</div>
                <div class="status">{{ step.progress }}</div>
              </div>
            </div>
            <EmptyData v-else />
          </el-scrollbar>
          <div
            class="item row-item btn2"
            @click="remove"
          >
            删除
          </div>
        </div></el-scrollbar
      >
    </div>
  </div>
  <!-- 派发任务 -->
  <div
    v-else-if="type === '派发任务'"
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
            label="任务名称"
            prop="taskheader"
          >
            <el-input
              v-model="form.taskheader"
              placeholder="任务名称自动填充"
              readonly
            />
          </el-form-item>
          <el-form-item
            label="创建人员"
            prop="cjrname"
          >
            <el-input
              v-model="form.cjrname"
              placeholder="创建人员自动填充"
              readonly
            />
          </el-form-item>
          <el-form-item
            label="执行时间"
            prop="date"
          >
            <el-date-picker
              class="date-picker"
              v-model="date"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placement="bottom-start"
              value-format="YYYY-MM-DD HH:mm:ss"
              size="default"
              popper-class="custom-datepicker-popper"
              @change="changeDate"
            />
          </el-form-item>
          <el-form-item
            label="执行人员"
            prop="zxrArr"
          >
            <el-tree-select
              v-model="form.zxryList"
              :data="ryList"
              :props="{ label: 'Name', value: 'Id', children: 'Children' }"
              :render-after-expand="false"
              :check-on-click-node="true"
              :default-expand-all="true"
              placeholder="请选择执行人员"
              clearable
              filterable
              multiple
              @change="changeZxry"
            />
          </el-form-item>
          <el-form-item
            label="任务类型"
            prop="type"
          >
            <el-radio-group v-model="form.type">
              <el-radio
                value="临时任务"
                size="large"
                >临时任务</el-radio
              >
              <el-radio
                value="周期任务"
                size="large"
                >周期任务</el-radio
              >
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-if="form.type === '周期任务'"
            label="任务间隔"
            prop="intervaltime"
          >
            <el-input
              v-model="form.intervaltime"
              placeholder="请输入任务间隔"
            >
              <template #append>天</template>
            </el-input>
          </el-form-item>
        </el-form>
        <div class="btns">
          <div @click="resetForm">重置</div>
          <div @click="submitDistribute">提交</div>
        </div>
      </el-scrollbar>
    </div>
  </div>
  <!-- 查看派发 -->
  <div
    v-else-if="type === '查看派发'"
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
          <div class="info-title">历史派发</div>
          <div class="info-box">
            <div class="item">
              <div class="label">派发编号:</div>
              <div class="value">{{ form.missonnumber }}</div>
            </div>
            <div class="item">
              <div class="label">任务名称:</div>
              <div class="value">{{ form.taskheader }}</div>
            </div>
            <div class="item">
              <div class="label">开始时间:</div>
              <div class="value">{{ form.commitcontent }}</div>
            </div>
            <div class="item">
              <div class="label">结束时间:</div>
              <div class="value">{{ form.committime }}</div>
            </div>
            <div class="item">
              <div class="label">任务类型:</div>
              <div class="value">{{ form.remark }}</div>
            </div>
            <div class="item">
              <div class="label">执行人:</div>
              <div class="value">{{ form.impname }}</div>
            </div>
            <div class="item">
              <div class="label">创建人:</div>
              <div class="value">{{ form.misname }}</div>
            </div>
            <div class="item">
              <div class="label">创建时间:</div>
              <div class="value">{{ form.missontime }}</div>
            </div>
          </div>
        </div>
        <div class="info">
          <div class="info-title">历史派发</div>
          <el-scrollbar height="300px">
            <div
              v-if="taskPfList.length > 0"
              class="steps"
            >
              <div
                v-for="(step, i) in taskPfList"
                :key="i"
                class="step"
              >
                <!-- <div class="time">2024-12-30 12:00:00</div>
              <div class="status">开始巡护</div> -->
                <div class="time">{{ step.updatetime }}</div>
                <div class="status">{{ step.progress }}</div>
              </div>
            </div>
            <EmptyData v-else />
          </el-scrollbar>
        </div>
        <div class="info">
          <div class="statistics">
            <div class="statistics-item">
              <img
                :src="$fun.getImg('patrol/edit-pf-icon1.png')"
                alt=""
              />
              <div>
                <div class="value">{{ tjInfo?.Xhtime }}</div>
                <div class="label">巡护总时长</div>
              </div>
            </div>
            <div class="statistics-item">
              <img
                :src="$fun.getImg('patrol/edit-pf-icon2.png')"
                alt=""
              />
              <div>
                <div class="value">{{ tjInfo?.Xhkm }}</div>
                <div class="label">巡护里程</div>
              </div>
            </div>
            <div class="statistics-item">
              <img
                :src="$fun.getImg('patrol/edit-pf-icon3.png')"
                alt=""
              />
              <div>
                <div class="value">{{ tjInfo?.AllClockPoint }}</div>
                <div class="label">计划打卡点</div>
              </div>
            </div>
            <div class="statistics-item">
              <img
                :src="$fun.getImg('patrol/edit-pf-icon4.png')"
                alt=""
              />
              <div>
                <div class="value">{{ tjInfo?.DoneClockPoint }}</div>
                <div class="label">完成打卡点</div>
              </div>
            </div>
            <div class="statistics-item">
              <img
                :src="$fun.getImg('patrol/edit-pf-icon5.png')"
                alt=""
              />
              <div>
                <div class="value">{{ tjInfo?.AlarmCount }}</div>
                <div class="label">报警点数</div>
              </div>
            </div>
            <div class="statistics-item">
              <img
                :src="$fun.getImg('patrol/edit-pf-icon6.png')"
                alt=""
              />
              <div>
                <div class="value">{{ tjInfo?.CollectionCount }}</div>
                <div class="label">采集点数</div>
              </div>
            </div>
            <div class="statistics-item">
              <img
                :src="$fun.getImg('patrol/edit-pf-icon7.png')"
                alt=""
              />
              <div>
                <div class="value">{{ tjInfo?.Xhtype }}</div>
                <div class="label">巡护方式</div>
              </div>
            </div>
          </div>
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
        display: flex;
        flex-wrap: wrap;
        overflow: hidden;
        .item {
          display: flex;
          width: 50%;
          line-height: 3em;
          text-overflow: ellipsis;
          white-space: nowrap;
          .label {
            width: 70px;
          }
          .value {
            text-overflow: ellipsis;
            white-space: nowrap;
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
    & > div:last-child {
      background: linear-gradient(to right, #5a8ab6, #375577);
    }
  }
}
</style>
