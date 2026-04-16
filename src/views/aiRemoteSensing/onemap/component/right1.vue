<template>
  <div class="right1 wrapair">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">监测设备</div>
      </div>
    </div>
    <div class="line"></div>
    <div class="wrap-con">
      <el-table
        class="tableList"
        :data="tableList"
        stripe
        show-overflow-tooltip
      >
        <el-table-column
          prop="name"
          label="设备类型"
          align="center"
        />
        <el-table-column
          prop="onlinecount"
          align="center"
        >
          <template #header>
            <div class="online-count">
              <img
                :src="$fun.getImg('aiRemoteSensing/online-icon.png')"
                alt=""
              />
              在线
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="offlinecount"
          align="center"
        >
          <template #header>
            <div class="offline-count">
              <img
                :src="$fun.getImg('aiRemoteSensing/offline-icon.png')"
                alt=""
              />
              离线
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { oneMapApi } from "@/api/aiRemoteSensing/index"
const emit = defineEmits(["handclickitem"])
const tableList = ref([])

const getData = async () => {
  oneMapApi.getMonitorEquipmentList().then((res: any) => {
    tableList.value = res.response
  })
}

onMounted(() => {
  nextTick(() => {
    getData()
  })
})
onBeforeUnmount(() => {})
</script>
<style lang="scss" scoped>
.right1 {
  height: vh(520);
  margin-top: vh(10);
}
.wrapair {
  pointer-events: all;
  color: #ffffff;
  position: relative;

  background: url("/images/cb-bg.png") no-repeat center center/100% 100%;

  box-sizing: border-box;
  border: 1.2px solid;
  border-image: linear-gradient(180deg, rgba(193, 242, 224, 0.15) 3%, rgba(255, 255, 255, 0.35) 115%);
  backdrop-filter: blur(50px);
  .wrap-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 41px;
    padding: 0 2px 0 12px;
    background: url("@/assets/images/title-bg.png") no-repeat center center / 100% 100%;
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
      border: 1px solid rgba(255, 255, 255, 0.25);
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
          background: linear-gradient(90deg, #59bbf2 0%, #336c8c 100%);
        }
      }
    }
  }
  .line {
    margin-top: -2px;
    height: 5px;
    background: url("@/assets/images/title-line.png") no-repeat center center / cover;
  }
  .linebottom {
    margin-top: -2px;
    height: 5px;
    background: url("@/assets/images/title-line2.png") no-repeat center center / cover;
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
        width: 88.55px;
        height: 33.73px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #00000080;
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
      }
      .right-btn {
        display: flex;
        width: 76%;
        justify-content: flex-end;
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
            .status-bg1 {
              font-family: Microsoft YaHei;
              font-size: 14px;
              font-weight: 400;
              line-height: 24px;
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
        display: flex;
        justify-content: center;
        height: 32px;
        margin-top: 27px;
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
      --el-table-tr-bg-color: #183559;
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
      td,
      .building-top .el-table th.is-leaf {
        border: none !important;
        color: #c2c8cf !important;
      }
    }
  }
}
:deep(.tableList) {
  background: transparent !important;

  &.el-table {
    font-size: 0.7292vw;
    // background-color: transparent !important;
    background-color: rgba(23, 48, 76, 0.6);
  }

  th.el-table__cell {
    background-color: #204b78 !important;
    border-bottom: 2px solid #172e50 !important;
    color: #dde3e8 !important;
  }

  .el-table--striped .el-table__body tr.el-table__row--striped td {
    background: #082948;
  }

  .el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
    background: #194570;
  }

  tr {
    background: #183559 !important;
  }

  td,
  .building-top .el-table th.is-leaf {
    border: none !important;
    color: #c2c8cf !important;
  }

  .el-table--enable-row-hover .el-table__body tr:hover > td {
    background-color: #082948;
  }

  .el-table__body tr.hover-row.current-row > td.el-table__cell,
  .el-table__body tr.hover-row.el-table__row--striped.current-row > td.el-table__cell,
  .el-table__body tr.hover-row.el-table__row--striped > td.el-table__cell,
  .el-table__body tr.hover-row > td.el-table__cell {
    background-color: rgba(0, 0, 0, 0.3) !important;
  }

  .el-table__inner-wrapper:before {
    height: 0 !important;
  }
  .online-count,
  .offline-count {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
  .online-count {
    color: #14c56b;
  }
  .offline-count {
    color: #fe514b;
  }
}
</style>
