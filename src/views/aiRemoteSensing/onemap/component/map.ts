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
import { GetMapLineJx } from "@/api"
let projection = "EPSG:3857"
let overlayPopup: Overlay //弹框
let mapClass: any = null
//点图层
let vectorDrawPoint: any = new VectorLayer({
  source: new VectorSource(),
  zIndex: 3
})
let view: any = new View({
  projection: "EPSG:4326",
  center: [116.1074456652461, 31.05080008704565],
  zoom: 13,
  maxZoom: 18
})
let jxVectorLayer: any, jxVectorSource: any
export const useMap = () => {
  const mapOptions = ref<any>(null)
  //弹框信息
  const popupInfo = ref<any>({})
  // 图层类型
  const layerType = ref<any>("影像")
  const map = ref<any>(null)
  // 二维地图
  const initMap = (ele: any) => {
    map.value = new Map({
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

    map.value.addLayer(vectorDrawPoint) // 点位图层
    jxVectorSource = new VectorSource()
    jxVectorLayer = new VectorImage({
      source: jxVectorSource,
      declutter: true,
      style: (f: any) => {
        let fill, stroke, strokeWidth
        const featureType = f.get("featureType")
        const colors: any = {
          // 界限
          多枝尖缓冲区: "#243642",
          吊罐井缓冲区: "#387478",
          麒麟沟缓冲区: "#00FF9C",
          川石缓冲区: "#EC8305",
          实验区: "#605678",
          多枝尖核心区: "#CB6040",
          麒麟沟核心区: "#15B392",
          吊罐井核心区: "#7E60BF",
          川石核心区: "#347928"
        }
        switch (featureType) {
          case "类型-地图界限":
            fill = hexToRgba(colors[f.get("Mc")], 0.2)
            stroke = colors[f.get("Mc")]
            strokeWidth = 6
            break
          case "类型-地图功能区划":
            fill = hexToRgba(colors[f.get("Mc")], 0.2)
            stroke = colors[f.get("Mc")]
            strokeWidth = 3
            break
          default:
            fill = "rgba(255, 255, 255, 0.2)"
            stroke = "red"
            break
        }
        return new Style({
          fill: new Fill({
            color: fill
          }),
          stroke: new Stroke({
            color: stroke,
            width: strokeWidth
          }),
          text: new OlText({
            text: f.get("Mc"),
            font: "14px sans-serif",
            fill: new Fill({
              color: stroke
            }),
            stroke: new Stroke({
              color: "white",
              width: 3
            }),
            overflow: true
          })
        })
      },
      zIndex: 3
    })
    jxVectorLayer.set("title", "界限图层") // 基础图层
    map.value.addLayer(jxVectorLayer)
    map.value.on("pointermove", (evt: any) => {
      if (evt.dragging) {
        return
      }
      let pixel = map.value.getEventPixel(evt.originalEvent)
      let hit = map.value.hasFeatureAtPixel(pixel)
      map.value.getTargetElement().style.cursor = hit ? "pointer" : ""
    })

    map.value.on("click", (e: any) => {
      var f: any = map.value.forEachFeatureAtPixel(e.pixel, (f: any) => {
        return f
      })
      let pointType = f?.getProperties()?.pointType
      console.log(e.coordinate)
      if (pointType) {
        if (f?.getGeometry().getType() == "Point") {
          // overlayPopup.setPosition((f?.getGeometry() as Point).getCoordinates())
        } else {
          // overlayPopup.setPosition(e.coordinate)
        }
        popupInfo.value = f?.getProperties()
        console.log(f?.getProperties())
        let coordinate = e.coordinate
        let viewResolution: any = map.value.getView().getResolution()
        console.log("viewResolution", viewResolution)
        // 计算偏下显示的新中心点坐标
        var downCenter = [
          coordinate[0],
          coordinate[1] // 50像素的偏移量
        ]

        // 设置新的中心点
        map.value.getView().setCenter(downCenter)
      } else {
        // overlayPopup.setPosition(undefined)
        // popupInfo.value = null
      }
    })
    loadJxLayer()
    console.log(map)
  }
  // 加载界限图层
  const loadJxLayer = async () => {
    const { response } = await GetMapLineJx()
    response.forEach((item: any) => {
      const feature = new WKT().readFeature(item.Geom)
      feature.setProperties(
        Object.assign(
          {},
          {
            Mc: item.Mc,
            Lon: item.Lon,
            Lat: item.Lat,
            Area: item.Area,
            Type: item.Type,
            featureType: "类型-地图界限"
          }
        )
      )

      jxVectorSource.addFeature(feature)
    })
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
    console.log("视图居中指定位置", lon, lat)
    map.value.getView().animate({
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
    map.value.addOverlay(overlayPopup)
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
    console.log(data)
    let wkt = `POINT(${data.lon} ${data.lat})`
    let feature: any = new WKT().readFeature(wkt, {
      dataProjection: "EPSG:4326"
    })
    feature.setId(data.Id)
    feature.setProperties(data)
    console.log("feature", feature)
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
    loadPoint,
    map
  }
}
