// 这是一个处理树结构数据的工具
interface Config {
  id?: string
  pid?: string
  children?: string
}

interface TreeNode {
  [key: string]: any
  nlevel?: number
}

/**
 * 将扁平数组转换为树形结构, 并会添加nlevel
 * @param data 需要转换的扁平数组数据
 * @param config 配置选项，可自定义 id、pid、children 字段名
 * @param addEmptyChildren 是否为叶子节点添加空的 children 数组
 * @returns 转换后的树形结构数组
 *
 * @example
 * // 基础用法
 * const data = [
 *   { id: 1, pid: null, name: '父节点' },
 *   { id: 2, pid: 1, name: '子节点1' },
 *   { id: 3, pid: 1, name: '子节点2' }
 * ];
 * const tree = arrayToTree(data);
 *
 * // 自定义字段名
 * const customData = [
 *   { nodeId: 1, parentId: null, name: '父节点' },
 *   { nodeId: 2, parentId: 1, name: '子节点' }
 * ];
 * const customTree = arrayToTree(customData, {
 *   id: 'nodeId',
 *   pid: 'parentId',
 *   children: 'subNodes'
 * });
 */
export function arrayToTree(
  data: TreeNode[],
  config: Config = {}, // 配置参数，默认为空对象
  addEmptyChildren: boolean = false // 控制是否添加空 children，默认为 false
): TreeNode[] {
  // 提取配置中的字段名称，提供默认值
  const { id = "id", pid = "pid", children = "children" } = config
  const tree: TreeNode[] = [] // 用于存储最终的树形结构
  const lookup: { [key: string]: TreeNode } = {} // 用于快速查找节点
  let maxLevel = 0 // 记录最大层级

  // 初始化 lookup 对象，并为每个节点添加 nlevel 和 children 属性
  data.forEach((item) => {
    const node = { ...item, nlevel: 1, [children]: [] } // 默认 nlevel 为 1，children 为空数组
    lookup[item[id]] = node // 将节点存入 lookup 中
  })

  // 构建树结构并计算每个节点的 nlevel
  data.forEach((item) => {
    const node = lookup[item[id]] // 当前节点
    const parentId = item[pid] // 父节点 ID
    const parent = lookup[parentId] // 查找父节点

    if (!parent) {
      // 如果没有父节点或找不到父节点，则为顶级节点
      tree.push(node)
    } else {
      node.nlevel = parent.nlevel! + 1 // 计算当前节点的 nlevel
      maxLevel = Math.max(maxLevel, node.nlevel) // 更新最大层级
      parent[children].push(node) // 将当前节点添加到父节点的 children 中
    }
  })

  // 清理树结构，移除不需要的 children 属性
  function cleanTree(nodes: TreeNode[]) {
    nodes.forEach((node) => {
      if (node.nlevel === maxLevel) {
        // 如果是最后一级节点，移除 children 属性
        delete node[children]
      } else {
        if (!addEmptyChildren && node[children].length === 0) {
          // 如果不是最后一级，并且不需要空 children，则移除
          delete node[children]
        } else {
          cleanTree(node[children]) // 递归处理子节点
        }
      }
    })
  }

  cleanTree(tree) // 开始清理树

  return tree // 返回最终的树形结构
}

interface TreeToArrayConfig {
  children?: string
  hasChildren?: boolean
  pid?: string
}

/**
 * 将树形结构数据转换为扁平数组
 * @param tree 树形结构数据
 * @param config 配置选项
 * @param config.children 子节点属性名，默认为 'children'
 * @param config.hasChildren 是否在结果中保留 children 属性，默认为 false
 * @param config.pid 父节点 ID 属性名，默认为 'pid'
 * @returns 扁平化后的数组
 * @example
 * const tree = [{
 *   id: 1,
 *   name: 'Root',
 *   children: [
 *     { id: 2, name: 'Child 1' },
 *     { id: 3, name: 'Child 2' }
 *   ]
 * }]
 *
 * // 基本用法
 * const array = treeToArray(tree)
 * // 结果: [
 * //   { id: 1, name: 'Root', pid: null },
 * //   { id: 2, name: 'Child 1', pid: 1 },
 * //   { id: 3, name: 'Child 2', pid: 1 }
 * // ]
 *
 * // 保留 children 属性
 * const arrayWithChildren = treeToArray(tree, { hasChildren: true })
 * // 自定义属性名
 * const arrayCustom = treeToArray(tree, { children: 'subItems', pid: 'parentId' })
 */
export function treeToArray(tree: TreeNode[], config: TreeToArrayConfig = {}): TreeNode[] {
  const { children = "children", hasChildren = false, pid = "pid" } = config
  const result: TreeNode[] = []

  function flatten(nodes: TreeNode[], parentId: any = null) {
    nodes.forEach((node) => {
      const { [children]: childNodes, ...rest } = node
      const currentNode = { ...rest, [pid]: parentId }
      result.push(hasChildren ? { ...currentNode, [children]: childNodes } : currentNode)
      if (childNodes && childNodes.length > 0) {
        flatten(childNodes, node.id)
      }
    })
  }

  flatten(tree)
  return result
}

interface FindConfig {
  key?: string
  fuzzy?: boolean
  children?: string
}

/**
 * 在树结构中查找符合条件的所有节点，返回的是集合
 * @param tree 树形结构数据
 * @param value 要查找的值
 * @param config 配置项
 * @param config.key 查找的键名，默认为 'id'
 * @param config.children 指定 children 属性名称，默认为 'children'
 * @param config.fuzzy 是否开启模糊查询，支持大小写模糊，默认为 false
 * @returns 符合条件的节点数组
 *
 * @example
 * const tree = [{
 *   id: 1,
 *   name: 'Root',
 *   children: [
 *     { id: 2, name: 'Child 1' },
 *     { id: 3, name: 'Child 2' }
 *   ]
 * }];
 *
 * // 精确查找
 * const node = findNodes(tree, 2); // 根据 id 精确查找
 *
 * // 模糊查找
 * const nodes = findNodes(tree, 'Chi', { key: 'name', fuzzy: true }); // 根据 name 模糊查找
 */
export function findNodes(tree: TreeNode[], value: any, config: FindConfig = {}): TreeNode[] {
  const { key = "id", children = "children", fuzzy = false } = config
  const result: TreeNode[] = []

  function traverse(nodes: TreeNode[]) {
    nodes.forEach((node) => {
      // 判断是否匹配
      const isMatch = fuzzy
        ? String(node[key]).toLowerCase().includes(String(value).toLowerCase())
        : node[key] === value

      if (isMatch) {
        result.push(node)
      }

      // 如果有子节点，继续遍历
      if (node[children] && node[children].length > 0) {
        traverse(node[children])
      }
    })
  }

  traverse(tree)
  return result
}

interface FindAncestorsConfig {
  key?: string
  format?: "tree" | "flat"
  hasChildren?: boolean
  fuzzy?: boolean
  children?: string
}

/**
 * 查找节点的所有祖先节点，包含自己
 * @param tree 树形结构数据
 * @param value 要查找的值
 * @param config 配置项
 * @param config.key 查找的键名，默认为 'id'
 * @param config.children 指定 children 属性名称，默认为 'children'
 * @param config.format 返回的数据格式，'tree' 或 'flat'，默认为 'flat'
 * @param config.hasChildren 是否包含 children 属性，默认为 false
 * @param config.fuzzy 是否开启模糊查询，默认为 false
 * @returns 祖先节点树或扁平数组
 *
 * @example
 * const tree = [{
 *   id: 1,
 *   name: 'Root',
 *   children: [{
 *     id: 2,
 *     name: 'Child',
 *     children: [{
 *       id: 3,
 *       name: 'Grandchild'
 *     }]
 *   }]
 * }];
 *
 * // 返回扁平数组
 * const flatResult = findAncestors(tree, 3);
 *
 * // 返回树结构
 * const treeResult = findAncestors(tree, 3, { format: 'tree' });
 *
 * // 模糊查询
 * const nodes = findAncestors(tree, 'Chi', { key: 'name', fuzzy: true }); // 根据 name 模糊查找
 */
export function findAncestors(
  tree: TreeNode[],
  value: any,
  config: FindAncestorsConfig = {}
): TreeNode | TreeNode[] | null {
  const { key = "id", format = "flat", hasChildren = false, fuzzy = false, children = "children" } = config

  const path: TreeNode[] = []

  function findPath(nodes: TreeNode[]): boolean {
    for (const node of nodes) {
      const { [children]: childNodes, ...nodeWithoutChildren } = node
      path.push(hasChildren ? { ...node } : nodeWithoutChildren)

      const isMatch = fuzzy
        ? String(node[key]).toLowerCase().includes(String(value).toLowerCase())
        : node[key] === value

      if (isMatch) {
        return true
      }

      if (childNodes && childNodes.length > 0) {
        if (findPath(childNodes)) {
          return true
        }
      }

      path.pop()
    }

    return false
  }

  const found = findPath(tree)

  if (!found) {
    return null
  }

  if (format === "flat") {
    return hasChildren ? path : path.map(({ [children]: _, ...rest }) => rest)
  } else {
    const result = { ...path[0] }
    let current = result

    for (let i = 1; i < path.length; i++) {
      const isLast = i === path.length - 1

      if (isLast && !hasChildren) {
        const { [children]: _, ...nodeWithoutChildren } = path[i]
        current[children] = [nodeWithoutChildren]
      } else {
        current[children] = [{ ...path[i] }]
      }
      current = current[children][0]
    }

    return [result]
  }
}

interface FindDescendantsConfig {
  key?: string
  format?: "tree" | "flat"
  fuzzy?: boolean
  hasChildren?: boolean
  children?: string
}
/**
 * 在树形结构中查找指定节点的所有后代节点，当format='tree'时，包含自己
 * @param tree - 树形结构数组
 * @param value - 要查找的值
 * @param config - 配置选项
 * @param config.key - 用于匹配的键名,默认为'id'
 * @param config.children 指定 children 属性名称，默认为 'children'
 * @param config.format - 返回格式,'flat'(扁平数组)或'tree'(树形结构),默认为'flat'
 * @param config.fuzzy - 是否启用模糊匹配,默认为false
 * @param config.hasChildren 是否在扁平化结果中包含 children 属性，默认为 false
 * @returns 匹配节点的后代节点数组,未找到时返回null
 *
 * @example
 * const tree = [
 *   {
 *     id: 1,
 *     name: 'Parent',
 *     children: [
 *       { id: 2, name: 'Child 1' },
 *       { id: 3, name: 'Child 2' }
 *     ]
 *   }
 * ];
 *
 * // 扁平格式查找
 * findDescendants(tree, 1); // 返回 [{ id: 2, name: 'Child 1' }, { id: 3, name: 'Child 2' }]
 *
 * // 树形格式查找
 * findDescendants(tree, 1, { format: 'tree' });
 * // 返回 [{ id: 1, name: 'Parent', children: [{ id: 2... }, { id: 3... }] }]
 *
 * // 模糊匹配
 * findDescendants(tree, 'par', { key: 'name', fuzzy: true });
 */
export function findDescendants(
  tree: TreeNode[],
  value: any,
  config: FindDescendantsConfig = {}
): TreeNode | TreeNode[] | null {
  const { key = "id", format = "flat", fuzzy = false, hasChildren = false, children = "children" } = config

  function findNode(nodes: TreeNode[]): TreeNode | null {
    for (const node of nodes) {
      const isMatch = fuzzy
        ? String(node[key]).toLowerCase().includes(String(value).toLowerCase())
        : node[key] === value

      if (isMatch) {
        return node
      }

      if (node[children] && node[children].length > 0) {
        const found = findNode(node[children])
        if (found) {
          return found
        }
      }
    }
    return null
  }

  const targetNode = findNode(tree)

  if (!targetNode) {
    return null
  }

  if (format === "flat") {
    const result: TreeNode[] = []

    function flatten(nodes: TreeNode[]) {
      nodes.forEach((node) => {
        const { [children]: childNodes, ...nodeWithoutChildren } = node
        result.push(hasChildren ? { ...node } : nodeWithoutChildren)
        if (childNodes && childNodes.length > 0) {
          flatten(childNodes)
        }
      })
    }

    flatten(targetNode[children] || [])
    return result
  } else {
    return [{ ...targetNode }]
  }
}

interface RemoveNodeConfig {
  key?: string
  children?: string
  fuzzy?: boolean // 新增模糊匹配选项
}

/**
 * 从树结构中删除指定节点
 * @param tree 树形结构数据
 * @param value 要删除节点的值
 * @param config 配置项
 * @param config.key 用于匹配的键名，默认为 'id'
 * @param config.children 子节点属性名，默认为 'children'
 * @param config.fuzzy 是否启用模糊匹配，默认为 false
 * @returns 删除节点后的树结构
 *
 * @example
 * const tree = [{
 *   id: 1,
 *   name: 'Root',
 *   children: [{
 *     id: 2,
 *     name: 'Child One'
 *   }, {
 *     id: 3,
 *     name: 'Child Two'
 *   }]
 * }];
 *
 * // 精确删除
 * const newTree = removeNode(tree, 2);
 *
 * // 模糊删除（将删除所有包含 'Child' 的节点）
 * const newTree2 = removeNode(tree, 'Child', {
 *   key: 'name',
 *   fuzzy: true
 * });
 */
export function removeNode(tree: TreeNode[], value: any, config: RemoveNodeConfig = {}): TreeNode[] {
  const { key = "id", children = "children", fuzzy = false } = config

  function remove(nodes: TreeNode[]): TreeNode[] {
    return nodes.filter((node) => {
      // 根据 fuzzy 配置决定匹配方式
      const isMatch = fuzzy
        ? String(node[key]).toLowerCase().includes(String(value).toLowerCase())
        : node[key] === value

      // 当前节点匹配，则过滤掉
      if (isMatch) {
        return false
      }

      // 如果有子节点，递归处理
      if (node[children]?.length) {
        node[children] = remove(node[children])
      }

      return true
    })
  }

  return remove([...tree])
}

interface CategorizeConfig {
  key?: string
}
/**
 * 根据指定的 key 遍历树结构并进行分类
 * @param tree 树形结构数据
 * @param config 配置项
 * @param config.key 分类的键名，默认为 'nlevel'
 * @returns 分类后的节点数据
 */
/**
 * 根据指定的键名对树形结构数据进行分类
 * @param tree 树形结构数据
 * @param config 配置项
 * @param config.key 用于分类的键名，默认为 'nlevel'
 * @returns 分类后的对象，键为分类值，值为对应的节点数组
 *
 * @example
 * const tree = [{
 *   id: 1,
 *   name: 'Root',
 *   level: 1,
 *   children: [{
 *     id: 2,
 *     name: 'Child',
 *     level: 2,
 *     children: [{
 *       id: 3,
 *       name: 'Grandchild',
 *       level: 3
 *     }]
 *   }]
 * }];
 *
 * // 按 level 分类
 * const result = categorizeBy(tree, { key: 'level' });
 * // 结果:
 * // {
 * //   '1': [{ id: 1, name: 'Root', level: 1, ... }],
 * //   '2': [{ id: 2, name: 'Child', level: 2, ... }],
 * //   '3': [{ id: 3, name: 'Grandchild', level: 3, ... }]
 * // }
 */
export function categorizeBy(tree: TreeNode[], config: CategorizeConfig = {}): Record<string, TreeNode[]> {
  const { key = "nlevel" } = config
  const categories: Record<string, TreeNode[]> = {}

  function traverse(nodes: TreeNode[]) {
    nodes.forEach((node) => {
      const keyValue = node[key]
      if (keyValue !== undefined) {
        if (!categories[keyValue]) {
          categories[keyValue] = []
        }
        categories[keyValue].push(node)
      }

      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }

  traverse(tree)
  return categories
}
