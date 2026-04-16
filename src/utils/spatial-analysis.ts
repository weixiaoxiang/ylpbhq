// "@turf/turf": "^7.1.0",
// "ol": "^10.1.0",
// "ol-ext": "^4.0.23",

import * as turf from "@turf/turf"
import { Geometry, Circle } from "ol/geom"

interface SpatialAnalysisResult {
  intersects: boolean
  area?: number // 相交面积
  length?: number // 相交长度
  points?: number[][] // 相交点
}

type GeometryType =
  | "Point"
  | "MultiPoint"
  | "LineString"
  | "MultiLineString"
  | "Polygon"
  | "MultiPolygon"
  | "Circle"
  | "Rect"

export function toTurfFeature(olGeometry: Geometry, srid: "EPSG:4326" | "EPSG:3857" = "EPSG:4326"): any {
  const cloned = olGeometry.clone().transform(srid, "EPSG:4326")
  // 特殊处理 Circle 类型
  if (olGeometry.getType() === "Circle") {
    const center = (olGeometry as Circle).getCenter()
    const radius = (olGeometry as Circle).getRadius()
    return turf.circle(center, radius, { units: "degrees" })
  }
  const coords = (cloned as any).getCoordinates()

  switch (olGeometry.getType()) {
    case "Point":
      return turf.point(coords)
    case "MultiPoint":
      return turf.multiPoint(coords)
    case "LineString":
      return turf.lineString(coords)
    case "MultiLineString":
      return turf.multiLineString(coords)
    case "Polygon":
      return turf.polygon([coords[0]])
    case "MultiPolygon":
      return turf.multiPolygon(coords)
    default:
      throw new Error(`不支持的几何类型: ${olGeometry.getType()}`)
  }
}
/**
 * 判断两个几何对象是否相交并计算相关属性
 */
export function intersects(geom1: any, geom2: any): SpatialAnalysisResult {
  try {
    const feature1 = geom1 instanceof Geometry ? toTurfFeature(geom1) : geom1
    const feature2 = geom2 instanceof Geometry ? toTurfFeature(geom2) : geom2
    // 首先判断是否相交
    const doesIntersect = turf.booleanIntersects(feature1, feature2)
    if (!doesIntersect) {
      return { intersects: false }
    }

    const type1 = feature1.geometry.type as GeometryType
    const type2 = feature2.geometry.type as GeometryType
    // 计算额外的相交信息
    return {
      intersects: true,
      ...calculateIntersectionDetails(feature1, feature2, type1, type2)
    }
  } catch (error) {
    console.error("空间相交分析错误:", error)
    return { intersects: false }
  }
}

/**
 * 计算相交的详细信息
 */
function calculateIntersectionDetails(
  feature1: any,
  feature2: any,
  type1: GeometryType,
  type2: GeometryType
): Partial<SpatialAnalysisResult> {
  // 如果两个都是面，计算相交面积
  if (isPolygonType(type1) && isPolygonType(type2)) {
    const intersection = turf.intersect(turf.featureCollection([feature1, feature2]))
    return intersection ? { area: turf.area(intersection) } : {}
  }

  // 如果涉及线，计算相交点和长度
  if (isLineType(type1) || isLineType(type2)) {
    const intersection = turf.lineIntersect(feature1, feature2)
    const details: Partial<SpatialAnalysisResult> = {
      points: intersection.features.map((f) => f.geometry.coordinates)
    }

    // 如果一个是线一个是面，计算被裁剪的线段长度,没能正常计算
    if ((isLineType(type1) && isPolygonType(type2)) || (isPolygonType(type1) && isLineType(type2))) {
      const line = isLineType(type1) ? feature1 : feature2
      const polygon = isPolygonType(type1) ? feature1 : feature2
      // 使用 lineOverlap 获取重叠部分
      const overlapped = turf.lineOverlap(line, polygon)
      if (overlapped.features.length > 0) {
        details.length = turf.length(overlapped)
      }
    }
    return details
  }

  // 点与其他类型的相交只返回相交状态
  return {}
}

/**
 * 类型判断辅助函数
 */
function isPolygonType(type: GeometryType): boolean {
  return type === "Polygon" || type === "MultiPolygon"
}

function isLineType(type: GeometryType): boolean {
  return type === "LineString" || type === "MultiLineString"
}
