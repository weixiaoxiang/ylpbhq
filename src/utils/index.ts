import dayjs from "dayjs"

/** 格式化时间 */
export const formatDateTime = (time: string | number | Date) => {
  return time ? dayjs(new Date(time)).format("YYYY-MM-DD HH:mm:ss") : "N/A"
}
export const formatTime = (time: string | number | Date) => {
  return time ? dayjs(new Date(time)).format("HH:mm:ss") : "N/A"
}

//16进制变rgba
export function HexToRGB(color: any, opacity: any) {
  let newColor = "rgba("
  //判断是三位还是六位
  if (color.length === 4) {
    let arry: any = []
    for (let i = 1; i < color.length; i++) {
      arry.push(parseInt("0x" + color[i] + color[i]))
    }
    arry.forEach(function (item: any) {
      newColor += item + ", "
    })
    newColor += opacity + ")"
    return newColor
  } else {
    let arry: any = []
    for (let i = 1; i < color.length; i += 2) {
      arry.push(parseInt("0x" + color.slice(i, i + 2)))
    }
    arry.forEach(function (item: any) {
      newColor += item + ", "
    })
    newColor += opacity + ")"
    return newColor
  }
}

/** 用 JS 获取全局 css 变量 */
export const getCssVariableValue = (cssVariableName: string) => {
  let cssVariableValue = ""
  try {
    // 没有拿到值时，会返回空串
    cssVariableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName)
  } catch (error) {
    console.error(error)
  }
  return cssVariableValue
}

/** 用 JS 设置全局 CSS 变量 */
export const setCssVariableValue = (cssVariableName: string, cssVariableValue: string) => {
  try {
    document.documentElement.style.setProperty(cssVariableName, cssVariableValue)
  } catch (error) {
    console.error(error)
  }
}

/** 重置项目配置 */
export const resetConfigLayout = () => {
  // removeConfigLayout()
  location.reload()
}

// const path = require("path")
// const pathSrc = path.resolve(__dirname, "src")
/**
 * pathName:图片资源路径
 * base:基础路径（可选）
 */
export function getImg(pathName: string): string {
  return new URL(`/src/assets/images/${pathName}`, import.meta.url).href
}
/**
 * 创建椭圆轨迹动画
 * @param {HTMLElement} container - 包含圆形元素的容器
 * @param {number} speed - 控制旋转速度，值越大速度越快
 * @param {string} scaleType - 控制元素缩放类型，可选值为"远大近小"和"远小近大"和默认值
 */
export function createEllipticalMotion(container: HTMLElement, speed: number, scaleType: string): any {
  const boxs = container.children
  const boxList = Array.from(boxs) as HTMLElement[]
  const centerX = container.offsetWidth / 2
  const centerY = container.offsetHeight / 2
  const radiusX = container.offsetWidth / 2 - 50
  const radiusY = container.offsetHeight / 2 - 50
  const totalBoxs = boxList.length
  const angleStep = (2 * Math.PI) / totalBoxs
  let animationFrameId: number | null = null
  let startTime = Date.now()
  let pausedTime = 0

  function updatePositions(): void {
    const time = ((Date.now() - startTime + pausedTime) / 1000) * speed
    boxList.forEach((box, index) => {
      const angle = angleStep * index + time
      const x = centerX + radiusX * Math.cos(angle) - box.offsetWidth / 2
      const y = centerY + radiusY * Math.sin(angle) - box.offsetHeight / 2
      let scale = 1
      switch (scaleType) {
        case "远小近大":
          scale = 0.85 + 0.15 * Math.sin(angle)
          break
        case "远大近小":
          scale = 0.85 - 0.15 * Math.sin(angle)
          break
        default:
          break
      }
      box.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
    })
    animationFrameId = requestAnimationFrame(updatePositions)
  }

  function startAnimation(): void {
    if (!animationFrameId) {
      startTime = Date.now()
      updatePositions()
    }
  }

  function stopAnimation(): void {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
      pausedTime += Date.now() - startTime
    }
  }
  // 清理事件监听和动画
  function cleanup(): void {
    container.removeEventListener("mouseenter", stopAnimation)
    container.removeEventListener("mouseleave", startAnimation)
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
  container.addEventListener("mouseenter", stopAnimation)
  container.addEventListener("mouseleave", startAnimation)

  // 初始位置均匀分布
  boxList.forEach((box, index) => {
    const angle = angleStep * index
    const x = centerX + radiusX * Math.cos(angle) - box.offsetWidth / 2
    const y = centerY + radiusY * Math.sin(angle) - box.offsetHeight / 2
    let scale = 1
    switch (scaleType) {
      case "远大近小":
        scale = 0.85 + 0.15 * Math.sin(angle)
        break
      case "远小近大":
        scale = 0.85 - 0.15 * Math.sin(angle)
        break
      default:
        break
    }
    box.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
    // 设置 z-index，使得元素在旋转过程中能够正确显示,不被碰撞盖住。z-index值越大，元素越靠前。第一个元素z-index最大
    box.style.zIndex = `${totalBoxs - index}`
  })

  startAnimation()
  // 返回清理函数，以便在需要时调用
  return cleanup
}

// 根据AQI值判断空气质量等级
export const getAirQualityLevel = (aqi: number): string => {
  if (aqi >= 0 && aqi <= 50) {
    return "优"
  } else if (aqi > 50 && aqi <= 100) {
    return "良"
  } else if (aqi > 100 && aqi <= 150) {
    return "轻度污染"
  } else if (aqi > 150 && aqi <= 200) {
    return "中度污染"
  } else if (aqi > 200 && aqi <= 300) {
    return "重度污染"
  } else if (aqi > 300) {
    return "严重污染"
  } else {
    return "未知"
  }
}
// 根据PM2.5值判断空气质量等级
export const getPM25Level = (pm25: number): string => {
  if (pm25 >= 0 && pm25 <= 35) {
    return "优"
  } else if (pm25 > 35 && pm25 <= 75) {
    return "良"
  } else if (pm25 > 75 && pm25 <= 115) {
    return "轻度"
  } else if (pm25 > 115 && pm25 <= 150) {
    return "中度"
  } else if (pm25 > 150 && pm25 <= 250) {
    return "重度"
  } else if (pm25 > 250) {
    return "严重"
  } else {
    return "未知"
  }
}
// 根据温度判断温度等级
export const getTemperatureLevel = (temperature: number): string => {
  if (temperature >= -40 && temperature <= 10) {
    return "冷"
  } else if (temperature > 10 && temperature <= 20) {
    return "凉爽"
  } else if (temperature > 20 && temperature <= 26) {
    return "舒适"
  } else if (temperature > 26 && temperature <= 30) {
    return "温暖"
  } else if (temperature > 30) {
    return "热"
  } else {
    return "未知"
  }
}
// 根据湿度判断湿度等级
export const getHumidityLevel = (humidity: number): string => {
  if (humidity >= 20 && humidity <= 30) {
    return "干燥"
  } else if (humidity > 30 && humidity <= 50) {
    return "适中"
  } else if (humidity > 50 && humidity <= 70) {
    return "湿润"
  } else if (humidity > 70) {
    return "非常湿润"
  } else {
    return "未知"
  }
}
//  根据负氧离子判断负氧离子等级
export const getFYLZLevel = (fylz: number): string => {
  if (fylz > 2000) {
    return "非常清新"
  } else if (fylz > 1500 && fylz <= 2000) {
    return "清新"
  } else if (fylz > 1000 && fylz <= 1500) {
    return "较清新"
  } else if (fylz > 500 && fylz <= 1000) {
    return "一般"
  } else if (fylz <= 500) {
    return "较低"
  } else {
    return "未知"
  }
}
// 根据光照强度判断光照强度等级
export const getGZDLevel = (gzd: number): string => {
  if (gzd >= 0 && gzd < 10) {
    return "极暗"
  } else if (gzd >= 10 && gzd < 30) {
    return "非常暗"
  } else if (gzd >= 30 && gzd < 100) {
    return "暗"
  } else if (gzd >= 100 && gzd < 300) {
    return "微光"
  } else if (gzd >= 300 && gzd < 500) {
    return "适中"
  } else if (gzd >= 500 && gzd < 1000) {
    return "明亮"
  } else if (gzd >= 1000 && gzd < 5000) {
    return "非常明亮"
  } else if (gzd >= 5000) {
    return "极亮"
  } else {
    return "未知"
  }
}
// 根据度数判断风向
export const getWindDirection = (degree: number): string => {
  if (degree >= 0 && degree < 22.5) {
    return "北风"
  } else if (degree >= 22.5 && degree < 67.5) {
    return "东北风"
  } else if (degree >= 67.5 && degree < 112.5) {
    return "东风"
  } else if (degree >= 112.5 && degree < 157.5) {
    return "东南风"
  } else if (degree >= 157.5 && degree < 202.5) {
    return "南风"
  } else if (degree >= 202.5 && degree < 247.5) {
    return "西南风"
  } else if (degree >= 247.5 && degree < 292.5) {
    return "西风"
  } else if (degree >= 292.5 && degree < 337.5) {
    return "西北风"
  } else if (degree >= 337.5 && degree <= 360) {
    return "北风"
  } else {
    return "未知"
  }
}
// 根据风速判断风速等级
export const getWindSpeedLevel = (speed: number): any => {
  let item = {
    name: "",
    value: 0
  }
  if (speed >= 0 && speed <= 0.3) {
    item = {
      name: "无风",
      value: 0
    }
  } else if (speed > 0.3 && speed <= 1.5) {
    // return "软风"
    item = {
      name: "软风",
      value: 1
    }
  } else if (speed > 1.5 && speed <= 3.3) {
    // return "轻风"
    item = {
      name: "轻风",
      value: 2
    }
  } else if (speed > 3.3 && speed <= 5.4) {
    // return "微风"
    item = {
      name: "微风",
      value: 3
    }
  } else if (speed > 5.4 && speed <= 7.9) {
    // return "和风"
    item = {
      name: "和风",
      value: 4
    }
  } else if (speed > 7.9 && speed <= 10.7) {
    // return "清风"
    item = {
      name: "清风",
      value: 5
    }
  } else if (speed > 10.7 && speed <= 13.8) {
    // return "强风"
    item = {
      name: "强风",
      value: 6
    }
  } else if (speed > 13.8 && speed <= 17.1) {
    // return "劲风"
    item = {
      name: "劲风",
      value: 7
    }
  } else if (speed > 17.1 && speed <= 20.7) {
    // return "疾风"
    item = {
      name: "疾风",
      value: 8
    }
  } else if (speed > 20.7 && speed <= 24.4) {
    // return "大风"
    item = {
      name: "大风",
      value: 9
    }
  } else if (speed > 24.4 && speed <= 28.4) {
    // return "烈风"
    item = {
      name: "烈风",
      value: 10
    }
  } else if (speed > 28.4 && speed <= 32.6) {
    // return "暴风"
    item = {
      name: "暴风",
      value: 11
    }
  } else if (speed > 32.6) {
    // return "飓风"
    item = {
      name: "飓风",
      value: 12
    }
  } else {
    item = {
      name: "未知",
      value: 0
    }
  }
  return item
}
// 根据降雨量判断降雨量等级
export const getRainfallLevel = (rainfall: number): string => {
  if (rainfall >= 1 && rainfall <= 10) {
    return "小雨"
  } else if (rainfall > 10 && rainfall <= 25) {
    return "中雨"
  } else if (rainfall > 25 && rainfall <= 50) {
    return "大雨"
  } else if (rainfall > 50 && rainfall <= 100) {
    return "暴雨"
  } else if (rainfall > 100 && rainfall <= 200) {
    return "大暴雨"
  } else if (rainfall > 200) {
    return "特大暴雨"
  } else {
    return "无雨"
  }
}
// 根据WQI判断WQI等级
export const getWQILevel = (wqi: number): string => {
  if (wqi >= 0 && wqi <= 50) {
    return "优"
  } else if (wqi > 50 && wqi <= 100) {
    return "良"
  } else if (wqi > 100 && wqi <= 200) {
    return "合格"
  } else if (wqi > 200 && wqi <= 300) {
    return "较差水质"
  } else {
    return "未知"
  }
}
// 根据PH判断PH等级
export const getPHLevel = (ph: number): string => {
  if (ph >= 6.5 && ph <= 9.5) {
    return "优秀"
  } else if (ph > 6.0 && ph <= 10.0) {
    return "良好"
  } else if (ph > 5.0 && ph <= 6.0) {
    return "轻度污染"
  } else if (ph > 9.0 && ph <= 10.5) {
    return "轻度污染"
  } else if (ph <= 5.0) {
    return "中度污染"
  } else if (ph > 10.5) {
    return "中度污染"
  } else {
    return "未知"
  }
}
