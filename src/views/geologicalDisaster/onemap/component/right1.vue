<template>
  <div class="patrolOverview-section wrapgeo">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">基础设施</div>
      </div>
    </div>
    <div class="line"></div>
    <div class="wrap-con3">
      <div
        class="item"
        v-for="(item, i) in list"
        :key="i"
      >
        <div class="item-data">
          <div class="item-img">
            <img
              :src="item.url"
              class="item-img"
            />
            <div :class="classNames[i]"></div>
          </div>
          <div class="item-name">{{ item.name }}</div>
          <div class="item-value">
            <span>
              {{ item.value }}
            </span>
          </div>
        </div>
      </div>
      <div class="yjtable">
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
            prop="happentime"
            label="预警时间"
            align="center"
          />
          <el-table-column
            prop="monitorpointname"
            width="130"
            label="设备名称"
            align="center"
          />
          <el-table-column
            prop="levelname"
            label="预警等级"
            align="center"
          />
          <el-table-column
            prop="datatypename"
            label="预警因子"
            align="center"
          />
        </el-table>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
// import { CountTo } from "vue3-count-to"
import { geologicalDisasterApi } from "@/api/geologicalDisaster"

const classNames = ["item-name-shadow-red", "item-name-shadow-orange", "item-name-shadow-h", "item-name-shadow-blue"]

const props = defineProps({
  equipmentId: {
    type: [String, Number],
    default: null
  }
})

const list = ref<any>([
  {
    name: "红色预警",
    value: 12,
    url: "/images/geologicalDisaster/szsk-redyj.png",
    num: 0,
    decimals: 0.5
  },
  {
    name: "橙色预警",
    value: 12,
    url: "/images/geologicalDisaster/szsk-orangeyj.png",
    num: 0,
    decimals: 0.5
  },
  {
    name: "黄色预警",
    value: 5,
    url: "/images/geologicalDisaster/szsk-yellowyj.png",
    num: 0,
    decimals: 0.5
  },
  {
    name: "蓝色预警",
    value: 9,
    url: "/images/geologicalDisaster/szsk-blueyj.png",
    num: 0,
    decimals: 0.5
  }
])
const getList = () => {
  geologicalDisasterApi.GeEarlyWarningByEqId({ equipmentId: props.equipmentId }).then((res: any) => {
    if (res.success) {
      list.value.forEach((item: any) => {
        if (item.name === "红色预警") {
          item.value = res.response.redCount
        }
        if (item.name === "橙色预警") {
          item.value = res.response.orangeCount
        }
        if (item.name === "黄色预警") {
          item.value = res.response.yellowCount
        }
        if (item.name === "蓝色预警") {
          item.value = res.response.blueCount
        }
      })
    }
  })
}

const tableList = ref([])
//查询数据
const getData = () => {
  geologicalDisasterApi.GetLatestAlarmRecord({ equipmentId: props.equipmentId }).then((res: any) => {
    if (res.success) {
      tableList.value = res.response
    }
  })
}

watch(
  () => props.equipmentId,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        getData()
        getList()
      })
    }
  },
  {
    immediate: true
  }
)
</script>
<style lang="scss" scoped>
.patrolOverview-section {
  width: 100%;
  height: vh(627);
  margin-top: vh(20);
  .wrap-con3 {
    display: flex;
    flex-wrap: wrap;
    .yjtable {
      width: 100%;
      margin-top: vh(30);
      height: vh(400);
      overflow-y: auto;

      .level-red {
        height: 23px;
        display: block;
        border: 1px solid;
        background: linear-gradient(90deg, #8d2c26 0%, rgba(141, 44, 38, 0.5) 100%);
        border-image-source: linear-gradient(90deg, #cc4d44 0%, #a1190d 100%);
      }

      .level-blue {
        height: 23px;
        display: block;
        background: linear-gradient(90deg, #33b7dc 0%, rgba(51, 183, 220, 0.5) 100%);
        border: 1px solid;
        border-image-source: linear-gradient(90deg, #1eaccd 0%, #217aa2 100%);
      }

      .level-orange {
        height: 23px;
        display: block;
        border: 1px solid;
        background: linear-gradient(90deg, #7a430d 0%, rgba(122, 67, 13, 0.5) 100%);
        border-image-source: linear-gradient(90deg, #c5832d 0%, #673304 100%);
      }

      .level-yellow {
        height: 23px;
        display: block;
        background: linear-gradient(90deg, #c2bb1c 0%, rgba(194, 187, 28, 0.5) 100%);
        border: 1px solid;
        border-image-source: linear-gradient(90deg, #afa51c 0%, #46502a 100%);
      }
    }
    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: calc(100% / 4);
      background-position: center bottom;
      background-size: 100px 70px;
      height: vh(110);

      .item-data {
        margin-top: vh(10);
        .item-name {
          display: flex;
          justify-content: center;
          font-size: 14px;
          line-height: 14px;
          font-weight: 600;
          margin-bottom: vh(5);
          opacity: 0.65;
        }
        .item-img {
          width: 77px;
          height: 71px;
          position: relative;
          // box-shadow: inset 0px 0px 15px rgba(0, 0, 0, 0.3);
          // box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
        }
        .item-name-shadow-red {
          position: absolute;
          height: 20px;
          width: 10px;
          left: 50%;
          top: 20%;
          // box-shadow: inset 0px 0px 50px rgba(255, 255, 255, 1);
          box-shadow: 0px 0px 20px #ff2424;
          border-radius: 50%; /* 圆形 */
        }
        .item-name-shadow-orange {
          position: absolute;
          height: 20px;
          width: 10px;
          left: 50%;
          top: 20%;
          // box-shadow: inset 0px 0px 50px rgba(255, 255, 255, 1);
          box-shadow: 0px 0px 20px #e36403;
          border-radius: 50%; /* 圆形 */
        }
        .item-name-shadow-h {
          position: absolute;
          height: 20px;
          width: 10px;
          left: 50%;
          top: 20%;
          // box-shadow: inset 0px 0px 50px rgba(255, 255, 255, 1);
          // box-shadow: 0px 0px 20px #fbf309;
          // border-radius: 50%; /* 圆形 */
        }

        .item-name-shadow-blue {
          position: absolute;
          height: 20px;
          width: 10px;
          left: 50%;
          top: 20%;
          // box-shadow: inset 0px 0px 50px rgba(255, 255, 255, 1);
          // box-shadow: 0px 0px 20px #48cdf9;
          // border-radius: 50%; /* 圆形 */
        }
        .itemimg {
          // width: 200px;
          // height: 200px;
        }
        .item-value {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 18px;
          span {
            font-size: 18px;
            font-weight: normal;
            line-height: 18px;
            text-align: center;
            letter-spacing: 0px;
            /* A01 */
            color: #1befd7;
          }
        }
      }
      // &:nth-child(1),
      // &:nth-child(2),
      // &:nth-child(3) {
      //   margin-bottom: vh(20);
      // }
    }
  }
}

:deep(.el-scrollbar) {
  // background: #183559;
}

.el-table .cell.el-tooltip {
  min-width: 50px;
  white-space: nowrap;
  display: flex;
  align-items: center;
}
</style>
