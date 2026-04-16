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
import { GetMapLineJx, GetSys_LayerImageInformation } from "@/api"
// import { getAssetsImages } from '@/hooks/useAssetsImages'
import { communityBuildingApi } from "@/api/CommunityBuilding"
let projection = "EPSG:3857"
let overlayPopup: Overlay //弹框
let mapClass: any = null
const highFeature = ref<any>(null) //高亮图斑

let highvectorLayer: any = new VectorLayer({
  source: new VectorSource(),
  style: (f) => {
    let color = "#7efff5"
    return new Style({
      stroke: new Stroke({
        color: color,
        width: 4
      })
    })
  },
  zIndex: 4
})

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
  center: [116.10938645574734, 31.053338281150353],
  zoom: 13,
  maxZoom: 18
})

let sqbjVectorLayer: any = new VectorLayer({
  zIndex: 3,
  source: new VectorSource(),
  style: (f) => {
    let color = "#0000ff"
    return new Style({
      stroke: new Stroke({
        color: color,
        width: 4
      }),
      fill: new Fill({
        color: "rgba(255,255,255,0.2)"
      })
    })
  }
})
export const useMap = () => {
  const mapOptions = ref<any>(null)
  //弹框信息
  const popupInfo = ref<any>({})

  // 图层类型
  const layerType = ref<any>("影像")
  const map = ref<any>(null)
  const detailData: any = ref({}) //地图弹框详情
  let overlay: Overlay
  // 获得影像和矢量图层
  const getMapBaseLayer = async () => {
    const layers = []
    const { response: imglist } = await GetSys_LayerImageInformation({
      imagetype: "影像地图"
    })
    if (imglist.length > 0) {
      let map_img = new TileLayer({
        source: new XYZ({
          url: imglist[0].url + "{z}/{y}/{x}.png"
        }),
        visible: true
      })
      map_img.set("title", "影像底图(美图)")
      layers.push(map_img)
    }
    const { response: sllist } = await GetSys_LayerImageInformation({
      imagetype: "矢量地图"
    })
    if (sllist.length > 0) {
      let map_vec = new TileLayer({
        source: new XYZ({
          url: sllist[0].url + "{z}/{y}/{x}.png"
        }),
        visible: false
      })
      map_vec.set("title", "矢量底图(美图)")
      layers.push(map_vec)
    }
    return layers
  }
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
    // 获得基础影像和基础矢量图层并加载
    getMapBaseLayer().then((layers: any) => {
      layers.forEach((layer: any) => {
        map.value.addLayer(layer)
      })
      // 手动派发 moveend 事件
      map.value.dispatchEvent("moveend")
    })

    map.value.addLayer(vectorDrawPoint) // 点位图层
    map.value.addLayer(highvectorLayer) // 高亮图层

    map.value.addLayer(sqbjVectorLayer)
    map.value.on("pointermove", (evt) => {
      if (evt.dragging) {
        return
      }
      let pixel = map.value.getEventPixel(evt.originalEvent)
      let hit = map.value.hasFeatureAtPixel(pixel)
      map.value.getTargetElement().style.cursor = hit ? "pointer" : ""
    })

    map.value.on("click", (e) => {
      var f: any = map.value.forEachFeatureAtPixel(e.pixel, (f) => {
        return f
      })

      if (f) {
        popupInfo.value = f?.getProperties()
        let coordinate = e.coordinate
        overlayPopup.setPosition(e.coordinate)
        // 计算偏下显示的新中心点坐标
        var downCenter = [
          coordinate[0],
          coordinate[1] // 50像素的偏移量
        ]
        // 设置新的中心点,并添加平滑过渡效果
        map.value.getView().setCenter(downCenter)
      } else {
        overlayPopup.setPosition(undefined)
        popupInfo.value = null
      }
    })
    loadsqbj()
  }

  // const loadJxLayer = async () => {
  //   const { response } = await GetMapLineJx()
  //   response.forEach((item: any) => {
  //     const feature = new WKT().readFeature(item.Geom)
  //     feature.setProperties(
  //       Object.assign(
  //         {},
  //         {
  //           Mc: item.Mc,
  //           Lon: item.Lon,
  //           Lat: item.Lat,
  //           Area: item.Area,
  //           Type: item.Type,
  //           featureType: "类型-地图界限"
  //         }
  //       )
  //     )

  //     jxVectorSource.addFeature(feature)
  //   })
  // }
  //加载社区边界
  const loadsqbj = async () => {
    let res: any = await communityBuildingApi.GetCommunityListByMap({})
    if (res.response.length > 0) {
      res.response.forEach((item: any) => {
        let wktFeature: any = new WKT().readFeature(item.geom, {
          dataProjection: "EPSG:4326"
        })
        wktFeature.setProperties(item)
        sqbjVectorLayer.getSource().addFeature(wktFeature)
      })
    }
  }

  //点击左侧树节点高亮图斑
  const glFeatures = (data: any) => {
    let validNames: any = []

    highvectorLayer.getSource().clear()

    let nodeList = data.bo.checkedNodes
    nodeList.forEach((item, index) => {
      if (item.geom) {
        let wktFeature: any = new WKT().readFeature(item.geom, {
          dataProjection: "EPSG:4326"
        })
        highvectorLayer.getSource().addFeature(wktFeature)
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
    map.value.getView().animate({
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
    loadPoint,
    map,
    glFeatures
  }
}
