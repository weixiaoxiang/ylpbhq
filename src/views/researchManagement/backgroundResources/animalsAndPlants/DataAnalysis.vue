<script lang="ts" setup>
import { GetFloraFauna, GetNumberStatistics } from "@/api"

// 获得统计数据
const statistics1 = ref<any>({})
const statistics2 = ref<any>({})
const getStatistics = async () => {
  const { response: res1 } = await GetNumberStatistics({
    type: "动物"
  })
  statistics1.value = res1
  const { response: res2 } = await GetNumberStatistics({
    type: "植物"
  })
  statistics2.value = res2
}

const tableColumns = ref<any[]>([
  {
    label: "名称",
    prop: "name"
  },
  {
    label: "物种数量",
    prop: "count"
  }
])
const tableData1 = ref<any>([{}])
const tableData2 = ref<any>([{}])
const barData1 = ref<any>(null)
const barData2 = ref<any>(null)
const getTableData1 = async () => {
  const { response } = await GetFloraFauna({
    type: "动物",
    basis: currentClass.value[0]
  })
  tableData1.value = response
  if (response?.length > 0) {
    barData1.value = {
      dw: "个",
      xAxis: response?.map((item: any) => item.name),
      data: [
        {
          name: "数量",
          data: response.map((item: any) => ({
            label: item.name,
            value: item.count
          }))
        }
      ]
    }
  } else {
    barData1.value = null
  }
}
const getTableData2 = async () => {
  const { response } = await GetFloraFauna({
    type: "植物",
    basis: currentClass.value[0]
  })
  tableData2.value = response.map((item: any) => ({
    name: item.name,
    count: item.count,
    label: item.label,
    value: item.value
  }))
  if (response?.length > 0) {
    barData2.value = {
      dw: "个",
      xAxis: response?.map((item: any) => item.name),
      data: [
        {
          name: "数量",
          data: response.map((item: any) => ({
            label: item.name,
            value: item.count
          }))
        }
      ]
    }
  } else {
    barData2.value = null
  }
}
const currentClass = ref("门所属动植物")
const classification = ["门所属动植物", "纲所属动植物", "目所属动植物", "科所属动植物", "属所属动植物"]
// 切换分类
const changeCurrentClass = (val: string) => {
  currentClass.value = val
  getTableData1()
  getTableData2()
}
// 切换图表
const currentChart1 = ref("图形")
const currentChart2 = ref("图形")
const changeCurrentChart1 = async (val: string) => {
  currentChart1.value = val
}
const changeCurrentChart2 = (val: string) => {
  currentChart2.value = val
}
onMounted(() => {
  getStatistics() // 获得统计数据
  getTableData1()
  getTableData2()
})
</script>
<template>
  <div class="data-panel">
    <div class="title-box">
      <img
        :src="$fun.getImg('researchManagement/icon14.png')"
        alt=""
      />
      统计分析
    </div>
    <div class="mian panzoom-exclude">
      <div class="main-box">
        <div class="info-box">
          <div class="hd">
            <img
              :src="$fun.getImg('backgroundResources/icon1.png')"
              alt=""
            />
            <span>动物界</span>
          </div>
          <div class="section1">
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon2.png')"
                alt=""
              />
              <div>
                <div class="value">{{ statistics1.zl }}</div>
                <div class="name">动物分类</div>
              </div>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon3.png')"
                alt=""
              />
              <div>
                <div class="value">{{ statistics1.zx }}</div>
                <div class="name">珍稀动物</div>
              </div>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon4.png')"
                alt=""
              />
              <div>
                <div class="value">{{ statistics1.yjbh }}</div>
                <div class="name">国家Ⅰ级</div>
              </div>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon5.png')"
                alt=""
              />
              <div>
                <div class="value">{{ statistics1.ejbh }}</div>
                <div class="name">国家Ⅱ级</div>
              </div>
            </div>
          </div>
          <div class="section2">
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon6.png')"
                alt=""
              />
              <span>门：{{ statistics1.men }}</span>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon6.png')"
                alt=""
              />
              <span>纲：{{ statistics1.gang }}</span>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon6.png')"
                alt=""
              />
              <span>目：{{ statistics1.mu }}</span>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon6.png')"
                alt=""
              />
              <span>科：{{ statistics1.ke }}</span>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon6.png')"
                alt=""
              />
              <span>属：{{ statistics1.shu }}</span>
            </div>
          </div>
        </div>
        <div class="info-box">
          <div class="hd">
            <img
              :src="$fun.getImg('backgroundResources/icon1.png')"
              alt=""
            />
            <span>植物界</span>
          </div>
          <div class="section1">
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon2.png')"
                alt=""
              />
              <div>
                <div class="value">{{ statistics2.zl }}</div>
                <div class="name">植物分类</div>
              </div>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon7.png')"
                alt=""
              />
              <div>
                <div class="value">{{ statistics2.zx }}</div>
                <div class="name">珍稀植物</div>
              </div>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon4.png')"
                alt=""
              />
              <div>
                <div class="value">{{ statistics2.yjbh }}</div>
                <div class="name">国家Ⅰ级</div>
              </div>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon5.png')"
                alt=""
              />
              <div>
                <div class="value">{{ statistics2.ejbh }}</div>
                <div class="name">国家Ⅱ级</div>
              </div>
            </div>
          </div>
          <div class="section2">
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon6.png')"
                alt=""
              />
              <span>门：{{ statistics2.men }}</span>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon6.png')"
                alt=""
              />
              <span>纲：{{ statistics2.gang }}</span>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon6.png')"
                alt=""
              />
              <span>目：{{ statistics2.mu }}</span>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon6.png')"
                alt=""
              />
              <span>科：{{ statistics2.ke }}</span>
            </div>
            <div>
              <img
                :src="$fun.getImg('backgroundResources/icon6.png')"
                alt=""
              />
              <span>属：{{ statistics2.shu }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="contain-box">
        <div class="hd">
          <img
            :src="$fun.getImg('backgroundResources/icon1.png')"
            alt=""
          />
          <span>统计分析</span>
        </div>
        <div class="classification">
          <div
            v-for="item in classification"
            :key="item"
            :class="{ current: currentClass === item }"
            @click="changeCurrentClass(item)"
          >
            {{ item }}
          </div>
        </div>
        <div
          class="main-box"
          style="flex: 1"
        >
          <div class="item-box">
            <div class="type">动物分类</div>
            <div class="tool-box">
              <div
                :class="{ current: currentChart1 === '图形' }"
                @click="changeCurrentChart1('图形')"
              >
                <img
                  :src="$fun.getImg('backgroundResources/a4.png')"
                  alt=""
                />
                图形
              </div>
              <div
                :class="{ current: currentChart1 === '表格' }"
                @click="changeCurrentChart1('表格')"
              >
                <img
                  :src="$fun.getImg('backgroundResources/a5.png')"
                  alt=""
                />
                表格
              </div>
            </div>
            <div class="table-box">
              <ElTablePanel
                v-if="currentChart1 === '表格'"
                :show-index="true"
                :columns="tableColumns"
                :data="tableData1"
              />
              <BarReversalChartPanel
                v-if="currentChart1 === '图形'"
                :show-legend="false"
                :colors="['#3690f8|#7ee8ec']"
                :gradient="true"
                :data="barData1"
              />
            </div>
          </div>
          <div class="item-box">
            <div class="type">植物分类</div>
            <div class="tool-box">
              <div
                :class="{ current: currentChart2 === '图形' }"
                @click="changeCurrentChart2('图形')"
              >
                <img
                  :src="$fun.getImg('backgroundResources/a4.png')"
                  alt=""
                />
                图形
              </div>
              <div
                :class="{ current: currentChart2 === '表格' }"
                @click="changeCurrentChart2('表格')"
              >
                <img
                  :src="$fun.getImg('backgroundResources/a5.png')"
                  alt=""
                />
                表格
              </div>
            </div>
            <div class="table-box">
              <ElTablePanel
                v-if="currentChart2 === '表格'"
                :show-index="true"
                :columns="tableColumns"
                :data="tableData2"
              />
              <BarReversalChartPanel
                v-if="currentChart2 === '图形'"
                :show-legend="false"
                :colors="['#3690f8|#7ee8ec']"
                :gradient="true"
                :data="barData2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-panel {
  width: 62.5vw;
  height: 720px;
  background: url("@/assets/images/dialog-bg.png") no-repeat center center / 100% 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .title-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70px;
    img {
      width: 1.3542vw;
      margin-right: 0.5208vw;
    }
  }
  .mian {
    flex: 1;
    display: flex;
    padding: 0 24px 24px 24px;
    flex-direction: column;
    overflow-y: hidden;
    .main-box {
      display: flex;
      gap: 0.5208vw;
      overflow-y: hidden;
      > div {
        flex: 1;
      }
    }
    .info-box {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .hd {
      display: flex;
      align-items: center;
      height: 1.6667vw;
      color: #3be3de;
      gap: 0.3125vw;
      img {
        width: 0.9375vw;
      }
    }
    .section1 {
      display: flex;
      gap: 0.2083vw;
      > div {
        width: 6.8229vw;
        height: 3.4375vw;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.4167vw;
        img {
          width: 1.5625vw;
          height: 1.5625vw;
        }
        .value {
          color: #3be3de;
          font-size: 1.0417vw;
        }
        .name {
          color: #999;
          font-size: 0.625vw;
        }
      }
      > div:nth-child(1) {
        background: url("@/assets/images/backgroundResources/bg1.png") no-repeat center center / 100% 100%;
      }
      > div:nth-child(2) {
        background: url("@/assets/images/backgroundResources/bg2.png") no-repeat center center / 100% 100%;
      }
      > div:nth-child(3) {
        background: url("@/assets/images/backgroundResources/bg1.png") no-repeat center center / 100% 100%;
      }
      > div:nth-child(4) {
        background: url("@/assets/images/backgroundResources/bg2.png") no-repeat center center / 100% 100%;
      }
    }
    .section2 {
      display: flex;
      gap: 1.0417vw;
      font-size: 12px;
      color: #999;
      > div {
        display: flex;
        align-items: center;
        gap: 0.2083vw;
        img {
          width: 0.625vw;
        }
      }
    }
    .classification {
      display: flex;
      gap: 0.2083vw;
      color: #fff;
      > div {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 8.8542vw;
        height: 2.0313vw;
        font-size: 0.8333vw;
        background: url("@/assets/images/backgroundResources/a1.png") no-repeat center center / 100% 100%;
        transition: color 0.3s;
        cursor: pointer;
        &.current {
          color: #3be3de;
          background: url("@/assets/images/backgroundResources/a2.png") no-repeat center center / 100% 100%;
        }
      }
    }
    .contain-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5208vw;
      opacity: 0.8;
      overflow: hidden;
      margin-top: 10px;
      .item-box {
        position: relative;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        .type {
          margin: 0.5208vw auto;
          width: 8.8542vw;
          height: 1.3542vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: url("@/assets/images/backgroundResources/a3.png") no-repeat center center / 100% 100%;
          color: #fff;
        }
        .tool-box {
          position: absolute;
          top: 0.625vw;
          right: 2px;
          display: flex;
          gap: 0.4167vw;
          > div {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.2083vw;
            font-size: 0.625vw;
            padding: 0.1563vw 0.3125vw;
            border: 1px solid #3be3de;
            color: #3be3de;
            border-radius: 0.1042vw;
            cursor: pointer;
            img {
              width: 0.7292vw;
              height: 0.7292vw;
            }
            &.current {
              border-color: orangered;
              background-color: rgba(255, 69, 0, 0.3);
            }
          }
        }
        .table-box {
          flex: 1;
          // height: 400px;
          overflow: hidden;
        }
      }
    }
  }
}
</style>
