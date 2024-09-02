import Viewer from "viewerjs"
import "viewerjs/dist/viewer.css"
export const u = {
  // i:图片索引  imgs:图片src集合  alts:图片alt集合,用于显示名称title
  showPreviewImg(i: number, imgs: string[], alts?: string[]) {
    const ViewerDom = document.createElement("ul")
    ViewerDom.style.display = "none"
    imgs!.forEach((imgP: string, index) => {
      const li = document.createElement("li")
      const img = document.createElement("img")
      img.src = imgP
      if (alts) {
        img.alt = alts[index]
      }
      li.appendChild(img)
      ViewerDom.appendChild(li)
    })
    document.body.appendChild(ViewerDom)

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
        //   const a = document.createElement("a");
        //   a.href = viewImg.image.src;
        //   a.download = viewImg.image.alt;
        //   document.body.appendChild(a);
        //   a.click();
        //   document.body.removeChild(a);
        // },
      },
      title: true,
      zoomRatio: 0.3,
      fullscreen: true,
      loading: true,
      rotatable: true,
      zoomable: true,
      scalable: true,
      tooltip: true,
      shown() {
        console.log("打开预览图片")
      },
      hidden: function () {
        viewImg.destroy()
        document.body.removeChild(ViewerDom)
      }
    })
    viewImg.view(i) // 根据索引打开
  }
}
