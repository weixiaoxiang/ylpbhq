<script lang="ts" setup>
import { GetPanoramaList } from "@/api"

// #region map
const modular = ref("生态旅游全景")
const { addPanoramaData, highlightPanorama } = useOlMap(undefined, {
  zoom: 12.5381,
  target: "panorama-map",
  center: [116.10550826192058, 31.035296306176544],
  modular: modular.value,
  openOverlay: false,
  overlayOffset: [0, -70],
  overlayPositioning: "bottom-center",
  vectorLayerDeclutter: false,
  callBack: {
    click: (data: any) => {
      current.value = data
      // 根据data.id获取list中的对应索引
      const index = list.value.findIndex((item: any) => item.id === data.id)
      if (index !== -1) {
        currentPage.value = Math.ceil((index + 1) / 7)
      }
    }
  }
})
// 添加全景图点位
const getPanoramaData = async () => {
  const { response } = await GetPanoramaList()
  list.value = response.map((item: any) => {
    item.scene = "/statisUrl" + item.scene
    item.thumbnail = "/statisUrl" + item.thumbnail
    item.position = item.position.split(",").map(Number)
    return item
  })
  console.log(list.value, 1)

  addPanoramaData(list.value)
  current.value = list.value[0]
}
// #endregion
const list = ref<any[]>([])
const currentPage = ref(1)
const current = ref<any>(null) // 当前全景id
const handleArrow = (type: string) => {
  if (type === "l") {
    currentPage.value--
    if (currentPage.value < 1) {
      currentPage.value = 1
      ElMessage.warning("已经是第一页")
    }
  } else {
    currentPage.value++
    if (currentPage.value > Math.ceil(list.value.length / 7)) {
      currentPage.value = Math.ceil(list.value.length / 7)
      ElMessage.warning("已经是最后一页")
    }
  }
}
const changePanorama = (item: any) => {
  if (current.value?.id === item.id) return
  current.value = item
  highlightPanorama(item)
}

onMounted(() => {
  getPanoramaData() // 添加全景图点位
})
</script>
<template>
  <div class="tourism-panorama">
    <div class="map-preview">
      <div
        class="map"
        id="panorama-map"
      ></div>
    </div>
    <iframe
      id="pano"
      :src="current?.scene"
      frameborder="0"
    ></iframe>
    <div class="list">
      <div class="list-wrap">
        <div
          class="list-item"
          :class="{ active: current?.id === item.id }"
          v-for="item in list.slice((currentPage - 1) * 7, currentPage * 7)"
          :key="item.id"
          v-ripple
          @click="changePanorama(item)"
        >
          <div class="list-item-img">
            <img
              :src="item.thumbnail"
              alt=""
            />
          </div>
          <div class="list-item-name">
            {{ item.name }}
          </div>
        </div>
      </div>
      <div
        class="arrow arrow-l"
        @click="handleArrow('l')"
      >
        <img
          :src="'/statisUrl/ecotourism/panorama-arrow1.png'"
          alt=""
        />
      </div>
      <div
        class="arrow arrow-r"
        @click="handleArrow('r')"
      >
        <img
          :src="'/statisUrl/ecotourism/panorama-arrow2.png'"
          alt=""
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tourism-panorama {
  position: relative;
  width: 100%;
  font-size: 14px;
  height: 100%;
  background: url("/statisUrl/ecotourism/panorama-bg.png") no-repeat center center / 100% 100%;
  overflow: hidden;
  .map-preview {
    position: absolute;
    top: 30px;
    right: 10px;
    width: 300px;
    height: 300px;
    padding: 15px;
    box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.1);
    background-color: #0b2135;
    border-radius: 6px;
    z-index: 1;
    #panorama-map {
      height: 100%;
      border-radius: 6px;
      overflow: hidden;
      // border: 2px solid;
      // border-image: linear-gradient(to bottom right, rgb(169, 177, 184), rgb(25, 59, 119)) 1;
    }
  }
  #pano {
    width: 100%;
    height: 100%;
  }
  .list {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    .list-wrap {
      display: flex;
      gap: 10px;
      .list-item {
        position: relative;
        width: 10.4167vw;
        height: 200px;
        padding: 10px;
        background: linear-gradient(to bottom right, #4673a2, #1c2e40);
        border-radius: 6px;
        box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        .list-item-img {
          width: 100%;
          height: 100%;
          border-radius: 6px;
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
            transition: all 0.3s ease;
            &:hover {
              transform: scale(1.1);
            }
          }
        }
        .list-item-name {
          position: absolute;
          bottom: 15px;
          left: 15px;
          right: 15px;
          padding: 0 10px;
          background-color: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(3px);
          color: #9bafd1;
          font-size: 16px;
          border-radius: 3px;
          font-weight: bold;
          line-height: 2em;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: all 0.3s ease;
        }
      }
      .active {
        .list-item-name {
          background: linear-gradient(to bottom, #ba6b0d, #dfa032);
          color: #eee;
        }
      }
    }
    .arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      img {
        width: 48px;
        height: 48px;
      }
    }
    .arrow-l {
      left: -65px;
    }
    .arrow-r {
      right: -65px;
    }
  }
}
</style>
