<template>
  <el-dialog
    :title="title"
    v-if="showDialog"
    v-model="showDialog"
    width="45rem"
    :close-on-click-modal="false"
    destroy-on-close
    @close="close()"
    center
  >
    <el-row>
      <el-col
        :span="18"
        style="padding-top: 7px"
      >
        <el-progress :percentage="percentage"></el-progress>
      </el-col>
      <el-col :span="6">
        <el-button
          type="primary"
          icon="el-icon-download"
          :loading="!downloadFile"
          size="mini"
          title="点击下载"
          >{{ downloadFile ? "下载" : "下载中" }}</el-button
        >
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script setup lang="ts">
// import { videoApi } from '@/api/video';
import axios from "axios"

const title = ref("下载中...")
const info = ref({})
const showDialog = ref(false)
const percentage = ref<any>(0.0)
const getProgressRun = ref(false)
const timer = ref(null)
const downloadFile = ref<any>(null)
onMounted(() => {
  window.addEventListener("beforeunload", stopDownloadRecord)
})
const openDialog = (url, data) => {
  console.log("下载中...", url)
  showDialog.value = true
  getProgressRun.value = true
  info.value = data
  percentage.value = 0.0
  downloadFile.value = url
  downloadFileClientEvent(data)
  // getProgressTimer()
}

defineExpose({ openDialog }) // 提供 open 方法，用于打开弹窗
function getProgressTimer() {
  if (!getProgressRun.value) {
    return
  }
  if (percentage.value == 100) {
    return
  }
  setTimeout(() => {
    if (!showDialog.value) return
    getProgress(getProgressTimer())
  }, 5000)
}
function getProgress(callback) {}
function close() {
  console.log("关闭", streamInfo.value)
  if (!streamInfo.value || streamInfo.value.progress < 1) {
    stopDownloadRecord()
  }

  if (timer.value !== null) {
    window.clearTimeout(timer.value)
    timer.value = null
  }
  showDialog.value = false
  getProgressRun.value = false
}
function gbScale(scale) {
  scale.value = scale
}

function stopDownloadRecord(callback?: any) {
  let query = {
    deviceId: deviceId.value,
    channelId: channelId.value,
    stream: stream.value
  }
  // videoApi.stopDownload(query).then((res) => {
  //   if (callback) callback(res)
  // });
}
function downloadFileClientEvent(data) {
  axios({
    url: downloadFile.value,
    method: "get", // 调用类型依据后端接口调用为准
    responseType: "blob", // 响应类型

    onDownloadProgress(progress) {
      console.log("进度", progress)
      // onDownloadProgress 监听下载进度的方法
      let downProgress = Math.round((100 * progress.loaded) / progress.total) // progress对象中的loaded表示已经下载的数量，total表示总数量，这里计算出百分比。注意这里一定需要后端接口返回 Content-Length，没有的话是拿不到的
      // store.commit("downFiles/SET_PROGRESS", {
      //   path: uniSign,
      //   progress: downProgress,
      // }); // 将此次下载的文件名和下载进度组成对象再用vuex状态管理
    }
  })
    .then((res) => {
      // // 文件流传输完成后，开启文件下载
      // if (params.downLoadName) {
      //   jsFileDownLoad(res.data, params.downLoadName + ".xlsx"); // jsFileDownLoad是用来下载文件流的，下载插件：npm i js-file-download，import引入：import jsFileDownLoad from 'js-file-download'
      // } else {
      //   jsFileDownLoad(res.data, "下载文件.xlsx"); // 如果没有文件名字，就给个默认文件名
      // }
    })
    .catch((e) => {
      console.log(e)
      // params.that.$message.error("该文件无法下载"); // 报错处理.params.that由于拿不到this,所以传入的
    })

  // let x = new XMLHttpRequest();
  // x.open("GET", downloadFile.value, true);
  // x.responseType = 'blob';
  // x.onload = (e) => {
  //   let url = window.URL.createObjectURL(x.response)
  //   let a = document.createElement('a');
  //   a.href = url
  //   a.download = `${data.deviceId}(${data.beginTime}-${data.endTime})`+ ".mp4";
  //   a.click()
  // }
  // x.send();
}
onUnmounted(() => {
  window.removeEventListener("beforeunload", stopDownloadRecord)
})
</script>
