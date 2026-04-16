/**
 * 地图绘制工具
 * author: 魏晓翔
 */
import { Map } from "ol"
import { Draw, Modify, Select, Snap, Translate } from "ol/interaction"
import pointIcon from "@/assets/images/patrol/legend-icon4.png"
import startIcon from "@/assets/images/patrol/legend-icon1.png"
import endIcon from "@/assets/images/patrol/legend-icon2.png"
import editIcon from "@/assets/images/patrol/legend-icon4.png"
import { getLength } from "ol/sphere"
import { Style } from "ol/style"

// const pointIcon =
//   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAnVJREFUWEfVlbFrE2EYxp/3gqXWioNDEXKNac2Fqot/gEMGJ6eaGFSapBHEwUFEEDrZDnaxg4tLESUXpCAimTqIiGgXUaGIYnMttrk2grjUxdo0d69eJBDqXe67S0Lot37v8zy/e7/3+47Q5UVdzsfeA/h8/3j/oYPGGDOfANERwDwMlt4zsIAevBu8WPzmpavCHdDVkZNA9ZpENMaM/iYhs6YpzYbGlz6IgAgB6HnlDjGuAzggYmrVmIypUEabdKt3BdjIRR8ycdbNyG5fBKIpgK4q0wRM+Amva0zQjVC6eM/JwxFAzyunifG6WTgzQK49xCYZHAtmlxftvBzl62r0KcDxVr6+QVuQ09qoMEB5blg2dwJ6m8Itm0rVqAyEs2ubuz1tO1DKR85ITM/bCAAmjA6mtIIQgK4qNwmYaSeA042w70BOmZQIt/0C2A3n3gLoxBGA+ZacWb4rNAOdGEIAZ+W0Ni8E0IFriKohhcPZpTUhAKtIV5U5Ai74HcRdumdyWrN91BxfwnLu2CmTAgsA9zlBCD7FgGHG5OzKK+GXsF5YavE61nwYD+SMdsXzz6gu0FXlEQHjPo+iEOzVEpSE4RvAEq6ryksAMY8Q8+j9lZCTG1vNdO4/UwvgSXA/fvd9AjAkAkHAi+2tamL46tefbvVCALUuPB6JwDC+AAg0M2XgzXbVjEcur/xwC7f2hQGs4o1cNMbE1nE4rbdgxP8OXVkk3DNADUJVUgyo/wUwFg2ic0fTxVXRcF8AlqikKhMSMN0Q9HGHKDmUKha9hPsG+NeJ6HkAKWYUe/ZVZgYurX73Gt4SgJ8wO42nIWxXaKNP1wH+AOeL3SHMuyuXAAAAAElFTkSuQmCC"
// const startIcon =
//   "data:image/png;base64,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"
// const endIcon =
//   "data:image/png;base64,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"
// const editIcon =
//   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAnFJREFUWEfVlr9rE2EYx7/PxRas3eQuKnZopb0EXfwDHDI4OdXkrkFa0MHJQUQQOlkHu9jBuRQFl9ZckUwdRIpoF1GhiNqeVhR/0VwixkUxJu9jLzVY5S733iUl9Nb3eb7fzz3v8zx3hA4/1GF/7DyAF6rR20U0ysSHmWm/wrxXED0B0RJq9DhRmvscpqrSFViLjxypMp8jYBRAr78JTQshppMl66kMiBSArZpXQTgPYI+MqBsjgCtJJzcRFB8I8Cpu3mDGmSAhr3MZiKYAdtycBGM8inkjh4kuJAq3r/tp+ALYavYYSDxoZs6AzBiViTk1VLSWvbR8AVY1c56AdCtvvyU3rzu5YWmAtQPZvlpVvG+TuVumSvfPSry/nC//r+lZgZeacTwGuts2gE2hYd3J5aUAbM28uDHrU+0E8JsIzwqsaOaEAlyOCuDVnDsLYDuugMGXEo51TaoHtqUJGSf0Ym5BCqDtY+h+GxSlP7k+904KwA2yVXMWhGzURvw3j+/ojuW51Hw34Ws1e5RJLDHQ4wchuYohhEglS/P3pTdhI7DVcazrMGb0Yu5s6I9RI8HWjJsAnY54FfkhhzMEqxYZwE1cVc1FIqRCQRAWero40/fR+tEsL/CHxE3+cNDY/b2C5wANSELc2/WLM4e+Wt+C4qUAXJE36qnBKlVXAMSai/JDRUF6cN0qBpm759IA9avYZ6ZIYNFfmB+hhrT+xfokYx4aoL4fNGNs4ypueRgsM/HJRMF6K2seCeDPkhoHYfKvET9jATNRsuww5pEBNidjxFDAY4JgdyM2NeDMFsKatwQQxcwrJ1QTtst0q07HAX4DQ4bUIf1nqj4AAAAASUVORK5CYII="
const styles: any = {
  Point: new Style({
    image: new Icon({
      src: pointIcon,
      scale: 1.2,
      anchor: [0.5, 1]
    })
  }),
  LineString: [
    new Style({
      image: new Icon({
        src: startIcon,
        scale: 1.2,
        anchor: [0.5, 1]
      }),
      stroke: new Stroke({
        color: "#00FF9C",
        width: 3
      })
    }),
    new Style({
      image: new Icon({
        src: startIcon,
        scale: 1.2,
        anchor: [0.5, 1]
      }),
      geometry: (f: any) => {
        const coordinates = f.getGeometry()!.getCoordinates()
        return new Point(coordinates[0])
      }
    }),
    new Style({
      image: new Icon({
        src: endIcon,
        scale: 1.2,
        anchor: [0.5, 1]
      }),
      geometry: (f: any) => {
        const coordinates = f.getGeometry()!.getCoordinates()
        return new Point(coordinates[coordinates.length - 1])
      }
    })
  ],
  MultiLineString: [
    new Style({
      image: new Icon({
        src: startIcon,
        scale: 1.2,
        anchor: [0.5, 1]
      }),
      stroke: new Stroke({
        color: "#00FF9C",
        width: 3
      })
    }),
    new Style({
      image: new Icon({
        src: startIcon,
        scale: 1.2,
        anchor: [0.5, 1]
      }),
      geometry: (f: any) => {
        const coordinates = f.getGeometry()!.getCoordinates()[0]
        return new Point(coordinates[0])
      }
    }),
    new Style({
      image: new Icon({
        src: endIcon,
        scale: 1.2,
        anchor: [0.5, 1]
      }),
      geometry: (f: any) => {
        const coordinates = f.getGeometry()!.getCoordinates()?.[f.getGeometry()!.getCoordinates().length - 1]
        return new Point(coordinates[coordinates.length - 1])
      }
    })
  ],
  Polygon: new Style({
    fill: new Fill({
      color: "rgba(114, 191, 120, 0.5)"
    }),
    stroke: new Stroke({
      color: "#00FF9C",
      width: 3
    })
  }),
  Edit: [
    new Style({
      image: new Icon({
        src: editIcon,
        scale: 1.2,
        anchor: [0.5, 1],
        color: "red"
      }),
      fill: new Fill({
        color: "rgba(98, 86, 202, 0.5)"
      }),
      stroke: new Stroke({
        color: "#6256CA",
        width: 3
      })
    }),
    new Style({
      image: new Icon({
        src: editIcon,
        scale: 1.2,
        anchor: [0.5, 1],
        color: "red"
      }),
      geometry: (f: any) => {
        const type = f.getGeometry()!.getType()
        if (type === "LineString") {
          const coordinates = f.getGeometry()!.getCoordinates()
          return new Point(coordinates[0])
        }
        if (type === "MultiLineString") {
          const coordinates = f.getGeometry()!.getCoordinates()[0]
          return new Point(coordinates[0])
        }
      }
    }),
    new Style({
      image: new Icon({
        src: editIcon,
        scale: 1.2,
        anchor: [0.5, 1],
        color: "red"
      }),
      geometry: (f: any) => {
        const type = f.getGeometry()!.getType()
        if (type === "LineString") {
          const coordinates = f.getGeometry()!.getCoordinates()
          return new Point(coordinates[coordinates.length - 1])
        }
        if (type === "MultiLineString") {
          const coordinates = f.getGeometry()!.getCoordinates()?.[f.getGeometry()!.getCoordinates().length - 1]
          return new Point(coordinates[coordinates.length - 1])
        }
      }
    })
  ]
}
interface Option {
  // 是否只能绘制单个要素
  onlySigle: boolean
  // 要加载修改的要素
  loadFeatures: any[] | null
}
export default function useMapDrawBar(map: Map, opt?: Option) {
  let barTip: any
  let draw: any = null,
    translate: any = null,
    modify: any = null,
    select: any = null,
    snap: any = null
  const drawData = reactive<any>({
    points: [],
    line: null,
    cd: null
  })
  const drawSource = new VectorSource()
  const drawLayer = new VectorLayer({
    source: drawSource,
    style: (f: any) => {
      const type = f.getGeometry()!.getType()
      let style = styles[type]
      return style
    }
  })
  drawLayer.set("title", "mapDrawBar图层")
  map.addLayer(drawLayer)
  // 当loadFeatures有值时，加载要素
  if (opt?.loadFeatures) {
    opt.loadFeatures.forEach((feature: any) => {
      const type = feature.getGeometry().getType()
      if (type === "Point") {
        const point = {
          id: feature.get("id"),
          coor: feature.getGeometry().getCoordinates()
        }
        drawData.points.push(point)
      }
      if (type === "LineString") {
        drawData.line = feature.getGeometry().getCoordinates() // 获取线的坐标
        // drawData.line = new WKT().writeGeometry(feature.getGeometry())
        // 获得线的长度
        const length = getLength(feature.getGeometry(), { projection: "EPSG:4326" })
        // 转化为千米
        const cd = (length / 1000).toFixed(2)
        drawData.cd = cd
      }
      if (type === "MultiLineString") {
        drawData.line = feature.getGeometry().getCoordinates()[0] // 获取线的坐标
        // drawData.line = new WKT().writeGeometry(feature.getGeometry())
        // 获得线的长度
        const length = getLength(feature.getGeometry(), { projection: "EPSG:4326" })
        // 转化为千米
        const cd = (length / 1000).toFixed(2)
        drawData.cd = cd
      }
      drawSource.addFeature(feature)
    })
    const extent = drawSource.getExtent()
    if (extent[0] !== Infinity) {
      map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        maxZoom: 18,
        duration: 200
      })
    }
  }

  // 绘制点线面
  const drawPoint = () => {
    ElMessage.info("开启点绘制")
    removeInteraction()
    opt?.onlySigle && removeAll()
    draw = new Draw({
      source: drawSource,
      type: "Point",
      style: styles["Point"]
    })
    map.addInteraction(draw)
    snap = new Snap({ source: drawSource })
    map.addInteraction(snap)
    draw.on("drawend", (evt: any) => {
      ElMessage.info("结束点绘制")
      const point = {
        id: guid(),
        coor: evt.feature.getGeometry().getCoordinates()
      }
      evt.feature.set("id", point.id)
      drawData.points.push(point)
      map.removeInteraction(draw)
    })
  }
  let lastLine: any = null
  const drawLine = () => {
    ElMessage.info("开启线绘制")
    removeInteraction()
    opt?.onlySigle && removeAll()
    // 将上一次绘制的线清空
    if (lastLine) {
      drawSource.removeFeature(lastLine)
    }
    draw = new Draw({
      source: drawSource,
      type: "LineString",
      style: styles["LineString"]
    })
    map.addInteraction(draw)
    draw.on("drawend", (evt: any) => {
      ElMessage.info("结束线绘制")
      lastLine = evt.feature
      drawData.line = evt.feature.getGeometry().getCoordinates() // 获取线的坐标
      // drawData.line = new WKT().writeGeometry(evt.feature.getGeometry())
      // 获得线的长度
      const length = getLength(evt.feature.getGeometry(), { projection: "EPSG:4326" })
      // 转化为千米
      const cd = (length / 1000).toFixed(2)
      drawData.cd = cd
      map.removeInteraction(draw)
    })
  }
  const drawPolygon = () => {
    removeInteraction()
    opt?.onlySigle && removeAll()
    draw = new Draw({
      source: drawSource,
      type: "Polygon",
      style: styles["Polygon"]
    })
    map.addInteraction(draw)
    draw.on("drawend", (evt: any) => {
      console.log(evt)
      map.removeInteraction(draw)
    })
  }
  // 开启要素选择
  const openSelect = () => {
    ElMessage.info("开启选中要素")
    removeInteraction()
    select = new Select({
      style: styles["Edit"],
      multi: false,
      layers: [drawLayer]
    })
    map.addInteraction(select)
    select.on("select", (_evt: any) => {
      // console.log(evt.selected[0])
    })
  }
  // 开启要素选择和snap和modify
  const openModify = () => {
    ElMessage.info("开启选中修改要素")
    removeInteraction()
    select = new Select({
      style: styles["Edit"],
      multi: false,
      layers: [drawLayer]
    })
    map.addInteraction(select)
    translate = new Translate({
      features: select.getFeatures()
    })
    map.addInteraction(translate)
    modify = new Modify({
      features: select.getFeatures(),
      pixelTolerance: 20
    })
    map.addInteraction(modify)
    modify.on("modifyend", (evt: any) => {
      const type = evt.features.item(0).getGeometry().getType()
      if (type === "Point") {
        const featureId = evt.features.item(0).get("id")
        const point = drawData.points.find((item: any) => item.id === featureId)
        console.log(point, 111)

        point.coor = evt.features.item(0).getGeometry().getCoordinates()
      }
      if (type === "LineString") {
        drawData.line = evt.features.item(0).getGeometry().getCoordinates() // 获取线的坐标
        // drawData.line = new WKT().writeGeometry(evt.feature.getGeometry())
        // 获得线的长度
        const length = getLength(evt.features.item(0).getGeometry(), { projection: "EPSG:4326" })
        // 转化为千米
        const cd = (length / 1000).toFixed(2)
        drawData.cd = cd
      }
      if (type === "MultiLineString") {
        drawData.line = evt.features.item(0).getGeometry().getCoordinates()[0] // 获取线的坐标
        // drawData.line = new WKT().writeGeometry(evt.feature.getGeometry())
        // 获得线的长度
        const length = getLength(evt.features.item(0).getGeometry(), { projection: "EPSG:4326" })
        // 转化为千米
        const cd = (length / 1000).toFixed(2)
        drawData.cd = cd
      }
    })
    snap = new Snap({ source: drawSource })
    map.addInteraction(snap)
  }
  // 删除选中要素
  const removeSelect = () => {
    if (select) {
      const selectFeatures = select.getFeatures().getArray()
      if (selectFeatures.length === 0) {
        return ElMessage.warning("请先选中要素")
      }
    } else {
      return ElMessage.warning("请先选中要素")
    }
    for (let i = 0; i < select.getFeatures().getLength(); i++) {
      const feature = select.getFeatures().item(i)
      const type = feature.getGeometry().getType()
      if (type === "Point") {
        const featureId = feature.get("id")
        const index = drawData.points.findIndex((item: any) => item.id === featureId)
        drawData.points.splice(index, 1)
      }
      if (type === "LineString") {
        drawData.line = null
        drawData.cd = null
      }
      drawSource.removeFeature(feature)
      select.getFeatures().remove(feature)
      i--
    }
  }
  // 删除所有要素
  const removeAll = () => {
    drawSource.clear()
    drawData.line = null
    drawData.points = []
    drawData.cd = null
    if (select) {
      for (let i = 0; i < select.getFeatures().getLength(); i++) {
        const feature = select.getFeatures().item(i)
        select.getFeatures().remove(feature)
        i--
      }
    }
  }
  // 移除所有交互
  const removeInteraction = () => {
    if (draw instanceof Draw) {
      map.removeInteraction(draw)
    }
    if (translate instanceof Translate) {
      map.removeInteraction(translate)
    }
    if (modify instanceof Modify) {
      map.removeInteraction(modify)
    }
    if (select instanceof Select) {
      map.removeInteraction(select)
    }
    if (snap instanceof Snap) {
      map.removeInteraction
    }
  }
  // 打开bar使用提示
  const openBarTip = () => {
    barTip = ElNotification({
      title: "操作说明",
      dangerouslyUseHTMLString: true,
      duration: 0,
      offset: 80,
      position: "top-left",
      // <p>2.选择要素时，按住shift开启多选</p>
      message: `
      <p>1.点击正上方工具栏开启对应操作</p>
      <p>2.绘制线时,按ctrl+z撤销上一步绘制，按<b>住</b>shift开启自由绘制</p>
      <p>3.选中要素，按住鼠标滚轮拖拽要素</p>
               `,
      type: "info"
    })
  }
  // 关闭bar使用提示
  const closeBarTip = () => {
    if (barTip) {
      barTip.close()
    }
  }
  // 监听键盘ctrl+z事件
  const keydown = (e: any) => {
    if (e.ctrlKey && e.keyCode === 90) {
      if (draw) {
        draw.removeLastPoint()
      }
    }
  }
  onMounted(() => {
    window.addEventListener("keydown", keydown)
  })
  onBeforeUnmount(() => {
    removeInteraction()
    map.removeLayer(drawLayer)
    closeBarTip()
    window.removeEventListener("keydown", keydown)
  })
  return {
    /**
     * 绘制数据
     */
    drawData,
    /**
     * 绘制点
     */
    drawPoint,
    /**
     * 绘制线
     */
    drawLine,
    /**
     * 绘制面
     */
    drawPolygon,
    /**
     * 开启选中要素
     */
    openSelect,
    /**
     * 开启选中修改要素
     */
    openModify,
    /**
     * 删除选中要素
     */
    removeSelect,
    /**
     * 删除所有要素
     */
    removeAll,
    /**
     * 移除所有交互
     */
    removeInteraction,
    /**
     * 打开bar使用提示
     */
    openBarTip,
    /**
     * 关闭bar使用提示
     */
    closeBarTip
  }
}
// 随机生成guid
function guid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
