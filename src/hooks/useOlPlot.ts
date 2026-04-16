// @ts-nocheck
import { Fill, Stroke, Circle, Style } from "ol/style"
import { baseApi } from "@/api/ScienceMonitor/index"
import Feature from "ol/Feature"
import "ol-plot/dist/ol-plot.css"
import Plot from "ol-plot"
import dayjs from "dayjs"
import { nanoid } from "nanoid"
import { AddCommand, UpdateCommand } from "@/api"
export const useOlPlot = (mp: any, proxy: any = null) => {
  // 设置标绘符号显示的默认样式
  var stroke = new Stroke({
    color: "#FF0000",
    width: 2
  })
  var fill = new Fill({ color: "rgba(135 ,206 ,250,0.4)" })
  var image = new Circle({ fill: fill, stroke: stroke, radius: 8 })
  var drawStyle = new Style({
    image: image,
    fill: fill,
    stroke: new Stroke({
      color: "rgba(135 ,206 ,250,1)",
      width: 2
    })
  })
  var selectStyle = new Style({ image: image, fill: fill, stroke: stroke })
  var elapsedTimej
  var indexj = 0
  var now: any
  let objArray: any = []
  let plot_layer: any = reactive({})
  let select_feature = reactive<any>(null)
  let drawOverlay: any
  let high_feature: any
  let map: any
  /**
   * 加载标绘图层
   * @param mp 地图对象
   * @param drawLayer 绘制图层
   */
  function loadPlotLayer(drawLayer: any) {
    map.on("click", (e: any) => {
      var f = map.forEachFeatureAtPixel(e.pixel, (f: any) => {
        return f
      })
      if (select_feature != null) {
        select_feature.setStyle(drawStyle)
        select_feature = null
      }
      if (f) {
        if (f.get("type") == "junbiao" && !plot_layer.plotDraw.isDrawing()) {
          select_feature = f
          select_feature.setStyle(selectStyle)
          plot_layer.plotEdit.activate(f)
        } else {
          plot_layer.plotEdit.deactivate()
        }
      } else {
        plot_layer.plotEdit.deactivate()
      }
    })
    drawOverlay = drawLayer
    // todo: 这里报错
    plot_layer = new Plot(map, {
      zoomToExtent: true
    })
    plot_layer.plotDraw.on("drawEnd", onDrawEnd)
  }
  /**
   * 处理删除标绘要素
   * @param id 要素ID，如果为空则删除所有要素
   */
  const handleDeleteFeature = (id: any) => {
    if (id) {
      const index = objArray.findIndex((item: any) => item.objId == id)
      if (index != -1) {
        objArray.splice(index, 1)
      }
    } else {
      objArray = []
    }
  }
  /**
   * 获取绘制要素
   * @param feaObj 要素对象,包含要素的几何信息和属性信息
   * @returns 返回一个OpenLayers Feature对象
   */
  const getDrawFeature = (feaObj: any) => {
    var feature = new Feature({
      geometry: feaObj.featureF,
      type: "junbiao"
    })
    // let feature: any = new GeoJSON().readFeature(feaObj.fea)
    feature.setProperties({ ...feaObj.properties, type: "junbiao" })
    feature.setId(feaObj.objId)
    feature.setStyle(drawStyle)
    switch (feaObj.type) {
      case "Point":
      case "RectFlag":
      case "TriangleFlag":
      case "CurveFlag":
      case "Arc":
      case "Curve":
      case "FreeHandLine":
        // 处理点、矩形旗帜、三角旗帜、曲线旗帜、弧线和自由手绘线等简单类型的军标要素
        // 1. 使用feature.getGeometry()获取要素的几何对象
        // 2. 调用getCoordinates()获取几何对象的坐标数组
        // 3. 将坐标数组直接赋值给featureCoordinates属性
        // 4. 这些简单类型不需要额外的坐标处理,直接使用原始坐标即可
        feaObj.featureCoordinates = feature.getGeometry().getCoordinates()
        break
      case "Polyline":
        // 处理折线(Polyline)类型的军标要素
        // 1. 获取要素的几何坐标数组 feature.getGeometry().getCoordinates()
        // 2. 计算坐标数组的长度 getCoordinates().length
        // 3. 使用addGjPoint函数在折线上生成等间距的点,点间距为50
        // 4. 将生成的点集保存到featureCoordinates数组中,用于后续渲染
        feaObj.featureCoordinates = addGjPoint(
          feature.getGeometry().getCoordinates(),
          feature.getGeometry().getCoordinates().length,
          50
        )
        break
      case "Sector":
        // 处理扇形(Sector)类型的军标要素
        // 从要素的几何坐标数组中提取特征点
        // l从10开始是为了跳过前10个控制点,只处理扇形弧线部分的坐标点
        // b用于记录提取的特征点在featureCoordinates数组中的索引位置
        for (var l = 10, b = 0; l < feature.getGeometry().getCoordinates()[0].length - 1; l++, b++) {
          // 将几何坐标数组中的点复制到featureCoordinates数组中
          // getCoordinates()[0]获取扇形的外部环坐标数组
          // l索引对应扇形弧线上的点
          feaObj.featureCoordinates[b] = feature.getGeometry().getCoordinates()[0][l]
        }
        break
      case "Circle":
      case "Ellipse":
      case "RectAngle":
      case "StraightArrow":
      case "FineArrow":
      case "AssaultDirection":
        // 处理直线箭头、细箭头和突击方向三种类型的军标
        if (feaObj.type == "StraightArrow" || feaObj.type == "FineArrow" || feaObj.type == "AssaultDirection") {
          // 计算每两个相邻控制点之间的旋转角度
          for (var i = 0; i < feaObj.controlcoona.length - 1; i++) {
            // 使用jiaodu函数计算两点间的角度
            // 1. 获取相邻两个控制点的经纬度坐标
            // 2. 计算角度并减去90度(转换为标准坐标系)
            // 3. 将角度转换为弧度值(除以180乘以π)
            // 4. 保留2位小数
            feaObj.rotation[i] = (
              ((jiaodu(
                feaObj.controlcoona[i][0], // 第一个点的经度
                feaObj.controlcoona[i][1], // 第一个点的纬度
                feaObj.controlcoona[i + 1][0], // 第二个点的经度
                feaObj.controlcoona[i + 1][1] // 第二个点的纬度
              ) -
                90) /
                180) *
              Math.PI
            ).toFixed(2)
          }

          // 生成特征坐标点集,点间距为200
          // 用于绘制箭头主体部分
          feaObj.featureCoordinates = addGjPoint(feaObj.controlcoona, feaObj.controlcoona.length, 200)
        }

        // 生成点间距为100的点集并添加到pointList
        // 用于绘制箭头的辅助效果
        feaObj.pointList.push(addGjPoint(feaObj.controlcoona, feaObj.controlcoona.length, 100))
        break
      case "SquadCombat":
      case "TailedSquadCombat":
        // 使用addGjPoint函数生成间隔为50的特征坐标点集
        // 参数说明: 控制点数组, 控制点数量, 点间距
        feaObj.featureCoordinates = addGjPoint(feaObj.controlcoona, feaObj.controlcoona.length, 50)

        // 生成间隔为100的附加点集,用于绘制效果
        feaObj.addPoint = addGjPoint(feaObj.controlcoona, feaObj.controlcoona.length, 100)

        // 计算每两个相邻控制点之间的旋转角度
        for (var i = 0; i < feaObj.controlcoona.length - 1; i++) {
          // 使用jiaodu函数计算两点间的角度
          // 将角度减去90度后转换为弧度值
          // 最后保留2位小数
          feaObj.rotation[i] = (
            ((jiaodu(
              feaObj.controlcoona[i][0], // 第一个点的经度
              feaObj.controlcoona[i][1], // 第一个点的纬度
              feaObj.controlcoona[i + 1][0], // 第二个点的经度
              feaObj.controlcoona[i + 1][1] // 第二个点的纬度
            ) -
              90) /
              180) *
            Math.PI
          ).toFixed(2)
        }

        // 生成控制点列表,用于绘制过程中的点位显示
        for (var k = 0; k < feaObj.controlcoona.length; k++) {
          // 创建临时数组存储前k个控制点
          let b: any = []
          // 将前k个控制点添加到临时数组
          for (var m = 0; m < k; m++) {
            b.push(feaObj.controlcoona[m])
          }
          // 将临时数组添加到pointList中
          feaObj.pointList.push(b)
        }
        break
      case "AttackArrow":
      case "TailedAttackArrow":
      case "Polygon":
      case "GatheringPlace":
      case "ClosedCurve":
        // 计算第一个和第二个控制点的中点坐标
        var midLon = parseFloat(feaObj.controlcoona[0][0] + feaObj.controlcoona[1][0]) / 2 // 计算中点经度
        var midLat = parseFloat(feaObj.controlcoona[0][1] + feaObj.controlcoona[1][1]) / 2 // 计算中点纬度

        // 创建修正后的控制点数组
        var correctPoint = []
        correctPoint[0] = [midLon, midLat] // 第一个点设为中点坐标

        // 将剩余的控制点添加到修正数组中
        // 从第三个控制点开始(y=2),依次添加到correctPoint中
        for (var x = 1, y = 2; y < feaObj.controlcoona.length; x++, y++) {
          correctPoint[x] = feaObj.controlcoona[y]
        }

        // 使用修正后的控制点生成特征坐标
        // 通过addGjPoint函数生成间隔为50的点集
        feaObj.featureCoordinates = addGjPoint(correctPoint, correctPoint.length, 50)

        // 生成控制点列表
        for (var k = 0; k < feaObj.controlcoona.length; k++) {
          // 创建临时数组存储前k个控制点
          let b: any = []
          // 将前k个控制点添加到临时数组
          for (var m = 0; m < k; m++) {
            b.push(feaObj.controlcoona[m])
          }
          // 将临时数组添加到pointList中
          feaObj.pointList.push(b)
        }

        // 如果是攻击箭头或尾部攻击箭头类型
        if (feaObj.type === "attack_arrow" || feaObj.type === "tailed_attack_arrow") {
          // 生成间隔为100的附加点集
          feaObj.addPoint = addGjPoint(correctPoint, correctPoint.length, 100)

          // 计算每两个相邻控制点之间的旋转角度
          for (var i = 0; i < correctPoint.length - 1; i++) {
            // 使用jiaodu函数计算角度,转换为弧度并保留2位小数
            feaObj.rotation[i] = (
              ((jiaodu(correctPoint[i][0], correctPoint[i][1], correctPoint[i + 1][0], correctPoint[i + 1][1]) - 90) /
                180) *
              Math.PI
            ).toFixed(2)
          }
        }
        break
      case "DoubleArrow":
        // 生成双箭头的主要特征坐标
        // 使用第2和第3个控制点(索引1和2)生成间隔为100的点集作为主箭头线
        feaObj.featureCoordinates = addLdPoint(feaObj.controlcoona[1], feaObj.controlcoona[2], 100)

        // 生成双箭头的辅助线坐标
        // 使用第1和第4个控制点(索引0和3)生成间隔为100的点集作为辅助箭头线
        feaObj.pointList = addLdPoint(feaObj.controlcoona[0], feaObj.controlcoona[3], 100)

        // 计算主箭头的旋转角度
        // 使用第2和第3个控制点计算角度,减去90度后转换为弧度
        feaObj.rotation[0] = (
          ((jiaodu(
            feaObj.controlcoona[1][0], // 第2个控制点经度
            feaObj.controlcoona[1][1], // 第2个控制点纬度
            feaObj.controlcoona[2][0], // 第3个控制点经度
            feaObj.controlcoona[2][1] // 第3个控制点纬度
          ) -
            90) / // 减去90度以调整箭头方向
            180) * // 转换为弧度(π/180)
          Math.PI
        ).toFixed(2) // 保留2位小数

        // 计算辅助箭头的旋转角度
        // 使用第1和第4个控制点计算角度,加上90度后转换为弧度
        feaObj.rotation[1] = (
          ((jiaodu(
            feaObj.controlcoona[0][0], // 第1个控制点经度
            feaObj.controlcoona[0][1], // 第1个控制点纬度
            feaObj.controlcoona[3][0], // 第4个控制点经度
            feaObj.controlcoona[3][1] // 第4个控制点纬度
          ) +
            90) / // 加上90度以调整箭头方向
            180) * // 转换为弧度(π/180)
          Math.PI
        ).toFixed(2) // 保留2位小数

        // 生成箭头附加点
        // 使用更大的间隔(200)生成点集,用于箭头样式的渲染
        feaObj.addPoint[0] = addLdPoint(feaObj.controlcoona[1], feaObj.controlcoona[2], 200) // 主箭头的附加点
        feaObj.addPoint[1] = addLdPoint(feaObj.controlcoona[0], feaObj.controlcoona[3], 200) // 辅助箭头的附加点
        break
      case "Lune":
        // 生成弧形的主要点集
        // 使用第1个和第3个控制点(索引0和2)生成间隔为50的点集
        // 这些点将用于绘制弧形的外边界
        feaObj.pointList = addLdPoint(feaObj.controlcoona[0], feaObj.controlcoona[2], 50)

        // 生成弧形的特征坐标
        // 使用第1个和第2个控制点(索引0和1)生成间隔为50的点集
        // 这些点将用于绘制弧形的内边界,形成月牙形状
        feaObj.featureCoordinates = addLdPoint(feaObj.controlcoona[0], feaObj.controlcoona[1], 50)
        break
      case "FreePolygon":
        // 遍历所有控制点,生成自由多边形的点集合
        for (var k = 0; k < feaObj.controlcoona.length; k++) {
          // 创建一个临时数组用于存储当前控制点之前的所有点
          let b: any = []

          // 将当前控制点之前的所有点添加到临时数组中
          // 这样可以逐步构建多边形,从一个点开始,逐渐增加点的数量
          for (var m = 0; m < k; m++) {
            // 将第m个控制点添加到临时数组b中
            b.push(feaObj.controlcoona[m])
          }

          // 将当前构建的点集合添加到要素的pointList数组中
          // 每个点集合代表多边形绘制过程中的一个状态
          // pointList最终将包含从单点到完整多边形的所有中间状态
          feaObj.pointList.push(b)
        }
        break
    }
    return feature
  }
  const onDrawEnd = async (e: any) => {
    const f = e.feature
    let id = f?.getId()
    if (!id) {
      // 获取绘制的第一个要素
      const fea = plot_layer.plotUtils.getFeatures()[0]
      // 将新绘制的要素添加到要素数组中
      objArray.push({
        fea: fea, // 原始要素对象
        type: f.get("plotType"), // 要素类型(如箭头、多边形等)
        controlcoona: fea.properties.points, // 控制点坐标数组
        featureF: f.getGeometry(), // 要素几何对象
        // featureF: new GeoJSON().readFeature(fea).getGeometry(), // GeoJSON格式的几何对象
        featureCoordinates: [], // 用于存储要素坐标
        pointList: [], // 用于存储点列表
        addPoint: [], // 用于存储额外的点
        objId: "junbiao," + nanoid(), // 要素唯一标识
        rotation: [] // 用于存储旋转角度
      })
      // 获取最新添加的要素索引
      let j = objArray.length - 1
      // 根据要素数据生成绘制要素
      let feature = (await getDrawFeature(objArray[j])) || null
      // 将要素添加到绘制图层
      drawOverlay.getSource().addFeature(feature)

      // 清除临时绘制图层中的要素
      plot_layer.plotUtils.removeAllFeatures()
    }
  }
  /**
   * 在两点之间添加插值点
   * @param obj 目标点数组,包含多个坐标点 [[x1,y1], [x2,y2],...]
   * @param onlyOneLength 目标数组的长度
   * @param count 在每两个点之间需要插入的点的数量
   * @returns 返回包含所有插值点的数组
   * @description 该函数用于在给定的点序列中,在每两个相邻点之间插入指定数量的等间距点
   * 主要用于平滑线条或多边形,使其看起来更加圆滑
   */
  function addGjPoint(obj: any, onlyOneLength: any, count: any) {
    //(目标数组、目标数组长度、返回数组、之间点的个数)
    var arrayA = []
    var pIndex = 0
    var array = []
    for (var i = 0; i < onlyOneLength - 1; i++) {
      var absoluteX = parseFloat(obj[i + 1][0]) - parseFloat(obj[i][0])
      var absoluteY = parseFloat(obj[i + 1][1]) - parseFloat(obj[i][1])
      for (var k = 1, n = 0; k < count; k++, n++) {
        var lon = parseFloat(obj[i][0]) + absoluteX * (k / count)
        var lat = parseFloat(obj[i][1]) + absoluteY * (k / count)
        arrayA[n] = [lon, lat]
      }
      for (var j = 0; j < arrayA.length; j++) {
        array[pIndex] = arrayA[j]
        pIndex++
      }
    }
    return array
  }
  /**
   * 计算两个坐标点之间的角度
   * @param lon1 第一个点的经度
   * @param lat1 第一个点的纬度
   * @param lon2 第二个点的经度
   * @param lat2 第二个点的纬度
   * @returns 返回两点之间的角度(0-360度)
   * @description 该函数用于计算两个地理坐标点之间的角度
   * 计算方法:
   * 1. 使用反正切函数计算基础角度
   * 2. 根据两点相对位置(象限)调整角度
   * 3. 返回最终的角度值(0-360度范围内)
   */
  function jiaodu(lon1: any, lat1: any, lon2: any, lat2: any) {
    var angle = 0.0
    var dlon = lon2 - lon1
    var dlat = lat2 - lat1
    angle = (Math.atan(Math.abs(dlon / dlat)) * 180) / Math.PI
    if (dlon > 0 && dlat <= 0) {
      angle = 90 - angle + 90
    } else if (dlon <= 0 && dlat < 0) {
      angle = angle + 180
    } else if (dlon < 0 && dlat >= 0) {
      angle = 90 - angle + 270
    }
    return angle
  }
  function addLdPoint(pointFist: any, pointLast: any, count: any) {
    //(目标数组、目标数组长度、返回数组、之间点的个数)
    var array = []
    var absoluteX = parseFloat(pointLast[0]) - parseFloat(pointFist[0])
    var absoluteY = parseFloat(pointLast[1]) - parseFloat(pointFist[1])
    for (var k = 1, n = 0; k < count; k++, n++) {
      var lon = parseFloat(pointFist[0]) + absoluteX * (k / count)
      var lat = parseFloat(pointFist[1]) + absoluteY * (k / count)
      array[n] = [lon, lat]
    }
    return array
  }
  const { user } = storeToRefs(useConfigStore())
  const plotForm = ref<any>({})
  const showSavePlot = ref(false)
  /**
   * 处理绘制事件的函数
   * @param event 事件类型 ('revoke'|'delete'|'deleteAll'|'play'|'pause'|'stop'|'save')
   * @param ifGeoInfo 是否包含地理信息,默认为false
   * @description 该函数用于处理军标绘制相关的各种操作:
   * - revoke: 撤销操作
   * - delete: 删除选中要素
   * - deleteAll: 删除所有要素
   * - play: 开始动画
   * - pause: 暂停动画
   * - stop: 停止动画
   * - save: 保存绘制的军标要素
   */
  const handlePlot = (event: any) => {
    plot_layer.plotEdit.deactivate()
    switch (event) {
      case "revoke":
        break
      case "delete":
        if (!select_feature) {
          ElMessage.warning("请先选中要素")
          return
        }
        handleDeleteFeature(select_feature.getId())
        // 清除绘制要素
        select_feature.setGeometry(null)
        drawOverlay.getSource().removeFeature(select_feature)
        select_feature = null
        break
      case "deleteAll":
        handleDeleteFeature(null)
        nextTick(() => {
          // 清除绘制图层中的所有要素
          drawOverlay
            .getSource()
            .getFeatures()
            .forEach((item: any) => {
              item.setGeometry(null)
            })
          drawOverlay.getSource().clear()
          select_feature = null
        })
        break
      case "play":
        starAnimation(null)
        break
      case "pause":
        stopAnimation(null)
        break
      case "stop":
        break
      case "save":
        if (objArray.length == 0) {
          ElMessage.warning("请先绘制军标要素")
          return
        }
        plotForm.value.id ? saveEditPlot() : savePlot()
        break
    }
  }
  // 指定标绘类型，开始绘制。
  /**
   * 激活指定的标绘类型,开始绘制
   * @param type 标绘类型
   */
  function activateThis(type: any) {
    plot_layer.plotEdit.deactivate()
    let params = {
      isfill: true
    }
    plot_layer.plotDraw.activate(type, params)
  }
  /**
   * 保存绘制的军标要素
   * @param title 标题名称,默认为空字符串
   * @param ifGeoInfo 是否为地理信息,默认为false
   */
  function savePlot() {
    AddCommand({
      mc: plotForm.value.mc,
      alarmhandleid: plotForm.value.alarmhandleid,
      cjr: user.value.userName,
      createtime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      remark1: JSON.stringify(objArray)
    }).then((res: any) => {
      if (res.success) {
        ElMessage.success("添加成功")
        plotForm.value.mc = ""
        plotForm.value.id = undefined
        showSavePlot.value = false
        proxy.$mitt.emit("refreshZhjlData")
      } else {
        ElMessage.error("添加失败")
      }
    })
  }
  /**
   * 保存编辑后的军标要素
   * 将当前绘制的军标要素数组转为字符串并更新到编辑信息中
   */
  function saveEditPlot() {
    UpdateCommand({
      id: plotForm.value.id,
      mc: plotForm.value.mc,
      alarmhandleid: plotForm.value.alarmhandleid,
      cjr: user.value.userName,
      createtime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      remark1: JSON.stringify(objArray)
    }).then((res: any) => {
      if (res.success) {
        ElMessage.success("编辑成功")
        showSavePlot.value = false
        proxy.$mitt.emit("refreshZhjlData")
      } else {
        ElMessage.error("编辑失败")
      }
    })
  }
  const addPlot = () => {
    plotForm.value.mc = ""
    plotForm.value.id = undefined
    deleteAll()
  }
  /**
   * 预览军标要素命令
   * @param res 军标要素数据
   * @param ifPlot 是否为导出预览,默认为false
   * @param ifEdit 是否为编辑预览,默认为false
   */
  async function previewCommand(res: any) {
    plotForm.value = res // 设置绘制表单数据
    // 清空军标要素数组
    objArray = []
    // 清空绘制图层
    // 清除绘制图层中的所有要素
    drawOverlay
      .getSource()
      .getFeatures()
      .forEach((item: any) => {
        item.setGeometry(null)
      })
    drawOverlay.getSource().clear()

    // 如果存在军标要素数据
    if (res.plot) {
      // 解析军标要素数据
      objArray = JSON.parse(res.plot)
      // 遍历所有军标要素
      for (let index = 0; index < objArray.length; index++) {
        const it = objArray[index]
        // 用于存储控制点字符串
        var pointList2 = ""

        // 将控制点数组转换为字符串格式
        for (var i = 0; i < it.controlcoona.length; i++) {
          let s = "[" + it.controlcoona[i] + "],"
          pointList2 += s.toString()
        }

        // 根据军标类型和控制点创建军标要素
        it.featureF = plot_layer.plotDraw.createPlot(it.type, eval("[" + pointList2 + "]"))

        // 获取绘制要素并添加到图层
        let feature = (await getDrawFeature(it)) || null
        drawOverlay.getSource().addFeature(feature)
      }
      // 调整地图视图以适应所有要素
      map.getView().fit(drawOverlay.getSource()?.getExtent(), { nearest: true })
      // 缩小地图缩放级别
      map.getView().setZoom(map.getView().getZoom() - 2)
    }
  }
  /**
   * 导出军标要素
   * @param data 军标要素数据
   * @returns Promise<void>
   */
  const exportPlot = async (data: any) => {
    // 预览军标要素,返回预览结果
    const ifS = await previewCommand(data)
    // 如果预览成功,则导出军标要素文件
    if (ifS) {
      // 延迟500ms执行导出,确保预览渲染完成
      setTimeout(() => {
        // 生成当前时间戳作为文件名的一部分
        var date = dayjs().format("YYYYMMDDHHmmss")

        // 拼接文件名: 数据名称_时间戳.json
        var fileName = data.mc + "_" + date + ".json"

        // 创建a标签用于触发文件下载
        var aLink = document.createElement("a")

        // 将军标要素数组转换为JSON字符串
        var content = JSON.stringify(objArray)

        // 创建Blob对象,用于生成文件内容
        var blob = new Blob([content])

        // 设置下载文件名
        aLink.download = fileName

        // 生成文件的URL
        aLink.href = URL.createObjectURL(blob)

        // 模拟点击下载链接
        aLink.click()
      }, 500)
    }
  }
  /**
   * 删除所有军标要素
   * @param st 定时器ID,用于清除定时器
   */
  const deleteAll = (st: any = null) => {
    try {
      // 1. 如果存在定时器,清除它,防止后续的动画或操作继续执行
      st && clearTimeout(st)

      // 2. 停止所有正在进行的动画效果
      stopAnimation(null)

      // 3. 使用plotUtils工具类移除所有军标要素
      plot_layer.plotUtils.removeAllFeatures()

      // 4. 清空绘制图层中的所有要素
      // 清除绘制图层中的所有要素
      drawOverlay
        .getSource()
        .getFeatures()
        .forEach((item: any) => {
          item.setGeometry(null)
        })
      drawOverlay.getSource().clear()

      // 5. 清空军标要素数组,释放内存
      objArray.length = 0
    } catch (error) {}
  }
  /**
   * 停止动画
   * @param st 定时器ID,用于清除定时器
   */
  const stopAnimation = (st: any) => {
    // 1. 如果存在定时器,清除它
    st && clearTimeout(st)

    // 2. 移除地图的postcompose事件监听器,停止动画
    map.un("postcompose", moverFeaturej)

    // 3. 清除绘制图层中的所有要素
    // 清除绘制图层中的所有要素
    drawOverlay
      .getSource()
      .getFeatures()
      .forEach((item: any) => {
        item.setGeometry(null)
      })
    drawOverlay.getSource().clear()

    // 4. 重新绘制所有军标要素
    for (var j = 0; j < objArray.length; j++) {
      // 构建控制点坐标字符串
      var pointList2 = ""
      for (var i = 0; i < objArray[j].controlcoona.length; i++) {
        // 将每个控制点坐标转换为数组格式的字符串
        let s = "[" + objArray[j].controlcoona[i] + "],"
        pointList2 += s.toString()
      }

      // 使用plot_layer创建新的军标要素
      objArray[j].featureF = plot_layer.plotDraw.createPlot(
        objArray[j].type, // 军标类型
        eval("[" + pointList2 + "]") // 控制点坐标数组
      )

      // 创建新的Feature对象
      var feature = new Feature({
        geometry: objArray[j].featureF, // 设置几何形状
        type: "junbiao" // 设置要素类型
      })

      // 设置要素ID
      feature.setId(objArray[j].objId)
      // 将要素添加到绘制图层
      drawOverlay.getSource().addFeature(feature)
    }

    // 5. 如果传入了定时器ID,设置新的定时器
    // 2秒后自动删除所有要素
    st &&
      (st = setTimeout(() => {
        deleteAll(st)
      }, 2 * 1000))
  }
  /**
   * 开始动画
   * @param st 定时器ID,用于清除定时器
   */
  const starAnimation = (st: any) => {
    // 如果存在定时器,先清除之前的定时器
    st && clearTimeout(st)

    // 记录动画开始的时间戳,用于计算动画进度
    now = new Date().getTime()

    // 触发地图重新渲染
    map.render()

    // 注册postcompose事件监听器,在每一帧渲染时执行moverFeaturej函数
    // postcompose事件在每次地图渲染完成后触发
    map.on("postcompose", moverFeaturej)

    // 如果传入了定时器ID,设置新的定时器
    // 20秒后自动停止动画并清除要素
    st &&
      (st = setTimeout(() => {
        stopAnimation(st)
      }, 20 * 1000))
  }
  /**
   * 移动要素的动画处理函数
   * @param event 地图渲染事件对象
   */
  const moverFeaturej = (event: any) => {
    // 获取当前帧的状态信息
    const frameState = event.frameState
    // 计算从动画开始到现在经过的时间(毫秒)
    // frameState.time 是当前帧的时间戳
    // now 是动画开始的时间戳
    const elapsedTimej = frameState.time - now
    // 计算当前动画的帧索引
    // 5000是总帧数
    // 130000是动画总时长(毫秒)
    // 通过这个计算可以得到一个0-5000之间的索引值
    // 用于在后续的动画中确定要素的位置
    const indexj = Math.round((5000 * elapsedTimej) / 130000)
    for (var n = 0; n < objArray.length; n++) {
      switch (objArray[n].type) {
        case "DoubleArrow":
          // 设置双箭头的控制点坐标
          // 第一个点和第二个点是固定的控制点
          // 第三个点是动态变化的箭头主体坐标
          // 第四个点是动态变化的箭头尾部坐标
          // 第五个点是固定的尾部控制点
          objArray[n].featureF.setPoints([
            objArray[n].controlcoona[0], // 固定起点
            objArray[n].controlcoona[1], // 固定第二控制点
            objArray[n].featureCoordinates[indexj % objArray[n].featureCoordinates.length], // 动态箭头主体点
            objArray[n].pointList[indexj % objArray[n].pointList.length], // 动态箭头尾部点
            objArray[n].controlcoona[4] // 固定尾部控制点
          ])
          break
        case "Lune":
          // 设置弓形的控制点坐标
          // 第一个点是固定的起点
          // 第二个点是动态变化的弓形主体点
          // 第三个点是动态变化的弓形尾部点
          objArray[n].featureF.setPoints([
            objArray[n].controlcoona[0], // 固定起点
            objArray[n].featureCoordinates[indexj % objArray[n].featureCoordinates.length], // 动态弓形主体点
            objArray[n].pointList[indexj % objArray[n].pointList.length] // 动态弓形尾部点
          ])
          break
        case "Sector":
          // 设置扇形的控制点坐标
          // 第一个点是固定的圆心点
          // 第二个点是固定的起始点
          // 第三个点是动态变化的扇形弧线上的点
          objArray[n].featureF.setPoints([
            objArray[n].controlcoona[0], // 固定圆心点
            objArray[n].controlcoona[1], // 固定起始点
            objArray[n].featureCoordinates[indexj % (objArray[n].featureCoordinates.length - 1)] // 动态扇形弧线点
          ])
          break
        case "FreehandPolygon":
          // 对于自由手绘多边形(FreehandPolygon)的处理
          // 从pointList数组中获取当前索引对应的点集合
          // indexj是当前动画帧的索引
          // 通过取模运算(%)确保索引在pointList长度范围内循环
          // 使用setPoints方法更新要素的几何形状
          objArray[n].featureF.setPoints(objArray[n].pointList[indexj % objArray[n].pointList.length])
          break
        case "SquadCombat":
        case "TailedSquadCombat":
          // 对于作战箭头(SquadCombat)和尾巴作战箭头(TailedSquadCombat)的处理
          // 1. 计算当前动画帧对应的点集合索引
          //    - indexj % featureCoordinates.length 确保索引在坐标数组长度范围内循环
          //    - 除以49是为了将动画分段,每49帧更新一次点集合
          //    - +1 是为了从第二个点集合开始使用
          const pointListIndex = parseInt((indexj % objArray[n].featureCoordinates.length) / 49 + 1)

          // 2. 临时将当前动画帧的坐标添加到对应的点集合中
          objArray[n].pointList[pointListIndex].push(
            objArray[n].featureCoordinates[indexj % objArray[n].featureCoordinates.length]
          )

          // 3. 使用更新后的点集合设置要素的几何形状
          objArray[n].featureF.setPoints(objArray[n].pointList[pointListIndex])

          // 4. 移除临时添加的坐标点,保持原始点集合不变
          objArray[n].pointList[pointListIndex].pop()
          break
        case "AttackArrow":
        case "TailedAttackArrow":
        case "Polygon":
        case "GatheringPlace":
        case "ClosedCurve":
          // 对于进攻箭头(AttackArrow)、尾巴进攻箭头(TailedAttackArrow)、多边形(Polygon)、
          // 聚集地(GatheringPlace)和闭合曲线(ClosedCurve)的处理

          // 1. 计算当前动画帧对应的点集合索引
          // - indexj % featureCoordinates.length 确保索引在坐标数组长度范围内循环
          // - 除以49是为了将动画分段,每49帧更新一次点集合
          // - +2 是为了从第三个点集合开始使用(与SquadCombat不同)
          const currentPointListIndex = parseInt((indexj % objArray[n].featureCoordinates.length) / 49 + 2)

          // 2. 临时将当前动画帧的坐标添加到对应的点集合中
          objArray[n].pointList[currentPointListIndex].push(
            objArray[n].featureCoordinates[indexj % objArray[n].featureCoordinates.length]
          )

          // 3. 使用更新后的点集合设置要素的几何形状
          objArray[n].featureF.setPoints(objArray[n].pointList[currentPointListIndex])

          // 4. 移除临时添加的坐标点,保持原始点集合不变
          objArray[n].pointList[currentPointListIndex].pop()
          break
        case "Circle":
        case "Ellipse":
        case "RectAngle":
        case "StraightArrow":
        case "FineArrow":
        case "AssaultDirection":
          // 对于圆形(Circle)、椭圆(Ellipse)、矩形(RectAngle)、直箭头(StraightArrow)、
          // 细箭头(FineArrow)和突击方向(AssaultDirection)的处理

          // 1. 设置要素的点集合,包含两个点:
          // - 第一个点是控制点数组的第一个点(controlcoona[0]),作为图形的起始点/中心点
          // - 第二个点从pointList[0]中循环获取,用于控制图形的大小/方向
          // - indexj % pointList[0].length 确保索引在点集合长度范围内循环
          objArray[n].featureF.setPoints([
            objArray[n].controlcoona[0], // 起始点/中心点
            objArray[n].pointList[0][indexj % objArray[n].pointList[0].length] // 控制点
          ])
          break
        default:
          // 默认情况下的处理逻辑

          // 1. 当动画循环完成一轮时重置点集合
          // - indexj % (featureCoordinates.length - 1) 判断是否完成一轮循环
          // - 完成循环时将pointList重置为空数组,准备下一轮动画
          if (indexj % (objArray[n].featureCoordinates.length - 1) == 0) {
            objArray[n].pointList = []
          }

          // 2. 将当前坐标点添加到点集合中
          // - 以字符串形式将坐标点包装在方括号中
          // - indexj % (featureCoordinates.length - 1) 确保索引在坐标数组长度范围内循环
          objArray[n].pointList.push(
            "[" + objArray[n].featureCoordinates[indexj % (objArray[n].featureCoordinates.length - 1)] + "]"
          )

          // 3. 设置要素的坐标
          // - 使用eval将字符串形式的坐标数组转换为实际的坐标数组
          // - "[" + pointList + "]" 将所有坐标点组合成一个完整的数组字符串
          objArray[n].featureF.setCoordinates(eval("[" + objArray[n].pointList + "]"))
      }
    }
    map.render()
  }
  let drawLayer: any = null
  watch(
    () => mp.value,
    (newVal) => {
      if (newVal) {
        map = newVal
        // 创建drawLayer
        drawLayer = new VectorLayer({
          zIndex: 3,
          source: new VectorSource()
        })
        newVal.addLayer(drawLayer)
        loadPlotLayer(drawLayer)
      }
    }
  )
  onMounted(() => {})
  onBeforeUnmount(() => {
    if (drawLayer) {
      deleteAll()
      map.removeLayer(drawLayer)
    }
  })
  return {
    loadPlotLayer,
    handlePlot,
    activateThis,
    previewCommand,
    exportPlot,
    deleteAll,
    plotForm,
    showSavePlot,
    addPlot
  }
}
