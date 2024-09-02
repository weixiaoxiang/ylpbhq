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

// 根据输入的16进制颜色和透明度生产rgba颜色
export const hexToRgba = (hex: any, opacity: any) => {
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
