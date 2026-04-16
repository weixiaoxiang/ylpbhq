/**
 * 地图实例-统一进行管理，方便调用,这个是为了做多时相对比的
 * author: 魏晓翔
 * @module useOlMap
 * @desc 创建OpenLayers映射实例的钩子
 * @returns {ol.Map} OpenLayers映射实例
 */
// @ts-expect-error
import AnimatedCluster from "ol-ext/layer/AnimatedCluster"
// module所属模块
export default function useTimeComparisonOlMap(config?: {
  /**
   * 地图容器id
   */
  targets?: string[]
  popups?: Ref<any>[]
  /**
   * 地图缩放级别
   */
  zoom?: number
  /**
   * 地图中心点
   */
  center?: number[]
  /**
   * popup默认的格式类型
   */
  popupFormatTypes?: string[]
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
  vectorLayerDeclutter?: boolean
  /**
   * 是否显示聚合图层
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
}) {
  // vue3
  const proxy = getCurrentInstance()!.proxy as any
  // 创建地图实例集合
  let maps = ref<any>([])
  const CONFIG: any = Object.assign(
    {
      targets: ["map1", "map2"], // 地图容器id
      popups: [], // 弹窗
      center: [116.13472130884368, 31.030508216667805],
      zoom: 13.1595,
      popupFormatTypes: ["", ""],
      overlayOffset: [0, 0],
      openOverlay: false,
      overlayPositioning: "bottom-left",
      vectorLayerDeclutter: true,
      showClusterLayer: false,
      // 处理函数集合
      callBack: {}
    },
    config
  )
  let overlays = ref<any[]>([])
  let vectorLayers: any = [],
    vectorSources: any = [],
    vectorKsLayers: any = [],
    vectorKsSources: any = []
  let clusterLayers: any = [] // 聚合图层
  const popupInfos = ref<any>([])
  const popupFormatTypes = ref<any>(CONFIG.popupFormatTypes) // popup默认的格式类型
  const view = new View({
    projection: "EPSG:4326",
    constrainResolution: true, // 限制分辨率,整数倍缩放
    center: CONFIG.center,
    zoom: CONFIG.zoom,
    maxZoom: 21,
    minZoom: 3
  })
  const initMap = (index: number) => {
    // 天地图影像
    let map_img = new TileLayer({
      source: new XYZ({
        url: "https://t6.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"
      }),
      visible: true
    })

    map_img.set("title", "影像底图")
    // meitu文字注记
    let map_cta = new TileLayer({
      source: new XYZ({
        url: "https://t6.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"
      }),
      visible: true
    })
    map_cta.set("title", "影像底图-注记")
    // 天地图矢量
    let map_vec = new TileLayer({
      source: new XYZ({
        url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"
      }),
      visible: false
    })
    map_vec.set("title", "矢量底图")
    // 天地图文字注记
    let map_cta1 = new TileLayer({
      source: new XYZ({
        url: "http://t4.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"
      }),
      visible: false
    })
    map_cta1.set("title", "矢量底图-注记")
    const layers = [map_img, map_cta, map_vec, map_cta1]

    maps.value[index] = new OlMap({
      layers,
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
      target: CONFIG.targets[index]
    })
    // 保存option
    maps.value[index].CONFIG = CONFIG
    vectorSources[index] = new VectorSource()
    vectorLayers[index] = new VectorLayer({
      zIndex: 10,
      source: vectorSources[index],
      declutter: CONFIG.vectorLayerDeclutter
    })
    vectorLayers[index].set("title", "矢量图层")
    maps.value[index].addLayer(vectorLayers[index])
    // 枯树图层
    vectorKsSources[index] = new VectorSource()
    vectorKsLayers[index] = new VectorLayer({
      zIndex: 10,
      source: vectorKsSources[index]
    })
    vectorKsLayers[index].set("title", "枯树图层")
    maps.value[index].addLayer(vectorKsLayers[index])
    if (CONFIG.popups && CONFIG.popups?.length > 0) {
      overlays.value[index] = new Overlay({
        element: CONFIG.popups[index].value?.$el,
        autoPan: true,
        offset: CONFIG.overlayOffset,
        positioning: CONFIG.overlayPositioning, //"bottom-left",
        stopEvent: false
      })
      maps.value[index].addOverlay(overlays.value[index])
      CONFIG.openOverlay && overlays.value[index].setPosition([116.15808287182611, 31.016829406763566])
    }
    // 是否显示聚合图层
    if (CONFIG.showClusterLayer) {
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
      clusterLayers[index] = new AnimatedCluster({
        layerName: "其他图层-聚合",
        zIndex: 4,
        animationDuration: 700, //0 为不开启聚合动画 700
        source: new Cluster({
          distance: 100,
          minDistance: 30,
          source: vectorSources[index],
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
            let iconSrc
            if (originalFeature.get("type").indexOf("动物") > -1) {
              iconSrc = proxy.$fun.getImg("backgroundResources/zxwz-icon1.png")
            } else {
              iconSrc = proxy.$fun.getImg("backgroundResources/zxwz-icon2.png")
            }
            return new Style({
              image: new Icon({
                src: iconSrc,
                scale: 0.7,
                anchor: [0.5, 1]
              }),
              text: new OlText({
                text: originalFeature.get("mc"),
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
          }

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

          clusterStyleCache[clusterSize] = style
          return style
        }
      })
      maps.value[index].addLayer(clusterLayers[index])
    }
    // 点击事件
    maps.value[index].on("click", async (e: any) => {
      // console.log(e.coordinate, index)
      // console.log(
      //   JSON.stringify({
      //     lon: e.coordinate[0],
      //     lat: e.coordinate[1]
      //   })
      // )

      // console.log(maps.value[index].getView().getCenter(), maps.value[index].getView().getZoom())

      // 获得点击的feature
      const feature = maps.value[index].forEachFeatureAtPixel(e.pixel, (feature: any) => {
        return feature
      })
      if (feature) {
        // console.log(feature.getProperties())
        const featureType = feature.get("featureType")
        if (featureType === "类型-多时相对比") {
          popupInfos.value[index] = {}
          overlays.value[index].setPosition(feature.getGeometry().getCoordinates())
        }
      }
    })
  }
  // 关闭弹窗
  const closePopup = (index: number) => {
    overlays.value[index].setPosition(undefined)
  }
  let intervalId: any = [],
    timeoutId: any = []
  // 添加图层管理数据
  const addLayerManageData = (index: number, data: any, option: any) => {
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
      feature.setProperties(
        Object.assign({}, item, { icon: "/statisUrl/" + icon, featureType: `类型-图层管理-${option.mc + item.treeid}` })
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
      // console.log(item, 11)

      // 当元素是枯树时，进行额外的处理
      if (option.id === 41) {
        vectorKsSources[index].addFeature(feature)
      } else {
        vectorSources[index].addFeature(feature)
      }
    })
    vectorLayers[index].setVisible(!CONFIG.showClusterLayer)
    if (option.id === 41) {
      intervalId[index] && clearInterval(intervalId[index])
      timeoutId[index] && clearTimeout(timeoutId[index])
      // 枯木图层闪烁
      intervalId[index] = setInterval(() => {
        vectorKsLayers[index].setVisible(!vectorKsLayers[index].getVisible())
      }, 1000)
      timeoutId[index] = setTimeout(() => {
        clearInterval(intervalId[index])
      }, 6000)
    }
  }
  // 移除图层管理数据
  const removeLayerManageData = (index: number, node: any) => {
    let featureType = `类型-图层管理-${node.mc + node.id}`
    if (node.id === 41) {
      intervalId[index] && clearInterval(intervalId[index]) // 清除枯木图层闪烁
      timeoutId[index] && clearTimeout(timeoutId[index]) // 清除枯木图层闪烁
      vectorKsSources[index].clear()
    } else {
      const features = vectorSources[index].getFeatures().filter((item: any) => {
        return item.get("featureType") === featureType
      })
      vectorSources[index].removeFeatures(features)
    }
  }
  onMounted(() => {
    CONFIG.targets.forEach((_: string, index: number) => {
      initMap(index) // 初始化多个地图
    })
  })
  onBeforeUnmount(() => {
    // 销毁地图
    maps.value.forEach((item: any) => {
      item.setTarget(null)
      item = null
    })
  })
  return {
    /**
     * 地图
     */
    maps,
    /**
     * 覆盖物
     */
    overlays,
    /**
     * 弹窗格式化类型：有很多种，例如科研监测中的古树名木、动植物本底资源、水文气象站点、监控卡口点、红外相机监测点等等
     */
    popupFormatTypes,
    /**
     * 弹窗信息
     */
    popupInfos,
    /**
     * 关闭弹窗
     */
    closePopup,
    /**
     * 添加图层管理
     */
    addLayerManageData,
    /**
     * 移除图层管理
     */
    removeLayerManageData
  }
}
