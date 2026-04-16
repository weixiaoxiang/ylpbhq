import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer"
import { Style, Icon, Fill, Stroke, Circle, Text } from "ol/style"
import Overlay from "ol/Overlay"
import { getCenter } from "ol/extent"
let type: any = "ld_qs"
const colorList: any = {
  ld_qs: {
    其它: "#4b4b4b",
    国有林地: "#DAD101",
    农户家庭承包经营: "#01B3DA"
  },
  sen_lin_lb: {
    一般商品林: "#DAD101",
    "重点公益林（地）": "#01B3DA",
    其它: "#4b4b4b"
  },
  qi_yuan: {
    人工萌生: "#DAD101",
    其它: "#4b4b4b",
    人工促进: "#01B3DA",
    植苗: "#fab1a0"
  },
  di_lei: {
    非林地: "#a8a8a8",
    国家特别规定灌木林地: "#fac858",
    建设用地: "#ea7ccc",
    耕地: "#DA4F01",
    林业辅助生产用地: "#91cc75",
    未成林造林地: "#DA011B",
    其他灌木林地: "#fab1a0",
    乔木林: "#01B3DA",
    其他无立木林地: "#DAD101"
  },
  lin_zhong: {
    食用原料林: "#DAD101",
    其它: "#4b4b4b",
    其他经济林: "#01B3DA",
    一般用材林: "#a8a8a8",
    水土保持林: "#DA4F01",
    水源涵养林: "#DA011B",
    速生丰产用材林: "#fab1a0"
  }
}
let map: any = null
let myvectorLayer: any = new VectorLayer({
  source: new VectorSource(),
  zIndex: 4,
  style: function (f) {
    let color = "#a8a8a8" + "6b"
    let type1 = f.getProperties().prop[type]
    if (colorList[type] && type1) {
      color = colorList[type][type1] + "6b"
    }
    return new Style({
      fill: new Fill({
        color: color
      }),
      text: new Text({
        text: f.get("name"),
        textAlign: "center",
        fill: new Fill({
          color: color
        }),
        font: "normal 14px 微软雅黑",
        scale: 0.8
      })
    })
  }
})
let overlayPopup: Overlay //弹框

let highFeature: any = null //高亮要素

export const useMap = () => {
  const detailData = ref(null) //详情数据
  const resourceType = ref(colorList)
  // 二维地图
  const initMap = (mapInit: any) => {
    map = mapInit
    map.addLayer(myvectorLayer) //添加森林资源图层
    map.on("click", click)
  }
  function click(e: any) {
    closePop()
    var f: any = map.forEachFeatureAtPixel(e.pixel, (f: any) => {
      return f
    })
    if (f) {
      // console.log(f.get("type"));
      switch (f.get("type")) {
        case "slzy":
          highFeature = f.clone()
          highFeature.setId("high")
          highFeature.setStyle(
            new Style({
              stroke: new Stroke({
                color: "#09ffff",
                width: 3
              })
            })
          )
          myvectorLayer.getSource()?.addFeature(highFeature)
          detailData.value = f.get("prop")
          overlayPopup.setPosition(e.coordinate)
          break
      }
    } else {
      closePop()
    }
  }
  //获取map
  const getMap = () => {
    if (map) {
      return map
    }
  }
  //加载森林资源
  const loadResource = async (data: any[]) => {
    myvectorLayer?.getSource().clear()
    data.forEach((it: any) => {
      let wktFea = new WKT().readFeature(it.wkt)
      wktFea.setId(it.id)
      wktFea.setProperties({
        type: "slzy",
        prop: it,
        name: it.xiao_ban
      })
      myvectorLayer.getSource().addFeature(wktFea)
    })
    map.getView().fit(myvectorLayer.getSource().getExtent(), { nearest: true })
  }
  const changeResourceType = async (field: any) => {
    type = field
    myvectorLayer.getSource().changed() // 触发图层样式更新
  }
  //加载弹框

  const loadPopup = (ele: any) => {
    overlayPopup = new Overlay({
      element: ele,
      positioning: "bottom-center",
      offset: [0, -30],
      autoPan: true
    })
    map.addOverlay(overlayPopup)
    overlayPopup?.setPosition(undefined)
  }
  //关闭弹框
  const closePop = () => {
    overlayPopup?.setPosition(undefined)
    detailData.value = null
    if (highFeature) {
      myvectorLayer.getSource()?.removeFeature(highFeature)
      highFeature = null
    }
  }
  //打开指定数据弹框
  const handleRowClick = (row: any) => {
    closePop()
    nextTick(() => {
      let f: any = myvectorLayer.getSource()?.getFeatureById(row.id)
      if (!f) {
        return
      }
      highFeature = f.clone()
      highFeature.setId("high")
      highFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: "#09ffff",
            width: 3
          })
        })
      )
      myvectorLayer.getSource()?.addFeature(highFeature)
      detailData.value = f.get("prop")
      let coor = getCenter(f.getGeometry().getExtent())
      overlayPopup.setPosition(coor)
      const view: any = map.getView()
      view.fit(f.getGeometry().getExtent())
      view.setZoom(view.getZoom() - 1)
    })
  }

  return {
    initMap,
    getMap,
    colorList,
    loadResource,
    changeResourceType,
    loadPopup,
    closePop,
    detailData,
    handleRowClick,
    resourceType
  }
}
