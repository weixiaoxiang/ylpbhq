import Viewer from "viewerjs"
import "viewerjs/dist/viewer.css"

// 图片预加载缓存
const imageCache = new Map<string, HTMLImageElement>()

// 创建缩略图URL（如果有缩略图服务）
function getThumbnailUrl(originalUrl: string, _width = 300): string {
  // 这里可以根据您的图片服务调整缩略图生成逻辑
  // 例如：return originalUrl.replace(/\.(jpg|jpeg|png)$/i, `_thumb_${width}.$1`)
  return originalUrl
}

// 预加载图片
function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (imageCache.has(src)) {
      resolve(imageCache.get(src)!)
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous" // 支持跨域
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
}

// 批量预加载图片（限制并发数量）
async function batchPreloadImages(urls: string[], maxConcurrent = 3): Promise<void> {
  const chunks = []
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    chunks.push(urls.slice(i, i + maxConcurrent))
  }

  for (const chunk of chunks) {
    await Promise.allSettled(chunk.map((url) => preloadImage(url)))
  }
}

export const u = {
  // i:图片索引  imgs:图片src集合  alts:图片alt集合,用于显示名称title
  async showPreviewImg(i: number, imgs: string[], alts?: string[]) {
    // 先预加载当前图片和相邻图片
    const preloadUrls = []
    const start = Math.max(0, i - 1)
    const end = Math.min(imgs.length, i + 2)

    for (let j = start; j < end; j++) {
      preloadUrls.push(imgs[j])
    }

    // 预加载关键图片
    await batchPreloadImages(preloadUrls, 2)

    const ViewerDom = document.createElement("ul")
    ViewerDom.style.display = "none"

    // 使用懒加载方式创建图片元素
    imgs.forEach((imgP: string, index) => {
      const li = document.createElement("li")
      const img = document.createElement("img")

      // 设置加载属性
      img.loading = "lazy"
      img.decoding = "async"

      // 先使用缩略图
      img.src = getThumbnailUrl(imgP)

      if (alts?.length! > 0) {
        img.alt = alts![index]
      }

      // 当图片进入视口时加载高清版本
      img.addEventListener("load", () => {
        // 延迟加载高清版本
        setTimeout(() => {
          if (img.src !== imgP) {
            img.src = imgP
          }
        }, 100)
      })

      li.appendChild(img)
      ViewerDom.appendChild(li)
    })

    const viewImg = new Viewer(ViewerDom, {
      // 相关配置项,详情见下面
      toolbar: {
        play: 1,
        prev: 1,
        next: 1,
        zoomIn: 1,
        zoomOut: 1,
        oneToOne: 1,
        reset: 1,
        rotateLeft: 1,
        rotateRight: 1,
        flipHorizontal: 1,
        flipVertical: 1
        // download: () => {
        //   const a = document.createElement("a")
        //   a.href = viewImg.image.src
        //   a.download = viewImg.image.alt
        //   document.body.appendChild(a)
        //   a.click()
        //   document.body.removeChild(a)
        // }
      },
      title: true,
      zoomRatio: 0.2, // 减小缩放步长，提升流畅度
      fullscreen: true,
      loading: true,
      rotatable: true,
      zoomable: true,
      scalable: true,
      tooltip: true,
      // 优化动画性能
      transition: true,
      backdrop: true,
      keyboard: true,
      // 添加性能优化配置
      inline: false,
      button: true,
      navbar: true,
      shown() {
        console.log("打开预览图片")
        // 预加载相邻图片
        const currentIndex = (viewImg as any).index || i
        const nextUrls = []

        // 预加载前后各2张图片
        for (let j = Math.max(0, currentIndex - 2); j <= Math.min(imgs.length - 1, currentIndex + 2); j++) {
          if (j !== currentIndex && !imageCache.has(imgs[j])) {
            nextUrls.push(imgs[j])
          }
        }

        if (nextUrls.length > 0) {
          batchPreloadImages(nextUrls, 2)
        }
      },
      hidden: function () {
        viewImg.destroy()
        // 清理DOM元素
        if (ViewerDom.parentNode) {
          ViewerDom.parentNode.removeChild(ViewerDom)
        }
      },
      // 添加图片切换时的优化
      view() {
        // 图片切换时的性能优化
        const currentImg = (viewImg as any).image
        if (currentImg) {
          currentImg.style.imageRendering = "high-quality"
          currentImg.style.imageRendering = "-webkit-optimize-contrast"
        }
      }
    })

    viewImg.view(i) // 根据索引打开
  }
}
