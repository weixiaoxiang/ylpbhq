/**
 * 地图实例-统一进行管理，方便调用
 * author: 魏晓翔
 * @module useOlMap
 * @desc 创建OpenLayers映射实例的钩子
 * @returns {ol.Map} OpenLayers映射实例
 */
import { GetInterface, GetSsxh_XhUserInfoByUserId, GetSys_LayerImageInformation, GetXhgk_XhOnlineList } from "@/api"
// @ts-expect-error
import AnimatedCluster from "ol-ext/layer/AnimatedCluster"
import { Circle, RegularShape } from "ol/style"
import HeatmapLayer from "ol/layer/Heatmap.js"
import "ol-ext/featureanimation/FeatureAnimation"
// @ts-ignore
import OlExtZoom from "ol-ext/featureanimation/Zoom"
// @ts-ignore
import OlExtBounce from "ol-ext/featureanimation/Bounce"

import { easeOut } from "ol/easing"
import { MultiPoint } from "ol/geom"
// module所属模块
export default function useOlMap(
  // 弹窗组件
  popup?: Ref<any>,
  config?: {
    /**
     * 地图容器id
     */
    target?: string
    /**
     * 地图缩放级别
     */
    zoom?: number
    /**
     * 地图中心点
     */
    center?: number[]
    /**
     * 所属页面的模块名称
     */
    modular?: string
    /**
     * 地图类型
     */
    baseMapType?: "影像底图" | "矢量底图"
    /**
     * popup默认的格式类型
     */
    popupFormatType?: string
    /**
     * 是否默认打开覆盖物
     */
    openOverlay?: boolean
    /**
     * 覆盖物偏移量
     */
    overlayOffset?: number[]
    /**
     * 覆盖物位置
     */
    overlayPositioning?: "bottom-left" | "bottom-center" | "bottom-right"
    /**
     * 矢量图层是否开启碰撞,防止矢量要素太多影响观感
     */
    vectorLayerDeclutter?: boolean | number | string
    /**
     * 矢量图层的类型模式
     */
    vectorLayerMode?: "vectorLayer" | "vectorImage"
    /**
     * 是否显示聚合图层，目前只支持点聚合
     */
    showClusterLayer?: boolean
    /**
     * 处理函数集合
     */
    callBack?: {
      /**
       * 地图点击事件回调
       */
      click?: (data: any) => void
    }
  }
) {
  // vue3
  const proxy = getCurrentInstance()!.proxy as any
  // 创建一个地图实例
  let map = ref()
  // 配置
  const CONFIG = Object.assign(
    {
      target: "map", // 地图容器id
      center: [116.13472130884368, 31.030508216667805],
      zoom: 13.1595,
      modular: "", // 所属模块
      popupFormatType: "",
      baseMapType: "影像底图",
      overlayOffset: [0, 0],
      openOverlay: false,
      overlayPositioning: "bottom-left",
      vectorLayerDeclutter: true,
      vectorLayerMode: "vectorLayer",
      showClusterLayer: false,
      // 处理函数集合
      callBack: {}
    },
    config
  )
  // 弹窗组件
  let overlay = ref<any>(null)
  // 矢量图层
  let vectorLayer: any, vectorSource: any
  // 矢量图层要素存储
  let vectorFeatures = ref<any[]>([])
  // 聚合图层
  let clusterLayer: any, clusterNotAllowLayer: any
  // 弹窗信息
  const popupInfo = ref<any>()
  const popupFormatType = ref<any>(CONFIG.popupFormatType) // popup默认的格式类型
  // 全局高亮要素
  let highlightFeature: any
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

  // 创建聚合图层
  const createClusterLayer = () => {
    // 创建不允许聚合的图层,用于聚合时排除,一般为线和面的要素，因为它们不可以被聚合
    clusterNotAllowLayer = new VectorLayer({
      zIndex: 3,
      source: new VectorSource()
    })
    clusterNotAllowLayer.set("title", "其他图层-不允许聚合的图层")
    map.value.addLayer(clusterNotAllowLayer)
    // 定义聚合等级阈值
    const CLUSTER_LEVELS = {
      LEVEL_4: 80,
      LEVEL_3: 40,
      LEVEL_2: 10,
      LEVEL_1: 0
    } as const

    // 聚合样式缓存
    const clusterStyleCache: any = {}

    // 聚合
    clusterLayer = new AnimatedCluster({
      layerName: "其他图层-聚合",
      zIndex: 4,
      animationDuration: 700, //0 为不开启聚合动画 700
      source: new Cluster({
        distance: 200,
        minDistance: 100,
        source: vectorSource,
        geometryFunction: (feature: any) => {
          const type = feature.getGeometry().getType()
          if (type === "Point") {
            return feature.getGeometry()
          }
          return null
        },
        createCluster: (point: any, features: any) => {
          return new Feature({
            geometry: point,
            features: features,
            featureType: "类型-矢量图层点聚合"
          })
        }
      }),
      style: (feature: any, _: number) => {
        const clusterSize = feature.get("features").length
        if (clusterStyleCache[clusterSize]) {
          return clusterStyleCache[clusterSize]
        }
        // 根据聚合数量确定图标等级
        const clusterLevel =
          clusterSize > CLUSTER_LEVELS.LEVEL_4
            ? 4
            : clusterSize > CLUSTER_LEVELS.LEVEL_3
              ? 3
              : clusterSize > CLUSTER_LEVELS.LEVEL_2
                ? 2
                : 1
        // 当聚合数量为1时，使用原始feature的样式
        if (clusterSize === 1) {
          const originalFeature = feature.get("features")[0]
          let { icon, offsetTextX, offsetTextY, textsize, textcolor } = originalFeature.getProperties()
          return new Style({
            image: new Icon({
              src: icon,
              scale: 1,
              anchor: [0.5, 1]
            }),
            text: new OlText({
              text: originalFeature.get("name"),
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
        }
        // 聚合样式
        const style = new Style({
          image: new Icon({
            src: proxy.$fun.getImg(`ks-cluster-lv${clusterLevel}.svg`),
            scale: 0.8
          }),
          text: new OlText({
            text: clusterSize.toString(),
            fill: new Fill({ color: "#fff" })
          })
        })
        // 缓存聚合样式
        clusterStyleCache[clusterSize] = style
        return style
      }
    })
    clusterLayer.set("title", "其他图层-聚合")
    map.value.addLayer(clusterLayer)
  }

  const initMap = async () => {
    const view = new View({
      projection: "EPSG:4326",
      constrainResolution: true, // 限制分辨率,整数倍缩放
      center: CONFIG.center,
      zoom: CONFIG.zoom,
      maxZoom: 21,
      minZoom: 3
    })
    // 天地图影像底图
    let tdt_map_img = new TileLayer({
      source: new XYZ({
        url: "https://t6.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"
      }),
      visible: true
    })
    tdt_map_img.set("title", "影像底图(天地图)")
    // 天地图矢量底图
    let tdt_map_vec = new TileLayer({
      source: new XYZ({
        url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"
      }),
      visible: false
    })
    tdt_map_vec.set("title", "矢量底图(天地图)")
    map.value = new OlMap({
      layers: [tdt_map_img, tdt_map_vec],
      view,
      controls: defaultsControls({
        zoom: false,
        attributionOptions: {
          collapsible: false
        },
        rotate: false
      }),
      interactions: defaultInteractions({
        doubleClickZoom: false
      }),
      target: CONFIG.target
    })
    // 获得基础影像和基础矢量图层并加载
    getMapBaseLayer().then((layers: any) => {
      layers.forEach((layer: any) => {
        map.value.addLayer(layer)
      })
      // 手动派发 moveend 事件
      map.value.dispatchEvent("moveend")
    })
    // 保存option
    map.value.CONFIG = CONFIG
    vectorSource = new VectorSource()
    // 创建矢量图层，矢量图层类型
    if (CONFIG.vectorLayerMode === "vectorLayer") {
      vectorLayer = new VectorLayer({
        zIndex: 3,
        source: vectorSource,
        declutter: CONFIG.vectorLayerDeclutter
      })
    } else {
      vectorLayer = new VectorImage({
        zIndex: 3,
        source: vectorSource,
        declutter: CONFIG.vectorLayerDeclutter
      })
    }

    vectorLayer.set("title", "矢量图层")
    map.value.addLayer(vectorLayer)
    if (popup?.value) {
      overlay.value = new Overlay({
        element: popup.value.$el,
        autoPan: true,
        offset: CONFIG.overlayOffset,
        positioning: CONFIG.overlayPositioning, //"bottom-left",
        stopEvent: true
      })
      map.value.addOverlay(overlay.value)
      CONFIG.openOverlay && overlay.value.setPosition([116.15808287182611, 31.016829406763566])
    }
    // 是否显示聚合图层
    if (CONFIG.showClusterLayer) {
      createClusterLayer()
    }
    // 点击事件
    map.value.on("click", async (e: any) => {
      // console.log(
      //   JSON.stringify({
      //     lon: e.coordinate[0],
      //     lat: e.coordinate[1]
      //   })
      // )

      // console.log(map.value.getView().getCenter(), map.value.getView().getZoom())
      // 获得点击的feature
      const feature = map.value.forEachFeatureAtPixel(e.pixel, (feature: any) => {
        return feature
      })
      if (feature) {
        // 点击整合前整合后功能区返回
        const treeid = feature.get("treeid")
        if ([35, 34].includes(treeid)) {
          return
        }
        const featureType = feature.get("featureType")
        if (!featureType) {
          return
        }
        if (featureType === "类型-巡护人员") {
          popupFormatType.value = "巡护人员"
          const { response } = await GetSsxh_XhUserInfoByUserId({ UserIdList: feature.get("Id") })
          popupInfo.value = response[0]
          popupInfo.value.title = "巡护人员信息"
          overlay?.value?.setPosition(feature.getGeometry().getCoordinates())
        }
        // 类型-矢量图层点聚合(动植物监测)
        if (featureType === "类型-矢量图层点聚合") {
          const features = feature.get("features")
          if (features.length === 1) {
            const originalFeature = features[0]
            CONFIG.callBack?.click?.(originalFeature.getProperties())
          }
        }
        if (featureType.indexOf("类型-图层管理") > -1) {
          // 古树名木和动植物监测模块点击单独处理
          if (["古树名木", "动植物监测"].includes(CONFIG.modular)) {
            CONFIG.callBack?.click?.(feature.getProperties())
            return
          }
          // 红外相机监测模块点击单独处理
          if (CONFIG.modular === "红外相机监测") {
            CONFIG.callBack?.click?.(feature.getProperties())
            return
          }
          // 病虫害监测模块点击单独处理
          if (CONFIG.modular === "病虫害监测") {
            CONFIG.callBack?.click?.(feature.getProperties())
            return
          }
          // 获得详情统一方法
          const data = await getDetail(feature.getProperties())
          let coordinates: Array<number>
          const geometryType = feature.getGeometry().getType()
          if (geometryType === "Point") {
            coordinates = feature.getGeometry().getCoordinates()
          } else {
            coordinates = e.coordinate
          }
          locationMap({ type: "地图要素点击-中心定位", data: coordinates }, () => {
            popupFormatType.value = feature.get("tabname") // 动态弹窗类型
            popupInfo.value = data
            // 设置弹窗偏移量，点要素偏移，线面要素不偏移
            if (feature.getGeometry().getType() === "Point") {
              overlay?.value?.setOffset(CONFIG.overlayOffset)
            } else {
              overlay?.value?.setOffset([0, 0])
            }
            overlay?.value?.setPosition(coordinates)
          })
        }

        if (featureType === "类型-全景图点位") {
          if (highlightFeature?.getId() !== feature.getId() || !highlightFeature) {
            highlightFeature && toggleHighlightFeature(highlightFeature) // 取消上一次高亮
            highlightFeature = feature
            toggleHighlightFeature(highlightFeature) // 高亮当前要素
            CONFIG.callBack?.click?.(feature.getProperties())
          }
          return
        }
      }
    })

    const showMapCriticalZoom = 13 // 地图缩放级别大于等于13时，显示美图发布的地图,反之隐藏
    // 点击地图缩放时
    map.value.on("moveend", (_: any) => {
      // console.log(map.getView().getZoom(), 1111)
      const zoom = map.value.getView().getZoom()!
      const layers = map.value.getLayers().getArray()
      layers.forEach((layer: any) => {
        const layerName = layer.get("title")
        if (layerName === "影像底图(天地图)") {
          layer.setVisible(map.value.CONFIG.baseMapType === "影像底图") // 显示天地图
        }
        if (layerName === "影像底图(美图)") {
          layer.setVisible(zoom >= showMapCriticalZoom && map.value.CONFIG.baseMapType === "影像底图") // 显示美图
        }
        if (layerName === "矢量底图(天地图)") {
          layer.setVisible(map.value.CONFIG.baseMapType === "矢量底图") // 显示天地图
        }
        if (layerName === "矢量底图(美图)") {
          layer.setVisible(zoom >= showMapCriticalZoom && map.value.CONFIG.baseMapType === "矢量底图") // 显示美图
        }
      })
    })
    // 鼠标移动事件
    map.value.on("pointermove", (e: any) => {
      const feature = map.value.forEachFeatureAtPixel(e.pixel, (f: any) => f, {
        layerFilter: (layer: any) => {
          return layer.get("title") == "矢量图层"
        }
      })
      if (feature) {
        map.value.getTargetElement().style.cursor = "pointer"
      } else {
        map.value.getTargetElement().style.cursor = ""
      }
    })
  }
  // 高亮要素
  const toggleHighlightFeature = (feature: any) => {
    const geometryType = feature.getGeometry().getType()
    if (geometryType === "Point") {
      const iconStyle = feature.getStyle()?.getImage()
      const textStyle = feature.getStyle()?.getText()
      if (iconStyle && iconStyle instanceof Icon) {
        const image = iconStyle.getImage(0)
        const scale = iconStyle.getScale()
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d") as any
        canvas.width = image.width
        canvas.height = image.height
        context.drawImage(image, 0, 0, image.width, image.height)
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        for (let i = 0, ii = data.length; i < ii; i = i + (i % 4 == 2 ? 2 : 1)) {
          data[i] = 255 - data[i]
        }
        context.putImageData(imageData, 0, 0)
        feature.setStyle(
          new Style({
            image: new Icon({
              anchor: [0.5, 1],
              scale: scale,
              crossOrigin: "anonymous",
              src: undefined,
              img: canvas
            }),
            text: textStyle
          })
        )
      }
    }
  }
  // 设置整理
  const setDeclutter = (declutter: boolean) => {
    CONFIG.vectorLayerDeclutter = declutter
    vectorLayer.setDeclutter(declutter)
  }
  // 设置聚合
  const setCluster = (cluster: boolean) => {
    // 如果聚合图层不存在，则创建
    if (!clusterLayer) {
      createClusterLayer()
    }
    CONFIG.showClusterLayer = cluster
    vectorLayer.setVisible(!CONFIG.showClusterLayer)
    clusterNotAllowLayer.setVisible(CONFIG.showClusterLayer)
    clusterLayer.setVisible(CONFIG.showClusterLayer)
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
    // 如果点击是防火监测点，则将包家防火热成像、包家防火同时查出来
    if (data.treeid === 25) {
      // 查询包家防火
      const {
        response: response2,
        success: success2,
        msg: msg2
      } = await GetInterface({
        ssmk: "地图弹框详情",
        layerid: data.treeid,
        id: 22
      })
      if (!success2) return ElMessage.error(msg2)
      response2.detail = response2.response
      delete response2.response
      return [response, response2]
    }
    return response
  }
  // 关闭弹窗
  const closePopup = () => {
    overlay?.value?.setPosition(undefined)
  }
  // 设置火情预警详情弹框位置
  const setHqDetailPopup = (position: any) => {
    map.value.getView().animate(
      {
        center: position,
        duration: 500,
        zoom: 15
      },
      () => {
        overlay?.value?.setPosition(position)
      }
    )
  }
  // 传入经纬度wkt,获得linestring类型的feature
  const getLineStringFeature = (wkt: any) => {
    return new WKT().readFeature(wkt)
  }
  // 传入经纬度二维数组,获得point类型的feature数组,{id, coor}
  const getPointFeatures = (coordinates: any) => {
    return coordinates.map((item: any) => {
      const feature = new Feature({
        geometry: new Point([parseFloat(item.lon), parseFloat(item.lat)]),
        id: item.id
      })
      feature.set("id", item.Id || item.id)
      return feature
    })
  }

  // 添加或删除巡护在线人员点位
  const addOrRemoveXhOnline = (data: any) => {
    if (data.type === "添加") {
      const features: any = []
      data.leafNodes.forEach((item: any) => {
        const feature = new Feature({
          geometry: new Point([parseFloat(item.Lon), parseFloat(item.Lat)])
        })
        feature.setId("巡护人员_" + item.Id)
        feature.setProperties(Object.assign({}, item, { featureType: "类型-巡护人员" }))
        feature.setStyle(
          new Style({
            image: new Icon({
              src:
                item.Status === "巡护"
                  ? proxy.$fun.getImg("patrol/people-online.png")
                  : item.Status === "登录"
                    ? proxy.$fun.getImg("patrol/people-signIn.png")
                    : proxy.$fun.getImg("patrol/people-offline.png"),
              scale: 1,
              anchor: [0.5, 1]
            }),
            text: new OlText({
              text: item.Name,
              font: "16px sans-serif",
              offsetY: -60,
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
        features.push(feature)
      })
      vectorSource.addFeatures(features)
    } else if (data.type === "删除") {
      data.leafNodes.forEach((item: any) => {
        vectorSource.removeFeature(vectorSource.getFeatureById("巡护人员_" + item.Id))
      })
    }
    // // 刷新视图
    // nextTick(() => {
    //   if (vectorSource.getExtent()[0] !== Infinity)
    //     map.value.getView().fit(vectorSource.getExtent(), {
    //       padding: [100, 100, 100, 200],
    //       duration: 500,
    //       maxZoom: 18
    //     })
    // })
  }
  // 添加图层管理数据
  const addLayerManageData = (data: any, option: any) => {
    data.forEach((item: any) => {
      // 判断geom是否合理
      if (!item.geom) return
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
      feature.setProperties(
        Object.assign({}, item, {
          icon: icon ? "/statisUrl/" + icon : undefined,
          offsetTextX,
          offsetTextY,
          textsize,
          textcolor,
          featureType: `类型-图层管理-${option.mc}`,
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
      // 开启点聚合时将线和面的要素放入clusterNotAllowLayer，因为它们不可以被聚合
      if (geometryType !== "point" && CONFIG.showClusterLayer) {
        clusterNotAllowLayer.getSource().addFeature(feature)
      }
    })
    vectorLayer.setVisible(!CONFIG.showClusterLayer)
    // 将矢量图层要素存储，对外暴露
    vectorFeatures.value = vectorSource.getFeatures()
  }
  // 移除图层管理数据
  const removeLayerManageData = (node: any) => {
    let featureType = `类型-图层管理-${node.mc}`
    const features = vectorSource.getFeatures().filter((item: any) => {
      return item.get("featureType") === featureType
    })
    vectorSource.removeFeatures(features)
    // 开启点聚合时,需要将线和面的要素从clusterNotAllowLayer中移除
    if (CONFIG.showClusterLayer) {
      clusterNotAllowLayer.getSource().removeFeatures(features)
    }
    // 将矢量图层要素存储，对外暴露
    vectorFeatures.value = vectorSource.getFeatures()
  }
  // 添加动植物数据
  const addDzswData = (data: any, option: any) => {
    data.forEach((item: any) => {
      let iconSrc = option.legend.icon
      const feature = new Feature({
        geometry: new Point([parseFloat(item.lon), parseFloat(item.lat)])
      })
      feature.setProperties(Object.assign({}, item, { icon: iconSrc, featureType: `类型-动植物本底资源` }))

      feature.setStyle(
        new Style({
          image: new Icon({
            src: iconSrc,
            scale: 0.7,
            anchor: [0.5, 1]
          }),
          text: new OlText({
            text: item.name,
            font: "14px sans-serif",
            offsetY: -30,
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
      vectorSource.addFeature(feature)
    })
    vectorLayer.setVisible(!CONFIG.showClusterLayer)
  }
  // 移除动植物数据
  const removeDzswData = (node: any) => {
    const features = vectorSource.getFeatures().filter((item: any) => {
      return item.get("featureType") === `类型-动植物本底资源` && item.get("treeid") === node.id
    })
    vectorSource.removeFeatures(features)
  }
  // 添加古树名木数据
  const addGsmmData = (data: any, option: any) => {
    data.forEach((item: any) => {
      let iconSrc = option.legend.icon
      const feature = new Feature({
        geometry: new Point([parseFloat(item.lon), parseFloat(item.lat)])
      })
      feature.setProperties(Object.assign({}, item, { icon: iconSrc, featureType: `类型-古树名木` }))
      feature.setStyle(
        new Style({
          image: new Icon({
            src: iconSrc,
            scale: 0.7,
            anchor: [0.5, 1]
          }),
          text: new OlText({
            text: item.name,
            font: "14px sans-serif",
            offsetY: -45,
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
      vectorSource.addFeature(feature)
    })
  }
  // 移除古树名木数据
  const removeGsmmData = (node: any) => {
    const features = vectorSource.getFeatures().filter((item: any) => {
      return item.get("featureType") === `类型-古树名木` && item.get("treeid") === node.id
    })
    vectorSource.removeFeatures(features)
  }
  // 添加虫情测报灯数据
  const addCqcbdData = (data: any) => {
    data.forEach((item: any) => {
      const feature = new Feature({
        geometry: new Point([parseFloat(item.lon || 116.1324322), parseFloat(item.lat || 31.066279)])
      })
      feature.setProperties(Object.assign({}, item, { featureType: `类型-虫情测报灯` }))
      let iconSrc = proxy.$fun.getImg("backgroundResources/f1.png")
      feature.setStyle(
        new Style({
          image: new Icon({
            src: iconSrc,
            scale: 1,
            anchor: [0.5, 1]
          }),
          text: new OlText({
            text: item.equipmentname,
            font: "14px sans-serif",
            offsetY: -40,
            fill: new Fill({
              color: "#15B392"
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
  }
  // 添加病虫害统计分析热力图
  let heatMapLayer: any
  const addHotMapData = (data: any) => {
    if (!heatMapLayer) {
      heatMapLayer = new HeatmapLayer({
        source: new VectorSource(),
        blur: 30,
        radius: 25,
        zIndex: 2,
        weight: (feature: any) => {
          const count = feature.get("count")
          return count
        }
      })
      map.value.addLayer(heatMapLayer)
    }
    const fs: any = []
    data.forEach((item: any) => {
      const feature = new Feature({
        geometry: new Point([parseFloat(item.lon), parseFloat(item.lat)])
      })
      feature.setProperties(Object.assign({}, item, { featureType: `类型-病虫害统计分析热力图` }))
      fs.push(feature)
    })
    heatMapLayer.getSource().addFeatures(fs)
  }
  // 添加红外相机物种分析热力图
  let wzHeatMapLayer: any
  const addWzHeatMapData = (data: any) => {
    if (!wzHeatMapLayer) {
      wzHeatMapLayer = new HeatmapLayer({
        source: new VectorSource(),
        blur: 30,
        radius: 25,
        zIndex: 4,
        weight: (feature: any) => {
          // 0.5是为了让热力图更明显，因为weight是归一化后的值，范围是[0,1]
          const weight = feature.get("weight") + 0.5
          return weight
        }
      })
      map.value.addLayer(wzHeatMapLayer)
    }
    const fs: any = []
    data.forEach((item: any) => {
      const feature = new Feature({
        geometry: new Point([parseFloat(item.lon), parseFloat(item.lat)])
      })
      feature.setProperties(Object.assign({}, item, { featureType: `类型-红外相机物种分析热力图` }))
      fs.push(feature)
    })
    wzHeatMapLayer.getSource().clear()
    wzHeatMapLayer.getSource().addFeatures(fs)
  }
  // 添加全景图点位
  const addPanoramaData = (data: any) => {
    // 加载网络图片后再执行代码
    const img = new Image()
    img.src = "/statisUrl/ecotourism/panorama-point.png"
    img.onload = () => {
      data.forEach((item: any) => {
        const feature = new Feature({
          geometry: new Point(item.position)
        })
        feature.setId(item.id)
        feature.setProperties(Object.assign({}, item, { featureType: `类型-全景图点位` }))
        feature.setStyle(
          new Style({
            image: new Icon({
              img,
              anchor: [0.5, 1]
            })
          })
        )
        vectorSource.addFeature(feature)
      })
      map.value.getView().fit(vectorSource.getExtent(), {
        duration: 500,
        zoom: 15,
        callback: () => {
          // 默认高亮第一个全景图点位
          highlightPanorama(data[0])
        }
      })
    }
  }
  // 高亮全景图点位
  const highlightPanorama = (data: any) => {
    const feature = vectorSource.getFeatureById(data.id)
    if (feature) {
      if (highlightFeature?.getId() !== feature.getId() || !highlightFeature) {
        highlightFeature && toggleHighlightFeature(highlightFeature) // 取消上一次高亮
        highlightFeature = feature
        toggleHighlightFeature(highlightFeature) // 高亮当前要素
      }
    }
  }

  let testLayer: any = null // 测试图层
  const addTest = (data: any) => {
    if (!testLayer) {
      testLayer = new VectorLayer({
        source: vectorSource
      })
      map.value.addLayer(testLayer)
    }
    testLayer.getSource().clear()
    data.forEach((item: any) => {
      const feature = new Feature({
        geometry: new Point([parseFloat(item.lon), parseFloat(item.lat)])
      })
      feature.setStyle(
        new Style({
          image: new Circle({
            radius: 3,
            fill: new Fill({
              color: "#fff"
            })
          }),
          text: new OlText({
            text: item.value,
            fill: new Fill({
              color: "#fff"
            }),
            offsetY: -10
          })
        })
      )
      testLayer.getSource().addFeature(feature)
    })
  }

  // 开启在线人员定位实时刷新
  const refreshXhOnline = async () => {
    const { response } = await GetXhgk_XhOnlineList()
    response.forEach((item: any) => {
      const feature = vectorSource.getFeatureById("巡护人员_" + item.Id)
      if (feature) {
        feature.getGeometry().setCoordinates([parseFloat(item.Real_lon), parseFloat(item.Real_lat)])
        feature.set({
          Lon: item.Real_lon,
          Lat: item.Real_lat,
          Status: item.Status
        })
        const imgSrc = item.Status === "在线" ? "patrol/people-online.png" : "patrol/people-offline.png"
        feature.getStyle().setImage(
          new Icon({
            src: proxy.$fun.getImg(imgSrc),
            scale: 1,
            anchor: [0.5, 1]
          })
        )
      }
    })
  }
  // 科研监测-添加气象水质站点
  const addQxSwPoints = (data: any) => {
    data.forEach((item: any) => {
      const feature = new Feature({
        geometry: new Point([parseFloat(item.lon), parseFloat(item.lat)])
      })
      let type = item.equipmentType || "水文"
      let iconSrc = ""
      if (type === "水文") {
        iconSrc = proxy.$fun.getImg("researchManagement/swmap-icon.png")
      }
      if (type === "气象") {
        iconSrc = proxy.$fun.getImg("researchManagement/qxmap-icon.png")
      }
      feature.setProperties(Object.assign({}, item, { featureType: `类型-水文气象站点` }))
      feature.setStyle(
        new Style({
          image: new Icon({
            src: iconSrc,
            scale: 0.8,
            anchor: [0.5, 1]
          }),
          text: new OlText({
            text: item.name,
            font: "16px sans-serif",
            offsetY: -60,
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
      vectorSource.addFeature(feature)
    })
  }
  // 科研监测-添加车辆卡口、人脸识别、视频监控点、防火监控点等等监控点
  const addMonitorPoints = (data: any) => {
    data.forEach((item: any) => {
      const feature = new Feature({
        geometry: new Point([parseFloat(item.lon), parseFloat(item.lat)])
      })
      let type = item.remark || "卡口监测"
      let iconSrc = ""
      if (type === "卡口监测") {
        iconSrc = proxy.$fun.getImg("researchManagement/kkmap-icon.png")
      }
      if (type === "人脸识别") {
        iconSrc = proxy.$fun.getImg("researchManagement/rnmap-icon.png")
      }
      if (type === "视频监控点") {
        iconSrc = proxy.$fun.getImg("researchManagement/spmap-icon.png")
      }
      if (type === "防火监控点") {
        iconSrc = proxy.$fun.getImg("researchManagement/hqmap-icon.png")
      }
      feature.setProperties(Object.assign({}, item, { featureType: `类型-监控卡口点` }))
      feature.setStyle(
        new Style({
          image: new Icon({
            src: iconSrc,
            scale: 1,
            anchor: [0.5, 1]
          }),
          text: new OlText({
            text: item.mc,
            font: "16px sans-serif",
            offsetY: -50,
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
      vectorSource.addFeature(feature)
    })
  }
  // 科研监测-添加红外相机监测-红外相机网格
  const addHwxjWgPolygon = (data: any) => {
    data.forEach((item: any) => {
      const wkt = item.geom
      const feature = new WKT().readFeature(wkt)
      feature.setProperties(Object.assign({}, item, { featureType: `类型-红外相机监测网格` }))
      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: "rgba(17, 139, 80,1)",
            width: 2
          }),
          fill: new Fill({
            color: "rgba(17, 139, 80,0.2)"
          }),
          text: new OlText({
            text: item.name,
            font: "12px sans-serif",
            offsetY: 15,
            placement: "line",
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
      vectorSource.addFeature(feature)
    })
  }
  // 应急指挥，加载无人机轨迹
  let trackLayer: any = null,
    lineTrackFeature: any = null
  const renderTrack = (data: any) => {
    if (!trackLayer) {
      trackLayer = new VectorLayer({
        source: new VectorSource(),
        zIndex: 10
      })
      map.value.addLayer(trackLayer)
    }
    if (!lineTrackFeature) {
      const lineTrackGeometry = new LineString(data.map((item: any) => [parseFloat(item.lon), parseFloat(item.lat)]))
      lineTrackFeature = new Feature({
        geometry: lineTrackGeometry
      })
      // 单独设置linestring的起点终点中间点样式
      lineTrackFeature.setStyle([
        // 线条样式
        new Style({
          stroke: new Stroke({ color: "#ff4757", width: 3 })
        }),
        // 起点样式
        new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: "#00ff00" // 绿色表示起点
            }),
            stroke: new Stroke({
              color: "#ffffff",
              width: 2
            })
          }),
          geometry: function (feature: any) {
            if (feature.getGeometry().getType() === "LineString") {
              var coordinates = feature.getGeometry().getCoordinates()
              // 只返回起点
              return new Point(coordinates[0])
            }
          }
        }),
        // 终点样式
        new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: "#ff0000" // 红色表示终点
            }),
            stroke: new Stroke({
              color: "#ffffff",
              width: 2
            })
          }),
          geometry: function (feature: any) {
            if (feature.getGeometry().getType() === "LineString") {
              var coordinates = feature.getGeometry().getCoordinates()
              // 只返回终点
              return new Point(coordinates[coordinates.length - 1])
            }
          }
        }),
        // 中间点样式（可选）
        new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({
              color: "#ff7f50"
            }),
            stroke: new Stroke({
              color: "#ffffff",
              width: 2
            })
          }),
          geometry: function (feature: any) {
            if (feature.getGeometry().getType() === "LineString") {
              var coordinates = feature.getGeometry().getCoordinates()
              // 返回除起点和终点外的中间点
              if (coordinates.length > 2) {
                return new MultiPoint(coordinates.slice(1, -1))
              }
            }
          }
        })
      ])
      trackLayer.getSource().addFeature(lineTrackFeature)
    } else {
      const lineTrackGeometry = new LineString(data.map((item: any) => [parseFloat(item.lon), parseFloat(item.lat)]))
      lineTrackFeature.setGeometry(lineTrackGeometry)
    }
    // fit
    map.value.getView().fit(lineTrackFeature.getGeometry()?.getExtent(), {
      duration: 500,
      maxZoom: 20,
      padding: [100, 500, 100, 500]
    })
  }
  // 定位地图，callback为回调函数可选
  const locationMap = ({ type, data, geometryType, geom }: any, callback?: () => void) => {
    if (type === "点击树定位巡护人员") {
      const feature = vectorSource.getFeatureById("巡护人员_" + data.id)
      if (feature) {
        const coor = feature.getGeometry().getCoordinates()
        map.value.getView().animate({
          center: coor,
          duration: 500,
          zoom: 18
        })
      }
    }
    if (type === "古树名木-古树档案定位") {
      const coor = data
      if (coor) {
        map.value.getView().animate({
          center: coor,
          duration: 500,
          zoom: 15
        })

        pulse(coor) // 定位脉冲动画动画
      }
    }
    if (type === "搜索要素") {
      if (["MultiPolygon", "Polygon"].includes(geometryType)) {
        if (geom) {
          map.value.getView().fit(new WKT().readFeature(geom).getGeometry(), {
            duration: 500,
            zoom: 15
          })
        }
      } else {
        const coor = data
        if (coor) {
          map.value.getView().animate({
            center: coor,
            duration: 500,
            zoom: 20
          })

          pulse(coor) // 定位脉冲动画动画
        }
      }
    }
    if (type === "地图要素点击-中心定位") {
      const coor = data
      if (coor) {
        map.value.getView().animate(
          {
            // // 适当偏移防止遮挡
            // center: [coor[0] + 0.01, coor[1] + 0.005],
            center: coor,
            duration: 500
            // zoom: 15
          },
          callback || (() => {})
        )
      }
    }
    if (type === "电子围栏-设备定位") {
      const coor = data
      if (coor) {
        map.value.getView().animate(
          {
            center: coor,
            duration: 500,
            zoom: 15
          },
          callback || (() => {})
        )

        pulse(coor) // 定位脉冲动画动画
      }
    }
  }
  // 定位脉冲动画
  const pulse = (lonlat: any) => {
    var nb = 3
    for (var i = 0; i < nb; i++) {
      setTimeout(function () {
        pulseFeature(lonlat)
      }, i * 500)
    }
    function pulseFeature(coord: any) {
      var f = new Feature(new Point(coord))
      f.setStyle(
        new Style({
          image: new Circle({
            radius: 60,
            stroke: new Stroke({ color: "#ff7f50", width: 5 })
          })
        })
      )
      map.value.animateFeature(
        f,
        new OlExtZoom({
          fade: easeOut,
          duration: 3000,
          repeat: 2,
          revers: true
        })
      )
    }
  }
  // 点元素跳动
  let anim: any, currentAnimF: any
  const animateFeature = (feature: any) => {
    if (!anim) {
      anim = new OlExtBounce({
        duration: 800,
        hiddenStyle: [
          new Style({
            image: new RegularShape({
              radius: 10,
              radius2: 5,
              points: 5,
              displacement: [0, 10],
              fill: new Fill({ color: [0, 0, 0, 0.01] })
            }),
            stroke: new Stroke({ color: [0, 0, 0, 0.01], width: 2 }),
            fill: new Fill({ color: [0, 0, 0, 0] })
          })
        ]
      })
      anim.on("animationend", (e: any) => {
        if (!e.user) currentAnimF = vectorLayer.animateFeature(e.feature, anim)
      })
      //
      map.value.on("click", (e: any) => {
        const feature = map.value.forEachFeatureAtPixel(e.pixel, (feature: any) => {
          return feature
        })
        if (feature) {
          // 点击整合前整合后功能区返回
          const treeid = feature.get("treeid")
          if ([35, 34].includes(treeid)) {
            currentAnimF.stop({ user: true })
            return
          }
        } else {
          currentAnimF.stop({ user: true })
        }
      })
    }
    if (currentAnimF) {
      currentAnimF.stop({ user: true })
    }
    locationMap({ type: "电子围栏-设备定位", data: feature.getGeometry().getCoordinates() }, () => {
      currentAnimF = vectorLayer.animateFeature(feature, anim)
    })
  }
  onMounted(() => {
    initMap()
    proxy.$mitt.on("updateXhOnline", addOrRemoveXhOnline)
    proxy.$mitt.on("locationMap", locationMap) // 地图定位,使用mitt传递避免非useOlMap组件使用的问题
  })
  onBeforeUnmount(() => {
    if (map.value) {
      map.value.setTarget(null)
      map.value = null
    }
    proxy.$mitt.off("updateXhOnline", addOrRemoveXhOnline)
    proxy.$mitt.off("locationMap", locationMap)
  })
  return {
    /**
     * 地图
     */
    map,
    /**
     * 覆盖物
     */
    overlay,
    /**
     * 弹窗格式化类型：有很多种，例如科研监测中的古树名木、动植物本底资源、水文气象站点、监控卡口点、红外相机监测点等等
     */
    popupFormatType,
    /**
     * 弹窗信息
     */
    popupInfo,
    /**
     * 关闭弹窗
     */
    closePopup,
    /**
     * 地图定位，通用方法，请参考固定参数格式
     */
    locationMap,
    /**
     * 要素跳动+动画定位
     */
    animateFeature,
    /**
     * 设置火情详情弹窗
     */
    setHqDetailPopup,
    /**
     * 获取线要素
     */
    getLineStringFeature,
    /**
     * 获取点要素
     */
    getPointFeatures,
    /**
     * 开启在线人员定位实时刷新
     */
    refreshXhOnline,
    /**
     * 添加水文气象站点
     */
    addQxSwPoints,
    /**
     * 添加监控卡口点
     */
    addMonitorPoints,
    /**
     * 添加红外相机网格
     */
    addHwxjWgPolygon,
    /**
     * 添加动植物本底资源
     */
    addDzswData,
    /**
     * 移除动植物本底资源
     */
    removeDzswData,
    /**
     * 添加古树名木
     */
    addGsmmData,
    /**
     * 移除古树名木
     */
    removeGsmmData,
    /**
     * 添加全景图点位
     */
    addPanoramaData,
    /**
     * 高亮全景图点位
     */
    highlightPanorama,
    /**
     * 添加克里金插值
     */
    addTest,
    /**
     * 矢量图层要素存储
     */
    vectorFeatures,
    /**
     * 添加图层管理
     */
    addLayerManageData,
    /**
     * 移除图层管理
     */
    removeLayerManageData,
    /**
     * 添加虫情测报灯
     */
    addCqcbdData,
    /**
     * 添加病虫害统计分析热力图
     */
    addHotMapData,
    /**
     * 添加红外相机物种分析热力图
     */
    addWzHeatMapData,
    /**
     * 设置整理
     */
    setDeclutter,
    /**
     * 设置聚合
     */
    setCluster,
    /**
     * 应急指挥，加载无人机轨迹
     */
    renderTrack
  }
}
