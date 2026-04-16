<template>
  <div class="geologicalDisaster-page">
    <el-table
      class="tableList"
      :data="tableData"
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
        prop="sblx"
        label="设备类型"
        align="center"
      >
      </el-table-column>
      <!-- <el-table-column prop="" label="设备型号" align="center">
            </el-table-column> -->
      <el-table-column
        prop="name"
        label="设备名称"
        align="center"
      >
      </el-table-column>
      <el-table-column
        prop="monitorCode"
        label="设备编号"
        align="center"
      >
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="投运时间"
        align="center"
      >
      </el-table-column>
      <!-- <el-table-column prop="status" label="状态" align="center">
                <template #default="scope">
                    <span class="level" style="color: #9e9e9e;" v-if="scope.row.status == 2">
                        <div class="icon" style="background: #9e9e9e"></div>离线
                    </span>
                    <span class="level" style="color:#95f202;" v-else-if="scope.row.status == 1">
                        <div class="icon" style="background: #95f202"></div>正常
                    </span>
                    <span class="level" style="color:#0052D9;" v-else-if="scope.row.status == 3">
                        <div class="icon" style="background:#0052D9"></div>蓝色预警
                    </span>
                    <span class="level" style="color:#D9B600;" v-else-if="scope.row.status == 4">
                        <div class="icon" style="background: #D9B600"></div>黄色预警
                    </span>
                    <span class="level" style="color:#D97500;" v-else-if="scope.row.status == 5">
                        <div class="icon" style="background: #D97500"></div>橙色预警
                    </span>
                    <span class="level" style="color:#D91A00;" v-else-if="scope.row.status == 6">
                        <div class="icon" style="background:#D91A00;"></div>红色预警
                    </span>
                </template>
            </el-table-column> -->
      <el-table-column
        prop="createtime"
        label="操作"
        align="center"
      >
        <template #default="scope">
          <el-button
            link
            style="color: #009dff"
            @click="handleDetail(scope.row)"
            >查看录像</el-button
          >
          <el-button
            link
            style="color: #f59b22"
            @click="handlePosition(scope.row)"
            >定位</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <div class="video-wrap">
      <div
        class="video-box"
        v-for="(item, index) in tableData"
        :key="index"
      >
        <div class="video">
          <player :videoUrl="item.url" />
          <div class="video-title">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <history ref="historyVideoRef"></history>
  </div>
</template>

<script setup lang="ts">
import { geologicalDisasterApi } from "@/api/geologicalDisaster"
import player from "@/components/hkVideo/index.vue"
import history from "@/components/hkVideo/history.vue"
import router from "@/router"
const tableData = ref<any>([])
const historyVideoRef = ref()

//获取所有站点
const getData = () => {
  geologicalDisasterApi.getAllGeologicHazardEquipment({}).then((res: any) => {
    if (res.success) {
      tableData.value = res.response
      tableData.value.forEach(async (item: any, index: number) => {
        item.url = await getVideoUrl(item.monitorCode)
      })
    }
  })
}
//获取视频地址
import { videoApi } from "@/api/geologicalDisaster"
const getVideoUrl = (deviceId) => {
  let query = {
    deviceId: deviceId,
    Playtype: "ws"
  }
  return videoApi
    .getPlayVideoUrl(query)
    .then((res: any) => {
      if (res.success && res.response) {
        return res.response
      } else {
        ElMessage.error(res.msg)
        return ""
      }
    })
    .catch((err: any) => {})
}
//查看录像
const handleDetail = (row: any) => {
  row.deviceid = row.monitorCode
  row.mc = row.name
  historyVideoRef.value.openDialog(row)
}

//定位
const handlePosition = (row: any) => {
  router.push(`/scientificResearch/geologicalDisaster?equipmentId=${row.equipmentId}`)
}

onMounted(() => {
  getData()
})
</script>

<style lang="scss" scoped>
.geologicalDisaster-page {
  height: 100%;
  .tableList {
    height: 290px;
    margin-bottom: 15px;
    .level {
      display: flex;
      align-items: center;
      font-size: 14px;
      justify-content: center;

      .icon {
        position: relative;
        width: 4px;
        height: 4px;
        margin-right: 5px;
        border-radius: 50%;

        &::after {
          content: "";
          display: inline-block;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          width: 8px;
          height: 8px;
          opacity: 0.3;
          border-radius: 50%;
          box-sizing: border-box;
          border: 1px solid #fff;
          background: rgba(224, 0, 0, 0.3);
        }
      }
    }
  }
  .video-wrap {
    position: relative;
    height: calc(100% - 305px);
    .video-box {
      position: absolute;
      background: #333;
      .video {
        position: relative;
        width: 100%;
        height: 100%;
        .video-title {
          position: absolute;
          z-index: 2;
          left: 10px;
          bottom: 10px;
          color: #fff;
        }
      }
      &:nth-child(1) {
        top: 0;
        left: 0;
        width: calc(50% - 15px);
        height: 100%;
      }
      &:nth-child(2) {
        left: calc(50%);
        width: calc((50% - 15px) / 2);
        height: calc((100% - 15px) / 2);
      }
      &:nth-child(3) {
        left: calc(50%);
        bottom: 0;
        width: calc((50% - 15px) / 2);
        height: calc((100% - 15px) / 2);
      }
      &:nth-child(4) {
        right: 0;
        width: calc((50% - 15px) / 2);
        height: calc((100% - 15px) / 2);
      }

      &:nth-child(5) {
        right: 0;
        bottom: 0;
        width: calc((50% - 15px) / 2);
        height: calc((100% - 15px) / 2);
      }
    }
  }
}
</style>
