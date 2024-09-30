<script lang="ts" setup>
import CountUp from "vue-countup-v3"
import PageTabs from "../components/PageTabs.vue"
import Tree from "./Tree.vue"
import MapPopup from "../components/Popup.vue"

defineOptions({
  name: "Survey"
})
const time = ref("")
const showTree = ref(false)
const changeShowTree = () => {
  showTree.value = !showTree.value
}
const popup = ref<any>(null)
useOlMap(popup)

const gjTableColumns = ref([
  {
    prop: "v1",
    label: "巡护时间",
    width: "120px",
    showOverflowTooltip: true
  },
  {
    prop: "v2",
    label: "巡护人"
  },
  {
    prop: "v3",
    label: "巡护方式"
    // width: "81px"
  },
  {
    prop: "v4",
    label: "巡护时长"
    // width: "81px"
  },
  {
    prop: "v5",
    label: "采集点位"
    // width: "81px"
  }
])
const gjTableData = [
  {
    v1: "2024-12-12 12:12:12",
    v2: "张三",
    v3: "张三",
    v4: "张三",
    v5: "张三"
  },
  {
    v1: "2024-12-12 12:12:12",
    v2: "张三",
    v3: "张三",
    v4: "张三",
    v5: "张三"
  },
  {
    v1: "2024-12-12 12:12:12",
    v2: "张三",
    v3: "张三",
    v4: "张三",
    v5: "张三"
  },
  {
    v1: "2024-12-12 12:12:12",
    v2: "张三",
    v3: "张三",
    v4: "张三",
    v5: "张三"
  },
  {
    v1: "2024-12-12 12:12:12",
    v2: "张三",
    v3: "张三",
    v4: "张三",
    v5: "张三"
  },
  {
    v1: "2024-12-12 12:12:12",
    v2: "魏晓翔",
    v3: "魏晓翔",
    v4: "魏晓翔",
    v5: "魏晓翔"
  }
]
const cjTableColumns = ref([
  {
    prop: "v1",
    label: "采集名称",
    showOverflowTooltip: true
  },
  {
    prop: "v2",
    label: "采集时间",
    width: "120px"
  },
  {
    prop: "v3",
    label: "采集人"
  },
  {
    prop: "v4",
    label: "描述"
  }
])
const cjTableData = [
  {
    v1: "2024-12-12 12:12:12",
    v2: "张三",
    v3: "张三",
    v4: "张三",
    v5: "张三"
  },
  {
    v1: "2024-12-12 12:12:12",
    v2: "张三",
    v3: "张三",
    v4: "张三",
    v5: "张三"
  },
  {
    v1: "2024-12-12 12:12:12",
    v2: "张三",
    v3: "张三",
    v4: "张三",
    v5: "张三"
  },
  {
    v1: "2024-12-12 12:12:12",
    v2: "张三",
    v3: "张三",
    v4: "张三",
    v5: "张三"
  },
  {
    v1: "2024-12-12 12:12:12",
    v2: "张三",
    v3: "张三",
    v4: "张三",
    v5: "张三"
  },
  {
    v1: "2024-12-12 12:12:12",
    v2: "魏晓翔",
    v3: "魏晓翔",
    v4: "魏晓翔",
    v5: "魏晓翔"
  }
]

// line chart data
const lineData = ref({
  dw: "次",
  xAxis: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  data: [
    {
      name: "去年",
      data: [120, 132, 101, 134, 90, 230, 210, 220, 182, 191, 234, 290]
    },
    {
      name: "今年",
      data: [220, 182, 191, 234, 290, 330, 310, 91, 234, 290, 290]
    }
  ]
})
const barData = ref({
  dw: "次",
  xAxis: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  data: [120, 132, 101, 134, 90, 230, 210, 220, 182, 191, 234, 290]
})
const pieData = ref([
  {
    name: "宣传牌情况",
    value: 90
  },
  {
    name: "视频点位",
    value: 190
  },
  {
    name: "固定样线",
    value: 120
  }
])
</script>

<template>
  <div class="survey relative flex h-full gap-[20px] p-[20px] text-lg text-white">
    <div
      class="map-box"
      id="map"
    >
      <MapPopup ref="popup" />
    </div>
    <div class="mt-[15px] flex flex-1 flex-col gap-[20px]">
      <div class="relative z-10 flex h-[630px] w-max">
        <div class="flex w-[255px] flex-1 flex-col items-center bg-[#0b142b] bg-opacity-50 p-4">
          <el-date-picker
            v-model="time"
            type="date"
            placeholder="请选择日期"
            size="default"
          />
          <PageTabs class="mt-32" />
        </div>
        <div
          :class="{ show: showTree }"
          class="absolute bottom-0 left-[255px] top-0 flex w-[255px] flex-col gap-3 bg-[#1e3450] bg-opacity-50 p-2"
        >
          <div class="flex items-center justify-between leading-loose">
            <span>选择人员</span>
            <el-icon
              class="cursor-pointer"
              @click="changeShowTree"
              ><i-ep-caret-bottom
            /></el-icon>
          </div>
          <Tree class="flex-1" />
        </div>
      </div>
      <div class="z-10 flex flex-1 gap-[20px] overflow-hidden">
        <div class="flex-1">
          <BasePanel title="最新轨迹">
            <template #contain>
              <ElTablePanel
                :columns="gjTableColumns"
                :data="gjTableData"
              />
            </template>
          </BasePanel>
        </div>
        <div class="flex-1">
          <BasePanel title="最新采集">
            <template #contain>
              <ElTablePanel
                :columns="cjTableColumns"
                :data="cjTableData"
              />
            </template>
          </BasePanel>
        </div>
        <div class="flex-1">
          <BasePanel title="巡护均值">
            <template #contain>
              <LineChartPanel :data="lineData" />
            </template>
          </BasePanel>
        </div>
      </div>
    </div>
    <div class="z-10 mt-[15px] flex w-[420px] flex-col gap-[20px]">
      <div class="h-[330px]">
        <BasePanel title="基础概况">
          <template #contain>
            <div class="grid h-full grid-cols-3">
              <div class="flexbox-col">
                <span class="text-custom4">巡护总里数(km)</span>
                <count-up
                  :end-val="2000"
                  class="text-light text-2xl"
                ></count-up>
                <img
                  :src="$fun.getImg('patrol/bg1.png')"
                  alt=""
                  class="-mt-3"
                />
              </div>
              <div class="flexbox-col">
                <span class="text-custom4">巡护总次数(次)</span>
                <count-up
                  :end-val="2000"
                  class="text-light text-2xl"
                ></count-up>
                <img
                  :src="$fun.getImg('patrol/bg2.png')"
                  alt=""
                  class="-mt-3"
                />
              </div>
              <div class="flexbox-col">
                <span class="text-custom4">巡护总时长(h)</span>
                <count-up
                  :end-val="2000"
                  class="text-light text-2xl"
                ></count-up>
                <img
                  :src="$fun.getImg('patrol/bg3.png')"
                  alt=""
                  class="-mt-3"
                />
              </div>
              <div class="flexbox-col">
                <span class="text-custom4">巡护报警数(次)</span>
                <count-up
                  :end-val="2000"
                  class="text-light text-2xl"
                ></count-up>
                <img
                  :src="$fun.getImg('patrol/bg4.png')"
                  alt=""
                  class="-mt-3"
                />
              </div>
              <div class="flexbox-col">
                <span class="text-custom4">巡护采集数(个)</span>
                <count-up
                  :end-val="2000"
                  class="text-light text-2xl"
                ></count-up>
                <img
                  :src="$fun.getImg('patrol/bg4.png')"
                  alt=""
                  class="-mt-3"
                />
              </div>
              <div class="flexbox-col">
                <span class="text-custom4">人员总数(人)</span>
                <count-up
                  :end-val="2000"
                  class="text-light text-2xl"
                ></count-up>
                <img
                  :src="$fun.getImg('patrol/bg4.png')"
                  alt=""
                  class="-mt-3"
                />
              </div>
            </div>
          </template>
        </BasePanel>
      </div>
      <div class="flex-1">
        <BasePanel title="趋势分析">
          <template #contain>
            <div class="flexbox gap-2 bg-[#294064] text-sm leading-loose text-custom3">
              <img
                :src="$fun.getImg('arrow-left.png')"
                alt=""
              />
              巡护次数
              <img
                :src="$fun.getImg('arrow-right.png')"
                alt=""
              />
            </div>
            <LineChartPanel
              :data="lineData"
              style="height: 240px"
            />
            <div class="flexbox gap-2 bg-[#294064] text-sm leading-loose text-custom3">
              <img
                :src="$fun.getImg('arrow-left.png')"
                alt=""
              />
              巡护里程
              <img
                :src="$fun.getImg('arrow-right.png')"
                alt=""
              />
            </div>
            <Bar3DChartPanel
              :data="barData"
              style="height: 240px"
            />
          </template>
        </BasePanel>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.survey {
  color: #fff;
  .map-box {
    width: calc(100% - 420px - 40px);
    height: calc(630px + 35px);
    position: absolute;
    top: 0;
    left: 0;
    background: url("@/assets/images/map-bg.svg") no-repeat;
    background-size: 100%;
    background-position: center;
    z-index: 0;
  }
  .show {
    height: 50px;
    overflow: hidden;
  }
}
</style>
<style lang="scss">
.survey {
  .text-light {
    text-shadow:
      -2px -2px 3px rgba(255, 255, 255, 0.7),
      2px 2px 3px rgba(255, 255, 255, 0.7) !important;
  }
  .el-input__wrapper {
    background-color: #0c284d;
    box-shadow: 0 0 0 1px #304868 inset;
  }
}
</style>
