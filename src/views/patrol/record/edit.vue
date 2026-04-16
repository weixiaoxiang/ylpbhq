<script lang="ts" setup>
import { GetPatrolTimeAxis, GetPatrolTrajectoryRoute, GetRwgl_Gjxq } from "@/api"
interface Props {
  data?: any
  map: any
}
const props = withDefaults(defineProps<Props>(), {
  data: {},
  map: {} as any
})
const emit = defineEmits<{
  "update:show": [boolean]
}>()
const proxy = getCurrentInstance()!.proxy as any
// const { rwRouteList, ryList } = useConfigStore()
const tab = ref<string>("基本信息")
const changeTab = (_tab: string) => {
  tab.value = _tab
}
const back = () => {
  emit("update:show", false)
  // 删除轨迹
  if (trackReplay) {
    trackReplay.destroyed()
    trackReplay = null
  }
}
const form = ref<any>({})
let trackReplay: any = null
const isPlay = ref<boolean>(false)
const speed = ref<number>(5)
const progress = ref<number>(0)
const changeSpeed = (val: any) => {
  if (trackReplay) {
    trackReplay.setSpeed(val)
  }
}
const replay = () => {
  if (trackReplay) {
    trackReplay.destroyed()
    trackReplay = null
    isPlay.value = false
    progress.value = 0
  }
  play()
}
// 创建轨迹对象
const createTrackReplay = () => {
  // const pathFeature: any = new GeoJSON().readFeature(path)
  const coors = listArr.value.trajectory.map((item: any) => [parseFloat(item.lon), parseFloat(item.lat)])
  const pathFeature = new Feature({
    geometry: new LineString(coors)
  })
  // 定位
  props.map.getView().fit(pathFeature.getGeometry(), {
    maxZoom: 18,
    padding: [50, 50, 50, 50]
  })
  trackReplay = new TrackReplay({
    map: props.map,
    feature: pathFeature,
    speed: speed.value,
    showFirstPoint: false,
    showNode: true,
    styles: {
      StartPoint: new Style({
        image: new Icon({
          src: proxy.$fun.getImg("patrol/legend-icon1.png"),
          scale: 1.5,
          anchor: [0.5, 1]
        })
      }),
      EndPoint: new Style({
        image: new Icon({
          src: proxy.$fun.getImg("patrol/legend-icon2.png"),
          scale: 1.5,
          anchor: [0.5, 1]
        })
      })
    },
    onEnd: () => {
      isPlay.value = false
    },
    onProcess: (_progress: any) => {
      progress.value = Number(_progress)
    }
  })
}
const play = () => {
  if (!trackReplay) {
    createTrackReplay()
  }
  // 暂停或播放
  isPlay.value = !isPlay.value
  if (isPlay.value) {
    if (progress.value === 100) progress.value = 0
    trackReplay.startAnimation()
  } else {
    trackReplay.stopAnimation()
  }
}
const listArr = ref<any>({
  trajectory: [],
  completes: [],
  info: {
    Xhtime: 0,
    Xhkm: 0,
    AllClockPoint: 0,
    DoneClockPoint: 0,
    AlarmCount: 0,
    CollectionCount: 0,
    Xhtype: ""
  },
  collections: [],
  callThePolices: []
})
const getDataList = async (Id: any) => {
  // 完成情况
  const { response: data1, success: success1, msg: msg1 } = await GetPatrolTimeAxis({ patrolRecordId: Id })
  // 轨迹数据、采集报警列表
  const { response: data2, success: success2, msg: msg2 } = await GetPatrolTrajectoryRoute({ patrolRecordId: Id })
  // 信息
  const { response: data3, success: success3, msg: msg3 } = await GetRwgl_Gjxq({ patrolRecordId: Id })

  if (success1) {
    listArr.value.completes = data1
  } else {
    ElMessage.info(msg1)
  }

  if (success2) {
    listArr.value.collections = data2.collectingInformations
    listArr.value.callThePolices = data2.alarmInformations
    listArr.value.trajectory = data2.patrolTrajectory // 轨迹坐标数组
    // todo 轨迹测试数据
    // listArr.value.trajectory = [
    //   { lon: 116.11326942416743, lat: 30.96706654827766 },
    //   { lon: 116.13007336168941, lat: 30.9742389610922 },
    //   { lon: 116.14954132458767, lat: 30.988481320598826 },
    //   { lon: 116.16306643999862, lat: 31.00159658090069 },
    //   { lon: 116.17382505453004, lat: 31.016863564108842 },
    //   { lon: 116.17597677743632, lat: 31.032950257535138 },
    //   { lon: 116.17505461047648, lat: 31.045553205986238 },
    //   { lon: 116.17864082157413, lat: 31.04893448483897 },
    //   { lon: 116.18335411311502, lat: 31.0540576361793 },
    //   { lon: 116.18878465813235, lat: 31.055492119680288 }
    // ]
    // 判断是否有轨迹
    if (listArr.value.trajectory?.length === 0) {
      return ElMessage.info("暂无轨迹数据！")
    } else {
      // 创建轨迹对象
      createTrackReplay()
    }
  } else {
    ElMessage.info(msg2)
  }
  if (data3) {
    listArr.value.info = data3?.[0]
  }
}
watch(
  () => props.data,
  (val) => {
    if (val) {
      form.value = JSON.parse(JSON.stringify(val))

      if (form.value.TakeId) {
        // 获得完成情况和轨迹回放、采集点报警点列表
        getDataList(form.value.Id)
      }
    }
  },
  {
    deep: true,
    immediate: true
  }
)
</script>
<template>
  <div class="edit-panel">
    <div class="title">
      <div class="title-text">
        <img
          :src="$fun.getImg('patrol/edit-title.png')"
          alt=""
        />
        查看巡护记录
      </div>
      <div
        class="back"
        @click="back"
      >
        <img
          :src="$fun.getImg('patrol/edit-back.png')"
          alt=""
        />
      </div>
    </div>
    <div class="tabs">
      <div
        class="tab-item"
        :class="{ active: tab === '基本信息' }"
        @click="changeTab('基本信息')"
      >
        基本信息
      </div>
      <div
        class="tab-item"
        :class="{ active: tab === '采集点' }"
        @click="changeTab('采集点')"
      >
        采集点
      </div>
      <div
        class="tab-item"
        :class="{ active: tab === '报警点' }"
        @click="changeTab('报警点')"
      >
        报警点
      </div>
    </div>
    <el-scrollbar
      class="scrollbar"
      height="100%"
    >
      <div
        v-if="tab === '基本信息'"
        class="form"
      >
        <div class="info">
          <div class="info-title">基础信息</div>
          <div class="info-box">
            <div class="item row-item">
              <div class="label">巡护人员:</div>
              <div class="value">{{ form.User_Name }}</div>
            </div>
            <div class="item row-item">
              <div class="label">开始时间:</div>
              <div class="value">{{ form.StartTime }}</div>
            </div>
            <div class="item row-item">
              <div class="label">结束时间:</div>
              <div class="value">{{ form.StopTime }}</div>
            </div>
          </div>
        </div>
        <div class="info">
          <div class="info-title">轨迹回放</div>
          <div class="trajectory-box">
            <div class="tool">
              <div>速度控制</div>
              <div>
                <el-slider
                  class="slider1"
                  v-model="speed"
                  :min="1"
                  :max="30"
                  @change="changeSpeed"
                />
              </div>
            </div>
            <div class="tool">
              <div>播放进度</div>
              <el-slider
                class="slider2"
                v-model="progress"
                :disabled="true"
              />
            </div>
            <div class="btns">
              <div @click="replay">重放</div>
              <div @click="play">{{ isPlay ? "暂停" : "播放" }}</div>
            </div>
          </div>
        </div>

        <el-scrollbar height="100%">
          <div class="info">
            <div class="info-title">完成情况</div>
            <div
              v-if="listArr.completes?.length > 0"
              class="steps"
            >
              <div
                v-for="(item, i) in listArr.completes"
                :key="i"
                class="step"
              >
                <div class="time">{{ item.time }}</div>
                <div class="status">{{ item.name }}</div>
              </div>
            </div>
            <EmptyData
              :image-size="80"
              v-else
            />
          </div>
          <div class="info">
            <div class="statistics">
              <div class="statistics-item">
                <img
                  :src="$fun.getImg('patrol/edit-pf-icon1.png')"
                  alt=""
                />
                <div>
                  <div class="value">{{ listArr?.info?.Xhtime }}</div>
                  <div class="label">巡护总时长</div>
                </div>
              </div>
              <div class="statistics-item">
                <img
                  :src="$fun.getImg('patrol/edit-pf-icon2.png')"
                  alt=""
                />
                <div>
                  <div class="value">{{ listArr?.info?.Xhkm }}</div>
                  <div class="label">巡护里程</div>
                </div>
              </div>
              <div class="statistics-item">
                <img
                  :src="$fun.getImg('patrol/edit-pf-icon3.png')"
                  alt=""
                />
                <div>
                  <div class="value">{{ listArr?.info?.AllClockPoint }}</div>
                  <div class="label">计划打卡点</div>
                </div>
              </div>
              <div class="statistics-item">
                <img
                  :src="$fun.getImg('patrol/edit-pf-icon4.png')"
                  alt=""
                />
                <div>
                  <div class="value">{{ listArr?.info?.DoneClockPoint }}</div>
                  <div class="label">完成打卡点</div>
                </div>
              </div>
              <div class="statistics-item">
                <img
                  :src="$fun.getImg('patrol/edit-pf-icon5.png')"
                  alt=""
                />
                <div>
                  <div class="value">{{ listArr?.info?.AlarmCount }}</div>
                  <div class="label">报警点数</div>
                </div>
              </div>
              <div class="statistics-item">
                <img
                  :src="$fun.getImg('patrol/edit-pf-icon6.png')"
                  alt=""
                />
                <div>
                  <div class="value">{{ listArr?.info?.CollectionCount }}</div>
                  <div class="label">采集点数</div>
                </div>
              </div>
              <div class="statistics-item">
                <img
                  :src="$fun.getImg('patrol/edit-pf-icon7.png')"
                  alt=""
                />
                <div>
                  <div class="value">{{ listArr?.info?.Xhtype }}</div>
                  <div class="label">巡护方式</div>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <div
        v-if="tab === '采集点'"
        class="con"
      >
        <template v-if="listArr.collections?.length > 0">
          <div
            v-for="(item, i) in listArr.collections"
            :key="i"
            class="box"
          >
            <div class="sort">{{ i + 1 }}</div>
            <div class="box-item">
              <img
                :src="$fun.getImg('patrol/name-icon.png')"
                alt=""
              />
              <span class="name">名称:</span>
              <span class="value">{{ item.collectionname }}</span>
            </div>
            <div class="box-item">
              <img
                :src="$fun.getImg('patrol/time-icon.png')"
                alt=""
              />
              <span class="name">时间:</span>
              <span class="value">{{ item.uploaddate }}</span>
            </div>
          </div>
        </template>
        <EmptyData
          :image-size="80"
          v-else
        />
      </div>
      <div
        v-if="tab === '报警点'"
        class="con"
      >
        <template v-if="listArr.callThePolices?.length > 0">
          <div
            v-for="(item, i) in listArr.callThePolices"
            :key="i"
            class="box"
          >
            <div class="sort">{{ i + 1 }}</div>
            <div class="box-item">
              <img
                :src="$fun.getImg('patrol/name-icon.png')"
                alt=""
              />
              <span class="name">名称:</span>
              <span class="value">{{ item.collectionname }}</span>
            </div>
            <div class="box-item">
              <img
                :src="$fun.getImg('patrol/time-icon.png')"
                alt=""
              />
              <span class="name">时间:</span>
              <span class="value">{{ item.uploaddate }}</span>
            </div>
          </div>
        </template>
        <EmptyData
          :image-size="80"
          v-else
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
.edit-panel {
  width: 420px;
  position: absolute;
  top: 20px;
  right: 20px;
  bottom: 20px;
  background-color: rgba(11, 25, 39, 0.9);
  border: 1px solid #505b65;
  border-radius: 6px;
  box-shadow: 0 0 10px 1px rgba(255, 255, 255, 0.2) inset;
  z-index: 1;
  font-size: 14px;
  color: #fff;
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    line-height: 2em;
    background-color: rgba(61, 69, 79, 0.3);
    .title-text {
      display: flex;
      align-items: center;
      color: #b6c9e5;
      font-size: 16px;
      gap: 5px;
      img {
        width: 16px;
        height: 16px;
      }
    }
    .back {
      width: 18px;
      height: 16px;
      cursor: pointer;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .tabs {
    display: flex;
    gap: 10px;
    padding: 10px 10px 0 10px;
    user-select: none;
    .tab-item {
      line-height: 2.5em;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgb(28, 45, 63);
      cursor: pointer;
      &.active {
        background: linear-gradient(to bottom, #8ec4e4, #3275c0);
      }
    }
  }
  .scrollbar {
    height: calc(100% - 90px);
  }
  :deep(.form) {
    padding: 10px 20px;
    .el-input.is-disabled {
      .el-input__wrapper {
        background-color: #1a2d3f;
      }
    }
    .is-disabled.el-select__wrapper {
      background-color: #1a2d3f;
    }
    .el-form-item__label {
      color: #fff;
    }
    .el-input__wrapper,
    .el-select__wrapper {
      background-color: #121f28;
      box-shadow: none;
      border: 1px solid #656d74;
      border-radius: 0;
    }
    .el-input-group__append {
      box-shadow: none;
      background-color: #53616d;
      color: #bac0c5;
    }
    .el-textarea__inner {
      box-shadow: none;
      background-color: #121f28;
      border: 1px solid #656d74;
      color: #bac0c5;
    }
    .el-radio-group {
      .el-radio__input.is-checked + .el-radio__label {
        color: #3be12f;
      }
      .el-radio__input.is-checked .el-radio__inner {
        border-color: #3be12f;
        background: #3be12f;
      }
    }
    .el-slider {
      .el-slider__bar {
        background-color: transparent;
      }
      .el-slider__runway {
        background: linear-gradient(to right, #d9eafe, #3f5266);
      }
      &.slider1 {
        .el-slider__button-wrapper {
          // background: url("@/assets/images/patrol/slider-icon1.png") no-repeat center center / 14px 16px;
          .el-slider__button {
            // display: none;
            border: none;
            background: url("@/assets/images/patrol/slider-icon1.png") no-repeat center center / 14px 16px;
          }
        }
      }
      &.slider2 {
        .el-slider__button-wrapper {
          background: url("@/assets/images/patrol/slider-icon2.png") no-repeat center center / 16px 16px;
          .el-slider__button {
            display: none;
          }
        }
      }
    }

    .info {
      position: relative;
      color: #fff;
      padding: 10px 0;
      min-height: 200px;
      .info-title {
        color: #fff;
        font-size: 16px;
        margin-bottom: 10px;
        padding-left: 34px;
        background: url("@/assets/images/patrol/edit-title-bg.png") no-repeat left center;
      }
      .info-box {
        display: flex;
        flex-wrap: wrap;
        overflow: hidden;
        .item {
          display: flex;
          width: 100%;
          line-height: 3em;
          text-overflow: ellipsis;
          white-space: nowrap;
          .label {
            width: 70px;
          }
          .value {
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
      .trajectory-box {
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: 200px;
        background-color: #1b2c3e;
        padding: 8px;
        .tool {
          color: #9dbad7;
          line-height: 2em;
          padding-left: 10px;
        }
      }
      .steps {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 10px;
        overflow-y: auto;
        .step {
          height: 60px;
          padding-left: 20px;
          background: url("@/assets/images/patrol/step-left-bg.png") no-repeat left center;
          line-height: 2em;
          .status {
            font-size: 16px;
          }
        }
      }
      .statistics {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        .statistics-item {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 72px;
          gap: 5px;
          background: url("@/assets/images/patrol/edit-statistics-bg.png") no-repeat center center / 100% 100%;
          img {
            width: 36px;
            height: 36px;
          }
          > div {
            .value {
              font-size: 16px;
            }
            .label {
              font-size: 14px;
              color: #abb1b7;
            }
          }
        }
      }
    }
  }
  .con {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    padding: 10px;
    .box {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      box-shadow: 0px 0px 4px 1px rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      font-size: 16px;
      border: #3b5b7f solid 1px;
      color: #aab2b8;
      cursor: pointer;
      &:hover {
        background: linear-gradient(to bottom, rgba(37, 100, 171, 0.5), rgba(23, 44, 71, 0.5));
        color: #fff;
      }
      .box-item {
        display: flex;
        gap: 10px;
        align-items: center;
        img {
          width: 24px;
          height: 24px;
        }
      }
      .sort {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 14px;
        color: #fff;
        padding: 5px 16px;
        background: linear-gradient(to bottom, #708498, #455b79);
        border-bottom-left-radius: 14px;
      }
    }
  }
  .btns {
    display: flex;
    align-items: center;
    gap: 10px;
    > div {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 2em;
      background-color: #020a11;
      font-size: 16px;
      color: #fff;
      border: 1px #365375 solid;
      cursor: pointer;
    }
    & > div:last-child {
      background: linear-gradient(to right, #5a8ab6, #375577);
    }
  }
}
</style>
