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

let projection = "EPSG:3857"

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
  center: [116.16027952755078, 30.97908202369116],
  zoom: 13,
  maxZoom: 18
})

// 根据输入的16进制颜色和透明度生产rgba颜色

let jxVectorLayer: any, jxVectorSource: any, vectorSource: any, vectorLayer: any
export const useMap = () => {
  const proxy = getCurrentInstance()!.proxy as any
  const mapOptions = ref<any>(null)
  //弹框信息
  const popupInfo = ref<any>({})
  // 图层类型
  const layerType = ref<any>("影像")
  const map = ref<any>(null)
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
    // mapClass = mapInit

    // mapOptions.value = mapInit.options
    // projection = mapOptions.value.projection

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
    vectorSource = new VectorSource()
    vectorLayer = new VectorLayer({
      zIndex: 3,
      source: vectorSource,
      declutter: false
    })
    vectorLayer.set("title", "矢量图层")
    map.value.addLayer(vectorLayer)
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
          // // 功能区
          // 吊罐井缓冲区: hexToRgba(),
          // 麒麟沟缓冲区: hexToRgba(),
          // 多枝尖核心区: hexToRgba(),
          // 吊罐井核心区: hexToRgba(),
          // 川石核心区: hexToRgba(),
          // 实验区: hexToRgba(),
          // 多枝尖缓冲区: hexToRgba(),
          // 川石缓冲区: hexToRgba(),
          // 麒麟沟核心区: hexToRgba(),
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
      let pointType = f?.getProperties()?.pointType

      if (pointType) {
        if (f?.getGeometry().getType() == "Point") {
          overlayPopup.setPosition((f?.getGeometry() as Point).getCoordinates())
        } else {
          overlayPopup.setPosition(e.coordinate)
        }
        popupInfo.value = f?.getProperties()
        let coordinate = e.coordinate
        let viewResolution: any = map.value.getView().getResolution()
        // 计算偏下显示的新中心点坐标
        var downCenter = [
          coordinate[0],
          coordinate[1] // 50像素的偏移量
        ]

        // 设置新的中心点
        map.value.getView().setCenter(downCenter)
      } else {
        overlayPopup.setPosition(undefined)
        popupInfo.value = null
      }
    })
    // loadJxLayer() // 界限图层统一从图层管理中读取
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
    // const { response: response1 } = await GetMapLineGnqh()
    // response1.forEach((item: any) => {
    //   const feature = new WKT().readFeature(item.Geom)
    //   feature.setProperties(
    //     Object.assign(
    //       {},
    //       {
    //         Mc: item.Mc,
    //         Lon: item.Lon,
    //         Lat: item.Lat,
    //         Area: item.Area,
    //         Type: item.Type,
    //         featureType: "类型-地图功能区划"
    //       }
    //     )
    //   )
    //   jxVectorSource.addFeature(feature)
    // })
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
    let wkt = `POINT(${data.lon} ${data.lat})`

    let feature: any = new WKT().readFeature(wkt, {
      dataProjection: "EPSG:4326"
    })
    // feature.getGeometry().transform("EPSG:4326", projection)

    feature.setId(data.Id)
    feature.setProperties(data)

    feature.setStyle(
      new Style({
        image: new Icon({
          src:
            feature.get("status") === 1
              ? proxy.$fun.getImg("researchManagement/i1.png")
              : proxy.$fun.getImg("researchManagement/i2.png"),
          scale: 0.7,
          anchor: [0.5, 1]
        }),
        text: new OlText({
          text: data.name,
          font: "14px sans-serif",
          offsetY: -40,
          fill: new Fill({
            color: "#fff"
          }),
          stroke: new Stroke({
            color: "#000",
            width: 2
          })
        })
      })
    )
    vectorDrawPoint?.getSource().addFeature(feature)
    if (isShowPopup) {
      overlayPopup.setPosition([data.lon, data.lat])

      popupInfo.value = data
      viewTo(data.lon, data.lat)
    }
  }

  // 添加图层管理数据
  const addLayerManageData = (data: any, option: any) => {
    data.forEach((item: any) => {
      const geometryType = option.geometryType
      const feature = new WKT().readFeature(item.geom)
      const legend = option.legend.find((leg: any) => leg.type == item.type) || option.legend?.[0]
      let {
        icon = "",
        fillcolor = "rgba(255,255,255,0)",
        strokecolor = "rgba(255,255,255,1)",
        strokewidth = 2,
        textsize = 14,
        textcolor = "rgba(255,255,255,1)",
        offsetTextX = 0,
        offsetTextY = -55
      } = legend || {}
      feature.setProperties(
        Object.assign({}, item, {
          icon: icon ? "/statisUrl/" + icon : undefined,
          offsetTextX,
          offsetTextY,
          textsize,
          textcolor,
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
                  width: strokewidth
                })
              : undefined,
          text: new OlText({
            text: item.name,
            font: `${textsize}px sans-serif`,
            offsetX: geometryType === "point" ? offsetTextX : 0,
            offsetY: geometryType === "point" ? offsetTextY : 0,
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
      vectorSource.addFeature(feature)
    })
    vectorLayer.setVisible(true)
  }
  // 移除图层管理数据
  const removeLayerManageData = (node: any) => {
    let featureType = `类型-图层管理-${node.mc + node.id}`
    const features = vectorSource.getFeatures().filter((item: any) => {
      return item.get("featureType") === featureType
    })
    vectorSource.removeFeatures(features)
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
    removeLayerManageData,
    addLayerManageData
  }
}
