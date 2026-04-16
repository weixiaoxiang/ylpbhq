<script setup lang="ts">
import { GetAlarm_HandleByPage, GetAllMonitoringList } from "@/api"

const options1 = ref<any>([])
const queryForm = reactive({
  page: 1,
  intPageSize: 10,
  keyword: "",
  cameraname: "",
  startTime: "",
  endTime: ""
})

// 获得设备列表
const getCameraList = async () => {
  const { response } = await GetAllMonitoringList({
    equipmentType: "防火监控点"
  })
  options1.value = response
}

const date = ref([])
const handleDateChange = () => {
  if (date?.value?.length > 0) {
    queryForm.startTime = date.value[0]
    queryForm.endTime = date.value[1]
  } else {
    queryForm.startTime = ""
    queryForm.endTime = ""
  }
}
const tableData = ref<any>([])
const total = ref<any>(0)
//查询
const handleQuery = () => {
  getData()
}
const handleCurrentChange = () => {
  getData()
}
//获取数据
const getData = async () => {
  const { response } = await GetAlarm_HandleByPage(queryForm)
  tableData.value = response.data
  total.value = response.dataCount
}
//点击详情
const { proxy } = getCurrentInstance() as any
const handleDetail = (item: any) => {
  proxy.$mitt.emit("activePage", item)
}

onMounted(() => {
  getCameraList()
  getData()
})
onBeforeUnmount(() => {})
</script>
<template>
  <div class="left1">
    <BasePanel
      title="应急事件"
      class="overflow-hidden"
    >
      <template #contain>
        <div class="search-box">
          <el-form
            class="queryForm"
            ref="queryFormRef"
            :model="queryForm"
            label-width="auto"
            :inline="true"
            clearable
          >
            <el-form-item label-width="0">
              <el-input
                v-model="queryForm.keyword"
                clearable
                placeholder="请输入关键字查询"
              ></el-input>
            </el-form-item>
            <el-form-item label-width="0">
              <el-select
                v-model="queryForm.cameraname"
                placeholder="请选择设备"
                popper-class="custom-select-popper"
                clearable
              >
                <el-option
                  v-for="item in options1"
                  :key="item.id"
                  :label="item.mc"
                  :value="item.mc"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label-width="0"
              style="width: 80%"
            >
              <el-date-picker
                class="date-picker"
                v-model="date"
                type="daterange"
                value-format="YYYY-MM-DD"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placement="bottom-start"
                size="default"
                popper-class="custom-datepicker-popper"
                @change="handleDateChange"
              />
            </el-form-item>
            <el-form-item
              label-width="0"
              style="width: 20%"
            >
              <div
                class="search-btn"
                @click="handleQuery"
              >
                <SvgIcon
                  name="查询"
                  style="font-size: 16px"
                />
                查询
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div class="table-list">
          <el-scrollbar>
            <div class="scrollbar-flex-content">
              <div
                class="list-item"
                v-for="item in tableData"
                @click="handleDetail(item)"
              >
                <div class="top">
                  <div class="col">
                    <span class="label">预警时间：</span>
                    <span class="value">{{ item.starttime }}</span>
                  </div>
                  <div class="col">
                    <span class="label">设备名称：</span>
                    <span class="value">{{ item.cameraname }}</span>
                  </div>
                </div>
                <div class="con">
                  <span class="label">描述：</span>
                  <span class="value">{{ item.describe }}</span>
                  <img
                    v-if="item.status !== '未处理'"
                    src="@/assets/images/emergencyCommand/btn-ycl.png"
                  />
                  <img
                    v-else
                    src="@/assets/images/emergencyCommand/btn-wcl.png"
                  />
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
        <el-pagination
          v-model:current-page="queryForm.page"
          v-model:page-size="queryForm.intPageSize"
          :page-sizes="[10, 20, 30, 40]"
          :background="false"
          :pager-count="5"
          layout="total, pager, jumper"
          :total="total"
          @current-change="handleCurrentChange"
        />
      </template>
    </BasePanel>
  </div>
</template>

<style lang="scss" scoped>
.left1 {
  position: absolute;
  top: vh(20);
  bottom: vh(20);
  left: vw(20);
  width: 420px;
  margin-top: vh(15);
  color: #fff;
  :deep(.search-box) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .el-form {
      width: 100%;
    }
    .el-form-item__label {
      color: #fff;
    }
    .el-form-item {
      width: 50%;
      margin-right: 0;
      &:nth-child(2n + 1) {
        padding-right: 10px;
      }
    }
    .el-input__wrapper,
    .el-select__wrapper {
      background-color: #0c284d;
      box-shadow: none;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 0;
      color: #fff;
    }
    .el-input__inner,
    .el-range-input,
    .el-range-separator {
      color: var(--el-text-color-placeholder);
    }
    // #a8abb2
    .search-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 90px;
      height: 34px;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid #365375;
      color: #fff;
      text-align: center;
      cursor: pointer;
      .svg-icon {
        margin-right: 4px;
      }
    }
  }
  .table-list {
    height: calc(100% - 110px - 42px);
    overflow: auto;
    .list-item {
      font-size: 14px;
      margin-bottom: 30px;
      cursor: pointer;
      .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 27.44px;
        padding: 0 5px;
        background: linear-gradient(90deg, #1e3c70 0%, rgba(30, 60, 112, 0) 100%);
        .value {
          color: #00e3ff;
        }
      }
      .con {
        position: relative;
        padding-right: 82px;
        line-height: 24px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
        text-overflow: ellipsis;

        .label {
          display: inline-block;
          text-indent: 2em;
        }
        .value {
        }
        img {
          position: absolute;
          right: 0;
          bottom: 0;
        }
        &::before {
          content: "";
          display: inline-block;
          position: absolute;
          top: -4px;
          width: 33px;
          height: 32px;
          background: url("@/assets/images/emergencyCommand/icon1.png") no-repeat;
          background-size: 100% 100%;
        }
      }
    }
  }
  :deep(.el-pagination) {
    margin-top: 8px;
    justify-content: center;
    .el-pager {
      li {
        background: transparent;
        color: #fff;
      }
      li.is-active {
        color: #195bdf;
        background-color: rgba(26, 39, 52, 0.5);
      }
    }
    .el-pagination__sizes,
    .el-pagination__total {
      color: #fff;
    }
    .el-input__wrapper {
      padding: 1px 2px;
      background-color: rgba(60, 93, 128, 0.5);
      box-shadow: none;
      .el-input__inner {
        color: #fff;
      }
    }
    .el-pagination__editor.el-input {
      width: 40px;
    }
    .el-pagination__jump {
      color: #fff;
    }
  }
}
</style>
