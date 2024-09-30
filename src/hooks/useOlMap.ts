/**
 * @module useOlMap
 * @desc A hook to create an OpenLayers map instance
 * @returns {ol.Map} The OpenLayers map instance
 */
// vue3

// module所属模块
export default function useOlMap(popup: Ref<any>) {
  // vue3
  // 创建一个地图实例
  let map = ref()
  let overlay = reactive<any>({})
  let vectorLayer, vectorSource
  const initMap = () => {
    // 天地图影像
    let map_img = new TileLayer({
      source: new XYZ({
        url: "https://t6.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"
      }),
      visible: true
    })
    // meitu文字注记
    let map_cta = new TileLayer({
      source: new XYZ({
        // url: "http://119.3.240.181:8005/DataServer.aspx?layer=sxbz&x={x}&y={y}&l={z}&tk=f7fd9f47beb5b90b8a6488f11f4f0804",
        url: "http://119.3.240.181:8005/DataServer.aspx?layer=sxyx&x={x}&y={y}&l={z}&tk=f7fd9f47beb5b90b8a6488f11f4f0804"
      }),
      visible: true
    })
    // 天地图矢量
    let map_vec = new TileLayer({
      source: new XYZ({
        url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"
      }),
      visible: false
    })
    // 天地图文字注记
    let map_cta1 = new TileLayer({
      source: new XYZ({
        url: "http://t4.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=8232df3467e2da8a1ae909e65a695bfe"
      }),
      visible: false
    })
    const layers = [map_img, map_cta, map_vec, map_cta1]
    map.value = new OlMap({
      layers: layers,
      view: new View({
        projection: "EPSG:4326",
        center: [117, 31],
        zoom: 10,
        maxZoom: 18,
        minZoom: 6
      }),
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
      target: "map"
    })
    vectorSource = new VectorSource()
    vectorLayer = new VectorLayer({
      source: vectorSource
    })
    vectorLayer.set("title", "矢量图层")
    map.value.addLayer(vectorLayer)
    if (popup.value) {
      overlay = new Overlay({
        element: popup.value.$el,
        autoPan: true,
        positioning: "bottom-left"
      })
      map.value.addOverlay(overlay)
      overlay.setPosition([117, 31])
    }
    map.value.on("click", (e: any) => {
      // console.log(e.coordinate)
      overlay.setPosition(e.coordinate)
    })
  }
  // 关闭弹窗
  const closePopup = () => {
    overlay.setPosition(undefined)
  }
  onMounted(() => {
    initMap()
  })
  return {
    map,
    overlay,
    closePopup
  }
}
