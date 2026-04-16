import Overlay from "ol/Overlay"
import { getCenter } from "ol/extent"
import { Vector as VectorLayer } from "ol/layer"
import { Vector as VectorSource } from "ol/source"

let map: any = null
let myvectorLayer: any = new VectorLayer({
  source: new VectorSource(),
  zIndex: 4
})
let overlayPopup: Overlay //弹框

let plot_layer: any
//军事图标绘制
let drawOverlay: any = new VectorLayer({
  source: new VectorSource(),
  zIndex: 9
})

export const useMap = () => {
  const detailData = ref(null) //详情数据
  // 二维地图
  const initMap = (mapInit: any) => {
    map = mapInit
    map.addLayer(myvectorLayer) //添加资源图层
    // loadPlotLayer() // 加载军事图标图层
    map.addLayer(drawOverlay) // 军事图标图层
    map.on("click", click)
  }
  function click(e: any) {
    closePop()
    var f: any = map.forEachFeatureAtPixel(e.pixel, (f: any) => {
      return f
    })
    if (f) {
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
  //加载资源
  const loadResource = async (data: any[]) => {}
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
  }
  //打开指定数据弹框
  const handleRowClick = (row: any) => {
    closePop()
    nextTick(() => {
      let f: any = myvectorLayer.getSource()?.getFeatureById(row.Id)
      if (!f) {
        return
      }
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
    loadResource,
    loadPopup,
    closePop,
    detailData
  }
}
