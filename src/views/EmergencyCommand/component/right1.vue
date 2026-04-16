<script setup lang="ts">
import { GetEnvironmentalReality } from "@/api"
import { getAssetsImages } from "@/hooks/useAssetsImages"
import { min } from "xe-utils"
const filed = ref([
  {
    name: "湿度",
    value: "0",
    icon: getAssetsImages("emergencyCommand/sd.png"),
    unit: "%"
  },
  {
    name: "南风",
    value: "0",
    icon: getAssetsImages("emergencyCommand/nf.png"),
    unit: "m/s"
  },
  {
    name: "负氧离子",
    value: "0",
    icon: getAssetsImages("emergencyCommand/fylz.png"),
    unit: "cm³"
  },
  {
    name: "降雨量",
    value: "0",
    icon: getAssetsImages("emergencyCommand/jyl.png"),
    unit: "mm"
  }
])
const weatherData = ref<any>(null)
// 获得天气
const getWeather = async () => {
  const { response } = await GetEnvironmentalReality({
    equipmentId: 13632000236
  })
  filed.value[0].value = response.meteorologicalData.hs
  filed.value[1].name = getWindDirection(response.meteorologicalData.fx)
  filed.value[1].value = response.meteorologicalData.fs_ten
  filed.value[2].value = response.meteorologicalData.fylz
  filed.value[3].value = response.meteorologicalData.ylrlj

  const res = await axios.get("http://www.nmc.cn/rest/weather?stationid=GbhPZ&_=1729230315064")
  const data = res.data.data

  weatherData.value = {
    temperature: data.real.weather.temperature,
    weather: data.predict.detail[0].day.weather.info,
    max: data.predict.detail[0].day.weather.temperature,
    min: data.predict.detail[0].night.weather.temperature
  }
}
onMounted(() => {
  getWeather()
})
</script>
<template>
  <div class="right1">
    <BasePanel title="天气概况">
      <template #contain>
        <div class="con">
          <div class="left">
            <div class="row1">
              <img src="@/assets/images/emergencyCommand/weather.png" />
              <div class="text">{{ weatherData?.temperature }}℃</div>
            </div>
            <div class="row2">{{ weatherData?.min }}℃-{{ weatherData?.max }}℃{{ weatherData?.weather }}</div>
            <div class="row3">空气质量良好</div>
          </div>
          <div class="right">
            <div
              class="fied-item"
              v-for="(item, index) in filed"
              :key="index"
            >
              <div class="name">{{ item.name }}</div>
              <div class="value">
                <div class="icon">
                  <img
                    :src="item.icon"
                    alt=""
                  />
                </div>
                <div class="value">{{ item.value }}{{ item.unit }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </BasePanel>
  </div>
</template>

<style lang="scss" scoped>
.right1 {
  height: vh(191);
  margin-top: vh(15);
  color: #fff;
  .con {
    display: flex;
    height: 100%;
    padding: vh(10);
    padding-left: vh(30);
    .left {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 50%;
      .row1 {
        display: flex;
        align-items: center;
        img {
          width: 51.23px;
          height: 42.81px;
          margin-right: 10px;
        }
        .text {
          font-size: 32px;
        }
      }
      .row2 {
        font-size: 14px;
        line-height: 18px;
      }
      .row3 {
        width: 131.9px;
        height: 20.47px;
        background: #26c353;
        text-align: center;
        line-height: 20.47px;
        font-size: 12px;
      }
    }
    .right {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      width: 50%;
      .fied-item {
        width: 50%;
        .name {
          margin-bottom: 8px;
          font-size: 14px;
        }
        .value {
          display: flex;
          align-items: center;
          font-size: 12px;
          .icon {
            width: 15px;
            height: 15px;
            margin-right: 4px;
            img {
              width: 100%;
              height: 100%;
            }
          }
        }
        &:nth-child(1) {
          margin-bottom: vh(20);
          .value {
            .icon {
              width: 17px;
              height: 17px;
            }
          }
        }
        &:nth-child(2) {
          margin-bottom: vh(20);
          .value {
            .icon {
              width: 15px;
              height: 15px;
            }
          }
        }
        &:nth-child(4) {
          .value {
            .icon {
              width: 16px;
              height: 16px;
            }
          }
        }
      }
    }
  }
}
</style>
