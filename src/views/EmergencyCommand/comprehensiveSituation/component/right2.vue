<script setup lang="ts">
import { GetAlarm_MsgEmergencyList } from "@/api"

const tableData = ref<any>([])
const getTableData = async () => {
  const { response } = await GetAlarm_MsgEmergencyList()
  console.log(response, 111)

  tableData.value = response
}
const pdfpath = ref("")
const handleView = (item: any) => {
  if (!item.fileurl) return ElMessage.info("暂无附件")
  if (item.fileurl.indexOf(".pdf") > -1) {
    pdfpath.value = "/statisUrl/" + item.fileurl
    showView.value = true
  } else {
    // ElMessage.info("暂无附件")
    const a = document.createElement("a")
    a.href = "/statisUrl/" + item.fileurl
    // a.download =  `红外相机抓拍导出-${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`
    a.click()
  }
}
const showView = ref(false)
onMounted(() => {
  getTableData()
})
</script>
<template>
  <div class="right2">
    <BasePanel title="应急预案">
      <template #contain>
        <div class="con">
          <div class="header">
            <span>预案名称</span>
            <span>预案类型</span>
            <span>操作</span>
          </div>
          <div class="list">
            <el-scrollbar height="100%">
              <div
                class="item"
                v-for="(item, index) in tableData"
                :key="index"
              >
                <span>{{ item.name }}</span>
                <span>{{ item.type }}</span>
                <span
                  class="btn"
                  @click="handleView(item)"
                >
                  查看附件
                </span>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </template>
    </BasePanel>
    <Modal
      v-model:show="showView"
      disable-zoom
      disable-panzoom
      :close-on-click-modal="false"
    >
      <template v-slot:container>
        <PdfPreview :path="pdfpath" />
      </template>
    </Modal>
  </div>
</template>

<style lang="scss" scoped>
.right2 {
  flex: 1;
  margin-top: vh(20);
  color: #fff;
  // overflow: auto;
  .con {
    width: 100%;
    height: 100%;
    .header {
      display: flex;
      align-items: center;
      height: 31px;
      margin-bottom: 5px;
      background: url("@/assets/images/emergencyCommand/yjya-1.png") no-repeat;
      background-size: 100% 100%;
      span {
        flex: 1;
        text-align: center;
        line-height: 31px;
      }
    }
    .list {
      height: calc(100% - 36px);
      overflow: auto;
      .item {
        display: flex;
        align-items: center;
        height: 31px;
        background: url("@/assets/images/emergencyCommand/yjya-2.png") no-repeat;
        background-size: 100% 100%;
        margin-bottom: 5px;

        span {
          flex: 1;
          text-align: center;
          line-height: 31px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
        }
        .btn {
          color: rgba(0, 162, 243, 1);
          cursor: pointer;
        }
      }
    }
  }
}
</style>
<style></style>
