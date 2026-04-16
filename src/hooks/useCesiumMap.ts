/**
 * Cesium地图实例-统一进行管理，方便调用
 * author: 魏晓翔
 * @module useCesiumMap
 * @desc 创建Cesium映射实例的钩子
 * @returns {any} Cesium映射实例
 */
import { GetInterface, GetSys_LayerImageInformation } from "@/api"
import CesiumNavigation from "cesium-navigation-es6"
import * as turf from "@turf/turf"
// module所属模块
export default function useCesiumMap(
  // 弹窗组件
  popup?: Ref<any>,
  config?: {
    /**
     * 地图容器id
     */
    target?: string
    /**
     * 是否使用flyTo方式定位
     */
    flyTo?: boolean
    /**
     * 相机初始信息
     */
    camera?: {
      /**
       * 相机朝向 [heading, pitch, roll]
       */
      orientation?: any[]
      /**
       * 相机最终位置 [经度, 纬度, 高度]
       */
      destination?: number[]
    }
    /**
     * 所属页面的模块名称
     */
    modular?: string
    /**
     * popup默认的格式类型
     */
    popupFormatType?: string
    /**
     * 地图类型
     */
    baseMapType?: "影像底图" | "矢量底图"
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
  const vectorFeatures = ref<any[]>([])
  // 配置
  const CONFIG: any = Object.assign(
    {
      target: "map", // 地图容器id
      camera: {
        orientation: [0.0, -1.5707963267948966, 0.0], // [heading, pitch, roll]
        destination: [116.16027952755078, 30.97908202369116, 1000000]
      },
      modular: "", // 所属模块
      popupFormatType: "",
      baseMapType: "影像底图",
      // 处理函数集合
      callBack: {}
    },
    config
  )
  // 弹窗信息
  const popupInfo = ref<any>()
  const popupFormatType = ref<any>(CONFIG.modular) // popup默认的格式类型

  // 图层引用
  let tdtImageLayer: any = null
  let tdtVectorLayer: any = null
  let meituImageLayer: any = null
  let meituVectorLayer: any = null

  // 获得影像和矢量图层
  const getMapBaseLayer = async () => {
    const layers: any[] = []

    // 获取美图影像图层
    const { response: imglist } = await GetSys_LayerImageInformation({
      imagetype: "影像地图"
    })
    if (imglist.length > 0) {
      meituImageLayer = window.viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: imglist[0].url + "{z}/{y}/{x}.png",
          minimumLevel: 0,
          maximumLevel: 18,
          rectangle: Cesium.Rectangle.fromDegrees(
            116.00869030611958,
            30.9359282749311,
            116.20234555551099,
            31.12454548379195
          )
        })
      )
      meituImageLayer.show = CONFIG.baseMapType === "影像底图" // 根据地图类型显示
      meituImageLayer.name = "影像底图(美图)"
      layers.push(meituImageLayer)
    }

    // 获取美图矢量图层
    const { response: sllist } = await GetSys_LayerImageInformation({
      imagetype: "矢量地图"
    })
    if (sllist.length > 0) {
      meituVectorLayer = window.viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: sllist[0].url + "{z}/{y}/{x}.png",
          minimumLevel: 0,
          maximumLevel: 18,
          rectangle: Cesium.Rectangle.fromDegrees(
            116.00869030611958,
            30.9359282749311,
            116.20234555551099,
            31.12454548379195
          )
        })
      )
      meituVectorLayer.show = CONFIG.baseMapType === "矢量底图" // 根据地图类型显示
      meituVectorLayer.name = "矢量底图(美图)"
      layers.push(meituVectorLayer)
    }

    return layers
  }

  // 更新图层显示状态
  const updateLayerVisibility = () => {
    // 天地图影像底图
    if (tdtImageLayer) {
      tdtImageLayer.show = CONFIG.baseMapType === "影像底图"
    }

    // 天地图矢量底图
    if (tdtVectorLayer) {
      tdtVectorLayer.show = CONFIG.baseMapType === "矢量底图"
    }

    // 美图影像底图
    if (meituImageLayer) {
      meituImageLayer.show = CONFIG.baseMapType === "影像底图"
    }

    // 美图矢量底图
    if (meituVectorLayer) {
      meituVectorLayer.show = CONFIG.baseMapType === "矢量底图"
    }
  }
  // 初始化导航控件
  const initNavigationControl = () => {
    const navigation = new CesiumNavigation(window.viewer, {
      enableCompass: true, // 启用指南针
      enableZoomControls: false, // 启用缩放控件
      enableDistanceLegend: true, // 启用距离标尺
      enableCompassOuterRing: true, // 启用指南针外环
      resetTooltip: "重置视图",
      zoomInTooltip: "放大",
      zoomOutTooltip: "缩小"
    })

    // 返回导航控件实例，以便后续可能需要销毁
    return navigation
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
  const initMap = async () => {
    // 设置默认主视图位置为中国地区
    setHomePosition()
    // 创建Cesium Viewer
    window.viewer = new Cesium.Viewer(CONFIG.target, {
      // 移除默认的UI控件
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      vrButton: false,
      selectionIndicator: false,
      infoBox: false,
      // 去除Cesium logo
      creditContainer: document.createElement("div")
    })
    // 初始化导航控件
    initNavigationControl()

    // 监听相机变化,打印相机信息
    // watchCameraChange((info: any) => {
    //   console.log(info, 1111)
    // })

    // 移除默认的影像图层
    // window.viewer.imageryLayers.removeAll()

    // 设置地形
    window.viewer.terrainProvider = await Cesium.createWorldTerrainAsync()
    // 地形监测
    window.viewer.scene.globe.depthTestAgainstTerrain = true

    // 设置抗锯齿
    window.viewer.scene.postProcessStages.fxaa.enabled = true
    window.viewer.scene.globe.enableLighting = false

    // 设置相机初始位置和姿态
    if (CONFIG.camera.destination) {
      const cameraOptions = {
        destination: Cesium.Cartesian3.fromDegrees(...(CONFIG.camera.destination as [number, number, number])),
        orientation: {
          heading: CONFIG.camera.orientation[0],
          pitch: CONFIG.camera.orientation[1],
          roll: CONFIG.camera.orientation[2]
        }
      }

      if (CONFIG.flyTo) {
        window.viewer.camera.flyTo({ ...cameraOptions, duration: 2 })
      } else {
        window.viewer.camera.setView(cameraOptions)
      }
    }

    // 添加天地图影像底图
    tdtImageLayer = window.viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: "https://t6.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe",
        minimumLevel: 0,
        maximumLevel: 18
      })
    )
    tdtImageLayer.name = "影像底图(天地图)"
    tdtImageLayer.show = CONFIG.baseMapType === "影像底图"

    // 添加天地图矢量底图
    tdtVectorLayer = window.viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe",
        minimumLevel: 0,
        maximumLevel: 18
      })
    )
    tdtVectorLayer.name = "矢量底图(天地图)"
    tdtVectorLayer.show = CONFIG.baseMapType === "矢量底图"

    // 获得基础影像和基础矢量图层并加载
    await getMapBaseLayer()

    // 添加3Dtiles倾斜摄影数据
    add3DTiles({
      url: "http://39.145.39.46:9000/qxmap/tileset.json"
    })
    // 监听点击事件
    window.viewer.screenSpaceEventHandler.setInputAction(async (event: any) => {
      // 统一检测点击到的对象
      const picked = window.viewer.scene.pick(event.position)
      const popupDom = popup?.value.$el
      if (picked && picked.id) {
        // 点击到了实体（billboard、polygon、polyline等）
        const entity = picked.id
        const properties = entity.properties?.getValue(Cesium.JulianDate.now())
        if (properties.originalData.lon && properties.originalData.lat) {
          const data = await getDetail(properties.originalData)
          popupInfo.value = data
          popupFormatType.value = properties.originalData.tabname // 动态弹窗类型
          // 点位经纬度
          const coor = [properties.originalData.lon * 1, properties.originalData.lat * 1]
          // 显示弹框
          // updatePopupPosition(coor, popupDom)
        }
        // 调用点击回调，传递实体信息
        // CONFIG.callBack?.click?.({
        //   type: "entity",
        //   entity: entity,
        //   properties: properties,
        //   position: picked.position,
        //   coordinate: properties?.coordinate || null
        // })

        return
      }

      // 检测是否点击到了3DTiles模型
      if (picked && picked.primitive && picked.primitive instanceof Cesium.Cesium3DTileFeature) {
        console.log("点击到了3DTiles模型11111")
        return
      }

      // 最后检测地形点击
      const pickedPosition = window.viewer.camera.pickEllipsoid(event.position, window.viewer.scene.globe.ellipsoid)
      if (pickedPosition) {
        console.log("点击到了地形11111")
        return
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 保存配置
    window.viewer.CONFIG = CONFIG
  }

  // 添加3Dtiles倾斜摄影数据
  const add3DTiles = async (data: any) => {
    try {
      const { url } = data
      const tileset = await Cesium.Cesium3DTileset.fromUrl(url, {
        skipLevelOfDetail: true,
        baseScreenSpaceError: 1024,
        // maximumScreenSpaceError: 128, // 数值加大，能让最终成像变模糊
        skipScreenSpaceErrorFactor: 16,
        skipLevels: 1,
        immediatelyLoadDesiredLevelOfDetail: false,
        loadSiblings: true, // 如果为true则不会在已加载完概况房屋后，自动从中心开始超清化房屋
        cullWithChildrenBounds: true,
        cullRequestsWhileMoving: true,
        cullRequestsWhileMovingMultiplier: 10, // 值越小能够更快的剔除
        preloadWhenHidden: true,
        preferLeaves: true,
        progressiveResolutionHeightFraction: 0.5, // 数值偏于0能够让初始加载变得模糊
        dynamicScreenSpaceErrorDensity: 0.5, // 数值加大，能让周边加载变快
        dynamicScreenSpaceErrorFactor: 1, // 不知道起了什么作用没，反正放着吧先
        dynamicScreenSpaceError: true // 根据测试，有了这个后，会在真正的全屏加载完之后才清晰化房屋
      })
      const heightOffset = 20.0
      const boundingSphere = tileset.boundingSphere
      const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center)
      const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0)
      const offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset)
      const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3())
      tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
      window.viewer.scene.primitives.add(tileset)

      // 定位到tileset
      // window.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 4.0))

      return tileset
    } catch (error) {
      console.error("3Dtiles倾斜摄影数据加载失败:", error)
      throw error
    }
  }

  // 设置地图类型
  const setBaseMapType = (type: "影像底图" | "矢量底图") => {
    CONFIG.baseMapType = type
    updateLayerVisibility()
  }

  // 获取当前相机信息
  const getCurrentCameraInfo = () => {
    if (!window.viewer) return null

    const camera = window.viewer.camera
    const position = camera.position
    const cartographic = Cesium.Cartographic.fromCartesian(position)

    // 计算相机目标点（屏幕中心点）
    const center = window.viewer.camera.pickEllipsoid(
      new Cesium.Cartesian2(window.viewer.canvas.clientWidth / 2, window.viewer.canvas.clientHeight / 2),
      window.viewer.scene.globe.ellipsoid
    )

    let targetInfo = { longitude: 0, latitude: 0, height: 0 }
    if (center) {
      const targetCartographic = Cesium.Cartographic.fromCartesian(center)
      targetInfo = {
        longitude: Cesium.Math.toDegrees(targetCartographic.longitude),
        latitude: Cesium.Math.toDegrees(targetCartographic.latitude),
        height: targetCartographic.height
      }
    }

    return {
      // 相机位置（经纬度高度）
      position: {
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
        latitude: Cesium.Math.toDegrees(cartographic.latitude),
        height: cartographic.height
      },
      // 相机朝向
      orientation: {
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll
      },
      // 相机目标点（屏幕中心点）
      target: targetInfo,
      // 距离地面的高度
      distance: camera.distanceToBoundingSphere || 0
    }
  }

  // 设置home位置，西部边界，南部边界，东部边界，北部边界
  const setHomePosition = (west: number = 73.0, south: number = 18.0, east: number = 135.0, north: number = 54.0) => {
    const rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north)
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = rectangle
    return rectangle
  }
  // 监听相机变化事件
  const watchCameraChange = (callback: (cameraInfo: any) => void) => {
    if (!window.viewer) return

    // 监听相机移动开始
    const moveStartHandler = () => {
      const cameraInfo = getCurrentCameraInfo()
      callback({
        type: "moveStart",
        ...cameraInfo
      })
    }

    // 监听相机移动结束
    const moveEndHandler = () => {
      const cameraInfo = getCurrentCameraInfo()
      callback({
        type: "moveEnd",
        ...cameraInfo
      })
    }

    // // 监听相机变化
    // const changedHandler = () => {
    //   const cameraInfo = getCurrentCameraInfo()
    //   callback({
    //     type: "changed",
    //     ...cameraInfo
    //   })
    // }

    // 添加事件监听器
    window.viewer.camera.moveStart.addEventListener(moveStartHandler)
    window.viewer.camera.moveEnd.addEventListener(moveEndHandler)
    // window.viewer.camera.changed.addEventListener(changedHandler)

    // 返回移除监听器的方法
    return () => {
      window.viewer.camera.moveStart.removeEventListener(moveStartHandler)
      window.viewer.camera.moveEnd.removeEventListener(moveEndHandler)
      // window.viewer.camera.changed.removeEventListener(changedHandler)
    }
  }
  const addLayerManageData = (data: any, option: any) => {
    const { geometryType, tabname, tabchname, legend: legendList } = option
    data.forEach((item: any) => {
      item.tabname = tabname
      item.tabchname = tabchname
      if (geometryType === "point") {
        const legend = legendList.find((l: any) => l.type === item.type) || legendList?.[0]
        legend.showLabel = true
        // 加载billboard
        loadBillboard(item, legend)
      }
      if (geometryType === "line") {
        // 加载polyline
        const legend = legendList.find((l: any) => l.type === item.type) || legendList?.[0]
        // 加载线图层
        loadPolyline(item, legend)
      }
      if (geometryType === "polygon") {
        const legend = legendList.find((l: any) => l.type === item.type) || legendList?.[0]
        legend.showLabel = false // 不显示label
        legend.isFill = false // 不显示填充
        // 加载多边形图层
        loadPolygon(item, legend)
      }
    })
  }

  /**
   * 加载点标记图层
   * @param item 点数据项，包含几何数据和属性
   * @param legend 图例配置，包含样式属性
   * @description 解析POINT格式的几何数据，根据图例配置创建带样式的billboard实体
   */
  const loadBillboard = (item: any, legend: any) => {
    try {
      // 解析POINT格式的几何数据
      const pointData = parsePoint(item.geom)

      if (!pointData) {
        console.warn("无效的点几何数据:", item)
        return
      }

      // 创建billboard实体
      const billboardEntity = window.viewer.entities.add({
        // 点标记
        billboard: {
          // 图标地址
          image: "/statisUrl/" + legend?.icon,
          // 图标大小
          scale: 0.8,
          // 图标是否显示
          show: true,
          // 图标透明度
          color: Cesium.Color.WHITE,
          // 图标旋转
          rotation: 0,
          // 图标对齐方式
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5e5),
          disableDepthTestDistance: 5e5
        },
        // 标签显示
        label: item.name
          ? {
              // 标签文本
              text: item.name,
              font: `bold ${legend?.textsize || 14}px sans-serif`,
              fillColor: Cesium.Color.WHITE,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5e5),
              disableDepthTestDistance: 5e5,
              // 标签位置偏移
              pixelOffset: new Cesium.Cartesian2(0, -55)
            }
          : undefined,
        // 实体位置
        position: Cesium.Cartesian3.fromDegrees(pointData.longitude, pointData.latitude),
        // 实体ID
        id: item.tabchname + item.id,
        // 实体名称，用于后续管理
        name: item.name || "billboard",
        // 自定义属性，存储原始数据
        properties: {
          originalData: item,
          legendData: legend,
          geometryType: "point",
          coordinate: pointData
        }
      })

      // 将创建的实体添加到矢量要素数组中，方便后续管理
      vectorFeatures.value.push(billboardEntity)
    } catch (error) {
      console.error("加载点标记图层失败:", error, item)
    }
  }

  /**
   * 加载多边形图层
   * @param item 多边形数据项，包含几何数据
   * @param legend 图例配置，包含样式属性
   * @description 解析MULTIPOLYGON格式的几何数据，根据图例配置创建带样式的多边形实体和标签
   */
  const loadPolygon = (item: any, legend: any) => {
    try {
      // 解析MULTIPOLYGON格式的几何数据
      const polygonsData = parseMultiPolygon(item.geom)

      if (!polygonsData || polygonsData.length === 0) {
        console.warn("无效的多边形几何数据:", item)
        return
      }
      // 为每个多边形创建实体
      polygonsData.forEach((polygonObj: any, index: number) => {
        // 创建多边形实体
        const polygonEntity = window.viewer.entities.add({
          position: polygonObj.centroid,
          // 多边形几何体
          polygon: legend.isFill
            ? {
                hierarchy: polygonObj.positions,
                material:
                  Cesium.Color.fromCssColorString(legend?.fillcolor).withAlpha(0.1) || Cesium.Color.BLUE.withAlpha(0.5)
              }
            : undefined,
          // 当isFill=false时表示仅显示轮廓，用polyline绘制代替polygon
          polyline: legend.isFill
            ? undefined
            : {
                positions: polygonObj.positions,
                width: legend?.strokewidth || 3,
                material: Cesium.Color.fromCssColorString(legend?.strokecolor) || Cesium.Color.BLACK,
                clampToGround: true
              },
          // 标签显示（只在第一个多边形上显示标签，避免重复）
          label:
            item.name && index === 0 && legend.showLabel
              ? {
                  text: item.name,
                  font: `${legend?.textsize || 14}px sans-serif`,
                  fillColor: Cesium.Color.fromCssColorString(legend?.textcolor) || Cesium.Color.BLACK,
                  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                  distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5e5),
                  disableDepthTestDistance: 5e5
                }
              : undefined,
          // 实体ID
          id: item.tabchname + item.id + "索引" + index,
          // 实体名称，用于后续管理
          name: item.name ? `${item.name}_${index + 1}` : `polygon_${index + 1}`,
          // 自定义属性，存储原始数据
          properties: {
            originalData: item,
            legendData: legend,
            geometryType: "polygon",
            polygonIndex: index,
            totalPolygons: polygonsData.length
          }
        })

        // 将创建的实体添加到矢量要素数组中，方便后续管理
        vectorFeatures.value.push(polygonEntity)
      })
    } catch (error) {
      console.error("加载多边形图层失败:", error, item)
    }
  }

  /**
   * 加载线图层
   * @param item 线数据项，包含几何数据
   * @param legend 图例配置，包含样式属性
   * @description 解析MULTILINESTRING格式的几何数据，根据图例配置创建带样式的线实体
   */
  const loadPolyline = (item: any, legend: any) => {
    try {
      // 解析MULTILINESTRING格式的几何数据
      const linesData = parseMultiLineString(item.geom)
      if (!linesData || linesData.length === 0) {
        console.warn("无效的线几何数据:", item)
        return
      }

      // 为每条线创建实体
      linesData.forEach((lineObj: any, index: number) => {
        // 创建线实体
        const lineEntity = window.viewer.entities.add({
          // 线几何体
          polyline: {
            positions: lineObj.positions,
            width: legend?.strokewidth || 3,
            material: Cesium.Color.fromCssColorString(legend?.strokecolor) || Cesium.Color.BLACK,
            clampToGround: true,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5e5)
          },
          // 实体ID
          id: item.tabchname + item.id + "索引" + index,
          // 实体名称，用于后续管理
          name: item.name ? `${item.name}_${index + 1}` : `polyline_${index + 1}`,
          // 自定义属性，存储原始数据
          properties: {
            originalData: item,
            legendData: legend,
            geometryType: "line",
            lineIndex: index,
            totalLines: linesData.length
          }
        })

        // 将创建的实体添加到矢量要素数组中，方便后续管理
        vectorFeatures.value.push(lineEntity)
      })
    } catch (error) {
      console.error("加载线图层失败:", error, item)
    }
  }

  const removeLayerManageData = (data: any) => {
    try {
      const { mc } = data
      // 获得entity中properties中的legendData
      const entitys = vectorFeatures.value.filter((item: any) => {
        return item.properties.legendData._value.name === mc
      })
      // 删除entitys
      entitys.forEach((item: any) => {
        window.viewer.entities.remove(item)
      })
    } catch (error) {
      console.error("删除图层失败:", error, data)
    }
  }
  /**
   * 移除弹窗
   * @param isClose 是否关闭弹窗
   * @description 移除弹窗，并移除事件监听器
   */
  const removePopup = (isClose: boolean = false) => {
    if (window.viewer.popupUpdateHandler) {
      window.viewer.clock.onTick.removeEventListener(window.viewer.popupUpdateHandler)
    }
    if (popup?.value?.$el && isClose) {
      popup.value.$el.style.display = "none"
    }
  }

  /**
   * 更新弹窗位置
   * @param coor 坐标数组 [lon, lat]
   * @param popupDom 弹窗DOM元素
   * @description 根据经纬度坐标更新弹窗位置，考虑地形高度
   */
  const updatePopupPosition = (coor: number[], popupDom: HTMLElement | null) => {
    // 定义点位世界坐标
    let position: any = null
    // 定义点位窗口坐标
    let windowPosition = new Cesium.Cartesian2()
    const canvas = window.viewer.scene.canvas
    // 获取canvas的top
    const { top } = canvas.getBoundingClientRect()
    // 定义点位地理坐标
    const terrainPosition = Cesium.Cartographic.fromDegrees(coor[0], coor[1])
    // 采样地形高度
    const promise = Cesium.sampleTerrainMostDetailed(window.viewer.terrainProvider, [terrainPosition])
    promise.then((updatedPositions) => {
      const height = updatedPositions[0].height || 0
      // 移除之前的事件监听器
      removePopup()
      popupDom!.style.display = "block"
      // 定义点位世界坐标，包含地形高度
      position = Cesium.Cartesian3.fromDegrees(coor[0], coor[1], height)

      // 监听窗口位置变化
      window.viewer.clock.onTick.addEventListener(window.viewer.popupUpdateHandler)
    })
    // 创建新的位置更新函数
    window.viewer.popupUpdateHandler = () => {
      Cesium.SceneTransforms.worldToWindowCoordinates(window.viewer.scene, position, windowPosition)
      if (popupDom) {
        // 使用相对于 Canvas 的坐标，不需要减去 top
        popupDom.style.left = windowPosition!.x - popupDom.offsetWidth / 2 + "px"
        popupDom.style.top = windowPosition!.y - popupDom.offsetHeight - top + "px"
      }
    }
  }

  const locationMap = (data: any) => {
    console.log(data)
  }

  onMounted(() => {
    initMap()
  })

  onBeforeUnmount(() => {
    if (window.viewer) {
      window.viewer.destroy()
      window.viewer = null as any
    }
  })

  return {
    /**
     * 弹窗信息
     */
    popupInfo,
    /**
     * 弹窗格式类型
     */
    popupFormatType,
    /**
     * 移除弹窗
     */
    removePopup,
    /**
     * 更新弹窗位置
     */
    updatePopupPosition,
    /**
     * 设置地图类型
     */
    setBaseMapType,
    /**
     * 更新图层显示状态
     */
    updateLayerVisibility,
    /**
     * 获取当前相机信息
     */
    getCurrentCameraInfo,
    /**
     * 监听相机变化事件
     */
    watchCameraChange,
    /**
     * 设置home位置
     */
    setHomePosition,
    /**
     * 矢量要素
     */
    vectorFeatures,
    /**
     * 定位
     */
    locationMap,
    /**
     * 添加图层
     */
    addLayerManageData,
    /**
     * 删除图层
     */
    removeLayerManageData,
    /**
     * 加载点标记
     */
    loadBillboard,
    /**
     * 加载多边形
     */
    loadPolygon,
    /**
     * 加载线图层
     */
    loadPolyline,
    /**
     * 添加3DTiles倾斜摄影数据
     */
    add3DTiles,
    /**
     * 更新弹窗位置
     */
    updatePopupPosition
  }
}

/**
 * 解析POINT格式的几何数据
 * @param geometryString POINT格式的字符串，如 'POINT(116.1025 30.994448)'
 * @returns 解析后的坐标点，如果解析失败则返回null
 * @description 将WKT格式的POINT字符串转换为经纬度坐标
 */
const parsePoint = (geometryString: string): { longitude: number; latitude: number } | null => {
  try {
    // 移除POINT关键字和括号
    const cleanString = geometryString
      .replace(/^POINT\s*\(/, "") // 移除开头的POINT(
      .replace(/\)$/, "") // 移除结尾的)
      .trim()

    // 分割经纬度
    const [lng, lat] = cleanString.split(" ").map(Number)

    if (!isNaN(lng) && !isNaN(lat)) {
      return { longitude: lng, latitude: lat }
    }

    console.warn("无法解析点坐标:", geometryString)
    return null
  } catch (error) {
    console.error("解析POINT数据失败:", error, geometryString)
    return null
  }
}

/**
 * 使用turf计算多边形的质心坐标
 * @param wgs84Coordinates WGS84坐标数组 [[lng, lat], [lng, lat], ...]
 * @returns 质心的笛卡尔坐标，如果计算失败则返回null
 * @description 使用turf.centroid计算多边形的质心，确保中心点在多边形内部
 */
const calculatePolygonCentroid = (wgs84Coordinates: number[][]): any => {
  if (!wgs84Coordinates || wgs84Coordinates.length < 3) {
    console.warn("坐标点数量不足，无法计算质心")
    return null
  }

  try {
    // 确保多边形闭合（首尾坐标相同）
    const closedCoordinates = [...wgs84Coordinates]
    const firstPoint = closedCoordinates[0]
    const lastPoint = closedCoordinates[closedCoordinates.length - 1]

    // 如果首尾坐标不同，添加第一个坐标到末尾
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      closedCoordinates.push([firstPoint[0], firstPoint[1]])
    }

    // 创建turf多边形对象
    const polygon = turf.polygon([closedCoordinates])

    // 计算质心
    const centroid = turf.centroid(polygon)

    // 获取质心的经纬度坐标
    const [lng, lat] = centroid.geometry.coordinates

    // 转换为Cesium笛卡尔坐标
    const centerPosition = Cesium.Cartesian3.fromDegrees(lng, lat)
    return centerPosition
  } catch (error) {
    console.warn("使用turf计算多边形质心失败:", error)
    return null
  }
}

/**
 * 解析MULTIPOLYGON格式的几何数据
 * @param geometryString MULTIPOLYGON格式的字符串，如 'MULTIPOLYGON(((lng1 lat1, lng2 lat2, ...)), ((lng3 lat3, lng4 lat4, ...)))'
 * @returns 解析后的多边形数组，每个元素包含一个多边形的坐标数组
 * @description 将WKT格式的MULTIPOLYGON字符串转换为Cesium可用的多边形坐标数组
 */
const parseMultiPolygon = (geometryString: string): any[] | null => {
  try {
    let polygonMatches: any
    if (geometryString.indexOf("MULTIPOLYGON") > -1) {
      // 移除MULTIPOLYGON关键字和多余的括号
      const cleanString = geometryString
        .replace(/^MULTIPOLYGON\s*\(\(/, "") // 移除开头的MULTIPOLYGON((
        .replace(/\)\)$/, "") // 移除结尾的))
        .trim()

      // 匹配所有的多边形，格式如: "(lng1 lat1, lng2 lat2, ...), (lng3 lat3, lng4 lat4, ...)"
      // 使用正则表达式匹配括号内的坐标组
      polygonMatches = cleanString.match(/\([^)]+\)/g)
      if (!polygonMatches || polygonMatches.length === 0) {
        console.warn("无法解析多边形坐标:", geometryString)
        return null
      }
    }

    // 存储所有多边形的坐标数组
    const polygons: any[] = []
    polygonMatches.forEach((polygonStr: any) => {
      // 提取单个多边形的坐标字符串，移除外层括号
      const coordinateMatch = polygonStr.replace(/^\(|\)$/g, "")
      if (coordinateMatch) {
        // 分割坐标对
        const coordinatePairs = coordinateMatch.split(",").map((pair: any) => pair.trim())

        // 转换为Cesium坐标数组
        const positions: any[] = []
        const wgs84: any[] = []
        coordinatePairs.forEach((pair: any) => {
          const [lng, lat] = pair.split(" ").map(Number)

          if (!isNaN(lng) && !isNaN(lat)) {
            // 将经纬度转换为Cesium笛卡尔坐标
            const position = Cesium.Cartesian3.fromDegrees(lng, lat)
            positions.push(position)
            wgs84.push([lng, lat])
          }
        })
        if (positions.length > 0) {
          polygons.push({
            positions,
            wgs84,
            centroid: calculatePolygonCentroid(wgs84)
          })
        }
      }
    })
    return polygons.length > 0 ? polygons : null
  } catch (error) {
    console.error("解析MULTIPOLYGON数据失败:", error, geometryString)
    return null
  }
}

/**
 * 解析MULTILINESTRING格式的几何数据
 * @param geometryString MULTILINESTRING格式的字符串，如 'MULTILINESTRING((lng1 lat1, lng2 lat2, ...), (lng3 lat3, lng4 lat4, ...))'
 * @returns 解析后的线数组，每个元素包含一条线的坐标数组
 * @description 将WKT格式的MULTILINESTRING字符串转换为Cesium可用的线坐标数组
 */
const parseMultiLineString = (geometryString: string): any[] | null => {
  try {
    let lineMatches: any
    if (geometryString.indexOf("MULTILINESTRING") > -1) {
      // 移除MULTILINESTRING关键字和多余的括号
      const cleanString = geometryString
        .replace(/^MULTILINESTRING\s*\(/, "") // 移除开头的MULTILINESTRING(
        .replace(/\)$/, "") // 移除结尾的)
        .trim()

      // 匹配所有的线，格式如: "(lng1 lat1, lng2 lat2, ...), (lng3 lat3, lng4 lat4, ...)"
      // 使用正则表达式匹配括号内的坐标组
      lineMatches = cleanString.match(/\([^)]+\)/g)
      if (!lineMatches || lineMatches.length === 0) {
        console.warn("无法解析线坐标:", geometryString)
        return null
      }
    }

    // 存储所有线的坐标数组
    const lines: any[] = []
    lineMatches.forEach((lineStr: any) => {
      // 提取单条线的坐标字符串，移除外层括号
      const coordinateMatch = lineStr.replace(/^\(|\)$/g, "")
      if (coordinateMatch) {
        // 分割坐标对
        const coordinatePairs = coordinateMatch.split(",").map((pair: any) => pair.trim())

        // 转换为Cesium坐标数组
        const positions: any[] = []
        coordinatePairs.forEach((pair: any) => {
          const [lng, lat] = pair.split(" ").map(Number)

          if (!isNaN(lng) && !isNaN(lat)) {
            // 将经纬度转换为Cesium笛卡尔坐标
            const position = Cesium.Cartesian3.fromDegrees(lng, lat)
            positions.push(position)
          }
        })
        if (positions.length > 0) {
          lines.push({
            positions
          })
        }
      }
    })
    return lines.length > 0 ? lines : null
  } catch (error) {
    console.error("解析MULTILINESTRING数据失败:", error, geometryString)
    return null
  }
}
