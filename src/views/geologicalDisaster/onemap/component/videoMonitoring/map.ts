import "ol/ol.css"

import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile.js"
import { XYZ } from "ol/source"

import { OSM, Vector as VectorSource, TileWMS } from "ol/source"
import { Vector as VectorLayer } from "ol/layer"
import { WKT } from "ol/format"
// import { Style, Icon } from "ol/style"
import Overlay from "ol/Overlay"
import Point from "ol/geom/Point"
import { fromLonLat, transform } from "ol/proj"

// import { getAssetsImages } from '@/hooks/useAssetsImages'

let projection = "EPSG:3857"
let map: Map
let overlayPopup: Overlay //弹框
let mapClass: any = null

//点图层
let vectorDrawPoint: any = new VectorLayer({
  source: new VectorSource(),
  // style: (f) => {
  //   let type = f.getProperties().pointType
  //   let img: any = null
  //   // img = getAssetsImages('map/geologicalDisaster-icon1.png');
  //   img = new URL(`/images/geologicalDisaster/geologicalDisaster-icon1`, import.meta.url).href
  //   return new Style({
  //     image: new Icon({
  //       src: img,
  //       anchor: [0.5, 1],
  //       scale: 5
  //     })
  //   })
  // },
  zIndex: 3
})

let view: any = new View({
  projection: "EPSG:4326",
  center: [116.13472130884368, 31.030508216667805],
  zoom: 13,
  maxZoom: 18
})

// let vectorLayer: any, vectorSource: any
export const useMap = () => {
  const mapOptions = ref<any>(null)
  //弹框信息
  const popupInfo = ref<any>({})
  // 图层类型
  const layerType = ref<any>("影像")
  // 二维地图
  const initMap = (ele: any) => {
    // mapClass = mapInit

    // mapOptions.value = mapInit.options
    // projection = mapOptions.value.projection

    map = new Map({
      view: view,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://t6.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"
          }),
          visible: true
        })
      ],
      target: ele
    })

    // map.addLayer(vectorDrawPoint) // 点位图层

    // map.on("pointermove", (evt) => {
    //   if (evt.dragging) {
    //     return
    //   }
    //   let pixel = map.getEventPixel(evt.originalEvent)
    //   let hit = map.hasFeatureAtPixel(pixel)
    //   map.getTargetElement().style.cursor = hit ? "pointer" : ""
    // })

    // map.on("click", (e) => {
    //   var f: any = map.forEachFeatureAtPixel(e.pixel, (f) => {
    //     return f
    //   })
    //   let pointType = f?.getProperties()?.pointType

    //   if (pointType) {
    //     if (f?.getGeometry().getType() == "Point") {
    //       overlayPopup.setPosition((f?.getGeometry() as Point).getCoordinates())
    //     } else {
    //       overlayPopup.setPosition(e.coordinate)
    //     }
    //     popupInfo.value = f?.getProperties()
    //     let coordinate = e.coordinate
    //     let viewResolution: any = map.getView().getResolution()
    //     // 计算偏下显示的新中心点坐标
    //     var downCenter = [
    //       coordinate[0],
    //       coordinate[1] // 50像素的偏移量
    //     ]

    //     // 设置新的中心点
    //     map.getView().setCenter(downCenter)
    //   } else {
    //     overlayPopup.setPosition(undefined)
    //     popupInfo.value = null
    //   }
    // })
    // 加载界限和功能区图层
  }

  //获取map
  const getMap = () => {
    if (map) {
      return map
    }
  }
  // 图层切换
  const layerSwitch = (type: any) => {
    layerType.value = type
    mapClass.layerSwitch(type)
  }
  // 视图居中指定位置
  const viewTo = (lon: number, lat: number) => {
    map.getView().animate({
      // center: transform([lon, lat], "EPSG:4326", projection),
      center: [lon, lat],
      zoom: 15,
      duration: 1000
    })
  }
  //加载弹框
  const loadPopup = (ele: any) => {
    overlayPopup = new Overlay({
      element: ele,
      positioning: "bottom-center",
      offset: [0, -15],
      autoPan: {
        animation: {
          duration: 250
        },
        margin: 250
      }
    })
    map.addOverlay(overlayPopup)
    overlayPopup?.setPosition(undefined)
  }

  //关闭弹框
  const closePopup = () => {
    popupInfo.value = null
    overlayPopup?.setPosition(undefined)
  }
  // 清除图层
  const clearLayer = (arr: any = []) => {
    if (vectorDrawPoint && (arr.length == 0 || arr.includes("vectorDrawPoint"))) {
      vectorDrawPoint.getSource().clear()
    }
  }

  //加载点位
  const loadPoint = (data: any, isShowPopup = false) => {
    closePopup()
    if (!data) {
      vectorDrawPoint.getSource().clear()
      overlayPopup.setPosition(undefined)
      return
    }
    let wkt = `POINT(${data.lon} ${data.lat})`

    let feature: any = new WKT().readFeature(wkt, {
      dataProjection: "EPSG:4326"
    })
    feature.setId(data.Id)
    feature.setProperties(data)
    vectorDrawPoint?.getSource().addFeature(feature)
    if (isShowPopup) {
      overlayPopup.setPosition([data.lon, data.lat])

      popupInfo.value = data
      viewTo(data.lon, data.lat)
    }
  }

  return {
    initMap,
    getMap,
    mapOptions,
    layerType,
    loadPopup,
    closePopup,
    popupInfo,
    clearLayer,
    layerSwitch,
    viewTo,
    loadPoint
  }
}
