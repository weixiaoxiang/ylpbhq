import { Map } from "ol"

export default function useMapTool(map: Map) {
  const originCenter = [117, 31]
  const orginZoom = 10
  const zoomIn = () => {
    const view = map.getView()
    const zoom = view.getZoom()!
    view.animate({
      zoom: zoom + 1,
      duration: 250
    })
  }
  const zoomOut = () => {
    const view = map.getView()
    const zoom = view.getZoom()!
    view.animate({
      zoom: zoom - 1,
      duration: 250
    })
  }
  const resetView = () => {
    const view = map.getView()
    view.animate({
      center: originCenter,
      zoom: orginZoom,
      duration: 250
    })
  }
  return {
    zoomIn,
    resetView,
    zoomOut
  }
}
