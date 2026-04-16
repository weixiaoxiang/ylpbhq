import "ol/ol.css"
import Map from "ol/Map"
import { OSM, Vector as VectorSource, XYZ, TileWMS } from "ol/source"
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer"
import { WKT } from "ol/format"
import { Style, Icon, Fill, Stroke, Circle, Text } from "ol/style"
import Overlay from "ol/Overlay"
import Point from "ol/geom/Point"
import { fromLonLat, transform } from "ol/proj"
import { getAssetsImages } from "@/hooks/useAssetsImages"
import { LineString } from "ol/geom"
import { Feature } from "ol"

let projection = "EPSG:3857"
let map: Map
let overlayPopup: Overlay //弹框
let mapClass: any = null

//点图层
let vectorDrawPoint: any = new VectorLayer({
  source: new VectorSource(),
  style: (f) => {
    let type = f.getProperties().type
    console.log("type", type)
    let img: any = null
    let scale = 1
    if (type == "网格负责人") {
      scale = 0.8
      img = getAssetsImages("map/forestFirePrevention-icon3.png")
    } else if (type == "防火云台") {
      scale = 0.8
      img = getAssetsImages("map/map-fhjk.png")
    } else if (type == "防火监控") {
      scale = 0.8
      img = getAssetsImages("map/map-fhjk.png")
    } else if (type == "抓拍位置") {
      scale = 0.8
      img = getAssetsImages("map/forestFirePrevention-icon2.png")
    } else if (type == "疑似火情") {
      scale = 0.8
      img = getAssetsImages("map/forestFirePrevention-icon1.png")
    }
    return new Style({
      image: new Icon({
        src: img,
        anchor: [0.5, 1],
        scale: scale
      })
    })
  },
  zIndex: 3
})

//线图层
let lineLayer: any = new VectorLayer({
  source: new VectorSource(),
  style: (f) => {
    return new Style({
      stroke: new Stroke({
        width: 3,
        color: "#e99625"
      })
    })
  },
  zIndex: 4
})

export const useMap = () => {
  const { proxy } = getCurrentInstance() as any
  const mapOptions = ref<any>(null)
  //弹框信息
  const popupInfo = ref<any>({})
  // 图层类型
  const layerType = ref<any>("影像")
  // 二维地图
  const initMap = (mapInit: any) => {
    mapClass = mapInit
    map = mapInit.map
    mapOptions.value = mapInit.options
    projection = mapOptions.value.projection
    map.addLayer(vectorDrawPoint) // 点位图层
    map.addLayer(lineLayer) // 线图层
    map.on("click", (e) => {
      var f: any = map.forEachFeatureAtPixel(e.pixel, (f) => {
        return f
      })
      let pointType = f?.getProperties()?.pointType
      if (pointType) {
        popupInfo.value = f?.getProperties()
        if (f?.getGeometry().getType() == "Point") {
          overlayPopup.setPosition((f?.getGeometry() as Point).getCoordinates())
        } else {
          overlayPopup.setPosition(e.coordinate)
        }
        let coordinate = e.coordinate
        let viewResolution: any = map.getView().getResolution()
        // 计算偏下显示的新中心点坐标
        var downCenter = [
          coordinate[0],
          coordinate[1] + viewResolution * 100 // 50像素的偏移量
        ]
        // 设置新的中心点
        map.getView().setCenter(downCenter)
      } else {
        overlayPopup?.setPosition(undefined)
        popupInfo.value = null
      }
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
    map.getView().animate({
      center: transform([lon, lat], "EPSG:4326", projection),
      zoom: 15,
      duration: 1000
    })
  }
  //加载弹框
  const loadPopup = (ele: any) => {
    overlayPopup = new Overlay({
      element: ele,
      positioning: "bottom-center",
      offset: [0, -80],
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
    // console.log(data, '加载点位')
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
    feature.getGeometry().transform("EPSG:4326", projection)

    feature.setId(data.id || data.Id)
    feature.setProperties(data)
    vectorDrawPoint?.getSource().addFeature(feature)
    if (isShowPopup) {
      overlayPopup.setPosition(transform([data.lon, data.lat], "EPSG:4326", projection))
      popupInfo.value = data
      viewTo(data.lon, data.lat)
    }
  }
  //加载点位数组
  const loadPointArr = (arr: any) => {
    closePopup()
    arr.forEach((data) => {
      let wkt = `POINT(${data.lon} ${data.lat})`
      let feature: any = new WKT().readFeature(wkt, {
        dataProjection: "EPSG:4326"
      })
      feature.getGeometry().transform("EPSG:4326", projection)
      feature.setId(data.id || data.Id)
      feature.setProperties(data)
      vectorDrawPoint?.getSource().addFeature(feature)
    })
    // setTimeout(() => {
    //     map.getView().fit(vectorDrawPoint.getSource().getExtent());
    //     let view: any = map.getView();
    //     view.setZoom(view.getZoom() - 0.5);
    // }, 500);
  }
  //加载线段数据
  const loadLine = (data: any) => {
    if (lineLayer) {
      lineLayer.getSource().clear()
    }
    let feature: any = new Feature({
      geometry: new LineString(data)
    })
    feature.getGeometry().transform("EPSG:4326", projection)
    lineLayer.getSource().addFeature(feature)
    viewTo(data[0][0], data[0][1])
    setTimeout(() => {
      map.getView().fit(lineLayer.getSource().getExtent())
      let view: any = map.getView()
      view.setZoom(view.getZoom() - 1)
    }, 500)
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
    loadPointArr,
    loadLine
  }
}
