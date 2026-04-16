export const getTop = (arry: any) => {
  return arry.filter((item: any) => {
    const find = arry.some((a: any) => a.id === item.pid)
    return item.id == item.pid || item.pid == 0 || !find
  })
}
export const getChild = (pArry: any, arry: any) => {
  pArry.forEach((idt: any) => {
    idt.children = arry.filter((item: any) => idt.id == item.pid) || null
    if (idt.children.length > 0) {
      getChild(idt.children, arry)
    }
  })
  return pArry
}

//
export const getTop1 = (arry: any) => {
  return arry.filter((item: any) => {
    const find = arry.some((a: any) => a.id === item.parentid)
    return item.id == item.parentid || item.parentid == 0 || !find
  })
}
export const getChild1 = (pArry: any, arry: any) => {
  pArry.forEach((idt: any) => {
    if (idt.blevel == 7) return
    idt.children = arry.filter((item: any) => idt.id == item.parentid) || null
    if (idt.children.length > 0) {
      getChild1(idt.children, arry)
    }
  })
  return pArry
}

// 根据输入的16进制颜色和透明度生产rgba颜色
export const hexToRgba = (hex: any, opacity?: any) => {
  if (!opacity) {
    opacity = 1
  }
  const h = hex.replace("#", "")
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

const MAPCONFIG = {
  tdtKeys: [
    "e87400d44912eed4a49297ffae2f6a33",
    "74a0a50e319d8a1285c2788f3f5685f3",
    "d710bca7746b56b8cc39ea40e38e12cd",
    "70c9ca3cfe916fb73f87581b924bee80",
    "0c7e0a53810e9ea9d4e2582292a06173",
    "9408f9482f48ca905d515f25c38cdd57",
    "b65ba8af3fc5848897d10058b0b06007",
    "598ec11b4f4c3e6716555b953a06b996",
    "219af9762fdf095455d7ec3f4b1d8ced"
  ]
}
// 获得天地图key
export const getRandomTdtKeys = (): string => {
  const index = Math.floor(Math.random() * MAPCONFIG.tdtKeys.length)
  return MAPCONFIG.tdtKeys[index]
}

// 下载图片
export const downloadFile = (url: string, name?: string) => {
  const a = document.createElement("a")
  a.href = url
  if (name) a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 递归遍历array拿到所有没有children的子节点数据
export const getLeafNodes = (array: any) => {
  const result: any[] = []
  array.forEach((item: any) => {
    if (item.Children?.length > 0) {
      result.push(...getLeafNodes(item.Children))
    } else {
      result.push(item)
    }
  })
  return result
}
// 递归遍历array拿到所有children数据的父节点数据,并删除children
export const getParentNodes = (array: any) => {
  const result: any[] = []
  array.forEach((item: any) => {
    if (item.Children?.length > 0) {
      result.push(item)
      item.Children = getParentNodes(item.Children)
      // if (item.Children.length === 0) {
      //   delete item.Children
      // }
    }
  })
  return result
}
// 根据id查找节点
export const findNodeById = (array: any, id: any) => {
  let result: any = null
  array.forEach((item: any) => {
    if (item.Id === id) {
      result = item
    } else if (item.Children?.length > 0) {
      result = findNodeById(item.Children, id)
    }
  })
  return result
}

// 根据key1查找节点
export const findNode = (array: any, value: any, opt?: { key1: string; key2: string }) => {
  let result: any = null
  if (opt) {
    opt.key1 = opt!.key1 || "id"
    opt.key2 = opt!.key2 || "children"
  } else {
    opt = { key1: "id", key2: "children" }
  }
  array.forEach((item: any) => {
    if (item[opt.key1] === value) {
      result = item
    } else if (item[opt.key2]?.length > 0) {
      let res = findNode(item[opt.key2], value, opt)
      if (res) {
        result = res
      }
    }
  })
  return result
}
// 过滤掉没有checked的节点
export const filterNode = (list: any) => {
  list.forEach((item: any, index: any) => {
    if (!item.checked) {
      list.splice(index, 1)
    }
    if (item.children?.length > 0) {
      item.children = filterNode(item.children)
    }
  })
  return list
}
/**
 * 传入[{},{}]为树形结构数据，根据id返回第n级父节点
 * @param list 树形结构数据
 * @param id 目标节点的id
 * @param n 返回的父节点级数
 * @returns 第n级父节点
 */
export const findNthParentNode = (list: any[], id: any, n: number) => {
  const path: any[] = []

  const findPath = (nodes: any[], targetId: any, currentPath: any[]): any => {
    for (const node of nodes) {
      const newPath = [...currentPath, node]
      if (node.id === targetId) {
        return newPath
      }
      if (node.children?.length > 0) {
        const result = findPath(node.children, targetId, newPath)
        if (result) {
          return result
        }
      }
    }
    return null
  }

  const fullPath = findPath(list, id, path)
  if (fullPath) {
    if (n - 1 >= 0) {
      return fullPath[n - 1]
    }
  }
  return null
}
/**
 * 获取指定节点的所有父级名称
 * @param list 树形结构数据
 * @param targetId 目标节点ID
 * @param nameKey 名称字段的key，默认为'name'
 * @returns 父级名称数组，从顶级到直接父级的顺序
 */
export function getParentNames(list: any[], targetId: string | number, nameKey: string = "name"): string[] {
  const parentNames: string[] = []

  function findParents(nodes: any[], id: string | number, parents: string[]): boolean {
    for (const node of nodes) {
      //
      if (node.id === id && node.blevel !== 7) {
        return true
      }

      if (node.children?.length) {
        if (findParents(node.children, id, parents)) {
          parents.unshift(node[nameKey])
          return true
        }
      }
    }
    return false
  }

  findParents(list, targetId, parentNames)
  return parentNames
}
export function getParentNames1(list: any[], targetId: string | number, nameKey: string = "name"): string[] {
  const parentNames: string[] = []

  function findParents(nodes: any[], id: string | number, parents: string[]): boolean {
    for (const node of nodes) {
      //
      if (node.id === id) {
        return true
      }

      if (node.children?.length) {
        if (findParents(node.children, id, parents)) {
          parents.unshift(node[nameKey])
          return true
        }
      }
    }
    return false
  }

  findParents(list, targetId, parentNames)
  return parentNames
}
