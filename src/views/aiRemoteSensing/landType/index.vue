<template>
  <div class="land-comparison">
    <div class="spot-comparison-box">
      <div class="box-content">
        <div class="section-bar">
          <MapLayerManage
            modular="AI+遥感地类对比"
            :init-checked-keys="[35]"
            :init-show="false"
            @addLayer="(data, option) => addLayerManageData(data, option, 0)"
            @removeLayer="(node) => removeLayerManageData(node, 0)"
          />
        </div>
        <div
          class="map-box"
          id="mapdiv1"
        >
          <MapPopup
            ref="popup1"
            :format-name="popupFormatType"
            :info="popupInfo"
            @close="closePopup"
          />
        </div>
        <div class="time-box">
          <div
            class="arrow-btn btn-left"
            @click="changeTime(-1, 1)"
          >
            <img src="@/assets/images/aiRemoteSensing/dldb-2.png" />
          </div>
          <div class="time-con">
            <div
              class="time-item"
              :class="{ active: activeLeft == item.year }"
              v-for="(item, index) in year1"
              :key="index"
              @click="clickYear(item, 1)"
            >
              <span>
                {{ item.year }}
              </span>
              <img
                :src="$fun.getImg(`aiRemoteSensing/${activeLeft == item.year ? 'dldb-7' : 'dldb-6'}.png`)"
                alt=""
              />
            </div>
          </div>
          <div
            class="arrow-btn btn-right"
            @click="changeTime(1, 1)"
          >
            <img src="@/assets/images/aiRemoteSensing/dldb-3.png" />
          </div>
        </div>
        <div class="tool-box part">
          <div
            class="box"
            @click="zoomIn()"
          >
            <span class="tool tool5"></span>
          </div>
          <div
            class="box"
            @click="resetView()"
          >
            <span class="tool tool6"></span>
          </div>
          <div
            class="box"
            @click="zoomOut()"
          >
            <span class="tool tool7"></span>
          </div>
        </div>
      </div>
      <div class="box-content">
        <div class="section-bar">
          <MapLayerManage
            modular="AI+遥感地类对比"
            :init-checked-keys="[35]"
            :init-show="false"
            @addLayer="(data, option) => addLayerManageData(data, option, 1)"
            @removeLayer="(node) => removeLayerManageData(node, 1)"
          />
        </div>
        <div
          class="map-box"
          id="mapdiv2"
        >
          <MapPopup
            ref="popup2"
            :format-name="popupFormatType"
            :info="popupInfo"
            @close="closePopup"
          />
        </div>
        <div class="time-box">
          <div
            class="arrow-btn btn-left"
            @click="changeTime(-1, 2)"
          >
            <img src="@/assets/images/aiRemoteSensing/dldb-2.png" />
          </div>
          <div class="time-con">
            <div
              class="time-item"
              :class="{ active: activeRight == item.year }"
              v-for="(item, index) in year2"
              :key="index"
              @click="clickYear(item, 2)"
            >
              <span>
                {{ item.year }}
              </span>
              <img
                :src="$fun.getImg(`aiRemoteSensing/${activeRight == item.year ? 'dldb-7' : 'dldb-6'}.png`)"
                alt=""
              />
            </div>
          </div>
          <div
            class="arrow-btn btn-right"
            @click="changeTime(1, 2)"
          >
            <img src="@/assets/images/aiRemoteSensing/dldb-3.png" />
          </div>
        </div>
        <div class="tool-box part">
          <div
            class="box"
            @click="zoomIn()"
          >
            <span class="tool tool5"></span>
          </div>
          <div
            class="box"
            @click="resetView()"
          >
            <span class="tool tool6"></span>
          </div>
          <div
            class="box"
            @click="zoomOut()"
          >
            <span class="tool tool7"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { GetInterface } from "@/api"
import { landTypeApi } from "@/api/aiRemoteSensing"
import Map from "ol/Map"
import { Fill, Stroke, Style } from "ol/style"
import View from "ol/View"
import * as olControl from "ol/control"
import { WKT } from "ol/format"
import { Group, Tile as TileLayer, Vector as VectorLayer } from "ol/layer"
import "ol/ol.css"
import { transform } from "ol/proj"
import { Vector as VectorSource, XYZ } from "ol/source"
let map1: Map
let map2: Map
let originCenter: any = [116.0992130884368, 31.030808216667805]
let view: any = new View({
  projection: "EPSG:3857",
  center: transform(originCenter, "EPSG:4326", "EPSG:3857"),
  zoom: 12.6,
  maxZoom: 20
})
const position = reactive<any>({ lon: null, lat: null })
let layers1 = [
  new Group({
    visible: true,
    zIndex: 1,
    layers: [
      new TileLayer({
        visible: true,
        zIndex: 1,
        source: new XYZ({
          url: `http://t{0-7}.tianditu.com/DataServer?T=img_w&tk=8232df3467e2da8a1ae909e65a695bfe&x={x}&y={y}&l={z}`,
          crossOrigin: "anonymous"
        })
      }),
      new TileLayer({
        visible: true,
        zIndex: 1,
        source: new XYZ({
          url: `http://t{0-7}.tianditu.com/DataServer?T=cva_w&tk=8232df3467e2da8a1ae909e65a695bfe&x={x}&y={y}&l={z}`,
          crossOrigin: "anonymous"
        })
      })
    ]
  })
]
let layers2 = [
  new Group({
    visible: true,
    zIndex: 1,
    layers: [
      new TileLayer({
        visible: true,
        zIndex: 1,
        source: new XYZ({
          url: `http://t{0-7}.tianditu.com/DataServer?T=img_w&tk=8232df3467e2da8a1ae909e65a695bfe&x={x}&y={y}&l={z}`,
          crossOrigin: "anonymous"
        })
      }),
      new TileLayer({
        visible: true,
        zIndex: 1,
        source: new XYZ({
          url: `http://t{0-7}.tianditu.com/DataServer?T=cva_w&tk=8232df3467e2da8a1ae909e65a695bfe&x={x}&y={y}&l={z}`,
          crossOrigin: "anonymous"
        })
      })
    ]
  })
]
let manageLayer1: any = new VectorLayer({
  source: new VectorSource(),
  declutter: true,
  zIndex: 2
})
let manageLayer2: any = new VectorLayer({
  source: new VectorSource(),
  declutter: true,
  zIndex: 2
})
const year1 = ref<any>([])
const year2 = ref<any>([])
const activeLeft = ref(2023)
const activeRight = ref(2024)
const popupFormatType = ref("")
const popupInfo = ref<any>({})
const popup1 = ref<any>(null)
const popup2 = ref<any>(null)
let overlay1: any = null
let overlay2: any = null
const closePopup = () => {
  popupInfo.value = {}
  overlay1.setPosition(undefined)
  overlay2.setPosition(undefined)
}
// 二维地图
const initMap1 = () => {
  map1 = new Map({
    controls: olControl.defaults({
      attribution: false,
      rotate: false,
      zoom: false
    }),
    view: view,
    layers: layers1,
    target: "mapdiv1"
  })
  map1.addLayer(manageLayer1)

  if (popup1?.value) {
    overlay1 = new Overlay({
      element: popup1.value.$el,
      autoPan: true,
      positioning: "bottom-center",
      stopEvent: true
    })
    map1.addOverlay(overlay1)
    overlay1.setPosition(undefined)
  }
  map1.on("click", async (e) => {
    let lonlat = transform(e.coordinate, "EPSG:3857", "EPSG:4326")
    position.lon = lonlat[0]
    position.lat = lonlat[1]
    var f = map1.forEachFeatureAtPixel(e.pixel, (f) => {
      return f
    })
    if (f) {
      // 点击整合前整合后功能区返回
      const treeid = f.get("treeid")
      if ([35, 34].includes(treeid)) {
        return
      }
      const detail = await getDetail(f.getProperties())
      popupFormatType.value = f.get("tabname") // 动态弹窗类型
      popupInfo.value = detail
      overlay1?.setPosition(e.coordinate)
      overlay2?.setPosition(e.coordinate)
    }
  })
}
// 二维地图
const initMap2 = () => {
  map2 = new Map({
    controls: olControl.defaults({
      attribution: false,
      rotate: false,
      zoom: false
    }),
    view: view,
    layers: layers2,
    target: "mapdiv2"
  })
  map2.addLayer(manageLayer2)
  if (popup2?.value) {
    overlay2 = new Overlay({
      element: popup2.value.$el,
      autoPan: true,
      positioning: "bottom-center",
      stopEvent: true
    })
    map2.addOverlay(overlay2)
    overlay2.setPosition(undefined)
  }
  map2.on("click", async (e) => {
    var f = map2.forEachFeatureAtPixel(e.pixel, (f) => {
      return f
    })
    if (f) {
      // 点击整合前整合后功能区返回
      const treeid = f.get("treeid")
      if ([35, 34].includes(treeid)) {
        return
      }
      const detail = await getDetail(f.getProperties())
      popupFormatType.value = f.get("tabname") // 动态弹窗类型
      popupInfo.value = detail
      overlay1?.setPosition(e.coordinate)
      overlay2?.setPosition(e.coordinate)
    }
  })
}
// 点击要素获得详情
const getDetail = async (data: any) => {
  const { response, success, msg } = await GetInterface({
    ssmk: "地图弹框详情",
    layerid: data.treeid,
    id: data.id
  })
  if (!success) return ElMessage.error(msg)
  response.detail = response.response
  delete response.response
  return response
}
// 添加图层管理数据
const addLayerManageData = (data: any, option: any, index: number) => {
  data.forEach((item: any) => {
    const geometryType = option.geometryType
    const legend = option.legend.find((leg: any) => leg.type == item.type) || option.legend?.[0]
    let {
      icon = "",
      fillcolor = "rgba(255,255,255,0)",
      strokecolor = "rgba(255,255,255,1)",
      strokewidth = 2,
      storkedash = false,
      textsize = 14,
      textcolor = "rgba(255,255,255,1)",
      offsetTextX = 0,
      offsetTextY = -55
    } = legend || {}
    const feature = new WKT().readFeature(item.geom)
    feature!.getGeometry()!.transform("EPSG:4326", "EPSG:3857")
    feature.setProperties(
      Object.assign({}, item, {
        icon: "/statisUrl/" + icon,
        featureType: `类型-图层管理-${option.mc + item.treeid}`,
        tabname: option.tabname,
        tabchname: option.tabchname
      })
    )
    feature.setStyle(
      new Style({
        image:
          geometryType === "point"
            ? new Icon({
                src: "/statisUrl/" + icon,
                scale: 1,
                anchor: [0.5, 1]
              })
            : undefined,
        fill:
          geometryType === "polygon"
            ? new Fill({
                color: fillcolor
              })
            : undefined,
        stroke:
          geometryType !== "point"
            ? new Stroke({
                color: strokecolor,
                width: strokewidth,
                lineDash: storkedash === "true" ? [10, 5] : undefined
              })
            : undefined,
        text: new OlText({
          text: item.name,
          font: `${textsize}px sans-serif`,
          offsetX: offsetTextX,
          offsetY: offsetTextY,
          fill: new Fill({
            color: textcolor
          }),
          stroke: new Stroke({
            color: "#000",
            width: 2
          })
        })
      })
    )
    if (index == 0) {
      manageLayer1.getSource().addFeature(feature)
    } else {
      manageLayer2.getSource().addFeature(feature)
    }
  })
}
// 移除图层管理数据
const removeLayerManageData = (node: any, index: number) => {
  let featureType = `类型-图层管理-${node.mc + node.id}`
  if (index == 0) {
    const features = manageLayer1
      .getSource()
      .getFeatures()
      .filter((item: any) => {
        return item.get("featureType") === featureType
      })
    manageLayer1.getSource().removeFeatures(features)
  } else {
    const features = manageLayer2
      .getSource()
      .getFeatures()
      .filter((item: any) => {
        return item.get("featureType") === featureType
      })
    manageLayer2.getSource().removeFeatures(features)
  }
}
//选择年份
const clickYear = (item: any, type: number) => {
  if (type == 1) {
    activeLeft.value = item.year
  } else {
    activeRight.value = item.year
  }
  loadImage(type)
}
//放大
const zoomIn = () => {
  const view = map1.getView()
  const zoom = view.getZoom()!
  view.animate({
    zoom: zoom + 1,
    duration: 250
  })
}
const zoomOut = () => {
  const view = map1.getView()
  const zoom = view.getZoom()!
  view.animate({
    zoom: zoom - 1,
    duration: 250
  })
}
const resetView = () => {
  const view = map1.getView()
  view.animate({
    center: transform(originCenter, "EPSG:4326", "EPSG:3857"),
    zoom: 12.6,
    duration: 250
  })
}
//获取影像数据
let imageData: any = []
const getImageData = () => {
  landTypeApi
    .getSys_LayerImageInformation({
      mkname: ",AI+遥感地类对比,",
      imagetype: "影像地图"
    })
    .then((res: any) => {
      if (res.success) {
        imageData = res.response.sort((a: any, b: any) => a.year - b.year)
        year1.value = imageData.slice(-3)
        year2.value = imageData.slice(-3)
        loadImage(1)
        loadImage(2)
      }
    })
}
//加载影像
let titleLeft: any = null
let titleRight: any = null
const loadImage = (val: number) => {
  if (val == 1) {
    if (titleLeft) {
      map1.removeLayer(titleLeft)
    }
    let url = imageData.find((i: any) => i.year == activeLeft.value).url
    titleLeft = new TileLayer({
      source: new XYZ({
        url: `${url}{z}/{y}/{x}.png`,
        crossOrigin: "anonymous"
      }),
      visible: true,
      zIndex: 1,
      extent: [12913505.048231807, 3625731.1589637767, 12934820.299641233, 3648664.2685015844]
    })
    map1.addLayer(titleLeft)
  } else {
    if (titleRight) {
      map2.removeLayer(titleRight)
    }
    let url = imageData.find((i: any) => i.year == activeRight.value).url
    titleRight = new TileLayer({
      source: new XYZ({
        url: `${url}{z}/{y}/{x}.png`,
        crossOrigin: "anonymous"
      }),
      visible: true,
      zIndex: 1,
      extent: [12913505.048231807, 3625731.1589637767, 12934820.299641233, 3648664.2685015844]
    })
    map2.addLayer(titleRight)
  }
}
//切换时间轴
const changeTime = (val: number, type: number) => {
  if (type == 1) {
    let index = imageData.findIndex((i: any) => i.year == year1.value[0].year)
    if (index == 0 && val == -1) {
      ElMessage.warning("当前已是第一页")
      return
    }
    if (index == imageData.length - 3 && val == 1) {
      ElMessage.warning("当前已是最后一页")
      return
    }
    year1.value = imageData.slice(index + val, index + val + 3)
    let index1 = year1.value.findIndex((i: any) => i.year == activeLeft.value)
    activeLeft.value = year1.value[index1 + val].year
    loadImage(1)
  } else if (type == 2) {
    let index = imageData.findIndex((i: any) => i.year == year2.value[0].year)
    if (index == 0 && val == -1) {
      ElMessage.warning("当前已是第一页")
      return
    }
    if (index == imageData.length - 3 && val == 1) {
      ElMessage.warning("当前已是最后一页")
      return
    }
    let index1 = year2.value.findIndex((i: any) => i.year == activeRight.value)
    year2.value = imageData.slice(index + val, index + val + 3)
    activeRight.value = year2.value[index1].year
    loadImage(2)
  }
}

onMounted(() => {
  initMap1()
  initMap2()
  getImageData()
})
onBeforeUnmount(() => {})
</script>

<style lang="scss" scoped>
.land-comparison {
  width: 100%;
  height: 100%;
  padding: 30px 10px 10px;
  .spot-comparison-box {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    .box-content {
      flex: 1;
      background: linear-gradient(180deg, rgba(24, 52, 93, 0.8) -3%, rgba(27, 53, 79, 0.8) 100%);
      position: relative;
      backdrop-filter: blur(50px);
      box-shadow:
        inset -4px -4px 12px 0px rgba(255, 255, 255, 0.06),
        inset 4px 4px 12px 0px rgba(255, 250, 250, 0.06);
      overflow: hidden;
      padding: 10px;
      .section-bar {
        position: absolute;
        top: 60px;
        right: 20px;
        // right: var(--maptool-sidebar-right);
        display: flex;
        gap: 15px;
        height: 32px;
        z-index: 1;
        transition: all 0.3s ease-in-out;
      }
      &:nth-child(2) {
        margin-left: 10px;
      }

      .map-box {
        width: 100%;
        height: 100%;
        border: 1px solid rgba(255, 255, 255, 0.5);
      }

      :deep(.select) {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 170px;
        .el-select__wrapper {
          box-shadow: unset !important;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(12, 40, 77, 1);
        }
        .el-select__placeholder {
          font-family: PingFang SC;
          font-size: 14px;
          font-weight: 400;
          line-height: 14px;
          text-align: left;
          color: #fff;
        }
      }

      .tool-ul {
        position: absolute;
        bottom: 10px;
        right: 20px;
        width: 32px;

        li {
          height: 32px;
          background: rgba(8, 164, 135, 1);
          border-radius: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          cursor: pointer;
        }
      }

      .compare-select {
        right: 20px;
        left: unset;
        width: 150px;
        height: 32px;
      }

      .btn {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 100px;
        height: 32px;
        background: rgba(8, 164, 135, 1);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 1px;
        cursor: pointer;

        img {
          margin-right: 4px;
        }
      }
    }
    .position-box {
      position: absolute;
      left: 55px;
      top: 56px;
      padding: 12px;
      background: rgba(12, 40, 77, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.15);
      .row {
        display: flex;
        align-items: center;
        color: #fff;
        font-size: 14px;
        img {
          margin-right: 4px;
        }
        :deep(.el-input__wrapper) {
          width: 170px;
          height: 36px;
          margin-left: 10px;
          background: url("@/assets/images/aiRemoteSensing/inputbg.png") no-repeat;
          background-size: 100% 100%;
          box-shadow: none !important;
        }
      }
    }
    .time-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: absolute;
      left: 50%;
      bottom: 48px;
      transform: translateX(-50%);
      width: 353px;
      height: 38px;
      padding-bottom: 12px;
      background: url("@/assets/images/aiRemoteSensing/dldb-1.png") no-repeat;
      background-size: 100% 24px;
      .arrow-btn {
        width: 56px;
        height: 77px;
        cursor: pointer;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .time-con {
        flex: 1;
        margin-left: -10px;
        margin-right: -10px;
        padding-bottom: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .time-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          color: #fff;
          font-style: italic;
          font-size: 14px;
          cursor: pointer;
          &.active {
            font-size: 20px;
            font-weight: 700;
          }
          img {
            width: 22px;
            height: 22px;
          }
        }
      }
    }
    .tool-box {
      position: absolute;
      right: 20px;
      bottom: 20px;

      &.part {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 5px;

        .box {
          width: 36px;
          height: 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          background-color: #0a142b;
          transform: scale(0.8);

          &:hover {
            .tool {
              background-position-y: 0px;
            }
          }
        }

        & > div:not(:last-child) {
          position: relative;
          &::after {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60%;
            height: 1px;
            content: "";
            background: #ccc;
          }
        }

        .tool {
          width: 36px;
          height: 36px;
          background-image: url("@/components/Map/icon/map-tool.png");
          background-repeat: no-repeat;
          background-clip: content-box;
          transition: all 0.3s;
          background-position-y: -43px;
        }
        .tool5 {
          background-position-x: -216px;
        }
        .tool6 {
          background-position-x: -252px;
        }

        .tool7 {
          background-position-x: -288px;
        }
      }
    }
    .legend-box {
      position: absolute;
      left: 25px;
      bottom: 60px;
      .title {
        width: 226px;
        height: 50px;
        background: url("@/assets/images/aiRemoteSensing/dldb-4.png") no-repeat;
        background-size: 100% 100%;
        color: #fff;
        font-weight: bold;
        text-align: center;
        line-height: 50px;
      }
      .con {
        max-height: 276px;
        margin: 0 24px;
        padding: 20px 30px;
        overflow: auto;
        background: #0c284d;
        box-sizing: border-box;
        border: 1px solid rgba(255, 255, 255, 0.15);
        .item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          &:last-child {
            margin-bottom: 0;
          }
          .icon {
            width: 20px;
            height: 16px;
            margin-right: 10px;
          }
          .text {
            font-size: 14px;
            color: #fff;
          }
        }
        //滚动条样式
        &::-webkit-scrollbar {
          width: 6px;
          height: 5px;
          background-color: #3b6fa1;
        }
      }
    }
  }
}
</style>
