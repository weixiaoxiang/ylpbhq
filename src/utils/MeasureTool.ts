// @ts-nocheck
/* eslint-disable */
import Draw from "ol/interaction/Draw.js"
import Map from "ol/Map.js"
import Overlay from "ol/Overlay.js"
import View from "ol/View.js"
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style.js"
import { LineString, Polygon } from "ol/geom.js"
import { OSM, Vector as VectorSource } from "ol/source.js"
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js"
import { getArea, getLength } from "ol/sphere.js"
import { unByKey } from "ol/Observable.js"
import { includes } from "xe-utils"

class Measure {
  private map: any
  private layer = new VectorLayer()
  private source = new VectorSource()
  private typeSelect: string
  private draw: any
  private style = new Style({
    fill: new Fill({
      color: "rgba(0, 204, 221, 0.2)"
    }),
    stroke: new Stroke({
      color: "rgba(0, 204, 221, 1)",
      lineDash: [10, 10],
      width: 3
    }),
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: "rgba(0, 204, 221,1)",
        width: 2
      }),
      fill: new Fill({
        color: "rgba(255, 240, 209, 1)"
      })
    })
  })
  private sketch
  private helpTooltipElement
  private helpTooltip
  private measureTooltipElement
  private measureTooltip
  private continuePolygonMsg = "单击继续绘制多边形"
  private continueLineMsg = "单击以继续绘制线条"

  constructor(opt: any) {
    this.map = opt.map
    this.typeSelect = opt.type || "LineString"
    this.init()
    this.addTooltipStyle()
  }
  init() {
    this.layer = new VectorLayer({
      source: this.source,
      style: {
        "fill-color": "rgba(0, 204, 221, 0.2)",
        "stroke-color": "rgba(0, 204, 221, 1)",
        "stroke-width": 3,
        "stroke-line-dash": [10, 10],
        "circle-radius": 7,
        "circle-fill-color": "rgba(0, 204, 221, 1)"
      },
      zIndex: 10
    })
    this.layer.set("title", "measureLayer")
    this.map.addLayer(this.layer)

    const pointerMoveHandler = (evt) => {
      if (evt.dragging) {
        return
      }
      let helpMsg = "点击开始绘图"

      if (this.sketch) {
        const geom = this.sketch.getGeometry()
        if (geom instanceof Polygon) {
          helpMsg = this.continuePolygonMsg
        } else if (geom instanceof LineString) {
          helpMsg = this.continueLineMsg
        }
      }

      this.helpTooltipElement.innerHTML = helpMsg
      this.helpTooltip.setPosition(evt.coordinate)

      this.helpTooltipElement.classList.remove("hidden")
    }
    this.map.on("pointermove", pointerMoveHandler)
  }
  formatLength(line) {
    const length = getLength(line, { projection: "EPSG:4326" })
    let output
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + " " + "km"
    } else {
      output = Math.round(length * 100) / 100 + " " + "m"
    }
    return output
  }
  formatArea(polygon) {
    const area = getArea(polygon, { projection: "EPSG:4326" })
    let output
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + " " + "km<sup>2</sup>"
    } else {
      output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>"
    }
    return output
  }
  addInteraction() {
    const type = this.typeSelect
    this.draw = new Draw({
      source: this.source,
      type: type,
      style: (feature) => {
        const geometryType = feature.getGeometry().getType()
        if (geometryType === type || geometryType === "Point") {
          return this.style
        }
      }
    })
    this.map.addInteraction(this.draw)

    this.createMeasureTooltip()
    this.createHelpTooltip()

    let listener
    this.draw.on("drawstart", (evt) => {
      this.sketch = evt.feature
      let tooltipCoord = evt.coordinate
      listener = this.sketch.getGeometry().on("change", (evt) => {
        const geom = evt.target
        let output
        if (geom instanceof Polygon) {
          output = this.formatArea(geom)
          tooltipCoord = geom.getInteriorPoint().getCoordinates()
        } else if (geom instanceof LineString) {
          output = this.formatLength(geom)
          tooltipCoord = geom.getLastCoordinate()
        }
        this.measureTooltipElement.innerHTML = output
        this.measureTooltip.setPosition(tooltipCoord)
      })
    })

    this.draw.on("drawend", () => {
      this.measureTooltipElement.className = "ol-tooltip ol-tooltip-static"
      this.measureTooltip.setOffset([0, -7])
      this.sketch = null
      this.measureTooltipElement = null
      this.createMeasureTooltip()
      unByKey(listener)
    })
  }
  createHelpTooltip() {
    if (this.helpTooltipElement) {
      this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement)
    }
    this.helpTooltipElement = document.createElement("div")
    this.helpTooltipElement.className = "ol-tooltip hidden"
    this.helpTooltip = new Overlay({
      element: this.helpTooltipElement,
      offset: [15, 0],
      positioning: "center-left"
    })
    this.map.addOverlay(this.helpTooltip)
  }
  createMeasureTooltip() {
    if (this.measureTooltipElement) {
      this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement)
    }
    this.measureTooltipElement = document.createElement("div")
    this.measureTooltipElement.className = "ol-tooltip ol-tooltip-measure"
    this.measureTooltip = new Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: "bottom-center",
      stopEvent: false,
      insertFirst: false
    })
    this.measureTooltip.set("name", "measureTooltip")
    this.map.addOverlay(this.measureTooltip)
  }
  // 开启绘制
  startDraw() {
    this.addInteraction()
  }
  // 切换绘制类型
  changeType(type: string) {
    this.typeSelect = type
    // debugger
    if (this.draw) {
      this.map.removeInteraction(this.draw)
    }
    this.addInteraction()
  }
  // 结束绘制 清除绘制
  removeInteraction() {
    this.map.removeInteraction(this.draw)
    this.layer.getSource().clear()
    this.map.removeLayer(this.layer)
    this.map.removeOverlay(this.helpTooltip)
    this.removeTooltipStyle()
    const overlays = this.map.getOverlays().getArray()
    for (let i = 0; i < overlays.length; i++) {
      if (overlays[i].get("name") === "measureTooltip") {
        this.map.removeOverlay(overlays[i])
        i--
      }
    }
  }

  // 全局添加tooltip样式
  addTooltipStyle() {
    const style = document.createElement("style")
    style.setAttribute("id", "ol-tooltip")
    style.innerHTML = `
      .ol-tooltip {
          position: relative;
          background: rgba(0, 204, 221, 1);
          border-radius: 4px;
          color: white;
          padding: 4px 8px;
          white-space: nowrap;
          font-size: 12px;
          font-weight: bold;
          cursor: default;
          user-select: none;
      }
      .ol-tooltip-measure {
        opacity: 1;
      }
      .ol-tooltip-static {
        background-color: rgba(0, 204, 221, 1);
        color: white;
        border: 1px solid rgba(0, 204, 221, 1);
      }
      .ol-tooltip-measure:before,
      .ol-tooltip-static:before {
        border-top: 6px solid rgba(0, 204, 221, 1);
        border-right: 6px solid transparent;
        border-left: 6px solid transparent;
        content: "";
        position: absolute;
        bottom: -6px;
        margin-left: -7px;
        left: 50%;
      }
      .ol-tooltip-static:before {
        border-top-color: rgba(0, 204, 221, 1);
      }
    `
    document.head.appendChild(style)
  }
  // 清除tooltip样式
  removeTooltipStyle() {
    const style = document.querySelector("#ol-tooltip")
    style && style.remove()
  }
}
export default Measure
