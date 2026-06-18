/**
 * 视频监测点位同物理位置聚合工具
 * 用于 treeid 24/25/26/28 的图层管理点要素，按经纬度距离判定是否同一安装位置
 */

/** 参与同点位聚合的视频监测图层 treeid 白名单 */
export const VIDEO_MONITOR_TREE_IDS = [24, 25, 26, 28] as const

/** 判定为同一物理点位的最大距离（米） */
export const CO_LOCATION_THRESHOLD_METERS = 10

/** 要素上存储同点位分组 id 的属性名 */
export const CO_LOCATION_GROUP_KEY = "coLocationGroupId"

/**
 * 判断 treeid 是否属于视频监测点位图层
 */
export function isVideoMonitorTreeId(treeid: unknown): boolean {
  const id = Number(treeid)
  return VIDEO_MONITOR_TREE_IDS.includes(id as (typeof VIDEO_MONITOR_TREE_IDS)[number])
}

/**
 * 使用 Haversine 公式计算两点球面距离（米）
 */
export function getHaversineDistanceMeters(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const earthRadiusMeters = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusMeters * c
}

interface CoLocationFeatureLike {
  getGeometry: () => { getType: () => string; getCoordinates: () => number[] } | null | undefined
  get: (key: string) => unknown
  set: (key: string, value: string) => void
  unset: (key: string) => void
}

/**
 * 并查集：查找根节点
 */
function findParent(parent: number[], index: number): number {
  if (parent[index] !== index) {
    parent[index] = findParent(parent, parent[index])
  }
  return parent[index]
}

/**
 * 并查集：合并两个集合
 */
function unionParent(parent: number[], indexA: number, indexB: number): void {
  const rootA = findParent(parent, indexA)
  const rootB = findParent(parent, indexB)
  if (rootA !== rootB) {
    parent[rootB] = rootA
  }
}

/**
 * 对矢量图层中的视频监测点要素重新计算同点位分组
 * 距离在阈值内的点会被赋予相同的 coLocationGroupId
 */
export function rebuildVideoMonitorCoLocationGroups(features: CoLocationFeatureLike[]): void {
  // 仅处理白名单内的点要素
  const candidates = features.filter((feature) => {
    const geometry = feature.getGeometry()
    return geometry?.getType() === "Point" && isVideoMonitorTreeId(feature.get("treeid"))
  })

  // 清除历史分组标记，避免图层增删后残留
  candidates.forEach((feature) => {
    feature.unset(CO_LOCATION_GROUP_KEY)
  })

  if (candidates.length === 0) {
    return
  }

  const parent = candidates.map((_, index) => index)

  // 两两比较距离，10 米内视为同一物理点位
  for (let i = 0; i < candidates.length; i++) {
    const [lon1, lat1] = candidates[i].getGeometry()!.getCoordinates()
    for (let j = i + 1; j < candidates.length; j++) {
      const [lon2, lat2] = candidates[j].getGeometry()!.getCoordinates()
      const distance = getHaversineDistanceMeters(lon1, lat1, lon2, lat2)
      if (distance <= CO_LOCATION_THRESHOLD_METERS) {
        unionParent(parent, i, j)
      }
    }
  }

  // 按连通分量写入分组 id
  const groupMap = new Map<number, number[]>()
  candidates.forEach((_, index) => {
    const root = findParent(parent, index)
    if (!groupMap.has(root)) {
      groupMap.set(root, [])
    }
    groupMap.get(root)!.push(index)
  })

  let groupSeq = 0
  groupMap.forEach((indices) => {
    const groupId = `video-co-loc-${groupSeq++}`
    indices.forEach((index) => {
      candidates[index].set(CO_LOCATION_GROUP_KEY, groupId)
    })
  })
}

/**
 * 从要素列表中取出与当前要素同组的其他视频监测点
 */
export function getCoLocatedVideoMonitorFeatures(
  features: CoLocationFeatureLike[],
  currentFeature: CoLocationFeatureLike
): CoLocationFeatureLike[] {
  const groupId = currentFeature.get(CO_LOCATION_GROUP_KEY)
  if (!groupId || typeof groupId !== "string") {
    return [currentFeature]
  }

  const groupMembers = features.filter((feature) => {
    const geometry = feature.getGeometry()
    return (
      geometry?.getType() === "Point" &&
      isVideoMonitorTreeId(feature.get("treeid")) &&
      feature.get(CO_LOCATION_GROUP_KEY) === groupId
    )
  })

  return groupMembers.length > 0 ? groupMembers : [currentFeature]
}
