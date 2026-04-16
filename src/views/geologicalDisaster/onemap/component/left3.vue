<template>
  <div class="geologicalDisaster-section wrapgeo">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">设备状态</div>
      </div>
      <div class="updatetime">更新时间：{{ createTime }}</div>
    </div>
    <div class="line"></div>
    <div class="wrap-con">
      <el-table
        class="tableList"
        :data="tableList"
        stripe
        show-overflow-tooltip
        :header-cell-style="{
          background: '#204b78',
          color: 'rgba(255, 255, 255, .75)',
          fontSize: '14px',
          height: '32px',
          borderBottom: '1px solid #204b78'
        }"
      >
        <el-table-column
          prop="equipmentName"
          width="160"
          label="设备名称"
          align="center"
        />
        <el-table-column
          prop="onlineCount"
          label="运行状态在线/总数"
          align="center"
        />
        <el-table-column
          prop="alarmCount"
          label="历史预警次数"
          align="center"
        />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { geologicalDisasterApi } from "@/api/geologicalDisaster"

let props = defineProps(["createTime"])
const tableList = ref([])
// const { proxy } = getCurrentInstance() as any
//获取数据
const getData = () => {
  geologicalDisasterApi.GetGeologicHazardDeviceStatus({}).then((res: any) => {
    if (res.success) {
      tableList.value = res.response
    }
  })
}
onMounted(() => {
  getData()
})
</script>

<style lang="scss" scoped>
.geologicalDisaster-section {
  height: vh(301);
  margin-top: vh(20);
  backdrop-filter: none !important;
}
</style>
