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
    </div>
    <div class="line"></div>
    <div class="wrap-con">
      <el-table
        class="tableList"
        :data="tableList"
        stripe
        show-overflow-tooltip
        :header-cell-style="{
          background: 'rgba(41, 64, 100, 1)',
          color: 'rgba(255, 255, 255, .75)',
          fontSize: '14px',
          height: '32px',
          borderBottom: '1px solid rgba(41, 64, 100, 1)'
        }"
      >
        <el-table-column
          type="index"
          width="55"
          label="预警时间"
          align="center"
        />
        <el-table-column
          prop="equipmentName"
          label="设备名称"
          align="center"
        />
        <el-table-column
          prop="onlineCount"
          label="预警等级"
          align="center"
          width="80"
        />
        <el-table-column
          prop="alarmCount"
          label="预警因子"
          align="center"
          width="80"
        />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { geologicalDisasterApi } from "@/api/ScientificResearch"
const tableList = ref([])
// const { proxy } = getCurrentInstance() as any
//获取数据
// const getData = () => {
//   geologicalDisasterApi.getGeologicHazardDeviceStatus({}).then((res: any) => {
//     if (res.success) {
//       tableList.value = res.response
//     }
//   })
// }
onMounted(() => {
  //   getData()
})
</script>

<style lang="scss" scoped>
.geologicalDisaster-section {
  height: vh(301);
  margin-top: vh(20);
}
</style>
