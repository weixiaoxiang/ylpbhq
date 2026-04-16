<template>
  <div class="right1 wrapcom">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">共建管理</div>
      </div>
    </div>
    <div class="line"></div>
    <div class="wrap-con">
      <div class="select-box-community">
        <el-form
          class="queryForm"
          ref="queryFormRef"
          :model="queryParams"
          label-width="auto"
          :inline="true"
          @keyup.enter.native="handleQuery"
          clearable
        >
          <el-form-item label="问题名称">
            <el-input
              class="searchbox"
              v-model="queryParams.mc"
              size="large"
              placeholder="请输入查询信息"
            >
              <template #append>
                <el-button
                  :icon="Search"
                  size="small"
                  @click="search()"
                />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="所属区域">
            <el-select
              v-model="queryParams.ssyqlistArr"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择"
              popper-class="custom-select-popper"
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
          <el-form-item label="上传日期">
            <el-date-picker
              v-model="timeRange"
              type="datetimerange"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              popper-class="custom-datepicker-popper"
            />
          </el-form-item>
        </el-form>

        <el-form-item label-width="0">
          <div
            class="fun-btn"
            :class="{ active: currentbtnTool === 3 }"
            @click="handleExport"
          >
            <img
              src="/images/geologicalDisaster/btn-dc.png"
              alt=""
            />
            导出
          </div>
          <div
            class="fun-btn"
            :class="{ active: currentbtnTool === 1 }"
            @click="handleQuery"
          >
            <img
              src="/images/geologicalDisaster/btn-cx.png"
              alt=""
            />
            查询
          </div>
          <div
            class="fun-btn"
            :class="{ active: currentbtnTool === 2 }"
            @click="resetQuery"
          >
            <img
              src="/images/geologicalDisaster/btn-cz.png"
              alt=""
            />
            重置
          </div>
        </el-form-item>
      </div>

      <div class="table-community">
        <div class="table-list">
          <div
            v-for="(item, index) of cardList"
            :key="item.id"
            :class="{ 'odd-card': index % 2 === 0, 'even-card': index % 2 !== 0 }"
            @click="handclickitem(item)"
          >
            <div class="card">
              <div class="card-left">
                <div>问题名称: {{ item.mc }}</div>
                <div>上传时间: {{ item.createtime }}</div>
                <div>所属区域: {{ item.sssjname }}</div>
              </div>
              <div class="card-right">
                <div
                  v-if="item.statue == '已处理'"
                  class="status-bg1"
                >
                  <span style="margin-left: 5px"> 已处理</span>
                </div>
                <div
                  v-if="item.statue == '未处理'"
                  class="status-bg2"
                >
                  <span style="margin-left: 5px"> 未处理</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="pagination-community">
          <Pagination
            :background="true"
            layout="prev, pager, next"
            :total="total"
            v-model:page="queryParams.page"
            v-model:page-size="queryParams.intPageSize"
            @pagination="handleChangePage"
          ></Pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { communityBuildingApi } from "@/api/CommunityBuilding"
import Pagination from "@/components/Pagination/index.vue"
import { exportFile } from "@/utils/excel/ExportExcel"
import { Search } from "@element-plus/icons-vue"
const emit = defineEmits(["handclickitem"])

const handclickitem = (item: any) => {
  emit("handclickitem", item)
}

const timeRange = ref([])

const queryParams = ref<any>({
  mc: "",
  ssyqlist: "",
  startTime: "",
  endTime: "",
  page: 1,
  intPageSize: 5
})
const total = ref(0)
//分页
const handleChangePage = (info: any) => {
  queryParams.value.page = info.page
  getData()
}

const cardList = ref([
  {
    id: 1,
    mc: "1234",
    createtime: "2024-12-01 00:00:00",
    sssjname: "123",
    statue: "未处理"
  },
  {
    id: 2,
    mc: "1235",
    createtime: "2024-12-02 00:00:00",
    sssjname: "123",
    statue: "未处理"
  },
  {
    id: 3,
    mc: "1236",
    createtime: "2024-12-03 00:00:00",
    sssjname: "123",
    statue: "未处理"
  },
  {
    id: 4,
    mc: "1237",
    createtime: "2024-12-04 00:00:00",
    sssjname: "123",
    statue: "未处理"
  },
  {
    id: 5,
    mc: "1238",
    createtime: "2024-12-05 00:00:00",
    sssjname: "123",
    statue: "已处理"
  }
])
// 查询
const handleQuery = async () => {
  currentbtnTool.value = 1
  await getData()
}
const currentbtnTool = ref()

const handleExport = () => {
  currentbtnTool.value = 3

  ElMessageBox.confirm("此操作将导出excel文件, 是否继续?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    export2Excel(cardList.value)
  })
}

function export2Excel(exportData: any) {
  let fieldConfig: any = []

  fieldConfig = [
    {
      label: "问题名称",
      model: "mc"
    },
    {
      label: "所属区域",
      model: "sssjname"
    },
    {
      label: "上传时间",
      model: "createtime"
    }
  ]

  // 获取需要导出的字段配置
  const export_fields = fieldConfig.map(({ label, model }) => ({
    [model]: label
  }))
  const export_data = exportData.map((obj) => {
    const newObj: any = {}
    export_fields.forEach((field) => {
      let arr: any = Object.entries(field)[0]
      newObj[arr[1]] = obj[arr[0]]
    })
    return newObj
  })

  exportFile(export_data, "问题上报")
}

const resetQuery = () => {
  currentbtnTool.value = 2
  timeRange.value = []
  queryParams.value = {
    mc: "",
    ssyqlist: "",
    startTime: "",
    endTime: "",
    page: 1,
    intPageSize: 5
  }
  getData()
}

const search = () => {
  // queryForm.page = 1
  // getData()
}

const props = defineProps({
  equipmentId: {
    type: Number as any,
    default: null
  }
})

const options2 = ref<any>([
  {
    id: 9,
    name: "鹞落坪村"
  },
  {
    id: 8,
    name: "川岭村"
  },
  {
    id: 7,
    name: "包家村"
  },
  {
    id: 6,
    name: "石佛村"
  }
])

// watch(
//   () => props.equipmentId,
//   (newVal, oldVal) => {
//     if (newVal) {
//       getData()
//     }
//   }
// )
const getData = async () => {
  cardList.value = []
  queryParams.value.startTime = timeRange.value ? timeRange.value[0] : ""
  queryParams.value.endTime = timeRange.value ? timeRange.value[1] : ""
  queryParams.value.ssyqlist = queryParams.value.ssyqlistArr?.join(",")
  let res: any = await communityBuildingApi.GetCommunity_ReportListByPage(queryParams.value)

  if (res?.success) {
    cardList.value = res.response.data
    total.value = res.response.dataCount
  } else {
    cardList.value = []
    total.value = 0
  }
}

onMounted(() => {
  nextTick(() => {
    getData()
  })
})
onBeforeUnmount(() => {})
defineExpose({
  getData
})
</script>
<style lang="scss" scoped>
.right1 {
  height: vh(940);
  margin-top: vh(20);
}
.wrapcom {
  pointer-events: all;
  color: #ffffff;
  position: relative;

  background: url("/images/cb-bg.png") no-repeat center center/100% 100%;

  box-sizing: border-box;
  border: 1.2px solid;
  border-image: linear-gradient(180deg, rgba(193, 242, 224, 0.15) 3%, rgba(255, 255, 255, 0.35) 115%);
  backdrop-filter: blur(50px);

  // &::after {
  //   position: absolute;
  //   right: 0;
  //   bottom: 0;
  //   content: "";
  //   display: block;
  //   width: 0;
  //   height: 0;
  //   border-top: 10px solid transparent;
  //   border-right: 10px solid rgba(255, 255, 255, 0.35);
  //   border-bottom: 10px solid rgba(255, 255, 255, 0.35);
  //   border-left: 10px solid transparent;
  // }

  .wrap-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 41px;
    padding: 0 2px 0 12px;
    background: url("/statisUrl/title-bg.png") no-repeat center center / 100% 100%;
    // background: url("@/assets/IntelligentPatrol/wrap-header-bg.png") no-repeat;
    // background-size: 100% 100%;

    .title-content {
      display: flex;
    }

    .title-logo {
      height: 50px;
      width: 50px;
      margin-left: -20px;
    }

    .updatetime {
      font-family: Source Sans 3;
      font-size: 12px;
      height: 12px;
      font-weight: 400;
      line-height: 12px;
      text-align: left;
      text-underline-position: from-font;
      text-decoration-skip-ink: none;
      color: #ffffff;
      margin-right: 15px;
    }

    .title {
      display: flex;
      align-items: center;
      font-size: 16px;

      // &::before {
      //   content: "";
      //   display: inline-block;
      //   width: 17.2px;
      //   height: 16px;
      //   margin-right: 10px;
      //   background: url("@/assets/IntelligentPatrol/wrap-header-icon.png") no-repeat;
      //   background-size: 100% 100%;
      // }
    }

    .title-con {
      margin-right: vw(20);
    }
    .tabs {
      display: flex;

      align-items: center;
      height: 28px;
      padding: 2px;
      border-radius: 1px;
      // background: #11403b;
      border: 1px solid rgba(255, 255, 255, 0.25);
      // margin-left: vw(100);

      .tab {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 24px;
        text-align: center;
        opacity: 0.5;
        font-size: 14px;
        cursor: pointer;
        transition: all 1s ease 0s;

        &.active {
          opacity: 1;
          font-weight: 600;
          color: #fff;
          // border: 1px solid #42c9c7;

          background: linear-gradient(90deg, #59bbf2 0%, #336c8c 100%);
        }
      }
    }
  }
  .line {
    margin-top: -2px;
    height: 5px;
    background: url("/statisUrl/title-line.png") no-repeat center center / cover;
  }
  .linebottom {
    margin-top: -2px;
    height: 5px;
    background: url("/statisUrl/title-line2.png") no-repeat center center / cover;
  }

  .wrap-con {
    height: calc(100% - 41px);
    overflow: hidden;
    padding: vw(10);

    .select-box-community {
      height: 181px;
      width: 100%;
      padding: 0 10px;

      .fun-btn {
        padding: 0 0.8333vw;
        height: 33.73px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
        background: #000000;
        font-size: 0.7292vw;
        border: 1px solid #365375;
        border-radius: 2px;
        color: #fff;
        cursor: pointer;

        &.active {
          background: linear-gradient(270deg, #365375 0%, #5b8bb7 100%);

          img {
            opacity: 1;
          }
        }
        &:first-child {
          background: linear-gradient(to right, #5a8ab6, #375577);
        }
      }
    }

    .table-community {
      height: calc(100% - 181px);
      padding: 10px;
      .table-list {
        height: calc(100% - 59px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .odd-card {
          background: #0b2135;
          cursor: pointer;
        }
        .even-card {
          background: #202e49;
          cursor: pointer;
        }

        .card {
          display: flex;
          align-items: center;
          height: vh(102);
          border: 1px solid;
          border-image-slice: 1;
          border-image-width: 1;
          border-image-source: linear-gradient(180deg, rgba(47, 110, 221, 0.5) 0%, rgba(25, 59, 119, 0.5) 100%);
          .card-left {
            width: 80%;
            height: 100%;
            margin-left: 13px;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            font-family: Microsoft YaHei;
            font-size: 14px;
            font-weight: 400;
            line-height: 18px;
            text-align: left;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;

            color: #ddf3fc;
          }
          .card-right {
            width: 20%;
            // background: #888;
            .status-bg1 {
              font-family: Microsoft YaHei;
              font-size: 14px;
              font-weight: 400;
              line-height: 24px;
              // text-align: left;
              text-underline-position: from-font;
              text-decoration-skip-ink: none;

              width: 60px;
              height: 24px;
              background: url("/images/ycl.png") no-repeat center center/100% 100%;
            }

            .status-bg2 {
              font-family: Microsoft YaHei;
              font-size: 14px;
              font-weight: 400;
              line-height: 24px;
              // text-align: center;
              text-underline-position: from-font;
              text-decoration-skip-ink: none;

              width: 60px;
              height: 24px;
              background: url("/images/wcl.png") no-repeat center center/100% 100%;
            }
          }
        }
      }
      .pagination-community {
        // display: flex;
        // justify-content: center;
        height: 32px;
        margin: 10px 0 20px 0;
        overflow: hidden;
        :deep(.el-pagination) {
          margin-bottom: 10px;
          justify-content: center;
          font-size: 0.7292vw;
          .el-select {
            width: 6.6667vw;
          }
          .el-pager {
            li {
              color: #fff;
              margin: 0 0.2604vw;
              background-color: #0b2a4e;
              border-top-left-radius: 10px;
              border-bottom-right-radius: 10px;
              font-size: 0.7292vw;
              min-width: 1.6667vw;
            }
            li.is-active {
              color: #fff;
              background-color: #5886b2;
              border-top-left-radius: 10px;
              border-bottom-right-radius: 10px;
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
            width: 2.0833vw;
          }
          .el-pagination__jump {
            color: #fff;
            margin-left: 0.8333vw;
          }
          button,
          button.is-disabled,
          button:disabled {
            background: none;
            color: #fff;
            min-width: 1.6667vw;
            margin-left: 0.8333vw;
          }
        }
      }
    }
  }
  .tableList {
    height: 100%;

    &.el-table {
      background: transparent !important;
      color: rgba(255, 255, 255, 0.8);
      --el-table-row-hover-bg-color: linear-gradient(90deg, #29a2b0 0%, #1e4e9c 100%);
      --el-table-border: none;

      // --el-table-tr-bg-color: #204b78;
      --el-table-tr-bg-color: #183559;

      // --el-fill-color-lighter: #183559;
      --el-fill-color-lighter: #204b78;
      .el-table__cell {
        color: #a7d2ca;
        padding: 0;

        border-bottom: 2px solid #172e50 !important;
        color: #dde3e8 !important;
      }

      tbody tr {
        height: 32px;
      }
    }
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
}

.el-form-item__label-wrap {
  display: flex;
  color: #fff;
}
:deep(.el-select__wrapper) {
  align-items: center;
  background-color: #0c284d;
  box-shadow: none !important;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.1490196078);
  cursor: pointer;
  display: flex;
  font-size: 14px;
  gap: 6px;
  line-height: 24px;
  min-height: 32px;
  padding: 4px 12px;
  position: relative;
  text-align: left;
  transform: translateZ(0);
  transition: var(--el-transition-duration);
  // width: vw(310);
}
:deep(.el-range-editor) {
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.1490196078);
}

.el-form--inline .el-form-item {
  display: inline-flex;
  // margin-right: 10px;
  vertical-align: middle;
}

:deep(.el-tag.is-closable) {
  padding-right: 5px;
  background: rgba(0, 0, 0, 0);
}

:deep(.el-form-item__label) {
  align-items: flex-start;
  box-sizing: border-box;
  color: var(--el-text-color-regular);
  display: inline-flex;
  flex: 0 0 auto;
  font-size: var(--el-form-label-font-size);
  height: 32px;
  justify-content: flex-end;
  line-height: 32px;
  padding: 0 12px 0 0;
  color: #fff;
}

:deep(.el-input) {
  height: 30px;
  width: vw(350);
  color: #fff;

  border: 1px solid #ffffff26;
  position: relative;
  border-radius: 1px;
  outline: none;
  text-indent: 25px;
  background-color: transparent;
  font-size: 14px;
  background: #0c284d;

  .el-input__wrapper {
    padding: 0px 7px;
    box-shadow: unset;
    background-color: transparent;

    .el-input__inner {
      color: #fff;
    }

    .el-input__inner::placeholder {
      font-size: 12px;
      color: rgba(217, 217, 217, 0.5);
    }

    &.is-focus {
      box-shadow: unset;
    }
  }
  // background: #0C284D;

  .el-input-group__append {
    background-color: transparent;
    color: #fff;
    box-shadow: unset;

    .el-button {
      padding: 3px 11px;
      font-weight: 550;
    }
  }
}
:deep(.el-form-item) {
  width: 100%;
}
</style>
<style lang="scss">
.el-date-editor {
  background-color: #0c284d;
  color: #aab4c1;
  box-shadow: none;
}
.el-range-input {
  color: #aab4c1;
}
.el-range-separator {
  color: #aab4c1;
}
</style>
