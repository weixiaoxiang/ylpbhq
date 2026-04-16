<template>
  <div class="dialog">
    <div class="dialog-box map">
      <div class="dialog-header">
        <div class="title">获取经纬度</div>
        <div
          class="close"
          @click="closeMap"
          v-if="isClick"
        ></div>
      </div>
      <div id="mapdiv"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["closeMap", "lonlatChange"])
//ol部分
import { getAssetsImages } from "@/hooks/useAssetsImages"
import Feature from "ol/Feature"
import Map from "ol/Map"
import View from "ol/View"
import * as olControl from "ol/control"
import { WKT } from "ol/format"
import Point from "ol/geom/Point"
import * as olInteraction from "ol/interaction"
import Draw from "ol/interaction/Draw"
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer"
import "ol/ol.css"
import { Vector as VectorSource, XYZ } from "ol/source"
import { Fill, Icon, Stroke, Style } from "ol/style"
let map: Map
let props = defineProps({
  lonlat: { type: Array as any, default: () => [] },
  type: { type: String, default: "point" },
  isClick: { type: Boolean, default: true }
})

let vectorDrawPoint: any = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    image: new Icon({
      src: getAssetsImages("patrol/point.png"),
      anchor: [0.5, 1],
      scale: 1
    })
  })
})
let vectorDrawPolygon: any = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    stroke: new Stroke({
      color: "#30B4FA",
      width: 2
    }),
    fill: new Fill({
      color: "rgba(255, 255, 255, 0.1)"
    })
  })
})
const initMap = () => {
  map = new Map({
    controls: olControl.defaults({
      attribution: false,
      rotate: false,
      zoom: false
    }),
    interactions: olInteraction.defaults({
      doubleClickZoom: false
    }),
    layers: [
      new TileLayer({
        source: new XYZ({
          url: "http://t6.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"
        })
      }),
      new TileLayer({
        source: new XYZ({
          url: "http://t6.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"
        })
      })
    ],
    view: new View({
      projection: "EPSG:4326",
      center: [117.30037187574635, 31.72082825627345],
      zoom: 7.8,
      maxZoom: 18
    }),
    target: "mapdiv"
  })

  if (props.type == "point") {
    map.addLayer(vectorDrawPoint)
    drawPoint()
    nextTick(() => {
      if (props.lonlat?.length > 0 && props.lonlat[0]) {
        var jdPoint = new Feature({
          geometry: new Point([parseFloat(props.lonlat[0]), parseFloat(props.lonlat[1])])
        })
        vectorDrawPoint.getSource().addFeature(jdPoint)
        // map.getView().animate({
        //     center: [parseFloat(props.lonlat[0]), parseFloat(props.lonlat[1])],
        //     duration: 1000,
        // })
        map.getView().fit(vectorDrawPoint.getSource().getExtent(), { nearest: true })
        let zoom: any = map.getView().getZoom()
        map.getView().setZoom(zoom - 1)
      }
    })
  } else if (props.type == "polygon") {
    map.addLayer(vectorDrawPolygon)
    drawPolyGon()
    nextTick(() => {
      if (props.lonlat?.length > 0) {
        // console.log(props.lonlat[0]);
        let feature: any = new WKT().readFeature(props.lonlat[0], {
          dataProjection: "EPSG:4326"
        })
        vectorDrawPolygon.getSource().addFeature(feature)
        map.getView().fit(vectorDrawPolygon.getSource().getExtent())
      }
    })
  }
}

const drawPoint = () => {
  if (!props.isClick) {
    return
  }
  let draw = new Draw({
    source: vectorDrawPoint.getSource(),
    type: "Point"
  })
  draw.on("drawend", function (event: any) {
    map.removeInteraction(draw)
    let coordinates = event.feature.getGeometry().getCoordinates()
    emit("closeMap", coordinates)
  })
  map.addInteraction(draw)
}
const drawPolyGon = () => {
  if (!props.isClick) {
    return
  }
  let draw = new Draw({
    source: vectorDrawPolygon.getSource(),
    type: "Polygon"
  })
  draw.on("drawstart", function (event: any) {
    vectorDrawPolygon?.getSource().clear()
  })
  draw.on("drawend", function (event: any) {
    map.removeInteraction(draw)
    let coordinates = event.feature.getGeometry().getCoordinates()

    if (props.type == "polygon") {
      // 构造WKT字符串
      var wkt = "MULTIPOLYGON((("
      coordinates[0].forEach(function (coordinatePair) {
        wkt += coordinatePair[0] + " " + coordinatePair[1] + ","
      })
      wkt = wkt + coordinates[0][0][0] + " " + coordinates[0][0][1] + ")))"
      // console.log(wkt);
      // console.log(coordinates);
      emit("closeMap", wkt)
    } else {
      emit("closeMap", coordinates)
    }
  })
  map.addInteraction(draw)
}

const closeMap = () => {
  emit("closeMap") // 关闭弹框
}

onMounted(() => {
  initMap() // 创建地图
})
</script>

<style lang="scss" scoped>
.dialog {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  z-index: 100000;
  display: flex;
  justify-content: center;
  align-items: center;

  .dialog-box {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    border: 1px solid #2196f3;
    background: #fff;
    padding: 20px;

    &.map {
      #mapdiv {
        width: 100%;
        height: calc(100% - 35px);
      }
    }
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;

    .title {
      display: flex;
      align-items: center;
      color: #333;
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;

      &:before {
        content: "";
        display: inline-block;
        width: 4px;
        height: 12px;
        margin-right: 8px;
        flex-shrink: 0;
        background: #2196f3;
      }
    }

    .close {
      width: 18px;
      height: 18px;
      background: url("@/assets/ico-close.svg");
      background-size: 100% 100%;
      cursor: pointer;
    }
  }

  .btns {
    flex: 1;
    display: flex;
    align-items: center;
    margin-left: 20px;

    .btn {
      background: #2196f3;
      color: #fff;
      padding: 0 4px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 20px;
    }
  }
}
</style>
