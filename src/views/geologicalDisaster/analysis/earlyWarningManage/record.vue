<template>
  <div class="geologicalDisaster-page">
    <div class="search-content">
      <el-form
        class="queryForm"
        ref="queryFormRef"
        :model="queryParams"
        label-width="auto"
        :inline="true"
        @keyup.enter.native="handleQuery"
        clearable
      >
        <el-form-item label="预警时间：">
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            :shortcuts="shortcuts"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="设备名称：">
          <el-select
            v-model="queryParams.equipmentIds"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择"
          >
            <el-option
              v-for="item in options1"
              :key="item.Id"
              :label="item.name"
              :value="item.equipmentId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预警等级：">
          <el-select
            v-model="queryParams.alarmLevels"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择"
          >
            <el-option
              v-for="item in options2"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预警因子：">
          <el-select
            v-model="queryParams.fields"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择"
          >
            <el-option
              v-for="item in options3"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预警状态：">
          <el-select
            v-model="queryParams.status"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择"
          >
            <el-option
              v-for="item in options4"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="0">
          <el-button
            type="primary"
            plain
            @click="handleQuery"
            >查询</el-button
          >
          <el-button
            type="primary"
            @click="resetQuery"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <div class="table-box">
      <el-table
        class="tableList"
        :data="tableData"
      >
        <el-table-column
          type="index"
          width="60"
          label="序号"
          align="center"
        />
        <el-table-column
          prop="time"
          label="预警时间"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="equipmentName"
          label="设备名称"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="level"
          label="预警等级"
          align="center"
        >
          <template #default="scope">
            <span
              class="level"
              style="color: #0052d9"
              v-if="scope.row.alarmLevel == 3"
            >
              <div
                class="icon"
                style="background: #0052d9"
              ></div>
              {{ scope.row.alarmLevelName }}
            </span>
            <span
              class="level"
              style="color: #d9b600"
              v-else-if="scope.row.alarmLevel == 4"
            >
              <div
                class="icon"
                style="background: #d9b600"
              ></div>
              {{ scope.row.alarmLevelName }}
            </span>
            <span
              class="level"
              style="color: #d97500"
              v-else-if="scope.row.alarmLevel == 5"
            >
              <div
                class="icon"
                style="background: #d97500"
              ></div>
              {{ scope.row.alarmLevelName }}
            </span>
            <span
              class="level"
              style="color: #d91a00"
              v-else-if="scope.row.alarmLevel == 6"
            >
              <div
                class="icon"
                style="background: #d91a00"
              ></div>
              {{ scope.row.alarmLevelName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="field"
          label="预警因子"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="status"
          label="预警状态"
          align="center"
        >
          <template #default="scope">
            <span
              class="level"
              style="color: blue"
              v-if="scope.row.status == 0"
            >
              <div
                class="icon"
                style="background: blue"
              ></div>
              待处理
            </span>
            <span
              class="level"
              style="color: #cbcb31"
              v-else-if="scope.row.status == 1"
            >
              <div
                class="icon"
                style="background: #cbcb31"
              ></div>
              处理中
            </span>
            <span
              class="level"
              style="color: #f59b22"
              v-else-if="scope.row.status == 2"
            >
              <div
                class="icon"
                style="background: #f59b22"
              ></div>
              已处理
            </span>
            <span
              class="level"
              style="color: #d8001b"
              v-else-if="scope.row.status == 3"
            >
              <div
                class="icon"
                style="background: #d8001b"
              ></div>
              误报
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="180"
          align="center"
        >
          <template #default="scope">
            <el-button
              link
              type="primary"
              @click="handleDetail(scope.row)"
              >查看录像</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div
        class="pagination-box"
        v-if="total > 0"
      >
        <pagination
          v-model:total="total"
          v-model:page="queryParams.page"
          v-model:limit="queryParams.intPageSize"
          @pagination="getList"
        />
      </div>
    </div>
    <history ref="historyVideoRef"></history>
  </div>
</template>

<script setup lang="ts">
import history from "@/components/hkVideo/history.vue"
import { geologicalDisasterApi } from "@/api/geologicalDisaster"
import Pagination from "@/components/Pagination/index.vue"
import dayjs from "dayjs"
const shortcuts = [
  {
    text: "最近24小时",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 1)
      return [start, end]
    }
  },
  {
    text: "最近一周",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    }
  },
  {
    text: "最近一个月",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    }
  },
  {
    text: "最近三个月",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [start, end]
    }
  },
  {
    text: "最近半年",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 6)
      return [start, end]
    }
  }
]
const historyVideoRef = ref()
const queryParams = ref<any>({
  equipmentIds: [],
  alarmLevels: [],
  fields: [],
  status: [],
  startTime: "",
  endTime: "",
  page: 1,
  intPageSize: 15
})
const options1 = ref<any>([])
const options2 = ref<any>([
  {
    id: 3,
    name: "蓝色预警"
  },
  {
    id: 4,
    name: "黄色预警"
  },
  {
    id: 5,
    name: "橙色预警"
  },
  {
    id: 6,
    name: "红色预警"
  }
])
const options3 = ref<any>([
  {
    id: 1,
    name: "高程变化"
  },
  {
    id: 2,
    name: "北向量变化"
  },
  {
    id: 3,
    name: "东向量变化"
  },
  {
    id: 4,
    name: "降雨量"
  },
  {
    id: 5,
    name: "土壤含水率"
  }
])
const options4 = ref<any>([
  {
    id: 0,
    name: "待处理"
  },
  {
    id: 1,
    name: "处理中"
  },
  {
    id: 2,
    name: "已处理"
  },
  {
    id: 3,
    name: "误报"
  }
])
const timeRange = ref([])
const total = ref(0)
const queryFormRef = ref()
const tableData = ref<any>([])
// 查询
const handleQuery = () => {
  queryParams.value.page = 1
  getList()
}
// 重置查询
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}
//获取数据
const getList = (val?: number) => {
  if (val == 1) {
    queryParams.value.page = 1
  }
  if (timeRange.value && timeRange.value.length > 0) {
    queryParams.value.startTime = dayjs(timeRange.value[0]).format("YYYY-MM-DD HH:mm:ss")
    queryParams.value.endTime = dayjs(timeRange.value[1]).format("YYYY-MM-DD HH:mm:ss")
  } else {
    queryParams.value.startTime = ""
    queryParams.value.endTime = ""
  }

  geologicalDisasterApi.getPageAlarmRecord(queryParams.value).then((res: any) => {
    if (res.success) {
      tableData.value = res.response.data
      total.value = res.response.dataCount
    } else {
      tableData.value = []
      total.value = 0
    }
  })
}
//查看录像
const handleDetail = (row) => {
  let ele = options1.value.find((item) => item.equipmentId == row.equipmentId)
  if (ele) {
    row.deviceid = ele.monitorCode
    row.mc = ele.equipmentName
  }
  row.setTime = row.time
  historyVideoRef.value.openDialog(row)
}
//获取所有设备
const getData = () => {
  geologicalDisasterApi.getAllGeologicHazardEquipment({}).then((res: any) => {
    if (res.success) {
      options1.value = res.response
    }
  })
}

onMounted(() => {
  getData()
  getList()
})
</script>

<style lang="scss" scoped></style>
