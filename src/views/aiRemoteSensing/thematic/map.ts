import "ol/ol.css"
import Map from "ol/Map"
import View from "ol/View"
import { OSM, Vector as VectorSource, XYZ, TileWMS } from "ol/source"
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer"
import { WKT } from "ol/format"
import * as olControl from "ol/control"
import * as olInteraction from "ol/interaction"

let projection = "EPSG:3857"
let map: Map
let layer: any = null

export const useMap = () => {
  // 二维地图
  const initMap = (ele: any) => {
    map = new Map({
      target: ele,
      controls: olControl.defaults({
        attribution: false,
        rotate: false,
        zoom: false
      }),
      interactions: olInteraction.defaults({
        doubleClickZoom: false
      }),
      view: new View({
        projection: "EPSG:3857", // 坐标系，有EPSG:4326和EPSG:3857
        center: [0, 0], // 坐标
        maxZoom: 7, // 地图缩放最大级别
        zoom: 1, // 地图缩放级别（打开页面时默认级别）
        smoothExtentConstraint: true,
        smoothResolutionConstraint: false,
        showFullExtent: true
      })
    })
  }
  //获取map
  const getMap = () => {
    if (map) {
      return map
    }
  }
  let layer: any = null
  const initLayer = (url, maxLevel) => {
    if (layer) {
      map.removeLayer(layer)
    }
    map.setView(
      new View({
        projection: "EPSG:3857",
        center: [0, 0],
        zoom: 1, // 地图缩放级别（打开页面时默认级别）
        maxZoom: maxLevel, // 地图缩放最大级别
        smoothExtentConstraint: true,
        smoothResolutionConstraint: false,
        showFullExtent: true
      })
    )
    layer = new TileLayer({
      className: "ol-version-tile ol-layer",
      source: new XYZ({
        crossOrigin: "anonymous",
        url: url,
        wrapX: false
      }),
      zIndex: 1
    })
    map.addLayer(layer)
  }
  return {
    initMap,
    getMap,
    initLayer
  }
}
